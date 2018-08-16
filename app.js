const express = require('express');
const app = express();
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const config = require('./config');
const hbs = require('hbs');
const path = require('path')
const dbOptions = {
	host: config.database.host, //database host
	user: config.database.user, //db user
	password: config.database.password, //db password
	port: config.database.port, //db port
	database: config.database.db //db name 
};
const index = require('./routes/');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const router = require('express-router');

app.use(myConnection(mysql, dbOptions, 'request'));
app.use(expressValidator());
app.use(methodOverride(function (req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		const method = req.body._method
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
app.set('view engine', 'hbs');
app.listen(config.server.port, function () {
	console.log('Endereço em que o express está sendo executado: ' + config.server.host + ' | ' + 'Porta:' + config.server.port)
});
app.get('/inserir', function (req, res, next) {
	res.redirect('/');
});
app.post('/inserir', function (req, res, next) {

	req.check('departament').notEmpty().isAlpha(); //Validate departament
	req.check('unit').notEmpty().isAlpha(); //Validate unit
	req.check('budget').notEmpty(); //Validate budget
	req.check('sendersName').notEmpty().isAlpha(); //Validate sender's name
	req.check('authorizationSignature').notEmpty().isAlpha(); //Validate authorization signature
	req.check('descriptionOfItem').notEmpty(); //Validate description of item

	const errors = req.validationErrors();
	var fedexForm;

	fedexForm = {
		date: new Date().toLocaleDateString(),
		departamento: req.sanitize('departament').trim().toUpperCase(),
		unidade: req.sanitize('unit').trim().toUpperCase(),
		descricao: req.sanitize('descriptionOfItem').trim().toUpperCase(),
		budget: req.sanitize('budget'),
		sendes_name: req.sanitize('sendersName'),
		autorizacao_assinatura: req.sanitize('authorizationSignature').trim().toUpperCase()
	};
	if (!errors) { //No errors were found.  Passed Validation!

		req.getConnection(function (error, myConnection) {
			myConnection.query("INSERT INTO cadastro SET ?", [fedexForm], function (err, result, rows) {
				if (err) {
					throw err;
					req.flash('error', err);
					res.render('fedexform', {
						fedexForm
					});
				} else {
					const lastId = result.insertId;
					res.render('fedexformPrint', {
						lastId: lastId,
						fedexForm: fedexForm
					});
				}
			});
		});
	} else {
		res.render('fedexform', {
			fedexForm
		});
	}
});
module.exports = app;
module.exports = router;