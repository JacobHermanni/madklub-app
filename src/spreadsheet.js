import { config, API } from './printsecret';
const testSheet = { sheetId: '166fSi7fmm7yeYSMVjvCrMp1DIoZLxn3vIKjQO9EjKCE', sheet: "ark2!"};
const liveSheet = { sheetId: '1LRPYmJEkluEhmA6Z3eGVuCxri-_jw6amV4pqumSI9rg', sheet: "september!"}; 
/**
 * Get the user authentication status
 */
export function checkAuth(immediate, callback) {
  window.gapi.auth.authorize({
    'client_id': config.clientId,
    'scope': "https://www.googleapis.com/auth/spreadsheets",
    'immediate': immediate
  }, callback);
}

export function loadClient(callback) {
  window.gapi.client.setApiKey(API.key, callback);
}

/**
 * Load the data from the spreadsheet
 */
export function load(callback) {
  window.gapi.client.load('sheets', 'v4', () => {
    window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '166fSi7fmm7yeYSMVjvCrMp1DIoZLxn3vIKjQO9EjKCE',
      range: 'ark2!A4:Z'
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
          tilmeldte = []

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

        if (!tilmeldte.find(nr => Number(nr) === Number(day[4]))) tilmeldte.push(day[4]);

        return {
          row,
          ugensKokke,
          uge,
          dato,
          ugedag,
          kok,
          antalTilmeldte,
          tilmeldte
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
    spreadsheetId: testSheet.sheetId,
    range: testSheet.sheet + column + row,
    valueInputOption: 'USER_ENTERED',
    values: [[value]]
  }).then(successCallback, errorCallback);
}
