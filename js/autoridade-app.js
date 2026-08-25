import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import CTA from './components/CTA.js';
import { initAnimations } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        ${Navbar()}
        <main class="pt-32 pb-24 container mx-auto px-6 max-w-5xl">
            <div class="reveal-wrapper mb-12">
                <div class="text-[#a855f7] text-sm tracking-widest uppercase mb-4 font-bold">A Evolução do Creator</div>
                <h1 class="reveal-up text-5xl md:text-7xl font-display font-bold uppercase leading-none text-gray-900">De Perfil para <br>Grupo Empresarial.</h1>
            </div>
            
            <div class="w-full h-[400px] mb-16 bg-cover bg-center border border-gray-200 rounded-2xl shadow-sm" style="background-image: url('images/fulfillment.jpg')"></div>

            <div class="grid md:grid-cols-2 gap-12 text-gray-600 font-light text-lg leading-relaxed mb-24">
                <div class="reveal-wrapper"><div class="reveal-up delay-100">
                    <p class="mb-6 text-gray-900 font-medium">O primeiro passo não é criar uma holding do nada. O primeiro passo é diversificar sua receita para que a holding faça sentido.</p>
                    <p>Nós ajudamos você a sair da dependência exclusiva de "publis". Criamos verticais reais: produtos físicos (D2C), infoprodutos e licenciamento. Quando o caixa ganha tração e escala, nós estruturamos a separação entre o seu risco operacional e o seu patrimônio.</p>
                </div></div>
                
                <div class="reveal-wrapper"><div class="reveal-up delay-200 bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
                    <h3 class="text-gray-900 font-display font-bold uppercase text-2xl mb-6">Arquitetura Proposta</h3>
                    
                    <div class="space-y-6 text-sm">
                        <!-- Holding -->
                        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div class="text-[#a855f7] font-bold uppercase tracking-widest mb-1 text-xs">Camada 01: Proteção</div>
                            <div class="font-bold text-gray-900 mb-2">HOLDING PATRIMONIAL (Mãe)</div>
                            <ul class="text-gray-500 space-y-1">
                                <li>• Imóveis e Veículos</li>
                                <li>• Aplicações Financeiras</li>
                                <li>• Propriedade Intelectual (Marcas)</li>
                            </ul>
                        </div>
                        
                        <div class="flex justify-center text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        </div>

                        <!-- Operacional -->
                        <div class="bg-white p-4 rounded-xl border border-[#a855f7]/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <div class="text-[#a855f7] font-bold uppercase tracking-widest mb-1 text-xs">Camada 02: Execução</div>
                            <div class="font-bold text-gray-900 mb-2">EMPRESA OPERACIONAL (Trabalho)</div>
                            <ul class="text-gray-500 space-y-1">
                                <li>• Publicidade e Patrocínios</li>
                                <li>• Infoprodutos e Cursos</li>
                                <li>• Produtos Físicos (D2C Drops)</li>
                            </ul>
                        </div>
                    </div>
                </div></div>
            </div>
        </main>
        ${CTA()}
        ${Footer()}
    `;

    initAnimations();
});
