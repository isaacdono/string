export default function HowItWorks() {
    return `
    <section class="py-32 bg-gray-50 border-y border-gray-200 relative">
        <div class="container mx-auto px-6 max-w-7xl">
            <div class="reveal-wrapper text-center mb-20">
                <p class="reveal-up text-[#a855f7] font-bold text-xs tracking-widest uppercase mb-4">Múltiplos Vetores de Receita</p>
                <h2 class="reveal-up text-4xl md:text-6xl font-display font-bold uppercase text-gray-900">O Que Nós Operamos.</h2>
            </div>
            
            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Step 1: Digital -->
                <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#a855f7]/50 transition-colors group flex flex-col shadow-sm">
                    <div class="h-64 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('images/digital.jpg')"></div>
                    <div class="p-8 relative bg-white flex-1 flex flex-col">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-display font-bold uppercase text-gray-900 pr-4">Infoprodutos & Comunidades</h3>
                            <div class="w-8 h-8 flex-shrink-0 bg-[#a855f7]/10 text-[#a855f7] rounded-full flex items-center justify-center font-display font-bold text-sm">1</div>
                        </div>
                        <p class="text-gray-600 leading-relaxed">Cursos, mentorias e assinaturas pagas. Montamos a infraestrutura, gerimos os membros e otimizamos o funil de vendas (LTV/CAC).</p>
                    </div>
                </div>
                
                <!-- Step 2: Physical -->
                <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#a855f7]/50 transition-colors group flex flex-col shadow-sm">
                    <div class="h-64 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('images/streetwear.jpg')"></div>
                    <div class="p-8 relative bg-white flex-1 flex flex-col">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-display font-bold uppercase text-gray-900 pr-4">Produtos Físicos (D2C)</h3>
                            <div class="w-8 h-8 flex-shrink-0 bg-[#a855f7]/10 text-[#a855f7] rounded-full flex items-center justify-center font-display font-bold text-sm">2</div>
                        </div>
                        <p class="text-gray-600 leading-relaxed">Vestuário, cosméticos ou suplementos. Rodamos o modelo de pré-venda (Drops), acionamos fábricas e entregamos via fulfillment.</p>
                    </div>
                </div>
                
                <!-- Step 3: B2B/Licensing -->
                <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#a855f7]/50 transition-colors group flex flex-col shadow-sm">
                    <div class="h-64 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('images/skincare.jpg')"></div>
                    <div class="p-8 relative bg-white flex-1 flex flex-col">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-display font-bold uppercase text-gray-900 pr-4">Licenciamento B2B</h3>
                            <div class="w-8 h-8 flex-shrink-0 bg-[#a855f7]/10 text-[#a855f7] rounded-full flex items-center justify-center font-display font-bold text-sm">3</div>
                        </div>
                        <p class="text-gray-600 leading-relaxed">Conectamos seu nome a grandes marcas para licenciamento (Collabs). Assumimos contratos e expansão no varejo físico.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
}
