import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText } from "lucide-react";
import { financeiroAPI } from "@/lib/api";
import { exportFinanceiroPDF, FinanceiroReportItem } from "@/lib/pdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GenerateFinanceiroReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateFinanceiroReportDialog = ({
  open,
  onOpenChange,
}: GenerateFinanceiroReportDialogProps) => {
  const { toast } = useToast();
  const [statusFiltro, setStatusFiltro] = useState("todos"); 
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch all without constraints to allow offline filtering
      const todosPagamentos = await financeiroAPI.getAll({});

      // Apply local filters based on selection
      const filtered = todosPagamentos.filter((pag: any) => {
        if (statusFiltro === "recebidos") return pag.status === "pago";
        if (statusFiltro === "a_receber") return pag.status !== "pago";
        if (statusFiltro === "pendente_vencido") return pag.status === "pendente" || pag.status === "vencido";
        if (statusFiltro === "analise") return pag.status === "comprovante_anexado";
        return true; // "todos"
      });

      if (!filtered || filtered.length === 0) {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há pagamentos para o filtro selecionado.",
          variant: "warning",
        });
        setIsGenerating(false);
        return;
      }

      // Format data exactly like the screen
      const items: FinanceiroReportItem[] = filtered.map((pag: any) => ({
        beneficiario: pag.beneficiario || "Beneficiário Desconhecido",
        plano: pag.plano || "Plano Desconhecido",
        valor: Number(pag.valor) || 0,
        vencimento: pag.vencimento ? format(new Date(pag.vencimento.substring(0, 10) + "T12:00:00Z"), "dd/MM/yyyy", { locale: ptBR }) : "Data Inválida",
        status: pag.status === 'pago' ? 'Pago' :
                pag.status === 'pendente' ? 'Pendente' :
                pag.status === 'vencido' ? 'Vencido' :
                pag.status === 'comprovante_anexado' ? 'Em Análise' : pag.status
      }));

      const statusLabels: Record<string, string> = {
        todos: "Todos os status",
        recebidos: "Recebidos",
        a_receber: "A Receber",
        pendente_vencido: "Pendente/Vencido",
        analise: "Em Análise"
      };

      const filename = `relatorio_financeiro_${statusFiltro}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      await exportFinanceiroPDF(items, filename, { statusLabel: statusLabels[statusFiltro] });

      toast({
        title: "Relatório Gerado",
        description: "O relatório financeiro foi baixado com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Configurar Relatório
          </DialogTitle>
          <DialogDescription>
            Escolha os dados que deseja incluir na exportação em PDF.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="status">Quais dados devem compor o relatório?</Label>
            <Select
              value={statusFiltro}
              onValueChange={setStatusFiltro}
              disabled={isGenerating}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="a_receber">A Receber</SelectItem>
                <SelectItem value="recebidos">Recebidos</SelectItem>
                <SelectItem value="pendente_vencido">Pendente/Vencido</SelectItem>
                <SelectItem value="analise">Em Análise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button onClick={generateReport} disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Relatório
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
