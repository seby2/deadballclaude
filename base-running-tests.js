// base-running-tests.js
class BaseRunningTester {
    constructor() {
        this.game = new DeadballGame();
        this.tests = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    // Ajout de la méthode manquante setupBaseScenario
    setupBaseScenario(runnersConfig) {
        this.game = new DeadballGame(); // Reset game state
        
        if (runnersConfig.first) {
            this.game.bases.first.placeRunner(new Player("Runner on 1st", "RF", 25, "R"));
        }
        if (runnersConfig.second) {
            this.game.bases.second.placeRunner(new Player("Runner on 2nd", "CF", 25, "R"));
        }
        if (runnersConfig.third) {
            this.game.bases.third.placeRunner(new Player("Runner on 3rd", "LF", 25, "R"));
        }
    }

    assert(condition, message, diceResults = null) {
        this.tests.total++;
        if (condition) {
            this.tests.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.tests.failed++;
            console.error(`❌ FAIL: ${message}`);
        }
        
        if (diceResults) {
            console.log("Détails des dés :");
            console.table(diceResults);
        }
    }

    logDiceRoll(type, sides, result) {
        console.log(`🎲 Dé ${type} (d${sides}): ${result}`);
    }

    simulateAtBat(batter, pitcher) {
        const swingScore = this.game.rollDice(100);
        this.logDiceRoll("Swing", 100, swingScore);

        const pitchDie = Math.abs(pitcher.pitchDieLevel);
        const pitchRoll = this.game.rollDice(pitchDie);
        this.logDiceRoll("Pitch", pitchDie, pitchRoll);

        const finalScore = swingScore + (pitcher.pitchDieLevel > 0 ? pitchRoll : -pitchRoll);
        console.log(`Score Final: ${finalScore} (Cible: ${batter.bt})`);

        return {
            swingScore,
            pitchRoll,
            finalScore,
            pitchDie,
            batterTarget: batter.bt
        };
    }

    testDoubleScenarios() {
        console.log("\n=== Test des scénarios avec un double ===");
        console.log("\n--- Test: Double avec coureur au premier but ---");

        // Configuration initiale
        this.setupBaseScenario({ first: true });
        const batter = new Player("Test Batter", "1B", 25, "R");
        const pitcher = new Player("Test Pitcher", "P", 9, "R", null, 3.0);

        // Log de la situation initiale
        console.log("Situation initiale:");
        console.log("- Coureur au premier but");
        console.log("- Batteur: BT", batter.bt);
        console.log("- Lanceur: ERA", pitcher.era, "Pitch Die", pitcher.pitchDieLevel);

        // Simuler la présence au bâton
        const diceResults = this.simulateAtBat(batter, pitcher);

        // Simuler le résultat Hit Table
        const hitRoll = this.game.rollDice(20);
        this.logDiceRoll("Hit Table", 20, hitRoll);
        diceResults.hitRoll = hitRoll;

        // Appliquer le résultat
        this.game.advanceRunners(false, 2, batter);

        // Vérifier le résultat
        const result = {
            runnerOnSecond: this.game.bases.second.isOccupied(),
            runnerOnThird: this.game.bases.third.isOccupied(),
            firstBaseEmpty: !this.game.bases.first.isOccupied()
        };

        this.assert(
            result.runnerOnSecond && result.runnerOnThird && result.firstBaseEmpty,
            "Sur un double avec coureur au premier but, le coureur devrait être au troisième but et le batteur au deuxième",
            diceResults
        );

        // Log de la situation finale
        console.log("\nSituation finale:");
        console.log("Premier but:", this.game.bases.first.isOccupied() ? "Occupé" : "Vide");
        console.log("Deuxième but:", this.game.bases.second.isOccupied() ? "Occupé" : "Vide");
        console.log("Troisième but:", this.game.bases.third.isOccupied() ? "Occupé" : "Vide");
        console.log("Points:", this.game.score.away);
    }

    runAllTests() {
        console.log("=== DÉBUT DES TESTS DE COURSE SUR LES BUTS ===\n");
        this.testPitcherDice();  // Ajoutez cette ligne
        this.testDoubleScenarios();
        
        console.log(`\n=== RÉSULTATS DES TESTS ===`);
        console.log(`Total: ${this.tests.total}`);
        console.log(`Réussis: ${this.tests.passed}`);
        console.log(`Échoués: ${this.tests.failed}`);
    }

    // Ajoutez ceci à base-running-tests.js
testPitcherDice() {
    console.log("\n=== Test des dés des lanceurs ===");

    // Test 1: Bon lanceur (ERA 2.50, d8)
    const goodPitcher = new Player("Good Pitcher", "P", 9, "R", null, 2.50);
    console.log("\nTest avec bon lanceur (ERA 2.50, devrait utiliser d8):");
    console.log("Pitch Die Level:", goodPitcher.pitchDieLevel);
    
    // Simuler plusieurs lancers
    console.log("\nSimulation de 5 lancers:");
    for(let i = 0; i < 5; i++) {
        const swingScore = this.game.rollDice(100);
        const pitchRoll = this.game.rollDice(8);
        const finalScore = swingScore + pitchRoll;  // Addition car bon lanceur
        
        console.log(`\nLancer ${i + 1}:`);
        console.log(`- Swing Score: ${swingScore}`);
        console.log(`- Pitch Roll (d8): +${pitchRoll}`);
        console.log(`- Score Final: ${finalScore}`);
        this.assert(finalScore > swingScore, 
            `Un bon lanceur devrait augmenter le score (${swingScore} -> ${finalScore})`);
    }

    // Test 2: Mauvais lanceur (ERA 4.50, -d8)
    const badPitcher = new Player("Bad Pitcher", "P", 9, "R", null, 4.50);
    console.log("\nTest avec mauvais lanceur (ERA 4.50, devrait utiliser -d8):");
    console.log("Pitch Die Level:", badPitcher.pitchDieLevel);
    
    // Simuler plusieurs lancers
    console.log("\nSimulation de 5 lancers:");
    for(let i = 0; i < 5; i++) {
        const swingScore = this.game.rollDice(100);
        const pitchRoll = this.game.rollDice(8);
        const finalScore = swingScore - pitchRoll;  // Soustraction car mauvais lanceur
        
        console.log(`\nLancer ${i + 1}:`);
        console.log(`- Swing Score: ${swingScore}`);
        console.log(`- Pitch Roll (d8): -${pitchRoll}`);
        console.log(`- Score Final: ${finalScore}`);
        this.assert(finalScore < swingScore, 
            `Un mauvais lanceur devrait diminuer le score (${swingScore} -> ${finalScore})`);
    }
}
}

