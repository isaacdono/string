import Navbar from './components/Navbar.js';
import Hero from './components/Hero.js';
import HowItWorks from './components/HowItWorks.js';
import Purpose from './components/Purpose.js';
import CTA from './components/CTA.js';
import Footer from './components/Footer.js';
import { initAnimations } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        ${Navbar()}
        <main>
            ${Hero()}
            ${HowItWorks()}
            ${Purpose()}
            ${CTA()}
        </main>
        ${Footer()}
    `;

    initAnimations();
});
