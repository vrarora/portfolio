import type { Metadata } from "next";

import { AdminNotes } from "@/components/notes/AdminNotes";

export const metadata: Metadata = {
  title: "Notes moderation",
  robots: { index: false, follow: false },
};

export default function AdminNotesPage() {
  return <AdminNotes />;
}
