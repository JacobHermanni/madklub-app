const days = [
    "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"
];
const roomLetters = [
    "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

const months = [
    "Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"
];


function getDateOfWeek(weekNr, year) {
    var date = (6 + (weekNr - 1) * 7);
    var firstMonday = new Date(year, 0 ,date);
    return months[firstMonday.getMonth()];
}
