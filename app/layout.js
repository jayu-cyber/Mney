import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ClientErrorLogger from "@/components/client-error-logger";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/lib/app-context";
import SignInListener from "@/components/signin-listener";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mney",
  description: "one stop solution for all your financial needs",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <AppProvider>
            <Toaster richColors />
            <SignInListener />
            <ClientErrorLogger />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
