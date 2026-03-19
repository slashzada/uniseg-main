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

interface Beneficiario {
  id: string;
  nome: string;
  cpf: string;
  plano: string;
  operadora: string;
  status: string;
  desde: string;
  vendedorId: string;
  valorPlano: number;
  plano_id: string;
  operadora_id: string;
  vigencia?: string;
  telefone?: string;
}

interface EditBeneficiarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiario?: Beneficiario;
  onSuccess?: () => void;
}

export const EditBeneficiarioDialog = ({
  open,
  onOpenChange,
  beneficiario,
  onSuccess,
}: EditBeneficiarioDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: operadoras, isLoading: loadingOperadoras } = useOperadoras();
  const { data: vendedores, isLoading: loadingVendedores } = useVendedores();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    plano_id: "",
    operadora_id: "",
    vendedor_id: "",
    status: "",
    vigencia: "",
    telefone: "",
  });

  // Fetch plans based on selected operadora
  const { data: planos, isLoading: loadingPlanos } = usePlanos(formData.operadora_id);

  useEffect(() => {
    if (beneficiario) {
      setFormData({
        nome: beneficiario.nome,
        cpf: beneficiario.cpf,
        plano_id: beneficiario.plano_id,
        operadora_id: beneficiario.operadora_id,
        vendedor_id: beneficiario.vendedorId,
        status: beneficiario.status,
        vigencia: beneficiario.vigencia || "",
        telefone: beneficiario.telefone || "",
      });
    }
  }, [beneficiario]);

  const updateBeneficiarioMutation = useMutation({
    mutationFn: (data: any) => beneficiariosAPI.update(beneficiario!.id, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Beneficiário atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["beneficiarios"] });
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

    if (!formData.nome || !formData.cpf || !formData.plano_id || !formData.operadora_id || !formData.vendedor_id || !formData.status) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    updateBeneficiarioMutation.mutate({
      nome: formData.nome,
      cpf: formData.cpf,
      plano_id: formData.plano_id,
      vendedor_id: formData.vendedor_id,
      status: formData.status,
      vigencia: formData.vigencia,
      telefone: formData.telefone,
    });
  };

  const loading = updateBeneficiarioMutation.isPending || loadingOperadoras || loadingVendedores || loadingPlanos;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Beneficiário: {beneficiario?.nome}</DialogTitle>
          <DialogDescription>
            Atualize os dados do beneficiário
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
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inadimplente">Inadimplente</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="Ex: (11) 99999-9999"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
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
              Salvar Alterações
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};