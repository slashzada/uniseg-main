import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Loader2, HandCoins } from "lucide-react"; // Added HandCoins
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
  minhaComissao?: number; // New field for Vendedor
  trends: {
    beneficiarios: { value: number; isPositive: boolean };
    receita: { value: number; isPositive: boolean };
    adimplencia: { value: number; isPositive: boolean };
  };
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
    refetchInterval: 30000, // Refetch every 30 seconds
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

  const formatCurrencyWithDecimals = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

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
              {user?.papel === "Vendedor" && (
                <motion.div variants={itemVariants}>
                  <MetricCard
                    title="Minha Comissão"
                    value={formatCurrencyWithDecimals(stats?.minhaComissao || 0)}
                    subtitle="Comissões a receber de pagamentos confirmados"
                    icon={HandCoins}
                    variant="accent"
                  />
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="Beneficiários Ativos"
                  value={stats?.beneficiariosAtivos.toLocaleString("pt-BR") || "0"}
                  subtitle={`Total: ${stats?.totalBeneficiarios.toLocaleString("pt-BR") || "0"}`}
                  icon={Users}
                  trend={stats?.trends?.beneficiarios}
                  variant="default"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="Receita Mensal"
                  value={formatCurrency(stats?.receitaMensal || 0)}
                  subtitle="Soma dos pagamentos pagos no mês"
                  icon={DollarSign}
                  trend={stats?.trends?.receita}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="Taxa de Adimplência"
                  value={formatPercent(stats?.taxaAdimplencia || 0)}
                  subtitle="Pagamentos pagos / Total"
                  icon={TrendingUp}
                  trend={stats?.trends?.adimplencia}
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