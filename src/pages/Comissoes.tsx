import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HandCoins,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Loader2,
  Wallet,
  CalendarDays,
  Search, // Added Search icon for empty state
  Download, // Added Download icon for report button
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comissoesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { GenerateComissoesReportDialog } from "@/components/dialogs/GenerateComissoesReportDialog"; // Import new dialog

interface ComissaoResumo {
  id: string;
  nome: string;
  comissao_percentual: number;
  total_vendas: number;
  comissao_a_receber: number;
  comissao_prevista: number;
  liquidado_mes_atual: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Comissoes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [openLiquidarAlert, setOpenLiquidarAlert] = useState(false);
  const [vendedorToLiquidar, setVendedorToLiquidar] = useState<ComissaoResumo | null>(null);
  const [openGenerateReportDialog, setOpenGenerateReportDialog] = useState(false); // New state for report dialog
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "quarterly" | "semiannual" | "annual" | "all">("all");
  const [autoRefresh, setAutoRefresh] = useState<"off" | "weekly" | "monthly">("off");
  const refetchIntervalMs: number | false =
    autoRefresh === "weekly"
      ? 7 * 24 * 60 * 60 * 1000
      : autoRefresh === "monthly"
      ? 30 * 24 * 60 * 60 * 1000
      : false;

  const { data: comissoes, isLoading, refetch, error } = useQuery<ComissaoResumo[]>({
    queryKey: ["comissoesResumo", timeframe] as const,
    queryFn: () => comissoesAPI.getResumo({ timeframe }),
    refetchInterval: refetchIntervalMs,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar comissões",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // --- DEBUG LOGS ---
  console.log("Comissoes Page: isLoading =", isLoading);
  console.log("Comissoes Page: comissoes data =", comissoes);
  // --- END DEBUG LOGS ---

  const liquidarMutation = useMutation({
    mutationFn: (vendedorId: string) => comissoesAPI.liquidar(vendedorId),
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: `Comissões de ${vendedorToLiquidar?.nome} liquidadas com sucesso! Valor: R$ ${data.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      });
      queryClient.invalidateQueries({ queryKey: ["comissoesResumo"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }); // Update dashboard for sellers
      setVendedorToLiquidar(null);
      setOpenLiquidarAlert(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao liquidar comissões",
        description: error.message,
        variant: "destructive",
      });
      setVendedorToLiquidar(null);
      setOpenLiquidarAlert(false);
    },
  });

  const handleLiquidar = (vendedor: ComissaoResumo) => {
    setVendedorToLiquidar(vendedor);
    setOpenLiquidarAlert(true);
  };

  const confirmLiquidar = () => {
    if (vendedorToLiquidar) {
      liquidarMutation.mutate(vendedorToLiquidar.id);
    }
  };

  const comissoesData: ComissaoResumo[] = comissoes ?? [];

  const mesAtualFormatado = format(new Date(), "MMMM/yyyy", { locale: ptBR });

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
              Comissões
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Gerencie as comissões dos vendedores
            </p>
          </div>
          <div className="flex items-center gap-4"> {/* Group buttons */}
            <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm">
              <CalendarDays className="h-4 w-4" />
              <span className="capitalize">{mesAtualFormatado}</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={(v: "weekly" | "monthly" | "quarterly" | "semiannual" | "annual" | "all") => setTimeframe(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Últimos 7 dias</SelectItem>
                  <SelectItem value="monthly">Mês atual</SelectItem>
                  <SelectItem value="quarterly">Últimos 3 meses</SelectItem>
                  <SelectItem value="semiannual">Últimos 6 meses</SelectItem>
                  <SelectItem value="annual">Ano atual</SelectItem>
                  <SelectItem value="all">Todo período</SelectItem>
                </SelectContent>
              </Select>
              <Select value={autoRefresh} onValueChange={(v: "off" | "weekly" | "monthly") => setAutoRefresh(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Autoatualização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Sem autoatualização</SelectItem>
                  <SelectItem value="weekly">Atualizar semanalmente</SelectItem>
                  <SelectItem value="monthly">Atualizar mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="gap-2 shadow-lg"
                onClick={() => setOpenGenerateReportDialog(true)} // Open report dialog
              >
                <Download className="h-4 w-4" />
                Gerar Relatório
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">
                Resumo de Comissões por Vendedor
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({comissoesData.length} vendedores)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">
                    Carregando resumo de comissões...
                  </p>
                </div>
              ) : comissoesData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Vendedor
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          % Comissão
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Total Vendas
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Comissão a Receber
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Comissão Prevista
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
                        {comissoesData.map((vendedor, index) => (
                          <motion.tr
                            key={vendedor.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.03 }}
                            className="group hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold group-hover:text-primary transition-colors">
                                {vendedor.nome}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <Badge
                                variant="outline"
                                className="gap-1.5 font-semibold border bg-accent/15 text-accent border-accent/30"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                                {vendedor.comissao_percentual}%
                              </Badge>
                            </td>
                            <td className="px-6 py-5 text-center text-muted-foreground">
                              <div className="flex items-center justify-center gap-1">
                                <Users className="h-4 w-4" />
                                {vendedor.total_vendas}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="font-bold font-tabular text-lg text-success">
                                R$ {vendedor.comissao_a_receber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="font-bold font-tabular text-lg text-warning">
                                R$ {vendedor.comissao_prevista.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {vendedor.liquidado_mes_atual ? (
                                <Badge
                                  variant="outline"
                                  className="gap-1.5 font-semibold border bg-primary/15 text-primary border-primary/30"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Liquidado
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="gap-1.5 font-semibold border bg-warning/15 text-warning border-warning/30"
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                  Pendente
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="h-9 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                                  onClick={() => handleLiquidar(vendedor)}
                                  disabled={vendedor.liquidado_mes_atual || liquidarMutation.isPending || vendedor.comissao_a_receber === 0}
                                >
                                  {liquidarMutation.isPending && vendedorToLiquidar?.id === vendedor.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Wallet className="h-4 w-4" />
                                  )}
                                  <span className="hidden sm:inline font-semibold">Liquidar</span>
                                </Button>
                              </motion.div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    Nenhum resumo de comissão encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Verifique se há vendedores ativos e pagamentos confirmados.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Liquidation Confirmation Alert */}
      <AlertDialog open={openLiquidarAlert} onOpenChange={setOpenLiquidarAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Liquidação de Comissões?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a liquidar as comissões pendentes para o vendedor{" "}
              <span className="font-semibold text-foreground">
                {vendedorToLiquidar?.nome}
              </span>{" "}
              no valor de{" "}
              <span className="font-bold text-success">
                R$ {vendedorToLiquidar?.comissao_a_receber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              . Esta ação marcará todos os pagamentos elegíveis como comissão liquidada para o mês atual e não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={liquidarMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLiquidar}
              disabled={liquidarMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {liquidarMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Liquidação"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Report Generation Dialog */}
      <GenerateComissoesReportDialog
        open={openGenerateReportDialog}
        onOpenChange={setOpenGenerateReportDialog}
      />
    </AppLayout>
  );
};

export default Comissoes;
