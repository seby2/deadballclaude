// diagnostic.js
import { TeamSelector } from './ui/components/teamSelector.js';
class GameDiagnostic {
    static log(stage, data) {
        console.group(`🔍 DIAGNOSTIC - ${stage}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        try {
            this.logTeamData('Home Team', data?.homeTeam);
            this.logTeamData('Away Team', data?.awayTeam);
        } catch (error) {
            console.error('🚨 Diagnostic Error:', error);
        }
        console.groupEnd();
    }

    static logTeamData(label, teamData) {
        if (!teamData) {
            console.warn(`⚠️ ${label} data is null or undefined`);
            return;
        }

        console.group(label);
        console.log('Basic Info:', {
            name: teamData.info?.name || 'N/A',
            rosterCount: teamData.roster?.length || 0,
            lineupCount: teamData.lineup?.length || 0
        });

        if (teamData.roster) {
            console.group('Roster Details');
            teamData.roster.forEach((player, index) => {
                console.log(`Player ${index + 1}:`, {
                    id: player.id || 'NO_ID',
                    name: player.name || 'NO_NAME',
                    position: player.position || 'NO_POS',
                    bt: player.bt || 'NO_BT',
                    hand: player.hand || 'NO_HAND',
                    traits: player.traits || 'NO_TRAITS',
                    era: player.era || 'NO_ERA'
                });
            });
            console.groupEnd();
        }

        if (teamData.lineup) {
            console.group('Lineup Details');
            teamData.lineup.forEach((entry, index) => {
                const player = teamData.roster?.find(p => p.id === entry.playerId);
                console.log(`Batting ${index + 1}:`, {
                    orderPosition: entry.orderPosition,
                    playerId: entry.playerId,
                    playerFound: !!player,
                    playerDetails: player ? {
                        name: player.name,
                        position: player.position,
                        bt: player.bt,
                        hand: player.hand
                    } : 'NOT_FOUND'
                });
            });
            console.groupEnd();
        }
        console.groupEnd();
    }

    static validateTeam(teamData, teamType) {
        const errors = [];
        
        if (!teamData) {
            errors.push(`${teamType} team data is missing`);
            return errors;
        }

        if (!teamData.roster || teamData.roster.length === 0) {
            errors.push(`${teamType} team has no roster`);
        }

        if (!teamData.lineup || teamData.lineup.length !== 9) {
            errors.push(`${teamType} team lineup must have exactly 9 players (has ${teamData.lineup?.length || 0})`);
        }

        // Vérifier chaque joueur de l'alignement
        teamData.lineup?.forEach((entry, index) => {
            const player = teamData.roster?.find(p => p.id === entry.playerId);
            if (!player) {
                errors.push(`${teamType} team lineup position ${index + 1}: Player ID ${entry.playerId} not found in roster`);
            } else {
                if (!player.position) errors.push(`${teamType} team player ${player.name}: No position`);
                if (!player.bt) errors.push(`${teamType} team player ${player.name}: No BT`);
                if (!player.hand) errors.push(`${teamType} team player ${player.name}: No hand`);
                if (player.position === 'P' && !player.era) errors.push(`${teamType} team pitcher ${player.name}: No ERA`);
            }
        });

        // Vérifier qu'il y a un lanceur
        const hasPitcher = teamData.roster?.some(p => p.position === 'P');
        if (!hasPitcher) {
            errors.push(`${teamType} team has no pitcher`);
        }

        return errors;
    }

    static inspectGameState(gameUI) {
        console.group('🔍 Game State Inspection');
        try {
            console.log('Game Instance:', {
                inning: gameUI.game.inning,
                isTopInning: gameUI.game.isTopInning,
                outs: gameUI.game.outs,
                score: gameUI.game.score,
                bases: {
                    first: gameUI.game.bases.first.isOccupied(),
                    second: gameUI.game.bases.second.isOccupied(),
                    third: gameUI.game.bases.third.isOccupied()
                }
            });

            console.log('Teams State:', {
                away: {
                    name: gameUI.awayTeam.name,
                    currentBatter: gameUI.awayTeam.currentBatter,
                    playerCount: gameUI.awayTeam.players.length
                },
                home: {
                    name: gameUI.homeTeam.name,
                    currentBatter: gameUI.homeTeam.currentBatter,
                    playerCount: gameUI.homeTeam.players.length
                }
            });
        } catch (error) {
            console.error('Error during game state inspection:', error);
        }
        console.groupEnd();
    }
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que le bouton existe
    const waitForStartButton = setInterval(() => {
        const startButton = document.getElementById('start-game');
        if (startButton) {
            clearInterval(waitForStartButton);
            
            // Intercepter le clic sur Start Game
            startButton.addEventListener('click', () => {
                console.clear();
                console.log('🔍 Diagnostic démarré au clic sur Start Game');
                
                // Vérifier les équipes sélectionnées
                const homeTeamSelect = document.getElementById('home-team-select');
                const awayTeamSelect = document.getElementById('away-team-select');
                
                console.group('Sélection des équipes');
                console.log('Équipe domicile:', homeTeamSelect?.value);
                console.log('Équipe visiteuse:', awayTeamSelect?.value);
                console.groupEnd();
            });
        }
    }, 100);
});

// Patch la méthode startGame
const originalStartGame = TeamSelector.prototype.startGame;
TeamSelector.prototype.startGame = function(homeTeamId, awayTeamId) {
    console.group('🎯 Diagnostic de démarrage du jeu');
    console.log('IDs des équipes:', { homeTeamId, awayTeamId });
    
    Promise.all([
        SheetsAPI.getTeamRoster(homeTeamId),
        SheetsAPI.getTeamRoster(awayTeamId),
        SheetsAPI.getTeamLineup(homeTeamId),
        SheetsAPI.getTeamLineup(awayTeamId),
        SheetsAPI.getTeams()
    ]).then(([homeRoster, awayRoster, homeLineup, awayLineup, teams]) => {
        try {
            GameDiagnostic.log('Données chargées', {
                homeTeam: { roster: homeRoster, lineup: homeLineup },
                awayTeam: { roster: awayRoster, lineup: awayLineup }
            });

            const homeTeam = teams.find(t => t.id === homeTeamId);
            const awayTeam = teams.find(t => t.id === awayTeamId);

            if (!homeTeam || !awayTeam) {
                throw new Error('Équipes non trouvées dans la liste');
            }

            const config = {
                homeTeam: {
                    info: homeTeam,
                    roster: homeRoster,
                    lineup: homeLineup
                },
                awayTeam: {
                    info: awayTeam,
                    roster: awayRoster,
                    lineup: awayLineup
                }
            };

            // Validation avant création du jeu
            const homeErrors = GameDiagnostic.validateTeam(config.homeTeam, 'Home');
            const awayErrors = GameDiagnostic.validateTeam(config.awayTeam, 'Away');

            if (homeErrors.length > 0 || awayErrors.length > 0) {
                console.group('🚨 Erreurs de validation');
                if (homeErrors.length > 0) {
                    console.log('Erreurs équipe domicile:', homeErrors);
                }
                if (awayErrors.length > 0) {
                    console.log('Erreurs équipe visiteuse:', awayErrors);
                }
                console.groupEnd();
                throw new Error('Échec de la validation - voir détails dans la console');
            }

            // Configuration finale
            GameDiagnostic.log('Configuration finale', config);

            console.log('✅ Diagnostic réussi, démarrage du jeu...');
            document.getElementById('selection-phase').style.display = 'none';
            document.getElementById('game-phase').style.display = 'block';
            
            try {
                window.gameUI = new DeadballGameUI(config);
                console.log('✅ Jeu initialisé avec succès');
                // Inspecter l'état initial du jeu
                GameDiagnostic.inspectGameState(window.gameUI);
            } catch (error) {
                console.error('❌ Erreur lors de l\'initialisation du jeu:', error);
                throw error;
            }

        } catch (error) {
            console.error('❌ Erreur de configuration:', error);
            alert('Erreur lors de la configuration du jeu. Vérifiez la console pour plus de détails.');
        }
        console.groupEnd();
    }).catch(error => {
        console.error('❌ Erreur fatale:', error);
        console.groupEnd();
        alert('Erreur fatale lors du chargement des données.');
    });
};

// Ajouter un listener global pour les erreurs
window.addEventListener('error', function(event) {
    console.group('🚨 Erreur globale détectée');
    console.error('Message:', event.message);
    console.error('Source:', event.filename);
    console.error('Ligne:', event.lineno);
    console.error('Colonne:', event.colno);
    console.error('Erreur complète:', event.error);
    console.groupEnd();
});

// Ajouter un listener pour les rejets de promesses non gérés
window.addEventListener('unhandledrejection', function(event) {
    console.group('🚨 Promesse rejetée non gérée');
    console.error('Raison:', event.reason);
    console.groupEnd();
});
