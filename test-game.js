class GameTester {
    constructor(gameUI) {
        this.gameUI = gameUI;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTestUI());
        } else {
            setTimeout(() => this.setupTestUI(), 100);
        }
    }

    setupTestUI() {
        const buttons = {
            'test-walk': 'WALK',
            'test-single': 'SINGLE',
            'test-double': 'DOUBLE',
            'test-triple': 'TRIPLE',
            'test-home-run': 'HOME_RUN',
            'test-history': 'SHOW_HISTORY'  // Nouveau bouton
        };

        // Créer le conteneur des boutons s'il n'existe pas
        let testControls = document.querySelector('.test-controls');
        if (!testControls) {
            testControls = document.createElement('div');
            testControls.className = 'test-controls';
            document.querySelector('.controls-section').appendChild(testControls);
        }

        // Créer ou configurer les boutons
        for (const [id, playType] of Object.entries(buttons)) {
            let button = document.getElementById(id);
            if (!button) {
                button = document.createElement('button');
                button.id = id;
                button.className = 'test-btn';
                button.textContent = playType.replace('_', ' ');
                testControls.appendChild(button);
            }

            button.addEventListener('click', () => {
                if (playType === 'SHOW_HISTORY') {
                    this.showGameHistory();
                } else {
                    this.simulatePlay(playType);
                }
            });
        }
    }

    simulatePlay(playType) {
        if (this.gameUI.game.gameOver) {
            console.log("Le jeu est terminé");
            return;
        }
    
        const gameState = this.gameUI.game.getGameState();
        const battingTeam = gameState.isTopInning ? this.gameUI.awayTeam : this.gameUI.homeTeam;
        const pitchingTeam = gameState.isTopInning ? this.gameUI.homeTeam : this.gameUI.awayTeam;
        
        const batter = battingTeam.players[battingTeam.currentBatter];
        const pitcher = pitchingTeam.players[8];
    
        const simulatedResult = this.createSimulatedResult(playType, batter);
    
        // Mettre à jour l'historique avant de résoudre le jeu
        this.updateGameHistory(simulatedResult, batter, pitcher);
        
        // Résoudre le jeu simulé
        this.gameUI.game.resolvePlay(simulatedResult);
    
        // Mettre à jour les stats
        this.updatePlayerStats(batter, pitcher, simulatedResult);
    
        // Faire avancer le batteur
        battingTeam.currentBatter = (battingTeam.currentBatter + 1) % 9;
    
        // Mettre à jour l'affichage
        this.gameUI.updateDisplay();
    }

    updateGameHistory(result, batter, pitcher) {
        const play = {
            inning: this.gameUI.game.inning,
            isTopInning: this.gameUI.game.isTopInning,
            batter: {
                id: batter.id || batter.name,
                name: batter.name,
                team: this.gameUI.game.isTopInning ? 'away' : 'home'
            },
            pitcher: {
                id: pitcher.id || pitcher.name,
                name: pitcher.name,
                team: this.gameUI.game.isTopInning ? 'home' : 'away'
            },
            roll: {
                swingScore: result.swingScore,
                pitchModifier: result.pitchModifier,
                finalScore: result.finalScore,
                hitRoll: result.hitRoll
            },
            result: {
                type: result.type,
                details: result.details
            },
            timestamp: new Date()
        };

        this.gameUI.gameHistory.plays.push(play);
    }

    updatePlayerStats(batter, pitcher, result) {
        const batterTeam = this.gameUI.game.isTopInning ? 'away' : 'home';
        const batterStats = this.gameUI.gameHistory.stats[batterTeam].get(batter.id || batter.name);

        if (batterStats) {
            switch(result.type) {
                case "HIT":
                    batterStats.atBats++;
                    batterStats.hits++;
                    break;
                case "WALK":
                    batterStats.walks++;
                    break;
                case "OUT":
                    batterStats.atBats++;
                    if (result.details.includes("Strikeout")) {
                        batterStats.strikeouts++;
                    }
                    break;
            }
        }
    }

    showGameHistory() {
        console.log("\n=== HISTORIQUE DU JEU ===");
        console.log("Plays:", this.gameUI.gameHistory.plays);
        
        console.log("\n=== STATISTIQUES ===");
        console.log("Home Team Stats:", Array.from(this.gameUI.gameHistory.stats.home.values()));
        console.log("Away Team Stats:", Array.from(this.gameUI.gameHistory.stats.away.values()));
    }

    createSimulatedResult(playType, batter) {
        let simulatedResult = {
            type: '',
            details: {},
            batter: batter,
            swingScore: 50,
            pitchModifier: 0,
            finalScore: 50,
            batterTarget: batter.bt,
            hitRoll: 0  // Ajouté pour l'historique
        };

        switch(playType) {
            case 'WALK':
                simulatedResult.type = 'WALK';
                simulatedResult.details = { result: 'Walk' };
                simulatedResult.finalScore = batter.bt + 1;
                break;
            case 'SINGLE':
                simulatedResult.type = 'HIT';
                simulatedResult.details = { result: 'Single', defense: false };
                simulatedResult.finalScore = batter.bt - 1;
                simulatedResult.hitRoll = 1;
                break;
            case 'DOUBLE':
                simulatedResult.type = 'HIT';
                simulatedResult.details = { result: 'Double', runners: 2 };
                simulatedResult.finalScore = batter.bt - 1;
                simulatedResult.hitRoll = 13;
                break;
            case 'TRIPLE':
                simulatedResult.type = 'HIT';
                simulatedResult.details = { result: 'Triple', runners: 3 };
                simulatedResult.finalScore = batter.bt - 1;
                simulatedResult.hitRoll = 18;
                break;
            case 'HOME_RUN':
                simulatedResult.type = 'HIT';
                simulatedResult.details = { 
                    result: 'Home Run', 
                    description: 'Home run simulé' 
                };
                simulatedResult.finalScore = batter.bt - 1;
                simulatedResult.hitRoll = 20;
                break;
        }

        return simulatedResult;
    }
}

// Initialisation
window.addEventListener('load', () => {
    const checkGameUI = () => {
        if (window.gameUI) {
            const gameTester = new GameTester(window.gameUI);
            // Rendre le testeur disponible globalement pour le debug
            window.gameTester = gameTester;
            console.log('Game Tester initialized and ready');
        } else {
            setTimeout(checkGameUI, 50);
        }
    };

    checkGameUI();
});
