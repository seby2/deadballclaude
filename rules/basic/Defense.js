class DefenseRules {
    static DEFENSE_TABLE = [
        { min: 1, max: 2, result: "Error", extraBases: 1 },
        { min: 3, max: 9, result: "NoChange", extraBases: 0 },
        { min: 10, max: 11, result: "ReduceHit", extraBases: 0 },
        { min: 12, max: 12, result: "Out", extraBases: 0 }
    ];

    static processDefenseRoll(defRoll, hitDetails) {
        const defResult = this.DEFENSE_TABLE.find(
            def => defRoll >= def.min && defRoll <= def.max
        );

        switch(defResult.result) {
            case "Error":
                return this.processError(hitDetails, defResult);
            case "ReduceHit":
                return this.reduceHit(hitDetails);
            case "Out":
                return this.convertToOut(hitDetails);
            default:
                return hitDetails;
        }
    }

    static processError(hitDetails, defResult) {
        return { 
            ...hitDetails, 
            result: hitDetails.result, 
            extraBases: defResult.extraBases,
            error: true
        };
    }

    static reduceHit(hitDetails) {
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
    }

    static convertToOut(hitDetails) {
        return { 
            type: "OUT", 
            result: "Defensive Out",
            fielder: hitDetails.fielder 
        };
    }

    static checkDoublePlay(finalScore, outLocation) {
        // Double jeu possible sur balle au sol avec moins de 2 retraits
        const isGroundBall = outLocation >= 3 && outLocation <= 6; // 3=1B, 4=2B, 5=3B, 6=SS
        return isGroundBall && finalScore >= 70;
    }

    static checkSacrificeFly(finalScore, outLocation) {
        // Ballon sacrifice possible sur balle en vol avec moins de 2 retraits
        const isFlyBall = outLocation >= 7 && outLocation <= 9; // 7=LF, 8=CF, 9=RF
        return isFlyBall && finalScore < 70;
    }

    static getFielderForPosition(position) {
        const fielderMap = {
            1: "Pitcher",
            2: "Catcher",
            3: "First Baseman",
            4: "Second Baseman",
            5: "Third Baseman",
            6: "Shortstop",
            7: "Left Fielder",
            8: "Center Fielder",
            9: "Right Fielder"
        };
        return fielderMap[position] || "Unknown Fielder";
    }

    static processDefensiveAlignment(hitResult, defensiveAlignment) {
        switch(defensiveAlignment) {
            case 'infield-in':
                return this.processInfieldIn(hitResult);
            case 'no-doubles':
                return this.processNoDoubles(hitResult);
            case 'shift':
                return this.processShift(hitResult);
            default:
                return hitResult;
        }
    }

    static processInfieldIn(hitResult) {
        // Règles pour l'alignement "infield-in"
        if (hitResult.result === "Single" && hitResult.fielder) {
            // Plus de chances d'attraper le coureur au marbre
            return {
                ...hitResult,
                playAtPlate: true
            };
        }
        return hitResult;
    }

    static processNoDoubles(hitResult) {
        // Règles pour l'alignement "no-doubles"
        if (hitResult.result === "Double") {
            return {
                ...hitResult,
                result: "Single",
                runners: 2
            };
        }
        return hitResult;
    }

    static processShift(hitResult) {
        // Règles pour l'alignement "shift"
        if (hitResult.result === "Single" && hitResult.fielder === "2B") {
            return {
                ...hitResult,
                shiftBonus: true
            };
        }
        return hitResult;
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DefenseRules };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.DefenseRules = DefenseRules;
}
