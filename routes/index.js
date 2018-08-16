var express = require('express')
var app = express()

app.get('/', function(req, res) {
    // render to views/index.ejs template file
    res.render('fedexform', {title: 'Fedex Authorization Form'})
})

module.exports = app;
