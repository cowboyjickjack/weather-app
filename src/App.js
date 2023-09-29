import React, {useState} from "react";
// for API
import axios from "axios";


function App() {

  const [data, setData] = useState({});
  const [location, setLocation] = useState(''); // Declare location,city,temp, etc state
  const [cityName, setCityName] = useState(''); 
  const [temp, setTemp] = useState('');
  const [description, setDescription] = useState('');
  const [feels, setFeels] = useState('');
  const [humidity, setHumidity] = useState('');
  const [icon, setIcon] = useState('');
  const [wind, setWind] = useState('');
  const weatherKey = process.env.REACT_APP_WEATHER_API_KEY;

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${weatherKey}&units=imperial`

  const searchLocation = (event) => {
    if (event.key === 'Enter') {
      alert ("enter has been hit");
      axios.get(url).then((response) => {
        setData(response.data)
        console.log(response.data);
        console.log(process.env.REACT_APP_WEATHER_API_KEY);


        setCityName(response.data.city.name);
        setTemp(response.data.list[0].main.temp);
        setDescription(response.data.list[0].weather[0].description);
        setFeels(response.data.list[0].main.feels_like);
        setHumidity(response.data.list[0].main.humidity);
        setIcon(response.data.list[0].weather[0].icon);
        setWind(response.data.list[0].wind.speed);

      })
      setLocation('')
    }

  }

  return (
    <div className="app">

      <div className="search">
        <input 
        value={location}
        onChange={event => setLocation(event.target.value)}
        onKeyDown={searchLocation}
        placeholder="Enter City"
        type="text" />
      </div>

      <div className="container">
        <div className="card">

          <div className="top">
            <div className="location">
              <h4>{cityName}</h4>
            </div>
            <div className="temp">
              <h2>{Math.trunc(temp)}°F</h2>
            </div>
            <div className="description">
              <h4>{description}</h4>
              <img className="" src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="weather-icon" />
            </div>
          </div>

          <div className="bottom">
            <div className="feels">
              <h4>Feels like {Math.trunc(feels)}°F</h4>
            </div>
            <div className="humidity">
              <h4>{humidity}%</h4>
            </div>
            <div className="wind">
              <h4>{Math.trunc(wind)} MPH</h4>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
