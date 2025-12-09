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
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import { z } from "zod";

type User = {
  id: string;
  email: string;
  name?: string | null;
  role: "ADMIN" | "COMPANY" | "USER";
  companyId?: string | null;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  company?: {
    id: string;
    name: string;
  } | null;
};

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "USER",
      companyId: "",
    },
  });

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      editForm.reset({
        email: selectedUser.email,
        name: selectedUser.name || "",
        role: selectedUser.role,
        companyId: selectedUser.companyId || "",
        isActive: selectedUser.isActive,
      });
    }
  }, [selectedUser, editForm]);

  async function loadData() {
    try {
      const [usersRes, companiesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/companies"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (companiesRes.ok) setCompanies(await companiesRes.json());
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage("error", "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreateUserInput) {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("success", "Utilisateur créé avec succès");
        setIsCreateOpen(false);
        createForm.reset();
        loadData();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la création");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la création de l'utilisateur");
    }
  }

  async function handleUpdate(data: UpdateUserInput) {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("success", "Utilisateur mis à jour avec succès");
        setIsEditOpen(false);
        setSelectedUser(null);
        loadData();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.email}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showMessage("success", "Utilisateur supprimé avec succès");
        loadData();
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la suppression de l'utilisateur");
    }
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "COMPANY":
        return "default";
      case "USER":
        return "secondary";
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
          <h2 className="text-3xl font-bold tracking-tight">Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les utilisateurs et leurs rôles d&apos;accès
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createForm.handleSubmit(handleCreate)}>
              <DialogHeader>
                <DialogTitle>Créer un utilisateur</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouvel utilisateur au système
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    {...createForm.register("email")}
                    placeholder="utilisateur@exemple.com"
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    {...createForm.register("name")}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Rôle*</Label>
                  <Select
                    onValueChange={(value) => createForm.setValue("role", value as "ADMIN" | "COMPANY" | "USER")}
                    defaultValue="USER"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Utilisateur</SelectItem>
                      <SelectItem value="COMPANY">Entreprise</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="companyId">Entreprise</Label>
                  <Select
                    onValueChange={(value) => createForm.setValue("companyId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role) as any}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.company?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
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
              <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l&apos;utilisateur
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...editForm.register("email")}
                  placeholder="utilisateur@exemple.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-role">Rôle</Label>
                <Select
                  onValueChange={(value) => editForm.setValue("role", value as "ADMIN" | "COMPANY" | "USER")}
                  defaultValue={selectedUser?.role}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                    <SelectItem value="COMPANY">Entreprise</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  {...editForm.register("isActive")}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-isActive">Compte actif</Label>
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
