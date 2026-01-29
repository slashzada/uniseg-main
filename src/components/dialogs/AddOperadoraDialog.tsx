import { useState, type FormEvent } from "react";
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
import { useQueryClient } from "@tanstack/react-query";

interface AddOperadoraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Helper function to clean document numbers (CNPJ/CPF)
const cleanDocument = (doc: string) => doc.replace(/[^\d]/g, '');

export const AddOperadoraDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddOperadoraDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.cnpj) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await operadorasAPI.create({
        nome: formData.nome,
        cnpj: cleanDocument(formData.cnpj), // Clean CNPJ before sending
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
      });

      toast({
        title: "Sucesso",
        description: "Operadora cadastrada com sucesso!",
      });

      setFormData({
        nome: "",
        cnpj: "",
        telefone: "",
        email: "",
        endereco: "",
      });

      // Force refresh of the list
      await queryClient.invalidateQueries({ queryKey: ["operadoras"] });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao cadastrar operadora",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Operadora</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova operadora de saúde
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
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              placeholder="Ex: 12.345.678/0001-90"
              value={formData.cnpj}
              onChange={(e) =>
                setFormData({ ...formData, cnpj: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="Ex: (11) 3000-0000"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: contato@operadora.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Ex: Rua Principal, 123"
              value={formData.endereco}
              onChange={(e) =>
                setFormData({ ...formData, endereco: e.target.value })
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