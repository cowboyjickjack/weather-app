import React, { useState } from "react";
import axios from "axios";

function App() {
  // React hooks to manage state in a functional component
  // first is the current state value, second is a function that allows you to update the status
  // [] for data (empty array), "" for location/city name
  const [data, setData] = useState([]);
  const [location, setLocation] = useState("");
  const [cityName, setCityName] = useState("");
  const weatherKey = process.env.REACT_APP_WEATHER_API_KEY;

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${weatherKey}&units=imperial`;

  // function that gets triggered when user hits enter or clicks search button
  // everything within is is responsible for fetching weather data for entered city
  // starts by checking if input is not a number/empty
  const searchLocation = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      if (!location || !isNaN(location)) {
        alert("Please enter a city name.");
        return;
      }

      axios
        .get(url)
        .then((response) => {
          // groups data by day, and sets 'data' as said fetch
          const groupedData = groupDataByDay(response.data.list);
          setData(groupedData);
          console.log(groupedData);

          // sets city name 
          setCityName(response.data.city.name);
        })
        .catch((error) => {
          // error catch if API request is failed
          console.error(error);
          if (error.response && error.response.status === 404) {
            console.error(
              "City not found or API request failed. Please try again."
            );
          }
        });
      // clears the search bar once the user hits enter
      setLocation("");
    }
  };

  // just the event to handle when user hits enter/clicks button, and searches location
  const handleEnter = (event) => {
    if (event.key === "Enter") {
      console.log("Enter has been hit");
      searchLocation(event);
    }
  };

  // function that takes weather data and groups it by day
  // it's initialized with empty object to store grouped data
  // then is loops over each item in 'data' array, and calculates a 'dayKey' based on the date string
  //
  const groupDataByDay = (data) => {
    const groupedData = {};
    data.forEach((item) => {
      const timestamp = item.dt * 1000; // extracts timestamp value from the current 'item'
      const date = new Date(timestamp); // just converts into JS date :)
      const dayKey = date.toDateString(); // Group by date string
      // this checks if there's already groupedData for that dayKey. If not, an array is initialized 
      if (!groupedData[dayKey]) {
        groupedData[dayKey] = item;
      }
    });

    // Limits to 5 days/cards
    const limitedData = {};
    let count = 0;
    for (const key in groupedData) {
      if (count >= 4) {
        break;
      }
      limitedData[key] = groupedData[key];
      count++;
    }

    return limitedData;
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={handleEnter}
          placeholder="Enter City"
          type="text"
        />
        <button type="submit" onClick={searchLocation}><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path></svg>
        </button>
      </div>

      <div className="container">
        {Object.keys(data).map((dayKey, index) => (
          <div key={index} className="card">
            <div className="top">
              <div className="location">
                <h4>{cityName}</h4>
                <div className="date">
                  <h5>{dayKey}</h5>
                </div>
              </div>
              <div className="temp">
                <div className="currentTemp">
                  <h2>
                    {Math.trunc(data[dayKey].main.temp)}°F
                    <div className="highAndLow">
                      <h5>
                        H: {Math.trunc(data[dayKey].main.temp_min)}°F
                      </h5>
                      <h5>
                        L: {Math.trunc(data[dayKey].main.temp_max)}°F
                      </h5>
                    </div>
                  </h2>
                </div>
              </div>
              <div className="description">
                {data[dayKey].weather[0] && data[dayKey].weather[0].icon && (
                  <div className="desc-div">
                    <h4>{data[dayKey].weather[0].description}</h4>
                    <img
                      className="icon"
                      src={`https://openweathermap.org/img/wn/${
                        data[dayKey].weather[0].icon
                      }@2x.png`}
                      alt="weather-icon"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bottom">
              <div className="feels">
                <h4>
                  Feels like:{" "}
                  {Math.trunc(data[dayKey].main.feels_like)}°F
                </h4>
              </div>
              <div className="humidity">
                <h4>Humidity: {data[dayKey].main.humidity}%</h4>
              </div>
              <div className="wind">
                <h4>Wind Speed: {Math.trunc(data[dayKey].wind.speed)} MPH</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;