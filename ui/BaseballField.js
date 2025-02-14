// Imports
if (typeof require !== 'undefined') {
    Base = require('../rules/basic/BaseRunning.js');
}

class BaseballField {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.previousState = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
        <svg viewBox="0 0 400 400" style="width:100%; height:100%;">
            <!-- Fond vert -->
            <path d="M 200 50 L 350 200 L 200 350 L 50 200 Z" fill="#777842"/>
            
            <!-- Terrain intérieur -->
            <path d="M 200 100 L 300 200 L 200 300 L 100 200 Z" fill="#d9bc77"/>
            
            <!-- Les bases -->
            <rect x="195" y="95" width="10" height="10" fill="white" transform="rotate(45, 200, 100)"/>
            <rect x="295" y="195" width="10" height="10" fill="white" transform="rotate(45, 300, 200)"/>
            <rect x="95" y="195" width="10" height="10" fill="white" transform="rotate(45, 100, 200)"/>
            <rect x="195" y="295" width="10" height="10" fill="white" transform="rotate(45, 200, 300)"/>

            <!-- Conteneurs pour les joueurs sur chaque base -->
            <g id="first-base-runner" transform="translate(300, 200)"></g>
            <g id="second-base-runner" transform="translate(200, 100)"></g>
            <g id="third-base-runner" transform="translate(100, 200)"></g>
            <g id="home-base-batter" transform="translate(200, 295)"></g>
        </svg>`;
    }

    updateRunners(gameState) {
        // Vérifier si l'état a vraiment changé
        const currentStateString = JSON.stringify(gameState.bases);
        if (this.previousState && this.previousState === currentStateString) {
            return; // Ne pas mettre à jour si l'état n'a pas changé
        }
        this.previousState = currentStateString;

        const bases = [
            { id: 'first-base-runner', baseKey: 'first' },
            { id: 'second-base-runner', baseKey: 'second' },
            { id: 'third-base-runner', baseKey: 'third' }
        ];
        
        // Mettre à jour chaque base
        bases.forEach(base => {
            const runnerContainer = document.getElementById(base.id);
            if (!runnerContainer) return;
    
            const baseState = gameState.bases[base.baseKey];
            runnerContainer.innerHTML = '';
        
            if (baseState.occupied && baseState.player) {
                runnerContainer.innerHTML = this.createRunnerElement(baseState.player.name);
            }
        });
    }

    createRunnerElement(name) {
        return `
            <circle cx="0" cy="0" r="10" fill="white" stroke="black"/>
            <text 
                x="0" 
                y="20" 
                text-anchor="middle" 
                font-size="10" 
                fill="black"
            >
                ${name}
            </text>
        `;
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const baseballField = new BaseballField('baseball-field');
});