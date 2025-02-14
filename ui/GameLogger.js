class GameLogger {
    constructor(awayTeam, homeTeam) {
        this.logs = [];
        this.awayTeam = awayTeam;
        this.homeTeam = homeTeam;
        this.currentInning = 0;
    }

    createSeparator() {
        return "-".repeat(80);
    }

    logGameStart() {
        this.addLog("\n=== DÉBUT DE LA PARTIE ===");
        this.addLog(`${this.awayTeam.name} @ ${this.homeTeam.name}\n`);
    }

    logInningStart(inningNumber, isTopInning) {
        this.currentInning = inningNumber;
        const teamAtBat = isTopInning ? this.awayTeam.name : this.homeTeam.name;
        
        this.addLog(this.createSeparator());
        this.addLog(`Manche ${inningNumber} - ${isTopInning ? "Haut" : "Bas"}`);
        this.addLog(`Au bâton: ${teamAtBat}`);
        this.addLog(this.createSeparator());
    }

    logAtBat(batter, pitcher, result) {
        let action = '';
        let details = '';
    
        switch(result.type) {
            case 'HIT':
                action = `✓ ${result.details.result}`;
                details = this.formatDetails(result.details);
                break;
            case 'WALK':
                action = "BB";
                break;
            case 'OUT':
                action = "✗";
                details = result.details || '';
                break;
            case 'CRITICAL HIT':
                action = `★ ${result.details.result}`;
                details = this.formatDetails(result.details);
                break;
        }
    
        // Formater le message avec des espaces fixes pour un meilleur alignement
        const message = `${batter.name.padEnd(20)} ${action.padEnd(15)} ${details}`;
        this.addLog(message);
    }
    
    // Méthode pour convertir les détails en chaîne lisible
    formatDetails(details) {
        if (!details) return '';
        
        if (typeof details === 'object') {
            // Filtrer uniquement les informations importantes
            const relevantDetails = {
                result: details.result,
                defense: details.defense,
                fielder: details.fielder,
                runners: details.runners
            };
    
            return Object.entries(relevantDetails)
                .filter(([key, value]) => value !== undefined && value !== false)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        }
        
        return details.toString();
    }

    logOutCount(outs) {
        if (outs === 3) {
            this.addLog(`Fin de présence - 3 retraits`);
        }
    }

    logInningEnd(score) {
        this.addLog(this.createSeparator());
        this.addLog(`Score: ${this.awayTeam.name} ${score.away} - ${this.homeTeam.name} ${score.home}\n`);
    }

    logGameEnd(score) {
        this.addLog("\n=== FIN DE LA PARTIE ===");
        this.addLog(`Score final:`);
        this.addLog(`${this.awayTeam.name}: ${score.away}`);
        this.addLog(`${this.homeTeam.name}: ${score.home}`);
        this.addLog(this.createSeparator());
    }

    addLog(message) {
        const gameLog = document.getElementById('game-log');
        if (!gameLog) {
            console.error("Element game-log non trouvé lors de l'ajout du message:", message);
            return;
        }
    
        try {
            // Créer l'entrée de log
            const entry = document.createElement('div');
            entry.textContent = message;
            entry.style.marginBottom = '4px';
            entry.style.whiteSpace = 'pre-wrap';
            
            // Ajouter l'entrée au log
            gameLog.appendChild(entry);
            
            // Scroller vers le bas
            requestAnimationFrame(() => {
                gameLog.scrollTop = gameLog.scrollHeight;
            });
            
            // Stocker le message dans l'historique
            this.logs.push(message);
            
            // Debug
            console.log('Log ajouté:', message);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du log:', error);
        }
    }
    
}