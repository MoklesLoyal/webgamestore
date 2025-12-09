"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Loader2, Plus, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

type Company = {
  id: string;
  name: string;
  email: string;
};

type Package = {
  id: string;
  name: string;
  type: string;
  tokensAmount: number;
  price: number;
};

const createTransactionSchema = z.object({
  companyId: z.string().min(1, "L'entreprise est requise"),
  packageId: z.string().optional(),
  type: z.enum(["PURCHASE", "USAGE", "REFUND"]),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]),
  amount: z.number().min(0, "Le montant doit être positif"),
  tokensAmount: z.number().int().min(0, "Le nombre de tokens doit être positif"),
  description: z.string().optional(),
});

type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);

  const createForm = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      companyId: "",
      packageId: "",
      type: "PURCHASE",
      status: "COMPLETED",
      amount: 0,
      tokensAmount: 0,
      description: "",
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load companies and packages
      const [companiesRes, packagesRes] = await Promise.all([
        fetch("/api/companies"),
        fetch("/api/packages"),
      ]);

      if (companiesRes.ok) {
        setCompanies(await companiesRes.json());
      }
      if (packagesRes.ok) {
        setPackages(await packagesRes.json());
      }

      // Get user's company
      const syncResponse = await fetch("/api/auth/sync", {
        method: "POST",
      });

      if (!syncResponse.ok) {
        throw new Error("Failed to sync user");
      }

      const userData = await syncResponse.json();
      
      if (userData.company) {
        setUserCompanyId(userData.company.id);
        
        // Load transactions for user's company
        const transactionsRes = await fetch(`/api/transactions?companyId=${userData.company.id}`);
        if (transactionsRes.ok) {
          setTransactions(await transactionsRes.json());
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage("error", "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreateTransactionInput) {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("success", "Transaction créée avec succès");
        setIsCreateOpen(false);
        createForm.reset();
        loadData();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la création");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la création de la transaction");
    }
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            Gérez les transactions d&apos;achat, d&apos;utilisation et de remboursement
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createForm.handleSubmit(handleCreate)}>
              <DialogHeader>
                <DialogTitle>Créer une transaction</DialogTitle>
                <DialogDescription>
                  Enregistrez une nouvelle transaction
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyId">Entreprise*</Label>
                  <Select
                    onValueChange={(value) => createForm.setValue("companyId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createForm.formState.errors.companyId && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.companyId.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="packageId">Forfait (optionnel)</Label>
                  <Select
                    onValueChange={(value) => {
                      createForm.setValue("packageId", value);
                      const selectedPackage = packages.find(p => p.id === value);
                      if (selectedPackage) {
                        createForm.setValue("tokensAmount", selectedPackage.tokensAmount);
                        createForm.setValue("amount", selectedPackage.price);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un forfait" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - {pkg.tokensAmount} tokens - {pkg.price}$
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Type*</Label>
                  <Select
                    onValueChange={(value) => createForm.setValue("type", value as "PURCHASE" | "USAGE" | "REFUND")}
                    defaultValue="PURCHASE"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Achat</SelectItem>
                      <SelectItem value="USAGE">Utilisation</SelectItem>
                      <SelectItem value="REFUND">Remboursement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tokensAmount">Nombre de tokens*</Label>
                  <Input
                    id="tokensAmount"
                    type="number"
                    {...createForm.register("tokensAmount", { valueAsNumber: true })}
                    placeholder="100"
                  />
                  {createForm.formState.errors.tokensAmount && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.tokensAmount.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount">Montant ($)*</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...createForm.register("amount", { valueAsNumber: true })}
                    placeholder="49.99"
                  />
                  {createForm.formState.errors.amount && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.amount.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...createForm.register("description")}
                    placeholder="Description de la transaction"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des transactions</CardTitle>
          <CardDescription>
            {transactions.length} transaction{transactions.length > 1 ? "s" : ""} enregistrée{transactions.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Forfait</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.company.name}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(transaction.type) as any}>
                        {transaction.type === "PURCHASE" ? "Achat" : transaction.type === "USAGE" ? "Utilisation" : "Remboursement"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.package?.name || "-"}</TableCell>
                    <TableCell>
                      {transaction.type === "USAGE" ? "-" : "+"}{transaction.tokensAmount}
                    </TableCell>
                    <TableCell>{transaction.amount.toFixed(2)}$</TableCell>
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
