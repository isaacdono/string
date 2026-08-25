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
                <h1 class="reveal-up text-5xl md:text-7xl font-display font-bold uppercase leading-none">A Prova.</h1>
            </div>
            
            <div class="space-y-24">
                <article class="reveal-wrapper">
                    <div class="reveal-up border-l-4 border-[#a855f7] pl-6 md:pl-10">
                        <div class="text-xs  text-gray-500 uppercase tracking-widest mb-2">Estruturação de Holding</div>
                        <h2 class="text-4xl font-display font-bold text-gray-900 uppercase mb-6">Lifestyle Corporativo</h2>
                        
                        <div class="w-full h-[400px] mb-8 bg-cover bg-center border border-gray-200" style="background-image: url('images/streetwear.jpg')"></div>

                        <p class="text-xl text-gray-600 font-light leading-relaxed mb-6">A transição perfeita de uma criadora de conteúdo independente para a presidente do conselho de uma Holding de Lifestyle. Assumimos a diretoria executiva (COO), protegemos toda a propriedade intelectual da marca e liberamos a criadora para focar 100% no engajamento.</p>
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 pt-6 mt-8">
                            <div>
                                <div class="text-[#a855f7] font-display font-bold text-2xl">4x</div>
                                <div class="text-[10px]  text-gray-500 uppercase">Multiplicador de Valuation</div>
                            </div>
                            <div>
                                <div class="text-[#a855f7] font-display font-bold text-2xl">+3</div>
                                <div class="text-[10px]  text-gray-500 uppercase">Novos Vetores de Receita</div>
                            </div>
                        </div>
                    </div>
                </article>
                
                <article class="reveal-wrapper">
                    <div class="reveal-up border-l-4 border-gray-200 hover:border-[#a855f7] transition-colors pl-6 md:pl-10">
                        <div class="text-xs  text-gray-500 uppercase tracking-widest mb-2">Licenciamento & Parcerias</div>
                        <h2 class="text-4xl font-display font-bold text-gray-900 uppercase mb-6">Escala Institucional</h2>
                        
                        <div class="w-full h-[400px] mb-8 bg-cover bg-center border border-gray-200" style="background-image: url('images/skincare.jpg')"></div>

                        <p class="text-xl text-gray-600 font-light leading-relaxed mb-6">Produtos físicos são apenas a porta de entrada. Para criadores top-tier, o verdadeiro jogo está nas parcerias institucionais corporativas e no licenciamento de marca no varejo físico. Uma agência de marketing não sabe sentar numa mesa de M&A ou negociar com grandes redes de farmácias. Uma Holding de Infraestrutura, sim.</p>
                    </div>
                </article>
            </div>
        </main>
        ${CTA()}
        ${Footer()}
    `;

    initAnimations();
});
