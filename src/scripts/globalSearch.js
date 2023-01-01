// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Utils/Search?q=');

    self.displayName = 'Search Results';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGames...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                switch (element.TableName) {
                    case "Athletes":
                        var athlete = getAthlete(element.Id);
                        self.records.push(athlete);
                        break;
                    case "Games":
                        var game = getGame(element.Id);
                        self.records.push(game);
                        break;
                    case "Medals":
                        var medal = getMedal(element.Id);
                        self.records.push(medal);
                        break;
                    case "Countries":
                        var country = getCountry(element.Id);
                        self.records.push(country);
                        break;
                    case "Competitions":
                        var competition = getCompetition(element.Id);
                        self.records.push(competition);
                        break;


                }
            }
        });
    };

    function getAthlete(id) {
        var athlete = {
            id: id,
            type: "Athlete",
            photo: "",
            name: "",
            sex: "",
        }
        var composedUri = 'http://192.168.160.58/Olympics/api/Athletes/' + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            athlete.name = data.Name;
            athlete.sex = data.Sex;
            athlete.photo = data.Photo;
        });
        return athlete;
    }

    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };


    //--- start ....
    showLoading();
    var q = getUrlParameter('q');
    self.activate(q);
    console.log("VM initialized!");


};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})
