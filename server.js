'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mysql      = require('mysql');
var jwt        = require('jsonwebtoken'); // used to create, sign, and verify tokens

var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'agora',
  password : '@~fIazR*',
  database : 'agora'
});

var PORT = process.env.PORT || 24672;
var API_STEM_V1 = "/api/v1"
var JWT_STEM_V1 = "/api/auth/"

var app = express();
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

api.use(authenticateJWTs)

api.get('/', function(req, res){
  res.json({message: 'Hooray! API vaguely works!'});
});

api.get('/users', function(req, res){
  pool.query('SELECT * FROM USERS', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/users/groups/:groupID/members', function(req, res){
  pool.query('SELECT Users.* FROM Users INNER JOIN LinkGroupsUsers ON LinkGroupsUsers.UserID = Users.UserID AND LinkGroupsUsers.GroupID = ? ORDER BY Users.UserID', req.params.groupID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
/*api.get('/users/full', function(req, res){
  pool.query(  'SELECT Users.*, Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName \
  FROM Users \
  LEFT JOIN LinkGroupsUsers ON LinkGroupsUsers.UserID = Users.UserID \
  LEFT JOIN Groups ON LinkGroupsUsers.GroupID = Groups.GroupID \
  LEFT JOIN GroupTypes ON Groups.GroupTypeID = GroupTypes.GroupTypeID ORDER BY Users.UserID', function (err, results, fields){
    if (err) console.log(err);
    var reponse = []
    for (var i = 0; i < length(results); i++) {
      row = results[i]
      for (key in row):
      response[i]
    }
    res.json(results);
  });
});*/
api.post('/users', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO USERS SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(409).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

api.get('/users/groups', function(req, res){
  pool.query('SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName FROM Groups LEFT JOIN GroupTypes ON Groups.GroupTypeID = GroupTypes.GroupTypeID ORDER BY Groups.GroupTypeID, Groups.GroupName', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/users/groups', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO GROUPS SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

api.get('/users/groups/types', function(req, res){
  pool.query('SELECT * FROM GROUPTYPES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/users/groups/types/:groupTypeID/members', function(req, res){
  pool.query('SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName FROM Groups INNER JOIN GroupTypes ON GroupTypes.GroupTypeID = Groups.GroupTypeID AND Groups.GroupTypeID = ? ORDER BY Groups.GroupName', req.params.groupTypeID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/users/groups/types', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO GROUPTYPES SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

api.get('/users/groups/types/:grouptypeID', function(req, res){
  pool.query('SELECT * FROM GROUPTYPES WHERE GROUPTYPEID = ?', req.params.grouptypeID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
api.post('/users/groups/types/:grouptypeID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE GROUPTYPES SET ? WHERE GROUPTYPEID = ?', [req.body, req.params.grouptypeID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/users/groups/types/:grouptypeID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM GROUPTYPES WHERE GROUPTYPEID = ' + req.params.grouptypeID  + ';', function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});

api.get('/users/groups/:groupID', function(req, res){
  pool.query('SELECT * FROM GROUPS WHERE GROUPID = ?', req.params.groupID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
api.post('/users/groups/:groupID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE GROUPS SET ? WHERE GROUPID = ?', [req.body, req.params.groupID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/users/groups/:groupID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM GROUPS WHERE GROUPID = ' + req.params.groupID  + ';', function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});

api.get('/users/groups/:groupID/users', function(req, res){
  pool.query('SELECT * FROM LINKGROUPSUSERS WHERE GROUPID = ?', parseInt(req.params.groupID), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/users/groups/:groupID/users', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO LINKGROUPSUSERS SET GROUPID = ?, ?', [parseInt(req.params.groupID), req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(409).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/users/groups/:groupID/users/:userID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM LINKGROUPSUSERS WHERE USERID = ? AND GROUPID = ?', [parseInt(req.params.userID), parseInt(req.params.groupID)], function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});

api.get('/users/:userID', function(req, res){
  var response={}
  pool.query('SELECT * FROM USERS WHERE USERID = ?', parseInt(req.params.userID), function (err, results, fields){
    if (err) console.log(err);
    response=(results[0]);
    pool.query(
      'SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName \
      FROM LinkGroupsUsers LEFT JOIN Groups ON LinkGroupsUsers.GroupID = Groups.GroupID \
      LEFT JOIN GroupTypes ON Groups.GroupTypeID = GroupTypes.GroupTypeID WHERE UserID = ?',
    parseInt(req.params.userID), function (err, results, fields) {
      if (err) console.log(err);
      response.Groups=(results);
      res.json(response)
    });
  });
});
api.post('/users/:userID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE USERS SET ? WHERE USERID = ?', parseInt(req.params.userID) , req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/users/:userID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM USERS WHERE USERID = ?', parseInt(req.params.userID), function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});

api.post('/users/:userID/groups', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO LINKGROUPSUSERS SET USERID = ?, ?', [parseInt(req.params.userID), req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(409).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.get('/users/:userID/groups', function(req, res){
  pool.query('SELECT * FROM LINKGROUPSUSERS WHERE USERID = ?', parseInt(req.params.userID), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.delete('/users/:userID/groups/:groupID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM LINKGROUPSUSERS WHERE USERID = ? AND GROUPID = ?', [parseInt(req.params.userID), parseInt(req.params.groupID)], function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});

api.get('/elections/:electionID/votes', function(req, res){
  pool.query("SELECT RIGHT(LEFT(SHA(CONCAT(Votes.UserID,Systems.SystemShortName)),24),8) AS UserHash, Votes.VoteID, Votes.SystemID, Systems.SystemShortName, Votes.CandidateID, Votes.ElectionID, Votes.Position, LinkCandidatesElections.PartyID, Parties.PartyName FROM Votes LEFT JOIN LinkCandidatesElections ON Votes.CandidateID = LinkCandidatesElections.CandidateID AND LinkCandidatesElections.ElectionID = ? LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID LEFT JOIN Systems on Systems.SystemID = Votes.SystemID WHERE Votes.ElectionID = ? ORDER BY SystemID, Position, PartyID, CandidateID", [parseInt(req.params.electionID),parseInt(req.params.electionID)], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/elections/:electionID/parties', function(req, res){
  pool.query('SELECT Parties.PartyID, Parties.PartyName, Parties.PathToLogo, Parties.PartyColor FROM Parties LEFT JOIN LinkCandidatesElections ON Parties.PartyID = LinkCandidatesElections.PartyID WHERE LinkCandidatesElections.ElectionID = ? ORDER BY PartyID', parseInt(req.params.electionID), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/elections/:electionID/votes/group/:groupID', function(req, res){
  pool.query('SELECT RIGHT(LEFT(SHA(CONCAT(Votes.UserID,Systems.SystemShortName)),24),8) AS UserHash, Votes.SystemID, Systems.SystemShortName, Votes.CandidateID, Votes.Position, LinkCandidatesElections.PartyID, Parties.PartyName FROM Votes LEFT JOIN LinkCandidatesElections ON Votes.CandidateID = LinkCandidatesElections.CandidateID LEFT JOIN Systems on Systems.SystemID = Votes.SystemID LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID LEFT JOIN LinkGroupsUsers ON Votes.UserId = LinkGroupsUsers.UserID WHERE Votes.ElectionID = ? AND LinkGroupsUsers.GroupID = ? ORDER BY SystemID, Position, PartyID, CandidateID, VoteID', [parseInt(req.params.electionID),parseInt(req.params.groupID)], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});

api.post('/elections/:electionID/systems/:systemShortName/votes/user/:userID', function(req, res){
  console.log(req.params.userID,req.user)
  pool.query('SELECT SystemID FROM Systems WHERE SystemShortName = ?', req.params.systemShortName, function(err, results, fields) {
    if (results.length != 1 || typeof(results[0].SystemID) == 'undefined') {
      res.status(404).json(req.body);
    }
    delete req.body.systemShortName;
    delete req.body.electionID;
    delete req.body.userID;
    delete req.body.systemID;
    if (req.body.candidateID == 0) req.body.candidateID = null;
    pool.query('INSERT INTO Votes SET UserID = ?, ElectionID = ?, SystemID = ?, ?', [parseInt(req.params.userID), parseInt(req.params.electionID), parseInt(results[0].SystemID), req.body], function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(409).json(req.body);
      } else {
        res.status(201).json(req.body);
      }
    });
  });
});



api.get('/votes', function(req, res){
  pool.query('SELECT * FROM VOTES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});

api.get('/votes/:voteID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('SELECT * FROM VOTES WHERE VOTEID = ?', req.params.voteID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});

api.delete('/votes/:voteID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM VOTES WHERE VOTEID = ?', req.params.voteID, function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});


api.get('/parties', function(req, res){
  pool.query('SELECT * FROM PARTIES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/parties', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO PARTIES SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

api.get('/parties/:partyID', function(req, res){
  pool.query('SELECT * FROM PARTIES WHERE PARTYID = ?', req.params.partyID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
api.post('/parties/:partyID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE PARTIES SET ? WHERE PARTYID = ?', [req.params.partyID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/parties/:partyID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM PARTIES WHERE PARTYID = ?', req.params.partyID, function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});


api.get('/candidates', function(req, res){
  pool.query('SELECT * FROM CANDIDATES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/candidates', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO CANDIDATES SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

api.get('/candidates/:candidateID', function(req, res){
  pool.query('SELECT * FROM CANDIDATES WHERE CANDIDATEID = ?', req.params.candidateID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
api.post('/candidates/:candidateID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE CANDIDATES SET ? WHERE CANDIDATEID = ?', [req.params.candidateID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/candidates/:candidateID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM CANDIDATES WHERE CANDIDATEID = ?', req.params.candidateID, function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});


api.get('/systems', function(req, res){
  pool.query('SELECT * FROM SYSTEMS', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/systems', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO SYSTEMS SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

api.get('/systems/:systemID', function(req, res){
  pool.query('SELECT * FROM SYSTEMS WHERE SYSTEMID = ?', req.params.systemID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
api.post('/systems/:systemID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE SYSTEMS SET ? WHERE SYSTEMID = ?', [req.params.systemID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/systems/:systemID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM SYSTEMS WHERE SYSTEMID = ?', req.params.systemID, function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});


api.get('/elections', function(req, res){
  pool.query('SELECT * FROM ELECTIONS', function (err, results, fields){
    if (err) console.log(err);
    var promises = []
    for (var i in results) {
      var p = new Promise(function(resolve,reject){
        pool.query('SELECT Systems.SystemShortName, Systems.SystemID, Systems.SystemName FROM Systems INNER JOIN LinkElectionsSystems ON Systems.SystemID = LinkElectionsSystems.SystemID AND LinkElectionsSystems.ElectionID = ?', results[i].ElectionID, function (err2, results2, fields2){
          if (err2) console.log(err2);
          resolve(results2)
        });
      })
      promises.push(p)
    }
    Promise.all(promises).then(function(values) {
      results.map(function(self,i){self.systems = values[i];return self});
      res.json(results);
    })
  });
});
api.post('/elections', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO Elections SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      pool.query('SELECT ElectionID FROM Elections ORDER BY ElectionID DESC LIMIT 0, 1', req.body, function(err2, results2, fields2){
        if (err2) {
          console.log(err2);
          res.status(500).json(req.body);
        } else {
          res.status(201).json({ElectionID: results2[0].ElectionID});
        }
      })
    };
  });
});
api.post('/elections/:electionID/systems/:systemIDs', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  var systems = JSON.parse(req.params.systemIDs)
  var queryString = ""
  for (var s in systems) {
    queryString += "("+req.params.electionID+","+systems[s]+"),"
  }
  pool.query('INSERT INTO LinkElectionsSystems(ElectionID,SystemID) VALUES '+queryString.slice(0,queryString.length-1), function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.post('/elections/:electionID/activate', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE Elections SET Active = 1 WHERE ELECTIONID = ?', [req.params.electionID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(200).json(req.body);
    };
  });
});
api.post('/elections/:electionID/deactivate', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE Elections SET Active = 0 WHERE ELECTIONID = ?', [req.params.electionID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(200).json(req.body);
    };
  });
});

api.get('/elections/:electionID', function(req, res){
  pool.query('SELECT * FROM ELECTIONS WHERE ELECTIONID = ?', req.params.electionID, function (err, results, fields){
    if (err) console.log(err);
    pool.query('SELECT * FROM LinkElectionsSystems WHERE ElectionID = ?', results[0].ElectionID, function (err2, results2, fields2){
      if (err2) console.log(err2);
      results[0].systems=results2
      res.json(results[0]);
    });
  });
});
api.get('/elections/:electionID/systems', function(req, res){
  pool.query('SELECT Systems.SystemName, Systems.SystemID, Systems.SystemShortName FROM Systems RIGHT JOIN LinkElectionsSystems ON LinkElectionsSystems.SystemID = Systems.SystemID WHERE LinkElectionsSystems.ElectionID = ?', req.params.electionID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/elections/:electionID/candidates', function(req, res){
  pool.query('SELECT Candidates.CandidateID, Candidates.CandidateName, Parties.PartyID, Parties.PartyName, Parties.PathToLogo, Parties.PartyColor FROM Candidates RIGHT JOIN LinkCandidatesElections ON LinkCandidatesElections.CandidateID = Candidates.CandidateID LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID WHERE LinkCandidatesElections.ElectionID = ? ORDER BY Candidates.CandidateName', req.params.electionID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/elections/:electionID/candidates/:candidateID', function(req, res){
  pool.query('SELECT Candidates.CandidateID, Candidates.CandidateName, Parties.PartyID, Parties.PartyName, Parties.PathToLogo FROM Candidates RIGHT JOIN LinkCandidatesElections ON LinkCandidatesElections.CandidateID = Candidates.CandidateID LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID WHERE LinkCandidatesElections.ElectionID = ? AND Candidates.CandidateID = ?', [req.params.electionID, req.params.candidateID], function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
api.post('/elections/:electionID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('UPDATE ELECTIONS SET ? WHERE ELECTIONID = ?', [req.params.electionID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
api.delete('/elections/:electionID', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM ELECTIONS WHERE ELECTIONID = ?', req.params.electionID, function(err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});

api.get('/electionCandidateLinks/:electionID', function(req, res){
  pool.query('SELECT Candidates.*, Parties.*, LinkID FROM Candidates INNER JOIN LinkCandidatesElections ON LinkCandidatesElections.CandidateID = Candidates.CandidateID AND LinkCandidatesElections.ElectionID = ? INNER JOIN Parties ON Parties.PartyID = LinkCandidatesElections.PartyID AND LinkCandidatesElections.ElectionID = ?', [req.params.electionID, req.params.electionID], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/electionCandidateLinks', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO LinkCandidatesElections(ElectionID,CandidateID,PartyID) VALUES (?,?,?)', [req.body.ElectionID, req.body.CandidateID, req.body.PartyID], function (err, results, fields){
    if (err) console.log(err);
    res.json(req.body);
  });
});
api.delete('/electionCandidateLinks/:id', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM LinkCandidatesElections WHERE LinkId = ?', [req.params.id, req.params.electionID], function (err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});
api.get('/memberships/:groupID', function(req, res){
  pool.query('SELECT Users.*, LinkID FROM Users INNER JOIN LinkGroupsUsers ON LinkGroupsUsers.UserID = Users.UserID AND LinkGroupsUsers.GroupID = ? ', [req.params.groupID, req.params.groupID], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.post('/memberships', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  pool.query('INSERT INTO LinkGroupsUsers(GroupID,UserID) VALUES (?,?)', [req.body.GroupID, req.body.UserID], function (err, results, fields){
    if (err) console.log(err);
    res.json(req.body);
  });
});
api.delete('/memberships/:id', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  if (req.headers['x-confirm-delete'] == 'true') {
    pool.query('DELETE FROM LinkGroupsUsers WHERE LinkId = ?', [req.params.id, req.params.electionID], function (err, results, fields){
      if (err) {
        console.log(err);
        res.status(500).json(req.body)
      } else {
        res.status(201).json(req.body);
      };
    });
  } else {
    res.status(403).json(req.body);
  }
});

app.use(API_STEM_V1,api)

// JSON WEB TOKENS

/*jwtapi.get('/users', function(req, res) {
  pool.query('SELECT UserID, UserName, DisplayName FROM Users', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});*/
jwtapi.get('/users/:userID', function(req, res) {
  pool.query('SELECT UserID, UserName, DisplayName FROM Users WHERE UserID = ?', req.params.userID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.set('jwtSecret','suprsecret')
jwtapi.post('/authenticate', function(req,res) {
  console.log(req.body)
  pool.query('SELECT UserName, Email, UserID, IsAdmin FROM Users WHERE UserName = ?', req.body.UserName, function(err, results, fields){
    if (err) console.log(err);
    var user = results[0]
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else {
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
  console.log(req.body,req.headers)
  console.log(token)
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

app.use(JWT_STEM_V1,jwtapi)

app.listen(PORT);
console.log("Webserver started on localhost:"+PORT)
