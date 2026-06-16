"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ label = "Sign out" }: { label?: string }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button className="pill" onClick={logout} style={{ cursor: "pointer" }}>
      {label}
    </button>
  );
}
