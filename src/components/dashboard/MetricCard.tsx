import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
  index?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  index = 0,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      icon: "bg-gradient-to-br from-primary/20 to-primary/5 text-primary",
      glow: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--primary))]",
      border: "group-hover:border-primary/20",
    },
    success: {
      icon: "bg-gradient-to-br from-success/20 to-success/5 text-success",
      glow: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--success))]",
      border: "group-hover:border-success/20",
    },
    warning: {
      icon: "bg-gradient-to-br from-warning/20 to-warning/5 text-warning",
      glow: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--warning))]",
      border: "group-hover:border-warning/20",
    },
    destructive: {
      icon: "bg-gradient-to-br from-destructive/20 to-destructive/5 text-destructive",
      glow: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--destructive))]",
      border: "group-hover:border-destructive/20",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500",
          variantStyles[variant].glow,
          variantStyles[variant].border
        )}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
        </div>

        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <motion.p
                className="text-sm font-medium text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {title}
              </motion.p>
              <motion.p
                className="text-3xl font-bold font-tabular tracking-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              >
                {value}
              </motion.p>
              {subtitle && (
                <motion.p
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {subtitle}
                </motion.p>
              )}
              {trend && (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                      trend.isPositive
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    )}
                  >
                    <motion.span
                      animate={{ y: trend.isPositive ? [0, -2, 0] : [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      {trend.isPositive ? "↑" : "↓"}
                    </motion.span>
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs mês anterior
                  </span>
                </motion.div>
              )}
            </div>
            <motion.div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                variantStyles[variant].icon
              )}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Icon className="h-7 w-7" />
            </motion.div>
          </div>
        </CardContent>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </Card>
    </motion.div>
  );
}
