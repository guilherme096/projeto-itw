// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;

    self.displayName = 'Olympic Athletes List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');

    //--- Page Events

    self.IOCs = ko.observableArray([]);
    self.loadingMap = ko.observable(true);
    self.currentGame = ko.observable('');
    self.games = ko.observableArray([]);
    self.athletesCountryGames = ko.observableArray([]);
    self.gameCompetitions = ko.observableArray([]);
    self.medalsPerCountry = ko.observableArray([]);


    self.athletesPerGame = ko.observableArray([]);
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
                self.error(errorThrown);
            }
        });
    }


    async function getAthletesPerGame() {
        console.log('CALL: getAthletesPerGame...');
        await ajaxHelper('http://192.168.160.58/Olympics/api/Statistics/Games_Athletes', 'GET').done(function (data) {
            var _athletesPerGame = [];
            for (var i = 0; i < data.length; i++) {
                _athletesPerGame.push(
                    {
                        Name: data[i].Name,
                        Counter: data[i].Counter
                    });
            }
            self.athletesPerGame(_athletesPerGame);
        }
        );
    }
    function getAthletesPerGameGraph() {
        console.log('CALL: getAthletesPerGameGraph...');
        google.charts.load('current', { 'packages': ['bar'] });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var _data = [['Game', 'Summer', 'Winter']]
            for (var i = 0; i < self.athletesPerGame().length; i++) {
                var name = self.athletesPerGame()[i].Name.split(" ");
                var index = _data.findIndex(x => x[0] === name[0]);
                if (index > -1) {
                    // if name[1] is Winter, then add to the second column, if not, add to the first column
                    if (name[1] === "Winter") {
                        _data[index][2] = self.athletesPerGame()[i].Counter;
                    }
                    else {
                        _data[index][1] = self.athletesPerGame()[i].Counter;
                    }
                }
                else {
                    if (name[1] === "Winter") {
                        _data.push([name[0], 0, self.athletesPerGame()[i].Counter]);
                    }
                    else {
                        _data.push([name[0], self.athletesPerGame()[i].Counter, 0]);
                    }
                }
            }
            console.log("array=", _data)

            var data = google.visualization.arrayToDataTable(_data);

            var options = {
                chart: {
                    title: 'Athletes per Game',
                }
            };

            var chart = new google.charts.Bar(document.getElementById('columnchart_material'));

            chart.draw(data, google.charts.Bar.convertOptions(options));
        }

    }

    async function getGameCompetitions() {
        console.log('CALL: getGameCompetitions...');
        await ajaxHelper('http://192.168.160.58/Olympics/api/Statistics/Games_Competitions', 'GET').done(function (data) {
            var _gameCompetitions = [];
            for (var i = 0; i < data.length; i++) {
                _gameCompetitions.push(
                    {
                        Name: data[i].Name,
                        Counter: data[i].Counter,
                        Year: data[i].Year
                    });
            }
            console.log("gameCompetitions=", _gameCompetitions);
            self.gameCompetitions(_gameCompetitions);
        }
        );

    }

    function getGameCompetitionsGraph() {
        console.log('CALL: getGameCompetitionsGraph...');
        google.charts.load('current', { 'packages': ['bar'] });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var _data = [['Game', 'Summer', 'Winter']]
            for (var i = 0; i < self.gameCompetitions().length; i++) {

                var name = self.gameCompetitions()[i].Name.split(" ");
                var index = _data.findIndex(x => x[0] === name[0]);
                if (index > -1) {
                    // if name[1] is Winter, then add to the second column, if not, add to the first column
                    if (name[1] === "Winter") {
                        _data[index][2] = self.gameCompetitions()[i].Counter;
                    }
                    else {
                        _data[index][1] = self.gameCompetitions()[i].Counter;
                    }
                }
                else {
                    if (name[1] === "Winter") {
                        _data.push([name[0], 0, self.gameCompetitions()[i].Counter]);
                    }
                    else {
                        _data.push([name[0], self.gameCompetitions()[i].Counter, 0]);
                    }
                }
            }
            console.log("array=", _data)

            var data = google.visualization.arrayToDataTable(_data);

            var options = {
                chart: {
                    title: 'Competitions per Game',
                }
            };

            var chart = new google.charts.Bar(document.getElementById('columnchart_material2'));

            chart.draw(data, google.charts.Bar.convertOptions(options));
        }

    }

    async function getMedalsPerCountry() {
        console.log('CALL: getGameMedals...');
        await ajaxHelper('http://192.168.160.58/Olympics/api/Statistics/Medals_Country', 'GET').done(function (data) {
            var _medalsPerCountry = [];
            for (var i = 0; i < data.length; i++) {
                _medalsPerCountry.push(
                    [
                        data[i].CountryName,
                        data[i].Medals[0].Counter,

                    ]);
            }
            self.medalsPerCountry(_medalsPerCountry);
        }
        );
    }

    function getMedalsPerCountryMap() {
        google.charts.load('current', {
            'packages': ['geochart'],
            'mapsApiKey': 'AIzaSyAmbTn72ufvozbfkH3Aa_ag_fcmFTnovXA'
        });
        google.charts.setOnLoadCallback(drawRegionsMap);

        function drawRegionsMap() {
            var _data = [['Country', 'Medals']]
            for (var i = 0; i < self.medalsPerCountry().length; i++) {
                _data.push(self.medalsPerCountry()[i]);
            }

            console.log("array=", _data)
            var data = google.visualization.arrayToDataTable(_data);

            var options = {
                chart: {
                    title: 'Gold medals per country',
                    subtitle: 'Every game'
                }
            };

            var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

            chart.draw(data, options);
        }

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

    self.activate = async function () {
        console.log('CALL: activate...');
        await getAthletesPerGame();
        getAthletesPerGameGraph();
        await getGameCompetitions();
        getGameCompetitionsGraph();
        await getMedalsPerCountry();
        getMedalsPerCountryMap();
    };

    function hideLoading() {
        console.log("hideLoading...");
        $("#myModal").on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }


    self.pesquisaGlobal = function () {
        console.log("pesquisa global...");
        console.log($("#searchbarglobal").val().toLowerCase());
        if ($("#searchbarglobal").val().toLowerCase().length > 0) {
            window.location.href = "globalSearch.html?q=" + $("#searchbarglobal").val().toLowerCase(); //+"&view="+self.view();
        }
    }

    //--- start ....
    showLoading();
    self.activate().then(hideLoading());
    console.log("VM initialized!");

};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());

});
