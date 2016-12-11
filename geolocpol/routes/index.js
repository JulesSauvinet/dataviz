var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

router.get('/vizu1', function(req, res) {
  res.render('vizu1.html');
});
router.get('/vizu2', function(req, res) {
  res.render('vizu2.html');
});
router.get('/vizu3', function(req, res) {
  res.render('vizu3.html');
});
router.get('/vizu4', function(req, res) {
  res.render('vizu4.html');
});
router.get('/vizu5', function(req, res) {
  res.render('tp4_1.html');
});
router.get('/vizu6', function(req, res) {
  res.render('vizu6.html');
});
router.get('/vizu7', function(req, res) {
  res.render('vizu7.html');
});
router.get('/vizu8', function(req, res) {
  res.render('tp5_1.html');
});
router.get('/vizu9', function(req, res) {
  res.render('vizu8.html');
});
router.get('/tp4', function(req, res) {
  res.render('tp4_1.html');
});
router.get('/vizu10', function(req, res) {
  res.render('tp6.html');
});

module.exports = router;
