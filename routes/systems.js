var pool = require('./dependencies/sqlpool.js')
var api = require('express').Router();

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

module.exports = api
