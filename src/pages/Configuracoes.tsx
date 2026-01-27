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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  DollarSign,
  Bell,
  Plus,
  Percent,
  Edit2,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddUserDialog } from "@/components/dialogs/AddUserDialog";
import { EditUserDialog } from "@/components/dialogs/EditUserDialog";
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { vendedoresAPI, usuariosAPI, configuracoesAPI } from "@/lib/api";
import { AddVendedorDialog } from "@/components/dialogs/AddVendedorDialog";
import { EditVendedorDialog } from "@/components/dialogs/EditVendedorDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

interface Vendedor {
  id: string;
  nome: string;
  email: string;
  comissao: number;
  status: "ativo" | "inativo";
  vendasMes?: number; // Mocked for display
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: "Admin" | "Financeiro" | "Vendedor";
}

interface ConfiguracoesGlobais {
  taxa_admin: number;
  dias_carencia: number;
  multa_atraso: number;
}

const papelConfig = {
  Admin: "bg-primary/10 text-primary",
  Financeiro: "bg-success/10 text-success",
  Vendedor: "bg-accent/10 text-accent",
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
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Vendedores State and Hooks
  const [openAddVendedorDialog, setOpenAddVendedorDialog] = useState(false);
  const [openEditVendedorDialog, setOpenEditVendedorDialog] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | undefined>(undefined);
  const [openDeleteVendedorAlert, setOpenDeleteVendedorAlert] = useState(false);
  const [vendedorToDelete, setVendedorToDelete] = useState<Vendedor | null>(null);
  
  // Usuários State and Hooks
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | undefined>(undefined);
  const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  // Financial Config State
  const [financialConfig, setFinancialConfig] = useState<ConfiguracoesGlobais>({
    taxa_admin: 5,
    dias_carencia: 30,
    multa_atraso: 2,
  });

  // Fetch Vendedores
  const { data: vendedores, isLoading: loadingVendedores, refetch: refetchVendedores } = useQuery<Vendedor[]>({
    queryKey: ["vendedores"],
    queryFn: vendedoresAPI.getAll,
    select: (data) => data.map(v => ({
      ...v,
      id: v.id,
      vendasMes: Math.floor(Math.random() * 20), // Mocking sales count
      status: v.status || 'ativo',
    })),
  });

  // Fetch Usuarios
  const { data: usuarios, isLoading: loadingUsuarios, refetch: refetchUsuarios } = useQuery<Usuario[]>({
    queryKey: ["usuarios"],
    queryFn: usuariosAPI.getAll,
    enabled: user?.papel === 'Admin', // Only fetch if user is Admin
  });

  // Fetch Financial Config (Fix for TS2769)
  const configQueryOptions: UseQueryOptions<ConfiguracoesGlobais> = {
    queryKey: ["configuracoesGlobais"],
    queryFn: configuracoesAPI.get,
    onSuccess: (data) => {
      setFinancialConfig({
        taxa_admin: data.taxa_admin || 5,
        dias_carencia: data.dias_carencia || 30,
        multa_atraso: data.multa_atraso || 2,
      });
    },
  };
  
  const { isLoading: loadingConfig } = useQuery(configQueryOptions);

  // Update Financial Config Mutation
  const updateConfigMutation = useMutation({
    mutationFn: configuracoesAPI.update,
    onSuccess: () => {
      toast.success("Parâmetros financeiros salvos com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["configuracoesGlobais"] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar parâmetros financeiros. Verifique se você tem permissão de Admin.");
    },
  });

  const handleSaveFinancialConfig = () => {
    updateConfigMutation.mutate(financialConfig);
  };

  // Vendedores Mutations
  const deleteVendedorMutation = useMutation({
    mutationFn: (id: string) => vendedoresAPI.delete(id),
    onSuccess: () => {
      toast.success(`Vendedor ${vendedorToDelete?.nome} removido com sucesso.`);
      queryClient.invalidateQueries({ queryKey: ["vendedores"] });
      setVendedorToDelete(null);
      setOpenDeleteVendedorAlert(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover vendedor.");
    },
  });

  const toggleStatus = (vendedor: Vendedor) => {
    const newStatus = vendedor.status === "ativo" ? "inativo" : "ativo";
    vendedoresAPI.update(vendedor.id, { status: newStatus })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["vendedores"] });
        toast.success(`Status de ${vendedor.nome} alterado para ${newStatus}.`);
      })
      .catch((error) => {
        toast.error(error.message || "Erro ao alterar status.");
      });
  };

  const handleEditVendedor = (vendedor: Vendedor) => {
    setSelectedVendedor(vendedor);
    setOpenEditVendedorDialog(true);
  };

  const handleDeleteVendedor = (vendedor: Vendedor) => {
    setVendedorToDelete(vendedor);
    setOpenDeleteVendedorAlert(true);
  };

  const confirmDeleteVendedor = () => {
    if (vendedorToDelete) {
      deleteVendedorMutation.mutate(vendedorToDelete.id);
    }
  };
  
  // Usuarios Mutations
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usuariosAPI.delete(id),
    onSuccess: () => {
      toast.success(`Usuário ${userToDelete?.nome} removido com sucesso.`);
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setUserToDelete(null);
      setOpenDeleteUserAlert(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover usuário.");
    },
  });

  const handleEditUser = (user: Usuario) => {
    setSelectedUser(user);
    setOpenEditUserDialog(true);
  };

  const handleDeleteUser = (user: Usuario) => {
    if (user.id === user?.id) {
      toast.error("Você não pode excluir seu próprio usuário.");
      return;
    }
    setUserToDelete(user);
    setOpenDeleteUserAlert(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const vendedoresData = vendedores || [];
  const usuariosData = usuarios || [];
  const isSavingConfig = updateConfigMutation.isPending;

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
                  <Button 
                    onClick={() => setOpenAddVendedorDialog(true)}
                    className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Vendedor
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingVendedores ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Carregando vendedores...</p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-border/50"
                  >
                    <AnimatePresence mode="popLayout">
                      {vendedoresData.map((vendedor) => (
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
                              onCheckedChange={() => toggleStatus(vendedor)}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditVendedor(vendedor)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteVendedor(vendedor)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
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
                {loadingConfig ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-success" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="taxa-admin">Taxa Administrativa (%)</Label>
                      <Input 
                        id="taxa-admin" 
                        type="number" 
                        value={financialConfig.taxa_admin}
                        onChange={(e) => setFinancialConfig({ ...financialConfig, taxa_admin: parseFloat(e.target.value) || 0 })}
                        className="bg-background/50" 
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dias-carencia">Dias de Carência</Label>
                      <Input 
                        id="dias-carencia" 
                        type="number" 
                        value={financialConfig.dias_carencia}
                        onChange={(e) => setFinancialConfig({ ...financialConfig, dias_carencia: parseInt(e.target.value) || 0 })}
                        className="bg-background/50" 
                        step="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="multa-atraso">Multa por Atraso (%)</Label>
                      <Input 
                        id="multa-atraso" 
                        type="number" 
                        value={financialConfig.multa_atraso}
                        onChange={(e) => setFinancialConfig({ ...financialConfig, multa_atraso: parseFloat(e.target.value) || 0 })}
                        className="bg-background/50" 
                        step="0.01"
                      />
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-success to-success/80"
                      onClick={handleSaveFinancialConfig}
                      disabled={isSavingConfig}
                    >
                      {isSavingConfig ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications (Mocked) */}
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
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => setOpenAddUserDialog(true)}
                    disabled={loadingUsuarios}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingUsuarios ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Carregando usuários...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {usuariosData.map((user) => (
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
                            className={papelConfig[user.papel]}
                          >
                            {user.papel}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.id === user?.id} // Prevent deleting self
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AddVendedorDialog 
          open={openAddVendedorDialog} 
          onOpenChange={setOpenAddVendedorDialog}
          onSuccess={refetchVendedores}
        />
        
        {selectedVendedor && (
          <EditVendedorDialog 
            open={openEditVendedorDialog} 
            onOpenChange={setOpenEditVendedorDialog}
            vendedor={selectedVendedor as Vendedor}
            onSuccess={refetchVendedores}
          />
        )}

        {/* Delete Vendedor Confirmation Alert */}
        <AlertDialog open={openDeleteVendedorAlert} onOpenChange={setOpenDeleteVendedorAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o vendedor 
                <span className="font-semibold text-foreground"> {vendedorToDelete?.nome}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteVendedorMutation.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteVendedor}
                disabled={deleteVendedorMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteVendedorMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Excluir Permanentemente"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AddUserDialog 
          open={openAddUserDialog} 
          onOpenChange={setOpenAddUserDialog}
          onSuccess={refetchUsuarios}
        />
        
        {selectedUser && (
          <EditUserDialog 
            open={openEditUserDialog} 
            onOpenChange={setOpenEditUserDialog}
            usuario={selectedUser}
            onSuccess={refetchUsuarios}
          />
        )}
        
        {/* Delete User Confirmation Alert */}
        <AlertDialog open={openDeleteUserAlert} onOpenChange={setOpenDeleteUserAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário 
                <span className="font-semibold text-foreground"> {userToDelete?.nome}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteUser}
                disabled={deleteUserMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteUserMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Excluir Permanentemente"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AppLayout>
  );
};

export default Configuracoes;