var express = require('express')
var app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({
    extended: true
}));

// SHOW inserir USER FORM
app.get('/inserir', function (req, res, next) {
    // render to views/user/inserir.ejs
    res.render('/fedexForm', {
        title: 'Fedex Authorization Form',
        departament: '',
        unit: '',
        budget: '',
        sendersName:'',
        authorizationSignature:'',
        descriptionOfItem:''
    })
})

module.exports = app