module.exports = {
  onPreBuild: ({ netlifyConfig, utils: { git } }) => {
    netlifyConfig.build.command = `cd client && yarn add @thoth/thoth-core@canary && cd .. && ${netlifyConfig.build.command}`
  },
}
