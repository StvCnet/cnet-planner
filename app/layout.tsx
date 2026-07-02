import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { BoardProvider } from "@/context/BoardContext";
import { ADProvider } from "@/context/ADContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Header } from "@/components/layout/Header";

// Applied before hydration so there's no flash of the wrong theme on load.
// Key must match STORAGE_KEY in context/ThemeContext.tsx.
const THEME_INIT_SCRIPT = `
  try {
    var t = localStorage.getItem("cnet-theme-v1");
    if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (t === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
`;

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
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} antialiased bg-[--bg-base] text-[--text-primary]`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
