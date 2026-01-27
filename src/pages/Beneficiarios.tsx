import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, User, TrendingUp, TrendingDown, UserCheck, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddBeneficiarioDialog } from "@/components/dialogs/AddBeneficiarioDialog";

const vendedores = [
  { id: 1, nome: "João Vendedor", comissao: 5 },
  { id: 2, nome: "Maria Sales", comissao: 7.5 },
  { id: 3, nome: "Carlos Souza", comissao: 4 },
];

const beneficiarios = [
  { id: 1, nome: "Maria Silva", cpf: "123.456.789-00", plano: "Premium Familiar", operadora: "Bradesco Saúde", status: "ativo", desde: "Jan 2024", vendedorId: 2, valorPlano: 850 },
  { id: 2, nome: "João Santos", cpf: "234.567.890-11", plano: "Individual Plus", operadora: "Unimed", status: "ativo", desde: "Mar 2024", vendedorId: 1, valorPlano: 450 },
  { id: 3, nome: "Ana Costa", cpf: "345.678.901-22", plano: "Empresarial PME", operadora: "SulAmérica", status: "inadimplente", desde: "Jun 2023", vendedorId: 2, valorPlano: 1200 },
  { id: 4, nome: "Carlos Lima", cpf: "456.789.012-33", plano: "Individual Básico", operadora: "Unimed", status: "ativo", desde: "Set 2024", vendedorId: 3, valorPlano: 320 },
  { id: 5, nome: "Paula Mendes", cpf: "567.890.123-44", plano: "Premium Individual", operadora: "Amil", status: "ativo", desde: "Nov 2024", vendedorId: 1, valorPlano: 680 },
  { id: 6, nome: "Roberto Alves", cpf: "678.901.234-55", plano: "Individual Plus", operadora: "Unimed", status: "inativo", desde: "Fev 2023", vendedorId: 3, valorPlano: 450 },
];

const statusConfig = {
  ativo: { label: "Ativo", className: "bg-success/15 text-success border-success/30" },
  inadimplente: { label: "Inadimplente", className: "bg-destructive/15 text-destructive border-destructive/30" },
  inativo: { label: "Inativo", className: "bg-muted text-muted-foreground border-muted-foreground/30" },
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

const Beneficiarios = () => {
  const [filtro, setFiltro] = useState("todos");
  const [filtroVendedor, setFiltroVendedor] = useState("todos");
  const [busca, setBusca] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const getVendedor = (vendedorId: number) => vendedores.find(v => v.id === vendedorId);

  const beneficiariosFiltrados = beneficiarios.filter((ben) => {
    const matchStatus = filtro === "todos" || ben.status === filtro;
    const matchVendedor = filtroVendedor === "todos" || ben.vendedorId.toString() === filtroVendedor;
    const matchBusca = ben.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       ben.cpf.includes(busca);
    return matchStatus && matchBusca && matchVendedor;
  });

  const stats = {
    ativos: beneficiarios.filter(b => b.status === "ativo").length,
    inadimplentes: beneficiarios.filter(b => b.status === "inadimplente").length,
    inativos: beneficiarios.filter(b => b.status === "inativo").length,
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
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Beneficiários
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Gerencie os beneficiários dos planos
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => setOpenDialog(true)}
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25 gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Venda
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: "Ativos", value: stats.ativos, icon: UserCheck, color: "success", trend: "+12" },
            { label: "Inadimplentes", value: stats.inadimplentes, icon: TrendingDown, color: "destructive", trend: "-3" },
            { label: "Inativos", value: stats.inativos, icon: Users, color: "muted", trend: "0" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <span className={cn(
                          "text-xs font-semibold px-1.5 py-0.5 rounded",
                          stat.color === "success" && "bg-success/15 text-success",
                          stat.color === "destructive" && "bg-destructive/15 text-destructive",
                          stat.color === "muted" && "bg-muted text-muted-foreground",
                        )}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      stat.color === "success" && "bg-success/10 text-success",
                      stat.color === "destructive" && "bg-destructive/10 text-destructive",
                      stat.color === "muted" && "bg-muted text-muted-foreground",
                    )}>
                      <stat.icon className="h-7 w-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou CPF..."
                    className="pl-11 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
                    <SelectTrigger className="w-48 h-10 bg-background/50">
                      <SelectValue placeholder="Filtrar por vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os vendedores</SelectItem>
                      {vendedores.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {[
                    { key: "todos", label: "Todos" },
                    { key: "ativo", label: "Ativos" },
                    { key: "inadimplente", label: "Inadimplentes" },
                    { key: "inativo", label: "Inativos" },
                  ].map((f) => (
                    <Button
                      key={f.key}
                      variant={filtro === f.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltro(f.key)}
                      className={cn(
                        "transition-all",
                        filtro === f.key && "shadow-lg shadow-primary/25"
                      )}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">
                Lista de Beneficiários
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({beneficiariosFiltrados.length} registros)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-border/50"
              >
                <AnimatePresence mode="popLayout">
                  {beneficiariosFiltrados.map((ben) => {
                    const vendedor = getVendedor(ben.vendedorId);
                    const comissaoValor = vendedor ? (ben.valorPlano * vendedor.comissao / 100) : 0;
                    
                    return (
                      <motion.div
                        key={ben.id}
                        variants={itemVariants}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group flex items-center justify-between px-6 py-5 hover:bg-muted/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
                            whileHover={{ scale: 1.1 }}
                          >
                            <User className="h-6 w-6 text-primary" />
                          </motion.div>
                          <div>
                            <p className="font-semibold group-hover:text-primary transition-colors">{ben.nome}</p>
                            <p className="text-sm text-muted-foreground">{ben.cpf}</p>
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-medium">{ben.plano}</p>
                          <p className="text-sm text-muted-foreground">{ben.operadora}</p>
                        </div>
                        
                        {/* Vendedor Info */}
                        <div className="hidden lg:flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
                              <span className="text-[10px] font-bold text-accent">
                                {vendedor?.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </span>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-medium text-foreground">{vendedor?.nome}</p>
                              <div className="flex items-center gap-1 text-accent">
                                <Percent className="h-3 w-3" />
                                <span className="text-[10px] font-semibold">{vendedor?.comissao}%</span>
                                <span className="text-[10px] text-muted-foreground">
                                  (R$ {comissaoValor.toFixed(2)})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground hidden md:block">
                            Desde {ben.desde}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border font-medium",
                              statusConfig[ben.status as keyof typeof statusConfig].className
                            )}
                          >
                            {statusConfig[ben.status as keyof typeof statusConfig].label}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {beneficiariosFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Nenhum beneficiário encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </motion.div>
        )}

        <AddBeneficiarioDialog 
          open={openDialog} 
          onOpenChange={setOpenDialog}
        />
      </motion.div>
    </AppLayout>
  );
};

export default Beneficiarios;
