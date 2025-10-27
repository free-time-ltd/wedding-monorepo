"use client";

import { setIdToken } from "@/actions/setIdToken";
import { Loader } from "@/components/loader";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    const setToken = async () => {
      const params = new URLSearchParams(window.location.hash.substring(1));

      const idToken = params.get("id_token");
      if (idToken) {
        await setIdToken(idToken);
        redirect("/admin");
      } else {
        redirect("/login");
      }
    };

    setToken();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader size="lg" />
      <p className="text-center ">Влизане в системата...</p>
    </div>
  );
}
