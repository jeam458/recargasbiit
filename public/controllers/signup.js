angular.module('MyApp')
    .controller('SignupCtrl', function ($scope, $location, $auth, toastr) {
        $scope.tipos=['administrador','vendedor'];
        $scope.signup = function () {
            $auth.signup($scope.user)
                .then(function () {
                    $location.path('/login');
                    toastr.clear();
                    toastr.info('Nueva cuenta creada correctamente');
                })
                .catch(function (response) {
                    toastr.clear();
                    toastr.error(response.data.message);
                });
        };
    });