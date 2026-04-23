import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Link,
  Copy,
  Trash2,
  Plus,
  BarChart3,
  Wallet,
  LogOut,
  Settings,
  DollarSign,
  MousePointerClick,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const linksQuery = trpc.links.list.useQuery();
  const createLinkMutation = trpc.links.create.useMutation();
  const deleteLinkMutation = trpc.links.delete.useMutation();

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) {
      toast.error("Digite uma URL válida");
      return;
    }

    setIsCreating(true);
    try {
      await createLinkMutation.mutateAsync({
        originalUrl: newUrl,
        title: newTitle,
      });
      toast.success("Link criado com sucesso!");
      setNewUrl("");
      setNewTitle("");
      setShowCreateDialog(false);
      linksQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar link");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLink = async (shortCode: string) => {
    if (!confirm("Tem certeza que deseja deletar este link?")) return;

    try {
      await deleteLinkMutation.mutateAsync({ shortCode });
      toast.success("Link deletado com sucesso!");
      linksQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar link");
    }
  };

  const handleCopyLink = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  const links = linksQuery.data || [];
  const totalClicks = links.reduce((sum, link) => sum + link.validClicks, 0);
  const totalEarnings = links.reduce(
    (sum, link) => sum + parseFloat(link.earnings.toString()),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Link className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">LinkCash</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user?.name || user?.email}
            </span>
            {user?.role === "admin" && (
              <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")}>
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLocation("/withdrawals")}>
              <DollarSign className="w-4 h-4 mr-2" />
              Saques
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/referrals")}>
              <Users className="w-4 h-4 mr-2" />
              Indicações
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Links Criados</p>
                <p className="text-3xl font-bold">{links.length}</p>
              </div>
              <Link className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cliques Válidos</p>
                <p className="text-3xl font-bold">{totalClicks}</p>
              </div>
              <MousePointerClick className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ganhos</p>
                <p className="text-3xl font-bold">R$ {totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                <p className="text-3xl font-bold">R$ {(user?.balance || 0).toFixed(2)}</p>
              </div>
              <Wallet className="w-8 h-8 text-primary/20" />
            </div>
          </Card>
        </div>

        {/* Create Link Section */}
        <div className="mb-8">
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Link
          </Button>
        </div>

        {/* Links Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">URL Original</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Link Curto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Cliques</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Ganhos</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Criado em</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {links.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhum link criado ainda. Crie seu primeiro link para começar a ganhar!
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr key={link.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm truncate max-w-xs">
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {link.originalUrl}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        <span className="text-primary">/r/{link.shortCode}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{link.validClicks}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        R$ {parseFloat(link.earnings.toString()).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(link.createdAt), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(link.shortCode)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link.shortCode)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Create Link Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Link Encurtado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">URL Original</label>
              <Input
                type="url"
                placeholder="https://exemplo.com/pagina-muito-longa"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Título (opcional)</label>
              <Input
                type="text"
                placeholder="Meu Link Especial"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Criando..." : "Criar Link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
