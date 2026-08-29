"use client";

import React, { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Circle,
  Sparkles,
  Zap,
  FileText,
  Search,
  CheckCheck,
  Terminal,
} from "lucide-react";
import { fetchCampaignStatus } from "@/lib/api";

interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  logs: string[];
}

const STEPS: StepConfig[] = [
  {
    id: 1,
    title: "Profile Scraping & Analysis",
    subtitle: "Mapeando engajamento, persona e dores do público-alvo",
    icon: Search,
    logs: [
      "Conectando aos dados públicos do perfil...",
      "Extraindo métricas de engajamento e comentários...",
      "Identificando padrões de interesse da audiência...",
    ],
  },
  {
    id: 2,
    title: "Offers Structuring with AI",
    subtitle: "NVIDIA Nemotron sintetizando ticket, produto e copy",
    icon: Sparkles,
    logs: [
      "Enviando dados do criador ao cluster OpenRouter Nemotron...",
      "Calculando precificação ideal e limite de escassez...",
      "Gerando hooks persuasivos e prova social estruturada...",
    ],
  },
  {
    id: 3,
    title: "PDF Blueprint Synthesis",
    subtitle: "Compilando relatório estratégico executivo e roteiros",
    icon: FileText,
    logs: [
      "Formatando layout executivo do Blueprint PDF...",
      "Inserindo roteiro de Stories (aquecimento e fechamento)...",
      "Gravando artefato no storage seguro da plataforma...",
    ],
  },
  {
    id: 4,
    title: "Finalizing",
    subtitle: "Habilitando página de vendas e checkout PIX Asaas",
    icon: CheckCheck,
    logs: [
      "Configurando layout mobile-first no Drop Engine...",
      "Sincronizando gateway Asaas para PIX transparente...",
      "Drop pronto para publicação!",
    ],
  },
];

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const campaignId = useMemo(() => {
    return (
      searchParams.get("id") ||
      searchParams.get("campaign_id") ||
      "demo-" + Math.random().toString(36).substring(2, 9)
    );
  }, [searchParams]);

  const [progress, setProgress] = useState<number>(5);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    "Iniciando pipeline do ByteMedia Drop Engine...",
  ]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const redirectedRef = useRef<boolean>(false);

  // Progressive timer + status polling
  useEffect(() => {
    let isCancelled = false;
    let timer: NodeJS.Timeout;
    let pollInterval: NodeJS.Timeout;

    // Simulation & progress stepping
    const stepDuration = 2000; // ms per step
    const intervalMs = 100;
    const increment = 100 / ((stepDuration * STEPS.length) / intervalMs);

    timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = Math.min(prev + increment + Math.random() * 0.4, 99);
        return next;
      });
    }, intervalMs);

    // Active log and step synchronizer
    const stepTimer = setInterval(() => {
      setProgress((currentProgress) => {
        const stepIdx = Math.min(
          Math.floor((currentProgress / 100) * STEPS.length),
          STEPS.length - 1
        );
        setCurrentStepIndex(stepIdx);

        // Append step log
        const currentStep = STEPS[stepIdx];
        if (currentStep) {
          const randomLog =
            currentStep.logs[
              Math.floor(Math.random() * currentStep.logs.length)
            ];
          setLogs((prev) => {
            if (prev[prev.length - 1] === randomLog) return prev;
            return [...prev.slice(-6), randomLog];
          });
        }

        return currentProgress;
      });
    }, 1200);

    // Backend status polling (if available)
    const checkBackend = async () => {
      if (isCancelled) return;
      const statusData = await fetchCampaignStatus(campaignId);
      if (statusData && (statusData.status === "active" || statusData.status === "synthesizing")) {
        setProgress(100);
        setIsCompleted(true);
      }
    };

    pollInterval = setInterval(checkBackend, 3000);
    checkBackend();

    return () => {
      isCancelled = true;
      clearInterval(timer);
      clearInterval(stepTimer);
      clearInterval(pollInterval);
    };
  }, [campaignId]);

  // Handle completion redirect
  useEffect(() => {
    if ((progress >= 99 || isCompleted) && !redirectedRef.current) {
      redirectedRef.current = true;
      setProgress(100);
      setCurrentStepIndex(3);
      setLogs((prev) => {
        if (prev.includes("Drop gerado com sucesso! Redirecionando...")) return prev;
        return [...prev, "Drop gerado com sucesso! Redirecionando..."];
      });

      router.push(`/success/${encodeURIComponent(campaignId)}`);
    }
  }, [progress, isCompleted, campaignId, router]);

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
        <span
          className="text-2xl tracking-tighter font-bold"
          style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
        >
          Byte<span style={{ color: "#FF4D00" }}>Media</span>
        </span>
        <div
          className="flex items-center gap-2 text-[10px] font-mono px-4 py-2 rounded-full border"
          style={{ borderColor: "#0E0E0E30", color: "#777" }}
        >
          ID: {campaignId.slice(0, 8)}…
        </div>
      </header>

      {/* Main */}
      <section className="flex-1 w-full max-w-2xl mx-auto px-6 sm:px-12 py-16 flex flex-col justify-center gap-10">
        {/* Headline */}
        <div className="space-y-3">
          <div
            className="flex items-center gap-2 text-sm uppercase font-semibold tracking-[0.18em]"
            style={{ fontFamily: "var(--font-dm)", color: "#FF4D00" }}
          >
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#FF4D00" }} />
            Processando
          </div>
          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-[1.05]"
            style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
          >
            Sintetizando<br />seu{" "}
            <em className="not-italic" style={{ color: "#FF4D00" }}>Drop.</em>
          </h1>
          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ fontFamily: "var(--font-dm)", color: "#666" }}
          >
            Não feche esta aba — menos de 10 segundos para o seu drop estar pronto.
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div
            className="flex justify-between text-[10px] uppercase font-bold tracking-widest"
            style={{ fontFamily: "var(--font-dm)", color: "#999" }}
          >
            <span style={{ color: "#FF4D00" }}>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#E0DED8" }}>
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, Math.min(100, progress))}%`, backgroundColor: "#FF4D00" }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, idx) => {
            const isCompleted = progress >= 100 || idx < currentStepIndex;
            const isActive = !isCompleted && idx === currentStepIndex;
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300"
                style={
                  isActive
                    ? { backgroundColor: "#0E0E0E", color: "#fff" }
                    : isCompleted
                    ? { backgroundColor: "#ECEAE3", color: "#444" }
                    : { backgroundColor: "transparent", color: "#aaa", opacity: 0.5 }
                }
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={
                    isActive
                      ? { backgroundColor: "#FF4D00", color: "#fff" }
                      : isCompleted
                      ? { backgroundColor: "#FF4D0015", color: "#FF4D00" }
                      : { backgroundColor: "#E0DED8", color: "#aaa" }
                  }
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold" style={{ color: isActive ? "#FF4D00" : "#999" }}>
                      0{step.id}
                    </span>
                    <span className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-syne)" }}>
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ fontFamily: "var(--font-dm)", opacity: 0.7 }}>
                    {step.subtitle}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: "#FF4D00" }} />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#FF4D00" }} />
                  ) : (
                    <Circle className="w-4 h-4" style={{ color: "#ccc" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal */}
        <div className="rounded-2xl p-5 font-mono text-xs space-y-2" style={{ backgroundColor: "#0E0E0E" }}>
          <div className="flex items-center justify-between pb-3 mb-1" style={{ borderBottom: "1px solid #222" }}>
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" style={{ color: "#FF4D00" }} />
              <span className="uppercase text-[9px] font-bold tracking-widest" style={{ color: "#555" }}>
                ByteMedia AI Telemetry
              </span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5" style={{ color: "#FF4D00" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ backgroundColor: "#FF4D00" }} />
              LIVE
            </span>
          </div>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: "#FF4D00" }}>›</span>
                <span className="truncate" style={{ color: i === logs.length - 1 ? "#ddd" : "#666" }}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="w-full px-6 sm:px-12 py-5 flex items-center justify-between text-xs border-t"
        style={{ backgroundColor: "#0E0E0E", borderColor: "#0E0E0E", fontFamily: "var(--font-dm)", color: "#555" }}
      >
        <span>ByteMedia · Plataforma B2B para Criadores</span>
        <span style={{ color: "#FF4D00", fontFamily: "var(--font-syne)" }}>Zero-Friction Drop Engine</span>
      </footer>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F4EF" }}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF4D00" }} />
            <p className="text-sm" style={{ fontFamily: "var(--font-dm)", color: "#555" }}>
              Carregando painel de processamento...
            </p>
          </div>
        </main>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
