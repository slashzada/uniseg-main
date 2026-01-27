import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { financeiroAPI } from "@/lib/api";

interface Payment {
  id: string;
  beneficiario: string;
  plano: string;
  valor: number;
  vencimento: string;
  status: "pago" | "pendente" | "vencido";
}

const statusConfig = {
  pago: {
    label: "Pago",
    className: "bg-success/15 text-success border-success/30",
  },
  pendente: {
    label: "Pendente",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  vencido: {
    label: "Vencido",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

export function RecentPayments() {
  const navigate = useNavigate();
  
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["recentPayments"],
    queryFn: () => financeiroAPI.getAll(),
    select: (data) => data.slice(0, 4), // Only show the 4 most recent payments
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="h-full"
    >
      <Card className="border-0 shadow-xl shadow-foreground/5 bg-card/80 backdrop-blur-sm h-full flex flex-col overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-warning to-destructive" />
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">
                Pagamentos Recentes
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Últimas movimentações
              </p>
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>+12%</span> {/* Mocked trend */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {payments?.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="group flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-medium group-hover:text-primary transition-colors truncate">
                      {payment.beneficiario}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {payment.plano}
                    </p>
                  </div>
                  <div className="text-right space-y-1.5 ml-4">
                    <p className="font-bold font-tabular text-foreground">
                      R$ {payment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold border",
                        statusConfig[payment.status].className
                      )}
                    >
                      {statusConfig[payment.status].label}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t border-border/50 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-between text-muted-foreground hover:text-primary group"
            onClick={() => navigate("/financeiro")}
          >
            Ver todos os pagamentos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}