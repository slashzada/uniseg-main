import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";

interface User {
  id: string;
  nome: string;
  email: string;
  papel: "Admin" | "Financeiro" | "Vendedor";
  vendedor_id?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário e token salvos no localStorage
    const savedUser = localStorage.getItem("uniseguros_user");
    const savedToken = localStorage.getItem("uniseguros_token");
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Validar token verificando o usuário atual
        authAPI.getCurrentUser().catch(() => {
          // Token inválido, limpar dados
          authAPI.logout();
          setUser(null);
        });
      } catch (error) {
        authAPI.logout();
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const data = await authAPI.login(email, senha);
      setUser(data.user);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
