export default function Hero() {
    return `
    <header class="relative min-h-[90vh] flex flex-col justify-center pt-12 overflow-hidden industrial-grid border-b border-gray-200">
        <div class="absolute right-0 top-1/4 w-[600px] h-[600px] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div class="container mx-auto px-6 relative z-10">
            <div class="reveal-wrapper mb-6">
                <div class="reveal-up inline-flex items-center gap-3 px-4 py-2 border border-gray-200 bg-white shadow-sm rounded-full">
                    <div class="w-2 h-2 bg-[#a855f7] animate-pulse rounded-full"></div>
                    <span class="text-xs font-bold tracking-widest uppercase text-gray-500">COO-AS-A-SERVICE PARA CREATORS</span>
                </div>
            </div>
            
            <div class="reveal-wrapper">
                <h1 class="reveal-up text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-display font-bold leading-[0.85] tracking-tighter uppercase mb-8 text-gray-900">
                    Lance <br> <span class="text-outline-accent italic">Sua Marca.</span>
                </h1>
            </div>
            
            <div class="reveal-wrapper max-w-3xl">
                <p class="reveal-up delay-100 text-lg md:text-2xl text-gray-600 font-light leading-relaxed mb-12">
                    Ajudamos você a diversificar suas fontes de receita muito além das publicidades. Atuamos como seu braço executivo para estruturar e lançar infoprodutos, assinaturas, licenciamentos e marcas de produtos físicos. Você foca no conteúdo, nós rodamos os negócios.
                </p>
            </div>
        </div>

        <div class="absolute bottom-0 left-0 w-full bg-[#a855f7] text-white py-3 border-y border-[#a855f7] marquee-container">
            <div class="marquee-content text-sm font-display font-bold uppercase tracking-widest whitespace-nowrap">
                <span class="px-4">• DIVERSIFICAÇÃO DE RECEITAS</span>
                <span class="px-4">• PRODUTOS FÍSICOS D2C</span>
                <span class="px-4">• INFOPRODUTOS E COMUNIDADES</span>
                <span class="px-4">• LICENCIAMENTO DE MARCA</span>
            </div>
            <div class="marquee-content text-sm font-display font-bold uppercase tracking-widest whitespace-nowrap" aria-hidden="true">
                <span class="px-4">• DIVERSIFICAÇÃO DE RECEITAS</span>
                <span class="px-4">• PRODUTOS FÍSICOS D2C</span>
                <span class="px-4">• INFOPRODUTOS E COMUNIDADES</span>
                <span class="px-4">• LICENCIAMENTO DE MARCA</span>
            </div>
        </div>
    </header>
    `;
}
