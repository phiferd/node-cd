const Private = {
  server: {
    port:  process.env.NODE_CD_PORT || '61440'
  },
  security: {
    key: process.env.NODE_CD_DEPLOY_KEY || ""
  },
  action: {
    exec: {
      github: process.env.NODE_CD_UPDATE_SCRIPT || './github.sh',
    }
  }
}

module.exports = Private
