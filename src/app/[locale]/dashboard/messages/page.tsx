import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MessageList } from "@/components/message-list";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MessagesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  // Get conversations (unique users the current user has messaged with)
  const { data: sentMessages } = await supabase
    .from("messages")
    .select("recipient_id, content, created_at, read_at, recipient:profiles!recipient_id(full_name)")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select("sender_id, content, created_at, read_at, sender:profiles!sender_id(full_name)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  // Build conversation list from latest messages
  const conversationMap = new Map<
    string,
    { userId: string; name: string; lastMessage: string; lastAt: string; unread: boolean }
  >();

  sentMessages?.forEach((m) => {
    const id = m.recipient_id;
    if (!conversationMap.has(id)) {
      conversationMap.set(id, {
        userId: id,
        name: (m.recipient as unknown as { full_name: string })?.full_name ?? "",
        lastMessage: m.content,
        lastAt: m.created_at,
        unread: false,
      });
    }
  });

  receivedMessages?.forEach((m) => {
    const id = m.sender_id;
    const existing = conversationMap.get(id);
    if (!existing || new Date(m.created_at) > new Date(existing.lastAt)) {
      conversationMap.set(id, {
        userId: id,
        name: (m.sender as unknown as { full_name: string })?.full_name ?? "",
        lastMessage: m.content,
        lastAt: m.created_at,
        unread: !m.read_at,
      });
    }
  });

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            {locale === "es" ? "Mi panel" : "Dashboard"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {locale === "es" ? "Mensajes" : "Messages"}
        </h1>

        {conversations.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            {locale === "es"
              ? "No tienes mensajes todavía."
              : "You don't have any messages yet."}
          </p>
        ) : (
          <MessageList conversations={conversations} currentUserId={user.id} />
        )}
      </main>
    </div>
  );
}
