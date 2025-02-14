class SpecialPlaysRules {
    static DOUBLE_PLAY_THRESHOLD = 70;
    static TRIPLE_PLAY_THRESHOLD = 100;
    static SACRIFICE_FLY_THRESHOLD = 70;

    static checkDoublePlay(gameState, atBatResult, fielder) {
        // Conditions pour un double jeu possible :
        // - Moins de 2 retraits
        // - Coureur au premier but
        // - Balle au sol à l'avant-champ
        if (gameState.outs >= 2 || !gameState.bases.first.isOccupied()) {
            return false;
        }

        const isInfieldGroundball = fielder <= 6; // 1-6 sont les joueurs d'avant-champ
        if (!isInfieldGroundball) {
            return false;
        }

        return atBatResult.finalScore >= this.DOUBLE_PLAY_THRESHOLD;
    }

    static checkTriplePlay(gameState, atBatResult, fielder) {
        // Conditions pour un triple jeu possible :
        // - Aucun retrait
        // - Coureurs au premier et deuxième buts
        // - Balle au sol à l'avant-champ
        // - Score très élevé
        if (gameState.outs > 0 || 
            !gameState.bases.first.isOccupied() || 
            !gameState.bases.second.isOccupied()) {
            return false;
        }

        const isInfieldGroundball = fielder <= 6;
        if (!isInfieldGroundball) {
            return false;
        }

        return atBatResult.finalScore >= this.TRIPLE_PLAY_THRESHOLD;
    }

    static checkSacrificeFly(gameState, atBatResult, fielder) {
        // Conditions pour un ballon sacrifice :
        // - Moins de 2 retraits
        // - Coureur au troisième but
        // - Balle en vol au champ extérieur
        if (gameState.outs >= 2 || !gameState.bases.third.isOccupied()) {
            return false;
        }

        const isOutfieldFlyball = fielder >= 7; // 7-9 sont les voltigeurs
        if (!isOutfieldFlyball) {
            return false;
        }

        return atBatResult.finalScore < this.SACRIFICE_FLY_THRESHOLD;
    }

    static checkDoubleSteal(gameState, firstRunnerSpeed, secondRunnerSpeed) {
        // Vérifier si un double vol est possible
        if (!gameState.bases.first.isOccupied() || !gameState.bases.second.isOccupied()) {
            return false;
        }

        let baseStealRoll = Math.floor(Math.random() * 8) + 1; // d8

        // Modifier le roll selon la vitesse des coureurs
        if (firstRunnerSpeed.includes('S+')) baseStealRoll++;
        if (firstRunnerSpeed.includes('S-')) baseStealRoll--;
        if (secondRunnerSpeed.includes('S+')) baseStealRoll++;
        if (secondRunnerSpeed.includes('S-')) baseStealRoll--;

        return {
            success: baseStealRoll >= 6,
            runnerOut: baseStealRoll < 6 ? (baseStealRoll <= 3 ? 'lead' : 'trailing') : null
        };
    }

    static checkSqueezeBunt(gameState, batterBunting, runnerSpeed) {
        // Vérifier si un amorti suicide est possible
        if (!gameState.bases.third.isOccupied()) {
            return false;
        }

        let buntRoll = Math.floor(Math.random() * 4) + 1; // d4

        // Modifier le roll selon les compétences
        if (batterBunting.includes('C+')) buntRoll++;
        if (runnerSpeed.includes('S+')) buntRoll++;
        if (runnerSpeed.includes('S-')) buntRoll--;

        return {
            success: buntRoll >= 3,
            runnerSafe: buntRoll >= 3,
            batterSafe: buntRoll === 4
        };
    }

    static checkHitAndRun(gameState, atBatResult, runnerSpeed) {
        // Vérifier le résultat d'un hit-and-run
        if (!gameState.bases.first.isOccupied()) {
            return false;
        }

        // Sur un retrait, le coureur tente d'avancer quand même
        if (atBatResult.type === "OUT") {
            let advanceRoll = Math.floor(Math.random() * 8) + 1; // d8
            if (runnerSpeed.includes('S+')) advanceRoll++;
            if (runnerSpeed.includes('S-')) advanceRoll--;

            return {
                runnerAdvances: advanceRoll >= 6,
                hitAndRunFailed: true
            };
        }

        // Sur un coup sûr, le coureur avance une base supplémentaire
        if (atBatResult.type === "HIT") {
            return {
                runnerAdvances: true,
                extraBase: true,
                hitAndRunSuccess: true
            };
        }

        return false;
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpecialPlaysRules };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.SpecialPlaysRules = SpecialPlaysRules;
}
