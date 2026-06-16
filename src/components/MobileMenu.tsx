"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "./Avatar";

type LinkItem = { href: string; label: string };

export default function MobileMenu({
  links,
  session,
  signIn,
  signOut,
}: {
  links: LinkItem[];
  session: { name: string; avatar: string | null; points: number } | null;
  signIn: string;
  signOut: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // close the menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        className={`burger ${open ? "open" : ""}`}
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && <div className="nav-scrim" onClick={() => setOpen(false)} />}

      <div className={`mobile-panel ${open ? "open" : ""}`} role="dialog" aria-modal="true">
        <button className="mp-close" aria-label="Close menu" onClick={() => setOpen(false)}>
          ✕
        </button>
        {session && (
          <div className="mp-user">
            <Avatar src={session.avatar} name={session.name} size={44} />
            <div>
              <div className="mp-name">{session.name}</div>
              <div className="mp-pts">{session.points} pts</div>
            </div>
          </div>
        )}

        <nav className="mp-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {session ? (
          <button className="btn ghost" style={{ marginTop: 16, justifyContent: "center" }} onClick={logout}>
            {signOut}
          </button>
        ) : (
          <Link
            href="/login"
            className="btn primary"
            style={{ marginTop: 16, justifyContent: "center" }}
            onClick={() => setOpen(false)}
          >
            {signIn}
          </Link>
        )}
      </div>
    </>
  );
}
