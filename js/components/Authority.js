export default function Authority() {
    return `
    <section class="py-24 bg-white border-b border-gray-200">
        <div class="container mx-auto px-6 max-w-7xl">
            <div class="reveal-wrapper text-center mb-16">
                <p class="reveal-up text-[#a855f7] text-sm tracking-widest uppercase mb-4 font-bold">Nossa Atuação</p>
                <h2 class="reveal-up text-3xl md:text-5xl font-display font-bold text-gray-900 uppercase">Do Digital <br>ao Mundo Real.</h2>
            </div>
            
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Case Digital -->
                <div class="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-[#a855f7]/50 transition-colors group">
                    <div class="h-64 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('images/digital.jpg')"></div>
                    <div class="p-8 relative bg-gray-50">
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-2xl font-display font-bold text-gray-900 uppercase">Comunidades & Info</div>
                            <div class="px-2 py-1 bg-white border border-gray-200 text-gray-500 text-[10px] uppercase tracking-widest rounded-full">Digital</div>
                        </div>
                        <p class="text-gray-600 leading-relaxed mb-6">Estruturamos plataformas de assinatura e cursos high-ticket. Assumimos a tecnologia, retenção de alunos e otimização de funil para maximizar o valor vitalício (LTV) da sua audiência.</p>
                    </div>
                </div>
                
                <!-- Case Fisico -->
                <div class="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-[#a855f7]/50 transition-colors group">
                    <div class="h-64 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('images/streetwear.jpg')"></div>
                    <div class="p-8 relative bg-gray-50">
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-2xl font-display font-bold text-gray-900 uppercase">Marcas Próprias (D2C)</div>
                            <div class="px-2 py-1 bg-white border border-gray-200 text-gray-500 text-[10px] uppercase tracking-widest rounded-full">Físico</div>
                        </div>
                        <p class="text-gray-600 leading-relaxed mb-6">De vestuário a cosméticos. Operamos a cadeia completa: desde a pré-venda com a audiência até o acionamento da fábrica e o fulfillment direto para a casa do fã.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
}
