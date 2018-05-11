var pool = require('./dependencies/sqlpool.js')
var api = require('express').Router();

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

module.exports = api
