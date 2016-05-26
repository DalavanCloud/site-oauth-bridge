/* Setup:
 
 1. Run `npm install` to install dependencies

 2. Edit `config` below

 3. Set up OAuth on intercom to go to [yourdomain]/oauth/callback

 4. Go to your domain, and click login.

 */


var config = {
  clientSecret: '[....]',
  clientID: '[....]',
  authorizationPath: 'https://app.intercom.io/oauth',
  tokenPath: 'https://api.intercom.io/auth/eagle/token',
  profilePath: 'https://api.intercom.io/me/',
  redirect_uri: 'https://[..yourdomain..]/oauth/callback',
  app_id: '[....]',
};

var express = require('express'),
    app = express();

var oauth2 = require('simple-oauth2')({
  site: ' ',
  clientSecret: config.clientSecret,
  clientID: config.clientID,
  authorizationPath: config.authorizationPath,
  tokenPath: config.tokenPath,
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: config.redirect_uri,
  scope: '',
  state: ''
});

// Initial page redirecting to Github
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/oauth/callback', function (req, res) {
  var code = req.query.code;

  oauth2.authCode.getToken({
    code: code,
    redirect_uri: config.redirect_uri,
    client_id: config.clientID,
    client_secret: config.clientSecret,
    app_id: config.app,
  }, saveToken);

  function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = oauth2.accessToken.create(result);

    var params = params || {};
    var request = require('request');
    var querystring = require('querystring');
    params['client_id'] = undefined /*clientId*/;
    params['client_secret'] = undefined /*clientSecret*/;
    params['app_id']= 'l8ecsskq';
    var post_data= querystring.stringify( params );

    var req_options = {
      url: config.profilePath + "?" + post_data,
      json: true,

      auth: {
        user: token.token.token,
        pass: '',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Accept": "application/json",
      }
    };

    request(req_options, function(err, req, body) {
      res.send([
      '<h1>Token:</h1>',
      '<pre>' + JSON.stringify(token, undefined, 2) + '</pre>',
      '<h1>Response</h1>',
      '<pre>' + JSON.stringify(body, undefined, 2) + '</pre>'].join('\n'));
    });
  }
});

app.get('/', function (req, res) {
  res.send('Hello<br><a href="/auth">Log in with Intercom</a>');
});


var port = process.env.PORT || 3001
app.listen(port);

console.log('Express server started on port ' + port);
