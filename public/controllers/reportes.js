angular.module('MyApp')
    .factory('Excel', function($window) {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64 = function(s) { return $window.btoa(unescape(encodeURIComponent(s))); },
            format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) };
        return {
            tableToExcel: function(tableId, worksheetName) {
                var table = $(tableId),
                    ctx = { worksheet: worksheetName, table: table.html() },
                    href = uri + base64(format(template, ctx));
                return href;
            }
        };
    })

.controller('CtrlReporte', function($scope, $state, $timeout, Account, fRecargas, fClientes, fProveedores, Excel, toastr, $http) {
    $scope.cabecera_reporte = ['Recarga', 'Proveedor', 'Cliente', 'Vendedor', 'Monto', 'Fecha'];
    $scope.mostrar = true;
    $scope.listRecargas = function() {
        Account.getProfile()
            .then(function(response) {
                $scope.user = response.data;

                if ($scope.user.tipo == "administrador") {
                    $scope.mostrar = true;
                } else if ($scope.user.tipo == "vendedor") {
                    $scope.mostrar = false;
                }
            })
        fProveedores.getAll()
            .then(function(response) {
                $scope.proveedores = fProveedores.proveedores;
                $scope.select_proveedor = {
                    availableOptions: $scope.proveedores
                }
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

    $scope.openFilterStart = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.startOpened = true;
    };
    $scope.openFilterEnd = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.endOpened = true;
    };

    $scope.actualizar = function(recarga) {
        console.log(recarga);
        $scope.recarga = recarga;
        $scope.booladd = false;
        $scope.boolupd = true;
        $scope.encabezado = 'Recarga: ' + $scope.recarga.NroRecarga;
    }

    $scope.listporfechas = function(inicio, fin, Proveedor) {
        if (inicio == undefined && fin == undefined) {
            var datos = { 'Proveedor': Proveedor }
            fRecargas.Proveedorr(datos).then(function(reposne) {
                $scope.isProfileLoading = true;
                $scope.recargas = fRecargas.recargas;
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.success("datos actualizados");
            })
        } else if (Proveedor == "") {
            fin.setHours(23);
            fin.setMinutes(59);
            var fechas = { 'startDate': inicio.toJSON(), 'endDate': fin.toJSON() }
            fRecargas.enfechas(fechas).then(function(response) {
                $scope.isProfileLoading = true;
                $scope.recargas = fRecargas.recargas;
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.success("datos actualizados");
            })
        } else if (inicio != undefined && fin != undefined && Proveedor != "") {
            fin.setHours(23);
            fin.setMinutes(59);
            var fechas = { 'startDate': inicio.toJSON(), 'endDate': fin.toJSON(), 'Proveedor': Proveedor }
            fRecargas.enfechas1(fechas).then(function(response) {
                $scope.isProfileLoading = true;
                $scope.recargas = fRecargas.recargas;
                $scope.isProfileLoading = false;
                toastr.clear();
                toastr.success("datos actualizados");
            })
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

    $scope.generarpdfTodo = function() {
        var prod = $scope.recargas;
        var doc = new jsPDF('l', 'pt');
        //img.src = '../../iconob.png';
        //doc.addImage(img.onload(), 'JPEG', 35, 10, 20, 20);

        doc.setFontSize(20);
        doc.text(40, 28, "RECARGAS BITEL")
        doc.setFontSize(10);
        doc.text(40, 40, "");
        if ($scope.startDate == undefined && $scope.endDate == undefined) {
            doc.text(40, 45, "FECHA:" + $scope.convertDate(Date.now()))
        } else if ($scope.startDate != undefined && $scope.endDate != undefined) {
            doc.text(40, 45, "DESDE:" + $scope.convertDate($scope.startDate.toJSON()));
            doc.text(150, 45, "HASTA:" + $scope.convertDate($scope.endDate.toJSON()));
        }
        doc.text(300, 45, "CANTIDAD DE RECARGAS: " + prod.length);
        var res = doc.autoTableHtmlToJson(document.getElementById("basic-table"));
        doc.autoTable(res.columns, res.data, {
            startY: 60
        });
        doc.save('RecargasBitel.pdf');
    }


    $scope.convertDate = function(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
    }

    $scope.exportToExcel = function(tableId) { // ex: '#my-table'
        var exportHref = Excel.tableToExcel(tableId, 'WireWorkbenchDataExport');
        $timeout(function() { location.href = exportHref; }, 100); // trigger download
    }



    $scope.listRecargas();
})