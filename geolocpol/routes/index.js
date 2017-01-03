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
//Simple bar chart, first viz
router.get('/simpleBarChart', function(req, res) {
  res.render('samples/simplebarchart.html');
});
//A simple map of the UK, inspired by lets make a map!
router.get('/mapUK', function(req, res) {
  res.render('samples/mapUK.html');
});
//Juste la carte du monde (gardee au cas ou besoin d'un copié-collé
router.get('/worldbackground', function(req, res) {
  res.render('samples/worldbackground.html');
});
//A simple map of France indicating the Ammoniac rate in 2010
router.get('/franceAmmoniac', function(req, res) {
  res.render('samples/franceAmmoniac.html');
});
//Les cours d'eau en France
router.get('/waterways', function(req, res) {
  res.render('samples/waterways.html');
});
//La densité de population en Europe
router.get('/densityEurope', function(req, res) {
  res.render('samples/densityEurope.html');
});

module.exports = router;
