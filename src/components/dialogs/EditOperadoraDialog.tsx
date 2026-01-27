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
import { useToast } from "@/hooks/use-toast";
import { operadorasAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Operadora {
  id: string;
  nome: string;
  status: "ativa" | "inativa";
  cor: string;
  planos: number;
  beneficiarios: number;
}

interface EditOperadoraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operadora?: Operadora;
  onSuccess?: () => void;
}

export const EditOperadoraDialog = ({
  open,
  onOpenChange,
  operadora,
  onSuccess,
}: EditOperadoraDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    status: "",
    cor: "",
    // Note: CNPJ, Telefone, Endereco are not returned by the current backend controller, 
    // but we assume they exist in the database and can be updated if fetched.
  });

  useEffect(() => {
    if (operadora) {
      setFormData({
        nome: operadora.nome,
        status: operadora.status,
        cor: operadora.cor,
      });
    }
  }, [operadora]);

  const updateOperadoraMutation = useMutation({
    mutationFn: (data: any) => operadorasAPI.update(operadora!.id, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Operadora atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["operadoras"] });
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
    
    if (!formData.nome || !formData.status) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    updateOperadoraMutation.mutate({
      nome: formData.nome,
      status: formData.status,
      cor: formData.cor,
    });
  };

  const loading = updateOperadoraMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Operadora: {operadora?.nome}</DialogTitle>
          <DialogDescription>
            Atualize os dados da operadora de saúde
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Operadora *</Label>
            <Input
              id="nome"
              placeholder="Ex: Unimed"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Cor field is optional and complex, keeping it simple for now */}
          {/* <div className="space-y-2">
            <Label htmlFor="cor">Cor de Destaque (Tailwind Gradient)</Label>
            <Input
              id="cor"
              placeholder="Ex: from-primary to-primary/80"
              value={formData.cor}
              onChange={(e) =>
                setFormData({ ...formData, cor: e.target.value })
              }
              disabled={loading}
            />
          </div> */}

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