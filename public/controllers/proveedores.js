angular.module('MyApp')
    .factory('fProveedores', function($http) {
        var fProveedores = {};
        fProveedores.proveedores = [];
        fProveedores.proveedor = {};
        fProveedores.getAll = function() {
            return $http.get('/proveedores')
                .success(function(data) {
                    angular.copy(data, fProveedores.proveedores)
                    return fProveedores.proveedores
                })
        }
        fProveedores.add = function(proveedor) {
            return $http.post('/proveedor', proveedor)
                .success(function(cliente) {
                    fProveedores.proveedores.push(proveedor);
                })
        }

        fProveedores.update = function(proveedor) {
            return $http.put('proveedor/' + proveedor._id, proveedor)
                .success(function(data) {
                    var indice = fProveedores.proveedores.indexOf(proveedor)
                    fProveedores.proveedores[indice] = data;
                })
        }
        fProveedores.ModSaldo = function(proveedor) {
            return $http.put('proveedor1/' + proveedor._id, proveedor)
                .success(function(data) {
                    var indice = fProveedores.proveedores.indexOf(proveedor)
                    fProveedores.proveedores[indice] = data;
                })
        }
        fProveedores.delete = function(proveedor) {
            return $http.delete('/proveedor/' + proveedor._id)
                .success(function() {
                    var indice = fProveedores.proveedores.indexOf(proveedor)
                    fProveedores.proveedores.splice(indice, 1);
                })
        }
        return fProveedores;
    })

.controller('CtrlProveedor', function($scope, $state, fProveedores, toastr, $http) {
    $scope.encabezado = "";
    $scope.cabecera_proveedor = ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'RUS', 'Fecha', 'Editar', 'Eliminar'];
    $scope.proveedor = {};
    $scope.addProveedor = function() {
        fProveedores.add($scope.proveedor)
            .then(function(response) {
                $scope.isProfileLoading = true;
                toastr.clear();
                toastr.success('Proveedor agregado');
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.console.error(response.status, response.data.message);
            })
    }
    $scope.listProvedor = function() {
        fProveedores.getAll()
            .then(function(response) {
                $scope.isProfileLoading = true;
                $scope.proveedores = fProveedores.proveedores;
                $scope.isProfileLoading = false;
            })
            .finally(function() {

            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, reposne.status)
            })
    }
    $scope.updProveedor = function() {
        fProveedores.update($scope.proveedor)
            .then(function(response) {
                $scope.isProfileLoading = true;
                toastr.success('proveedor actualizado');
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, reponse.status)
            })
    }
    $scope.delProveedor = function(proveedor) {
        fProveedores.delete(proveedor)
            .then(function(reposne) {
                $scope.isProfileLoading = true;
                toastr.warning('proveedor Eliminado');
                $scope.isProfileLoading = false
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, reponse.status)
            })
    }

    $scope.actualizar = function(proveedor) {
        console.log(proveedor);
        $scope.proveedor = proveedor;
        $scope.booladd = false;
        $scope.boolupd = true;
        $scope.encabezado = 'Proveedor: ' + $scope.proveedor.Nombres;
    }

    $scope.agregar = function() {
        $scope.encabezado = 'Agregar Nuevo Proveedor';
        $scope.proveedor = {};
        $scope.booladd = true;
        $scope.boolupd = false;
    }
    $scope.listProvedor();

    $scope.personaa = function(dni) {
        if (dni != null) {
            var dnii = dni.toString();
            if (dnii.length == 8 && $scope.validate_pe_doc("1", dnii)) {
                $http.get('Dni/' + dni, dni).success(function(data) {
                    $scope.proveedor.Nombres = data.name;
                    $scope.proveedor.AP = data.paternal_surname;
                    $scope.proveedor.AM = data.maternal_surname;
                    $scope.proveedor.RUS = parseInt('10' + dni.toString() + data.check_digit);
                    $scope.proveedor.Lsuperior = 8000;

                })
            } else if (dnii.length == 0 || dnii.length < 8) {
                console.log("esperando")
                $scope.proveedor.Nombres = '';
                $scope.proveedor.AP = '';
                $scope.proveedor.AM = '';
                $scope.proveedor.RUS = '';
                $scope.proveedor.Lsuperior = '';
            }
        }
    }

    $scope.validate_pe_doc = function(doc_type, doc_number) {
        if (!doc_type || !doc_number) {
            toastr.warning("ingresar Nro de Ruc/Dni")
            return false;
        }
        if (doc_number.length == 8 && doc_type == '1') {
            toastr.success("Dni valido")
            return true;
        } else if (doc_number.length == 11 && doc_type == '6') {
            var vat = doc_number;
            var factor = '5432765432';
            var sum = 0;
            var dig_check = false;
            if (vat.length != 11) {
                toastr.warning("Ingrese un Ruc valido")
                return false;
            }
            try {
                parseInt(vat)
            } catch (err) {

                return false;
            }

            for (var i = 0; i < factor.length; i++) {
                sum += parseInt(factor[i]) * parseInt(vat[i]);
            }

            var subtraction = 11 - (sum % 11);
            if (subtraction == 10) {
                dig_check = 0;
            } else if (subtraction == 11) {
                dig_check = 1;
            } else {
                dig_check = subtraction;
            }

            if (parseInt(vat[10]) != dig_check) {
                toastr.warning("Ingrese un Ruc valido")
                return false;
            }
            toastr.success("Ruc valido")
            return true;
        } else {
            toastr.warning("Ruc/Dni no valido")
            return false;
        }
    }
})