var express = require('express');
var app = express();
var mysql = require('mysql');
var myConnection = require('express-myconnection');
var config = require('./config');
var hbs = require('hbs');
var path = require('path')

var dbOptions = {
	host: config.database.host, //database host
	user: config.database.user, //db user
	password: config.database.password, //db password
	port: config.database.port, //db port
	database: config.database.db //db name 
};

var index = require('./routes/');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = require('express-router');

app.use(myConnection(mysql, dbOptions, 'request'));

app.set('view engine', 'hbs');

app.use(expressValidator());

app.use(methodOverride(function (req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		var method = req.body._method
		delete req.body._method
		return method
	}
}));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(cookieParser('fedexForm'));

app.use(session({
	secret: 'fedexForm',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 60000
	}
}));

app.use(flash());

app.use('/', index);

app.listen(config.server.port, function () {
	console.log('Endereço em que o express está sendo executado: ' + config.server.host + ' | ' + 'Porta:' + config.server.port)
});

app.get('/inserir', function (req, res, next) {
	res.redirect('/');
});

// inserir NEW USER POST ACTION
app.post('/inserir', function (req, res, next) {
	req.assert('departament', "Campo 'DEPARTAMENT' necessário ").notEmpty().isAlpha(); //Validate departament
	req.assert('unit', "Campo 'UNIT' necessário ").notEmpty().isAlpha(); //Validate unit
	req.assert('budget', "Campo 'BUDGET' necessário ").notEmpty(); //Validate budget
	req.assert('sendersName', "Campo 'SENDER'S NAME' necessário ").notEmpty().isAlpha(); //Validate sender's name
	req.assert('authorizationSignature', "Campo 'AUTHORIZATION SIGNATURE' necessário ").notEmpty().isAlpha(); //Validate authorization signature
	req.assert('descriptionOfItem', "Campo 'DESCRIPTION OF ITEM' necessário ").notEmpty(); //Validate description of item

	var errors = req.validationErrors();
	var fedexForm;

	fedexForm = {
		date: new Date().toLocaleDateString(),
		departamento: req.sanitize('departament').trim().toUpperCase(),
		unidade: req.sanitize('unit').trim().toUpperCase(),
		descricao: req.sanitize('descriptionOfItem').trim().toUpperCase(),
		budget: req.sanitize('budget').trim().toUpperCase(),
		sendes_name: req.sanitize('sendersName').trim().toUpperCase(),
		autorizacao_assinatura: req.sanitize('authorizationSignature').trim().toUpperCase()
	};
	if (!errors) { //No errors were found.  Passed Validation!

		req.getConnection(function (error, myConnection) {
			myConnection.query("INSERT INTO cadastro SET ?", [fedexForm], function (err, result, rows) {
				if (err) {
					throw err;
					req.flash('error', err);
					res.render('fedexform', {
						title: 'Fedex Authorization Form',
						fedexForm
					});
				} else {
					var lastId = result.insertId;
					res.render('fedexformPrint', {
						lastId: lastId,
						fedexForm: fedexForm
					});
				}
			});
		});
	} else {
		res.render('fedexform', {
			title: 'Fedex Authorization Form',
			fedexForm
		});
	}
});
module.exports = app;
module.exports = router;