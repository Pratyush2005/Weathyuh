'use client';
import { useEffect, useState } from "react";
import styles from "./pag.module.css";

function getCurrentDate() {
  const currentDate = new Date();
  const option: Intl.DateTimeFormatOptions = { month: "long" };
  const date = currentDate.getDate() + " " + currentDate.toLocaleDateString("en-US", option);
  return date;
}

interface Weather {
  description: string;
}

interface Main {
  temp: number;
}

interface WeatherData {
  weather: Weather[];
  main: Main;
  dt: number;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [todayWeather, setTodayWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("");

  
  async function fetchDataApi(cityName: string) {
    try {
      const response = await fetch("http://localhost:3000/api/weather?address=" + cityName);
      const jsonData = (await response.json()).data;

      setWeatherData(jsonData.list);
      setTodayWeather(jsonData.list[0]);
      
      
      localStorage.setItem("lastSearchedCity", cityName);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }


  useEffect(() => {
    const storedCity = localStorage.getItem("lastSearchedCity") || "Chennai";
    setCity(storedCity);
    fetchDataApi(storedCity);
  }, []);

  return (
    <main className={styles.main}>
      <article className={styles.widget}>
        <form className={styles.weatherLocation} onSubmit={(e) => {
          e.preventDefault();
          fetchDataApi(city);
        }}>
          <input
            className={styles.input_field}
            placeholder="Enter city name"
            type="text"
            id="city"
            name="city"
            value={city} 
            onChange={(e) => setCity(e.target.value)}
          />
          <button className={styles.search_button} type="submit">
            Search
          </button>
        </form>

        {todayWeather ? (
          <>
            <div className={styles.icon_and_weatherInfo}>
              <div className={styles.weatherIcon}>
                {todayWeather.weather[0].description === "rain" ||
                todayWeather.weather[0].description === "fog" ? (
                  <i className={`wi wi-day-${todayWeather.weather[0].description}`}></i>
                ) : (
                  <i className="wi wi-day-cloudy"></i>
                )}
              </div>
              <div className={styles.weatherInfo}>
                <div className={styles.temperature}>
                  <span>
                    {(todayWeather.main.temp - 273.5).toFixed(2) + String.fromCharCode(176)}
                  </span>
                </div>
                <div className={styles.weatherCondition}>
                  {todayWeather.weather[0].description.toUpperCase()}
                </div>
              </div>
            </div>
            <div className={styles.place}>{city}</div>
            <div className={styles.date}>{getCurrentDate()}</div>
          </>
        ) : (
          <div className={styles.place}>Loading...</div>
        )}

        <div className={styles.forecast}>
          {weatherData && 
            weatherData
              .slice(1) 
              .filter((_, index) => index % 8 === 0) 
              .slice(1, 6) 
              .map((forecast, index) => {
                const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <div key={index} className={styles.day}>
                    <div className={styles.weatherDate}>{forecastDate}</div>
                    <div className={styles.weatherIcon}>
                      <i className="wi wi-day-cloudy"></i>
                    </div>
                    <div className={styles.temperature}>
                      {(forecast.main.temp - 273.5).toFixed(2) + String.fromCharCode(176)}
                    </div>
                    <div className={styles.weatherCondition}>
                      {forecast.weather[0].description?.toUpperCase()}
                    </div>
                  </div>
                );
              })}
        </div>
      </article>
    </main>
  );
}