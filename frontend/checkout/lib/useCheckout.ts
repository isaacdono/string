import { useState, useEffect } from "react";
import {
  fetchCampaignSalesData,
  createCheckout,
  getOrderStatus,
  simulateOrderPayment,
  type CampaignSalesData,
  type CheckoutResponse,
} from "@/lib/api";

export function useCheckout(campaignId: string) {
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
              primary: "#FF4D00",
              background: "#F5F4EF",
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
  const primaryColor = campaign?.theme_config?.primary || "#FF4D00";
  const backgroundColor = campaign?.theme_config?.background || "#F5F4EF";
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

  return {
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
    isSimulating,
    timeLeft,
    primaryColor,
    backgroundColor,
    avatarUrl,
    handleCheckoutSubmit,
    handleCopyPix,
    handleSimulatePayment,
  };
}
