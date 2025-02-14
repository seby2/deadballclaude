class PitcherFatigueRules {
    static FATIGUE_TRIGGERS = {
        RUNS_IN_INNING: 3,        // Nombre de points dans une manche
        RUNS_IN_TWO_INNINGS: 4,   // Points sur deux manches
        MAX_RUNS: 4,              // Maximum de points avant fatigue
        INNINGS_BEFORE_FATIGUE: 6 // Manches avant fatigue naturelle
    };

    static IMPROVEMENT_CONDITIONS = {
        STRIKEOUT_SIDE: 'strikeoutSide',           // Retirer la manche sur des prises
        THREE_SHUTOUT_INNINGS: 'threeShutoutInnings', // 3 manches blanches consécutives
        ESCAPE_BASES_LOADED: 'escapeBasesLoaded'   // Sortir d'une situation bases pleines
    };

    static checkFatigue(pitcher, gameState) {
        let fatigueLevel = 0;
        
        // Vérifier la fatigue naturelle (après 6 manches)
        if (gameState.inning > this.FATIGUE_TRIGGERS.INNINGS_BEFORE_FATIGUE) {
            fatigueLevel++;
        }

        // Vérifier les points accordés dans la manche
        if (gameState.runsThisInning >= this.FATIGUE_TRIGGERS.RUNS_IN_INNING) {
            fatigueLevel++;
        }

        // Vérifier les points sur deux manches
        if (gameState.runsLastTwoInnings >= this.FATIGUE_TRIGGERS.RUNS_IN_TWO_INNINGS) {
            fatigueLevel++;
        }

        // Vérifier le total de points
        if (gameState.totalRunsAllowed > this.FATIGUE_TRIGGERS.MAX_RUNS) {
            fatigueLevel += gameState.totalRunsAllowed - this.FATIGUE_TRIGGERS.MAX_RUNS;
        }

        return this.applyFatigue(pitcher, fatigueLevel);
    }

    static applyFatigue(pitcher, fatigueLevel) {
        const diceProgression = [20, 12, 8, 4, -4, -8, -12, -20, -25];
        let currentIndex = diceProgression.indexOf(pitcher.pitchDieLevel);
        
        // Appliquer la fatigue
        currentIndex += fatigueLevel;
        
        // Limiter la fatigue
        if (currentIndex >= diceProgression.length) {
            return -25;
        }
        
        return diceProgression[currentIndex];
    }

    static checkImprovement(pitcher, gameState) {
        // Vérifier les conditions d'amélioration
        let improvement = false;

        if (gameState[this.IMPROVEMENT_CONDITIONS.STRIKEOUT_SIDE]) {
            improvement = true;
        }

        if (gameState[this.IMPROVEMENT_CONDITIONS.THREE_SHUTOUT_INNINGS]) {
            improvement = true;
        }

        if (gameState[this.IMPROVEMENT_CONDITIONS.ESCAPE_BASES_LOADED]) {
            improvement = true;
        }

        if (improvement) {
            return this.improvePitcher(pitcher);
        }

        return pitcher.pitchDieLevel;
    }

    static improvePitcher(pitcher) {
        const diceProgression = [20, 12, 8, 4, -4, -8, -12, -20, -25];
        let currentIndex = diceProgression.indexOf(pitcher.pitchDieLevel);
        
        // Améliorer le lanceur
        if (currentIndex > 0) {
            currentIndex--;
        }
        
        return diceProgression[currentIndex];
    }

    static checkReliefPitcherFatigue(pitcher, gameState) {
        let fatigueLevel = 0;

        // Les releveurs se fatiguent plus vite
        if (gameState.inningsPitched > 1) {
            fatigueLevel++;
        }

        // Chaque point accordé fatigue le releveur
        if (gameState.runsAllowed > 0) {
            fatigueLevel += gameState.runsAllowed;
        }

        return this.applyFatigue(pitcher, fatigueLevel);
    }

    static getSustainedEffortBonus(pitcher, consecutiveGoodInnings) {
        // Bonus pour effort soutenu (max +3)
        return Math.min(3, Math.floor(consecutiveGoodInnings / 3));
    }

    static getPitcherStamina(pitcher) {
        // Retourne la capacité du lanceur à résister à la fatigue
        if (pitcher.trait && pitcher.trait.includes('ST+')) {
            return this.FATIGUE_TRIGGERS.INNINGS_BEFORE_FATIGUE + 1;
        }
        return this.FATIGUE_TRIGGERS.INNINGS_BEFORE_FATIGUE;
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PitcherFatigueRules };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.PitcherFatigueRules = PitcherFatigueRules;
}
