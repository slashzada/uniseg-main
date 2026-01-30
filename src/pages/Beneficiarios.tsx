import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, User, TrendingDown, UserCheck, Percent, Loader2, MoreVertical, Edit, Trash2, Paperclip, FileText, X, Upload, CheckCircle2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddBeneficiarioDialog } from "@/components/dialogs/AddBeneficiarioDialog";
import { EditBeneficiarioDialog } from "@/components/dialogs/EditBeneficiarioDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { beneficiariosAPI, vendedoresAPI, planosAPI, financeiroAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define the structure of the data returned by the backend list endpoint
interface BackendBeneficiarioResponse {
  id: string;
  nome: string;
  cpf: string;
  plano_id: string; // Original FK
  vendedor_id: string; // Original FK
  status: "ativo" | "inadimplente" | "inativo";
  desde: string;
  plano: string; // Plan name (flattened by backend controller)
  operadora: string; // Operadora name (flattened by backend controller)
  operadora_id: string; // Operadora ID (flattened by backend controller)
  valorPlano: number;
  vendedor: string; // Vendedor name (flattened by backend controller)
  comissao: number;
  vigencia?: string; // New Field from Backend
}

interface Beneficiario {
  id: string;
  nome: string;
  cpf: string;
  plano: string;
  plano_id: string;
  operadora: string;
  operadora_id: string; // Note: This ID is not returned by the list endpoint, setting to empty string in select
  status: "ativo" | "inadimplente" | "inativo";
  desde: string; // ISO date string, but backend formats it
  vendedorId: string; // Vendedor ID (mapped from vendedor_id)
  vendedor: string; // Vendedor name
  comissao: number; // Vendedor commission rate
  valorPlano: number;
  vigencia: string; // Formatted date
}

const statusConfig = {
  ativo: { label: "Ativo", className: "bg-success/15 text-success border-success/30" },
  inadimplente: { label: "Inadimplente", className: "bg-destructive/15 text-destructive border-destructive/30" },
  inativo: { label: "Inativo", className: "bg-muted text-muted-foreground border-muted-foreground/30" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const Beneficiarios = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filtro, setFiltro] = useState("todos");
  const [filtroVendedor, setFiltroVendedor] = useState("todos");
  const [busca, setBusca] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<Beneficiario | undefined>(undefined);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<Beneficiario | null>(null);

  // New State for "Anexar Boleto" (Copied from Financeiro)
  const [modalAnexar, setModalAnexar] = useState<{ id: string, nome: string } | null>(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Dependency Lists
  const { data: vendedores, isLoading: loadingVendedores } = useQuery<any[]>({
    queryKey: ["vendedores"],
    queryFn: vendedoresAPI.getAll,
  });

  const { data: planos } = useQuery<any[]>({
    queryKey: ["planos"],
    queryFn: () => planosAPI.getAll({}),
  });

  // 1b. Fetch Payments to match with Beneficiaries for the "Anexar Boleto" button
  const { data: allPayments } = useQuery<any[]>({
    queryKey: ["pagamentos", "all_short"],
    queryFn: () => financeiroAPI.getAll({}), // Get all to catch pendente/vencido/etc
  });

  // 2. Fetch Beneficiarios
  const { data: beneficiarios, isLoading, refetch } = useQuery<BackendBeneficiarioResponse[], Error, Beneficiario[]>({
    queryKey: ["beneficiarios", filtro, filtroVendedor, busca, vendedores, planos],
    queryFn: () => beneficiariosAPI.getAll({
      status: filtro === "todos" ? undefined : filtro,
      vendedor_id: filtroVendedor === "todos" ? undefined : filtroVendedor,
      busca: busca || undefined
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
    select: (data) => data.map(ben => {
      // Trust the backend for flattened names
      return {
        ...ben,
        plano_id: ben.plano_id,
        operadora_id: ben.operadora_id,
        vendedorId: ben.vendedor_id,

        // Names come directly from the API formatter now
        plano: ben.plano,
        operadora: ben.operadora,
        vendedor: ben.vendedor,

        valorPlano: ben.valorPlano,
        comissao: ben.comissao,

        // Robust date formatting
        desde: ben.desde ? format(new Date(ben.desde), "dd/MM/yyyy", { locale: ptBR }) : "Data Inválida",
        vigencia: ben.vigencia ? format(new Date(ben.vigencia), "dd/MM/yyyy", { locale: ptBR }) : "N/D",
      };
    }) as Beneficiario[],
  });

  const handleVerDocumento = (url?: string) => {
    if (!url) {
      toast({
        title: "Arquivo não disponível",
        description: "O documento não foi encontrado ou ainda não foi processado.",
        variant: "destructive",
      });
      return;
    }

    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      window.open(url, '_blank');
    } else {
      // For mock filenames, open a placeholder and show a success toast
      toast({
        title: "Visualizando Arquivo",
        description: `Abrindo arquivo: ${url}`,
      });

      // Simulate opening a real document for the demo
      const placeholderUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      setTimeout(() => {
        window.open(placeholderUrl, '_blank');
      }, 500);
    }
  };

  // ... (deleteMutation, handleEdit, handleDelete, confirmDelete remain same) ...
  const deleteMutation = useMutation({
    mutationFn: (id: string) => beneficiariosAPI.delete(id),
    onSuccess: () => {
      toast({ title: "Sucesso", description: `Beneficiário excluído com sucesso.` });
      queryClient.invalidateQueries({ queryKey: ["beneficiarios"] });
      setBeneficiarioToDelete(null);
      setOpenDeleteAlert(false);
    },
    onError: (error) => toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }),
  });

  const handleEdit = (ben: Beneficiario) => {
    setSelectedBeneficiario(ben);
    setOpenEditDialog(true);
  };
  const handleDelete = (ben: Beneficiario) => {
    setBeneficiarioToDelete(ben);
    setOpenDeleteAlert(true);
  };
  const confirmDelete = () => {
    if (beneficiarioToDelete) deleteMutation.mutate(beneficiarioToDelete.id);
  };

  // New Mutation for Anexar Boleto
  const anexarBoletoMutation = useMutation({
    mutationFn: (data: { id: string, nome: string }) =>
      financeiroAPI.anexarBoleto(data.id, data.nome),
    onSuccess: () => {
      toast({ title: "✅ Comprovante anexado!", description: `Pagamento enviado para análise do financeiro.` });
      // Invalidate both financeiro and pending payments list if needed, though mostly financeiro
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
      setModalAnexar(null);
      setArquivoSelecionado(null);
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const handleAnexarBoleto = () => {
    if (!modalAnexar || !arquivoSelecionado) return;
    anexarBoletoMutation.mutate({ id: modalAnexar.id, nome: arquivoSelecionado.name });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setArquivoSelecionado(file);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setArquivoSelecionado(file);
  };

  const beneficiariosData = beneficiarios || [];
  const stats = {
    ativos: beneficiariosData.filter(b => b.status === "ativo").length,
    inadimplentes: beneficiariosData.filter(b => b.status === "inadimplente").length,
    inativos: beneficiariosData.filter(b => b.status === "inativo").length,
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header ... */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Beneficiários</h1>
            <p className="text-muted-foreground text-lg mt-1">Gerencie os beneficiários dos planos</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => setOpenAddDialog(true)} className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25 gap-2">
              <Plus className="h-4 w-4" /> Nova Venda
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats ... */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4 sm:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -4 }}>
            <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Ativos</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl font-bold">{stats.ativos}</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-success/10 text-success">
                    <UserCheck className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -4 }}>
            <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Inadimplentes</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl font-bold">{stats.inadimplentes}</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-destructive/10 text-destructive">
                    <TrendingDown className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -4 }}>
            <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Inativos</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl font-bold">{stats.inativos}</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-muted text-muted-foreground">
                    <Users className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters ... */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar por nome ou CPF..." className="pl-11 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Select value={filtroVendedor} onValueChange={setFiltroVendedor} disabled={loadingVendedores}>
                    <SelectTrigger className="w-48 h-10 bg-background/50">
                      <SelectValue placeholder={loadingVendedores ? "Carregando vendedores..." : "Filtrar por vendedor"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os vendedores</SelectItem>
                      {vendedores?.map((v) => <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {[{ key: "todos", label: "Todos" }, { key: "ativo", label: "Ativos" }, { key: "inadimplente", label: "Inadimplentes" }, { key: "inativo", label: "Inativos" }].map((f) => (
                    <Button key={f.key} variant={filtro === f.key ? "default" : "outline"} size="sm" onClick={() => setFiltro(f.key)} className={cn("transition-all", filtro === f.key && "shadow-lg shadow-primary/25")}>{f.label}</Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* List */}
        {isLoading && <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3 text-muted-foreground">Carregando beneficiários...</p></div>}

        {!isLoading && beneficiariosData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3"><CardTitle className="text-xl font-semibold">Lista de Beneficiários <span className="ml-2 text-sm font-normal text-muted-foreground">({beneficiariosData.length} registros)</span></CardTitle></CardHeader>
              <CardContent className="p-0">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-border/50">
                  <AnimatePresence mode="popLayout">
                    {beneficiariosData.map((ben) => {
                      const comissaoValor = ben.valorPlano ? (ben.valorPlano * ben.comissao / 100) : 0;
                      // Check for payment that needs proof or can be edited
                      const targetPayment = allPayments?.find(p => p.beneficiario_id === ben.id && (p.status === "pendente" || p.status === "vencido" || p.status === "comprovante_anexado"));

                      return (
                        <motion.div key={ben.id} variants={itemVariants} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="group flex items-center justify-between px-6 py-5 hover:bg-muted/30 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5" whileHover={{ scale: 1.1 }}><User className="h-6 w-6 text-primary" /></motion.div>
                            <div>
                              <p className="font-semibold group-hover:text-primary transition-colors">{ben.nome}</p>
                              <p className="text-sm text-muted-foreground">{ben.cpf}</p>
                            </div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="font-medium">{ben.plano}</p>
                            <p className="text-sm text-muted-foreground">{ben.operadora}</p>
                            <p className="text-xs text-muted-foreground mt-1">Vigência: {ben.vigencia}</p>
                          </div>

                          {/* Actions Column */}
                          <div className="flex items-center gap-3 text-right">
                            {/* Attach/Edit Button */}
                            {targetPayment && (
                              <div className="flex items-center gap-2">
                                {targetPayment.status === "comprovante_anexado" && (
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerDocumento(targetPayment.boleto_anexado || targetPayment.boleto_url);
                                      }}
                                      title="Ver Comprovante"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                )}
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant={targetPayment.status === "comprovante_anexado" ? "outline" : "default"}
                                    size="sm"
                                    className={cn(
                                      "h-9 gap-2 shadow-lg",
                                      targetPayment.status === "comprovante_anexado"
                                        ? "border-primary text-primary hover:bg-primary/5 shadow-primary/10"
                                        : "bg-success hover:bg-success/90 text-white shadow-success/25"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setModalAnexar({ id: targetPayment.id, nome: ben.nome });
                                    }}
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    <span className="hidden sm:inline text-xs font-semibold">
                                      {targetPayment.status === "comprovante_anexado" ? "Editar Comprovante" : "Anexar Boleto"}
                                    </span>
                                    <span className="sm:hidden text-xs font-semibold">
                                      {targetPayment.status === "comprovante_anexado" ? "Editar" : "Anexar"}
                                    </span>
                                  </Button>
                                </motion.div>
                              </div>
                            )}

                            <span className="text-sm text-muted-foreground hidden md:block">Desde {ben.desde}</span>
                            <Badge variant="outline" className={cn("border font-medium", statusConfig[ben.status].className)}>{statusConfig[ben.status].label}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(ben as Beneficiario)}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(ben as Beneficiario)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isLoading && beneficiariosData.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12"><div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4"><Search className="h-8 w-8 text-muted-foreground" /></div><h3 className="font-semibold text-lg">Nenhum beneficiário encontrado</h3><p className="text-muted-foreground">Tente ajustar os filtros de busca</p></motion.div>}

        <AddBeneficiarioDialog open={openAddDialog} onOpenChange={setOpenAddDialog} onSuccess={refetch} />
        {selectedBeneficiario && <EditBeneficiarioDialog open={openEditDialog} onOpenChange={setOpenEditDialog} beneficiario={selectedBeneficiario} onSuccess={refetch} />}

        <AlertDialog open={openDeleteAlert} onOpenChange={setOpenDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente o beneficiário <span className="font-semibold text-foreground"> {beneficiarioToDelete?.nome}</span> e todos os pagamentos vinculados.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending} className="bg-destructive hover:bg-destructive/90">{deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Excluir Permanentemente"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal Anexar Boleto (Copied) */}
        <Dialog open={!!modalAnexar} onOpenChange={() => { setModalAnexar(null); setArquivoSelecionado(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl"><div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><Paperclip className="h-5 w-5 text-success" /></div>Anexar Comprovante de Pagamento</DialogTitle>
              <DialogDescription className="text-base">Anexe o comprovante de pagamento de <strong>{modalAnexar?.nome}</strong>. O pagamento será enviado para análise do financeiro.</DialogDescription>
            </DialogHeader>
            <motion.div className={cn("border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer", isDragging ? "border-success bg-success/5 scale-[1.02]" : "border-border hover:border-muted-foreground/50 hover:bg-muted/30", arquivoSelecionado && "border-success bg-success/5")} onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
              {arquivoSelecionado ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                  <div className="flex items-center justify-center"><div className="h-16 w-16 rounded-2xl bg-success/20 flex items-center justify-center"><FileText className="h-8 w-8 text-success" /></div></div>
                  <p className="font-semibold text-foreground">{arquivoSelecionado.name}</p>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setArquivoSelecionado(null); }}><X className="h-4 w-4 mr-1" />Remover</Button>
                </motion.div>
              ) : (
                <div className="space-y-3"><motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Upload className="h-12 w-12 mx-auto text-muted-foreground" /></motion.div><div><p className="font-semibold text-foreground">Arraste o arquivo aqui</p><p className="text-sm text-muted-foreground">ou clique para selecionar</p></div><p className="text-xs text-muted-foreground">PDF, PNG ou JPG até 10MB</p></div>
              )}
            </motion.div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => { setModalAnexar(null); setArquivoSelecionado(null); }} disabled={anexarBoletoMutation.isPending}>Cancelar</Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleAnexarBoleto} disabled={!arquivoSelecionado || anexarBoletoMutation.isPending} className="bg-success hover:bg-success/90 text-white shadow-lg shadow-success/25">{anexarBoletoMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}Anexar e Enviar para Análise</Button>
              </motion.div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
};

export default Beneficiarios;