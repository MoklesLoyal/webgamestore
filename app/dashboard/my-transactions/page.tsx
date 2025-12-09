"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Loader2, Search } from "lucide-react";

type Transaction = {
  id: string;
  companyId: string;
  packageId?: string | null;
  type: "PURCHASE" | "USAGE" | "REFUND";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  amount: number;
  tokensAmount: number;
  description?: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    email: string;
  };
  package?: {
    id: string;
    name: string;
    type: string;
  } | null;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        // Get user's company
        const syncResponse = await fetch("/api/auth/sync", {
          method: "POST",
        });

        if (!mounted) return;

        if (!syncResponse.ok) {
          throw new Error("Failed to sync user");
        }

        const userData = await syncResponse.json();
        
        if (!mounted) return;
        
        if (userData.company) {
          setUserCompanyId(userData.company.id);
          
          // Load transactions for user's company
          const transactionsRes = await fetch(`/api/transactions?companyId=${userData.company.id}`);
          if (transactionsRes.ok && mounted) {
            setTransactions(await transactionsRes.json());
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      case "CANCELLED":
        return "outline";
      default:
        return "secondary";
    }
  }

  function getTypeBadgeVariant(type: string) {
    switch (type) {
      case "PURCHASE":
        return "default";
      case "USAGE":
        return "secondary";
      case "REFUND":
        return "outline";
      default:
        return "secondary";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!userCompanyId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mes Transactions</h2>
          <p className="text-muted-foreground">
            Historique de vos achats et utilisations de tokens
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Vous n&apos;êtes pas encore associé à une entreprise. Contactez un administrateur pour commencer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(transaction => 
    transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (transaction.package?.name && transaction.package.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mes Transactions</h2>
        <p className="text-muted-foreground">
          Historique de vos achats et utilisations de tokens
        </p>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher par ID, forfait, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? "s" : ""} trouvée{filteredTransactions.length > 1 ? "s" : ""}
            {searchQuery && ` (sur ${transactions.length} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Forfait</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {searchQuery ? "Aucune transaction ne correspond à votre recherche" : "Aucune transaction trouvée"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {transaction.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(transaction.type) as any}>
                        {transaction.type === "PURCHASE" ? "Achat" : transaction.type === "USAGE" ? "Utilisation" : "Remboursement"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.package?.name || transaction.description || "-"}</TableCell>
                    <TableCell>
                      {transaction.type === "USAGE" ? "-" : "+"}{transaction.tokensAmount}
                    </TableCell>
                    <TableCell>{transaction.amount.toFixed(2)} $</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(transaction.status) as any}>
                        {transaction.status === "COMPLETED" ? "Complété" : 
                         transaction.status === "PENDING" ? "En attente" :
                         transaction.status === "FAILED" ? "Échoué" : "Annulé"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
