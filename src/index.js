var express = require('express')
var path = require('path')
var http = require('http')
var routes = require('./routes.js')
var githubController = require('./routes/github.js')
var config = require('../config.js')
var app = express()
var morgan = require('morgan')
var bodyParser = require('body-parser')

app.set('port', config.server.port)
app.use(morgan('combined'))
app.use(bodyParser.raw())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname + 'public')))

app.get('/', routes.index.index)
app.get('/favicon.ico', routes.index.favicon)
app.post('/github', githubController.create(config).post)

http.createServer(app).listen(app.get('port'), function () {
  console.log('Node-cd server listening on port ' + app.get('port'))
})
