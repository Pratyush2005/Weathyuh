'use client';
import { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import styles from "./pag.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [inputCity, setInputCity] = useState(""); 
  const [city, setCity] = useState("Chennai"); 

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

  const chartData = {
    labels: weatherData
      .slice(1)
      .filter((_, index) => index % 8 === 0)
      .map((forecast) =>
        new Date(forecast.dt * 1000).toLocaleDateString("en-US", { weekday: 'long' })
      ), 
    datasets: [
      {
        label: "Temperature (°C)",
        data: weatherData
          .slice(1)
          .filter((_, index) => index % 8 === 0)
          .map((forecast) => (forecast.main.temp - 273.5).toFixed(2)),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCity(inputCity); 
    fetchDataApi(inputCity); 
  };

  return (
    <main className={styles.main}>
      <article className={styles.widget}>
        <form className={styles.weatherLocation} onSubmit={handleSearch}>
          <input
            className={styles.input_field}
            placeholder="Enter city name"
            type="text"
            id="city"
            name="city"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)} 
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
              .slice(0, 6) 
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

        <div className={styles.chartContainer}>
          <h2>5-Day Temperature Trend</h2>
          <Line data={chartData} />
        </div>
      </article>
    </main>
  );
}