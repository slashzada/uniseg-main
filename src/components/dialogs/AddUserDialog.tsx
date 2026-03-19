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
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usuariosAPI, vendedoresAPI } from "@/lib/api";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddUserDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddUserDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    papel: "",
    senha: "",
    vendedor_id: "",
  });

  const { data: vendedores } = useQuery({
    queryKey: ["vendedores"],
    queryFn: vendedoresAPI.getAll,
    enabled: formData.papel === "Vendedor",
  });

  const createMutation = useMutation({
    mutationFn: usuariosAPI.create,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário cadastrado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });

      setFormData({
        nome: "",
        email: "",
        papel: "",
        senha: "",
        vendedor_id: "",
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

    if (!formData.nome || !formData.email || !formData.papel || !formData.senha) {
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
      papel: formData.papel,
      senha: formData.senha,
      vendedor_id: formData.papel === "Vendedor" ? formData.vendedor_id : null,
    });
  };

  const loading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo usuário do sistema
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="papel">Papel *</Label>
              <Select
                value={formData.papel}
                onValueChange={(value) =>
                  setFormData({ ...formData, papel: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="papel">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Senha segura"
                value={formData.senha}
                onChange={(e) =>
                  setFormData({ ...formData, senha: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          {formData.papel === "Vendedor" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <Label htmlFor="vendedor_id">Vínculo com Vendedor *</Label>
              <Select
                value={formData.vendedor_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendedor_id: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="vendedor_id">
                  <SelectValue placeholder="Selecione o Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores?.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

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