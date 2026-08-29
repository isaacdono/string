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
  Share2,
  FileText,
  Smartphone,
  ArrowRight,
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
      const link = document.createElement("a");
      link.href = pdfDownloadUrl;
      link.target = "_blank";
      link.download = `blueprint-${campaignId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      const sampleContent = `%PDF-1.4\n% ByteMedia Blueprint Executivo\n% Campanha: ${campaignId}\n1 0 obj\n<< /Title (ByteMedia Blueprint) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
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
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const storyTemplates = [
    {
      title: "Story 1 — Aquecimento",
      text: "Galera, preparei algo exclusivo que vocês me pediram há meses. As vagas são super limitadas e abrem hoje às 20h! 🔥 Fiquem de olho!",
    },
    {
      title: "Story 2 — Lançamento",
      text: `ESTÁ LIBERADO! 🚀 Acessem o link e garantam o seu antes que esgote o lote: ${salesLink}`,
    },
  ];

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F5F4EF", color: "#0E0E0E" }}
    >
      {/* Header */}
      <header
        className="w-full px-6 sm:px-12 py-5 flex items-center justify-between border-b"
        style={{ borderColor: "#0E0E0E30" }}
      >
        <Link href="/" className="group">
          <span
            className="text-2xl tracking-tighter font-bold"
            style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
          >
            Byte<span style={{ color: "#FF4D00" }}>Media</span>
          </span>
        </Link>

        <div
          className="flex items-center gap-2 text-[10px] uppercase font-semibold tracking-[0.12em] px-4 py-2 rounded-full border"
          style={{ fontFamily: "var(--font-dm)", borderColor: "#FF4D00", color: "#FF4D00" }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#FF4D00" }} />
          Drop Ativo
        </div>
      </header>

      {/* Main */}
      <section className="flex-1 w-full max-w-3xl mx-auto px-6 sm:px-12 py-16 flex flex-col justify-center gap-10">

        {/* Hero celebration */}
        <div className="space-y-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#FF4D00" }}
          >
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-[1.05]"
            style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
          >
            Seu Drop<br />está{" "}
            <em className="not-italic" style={{ color: "#FF4D00" }}>pronto!</em>
          </h1>
          <p
            className="text-sm leading-relaxed max-w-md"
            style={{ fontFamily: "var(--font-dm)", color: "#666" }}
          >
            Baixe o Blueprint estratégico e compartilhe seu link de vendas com sua audiência agora.
          </p>
        </div>

        {/* Link de vendas — card escuro */}
        <div className="rounded-3xl p-7 space-y-5" style={{ backgroundColor: "#0E0E0E" }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5" style={{ color: "#FF4D00" }} />
              <h2
                className="font-bold text-base text-white"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                Página de Vendas (B2C)
              </h2>
            </div>
            <span
              className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded"
              style={{ backgroundColor: "#FF4D0015", color: "#FF4D00" }}
            >
              Checkout PIX Ativo
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div
              className="flex-1 px-4 py-3.5 rounded-xl font-mono text-xs sm:text-sm truncate select-all flex items-center gap-2"
              style={{ backgroundColor: "#1a1a1a", color: "#aaa", border: "1px solid #333" }}
            >
              <span className="select-none">🔗</span>
              <span className="truncate">{salesLink}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(salesLink, "link")}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={
                  copiedLink
                    ? { backgroundColor: "#222", color: "#FF4D00", border: "1px solid #333", fontFamily: "var(--font-syne)" }
                    : { backgroundColor: "#FF4D00", color: "#fff", fontFamily: "var(--font-syne)", boxShadow: "0 8px 24px -6px #FF4D0060" }
                }
              >
                {copiedLink ? (
                  <><Check className="w-4 h-4" /><span className="uppercase text-xs tracking-widest">Copiado!</span></>
                ) : (
                  <><Copy className="w-4 h-4" /><span className="uppercase text-xs tracking-widest">Copiar Link</span></>
                )}
              </button>

              <a
                href={salesLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-3.5 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: "#222", color: "#888", border: "1px solid #333" }}
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Blueprint PDF — card claro */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ backgroundColor: "#ECEAE3" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#FF4D00" }}
            >
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3
                  className="font-bold text-base"
                  style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
                >
                  Blueprint Estratégico (PDF)
                </h3>
                <span
                  className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#dddbd4", color: "#777" }}
                >
                  Relatório Executivo
                </span>
              </div>
              <p
                className="text-xs max-w-md leading-relaxed"
                style={{ fontFamily: "var(--font-dm)", color: "#666" }}
              >
                Persona, precificação, copy de alta conversão e projeção de receita.
              </p>
            </div>
          </div>

          <a
            href={pdfDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`blueprint-${campaignId}.pdf`}
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            style={{ backgroundColor: "#0E0E0E", color: "#fff", fontFamily: "var(--font-syne)" }}
          >
            <Download className="w-4 h-4" style={{ color: "#FF4D00" }} />
            <span className="uppercase text-xs tracking-widest">
              {isDownloading ? "Baixando..." : "Baixar PDF"}
            </span>
          </a>
        </div>

        {/* Story Templates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4" style={{ color: "#FF4D00" }} />
            <span
              className="font-bold text-sm"
              style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
            >
              Roteiro de Divulgação para Stories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {storyTemplates.map((template, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl space-y-4 flex flex-col justify-between"
                style={{ backgroundColor: "#ECEAE3" }}
              >
                <div>
                  <h4
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#FF4D00", fontFamily: "var(--font-dm)" }}
                  >
                    {template.title}
                  </h4>
                  <p
                    className="text-xs mt-2 leading-relaxed italic"
                    style={{ fontFamily: "var(--font-dm)", color: "#555" }}
                  >
                    &quot;{template.text}&quot;
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(template.text, "story", idx)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  style={
                    copiedStory === idx
                      ? { backgroundColor: "#FF4D0015", color: "#FF4D00", fontFamily: "var(--font-dm)" }
                      : { backgroundColor: "#dddbd4", color: "#555", fontFamily: "var(--font-dm)" }
                  }
                >
                  {copiedStory === idx ? (
                    <><Check className="w-3.5 h-3.5" /><span>Copiado!</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /><span>Copiar Texto</span></>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Voltar */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold transition-colors"
            style={{ fontFamily: "var(--font-dm)", color: "#999" }}
          >
            <span>Criar outro Drop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="w-full px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
        style={{ backgroundColor: "#0E0E0E", fontFamily: "var(--font-dm)", color: "#555" }}
      >
        <span>ByteMedia · Drop Engine v1.0</span>
        <span className="font-mono text-[10px]" style={{ color: "#444" }}>
          Campanha ID: {campaignId}
        </span>
      </footer>
    </main>
  );
}
