var path = require('path');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var colors = require('colors');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');

var config = require('./config');

var userSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    nombres: String,
    apellidos: String,
    tipo: String,
    fechaInscripcion: { type: Date, default: Date.now },
    celular: Number,
    picture: String
});

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (password, done) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

var User = mongoose.model('User', userSchema);
mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function (err) {
    console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

require('./models/cliente');
require('./models/proveedor');
require('./models/recarga');
require('./models/saldot');

var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
    app.use(function (req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
}
app.use(express.static(path.join(__dirname, '/public')));
app.use('/',routes);
app.use('/users', users);
/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
    }
    var token = req.headers.authorization.split(' ')[1];

    var payload = null;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    }
    catch (err) {
        return res.status(401).send({message: err.message});
    }

    if (payload.exp <= moment().unix()) {
        return res.status(401).send({message: 'Token has expired'});
    }
    req.user = payload.sub;
    next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        res.send(user);
    });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        if (!user) {
            return res.status(400).send({message: 'User not found'});
        }
        user.nombres = req.body.nombres || user.nombres;
        user.apellidos = req.body.apellidos || user.apellidos;
        user.tipo = req.body.tipo || user.tipo;
        user.picture = req.body.picture || user.picture;
        user.celular = req.body.celular || user.celular;
        user.email = req.body.email || user.email;
        user.save(function (err) {
            res.status(200).end();
        });
    });
});


/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function (req, res) {
    User.findOne({email: req.body.email}, '+password', function (err, user) {
        if (!user) {
            return res.status(401).send({message: 'error en la contraseña o usuario'});
        }
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({message: 'error en la contraseña o usuario'});
            }
            res.send({token: createJWT(user)});
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function (req, res) {
    User.findOne({email: req.body.email}, function (err, existingUser) {
        if (existingUser) {
            return res.status(409).send({message: 'Registrado correctamente'});
        }
        var user = new User({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            tipo: req.body.tipo,
            celular: req.body.celular,
            email: req.body.email,
            password: req.body.password
        });
        user.save(function () {
            res.send({token: createJWT(user)});
        });
    });
});



/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});