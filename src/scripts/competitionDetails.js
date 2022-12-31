import { flagCodes } from './flagCodes.js';
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Games/FullDetails?id=');
    self.countrySumUri = ko.observable('http://192.168.160.58/Olympics/api/Statistics/Games_Countries');
    self.countryMedalsUri = ko.observable('http://192.168.160.58/Olympics/api/Statistics/Medals_Country?id=');
    self.displayName = 'Olympic Games edition Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.CountryName = ko.observable('');
    self.Logo = ko.observable('');
    self.Name = ko.observable('');
    self.Photo = ko.observable('');
    self.City = ko.observable('');
    self.Season = ko.observable('');
    self.Year = ko.observableArray('');
    self.Athletes = ko.observableArray([]);
    self.Modalities = ko.observableArray([]);
    self.Competitions = ko.observableArray([]);
    self.Medals = ko.observableArray([]);
    self.GoldMedals = ko.observable();
    self.SilverMedals = ko.observable();
    self.BronzeMedals = ko.observable();
    self.Url = ko.observable('');
    self.countriesSum = ko.observable();
    self.AthletesSum = ko.observable();
    self.topCountries = ko.observableArray([]);

    //--- Page Events
    self.activate = async function (id) {
        console.log('CALL: getGame...');
        var composedUri = self.baseUri() + id;
        await ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.Id(data.Id);
            self.CountryName(data.CountryName);
            self.Logo(data.Logo);
            self.Name(data.Name);
            self.City(data.City);
            self.Photo(data.Photo);
            self.Season(data.Season);
            self.Year(data.Year);
            self.Athletes(data.Athletes);
            self.Modalities(data.Modalities);
            self.Competitions(data.Competitions);
            self.Medals(data.Medals);
            self.GoldMedals(self.Medals()[0].Counter);
            self.SilverMedals(self.Medals()[1].Counter);
            self.BronzeMedals(self.Medals()[2].Counter);
            self.AthletesSum(self.Athletes().length);
        })
        await ajaxHelper(self.countrySumUri(), 'GET').done(function (data) {
            var counter = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].Name == self.Name()) {
                    counter = data[i].Counter;
                }
            }
            self.countriesSum(counter);
        })
        await ajaxHelper(self.countryMedalsUri() + self.Id(), 'GET').done(function (data) {
            console.log(data);
            var topCountries = [];
            for (var i = 0; i < data.length; i++) {
                var points = 0;
                for (var j = 0; j < data[i].Medals.length; j++) {
                    if (data[i].Medals[j].MedalName == "Gold") {
                        points += data[i].Medals[j].Counter * 3;
                    }
                    else if (data[i].Medals[j].MedalName == "Silver") {
                        points += data[i].Medals[j].Counter * 2;
                    }
                    else if (data[i].Medals[j].MedalName == "Bronze") {
                        points += data[i].Medals[j].Counter * 1;
                    }
                }
                topCountries.push({ Country: data[i].CountryName, Points: points, flagUrl: 'https://countryflagsapi.com/png/' + flagCodes[data[i].CountryName], GoldMedals: data[i].Medals[0].Counter, SilverMedals: data[i].Medals[1].Counter, BronzeMedals: data[i].Medals[2].Counter });
            }
            topCountries.sort(function (a, b) {
                return b.Points - a.Points;
            });
            var top3 = topCountries.slice(0, 3);
            self.topCountries(top3);
            console.log(top3);
        });
        hideLoading();
    };

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

    function showLoading() {
        $('#myModal').modal('show', {
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

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    //--- start ....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})