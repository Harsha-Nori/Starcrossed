require('dotenv').load()

var express = require('express')
var app = express()
var path = require('path')
var http = require('http').Server(app)
var needle = require('needle')
var iod = require('iod-node')
// client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

previousRefID = ''
currentRefID = ''
updateTimer = 1000

id = setInterval(function(){
	//console.log("this worked")
	// var data = {
	// 	apikey:  process.env.idolOnDemandApiKey,
	// 	file: {'file':'asdf.json','content_type':'multipart/form-data'}
	// }
	// needle.post('http://api.idolondemand.com/1/api/sync/storeobject/v1', data, { multipart: true, 'Content-Length': data.length }, function(err, resp, body) {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		console.log(resp);
	// 	}
	// })
}, updateTimer)

app.get('/', function(req,res){
	//get IDOL refID
	//POST to phone
	var ip = req.headers['x-forwarded-for'] || 
		req.connection.remoteAddress || 
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	console.log(ip);

	// needle.post('IP phone', 'refid=' + currentRefID, options, function(err, resp) {
 //  // you can pass params as a string or as an object.
	// });
})