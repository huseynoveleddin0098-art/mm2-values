# SkyCast Weather Dashboard

A responsive weather dashboard powered by the free [Open-Meteo](https://open-meteo.com/) API. No API key is required.

## Features

- Live current conditions, humidity, feels-like temperature, wind, sunrise, and sunset
- Search any city using the public geocoding API
- Browser geolocation support
- Hourly outlook and seven-day forecast
- Celsius / Fahrenheit toggle
- Responsive desktop and mobile layout
- Loading and error status messaging

## Run locally

This is a static site. Open `index.html` in a browser, or serve the folder with any static server:

```bash
npx serve .
```

Weather data is provided by Open-Meteo and its underlying public weather data sources.
