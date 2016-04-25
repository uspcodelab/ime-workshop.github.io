var app = angular.module("workSite", ["flexcalendar", "ng-slide-down"]);

//CONFIG

app.config(function ($translateProvider) {
  $translateProvider.translations('pt', {
      JANUARY: 'Janeiro',
      FEBRUARY: 'Fevereiro',
      MARCH: 'Março',
      APRIL: 'Abril',
      MAI: 'Maio',
      JUNE: 'Junho',
      JULY: 'Julho',
      AUGUST: 'Agosto',
      SEPTEMBER: 'Setembro',
      OCTOBER: 'Outubro',
      NOVEMBER: 'Novembro',
      DECEMBER: 'Dezembro',

      SUNDAY: 'Domingo',
      MONDAY: 'Segunda',
      TUESDAY: 'Terça',
      WEDNESDAY: 'Quarta',
      THURSDAY: 'Quinta',
      FRIDAY: 'Sexta',
      SATURDAY: 'Sábado'
  });
  $translateProvider.preferredLanguage('pt');
});

//CONTROLLERS

app.controller("proxCtrl", function($scope, fetchEventos, colorService) {

    moment.locale("pt-br");
    $scope.getIcon = colorService.getIcon;
    $scope.getColor = colorService.getColor;
    $scope.listevents = [];
    $scope.showingNext = true;
    $scope.curdate = null;

    //opções do flex-calendar
    $scope.options = {
        minDate: "2016-01-01",
        maxDate: "2019-12-31",
        dateClick: function(date) { // called every time a day is clicked
          $scope.showingNext = false;
          $scope.listevents = date.event;
          $scope.curdate = moment(date.date).format("LL");
        }
    };

    $scope.showNext = function() {
        $scope.showingNext = true;
        $scope.listevents = $scope.nextevents;
    }

    //Carregar eventos
    fetchEventos.fetchTudo().then(function(data) {
        var events = [];
        // o flex-calendar exige preparação: um atributo chamado date, padrão YYYY-MM-DD
        // e ainda por cima tem um bug que as datas aparecem um dia antes do correto
        for (var x in data) {
            var evento = data[x];
            evento.date = moment(evento.data, "DD/MM/YYYY").add(1, "days").format("YYYY-MM-DD");
            evento.eventClass = colorService.getEventColor(evento.classe);
            events.push(evento);
        }
        $scope.events = events;
    });

    fetchEventos.fetchFuturos().then(function(data) {
        $scope.nextevents = data;
        $scope.listevents = data;
    });
});

app.controller("candiCtrl", function($scope, formService) {
    console.log($scope);
    $scope.form = {};
    $scope.showingForm = false;
    $scope.showingError = false;
    $scope.showingSubmitted = false;
    $scope.submitForm = function() {
        if(!$scope.form.nome && !$scope.form.email && !$scope.form.assunto && !$scope.form.detalhes)
            $scope.showingError = true;
        else {
            $scope.showingError = false;
            var data = { nome: "jose", assunto: "banana"};
            formService.sendForm(data).then(function(){
                alert("ok");
            });
        }
    }
});

app.controller("pedirCtrl", function($scope) {
    $scope.showingForm = false;
});

app.controller("listaCtrl", function($scope, fetchEventos, colorService){
    fetchEventos.fetchLista().then(function(data) {

        $scope.events = data;
    });

    $scope.getColor = colorService.getColor;
    $scope.getBackColor = colorService.getBackColor;

    $scope.makeModal = function(evento) {
        $scope.curvento = evento;
    }
});

//SERVICES

app.service("fetchEventos", function($http, $q) {
    this.fetchLista = function() {
        var deferred = $q.defer();
        $http.get("events.json").then(function(data) {
            var lista = [];
            for (var x in data.data) {
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
        $http.get("events.json").then(function(data) {
            var lista = [];
            for (var x in data.data) {
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
        $http.get("events.json").then(function(data) {
            deferred.resolve(data.data);
        });
        return deferred.promise;
    }
});

app.service("colorService", function() {
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

    this.getIcon = function(classe) {
        switch(classe) {
            case "nubank":
                return "fa-credit-card";
            case "hardware":
                return "fa-gears";
            case "gamedev":
                return "fa-gamepad";
            default:
                return "fa-lightbulb-o"; //classe falsa, não existe
        }
    }
});

app.service("formService", function($http, $q) {
    this.sendForm = function(data) {
        var deferred = $q.defer();
        $http({
            url: "http://formspree.io/email@example.org",
            data: data,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function(){
            deferred.resolve();
        });
        return deferred.promise;
    }
});
