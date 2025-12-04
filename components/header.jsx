import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { CurrencySwitcher } from "./currency-switcher";
import HeaderControls from "./header-controls";
import { HeaderMobileControls } from "./header-mobile-controls";

const Header = async () => {
  await checkUser();
  return (
    <div className="fixed top-0 w-full bg-white dark:bg-slate-950 backdrop-blur-xl z-50 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="https://www.residentialschools.in/vendor-details/basavakalyan-engineering-college,-basavakalyan/MjgwMw=="
            alt="BKEC Logo"
            width={40}
            height={40}
            priority
          />
        </Link>

        {/* Center Navigation (large screens) */}
        <div className="hidden lg:flex items-center space-x-1">
          <SignedIn>
            <HeaderControls />
          </SignedIn>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <SignedIn>
            <HeaderMobileControls />
          </SignedIn>

          {/* Theme, Language, Currency Switchers */}
          <ThemeToggle />
          <LanguageSwitcher />
          <CurrencySwitcher />

          <SignedIn>
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="default"
                className="bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white shadow-lg"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </div>
  );
};

export default Header;
