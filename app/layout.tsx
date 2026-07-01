import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BoardProvider } from "@/context/BoardContext";
import { ADProvider } from "@/context/ADContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Compunet Kanban",
  description: "Tu gestor de proyectos cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jakarta.variable} antialiased bg-[--bg-base] text-[--text-primary]`}>
        <NextAuthProvider>
          <ADProvider>
            <BoardProvider>
              <ProjectProvider>
                <div className="flex flex-col h-screen overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-hidden">{children}</main>
                </div>
              </ProjectProvider>
            </BoardProvider>
          </ADProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
