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
import { beneficiariosAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useOperadoras, usePlanos, useVendedores } from "@/hooks/use-fetch-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Helper function to clean document numbers (CNPJ/CPF)
const cleanDocument = (doc: string) => doc.replace(/[^\d]/g, '');

interface AddBeneficiarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddBeneficiarioDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddBeneficiarioDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    plano_id: "",
    operadora_id: "",
    operadora_id: "",
    vendedor_id: "",
    vigencia: "", // New Field
    valor: "", // This field is not strictly needed for the backend API but kept for form compatibility
  });

  const { data: operadoras, isLoading: loadingOperadoras } = useOperadoras();
  const { data: vendedores, isLoading: loadingVendedores } = useVendedores();
  const { data: planos, isLoading: loadingPlanos } = usePlanos(formData.operadora_id);

  // Reset plano selection if operadora changes
  useEffect(() => {
    if (formData.plano_id && planos && !planos.some(p => p.id === formData.plano_id)) {
      setFormData(prev => ({ ...prev, plano_id: "" }));
    }
  }, [formData.operadora_id, planos]);

  const createBeneficiarioMutation = useMutation({
    mutationFn: beneficiariosAPI.create,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Beneficiário cadastrado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["beneficiarios"] });

      setFormData({
        nome: "",
        cpf: "",
        plano_id: "",
        operadora_id: "",
        operadora_id: "",
        vendedor_id: "",
        vigencia: "",
        valor: "",
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

    if (!formData.nome || !formData.cpf || !formData.plano_id || !formData.operadora_id || !formData.vendedor_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createBeneficiarioMutation.mutate({
      nome: formData.nome,
      cpf: cleanDocument(formData.cpf), // Clean CPF before sending
      plano_id: formData.plano_id,
      plano_id: formData.plano_id,
      vendedor_id: formData.vendedor_id,
      vigencia: formData.vigencia, // Send vigencia
      // Note: valor_plano is not required by the backend controller, but if it were, 
      // we would calculate it based on the selected plano or use the form value.
    });
  };

  const loading = createBeneficiarioMutation.isPending || loadingOperadoras || loadingVendedores || loadingPlanos;

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
              <Label htmlFor="plano">Plano *</Label>
              <Select
                value={formData.plano_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, plano_id: value })
                }
                disabled={loading || !formData.operadora_id}
              >
                <SelectTrigger id="plano">
                  <SelectValue placeholder={loadingPlanos ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {planos?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
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
                value={formData.vendedor_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendedor_id: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="vendedor">
                  <SelectValue placeholder={loadingVendedores ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {vendedores?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
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

          <div className="space-y-2">
            <Label htmlFor="vigencia">Vigência</Label>
            <Input
              id="vigencia"
              type="date"
              value={formData.vigencia}
              onChange={(e) =>
                setFormData({ ...formData, vigencia: e.target.value })
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
    </Dialog >
  );
};