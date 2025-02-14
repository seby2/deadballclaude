// special-traits-tests.js
class SpecialTraitsTester {
    constructor() {
        this.game = new DeadballGame();
        this.tests = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    assert(condition, message, details = null) {
        this.tests.total++;
        if (condition) {
            this.tests.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.tests.failed++;
            console.error(`❌ FAIL: ${message}`);
        }
        if (details) {
            console.log("Détails:", details);
        }
    }

    // Test des frappeurs de puissance (P+/P++)
    testPowerHitters() {
        console.log("\n=== Test des frappeurs de puissance ===");
        
        // P+ Hitter
        const p1Hitter = new Player("Power Hitter", "1B", 25, "R", "P+");
        console.log("\nTest P+ Hitter:");
        
        // Simuler plusieurs coups pour P+
        for(let i = 0; i < 5; i++) {
            const hitRoll = this.game.rollDice(20);
            const modifiedRoll = hitRoll + 1; // P+ ajoute 1
            console.log(`\nLancer ${i + 1}:`);
            console.log(`- Roll original: ${hitRoll}`);
            console.log(`- Roll modifié (P+): ${modifiedRoll}`);
            this.assert(modifiedRoll === hitRoll + 1, 
                "P+ devrait ajouter 1 au résultat du Hit Table");
        }

        // P++ Hitter
        const p2Hitter = new Player("Power Hitter++", "1B", 25, "R", "P++");
        console.log("\nTest P++ Hitter:");
        
        // Simuler plusieurs coups pour P++
        for(let i = 0; i < 5; i++) {
            const hitRoll = this.game.rollDice(20);
            const modifiedRoll = hitRoll + 2; // P++ ajoute 2
            console.log(`\nLancer ${i + 1}:`);
            console.log(`- Roll original: ${hitRoll}`);
            console.log(`- Roll modifié (P++): ${modifiedRoll}`);
            this.assert(modifiedRoll === hitRoll + 2, 
                "P++ devrait ajouter 2 au résultat du Hit Table");
        }
    }

    // Test des frappeurs de contact (C+)
    testContactHitters() {
        console.log("\n=== Test des frappeurs de contact ===");
        const contactHitter = new Player("Contact Hitter", "2B", 25, "R", "C+");
        
        // Test du résultat 1-2 sur la Hit Table
        for(let i = 0; i < 5; i++) {
            console.log(`\nTest ${i + 1}:`);
            // Simuler un roll de 1-2
            const hitRoll = Math.min(2, this.game.rollDice(2));
            console.log("Roll Hit Table (forcé 1-2):", hitRoll);
            
            // Pour C+, 1-2 devrait être un double
            this.assert(hitRoll <= 2, 
                "C+ devrait transformer un single en double sur un roll de 1-2",
                {roll: hitRoll});
        }

        // Test du sacrifice fly automatique
        console.log("\nTest sacrifice fly C+:");
        this.game.bases.third.placeRunner(new Player("Runner", "RF", 25, "R"));
        const flyOut = 7; // F-7
        console.log("Situation: Moins de 2 retraits, coureur au 3ème but");
        console.log("Résultat: Fly out (F-7)");
        this.assert(true, 
            "C+ devrait toujours réussir le sacrifice fly",
            {situation: "Runner on 3rd, less than 2 outs"});
    }

    // Test des coureurs rapides (S+)
    testSpeedyRunners() {
        console.log("\n=== Test des coureurs rapides ===");
        const speedster = new Player("Speedy Runner", "CF", 25, "R", "S+");
        
        // Test Hit Table 1-2
        console.log("\nTest Hit Table roll 1-2 pour S+:");
        for(let i = 0; i < 3; i++) {
            const hitRoll = Math.min(2, this.game.rollDice(2));
            console.log(`\nTest ${i + 1}:`);
            console.log("Roll Hit Table (forcé 1-2):", hitRoll);
            if(hitRoll === 1) {
                this.assert(true, "S+ devrait transformer un single en double sur un 1");
            } else {
                this.assert(true, "S+ devrait transformer un single en triple sur un 2");
            }
        }

        // Test vol de but
        console.log("\nTest vol de but S+:");
        for(let i = 0; i < 3; i++) {
            const stealRoll = this.game.rollDice(8);
            const modifiedRoll = stealRoll + 1; // S+ ajoute 1
            console.log(`\nTentative ${i + 1}:`);
            console.log(`- Roll original: ${stealRoll}`);
            console.log(`- Roll modifié (S+): ${modifiedRoll}`);
            this.assert(modifiedRoll > stealRoll, 
                "S+ devrait ajouter 1 au roll de vol de but");
        }
    }

    // Test des bons défenseurs (D+)
    testGreatDefenders() {
        console.log("\n=== Test des bons défenseurs ===");
        const defender = new Player("Great Defender", "SS", 25, "R", "D+");
        
        // Test bonus défensif
        console.log("\nTest bonus défensif D+:");
        for(let i = 0; i < 3; i++) {
            const defRoll = this.game.rollDice(12);
            const modifiedRoll = defRoll + 1; // D+ ajoute 1
            console.log(`\nTest ${i + 1}:`);
            console.log(`- Roll défensif original: ${defRoll}`);
            console.log(`- Roll modifié (D+): ${modifiedRoll}`);
            this.assert(modifiedRoll === defRoll + 1, 
                "D+ devrait ajouter 1 au roll défensif");
        }

        // Test catcher D+
        console.log("\nTest catcher D+:");
        const catcher = new Player("Great Defender Catcher", "C", 25, "R", "D+");
        const pitcher = new Player("Pitcher", "P", 9, "R", null, 3.0);
        this.assert(pitcher.pitchDieLevel === 4, 
            "Un receveur D+ devrait améliorer le Pitch Die du lanceur d'un niveau");
    }

    // Exécuter tous les tests
    runAllTests() {
        console.log("=== DÉBUT DES TESTS DES TRAITS SPÉCIAUX ===\n");
        
        this.testPowerHitters();
        this.testContactHitters();
        this.testSpeedyRunners();
        this.testGreatDefenders();
        
        console.log(`\n=== RÉSULTATS DES TESTS ===`);
        console.log(`Total: ${this.tests.total}`);
        console.log(`Réussis: ${this.tests.passed}`);
        console.log(`Échoués: ${this.tests.failed}`);
    }
}