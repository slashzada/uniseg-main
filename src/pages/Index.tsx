import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { Users, DollarSign, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
          <MetricCard
            title="Beneficiários Ativos"
            value="1.248"
            subtitle="32 novos este mês"
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
            index={0}
          />
          <MetricCard
            title="Receita Mensal"
            value="R$ 67.450"
            subtitle="Janeiro 2026"
            icon={DollarSign}
            trend={{ value: 8.2, isPositive: true }}
            variant="success"
            index={1}
          />
          <MetricCard
            title="Taxa de Adimplência"
            value="94.3%"
            subtitle="Meta: 95%"
            icon={TrendingUp}
            trend={{ value: 2.1, isPositive: true }}
            index={2}
          />
          <MetricCard
            title="Pagamentos Vencidos"
            value="23"
            subtitle="R$ 12.580 em atraso"
            icon={AlertTriangle}
            variant="destructive"
            index={3}
          />
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
