require('dotenv').load()

var express = require('express')
var app = express()
var path = require('path')
var http = require('http').Server(app)
var needle = require('needle')
var iod = require('iod-node')
var fs = require('fs')
var bodyParser = require('body-parser')
// client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

currentRefID = '-1'
updateTimer = 7000
string = ""
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
	string_2 = "asdf;lkajsdf;ljasdf;kasd"
	var jsonMessages = JSON.parse(messages);
	// console.log("HERE ARE THE JSON MESSAGES: " + jsonMessages);

	for (i = 0; i < jsonMessages.length; ++i) {
		console.log("api key here!", process.env.idolOnDemandApiKey)
		var datatemp = {
			apikey: process.env.idolOnDemandApiKey,
			//text: "Today is an awesome and super happy fday!" 
			text: jsonMessages[i]["message"]
		}
		console.log('i:',i)
		needle.post('http://api.idolondemand.com/1/api/sync/analyzesentiment/v1', datatemp, function(err, resp, body) {
			if (err) {
				console.log(err);
			} else {
				i--;
				jsonMessages[i]["sentiment"] = resp['body']['aggregate']['score'];
				console.log("Working JSON: " + jsonMessages[i]["sentiment"])
				string = string.concat(JSON.stringify(jsonMessages))
				if (i != jsonMessages.length) {
					string = string + JSON.stringify(jsonMessages) + ","
				} else {
					string = string + JSON.stringify(jsonMessages) + "]"
				}

			}
		});
		if (i == jsonMessages.length - 1) {
			 console.log("LOOP HAS FINISHED RUNNING!" , i)
			 messages = JSON.stringify(jsonMessages);
			 console.log("HERE ARE THE CURRENT MESSAGES: " + messages)
		}
	}
	//console.log("HERE ARE THE CURRENT MESSAGES: " + messages)

	//messages = JSON.stringify(jsonMessages);
	// console.log("very far after " + jsonMessages)
	// console.log(messages)

	console.log("HERE ARE THE UPDATED MESSAGES: " + messages)
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
	res.send('ref id: ' + currentRefID + '   ' + "messages: " + messages)
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
				); //get the data to fill in the information here from the sender...
});

app.post('/sentiment', function (req, res) {  //return a request for a specific sentiment
	var dataMap = {
			apikey: process.env.idolOnDemandApiKey,
			//text: "Today is an awesome and super happy fday!" 
			text: req.body.message
	}

	needle.post('http://api.idolondemand.com/1/api/sync/analyzesentiment/v1', dataMap , function(err, resp, body) {
		if (err) {
			console.log(err);
		} else {
			var sentiment = resp['body']['aggregate']['score'];
		}
	res.send(sentiment); //send back sentiment information from the isolated text message
}

app.listen(process.env.PORT || 5000)