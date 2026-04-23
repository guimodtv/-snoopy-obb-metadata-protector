import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  Link,
  MousePointerClick,
  DollarSign,
  Settings,
  LogOut,
  Check,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminPanel() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalNotes, setWithdrawalNotes] = useState("");

  // Settings state
  const [cpm, setCpm] = useState("0.50");
  const [referralCommission, setReferralCommission] = useState("30");
  const [minimumWithdrawal, setMinimumWithdrawal] = useState("10");

  // Queries
  const settingsQuery = trpc.admin.settings.get.useQuery();
  const usersQuery = trpc.admin.users.list.useQuery({ limit: 100 });
  const linksQuery = trpc.admin.links.list.useQuery({ limit: 100 });
  const clicksQuery = trpc.admin.clicks.list.useQuery({ limit: 100 });
  const withdrawalsQuery = trpc.admin.withdrawals.list.useQuery();
  const statsQuery = trpc.admin.users.getStats.useQuery();

  // Mutations
  const updateSettingsMutation = trpc.admin.settings.update.useMutation();
  const approveWithdrawalMutation = trpc.admin.withdrawals.approve.useMutation();
  const rejectWithdrawalMutation = trpc.admin.withdrawals.reject.useMutation();

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const handleUpdateSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        cpm: parseFloat(cpm),
        referralCommissionPercentage: parseFloat(referralCommission),
        minimumWithdrawal: parseFloat(minimumWithdrawal),
      });
      toast.success("Configurações atualizadas com sucesso!");
      setShowSettingsDialog(false);
      settingsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar configurações");
    }
  };

  const handleApproveWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    try {
      await approveWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal.id,
        notes: withdrawalNotes,
      });
      toast.success("Saque aprovado com sucesso!");
      setShowWithdrawalDialog(false);
      setWithdrawalNotes("");
      withdrawalsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao aprovar saque");
    }
  };

  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal || !withdrawalNotes) {
      toast.error("Adicione um motivo para rejeitar");
      return;
    }

    try {
      await rejectWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal.id,
        notes: withdrawalNotes,
      });
      toast.success("Saque rejeitado com sucesso!");
      setShowWithdrawalDialog(false);
      setWithdrawalNotes("");
      withdrawalsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao rejeitar saque");
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  const stats = statsQuery.data;
  const settings = settingsQuery.data;
  const users = usersQuery.data || [];
  const links = linksQuery.data || [];
  const clicks = clicksQuery.data || [];
  const withdrawals = withdrawalsQuery.data || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Link className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">LinkCash Admin</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="clicks">Cliques</TabsTrigger>
            <TabsTrigger value="withdrawals">Saques</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Links</p>
                    <p className="text-3xl font-bold">{stats?.totalLinks || 0}</p>
                  </div>
                  <Link className="w-8 h-8 text-primary/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Cliques</p>
                    <p className="text-3xl font-bold">{stats?.totalClicks || 0}</p>
                  </div>
                  <MousePointerClick className="w-8 h-8 text-primary/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ganhos Totais</p>
                    <p className="text-3xl font-bold">
                      R$ {parseFloat(stats?.totalEarnings || "0").toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary/20" />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
                <Button onClick={() => setShowSettingsDialog(true)} size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CPM (R$ por 1000 cliques)</p>
                  <p className="text-2xl font-bold">R$ {settings?.cpm || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Comissão de Indicação</p>
                  <p className="text-2xl font-bold">{settings?.referralCommissionPercentage || "0"}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Saque Mínimo</p>
                  <p className="text-2xl font-bold">R$ {settings?.minimumWithdrawal || "0.00"}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Saldo</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Ganhos Totais</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm">{u.name || "-"}</td>
                        <td className="px-6 py-4 text-sm">{u.email}</td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          R$ {parseFloat(u.balance).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          R$ {parseFloat(u.totalEarnings).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(u.createdAt), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Código</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">URL Original</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Cliques</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Ganhos</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Criado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {links.map((l: any) => (
                      <tr key={l.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-primary">/r/{l.shortCode}</td>
                        <td className="px-6 py-4 text-sm truncate max-w-xs">{l.originalUrl}</td>
                        <td className="px-6 py-4 text-sm">{l.validClicks}</td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          R$ {parseFloat(l.earnings).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(l.createdAt), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Clicks Tab */}
          <TabsContent value="clicks">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Link</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">IP</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Válido</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Ganho</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clicks.map((c: any) => (
                      <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono">Link #{c.linkId}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{c.ipAddress}</td>
                        <td className="px-6 py-4 text-sm">
                          {c.isValid ? (
                            <span className="badge badge-success">Válido</span>
                          ) : (
                            <span className="badge badge-error">Inválido</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          R$ {parseFloat(c.earningsGenerated).toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(c.timestamp), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Usuário</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Valor</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Solicitado em</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {withdrawals.map((w: any) => (
                      <tr key={w.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm">Usuário #{w.userId}</td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          R$ {parseFloat(w.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {w.status === "pending" && (
                            <span className="badge badge-warning">Pendente</span>
                          )}
                          {w.status === "paid" && (
                            <span className="badge badge-success">Pago</span>
                          )}
                          {w.status === "rejected" && (
                            <span className="badge badge-error">Rejeitado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(w.requestedAt), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {w.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedWithdrawal(w);
                                setShowWithdrawalDialog(true);
                              }}
                            >
                              Processar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações do Sistema</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CPM (R$ por 1000 cliques)</label>
              <Input
                type="number"
                step="0.01"
                value={cpm}
                onChange={(e) => setCpm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comissão de Indicação (%)</label>
              <Input
                type="number"
                step="0.01"
                value={referralCommission}
                onChange={(e) => setReferralCommission(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Saque Mínimo (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={minimumWithdrawal}
                onChange={(e) => setMinimumWithdrawal(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateSettings}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processar Saque</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Usuário</p>
                <p className="font-semibold">Usuário #{selectedWithdrawal.userId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-semibold text-lg">
                  R$ {parseFloat(selectedWithdrawal.amount).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <Input
                  placeholder="Adicione observações..."
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={handleRejectWithdrawal}
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
                <Button onClick={handleApproveWithdrawal}>
                  <Check className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
