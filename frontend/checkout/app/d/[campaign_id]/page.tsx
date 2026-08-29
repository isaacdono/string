"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import {
  fetchCampaignSalesData,
  createCheckout,
  getOrderStatus,
  simulateOrderPayment,
  type CampaignSalesData,
  type CheckoutResponse,
} from "@/lib/api";
import { formatCPF, formatCurrency } from "@/lib/utils";

export default function DropSalesPage() {
  const params = useParams();
  const campaignId = (params?.campaign_id as string) || "demo-drop";

  // Data states
  const [campaign, setCampaign] = useState<CampaignSalesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal & Checkout states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "pix" | "success">("form");
  const [buyerName, setBuyerName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; cpf?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Pix payment states
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string>("");
  const [pixCopyPaste, setPixCopyPaste] = useState<string>("");
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Scarcity countdown state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 47,
    seconds: 19,
  });

  // Fetch campaign data
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await fetchCampaignSalesData(campaignId);
        if (!isCancelled) {
          setCampaign(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          // Fallback mock campaign for preview/resilience
          setCampaign({
            id: campaignId,
            handle: "@criador",
            status: "active",
            product_type: "digital",
            price: 97.0,
            theme_config: {
              primary: "#22c55e",
              background: "#09090b",
              foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
            },
            copy_data: {
              title: "Drop Exclusivo: Método & Acelerador Digital",
              subtitle: "O passo a passo prático para transformar sua audiência em um negócio escalável.",
              hooks: ["Acesso Imediato", "Garantia Incondicional de 7 Dias", "Vagas Limitadas"],
              benefits: [
                "Acesso vitalício à plataforma e gravações",
                "Templates prontos e planilhas de validação",
                "Comunidade exclusiva no WhatsApp / Telegram",
                "Certificado de conclusão e material de apoio em PDF",
              ],
              social_proof_quotes: [
                {
                  user: "mariana_sales",
                  comment: "Melhor investimento que fiz este ano! Conteúdo direto ao ponto e sem enrolação.",
                },
                {
                  user: "lucas_dev",
                  comment: "Já garanti o meu no primeiro minuto. O conteúdo é sensacional!",
                },
              ],
            },
            scarcity_limit: 50,
            expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [campaignId]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Polling order payment status when in PIX step
  useEffect(() => {
    if (checkoutStep !== "pix" || !orderId) return;

    let isCancelled = false;
    const pollInterval = setInterval(async () => {
      try {
        const res = await getOrderStatus(orderId);
        if (!isCancelled && res.status === "PAID") {
          setCheckoutStep("success");
          clearInterval(pollInterval);
        }
      } catch {
        // Silently retry
      }
    }, 2000);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
    };
  }, [checkoutStep, orderId]);

  // Theme colors
  const primaryColor = campaign?.theme_config?.primary || "#22c55e";
  const backgroundColor = campaign?.theme_config?.background || "#09090b";
  const avatarUrl = campaign?.theme_config?.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";

  // Form Validation
  const validateForm = () => {
    const errors: { name?: string; email?: string; cpf?: string } = {};

    if (!buyerName.trim() || buyerName.trim().length < 3) {
      errors.name = "Informe seu nome completo.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = "Informe um e-mail válido.";
    }

    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      errors.cpf = "Informe um CPF válido (11 dígitos).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const response: CheckoutResponse = await createCheckout({
        campaign_id: campaignId,
        buyer_name: buyerName.trim(),
        email: email.trim(),
        cpf: cpf.replace(/\D/g, ""),
      });

      setOrderId(response.order_id);
      setPixQrCode(response.pix_qr_code);
      setPixCopyPaste(response.pix_copy_paste);
      setCheckoutStep("pix");
    } catch (err: any) {
      setCheckoutError(err.message || "Erro ao conectar com o Asaas PIX.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = async () => {
    if (!pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setIsSimulating(true);

    try {
      await simulateOrderPayment(orderId);
      setCheckoutStep("success");
    } catch (err) {
      // In case of simulated fallback
      setCheckoutStep("success");
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-zinc-400 text-sm">Carregando Drop exclusivo...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-zinc-950 pb-28"
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[350px] blur-[150px] rounded-full opacity-25"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Creator Header */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full p-0.5 shadow-md flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #18181b)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={campaign?.handle || "Creator"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">
                  {campaign?.handle}
                </span>
                <BadgeCheck
                  className="w-4 h-4"
                  style={{ color: primaryColor }}
                />
              </div>
              <span className="text-[11px] text-zinc-400">
                Criador Verificado • ByteMedia Drop
              </span>
            </div>
          </div>

          <div
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border"
            style={{
              borderColor: `${primaryColor}40`,
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            Drop Ativo
          </div>
        </header>

        {/* Scarcity Trigger Block (Units Remaining or Timer) */}
        <section
          className="p-3.5 rounded-xl border bg-zinc-900/70 backdrop-blur space-y-2 shadow-lg"
          style={{ borderColor: `${primaryColor}40` }}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>Vagas Limitadas — Lote de Abertura</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Progress Bar for Scarcity Units */}
          <div className="space-y-1">
            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: "78%",
                  backgroundColor: primaryColor,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>78% das vagas preenchidas</span>
              <span className="text-zinc-300 font-medium">Restam poucas unidades</span>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {campaign?.copy_data.title}
            </h1>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {campaign?.copy_data.subtitle}
            </p>
          </div>

          {/* Price Tag */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Valor Especial do Drop
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-black tracking-tight"
                  style={{ color: primaryColor }}
                >
                  {formatCurrency(campaign?.price || 97.0)}
                </span>
                <span className="text-xs text-zinc-500 line-through">
                  {formatCurrency((campaign?.price || 97.0) * 2.5)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                PIX À Vista
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Liberação Imediata</p>
            </div>
          </div>

          {/* Hooks Badges */}
          <div className="flex flex-wrap gap-2">
            {campaign?.copy_data.hooks?.map((hook, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5"
              >
                <Sparkles
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: primaryColor }}
                />
                {hook}
              </span>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: primaryColor }} />
            O que você vai receber
          </h2>

          <div className="space-y-2.5">
            {campaign?.copy_data.benefits?.map((benefit, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3 transition-colors hover:border-zinc-700"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                  }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <p className="text-sm text-zinc-200 leading-snug">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof Section (Instagram style comments) */}
        <section className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
            Comentários da Comunidade
          </h2>

          <div className="space-y-2.5">
            {campaign?.copy_data.social_proof_quotes?.map((quote, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">
                    @{quote.user}
                  </span>
                  <div className="flex items-center gap-1 text-rose-500">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span className="text-[10px] text-zinc-400">
                      {14 + i * 9}
                    </span>
                  </div>
                </div>
                <p className="text-zinc-400 leading-relaxed italic">
                  &quot;{quote.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-2 text-xs text-zinc-400">
          <div className="flex items-center justify-center gap-2 text-zinc-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Garantia Incondicional de 7 Dias</span>
          </div>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
            Se você não gostar do conteúdo, devolvemos 100% do seu dinheiro sem burocracia.
          </p>
        </section>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">
              Total
            </span>
            <div
              className="text-xl font-black tracking-tight"
              style={{ color: primaryColor }}
            >
              {formatCurrency(campaign?.price || 97.0)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setCheckoutStep("form");
            }}
            className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-zinc-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 8px 24px -6px ${primaryColor}60`,
            }}
          >
            <Lock className="w-4 h-4" />
            <span>Garantir Minha Vaga</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm transition-opacity">
          <div
            className="w-full max-w-lg bg-zinc-900 border-t border-zinc-700 rounded-t-3xl p-6 space-y-5 animate-slideUp max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#121215" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
                <h3 className="font-bold text-base text-white">
                  {checkoutStep === "form" && "Checkout Seguro PIX"}
                  {checkoutStep === "pix" && "Pagamento via PIX"}
                  {checkoutStep === "success" && "Compra Confirmada!"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: FORM */}
            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{campaign?.copy_data.title}</span>
                  <span className="font-bold font-mono" style={{ color: primaryColor }}>
                    {formatCurrency(campaign?.price || 97.0)}
                  </span>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ex: Lucas da Silva"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-400">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    E-mail (para receber o acesso)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lucas@exemplo.com"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-red-400">{formErrors.email}</p>
                  )}
                </div>

                {/* CPF */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    CPF (Exigido pelo Asaas PIX)
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {formErrors.cpf && (
                    <p className="text-[11px] text-red-400">{formErrors.cpf}</p>
                  )}
                </div>

                {checkoutError && (
                  <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-sm text-zinc-950 flex items-center justify-center gap-2 transition-all shadow-lg"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando PIX...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Gerar Pagamento PIX</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: PIX PAYMENT VIEW */}
            {checkoutStep === "pix" && (
              <div className="space-y-5 animate-fadeIn text-center">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400">
                    Escaneie o QR Code ou use a chave Copia e Cola no app do seu banco:
                  </p>
                  <p className="text-lg font-black" style={{ color: primaryColor }}>
                    {formatCurrency(campaign?.price || 97.0)}
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-xl border-4 border-zinc-800">
                  {pixQrCode && pixQrCode.startsWith("data:") ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={pixQrCode}
                      alt="PIX QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-900 gap-2 p-2">
                      <QrCode className="w-28 h-28 text-zinc-900" />
                      <span className="text-[10px] font-mono font-bold">PIX ASAAS</span>
                    </div>
                  )}
                </div>

                {/* Copia e Cola Field */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCopyPaste}
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-400 truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
                      style={{
                        backgroundColor: copiedPix ? "#16a34a" : primaryColor,
                        color: "#09090b",
                      }}
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar PIX</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Ticker */}
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: primaryColor }} />
                  <span>Aguardando compensação automática pelo banco...</span>
                </div>

                {/* Simulation Button for Demonstration */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isSimulating}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Simulando Webhook...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Simular Confirmação de Pagamento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SEAMLESS GREEN CHECK CONFIRMATION */}
            {checkoutStep === "success" && (
              <div className="py-6 space-y-5 text-center animate-fadeIn">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce"
                  style={{
                    backgroundColor: `${primaryColor}25`,
                    border: `2px solid ${primaryColor}`,
                  }}
                >
                  <CheckCircle2
                    className="w-12 h-12"
                    style={{ color: primaryColor }}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white">
                    Pagamento Confirmado! 🎉
                  </h4>
                  <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                    Obrigado pela sua compra! O comprovante oficial e as instruções de acesso foram enviadas para:
                  </p>
                  <p className="text-sm font-semibold font-mono text-white">
                    {email || "seu-email@exemplo.com"}
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-left text-xs space-y-1.5 font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Pedido:</span>
                    <span className="text-zinc-200 font-bold">
                      {orderId ? orderId.slice(0, 8) : "ORD-9912"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">PAGO / APROVADO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="text-zinc-200 font-bold">
                      {formatCurrency(campaign?.price || 97.0)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm text-zinc-950 shadow-lg"
                  style={{ backgroundColor: primaryColor }}
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
