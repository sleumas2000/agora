var pool = require('./dependencies/sqlpool.js')
var api = require('express').Router();

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

api.get('/elections/active', function(req, res){
  pool.query('SELECT * FROM ELECTIONS WHERE Active = 1', function (err, results, fields){
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

module.exports = api
