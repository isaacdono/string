import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Conecte seu Perfil",
      description: "Insira seu handle do Instagram ou TikTok e descreva a sua ideia de drop. Não precisa de login ou burocracia.",
    },
    {
      number: "02",
      title: "Geração por IA",
      description: "Nossa IA analisa sua audiência, gera a copy persuasiva, define a melhor estratégia de oferta e constrói o checkout.",
    },
    {
      number: "03",
      title: "Venda no PIX",
      description: "Receba seu Dossiê de Lançamento em PDF e comece a vender imediatamente com checkout via PIX de alta conversão.",
    },
  ];

  return (
    <section
      id="como-funciona"
      className="w-full border-t py-20 sm:py-28 bg-[#F5F4EF]"
      style={{ borderColor: "#0E0E0E20" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-12 space-y-12 sm:space-y-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <p
              className="text-xs uppercase font-bold tracking-[0.18em]"
              style={{ fontFamily: "var(--font-dm)", color: "#FF4D00" }}
            >
              Simples, Rápido e Direto
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
              style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
            >
              Como funciona
            </h2>
          </div>
          <p
            className="text-sm max-w-xs text-[#555550] leading-relaxed"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            Três passos simples separam sua ideia de um funil de vendas ativo e monetizando no automático.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="space-y-4 p-5 sm:p-8 rounded-2xl border bg-white/40 backdrop-blur-sm transition-all duration-300 hover:border-[#FF4D00]/30 hover:bg-white/60"
              style={{ borderColor: "#0E0E0E15" }}
            >
              <div
                className="text-3xl font-extrabold"
                style={{ fontFamily: "var(--font-syne)", color: "#FF4D00" }}
              >
                {step.number}
              </div>
              <h3
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed text-[#555550]"
                style={{ fontFamily: "var(--font-dm)" }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
