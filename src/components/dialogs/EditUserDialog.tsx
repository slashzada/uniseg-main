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
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usuariosAPI, vendedoresAPI } from "@/lib/api";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
  vendedor_id?: string | null;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario;
  onSuccess?: () => void;
}

export const EditUserDialog = ({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: EditUserDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    papel: "",
    senha: "", // Optional password change
    vendedor_id: "",
  });

  const { data: vendedores } = useQuery({
    queryKey: ["vendedores"],
    queryFn: vendedoresAPI.getAll,
    enabled: formData.papel === "Vendedor",
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        senha: "",
        vendedor_id: usuario.vendedor_id || "",
      });
    }
  }, [usuario]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => usuariosAPI.update(usuario!.id, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
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

    if (!formData.nome || !formData.email || !formData.papel) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const updates: any = {
      nome: formData.nome,
      email: formData.email,
      papel: formData.papel,
      vendedor_id: formData.papel === "Vendedor" ? formData.vendedor_id : null,
    };

    if (formData.senha) {
      updates.senha = formData.senha;
    }

    updateMutation.mutate(updates);
  };

  const loading = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize os dados do usuário
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
            <Label htmlFor="senha">Nova Senha (Opcional)</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Deixe em branco para manter a senha atual"
              value={formData.senha}
              onChange={(e) =>
                setFormData({ ...formData, senha: e.target.value })
              }
              disabled={loading}
            />
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
              Salvar Alterações
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};