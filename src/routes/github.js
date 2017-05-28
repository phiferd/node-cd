const Netmask = require('netmask').Netmask
const crypto = require('crypto');

let config

function GitHub(conf) {
  config = conf
}

function create(conf) {
  return new GitHub(conf)
}

module.exports.create = create;

GitHub.prototype.post = function (req, res) {
  const hmac = crypto.createHmac('sha1', config.security.key);
  const stringBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  console.log(`body: ${req.body}`);
  console.log(`stringBody: ${stringBody}`);
  console.log(`header: ${req.headers}`);
  console.log(`header2: ${JSON.stringify(req.headers)}`);

  hmac.update(req.body);
  const expectedSignature = Buffer.from("sha1=" + hmac.digest('hex'), 'utf8');
  const actualSignature = Buffer.from(req.headers["x-hub-signature"], 'utf8');

  console.log(`key: ${config.security.key}`);
  console.log(`body: ${stringBody}`);
  console.log(`signature: ${expectedSignature}`);
  console.log(`actual signature: ${actualSignature}`);

  const authorizedIps = config.security.authorizedIps;
  const githubIps = config.security.githubIps;
  const payload = JSON.parse(stringBody);

  if (!payload) {
    console.log('No payload');
    res.writeHead(400);
    res.end();
    return;
  }

  if (expectedSignature.length !== actualSignature.length || !crypto.timingSafeEqual(expectedSignature, actualSignature)) {
    console.log(`Payload signature doesn't match, payload=${JSON.stringify(payload)}, url: ${req.originalUrl}`);
    res.writeHead(403);
    res.end();
    return;
  }

  const ipv4 = req.ip.replace('::ffff:', '');
  if (ipv4 !== "::1" && !(inAuthorizedSubnet(ipv4) || authorizedIps.indexOf(ipv4) >= 0 || githubIps.indexOf(ipv4) >= 0)) {
    console.log('Unauthorized IP:', req.ip, '(', ipv4, ')');
    res.writeHead(403);
    res.end();
    return;
  }

  if (payload.ref === config.repository.branch) {
    myExec(config.action.exec.github);
  }
  else {
    console.log(`No reference specified or unknown ref: ${payload.ref}`);
  }

  res.writeHead(200);
  res.end();
};

const inAuthorizedSubnet = function (ip) {
  const authorizedSubnet = config.security.githubAuthorizedSubnets.map(function (subnet) {
    return new Netmask(subnet)
  });
  return authorizedSubnet.some(function (subnet) {
    return subnet.contains(ip)
  })
};

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