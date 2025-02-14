class TraitRules {
    // Types de traits
    static POSITIVE_TRAITS = ['P+', 'P++', 'C+', 'S+', 'D+', 'K+', 'GB+', 'CN+', 'ST+'];
    static NEGATIVE_TRAITS = ['P-', 'P--', 'C-', 'S-', 'D-'];

    static applyBattingTraits(hitResult, player, hitRoll) {
        let modifiedResult = { ...hitResult };

        if (!player.trait) return modifiedResult;

        // Power Hitters (P+/P++)
        if (player.trait.includes('P+')) {
            modifiedResult = this.applyPowerTrait(modifiedResult, hitRoll, 1);
        }
        if (player.trait.includes('P++')) {
            modifiedResult = this.applyPowerTrait(modifiedResult, hitRoll, 2);
        }

        // Contact Hitters (C+)
        if (player.trait.includes('C+')) {
            modifiedResult = this.applyContactTrait(modifiedResult, hitRoll);
        }

        // Speed Demons (S+)
        if (player.trait.includes('S+')) {
            modifiedResult = this.applySpeedTrait(modifiedResult, hitRoll);
        }

        // Weak Hitters (P-)
        if (player.trait.includes('P-')) {
            modifiedResult = this.applyWeakHitterTrait(modifiedResult, hitRoll);
        }

        return modifiedResult;
    }

    static applyPowerTrait(result, hitRoll, bonus) {
        // Ajoute le bonus au roll de hit
        const newHitRoll = Math.min(20, hitRoll + bonus);
        return {
            ...result,
            hitRoll: newHitRoll
        };
    }

    static applyContactTrait(result, hitRoll) {
        // Sur un roll de 1-2, transforme en double automatique
        if (hitRoll <= 2) {
            return {
                ...result,
                result: "Double",
                defense: false,
                runnersAdvance: 2
            };
        }
        return result;
    }

    static applySpeedTrait(result, hitRoll) {
        // Sur un roll de 1, transforme en double
        // Sur un roll de 2, transforme en triple
        if (hitRoll === 1) {
            return {
                ...result,
                result: "Double",
                defense: false,
                runnersAdvance: 2
            };
        }
        if (hitRoll === 2) {
            return {
                ...result,
                result: "Triple",
                defense: false,
                runnersAdvance: 3
            };
        }
        return result;
    }

    static applyWeakHitterTrait(result, hitRoll) {
        // Réduit la puissance des coups
        if (result.result === "Home Run") {
            return {
                ...result,
                result: "Triple"
            };
        }
        if (result.result === "Triple") {
            return {
                ...result,
                result: "Double"
            };
        }
        return result;
    }

    static applyPitchingTraits(pitcher, result) {
        if (!pitcher.trait) return result;

        // Strikeout Artist (K+)
        if (pitcher.trait.includes('K+')) {
            return this.applyStrikeoutArtistTrait(result);
        }

        // Groundball Pitcher (GB+)
        if (pitcher.trait.includes('GB+')) {
            return this.applyGroundballTrait(result);
        }

        // Control Pitcher (CN+)
        if (pitcher.trait.includes('CN+')) {
            return this.applyControlTrait(result);
        }

        return result;
    }

    static applyStrikeoutArtistTrait(result) {
        // Augmente les chances de strikeout
        if (result.type === "OUT" && result.details === "Groundout to first (G-3)") {
            return {
                ...result,
                details: "Strikeout (K)"
            };
        }
        return result;
    }

    static applyGroundballTrait(result) {
        // Augmente les chances de groundout
        if (result.type === "OUT" && result.details === "Strikeout (K)") {
            return {
                ...result,
                details: "Groundout to short (6-3)"
            };
        }
        return result;
    }

    static applyControlTrait(result) {
        // Réduit la zone de but sur balles
        if (result.type === "WALK" && result.finalScore > result.batterTarget + 2) {
            return {
                ...result,
                type: "OUT",
                details: "Groundout to second (4-3)"
            };
        }
        return result;
    }

    static applySpeedTraitToBaserunning(runner, baseStealRoll) {
        if (!runner.trait) return baseStealRoll;

        if (runner.trait.includes('S+')) {
            return baseStealRoll + 1;
        }
        if (runner.trait.includes('S-')) {
            return baseStealRoll - 3;
        }
        return baseStealRoll;
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TraitRules };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.TraitRules = TraitRules;
}
