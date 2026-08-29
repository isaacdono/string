import React from "react";

export default function CheckoutHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#0A0A0C] text-white relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#FC3636]/5 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#FC3636] bg-[#FC3636]/10 border border-[#FC3636]/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#FC3636] animate-pulse" />
            Drop Engine & Checkout
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
            ByteMedia Checkout Engine
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
            Motor de checkout transparente PIX e páginas de vendas com escassez dinâmica.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/20 text-left space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Acesso Direto ao Drop</h2>
          <p className="text-xs text-zinc-400">
            As páginas de drops são acessadas diretamente pela rota pública do criador:
          </p>
          <div className="p-3 bg-zinc-950 rounded-lg font-mono text-xs text-[#FC3636] border border-zinc-900">
            /d/[campaign_id]
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 text-xs text-zinc-500">
          ByteMedia MVP • Next.js App Router (Port 3001)
        </div>
      </div>
    </main>
  );
}
