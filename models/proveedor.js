var mongoose =require('mongoose');
var ProveedorSchema=new mongoose.Schema({
    Documento:Number,
    Nombres:String,
    AP:String,
    AM:String,
    RUS:Number,
    Lsuperior:Number,
    Saldo:Number,
    fecha: { type: Date, default: Date.now }
});
mongoose.model('Proveedores',ProveedorSchema); 