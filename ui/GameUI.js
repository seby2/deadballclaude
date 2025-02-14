// game-ui.js

class DeadballGameUI {

    
    constructor(config) {
        try {
            console.log('GameUI constructor config:', config);

            if (!config) {
                throw new Error('No configuration provided');
            }

            if (!config.homeTeam) throw new Error('No home team configuration');
            if (!config.awayTeam) throw new Error('No away team configuration');

            // Création du jeu
            this.game = new DeadballGame();

            // Création des équipes une seule fois
            this.loadTeams(config);

        } catch (error) {
            console.log('Error in GameUI constructor:', error);
            throw error;
        }
    }
    
    loadTeams(config) {
        console.log('Loading teams with config:', config);
    
        // Pour l'équipe visiteuse
        console.log('Setting up away team...');
        try {
            if (config.awayTeam.lineup && config.awayTeam.lineup.length > 0) {
                const sortedLineup = [...config.awayTeam.lineup]
                    .sort((a, b) => a.orderPosition - b.orderPosition);
                
                    sortedLineup.forEach(lineupEntry => {
                        const player = config.awayTeam.roster.find(p => p.id === lineupEntry.playerId);
                        if (player) {
                            const newPlayer = new Player(
                                player.name,
                                player.position,
                                parseInt(player.bt),
                                player.hand,
                                player.traits,
                                player.era,
                                player.id
                            );
                            this.awayTeam.addPlayer(newPlayer, lineupEntry.orderPosition);
                        }
                    });
            }
        } catch (error) {
            console.error('Error setting up away team:', error);
            throw error;
        }
    
        // Pour l'équipe locale
        console.log('Setting up home team...');
        try {
            if (config.homeTeam.lineup && config.homeTeam.lineup.length > 0) {
                const sortedLineup = [...config.homeTeam.lineup]
                    .sort((a, b) => a.orderPosition - b.orderPosition);
                
                sortedLineup.forEach(lineupEntry => {
                    const player = config.homeTeam.roster.find(p => p.id === lineupEntry.playerId);
                    if (player) {
                        const newPlayer = new Player(
                            player.name,
                            player.position,
                            parseInt(player.bt),
                            player.hand,
                            player.traits,
                            player.era,
                            player.id
                        );
                        this.homeTeam.addPlayer(newPlayer);
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up home team:', error);
            throw error;
        }
    
        // Validation finale
        if (this.awayTeam.players.length !== 9 || this.homeTeam.players.length !== 9) {
            throw new Error('Teams must have exactly 9 players');
        }
    }
    

    // Nouvelle méthode pour initialiser les stats d'un joueur
    initializePlayerStats(player, teamType) {
        const initialStats = {
            playerId: player.id || player.name, // Fallback sur le nom si pas d'ID
            name: player.name,
            atBats: 0,
            hits: 0,
            walks: 0,
            strikeouts: 0,
            runs: 0,
            rbi: 0,
            inningsPitched: 0,
            earnedRuns: 0
        };

        this.gameHistory.stats[teamType].set(player.id || player.name, initialStats);
    }
    

    initializeTeams(gameData) {
        try {
            if (gameData && 
                gameData.homeTeam?.info?.name && 
                gameData.awayTeam?.info?.name &&
                gameData.homeTeam?.roster &&
                gameData.awayTeam?.roster) {
                
                // Créer les équipes avec les données fournies
                this.homeTeam = new Team(gameData.homeTeam.info.name);
                this.awayTeam = new Team(gameData.awayTeam.info.name);
                
                // Charger les rosters
                this.loadTeamRoster(this.homeTeam, gameData.homeTeam.roster);
                this.loadTeamRoster(this.awayTeam, gameData.awayTeam.roster);
                
                console.log('Teams created with provided data:', {
                    home: this.homeTeam,
                    away: this.awayTeam
                });
            } else {
                // Utiliser les équipes par défaut
                console.log('Using default teams');
                this.homeTeam = new Team("Flycatchers");
                this.awayTeam = new Team("Peacocks");
                this.setupTeams(); // Garder votre méthode existante
            }
            
            // Définir l'équipe courante
            this.currentTeam = this.awayTeam;
            
        } catch (error) {
            console.error('Error initializing teams:', error);
            // Créer des équipes par défaut en cas d'erreur
            this.homeTeam = new Team("Flycatchers");
            this.awayTeam = new Team("Peacocks");
            this.setupTeams();
            this.currentTeam = this.awayTeam;
        }
    }

    setupEventListeners() {
        window.addEventListener('outAdded', (e) => {
            setTimeout(() => {
                if (e.detail.isEndInning) {
                    this.GameLogger.logOutCount(3);
                } else {
                    this.GameLogger.logOutCount(e.detail.outs);
                }
            }, 10);
        });
    }

    loadTeamRoster(team, roster) {
        console.log('Loading roster for team:', team.name, roster);
        
        const activePlayers = roster.filter(p => p.active === 'true');
        console.log('Active players found:', activePlayers.length);
    
        activePlayers.forEach(player => {
            try {
                // Créer le joueur avec tous les paramètres, y compris l'ID
                const newPlayer = new Player(
                    player.name,
                    player.position,
                    parseInt(player.bt),
                    player.hand,
                    player.traits || null,
                    player.era || null,
                    player.id  // Ajouter l'ID comme dernier paramètre
                );
                team.addPlayer(newPlayer);
                console.log('Added player with ID:', newPlayer.id);
            } catch (error) {
                console.error('Error adding player:', player, error);
            }
        });
    
        console.log('Team roster loaded:', team);
    }
    


    // Dans setupTeams, ajouter l'initialisation des stats :
    // Dans GameUI.js
    setupTeams(config) {
        console.log('Setting up teams with config:', config);
    
        // Validation initiale des données
        if (!config?.homeTeam?.name || !config?.awayTeam?.name) {
            throw new Error('Missing team info in config');
        }
    
        // Création des équipes
        this.homeTeam = new Team(config.homeTeam.name);
        this.awayTeam = new Team(config.awayTeam.name);
    
        // Setup Away Team
        try {
            if (!config.awayTeam.lineup || !Array.isArray(config.awayTeam.lineup)) {
                throw new Error('Invalid away team lineup');
            }
    
            const sortedAwayLineup = [...config.awayTeam.lineup]
                .sort((a, b) => a.orderPosition - b.orderPosition);
    
            for (const lineupEntry of sortedAwayLineup) {
                // Vérification explicite de l'ID
                if (!lineupEntry.playerId) {
                    console.error('Invalid lineup entry:', lineupEntry);
                    throw new Error('Missing player ID in lineup');
                }
    
                const player = config.awayTeam.roster.find(p => p.id === lineupEntry.playerId);
                if (!player) {
                    throw new Error(`Player ${lineupEntry.playerId} not found in away team roster`);
                }
    
                const newPlayer = new Player(
                    player.name,
                    player.position,
                    parseInt(player.bt),
                    player.hand,
                    player.traits || null,
                    player.era || null,
                    player.id // Ajouter explicitement l'ID ici
                );
                this.awayTeam.addPlayer(newPlayer);
            }
    
            // Même validation pour l'équipe à domicile
            if (!config.homeTeam.lineup || !Array.isArray(config.homeTeam.lineup)) {
                throw new Error('Invalid home team lineup');
            }
    
            const sortedHomeLineup = [...config.homeTeam.lineup]
                .sort((a, b) => a.orderPosition - b.orderPosition);
    
            for (const lineupEntry of sortedHomeLineup) {
                if (!lineupEntry.playerId) {
                    console.error('Invalid lineup entry:', lineupEntry);
                    throw new Error('Missing player ID in lineup');
                }
    
                const player = config.homeTeam.roster.find(p => p.id === lineupEntry.playerId);
                if (!player) {
                    throw new Error(`Player ${lineupEntry.playerId} not found in home team roster`);
                }
    
                const newPlayer = new Player(
                    player.name,
                    player.position,
                    parseInt(player.bt),
                    player.hand,
                    player.traits || null,
                    player.era || null,
                    player.id // Ajouter explicitement l'ID ici
                );
                this.homeTeam.addPlayer(newPlayer);
            }
    
            // Vérification finale
            if (this.awayTeam.players.length !== 9 || this.homeTeam.players.length !== 9) {
                throw new Error(`Invalid team setup: Away team has ${this.awayTeam.players.length} players, Home team has ${this.homeTeam.players.length} players`);
            }
    
        } catch (error) {
            console.error('Error in setupTeams:', error);
            throw error;
        }
    }
    
    
    

    
    
    

updateLineups() {
    // Log détaillé de l'état des équipes avant la mise à jour
    console.log('=== LINEUP UPDATE START ===');
    console.log('Current game state:', {
        inning: this.game.inning,
        isTopInning: this.game.isTopInning,
        outs: this.game.outs
    });
    
    console.log('Away Team State:', {
        name: this.awayTeam.name,
        currentBatter: this.awayTeam.currentBatter,
        playerCount: this.awayTeam.players.length,
        firstPlayer: this.awayTeam.players[0]?.name,
        currentBatterName: this.awayTeam.players[this.awayTeam.currentBatter]?.name
    });
    
    console.log('Home Team State:', {
        name: this.homeTeam.name,
        currentBatter: this.homeTeam.currentBatter,
        playerCount: this.homeTeam.players.length,
        firstPlayer: this.homeTeam.players[0]?.name,
        currentBatterName: this.homeTeam.players[this.homeTeam.currentBatter]?.name
    });
    console.log('Updating lineups with teams:', {
        awayTeam: this.awayTeam,
        homeTeam: this.homeTeam
    });

    const awayLineup = document.getElementById('away-lineup');
    const homeLineup = document.getElementById('home-lineup');
    
    // Mise à jour de l'équipe visiteuse
    if (awayLineup && this.awayTeam?.players?.length > 0) {
        awayLineup.innerHTML = `
            <h3>${this.awayTeam.name}</h3>
            ${this.awayTeam.players.map((player, index) => `
                <div class="player-entry ${this.game.isTopInning && index === this.awayTeam.currentBatter ? 'current-batter' : ''}">
                    ${index + 1}. ${player.position} - ${player.name}
                    <div class="player-stats">
                        BT: ${player.bt} | ${player.hand}
                        ${player.traits ? ` | ${player.traits}` : ''}
                        ${player.era ? ` | ERA: ${player.era}` : ''}
                    </div>
                </div>
            `).join('')}
        `;
    } else if (awayLineup) {
        awayLineup.innerHTML = `<h3>${this.awayTeam.name}</h3><div>No lineup available</div>`;
    }

    // Mise à jour de l'équipe locale
    if (homeLineup && this.homeTeam?.players?.length > 0) {
        homeLineup.innerHTML = `
            <h3>${this.homeTeam.name}</h3>
            ${this.homeTeam.players.map((player, index) => `
                <div class="player-entry ${!this.game.isTopInning && index === this.homeTeam.currentBatter ? 'current-batter' : ''}">
                    ${index + 1}. ${player.position} - ${player.name}
                    <div class="player-stats">
                        BT: ${player.bt} | ${player.hand}
                        ${player.traits ? ` | ${player.traits}` : ''}
                        ${player.era ? ` | ERA: ${player.era}` : ''}
                    </div>
                </div>
            `).join('')}
        `;
    } else if (homeLineup) {
        homeLineup.innerHTML = `<h3>${this.homeTeam.name}</h3><div>No lineup available</div>`;
    }

    // Ajouter du CSS pour le style
    const style = document.createElement('style');
    style.textContent = `
        .player-entry {
            padding: 5px;
            margin: 2px 0;
            border-bottom: 1px solid #eee;
        }
        .current-batter {
            background-color: #ffeb3b33;
            border-left: 3px solid #c41e3a;
        }
        .player-stats {
            font-size: 0.9em;
            color: #666;
            margin-left: 20px;
        }
    `;
    document.head.appendChild(style);

    console.log('=== LINEUP UPDATE END ===');
    console.log('Current batter highlighting:', {
        awayTeamCurrentBatter: document.querySelector('#away-lineup .current-batter')?.textContent,
        homeTeamCurrentBatter: document.querySelector('#home-lineup .current-batter')?.textContent
    });

    // Debug
    console.log('Away Team Players:', this.awayTeam?.players);
    console.log('Home Team Players:', this.homeTeam?.players);
}

    

    updateGameState() {
        // Vérifier que les équipes existent et ont des noms
        const awayTeamName = this.awayTeam?.name || 'Away Team';
        const homeTeamName = this.homeTeam?.name || 'Home Team';
    
        document.getElementById('inning-display').textContent = 
            `Inning: ${this.game.isTopInning ? 'Top' : 'Bottom'} ${this.game.inning}`;
        
        document.getElementById('score-display').textContent = 
            `Score: ${awayTeamName} ${this.game.score.away} - ${homeTeamName} ${this.game.score.home}`;
        
        document.getElementById('outs-display').textContent = 
            `Outs: ${this.game.outs}`;
    
        // Reste du code...
    
        // Mettre à jour le match en cours
        const battingTeam = this.game.isTopInning ? this.awayTeam : this.homeTeam;
        const pitchingTeam = this.game.isTopInning ? this.homeTeam : this.awayTeam;
        
        // Vérifier que les équipes ont des joueurs
        const batter = battingTeam?.players[battingTeam?.currentBatter];
        const pitcher = pitchingTeam?.players[8];
    
        if (batter && pitcher) {
            document.getElementById('current-matchup').textContent = 
                `At Bat: ${batter.name} (${batter.position}) vs ${pitcher.name} (P)`;
    
            // Mise à jour des détails Current At Bat
            const gameState = this.game.getGameState();
            document.getElementById('batter-name').textContent = batter.name;
            document.getElementById('pitcher-name').textContent = pitcher.name;
            document.getElementById('swing-score').textContent = gameState.lastAction?.swingScore || '-';
            document.getElementById('pitch-modifier').textContent = gameState.lastAction?.pitchModifier || '-';
            document.getElementById('final-score').textContent = gameState.lastAction?.finalScore || '-';
            document.getElementById('batter-target').textContent = batter.bt || '-';
        } else {
            // Afficher un message par défaut si les joueurs ne sont pas encore chargés
            document.getElementById('current-matchup').textContent = 'Loading players...';
            document.getElementById('batter-name').textContent = '-';
            document.getElementById('pitcher-name').textContent = '-';
            document.getElementById('swing-score').textContent = '-';
            document.getElementById('pitch-modifier').textContent = '-';
            document.getElementById('final-score').textContent = '-';
            document.getElementById('batter-target').textContent = '-';
        }
    }
    // Ajoutez cette méthode dans la classe DeadballGameUI
    updateScoreboard() {
        const awayRow = document.getElementById('away-team-scoreboard');
        const homeRow = document.getElementById('home-team-scoreboard');
    
        // Mettre à jour les points par manche
        for (let i = 1; i <= 9; i++) {
            const awayInningScore = this.game.getInningScore(true, i);
            const homeInningScore = this.game.getInningScore(false, i);
    
            awayRow.children[i].textContent = awayInningScore > 0 ? awayInningScore : '0';
            homeRow.children[i].textContent = homeInningScore > 0 ? homeInningScore : '0';
        }
    
        // Mettre à jour les totaux
        document.getElementById('away-team-runs').textContent = this.game.score.away;
        document.getElementById('home-team-runs').textContent = this.game.score.home;
        document.getElementById('home-team-name').textContent = this.homeTeam.name;
        document.getElementById('away-team-name').textContent = this.awayTeam.name;
    }




    log(message) {
        const gameLog = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.textContent = message;
        gameLog.appendChild(entry);
        gameLog.scrollTop = gameLog.scrollHeight;
    }

    // Dans GameUI.js
    processAtBat() {
        if (this.game.gameOver) {
            console.log("Le jeu est déjà terminé!");
            return { type: "ERROR", details: "La partie est terminée" };
        }
    
        const battingTeam = this.game.isTopInning ? this.awayTeam : this.homeTeam;
        const pitchingTeam = this.game.isTopInning ? this.homeTeam : this.awayTeam;
        
        const batter = battingTeam.players[battingTeam.currentBatter];
        const pitcher = pitchingTeam.players[8];
    
        console.log("ProcessAtBat - batter:", batter);
        console.log("ProcessAtBat - pitcher:", pitcher);
    
        if (!batter || !pitcher) {
            console.error('Batteur ou lanceur manquant:', { batter, pitcher });
            return null;
        }
    
        // S'assurer que le batteur est passé correctement au jeu
        const result = this.game.processAtBat({...pitcher}, {...batter});
        
        // Log du résultat avec le GameLogger
        if (result) {
            this.logger.logAtBat(batter, pitcher, result);
    
            // Si c'est la fin d'une manche
            if (this.game.outs >= 3) {
                this.logger.logInningEnd(this.game.score);
            }
            // Si c'est la fin du jeu
            if (this.game.gameOver) {
                this.logger.logGameEnd(this.game.score);
            }
        }
    
        return result;
    }
    
    
    // Ajouter cette méthode d'aide
    formatPlayDescription(result) {
        switch(result.type) {
            case 'HIT':
                return `${result.details.result}${result.details.defense ? ' (DEF)' : ''}`;
            case 'WALK':
                return 'Base on balls';
            case 'OUT':
                return result.details;
            case 'CRITICAL HIT':
                return `CRITICAL HIT - ${result.details.result}`;
            default:
                return 'Unknown play';
        }
    }
        

    

    // Nouvelle méthode pour mettre à jour les stats
    updatePlayerStats(batter, pitcher, result) {
        // Vérifier que les joueurs ont un ID ou utiliser leur nom
        const batterId = batter.id || batter.name;
        const pitcherId = pitcher.id || pitcher.name;
        
        // Déterminer l'équipe
        const batterTeam = this.game.isTopInning ? 'away' : 'home';
        const pitcherTeam = this.game.isTopInning ? 'home' : 'away';
        
        // S'assurer que les stats existent, sinon les initialiser
        if (!this.gameHistory.stats[batterTeam].has(batterId)) {
            this.initializePlayerStats(batter, batterTeam);
        }
        if (!this.gameHistory.stats[pitcherTeam].has(pitcherId)) {
            this.initializePlayerStats(pitcher, pitcherTeam);
        }
    
        // Récupérer les stats
        const batterStats = this.gameHistory.stats[batterTeam].get(batterId);
        const pitcherStats = this.gameHistory.stats[pitcherTeam].get(pitcherId);
    
        // Mise à jour des stats du batteur
        if (batterStats) {
            switch(result.type) {
                case "HIT":
                case "CRITICAL HIT":
                    batterStats.atBats++;
                    batterStats.hits++;
                    break;
                case "WALK":
                    batterStats.walks++;
                    break;
                case "OUT":
                    batterStats.atBats++;
                    if (result.details.includes("Strikeout")) {
                        batterStats.strikeouts++;
                    }
                    break;
            }
        }
    
        // Mise à jour des stats du lanceur
        if (pitcherStats) {
            if (result.type === "OUT" && result.details.includes("Strikeout")) {
                pitcherStats.strikeouts++;
            }
        }
    
        // Debug log
        console.log('Stats updated:', {
            batter: batterStats,
            pitcher: pitcherStats
        });
    }
    


    // Nouvelle méthode pour obtenir les stats courantes
    getCurrentStats() {
        return {
            home: Array.from(this.gameHistory.stats.home.values()),
            away: Array.from(this.gameHistory.stats.away.values())
        };
    }

    // Nouvelle méthode pour obtenir l'historique des plays
    getGameHistory() {
        return this.gameHistory;
    }

    updateDisplay() {
        // Mise à jour du tableau de score
        const awayRow = document.getElementById('away-team-scoreboard');
        const homeRow = document.getElementById('home-team-scoreboard');
        if (awayRow && homeRow) {
            // Mettre à jour le nom des équipes
            document.getElementById('away-team-name').textContent = this.awayTeam.name;
            document.getElementById('home-team-name').textContent = this.homeTeam.name;
    
            // Mettre à jour les scores par manche
            for (let i = 1; i <= 9; i++) {
                const awayScore = this.game.inningScores.away[i-1] || '';
                const homeScore = this.game.inningScores.home[i-1] || '';
                
                awayRow.children[i].textContent = awayScore;
                homeRow.children[i].textContent = homeScore;
            }
    
            // Mettre à jour les totaux
            document.getElementById('away-team-runs').textContent = this.game.score.away;
            document.getElementById('home-team-runs').textContent = this.game.score.home;
        }
    
        // Mise à jour de l'état du jeu
        const gameState = this.game.getGameState();
        
        // Afficher la manche et le score
        document.getElementById('inning-display').textContent = 
            `Inning: ${gameState.isTopInning ? 'Top' : 'Bottom'} ${gameState.inning}`;
        
        document.getElementById('score-display').textContent = 
            `Score: ${this.awayTeam.name} ${gameState.score.away} - ${this.homeTeam.name} ${gameState.score.home}`;
        
        document.getElementById('outs-display').textContent = 
            `Outs: ${gameState.outs}`;
    
        // Mise à jour des coureurs sur les bases
        const baseballField = new BaseballField('baseball-field');
        baseballField.updateRunners(gameState);
    
        // Mise à jour des alignements
        this.updateLineups();
    
        // Mise à jour du match en cours
        const battingTeam = gameState.isTopInning ? this.awayTeam : this.homeTeam;
        const pitchingTeam = gameState.isTopInning ? this.homeTeam : this.awayTeam;
        
        const batter = battingTeam.players[battingTeam.currentBatter];
        const pitcher = pitchingTeam.players[8];
    
        if (batter && pitcher) {
            document.getElementById('current-matchup').textContent = 
                `At Bat: ${batter.name} (${batter.position}) vs ${pitcher.name} (P)`;
    
            // Mise à jour des détails de l'at-bat
            if (gameState.lastAction) {
                document.getElementById('batter-name').textContent = batter.name;
                document.getElementById('pitcher-name').textContent = pitcher.name;
                document.getElementById('swing-score').textContent = gameState.lastAction.swingScore || '-';
                document.getElementById('pitch-modifier').textContent = gameState.lastAction.pitchModifier || '-';
                document.getElementById('final-score').textContent = gameState.lastAction.finalScore || '-';
                document.getElementById('batter-target').textContent = batter.bt || '-';
            }
        }
    }
    

    // Méthode utilitaire pour convertir les détails
    getDetailsString(result) {
        if (typeof result.details === 'object') {
            return result.details.result || JSON.stringify(result.details);
        } else if (typeof result.details === 'string') {
            return result.details;
        }
        return 'Unknown play';
    }

    updateDiceResults(gameState) {
        const elementIds = [
            'swing-score', 
            'pitch-modifier', 
            'final-score', 
            'batter-target', 
            'batter-name', 
            'pitcher-name'
        ];
    
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.error(`Element with ID '${id}' not found`);
            }
        });
    
        if (gameState.diceRolls) {
            const updateElementIfExists = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || '-';
                }
            };
    
            updateElementIfExists('swing-score', gameState.diceRolls.swingScore);
            updateElementIfExists('pitch-modifier', gameState.diceRolls.pitchModifier);
            updateElementIfExists('final-score', gameState.diceRolls.finalScore);
            updateElementIfExists('batter-target', gameState.diceRolls.batterTarget);
            updateElementIfExists('batter-name', gameState.diceRolls.batterName);
            updateElementIfExists('pitcher-name', gameState.diceRolls.pitcherName);
        }
    }

    // Modifiez updateDisplay pour inclure updateScoreboard
updateDisplay() {
    this.updateGameState();
    this.updateLineups();
    this.updateScoreboard(); // Ajoutez cette ligne
    const baseballField = new BaseballField('baseball-field');
    baseballField.updateRunners(this.game.getGameState());
}

updateGameState() {
    try {
        // Vérifications de sécurité pour les noms d'équipe
        const awayTeamName = this.awayTeam?.name || 'Away';
        const homeTeamName = this.homeTeam?.name || 'Home';

        // Mettre à jour les informations de base du jeu
        const inningDisplay = document.getElementById('inning-display');
        if (inningDisplay) {
            inningDisplay.textContent = `Inning: ${this.game.isTopInning ? 'Top' : 'Bottom'} ${this.game.inning}`;
        }

        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${awayTeamName} ${this.game.score.away} - ${homeTeamName} ${this.game.score.home}`;
        }

        const outsDisplay = document.getElementById('outs-display');
        if (outsDisplay) {
            outsDisplay.textContent = `Outs: ${this.game.outs}`;
        }

        // Nettoyer les bases
        const baseElements = ['first-base', 'second-base', 'third-base'].map(id => 
            document.querySelector(`.player-name.${id}`)
        );
        
        baseElements.forEach(element => {
            if (element) element.textContent = '';
        });

        // Mise à jour des coureurs sur les bases
        const bases = [
            { baseId: 'first-base', playerNameClass: 'first-base', baseKey: 'first' },
            { baseId: 'second-base', playerNameClass: 'second-base', baseKey: 'second' },
            { baseId: 'third-base', playerNameClass: 'third-base', baseKey: 'third' }
        ];

        bases.forEach(base => {
            const baseElement = document.getElementById(base.baseId);
            const baseNameElement = document.querySelector(`.player-name.${base.playerNameClass}`);

            if (baseElement && baseNameElement) {
                const baseOccupied = this.game.bases[base.baseKey]?.isOccupied();
                if (baseOccupied) {
                    const player = this.game.bases[base.baseKey].player;
                    baseNameElement.textContent = player?.name || '';
                }
            }
        });

        // Mise à jour du match en cours
        const battingTeam = this.game.isTopInning ? this.awayTeam : this.homeTeam;
        const pitchingTeam = this.game.isTopInning ? this.homeTeam : this.awayTeam;

        const batter = battingTeam?.players?.[battingTeam?.currentBatter];
        const pitcher = pitchingTeam?.players?.find(p => p.position === 'P');

        const currentMatchup = document.getElementById('current-matchup');
        if (currentMatchup) {
            if (batter && pitcher) {
                currentMatchup.textContent = `At Bat: ${batter.name} (${batter.position}) vs ${pitcher.name} (P)`;
            } else {
                currentMatchup.textContent = 'Waiting for players...';
            }
        }

        // Mise à jour des détails de l'at-bat
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '-';
            }
        };

        updateElement('batter-name', batter?.name);
        updateElement('pitcher-name', pitcher?.name);

        const gameState = this.game.getGameState();
        updateElement('swing-score', gameState?.lastAction?.swingScore);
        updateElement('pitch-modifier', gameState?.lastAction?.pitchModifier);
        updateElement('final-score', gameState?.lastAction?.finalScore);
        updateElement('batter-target', batter?.bt);

    } catch (error) {
        console.error('Error in updateGameState:', error);
    }
}


playNextAtBat() {
    if (this.game.gameOver) {
        console.log("Le jeu est déjà terminé!");
        return;
    }

    const battingTeam = this.game.isTopInning ? this.awayTeam : this.homeTeam;
    const pitchingTeam = this.game.isTopInning ? this.homeTeam : this.awayTeam;
    
    // D'abord obtenir le batteur actuel
    const batter = battingTeam?.getNextBatter();
    if (!batter) {
        console.error('No batter available');
        return;
    }

    const pitcher = pitchingTeam?.players?.find(p => p.position === 'P');
    if (!pitcher) {
        console.error('No pitcher available');
        return;
    }

    console.log(`At bat: ${batter.name} (${batter.position}) vs ${pitcher.name} (P)`);

    const result = this.game.processAtBat(pitcher, batter);
    
    if (result) {
        this.logger.logAtBat(batter, pitcher, result);
        
        // APRÈS le jeu, on avance au prochain batteur
        battingTeam.advanceBatter();
        
        const gameState = this.game.getGameState();
        this.updateDiceResults(gameState);
        this.displayDice(gameState);
        this.updateDisplay();
    }
}



updateLineups() {
    console.log('Updating lineups...');
    
    // Log des états des équipes
    console.log('Away team state:', this.awayTeam.getTeamState());
    console.log('Home team state:', this.homeTeam.getTeamState());

    const awayLineup = document.getElementById('away-lineup');
    const homeLineup = document.getElementById('home-lineup');

    if (awayLineup && this.awayTeam?.players?.length > 0) {
        awayLineup.innerHTML = `
            <h3>${this.awayTeam.name}</h3>
            ${this.awayTeam.players.map((player, index) => `
                <div class="player-entry ${this.game.isTopInning && index === this.awayTeam.currentBatter ? 'current-batter' : ''}">
                    ${index + 1}. ${player.position} - ${player.name}
                    <div class="player-stats">
                        BT: ${player.bt} | ${player.hand}
                        ${player.traits ? ` | ${player.traits}` : ''}
                        ${player.era ? ` | ERA: ${player.era}` : ''}
                    </div>
                </div>
            `).join('')}
        `;
    } else {
        console.warn('Away lineup not available:', {
            element: !!awayLineup,
            players: this.awayTeam?.players?.length
        });
    }

    if (homeLineup && this.homeTeam?.players?.length > 0) {
        homeLineup.innerHTML = `
            <h3>${this.homeTeam.name}</h3>
            ${this.homeTeam.players.map((player, index) => `
                <div class="player-entry ${!this.game.isTopInning && index === this.homeTeam.currentBatter ? 'current-batter' : ''}">
                    ${index + 1}. ${player.position} - ${player.name}
                    <div class="player-stats">
                        BT: ${player.bt} | ${player.hand}
                        ${player.traits ? ` | ${player.traits}` : ''}
                        ${player.era ? ` | ERA: ${player.era}` : ''}
                    </div>
                </div>
            `).join('')}
        `;
    } else {
        console.warn('Home lineup not available:', {
            element: !!homeLineup,
            players: this.homeTeam?.players?.length
        });
    }
}


playFullInning() {
    if (this.game.gameOver) {
        this.log("Game is over!");
        return;
    }

    console.log("\n=== DÉBUT DE MANCHE COMPLÈTE ===");
    const startingInning = this.game.inning;
    const startingIsTop = this.game.isTopInning;
    let atBatCount = 0;
    const maxAtBats = 20; // Sécurité pour éviter une boucle infinie

    const playInning = () => {
        atBatCount++;
        
        // Logs détaillés
        console.log("\n--- État de la manche ---");
        console.log(`At bat #${atBatCount}`);
        console.log(`Manche: ${this.game.inning} (${this.game.isTopInning ? 'Haut' : 'Bas'})`);
        console.log(`Retraits: ${this.game.outs}`);
        console.log(`Score: ${this.awayTeam.name} ${this.game.score.away} - ${this.homeTeam.name} ${this.game.score.home}`);

        // Vérifier si on est toujours dans la même demi-manche
        if (this.game.inning !== startingInning || this.game.isTopInning !== startingIsTop) {
            console.log("=== FIN DE LA DEMI-MANCHE ===");
            clearInterval(inningInterval);
            return;
        }

        // Vérification de sécurité
        if (atBatCount > maxAtBats) {
            console.log("=== ARRÊT DE SÉCURITÉ - TROP DE PRÉSENCES AU BÂTON ===");
            clearInterval(inningInterval);
            return;
        }

        try {
            this.playNextAtBat();
        } catch (error) {
            console.error("Erreur pendant la présence au bâton:", error);
            clearInterval(inningInterval);
        }
    };

    const inningInterval = setInterval(playInning, 500); // Ralenti à 500ms pour mieux voir les logs

    // Timeout de sécurité (1 minute)
    setTimeout(() => {
        if (inningInterval) {
            console.log("=== TIMEOUT DE SÉCURITÉ ATTEINT ===");
            clearInterval(inningInterval);
        }
    }, 60000);
}


    playFullGame() {
        if (this.game.gameOver) {
            console.log("Le jeu est déjà terminé!");
            return;
        }
    
        let inningCount = 0;
        const maxInnings = 20; // Sécurité pour éviter les boucles infinies
    
        const playNext = () => {
            // Log pour debug
            console.log(`Manche: ${this.game.inning} (${this.game.isTopInning ? 'Haut' : 'Bas'})`);
            console.log(`Score: ${this.awayTeam.name} ${this.game.score.away} - ${this.homeTeam.name} ${this.game.score.home}`);
    
            if (this.game.gameOver) {
                clearInterval(gameInterval);
                this.log("\n=== FINAL SCORE ===");
                this.log(`${this.awayTeam.name}: ${this.game.score.away}`);
                this.log(`${this.homeTeam.name}: ${this.game.score.home}`);
                return;
            }
    
            // Vérification de sécurité pour le nombre de manches
            if (this.game.inning > maxInnings) {
                console.log("Arrêt de sécurité - Trop de manches");
                clearInterval(gameInterval);
                this.game.gameOver = true;
                return;
            }
    
            try {
                this.playNextAtBat();
            } catch (error) {
                console.error("Erreur pendant le jeu:", error);
                clearInterval(gameInterval);
                this.game.gameOver = true;
            }
        };
    
        const gameInterval = setInterval(playNext, 100);
    
        // Timeout de sécurité (5 minutes)
        setTimeout(() => {
            if (!this.game.gameOver) {
                console.log("Timeout de sécurité atteint");
                clearInterval(gameInterval);
                this.game.gameOver = true;
            }
        }, 300000);
    }
    
    
    // Et modifions aussi playNextAtBat pour s'assurer que les événements sont traités dans l'ordre
    playNextAtBat() {
        if (this.game.gameOver) {
            this.log("Game is over!");
            return;
        }
    
        const result = this.processAtBat();
        const gameState = this.game.getGameState();
        this.updateDiceResults(gameState);
        this.displayDice(gameState);
    
        // Attendre un petit moment pour s'assurer que les logs sont dans l'ordre
        setTimeout(() => {
            this.updateDisplay();
        }, 50);
    }

    displayDice(gameState) {
        // Ajoutons des logs pour debug
        console.log('DisplayDice called with gameState:', gameState);
        
        const diceContainer = document.getElementById('dice-container');
        if (!diceContainer) {
            console.error('Dice container not found!');
            return;
        }
    
        diceContainer.innerHTML = ''; // Effacer les dés précédents
    
        if (gameState && gameState.diceRolls) {
            console.log('Dice rolls:', gameState.diceRolls);
            
            const dicesToDisplay = [
                { 
                    name: 'Swing D100', 
                    value: gameState.diceRolls.swingScore,
                    color: '#4CAF50'
                },
                { 
                    name: 'Pitch Die', 
                    value: gameState.diceRolls.pitchModifier,
                    color: '#f44336'
                }
            ];
    
            // Si on a un résultat de type HIT, ajouter le dé de hit
            if (gameState.lastAction && gameState.lastAction.hitRoll) {
                dicesToDisplay.push({
                    name: 'Hit D20',
                    value: gameState.lastAction.hitRoll,
                    color: '#2196F3'
                });
            }
    
            dicesToDisplay.forEach(die => {
                console.log('Creating die:', die);
                if (die.value !== null && die.value !== undefined) {
                    const dieWrapper = document.createElement('div');
                    dieWrapper.className = 'die-wrapper';
                    dieWrapper.innerHTML = `
                        <div class="die-label">${die.name}</div>
                        <div class="die" style="border-color: ${die.color}">
                            ${die.value}
                        </div>
                    `;
                    diceContainer.appendChild(dieWrapper);
                }
            });
        }
    }
}

// Connect buttons to UI - UNIQUEMENT cette version
window.playNextAtBat = () => window.gameUI?.playNextAtBat();
window.playFullInning = () => window.gameUI?.playFullInning();
window.playFullGame = () => window.gameUI?.playFullGame();
