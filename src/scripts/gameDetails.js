// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Games/FullDetails?id=');
    self.statsUri = ko.observable('http://192.168.160.58/Olympics/api/Statistics/Games_Countries');
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
    self.Url = ko.observable('');
    self.countriesSum = ko.observable();
    self.AthletesSum = ko.observable();

    //--- Page Events
    self.activate = async function (id) {
        console.log('CALL: getGame...');
        var composedUri = self.baseUri() + id;
        await ajaxHelper(composedUri, 'GET').done(function (data) {
            ajaxHelper(self.statsUri(), 'GET').done(function (data) {
                var counter = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].Name == self.Name()) {
                        counter = data[i].Counter;
                    }
                }
                self.countriesSum(counter);
            });
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
            self.AthletesSum(self.Athletes().length);
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