var app = angular.module("workSite", []);

//CONTROLLERS

app.controller("listaCtrl", function($scope, fetchEventos){
    fetchEventos.fetchLista().then(function(data){
        $scope.eventos = data;
    });

    $scope.getColor = function(classe) {
        switch(classe) {
            case "nubank":
                return "purple";
            case "hardware":
                return "blue";
            case "gamedev":
                return "orange";
            default:
                return "def"; //classe falsa, não existe
        }
    }

    $scope.getBackColor = function(classe) {
        return $scope.getColor(classe)+"-back";
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
});