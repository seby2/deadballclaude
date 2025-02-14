// Imports
if (typeof require !== 'undefined') {
    const { Player } = require('../../game/Player.js');
}

class PitchingRules {
    static ERA_DICE_TABLE = [
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

    static calculatePitchModifier(pitcher, batter, diceRoll) {
        let pitchModifier = 0;
        const pitchDieLevel = pitcher.pitchDieLevel;
        
        // Calcul du modificateur de base selon le dé du lanceur
        if (pitchDieLevel > 0) {
            pitchModifier = diceRoll;
        } else {
            pitchModifier = -diceRoll;
        }
        
        // Bonus pour même main
        if (this.isSameHandedness(pitcher, batter)) {
            pitchModifier += Math.floor(Math.random() * 4) + 1; // simule d4
        }
        
        return pitchModifier;
    }

    static isSameHandedness(pitcher, batter) {
        return (pitcher.hand === 'R' && batter.hand === 'R') || 
               (pitcher.hand === 'L' && batter.hand === 'L');
    }

    static calculateFatigue(pitcher, currentInning, runsAllowed) {
        let newPitchDieLevel = pitcher.pitchDieLevel;

        // Fatigue de base après la 6e manche
        if (currentInning > 6) {
            newPitchDieLevel = this.decreasePitchDie(newPitchDieLevel);
        }

        // Fatigue due aux points accordés
        if (runsAllowed >= 3) {
            newPitchDieLevel = this.decreasePitchDie(newPitchDieLevel);
        }

        return newPitchDieLevel;
    }

    static decreasePitchDie(currentDie) {
        const diceProgression = [20, 12, 8, 4, -4, -8, -12, -20, -25];
        const currentIndex = diceProgression.indexOf(currentDie);
        
        if (currentIndex === -1 || currentIndex === diceProgression.length - 1) {
            return -25; // Le pire niveau possible
        }
        
        return diceProgression[currentIndex + 1];
    }

    static increasePitchDie(currentDie) {
        const diceProgression = [20, 12, 8, 4, -4, -8, -12, -20, -25];
        const currentIndex = diceProgression.indexOf(currentDie);
        
        if (currentIndex <= 0) {
            return 20; // Le meilleur niveau possible
        }
        
        return diceProgression[currentIndex - 1];
    }

    static checkPitcherImprovement(pitcher, inningResults) {
        // Le lanceur s'améliore s'il :
        // - Retire la manche sur des prises
        // - Lance 3 manches blanches consécutives
        // - Se sort d'une situation avec les buts remplis sans accorder de point

        if (inningResults.strikeoutSide || 
            inningResults.threeShutoutInnings ||
            inningResults.escapedBasesLoaded) {
            return this.increasePitchDie(pitcher.pitchDieLevel);
        }

        return pitcher.pitchDieLevel;
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PitchingRules };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.PitchingRules = PitchingRules;
}
