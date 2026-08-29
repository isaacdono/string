"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
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
    if (progress >= 99 && !isCompleted) {
      setIsCompleted(true);
      setProgress(100);
      setCurrentStepIndex(3);
      setLogs((prev) => [...prev, "Drop gerado com sucesso! Redirecionando..."]);

      const redirectTimer = setTimeout(() => {
        router.push(`/success/${encodeURIComponent(campaignId)}`);
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [progress, isCompleted, campaignId, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-zinc-950">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Byte<span className="text-emerald-400">Media</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 border border-zinc-800 bg-zinc-900/60 backdrop-blur px-3 py-1.5 rounded-full font-mono">
          ID: {campaignId.slice(0, 8)}...
        </div>
      </header>

      {/* Main Container */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-6 py-8 my-auto space-y-8">
        {/* Title and Progress Bar */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 rounded-full">
            <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            Processando Inteligência Artificial
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Sintetizando seu Drop...
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Aguarde alguns segundos enquanto nossos modelos estruturam sua campanha e compilam os materiais.
          </p>

          {/* Progress Bar & Percentage */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-xs font-semibold font-mono text-zinc-400">
              <span className="text-emerald-400">Progresso Geral</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 rounded-full transition-all duration-300 ease-out shadow-lg shadow-emerald-500/50"
                style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step list */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const isStepCompleted =
              progress >= 100 || idx < currentStepIndex;
            const isStepActive =
              !isStepCompleted && idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                  isStepActive
                    ? "bg-zinc-900/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : isStepCompleted
                    ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-300"
                    : "bg-zinc-950/40 border-zinc-800/40 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isStepActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isStepCompleted
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-zinc-500">
                        0{step.id}
                      </span>
                      <h3
                        className={`text-sm sm:text-base font-semibold truncate ${
                          isStepActive
                            ? "text-white"
                            : isStepCompleted
                            ? "text-zinc-200"
                            : "text-zinc-500"
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isStepCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isStepActive ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-900 text-zinc-700 flex items-center justify-center">
                      <Circle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Execution Terminal Log */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 font-mono text-xs text-zinc-400 space-y-2 shadow-inner">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-zinc-500">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>ByteMedia AI Telemetry</span>
            </div>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-zinc-300">
                <span className="text-emerald-500 select-none">›</span>
                <span className="truncate">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-2">
          <span>O processo leva menos de 10 segundos • Não feche esta aba</span>
        </div>
      </footer>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-zinc-400 text-sm">Carregando painel de processamento...</p>
          </div>
        </main>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
