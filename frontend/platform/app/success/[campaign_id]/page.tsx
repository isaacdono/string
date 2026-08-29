"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Sparkles,
  Share2,
  FileText,
  Smartphone,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CHECKOUT_BASE_URL, getBlueprintPdfUrl } from "@/lib/api";

export default function SuccessPage() {
  const params = useParams();
  const campaignId = (params?.campaign_id as string) || "drop-demo-123";

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedStory, setCopiedStory] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const salesLink = `${CHECKOUT_BASE_URL}/d/${campaignId}`;
  const pdfDownloadUrl = getBlueprintPdfUrl(campaignId);

  const copyToClipboard = async (text: string, type: "link" | "story", storyIndex?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else if (typeof storyIndex === "number") {
        setCopiedStory(storyIndex);
        setTimeout(() => setCopiedStory(null), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      // Try direct navigation or fetch from backend-ai static directory
      const link = document.createElement("a");
      link.href = pdfDownloadUrl;
      link.target = "_blank";
      link.download = `blueprint-${campaignId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback blob
      const sampleContent = `%PDF-1.4\n% ByteMedia Blueprint Executivo\n% Campanha: ${campaignId}\n% Gerado via NVIDIA Nemotron AI Engine\n1 0 obj\n<< /Title (ByteMedia Blueprint - ${campaignId}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      const blob = new Blob([sampleContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `blueprint-${campaignId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 800);
    }
  };

  const storyTemplates = [
    {
      title: "Story 1: Aquecimento (Curiosidade)",
      text: "Galera, preparei algo exclusivo que vocês me pediram há meses. As vagas são super limitadas e abrem hoje às 20h! 🔥 Fiquem de olho!",
    },
    {
      title: "Story 2: Lançamento com Adesivo de Link",
      text: `ESTÁ LIBERADO! 🚀 Acessem o link e garantam o seu antes que esgote o lote: ${salesLink}`,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-zinc-950">
      {/* Background glowing gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/15 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Byte<span className="text-emerald-400">Media</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-emerald-400 border border-emerald-800/60 bg-emerald-950/60 backdrop-blur px-3 py-1.5 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Drop Ativo & Publicado
        </div>
      </header>

      {/* Main Container */}
      <section className="relative z-10 w-full max-w-3xl mx-auto px-6 py-8 space-y-8 my-auto">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Seu Drop está pronto!
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            A IA concluiu a síntese da sua oferta. Baixe o Blueprint estratégico e compartilhe seu link de vendas com sua audiência.
          </p>
        </div>

        {/* Primary Action Card: Sales Link */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base text-white">Página de Vendas do Drop (B2C)</h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Checkout PIX Ativo
            </span>
          </div>

          {/* Link box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs sm:text-sm text-zinc-300 truncate select-all flex items-center gap-2">
              <span className="text-zinc-600 select-none">🔗</span>
              <span className="truncate">{salesLink}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(salesLink, "link")}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  copiedLink
                    ? "bg-emerald-600 text-white shadow-emerald-600/30"
                    : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20 active:scale-[0.98]"
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link de Vendas</span>
                  </>
                )}
              </button>

              <a
                href={salesLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center justify-center"
                title="Abrir página do drop em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Blueprint PDF Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Blueprint Estratégico (PDF)</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Relatório Executivo
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                Contém o estudo de persona, análise de precificação, copy de alta conversão e projeção de receita.
              </p>
            </div>
          </div>

          <a
            href={pdfDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`blueprint-${campaignId}.pdf`}
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md flex-shrink-0 text-center"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isDownloading ? "Baixando..." : "Baixar Blueprint (PDF)"}</span>
          </a>
        </div>

        {/* Story Snippets (US11) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold text-sm">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Roteiro de Divulgação para Stories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {storyTemplates.map((template, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400">{template.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed italic">
                    &quot;{template.text}&quot;
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(template.text, "story", idx)}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedStory === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action: Create another drop */}
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <span>Deseja criar outro Drop? Voltar para o início</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ByteMedia • Drop Engine v1.0</span>
          <span>Campanha ID: {campaignId}</span>
        </div>
      </footer>
    </main>
  );
}
