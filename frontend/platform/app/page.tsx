import React from "react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="w-full max-w-xl mx-auto text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium tracking-wide text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Zero-Click Drop Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            ByteMedia Platform
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Monetize sua audiência instantaneamente. IA analisa sua demanda e gera seu drop completo em segundos.
          </p>
        </div>

        <form className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500 font-medium">@</span>
              <input
                type="text"
                placeholder="seu_handle"
                className="w-full pl-9 pr-4 py-3 bg-zinc-900/90 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="button"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              Gerar Drop
            </button>
          </div>
        </form>

        <div className="pt-6 border-t border-zinc-800/60 text-xs text-zinc-500">
          ByteMedia MVP • Next.js App Router (Port 3000)
        </div>
      </div>
    </main>
  );
}
