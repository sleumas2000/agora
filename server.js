'use strict';

var express    = require('express')
var bodyParser = require('body-parser')
var morgan     = require('morgan')
var mysql      = require('mysql')

var connection = mysql.createConnection({
  host     : 'localhost'
  user     : 'agora'
  password : '@~fIazR*'
  database : 'agora'
});

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))

var PORT = 24672;

app.get('/', function(req, res){
  res.json({message: 'Hooray! Welcome to the example API!'})
})
