import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/lib/api";

interface DashboardStats {
  beneficiariosAtivos: number;
  totalBeneficiarios: number;
  receitaMensal: number;
  taxaAdimplencia: number;
  pagamentosVencidos: number;
  totalVencido: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: dashboardAPI.getStats,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Mocking trend data as backend doesn't provide comparison data
  const mockTrend = (isPositive: boolean) => ({ value: 8.2, isPositive });

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{today}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            {getGreeting()},{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {user?.nome.split(" ")[0]}
            </span>
            ! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Aqui está o resumo do seu negócio hoje
          </p>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div key={index} variants={itemVariants} className="h-40 bg-card/80 rounded-2xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
              </motion.div>
            ))
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="Beneficiários Ativos"
                  value={stats?.beneficiariosAtivos.toLocaleString("pt-BR") || "0"}
                  subtitle={`Total: ${stats?.totalBeneficiarios.toLocaleString("pt-BR") || "0"}`}
                  icon={Users}
                  trend={mockTrend(true)}
                  variant="default"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="Receita Mensal"
                  value={formatCurrency(stats?.receitaMensal || 0)}
                  subtitle="Soma dos pagamentos pagos no mês"
                  icon={DollarSign}
                  trend={mockTrend(true)}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="Taxa de Adimplência"
                  value={formatPercent(stats?.taxaAdimplencia || 0)}
                  subtitle="Pagamentos pagos / Total"
                  icon={TrendingUp}
                  trend={mockTrend(true)}
                  variant="default"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="Pagamentos Vencidos"
                  value={stats?.pagamentosVencidos.toLocaleString("pt-BR") || "0"}
                  subtitle={`${formatCurrency(stats?.totalVencido || 0)} em atraso`}
                  icon={AlertTriangle}
                  variant="destructive"
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Charts and Lists */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 xl:grid-cols-3"
        >
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <RecentPayments />
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;