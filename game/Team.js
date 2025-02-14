class Team {
    constructor(name) {
        this.name = name;
        this.players = new Array(9).fill(null);
        this.currentBatter = 0;
    }

    addPlayer(player) {
        // Validation de la position
        if (!player || !player.position) {
            console.error('Invalid player data:', {
                name: player?.name,
                position: player?.position,
                full: player
            });
            throw new Error(`Invalid player data for ${player?.name || 'unknown player'}`);
        }
    
        // Vérifier que le joueur n'existe pas déjà
        if (!this.players.find(p => p.id === player.id)) {
            this.players.push(player);
            console.log(`Player ${player.name} added to ${this.name} at position ${player.position}`);
        }
    }

    getNextBatter() {
        const batter = this.players[this.currentBatter];
        if (!batter) {
            console.error(`Pas de joueur à la position ${this.currentBatter + 1}`);
            return null;
        }
        return batter;
    }

    advanceBatter() {
        this.currentBatter = (this.currentBatter + 1) % 9;
    }

    getTeamState() {
        return {
            name: this.name,
            playerCount: this.players.filter(Boolean).length,
            currentBatter: this.currentBatter,
            players: this.players.map((p, i) => {
                if (!p) return {
                    name: 'Empty',
                    position: '',
                    bt: 0,
                    isCurrent: false
                };
                
                return {
                    name: p.name || 'Unknown',
                    position: p.position || '',
                    bt: p.bt || 0,
                    isCurrent: i === this.currentBatter
                };
            })
        };
    }
}


// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Team;
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.Team = Team;
}
