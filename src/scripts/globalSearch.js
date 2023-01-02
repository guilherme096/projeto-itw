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
    self.activate = async function (id) {
        console.log('CALL: getGames...');
        var composedUri = self.baseUri() + id;
        await ajaxHelper(composedUri, 'GET').done(async function (data) {
            console.log(data);
            hideLoading();
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                switch (element.TableName) {
                    case "Athletes":
                        var athlete = await getAthlete(element.Id);
                        self.records.push(athlete);
                        break;
                    case "Games":
                        var game = await getGame(element.Id);
                        self.records.push(game);
                        break;
                    case "Countries":
                        var country = await getCountry(element.Id);
                        self.records.push(country);
                        break;
                    case "Competitions":
                        var competition = await getCompetition(element.Id);
                        self.records.push(competition);
                        break;


                }
            }
        });
        console.log(self.records());
    };

    async function getAthlete(id) {
        var athlete = {
            Id: id,
            type: "Athlete",
            Photo: "",
            Name: "",
            Sex: "",
        }
        var composedUri = 'http://192.168.160.58/Olympics/api/Athletes/' + id;
        await ajaxHelper(composedUri, 'GET').done(function (data) {
            athlete.Name = data.Name;
            athlete.Sex = data.Sex;
            athlete.Photo = data.Photo;
        });
        return athlete;
    }

    async function getGame(id) {
        var game = {
            Id: id,
            type: "Game",
            Name: "",
            Year: "",
            Photo: "",
            Country: "",
        }
        var composedUri = 'http://192.168.160.58/Olympics/api/Games/' + id;
        await ajaxHelper(composedUri, 'GET').done(function (data) {
            game.Name = data.Name;
            game.Year = data.Year;
            game.Photo = data.Photo;
            game.Country = data.CountryName;
        });
        return game;
    }

    async function getCountry(id) {
        var country = {
            Id: id,
            type: "Country",
            Name: "",
            Flag: "",
            IOC: "",
        }
        var composedUri = 'http://192.168.160.58/Olympics/api/Countries/' + id;
        await ajaxHelper(composedUri, 'GET').done(function (data) {
            country.Name = data.Name;
            country.Flag = data.Flag;
            country.IOC = data.IOC;
        });

        return country;
    }

    async function getCompetition(id) {
        var competition = {
            Id: id,
            type: "Competition",
            Name: "",
            Modality: "",
            Photo: "",
        }
        var composedUri = 'http://192.168.160.58/Olympics/api/Competitions/ ' + id;
        await ajaxHelper(composedUri, 'GET').done(function (data) {
            competition.Name = data.Name;
            competition.Game = data.GameName;
            competition.Photo = data.Photo;
            competition.Modality = data.Modality;
        });
        return competition;

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

