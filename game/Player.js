class Player {
    constructor(name, position, bt, hand, trait = null, era = null, id = null) {
        if (!name || !position || !bt || !hand) {
            throw new Error(`Invalid player data: ${JSON.stringify({name, position, bt, hand})}`);
        }
        
        this.id = id;
        this.name = name;
        this.position = position.toUpperCase(); // Normaliser la position
        this.bt = bt;
        this.hand = hand;
        this.trait = trait || '';
        this.era = era ? parseFloat(era) : null;
        this.pitchDieLevel = this.calculateInitialPitchDie();
    }
    



    calculateInitialPitchDie() {
        const diceMapping = [
            { maxEra: 0.99, die: 20 },
            { maxEra: 1.99, die: 12 },
            { maxEra: 2.99, die: 8 },
            { maxEra: 3.49, die: 4 },
            { maxEra: 4.00, die: -4 },
            { maxEra: 4.99, die: -8 },
            { maxEra: 5.99, die: -12 },
            { maxEra: 6.99, die: -20 },
            { maxEra: 7.99, die: -20 },
            { maxEra: Infinity, die: -25 }
        ];

        const mapping = diceMapping.find(m => this.era <= m.maxEra);
        return mapping ? mapping.die : -25;
    }

    applyHitterTraits(hitRoll) {
        if (this.trait.includes('P+')) {
            hitRoll = Math.min(20, hitRoll + 1);
        }
        if (this.trait.includes('P++')) {
            hitRoll = Math.min(20, hitRoll + 2);
        }
        return hitRoll;
    }

    updateStats(playResult) {
        this.stats.atBats++;
        switch(playResult.type) {
            case "HIT":
            case "CRITICAL HIT":
                this.stats.hits++;
                break;
            case "WALK":
                this.stats.walks++;
                break;
            case "OUT":
                if (playResult.details.includes("Strikeout")) {
                    this.stats.strikeouts++;
                }
                break;
        }
    }

    managePitcherFatigue(runsAllowed, currentInning) {
        if (currentInning > 6) {
            this.pitchDieLevel = Math.max(this.pitchDieLevel - 4, -25);
        }
        if (runsAllowed >= 3) {
            this.pitchDieLevel = Math.max(this.pitchDieLevel - 4, -25);
        }
        return this.pitchDieLevel;
    }
}

// Pour permettre l'importation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}

if (typeof window !== 'undefined') {
    window.Player = Player;
}