import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  DollarSign,
  Settings,
  Menu,
  LogOut,
  Shield,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Operadoras", url: "/operadoras", icon: Building2 },
  { title: "Planos", url: "/planos", icon: FileText },
  { title: "Beneficiários", url: "/beneficiarios", icon: Users },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

const papelColors = {
  Admin: "bg-primary/20 text-primary border-primary/30",
  Financeiro: "bg-success/20 text-success border-success/30",
  Vendedor: "bg-accent/20 text-accent border-accent/30",
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitials = user?.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Animated background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] animate-spin-slow" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground lg:relative overflow-hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ transition: "transform 0.3s ease-in-out" }}
      >
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar-primary/10 via-transparent to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative flex h-16 items-center justify-between border-b border-sidebar-border/50 px-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
              <motion.div
                className="absolute inset-0 rounded-xl bg-sidebar-primary"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-bold tracking-tight"
              >
                Uniseguros
              </motion.span>
            )}
          </div>
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <ul className="space-y-1">
            {navItems
              .filter(item => {
                if (user?.papel === "Vendedor") {
                  return !["Financeiro", "Configurações", "Operadoras", "Planos"].includes(item.title) || ["Operadoras", "Planos"].includes(item.title); // Keep Operadoras/Planos visible but restricted actions inside
                  // Simplify: Just exclude Financeiro and Configurações
                  return !["Financeiro", "Configurações"].includes(item.title);
                }
                return true;
              })
              .map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-sidebar-accent/80 hover:translate-x-1",
                      !sidebarOpen && "justify-center px-2"
                    )}
                    activeClassName="bg-sidebar-accent text-sidebar-primary shadow-lg shadow-sidebar-primary/20"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                    {sidebarOpen && <span>{item.title}</span>}
                  </NavLink>
                </motion.li>
              ))}
          </ul>
        </nav>

        {/* Pro badge */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <div className="relative flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-sidebar-primary" />
              <span className="text-xs font-semibold text-sidebar-primary">PRO</span>
            </div>
            <p className="relative text-xs text-sidebar-foreground/70">
              Sistema completo de gestão
            </p>
          </motion.div>
        )}

        {/* Expand button when collapsed */}
        {!sidebarOpen && (
          <div className="hidden lg:block border-t border-sidebar-border/50 p-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-card/80 backdrop-blur-xl px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          {/* User area */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex items-center gap-3 px-3 py-2 h-auto hover:bg-muted/50 rounded-xl"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{user?.nome}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0 border",
                      user?.papel && papelColors[user.papel]
                    )}
                  >
                    {user?.papel}
                  </Badge>
                </div>
                <motion.div
                  className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-xs font-bold text-primary-foreground">
                    {userInitials}
                  </span>
                  <div className="absolute inset-0 rounded-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.nome}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
