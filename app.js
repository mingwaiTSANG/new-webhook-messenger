/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// Imports dependencies and set up http server
const 
	request = require('request'),
	express = require('express'),
	body_parser = require('body-parser'),
	app = express().use(body_parser.json()); // creates express http server

	// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

	// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

	// Parse the request body from the POST
	let body = req.body;

	// Check the webhook event is from a Page subscription
	if (body.object === 'page') {

		body.entry.forEach(function(entry) {

		// Gets the body of the webhook event
		let webhook_event = entry.messaging[0];
		console.log(webhook_event);
		
		// Get the sender PSID
		let sender_psid = webhook_event.sender.id;
		console.log('Sender ID: ' + sender_psid);
		


		// Check if the event is a message or postback and
		// pass the event to the appropriate handler function
		if (webhook_event.message) {
			handleMessage(sender_psid, webhook_event.message);        
		} else if (webhook_event.postback) {
        
			handlePostback(sender_psid, webhook_event.postback);
		}
      
		});
		// Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

	} else {
    // Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
	/** UPDATE YOUR VERIFY TOKEN **/
	const VERIFY_TOKEN = "mingwai221";
  
	// Parse params from the webhook verification request
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
    
	// Check if a token and mode were sent
	if (mode && token) {
  
		// Check the mode and token sent are correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
		// Respond with 200 OK and challenge token from the request
		console.log('WEBHOOK_VERIFIED');
		res.status(200).send(challenge);
    
    } else {
		// Responds with '403 Forbidden' if verify tokens do not match
		res.sendStatus(403);      
    }
	}
});

function handleMessage(sender_psid, received_message) {
	let response;
	
	const greeting = firstEntity(received_message.nlp, 'greetings');
	if (greeting && greeting.confidence > 0.8) {
		response ={"text":"Hi there!"}
	} 

	// Checks if the message contains text
	if (received_message.text) {    

		response = {
		"attachment": {
			"type": "template",
			"payload": {
			"template_type": "generic",
			"elements": [{
				"title": "Which one do you want to know?",
				"subtitle": "Choose the product",
			//	"image_url": attachment_url,
				"buttons": [
				{
					"type": "web_url",
					"url":"http://www.agtopnet.com/agmini.html",
					"title": "AGmini",
					"webview_height_ratio": "full",
				},
				{
					"type": "web_url",
					"url":"http://www.agtopnet.com/agfunbox.html",
					"title": "AGfun box",
					"webview_height_ratio": "full",
				},
				{
					"type":"web_url",
					"url":"http://www.agtopnet.com/agremote.html",
					"title":"AGremo",
					"webview_height_ratio":"full",
				}
				],
			}]
			}
		}
		}
	} 	 
	else if (received_message.attachments) {
		// Get the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		response = {
		"attachment": {
			"type": "template",
			"payload": {
			"template_type": "generic",
			"elements": [{
				"title": "Your problem is...?",
				"subtitle": "Choose the closely question.",
			//	"image_url": attachment_url,
				"buttons": [
				{
					"type": "postback",
					"title": "How can I use this remote-control?",
					"payload": "yes",
				},
				{
					"type": "postback",
					"title": "My remote-control have some problem!",
					"payload": "no",
				},
				{
					"type":"phone_number",
					"title":"Context us!",
					"payload":"0800031419",
				}
				],
			}]
			}
		}
		}
	} 
  
	// Send the response message
	callSendAPI(sender_psid, response); 
}

function handlePostback(sender_psid, received_postback) {
	let response;
  
	// Get the payload for the postback
	let payload = received_postback.payload;

	// Set the response based on the postback payload
	if (payload === 'yes') {
		response = { "text": "I don't know!" }
	} 
	else if (payload === 'no') {
		response = { "text": "Oops, try sending clearly." }
	}
	else if (payload === 'start'){
		response = { "text": "Hi, What can I do for you?"}
	}
	
  
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
	// Construct the message body
	let request_body = {
		"recipient": {
		"id": sender_psid
		},
		"message": response
	}

	// Send the HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
		}, (err, res, body) => {
		if (!err) {
			console.log('message sent!')
		} 
		else {
			console.error("Unable to send message:" + err);
		}
	}); 
}

function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}