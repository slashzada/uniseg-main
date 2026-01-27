import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface RevenueData {
  meses: string[];
  receitas: number[];
}

export function RevenueChart() {
  const { data, isLoading } = useQuery<RevenueData>({
    queryKey: ["dashboardRevenue"],
    queryFn: dashboardAPI.getRevenue,
    initialData: { meses: [], receitas: [] },
  });

  // Combine meses and receitas into a format suitable for Recharts
  const chartData = data.meses.map((month, index) => ({
    month,
    receita: data.receitas[index] || 0,
    // Mocking despesas for visualization, as the backend only returns revenue
    despesas: (data.receitas[index] || 0) * 0.6, 
  }));

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-success/5 to-transparent pointer-events-none" />
        
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">
                Receita vs Despesas
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Análise dos últimos 6 meses
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Despesas (Estimado)</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8} barCategoryGap="20%">
                <defs>
                  <linearGradient id="receita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="despesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                  dx={-8}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 20px 40px -10px rgb(0 0 0 / 0.2)",
                    padding: "12px 16px",
                  }}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString("pt-BR")}`,
                    name === "receita" ? "Receita" : "Despesas",
                  ]}
                  labelStyle={{ fontWeight: 600, marginBottom: 8 }}
                />
                <Bar
                  dataKey="receita"
                  name="receita"
                  fill="url(#receita)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="despesas"
                  name="despesas"
                  fill="url(#despesas)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}