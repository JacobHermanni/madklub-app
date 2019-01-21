const AllUsers = (function (users) {
    const AllUsers = users;

    function getUsers() {
        return AllUsers;
    }

    function getUserName(værelsesnr) {
        var nr = værelsesnr;
        var extras = "";

        if(!Number(nr)) { 
            extras = nr.substring(3);
            nr = nr.substring(0,3);
        }

        const user = AllUsers.find((user) => Number(user.værelsesnr) === Number(nr));        
        return user.navn ? user.navn + extras : nr + extras;
    }

    function getUserNames(værelsesnrListe) {
        var nameList = [];
             værelsesnrListe.forEach(nr => {
                 nameList.push(" " + this.getUserName(nr));
             });
        return nameList;
    }

    return {
        users: AllUsers,
        getUsers: getUsers,
        getUserName: getUserName,
        getUserNames: getUserNames
    }
});

export default AllUsers;