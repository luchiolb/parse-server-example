// Example express application adding the parse-server module to expose Parse
// compatible API routes.
require('newrelic');

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
const resolve = require('path').resolve;

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

var mailgunApiKey = process.env.MAILGUN_API_KEY || '';
var mailgunDomain = process.env.MAILGUN_DOMAIN || '';
var mailgunFromAddress = process.env.MAILGUN_FROM_ADDRESS || '';

//var passwordResetEmailSubject = process.env.PASSWORD_RESET_EMAIL_SUBJECT || '';
//var passwordResetEmailPath = process.env.PASSWORD_RESET_EMAIL_PATH || '';
//var verificationEmailSubject = process.env.VERIFICATION_EMAIL_SUBJECT || '';
//var verificationEmailPath = process.env.VERIFICATION_EMAIL_PATH || '';

var invalidLinkTemplateUrl = process.env.INVALID_LINK_TEMPLATE_URL || '';
var verifyEmailSuccessTemplateUrl = process.env.VERIFY_EMAIL_SUCCESS_TEMPLATE_URL || '';
var choosePasswordTemplateUrl = process.env.CHOOSE_PASSWORD_TEMPLATE_URL || '';
var passwordResetSuccessTemplateUrl = process.env.PASSWORD_RESET_SUCCESS_TEMPLATE_URL || '';

var parseServerHomeBody = process.env.PARSE_SERVER_HOME_BODY || '';

var p12CertificatePath = process.env.P12_CERTIFICATE_PATH || '';
var productionPush = process.env.PRODUCTION_PUSH || '';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  appName: process.env.APP_NAME || '',
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  publicServerURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  customPages: {
    invalidLink: invalidLinkTemplateUrl,
    verifyEmailSuccess: verifyEmailSuccessTemplateUrl,
    choosePassword: choosePasswordTemplateUrl,
    passwordResetSuccess: passwordResetSuccessTemplateUrl
  },
  // Enable email verification
  verifyUserEmails: false,
  // The email adapter
  /*emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      // Your API key from mailgun.com
      apiKey: mailgunApiKey,
      // Your domain from mailgun.com
      domain: mailgunDomain,
      // The address that your emails come from
      fromAddress: mailgunFromAddress,
      // The template section 
      templates: {
        passwordResetEmail: {
          //subject: passwordResetEmailSubject,
          subject: 'Reseteo de password para %appname%',
          pathPlainText: resolve(__dirname, '/public/plain_text_files/password_reset_email_body.txt')
        },
        verificationEmail: {
          //subject: verificationEmailSubject,
          subject: 'Por favor verifique su e-mail para %appname%',
          pathPlainText: resolve(__dirname, '/public/plain_text_files/verification_email_body.txt')
        }
      }
    }
  },*/
  push: {
      android: {
        senderId: process.env.ANDROID_PUSH_SENDER_ID,
        apiKey: process.env.ANDROID_PUSH_API_KEY
      },
      ios: {
        pfx: p12CertificatePath,
        passphrase: process.env.IOS_PUSH_P12_PASS,
        bundleId: 'ar.com.oneclick.dev.OneClickHR',
        production: productionPush
      }
    }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send(parseServerHomeBody);
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
/*app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});*/

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
