var express = require('express');
var app = express();
var config = require('../config.js');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var i18n = require("i18n");
var order = require("../items/permutation.json");
var async = require("async");
var charts = require("../helpers/charts.js");
var big5data = require("../data/big5results.json");

var getItems = function(locale) {
	var items = require('../items/ipip_neo_'+locale+'.json');
	var orderedItems = [];
	for(var i = 0; i < items.length; i++) {
		orderedItems[order[i]] = {id: i+1, t: items[i].t, k: items[i].k};
	}
	return orderedItems;
}

var items = []
var countries = []
for(var i = 0; i < config.locales.length; i++) {
	items[config.locales[i]] = getItems(config.locales[i]);
	countries[config.locales[i]] = require('../locales/countries/countries_'+config.locales[i]+'.json');
}

var sumResults = function(results) {
	var partials = [];
	var val;
	var sum = 0;
	for(var i = 0; i < config.testLength; i++) {
		val = parseInt(results["p"+(i+1)]);
		// Invert for negative items
		if(items['en'].k == -1) {
			sum += (6-val);
		} else {
			sum += val;
		}
		if((i+1) % 4 == 0) {
			partials.push(sum);
			sum = 0;
		}
	}

	return partials;
}

var sumBigFive = function(partials) {
	var bigFiveScores = [];

	var sum = 0;
	for(var i = 0; i < partials.length; i++) {
		sum += partials[i];
		if((i+1) % 6 == 0) {
			bigFiveScores.push(sum);
			sum = 0;
		}
	}
	return bigFiveScores;
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('test', {
		css: config.stylesheets,
		items: items[res.locale],
		countries: countries[res.locale],
		env: app.get('env'),
		t: res.__ 
	});
});

/* Handles a packet of location coordinates */
router.post('/location', function(req, res, next) {
	MongoClient.connect(config.mongo.url, function(err, db) {
		assert.equal(err,null);

		db.collection(config.mongo.locationCollection).insertOne(req.body,function(err,result){
			assert.equal(err,null)
			res.sendStatus(200);
		});

	});
});

/* Handle a packet of scrolling information */
router.post('/scroll', function(req, res, next) {
	MongoClient.connect(config.mongo.url, function(err, db) {
		assert.equal(err,null);

		db.collection(config.mongo.scrollCollection).insertOne(req.body,function(err,result){
			assert.equal(err,null)
			res.sendStatus(200);
		});
		
	});
});

/* Handle the submission of the user data */
router.post('/user', function(req, res, next) {
	MongoClient.connect(config.mongo.url, function(err, db) {
		assert.equal(err,null);

		var entry = {
			uid: req.body.uid,
			agent: JSON.parse(req.body.agent),
			clicks: JSON.parse(req.body.clicks),
			sizes: JSON.parse(req.body.sizes),
			hiddenqev: JSON.parse(req.body.hiddenqev),
			buggedradioev: JSON.parse(req.body.buggedradioev)
		}
		db.collection(config.mongo.userCollection).insertOne(entry,function(err,result){
			assert.equal(err,null)
			res.sendStatus(200);
		});
		
	});
});

/* Handle the submission of the form */
router.post('/results', function(req, res, next) {
	MongoClient.connect(config.mongo.url, function(err, db) {
		assert.equal(err,null);
		
		var aggregatedResults = sumResults(req.body);
		var bigFiveResults = sumBigFive(aggregatedResults);
		
		async.series([
			function(cb) {
				db.collection(config.mongo.formCollection).insertOne(req.body,cb);
			},
			function(cb) {
				db.collection(config.mongo.aggrCollection).insertOne({u: req.body.uid, r: aggregatedResults},cb);
			},
			function(cb) {
				db.collection(config.mongo.big5Collection).insertOne({u: req.body.uid, r: bigFiveResults},cb);
			}
		], function(err, results) {
			if(err) {
				res.render('error');
			} else {

				// Produce the results page
				res.render('results', {
					css: config.stylesheets,
					js: config.js,
					userResults: bigFiveResults,
					charts: charts.getBarChartCode({globalResults:big5data,userResults:bigFiveResults}),
					t: res.__ 
				});
			}
		});
	});
});

module.exports = router;
