// Imports
if (typeof require !== 'undefined') {
    const { Player } = require('../../game/Player.js');
}

class AtBatRules {
    static HIT_TABLE = {
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

    static calculateResult(swingScore, batter, pitchModifier = 0) {
        const finalScore = swingScore + pitchModifier;
        
        if (finalScore <= 5) {
            return {
                type: "CRITICAL HIT",
                finalScore,
                batterTarget: batter.bt
            };
        } 
        else if (finalScore <= batter.bt) {
            return {
                type: "HIT",
                finalScore,
                batterTarget: batter.bt
            };
        }
        else if (finalScore <= batter.bt + 5) {
            return {
                type: "WALK",
                finalScore,
                batterTarget: batter.bt
            };
        }
        else {
            return {
                type: "OUT",
                finalScore,
                batterTarget: batter.bt
            };
        }
    }

    static getHitResult(hitRoll, isCritical = false) {
        let hitDetails = this.HIT_TABLE[hitRoll];
        
        if (!hitDetails) {
            console.error(`No hit details found for roll: ${hitRoll}`);
            return { result: isCritical ? "Double" : "Single", defense: false };
        }

        if (isCritical) {
            hitDetails = this.upgradeCriticalHit(hitDetails);
        }

        return hitDetails;
    }

    static upgradeCriticalHit(hitDetails) {
        const upgradeMap = {
            "Single": "Double",
            "Double": "Triple",
            "Triple": "Home Run",
            "Home Run": "Home Run"
        };

        return {
            ...hitDetails,
            result: upgradeMap[hitDetails.result] || hitDetails.result
        };
    }

    static generateOutDetails(finalScore) {
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
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AtBatRules };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.AtBatRules = AtBatRules;
}
