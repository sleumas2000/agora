'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mysql      = require('mysql');

var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'agora',
  password : '@~fIazR*',
  database : 'agora'
});

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, x-confirm-delete');
  if (req.method === 'OPTIONS') {
    console.log('!OPTIONS');
    var headers = {};
    // IE8 does not allow domains to be specified, just the *
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-HTTP-Method-Override, x-confirm-delete');
    res.end()
  } else {
    next();
  }
});

var PORT = process.env.PORT || 24672;
var API_STEM_V1 = "/api/v1"

app.get(API_STEM_V1+'/', function(req, res){
  res.json({message: 'Hooray! API vaguely works!'});
});

app.get(API_STEM_V1+'/users', function(req, res){
  pool.query(  'SELECT * FROM USERS', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.get(API_STEM_V1+'/users/groups/:groupID/members', function(req, res){
  pool.query('SELECT Users.* FROM Users INNER JOIN LinkGroupsUsers ON LinkGroupsUsers.UserID = Users.UserID AND LinkGroupsUsers.GroupID = ? ORDER BY Users.UserID', req.params.groupID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
/*app.get(API_STEM_V1+'/users/full', function(req, res){
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
app.post(API_STEM_V1+'/users', function(req, res){
  pool.query('INSERT INTO USERS SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(409).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/users/groups', function(req, res){
  pool.query('SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName FROM Groups LEFT JOIN GroupTypes ON Groups.GroupTypeID = GroupTypes.GroupTypeID ORDER BY Groups.GroupTypeID, Groups.GroupName', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/users/groups', function(req, res){
  pool.query('INSERT INTO GROUPS SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/users/groups/types', function(req, res){
  pool.query('SELECT * FROM GROUPTYPES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.get(API_STEM_V1+'/users/groups/types/:groupTypeID/members', function(req, res){
  console.log(req.params.groupTypeID)
  pool.query('SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName FROM Groups INNER JOIN GroupTypes ON GroupTypes.GroupTypeID = Groups.GroupTypeID AND Groups.GroupTypeID = ? ORDER BY Groups.GroupName', req.params.groupTypeID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/users/groups/types', function(req, res){
  pool.query('INSERT INTO GROUPTYPES SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/users/groups/types/:grouptypeID', function(req, res){
  pool.query('SELECT * FROM GROUPTYPES WHERE GROUPTYPEID = ?', req.params.grouptypeID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.post(API_STEM_V1+'/users/groups/types/:grouptypeID', function(req, res){
  pool.query('UPDATE GROUPTYPES SET ? WHERE GROUPTYPEID = ?', [req.body, req.params.grouptypeID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/users/groups/types/:grouptypeID', function(req, res){
  console.log(req.body)
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

app.get(API_STEM_V1+'/users/groups/:groupID', function(req, res){
  pool.query('SELECT * FROM GROUPS WHERE GROUPID = ?', req.params.groupID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.post(API_STEM_V1+'/users/groups/:groupID', function(req, res){
  pool.query('UPDATE GROUPS SET ? WHERE GROUPID = ?', [req.body, req.params.groupID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/users/groups/:groupID', function(req, res){
  console.log(req.body)
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

app.get(API_STEM_V1+'/users/groups/:groupID/users', function(req, res){
  pool.query('SELECT * FROM LINKGROUPSUSERS WHERE GROUPID = ?', parseInt(req.params.groupID), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/users/groups/:groupID/users', function(req, res){
  console.log(req.params.groupID  )
  pool.query('INSERT INTO LINKGROUPSUSERS SET GROUPID = ?, ?', [parseInt(req.params.groupID), req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(409).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/users/groups/:groupID/users/:userID', function(req, res){
  console.log(req.body)
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

app.get(API_STEM_V1+'/users/:userID', function(req, res){
  var response={}
  pool.query('SELECT * FROM USERS WHERE USERID = ?', parseInt(req.params.userID), function (err, results, fields){
    if (err) console.log(err);
    response=(results[0]);
    console.log(results[0])
    pool.query(
      'SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName \
      FROM LinkGroupsUsers LEFT JOIN Groups ON LinkGroupsUsers.GroupID = Groups.GroupID \
      LEFT JOIN GroupTypes ON Groups.GroupTypeID = GroupTypes.GroupTypeID WHERE UserID = ?',
    parseInt(req.params.userID), function (err, results, fields) {
      if (err) console.log(err);
      response.Groups=(results);
      console.log(results)
      console.log(response)
      res.json(response)
    });
  });
});
app.post(API_STEM_V1+'/users/:userID', function(req, res){
  pool.query('UPDATE USERS SET ? WHERE USERID = ?', parseInt(req.params.userID) , req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/users/:userID', function(req, res){
  console.log(req.body)
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
    console.log(req.headers)
    console.log(req.headers['x-confirm-delete'])
    res.status(403).json(req.body);
  }
});

app.post(API_STEM_V1+'/users/:userID/groups', function(req, res){
  pool.query('INSERT INTO LINKGROUPSUSERS SET USERID = ?, ?', [parseInt(req.params.userID), req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(409).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.get(API_STEM_V1+'/users/:userID/groups', function(req, res){
  pool.query('SELECT * FROM LINKGROUPSUSERS WHERE USERID = ?', parseInt(req.params.userID), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.delete(API_STEM_V1+'/users/:userID/groups/:groupID', function(req, res){
  console.log(req.body)
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

app.get(API_STEM_V1+'/elections/:electionID/votes', function(req, res){
  pool.query("SELECT RIGHT(LEFT(SHA(CONCAT(Votes.UserID,Systems.SystemShortName)),24),8) AS UserHash, Votes.VoteID, Votes.SystemID, Systems.SystemShortName, Votes.CandidateID, Votes.ElectionID, Votes.Position, LinkCandidatesElections.PartyID, Parties.PartyName FROM Votes LEFT JOIN LinkCandidatesElections ON Votes.CandidateID = LinkCandidatesElections.CandidateID AND LinkCandidatesElections.ElectionID = ? LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID LEFT JOIN Systems on Systems.SystemID = Votes.SystemID WHERE Votes.ElectionID = ? ORDER BY SystemID, Position, PartyID, CandidateID", [parseInt(req.params.electionID),parseInt(req.params.electionID)], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.get(API_STEM_V1+'/elections/:electionID/parties', function(req, res){
  pool.query('SELECT Parties.PartyID, Parties.PartyName, Parties.PathToLogo, Parties.PartyColor FROM Parties LEFT JOIN LinkCandidatesElections ON Parties.PartyID = LinkCandidatesElections.PartyID WHERE LinkCandidatesElections.ElectionID = ? ORDER BY PartyID', parseInt(req.params.electionID), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.get(API_STEM_V1+'/elections/:electionID/votes/group/:groupID', function(req, res){
  pool.query('SELECT Votes.SystemID, Votes.CandidateID, Votes.Position, LinkCandidatesElections.PartyID, Parties.PartyName FROM Votes LEFT JOIN LinkCandidatesElections ON Votes.CandidateID = LinkCandidatesElections.CandidateID LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID LEFT JOIN LinkGroupsUsers ON Votes.UserId = LinkGroupsUsers.UserID WHERE Votes.ElectionID = ? AND LinkGroupsUsers.GroupID = ? ORDER BY SystemID, Position, PartyID, CandidateID, VoteID', [parseInt(req.params.electionID),parseInt(req.params.groupID)], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});

app.post(API_STEM_V1+'/elections/:electionID/systems/:systemShortName/votes/user/:userID', function(req, res){
  pool.query('SELECT SystemID FROM Systems WHERE SystemShortName = ?', req.params.systemShortName, function(err, results, fields) {
    if (results.length != 1 || typeof(results[0].SystemID) == 'undefined') {
      res.status(404).json(req.body);
      console.log(results);
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



app.get(API_STEM_V1+'/votes', function(req, res){
  pool.query('SELECT * FROM VOTES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/votes', function(req, res){
  pool.query('INSERT INTO VOTES SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/votes/:voteID', function(req, res){
  pool.query('SELECT * FROM VOTES WHERE VOTEID = ?', req.params.voteID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.post(API_STEM_V1+'/votes/:voteID', function(req, res){
  pool.query('UPDATE VOTES SET ? WHERE VOTEID = ?', [req.params.voteID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/votes/:voteID', function(req, res){
  console.log(req.body)
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


app.get(API_STEM_V1+'/parties', function(req, res){
  pool.query('SELECT * FROM PARTIES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/parties', function(req, res){
  pool.query('INSERT INTO PARTIES SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/parties/:partyID', function(req, res){
  pool.query('SELECT * FROM PARTIES WHERE PARTYID = ?', req.params.partyID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.post(API_STEM_V1+'/parties/:partyID', function(req, res){
  pool.query('UPDATE PARTIES SET ? WHERE PARTYID = ?', [req.params.partyID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/parties/:partyID', function(req, res){
  console.log(req.body)
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


app.get(API_STEM_V1+'/candidates', function(req, res){
  pool.query('SELECT * FROM CANDIDATES', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/candidates', function(req, res){
  pool.query('INSERT INTO CANDIDATES SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/candidates/:candidateID', function(req, res){
  pool.query('SELECT * FROM CANDIDATES WHERE CANDIDATEID = ?', req.params.candidateID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.post(API_STEM_V1+'/candidates/:candidateID', function(req, res){
  pool.query('UPDATE CANDIDATES SET ? WHERE CANDIDATEID = ?', [req.params.candidateID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/candidates/:candidateID', function(req, res){
  console.log(req.body)
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


app.get(API_STEM_V1+'/systems', function(req, res){
  pool.query('SELECT * FROM SYSTEMS', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/systems', function(req, res){
  pool.query('INSERT INTO SYSTEMS SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/systems/:systemID', function(req, res){
  pool.query('SELECT * FROM SYSTEMS WHERE SYSTEMID = ?', req.params.systemID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.post(API_STEM_V1+'/systems/:systemID', function(req, res){
  pool.query('UPDATE SYSTEMS SET ? WHERE SYSTEMID = ?', [req.params.systemID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/systems/:systemID', function(req, res){
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


app.get(API_STEM_V1+'/elections', function(req, res){
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
app.post(API_STEM_V1+'/elections', function(req, res){
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
app.post(API_STEM_V1+'/elections/:electionID/systems/:systemIDs', function(req, res){
  console.log(req.params.systemIDs)
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
app.post(API_STEM_V1+'/elections/:electionID/activate', function(req, res){
  pool.query('UPDATE Elections SET Active = 1 WHERE ELECTIONID = ?', [req.params.electionID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(200).json(req.body);
    };
  });
});
app.post(API_STEM_V1+'/elections/:electionID/deactivate', function(req, res){
  pool.query('UPDATE Elections SET Active = 0 WHERE ELECTIONID = ?', [req.params.electionID], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(200).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/elections/:electionID', function(req, res){
  pool.query('SELECT * FROM ELECTIONS WHERE ELECTIONID = ?', req.params.electionID, function (err, results, fields){
    if (err) console.log(err);
    pool.query('SELECT * FROM LinkElectionsSystems WHERE ElectionID = ?', results[0].ElectionID, function (err2, results2, fields2){
      if (err2) console.log(err2);
      results[0].systems=results2
      res.json(results[0]);
    });
  });
});
app.get(API_STEM_V1+'/elections/:electionID/systems', function(req, res){
  pool.query('SELECT Systems.SystemName, Systems.SystemID, Systems.SystemShortName FROM Systems RIGHT JOIN LinkElectionsSystems ON LinkElectionsSystems.SystemID = Systems.SystemID WHERE LinkElectionsSystems.ElectionID = ?', req.params.electionID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.get(API_STEM_V1+'/elections/:electionID/candidates', function(req, res){
  pool.query('SELECT Candidates.CandidateID, Candidates.CandidateName, Parties.PartyID, Parties.PartyName, Parties.PathToLogo, Parties.PartyColor FROM Candidates RIGHT JOIN LinkCandidatesElections ON LinkCandidatesElections.CandidateID = Candidates.CandidateID LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID WHERE LinkCandidatesElections.ElectionID = ? ORDER BY Candidates.CandidateName', req.params.electionID, function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.get(API_STEM_V1+'/elections/:electionID/candidates/:candidateID', function(req, res){
  pool.query('SELECT Candidates.CandidateID, Candidates.CandidateName, Parties.PartyID, Parties.PartyName, Parties.PathToLogo FROM Candidates RIGHT JOIN LinkCandidatesElections ON LinkCandidatesElections.CandidateID = Candidates.CandidateID LEFT JOIN Parties on Parties.PartyID = LinkCandidatesElections.PartyID WHERE LinkCandidatesElections.ElectionID = ? AND Candidates.CandidateID = ?', [req.params.electionID, req.params.candidateID], function (err, results, fields){
    if (err) console.log(err);
    res.json(results[0]);
  });
});
app.post(API_STEM_V1+'/elections/:electionID', function(req, res){
  pool.query('UPDATE ELECTIONS SET ? WHERE ELECTIONID = ?', [req.params.electionID, req.body], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});
app.delete(API_STEM_V1+'/elections/:electionID', function(req, res){
  console.log(req.body)
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

app.get(API_STEM_V1+'/electionCandidateLinks/:electionID', function(req, res){
  pool.query('SELECT Candidates.*, Parties.*, LinkID FROM Candidates INNER JOIN LinkCandidatesElections ON LinkCandidatesElections.CandidateID = Candidates.CandidateID AND LinkCandidatesElections.ElectionID = ? INNER JOIN Parties ON Parties.PartyID = LinkCandidatesElections.PartyID AND LinkCandidatesElections.ElectionID = ?', [req.params.electionID, req.params.electionID], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/electionCandidateLinks', function(req, res){
  pool.query('INSERT INTO LinkCandidatesElections(ElectionID,CandidateID,PartyID) VALUES (?,?,?)', [req.body.ElectionID, req.body.CandidateID, req.body.PartyID], function (err, results, fields){
    if (err) console.log(err);
    res.json(req.body);
  });
});
app.delete(API_STEM_V1+'/electionCandidateLinks/:id', function(req, res){
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
app.get(API_STEM_V1+'/memberships/:groupID', function(req, res){
  pool.query('SELECT Users.*, LinkID FROM Users INNER JOIN LinkGroupsUsers ON LinkGroupsUsers.UserID = Users.UserID AND LinkGroupsUsers.GroupID = ? ', [req.params.groupID, req.params.groupID], function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
app.post(API_STEM_V1+'/memberships', function(req, res){
  pool.query('INSERT INTO LinkGroupsUsers(GroupID,UserID) VALUES (?,?)', [req.body.GroupID, req.body.UserID], function (err, results, fields){
    if (err) console.log(err);
    res.json(req.body);
  });
});
app.delete(API_STEM_V1+'/memberships/:id', function(req, res){
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
app.listen(PORT);
console.log("Webserver started on localhost:"+PORT)
