module.exports = {
  webpackDevMiddleware: config => {
    config.watchOptions.poll = 300;
    return config;
  }
};

//note: this was added to aid with the detection of code changes by telling next to poll for changes every 300 ms

