"use client";
import { useCurrentUser } from "@/context/SimpleUserProvider";

export default function AdminPage() {
  const currentUser = useCurrentUser();

  return (
    <div className="container mx-auto">
      <p className="text-3xl text-center">Hello world from admin page</p>
      <p className="text-center">{JSON.stringify({ currentUser })}</p>
    </div>
  );
}
