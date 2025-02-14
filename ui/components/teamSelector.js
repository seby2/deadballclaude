class TeamSelector {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.teams = [];
        this.selectedHomeTeam = null;
        this.selectedAwayTeam = null;
        
        this.showLineupEditor = this.showLineupEditor.bind(this);
        this.saveLineup = this.saveLineup.bind(this);
        this.createPlayerCard = this.createPlayerCard.bind(this);
        this.initializeLineupDragAndDrop = this.initializeLineupDragAndDrop.bind(this);
        
        this.init();
    }

    async init() {
        await this.loadTeams();
        this.render();
        this.addEventListeners();
    }

    async loadTeams() {
        this.teams = await SheetsAPI.getTeams();
    }

    render() {
        this.container.innerHTML = `
            <div class="team-selector-container">
                <div class="team-selection">
                    <div class="away-team">
                        <h3>Away Team</h3>
                        <select id="away-team-select">
                            <option value="">Select Team</option>
                            ${this.teams.map(team => 
                                `<option value="${team.id}">${team.name}</option>`
                            ).join('')}
                        </select>
                        <div id="away-team-info"></div>
                    </div>
                    
                    <div class="versus">VS</div>
                    
                    <div class="home-team">
                        <h3>Home Team</h3>
                        <select id="home-team-select">
                            <option value="">Select Team</option>
                            ${this.teams.map(team => 
                                `<option value="${team.id}">${team.name}</option>`
                            ).join('')}
                        </select>
                        <div id="home-team-info"></div>
                    </div>
                </div>

                <div class="team-rosters">
                    <div id="away-team-roster" class="roster"></div>
                    <div id="home-team-roster" class="roster"></div>
                </div>

                <div class="game-controls">
                    <button id="start-game" disabled>Start Game</button>
                </div>
            </div>
        `;
    }
    async showTeamInfo(teamId, container) {
        try {
            const team = this.teams.find(t => t.id === teamId);
            if (!team) {
                console.log('Team not found:', teamId);
                return;
            }
    
            console.log('Loading info for team:', teamId);
    
            const roster = await SheetsAPI.getTeamRoster(teamId);
            const lineup = await SheetsAPI.getTeamLineup(teamId);
    
            console.log('Roster loaded:', roster);
            console.log('Lineup loaded:', lineup);
    
            container.innerHTML = `
                <div class="team-details">
                    <h4>${team.name}</h4>
                    <p>Ballpark: ${team.ballpark}</p>
                    <p>Pennants: ${team.pennants}</p>
                    
                    <h5>Starting Lineup</h5>
                    <div class="lineup">
                        ${!lineup || lineup.length === 0 
                            ? `<div class="no-lineup-message">
                                <p>No lineup set for this team.</p>
                                <p>Click "Edit Lineup" to create one.</p>
                               </div>`
                            : lineup
                                .sort((a, b) => a.orderPosition - b.orderPosition)
                                .map(l => {
                                    const player = roster.find(p => p.id === l.playerId);
                                    return player ? `
                                        <div class="player">
                                            ${l.orderPosition}. ${player.position} - ${player.name}
                                            <span class="player-stats">
                                                BT: ${player.bt} | ${player.hand}
                                                ${player.traits ? ` | ${player.traits}` : ''}
                                                ${player.era ? ` | ERA: ${player.era}` : ''}
                                            </span>
                                        </div>
                                    ` : '';
                                }).join('')
                        }
                    </div>
    
                    <div class="lineup-controls">
                        <button class="edit-lineup" data-team-id="${teamId}">
                            ${!lineup || lineup.length === 0 ? 'Create Lineup' : 'Edit Lineup'}
                        </button>
                    </div>
                </div>
            `;
    
            const editButton = container.querySelector('.edit-lineup');
            if (editButton) {
                editButton.addEventListener('click', () => {
                    console.log('Edit button clicked for team:', teamId);
                    this.showLineupEditor(teamId);
                });
            }
    
        } catch (error) {
            console.error('Error showing team info:', error);
            container.innerHTML = `
                <div class="error-message">
                    Error loading team information. Please try again.
                </div>
            `;
        }
    }
    
    showLineupEditor(teamId) {
        console.log('Opening lineup editor for team:', teamId);
        
        const modal = document.createElement('div');
        modal.className = 'lineup-editor-modal';
        
        const content = document.createElement('div');
        content.className = 'lineup-editor-content';
        
        // Conteneur de l'alignement partant simplifié
        const startersList = document.createElement('div');
        startersList.className = 'starters-list';
        
        const lineupTitle = document.createElement('h3');
        lineupTitle.textContent = 'Starting Lineup';
        startersList.appendChild(lineupTitle);
        
        // Conteneur des remplaçants
        const benchList = document.createElement('div');
        benchList.className = 'bench-list';
        
        const benchTitle = document.createElement('h3');
        benchTitle.textContent = 'Available Players';
        benchList.appendChild(benchTitle);
        
        // Charger les données
        Promise.all([
            SheetsAPI.getTeamRoster(teamId),
            SheetsAPI.getTeamLineup(teamId)
        ]).then(([roster, lineup]) => {
            console.log('Loaded data:', {roster, lineup});
            
            // Placer les joueurs de l'alignement existant
            if (lineup && lineup.length > 0) {
                lineup
                    .sort((a, b) => a.orderPosition - b.orderPosition)
                    .forEach(entry => {
                        const player = roster.find(p => p.id === entry.playerId);
                        if (player) {
                            const card = this.createPlayerCard(player);
                            card.dataset.order = entry.orderPosition;
                            startersList.appendChild(card);
                        }
                    });
            }
            
            // Placer les autres joueurs sur le banc
            roster.forEach(player => {
                if (!lineup?.some(l => l.playerId === player.id)) {
                    benchList.appendChild(this.createPlayerCard(player));
                }
            });
            
            // Initialiser le drag & drop
            this.initializeLineupDragAndDrop(startersList, benchList);
        });
    
        // Boutons de contrôle
        const controls = document.createElement('div');
        controls.className = 'lineup-controls';
        
        const saveButton = document.createElement('button');
        saveButton.className = 'save-lineup';
        saveButton.textContent = 'Save Lineup';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-lineup';
        cancelButton.textContent = 'Cancel';
        
        controls.appendChild(saveButton);
        controls.appendChild(cancelButton);
        
        // Assemblage
        content.appendChild(startersList);
        content.appendChild(benchList);
        content.appendChild(controls);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Event listener pour la sauvegarde
        saveButton.addEventListener('click', () => {
            const lineup = Array.from(startersList.querySelectorAll('.player-card'))
                .map((card, index) => ({
                    teamId: teamId,
                    playerId: card.dataset.playerId,
                    orderPosition: index + 1,
                    isStarter: true
                }));
                
            if (lineup.length !== 9) {
                alert('Please fill all 9 positions');
                return;
            }
            
            this.saveLineup(teamId, lineup);
        });
        
        cancelButton.addEventListener('click', () => {
            modal.remove();
        });
    }
    

    async saveLineup(teamId, lineup) {
        try {
            // Vérifier qu'il y a exactement 9 joueurs
            if (lineup.length !== 9) {
                throw new Error('Starting lineup must have exactly 9 players');
            }
    
            // Vérifier qu'il y a un lanceur
            const hasPitcher = lineup.some(entry => {
                const card = document.querySelector(`[data-player-id="${entry.playerId}"]`);
                // Vérifions le contenu complet de la carte pour trouver 'P BT:' ou 'ERA:'
                const cardText = card?.textContent || '';
                return cardText.includes('P BT:') || cardText.includes('ERA:');
            });
    
            if (!hasPitcher) {
                throw new Error('Lineup must include a pitcher');
            }
    
            // Sauvegarder via l'API
            await SheetsAPI.deleteTeamLineup(teamId);
            await SheetsAPI.saveLineup(teamId, lineup);
    
            // Montrer message de succès
            this.showSuccessMessage('Lineup saved successfully');
            
            // Rafraîchir l'affichage
            await this.refreshTeamDisplay(teamId);
    
            // Fermer la modal
            document.querySelector('.lineup-editor-modal').remove();
    
        } catch (error) {
            console.error('Error saving lineup:', error);
            alert('Error saving lineup: ' + error.message);
        }
    }
    
    createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.draggable = true;
        card.setAttribute('data-player-id', player.id);
    
        // Un seul style d'affichage unifié
        card.innerHTML = `
            <div class="player-info">
                <div class="player-name-position">
                    ${player.name}
                </div>
                <div class="player-details">
                    ${player.position} BT: ${player.bt} | ${player.hand}
                    ${player.traits ? ` | ${player.traits}` : ''}
                    ${player.era ? ` | ERA: ${player.era}` : ''}
                </div>
            </div>
        `;
    
        return card;
    }
    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => messageDiv.remove(), 300);
        }, 2000);
    }

    initializeLineupDragAndDrop(startersList, benchList) {
        console.log('Initializing drag and drop');
    
        const dragState = { dragging: null };
    
        // Event Handlers
        function handleDragStart(e) {
            // S'assurer que nous ciblons bien la carte
            const card = e.target.closest('.player-card');
            if (!card) return;
    
            dragState.dragging = card;
            card.classList.add('dragging');
            
            // Pour Firefox
            e.dataTransfer.setData('text/plain', '');
            
            // Ajouter un style visuel
            setTimeout(() => {
                card.style.opacity = '0.5';
            }, 0);
        }
    
        function handleDragEnd(e) {
            const card = e.target.closest('.player-card');
            if (!card) return;
            
            card.classList.remove('dragging');
            card.style.opacity = '';
            dragState.dragging = null;
        }
    
        function handleContainerDragOver(e) {
            e.preventDefault();
            const container = e.currentTarget;
            
            // Trouver la position d'insertion
            const draggable = document.querySelector('.player-card.dragging');
            if (!draggable) return;
            
            const afterElement = getDragAfterElement(container, e.clientY);
            if (afterElement) {
                container.insertBefore(draggable, afterElement);
            } else {
                container.appendChild(draggable);
            }
        }
    
        function getDragAfterElement(container, y) {
            const cards = [...container.querySelectorAll('.player-card:not(.dragging)')];
            return cards.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset, element: child };
                }
                return closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    
        // Initialiser les cartes
        function initializeCard(card) {
            card.setAttribute('draggable', true);
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
            
            // Ajouter une classe pour indiquer que la carte est draggable
            card.classList.add('draggable');
        }
    
        // Configuration des conteneurs
        [startersList, benchList].forEach(container => {
            container.addEventListener('dragover', handleContainerDragOver);
            container.addEventListener('dragenter', e => e.preventDefault());
        });
    
        // Initialiser les cartes existantes
        document.querySelectorAll('.player-card').forEach(initializeCard);
    
        // Observer les nouvelles cartes
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('player-card')) {
                        initializeCard(node);
                    }
                });
            });
        });
    
        [startersList, benchList].forEach(container => {
            observer.observe(container, { childList: true, subtree: true });
        });
    }
    
    async refreshTeamDisplay(teamId) {
        try {
            const roster = await SheetsAPI.getTeamRoster(teamId);
            const lineup = await SheetsAPI.getTeamLineup(teamId);
            const team = this.teams.find(t => t.id === teamId);
    
            const container = document.querySelector(
                `#${teamId === this.selectedHomeTeam ? 'home' : 'away'}-team-info`
            );
            if (!container) {
                console.error('Container not found for refresh');
                return;
            }
    
            container.innerHTML = `
                <div class="team-details">
                    <h4>${team.name}</h4>
                    <p>Ballpark: ${team.ballpark}</p>
                    <p>Pennants: ${team.pennants}</p>
                    
                    <h5>Starting Lineup</h5>
                    <div class="lineup">
                        ${!lineup || lineup.length === 0 
                            ? `<div class="no-lineup-message">
                                <p>No lineup set for this team.</p>
                                <p>Click "Edit Lineup" to create one.</p>
                               </div>`
                            : lineup
                                .sort((a, b) => a.orderPosition - b.orderPosition)
                                .map(l => {
                                    const player = roster.find(p => p.id === l.playerId);
                                    if (!player) return '';
                                    return `
                                        <div class="player">
                                            ${l.orderPosition}. ${player.position} - ${player.name}
                                            <span class="player-stats">
                                                BT: ${player.bt} | ${player.hand}
                                                ${player.traits ? ` | ${player.traits}` : ''}
                                                ${player.era ? ` | ERA: ${player.era}` : ''}
                                            </span>
                                        </div>
                                    `;
                                }).join('')
                        }
                    </div>
    
                    <div class="lineup-controls">
                        <button class="edit-lineup" data-team-id="${teamId}">
                            ${!lineup || lineup.length === 0 ? 'Create Lineup' : 'Edit Lineup'}
                        </button>
                    </div>
                </div>
            `;
    
            const self = this;
            const editButton = container.querySelector('.edit-lineup');
            if (editButton) {
                editButton.addEventListener('click', function() {
                    self.showLineupEditor(teamId);
                });
            }
    
        } catch (error) {
            console.error('Error refreshing team display:', error);
        }
    }
    

    clearLineupSlots() {
        const slots = document.querySelectorAll('.lineup-slot .drop-zone');
        slots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('drag-over');
        });
    }
    

    addEventListeners() {
        const awaySelect = document.getElementById('away-team-select');
        const homeSelect = document.getElementById('home-team-select');
        const startButton = document.getElementById('start-game');

        awaySelect.addEventListener('change', async (e) => {
            const teamId = e.target.value;
            this.selectedAwayTeam = teamId;
            if (teamId) {
                await this.showTeamInfo(teamId, document.getElementById('away-team-info'), false);
            }
            this.updateStartButton();
        });

        homeSelect.addEventListener('change', async (e) => {
            const teamId = e.target.value;
            this.selectedHomeTeam = teamId;
            if (teamId) {
                await this.showTeamInfo(teamId, document.getElementById('home-team-info'), true);
            }
            this.updateStartButton();
        });

        startButton.addEventListener('click', () => {
            if (this.selectedHomeTeam && this.selectedAwayTeam) {
                this.startGame(this.selectedHomeTeam, this.selectedAwayTeam);
            }
        });
    }

    updateStartButton() {
        const startButton = document.getElementById('start-game');
        startButton.disabled = !(this.selectedHomeTeam && this.selectedAwayTeam);
    }

    startGame(homeTeamId, awayTeamId) {
        console.log('Starting game with IDs:', {homeTeamId, awayTeamId});
    
        Promise.all([
            SheetsAPI.getTeamRoster(homeTeamId),
            SheetsAPI.getTeamRoster(awayTeamId),
            SheetsAPI.getTeamLineup(homeTeamId),
            SheetsAPI.getTeamLineup(awayTeamId),
            SheetsAPI.getTeams()
        ]).then(([homeRoster, awayRoster, homeLineup, awayLineup, teams]) => {
            try {
                // Validation des données
                if (!homeRoster || !awayRoster || !homeLineup || !awayLineup) {
                    throw new Error('Missing team data');
                }
    
                // Vérifier que chaque joueur de l'alignement a toutes les données requises
                const validateLineup = (lineup, roster, teamType) => {
                    return lineup.every((entry, index) => {
                        const player = roster.find(p => p.id === entry.playerId);
                        if (!player) {
                            throw new Error(`${teamType} team: Player not found for position ${index + 1}`);
                        }
                        if (!player.position || !player.bt || !player.hand) {
                            throw new Error(`${teamType} team: Missing data for player ${player.name}`);
                        }
                        return true;
                    });
                };
    
                validateLineup(homeLineup, homeRoster, 'Home');
                validateLineup(awayLineup, awayRoster, 'Away');
    
                const homeTeam = teams.find(t => t.id === homeTeamId);
                const awayTeam = teams.find(t => t.id === awayTeamId);
    
                if (!homeTeam || !awayTeam) {
                    throw new Error('Teams not found');
                }
    
                const config = {
                    homeTeam: {
                        info: homeTeam,
                        roster: homeRoster.map(p => ({
                            ...p,
                            position: p.position.toUpperCase(),
                            bt: parseInt(p.bt),
                            hand: p.hand.toUpperCase()
                        })),
                        lineup: homeLineup
                    },
                    awayTeam: {
                        info: awayTeam,
                        roster: awayRoster.map(p => ({
                            ...p,
                            position: p.position.toUpperCase(),
                            bt: parseInt(p.bt),
                            hand: p.hand.toUpperCase()
                        })),
                        lineup: awayLineup
                    }
                };
    
                console.log('Validated config:', {
                    homeTeamPlayers: config.homeTeam.roster.length,
                    homeLineupPlayers: config.homeTeam.lineup.length,
                    awayTeamPlayers: config.awayTeam.roster.length,
                    awayLineupPlayers: config.awayTeam.lineup.length
                });
    
                document.getElementById('selection-phase').style.display = 'none';
                document.getElementById('game-phase').style.display = 'block';
    
                try {
                    window.gameUI = new DeadballGameUI(config);
                } catch (error) {
                    console.error('GameUI initialization error:', error);
                    throw new Error('Failed to initialize game: ' + error.message);
                }
    
            } catch (error) {
                console.error('Setup error:', error);
                alert('Error starting game: ' + error.message);
                document.getElementById('selection-phase').style.display = 'block';
                document.getElementById('game-phase').style.display = 'none';
            }
        }).catch(error => {
            console.error('Fatal error:', error);
            alert('Error loading data: ' + error.message);
            document.getElementById('selection-phase').style.display = 'block';
            document.getElementById('game-phase').style.display = 'none';
        });
    }
    
    
    
    
    
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const teamSelector = new TeamSelector('team-selector');
});

window.TeamSelector = TeamSelector;


