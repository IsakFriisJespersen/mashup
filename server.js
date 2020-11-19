
//Dependencies
const express = require('express');
const morgan  = require('morgan')
const app = express();
//Modules
const api = require("./api.js");

const PORT = 8080;


// log in the "combined" pre-defined format
app.use(morgan('combined'));

app.listen(PORT, ()=>{
    console.log(`App listening on port ${PORT}`)
});

//RESTFul endpoionts
app.get('/mashup/:mbid',api.cache, api.mashup);
module.exports = app;