export default function Solution() {
    return `
    <section class="py-32 relative overflow-hidden bg-gray-50 text-gray-900">
        <div class="container mx-auto px-6 max-w-7xl relative z-10">
            <div class="grid lg:grid-cols-2 gap-20 items-center">
                <div>
                    <div class="reveal-wrapper mb-6">
                        <div class="reveal-up text-[#a855f7] font-bold text-xs tracking-widest uppercase border border-gray-200 bg-white px-3 py-1 inline-block rounded-full">Alinhamento & Equity</div>
                    </div>
                    <div class="reveal-wrapper">
                        <h2 class="reveal-up text-5xl md:text-7xl font-display font-bold mb-12 uppercase leading-[0.9]">Sua Marca, <br> Nossa Holding.</h2>
                    </div>
                    
                    <div class="space-y-12">
                        <div class="reveal-wrapper">
                            <div class="reveal-up flex gap-6">
                                <div class="w-12 h-12 flex-shrink-0 border-2 border-gray-200 bg-white rounded-full flex items-center justify-center font-display font-bold text-[#a855f7]">1</div>
                                <div>
                                    <h4 class="font-bold text-xl uppercase mb-2 font-display">Gestão Executiva (COO/CFO)</h4>
                                    <p class="text-gray-600 text-lg leading-relaxed">Assumimos a diretoria de operações e finanças. Cuidamos de contratos complexos, proteção de IP e blindagem societária.</p>
                                </div>
                            </div>
                        </div>
                        <div class="reveal-wrapper">
                            <div class="reveal-up delay-100 flex gap-6">
                                <div class="w-12 h-12 flex-shrink-0 border-2 border-gray-200 bg-white rounded-full flex items-center justify-center font-display font-bold text-[#a855f7]">2</div>
                                <div>
                                    <h4 class="font-bold text-xl uppercase mb-2 font-display">Multiplicação de Receitas</h4>
                                    <p class="text-gray-600 text-lg leading-relaxed">Produtos físicos são apenas o começo. Desbravamos licenciamentos de marca, franquias e parcerias institucionais.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="relative reveal-wrapper">
                    <div class="reveal-up delay-200">
                        <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl shadow-gray-200 text-gray-900">
                            <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                <div>
                                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gross Revenue (YTD)</div>
                                    <div class="text-4xl md:text-5xl font-display font-bold" id="revenue-amount">R$ 4.242.390</div>
                                </div>
                                <div class="bg-[#a855f7]/10 text-[#a855f7] px-3 py-1 text-xs font-bold uppercase rounded-full">
                                    LIVE EQUITY
                                </div>
                            </div>
                            
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#a855f7]/30 transition-colors cursor-default">
                                    <div class="flex items-center gap-3">
                                        <div class="w-2 h-2 bg-[#a855f7] rounded-full"></div>
                                        <div class="font-medium text-gray-700">D2C PHYSICAL DROPS</div>
                                    </div>
                                    <div class="text-right font-bold text-gray-900">
                                        R$ 1.8M
                                    </div>
                                </div>
                                <div class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#a855f7]/30 transition-colors cursor-default">
                                    <div class="flex items-center gap-3">
                                        <div class="w-2 h-2 border-2 border-gray-300 rounded-full"></div>
                                        <div class="font-medium text-gray-700">BRAND LICENSING</div>
                                    </div>
                                    <div class="text-right font-bold text-gray-900">
                                        R$ 2.4M
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
}
