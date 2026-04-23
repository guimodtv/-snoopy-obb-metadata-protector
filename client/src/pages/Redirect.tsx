import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { extractClientIp } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Redirect() {
  const [, params] = useRoute("/r/:shortCode");
  const [, setLocation] = useLocation();
  const [timeLeft, setTimeLeft] = useState(8);
  const [canSkip, setCanSkip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recordClickMutation = trpc.clicks.record.useMutation();

  useEffect(() => {
    const shortCode = params?.shortCode;
    if (!shortCode) {
      setError("Link inválido");
      setIsLoading(false);
      return;
    }

    // Registrar clique
    const recordClick = async () => {
      try {
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;
        
        // Simular obtenção do IP (em produção, isso viria do servidor)
        const ipAddress = "0.0.0.0"; // Placeholder
        
        const result = await recordClickMutation.mutateAsync({
          shortCode,
          userAgent,
          referrer,
          ipAddress,
        });

        if (result.success) {
          setIsLoading(false);
          setError(null);
        } else {
          setError("Erro ao processar clique");
          setIsLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao processar clique");
        setIsLoading(false);
      }
    };

    recordClick();
  }, [params?.shortCode, recordClickMutation]);

  useEffect(() => {
    if (isLoading || error) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Permitir skip apenas após o delay principal
    const skipTimer = setTimeout(() => setCanSkip(true), 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(skipTimer);
    };
  }, [isLoading, error]);

  const handleContinue = () => {
    const shortCode = params?.shortCode;
    if (shortCode) {
      // Redirecionar para a URL original
      window.location.href = `/api/redirect/${shortCode}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Processando seu clique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => setLocation("/")}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-2xl">
        {/* Ad Space */}
        <div className="bg-card border rounded-lg p-8 md:p-12 mb-8 shadow-lg">
          <div className="bg-muted/50 rounded-lg h-64 md:h-80 flex items-center justify-center mb-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-2">Espaço para Anúncio</p>
              <p className="text-muted-foreground text-xs">
                Anúncios aqui geram renda para você
              </p>
            </div>
          </div>

          {/* Timer and Button */}
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Você será redirecionado em:
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{timeLeft}</span>
                </div>
                <span className="text-muted-foreground">segundos</span>
              </div>
            </div>

            {canSkip && (
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full md:w-auto"
              >
                Continuar
              </Button>
            )}

            {!canSkip && (
              <Button
                disabled
                size="lg"
                className="w-full md:w-auto"
                variant="outline"
              >
                Aguarde {timeLeft} segundos...
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Você está sendo redirecionado para o link original. Obrigado por usar LinkCash!
        </p>
      </div>
    </div>
  );
}
