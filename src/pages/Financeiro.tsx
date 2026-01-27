import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  FileText,
  Paperclip,
  Mail,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Upload,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Pagamento {
  id: number;
  beneficiario: string;
  plano: string;
  valor: number;
  vencimento: string;
  status: "pago" | "pendente" | "vencido";
  boletoAnexado?: string;
}

const pagamentosIniciais: Pagamento[] = [
  { id: 1, beneficiario: "Maria Silva", plano: "Premium Familiar", valor: 890, vencimento: "25/01/2026", status: "pago", boletoAnexado: "boleto_maria.pdf" },
  { id: 2, beneficiario: "João Santos", plano: "Individual Plus", valor: 450, vencimento: "28/01/2026", status: "pendente" },
  { id: 3, beneficiario: "Ana Costa", plano: "Empresarial PME", valor: 1250, vencimento: "15/01/2026", status: "vencido" },
  { id: 4, beneficiario: "Carlos Lima", plano: "Individual Básico", valor: 320, vencimento: "30/01/2026", status: "pendente" },
  { id: 5, beneficiario: "Paula Mendes", plano: "Premium Individual", valor: 650, vencimento: "22/01/2026", status: "pago", boletoAnexado: "boleto_paula.pdf" },
  { id: 6, beneficiario: "Roberto Alves", plano: "Individual Plus", valor: 450, vencimento: "10/01/2026", status: "vencido" },
];

const statusConfig = {
  pago: { 
    label: "Pago", 
    className: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
  },
  pendente: { 
    label: "Pendente", 
    className: "bg-warning/15 text-warning border-warning/30",
    icon: Clock,
  },
  vencido: { 
    label: "Vencido", 
    className: "bg-destructive/15 text-destructive border-destructive/30",
    icon: AlertCircle,
  },
};

const Financeiro = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(pagamentosIniciais);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [modalAnexar, setModalAnexar] = useState<Pagamento | null>(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const pagamentosFiltrados = pagamentos.filter((pag) => {
    const matchStatus = filtroStatus === "todos" || pag.status === filtroStatus;
    const matchBusca = pag.beneficiario.toLowerCase().includes(busca.toLowerCase()) ||
                       pag.plano.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const totais = {
    aReceber: pagamentos.reduce((acc, p) => acc + p.valor, 0),
    recebido: pagamentos.filter(p => p.status === "pago").reduce((acc, p) => acc + p.valor, 0),
    pendente: pagamentos.filter(p => p.status === "pendente").reduce((acc, p) => acc + p.valor, 0),
    vencido: pagamentos.filter(p => p.status === "vencido").reduce((acc, p) => acc + p.valor, 0),
  };

  const handleAnexarBoleto = () => {
    if (!modalAnexar || !arquivoSelecionado) return;

    setPagamentos(prev => prev.map(p => 
      p.id === modalAnexar.id 
        ? { ...p, status: "pago" as const, boletoAnexado: arquivoSelecionado.name }
        : p
    ));

    toast({
      title: "✅ Boleto anexado com sucesso!",
      description: `Pagamento de ${modalAnexar.beneficiario} marcado como pago.`,
    });

    setModalAnexar(null);
    setArquivoSelecionado(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoSelecionado(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setArquivoSelecionado(file);
    }
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
              Financeiro
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Controle de pagamentos e cobranças
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="gap-2 shadow-lg"
              onClick={() => {
                toast({
                  title: "Relatório Exportado",
                  description: "Relatório de pagamentos exportado com sucesso em CSV",
                });
              }}
            >
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "A Receber (Mês)", value: totais.aReceber, icon: DollarSign, color: "primary" },
            { label: "Recebido", value: totais.recebido, icon: TrendingUp, color: "success" },
            { label: "Pendente", value: totais.pendente, icon: Clock, color: "warning" },
            { label: "Vencido", value: totais.vencido, icon: TrendingDown, color: "destructive" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden group relative">
                <div className={cn(
                  "absolute inset-0 opacity-5",
                  stat.color === "primary" && "bg-gradient-to-br from-primary to-primary/50",
                  stat.color === "success" && "bg-gradient-to-br from-success to-success/50",
                  stat.color === "warning" && "bg-gradient-to-br from-warning to-warning/50",
                  stat.color === "destructive" && "bg-gradient-to-br from-destructive to-destructive/50",
                )} />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className={cn(
                        "text-2xl font-bold font-tabular mt-1",
                        stat.color === "success" && "text-success",
                        stat.color === "warning" && "text-warning",
                        stat.color === "destructive" && "text-destructive",
                      )}>
                        R$ {stat.value.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      stat.color === "primary" && "bg-primary/10 text-primary",
                      stat.color === "success" && "bg-success/10 text-success",
                      stat.color === "warning" && "bg-warning/10 text-warning",
                      stat.color === "destructive" && "bg-destructive/10 text-destructive",
                    )}>
                      <stat.icon className="h-6 w-6" />
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
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por beneficiário ou plano..." 
                    className="pl-11 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors" 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="vencido">Vencidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">
                Pagamentos
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({pagamentosFiltrados.length} registros)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Beneficiário
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Plano
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <AnimatePresence mode="popLayout">
                      {pagamentosFiltrados.map((pag, index) => {
                        const StatusIcon = statusConfig[pag.status].icon;
                        return (
                          <motion.tr
                            key={pag.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.03 }}
                            className="group hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold group-hover:text-primary transition-colors">{pag.beneficiario}</p>
                            </td>
                            <td className="px-6 py-5 text-muted-foreground">
                              {pag.plano}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="font-bold font-tabular text-lg">
                                R$ {pag.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center text-muted-foreground">
                              {pag.vencimento}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex justify-center">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "gap-1.5 font-semibold border",
                                    statusConfig[pag.status].className
                                  )}
                                >
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {statusConfig[pag.status].label}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                {pag.status !== "pago" ? (
                                  <>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button 
                                        variant="default"
                                        size="sm" 
                                        className="h-9 gap-2 bg-success hover:bg-success/90 text-white shadow-lg shadow-success/25"
                                        onClick={() => setModalAnexar(pag)}
                                      >
                                        <Paperclip className="h-4 w-4" />
                                        <span className="hidden sm:inline">Anexar Boleto</span>
                                      </Button>
                                    </motion.div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-9 w-9" 
                                      title="Enviar lembrete"
                                      onClick={() => {
                                        toast({
                                          title: "Lembrete Enviado",
                                          description: `E-mail de lembrete enviado para ${pag.beneficiario}`,
                                        });
                                      }}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-9 gap-2"
                                    title={pag.boletoAnexado}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="hidden sm:inline">Ver Boleto</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Modal Anexar Boleto */}
      <Dialog open={!!modalAnexar} onOpenChange={() => {
        setModalAnexar(null);
        setArquivoSelecionado(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Paperclip className="h-5 w-5 text-success" />
              </div>
              Anexar Boleto Pago
            </DialogTitle>
            <DialogDescription className="text-base">
              Anexe o comprovante de pagamento de <strong>{modalAnexar?.beneficiario}</strong>.
              O status será marcado automaticamente como pago.
            </DialogDescription>
          </DialogHeader>

          <motion.div 
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
              isDragging ? "border-success bg-success/5 scale-[1.02]" : "border-border hover:border-muted-foreground/50 hover:bg-muted/30",
              arquivoSelecionado && "border-success bg-success/5"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {arquivoSelecionado ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-success/20 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-success" />
                  </div>
                </div>
                <p className="font-semibold text-foreground">{arquivoSelecionado.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(arquivoSelecionado.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setArquivoSelecionado(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground">
                    Arraste o arquivo aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou clique para selecionar
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG ou JPG até 10MB
                </p>
              </div>
            )}
          </motion.div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setModalAnexar(null);
                setArquivoSelecionado(null);
              }}
            >
              Cancelar
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleAnexarBoleto}
                disabled={!arquivoSelecionado}
                className="bg-success hover:bg-success/90 text-white shadow-lg shadow-success/25"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Anexar e Marcar como Pago
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Financeiro;
