import { flagCodes } from './flagCodes.js';
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/games');
    //self.baseUri = ko.observable('http://localhost:62595/api/drivers');
    self.displayName = 'Olympic Games editions List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.favourites = ko.observableArray([]);
    self.years = ko.observableArray([]);
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
    self.toggleFavourite = function (id) {
        if (self.favourites.indexOf(id) == -1) {
            self.favourites.push(id);
        }
        else {
            self.favourites.remove(id);
        }
        localStorage.setItem("fav4", JSON.stringify(self.favourites()));
    };
    self.SetFavourites = function () {
        let storage;
        try {
            storage = JSON.parse(localStorage.getItem("fav4"));
        }
        catch (e) {
            ;
        }
        if (Array.isArray(storage)) {
            self.favourites(storage);
        }
    }
    self.view = ko.observable(getUrlParameter('view') ? getUrlParameter('view') : 'timeline');
    
    // Function to toggle the view
    self.toggleTable = function () {
        self.view('table');
    };
    self.toggleTimeline = function () {
        self.view('timeline');
    };


    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGames...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            hideLoading();
            self.records(data.Records);
            self.years(ko.computed(function () {
                var years = [];
                for (var i = 0; i < self.records().length; i++) {
                    // check if already exists on object with the name of the year
                    if (!years.filter(function (e) { return e.name == self.records()[i].Year; }).length > 0) {
                        console.log("Year=", self.records()[i].Year);
                        var year_s = {
                            name: self.records()[i].Year.toString(), games:
                                // get all games for that year
                                ko.utils.arrayFilter(self.records(), function (item) {
                                    return item.Year == self.records()[i].Year;
                                })
                        };
                        // for each game in year_s add a property with the country code
                        for (var j = 0; j < year_s.games.length; j++) {
                            year_s.games[j].flagUrl = 'https://countryflagsapi.com/png/' + flagCodes[year_s.games[j].CountryName];
                        }
                        years.push(year_s);
                    }
                }
                return years;
            }, self))
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalRecords);
            self.SetFavourites();

        });
    };

    self.activate2 = function (search, page) {
        console.log('CALL: searchCompetitions...');
        var composedUri = "http://192.168.160.58/Olympics/api/Games/SearchByName?q=" + search;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log("searchCompetitions", data);
            hideLoading();
            self.records(data.slice(0 + 21 * (page - 1), 21 * page));
            self.years(ko.computed(function () {
                var years = [];
                for (var i = 0; i < self.records().length; i++) {
                    // check if already exists on object with the name of the year
                    if (!years.filter(function (e) { return e.name == self.records()[i].Year; }).length > 0) {
                        console.log("Year=", self.records()[i].Year);
                        var year_s = {
                            name: self.records()[i].Year.toString(), games:
                                // get all games for that year
                                ko.utils.arrayFilter(self.records(), function (item) {
                                    return item.Year == self.records()[i].Year;
                                })
                        };
                        // for each game in year_s add a property with the country code
                        for (var j = 0; j < year_s.games.length; j++) {
                            year_s.games[j].flagUrl = 'https://countryflagsapi.com/png/' + flagCodes[year_s.games[j].CountryName];
                        }
                        years.push(year_s);
                    }
                }
                return years;
            }, self))
            self.totalRecords(data.length);
            self.currentPage(page);
            if (page == 1) {
                self.hasPrevious(false)
            } else {
                self.hasPrevious(true)
            }
            if (self.records() - 21 > 0) {
                self.hasNext(true)
            } else {
                self.hasNext(false)
            }
            if (Math.floor(self.totalRecords() / 21) == 0) {
                self.totalPages(1);
            } else {
                self.totalPages(Math.ceil(self.totalRecords() / 21));
            }
            self.SetFavourites();
            console.log(self.records()[0].Id)
            
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

    self.pesquisa = function() {
        console.log("pesquisar...");
        self.pesquisado($("#searchbar").val().toLowerCase());
        if (self.pesquisado().length > 0) {
            window.location.href = "games.html?search=" + self.pesquisado();
        }
        console.log(self.pesquisado())
    }

    self.pesquisaGlobal = function() {
        console.log("pesquisa global...");
        console.log($("#searchbarglobal").val().toLowerCase());
        if ($("#searchbarglobal").val().toLowerCase().length > 0) {
            window.location.href = "globalSearch.html?q=" + $("#searchbarglobal").val().toLowerCase(); //+"&view="+self.view();
        }
    }

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    self.pesquisado = ko.observable(getUrlParameter('search'));
    console.log(pg);
    if (self.pesquisado() == undefined || self.pesquisado() == "" || self.pesquisado() == null) {
        if (pg == undefined)
            self.activate(1);
        else {
            self.activate(pg);
        }
    }else {
        if (pg == undefined) self.activate2(self.pesquisado(), 1);
        else self.activate2(self.pesquisado(), pg)
        self.displayName = 'Found results for ' + self.pesquisado();
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

