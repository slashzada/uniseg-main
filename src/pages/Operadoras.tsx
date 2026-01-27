import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Building2, 
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AddOperadoraDialog } from "@/components/dialogs/AddOperadoraDialog";

const operadoras = [
  { id: 1, nome: "Unimed", status: "ativa", planos: 12, beneficiarios: 450, cor: "from-emerald-500 to-teal-600" },
  { id: 2, nome: "Bradesco Saúde", status: "ativa", planos: 8, beneficiarios: 320, cor: "from-red-500 to-rose-600" },
  { id: 3, nome: "SulAmérica", status: "ativa", planos: 15, beneficiarios: 280, cor: "from-blue-500 to-indigo-600" },
  { id: 4, nome: "Amil", status: "inativa", planos: 6, beneficiarios: 0, cor: "from-purple-500 to-violet-600" },
  { id: 5, nome: "NotreDame Intermédica", status: "ativa", planos: 10, beneficiarios: 198, cor: "from-orange-500 to-amber-600" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

const Operadoras = () => {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const operadorasFiltradas = operadoras.filter((op) => {
    const matchStatus = filtro === "todas" || op.status === (filtro === "ativas" ? "ativa" : "inativa");
    const matchBusca = op.nome.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const stats = {
    total: operadoras.length,
    ativas: operadoras.filter(o => o.status === "ativa").length,
    totalBeneficiarios: operadoras.reduce((acc, o) => acc + o.beneficiarios, 0),
    totalPlanos: operadoras.reduce((acc, o) => acc + o.planos, 0),
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Operadoras
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Gerencie suas operadoras de planos de saúde
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => setOpenDialog(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Operadora
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Operadoras", value: stats.total, icon: Building2, color: "primary" },
            { label: "Operadoras Ativas", value: stats.ativas, icon: TrendingUp, color: "success" },
            { label: "Total Planos", value: stats.totalPlanos, icon: FileText, color: "accent" },
            { label: "Beneficiários", value: stats.totalBeneficiarios, icon: Users, color: "warning" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      stat.color === "primary" && "bg-primary/10 text-primary",
                      stat.color === "success" && "bg-success/10 text-success",
                      stat.color === "accent" && "bg-accent/10 text-accent",
                      stat.color === "warning" && "bg-warning/10 text-warning",
                    )}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar operadora..."
                    className="pl-11 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {["todas", "ativas", "inativas"].map((f) => (
                    <Button
                      key={f}
                      variant={filtro === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltro(f)}
                      className={cn(
                        "capitalize transition-all",
                        filtro === f && "shadow-lg shadow-primary/25"
                      )}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {operadorasFiltradas.map((op, index) => (
              <motion.div
                key={op.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <Card className="group border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl">
                  {/* Colored top bar */}
                  <div className={cn("h-1.5 bg-gradient-to-r", op.cor)} />
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className={cn(
                            "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                            op.cor
                          )}
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.4 }}
                        >
                          <Building2 className="h-7 w-7" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {op.nome}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-1 border font-medium",
                              op.status === "ativa"
                                ? "bg-success/15 text-success border-success/30"
                                : "bg-muted text-muted-foreground border-muted-foreground/30"
                            )}
                          >
                            {op.status === "ativa" ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{op.planos}</p>
                        <p className="text-xs text-muted-foreground font-medium">Planos</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <p className="text-2xl font-bold text-accent">{op.beneficiarios}</p>
                        <p className="text-xs text-muted-foreground font-medium">Beneficiários</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {operadorasFiltradas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Nenhuma operadora encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </motion.div>
        )}

        <AddOperadoraDialog 
          open={openDialog} 
          onOpenChange={setOpenDialog}
        />
      </motion.div>
    </AppLayout>
  );
};

export default Operadoras;
