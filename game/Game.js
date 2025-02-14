// Imports
if (typeof require !== 'undefined') {
    const { Player } = require('./Player.js');
    const { Team } = require('./Team.js');
    const { Base } = require('../rules/basic/BaseRunning.js');
}

class DeadballGame {
    constructor() {
        this.currentBatter = null; // Ajout d'une référence au batteur actuel
        this.initializeGame();
    }

    initializeGame() {
        this.inning = 1;
        this.isTopInning = true;
        this.outs = 0;
        this.score = { away: 0, home: 0 };
        this.gameOver = false;

        this.bases = {
            first: new Base(),
            second: new Base(),
            third: new Base()
        };

        this.inningScores = {
            away: new Array(9).fill(0),
            home: new Array(9).fill(0)
        };
    }

    HIT_TABLE = {
        1: { result: "Single+", defense: false },
        2: { result: "Single+", defense: false },
        3: { result: "Single", defense: true, fielder: "1B" },
        4: { result: "Single", defense: true, fielder: "2B" },
        5: { result: "Single", defense: true, fielder: "3B" },
        6: { result: "Single", defense: true, fielder: "SS" },
        7: { result: "Single", defense: true, fielder: "SS/2B" },
        8: { result: "Single", runners: 2 },
        9: { result: "Single", runners: 2 },
        10: { result: "Single", runners: 2 },
        11: { result: "Single", runners: 2 },
        12: { result: "Single", runners: 2 },
        13: { result: "Double", defense: true, fielder: "LF" },
        14: { result: "Double", defense: true, fielder: "CF" },
        15: { result: "Double", defense: true, fielder: "RF" },
        16: { result: "Double", runners: 3 },
        17: { result: "Double", runners: 3 },
        18: { result: "Triple", defense: true, fielder: "RF/CF" },
        19: { result: "Home Run" },
        20: { result: "Home Run" }
    };

    DEFENSE_TABLE = [
        { min: 1, max: 2, result: "Error", extraBases: 1 },
        { min: 3, max: 9, result: "NoChange", extraBases: 0 },
        { min: 10, max: 11, result: "ReduceHit", extraBases: 0 },
        { min: 12, max: 12, result: "Out", extraBases: 0 }
    ];

    // Méthodes pour gérer les dés
    rollDice(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    rollD100() {
        return this.rollDice(100);
    }

    // Dans calculateAtBatResult - version originale qui fonctionnait
    calculateAtBatResult
    
    // Dans processAtBat, ajoutons aussi des logs
    processAtBat(pitcher, batter) {
        // Ajouter des vérifications au début
        if (!batter || !pitcher) {
            console.error('Batteur ou lanceur manquant:', { batter, pitcher });
            return null;
        }
    
        console.log(`\nNouvelle présence au bâton: ${batter.name} contre ${pitcher.name}`);
        if (this.gameOver) {
            return { type: "ERROR", details: "La partie est terminée" };
        }
    
        // Calculer le score du swing
        const swingScore = this.rollDice(100);
        console.log(`Score du swing: ${swingScore}`);
    
        // Calculer le modificateur du lanceur
        const pitchDieLevel = pitcher.pitchDieLevel;
        let pitchModifier = 0;
        if (pitchDieLevel > 0) {
            pitchModifier = this.rollDice(Math.abs(pitchDieLevel));
        } else {
            pitchModifier = -this.rollDice(Math.abs(pitchDieLevel));
        }
    
        // Calculer le score final (MSS)
        const finalScore = swingScore + pitchModifier;
        console.log(`Score final: ${finalScore} (Cible: ${batter.bt})`);
    
        let hitRoll = 0;
        let result = {
            type: "",
            details: {},
            swingScore,
            pitchModifier,
            finalScore,
            batterTarget: batter.bt,
            hitRoll,
            batter: { // Créer une copie de l'objet batteur
                id: batter.id,
                name: batter.name,
                position: batter.position,
                bt: batter.bt,
                hand: batter.hand,
                trait: batter.trait
            }
        };
    
        if (finalScore <= 5) {
            result.type = "CRITICAL HIT";
            hitRoll = this.rollDice(20);
            result.hitRoll = hitRoll;
            result.details = this.processCriticalHit(hitRoll);
            console.log("COUP CRITIQUE!");
        } 
        else if (finalScore <= batter.bt) {
            result.type = "HIT";
            hitRoll = this.rollDice(20);
            result.hitRoll = hitRoll;
            result.details = this.processHit(hitRoll);
            console.log("COUP SÛR!");
        }
        else if (finalScore <= batter.bt + 5) {
            result.type = "WALK";
            result.details = { result: "Walk" };
            console.log("BUT SUR BALLES!");
        }
        else {
            result.type = "OUT";
            result.details = this.generateOutDetails(finalScore);
            console.log("RETRAIT!");
        }
        
        // Log du résultat avant resolvePlay
        console.log("Résultat avant resolvePlay:", result);
        
        // Résoudre le jeu
        this.resolvePlay({...result}); // Passer une copie du résultat
        
        // Faire avancer le batteur
        const battingTeam = this.isTopInning ? this.awayTeam : this.homeTeam;
        battingTeam.advanceBatter();
        
        // Log du résultat après resolvePlay
        console.log("Résultat après resolvePlay:", result);
        
        return result;
    }
    
    
    

    processHit(hitRoll) {
        const hitDetails = this.HIT_TABLE[hitRoll];
        
        if (!hitDetails) {
            console.error(`No hit details found for roll: ${hitRoll}`);
            return { result: "Single", defense: false };
        }
        
        // Gestion de la défense si nécessaire
        if (hitDetails.defense) {
            const defRoll = this.rollDice(12);
            return this.processDefenseRoll(defRoll, hitDetails);
        }
        
        return hitDetails;
    }

    processCriticalHit(hitRoll) {
        const hitDetails = this.HIT_TABLE[hitRoll];
        
        if (!hitDetails) {
            console.error(`No hit details found for roll: ${hitRoll}`);
            return { result: "Home Run" };
        }
        
        // Améliorer le coup
        let upgradedResult;
        switch(hitDetails.result) {
            case "Single":
                upgradedResult = "Double";
                break;
            case "Double":
                upgradedResult = "Triple";
                break;
            case "Triple":
            case "Home Run":
                upgradedResult = "Home Run";
                break;
            default:
                upgradedResult = "Home Run";
        }
        
        return {
            ...hitDetails,
            result: upgradedResult
        };
    }

    processDefenseRoll(defRoll, hitDetails) {
        const defResult = this.DEFENSE_TABLE.find(
            def => defRoll >= def.min && defRoll <= def.max
        );

        switch(defResult.result) {
            case "Error":
                return { 
                    ...hitDetails, 
                    result: hitDetails.result, 
                    extraBases: defResult.extraBases 
                };
            case "ReduceHit":
                // Réduire le type de coup
                const hitReduction = {
                    "Home Run": "Triple",
                    "Triple": "Double",
                    "Double": "Single",
                    "Single": "Single"
                };
                return { 
                    ...hitDetails, 
                    result: hitReduction[hitDetails.result] 
                };
            case "Out":
                return { 
                    type: "OUT", 
                    result: "Defensive Out" 
                };
            default:
                return hitDetails;
        }
    }

    processAtBat(pitcher, batter) {
        // Stocker le batteur actuel
        this.currentBatter = batter;

        console.log(`\nNouvelle présence au bâton: ${batter.name} contre ${pitcher.name}`);
        if (this.gameOver) {
            return { type: "ERROR", details: "La partie est terminée" };
        }

        // Calculer le score du swing
        const swingScore = this.rollDice(100);
        console.log(`Score du swing: ${swingScore}`);

        // Calculer le modificateur du lanceur
        const pitchDieLevel = pitcher.pitchDieLevel;
        let pitchModifier = 0;
        if (pitchDieLevel > 0) {
            pitchModifier = this.rollDice(Math.abs(pitchDieLevel));
        } else {
            pitchModifier = -this.rollDice(Math.abs(pitchDieLevel));
        }

        // Calculer le score final (MSS)
        const finalScore = swingScore + pitchModifier;
        console.log(`Score final: ${finalScore} (Cible: ${batter.bt})`);

        let hitRoll = 0;
        let result = {
            type: "",
            details: {},
            swingScore,
            pitchModifier,
            finalScore,
            batterTarget: batter.bt,
            hitRoll,
            batter: {
                id: batter.id,
                name: batter.name,
                position: batter.position,
                bt: batter.bt,
                hand: batter.hand,
                trait: batter.trait,
                era: batter.era
            }
        };

        if (finalScore <= 5) {
            result.type = "CRITICAL HIT";
            hitRoll = this.rollDice(20);
            result.hitRoll = hitRoll;
            result.details = this.processCriticalHit(hitRoll);
            console.log("COUP CRITIQUE!");
        } 
        else if (finalScore <= batter.bt) {
            result.type = "HIT";
            hitRoll = this.rollDice(20);
            result.hitRoll = hitRoll;
            result.details = this.processHit(hitRoll);
            console.log("COUP SÛR!");
        }
        else if (finalScore <= batter.bt + 5) {
            result.type = "WALK";
            result.details = { result: "Walk" };
            console.log("BUT SUR BALLES!");
        }
        else {
            result.type = "OUT";
            result.details = this.generateOutDetails(finalScore);
            console.log("RETRAIT!");
        }

        // Résoudre le jeu avec le résultat et le batteur actuel
        this.resolvePlay(result);

        return result;
    }

    // Dans resolvePlay - version originale qui fonctionnait
    resolvePlay(playResult) {
        console.log("\n=== RÉSOLUTION DU JEU ===");
        console.log("PlayResult reçu:", playResult);
    
        // Vérifier et extraire le batteur
        if (!playResult.batter) {
            console.error('Batteur manquant dans playResult:', playResult);
            return;
        }
    
        const batter = playResult.batter;
        const isTopInning = this.isTopInning;
        const battingTeam = isTopInning ? 'away' : 'home';
    
        switch(playResult.type) {
            case "CRITICAL HIT":
            case "HIT":
                const hitType = playResult.details.result;
                let extraBases = 0;
                
                switch(hitType) {
                    case "Home Run": 
                        extraBases = 4;
                        // Ajouter un point pour le batteur
                        this.score[battingTeam]++;
                        // Ajouter le point à la manche actuelle
                        this.inningScores[battingTeam][this.inning - 1]++;
                        break;
                    case "Triple": 
                        extraBases = 3;
                        break;
                    case "Double": 
                        extraBases = 2;
                        break;
                    default: 
                        extraBases = 1;
                }
                
                this.advanceRunners(false, extraBases, batter);
                break;
    
            case "WALK":
                this.advanceRunners(true, 0, batter);
                break;
    
            case "OUT":
                this.addOut();
                break;
        }
    
        // Stocker l'action pour l'affichage
        this.lastAction = {
            ...playResult,
            inning: this.inning,
            isTopInning: this.isTopInning,
            outs: this.outs,
            score: {...this.score},
            bases: {
                first: this.bases.first.isOccupied(),
                second: this.bases.second.isOccupied(),
                third: this.bases.third.isOccupied()
            }
        };
    
        // Log du résultat
        if (playResult.type === "OUT") {
            console.log(`\n=== RETRAIT #${this.outs} ===`);
        }
    }
    
    addOut() {
        this.outs++;
        
        // Vérifier si la demi-manche est terminée
        if (this.outs >= 3) {
            this.endInning();
        }
    }
    
    endInning() {
        // Vider les bases
        this.bases.first = new Base();
        this.bases.second = new Base();
        this.bases.third = new Base();
        
        // Réinitialiser les retraits
        this.outs = 0;
    
        // Changer de demi-manche
        if (this.isTopInning) {
            this.isTopInning = false;
        } else {
            this.isTopInning = true;
            this.inning++;
        }
    
        // Vérifier si le match est terminé
        if (this.inning > 9) {
            this.gameOver = true;
        }
    }
    
    advanceRunners(isWalk, extraBases, batter) {
        const battingTeam = this.isTopInning ? 'away' : 'home';
    
        // Sauvegarder les coureurs actuels
        const runnerOnThird = this.bases.third.removeRunner();
        const runnerOnSecond = this.bases.second.removeRunner();
        const runnerOnFirst = this.bases.first.removeRunner();
    
        // Si c'est un but sur balles
        if (isWalk) {
            // Si les bases sont pleines, le coureur au troisième marque
            if (runnerOnFirst && runnerOnSecond && runnerOnThird) {
                this.score[battingTeam]++;
                this.inningScores[battingTeam][this.inning - 1]++;
            }
            
            // Replacer les coureurs
            if (runnerOnSecond) this.bases.third.placeRunner(runnerOnSecond);
            if (runnerOnFirst) this.bases.second.placeRunner(runnerOnFirst);
            this.bases.first.placeRunner(batter);
        } 
        // Si c'est un coup sûr
        else {
            // Faire avancer les coureurs selon le nombre de bases
            if (runnerOnThird) {
                this.score[battingTeam]++;
                this.inningScores[battingTeam][this.inning - 1]++;
            }
            if (runnerOnSecond && extraBases >= 2) {
                this.score[battingTeam]++;
                this.inningScores[battingTeam][this.inning - 1]++;
            }
            if (runnerOnFirst && extraBases >= 3) {
                this.score[battingTeam]++;
                this.inningScores[battingTeam][this.inning - 1]++;
            }
    
            // Placer le batteur selon le type de coup
            switch(extraBases) {
                case 4: // Home run
                    this.score[battingTeam]++;
                    this.inningScores[battingTeam][this.inning - 1]++;
                    break;
                case 3: // Triple
                    this.bases.third.placeRunner(batter);
                    break;
                case 2: // Double
                    this.bases.second.placeRunner(batter);
                    break;
                case 1: // Single
                    this.bases.first.placeRunner(batter);
                    break;
            }
        }
    }
    
    
    
    

    // Dans Game.js, méthode advanceRunners
    advanceRunners(isWalk, bases, batter) {
        console.log("\n=== AVANCEMENT DES COUREURS ===");
        
        if (isWalk) {
            if (this.bases.first.isOccupied() && this.bases.second.isOccupied() && this.bases.third.isOccupied()) {
                // Bases pleines = point forcé
                const scoringRunner = this.bases.third.removeRunner();
                this.scoreRun(scoringRunner);
            }
            if (this.bases.first.isOccupied() && this.bases.second.isOccupied()) {
                this.bases.third.placeRunner(this.bases.second.removeRunner());
            }
            if (this.bases.first.isOccupied()) {
                this.bases.second.placeRunner(this.bases.first.removeRunner());
            }
            this.bases.first.placeRunner(batter);
        } else {
            // Pour un coup sûr
            let runnersToScore = [];
            
            // Sauvegarder les coureurs actuels
            const oldRunner3 = this.bases.third.removeRunner();
            const oldRunner2 = this.bases.second.removeRunner();
            const oldRunner1 = this.bases.first.removeRunner();
            
            // Faire marquer les points
            if (oldRunner3) runnersToScore.push(oldRunner3);
            if (bases >= 2 && oldRunner2) runnersToScore.push(oldRunner2);
            if (bases >= 3 && oldRunner1) runnersToScore.push(oldRunner1);
            if (bases >= 4) runnersToScore.push(batter);

            // Marquer les points
            runnersToScore.forEach(runner => this.scoreRun(runner));
            
            // Placer les coureurs restants
            switch(bases) {
                case 1: // Simple
                    if (oldRunner2) this.bases.third.placeRunner(oldRunner2);
                    if (oldRunner1) this.bases.second.placeRunner(oldRunner1);
                    this.bases.first.placeRunner(batter);
                    break;
                case 2: // Double
                    if (oldRunner1) this.bases.third.placeRunner(oldRunner1);
                    this.bases.second.placeRunner(batter);
                    break;
                case 3: // Triple
                    this.bases.third.placeRunner(batter);
                    break;
                // Case 4 = Home Run, déjà géré
            }
        }

        this.logBaseState();
    }

    logBaseState() {
        console.log("\nÉtat des buts:");
        console.log("1B:", this.bases.first.isOccupied() ? this.bases.first.player.name : "vide");
        console.log("2B:", this.bases.second.isOccupied() ? this.bases.second.player.name : "vide");
        console.log("3B:", this.bases.third.isOccupied() ? this.bases.third.player.name : "vide");
    }

scoreRun(runner) {
    if (!runner) return;
    
    console.log(`\n=== POINT MARQUÉ par ${runner.name} ===`);
    if (this.isTopInning) {
        this.score.away++;
        this.inningScores.away[this.inning - 1]++;
    } else {
        this.score.home++;
        this.inningScores.home[this.inning - 1]++;
    }
    
    console.log(`Score: ${this.score.away} - ${this.score.home}`);
}
    
    getInningScore(isAwayTeam, inning) {
        return this.inningScores[isAwayTeam ? 'away' : 'home'][inning - 1];
    }

    generateOutDetails(finalScore, batter) {
        // Obtenir le dernier chiffre du score final pour déterminer le type de retrait
        const lastDigit = finalScore % 10;
        
        switch(lastDigit) {
            case 0:
            case 1:
            case 2:
                return "Strikeout (K)";
            case 3:
                return "Groundout to first (G-3)";
            case 4:
                return "Groundout to second (4-3)";
            case 5:
                return "Groundout to third (5-3)";
            case 6:
                return "Groundout to short (6-3)";
            case 7:
                return "Fly out to left field (F-7)";
            case 8:
                return "Fly out to center field (F-8)";
            case 9:
                return "Fly out to right field (F-9)";
            default:
                return "Out";
        }
    }

    addOut() {
        this.outs++;
        console.log(`\n=== RETRAIT #${this.outs} ===`);
        
        if (this.outs >= 3) {
            console.log("Fin de la demi-manche");
            this.endInning();
            return true;
        }
        return false;
    }

    endInning() {
        console.log("\n==== FIN DE DEMI-MANCHE ====");
        console.log(`Score: ${this.score.away} - ${this.score.home}`);
        
        // Vider les bases
        this.bases.first = new Base();
        this.bases.second = new Base();
        this.bases.third = new Base();
        
        // Changer de demi-manche
        if (this.isTopInning) {
            this.isTopInning = false;
        } else {
            this.isTopInning = true;
            this.inning++;
        }
        
        // Réinitialiser les retraits
        this.outs = 0;

        // Vérifier si le jeu est terminé
        this.checkGameStatus();
    }

    checkGameStatus() {
        if (this.inning > 9) {
            this.gameOver = true;
            window.dispatchEvent(new CustomEvent('gameEnd', {
                detail: {
                    finalScore: this.score
                }
            }));
            return true;
        }
    
        if (Math.abs(this.score.away - this.score.home) > 10) {
            this.gameOver = true;
            window.dispatchEvent(new CustomEvent('gameEnd', {
                detail: {
                    finalScore: this.score,
                    reason: 'mercy'
                }
            }));
            return true;
        }
    
        return false;
    }

    getGameState() {
        return {
            inning: this.inning,
            isTopInning: this.isTopInning,
            outs: this.outs,
            score: this.score,
            bases: {
                first: { occupied: this.bases.first.isOccupied(), player: this.bases.first.player },
                second: { occupied: this.bases.second.isOccupied(), player: this.bases.second.player },
                third: { occupied: this.bases.third.isOccupied(), player: this.bases.third.player }
            },
            gameOver: this.gameOver,
            lastAction: this.lastAction,
            // Ajoutez ceci si ce n'est pas déjà présent
            diceRolls: {
                swingScore: this.lastAction?.swingScore,
                pitchModifier: this.lastAction?.pitchModifier,
                hitRoll: this.lastAction?.hitRoll
            }
        };
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DeadballGame };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.DeadballGame = DeadballGame;
}
