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
  uploads: any[];
};

type TableData = {
  id: number;
  name: string;
  label: string | null;
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

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, tablesRes, invitationsRes, uploadsRes] =
        await Promise.all([
          fetch(`${API_BASE}/api/admin/users`),
          fetch(`${API_BASE}/api/admin/tables`),
          fetch(`${API_BASE}/api/admin/invitations`),
          fetch(`${API_BASE}/api/admin/uploads`),
        ]);

      const usersData = await usersRes.json();
      const tablesData = await tablesRes.json();
      const invitationsData = await invitationsRes.json();
      const uploadsData = await uploadsRes.json();

      if (usersData.success) setUsers(usersData.data);
      if (tablesData.success) setTables(tablesData.data);
      if (invitationsData.success) setInvitations(invitationsData.data);
      if (uploadsData.success) setUploads(uploadsData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUploadStatus = async (id: string, status: string) => {
    await fetch(`${API_BASE}/api/admin/uploads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchAll();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, tables, invitations, and uploads
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="tables">Tables ({tables.length})</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="uploads">Uploads ({uploads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="mt-4 border rounded-lg">
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Extras</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Invitation</TableHead>
                    <TableHead>Uploads</TableHead>
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
                              user.invitation.attending
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.invitation.attending ? "Yes" : "No"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.uploads.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <div className="mt-4 border rounded-lg">
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Guests Count</TableHead>
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
                    <TableHead>User</TableHead>
                    <TableHead>Attending</TableHead>
                    <TableHead>Plus One</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Transportation</TableHead>
                    <TableHead>Accommodation</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Views</TableHead>
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
                            {inv.attending ? "Yes" : "No"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{inv.plusOne ? "Yes" : "No"}</TableCell>
                      <TableCell>{inv.menuChoice || "-"}</TableCell>
                      <TableCell>{inv.transportation || "-"}</TableCell>
                      <TableCell>{inv.accommodation ? "Yes" : "No"}</TableCell>
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
                    <TableHead>User</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
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
                          {upload.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateUploadStatus(upload.id, "approved")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateUploadStatus(upload.id, "rejected")
                                }
                              >
                                Reject
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
      </Tabs>
    </div>
  );
}
