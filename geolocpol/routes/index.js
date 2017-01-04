var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});


router.get('/project', function(req, res) {
  res.render('project/smallMultiples.html');
});

router.get('/test1', function(req, res) {
  res.render('samples/test1.html');
});


/**************** TPS *****************/
router.get('/grippeNovembre2015', function(req, res) {
  res.render('tps/tp4_1.html');
});
router.get('/grippe20132015', function(req, res) {
  res.render('tps/tp5_1.html');
});
router.get('/votesconjoints', function(req, res) {
  res.render('tps/tp6.html');
});


/**************** Samples/Tests *****************/
//A simple map of the UK, inspired by lets make a map!
router.get('/mapUK', function(req, res) {
  res.render('samples/mapUK.html');
});
//La densité de population en Europe
router.get('/densityEurope', function(req, res) {
  res.render('samples/densityEurope.html');
});

module.exports = router;
