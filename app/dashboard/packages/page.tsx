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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPackageSchema, updatePackageSchema } from "@/lib/validations";
import { z } from "zod";

type Package = {
  id: string;
  name: string;
  description?: string | null;
  type: "PAY_PER_USE" | "PACKAGE";
  tokensAmount: number;
  price: number;
  isActive: boolean;
  features: string[];
  createdAt: string;
  _count?: { transactions: number };
};

type CreatePackageInput = z.infer<typeof createPackageSchema>;
type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const createForm = useForm<CreatePackageInput>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "PACKAGE",
      tokensAmount: 100,
      price: 0,
      features: [],
      isActive: true,
    },
  });

  const editForm = useForm<UpdatePackageInput>({
    resolver: zodResolver(updatePackageSchema),
  });

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      editForm.reset({
        name: selectedPackage.name,
        description: selectedPackage.description || "",
        type: selectedPackage.type,
        tokensAmount: selectedPackage.tokensAmount,
        price: selectedPackage.price,
        features: selectedPackage.features,
        isActive: selectedPackage.isActive,
      });
    }
  }, [selectedPackage, editForm]);

  async function loadPackages() {
    try {
      const response = await fetch("/api/packages");
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error("Error loading packages:", error);
      showMessage("error", "Erreur lors du chargement des forfaits");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreatePackageInput) {
    try {
      const response = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("success", "Forfait créé avec succès");
        setIsCreateOpen(false);
        createForm.reset();
        loadPackages();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la création");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la création du forfait");
    }
  }

  async function handleUpdate(data: UpdatePackageInput) {
    if (!selectedPackage) return;

    try {
      const response = await fetch(`/api/packages/${selectedPackage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("success", "Forfait mis à jour avec succès");
        setIsEditOpen(false);
        setSelectedPackage(null);
        loadPackages();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la mise à jour du forfait");
    }
  }

  async function handleDelete(pkg: Package) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le forfait "${pkg.name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showMessage("success", "Forfait supprimé avec succès");
        loadPackages();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la suppression du forfait");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Forfaits</h2>
          <p className="text-muted-foreground">
            Gérez les forfaits de tokens disponibles à l&apos;achat
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau forfait
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createForm.handleSubmit(handleCreate)}>
              <DialogHeader>
                <DialogTitle>Créer un forfait</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau forfait de tokens
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom*</Label>
                  <Input
                    id="name"
                    {...createForm.register("name")}
                    placeholder="Forfait Starter"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...createForm.register("description")}
                    placeholder="Parfait pour débuter"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type*</Label>
                  <Select 
                    onValueChange={(value) => createForm.setValue("type", value as "PAY_PER_USE" | "PACKAGE")}
                    defaultValue={createForm.getValues("type")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAY_PER_USE">Paiement à l&apos;usage</SelectItem>
                      <SelectItem value="PACKAGE">Forfait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tokensAmount">Nombre de tokens*</Label>
                  <Input
                    id="tokensAmount"
                    type="number"
                    {...createForm.register("tokensAmount", { valueAsNumber: true })}
                    placeholder="1000"
                  />
                  {createForm.formState.errors.tokensAmount && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.tokensAmount.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Prix ($)*</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...createForm.register("price", { valueAsNumber: true })}
                    placeholder="49.99"
                  />
                  {createForm.formState.errors.price && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.price.message}</p>
                  )}
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
          <CardTitle>Liste des forfaits</CardTitle>
          <CardDescription>
            {packages.length} forfait{packages.length > 1 ? "s" : ""} disponible{packages.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucun forfait trouvé
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pkg.type === "PAY_PER_USE" ? "À l'usage" : "Forfait"}
                      </Badge>
                    </TableCell>
                    <TableCell>{pkg.tokensAmount}</TableCell>
                    <TableCell>{pkg.price.toFixed(2)}$</TableCell>
                    <TableCell>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pkg)}
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
              <DialogTitle>Modifier le forfait</DialogTitle>
              <DialogDescription>
                Modifiez les informations du forfait
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  placeholder="Forfait Starter"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  {...editForm.register("description")}
                  placeholder="Parfait pour débuter"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tokensAmount">Nombre de tokens</Label>
                <Input
                  id="edit-tokensAmount"
                  type="number"
                  {...editForm.register("tokensAmount", { valueAsNumber: true })}
                  placeholder="1000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Prix ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  {...editForm.register("price", { valueAsNumber: true })}
                  placeholder="49.99"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  {...editForm.register("isActive")}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-isActive">Forfait actif</Label>
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
    </div>
  );
}
