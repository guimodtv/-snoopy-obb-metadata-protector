import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DollarSign, ArrowLeft, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Withdrawals() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const withdrawalsQuery = trpc.withdrawals.list.useQuery();
  const requestWithdrawalMutation = trpc.withdrawals.request.useMutation();

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount) {
      toast.error("Digite um valor");
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setIsRequesting(true);
    try {
      await requestWithdrawalMutation.mutateAsync({ amount });
      toast.success("Solicitação de saque criada com sucesso!");
      setWithdrawalAmount("");
      setShowRequestDialog(false);
      withdrawalsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao solicitar saque");
    } finally {
      setIsRequesting(false);
    }
  };

  const withdrawals = withdrawalsQuery.data || [];
  const userBalance = parseFloat(user?.balance?.toString() || "0");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-warning">Pendente</span>;
      case "paid":
        return <span className="badge badge-success">Pago</span>;
      case "rejected":
        return <span className="badge badge-error">Rejeitado</span>;
      default:
        return <span className="badge">{status}</span>;
    }
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
          <h1 className="ml-4 text-xl font-bold">Saques</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Balance Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Saldo Disponível</p>
              <p className="text-4xl font-bold">R$ {userBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-primary/20" />
          </div>
        </Card>

        {/* Request Withdrawal Button */}
        <div className="mb-8">
          <Button onClick={() => setShowRequestDialog(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Solicitar Saque
          </Button>
        </div>

        {/* Withdrawals History */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Histórico de Saques</h2>
          {withdrawals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma solicitação de saque ainda. Comece a ganhar e solicite seu primeiro saque!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal: any) => (
                <Card key={withdrawal.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <p className="font-semibold text-lg">
                          R$ {parseFloat(withdrawal.amount).toFixed(2)}
                        </p>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Solicitado{" "}
                        {formatDistanceToNow(new Date(withdrawal.requestedAt), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </p>
                      {withdrawal.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Observações: {withdrawal.notes}
                        </p>
                      )}
                      {withdrawal.processedAt && (
                        <p className="text-sm text-muted-foreground">
                          Processado{" "}
                          {formatDistanceToNow(new Date(withdrawal.processedAt), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Request Withdrawal Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Saque</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestWithdrawal} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Saldo Disponível</p>
              <p className="text-2xl font-bold mb-4">R$ {userBalance.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Valor do Saque (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="10"
                max={userBalance}
                placeholder="Mínimo: R$ 10,00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                disabled={isRequesting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Valor mínimo: R$ 10,00
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
                disabled={isRequesting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isRequesting}>
                {isRequesting ? "Processando..." : "Solicitar Saque"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
