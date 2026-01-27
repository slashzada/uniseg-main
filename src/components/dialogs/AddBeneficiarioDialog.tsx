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
import { beneficiariosAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AddBeneficiarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const operadoras = [
  { id: 1, nome: "Unimed" },
  { id: 2, nome: "Bradesco Saúde" },
  { id: 3, nome: "SulAmérica" },
  { id: 4, nome: "Amil" },
  { id: 5, nome: "NotreDame Intermédica" },
];

const planos = [
  { id: 1, nome: "Individual Básico" },
  { id: 2, nome: "Individual Plus" },
  { id: 3, nome: "Premium Familiar" },
  { id: 4, nome: "Empresarial PME" },
  { id: 5, nome: "Premium Individual" },
  { id: 6, nome: "Familiar Completo" },
];

const vendedores = [
  { id: 1, nome: "João Vendedor" },
  { id: 2, nome: "Maria Sales" },
  { id: 3, nome: "Carlos Souza" },
];

export const AddBeneficiarioDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddBeneficiarioDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    plano: "",
    operadora: "",
    vendedor: "",
    valor: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cpf || !formData.plano || !formData.operadora || !formData.vendedor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await beneficiariosAPI.create({
        nome: formData.nome,
        cpf: formData.cpf,
        plano_id: parseInt(formData.plano),
        operadora_id: parseInt(formData.operadora),
        vendedor_id: parseInt(formData.vendedor),
        valor_plano: parseFloat(formData.valor || "0"),
      });

      toast({
        title: "Sucesso",
        description: "Beneficiário cadastrado com sucesso!",
      });

      setFormData({
        nome: "",
        cpf: "",
        plano: "",
        operadora: "",
        vendedor: "",
        valor: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao cadastrar beneficiário",
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
          <DialogTitle>Cadastrar Novo Beneficiário</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo beneficiário
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
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              placeholder="Ex: 123.456.789-00"
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operadora">Operadora *</Label>
              <Select
                value={formData.operadora}
                onValueChange={(value) =>
                  setFormData({ ...formData, operadora: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="operadora">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {operadoras.map((op) => (
                    <SelectItem key={op.id} value={op.id.toString()}>
                      {op.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plano">Plano *</Label>
              <Select
                value={formData.plano}
                onValueChange={(value) =>
                  setFormData({ ...formData, plano: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="plano">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {planos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendedor">Vendedor *</Label>
              <Select
                value={formData.vendedor}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendedor: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="vendedor">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor do Plano</Label>
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
