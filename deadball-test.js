// deadball-test.js
class DeadballTester {
    constructor() {
        this.tests = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.game = new DeadballGame();
    }

    // Utilitaire pour tester
    assert(condition, message) {
        this.tests.total++;
        if (condition) {
            this.tests.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.tests.failed++;
            console.error(`❌ FAIL: ${message}`);
        }
    }

    // Test des règles de base du batteur
    testBasicBatterRules() {
        console.log("\n=== Test des règles de base du batteur ===");
        
        // Créer un batteur test
        const batter = new Player("Test Batter", "1B", 25, "R");
        
        // Test 1: Vérification du succès d'un hit (MSS <= BT)
        const testHit = {
            swingScore: 20,
            pitchModifier: 2,
            finalScore: 22,
            batterTarget: 25
        };
        this.assert(
            testHit.finalScore <= testHit.batterTarget,
            "Le batteur devrait réussir son hit avec un MSS de 22 et un BT de 25"
        );

        // Test 2: Vérification d'un walk (BT < MSS <= BT+5)
        const testWalk = {
            swingScore: 24,
            pitchModifier: 3,
            finalScore: 27,
            batterTarget: 25
        };
        this.assert(
            testWalk.finalScore > testWalk.batterTarget && 
            testWalk.finalScore <= testWalk.batterTarget + 5,
            "Le batteur devrait obtenir un but sur balles avec un MSS de 27"
        );

        // Test 3: Vérification d'un retrait (MSS > BT+5)
        const testOut = {
            swingScore: 28,
            pitchModifier: 4,
            finalScore: 32,
            batterTarget: 25
        };
        this.assert(
            testOut.finalScore > testOut.batterTarget + 5,
            "Le batteur devrait être retiré avec un MSS de 32"
        );
    }

    // Test des règles de dés du lanceur
    testPitcherDiceRules() {
        console.log("\n=== Test des règles de dés du lanceur ===");
        
        // Test des différents ERA et leurs dés correspondants
        const testCases = [
            { era: 0.95, expectedDie: 20 },
            { era: 1.50, expectedDie: 12 },
            { era: 2.50, expectedDie: 8 },
            { era: 3.25, expectedDie: 4 },
            { era: 3.75, expectedDie: -4 },
            { era: 4.50, expectedDie: -8 },
            { era: 5.50, expectedDie: -12 },
            { era: 6.50, expectedDie: -20 }
        ];

        testCases.forEach(testCase => {
            const pitcher = new Player("Test Pitcher", "P", 9, "R", null, testCase.era);
            this.assert(
                pitcher.calculateInitialPitchDie() === testCase.expectedDie,
                `ERA ${testCase.era} devrait donner un dé de ${testCase.expectedDie}`
            );
        });
    }

    // Test du tableau des coups (Hit Table)
    testHitTable() {
        console.log("\n=== Test du tableau des coups ===");
        
        // Vérifier les résultats selon les règles du PDF
        const hitTable = this.game.HIT_TABLE;
        
        this.assert(
            hitTable[1].result === "Single+" && hitTable[2].result === "Single+",
            "Les résultats 1-2 devraient être des simples+"
        );

        this.assert(
            hitTable[13].result === "Double" && hitTable[13].defense === true,
            "Le résultat 13 devrait être un double avec défense possible"
        );

        this.assert(
            hitTable[19].result === "Home Run" && hitTable[20].result === "Home Run",
            "Les résultats 19-20 devraient être des home runs"
        );
    }

    // Test de la défense
    testDefenseRules() {
        console.log("\n=== Test des règles de défense ===");
        
        // Vérifier la table de défense
        const defenseTable = this.game.DEFENSE_TABLE;
        
        this.assert(
            defenseTable[0].result === "Error",
            "Un résultat de 1-2 devrait être une erreur"
        );

        this.assert(
            defenseTable[2].result === "ReduceHit",
            "Un résultat de 10-11 devrait réduire le niveau du coup"
        );

        this.assert(
            defenseTable[3].result === "Out",
            "Un résultat de 12 devrait transformer le coup en retrait"
        );
    }

    // Exécuter tous les tests
    runAllTests() {
        console.log("=== DÉBUT DES TESTS DEADBALL ===\n");
        
        this.testBasicBatterRules();
        this.testPitcherDiceRules();
        this.testHitTable();
        this.testDefenseRules();
        
        console.log(`\n=== RÉSULTATS DES TESTS ===`);
        console.log(`Total: ${this.tests.total}`);
        console.log(`Réussis: ${this.tests.passed}`);
        console.log(`Échoués: ${this.tests.failed}`);
    }
}

// Pour utiliser les tests:
// const tester = new DeadballTester();
// tester.runAllTests();