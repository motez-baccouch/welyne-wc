import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/i18n.server";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");
  return <LoginForm lang={getLang()} />;
}
