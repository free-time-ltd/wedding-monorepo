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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@repo/ui/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import Link from "next/link";
import { toast } from "@repo/ui";
import { CircleX, ExternalLink, UserPlus2, X } from "@repo/ui/icons";
import { generateId } from "@repo/utils/generateId";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { FamilySelector } from "@/components/family-selector";

type User = {
  id: string;
  name: string;
  extras: number;
  email: string | null;
  phone: string | null;
  tableId: number | null;
  familyId: number | null;
  family?: {
    id: number;
    name: string;
  };
  gender: "male" | "female" | "unknown";
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

type UserForm = {
  name: string;
  email: string;
  phone: string;
  gender: string | "male" | "female" | "unknown";
  familyId: string | null;
  extras: string | number;
  tableId: string | number | null;
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
  plusOneNames: string[] | null;
  invited: string[];
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

type Poll = {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
  validUntil: string;
  options: Array<{
    id: string;
    title: string;
  }>;
  answers: Array<{
    id: string;
    pollId: string;
    userId: string;
    answer: {
      id: string;
      title: string;
    };
  }>;
};

type PollData = {
  title: string;
  subtitle: string;
  validUntil: string;
  options: Array<{
    id?: string;
    title: string;
  }>;
};

type Hotel = {
  id: number;
  name: string;
  distance: string;
  websiteUrl: string;
};

type ExtraGuests = {
  invitation: number;
  userId: string;
  guests: Array<{
    name: string;
    gender?: "male" | "female" | "unknown";
  }>;
};

type GuestBook = {
  id: number;
  title: string;
  message: string;
  isApproved: boolean;
  isPrivate: boolean;
  user: {
    id: string;
    name: string;
  };
};

type UrlShort = {
  id: number;
  slug: string;
  url: string;
  views: number;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
};

type Family = {
  id: number;
  name: string;
  createdAt: string;
  members: Pick<User, "id" | "name" | "gender">[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function AdminPage() {
  const handleDeleteUrl = async (id: number) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този URL?")) return;
    try {
      const res = await fetch(
        new URL(`/api/admin/url-shortener/${id}`, API_BASE),
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to delete URL");
      fetchAll();
      toast.success("URL изтрит!");
    } catch {
      toast.error("Грешка при изтриване на URL");
    }
  };
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupFamily, setGroupFamily] = useState<number | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [newsletter, setNewsletter] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<UrlShort | null>(null);
  const [urlForm, setUrlForm] = useState<Partial<UrlShort>>({
    slug: "",
    url: "",
    user: undefined,
  });
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [familyForm, setFamilyForm] = useState<{
    id: number | null;
    name: string;
  }>({
    id: null,
    name: "",
  });

  const openAddUrl = () => {
    setEditingUrl(null);
    setUrlForm({ slug: "", url: "", user: undefined });
    setIsUrlModalOpen(true);
  };

  const openAddFamily = () => {
    setFamilyForm({ id: null, name: "" });
    setFamilyModalOpen(true);
  };

  const openEditFamily = (family: Family) => {
    setFamilyForm({ id: family.id, name: family.name });
    setFamilyModalOpen(true);
  };

  const openEditUrl = (url: UrlShort) => {
    setEditingUrl(url);
    setUrlForm({
      id: url.id,
      slug: url.slug,
      url: url.url,
      user: url.user,
    });
    setIsUrlModalOpen(true);
  };

  const deleteFamily = async (family: Family) => {
    if (
      !confirm(
        `Сигурни ли сте, че искате да изтриете семейството "${family.name}"?`
      )
    )
      return;
    try {
      await fetch(new URL(`/api/admin/families/${family.id}`, API_BASE), {
        credentials: "include",
        method: "DELETE",
      });
      fetchAll();
      toast.success("Семейството е изтрито!");
    } catch (e) {
      console.error(e);
      toast.error("Грешка при изтриване на семейството");
    }
  };

  const handleMultiFamilyChange = () => {
    const promises = selectedUsers.map((userId) =>
      fetch(new URL(`/api/admin/users/${userId}`, API_BASE), {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ familyId: groupFamily }),
      })
    );

    Promise.all(promises).then(() => {
      setGroupFamily(null);
      setSelectedUsers([]);
      fetchAll();
      toast.success("Хората бяха ъпдейтнати");
    });
  };

  const submitFamilyForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: familyForm.name.trim(),
    };

    try {
      if (familyForm.id) {
        await fetch(new URL(`/api/admin/families/${familyForm.id}`, API_BASE), {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(new URL(`/api/admin/families`, API_BASE), {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setFamilyModalOpen(false);
      setFamilyForm({ id: null, name: "" });
      await fetchAll();
      toast.success(
        familyForm.id ? "Семейството е редактирано!" : "Семейството е добавено!"
      );
    } catch (err) {
      console.error("Failed to submit family form", err);
      toast.error("Грешка при запис на семейството");
    }
  };

  const handleUrlFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUrlForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitUrlForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUrl ? "PATCH" : "POST";
      const endpoint = editingUrl
        ? `/api/admin/url-shortener/${editingUrl.id}`
        : "/api/admin/url-shortener";
      const res = await fetch(new URL(endpoint, API_BASE), {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: urlForm.slug,
          url: urlForm.url,
        }),
      });
      if (!res.ok) throw new Error("Failed to save URL");
      fetchAll();
      setIsUrlModalOpen(false);
      setEditingUrl(null);
      setUrlForm({ slug: "", url: "", user: undefined });
      toast.success(editingUrl ? "URL редактиран!" : "URL добавен!");
    } catch {
      toast.error("Грешка при запис на URL");
    }
  };
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [guestbook, setGuestbook] = useState<GuestBook[]>([]);
  const [urlShorts, setUrlShorts] = useState<UrlShort[]>([]);
  const [familyData, setFamilyData] = useState<Family[]>([]);
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    phone: "",
    gender: "unknown",
    familyId: "" as string | "",
    extras: 0 as number,
    tableId: "" as string | "",
  });
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [tableForm, setTableForm] = useState({
    name: "",
    label: "",
  });
  const [pollForm, setPollForm] = useState<PollData>({
    title: "",
    subtitle: "",
    validUntil: "2026-06-27",
    options: [],
  });
  const [hotelForm, setHotelForm] = useState<Hotel>({
    id: 0,
    name: "",
    distance: "0км",
    websiteUrl: "",
  });
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [extraGuests, setExtraGuests] = useState<ExtraGuests>();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        usersRes,
        tablesRes,
        invitationsRes,
        uploadsRes,
        newsletterRes,
        pollsRes,
        hotelsRes,
        guestbookRes,
        urlShortRes,
        familyRes,
      ] = await Promise.all([
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
        fetch(new URL(`/api/admin/polls`, API_BASE), {
          credentials: "include",
        }),
        fetch(new URL(`/api/admin/hotels`, API_BASE), {
          credentials: "include",
        }),
        fetch(new URL(`/api/admin/guestbook`, API_BASE), {
          credentials: "include",
        }),
        fetch(new URL(`/api/admin/url-shortener`, API_BASE), {
          credentials: "include",
        }),
        fetch(new URL(`/api/admin/families`, API_BASE), {
          credentials: "include",
        }),
      ]);

      const usersData = await usersRes.json();
      const tablesData = await tablesRes.json();
      const invitationsData = await invitationsRes.json();
      const uploadsData = await uploadsRes.json();
      const newsletterData = await newsletterRes.json();
      const pollsData = await pollsRes.json();
      const hotelsData = await hotelsRes.json();
      const guestbookData = await guestbookRes.json();
      const urlShortData = await urlShortRes.json();
      const familyData = await familyRes.json();

      if (usersData.success) setUsers(usersData.data);
      if (tablesData.success) setTables(tablesData.data);
      if (invitationsData.success) setInvitations(invitationsData.data);
      if (uploadsData.success) setUploads(uploadsData.data);
      if (newsletterData.success) setNewsletter(newsletterData.data);
      if (pollsData.success) setPolls(pollsData.data);
      if (hotelsData.success) setHotels(hotelsData.data);
      if (guestbookData.success) setGuestbook(guestbookData.data);
      if (urlShortData.success) setUrlShorts(urlShortData.data);
      if (familyData) setFamilyData(familyData.data);
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
    handleClearCache("uploads");
  };

  const openAddUser = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      extras: 0,
      familyId: null,
      gender: "unknown",
      tableId: "",
    });
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      extras: user.extras ?? 0,
      gender: user.gender ?? "unknown",
      familyId: user.familyId ? String(user.familyId) : null,
      tableId: user.tableId ? String(user.tableId) : "",
    });
    setIsUserModalOpen(true);
  };

  const openAddPoll = () => {
    setEditingPoll(null);
    setPollForm({
      title: "",
      subtitle: "",
      validUntil: "2026-06-27",
      options: [],
    });
    setIsPollModalOpen(true);
  };

  const deleteUser = async (user: User) => {
    if (
      !confirm(
        "Are you sure you wish to delete this user? There is no going back!"
      )
    )
      return;

    try {
      await fetch(new URL(`/api/admin/users/${user.id}`, API_BASE), {
        credentials: "include",
        method: "DELETE",
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      await handleClearCache("guests");
      fetchAll();
    }
  };

  const submitUserForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      extras: Number.isNaN(Number(form.extras)) ? 0 : Number(form.extras),
      gender: form.gender || "unknown",
      familyId:
        form.familyId === "" || form.familyId === null
          ? null
          : Number(form.familyId),
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

  const submitNewGuestForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraGuests) return;

    const body = {
      invitation: extraGuests.invitation,
      userId: extraGuests.userId,
      guests: extraGuests.guests,
    };

    try {
      await fetch(
        new URL(
          `/api/admin/invitations/${extraGuests.invitation}/guests`,
          API_BASE
        ),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        }
      );

      fetchAll();

      setExtraGuests(undefined);
      setAddGuestOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Имаше проблем със редакцията на поканата");
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

  const editPoll = (id: string) => {
    const poll = polls.find((poll) => poll.id === id);
    if (!poll) return;

    setEditingPoll(poll);
    setPollForm(poll);
    setIsPollModalOpen(true);
  };

  const deletePoll = async (id: string) => {
    if (confirm(`Сигурен ли си че искаш да изтриеш анкетата?`)) {
      await fetch(new URL(`/api/admin/polls/${id}`, API_BASE), {
        credentials: "include",
        method: "DELETE",
      });
      fetchAll();
    }
  };

  const submitPollForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...pollForm,
      title: pollForm.title.trim(),
      subtitle: pollForm.subtitle.trim(),
      options: [...pollForm.options].filter((opt) => Boolean(opt.title.trim())),
    };

    try {
      if (editingPoll) {
        await fetch(new URL(`/api/admin/polls/${editingPoll.id}`, API_BASE), {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(new URL(`/api/admin/polls`, API_BASE), {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setIsPollModalOpen(false);
      setEditingPoll(null);
      await fetchAll();
    } catch (e) {
      console.error(e);
      toast.error("Възникна грешка със запазването.");
    }
  };

  const addNewFormVariant = () => {
    setPollForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: generateId(),
          title: "",
        },
      ],
    }));
  };

  const removeFormVariant = (id: string) => {
    setPollForm((prev) => ({
      ...prev,
      options: prev.options.filter((option) => option.id !== id),
    }));
  };

  const submitHotelForm = async (e: React.FormEvent) => {
    e.preventDefault();

    await handleHotelEdit(hotelForm);
    setHotelModalOpen(false);
    setHotelForm({
      id: 0,
      name: "",
      distance: "0км",
      websiteUrl: "",
    });
  };

  const openEditModal = async (hotel: Hotel) => {
    setHotelForm({ ...hotel });
    setHotelModalOpen(true);
  };

  const handleHotelEdit = async (hotel: Hotel) => {
    try {
      const url =
        hotel.id === 0 ? `/api/admin/hotels` : `/api/admin/hotels/${hotel.id}`;

      await fetch(new URL(url, API_BASE), {
        credentials: "include",
        method: hotel.id > 0 ? "PUT" : "POST",
        body: JSON.stringify(hotel),
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      setHotelForm({
        id: 0,
        name: "",
        distance: "",
        websiteUrl: "",
      });
      fetchAll();
      handleClearCache("hotels");
    }
  };

  const handleHotelDelete = async (hotel: Hotel) => {
    try {
      await fetch(new URL(`/api/admin/hotels/${hotel.id}`, API_BASE), {
        credentials: "include",
        method: "DELETE",
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      fetchAll();
      handleClearCache("hotels");
    }
  };

  const handleOpenAddGuestModal = (inv: Invitation) => {
    setAddGuestOpen(true);
    setExtraGuests({
      invitation: inv.id,
      userId: inv.userId,
      guests: (inv.plusOneNames ?? []).map((name) => ({ name })),
    });
  };

  const toggleGuestbook = async (entry: GuestBook) => {
    try {
      await fetch(new URL(`/api/admin/guestbook/${entry.id}`, API_BASE), {
        credentials: "include",
        method: "PATCH",
        body: JSON.stringify({ isApproved: !entry.isApproved }),
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      fetchAll();
      handleClearCache("guestbook");
    }
  };

  const toggleGuestbookVisibility = async (entry: GuestBook) => {
    try {
      await fetch(new URL(`/api/admin/guestbook/${entry.id}`, API_BASE), {
        credentials: "include",
        method: "PATCH",
        body: JSON.stringify({ isPrivate: !entry.isPrivate }),
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      fetchAll();
      handleClearCache("guestbook");
    }
  };

  const deleteGuestbook = async (id: number) => {
    try {
      await fetch(new URL(`/api/admin/guestbook/${id}`, API_BASE), {
        credentials: "include",
        method: "DELETE",
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      fetchAll();
      handleClearCache("guestbook");
    }
  };

  const handleClearCache = async (tag?: string) => {
    const params = new URLSearchParams({ tag: tag ?? "" });
    try {
      await fetch(`/api/revalidate?${params.toString()}`, {
        credentials: "include",
        method: "POST",
        headers: {
          Authorization: `Bearer: ${process.env.REVALIDATE_KEY}`,
        },
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      fetchAll();
    }
  };

  return (
    <div className="container mx-auto p-2 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif">
          Администраторски панел
        </h1>
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
          <TabsTrigger value="polls">Анкети ({polls.length})</TabsTrigger>
          <TabsTrigger value="hotels">Хотели ({hotels.length})</TabsTrigger>
          <TabsTrigger value="guestbook">
            Пожелания ({guestbook.length})
          </TabsTrigger>
          <TabsTrigger value="urls">
            Кратки URL-и ({urlShorts.length})
          </TabsTrigger>
          <TabsTrigger value="families">
            Семейства ({familyData.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Списък с гости</div>
              {selectedUsers.length > 1 && (
                <div className="flex gap-2">
                  <FamilySelector
                    value={groupFamily ? String(groupFamily) : ""}
                    onValueChange={(val) =>
                      setGroupFamily(Number(val) > 0 ? Number(val) : null)
                    }
                    showClear={(groupFamily ?? 0) > 0}
                    onClear={() => setGroupFamily(null)}
                    families={familyData}
                  />
                  <Button onClick={handleMultiFamilyChange}>Запази</Button>
                </div>
              )}
              <Button onClick={openAddUser}>Добави гост</Button>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <p className="text-center">-</p>
                    </TableHead>
                    <TableHead>Име</TableHead>
                    <TableHead>Пол</TableHead>
                    <TableHead>Имейл</TableHead>
                    <TableHead>Семейство</TableHead>
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
                      <TableCell>
                        <Checkbox
                          id={`select-user-${user.id}`}
                          name="selected-users"
                          value={user.id}
                          onCheckedChange={(checked) =>
                            setSelectedUsers((prev) => {
                              if (checked === true) {
                                return [...prev, user.id];
                              }

                              return prev.filter((id) => id !== user.id);
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Label
                          htmlFor={`select-user-${user.id}`}
                          className="font-medium"
                        >
                          {user.name}
                        </Label>
                      </TableCell>
                      <TableCell>{user.gender || "unknown"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.family?.name || "-"}</TableCell>
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
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditUser(user)}
                          >
                            Редактирай
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(user)}
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

        <TabsContent value="urls">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Списък с кратки URL-и</div>
              <Button onClick={openAddUrl}>Добави URL</Button>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Последен клик</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urlShorts.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell>{url.id}</TableCell>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-1">
                          {url.slug}
                          <Button asChild variant="ghost" size="icon-sm">
                            <Link href={`/s/${url.slug}`} target="_blank">
                              <ExternalLink />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{url.url}</TableCell>
                      <TableCell>{url.views}</TableCell>
                      <TableCell>
                        {new Date(url.updatedAt).toLocaleDateString()}{" "}
                        {new Date(url.updatedAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditUrl(url)}
                          >
                            Редактирай
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUrl(url.id)}
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

        <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
          <DialogContent className="sm:max-w-120">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingUrl ? "Редакция на URL" : "Добавяне на URL"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submitUrlForm} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="url-slug">Slug</Label>
                <Input
                  id="url-slug"
                  name="slug"
                  value={urlForm.slug || ""}
                  onChange={handleUrlFormChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url-url">URL</Label>
                <Input
                  id="url-url"
                  name="url"
                  value={urlForm.url || ""}
                  onChange={handleUrlFormChange}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingUrl ? "Запази" : "Добави"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Затвори
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                      <TableCell>
                        {inv.plusOne ? <>Да</> : <>Не</>}{" "}
                        {(() => {
                          if ((inv.plusOneNames?.length ?? 0) > 0) {
                            if (
                              inv.invited.length !== inv.plusOneNames?.length
                            ) {
                              return (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => handleOpenAddGuestModal(inv)}
                                >
                                  виж поканени
                                </Button>
                              );
                            }

                            return <>({inv.plusOneNames?.length})</>;
                          }
                        })()}
                      </TableCell>
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
        <TabsContent value="polls">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Списък с анкети</div>
              <Button onClick={openAddPoll}>Добави анкета</Button>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Заглавие</TableHead>
                    <TableHead>Варианти</TableHead>
                    <TableHead>Отговори</TableHead>
                    <TableHead>Валидна до</TableHead>
                    <TableHead>-</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polls.map((poll) => (
                    <TableRow key={poll.id}>
                      <TableCell>{poll.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {poll.options.map((option) => (
                            <div
                              className="truncate text-nowrap whitespace-nowrap"
                              key={option.id}
                            >
                              {option.title} (
                              {
                                poll.answers.filter(
                                  (answer) => answer.answer.id === option.id
                                ).length
                              }
                              )
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{poll.answers.length}</TableCell>
                      <TableCell>
                        {new Date(poll.validUntil).toDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editPoll(poll.id)}
                          >
                            Редактирай
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePoll(poll.id)}
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
        <TabsContent value="hotels">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Списък с хотели</div>
              <Button onClick={() => setHotelModalOpen(true)}>
                Добави хотел
              </Button>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Име</TableHead>
                    <TableHead>Дистанция</TableHead>
                    <TableHead>Сайт</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotels.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell className="font-medium">
                        {hotel.name}
                      </TableCell>
                      <TableCell>{hotel.distance || "-"}</TableCell>
                      <TableCell>{hotel.websiteUrl}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 shrink grow-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(hotel)}
                          >
                            Редактирай
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleHotelDelete(hotel)}
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
        <TabsContent value="guestbook">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Пожелания</div>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Гост</TableHead>
                    <TableHead>Заглавие</TableHead>
                    <TableHead>Съобщение</TableHead>
                    <TableHead>Скрито</TableHead>
                    <TableHead>Одобрено</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestbook.map((row) => (
                    <TableRow key={`guestbook-${row.id}`}>
                      <TableCell className="font-medium">
                        {row.user.name}
                      </TableCell>
                      <TableCell>{row.title || "-"}</TableCell>
                      <TableCell className="truncate">{row.message}</TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="link"
                              className="cursor-pointer"
                            >
                              {row.isPrivate ? "Да" : "Не"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-96 relative"
                            side="bottom"
                            align="center"
                          >
                            <div className="space-y-4">
                              <h4 className="font-serif font-semibold text-center">
                                Смени видимостта на съобщение
                              </h4>
                              <div className="flex justify-center items-center">
                                <Button
                                  type="button"
                                  variant={
                                    row.isPrivate ? "default" : "destructive"
                                  }
                                  onClick={() => toggleGuestbookVisibility(row)}
                                >
                                  {row.isPrivate
                                    ? "Направи видимо за всички"
                                    : "Направи скрито за всички"}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>{row.isApproved ? "Да" : "Не"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 shrink grow-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleGuestbook(row)}
                          >
                            {row.isApproved ? "Отхвърли" : "Одобри"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteGuestbook(row.id)}
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
        <TabsContent value="families">
          <div className="mt-4 border rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <div className="font-medium">Семейства</div>
              <Button type="button" onClick={openAddFamily}>
                Добави семейство
              </Button>
            </div>
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Име</TableHead>
                    <TableHead>Членове</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyData.map((family) => (
                    <TableRow key={`family-${family.id}`}>
                      <TableCell>{family.name}</TableCell>
                      <TableCell>{family.members.length}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditFamily(family)}
                          >
                            Редактирай
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteFamily(family)}
                          >
                            Изтрий
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {familyData.length === 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <p className="text-center">Не сте създали семейства</p>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={familyModalOpen} onOpenChange={setFamilyModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {(familyForm?.id ?? 0) > 0
                ? "Редакция на семейство"
                : "Добавяне на семейство"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitFamilyForm} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="f-title">Име</Label>
              <Input
                id="f-title"
                value={familyForm?.name ?? ""}
                onChange={(e) =>
                  setFamilyForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <small className="text-xs text-muted-foreground">
                (Името е само за нас. Никой друг няма да го вижда)
              </small>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFamilyModalOpen(false)}
              >
                Отказ
              </Button>
              <Button type="submit">
                {familyForm.id ? "Запази" : "Добави"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isPollModalOpen} onOpenChange={setIsPollModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingPoll ? "Редакция на анкета" : "Добавяне на анкета"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitPollForm} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="p-title">Въпрос</Label>
              <Input
                id="p.title"
                value={pollForm?.title ?? ""}
                onChange={(e) =>
                  setPollForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-subtitle">Описание</Label>
              <Input
                id="p-subtitle"
                value={pollForm?.subtitle ?? ""}
                onChange={(e) =>
                  setPollForm((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-validuntil">Валидна до</Label>
              <Input
                id="p.validuntil"
                type="date"
                value={
                  new Date(pollForm?.validUntil).toISOString().split("T")[0] ??
                  "2026-06-27"
                }
                onChange={(e) =>
                  setPollForm((prev) => ({
                    ...prev,
                    validUntil: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Варианти</Label>
              <div className="space-y-2">
                {pollForm.options.map((option) => (
                  <div className="flex gap-2 items-center" key={option.id}>
                    <div className="flex-1 grid gap-2">
                      <Input
                        id="p.validuntil"
                        type="text"
                        value={option.title}
                        onChange={(e) =>
                          setPollForm((prev) => ({
                            ...prev,
                            options: [...prev.options].map((opt) =>
                              opt.id !== option.id
                                ? opt
                                : { ...opt, title: e.target.value }
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    {!editingPoll && (
                      <div className="icons">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeFormVariant(option?.id ?? "")}
                        >
                          <CircleX />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {!editingPoll && (
                  <Button onClick={addNewFormVariant}>
                    Добави нов вариант
                  </Button>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPollModalOpen(false)}
              >
                Отказ
              </Button>
              <Button type="submit">{editingPoll ? "Запази" : "Добави"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={hotelModalOpen} onOpenChange={setHotelModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {hotelForm.id > 0 ? "Редакция на хотел" : "Добавяне на хотел"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitHotelForm} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="h-name">Име</Label>
              <Input
                id="h-name"
                value={hotelForm?.name ?? ""}
                onChange={(e) =>
                  setHotelForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="h-website">Уебсайт</Label>
              <Input
                id="h-website"
                value={hotelForm?.websiteUrl ?? ""}
                onChange={(e) =>
                  setHotelForm((prev) => ({
                    ...prev,
                    websiteUrl: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="h-distance">Дистанция</Label>
              <Input
                id="h-distance"
                value={hotelForm?.distance ?? ""}
                onChange={(e) =>
                  setHotelForm((prev) => ({
                    ...prev,
                    distance: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setHotelModalOpen(false)}
              >
                Отказ
              </Button>
              <Button type="submit">
                {hotelForm.id !== 0 ? "Запази" : "Добави"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="sm:max-w-120">
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
        <DialogContent className="sm:max-w-130">
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
              <Label htmlFor="familyId">Семейство</Label>
              <div className="flex gap-2">
                <Select
                  name="familyId"
                  value={form.familyId === null ? "" : String(form.familyId)}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, familyId: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Изберете семейство" />
                  </SelectTrigger>

                  <SelectContent>
                    {familyData.map((family) => (
                      <SelectGroup key={`user-family-${family.id}`}>
                        <SelectItem value={String(family.id)}>
                          {family.name}
                        </SelectItem>
                        {family.members.map((member) => (
                          <div
                            className="pl-6 py-1 text-xs text-muted-foreground"
                            key={`family-member-${member.id}`}
                          >
                            {member.name}
                          </div>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {form.familyId && form.familyId?.length > 0 && (
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, familyId: "" }))
                    }
                  >
                    <CircleX />
                  </Button>
                )}
              </div>
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
              <Label htmlFor="gender">Пол</Label>
              <Select
                value={form.gender}
                onValueChange={(newVal) =>
                  setForm((f) => ({ ...f, gender: newVal }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Пол" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Мъж</SelectItem>
                  <SelectItem value="female">Жена</SelectItem>
                  <SelectItem value="unknown">Без пол</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tableId">Маса</Label>
              <Select
                value={String(form.tableId)}
                onValueChange={(newVal) =>
                  setForm((f) => ({ ...f, tableId: newVal }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Избери маса" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.label || t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      <Dialog
        open={addGuestOpen && !!extraGuests}
        onOpenChange={setAddGuestOpen}
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-between">
              <DialogTitle className="font-serif">
                Добавяне на гости
              </DialogTitle>
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  setExtraGuests((prev) => {
                    if (!prev) return prev;

                    return {
                      ...prev,
                      guests: [...prev.guests, { name: "" }],
                    };
                  })
                }
              >
                <UserPlus2 />
                Добави още
              </Button>
            </div>
          </DialogHeader>
          {!!extraGuests && (
            <form id="new-guest-form" onSubmit={submitNewGuestForm}>
              <div className="space-y-2">
                {extraGuests.guests.map(({ name, gender }, i) => (
                  <div className="grid gap-2" key={i}>
                    <Label htmlFor={`name-${name}-${i}`}>Име</Label>
                    <div className="flex gap-1">
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) =>
                          setExtraGuests((prev) => {
                            if (!prev) return prev;

                            const next = {
                              ...prev,
                              guests: prev.guests ?? [],
                            };
                            next.guests[i] = {
                              ...next.guests[i],
                              name: e.target.value,
                            };

                            return next;
                          })
                        }
                      />
                      <Select
                        value={gender}
                        onValueChange={(val) =>
                          setExtraGuests((prev) => {
                            if (!prev) return prev;

                            return {
                              ...prev,
                              guests: prev.guests.map((guest, index) =>
                                index === i
                                  ? {
                                      ...guest,
                                      gender:
                                        val as ExtraGuests["guests"][number]["gender"],
                                    }
                                  : guest
                              ),
                            };
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Пол" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Мъж</SelectItem>
                          <SelectItem value="female">Жена</SelectItem>
                          <SelectItem value="unknown">Не знаем</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        type="button"
                        size="icon"
                        onClick={() =>
                          setExtraGuests((prev) => {
                            if (!prev) return prev;

                            return {
                              ...prev,
                              guests: prev.guests.filter(
                                (_, index) => i !== index
                              ),
                            };
                          })
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Откажи</Button>
            </DialogClose>
            <Button type="submit" form="new-guest-form">
              Запази гостите
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex justify-center items-center gap-4 py-6">
        <Button type="button" asChild>
          <Link href="/">Към началната страница</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/rsvp-list">Виж QR кодове на поканите</Link>
        </Button>
      </div>
    </div>
  );
}
