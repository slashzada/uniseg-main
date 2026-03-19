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
import { useQuery } from "@tanstack/react-query";
import { vendedoresAPI, comissoesAPI } from "@/lib/api";
import { exportComissoesPDF, ReportItem } from "@/lib/pdf";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GenerateComissoesReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateComissoesReportDialog = ({
  open,
  onOpenChange,
}: GenerateComissoesReportDialogProps) => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("monthly"); // weekly, monthly, quarterly, semiannual, annual, all
  const [selectedVendedorId, setSelectedVendedorId] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formatType] = useState<"pdf">("pdf");

  const { data: vendedores, isLoading: loadingVendedores } = useQuery({
    queryKey: ["vendedores"],
    queryFn: vendedoresAPI.getAll,
  });

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const params: { timeframe: string; vendedorId?: string } = { timeframe };
      if (selectedVendedorId !== "all") {
        params.vendedorId = selectedVendedorId;
      }

      const reportDataUnknown = await comissoesAPI.generateReport(params);

      // Se vier em CSV texto, normalizar para PDF

      // Normalizar para array
      let items: ReportItem[] = Array.isArray(reportDataUnknown) ? (reportDataUnknown as ReportItem[]) : [];
      if (typeof reportDataUnknown === "string") {
        const lines = reportDataUnknown.split(/\r?\n/).filter(Boolean);
        const header = lines.shift();
        if (header) {
          items = lines.map((line) => {
            const [vigencia, vendedor, beneficiario, operadora, plano, valorVenda, comissaoPct, valorComissao, status] = line.split(',');
            return {
              data_liquidacao: vigencia || '-',
              vendedor_nome: vendedor,
              beneficiario_nome: beneficiario,
              operadora_nome: operadora || '-',
              plano_nome: plano || '-', 
              valor_pagamento: Number(valorVenda?.replace(',', '.')) || 0,
              comissao_percentual: Number(comissaoPct?.replace('%', '')) || 0,
              valor_comissao: Number(valorComissao?.replace(',', '.')) || 0,
              mes_referencia_liquidacao: status || '-',
            };
          });
        }
      }

      if (!Array.isArray(items) || items.length === 0) {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há comissões liquidadas para os filtros selecionados.",
          variant: "warning",
        });
        return;
      }

      const timeframeLabelMap: Record<string, string> = {
        weekly: "Últimos 7 dias",
        monthly: "Mês Atual",
        quarterly: "Últimos 3 meses",
        semiannual: "Últimos 6 meses",
        annual: "Ano Atual",
        all: "Todo o Período",
      };
      const timeframeLabel = timeframeLabelMap[timeframe] || timeframe;
      const vendedorLabel = selectedVendedorId === "all" ? "Todos os Vendedores" : (vendedores?.find(v => v.id === selectedVendedorId)?.nome || selectedVendedorId);

      const filename = `relatorio_comissoes_${timeframe}_${selectedVendedorId}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      await exportComissoesPDF(items, filename, { timeframeLabel, vendedorLabel });

      toast({
        title: "Relatório Gerado",
        description: "O relatório de comissões foi baixado com sucesso.",
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

  const loading = isGenerating || loadingVendedores;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Gerar Relatório de Comissões
          </DialogTitle>
          <DialogDescription>
            Selecione o período e o vendedor para gerar o relatório detalhado de comissões.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="timeframe">Período</Label>
            <Select
              value={timeframe}
              onValueChange={setTimeframe}
              disabled={loading}
            >
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Últimos 7 dias</SelectItem>
                <SelectItem value="monthly">Mês Atual</SelectItem>
                <SelectItem value="quarterly">Últimos 3 meses</SelectItem>
                <SelectItem value="semiannual">Últimos 6 meses</SelectItem>
                <SelectItem value="annual">Ano Atual</SelectItem>
                <SelectItem value="all">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor</Label>
            <Select
              value={selectedVendedorId}
              onValueChange={setSelectedVendedorId}
              disabled={loading}
            >
              <SelectTrigger id="vendedor">
                <SelectValue placeholder={loadingVendedores ? "Carregando vendedores..." : "Todos os vendedores"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Vendedores</SelectItem>
                {vendedores?.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Formato removido: sempre PDF */}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={generateReport} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Relatório
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
