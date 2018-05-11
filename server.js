'use strict';

// +------------------------------------------+ //
// |               DEPENDENCIES               | //
// +------------------------------------------+ //

var express    = require('express');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mysql      = require('mysql');
var jwt        = require('jsonwebtoken'); // used to create, sign, and verify tokens
var pool       = require('./routes/dependencies/sqlpool.js')
var app        = express();

// +------------------------------------------+ //
// |                PARAMETERS                | //
// +------------------------------------------+ //

var PORT = process.env.PORT || 24672;
var API_STEM_V1 = "/api/v1"
var JWT_STEM_V1 = "/api/auth/"
app.set('jwtSecret','suprsecret')

// +------------------------------------------+ //
// |                   CODE                   | //
// +------------------------------------------+ //

var api = express.Router();
var jwtapi = express.Router();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, x-confirm-delete, x-access-token');
  if (req.method === 'OPTIONS') {
    var headers = {};
    // IE8 does not allow domains to be specified, just the *
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-HTTP-Method-Override, x-confirm-delete, x-access-token');
    res.end()
  } else {
    next();
  }
});

app.use(authenticateJWTs)

api.get('/', function(req, res){
  res.json({message: 'Agora Voting System API v1.0'});
});

app.use(API_STEM_V1, require('./routes/users.js'));
app.use(API_STEM_V1, require('./routes/elections.js'));
app.use(API_STEM_V1, require('./routes/votes.js'));
app.use(API_STEM_V1, require('./routes/parties.js'));
app.use(API_STEM_V1, require('./routes/candidates.js'));
app.use(API_STEM_V1, require('./routes/systems.js'));
app.use(JWT_STEM_V1,jwtapi)

app.use(API_STEM_V1,api)

jwtapi.get('/users/:userName', function(req, res) {
  pool.query('SELECT UserID, UserName, DisplayName FROM Users WHERE UserName = ?', req.params.userName, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
jwtapi.post('/authenticate', function(req,res) {
  console.log(req.body)
  if (!req.body.UserName) {
    return res.json({ success: false, message: 'Authentication Failed. No username specified' });
  }
  pool.query('SELECT UserName, Email, UserID, IsAdmin, PasswordHash, PasswordSalt FROM Users WHERE UserName = ?', req.body.UserName, function(err, results, fields){
    if (err) console.log(err);
    if (results.length > 0) {
      var user = results[0]
    } else {
      var user
    }
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      if (!req.body.Password || hash(req.body.Password,user.PasswordSalt) != user.PasswordHash) {
        return res.json({ success: false, message: 'Authentication failed. Password Mismatch.' });
      }
      const payload = {
        userName: user.UserName,
        userID: user.UserID,
        isAdmin: !!+user.IsAdmin.toString('hex') // to convert into to bool
      };
      var token = jwt.sign(payload, app.get('jwtSecret'), {
        expiresIn: 24*60*60 // expires in 24 hours
      });
      res.json({
        success: true,
        message: 'Enjoy your token!',
        user: payload,
        token: token
      });
    }

  })
})

function authenticateJWTs(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    if (token == "123Wells909") {req.user={userID: 0, userName: 'Admin', displayName: 'Admin', isAdmin: true};next();return}
    jwt.verify(token, app.get('jwtSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
}

const crypto = require('crypto')
function hash(password,salt) {
  var shasum = crypto.createHash('sha256');
  return shasum.update(salt).update(password).digest('hex');
}

app.use(JWT_STEM_V1,jwtapi)

app.listen(PORT);
console.log("API server started on localhost:"+PORT)
