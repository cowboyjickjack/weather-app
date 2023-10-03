import React, { useState, useEffect } from "react";
import axios from "axios";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; 

function App() {

  // React hooks to manage state in a functional component
  // data that can change over time and trigger re-renders of your component
  // These state variables allow you to store and update data that needs to be reactive in your component
  const [data, setData] = useState([]); // array since it's pulling data
  const [location, setLocation] = useState("");
  const [cityName, setCityName] = useState("");
  const [mapCenter, setMapCenter] = useState([-98.48535, 29.42362]); // Default center coordinates
  const [markerLocation, setMarkerLocation] = useState(mapCenter); // initially set to mapCenter

  const weatherKey = process.env.REACT_APP_WEATHER_API_KEY;
  const mapboxKey = process.env.REACT_APP_MAPBOX_API_KEY;

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${weatherKey}&units=imperial`;

  // Function to search for a location when Enter is pressed or the button is clicked
  const searchLocation = (event) => { // event = user's action on the page
    if (event.key === "Enter" || event.type === "click") {
      if (!location || !isNaN(location)) {
        alert("Please enter a city name.");
        return;
      }

      axios
        .get(url)
        .then((response) => {
          const groupedData = groupDataByDay(response.data.list);
          setData(groupedData);
          console.log(groupedData);

          setCityName(response.data.city.name);

          // This line uses destructuring assignment to extract the coord object from the API response
          const { coord } = response.data.city;
          const newMapCenter = [coord.lon, coord.lat];

          // Update mapCenter from above declared const
          setMapCenter(newMapCenter);
        })
        .catch((error) => {
          console.error(error);
          if (error.response && error.response.status === 404) {
            console.error(
              "City not found or API request failed. Please try again."
            );
          }
        });

      setLocation("");
    }
  };

  // Function to fetch weather data for a given location via lat/lng and map marker
  const fetchWeatherData = (location) => {
    // variable for arrow function
    const [lng, lat] = location; 
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${weatherKey}&units=imperial`;

    axios
      .get(url)
      .then((response) => {
        const groupedData = groupDataByDay(response.data.list);
        setData(groupedData);
        console.log(groupedData);

        setCityName(response.data.city.name);
        setMapCenter([lng, lat]); // Update map center based on marker location
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.status === 404) {
          console.error(
            "City not found or API request failed. Please try again."
          );
        }
      });
  };

  // Function to handle Enter key press
  const handleEnter = (event) => {
    if (event.key === "Enter") {
      console.log("Enter has been hit");
      searchLocation(event);
    }
  };

  // Function to group weather data by day
  const groupDataByDay = (data) => {
    const groupedData = {};
    data.forEach((item) => {
      const timestamp = item.dt * 1000;
      const date = new Date(timestamp);
      const dayKey = date.toDateString();
      if (!groupedData[dayKey]) {
        groupedData[dayKey] = item;
      }
    });

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

  useEffect(() => {
    mapboxgl.accessToken = mapboxKey;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: mapCenter,
      zoom: 10,
    });

    map.setCenter(mapCenter);

    const marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat(mapCenter)
      .addTo(map);

    const updateMarker = (lngLat) => {
      marker.setLngLat(lngLat);
    };

    updateMarker(mapCenter);

    marker.on('dragend', (event) => {
      const newLngLat = marker.getLngLat();
      // Update the marker location state
      setMarkerLocation([newLngLat.lng, newLngLat.lat]);
      // Fetch weather data for the new location
      fetchWeatherData([newLngLat.lng, newLngLat.lat]);
    });

    return () => map.remove();
  }, [mapCenter]);

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
          <div className="mapbox">
            {/* This is where you render your map */}
          <div id="map" style={{ width: '1000px', height: '500px'}}></div>
          </div>
        </div>
      );
    }
    
    export default App;