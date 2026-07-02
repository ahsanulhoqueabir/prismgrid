import React from "react";
import { IconSun, IconMoon, IconLogout } from "@tabler/icons-react";
import { brand } from "@/config/brand.config";
import type { NavbarProps } from "@/types/business/component.types";
import Image from "next/image";

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isDarkMode,
  toggleDarkMode,
  logout,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3.5 sm:px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center ">
          <Image alt={brand.name} src={"/logo.png"} height={40} width={40} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
            {brand.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:scale-105 transition active:scale-95 cursor-pointer"
          title="Toggle theme"
        >
          {isDarkMode ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>

        {/* Profile Name */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 leading-none">
            {user?.name}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">
            {user?.email}
          </span>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition active:scale-95 cursor-pointer"
        >
          <IconLogout />
        </button>
      </div>
    </header>
  );
};
