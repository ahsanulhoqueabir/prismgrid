import React from "react";
import { brand } from "@/config/brand.config";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
      <p>
        © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
      </p>
      <p className="mt-1 text-[10px] text-zinc-405 dark:text-zinc-500 font-medium">
        {brand.company.name} Energy Guard Control Node • Version 2.0
      </p>
    </footer>
  );
};
