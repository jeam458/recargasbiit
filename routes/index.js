var express = require('express');
var Request = require('request');
var router = express.Router();

var multiparty = require('connect-multiparty')();
var fs = require('fs');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' })
})

var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');

var Clientes = mongoose.model('Clientes');
var Proveedores = mongoose.model('Proveedores');
var Recargas = mongoose.model('Recargas');


//servicios externos
router.get('/Dni/:dni', function(req, res) {
    Request.get("http://api.grupoyacck.com/dni/" + req.params.dni, function(error, response, body) {
        if (error) { res.send(error) }
        //console.log(body)
        var retornar = JSON.parse(body);
        res.json(retornar);
    })
})
router.get('/Ruc/:ruc', function(req, res) {
    //console.log(req.params.ruc)
    Request.get("http://api.grupoyacck.com/ruc/" + req.params.ruc + "/?force_update=1", function(error, response, body) {
        if (error) { res.send(error) }
        var retornar = JSON.parse(body);
        res.json(retornar);
    })
})

//get
router.get('/clientes', function(req, res, next) {
    Clientes.find(function(err, clientes) {
        if (err) { return next(err) }
        res.json(clientes);
    })
})

router.get('/proveedores', function(req, res, next) {
    Proveedores.find(function(err, proveedores) {
        if (err) { return next(err) }
        res.json(proveedores);
    })
})

router.get('/recargas', function(req, res, next) {
    Recargas.find(function(err, recargas) {
        if (err) { return next(err) }
        res.json(recargas);
    })
})

router.get('/recargasProveedor/:Proveedor',function(req,res,next){
    Recargas.find({Proveedor:req.params.Proveedor},function(err,recargas){
        if(err){return next(err)}
        res.json(recargas);
    })
})
router.get('/recargasVendedor/:Vendedor',function(req,res,next){
    Recargas.find({Vendedor:req.params.Vendedor},function(err,recargas){
        if(err){return next(err)}
        res.json(recargas);
    })
})

router.get('/recargasProveedorVentas/:Proveedor/:Vendedor',function(req,res,next){
    Recargas.find({Proveedor:req.params.Proveedor,Vendedor:req.params.Vendedor},function(err,recargas){
        if(err){return next(err)}
        res.json(recargas);
    })
})

router.get('/recargasFechas/:startDate/:endDate', function(req, res, next) {
    //console.log(req.params);
    Recargas.find({ fecha: { $gte: req.params.startDate, $lte: req.params.endDate } }, function(err, recargas) {
        if (err) { return next(err) }
        res.json(recargas)
    })
})

router.get('/recargasFechas1/:startDate/:endDate/:Proveedor', function(req, res, next) {
    //console.log(req.params);
    Recargas.find({ fecha: { $gte: req.params.startDate, $lte: req.params.endDate }, Proveedor: req.params.Proveedor }, function(err, recargas) {
        if (err) { return next(err) }
        res.json(recargas)
    })
})
router.get('/recargasFechas2/:startDate/:endDate/:Vendedor', function(req, res, next) {
    //console.log(req.params);
    Recargas.find({ fecha: { $gte: req.params.startDate, $lte: req.params.endDate }, Vendedor: req.params.Vendedor }, function(err, recargas) {
        if (err) { return next(err) }
        res.json(recargas)
    })
})

router.get('/recargasFechas3/:startDate/:endDate/:Vendedor/:Proveedor', function(req, res, next) {
    //console.log(req.params);
    Recargas.find({ fecha: { $gte: req.params.startDate, $lte: req.params.endDate }, Vendedor: req.params.Vendedor, Proveedor: req.params.Proveedor }, function(err, recargas) {
        if (err) { return next(err) }
        res.json(recargas)
    })
})


//post
router.post('/cliente', function(req, res, next) {
    var cliente = new Clientes(req.body);
    cliente.save(function(err, cliente) {
        if (err) { return next(err) }
        res.json(cliente);
    })
})

router.post('/proveedor', function(req, res, next) {
    var proveedor = new Proveedores(req.body);
    proveedor.save(function(err, proveedor) {
        if (err) { return next(err) }
        res.json(proveedor);
    })
})

router.post('/recarga', function(req, res, next) {
    var recarga = new Recargas(req.body);
    recarga.save(function(err, recarga) {
        if (err) { return next(err) }
        res.json(recarga);
    })
})

//put
router.put('/cliente/:id', function(req, res) {
    Clientes.findById(req.params.id, function(err, cliente) {
        cliente.Tipo = req.body.Tipo;
        cliente.Dni = req.body.Dni;
        cliente.Ruc = req.body.Ruc;
        cliente.Nombre = req.body.Nombre;
        cliente.AP = req.body.AP;
        cliente.AM = req.body.AM;
        cliente.Gerente = req.body.Gerente;
        cliente.Direccion = req.body.Direccion;
        cliente.Referencia = req.body.Referencia;
        cliente.Correo = req.body.Correo;
        cliente.Celular = req.body.Celular;
        cliente.Telefono = req.body.Telefono;
        cliente.Telefono1 = req.body.Telefono1;
        cliente.save(function(err) {
            if (err) { res.send(err) }
            res.json(cliente);
        })
    })
})

router.put('/proveedor/:id', function(req, res) {
    Proveedores.findById(req.params.id, function(err, proveedor) {
        proveedor.Documento = req.body.Documento;
        proveedor.Nombres = req.body.Nombres;
        proveedor.AP = req.body.AP;
        proveedor.AM = req.body.AM;
        proveedor.RUS = req.body.RUS;
        proveedor.Lsuperior = req.body.Lsuperior;
        proveedor.Saldo = req.body.Saldo;
        proveedor.save(function(err) {
            if (err) { res.send(err) }
            res.json(proveedor);
        })
    })
})

router.put('/proveedor1/:id', function(req, res) {
    Proveedores.findById(req.params.id, function(err, proveedor) {
        proveedor.Saldo = req.body.Saldo;
        proveedor.save(function(err) {
            if (err) { res.send(err) }
            res.json(proveedor);
        })
    })
})

router.put('/recarga/:id', function(req, res) {
    Recargas.findById(req.params.id, function(err, recarga) {
        recarga.NroRecarga = req.params.NroRecarga;
        recarga.Proveedor = req.params.Proveedor;
        recarga.RUSProveedor = req.params.RUSProveedor;
        recarga.DProveedor = req.params.DProveedor;
        recarga.NProveedor = req.params.NProveedor;
        recarga.Vendedor = req.params.DVendedor;
        recarga.NVendedor = req.params.NVendedor;
        recarga.Cliente = req.params.Cliente;
        recarga.DCliente = req.params.DCliente;
        recarga.NCliente = req.params.NCliente;
        recarga.Nro = req.params.Nro;
        recarga.Monto = req.params.Monto;
        recarga.Pago = req.params.Pago;
        recarga.Vuelto = req.params.Vuelto;
        recarga.save(function(err) {
            if (err) { res.send(err) }
            res.json(recarga);
        })
    })
})

//delete
router.delete('/cliente/:id', function(req, res) {
    Clientes.findByIdAndRemove(req.params.id, function(err) {
        if (err) { res.send(err) }
        res.json({ message: 'el cliente fue eliminado' })
    })
})

router.delete('/proveedor/:id', function(req, res) {
    Proveedores.findByIdAndRemove(req.params.id, function(err) {
        if (err) { res.send(err) }
        res.json({ message: 'el proveedor fue eliminado' })
    })
})

router.delete('/recarga/:id', function(req, res) {
    Recargas.findByIdAndRemove(req.params.id, function(err) {
        if (err) { res.send(err) }
        res.json({ message: 'la recarga fue eliminada' })
    })
})


//export router
module.exports = router;