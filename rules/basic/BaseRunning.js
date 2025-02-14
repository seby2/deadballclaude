class Base {
    constructor() {
        this.occupied = false;
        this.player = null;
    }

    placeRunner(player) {
        this.occupied = true;
        this.player = player;
    }

    removeRunner() {
        const player = this.player;
        this.occupied = false;
        this.player = null;
        return player;
    }

    isOccupied() {
        return this.occupied && this.player !== null;
    }
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Base;
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.Base = window.Base || Base;
}