var pool = require('./dependencies/sqlpool.js')
var api = require('express').Router();

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

api.post('/users/:userID/password', function(req, res){
  if (!req.user.isAdmin) {
    return res.status(403).json({success: false, message: "You do not have admin rights"})
  }
  let salt=require('crypto').randomBytes(8).toString('hex')
  let passwordHash = hash(req.body.password,salt)
  console.log(req.body.password,salt,passwordHash)
  pool.query('UPDATE Users SET PasswordHash = ?, PasswordSalt = ? WHERE UserID = ?', [passwordHash,salt,req.params.userID], function (err, results, fields){
    if (err) console.log(err);
    res.json(req.body);
  });
});

function hash(password,salt) {
  var shasum = require('crypto').createHash('sha256');
  return shasum.update(salt).update(password).digest('hex');
}

module.exports = api
