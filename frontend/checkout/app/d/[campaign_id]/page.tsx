"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Check,
  Copy,
  Zap,
  ArrowRight,
  Lock,
  QrCode,
  Loader2,
  AlertCircle,
  X,
  Heart,
  MessageCircle,
  BadgeCheck,
} from "lucide-react";
import { useCheckout } from "@/lib/useCheckout";
import { formatCPF, formatCurrency } from "@/lib/utils";

export default function DropSalesPage() {
  const params = useParams();
  const campaignId = (params?.campaign_id as string) || "demo-drop";

  const {
    campaign,
    isLoading,
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
    isSimulating,
    timeLeft,
    primaryColor,
    backgroundColor,
    avatarUrl,
    handleCheckoutSubmit,
    handleCopyPix,
    handleSimulatePayment,
  } = useCheckout(campaignId);

  // Decide text color based on background luminance
  // Light backgrounds get dark text, dark backgrounds get white text
  const isDarkBg = (() => {
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  })();

  const textColor = isDarkBg ? "#FFFFFF" : "#0E0E0E";
  const subtextColor = isDarkBg ? "#aaaaaa" : "#555550";
  const cardBg = isDarkBg ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const cardBorder = isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  if (isLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F5F4EF" }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF4D00" }} />
          <p className="text-sm" style={{ fontFamily: "var(--font-dm)", color: "#777" }}>
            Carregando Drop exclusivo...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col pb-28"
      style={{ backgroundColor: backgroundColor, color: textColor }}
    >
      <div className="w-full max-w-md mx-auto px-6 py-8 space-y-8">

        {/* Creator Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-full p-0.5 shadow-md flex-shrink-0"
              style={{ border: `2px solid ${primaryColor}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={campaign?.handle || "Creator"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-sm"
                  style={{ fontFamily: "var(--font-syne)", color: textColor }}
                >
                  {campaign?.handle}
                </span>
                <BadgeCheck className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <span
                className="text-[10px] uppercase font-semibold tracking-wider"
                style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
              >
                Criador Verificado · ByteMedia Drop
              </span>
            </div>
          </div>

          <div
            className="px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5"
            style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            Drop Ativo
          </div>
        </header>

        {/* Scarcity Block */}
        <section
          className="p-4 rounded-2xl space-y-3"
          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5" style={{ color: "#F59E0B" }}>
              <Flame className="w-4 h-4 fill-amber-500" style={{ color: "#F59E0B" }} />
              Vagas Limitadas — Lote 1
            </div>
            <div
              className="flex items-center gap-1 font-mono"
              style={{ color: subtextColor }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: isDarkBg ? "#333" : "#E0DED8" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: "78%", backgroundColor: primaryColor }}
              />
            </div>
            <div
              className="flex justify-between text-[10px] uppercase font-bold tracking-widest"
              style={{ color: subtextColor }}
            >
              <span>78% preenchidas</span>
              <span style={{ color: primaryColor }}>Restam poucas unidades</span>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="space-y-5">
          <div className="space-y-3">
            <h1
              className="text-3xl sm:text-4xl font-extrabold leading-[1.1]"
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

          {/* Preço */}
          <div
            className="py-4 flex items-center justify-between border-t border-b"
            style={{ borderColor: cardBorder }}
          >
            <div>
              <span
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
              >
                Valor Especial do Drop
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className="text-3xl font-black tracking-tight"
                  style={{ fontFamily: "var(--font-syne)", color: primaryColor }}
                >
                  {formatCurrency(campaign?.price || 97.0)}
                </span>
                <span className="text-sm line-through" style={{ color: subtextColor }}>
                  {formatCurrency((campaign?.price || 97.0) * 2.5)}
                </span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span
                className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded inline-block"
                style={{ backgroundColor: cardBg, color: subtextColor }}
              >
                PIX À Vista
              </span>
              <p className="text-[10px]" style={{ color: subtextColor }}>Liberação Imediata</p>
            </div>
          </div>

          {/* Hooks */}
          <div className="flex flex-wrap gap-2">
            {campaign?.copy_data.hooks?.map((hook, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  color: textColor,
                  fontFamily: "var(--font-dm)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                {hook}
              </span>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="space-y-4">
          <h2
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
          >
            <Zap className="w-4 h-4" style={{ color: primaryColor }} />
            O que você vai receber
          </h2>
          <div className="space-y-3">
            {campaign?.copy_data.benefits?.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
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

        {/* Social Proof */}
        <section className="space-y-4">
          <h2
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
          >
            <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
            Comentários da Comunidade
          </h2>
          <div className="space-y-3">
            {campaign?.copy_data.social_proof_quotes?.map((quote, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl space-y-2 text-xs"
                style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-bold"
                    style={{ fontFamily: "var(--font-syne)", color: textColor }}
                  >
                    @{quote.user}
                  </span>
                  <div className="flex items-center gap-1" style={{ color: "#f43f5e" }}>
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span className="text-[10px] font-semibold" style={{ color: subtextColor }}>
                      {14 + i * 9}
                    </span>
                  </div>
                </div>
                <p
                  className="leading-relaxed italic"
                  style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
                >
                  &quot;{quote.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <section
          className="p-4 rounded-2xl text-center space-y-2"
          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div
            className="flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[10px]"
            style={{ fontFamily: "var(--font-dm)", color: textColor }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
            Garantia Incondicional de 7 Dias
          </div>
          <p
            className="text-[10px] max-w-xs mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
          >
            Se você não gostar do conteúdo, devolvemos 100% do seu dinheiro sem burocracia.
          </p>
        </section>
      </div>

      {/* Sticky Bottom CTA */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 p-4 border-t"
        style={{
          backgroundColor: isDarkBg ? "rgba(0,0,0,0.85)" : "rgba(245,244,239,0.92)",
          backdropFilter: "blur(12px)",
          borderColor: cardBorder,
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span
              className="text-[9px] uppercase font-bold tracking-wider"
              style={{ fontFamily: "var(--font-dm)", color: subtextColor }}
            >
              Total
            </span>
            <div
              className="text-2xl font-black tracking-tight"
              style={{ fontFamily: "var(--font-syne)", color: primaryColor }}
            >
              {formatCurrency(campaign?.price || 97.0)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setIsModalOpen(true); setCheckoutStep("form"); }}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: primaryColor,
              color: "#fff",
              fontFamily: "var(--font-syne)",
              boxShadow: `0 8px 24px -6px ${primaryColor}55`,
            }}
          >
            <Lock className="w-4 h-4" />
            <span className="uppercase text-xs tracking-wider">Garantir Minha Vaga</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-t-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#0E0E0E" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
                <h3
                  className="font-bold text-sm uppercase tracking-wider text-white"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {checkoutStep === "form" && "Checkout Seguro PIX"}
                  {checkoutStep === "pix" && "Pagamento via PIX"}
                  {checkoutStep === "success" && "Compra Confirmada!"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: "#222", color: "#777", border: "1px solid #333" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: FORM */}
            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div
                  className="p-3.5 rounded-xl flex items-center justify-between text-xs"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                >
                  <span className="text-zinc-400 truncate max-w-[200px]" style={{ fontFamily: "var(--font-dm)" }}>
                    {campaign?.copy_data.title}
                  </span>
                  <span className="font-bold font-mono" style={{ color: primaryColor }}>
                    {formatCurrency(campaign?.price || 97.0)}
                  </span>
                </div>

                {[
                  { label: "Nome Completo", value: buyerName, setter: setBuyerName, type: "text", placeholder: "Ex: Lucas da Silva", error: formErrors.name },
                  { label: "E-mail (para receber o acesso)", value: email, setter: setEmail, type: "email", placeholder: "lucas@exemplo.com", error: formErrors.email },
                ].map(({ label, value, setter, type, placeholder, error }) => (
                  <div key={label} className="space-y-1.5">
                    <label
                      className="block text-[10px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-dm)", color: "#888" }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3.5 py-3 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none transition-colors"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #333", fontFamily: "var(--font-dm)" }}
                    />
                    {error && (
                      <p className="text-[11px] text-red-400 px-1" style={{ fontFamily: "var(--font-dm)" }}>
                        {error}
                      </p>
                    )}
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-dm)", color: "#888" }}
                  >
                    CPF (Exigido pelo Asaas PIX)
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-3 rounded-xl text-white placeholder-zinc-600 text-sm font-mono focus:outline-none transition-colors"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #333", fontFamily: "var(--font-dm)" }}
                  />
                  {formErrors.cpf && (
                    <p className="text-[11px] text-red-400 px-1" style={{ fontFamily: "var(--font-dm)" }}>
                      {formErrors.cpf}
                    </p>
                  )}
                </div>

                {checkoutError && (
                  <div
                    className="p-3.5 rounded-xl text-xs flex items-center gap-2"
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
                    boxShadow: `0 8px 24px -6px ${primaryColor}55`,
                  }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Gerando PIX...</span></>
                  ) : (
                    <><QrCode className="w-4 h-4" /><span>Gerar Pagamento PIX</span></>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: PIX */}
            {checkoutStep === "pix" && (
              <div className="space-y-6 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400" style={{ fontFamily: "var(--font-dm)" }}>
                    Escaneie o QR Code ou use a chave Copia e Cola no app do seu banco:
                  </p>
                  <p
                    className="text-2xl font-black"
                    style={{ fontFamily: "var(--font-syne)", color: primaryColor }}
                  >
                    {formatCurrency(campaign?.price || 97.0)}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-xl">
                  {pixQrCode && pixQrCode.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pixQrCode} alt="PIX QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-900 gap-2">
                      <QrCode className="w-28 h-28 text-zinc-900" />
                      <span className="text-[9px] uppercase tracking-widest font-mono font-bold">PIX ASAAS</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-left">
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-dm)", color: "#888" }}
                  >
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCopyPaste}
                      className="flex-1 px-3 py-2.5 rounded-xl font-mono text-xs text-zinc-400 truncate"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
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
                  className="p-3.5 rounded-xl flex items-center justify-center gap-2 text-xs"
                  style={{ backgroundColor: "#1a1a1a", color: "#777", fontFamily: "var(--font-dm)" }}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: primaryColor }} />
                  Aguardando compensação automática...
                </div>

                <div className="pt-4 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isSimulating}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "#1a1a1a",
                      color: "#888",
                      border: "1px solid #333",
                      fontFamily: "var(--font-dm)",
                    }}
                  >
                    {isSimulating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Simulando...</span></>
                    ) : (
                      <><Zap className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} /><span>Simular Pagamento</span></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS */}
            {checkoutStep === "success" && (
              <div className="py-6 space-y-6 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ backgroundColor: primaryColor }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "var(--font-syne)" }}
                  >
                    Pagamento Confirmado! 🎉
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "var(--font-dm)" }}>
                    Comprovante e instruções de acesso enviadas para:
                  </p>
                  <p className="text-sm font-bold font-mono text-white mt-1">
                    {email || "seu-email@exemplo.com"}
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl text-left text-xs space-y-2 font-mono"
                  style={{ backgroundColor: "#1a1a1a", color: "#777" }}
                >
                  <div className="flex justify-between">
                    <span>Pedido:</span>
                    <span className="text-zinc-200 font-bold">
                      {orderId ? orderId.slice(0, 8) : "ORD-9912"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-bold" style={{ color: primaryColor }}>PAGO / APROVADO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="text-zinc-200 font-bold">{formatCurrency(campaign?.price || 97.0)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-xs uppercase tracking-wider"
                  style={{ backgroundColor: primaryColor, fontFamily: "var(--font-syne)" }}
                >
                  Concluir & Acessar Conteúdo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
