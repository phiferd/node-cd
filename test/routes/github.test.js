const test = require('tape').test
const githubController = require('../../src/routes/github.js')

test('The GitHub endpoint with authorized IP should return 200', (assert) => {
  const github = githubController.create({
    security: {
      authorizedIps: ['1.2.3.4'],
      githubAuthorizedSubnets: [],
      githubIps: [],
      key: "test"
    },
    repository: {
      branch: 'master'
    }
  })

  const req = {
    ip: '1.2.3.4',
    body: {'dummy': true, key: "test"},
    query: {},
    headers: { "X-Hub-Signature": "sha1=841dc412af57dd01f144be678973276a96031ad0"}
  }
  const res = {}
  let code;

  res.writeHead = function (statusCode) {
    code = statusCode
  }

  res.end = function () {
    assert.equal(code, 200)
    assert.end()
  }

  github.post(req, res)
})

test('The GitHub endpoint with authorized IPv6 should return 200', (assert) => {
  const github = githubController.create({
    security: {
      authorizedIps: ['1.2.3.4'],
      githubAuthorizedSubnets: ['1.2.3.4/24'],
      githubIps: [],
      key: "test"
    },
    repository: {
      branch: 'master'
    }
  })

  const req = {
    ip: '::ffff:1.2.3.4',
    body: {'dummy': true, key: "test"},
    query: {},
    headers: { "X-Hub-Signature": "sha1=841dc412af57dd01f144be678973276a96031ad0"}
  }
  const res = {}
  let code;

  res.writeHead = function (statusCode) {
    code = statusCode
  }

  res.end = function () {
    assert.equal(code, 200)
    assert.end()
  }

  github.post(req, res)
})

test('The GitHub endpoint with authorized GitHub IP should return 200', (assert) => {
  const github = githubController.create({
    security: {
      authorizedIps: [],
      githubAuthorizedSubnets: [],
      githubIps: ['1.2.3.4'],
      key: "test"
    },
    repository: {
      branch: 'master'
    }
  })

  const req = {
    ip: '1.2.3.4',
    body: {'dummy': true, key: "test"},
    query: {},
    headers: { "X-Hub-Signature": "sha1=841dc412af57dd01f144be678973276a96031ad0"}
  }
  const res = {}
  let code

  res.writeHead = function (statusCode) {
    code = statusCode
  }

  res.end = function () {
    assert.equal(code, 200)
    assert.end()
  }

  github.post(req, res)
})

test('The GitHub endpoint with unauthorized GitHub IP should return 403', (assert) => {
  const github = githubController.create({
    security: {
      authorizedIps: [],
      githubAuthorizedSubnets: [],
      githubIps: [],
      key: "test"
    },
    repository: {
      branch: 'master'
    }
  })

  const req = {
    ip: '1.2.3.4',
    body: {'dummy': true, key: "test"},
    query: {},
    headers: { "X-Hub-Signature": "sha1=841dc412af57dd01f144be678973276a96031ad0"}
  }
  const res = {}
  let code

  res.writeHead = function (statusCode) {
    code = statusCode
  }

  res.end = function () {
    assert.equal(code, 403)
    assert.end()
  }

  github.post(req, res)
})

test('The GitHub endpoint with incorrect key should return 403', (assert) => {
  const github = githubController.create({
    security: {
      authorizedIps: [],
      githubAuthorizedSubnets: [],
      githubIps: [],
      key: "test"
    },
    repository: {
      branch: 'master'
    }
  })

  const req = {
    ip: '1.2.3.4',
    body: {'dummy': true, key: "wrong"},
    query: {},
    headers: { "X-Hub-Signature": "sha1=841dc412af57dd01f144be678973276a96031ad0"}
  }
  const res = {}
  let code

  res.writeHead = function (statusCode) {
    code = statusCode
  }

  res.end = function () {
    assert.equal(code, 403)
    assert.end()
  }

  github.post(req, res)
})