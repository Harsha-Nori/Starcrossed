//require('dotenv').load()

var express = require('express')
var app = express()
var path = require('path')
var http = require('http').Server(app)
var needle = require('needle')
var iod = require('iod-node')
var fs = require('fs')
var bodyParser = require('body-parser')
// client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

currentString = 'Updating...'
currentRefID = '-1'
updateTimer = 30000

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json 
app.use(bodyParser.json())

var messages = '[ {"sender": "s", "receiver": "r", "message": "today was an very fun happy day", "lat": 0, "lon": 0, "sentiment": 0} ]';

function addMessage(sender, receiver, message, lat, lon, sentiment){
	var newMessages = messages.split(']');
	newMessages += '{"sender":"' + sender + '", "receiver":"' + receiver + '", "message":"' + message + '", "lat":' + lat + ', "lon":' + lon + ', "sentiment":' + 0 + '}]';
	messages = newMessages;
}

id = setInterval(function(){

	var jsonMessages = JSON.parse(messages);

	for (var i = 0; i < jsonMessages.length; i++) {
		var datatemp = {
			apikey:  process.env.idolOnDemandApiKey,
			//text: "Today is an awesome and super happy fun day!" 
			text: jsonMessages[i]["message"]
		}
		needle.post('http://api.idolondemand.com/1/api/sync/analyzesentiment/v1', datatemp, function(err, resp, body) {
			if (err) {
				console.log(err);
			} else {
				jsonMessages[i]["sentiment"] = resp['body']['aggregate']['score'];
				console.log(resp)
			}
		});
	}

	messages = JSON.stringify(jsonMessages);
	currentString = "Updated Sentiment!"
	var path = './messages.json'
	fs.writeFile(path, messages, function(err) {
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
			console.log(resp['body']['reference']); //Harsha Debugging
			currentRefID = resp['body']['reference'];
		}
	})
}, updateTimer)

app.get('/', function(req, res){
	console.log('get hit')
	res.send(currentString + '    ' + "\n" + "messages: " + messages)
	//res.send(messages)  //sending whole message from here instead of a reference for mobile app :)
})

app.post('/', function (req, res) {
	addMessage(req.body.sender,
				req.body.receiver,
				req.body.message,
				req.body.lat,
				req.body.lon,
				0
				);
	res.send('' +req.body.sender + ' '
				+req.body.receiver + ' '
				+req.body.message + ' '
				+req.body.lat + ' '
				+req.body.lon,
				0); //get the data to fill in the information here from the sender...
});

app.listen(process.env.PORT || 3000)