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
import { useToast } from "@/hooks/use-toast";
import { vendedoresAPI } from "@/lib/api";
import { Loader2, Percent } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddVendedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddVendedorDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddVendedorDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    comissao: "5.0",
  });

  const createMutation = useMutation({
    mutationFn: vendedoresAPI.create,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Vendedor cadastrado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["vendedores"] });
      
      setFormData({
        nome: "",
        email: "",
        comissao: "5.0",
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
    
    if (!formData.nome || !formData.email || !formData.comissao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      nome: formData.nome,
      email: formData.email,
      comissao: parseFloat(formData.comissao),
    });
  };

  const loading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Vendedor</DialogTitle>
          <DialogDescription>
            Cadastre um novo vendedor e defina sua comissão
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              placeholder="Ex: João Silva"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: joao@uniseguros.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comissao" className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-success" />
              Comissão (%) *
            </Label>
            <Input
              id="comissao"
              type="number"
              step="0.5"
              min="0"
              max="100"
              placeholder="Ex: 5.0"
              value={formData.comissao}
              onChange={(e) => setFormData({ ...formData, comissao: e.target.value })}
              disabled={loading}
              className="text-lg font-semibold"
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
              Cadastrar Vendedor
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};