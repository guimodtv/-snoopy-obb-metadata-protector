import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Link, ArrowRight } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const loginMutation = trpc.auth.loginWithEmail.useMutation();
  const registerMutation = trpc.auth.registerWithEmail.useMutation();

  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoginLoading(true);
    try {
      await loginMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword,
      });
      toast.success("Login realizado com sucesso!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !registerName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setRegisterLoading(true);
    try {
      await registerMutation.mutateAsync({
        email: registerEmail,
        password: registerPassword,
        name: registerName,
        referralCode: referralCode || undefined,
      });
      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      setTab("login");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterName("");
      setReferralCode("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Link className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">LinkCash</h1>
          </div>
          <p className="text-muted-foreground">
            Encurte links e ganhe dinheiro com cada clique
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 md:p-8">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loginLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loginLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginLoading}
                >
                  {loginLoading ? "Entrando..." : "Entrar"}
                  {!loginLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={registerLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={registerLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Senha</label>
                  <Input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={registerLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deve conter maiúsculas, minúsculas e números
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Código de Indicação (opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Se foi indicado por alguém"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    disabled={registerLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerLoading}
                >
                  {registerLoading ? "Cadastrando..." : "Cadastrar"}
                  {!registerLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Ao continuar, você concorda com nossos Termos de Serviço
        </p>
      </div>
    </div>
  );
}
