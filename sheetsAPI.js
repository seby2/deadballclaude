// sheetsAPI.js
class SheetsAPI {
    static async getTeams() {
        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAMES.TEAMS}!A2:I?key=${CONFIG.API_KEY}`
            );
            const data = await response.json();
            
            if (!data.values || data.values.length === 0) {
                console.log('Teams data is empty');
                return [];
            }

            console.log('Found', data.values.length, 'teams');
            return data.values.map(row => ({
                id: row[0],
                name: row[1],
                wins: row[2],
                losses: row[3],
                pennants: row[4],
                ballpark: row[5],
                mascot: row[6],
                owner: row[7],
                history: row[8]
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des équipes:', error);
            return [];
        }
    }

    static async getTeamRoster(teamId) {
        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAMES.PLAYERS}!A2:I?key=${CONFIG.API_KEY}`
            );
            const data = await response.json();
            
            if (!data.values || data.values.length === 0) {
                console.log('Players data is empty');
                return [];
            }
    
            console.log('Found', data.values.length, 'total players');
            const roster = data.values
                .filter(row => row[1] === teamId)
                .map(row => ({
                    id: row[0],
                    teamId: row[1],
                    name: row[2],
                    position: row[3],
                    bt: row[4],
                    hand: row[5],
                    traits: row[6],
                    era: row[7]
                }));
    
            console.log(`Roster for team ${teamId}:`, roster[0]);
            return roster;
    
        } catch (error) {
            console.error('Error getting team roster:', error);
            return [];
        }
    }

    static async saveLineup(teamId, lineup) {
        try {
            console.log('Saving lineup via App Script');
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6AEWOzHHxqJ8wl2CzlahqSezxeMuiNBYum5HOorxR_5Te2iERUlmfym-AsziX5rA0/exec';
            
            const data = {
                action: 'saveLineup',
                teamId: teamId,
                lineup: lineup
            };
    
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
    
            return true;
        } catch (error) {
            console.error('Error in saveLineup:', error);
            throw error;
        }
    }

    static async standardSaveLineup(teamId, lineup) {
        try {
            console.log('Starting standardSaveLineup operation');
            
            const values = lineup.map(player => [
                teamId,
                player.playerId,
                player.orderPosition,
                player.isStarter,
                new Date().toISOString()
            ]);

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAMES.LINEUPS}!A:E:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${CONFIG.API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in standardSaveLineup:', error);
            throw error;
        }
    }

    static async saveLineupViaAppScript(teamId, lineup) {
        try {
            console.log('Starting saveLineupViaAppScript');
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6AEWOzHHxqJ8wl2CzlahqSezxeMuiNBYum5HOorxR_5Te2iERUlmfym-AsziX5rA0/exec';
            
            const data = {
                teamId: teamId,
                lineup: lineup
            };
    
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
    
            return true;
        } catch (error) {
            console.error('Error in saveLineupViaAppScript:', error);
            throw error;
        }
    }
    

    static async getTeamLineup(teamId) {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAMES.LINEUPS}!A:E?key=${CONFIG.API_KEY}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            if (!data.values) return [];
    
            return data.values
                .filter(row => row[0] === teamId.toString())
                .map(row => ({
                    teamId: row[0],
                    playerId: row[1],
                    orderPosition: parseInt(row[2], 10),
                    lastUpdated: row[4]
                }))
                .sort((a, b) => a.orderPosition - b.orderPosition);
    
        } catch (error) {
            console.error('Error getting team lineup:', error);
            return [];
        }
    }

    static async deleteTeamLineup(teamId) {
        try {
            console.log('Deleting lineup via App Script');
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6AEWOzHHxqJ8wl2CzlahqSezxeMuiNBYum5HOorxR_5Te2iERUlmfym-AsziX5rA0/exec';
            
            const data = {
                action: 'deleteLineup',
                teamId: teamId
            };
    
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
    
            return true;
        } catch (error) {
            console.error('Error in deleteTeamLineup:', error);
            throw error;
        }
    }
    static async getPlayerStats(playerId) {
        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAMES.STATS}!A2:J?key=${CONFIG.API_KEY}`
            );
            const data = await response.json();
            
            if (!data.values || data.values.length === 0) {
                console.log('Stats data is empty');
                return [];
            }

            console.log('Found', data.values.length, 'stats entries');
            return data.values
                .filter(row => row[0] === playerId)
                .map(row => ({
                    gameId: row[1],
                    atBats: parseInt(row[2]) || 0,
                    hits: parseInt(row[3]) || 0,
                    walks: parseInt(row[4]) || 0,
                    strikeouts: parseInt(row[5]) || 0,
                    runs: parseInt(row[6]) || 0,
                    rbi: parseInt(row[7]) || 0,
                    inningsPitched: parseFloat(row[8]) || 0,
                    earnedRuns: parseInt(row[9]) || 0
                }));
        } catch (error) {
            console.error('Erreur lors de la récupération des stats:', error);
            return [];
        }
    }

    static async updateStats(stats) {
        try {
            const values = stats.map(stat => [
                stat.playerId,
                stat.gameId,
                stat.atBats,
                stat.hits,
                stat.walks,
                stat.strikeouts,
                stat.runs,
                stat.rbi,
                stat.inningsPitched,
                stat.earnedRuns
            ]);

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAMES.STATS}!A:J:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${CONFIG.API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error updating stats:', error);
            throw error;
        }
    }

    static async batchUpdate(requests) {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}:batchUpdate?key=${CONFIG.API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: requests
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error in batch update:', error);
            throw error;
        }
    }

    static async clearSheet(sheetName) {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${sheetName}!A:Z:clear?key=${CONFIG.API_KEY}`;

            const response = await fetch(url, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error(`Error clearing sheet ${sheetName}:`, error);
            throw error;
        }
    }

    static async backup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupSheetName = `Backup_${timestamp}`;

            // Créer une nouvelle feuille pour la sauvegarde
            const createRequest = {
                addSheet: {
                    properties: {
                        title: backupSheetName
                    }
                }
            };

            await this.batchUpdate([createRequest]);

            // Copier les données
            for (const sheetName of Object.values(CONFIG.SHEET_NAMES)) {
                const data = await this.getAllSheetData(sheetName);
                if (data && data.values) {
                    await this.appendToSheet(backupSheetName, data.values);
                }
            }

            return backupSheetName;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }
}

