import React from "react";

export default function CheckoutHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="w-full max-w-xl mx-auto text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium tracking-wide text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Drop Engine & Checkout
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            ByteMedia Checkout Engine
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Motor de checkout transparente PIX e páginas de vendas com escassez dinâmica.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-left space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Acesso Direto ao Drop</h2>
          <p className="text-xs text-zinc-400">
            As páginas de drops são acessadas diretamente pela rota pública do criador:
          </p>
          <div className="p-3 bg-zinc-950 rounded-lg font-mono text-xs text-emerald-400 border border-zinc-800">
            /d/[campaign_id]
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/60 text-xs text-zinc-500">
          ByteMedia MVP • Next.js App Router (Port 3001)
        </div>
      </div>
    </main>
  );
}
