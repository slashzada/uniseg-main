import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { planosAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useOperadoras } from "@/hooks/use-fetch-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Plano {
  id: string;
  nome: string;
  operadora: string; // Name of the operadora
  operadora_id: string; // ID of the operadora
  valor: number;
  tipo: string;
  popular: boolean;
  descricao?: string; // Added description
}

interface EditPlanoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plano?: Plano;
  onSuccess?: () => void;
}

export const EditPlanoDialog = ({
  open,
  onOpenChange,
  plano,
  onSuccess,
}: EditPlanoDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: operadoras, isLoading: loadingOperadoras } = useOperadoras();
  
  const [formData, setFormData] = useState({
    nome: "",
    operadora_id: "",
    tipo: "",
    valor: "",
    popular: false,
    descricao: "", // Added description
  });

  useEffect(() => {
    if (plano) {
      setFormData({
        nome: plano.nome,
        operadora_id: plano.operadora_id,
        tipo: plano.tipo,
        valor: plano.valor.toString(),
        popular: plano.popular,
        descricao: plano.descricao || "", // Initialize description
      });
    }
  }, [plano]);

  const updatePlanoMutation = useMutation({
    mutationFn: (data: any) => planosAPI.update(plano!.id, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.operadora_id || !formData.tipo || !formData.valor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    updatePlanoMutation.mutate({
      nome: formData.nome,
      operadora_id: formData.operadora_id,
      tipo: formData.tipo,
      valor: parseFloat(formData.valor),
      popular: formData.popular,
      descricao: formData.descricao || undefined, // Include description
    });
  };

  const loading = updatePlanoMutation.isPending || loadingOperadoras;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Plano: {plano?.nome}</DialogTitle>
          <DialogDescription>
            Atualize os dados do plano de saúde
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Plano *</Label>
            <Input
              id="nome"
              placeholder="Ex: Individual Plus"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operadora">Operadora *</Label>
              <Select
                value={formData.operadora_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, operadora_id: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="operadora">
                  <SelectValue placeholder={loadingOperadoras ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {operadoras?.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Familiar">Familiar</SelectItem>
                  <SelectItem value="Empresarial">Empresarial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor Mensal (R$) *</Label>
            <Input
              id="valor"
              type="number"
              placeholder="Ex: 450.00"
              step="0.01"
              value={formData.valor}
              onChange={(e) =>
                setFormData({ ...formData, valor: e.target.value })
              }
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              placeholder="Descrição do plano (opcional)"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              id="popular"
              type="checkbox"
              checked={formData.popular}
              onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="popular" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Marcar como Popular
            </Label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};