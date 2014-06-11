var OAuth = require('oauth').OAuth;
var request_token = "https://twitter.com/oauth/request_token";
var access_token = "https://twitter.com/oauth/access_token";

//!!!! prease input your consumer_key
var consumer_key = "";
var consumer_secret = "";

var oauth_version = "1.0";
var callback_url = "http://localhost:3000/";
var hash = "HMAC-SHA1";

var t_get = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
var t_post = 'https://api.twitter.com/1.1/statuses/update.json';

var express      = require('express');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var _ = require('lodash');

var app = express();

var oa = new OAuth(
    request_token,
    access_token,
    consumer_key,
    consumer_secret,
    oauth_version,
    callback_url,
    hash
);

app.use(cookieParser());
app.use(session({ secret: "hoge", proxy: true }));

app.use(function(req, res, next) {
    console.log('access middle');

    if (!req.session.twitter) {
        oa.getOAuthRequestToken(function(err, oauth_token, oauth_secret) {
            if (err) {
                console.log(err);
                return next();
            }
            req.session.twitter = {
                token: oauth_token,
                token_secret: oauth_secret
            };
            return res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
        });
    } else {

        if (!req.session.twitter.access_token || !req.session.twitter.access_secret) {
            req.session.twitter.verifier = req.query.oauth_verifier;

            var oauth_token = req.session.twitter.token;
            var token_secret = req.session.twitter.token_secret;
            var verifier = req.session.twitter.verifier;

            oa.getOAuthAccessToken(oauth_token, token_secret, verifier, function(err, access_token, access_secret) {
                if (err) {
                    console.log(err);
                    return next();
                }
                req.session.twitter.access_token = access_token;
                req.session.twitter.access_secret = access_secret;
                return next();
            });
        }
    }
});

/*
app.get('/', function(req, res) {
    var access_token = req.session.twitter.access_token;
    var access_secret = req.session.twitter.access_secret;
    oa.get(t_get, access_token, access_secret, function(err, result) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        var json = JSON.parse(result);
        var twit = _.map(json, function(info) {
            return {
                name: info.user.name,
                text: info.text
            };
        });
        _.each(twit, function(obj) {
            console.log(obj);
        });
        return res.json(twit);
    });
});
*/

app.get('/', function(req, res) {
    var access_token = req.session.twitter.access_token;
    var access_secret = req.session.twitter.access_secret;
    console.log(access_token);
    console.log(access_secret);
    var status = {status: "this is test for node.js"};
    oa.post(t_post, access_token, access_secret, status, function(err, result) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        res.end('post' + result);
    });
});

app.listen(3000);
