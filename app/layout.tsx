import type { Metadata } from "next";
import "./globals.css";
import { SidebarNav } from "@/components/shell/SidebarNav";

export const metadata: Metadata = {
  title: "Speaker Intelligence — Mindvalley",
  description: "Cross-author performance and financial overview for Mindvalley masteries",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <SidebarNav />
        <main style={{ flex: 1, paddingLeft: "var(--mv-sidebar-width)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}