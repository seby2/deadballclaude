async function testAPI() {
    console.log('Début des tests avec configuration:', {
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        sheetNames: CONFIG.SHEET_NAMES
    });

    try {
        // Test Teams
        console.log('\n=== TEST DES ÉQUIPES ===');
        const teams = await SheetsAPI.getTeams();
        console.log(`Nombre d'équipes trouvées: ${teams.length}`);
        teams.forEach(team => {
            console.log(`- ${team.name} (${team.pennants} pennants) - ${team.ballpark}`);
        });

        // Test Players
        console.log('\n=== TEST DES JOUEURS ===');
        // Tester le roster des Peacocks (ID: 1)
        const peacocksRoster = await SheetsAPI.getTeamRoster('1');
        console.log('Roster des Peacocks:');
        console.log('Alignement:');
        peacocksRoster
            .filter(p => p.active)
            .forEach(player => {
                console.log(`- ${player.position} ${player.name} (${player.bt} BT, ${player.hand}${player.traits ? ', ' + player.traits : ''})`);
            });
        
        console.log('\nBanc:');
        peacocksRoster
            .filter(p => !p.active)
            .forEach(player => {
                console.log(`- ${player.position} ${player.name} (${player.bt} BT, ${player.hand}${player.traits ? ', ' + player.traits : ''})`);
            });

        // Test Stats
        console.log('\n=== TEST DES STATISTIQUES ===');
        // Tester les stats de Dash the Flash (ID: 1)
        const dashStats = await SheetsAPI.getPlayerStats('1');
        if (dashStats && dashStats.length > 0) {
            console.log('Statistiques de Dash the Flash:');
            console.log(dashStats);
        } else {
            console.log('Aucune statistique trouvée pour Dash the Flash');
            console.log('La feuille Stats est vide - à initialiser');
        }

    } catch (error) {
        console.error('Erreur pendant les tests:', error);
    }
}

// Lancer les tests
testAPI();
