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

interface AddPlanoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddPlanoDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddPlanoDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: operadoras, isLoading: loadingOperadoras } = useOperadoras();
  
  const [formData, setFormData] = useState({
    nome: "",
    operadora_id: "", // Changed from 'operadora' to 'operadora_id'
    tipo: "",
    valor: "",
    descricao: "",
  });

  const createPlanoMutation = useMutation({
    mutationFn: planosAPI.create,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Plano cadastrado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      
      setFormData({
        nome: "",
        operadora_id: "",
        tipo: "",
        valor: "",
        descricao: "",
      });

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

    createPlanoMutation.mutate({
      nome: formData.nome,
      operadora_id: formData.operadora_id,
      tipo: formData.tipo,
      valor: parseFloat(formData.valor),
      descricao: formData.descricao || undefined,
      popular: false, // Default to false
    });
  };

  const loading = createPlanoMutation.isPending || loadingOperadoras;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Plano</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo plano de saúde
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
              Cadastrar
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};