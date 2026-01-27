import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, User, TrendingDown, UserCheck, Percent, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddBeneficiarioDialog } from "@/components/dialogs/AddBeneficiarioDialog";
import { EditBeneficiarioDialog } from "@/components/dialogs/EditBeneficiarioDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { beneficiariosAPI, vendedoresAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Beneficiario {
  id: string;
  nome: string;
  cpf: string;
  plano: string;
  plano_id: string;
  operadora: string;
  operadora_id: string;
  status: "ativo" | "inadimplente" | "inativo";
  desde: string; // ISO date string, but backend formats it
  vendedorId: string; // Assuming this is the ID from the backend response
  vendedor: string; // Vendedor name
  comissao: number; // Vendedor commission rate
  valorPlano: number;
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

  const { data: vendedores, isLoading: loadingVendedores } = useQuery<any[]>({
    queryKey: ["vendedores"],
    queryFn: vendedoresAPI.getAll,
  });

  const { data: beneficiarios, isLoading, refetch } = useQuery<Beneficiario[]>({
    queryKey: ["beneficiarios", filtro, filtroVendedor, busca],
    queryFn: () => beneficiariosAPI.getAll({ 
      status: filtro === "todos" ? undefined : filtro, 
      vendedor_id: filtroVendedor === "todos" ? undefined : filtroVendedor,
      busca: busca || undefined
    }),
    select: (data) => data.map(ben => ({
      ...ben,
      // Ensure IDs are present for editing/linking
      plano_id: ben.plano?.id || ben.plano_id, // Assuming backend returns IDs nested or flattened
      operadora_id: ben.plano?.operadora?.id || ben.operadora_id,
      vendedorId: ben.vendedor?.id || ben.vendedor_id,
      // Format date if necessary, but keeping it simple for now
    })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => beneficiariosAPI.delete(id),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: `Beneficiário ${beneficiarioToDelete?.nome} excluído com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["beneficiarios"] });
      setBeneficiarioToDelete(null);
      setOpenDeleteAlert(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
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
    if (beneficiarioToDelete) {
      deleteMutation.mutate(beneficiarioToDelete.id);
    }
  };

  const beneficiariosData = beneficiarios || [];

  const stats = {
    ativos: beneficiariosData.filter(b => b.status === "ativo").length,
    inadimplentes: beneficiariosData.filter(b => b.status === "inadimplente").length,
    inativos: beneficiariosData.filter(b => b.status === "inativo").length,
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Beneficiários
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Gerencie os beneficiários dos planos
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => setOpenAddDialog(true)}
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25 gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Venda
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: "Ativos", value: stats.ativos, icon: UserCheck, color: "success", trend: "+12" },
            { label: "Inadimplentes", value: stats.inadimplentes, icon: TrendingDown, color: "destructive", trend: "-3" },
            { label: "Inativos", value: stats.inativos, icon: Users, color: "muted", trend: "0" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <span className={cn(
                          "text-xs font-semibold px-1.5 py-0.5 rounded",
                          stat.color === "success" && "bg-success/15 text-success",
                          stat.color === "destructive" && "bg-destructive/15 text-destructive",
                          stat.color === "muted" && "bg-muted text-muted-foreground",
                        )}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      stat.color === "success" && "bg-success/10 text-success",
                      stat.color === "destructive" && "bg-destructive/10 text-destructive",
                      stat.color === "muted" && "bg-muted text-muted-foreground",
                    )}>
                      <stat.icon className="h-7 w-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou CPF..."
                    className="pl-11 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Select value={filtroVendedor} onValueChange={setFiltroVendedor} disabled={loadingVendedores}>
                    <SelectTrigger className="w-48 h-10 bg-background/50">
                      <SelectValue placeholder={loadingVendedores ? "Carregando vendedores..." : "Filtrar por vendedor"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os vendedores</SelectItem>
                      {vendedores?.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {[
                    { key: "todos", label: "Todos" },
                    { key: "ativo", label: "Ativos" },
                    { key: "inadimplente", label: "Inadimplentes" },
                    { key: "inativo", label: "Inativos" },
                  ].map((f) => (
                    <Button
                      key={f.key}
                      variant={filtro === f.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltro(f.key)}
                      className={cn(
                        "transition-all",
                        filtro === f.key && "shadow-lg shadow-primary/25"
                      )}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Carregando beneficiários...</p>
          </div>
        )}

        {/* List */}
        {!isLoading && beneficiariosData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">
                  Lista de Beneficiários
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({beneficiariosData.length} registros)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-border/50"
                >
                  <AnimatePresence mode="popLayout">
                    {beneficiariosData.map((ben) => {
                      const comissaoValor = ben.valorPlano ? (ben.valorPlano * ben.comissao / 100) : 0;
                      
                      return (
                        <motion.div
                          key={ben.id}
                          variants={itemVariants}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="group flex items-center justify-between px-6 py-5 hover:bg-muted/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <motion.div 
                              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
                              whileHover={{ scale: 1.1 }}
                            >
                              <User className="h-6 w-6 text-primary" />
                            </motion.div>
                            <div>
                              <p className="font-semibold group-hover:text-primary transition-colors">{ben.nome}</p>
                              <p className="text-sm text-muted-foreground">{ben.cpf}</p>
                            </div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="font-medium">{ben.plano}</p>
                            <p className="text-sm text-muted-foreground">{ben.operadora}</p>
                          </div>
                          
                          {/* Vendedor Info */}
                          <div className="hidden lg:flex items-center gap-3">
                            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
                                <span className="text-[10px] font-bold text-accent">
                                  {ben.vendedor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </span>
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-medium text-foreground">{ben.vendedor}</p>
                                <div className="flex items-center gap-1 text-accent">
                                  <Percent className="h-3 w-3" />
                                  <span className="text-[10px] font-semibold">{ben.comissao}%</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    (R$ {comissaoValor.toFixed(2)})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground hidden md:block">
                              Desde {ben.desde}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border font-medium",
                                statusConfig[ben.status].className
                              )}
                            >
                              {statusConfig[ben.status].label}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(ben)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(ben)}
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
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

        {/* Empty State */}
        {!isLoading && beneficiariosData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Nenhum beneficiário encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </motion.div>
        )}

        <AddBeneficiarioDialog 
          open={openAddDialog} 
          onOpenChange={setOpenAddDialog}
          onSuccess={refetch}
        />
        
        {selectedBeneficiario && (
          <EditBeneficiarioDialog 
            open={openEditDialog} 
            onOpenChange={setOpenEditDialog}
            beneficiario={selectedBeneficiario}
            onSuccess={refetch}
          />
        )}

        {/* Delete Confirmation Alert */}
        <AlertDialog open={openDeleteAlert} onOpenChange={setOpenDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o beneficiário 
                <span className="font-semibold text-foreground"> {beneficiarioToDelete?.nome}</span> e todos os pagamentos vinculados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Excluir Permanentemente"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AppLayout>
  );
};

export default Beneficiarios;