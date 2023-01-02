var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    $('document').ready(function () {
        const carousel = new bootstrap.Carousel('#myCarousel', {
            interval: 10000
        })});

    this.pesquisaGlobal = function() {
        console.log("pesquisa global...");
        console.log($("#searchbarglobal").val().toLowerCase());
        if ($("#searchbarglobal").val().toLowerCase().length > 0) {
            window.location.href = "globalSearch.html?q=" + $("#searchbarglobal").val().toLowerCase(); //+"&view="+self.view();
        }
    }
}
$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    
});