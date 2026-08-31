import { useState, useEffect } from "react";
import {
  fetchCampaignSalesData,
  createCheckout,
  getOrderStatus,
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

  // Scarcity countdown state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
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
          setLoadError(err.message || "Erro ao carregar dados da campanha.");
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
    if (!campaign) return;

    let targetTime: number;
    if (campaign.expires_at) {
      const parsed = new Date(campaign.expires_at).getTime();
      targetTime = isNaN(parsed) ? Date.now() + 15 * 60 * 1000 : parsed;
    } else {
      const storedKey = `drop_timer_${campaignId}`;
      const stored = typeof window !== "undefined" ? sessionStorage.getItem(storedKey) : null;
      if (stored && !isNaN(Number(stored))) {
        targetTime = Number(stored);
      } else {
        targetTime = Date.now() + 15 * 60 * 1000;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(storedKey, String(targetTime));
        }
      }
    }

    const calculateTimeLeft = () => {
      const difference = targetTime - Date.now();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [campaign, campaignId]);

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

  // Read Mercado Pago return params from URL (status & order_id)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const statusParam = searchParams.get("status");
      const orderIdParam = searchParams.get("order_id");

      if (statusParam === "success" && orderIdParam) {
        setOrderId(orderIdParam);
        setCheckoutStep("success");
        setIsModalOpen(true);
      }
    }
  }, []);

  // Theme colors
  const primaryColor = campaign?.theme_config?.primary || "#FF4D00";
  const backgroundColor = campaign?.theme_config?.background || "#F5F4EF";
  const avatarUrl = campaign?.theme_config?.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";


  const handleCheckoutSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const response: CheckoutResponse = await createCheckout({
        campaign_id: campaignId,
      });

      setOrderId(response.order_id);
      window.location.href = response.checkout_url;
    } catch (err: any) {
      setCheckoutError(err.message || "Erro ao conectar com o Mercado Pago.");
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
    timeLeft,
    primaryColor,
    backgroundColor,
    avatarUrl,
    handleCheckoutSubmit,
    handleCopyPix,
  };
}
