import "./globals.css";
import { Almarai } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import Footer from "../../components/Footer";
import GlobalToast from "../../components/GlobalToast";
import path from "path";
import fs from "fs/promises";
import { notFound } from "next/navigation";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-almarai",
});

export const metadata = {
  title: "حافظ",
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const supportedLocales = ["ar", "en"];
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
  const messagesContent = await fs.readFile(messagesPath, "utf8");
  const messages = JSON.parse(messagesContent);

  const res = await fetch("https://hafez.share.net.sa/api/website-configuration", {
    cache: "no-store",
  });
  const result = await res.json();
  const config = result.success ? result.data : null;

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={almarai.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          {config && <Footer config={config} />}
          <GlobalToast />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
