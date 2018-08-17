//Declaração dos middlewares, API's, bibliotecas e caminhos de arquivos necessários 
//Express = framework web mvc RESTFull
const express = require('express');
//Instanciação do express
const app = express();
//Middleware de conexão com mysql
const mysql = require('mysql');
//Middleware de conexão com bancos 
const myConnection = require('express-myconnection');
//Arquivo de configuração de banco e servidor
const config = require('./config');
//View engine usada no projeto
const hbs = require('hbs');
//Middleware de identificação de caminhos do projeto
const path = require('path');
//Opções de configuração de banco
const dbOptions = {
	host: config.database.host, //Endereço do banco
	user: config.database.user, //Usuário
	password: config.database.password, //Senha
	port: config.database.port, //Porta
	database: config.database.db //Nome  
};
//Constante que aponta para pasta de rotas
const index = require('./routes/');
//Ferramenta de parsear itens que vem do request do usuário
const bodyParser = require('body-parser');
//Ferramenta de dar Override em metodos
const methodOverride = require('method-override');
//Para enviar objetos para página
const flash = require('express-flash');
//Parser de cookies 
const cookieParser = require('cookie-parser');
//Middleware de variáveis de sessão
const session = require('express-session');
//Middleware de redirecionar a rotas
const router = require('express-router');
//Ferramenta de validação back-end do express
const expressValidator = require('express-validator');
//Inicialização de componentes
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
	//Verificação de campos no código back end 
	req.assert('departament').notEmpty(); //Valida se campo está vazio e se é alfanumérico
	req.assert('unit').notEmpty(); //Valida se campo está vazio e se é alfanumérico
	req.assert('budget').notEmpty(); //Valida se campo está vazio
	req.assert('sendersName').notEmpty(); //Valida se campo está vazio e se é alfanumérico
	req.assert('authorizationSignature').notEmpty(); //Valida se campo está vazio e se é alfanumérico
	req.assert('descriptionOfItem').notEmpty(); //Valida se campo está vazio

	//Checa se erros aconteceram durante validação
	const errors = req.validationErrors();

	//Declaração de variável de "modelo"
	var fedexForm;
	//Instancia a variável com dados vindos do formulário

	fedexForm = {
		//Instancia uma data com o formato local
		date: new Date().toLocaleDateString(),
		//Sanitize é a função do validador para pegar os dados do form
		departamento: req.sanitize('departament').toString().toUpperCase(),
		unidade: req.sanitize('unit').toString().toUpperCase(),
		//toUpperCase() para deixar em maiúsculo (Para padronizar inserts no banco)
		descricao: req.sanitize('descriptionOfItem').toString().toUpperCase(),
		budget: req.sanitize('budget').toString().toUpperCase(),
		sendes_name: req.sanitize('sendersName').toString().toUpperCase(),
		autorizacao_assinatura: req.sanitize('authorizationSignature').toString().toUpperCase()
	};

	if (!errors) {
		//Se nenhum erro foi encontrado durante a validação, segue para insert no banco
		//Função de criar conexão
		req.getConnection(function (error, myConnection) {
			//Query de inserção de dados no banco
			myConnection.query("INSERT INTO cadastro SET ?", [fedexForm], function (err, result, fields) {
				//Se houver algum erro, ele captura e recarrega a página
				if (err) {
					throw err;
					req.flash('error', err);
					res.render('fedexform', {
						fedexForm
					});
				} else {
					//Se não houver erros, redireciona para página de impressão com os dados preenchidos 
					const lastId = result.insertId;
					res.render('fedexformPrint', {
						lastId: lastId,
						fedexForm: fedexForm
					});

				}
			});
		});
	} else {
		//Quando a verificação de back-end falha, ele recarrega a página com as informações que estão de acordo com as regras de negócio
		res.render('fedexform', {
			fedexForm,
			erro: true
		});
	}
});
//Exporta a variável com os dados de configuração
module.exports = app;
//Exporta variável de rotas
module.exports = router;