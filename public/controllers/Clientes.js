angular.module('MyApp')
    .factory('fClientes', function($http) {
        var fClientes = {};
        fClientes.clientes = [];
        fClientes.cliente = {};
        /*** Servicio de mongo ***/
        fClientes.getAll = function() {
            return $http.get('/clientes')
                .success(function(data) {
                    angular.copy(data, fClientes.clientes)
                    return fClientes.clientes;
                })
        }

        fClientes.add = function(cliente) {
            return $http.post('/cliente', cliente)
                .success(function(cliente) {
                    fClientes.clientes.push(cliente);
                })
        }

        fClientes.update = function(cliente) {
            return $http.put('cliente/' + cliente._id, cliente)
                .success(function(data) {
                    var indice = fClientes.clientes.indexOf(cliente);
                    fClientes.clientes[indice] = data;
                })
        }

        fClientes.delete = function(cliente) {
            return $http.delete('/cliente/' + cliente._id)
                .success(function() {
                    var indice = fClientes.clientes.indexOf(cliente);
                    fClientes.clientes.splice(indice, 1);
                })
        }

        return fClientes;
    })

.controller('CtrlCliente', function($scope, $state, fClientes, toastr, $http) {
    $scope.encabezado = "";
    $scope.tipo_persona = {
        availableOptions: [
            { id: '0', name: 'Natural' },
            { id: '1', name: 'Jurídica' },
            { id: '2', name: 'Natural con RUC' }
        ],
        selectedOption: { id: '0', name: 'Natural' } //This sets the default value of the select in the ui
    };

    $scope.cabecera_cliente = ['RUC/DNI', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Tipo', 'Fecha', 'Editar', 'Eliminar'];
    $scope.cliente = [];
    $scope.cliente.tipo = $scope.tipo_persona.selectedOption.id;
    $scope.addCliente = function() {
        $scope.cliente.tipo = parseInt($scope.tipo_persona.selectedOption.id);
        console.log($scope.cliente);
        fClientes.add($scope.cliente)
            .then(function(response) {
                $scope.isProfileLoading = true;
                toastr.clear();
                toastr.success('Cliente agregado');
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                //toastr.error(response.data.message, response.status);
                toastr.error(response.status, response.data.message);
            });
    };
    $scope.listCliente = function() {
        fClientes.getAll()
            .then(function(response) {
                $scope.isProfileLoading = true;
                $scope.clientes = fClientes.clientes;
                $scope.isProfileLoading = false;
            })
            .finally(function() {

            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, response.status);
            });
    };
    $scope.updCliente = function() {
        fClientes.update($scope.cliente)
            .then(function(response) {
                $scope.isProfileLoading = true;
                toastr.success('Cliente Actualizado');
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, response.status);
            });
    };
    $scope.delCliente = function(cliente) {
        console.log(cliente);
        fClientes.delete(cliente)
            .then(function(response) {
                $scope.isProfileLoading = true;
                toastr.warning('Cliente Eliminado');
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, response.status);
            });
    };
    // funcionde angular
    $scope.actualizar = function(cliente) {
        $scope.cliente = cliente;
        console.log($scope.cliente);
        $scope.tipo_persona.selectedOption = $scope.tipo_persona.availableOptions[cliente.tipo];
        $scope.changeCliente();
        $scope.booladd = false;
        $scope.boolupd = true;
        $scope.encabezado = "Cliente: " + $scope.cliente.Nombre;
    };
    $scope.agregar = function() {
        $scope.encabezado = "Agregar Nuevo Cliente";
        $scope.tipo_persona.selectedOption = { id: '0', name: 'Natural' };
        $scope.cliente = {};
        $scope.changeCliente();
        $scope.boolupd = false;
        $scope.booladd = true;
    };
    $scope.changeCliente = function() {
        if ($scope.tipo_persona.selectedOption.id == 1) {
            $scope.fEmpresa = true;
            $scope.fPersona = false;
            $scope.fConRuc = false;
            $scope.cliente.AP = "";
            $scope.cliente.AM = "";
        } else if ($scope.tipo_persona.selectedOption.id == 2) {
            $scope.fEmpresa = false;
            $scope.fPersona = true;
            $scope.fConRuc = true;
            //$scope.cliente.AP = "";
            //$scope.cliente.AM = "";
        } else {
            $scope.fEmpresa = false;
            $scope.fPersona = true;
            $scope.fConRuc = false;
        }
    };

    $scope.listCliente();


    $scope.personaa = function(dni) {
        if (dni != null) {
            var dnii = dni.toString();
            if (dnii.length == 8 && $scope.validate_pe_doc("1", dnii)) {
                $http.get('Dni/' + dni, dni).success(function(data) {
                    if (data.name == "" && data.paternal_surname == "") {
                        toastr.clear();
                        toastr.warning('los datos de la persona no existen registre cliente porfavor!!');
                    } else {
                        $scope.cliente.Nombre = data.name;
                        $scope.cliente.AP = data.paternal_surname;
                        $scope.cliente.AM = data.maternal_surname;
                        if (parseInt($scope.tipo_persona.selectedOption.id) == 2) {
                            $scope.cliente.Ruc = parseInt('10' + dni.toString() + data.check_digit);
                            //console.log($scope.cliente.Ruc)
                        } else if (parseInt($scope.tipo_persona.selectedOption.id) == 0) {
                            $scope.cliente.Ruc = null;
                        }
                    }
                })
            } else if (dnii.length == 0 || dnii.length < 8) {
                console.log("esperando")
                $scope.cliente.Nombre = '';
                $scope.cliente.AP = '';
                $scope.cliente.AM = '';
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

    $scope.juridico = function(ruc) {
        if (ruc != null) {
            var rucc = ruc.toString();
            //$scope.validate_pe_doc("6", rucc);
            if (rucc.length == 11 && $scope.validate_pe_doc("6", rucc)) {
                $http.get('Ruc/' + ruc, ruc).success(function(data) {
                    console.log(data);
                    $scope.cliente.Nombre = data.name;
                    $scope.cliente.Gerente = data.representatives[0].name;
                    $scope.cliente.Direccion = data.street;
                    if (parseInt($scope.tipo_persona.selectedOption.id) == 1) {
                        $scope.cliente.AP = null;
                        $scope.cliente.AM = null;
                    }
                })
            } else if (rucc.length == 0 || rucc.length < 11) {
                console.log("esperando")
                $scope.cliente.Nombre = '';
                $scope.cliente.Gerente = '';
                $scope.cliente.Direccion = '';
            }
        }
    }


});