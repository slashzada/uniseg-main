import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  DollarSign,
  Bell,
  Plus,
  Percent,
  Edit2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  comissao: number;
  vendasMes: number;
  status: "ativo" | "inativo";
}

const vendedoresIniciais: Vendedor[] = [
  { id: 1, nome: "João Vendedor", email: "joao@uniseguros.com", telefone: "(11) 99999-1111", comissao: 5, vendasMes: 12, status: "ativo" },
  { id: 2, nome: "Maria Sales", email: "maria.sales@uniseguros.com", telefone: "(11) 99999-2222", comissao: 7.5, vendasMes: 18, status: "ativo" },
  { id: 3, nome: "Carlos Souza", email: "carlos@uniseguros.com", telefone: "(11) 99999-3333", comissao: 4, vendasMes: 8, status: "ativo" },
  { id: 4, nome: "Ana Paula", email: "ana@uniseguros.com", telefone: "(11) 99999-4444", comissao: 6, vendasMes: 0, status: "inativo" },
];

const usuarios = [
  { id: 1, nome: "Admin Principal", email: "admin@uniseguros.com", papel: "Admin" },
  { id: 2, nome: "Maria Financeiro", email: "maria@uniseguros.com", papel: "Financeiro" },
];

const papelConfig = {
  Admin: "bg-primary/10 text-primary",
  Financeiro: "bg-success/10 text-success",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const Configuracoes = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>(vendedoresIniciais);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    comissao: "",
  });

  const openAddModal = () => {
    setEditingVendedor(null);
    setFormData({ nome: "", email: "", telefone: "", comissao: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor);
    setFormData({
      nome: vendedor.nome,
      email: vendedor.email,
      telefone: vendedor.telefone,
      comissao: vendedor.comissao.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.email || !formData.comissao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingVendedor) {
      setVendedores(vendedores.map(v => 
        v.id === editingVendedor.id 
          ? { ...v, ...formData, comissao: parseFloat(formData.comissao) }
          : v
      ));
      toast.success("Vendedor atualizado com sucesso!");
    } else {
      const newVendedor: Vendedor = {
        id: Math.max(...vendedores.map(v => v.id)) + 1,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        comissao: parseFloat(formData.comissao),
        vendasMes: 0,
        status: "ativo",
      };
      setVendedores([...vendedores, newVendedor]);
      toast.success("Vendedor cadastrado com sucesso!");
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: number) => {
    setVendedores(vendedores.map(v => 
      v.id === id ? { ...v, status: v.status === "ativo" ? "inativo" : "ativo" } : v
    ));
  };

  const deleteVendedor = (id: number) => {
    setVendedores(vendedores.filter(v => v.id !== id));
    toast.success("Vendedor removido");
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-lg mt-1">
            Gerencie vendedores, comissões e parâmetros do sistema
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vendedores Card - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5">
                      <UserPlus className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Vendedores</CardTitle>
                      <CardDescription>
                        Gerencie vendedores e suas comissões
                      </CardDescription>
                    </div>
                  </div>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={openAddModal}
                        className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25 gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Novo Vendedor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingVendedor ? "Editar Vendedor" : "Novo Vendedor"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingVendedor 
                            ? "Atualize os dados e a comissão do vendedor"
                            : "Cadastre um novo vendedor com sua porcentagem de comissão"
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            placeholder="Nome completo"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            placeholder="(11) 99999-9999"
                            value={formData.telefone}
                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
                            placeholder="Ex: 5"
                            value={formData.comissao}
                            onChange={(e) => setFormData({ ...formData, comissao: e.target.value })}
                            className="text-lg font-semibold"
                          />
                          <p className="text-xs text-muted-foreground">
                            Porcentagem sobre cada venda realizada
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary/80">
                          {editingVendedor ? "Salvar Alterações" : "Cadastrar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-border/50"
                >
                  <AnimatePresence mode="popLayout">
                    {vendedores.map((vendedor) => (
                      <motion.div
                        key={vendedor.id}
                        variants={itemVariants}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group flex items-center justify-between px-6 py-5 hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-2xl",
                              vendedor.status === "ativo" 
                                ? "bg-gradient-to-br from-primary/20 to-primary/5"
                                : "bg-muted"
                            )}
                            whileHover={{ scale: 1.1 }}
                          >
                            <span className={cn(
                              "text-sm font-bold",
                              vendedor.status === "ativo" ? "text-primary" : "text-muted-foreground"
                            )}>
                              {vendedor.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </span>
                          </motion.div>
                          <div>
                            <p className="font-semibold group-hover:text-primary transition-colors">
                              {vendedor.nome}
                            </p>
                            <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                          </div>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-success">
                              <Percent className="h-4 w-4" />
                              <span className="text-xl font-bold">{vendedor.comissao}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Comissão</p>
                          </div>
                          <div className="text-center">
                            <span className="text-xl font-bold">{vendedor.vendasMes}</span>
                            <p className="text-xs text-muted-foreground">Vendas/mês</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border font-medium",
                              vendedor.status === "ativo" 
                                ? "bg-success/15 text-success border-success/30" 
                                : "bg-muted text-muted-foreground border-muted-foreground/30"
                            )}
                          >
                            {vendedor.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                          <Switch
                            checked={vendedor.status === "ativo"}
                            onCheckedChange={() => toggleStatus(vendedor.id)}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditModal(vendedor)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteVendedor(vendedor.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-success/20 to-success/5">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Parâmetros Financeiros</CardTitle>
                    <CardDescription>
                      Configure valores e taxas padrão
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taxa-admin">Taxa Administrativa (%)</Label>
                  <Input id="taxa-admin" type="number" defaultValue="5" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dias-carencia">Dias de Carência</Label>
                  <Input id="dias-carencia" type="number" defaultValue="30" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="multa-atraso">Multa por Atraso (%)</Label>
                  <Input id="multa-atraso" type="number" defaultValue="2" className="bg-background/50" />
                </div>
                <Button className="w-full bg-gradient-to-r from-success to-success/80">
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-warning/20 to-warning/5">
                    <Bell className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notificações</CardTitle>
                    <CardDescription>
                      Configure alertas e lembretes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembrete de vencimento</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar 5 dias antes do vencimento
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alerta de inadimplência</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar após 3 dias de atraso
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Resumo diário</p>
                    <p className="text-sm text-muted-foreground">
                      Receber resumo por e-mail
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Usuários do Sistema</CardTitle>
                      <CardDescription>
                        Gerencie os usuários administrativos
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {usuarios.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium text-primary">
                            {user.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.nome}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={papelConfig[user.papel as keyof typeof papelConfig]}
                        >
                          {user.papel}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Configuracoes;
