"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header
      className="w-full px-4 sm:px-8 md:px-12 py-5 flex flex-col justify-between border-b bg-[#F5F4EF] sticky top-0 z-50"
      style={{ borderColor: "#0E0E0E20" }}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a
            href="#home"
            className="text-2xl tracking-tighter font-bold transition-opacity hover:opacity-80"
            style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
          >
            Byte<span style={{ color: "#FF4D00" }}>Media</span>
          </a>
        </div>

        <nav
          className="hidden sm:flex items-center gap-5 sm:gap-8 text-xs font-bold uppercase tracking-wider"
          style={{ fontFamily: "var(--font-dm)", color: "#0E0E0E" }}
        >
          <a
            href="#home"
            className="transition-colors hover:text-[#FF4D00]"
          >
            Home
          </a>
          <a
            href="#como-funciona"
            className="transition-colors hover:text-[#FF4D00]"
          >
            Como Funciona
          </a>
          <a
            href="#quem-somos"
            className="transition-colors hover:text-[#FF4D00]"
          >
            Quem Somos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-2 text-[10px] uppercase font-semibold tracking-[0.12em] px-4 py-2 rounded-full border"
            style={{
              fontFamily: "var(--font-dm)",
              borderColor: "#0E0E0E",
              color: "#0E0E0E",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#FF4D00" }}
            />
            Drop Platform Ativo
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 text-[#0E0E0E] hover:text-[#FF4D00] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav
          className="sm:hidden flex flex-col gap-4 pt-4 pb-2 border-t mt-4 text-xs font-bold uppercase tracking-wider animate-fadeIn"
          style={{ fontFamily: "var(--font-dm)", borderColor: "#0E0E0E20", color: "#0E0E0E" }}
        >
          <a
            href="#home"
            onClick={() => setIsMobileMenuOpen(false)}
            className="transition-colors hover:text-[#FF4D00] py-1"
          >
            Home
          </a>
          <a
            href="#como-funciona"
            onClick={() => setIsMobileMenuOpen(false)}
            className="transition-colors hover:text-[#FF4D00] py-1"
          >
            Como Funciona
          </a>
          <a
            href="#quem-somos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="transition-colors hover:text-[#FF4D00] py-1"
          >
            Quem Somos
          </a>
          <div
            className="flex items-center gap-2 text-[10px] uppercase font-semibold tracking-[0.12em] px-4 py-2 rounded-full border w-fit mt-2"
            style={{
              fontFamily: "var(--font-dm)",
              borderColor: "#0E0E0E",
              color: "#0E0E0E",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#FF4D00" }}
            />
            Drop Platform Ativo
          </div>
        </nav>
      )}
    </header>
  );
}
