const roomLetters = [
    "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

const months = [
    "Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"
];

export function getMonthNameFromWeekNr(weekNr, year) {
    var date = (6 + (weekNr - 1) * 7);
    var firstMonday = new Date(year, 0 ,date);
    return months[firstMonday.getMonth()];
}

export function getFieldInfoForRoom(roomNr, weekNr, year) {
    var sheet = getMonthNameFromWeekNr(weekNr, year);
    var letter = roomLetters[roomNr - 317];
    return { sheet, letter };
}