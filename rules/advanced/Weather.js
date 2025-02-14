class WeatherRules {
    static WEATHER_CONDITIONS = {
        CLEAR: 'clear',
        CLOUDY: 'cloudy',
        WINDY: 'windy',
        RAIN: 'rain',
        HEAVY_RAIN: 'heavy_rain',
        HOT: 'hot',
        COLD: 'cold'
    };

    static WIND_DIRECTIONS = {
        IN: 'in',
        OUT: 'out',
        LEFT: 'left',
        RIGHT: 'right'
    };

    static generateWeather() {
        const weatherRoll = Math.floor(Math.random() * 20) + 1;
        
        if (weatherRoll <= 10) return this.WEATHER_CONDITIONS.CLEAR;
        if (weatherRoll <= 13) return this.WEATHER_CONDITIONS.CLOUDY;
        if (weatherRoll <= 16) return this.WEATHER_CONDITIONS.WINDY;
        if (weatherRoll <= 18) return this.WEATHER_CONDITIONS.RAIN;
        if (weatherRoll === 19) return this.WEATHER_CONDITIONS.HEAVY_RAIN;
        return this.WEATHER_CONDITIONS.CLEAR;
    }

    static generateWindDirection() {
        const windRoll = Math.floor(Math.random() * 4) + 1;
        
        switch(windRoll) {
            case 1: return this.WIND_DIRECTIONS.IN;
            case 2: return this.WIND_DIRECTIONS.OUT;
            case 3: return this.WIND_DIRECTIONS.LEFT;
            case 4: return this.WIND_DIRECTIONS.RIGHT;
            default: return this.WIND_DIRECTIONS.IN;
        }
    }

    static applyWeatherEffects(gameState, atBatResult) {
        let modifiedResult = { ...atBatResult };

        switch(gameState.weather) {
            case this.WEATHER_CONDITIONS.WINDY:
                modifiedResult = this.applyWindEffects(modifiedResult, gameState.windDirection);
                break;
            case this.WEATHER_CONDITIONS.RAIN:
                modifiedResult = this.applyRainEffects(modifiedResult);
                break;
            case this.WEATHER_CONDITIONS.HEAVY_RAIN:
                modifiedResult = this.applyHeavyRainEffects(modifiedResult);
                break;
            case this.WEATHER_CONDITIONS.HOT:
                modifiedResult = this.applyHotWeatherEffects(modifiedResult, gameState);
                break;
            case this.WEATHER_CONDITIONS.COLD:
                modifiedResult = this.applyColdWeatherEffects(modifiedResult);
                break;
        }

        return modifiedResult;
    }

    static applyWindEffects(result, windDirection) {
        if (result.type !== "HIT") return result;

        switch(windDirection) {
            case this.WIND_DIRECTIONS.OUT:
                // Vent qui souffle vers l'extérieur
                if (result.hitRoll >= 13 && result.hitRoll <= 17) { // Doubles
                    return { ...result, result: "Triple" };
                }
                if (result.hitRoll === 18) { // Triple
                    return { ...result, result: "Home Run" };
                }
                break;

            case this.WIND_DIRECTIONS.IN:
                // Vent qui souffle vers l'intérieur
                if (result.hitRoll === 19 || result.hitRoll === 20) { // Home Runs
                    return { ...result, result: "Triple" };
                }
                if (result.hitRoll === 18) { // Triple
                    return { ...result, result: "Double" };
                }
                break;
        }

        return result;
    }

    static applyRainEffects(result) {
        // La pluie rend la défense plus difficile
        if (result.defense) {
            return {
                ...result,
                defenseModifier: -1
            };
        }
        return result;
    }

    static applyHeavyRainEffects(result) {
        // Forte pluie : défense très difficile, moins de puissance
        if (result.defense) {
            return {
                ...result,
                defenseModifier: -2
            };
        }
        if (result.result === "Home Run") {
            return {
                ...result,
                result: "Triple"
            };
        }
        return result;
    }

    static applyHotWeatherEffects(result, gameState) {
        // Chaleur : plus de fatigue pour les lanceurs, plus de puissance
        if (gameState.inning > 5) {
            gameState.currentPitcher.pitchDieLevel = this.increasePitcherFatigue(
                gameState.currentPitcher.pitchDieLevel
            );
        }

        if (result.hitRoll >= 16 && result.hitRoll <= 17) { // Doubles
            return { ...result, result: "Triple" };
        }
        return result;
    }

    static applyColdWeatherEffects(result) {
        // Froid : moins de puissance
        if (result.result === "Home Run") {
            return { ...result, result: "Double" };
        }
        if (result.result === "Triple") {
            return { ...result, result: "Double" };
        }
        return result;
    }

    static increasePitcherFatigue(currentDieLevel) {
        const diceProgression = [20, 12, 8, 4, -4, -8, -12, -20, -25];
        const currentIndex = diceProgression.indexOf(currentDieLevel);
        
        if (currentIndex >= diceProgression.length - 1) {
            return -25;
        }
        
        return diceProgression[currentIndex + 1];
    }

    static shouldDelayGame(weather) {
        return weather === this.WEATHER_CONDITIONS.HEAVY_RAIN;
    }

    static getWeatherDescription(weather, windDirection = null) {
        let description = "Conditions météorologiques : ";
        
        switch(weather) {
            case this.WEATHER_CONDITIONS.CLEAR:
                return description + "Ciel dégagé";
            case this.WEATHER_CONDITIONS.CLOUDY:
                return description + "Nuageux";
            case this.WEATHER_CONDITIONS.WINDY:
                return description + `Venteux (vent soufflant vers ${this.getWindDirectionText(windDirection)})`;
            case this.WEATHER_CONDITIONS.RAIN:
                return description + "Pluie";
            case this.WEATHER_CONDITIONS.HEAVY_RAIN:
                return description + "Forte pluie";
            case this.WEATHER_CONDITIONS.HOT:
                return description + "Chaleur intense";
            case this.WEATHER_CONDITIONS.COLD:
                return description + "Temps froid";
            default:
                return description + "Normales";
        }
    }

    static getWindDirectionText(direction) {
        switch(direction) {
            case this.WIND_DIRECTIONS.IN: return "l'intérieur";
            case this.WIND_DIRECTIONS.OUT: return "l'extérieur";
            case this.WIND_DIRECTIONS.LEFT: return "la gauche";
            case this.WIND_DIRECTIONS.RIGHT: return "la droite";
            default: return "direction inconnue";
        }
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeatherRules };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.WeatherR
    window.WeatherRules = WeatherRules;
}
