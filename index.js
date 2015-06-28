//require('dotenv').load()

var express = require('express')
var app = express()
var path = require('path')
var http = require('http').Server(app)
var needle = require('needle')
var iod = require('iod-node')
var fs = require('fs');
// client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

currentRefID = ''
updateTimer = 60000
messagesJSON = 	"{ 'messages' : []}";



id = setInterval(function(){
	var path = './messages.json'
	fs.writeFile(path, messagesJSON, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log("The file was saved!");
	});

	var data = {
		apikey:  process.env.idolOnDemandApiKey,
		file: {'file':'messages.json','content_type':'multipart/form-data'}
	}
	needle.post('http://api.idolondemand.com/1/api/sync/storeobject/v1', data, { multipart: true, 'Content-Length': data.length }, function(err, resp, body) {
		if (err) {
			console.log(err);
		} else {
			//console.log(resp);
			console.log("WE ARE IN THE ELSE: ")
			console.log(resp['body']['reference']);
			currentRefID = resp;
		}
	})
}, updateTimer)

app.get('/', function(req,res){
	console.log('get hit')
	res.send('refid: ' + currentRefID)
})

// app.post('/' function(req,res){
// 	console.log('post hit')
// })

app.listen(process.env.PORT || 3000)