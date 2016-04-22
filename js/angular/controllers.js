var app = angular.module("workSite", ["flexcalendar"]);

//CONTROLLERS

app.controller("proxCtrl", function($scope, fetchEventos, colorService){
    $scope.options = {
        minDate: "2016-01-01",
        maxDate: "2019-12-31",
        eventClick: function(date) { // called before dateClick and only if clicked day has events
          console.log(date);
        },
        dateClick: function(date) { // called every time a day is clicked
          console.log(date);
        }
    };
    fetchEventos.fetchTudo().then(function(data){
        var events = [];
        // o flex-calendar exige preparação: um atributo chamado date, padrão YYYY-MM-DD
        // e ainda por cima tem um bug que as datas aparecem um dia antes do correto
        for(var x in data) {
            var evento = data[x];
            evento.date = moment(evento.data, "DD/MM/YYYY").add(1, "days").format("YYYY-MM-DD");
            evento.eventClass = colorService.getEventColor(evento.classe);
            events.push(evento);
        }
        $scope.events = events;
    });
});

app.controller("listaCtrl", function($scope, fetchEventos, colorService){
    fetchEventos.fetchLista().then(function(data){
        $scope.events = data;
    });

    $scope.getColor = colorService.getColor;
    $scope.getBackColor = colorService.getBackColor;

    $scope.makeModal = function(evento) {
        $scope.curvento = evento;
    }
});

//SERVICES

app.service("fetchEventos", function($http, $q){
    this.fetchLista = function() {
        var deferred = $q.defer();
        $http.get("eventos.json").then(function(data){
            var lista = [];
            for(var x in data.data) {
                var evento = data.data[x];
                if(moment(evento.data, "DD/MM/YYYY").isBefore(moment(), "day")) {
                    lista.push(evento);
                }
            }
            deferred.resolve(lista);
        });
        return deferred.promise;
    }

    this.fetchFuturos = function() {
        var deferred = $q.defer();
        $http.get("eventos.json").then(function(data){
            var lista = [];
            for(var x in data.data) {
                var evento = data.data[x];
                if(moment(evento.data, "DD/MM/YYYY").isSameOrAfter(moment(), "day")) {
                    lista.push(evento);
                }
            }
            deferred.resolve(lista);
        });
        return deferred.promise;
    }

    this.fetchTudo = function() {
        var deferred = $q.defer();
        $http.get("eventos.json").then(function(data){
            deferred.resolve(data.data);
        });
        return deferred.promise;
    }
});

app.service("colorService", function(){
    this.getColor = function(classe) {
        switch(classe) {
            case "nubank":
                return "purple";
            case "hardware":
                return "teal";
            case "gamedev":
                return "orange";
            default:
                return "def"; //classe falsa, não existe
        }
    }

    this.getBackColor = function(classe) {
        return this.getColor(classe)+"-back";
    }

    this.getEventColor = function(classe) {
        return this.getColor(classe)+"-event";
    }
});