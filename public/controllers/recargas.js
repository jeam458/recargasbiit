angular.module('MyApp')
    .factory('fRecargas', function($http) {
        var fRecargas = {};
        fRecargas.recargas = [];
        fRecargas.recarga = {};
        fRecargas.getAll = function() {
            return $http.get('/recargas')
                .success(function(data) {
                    angular.copy(data, fRecargas.recargas)
                    return fRecargas.recargas
                })
        }
        fRecargas.enfechas = function(fechas) {
            return $http('recargasFechas/' + fechas.startDate + '/' + fechas.endDate, fechas).success(
                function(data) {
                    angular.copy(data, fRecargas.recargas)
                    return fRecargas.recargas;
                })
        }
        fRecargas.Proveedorr = function(datos) {
            return $http.get('recargasProveedor/' + datos.Proveedor, datos).success(
                function(data) {
                    angular.copy(data, fRecargas.recargas)
                    return fRecargas.recargas;
                }
            )
        }
        fRecargas.enfechas1 = function(fechas) {
            return $http.get('recargasFechas1/' + fechas.startDate + '/' + fechas.endDate + '/' + fechas.Proveedor, fechas).success(
                function(data) {
                    angular.copy(data, fRecargas.recargas)
                    return fRecargas.recargas;
                }
            )
        }
        fRecargas.add = function(recarga) {
            return $http.post('/recarga', recarga)
                .success(function(recarga) {
                    fRecargas.recargas.push(recarga);
                })
        }
        fRecargas.update = function(recarga) {
            return $http.put('recarga/' + recarga._id, recarga)
                .success(function(data) {
                    var indice = fRecargas.recargas.indexOf(recarga);
                    fRecargas.recargas[indice] = data;
                })
        }
        fRecargas.delete = function(recarga) {
            return $http.delete('/recarga/' + recarga._id)
                .success(function() {
                    var indice = fRecargas.recargas.indexOf(recarga);
                    fRecargas.recargas.splice(indice, 1);
                })
        }
        return fRecargas;
    })

.controller('CtrlRecargas', function($scope, $state, Account, fRecargas, fClientes, fProveedores, toastr, $http) {
    $scope.encabezado = '';
    $scope.cabecera_recarga = ['Recarga', 'Proveedor', 'Cliente', 'Vendedor', 'Monto', 'Fecha', 'Editar', 'Eliminar'];
    $scope.recarga = {};
    $scope.cliente = {};
    $scope.proveedor1 = {};
    $scope.saldot = 0;
    $scope.addRecarga = function() {
        $scope.recarga.NroRecarga = fRecargas.recargas.length + 1;
        fRecargas.add($scope.recarga)
            .then(function(response) {
                $scope.proveedor1.Saldo = $scope.saldot - $scope.recarga.Monto;
                fProveedores.ModSaldo($scope.proveedor1);
                $scope.isProfileLoading = true;
                $scope.listProvedor();
                toastr.clear();
                toastr.success('Recarga Emitida');
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.status, response.data.message);
            })
    }
    $scope.mostrar = true;
    $scope.select_proveedor = {
        availableOptions: fProveedores.proveedores
    }
    $scope.listRecargas = function() {
        Account.getProfile()
            .then(function(response) {
                $scope.user = response.data;

                $scope.recarga.Vendedor = $scope.user._id;
                $scope.recarga.NVendedor = $scope.user.nombres + ' ' + $scope.user.apellidos;
                if ($scope.user.tipo == "administrador") {
                    $scope.mostrar = true;
                } else if ($scope.user.tipo == "vendedor") {
                    $scope.mostrar = false;
                }
            })
        fProveedores.getAll()
            .then(function(response) {
                $scope.proveedores = fProveedores.proveedores;
            })
            .catch(function(response) {
                toastr.clear();
                toastr.error(response.data.message, response.status)
            })
        fClientes.getAll()
            .then(function(response) {
                $scope.clientes = fClientes.clientes;

            })
            .catch(function(response) {
                toastr.clear();
                toastr.error(response.data.message, response.status)
            })
        fRecargas.getAll()
            .then(function(response) {
                $scope.isProfileLoading = true;
                $scope.recargas = fRecargas.recargas;
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, reposne.status)
            })
    }
    $scope.updRecarga = function() {
        fRecargas.update($scope.recarga)
            .then(function(response) {
                $scope.isProfileLoading = true;
                toastr.success('recarga actualizada');
                $scope.isProfileLoading = false;
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, reponse.status)
            })
    }
    $scope.delRecarga = function(recarga) {
        fRecargas.delete(recarga)
            .then(function(reposne) {
                $scope.isProfileLoading = true;
                toastr.warning('Recarga Eliminada');
                $scope.isProfileLoading = false
            })
            .catch(function(response) {
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.error(response.data.message, reponse.status)
            })
    }

    $scope.actualizar = function(recarga) {
        console.log(recarga);
        $scope.recarga = recarga;
        $scope.booladd = false;
        $scope.boolupd = true;
        $scope.encabezado = 'Recarga: ' + $scope.recarga.NroRecarga;
    }

    $scope.agregar = function() {
        $scope.encabezado = 'Agregar Nueva Recarga';
        $scope.recarga = {};
        $scope.recarga.Vendedor = $scope.user._id;
        $scope.recarga.NVendedor = $scope.user.nombres + ' ' + $scope.user.apellidos;
        $scope.proveedorx();
        $scope.booladd = true;
        $scope.boolupd = false;
    }

    $scope.listRecargas();

    $scope.proveedorx = function() {
        var indice = $scope.generarRandom(0, $scope.proveedores.length - 1);
        console.log(indice);
        $scope.proveedor1 = $scope.proveedores[indice];
        $scope.saldot = $scope.proveedores[indice].Saldo;
        $scope.recarga.Proveedor = $scope.proveedores[indice]._id;
        $scope.recarga.RUSProveedor = $scope.proveedores[indice].RUS;
        $scope.recarga.DProveedor = $scope.proveedores[indice].Documento;
        $scope.recarga.NProveedor = $scope.proveedores[indice].Nombres + ' ' + $scope.proveedores[indice].AP + ' ' + $scope.proveedores[indice].AM;

    }

    $scope.generarRandom = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    $scope.buscarcliente = function(dni) {
        for (var index = 0; index < $scope.clientes.length; index++) {
            if (dni == $scope.clientes[index].Dni) {
                $scope.recarga.DCliente = $scope.clientes[index].Dni;
                $scope.recarga.NCliente = $scope.clientes[index].Nombre + ' ' + $scope.clientes[index].AP + ' ' + $scope.clientes[index].AM;
            }
        }
    }
    $scope.personaa = function(dni) {
        if (dni != null) {
            var dnii = dni.toString();
            if (dnii.length == 8 && $scope.validate_pe_doc("1", dnii)) {
                $scope.buscarcliente(dni);
                if ($scope.recarga.NCliente != '') {
                    toastr.clear();
                    toastr.success('Tenemos a: ' + $scope.recarga.NCliente)
                } else {
                    $http.get('Dni/' + dni, dni).success(function(data) {
                        $scope.recarga.DCliente = dni;
                        $scope.recarga.NCliente = data.name + ' ' + data.paternal_surname + ' ' + data.maternal_surname
                        $scope.cliente.tipo = 0;
                        $scope.cliente.Dni = dni;
                        $scope.cliente.Nombre = data.name;
                        $scope.cliente.AP = data.paternal_surname;
                        $scope.cliente.AM = data.maternal_surname;
                        $scope.cliente.RUC = parseInt('10' + dni.toString() + data.check_digit);
                        fClientes.add($scope.cliente)
                            .then(function(response) {
                                //$scope.isProfileLoading = true;
                                toastr.clear();
                                toastr.success('Cliente agregado');
                                //$scope.isProfileLoading = false;
                            })
                            .catch(function(response) {
                                //$scope.isProfileLoading = false;
                                toastr.clear();
                                toastr.console.error(response.status, response.data.message);
                            })
                    })
                }
            } else if (dnii.length == 0 || dnii.length < 8) {
                console.log("esperando")
                $scope.recarga.NCliente = '';
                $scope.cliente.Nombres = '';
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

    $scope.pagoo = function(pago) {
        if ($scope.recarga.Monto != '') {
            if ($scope.recarga.Monto <= $scope.recarga.Pago) {
                $scope.recarga.Vuelto = $scope.recarga.Pago - $scope.recarga.Monto;
                toastr.clear();
                toastr.success('El vuelto de la recarga es: ' + $scope.recarga.Vuelto + ' Soles');
            } else {
                toastr.clear();
                toastr.warning('Ingrese una cantidad mayor a la recarga');
                $scope.recarga.Vuelto = "";
            }

        } else {
            toastr.clear();
            toastr.warning('Ingrese primero el monto de la recarga');
            $scope.recarga.Vuelto = "";
        }
    }

    function getBase64Image(img) {

        var canvas = document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/jpeg");

        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

    }
    var img = new Image();

    img.onload = function() {
        var dataURI = getBase64Image(img);
        return dataURI;

    }

    $scope.generarpdf = function() {
        var prod = $scope.recarga;
        var doc = new jsPDF('p', 'mm', [80, 80]);
        //img.src = '../../iconob.png';
        //doc.addImage(img.onload(), 'JPEG', 10, 5, 55, 15);
        //doc.setFontSize(14);
        //doc.text(10, 30, "KUNAN 4G CUSCO S.R.L");
        doc.setFontSize(10);
        doc.text(5, 10, "CAB CENTRO DE ATENCION AL CLIENTE");
        doc.setFontSize(8);
        doc.text(15, 14, "CALLE AYACUCHO NRO 215")
        doc.text(15, 18, "CONSULTAS NRO 930186566")
        doc.text(25, 22, "RUS: " + prod.RUSProveedor);
        doc.text(25, 26, "Nro Recarga: " + prod.NroRecarga)
        doc.setFontSize(10);
        doc.text(10, 30, "COMPROBANTE DE PAGO");
        doc.setFontSize(8);
        doc.text(10, 34, "Fecha:" + prod.fecha);
        doc.text(10, 38, "Asesor de ventas: " + prod.NVendedor);
        doc.text(10, 42, "Cliente: " + prod.NCliente);
        doc.text(10, 46, "Dni: " + prod.DCliente);
        doc.text(40, 50, "Total a pagar: S/ " + prod.Monto);
        doc.setFontSize(14);
        doc.text(10, 56, "** Gracias por venir a Bitel **")
            //doc.text(400, doc.autoTableEndPosY() + 30, "TOTAL A PAGAR: " + prod.Monto)
        doc.save('recarga.pdf');
    }


})