var mongoose =require('mongoose');
var SaldotSchema=new mongoose.Schema({
    Sucursal:String,
    SaldoTotal:Number,
    NroRUS:Number,
    fecha: { type: Date, default: Date.now }
});
mongoose.model('Saldos',SaldotSchema);