#!/bin/env node
// usage: [VERBOSE=yes] trbot-pubuim
// home: https://github.com/imdjh/trbot-pubuim


var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');

var PORT = 8079;  // Adjust of `8079' should also done with Dockerfile
var POOL_TRUEDICE = [];
var VERBOSE = process.env.VERBOSE == 'yes';  // Only get verbose at ENV specified
var SEQDELAY_DICEPOOL = process.env.PULL_DELAY || 5000;
var CHECKID = process.env.CHECKID || console.error("No CHECKID ENV found, Server would be vulnerable!");
var NAME = process.env.BOT_NAME || 'True Random Dice';
var AVATAR = process.env.BOT_AVATAR || 'http://i11.tietuku.com/8fb0c54de77df11a.png';  // hacker emblem
var MSGPREFIX = process.env.BOT_MSGPREFIX || 'I choose ';
var TR_START = process.env.TR_START || 1;
var TR_END = process.env.TR_END || 6;
var TR_BUFFER = process.env.TR_BUFFER || 50;
var TR_BUFFER_CHECKLENGTH = process.env.TR_BUFFER_CHECKLENGTH || 5;
var URL_TRUEDICE = 'https://www.random.org/integers/?num=' + TR_BUFFER + '&min=' + TR_START +
                   '&max=' + TR_END + '&col=1&base=10&format=plain&rnd=new';


var app = express();
app.use(bodyParser.urlencoded({     // to support pubu.im URL-encoded bodies
      extended: true
}));
app.listen(PORT, function () {
    if (VERBOSE) console.log("Server listen on " + PORT);
});

// Initlize dice pool
(function refillDicePool () {
	if (! checkDicePool(null)) {  // Fill up dice pool
		console.error("Dice pool is empty.");
		if (!! VERBOSE || VERBOSE == 'yes') console.log("Async fetching sweety randomness...");
		setTimeout(refillDicePool, SEQDELAY_DICEPOOL);
	}
})();  // Init at startup

app.post('/', function (req, res) {
    var id = req.body.team_id,
        keyword = req.body.trigger_word;
    if (CHECKID && id !== CHECKID) {
        die(res);
    } else {
        if (! CHECKID) console.error("Unchecked requests from ID: " + id);  // log error without CHECKID per request
        if (keyword) {
            switch(keyword.toLowerCase()) {
                case 'roll':
                    var t = rollDice(res);
                    var response = wrappedJSON(t, NAME, AVATAR);
                    res.json(response);
                    break;
                default:
                    die(res, keyword);
            }
        } else die(res, "nothing-at-all");  // die alone with nothing
    }
});

function die(res, msg) {  // die with optional message
    if (! res) console.error("Could not initlized, server blocked from random.org.");
    else if (msg) res.send("What's " + msg + "? I don't get it :O");
    else res.send('Bad token!');
}

function checkDicePool (res) {  // return true if Pool still full
    var that = this;
    if (POOL_TRUEDICE.length < TR_BUFFER_CHECKLENGTH) {
        https.get(URL_TRUEDICE, function getTRN_Dice (r) {
            if (r.statusCode == 503) {
                    die(that.res, "Randomness has been ran out!");  // that.res would be null
            }
            r.on('data', function (d) {
                var rndString = d.toString();
                var t = rndString.split('\n');
                t.pop();                                       // remove last \n generated
                POOL_TRUEDICE = POOL_TRUEDICE.concat(t);       // push to dice poll
                if (VERBOSE) console.log("Fresh sweeties right in the pool!");
            });
        }).on('error', function (e) {
              console.error("Cought error: " + e.message + "!");
        });
        return false;
    } else {
		if (VERBOSE) console.log("Dice pool looks good.");
		return true;
	}
}

function rollDice (res) {
    checkDicePool(res);  // refill POOL, keep service consistence
    return POOL_TRUEDICE.shift();
}

function wrappedJSON (msg, botName, botAvatar) {
    return {
				"text": MSGPREFIX + msg + ".",
				"username": botName,
                "icon_url": botAvatar
			}
}

