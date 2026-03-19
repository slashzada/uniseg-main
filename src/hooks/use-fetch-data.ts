import { useQuery } from "@tanstack/react-query";
import { operadorasAPI, planosAPI, vendedoresAPI } from "@/lib/api";

// Define basic types for fetched data
interface Operadora {
  id: string;
  nome: string;
}

interface Plano {
  id: string;
  nome: string;
  operadora_id: string;
}

interface Vendedor {
  id: string;
  nome: string;
}

export const useOperadoras = () => {
  return useQuery<Operadora[]>({
    queryKey: ["operadoras"],
    queryFn: () => operadorasAPI.getAll(),
  });
};

export const usePlanos = (operadoraId?: string) => {
  return useQuery<Plano[]>({
    queryKey: ["planos", operadoraId],
    queryFn: () => planosAPI.getAll({ operadora_id: operadoraId }),
  });
};

export const useVendedores = () => {
  return useQuery<Vendedor[]>({
    queryKey: ["vendedores"],
    queryFn: () => vendedoresAPI.getAll(),
  });
};