"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Building2, Coins, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompanySchema, updateCompanySchema } from "@/lib/validations";
import { z } from "zod";

type Company = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  tokenBalance: number;
  createdAt: string;
  users: any[];
  _count?: { transactions: number };
};

type CreateCompanyInput = z.infer<typeof createCompanySchema>;
type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [tokenReason, setTokenReason] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const createForm = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const editForm = useForm<UpdateCompanyInput>({
    resolver: zodResolver(updateCompanySchema),
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      editForm.reset({
        name: selectedCompany.name,
        email: selectedCompany.email,
        phone: selectedCompany.phone || "",
        address: selectedCompany.address || "",
      });
    }
  }, [selectedCompany, editForm]);

  async function loadCompanies() {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
      showMessage("error", "Erreur lors du chargement des entreprises");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreateCompanyInput) {
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("success", "Entreprise créée avec succès");
        setIsCreateOpen(false);
        createForm.reset();
        loadCompanies();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la création");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la création de l'entreprise");
    }
  }

  async function handleUpdate(data: UpdateCompanyInput) {
    if (!selectedCompany) return;

    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("success", "Entreprise mise à jour avec succès");
        setIsEditOpen(false);
        setSelectedCompany(null);
        loadCompanies();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la mise à jour de l'entreprise");
    }
  }

  async function handleDelete(company: Company) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${company.name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showMessage("success", "Entreprise supprimée avec succès");
        loadCompanies();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la suppression de l'entreprise");
    }
  }

  async function handleAddTokens() {
    if (!selectedCompany || tokenAmount === 0) {
      showMessage("error", "Veuillez entrer un montant valide");
      return;
    }

    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: tokenAmount,
          reason: tokenReason || "Ajout manuel par administrateur",
        }),
      });

      if (response.ok) {
        showMessage(
          "success",
          `${tokenAmount > 0 ? 'Ajout' : 'Retrait'} de ${Math.abs(tokenAmount)} tokens effectué avec succès`
        );
        setIsTokenDialogOpen(false);
        setTokenAmount(0);
        setTokenReason("");
        setSelectedCompany(null);
        loadCompanies();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la modification des tokens");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la modification des tokens");
    }
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Entreprises</h2>
          <p className="text-muted-foreground">
            Gérez les entreprises clientes et leur solde de tokens
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle entreprise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createForm.handleSubmit(handleCreate)}>
              <DialogHeader>
                <DialogTitle>Créer une entreprise</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle entreprise cliente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom*</Label>
                  <Input
                    id="name"
                    {...createForm.register("name")}
                    placeholder="Nom de l'entreprise"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    {...createForm.register("email")}
                    placeholder="contact@entreprise.com"
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    {...createForm.register("phone")}
                    placeholder="(000)123-4567"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    {...createForm.register("address")}
                    placeholder="001 college maisonneuve"
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

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des entreprises</CardTitle>
          <CardDescription>
            {filteredCompanies.length} entreprise{filteredCompanies.length > 1 ? "s" : ""} trouvée{filteredCompanies.length > 1 ? "s" : ""}
            {searchQuery && ` (sur ${companies.length} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Solde</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {searchQuery ? "Aucune entreprise ne correspond à votre recherche" : "Aucune entreprise trouvée"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>{company.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={company.tokenBalance > 0 ? "default" : "secondary"}>
                        {company.tokenBalance} tokens
                      </Badge>
                    </TableCell>
                    <TableCell>{company.users?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setTokenAmount(0);
                            setTokenReason("");
                            setIsTokenDialogOpen(true);
                          }}
                          title="Gérer les tokens"
                        >
                          <Coins className="w-4 h-4 text-yellow-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(company)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={editForm.handleSubmit(handleUpdate)}>
            <DialogHeader>
              <DialogTitle>Modifier l&apos;entreprise</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l&apos;entreprise
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  placeholder="Nom de l'entreprise"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...editForm.register("email")}
                  placeholder="contact@entreprise.com"
                />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  {...editForm.register("phone")}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input
                  id="edit-address"
                  {...editForm.register("address")}
                  placeholder="123 Rue de la Paix, Paris"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Token Management Dialog */}
      <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les tokens</DialogTitle>
            <DialogDescription>
              Ajoutez ou retirez des tokens pour {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Solde actuel:</span>
              <Badge variant="default" className="text-lg">
                {selectedCompany?.tokenBalance || 0} tokens
              </Badge>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="token-amount">
                Montant (utilisez un nombre négatif pour retirer)
              </Label>
              <Input
                id="token-amount"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(parseInt(e.target.value) || 0)}
                placeholder="Ex: 100 ou -50"
              />
              <p className="text-xs text-gray-500">
                Nouveau solde: {(selectedCompany?.tokenBalance || 0) + tokenAmount} tokens
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="token-reason">Raison (optionnel)</Label>
              <Input
                id="token-reason"
                value={tokenReason}
                onChange={(e) => setTokenReason(e.target.value)}
                placeholder="Ex: Bonus de bienvenue, Correction d'erreur..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsTokenDialogOpen(false);
                setTokenAmount(0);
                setTokenReason("");
                setSelectedCompany(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleAddTokens} disabled={tokenAmount === 0}>
              {tokenAmount > 0 ? 'Ajouter' : tokenAmount < 0 ? 'Retirer' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
