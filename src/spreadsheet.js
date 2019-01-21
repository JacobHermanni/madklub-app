import { config, API } from './APIConfig';
import AllUsers from './users';
import { getFieldInfoForRoom, getMonthNameFromWeekNr } from "./GoogleSheet/converter";
const userSheet = { sheetId: '1XFbQJkN2faEI-ziWowvNs93OhOuP0SwBmClNcIZ3K9g', sheet: "brugerkonfiguration" };
const liveSheet = { sheetId: '1LRPYmJEkluEhmA6Z3eGVuCxri-_jw6amV4pqumSI9rg', sheet: "september!" };


/**
 * Get the user authentication status
 */
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

/**
 * Set the client api key
 */
export function setClient(callback) {
  window.gapi.client.setApiKey(API.key, callback);
}


/** 
 * Loads logged in user and all users
 */
export function initUsersConfig(token, callback) {
  var userInfo = decodeJWT(token);

  var email = userInfo.email;

  // Get first name if it is not equal to email which non-google accounts are.
  var name = email !== userInfo.name ? userInfo.name.toString().split(" ")[0] : undefined;

  var loggedInUser = { værelse: undefined, email: email, navn: name };

  loadUsersSheet((response) => { tryLoadUser(loggedInUser, response, callback); });
}

/** 
 * Loads all users
 */
export function initAllUsersConfig(callback) {
  loadUsersSheet((response) => { callback(new AllUsers(response)) });
}

function tryLoadUser(loggedInUser, sheetUsers, callback) {
  const user = sheetUsers.find((user) => user.email === loggedInUser.email);
  if (user) callback(user, true, new AllUsers(sheetUsers));
  else callback(loggedInUser, false);
}

function decodeJWT(rawToken) {
  var decoded;

  if (rawToken && rawToken.id_token) {
    var jwt = rawToken.id_token;

    var parts = jwt.split('.');

    try {
      decoded = JSON.parse(decodeURIComponent(escape(window.atob(parts[1]))));
    }
    catch (err) {
      // Handle Error
    }
  }
  return decoded;
}

/**
 * Load the month data from the madklub spreadsheet
 */
export function loadUsersSheet(callback) {
  window.gapi.client.load('sheets', 'v4', () => {
    window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: userSheet.sheetId,
      range: userSheet.sheet + '!A2:C'
    }).then((response) => {
      const data = response.result.values || []

      let users = data.map((user, i) => {
        let row = i, // Save row ID for later update
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

      callback(
        users
      );
    }, (response) => {
      callback(false, response.result.error);
    });
  });
}

/**
 * Load the month data from the madklub spreadsheet
 */
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
            }
            else if (Number(day[index]) > 1) {
              tilmeldte.push(`${tilmeldtesNr} (${day[index] - 1})`);
            }
            else tilmeldte.push(tilmeldtesNr);
          }
        }

        if (!tilmeldte.find(nr => nr.toString().includes(day[4].toString()))) tilmeldte.push(day[4]);

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
      callback(
        days
      );
    }, (response) => {
      callback(false, response.result.error);
    });
  });
}

/**
 * Update a single cell value
 */
export function updateCell(column, row, value, successCallback, errorCallback) {
  window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: userSheet.sheetId,
    range: userSheet.sheet + "!" + column + row,
    valueInputOption: 'USER_ENTERED',
    values: [[value]]
  }).then(successCallback, errorCallback);
}

export function tilmeld(roomNr, weekNr, date, row, participants, successCallback, errorCallback) {
  var field = getFieldInfoForRoom(roomNr, weekNr, date.getFullYear());
  window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: liveSheet.sheetId,
    range: `${field.sheet}!${field.letter}${row + 2}`,
    valueInputOption: 'USER_ENTERED',
    values: [[participants]]
  }).then(successCallback, errorCallback);
}