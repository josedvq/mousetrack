module.exports = {
	base: __dirname,
	mongo: {
		url: 'mongodb://localhost/mousetrack',
		locationCollection: 'loc',
		scrollCollection: 'scroll',
		userCollection: 'user',
		formCollection: 'form',
		aggrCollection: 'aggr',
		big5Collection: 'big5'
	},
	stylesheets: [
		"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
		"//cdn.jsdelivr.net/chartist.js/latest/chartist.min.css",
		"stylesheets/style.css"
	],
	js: [
		"//cdn.jsdelivr.net/chartist.js/latest/chartist.min.js"
	],
	locales: ['es','en'],
	testLength: 120
}