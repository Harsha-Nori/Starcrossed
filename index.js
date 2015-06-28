//require('dotenv').load()

var express = require('express')
var app = express()
var path = require('path')
var http = require('http').Server(app)
var needle = require('needle')
var iod = require('iod-node')
var fs = require('fs');
// client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

previousRefID = ''
currentRefID = ''
updateTimer = 1000
messagesJSON = 	'{ "employees" : [' +
					'{ "firstName":"John" , "lastName":"Doe" },' +
					'{ "firstName":"Anna" , "lastName":"Smith" },' +
					'{ "firstName":"Peter" , "lastName":"Jones" } ]}';



id = setInterval(function(){
	// console.log("this worked")
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
			console.log(resp);
		}
	})
}, updateTimer)

app.get('/', function(req,res){
	console.log('hit')
	res.send('refid: ' + process.env.idolOnDemandApiKey)
})

app.listen(process.env.PORT || 3000)