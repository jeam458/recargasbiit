angular.module('MyApp')
    .controller('LoginCtrl', function ($scope, $location, $auth, toastr) {
        $scope.login = function () {
            $auth.login($scope.user)
                .then(function () {
                    toastr.clear();
                    toastr.success('Ingreso correctamente');
                    $location.path('/dashboard/mytravels/upcoming');
                })
                .catch(function (response) {
                    toastr.clear();
                    toastr.error(response.data.message, response.status);
                });
        };
        $scope.authenticate = function (provider) {
            $auth.authenticate(provider)
                .then(function () {
                    toastr.clear();
                    toastr.success('usted ingreso como ' + provider);
                    $location.path('/dashboard/mytravels/upcoming');
                })
                .catch(function (response) {
                    toastr.clear();
                    toastr.error(response.data.message);
                });
        };
    });