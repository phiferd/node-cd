const http = require('http')
const createHandler = require('github-webhook-handler')
const config = require('../config.js')
const handler = createHandler({ path: '/github', secret: config.security.key })

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(config.server.port)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)

  myExec(config.action.exec.github);
})

const myExec = function (line) {
  const exec = require('child_process').exec
  const execCallback = function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error)
    }
    else {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  };
  console.log("Running callback: " + line);
  exec(line, execCallback)
};