const days = [
    "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"
];
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

function getRowNumberFromDate(weekNr, year, dayNr, monthNr) {
    var firstMonday = new Date(year, 0 , (6 + (weekNr - 1) * 7));
    var date = new Date(year, monthNr, dayNr);
    var firstDay = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), 2);
    var prevMonday = getPreviousMonday(firstDay);
    var oneDay = 24*60*60*1000; 
    var diffDays = Math.round(Math.abs((date.getTime() - prevMonday)/(oneDay)));
    return diffDays + 5;
}

export function getFieldInfoForRoom(roomNr, weekNr, monthNr, year, dayNr) {
    var sheet = getMonthNameFromWeekNr(weekNr, year);
    var letter = roomLetters[roomNr - 317];
    var row = getRowNumberFromDate(weekNr, year, dayNr, --monthNr);
    return { sheet, letter, row };
}

function getPreviousMonday(date) {
    var day = date.getDay();
    var prevMonday;
    if(date.getDay() == 0){
        prevMonday = new Date().setDate(date.getDate() - 7 + 1);
    }
    else{
        prevMonday = new Date().setDate(date.getDate() - day + 1);
    }

    return prevMonday;
}