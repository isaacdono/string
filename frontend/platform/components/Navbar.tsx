import React from "react";

export default function Navbar() {
  return (
    <header
      className="w-full px-6 sm:px-12 py-5 flex items-center justify-between border-b bg-[#F5F4EF] sticky top-0 z-50"
      style={{ borderColor: "#0E0E0E20" }}
    >
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
        className="flex items-center gap-5 sm:gap-8 text-xs font-bold uppercase tracking-wider"
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
    </header>
  );
}
