import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Users } from "lucide-react";
import { toast } from "sonner";

export default function Referrals() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  const referralCode = user?.referralCode || "";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
  const referralCommission = parseFloat(user?.referralCommissionEarned?.toString() || "0");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Código de referência copiado!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link de referência copiado!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="ml-4 text-xl font-bold">Indicações</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Commission Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ganhos com Indicações</p>
              <p className="text-4xl font-bold">R$ {referralCommission.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Você recebe 30% dos ganhos de cada pessoa que você indicar
              </p>
            </div>
            <Users className="w-12 h-12 text-primary/20" />
          </div>
        </Card>

        {/* Referral Code Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Seu Código de Referência</h2>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-3">
              Compartilhe este código com seus amigos para ganhar comissões
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={referralCode}
                readOnly
                className="font-mono"
              />
              <Button onClick={handleCopyCode} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Referral Link Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Link de Indicação</h2>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-3">
              Compartilhe este link para que seus amigos se cadastrem automaticamente com sua indicação
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={referralLink}
                readOnly
                className="text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">1</div>
              <h3 className="font-semibold mb-2">Compartilhe</h3>
              <p className="text-sm text-muted-foreground">
                Compartilhe seu código ou link de indicação com amigos
              </p>
            </Card>

            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">2</div>
              <h3 className="font-semibold mb-2">Eles se Cadastram</h3>
              <p className="text-sm text-muted-foreground">
                Seus amigos usam seu código ao se cadastrar
              </p>
            </Card>

            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <h3 className="font-semibold mb-2">Você Ganha</h3>
              <p className="text-sm text-muted-foreground">
                Receba 30% dos ganhos deles automaticamente
              </p>
            </Card>
          </div>
        </div>

        {/* Tips */}
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold mb-2">💡 Dicas para Aumentar Ganhos</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Compartilhe seu link em redes sociais</li>
            <li>• Convide amigos que gostam de ganhar dinheiro online</li>
            <li>• Quanto mais pessoas indicadas, mais você ganha</li>
            <li>• Não há limite de indicações!</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
