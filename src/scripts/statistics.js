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

    async function getIOCs() {
        console.log('CALL: getIOC...');
        ajaxHelper('http://192.168.160.58/Olympics/api/Countries?page=1&pagesize=50', 'GET').done(function (data) {
            var _IOCs = [];
            for (var i = 0; i < data.Records.length; i++) {
                _IOCs.push(
                    {
                        name: data.Records[i].IOC,
                        countryName: data.Records[i].Name
                    });
            }
            console.log("IOC=", _IOCs);
            self.IOCs(_IOCs);
        });
    }

    async function getGames() {
        console.log('CALL: getGames...');

        ajaxHelper('http://192.168.160.58/Olympics/api/Games', 'GET').done(function (data) {
            var _games = [];
            for (var i = 0; i < data.Records.length; i++) {
                _games.push(
                    { 
                        name: data.Records[i].Name, 
                        id: data.Records[i].Id
                    });
            }
            self.games(_games);
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
        google.charts.load('current', {'packages':['bar']});
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
                else
                {
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

    async function getAthletesCountryGames() {
        console.log('CALL: getAthletesCountryGames...');
        self.loadingMap(true);
        var new_list = [];
        for (let i = 0; i < self.IOCs().length; i++) {
            await ajaxHelper('http://192.168.160.58/Olympics/api/Statistics/Athlete_Country?id=' + self.currentGame() + '&IOC=' + self.IOCs()[i].name, 'GET').done(function (data) {
            var _country = {
                    Country  : self.IOCs()[i].countryName,
                    count: data.length
                };
                console.log('http://192.168.160.58/Olympics/api/Statistics/Athlete_Country?id=' + self.currentGame() + '&IOC=' + self.IOCs()[i].name)
                new_list.push(_country);
            });
        }
        console.log("new_list=", new_list);
        self.athletesCountryGames(new_list);
        await getMap();
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
        self.currentGame('51');
        await getGames();
        await getAthletesPerGame();
        getAthletesPerGameGraph();


    };

    $('#collapseTwo').on('click', 'button', function () {
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
        $this.addClass('active-color').siblings().removeClass('active-color');
        $('#collapseTwo').collapse('hide');
        self.currentGame($this.attr('id'));
        console.log("currentGame=", self.currentGame());
    });

    async function getMap(){
        await google.charts.load('current', {
            'packages':['geochart'],
            'mapsApiKey': "AIzaSyAmbTn72ufvozbfkH3Aa_ag_fcmFTnovXA"
          });
          google.charts.setOnLoadCallback(drawRegionsMap);
    
          function drawRegionsMap() {
            var array = [['Country', 'Athletes']];
            for (let i = 0; i < self.athletesCountryGames().length; i++) {
                array.push([self.athletesCountryGames()[i].Country, self.athletesCountryGames()[i].count]);
            }
            var data = google.visualization.arrayToDataTable(array);
    
            var options = {};
            self.loadingMap(false);
            var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    
            chart.draw(data, options);
          }
    }
    


    self.pesquisaGlobal = function() {
        console.log("pesquisa global...");
        console.log($("#searchbarglobal").val().toLowerCase());
        if ($("#searchbarglobal").val().toLowerCase().length > 0) {
            window.location.href = "globalSearch.html?q=" + $("#searchbarglobal").val().toLowerCase(); //+"&view="+self.view();
        }
    }

    //--- start ....
    self.activate();
    console.log("VM initialized!");

};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());

});
