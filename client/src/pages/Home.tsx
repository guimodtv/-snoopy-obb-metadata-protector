import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Auth from "./Auth";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Se está autenticado, redireciona para dashboard
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  // Se não está autenticado, mostra a página de Auth
  if (!loading && !isAuthenticated) {
    return <Auth />;
  }

  // Enquanto está carregando, mostra tela em branco
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
