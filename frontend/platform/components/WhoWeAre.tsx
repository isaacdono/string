import React from "react";

export default function WhoWeAre() {
  return (
    <section
      id="quem-somos"
      className="w-full border-t py-20 sm:py-28 bg-[#F5F4EF]"
      style={{ borderColor: "#0E0E0E20" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-center">
        {/* Left column: Text content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <p
              className="text-xs uppercase font-bold tracking-[0.18em]"
              style={{ fontFamily: "var(--font-dm)", color: "#FF4D00" }}
            >
              Holding de Infraestrutura Executiva
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
              style={{ fontFamily: "var(--font-syne)", color: "#0E0E0E" }}
            >
              Quem somos
            </h2>
          </div>
          
          <div
            className="space-y-4 text-sm sm:text-base leading-relaxed text-[#555550]"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            <p>
              A <strong>ByteMedia</strong> é a engine tecnológica da <strong>String</strong>, a primeira holding de infraestrutura de negócios para criadores de conteúdo do país.
            </p>
            <p>
              Não somos uma agência de marketing ou lançamento. Nós funcionamos como o braço operacional de negócios (COO e CFO terceirizado) para creators Tier 1, ajudando-os a estruturar propriedade intelectual, lançar marcas físicas D2C, infoprodutos robustos e licenciamentos B2B de alta escala.
            </p>
            <p>
              Desenvolvemos sistemas proprietários de vendas "Zero-Friction" para que a conversão aconteça instantaneamente, com o mínimo de burocracia e o máximo de conversão.
            </p>
          </div>
        </div>

        {/* Right column: Concept graphics / visual highlight card */}
        <div
          className="p-5 sm:p-8 md:p-10 rounded-3xl border flex flex-col justify-between min-h-[320px] h-auto sm:h-96 text-white"
          style={{
            backgroundColor: "#0E0E0E",
            borderColor: "#0E0E0E",
          }}
        >
          <div className="space-y-4">
            <span
              className="text-xs uppercase font-semibold tracking-[0.12em] px-3 py-1 rounded-full border border-white/20 text-[#FF4D00]"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              O Sistema Operacional do Creator
            </span>
            <h3
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Infraestrutura de Negócios e Tecnologia.
            </h3>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Infoprodutos & Comunidades</span>
              <span className="font-bold text-[#FF4D00]">Gestão de LTV</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Produtos Físicos (D2C)</span>
              <span className="font-bold text-[#FF4D00]">Estoque Zero</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Licenciamento B2B</span>
              <span className="font-bold text-[#FF4D00]">Escala & Equity</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
