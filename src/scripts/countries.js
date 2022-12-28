// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Countries');

    self.displayName = 'Olympic Athletes List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGames...');
        console.log(self.totalRecords())
        var composedUri = self.baseUri() + "?page=1&pagesize="+self.totalRecords();//+"&sort=CountryName&dir=asc";
        ajaxHelper(composedUri, 'GET').done(function (data) {
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalRecords);
            //self.SetFavourites();
            var composedUri = self.baseUri() + "?page=1&pagesize="+self.totalRecords();//+"&sort=CountryName&dir=asc";
            ajaxHelper(composedUri, 'GET').done(function (data) {
                hideLoading();
                self.records(data.Records);
                console.log(data);
                
            });
        });
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
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})

$(document).ready(function () {
    var map = L.map("map").setView([40.6378, -8.6538], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    var marker = L.marker([40.6378, -8.6538]).addTo(map); // aveiro, teste
    function fetchJSON(url) {
        return fetch(url).then(function (response) {
            return response.json();
        });
    }

    paises = {};
    $.get("http://192.168.160.58/Olympics/api/Countries", function (data) {
        totalPaises = data.TotalRecords;
        $.get("http://192.168.160.58/Olympics/api/Countries?page=1&pagesize=" + totalPaises, function (data) {
            data.Records.forEach((pais) => {
                paises[pais.Name] = pais.Id;
            });
            var url = "countries.geojson";

            // var geojsonMarkerOptions = {
            //     radius: 6,
            //     opacity: 0.5,
            //     color: "red",
            //     fillColor: "blue",
            //     fillOpacity: 0.8,
            // };

            
            // função com a mensagem de quando se clica num país
            function forEachFeature(feature, layer) {

                var popupContent = "<p>Country: " + feature.properties.ADMIN + "</p><p>See more: <a href='countryDetails.html?id=" + paises[feature.properties.ADMIN] + "'>Here</a></p>";
                layer.bindPopup(popupContent);
            }

            var bbTeam = L.geoJSON(null, {
                onEachFeature: forEachFeature,
                // style: geojsonMarkerOptions,
                filter: filtro,
            });

            $.getJSON(url, function (data) {
                var properties = data.features.map(function (feature) {
                    return feature.properties;
                });

                console.log("Propriedades: ", properties);

                bbTeam.addData(data);
            });

            // o filtro verifica se o país está na lista de países da API
            function filtro(feature) {
                // console.log(paises)                
                // console.log(Object.keys(paises).includes(feature.properties.ADMIN))
                if (Object.keys(paises).includes(feature.properties.ADMIN)) return true;
            }

            bbTeam.addTo(map);
        });
    });
});

