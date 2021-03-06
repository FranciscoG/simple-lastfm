var request = require('superagent');
var makeSignature = require('../utils/makeSig.js');

/**
 * Handle LastFM Authenticated POST requests
 * 
 * @param {string} method
 * @param {Object} opts - the parameters required for your specific lastFM post request method
 * @returns {Promise<Object>} A promise that contains the API request response.body object
 * @memberof LastfmApi
 */
function post(method, opts) {
  this.log('INFO', 'Starting lastfm POST request: ', method, opts);
  this.log('INFO', 'Using lastfm session key: ' + this.sessionKey);

  if (!this.sessionKey) {
    return new Promise(function(resolve, reject){
      reject('missing session key');
    })
  }

  // default parameters are not available until node 6 and I'm targeting node >= 4 for now
  opts = opts || {};

  opts.sk = this.sessionKey;
  var api_sig = makeSignature(method, this.config, opts);

  // the auth related stuff
  var post_obj = {
    api_key: this.config.api_key,
    method : method,
    api_sig: api_sig,
    format : 'json'
  };

  // all the non-auth related params
  // plus the session key
  for (let key in opts) {
    post_obj[key] = opts[key];
  }

  return new Promise((resolve, reject) => {
    request
      .post(this.apiRoot)
      .type('form')
      .send(post_obj)
      .end((err, res) => {
        if (err || !res.ok) {
          this.log('ERROR', 'post ' + method, err || res);
          reject(err);
          return;
        }

        if (res.body.error) {
          reject(res.body);
          return;
        }

        resolve(res.body);
      });
  });
};

module.exports = post;