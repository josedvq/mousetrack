module.exports = {

getBarChartCode: function(data) {
	return '\
		var globalResults = '+JSON.stringify(data.globalResults)+';\
		var userResults = '+JSON.stringify(data.userResults)+';\
	';
}
}