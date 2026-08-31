"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { createCampaign } from "@/lib/api";
import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/HowItWorks";
import WhoWeAre from "@/components/WhoWeAre";

export default function HomePage() {
  const router = useRouter();
  const [handle, setHandle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [touched, setTouched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Normalize and validate handle format
  const normalizedHandle = useMemo(() => {
    let clean = handle.trim();
    if (!clean) return "";
    if (!clean.startsWith("@")) {
      clean = `@${clean}`;
    }
    return clean;
  }, [handle]);

  const validationResult = useMemo(() => {
    if (!handle.trim()) {
      return { isValid: false, message: "Informe seu @handle do Instagram ou TikTok." };
    }

    const testHandle = normalizedHandle;
    const handleRegex = /^@[a-zA-Z0-9._]{1,30}$/;

    if (!testHandle.startsWith("@")) {
      return { isValid: false, message: "O handle deve começar com @" };
    }

    if (testHandle === "@") {
      return { isValid: false, message: "Digite seu nome de usuário após o @" };
    }

    if (!handleRegex.test(testHandle)) {
      return {
        isValid: false,
        message: "Handle inválido. Use apenas letras, números, pontos e sublinhados.",
      };
    }

    return { isValid: true, message: null };
  }, [handle, normalizedHandle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHandle(e.target.value);
    if (apiError) setApiError(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!validationResult.isValid) {
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await createCampaign(normalizedHandle, description);
      if (response && response.campaign_id) {
        router.push(`/processing?id=${encodeURIComponent(response.campaign_id)}`);
      } else {
        throw new Error("ID da campanha não retornado pela API.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setApiError(
        err?.message ||
          "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    }
  };

  const isButtonDisabled = isLoading || (touched && !validationResult.isValid) || !handle.trim();

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F5F4EF", color: "#0E0E0E" }}
    >
      {/* Header */}
      <Navbar />

      {/* Hero */}
      <section id="home" className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 md:px-12 py-10 sm:py-16 md:py-24 flex flex-col justify-center gap-16">
        {/* Eyebrow */}
        <div className="flex items-start gap-6">
          <div
            className="hidden sm:block w-14 h-0.5 mt-3 flex-shrink-0"
            style={{ backgroundColor: "#FF4D00" }}
          />
          <p
            className="text-sm uppercase font-semibold tracking-[0.18em]"
            style={{ fontFamily: "var(--font-dm)", color: "#FF4D00" }}
          >
            IA Generativa · PIX Automático · Dossiê de Lançamento
          </p>
        </div>

        {/* Headline + Form side by side on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left: Headline */}
          <div className="space-y-6">
            <h1
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl leading-[1.0] font-extrabold"
              style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
            >
              Monetize<br />
              sua<br />
              audiência<br />
              em{" "}
              <em
                className="not-italic"
                style={{ color: "#FF4D00" }}
              >
                segundos.
              </em>
            </h1>
            <p
              className="text-base leading-relaxed max-w-sm"
              style={{ fontFamily: "var(--font-dm)", color: "#555550" }}
            >
              Digite seu perfil e sua ideia. A IA analisa, cria o copy, gera o checkout PIX e manda o Dossiê pra você em menos de 2 minutos.
            </p>

            {/* Value props */}
            <div className="pt-2 flex flex-col gap-2.5">
              {[
                "Sem login, sem burocracia",
                "Checkout PIX integrado",
                "Dossiê de Lançamento incluso",
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#FF4D0015", color: "#FF4D00" }}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: "var(--font-dm)", color: "#444" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form card */}
          <div
            className="rounded-3xl p-5 sm:p-8 space-y-6 border"
            style={{
              backgroundColor: "#0E0E0E",
              borderColor: "#0E0E0E",
            }}
          >
            <div className="space-y-1">
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                Criar meu Drop
              </h2>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-dm)", color: "#888" }}
              >
                Cole seu @ e conte a ideia. Fazemos o resto.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Handle Input */}
              <div className="space-y-2">
                <label
                  className="block text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ fontFamily: "var(--font-dm)", color: "#888" }}
                >
                  Perfil do Criador
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-4 flex items-center pointer-events-none font-semibold"
                    style={{ color: "#FF4D00" }}
                  >
                    @
                  </div>
                  <input
                    type="text"
                    value={handle.startsWith("@") ? handle.substring(1) : handle}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    placeholder="seu_perfil"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    className={`w-full pl-9 pr-4 py-3.5 rounded-xl text-white text-base focus:outline-none transition-all duration-200 ${
                      touched && !validationResult.isValid
                        ? "ring-2 ring-red-500/50"
                        : touched && validationResult.isValid
                        ? "ring-2 ring-[#FF4D00]/50"
                        : "focus:ring-2 focus:ring-[#FF4D00]/40"
                    }`}
                    style={{
                      backgroundColor: "#1a1a1a",
                      fontFamily: "var(--font-dm)",
                      border: "1px solid #333",
                    }}
                  />
                </div>
                {touched && !validationResult.isValid && validationResult.message && (
                  <div
                    className="flex items-center gap-1.5 text-xs px-1"
                    style={{ fontFamily: "var(--font-dm)", color: "#f87171" }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{validationResult.message}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ fontFamily: "var(--font-dm)", color: "#888" }}
                  >
                    Ideia do Drop
                  </label>
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-dm)", color: "#555" }}
                  >
                    Opcional
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  disabled={isLoading}
                  rows={3}
                  placeholder="Ex: E-book de planilhas de finanças pessoais por R$ 47,00..."
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/40 resize-none transition-all duration-200"
                  style={{
                    backgroundColor: "#1a1a1a",
                    fontFamily: "var(--font-dm)",
                    border: "1px solid #333",
                    color: "#e0e0e0",
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isButtonDisabled}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                style={
                  isButtonDisabled
                    ? {
                        backgroundColor: "#2a2a2a",
                        color: "#555",
                        fontFamily: "var(--font-syne)",
                        cursor: "not-allowed",
                      }
                    : {
                        backgroundColor: "#FF4D00",
                        color: "#fff",
                        fontFamily: "var(--font-syne)",
                        boxShadow: "0 8px 24px -6px #FF4D0060",
                      }
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="uppercase text-xs tracking-widest">Gerando com IA...</span>
                  </>
                ) : (
                  <>
                    <span className="uppercase text-xs tracking-widest">Gerar Drop com IA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* API Error */}
            {apiError && (
              <div
                className="p-4 rounded-xl text-sm flex items-start gap-3"
                style={{
                  backgroundColor: "#2a0a0a",
                  border: "1px solid #7f1d1d",
                  color: "#fca5a5",
                  fontFamily: "var(--font-dm)",
                }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-red-200 text-xs">Falha ao iniciar campanha</p>
                  <p className="text-xs opacity-80 leading-relaxed">{apiError}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Who We Are Section */}
      <WhoWeAre />

      {/* Bottom strip — preto com acento laranja */}
      <footer
        className="w-full px-4 sm:px-8 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs border-t"
        style={{
          backgroundColor: "#0E0E0E",
          borderColor: "#0E0E0E",
          color: "#555",
          fontFamily: "var(--font-dm)",
        }}
      >
        <span style={{ color: "#888" }}>ByteMedia · Plataforma B2B para Criadores</span>
        <span style={{ color: "#FF4D00", fontFamily: "var(--font-syne)" }}>
          Zero-Friction Drop Engine
        </span>
      </footer>
    </main>
  );
}
