import { config, API } from '../APIConfig';
import { getFieldInfoForRoom, getMonthNameFromWeekNr } from "./converter";
const userSheet = { sheetId: '1XFbQJkN2faEI-ziWowvNs93OhOuP0SwBmClNcIZ3K9g', sheet: "brugerkonfiguration" };
const liveSheet = { sheetId: '1LRPYmJEkluEhmA6Z3eGVuCxri-_jw6amV4pqumSI9rg', sheet: "september!" };

// user authentications status
export function checkAuth(immediate, callback) {
    // auth2 available, but the silent login flow when immediate = true gets blocked by browser. 
    window.gapi.auth.authorize({
        'client_id': config.clientId,
        'scope': "https://www.googleapis.com/auth/spreadsheets email openid profile",
        'fetch_basic_profile': true,
        'response_type': "token id_token",
        'immediate': immediate
    }, callback);
}

// set client API key
export function setClient(callback) {
    window.gapi.client.setApiKey(API.key, callback);
}

// load all users
export function initUserConfig(token, callback) {
    let userInfo = decodeJWT(token);
    let email = userInfo.email;

    // get the first name if it is not equal to email which non-google accounts are
    let name = email !== userInfo.name ? userInfo.name.toString().split(" ")[0] : undefined;
    let loggedInUser = { værelse: undefined, email: email, navn: name };
    loadUser((response) => { tryLoadUser(loggedInUser, response, callback); loadUsers(response) });
}

function loadUsers(users) {
    // implement loading all users to somewhere that can provide alternative id from room nr to names
}

function tryLoadUser(loggedInUser, sheetUsers, callback) {
    const user = sheetUsers.find(user => user.email === loggedInUser.email);
    if (user) callback(user, true);
    else callback(user, false);
}

function decodeJWT(rawToken) {
    let decoded;
    if (rawToken && rawToken.id_token) {
        let jwt = rawToken.id_token;
        let parts = jsw.split('.');
        try {
            decoded = JSON.parse(decodeURIComponent(escape(window.atob(parts[1]))));
        } catch (e) {
            console.error(e);
        }
    }
    return decoded;
}

//load the month data from the madklub spreadsheet
export function loadUsersSheet(callback) {
    window.gapi.client.load('shhets', 'v4', () => {
        window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: userSheet.sheetId,
            range: userSheet.sheet + '!A2:C'
        }).then(response => {
            const data = response.result.values || [];
            let users = data.map((user, i) => {
                let row =  i, // Save row ID for later update
                    værelsesnr = user[0],
                    navn = user[1],
                    email = user[2]
        
                return {
                    row,
                    værelsesnr,
                    navn,
                    email
                }
            });
            callback(users);
        }, response => { callback(false, response.result.error)});
    });
}

// load the month data from the madklub spreadsheet
export function loadMonth(callback, weekNr, year) {
    window.gapi.client.load('sheets', 'v4', () => {
        window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: liveSheet.sheetId,
        range: getMonthNameFromWeekNr(weekNr, year) + '!A4:Z'
        }).then((response) => {
            const data = response.result.values || []
            let days = data.map((day, i) => {
                    let row = i + 2, // Save row ID for later update
                    ugensKokke = day[0],
                uge = day[1],
                dato = day[2],
                ugedag = day[3],
                kok = day[4],
                antalTilmeldte = day[8],
                tilmeldte = [],
                beskrivelse = day[5],
                lukker = day[6],
                kuvertpris = day[9],
                veggie = day[10]

            for (let index = 11; index < day.length; index++) {
                if (day[index] !== "") {
                    const tilmeldtesNr = index - 11 + 317;
                    if (tilmeldtesNr === Number(day[4])) {
                        tilmeldte.push(`${tilmeldtesNr} (${day[index]})`);
                    } else if (Number(day[index]) > 1) {
                        tilmeldte.push(`${tilmeldtesNr} (${day[index] - 1})`);
                    } else {
                        tilmeldte.push(tilmeldtesNr);
                    }
                }
            }

            if (!tilmeldte.find(nr => nr.toString().includes(day[4].toString()))) {
                tilmeldte.push(day[4]);
            }

            return {
                row,
                ugensKokke,
                uge,
                dato,
                ugedag,
                kok,
                antalTilmeldte,
                tilmeldte,
                beskrivelse,
                lukker,
                kuvertpris,
                veggie
            }
        });
        console.log(callback);
        callback(days);
    }, response => callback(false, response.result.error))});
}


// update a single cell value
export function updateCell(column, row, value, successCallback, errorCallback) {
    window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: userSheet.sheetId,
        range: userSheet.sheet + "!" + column + row,
        valueInputOption: 'USER_ENTERED',
        values: [[value]]
    }).then(successCallback, errorCallback);
}

// tilmeld function
export function tilmeld(roomNr, weekNr, date, row, participants, successCallback, errorCallback) {
    var field = getFieldInfoForRoom(roomNr, weekNr, date.getFullYear());
    window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: liveSheet.sheetId,
        range: `${field.sheet}!${field.letter}${row + 2}`,
        valueInputOption: 'USER_ENTERED',
        values: [[participants]]
    }).then(successCallback, errorCallback);
}