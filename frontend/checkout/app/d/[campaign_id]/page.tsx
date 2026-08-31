"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Check,
  Copy,
  ArrowRight,
  Lock,
  QrCode,
  Loader2,
  AlertCircle,
  X,
  MessageCircle,
} from "lucide-react";
import { useCheckout } from "@/lib/useCheckout";
import { formatCPF, formatCurrency } from "@/lib/utils";

export default function DropSalesPage() {
  const params = useParams();
  const campaignId = (params?.campaign_id as string) || "demo-drop";

  const {
    campaign,
    isLoading,
    loadError,
    isModalOpen,
    setIsModalOpen,
    checkoutStep,
    setCheckoutStep,
    buyerName,
    setBuyerName,
    email,
    setEmail,
    cpf,
    setCpf,
    formErrors,
    isSubmitting,
    checkoutError,
    orderId,
    pixQrCode,
    pixCopyPaste,
    copiedPix,
    timeLeft,
    handleCheckoutSubmit,
    handleCopyPix,
  } = useCheckout(campaignId);

  // ByteMedia brand constants — no dynamic theming
  const primaryColor = "#FF4D00";
  const textColor = "#0E0E0E";
  const subtextColor = "#555550";
  const cardBg = "rgba(0,0,0,0.03)";
  const cardBorder = "rgba(0,0,0,0.08)";
  const BG = "#F5F4EF";

  // Clean handle calculation (prevents @s or empty handle bugs)
  const cleanHandle = (() => {
    const raw = campaign?.handle?.trim();
    if (!raw || raw === "@" || raw === "@s" || raw === "s") return "";
    return raw.startsWith("@") ? raw : `@${raw}`;
  })();

  if (isLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F5F4EF" }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF4D00" }} />
          <p className="text-sm font-medium" style={{ fontFamily: "var(--font-dm)", color: "#777" }}>
            Carregando conteúdo...
          </p>
        </div>
      </main>
    );
  }

  if (loadError || !campaign) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
            Página Indisponível
          </h2>
          <p className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-dm)", lineHeight: 1.6 }}>
            {loadError || "A oferta solicitada não foi encontrada ou já expirou."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col pb-28"
      style={{ backgroundColor: BG, color: textColor }}
    >
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Minimal Header */}
        <header className="flex items-center justify-between border-b pb-4" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-2">
            {cleanHandle ? (
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "var(--font-syne)", color: textColor }}
              >
                {cleanHandle}
              </span>
            ) : (
              <span
                className="font-bold text-sm tracking-tight"
                style={{ fontFamily: "var(--font-syne)", color: textColor }}
              >
                Byte<span style={{ color: primaryColor }}>Media</span>
              </span>
            )}
          </div>

          <div
            className="px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider"
            style={{ backgroundColor: cardBg, color: subtextColor, border: `1px solid ${cardBorder}` }}
          >
            Oferta Especial
          </div>
        </header>

        {/* Countdown Timer */}
        <section
          className="p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs"
          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: textColor }}>
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
            <span>Condição especial expira em:</span>
          </div>
          <div
            className="font-mono font-bold text-sm tracking-wider flex-shrink-0"
            style={{ color: primaryColor }}
          >
            {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </div>
        </section>

        {/* Title + Hero */}
        <section className="space-y-4">
          <div className="space-y-3">
            {/* Format badge — what kind of product it is */}
            {campaign?.copy_data.format && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}30`,
                    fontFamily: "var(--font-dm)",
                  }}
                >
                  {/* icon based on format */}
                  {campaign.copy_data.format.toLowerCase().includes("curso") ||
                  campaign.copy_data.format.toLowerCase().includes("vídeo") ||
                  campaign.copy_data.format.toLowerCase().includes("video")
                    ? "▶ "
                    : campaign.copy_data.format.toLowerCase().includes("mentoria")
                    ? "🎯 "
                    : campaign.copy_data.format.toLowerCase().includes("comunidade") ||
                      campaign.copy_data.format.toLowerCase().includes("grupo")
                    ? "👥 "
                    : campaign.copy_data.format.toLowerCase().includes("planilha") ||
                      campaign.copy_data.format.toLowerCase().includes("template")
                    ? "📊 "
                    : "📄 "}
                  {campaign.copy_data.format}
                </span>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: subtextColor, fontFamily: "var(--font-dm)" }}
                >
                  · Acesso imediato após pagamento
                </span>
              </div>
            )}

            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-[1.15]"
              style={{ fontFamily: "var(--font-syne)", color: textColor }}
            >
              {campaign?.copy_data.title}
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
            >
              {campaign?.copy_data.subtitle}
            </p>
          </div>


          {/* Pricing Box */}
          <div
            className="py-4 border-t border-b flex items-center justify-between flex-wrap gap-2"
            style={{ borderColor: cardBorder }}
          >
            <div className="space-y-0.5">
              <span
                className="text-[10px] uppercase font-bold tracking-wider block"
                style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
              >
                Valor
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ fontFamily: "var(--font-syne)", color: primaryColor }}
                >
                  {formatCurrency(campaign?.price || 0.0)}
                </span>
                <span className="text-sm line-through opacity-50" style={{ color: subtextColor }}>
                  {formatCurrency((campaign?.price || 0.0) * 2.5)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-lg inline-block"
                style={{ backgroundColor: cardBg, color: textColor, border: `1px solid ${cardBorder}` }}
              >
                PIX à vista
              </span>
            </div>
          </div>

          {/* Hooks / Highlights */}
          {campaign?.copy_data.hooks && campaign.copy_data.hooks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {campaign.copy_data.hooks.map((hook, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    color: textColor,
                    fontFamily: "var(--font-dm)",
                  }}
                >
                  {hook}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Benefits List */}
        {campaign?.copy_data.benefits && campaign.copy_data.benefits.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
            >
              O que está incluído:
            </h2>
            <div className="space-y-2.5">
              {campaign.copy_data.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <p
                    className="text-sm leading-snug"
                    style={{ fontFamily: "var(--font-dm)", color: textColor }}
                  >
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {campaign?.copy_data.social_proof_quotes && campaign.copy_data.social_proof_quotes.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
            >
              <MessageCircle className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              Feedback da comunidade:
            </h2>
            <div className="space-y-2.5">
              {campaign.copy_data.social_proof_quotes.map((quote, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl space-y-1.5 text-xs"
                  style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <span
                    className="font-semibold block"
                    style={{ fontFamily: "var(--font-dm)", color: textColor }}
                  >
                    @{quote.user.replace(/^@/, "")}
                  </span>
                  <p
                    className="leading-relaxed opacity-90"
                    style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
                  >
                    &quot;{quote.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Guarantee */}
        <section
          className="p-4 rounded-xl text-center space-y-1.5"
          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div
            className="flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs"
            style={{ fontFamily: "var(--font-dm)", color: textColor }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
            Garantia de 7 dias
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
          >
            Acesso imediato após o pagamento. Reembolso simples caso precise.
          </p>
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 p-4 border-t"
        style={{
          backgroundColor: "rgba(245,244,239,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: cardBorder,
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span
              className="text-[10px] uppercase font-bold tracking-wider block"
              style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
            >
              Valor total
            </span>
            <div
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-syne)", color: primaryColor }}
            >
              {formatCurrency(campaign?.price || 0.0)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCheckoutSubmit()}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: primaryColor,
              color: "#fff",
              fontFamily: "var(--font-syne)",
              boxShadow: `0 4px 16px -4px ${primaryColor}44`,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="uppercase text-xs tracking-wider font-extrabold">Redirecionando...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span className="uppercase text-xs tracking-wider font-extrabold">Garantir Acesso</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <div className="text-center mt-2 opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
              Checkout Seguro via Mercado Pago
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-t-2xl p-4 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "#FFFFFF",
              color: textColor,
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between border-b pb-3"
              style={{ borderColor: cardBorder }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
                <h3
                  className="font-bold text-xs uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-syne)", color: textColor }}
                >
                  {checkoutStep === "form" && "Checkout Seguro (Mercado Pago)"}
                  {checkoutStep === "pix" && "Pagamento via PIX"}
                  {checkoutStep === "success" && "Compra Confirmada"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "#E5E7EB",
                  color: subtextColor,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: FORM */}
            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div
                  className="p-3 rounded-xl flex items-center justify-between text-xs font-medium"
                  style={{
                    backgroundColor: "#F3F4F6",
                    border: `1px solid ${cardBorder}`,
                  }}
                >
                  <span
                    className="truncate max-w-[200px]"
                    style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
                  >
                    {campaign?.copy_data.title}
                  </span>
                  <span className="font-bold font-mono" style={{ color: primaryColor }}>
                    {formatCurrency(campaign?.price || 0.0)}
                  </span>
                </div>

                {[
                  { label: "Nome Completo", value: buyerName, setter: setBuyerName, type: "text", placeholder: "Ex: Lucas da Silva", error: formErrors.name },
                  { label: "E-mail para entrega", value: email, setter: setEmail, type: "email", placeholder: "lucas@exemplo.com", error: formErrors.email },
                ].map(({ label, value, setter, type, placeholder, error }) => (
                  <div key={label} className="space-y-1">
                    <label
                      className="block text-[10px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className={`w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none transition-colors ${
                        "placeholder-zinc-400"
                      }`}
                      style={{
                        backgroundColor: "#F3F4F6",
                        border: `1px solid ${cardBorder}`,
                        color: textColor,
                        fontFamily: "var(--font-dm)",
                      }}
                    />
                    {error && (
                      <p className="text-[11px] text-red-400 px-1" style={{ fontFamily: "var(--font-dm)" }}>
                        {error}
                      </p>
                    )}
                  </div>
                ))}

                <div className="space-y-1">
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
                  >
                    CPF (Exigido para PIX)
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className={`w-full px-3.5 py-3 rounded-xl text-sm font-mono focus:outline-none transition-colors ${
                      "placeholder-zinc-400"
                    }`}
                    style={{
                      backgroundColor: "#F3F4F6",
                      border: `1px solid ${cardBorder}`,
                      color: textColor,
                      fontFamily: "var(--font-dm)",
                    }}
                  />
                  {formErrors.cpf && (
                    <p className="text-[11px] text-red-400 px-1" style={{ fontFamily: "var(--font-dm)" }}>
                      {formErrors.cpf}
                    </p>
                  )}
                </div>

                {checkoutError && (
                  <div
                    className="p-3 rounded-xl text-xs flex items-center gap-2"
                    style={{ backgroundColor: "#2a0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span style={{ fontFamily: "var(--font-dm)" }}>{checkoutError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
                  style={{
                    backgroundColor: primaryColor,
                    color: "#fff",
                    fontFamily: "var(--font-syne)",
                    boxShadow: `0 4px 16px -4px ${primaryColor}44`,
                  }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Gerando PIX...</span></>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /><span>Gerar Pagamento PIX</span></>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: PIX */}
            {checkoutStep === "pix" && (
              <div className="space-y-5 text-center">
                <div className="space-y-1">
                  <p className="text-xs" style={{ fontFamily: "var(--font-dm)", color: subtextColor }}>
                    Escaneie o QR Code ou copie o código no app do seu banco:
                  </p>
                  <p
                    className="text-2xl font-black"
                    style={{ fontFamily: "var(--font-syne)", color: primaryColor }}
                  >
                    {formatCurrency(campaign?.price || 0.0)}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl w-44 h-44 sm:w-48 sm:h-48 max-w-full mx-auto flex items-center justify-center shadow-xl">
                  {pixQrCode && pixQrCode.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pixQrCode} alt="PIX QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-900 gap-2">
                      <QrCode className="w-24 h-24 text-zinc-900" />
                      <span className="text-[9px] uppercase tracking-widest font-mono font-bold">PIX SEGURA</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
                  >
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCopyPaste}
                      className="flex-1 px-3 py-2.5 rounded-xl font-mono text-xs truncate"
                      style={{
                        backgroundColor: "#F3F4F6",
                        border: `1px solid ${cardBorder}`,
                        color: subtextColor,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 uppercase tracking-wider transition-all"
                      style={{
                        backgroundColor: copiedPix ? "#16a34a" : primaryColor,
                        color: "#fff",
                        fontFamily: "var(--font-syne)",
                      }}
                    >
                      {copiedPix ? (
                        <><Check className="w-3.5 h-3.5" /><span>Copiado!</span></>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /><span>Copiar</span></>
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl flex items-center justify-center gap-2 text-xs"
                  style={{
                    backgroundColor: "#F3F4F6",
                    border: `1px solid ${cardBorder}`,
                    color: subtextColor,
                    fontFamily: "var(--font-dm)",
                  }}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: primaryColor }} />
                  Aguardando confirmação do banco...
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS */}
            {checkoutStep === "success" && (
              <div className="py-4 space-y-5 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ backgroundColor: primaryColor }}
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-1.5">
                  <h4
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-syne)", color: textColor }}
                  >
                    Pagamento Aprovado!
                  </h4>
                  <p
                    className="text-xs max-w-sm mx-auto leading-relaxed"
                    style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
                  >
                    O acesso foi enviado para o e-mail:
                  </p>
                  <p
                    className="text-sm font-bold font-mono"
                    style={{ color: textColor }}
                  >
                    {email || "seu-email@exemplo.com"}
                  </p>
                </div>

                <div
                  className="p-3.5 rounded-xl text-left text-xs space-y-1.5 font-mono"
                  style={{
                    backgroundColor: "#F3F4F6",
                    border: `1px solid ${cardBorder}`,
                    color: subtextColor,
                  }}
                >
                  <div className="flex justify-between">
                    <span>Pedido:</span>
                    <span className="font-bold" style={{ color: textColor }}>
                      {orderId ? orderId.slice(0, 8) : "ORD-9912"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-bold" style={{ color: primaryColor }}>APROVADO</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-xs uppercase tracking-wider"
                  style={{ backgroundColor: primaryColor, fontFamily: "var(--font-syne)" }}
                >
                  Concluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
