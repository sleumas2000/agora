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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
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
app.get(API_STEM_V1+'/users/bygroup/:groupID', function(req, res){
  pool.query('SELECT Users.* FROM Users INNER JOIN LinkGroupsUsers ON LinkGroupsUsers.UserID = Users.UserID AND LinkGroupsUsers.GroupID = ?', req.params.groupID, function (err, results, fields){
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
  pool.query('SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName FROM Groups LEFT JOIN GroupTypes ON Groups.GroupTypeID = GroupTypes.GroupTypeID ORDER BY Groups.GroupTypeID', function (err, results, fields){
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
app.get(API_STEM_V1+'/users/groups/bygrouptype/:groupTypeID', function(req, res){
  console.log(req.params.groupTypeID)
  pool.query('SELECT Groups.GroupID, Groups.GroupName, GroupTypes.GroupTypeName FROM Groups INNER JOIN GroupTypes ON GroupTypes.GroupTypeID = Groups.GroupTypeID AND Groups.GroupTypeID = ?', req.params.groupTypeID, function (err, results, fields){
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
  if (req.body['confirm'] == 'delete') {
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
  if (req.body['confirm'] == 'delete') {
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
  if (req.body['confirm'] == 'delete') {
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
  if (req.body['confirm'] == 'delete') {
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
  if (req.body['confirm'] == 'delete') {
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
  if (req.body['confirm'] == 'delete') {
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
  if (req.body['confirm'] == 'delete') {
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
  if (req.body['confirm'] == 'delete') {
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
  console.log(req.body)
  if (req.body['confirm'] == 'delete') {
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
    res.json(results);
  });
});
app.post(API_STEM_V1+'/elections', function(req, res){
  pool.query('INSERT INTO ELECTIONS SET ?', req.body, function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(500).json(req.body)
    } else {
      res.status(201).json(req.body);
    };
  });
});

app.get(API_STEM_V1+'/elections/:electionID', function(req, res){
  pool.query('SELECT * FROM ELECTIONS WHERE ELECTIONID = ?', req.params.electionID, function (err, results, fields){
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
  if (req.body['confirm'] == 'delete') {
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

app.listen(PORT);
console.log("Webserver started on localhost:"+PORT)
