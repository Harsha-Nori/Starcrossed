//require('dotenv').load()

var express = require('express')
var app = express()
var path = require('path')
var http = require('http').Server(app)
var needle = require('needle')
var iod = require('iod-node')
var fs = require('fs')
//var parser = require('body-parser')
var parser = require('body/json')
// client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

currentRefID = '-1'
updateTimer = 60000
// messagesJSON =  [{sender: 'global', message: 'Hello, World!', latitude: '', longitude: ''}];
//app.use(express.json());
app.use(parser());

var messages = [];

function addMessage(sender, receiver, message, lat, lon){
	var m = 'a'//{sender, receiver, message, lat, lon}
	messages.push(m)
}

id = setInterval(function(){
	var path = './messages.json'
	fs.writeFile(path, JSON.stringify(messages), function(err) {
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
			//console.log(resp); //it's a pain to look through the whole log
			//console.log("WE ARE IN THE ELSE: ")  //Harsha Debugging
			console.log(resp/*['body']['reference']*/); //Harsha Debugging
			currentRefID = resp/*['body']['reference']*/;
		}
	})
}, updateTimer)

app.get('/', function(req, res){
	console.log('get hit')
	res.send('refid: ' + currentRefID)
})

app.post('/', function (req, res) {
	addMessage(req.body.sender,
				req.body.receiver,
				req.body.message,
				req.body.lat,
				req.body.lon
				);
	res.send('' +req.body.sender
				+req.body.receiver
				+req.body.message
				+req.body.lat
				+req.body.lon); //get the data to fill in the information here from the sender...
});

app.listen(process.env.PORT || 3000)