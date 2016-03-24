/*
 *  Made by Ethan Lee (@ethanlee16) and Kushal Tirumala (@kushaltirumala)
 *  Licensed under the MIT License.
 */

/* Change this to your Slack bot's OAuth token,
* found in the Integrations tab */
var SLACK_TOKEN = require('./config').slackToken;

var https = require('https');
var websocket = require('ws');
var responses = require('./responses');

var counter = 1;
var ignoredChannels = [];
var ws, slackID, rtm;

https.get("https://slack.com/api/rtm.start?token=" + SLACK_TOKEN, function(res) {
    console.log("Connecting to Slack API...");
    var data = "";
    res.on('data', function(chunk) {
        data += chunk;
    }).on('error', function(err) {
        console.log("Failed to connect to Slack. Did you put in your Slack bot's token in app.js?");
        console.log(err);
    }).on('end', function() {
        rtm = JSON.parse(data);
        // console.log(rtm);
        ws = new websocket(rtm.url);
        slackID = rtm.self.id;
        console.log("Logging into " + rtm.team.name + "'s Slack...");
        ws.on('open', goTrump);
    })
});

function goTrump() {
    console.log("Listening for new messages...");
    ws.on('message', handleEvent);
};

function handleEvent(data) {
    var event = JSON.parse(data);
    // console.log(event);
    var index = ignoredChannels.indexOf(event.channel);
    var response;
    if (event.type === "message" && event.user !== slackID) {
        if (index != -1) { // check if the channel is ignored
            if (event.text === "no wait, come back!") {
                ignoredChannels.splice(index, 1);
                console.log("Ignored channels: " + ignoredChannels);
                respond(event.channel, "LET'S MAKE " + rtm.team.name.toUpperCase() + " GREAT AGAIN!!1!");
            }
        } else if (event.text === "please go away") {
            ignoredChannels.push(event.channel);
            console.log("Ignored channels: " + ignoredChannels);
            respond(event.channel, "Sorry, there is no STAR on the stage tonight.");
        } else if (event.text !== undefined) { // channel isn't ignored and message isn't telling Trump to stfu
            console.log(event.text);
            var response = getResponse(event.text);
            if (response !== undefined) {
                respond(event.channel, response);
            }
        }
    }
};

function respond(channelID, message) {
    console.log("Responding with: " + message);
    ws.send(JSON.stringify({
        "id": counter,
        "type": "message",
        "channel": channelID,
        "text": message
    }));
    counter++;
};

function getResponse(message) {
    message = message.toLowerCase();
    console.log("Checking message: " + message);
    for(var i = 0; i < responses.length; i++) {
        var item = responses[i];
        for(var j = 0; j < item.keywords.length; j++) {
            var keyword = item.keywords[j];
            if(message.toLowerCase().indexOf(keyword) != -1) {
                return item.messages[Math.floor(Math.random() * item.messages.length)];
            }
        }
    }
};
