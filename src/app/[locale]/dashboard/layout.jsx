// src/app/[locale]/dashboard/layout.jsx
import { NextIntlClientProvider } from "next-intl";
import path from "path";
import fs from "fs/promises";
import { notFound } from "next/navigation";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import ClientQueryProvider from "../../../components/ClientQueryProvider";
import GlobalToast from "../../../components/GlobalToast";

export default async function DashboardLayout({ children, params }) {
  const { locale } = await params;
  const supportedLocales = ["ar", "en"];
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
  let messages;
  try {
    const messagesContent = await fs.readFile(messagesPath, "utf8");
    // Ensure messages is a plain object
    messages = JSON.parse(messagesContent);
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClientQueryProvider>
        <GlobalToast />
        <DashboardNavbar locale={locale} />
        <main className="pt-24 p-4 min-h-screen max-w-7xl mx-auto lg:mt-12 mt-8">
          {children}
        </main>
      </ClientQueryProvider>
    </NextIntlClientProvider>
  );
}