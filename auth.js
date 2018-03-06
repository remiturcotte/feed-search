require('dotenv').load();
const express = require('express')
const app = express();

const AdwordsAuth = require('node-adwords').AdwordsAuth;
  
let auth = new AdwordsAuth({
    client_id: process.env.CLIENT_ID, //this is the api console client_id
    client_secret: process.env.CLIENT_SECRET
}, 'http://localhost:3000/adwords/auth' /** insert your redirect url here */);

app.get('/', function(req, res){
    res.send('hey, something works');
  });

//assuming express
app.get('/adwords/go', (req, res) => {
    res.redirect(auth.generateAuthenticationUrl());
})

app.get('/adwords/auth', (req, res) => {
    auth.getAccessTokenFromAuthorizationCode(req.query.code, (error, tokens) => {
        //save access and especially the refresh tokens here
        console.log(error, tokens)
    })
});

app.listen(3000);