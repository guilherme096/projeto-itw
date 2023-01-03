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
        await ajaxHelper('http://192.168.160.58/Olympics/api/Countries', 'GET').done(function (data) {
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

        await ajaxHelper('http://192.168.160.58/Olympics/api/Games', 'GET').done(function (data) {
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
                new_list.push(_country);
            });
        }
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
        await getIOCs();
        await getAthletesCountryGames();

    };

    $('#collapseTwo').on('click', 'button', function () {
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
        $this.addClass('active-color').siblings().removeClass('active-color');
        $('#collapseTwo').collapse('hide');
        self.currentGame($this.attr('id'));
        console.log("currentGame=", self.currentGame());
        getAthletesCountryGames();
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
