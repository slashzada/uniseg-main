import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Users, DollarSign, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddPlanoDialog } from "@/components/dialogs/AddPlanoDialog";

const planos = [
  { id: 1, nome: "Individual Básico", operadora: "Unimed", valor: 320, beneficiarios: 85, tipo: "Individual", popular: false },
  { id: 2, nome: "Individual Plus", operadora: "Unimed", valor: 450, beneficiarios: 120, tipo: "Individual", popular: true },
  { id: 3, nome: "Premium Familiar", operadora: "Bradesco Saúde", valor: 890, beneficiarios: 65, tipo: "Familiar", popular: true },
  { id: 4, nome: "Empresarial PME", operadora: "SulAmérica", valor: 380, beneficiarios: 180, tipo: "Empresarial", popular: false },
  { id: 5, nome: "Premium Individual", operadora: "Amil", valor: 650, beneficiarios: 95, tipo: "Individual", popular: false },
  { id: 6, nome: "Familiar Completo", operadora: "NotreDame", valor: 1200, beneficiarios: 45, tipo: "Familiar", popular: true },
];

const tipoColors = {
  Individual: "from-blue-500 to-indigo-600",
  Familiar: "from-emerald-500 to-teal-600",
  Empresarial: "from-purple-500 to-violet-600",
};

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

const Planos = () => {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const planosFiltrados = planos.filter((plano) => {
    const matchTipo = filtro === "todos" || plano.tipo.toLowerCase() === filtro.toLowerCase();
    const matchBusca = plano.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       plano.operadora.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

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
              Planos
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Gerencie os planos de saúde disponíveis
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => setOpenDialog(true)}
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25 gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Plano
            </Button>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar plano ou operadora..."
                    className="pl-11 h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["todos", "Individual", "Familiar", "Empresarial"].map((f) => (
                    <Button
                      key={f}
                      variant={filtro === f.toLowerCase() || (f === "todos" && filtro === "todos") ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltro(f.toLowerCase())}
                      className={cn(
                        "transition-all",
                        (filtro === f.toLowerCase() || (f === "todos" && filtro === "todos")) && "shadow-lg shadow-primary/25"
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
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {planosFiltrados.map((plano) => (
              <motion.div
                key={plano.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <Card className="group border-0 shadow-lg shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl relative">
                  {/* Popular badge */}
                  {plano.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg"
                      >
                        <Star className="h-3 w-3 fill-current" />
                        Popular
                      </motion.div>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className={cn(
                          "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                          tipoColors[plano.tipo as keyof typeof tipoColors]
                        )}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <FileText className="h-7 w-7" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                          {plano.nome}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{plano.operadora}</p>
                        <Badge
                          variant="outline"
                          className="mt-2 border bg-muted/50"
                        >
                          {plano.tipo}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Price */}
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-3xl font-bold bg-gradient-to-r from-accent to-emerald-500 bg-clip-text text-transparent">
                        R$ {plano.valor}
                      </span>
                      <span className="text-muted-foreground text-sm mb-1">/mês</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-semibold">{plano.beneficiarios}</span>
                          <span className="text-muted-foreground ml-1">beneficiários</span>
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {planosFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Nenhum plano encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </motion.div>
        )}

        <AddPlanoDialog 
          open={openDialog} 
          onOpenChange={setOpenDialog}
        />
      </motion.div>
    </AppLayout>
  );
};

export default Planos;
