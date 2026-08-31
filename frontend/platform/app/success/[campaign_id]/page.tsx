"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  CHECKOUT_BASE_URL,
  getBlueprintPdfUrl,
  fetchCampaignStatus,
  regenerateCampaign,
  CampaignStatusResponse,
} from "@/lib/api";

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.campaign_id as string) || "drop-demo-123";

  const [campaign, setCampaign] = useState<CampaignStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [customIdea, setCustomIdea] = useState<string>("");

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedStory, setCopiedStory] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const salesLink = `${CHECKOUT_BASE_URL}/d/${campaignId}`;
  const pdfDownloadUrl = getBlueprintPdfUrl(campaignId);

  useEffect(() => {
    async function loadCampaign() {
      try {
        const data = await fetchCampaignStatus(campaignId);
        if (data) {
          setCampaign(data);
        }
      } catch (err) {
        console.error("Error loading campaign details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaign();
  }, [campaignId]);

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

  const handleRegenerate = async (description: string) => {
    if (!description.trim()) return;
    setIsRegenerating(true);
    try {
      await regenerateCampaign(campaignId, description);
      router.push(`/processing?id=${encodeURIComponent(campaignId)}`);
    } catch (err) {
      console.error("Error regenerating campaign:", err);
      alert("Houve um erro ao solicitar a regeneração. Por favor, tente novamente.");
      setIsRegenerating(false);
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

  if (isLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F5F4EF" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF4D00" }} />
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ fontFamily: "var(--font-dm)", color: "#555" }}
          >
            Carregando detalhes do seu Drop...
          </p>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F5F4EF" }}
      >
        <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
          <p
            className="text-sm font-semibold uppercase tracking-wider text-red-500"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            Campanha não encontrada
          </p>
          <p className="text-xs text-gray-500">
            Não foi possível carregar os detalhes do drop para a campanha {campaignId}.
          </p>
          <Link
            href="/"
            className="mt-4 px-6 py-3 rounded-xl bg-[#0E0E0E] text-white text-xs uppercase tracking-wider font-bold"
          >
            Voltar ao Início
          </Link>
        </div>
      </main>
    );
  }

  const alternativeProducts = campaign.copy_data?.alternative_products || [];

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F5F4EF", color: "#0E0E0E" }}
    >
      {/* Header */}
      <header
        className="w-full px-4 sm:px-8 md:px-12 py-5 flex items-center justify-between border-b"
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
      <section className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-12 py-12 sm:py-16 flex flex-col justify-center gap-10">
        {/* Hero celebration */}
        <div className="space-y-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#FF4D00" }}
          >
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05]"
            style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
          >
            Seu Drop<br />está{" "}
            <em className="not-italic" style={{ color: "#FF4D00" }}>pronto!</em>
          </h1>
          <p
            className="text-sm leading-relaxed max-w-md"
            style={{ fontFamily: "var(--font-dm)", color: "#666" }}
          >
            Baixe seu Dossiê e compartilhe seu link de vendas com sua audiência agora.
          </p>

          <div
            className="mt-4 pt-1 flex flex-wrap gap-2 items-center"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            <span
              className="px-3.5 py-1.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: "#FF4D00" }}
            >
              {campaign.copy_data?.title || "Drop Exclusivo"}
            </span>
            <span
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border font-mono"
              style={{ borderColor: "#0E0E0E30", backgroundColor: "#ECEAE3" }}
            >
              R$ {campaign.price != null ? campaign.price.toFixed(2) : "0.00"}
            </span>
          </div>
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
              className="flex-1 px-4 py-3.5 rounded-xl font-mono text-xs sm:text-sm truncate select-all flex items-center gap-2 min-w-0"
              style={{ backgroundColor: "#1a1a1a", color: "#aaa", border: "1px solid #333" }}
            >
              <span className="select-none flex-shrink-0">🔗</span>
              <span className="truncate">{salesLink}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => copyToClipboard(salesLink, "link")}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px]"
                style={
                  copiedLink
                    ? { backgroundColor: "#222", color: "#FF4D00", border: "1px solid #333", fontFamily: "var(--font-syne)" }
                    : { backgroundColor: "#FF4D00", color: "#fff", fontFamily: "var(--font-syne)", boxShadow: "0 8px 24px -6px #FF4D0060" }
                }
              >
                {copiedLink ? (
                  <><Check className="w-4 h-4 flex-shrink-0" /><span className="uppercase text-[11px] sm:text-xs tracking-wider sm:tracking-widest truncate">Copiado!</span></>
                ) : (
                  <><Copy className="w-4 h-4 flex-shrink-0" /><span className="uppercase text-[11px] sm:text-xs tracking-wider sm:tracking-widest truncate">Copiar Link</span></>
                )}
              </button>

              <a
                href={salesLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-3.5 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                style={{ backgroundColor: "#222", color: "#888", border: "1px solid #333" }}
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Dossiê PDF — card claro */}
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
                  Dossiê de Lançamento (PDF)
                </h3>
                <span
                  className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#dddbd4", color: "#777" }}
                >
                  Estratégia Executiva
                </span>
              </div>
              <p
                className="text-xs max-w-md leading-relaxed"
                style={{ fontFamily: "var(--font-dm)", color: "#666" }}
              >
                Plano de 7 dias, hooks de conversão, copy validado e projeção de receita.
              </p>
            </div>
          </div>

          <a
            href={pdfDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`dossie-${campaignId}.pdf`}
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            style={{ backgroundColor: "#0E0E0E", color: "#fff", fontFamily: "var(--font-syne)" }}
          >
            <Download className="w-4 h-4" style={{ color: "#FF4D00" }} />
            <span className="uppercase text-xs tracking-widest">
              {isDownloading ? "Baixando..." : "Baixar Dossiê"}
            </span>
          </a>
        </div>

        {/* Quer mudar seu Drop? */}
        <div className="space-y-6 pt-8 border-t" style={{ borderColor: "#0E0E0E20" }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "#FF4D00" }} />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
              >
                Quer mudar seu Drop?
              </h3>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: "var(--font-dm)", color: "#666" }}
            >
              Não curtiu o produto sugerido? Escolha uma das 3 alternativas geradas pela IA abaixo para regenerar seu Drop instantaneamente, ou envie sua própria ideia.
            </p>
          </div>

          {alternativeProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {alternativeProducts.map((prod, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isRegenerating}
                  onClick={() => handleRegenerate(prod.description)}
                  className="p-4 sm:p-5 rounded-2xl text-left border border-transparent hover:border-[#FF4D00] flex flex-col justify-between h-full group disabled:opacity-50 transition-all duration-200"
                  style={{ backgroundColor: "#ECEAE3" }}
                  title={`Selecionar ${prod.title}`}
                >
                  <div className="space-y-2">
                    <span
                      className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: "#dddbd4", color: "#555", fontFamily: "var(--font-dm)" }}
                    >
                      {prod.product_type === "physical" ? "Físico" : "Digital"}
                    </span>
                    <h4
                      className="font-bold text-xs sm:text-sm leading-tight group-hover:text-[#FF4D00] transition-colors"
                      style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
                    >
                      {prod.title}
                    </h4>
                    <p
                      className="text-[10px] sm:text-xs leading-normal"
                      style={{ fontFamily: "var(--font-dm)", color: "#555" }}
                    >
                      {prod.description}
                    </p>
                  </div>
                  <div
                    className="mt-4 pt-3 border-t font-mono font-bold text-xs w-full flex items-center justify-between"
                    style={{ borderColor: "#0E0E0E10", color: "#0E0E0E" }}
                  >
                    <span>Preço</span>
                    <span>R$ {prod.price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p
              className="text-xs italic"
              style={{ fontFamily: "var(--font-dm)", color: "#999" }}
            >
              Nenhum produto alternativo disponível para esta campanha.
            </p>
          )}

          {/* Custom Idea Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegenerate(customIdea);
            }}
            className="space-y-3"
          >
            <label
              htmlFor="custom-idea-input"
              className="block text-[10px] uppercase tracking-wider font-bold"
              style={{ color: "#555", fontFamily: "var(--font-syne)" }}
            >
              Ou descreva sua própria ideia customizada:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="custom-idea-input"
                type="text"
                value={customIdea}
                onChange={(e) => setCustomIdea(e.target.value)}
                disabled={isRegenerating}
                placeholder="Ex: Quero um e-book de 30 páginas com receitas lowcarb de R$ 29..."
                className="flex-1 px-4 py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#FF4D00]"
                style={{
                  backgroundColor: "#ECEAE3",
                  color: "#0E0E0E",
                  border: "1px solid #0E0E0E25",
                  fontFamily: "var(--font-dm)",
                }}
              />
              <button
                type="submit"
                disabled={isRegenerating || !customIdea.trim()}
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                style={{ backgroundColor: "#0E0E0E", color: "#fff", fontFamily: "var(--font-syne)" }}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF4D00]" />
                    <span>Regenerando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#FF4D00]" />
                    <span>Regenerar Drop</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Voltar */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[#FF4D00]"
            style={{ fontFamily: "var(--font-dm)", color: "#999" }}
          >
            <span>Criar outro Drop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="w-full px-4 sm:px-8 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
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
