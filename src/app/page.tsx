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
  icon: string;
}

interface Main {
  temp: number;
  humidity: number;
}

interface Wind {
  speed: number;
}

interface WeatherData {
  weather: Weather[];
  main: Main;
  dt: number;
  wind: Wind;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [todayWeather, setTodayWeather] = useState<WeatherData | null>(null);
  const [inputCity, setInputCity] = useState(""); 
  const [city, setCity] = useState("Chennai");
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  async function fetchDataApi(cityName: string) {
    try {
      const response = await fetch(`/api/weather?address=${cityName}`);
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

  const temperature = unit === 'C' 
    ? (todayWeather?.main.temp - 273.15).toFixed(2) 
    : ((todayWeather?.main.temp - 273.15) * 9/5 + 32).toFixed(2);

  const humidity = todayWeather?.main.humidity; 
  const windSpeed = todayWeather?.wind.speed; 
  const weatherDescription = todayWeather?.weather[0].description.toLowerCase();
  const weatherIcon = todayWeather?.weather[0].icon;

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
          .map((forecast) => unit === 'C' 
            ? (forecast.main.temp - 273.15).toFixed(2) 
            : ((forecast.main.temp - 273.15) * 9/5 + 32).toFixed(2)),
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

  const handleUnitToggle = () => {
    setUnit((prevUnit) => (prevUnit === 'C' ? 'F' : 'C'));
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

        <button 
          className={`${styles.toggle_button} ${unit === 'C' ? styles.active : ''}`} 
          onClick={handleUnitToggle}
        >
          Switch to °{unit === 'C' ? 'F' : 'C'}
        </button>

        {todayWeather ? (
          <>
            <div className={styles.icon_and_weatherInfo}>
              <div className={styles.weatherIcon}>
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`} 
                  alt={weatherDescription} 
                />
              </div>
              <div className={styles.weatherInfo}>
                <div className={styles.temperature}>
                  <span>{temperature + String.fromCharCode(176)}</span>
                </div>
                <div className={styles.weatherCondition}>
                  {todayWeather.weather[0].description.toUpperCase()}
                </div>
                <div className={styles.additionalInfo}>
                  <div>Humidity: {humidity}%</div>
                  <div>Wind Speed: {windSpeed} m/s</div>
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

                const forecastTemp = unit === 'C' 
                  ? (forecast.main.temp - 273.15).toFixed(2) 
                  : ((forecast.main.temp - 273.15) * 9/5 + 32).toFixed(2);

                const forecastWeatherDescription = forecast.weather[0].description.toLowerCase();
                const forecastWeatherIcon = forecast.weather[0].icon.replace("n", "d");

                return (
                  <div key={index} className={styles.day}>
                    <div className={styles.weatherDate}>{forecastDate}</div>
                    <div className={styles.weatherIcon}>
                      <img 
                        src={`https://openweathermap.org/img/wn/${forecastWeatherIcon}@2x.png`} 
                        alt={forecastWeatherDescription} 
                      />
                    </div>
                    <div className={styles.temperature}>
                      {forecastTemp + String.fromCharCode(176)}
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