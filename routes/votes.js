var pool = require('./dependencies/sqlpool.js')
var api = require('express').Router();

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

api.post('/elections/:electionID/systems/:systemShortName/votes/user/:userID', function(req, res){
  if (req.params.userID != req.user.userID) {console.log(req.params.userID,"(request) !=",req.user.userID,"(token)");return res.status(403).json({'success': 'false', 'message': 'You are not signed in as the user in whose name you are trying to vote'})}
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
        res.status(409).json(err);
      } else {
        res.status(201).json(req.body);
      }
    });
  });
});

module.exports = api
