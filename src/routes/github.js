var Netmask = require('netmask').Netmask
var config

function GitHub(conf) {
  config = conf
}

function create(conf) {
  return new GitHub(conf)
}

module.exports.create = create;

GitHub.prototype.post = function (req, res) {
  var authorizedIps = config.security.authorizedIps;
  var githubIps = config.security.githubIps;
  var payload = {
    key: req.body.key || req.query.key,
    ref: req.body.ref || req.query.ref
  };

  if (!payload) {
    console.log('No payload');
    res.writeHead(400);
    res.end();
    return;
  }

  if (!config.security.key) {
    console.log("No key is configured.  Please add a key and include it in the request");
    res.writeHead(500);
    res.end();
    return;
  }

  if (config.security.key && payload.key !== config.security.key) {
    console.log("You didn't say the magic word");
    res.writeHead(403);
    res.end();
    return;
  }

  var ipv4 = req.ip.replace('::ffff:', '');
  if (ipv4 !== "::1" && !(inAuthorizedSubnet(ipv4) || authorizedIps.indexOf(ipv4) >= 0 || githubIps.indexOf(ipv4) >= 0)) {
    console.log('Unauthorized IP:', req.ip, '(', ipv4, ')');
    res.writeHead(403);
    res.end();
    return;
  }

  if (payload.ref === config.repository.branch ||
    payload.ref === 'refs/heads/master' ||
    payload.ref === 'refs/heads/develop') {
    myExec(config.action.exec.github);
  }
  else {
    console.log(`No reference specified or unknown ref: ${payload.ref}`);
  }

  res.writeHead(200);
  res.end();
};

var inAuthorizedSubnet = function (ip) {
  var authorizedSubnet = config.security.githubAuthorizedSubnets.map(function (subnet) {
    return new Netmask(subnet)
  });
  return authorizedSubnet.some(function (subnet) {
    return subnet.contains(ip)
  })
};

var myExec = function (line) {
  var exec = require('child_process').exec
  var execCallback = function (error, stdout, stderror ) {
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