var mongoose =require('mongoose');
var RecargaSchema=new mongoose.Schema({
  NroRecarga:Number,
  Proveedor:String,
  RUSProveedor:Number,
  DProveedor:Number,
  NProveedor:String,
  Vendedor:String,
  NVendedor:String,
  Cliente:String,
  DCliente:Number,
  NCliente:String,
  Nro:Number,
  Monto:Number,
  Pago:Number,
  Vuelto:Number,
  fecha: { type: Date, default: Date.now }
});
mongoose.model('Recargas',RecargaSchema);