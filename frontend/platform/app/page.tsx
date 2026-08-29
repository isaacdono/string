"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { createCampaign } from "@/lib/api";

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
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-zinc-950">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Header / Brand */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Byte<span className="text-emerald-400">Media</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 border border-zinc-800 bg-zinc-900/60 backdrop-blur px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Zero-Click Drop Platform
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-6 py-8 text-center space-y-6 my-auto">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 rounded-full shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            NVIDIA Nemotron AI Engine
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400 leading-[1.1]">
            Monetize sua audiência em segundos.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Digite seu perfil e sua ideia. Nossa IA analisa seus seguidores, sintetiza a oferta ideal, gera o Blueprint em PDF e cria seu checkout PIX automático.
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-lg mx-auto space-y-4 text-left">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Handle Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Perfil do Criador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 font-semibold text-base">
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
                  className={`w-full pl-9 pr-4 py-3 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-base focus:outline-none transition-all duration-200 shadow-inner ${
                    touched && !validationResult.isValid
                      ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : touched && validationResult.isValid
                      ? "border-emerald-500/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      : "border-zinc-700/80 hover:border-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
              </div>

              {/* Validation Error Message */}
              {touched && !validationResult.isValid && validationResult.message && (
                <div className="flex items-center gap-2 text-xs text-red-400 px-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{validationResult.message}</span>
                </div>
              )}
            </div>

            {/* Description / Idea Text Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                  Ideia / Formato do Drop
                </label>
                <span className="text-[11px] text-zinc-500">Opcional</span>
              </div>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                disabled={isLoading}
                rows={3}
                placeholder="Ex: Quero lançar um e-book com planilha de templates de finanças pessoais por R$ 47,00 com vagas limitadas..."
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none transition-all duration-200 resize-none shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                isButtonDisabled
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                  : "bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 shadow-emerald-500/25 hover:shadow-emerald-500/40"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando Inteligência Artificial...</span>
                </>
              ) : (
                <>
                  <span>Gerar Drop com IA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* API / Network Error Banner */}
          {apiError && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-red-200">Falha ao iniciar campanha</p>
                <p className="text-xs text-red-300/90 leading-relaxed">{apiError}</p>
              </div>
            </div>
          )}

          {/* Value props bullets */}
          <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs text-zinc-400">
            <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Sem Login</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">IA Nemotron</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex flex-col items-center gap-1">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">PIX Instantâneo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ByteMedia MVP • Plataforma B2B para Criadores</span>
          <span>Zero-Friction Engine • Next.js 14 App Router</span>
        </div>
      </footer>
    </main>
  );
}
