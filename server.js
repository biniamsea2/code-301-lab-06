
'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
require('dotenv').config();

const superagent = require ('superagent');

app.use(cors());

app.get('/location', searchLatToLong);
app.get('/weather', getWeather);




function searchLatToLong(request, response) {
  let searchQuery = request.query.data;
  // const geoData = require('./data/geo.json');

  // used Kyungrae's key
  let URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}` 

  superagent.get(URL)
    .then(superagentResult => {
      let results = superagentResult.body.results[0];
      const formatted_address = results.formatted_address;
      const lat = results.geometry.location.lat;
      const long = results.geometry.location.lng;



      const location = new Location(searchQuery, formatted_address, lat, long);
      response.status(200).send(location);


    })
    .catch(error => handleError(error, response)
    )
  }

function getWeather(request, response) {
  
    let locationDataObj = request.query.data;
    let latitude = locationDataObj.latitude;
    let longitude = locationDataObj.longitude;
    
    let URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`
    
    
    superagent.get(URL)
    .then(data =>{
      let darkskyDataArr = data.body.daily.data
      const dailyArr = darkskyDataArr.map(day=>{
        return new Weather(day);
      })
      response.send(dailyArr);
    })
    .catch(error => console.log(error));

    // let searchQuery = request.query.data;
    // const darkskyData = require('./data/darksky.json');

    let darkskyDataArr = DarkSkyData.daily.data;
    const dailyArr = darkskyDataArr.map(day =>{
      return new Weather(day)
    })
  }



function Location(searchQuery, address, lat, long){
  this.search_query = searchQuery;
  this.formatted_address = address;
  this.latitude = lat;
  this.longitude = long;
}

function Weather(obj){
  this.forecast = obj.summary;
  this.time = this.formattedDate(obj.time);
}

Weather.prototype.formattedDate = function(time) {
  let date = new Date(time*1000);
  return date.toDateString();
}

function handleError(error, response){
  console.error(error);
  const errorObj = {
    status: 500,
    text: 'Sorry, something went wrong'
  }
  response.status(500).send(errorObj);
}

app.listen(PORT, () => console.log(`listening on ${PORT}`));