const state = {
  city: "Istanbul",
  country: "Türkiye",
  lat: 41.0082,
  lon: 28.9784,
  unit: "celsius",
  weather: null
};

const $ = (id) => document.getElementById(id);

const weatherCodeMap = {
  0: ["Clear sky", "☀"],
  1: ["Mainly clear", "🌤"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"],
  45: ["Foggy", "🌫"],
  48: ["Rime fog", "🌫"],
  51: ["Light drizzle", "🌦"],
  53: ["Drizzle", "🌦"],
  55: ["Heavy drizzle", "🌧"],
  56: ["Freezing drizzle", "🌧"],
  57: ["Heavy freezing drizzle", "🌧"],
  61: ["Light rain", "🌦"],
  63: ["Rain", "🌧"],
  65: ["Heavy rain", "🌧"],
  66: ["Freezing rain", "🌧"],
  67: ["Heavy freezing rain", "🌧"],
  71: ["Light snow", "🌨"],
  73: ["Snow", "❄"],
  75: ["Heavy snow", "❄"],
  77: ["Snow grains", "❄"],
  80: ["Rain showers", "🌦"],
  81: ["Heavy showers", "🌧"],
  82: ["Violent showers", "⛈"],
  85: ["Light snow showers", "🌨"],
  86: ["Heavy snow showers", "❄"],
  95: ["Thunderstorm", "⛈"],
  96: ["Thunderstorm with hail", "⛈"],
  99: ["Severe thunderstorm", "⛈"]
};

function formatCondition(code) {
  return weatherCodeMap[code] || ["Unknown", "☼"];
}

function formatTemp(value) {
  const converted = state.unit === "fahrenheit" ? (value * 9) / 5 + 32 : value;
  return Math.round(converted);
}

function unitSymbol() {
  return state.unit === "fahrenheit" ? "°F" : "°C";
}

function formatLocalTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setStatus(message, isError = false) {
  const status = $("statusMessage");
  status.textContent = message;
  status.style.color = isError ? "#e07171" : "var(--muted)";
}

function renderCurrentWeather(data) {
  const current = data.current;
  const [conditionText, icon] = formatCondition(current.weather_code);

  $("locationName").textContent = state.city;
  $("locationMeta").textContent = `${state.country} · Updated just now`;
  $("weatherIcon").textContent = icon;
  $("temperature").textContent = formatTemp(current.temperature_2m).toString();
  $("temperatureUnit").textContent = unitSymbol();
  $("condition").textContent = conditionText;
  $("feelsLike").textContent = `${formatTemp(current.apparent_temperature)}${unitSymbol()}`;
  $("humidity").textContent = `${current.relative_humidity_2m}%`;
  $("wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  $("sunrise").textContent = formatLocalTime(data.daily.sunrise[0]);
  $("sunset").textContent = formatLocalTime(data.daily.sunset[0]);

  $("latitude").textContent = Number(state.lat).toFixed(2);
  $("longitude").textContent = Number(state.lon).toFixed(2);
  $("mapLabel").textContent = state.city;
  $("dateLabel").textContent = new Date().toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
}

function renderHourlyForecast(data) {
  const hourly = data.hourly;
  const now = new Date();
  const startIndex = hourly.time.findIndex((timestamp) => new Date(timestamp) >= now);
  const firstIndex = startIndex >= 0 ? startIndex : 0;

  const items = hourly.time.slice(firstIndex, firstIndex + 6).map((time, index) => {
    const actualIndex = firstIndex + index;
    const [conditionText, icon] = formatCondition(hourly.weather_code[actualIndex]);
    const label = index === 0 ? "Now" : formatLocalTime(time);
    const value = `${formatTemp(hourly.temperature_2m[actualIndex])}${unitSymbol()}`;

    return `
      <div class="hourly-item">
        <span>${label}</span>
        <div class="hour-icon">${icon}</div>
        <strong>${value}</strong>
      </div>
    `;
  });

  $("hourlyList").innerHTML = items.join("");
}

function renderWeeklyForecast(data) {
  const weeklyCards = data.daily.time.map((date, index) => {
    const [conditionText, icon] = formatCondition(data.daily.weather_code[index]);
    const high = `${formatTemp(data.daily.temperature_2m_max[index])}${unitSymbol()}`;
    const low = `${formatTemp(data.daily.temperature_2m_min[index])}${unitSymbol()}`;
    const dayName = index === 0 ? "Today" : new Date(date).toLocaleDateString([], { weekday: "short" });

    return `
      <div class="day-card ${index === 0 ? "today" : ""}">
        <span class="day-name">${dayName}</span>
        <span class="day-icon">${icon}</span>
        <strong>${high}</strong>
        <small>${low}</small>
      </div>
    `;
  });

  $("weeklyGrid").innerHTML = weeklyCards.join("");
}

function renderWeather(data) {
  state.weather = data;
  renderCurrentWeather(data);
  renderHourlyForecast(data);
  renderWeeklyForecast(data);
}

async function fetchWeather() {
  setStatus("Updating weather...");

  try {
    const params = new URLSearchParams({
      latitude: String(state.lat),
      longitude: String(state.lon),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
      hourly: "temperature_2m,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
      timezone: "auto",
      forecast_days: "7"
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    renderWeather(data);
    setStatus(`Last updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  } catch (error) {
    console.error(error);
    setStatus("Could not load weather. Please try again later.", true);
  }
}

async function searchCity(event) {
  event.preventDefault();
  const query = $("cityInput").value.trim();
  if (!query) return;

  setStatus(`Searching for ${query}...`);

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error("City lookup failed");
    }

    const data = await response.json();
    const place = data.results?.[0];
    if (!place) {
      throw new Error("City not found");
    }

    state.lat = place.latitude;
    state.lon = place.longitude;
    state.city = place.name;
    state.country = place.country || place.country_code || "Local area";
    await fetchWeather();
  } catch (error) {
    console.error(error);
    setStatus("City not found. Try another city name.", true);
  }
}

function useLocation() {
  if (!navigator.geolocation) {
    setStatus("Geolocation is not supported in this browser.", true);
    return;
  }

  setStatus("Finding your location...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      state.lat = position.coords.latitude;
      state.lon = position.coords.longitude;
      state.city = "Your location";
      state.country = "Local forecast";
      await fetchWeather();
    },
    () => {
      setStatus("Location access was denied.", true);
    }
  );
}

function toggleUnit() {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  $("unitToggle").classList.toggle("active", state.unit === "fahrenheit");

  if (state.weather) {
    renderWeather(state.weather);
  }
}

$("searchForm").addEventListener("submit", searchCity);
$("refreshBtn").addEventListener("click", fetchWeather);
$("locateBtn").addEventListener("click", useLocation);
$("unitToggle").addEventListener("click", toggleUnit);

fetchWeather();
















