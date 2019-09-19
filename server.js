
'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
require('dotenv').config();

const superagent = require('superagent');

app.use(express.static('public'));

app.use(cors());



function Location(searchQuery, geoDataResults) {
  this.searchQuery = searchQuery;
  this.formatted_address = geoDataResults.formatted_address;
  this.latitude = geoDataResults.geometry.location.lat;
  this.longitude = geoDataResults.geometry.location.lng;
}


function Weather(dailyWeatherResults) {
  this.forecast = dailyWeatherResults.summary;
  this.time = new Date(dailyWeatherResults.time * 1000).toDateString();
}

function Events(eventInfo) {
  this.link = eventInfo.url;
  this.name = eventInfo.name.text;
  this.event_date = new Date(eventInfo.start.local).toDateString();
  this.summary = eventInfo.summary;
}


function handleError(error, response) {
  console.error(error);
  const errorObj = {
    status: 500,
    text: 'Sorry, something went wrong, please review and try again'
  }
  response.status(500).send(errorObj);
}

app.get('/location', (request, response) => {
  let searchQuery = request.query.data;
  let geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}`
  superagent.get(geoUrl)
  .then(superagentResult => {
    const location = new Location (searchQuery, superagentResult.body.results[0]);
    console.log(location);
    // let results = superagentResult.body.results[0];
    // let location = new Location(searchQuery, results);
    response.status(200).send(location);
  })
  .catch(error => handleError(error, response));
})


app.get('/weather', (request, response) => {
  let searchQuery = request.query.data;
  let darkSkyUrl = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`
  superagent.get(darkSkyUrl)
  .then(superagentResult => {
    const dailyWeatherResults = superagentResult.body;
    let weatherArr = dailyWeatherResults.daily.data.map(day => {
      const weather = new Weather(searchQuery, day);
      return weather;
    })
    response.status(200).send(weatherArr);
  })
  .catch(error => handleError(error, response));
})


app.get('/events', (request, response) => {
  let eventBriteUrl = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${lng}&location.latitude=${lat}&expand=venue&token=${process.env.EVENT_API_KEY}`
  
  superagent.get(eventBriteUrl)
  .then(superagentResult => {
    const eventResults = superagentResult.body;
    const eventArr = eventResults.events.slice(0, 10).map(event => {
      let AnEvent = new Events(event);
      return AnEvent;
    })
    response.status(200).send(eventArr);
  })
  .catch(error => handleError(error, response));
})

app.use('*', (request, response) => response.status(404).send('Sorry that location does not exist.'))

app.listen(PORT, () => console.log(`listening on ${PORT}`));






// routes
// app.get('/location', searchLatToLong);
// app.get('/weather', getWeather);  
// app.get('/events')



// function searchLatToLong(request, response) {
  //   let searchQuery = request.query.data;
  //   // const geoData = require('./data/geo.json');
  
  //   // used Kyungrae's key b/c mine didnt work
  //   let URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}` 
  
  //       const formatted_address = results.formatted_address;
  //       const lat = results.geometry.location.lat;
  //       const long = results.geometry.location.lng;
  
  
  //       // create a new location object instance using the superagent results
  
  //       // send data to the front end
  
  
//     })
//     )
//   }

//   // function runs when called the /weather
// function getWeather(request, response) {
  
//     let locationDataObj = request.query.data;
//     let latitude = locationDataObj.latitude;
//     let longitude = locationDataObj.longitude;
    
//     let URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`
    
    
//     superagent.get(URL)
//     .then(data =>{
//       let darkskyDataArr = data.body.daily.data
//       const dailyArr = darkskyDataArr.map(day=>{
//         return new Weather(day);
//       })
//       response.send(dailyArr);
//     })
//     .catch(error => console.log(error));

//     // let searchQuery = request.query.data;
//     // const darkskyData = require('./data/darksky.json');

//     let darkskyDataArr = DarkSkyData.daily.data;
//     const dailyArr = darkskyDataArr.map(day =>{
//       return new Weather(day)
//     })
//   }




// // did't have
// Weather.prototype.formattedDate = function(time) {
//   let date = new Date(time*1000);
//   return date.toDateString();
// }



// function getEvents(request, response){
//   let locationObj = request.query.data;
//   let URL = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${lng}&location.latitude=${lat}&expand=venue&token=${process.env.EVENT_API_KEY}`

// superagent.get(url);
// .then(eventBriteData =>{
//   const eventBriteInfo = eventBriteData.result.body.events.map(eventData=>{
//     const event = new Event(eventData);
//     return event;
//   })
//   response.send(eventBriteInfo);
// })
// .catch(error => handleError(error, response));
// }

// function Event (eventBriteThing){
//   this.link = eventBriteThing.url;
//   this.name = eventBriteThing.name.text;
//   this.event_date = new Date(eventBriteThing.start.local).toDateString();
//   this.summary = eventBriteThing.summary; 
// }



// // turns on the server