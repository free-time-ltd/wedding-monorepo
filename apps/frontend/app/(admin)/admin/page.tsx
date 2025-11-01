"use client";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  extras: number;
  email: string | null;
  phone: string | null;
  tableId: number | null;
  table: { id: number; name: string; label: string | null } | null;
  invitation: {
    id: number;
    attending: boolean | null;
    plusOne: boolean | null;
    menuChoice: "vegan" | "regular" | "fish" | null;
    transportation: "parking" | "shuttle" | "no" | null;
    accommodation: boolean | null;
    notes: string | null;
    views: number;
    createdAt: Date;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploads: any[];
};

type TableData = {
  id: number;
  name: string;
  label: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  guests: any[];
};

type Invitation = {
  id: number;
  userId: string;
  attending: boolean | null;
  plusOne: boolean | null;
  menuChoice: "vegan" | "regular" | "fish" | null;
  transportation: "parking" | "shuttle" | "no" | null;
  accommodation: boolean | null;
  notes: string | null;
  views: number;
  createdAt: Date;
  user: { id: string; name: string; email: string | null };
};

type Upload = {
  id: string;
  s3Key: string;
  userId: string;
  url: string | null;
  message: string | null;
  createdAt: Date | null;
  status: "pending" | "processed" | "approved" | "rejected";
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  origFilename: string | null;
  approvedAt: Date | null;
  user: { id: string; name: string };
};

type Newsletter = {
  id: string;
  email: string;
  user: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [newsletter, setNewsletter] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    extras: 0 as number,
    tableId: "" as string | "",
  });
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [tableForm, setTableForm] = useState({
    name: "",
    label: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, tablesRes, invitationsRes, uploadsRes, newsletterRes] =
        await Promise.all([
          fetch(new URL(`/api/admin/users`, API_BASE), {
            credentials: "include",
          }),
          fetch(new URL(`/api/admin/tables`, API_BASE), {
            credentials: "include",
          }),
          fetch(new URL(`/api/admin/invitations`, API_BASE), {
            credentials: "include",
          }),
          fetch(new URL(`/api/admin/uploads`, API_BASE), {
            credentials: "include",
          }),
          fetch(new URL(`/api/admin/newsletter`, API_BASE), {
            credentials: "include",
          }),
        ]);

      const usersData = await usersRes.json();
      const tablesData = await tablesRes.json();
      const invitationsData = await invitationsRes.json();
      const uploadsData = await uploadsRes.json();
      const newsletterData = await newsletterRes.json();

      if (usersData.success) setUsers(usersData.data);
      if (tablesData.success) setTables(tablesData.data);
      if (invitationsData.success) setInvitations(invitationsData.data);
      if (uploadsData.success) setUploads(uploadsData.data);
      if (newsletterData.success) setNewsletter(newsletterData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUploadStatus = async (id: string, status: string) => {
    await fetch(new URL(`/api/admin/uploads/${id}`, API_BASE), {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchAll();
  };

  const openAddUser = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", phone: "", extras: 0, tableId: "" });
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      extras: user.extras ?? 0,
      tableId: user.tableId ? String(user.tableId) : "",
    });
    setIsUserModalOpen(true);
  };

  const submitUserForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      extras: Number.isNaN(Number(form.extras)) ? 0 : Number(form.extras),
      tableId:
        form.tableId === "" || form.tableId === null
          ? null
          : Number(form.tableId),
    };

    try {
      if (editingUser) {
        await fetch(new URL(`/api/admin/users/${editingUser.id}`, API_BASE), {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(new URL(`/api/admin/users`, API_BASE), {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      await fetchAll();
    } catch (err) {
      console.error("Failed to submit user form", err);
    }
  };

  const openAddTable = () => {
    setEditingTable(null);
    setTableForm({ name: "", label: "" });
    setIsTableModalOpen(true);
  };

  const openEditTable = (table: TableData) => {
    setEditingTable(table);
    setTableForm({ name: table.name || "", label: table.label || "" });
    setIsTableModalOpen(true);
  };

  const submitTableForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: tableForm.name.trim(),
      label: tableForm.label.trim() || null,
    };

    try {
      if (editingTable) {
        await fetch(new URL(`/api/admin/tables/${editingTable.id}`, API_BASE), {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(new URL(`/api/admin/tables`, API_BASE), {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setIsTableModalOpen(false);
      setEditingTable(null);
      await fetchAll();
    } catch (err) {
      console.error("Failed to submit table form", err);
    }
  };

  const deleteNewsletter = async (id: string) => {
    if (confirm("Сигурен ли си, че искаш да изтриеш записа?")) {
      await fetch(new URL(`/api/admin/newsletter/${id}`, API_BASE), {
        credentials: "include",
        method: "DELETE",
      });
      fetchAll();
    }
  };

  const deleteTable = async (id: number) => {
    const table = tables.find((table) => table.id === id);
    if (
      table &&
      confirm(`Сигурен ли си че искаш да изтриеш маса "${table.name}"`)
    ) {
      await fetch(new URL(`/api/admin/tables/${id}`, API_BASE), {
        credentials: "include",
        method: "DELETE",
      });
      fetchAll();
    }
  };

  return (
    <div className="container mx-auto p-2 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Администраторски панел</h1>
        <p className="text-muted-foreground">
          Управление на потребители, маси, покани и качени файлове
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="max-w-full overflow-auto">
          <TabsTrigger value="users">Гости ({users.length})</TabsTrigger>
          <TabsTrigger value="tables">Маси ({tables.length})</TabsTrigger>
          <TabsTrigger value="invitations">
            Покани ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="uploads">Снимки ({uploads.length})</TabsTrigger>
          <TabsTrigger value="newsletter">
            Бюлетин ({newsletter.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Списък с гости</div>
              <Button onClick={openAddUser}>Добави гост</Button>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Име</TableHead>
                    <TableHead>Имейл</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Придружители</TableHead>
                    <TableHead>Маса</TableHead>
                    <TableHead>Отговор на поканата</TableHead>
                    <TableHead>Снимки</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>{user.extras}</TableCell>
                      <TableCell>
                        {user.table?.label || user.table?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {user.invitation?.attending === null ? (
                          "-"
                        ) : (
                          <Badge
                            variant={
                              user.invitation?.attending
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.invitation?.attending ? "Да" : "Не"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.uploads.length}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditUser(user)}
                        >
                          Редактирай
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Списък с маси</div>
              <Button onClick={openAddTable}>Добави маса</Button>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Име</TableHead>
                    <TableHead>Етикет</TableHead>
                    <TableHead>Брой гости</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell>{table.id}</TableCell>
                      <TableCell className="font-medium">
                        {table.name}
                      </TableCell>
                      <TableCell>{table.label || "-"}</TableCell>
                      <TableCell>{table.guests.length}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 shrink grow-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditTable(table)}
                          >
                            Редактирай
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTable(table.id)}
                          >
                            Изтрий
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <div className="mt-4 border rounded-lg">
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Гост</TableHead>
                    <TableHead>Присъства</TableHead>
                    <TableHead>Придружител</TableHead>
                    <TableHead>Меню</TableHead>
                    <TableHead>Транспорт</TableHead>
                    <TableHead>Нощувка</TableHead>
                    <TableHead>Бележки</TableHead>
                    <TableHead>Прегледи</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">
                        {inv.user.name}
                      </TableCell>
                      <TableCell>
                        {inv.attending === null ? (
                          "-"
                        ) : (
                          <Badge
                            variant={inv.attending ? "default" : "secondary"}
                          >
                            {inv.attending ? "Да" : "Не"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{inv.plusOne ? "Да" : "Не"}</TableCell>
                      <TableCell>{inv.menuChoice || "-"}</TableCell>
                      <TableCell>{inv.transportation || "-"}</TableCell>
                      <TableCell>{inv.accommodation ? "Да" : "Не"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {inv.notes || "-"}
                      </TableCell>
                      <TableCell>{inv.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="uploads">
          <div className="mt-4 border rounded-lg">
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Гост</TableHead>
                    <TableHead>Име на файл</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Размер</TableHead>
                    <TableHead>Създаден на</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell className="font-medium">
                        {upload.user.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {upload.origFilename || upload.s3Key}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          let variant: "default" | "secondary" | "outline" =
                            "outline";
                          if (upload.status === "approved") {
                            variant = "default";
                          } else if (upload.status === "rejected") {
                            variant = "secondary";
                          }
                          return (
                            <Badge variant={variant}>{upload.status}</Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {upload.sizeBytes
                          ? `${(upload.sizeBytes / 1024).toFixed(1)} KB`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {upload.createdAt
                          ? new Date(upload.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {upload.status !== "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateUploadStatus(upload.id, "approved")
                                }
                              >
                                Одобри
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateUploadStatus(upload.id, "rejected")
                                }
                              >
                                Отхвърли
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        <TabsContent value="newsletter">
          <div className="mt-4 border rounded-lg">
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имейл</TableHead>
                    <TableHead>Записан на</TableHead>
                    <TableHead>Избран потребител</TableHead>
                    <TableHead>-</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsletter.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.email}</TableCell>
                      <TableCell>
                        {new Date(row.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {row.user?.name ?? "Няма избран потребител"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteNewsletter(row.id)}
                          >
                            Изтрий
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingTable ? "Редакция на маса" : "Добавяне на маса"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitTableForm} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="t-name">Име</Label>
              <Input
                id="t-name"
                value={tableForm.name}
                onChange={(e) =>
                  setTableForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-label">Етикет</Label>
              <Input
                id="t-label"
                value={tableForm.label}
                onChange={(e) =>
                  setTableForm((f) => ({ ...f, label: e.target.value }))
                }
                placeholder="напр. Сватбарска маса"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTableModalOpen(false)}
              >
                Отказ
              </Button>
              <Button type="submit">
                {editingTable ? "Запази" : "Добави"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingUser ? "Редакция на гост" : "Добавяне на гост"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitUserForm} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Име</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Имейл</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="extras">Придружители</Label>
              <Input
                id="extras"
                type="number"
                min={0}
                value={form.extras}
                onChange={(e) =>
                  setForm((f) => ({ ...f, extras: Number(e.target.value) }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tableId">Маса</Label>
              <select
                id="tableId"
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.tableId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tableId: e.target.value }))
                }
              >
                <option value="">-- без маса --</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label || t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUserModalOpen(false)}
              >
                Отказ
              </Button>
              <Button type="submit">{editingUser ? "Запази" : "Добави"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="text-center py-6">
        <Button type="button" asChild>
          <Link href="/">Към началната страница</Link>
        </Button>
      </div>
    </div>
  );
}
