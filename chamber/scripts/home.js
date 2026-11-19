// Home page: OpenWeatherMap weather + random gold/silver member spotlights

/* ---------- Weather ---------- */
// Get a free key at https://home.openweathermap.org/api_keys and paste it here.
const API_KEY = "YOUR_OPENWEATHER_API_KEY";
const LAT = 25.7443;   // San Nicolás de los Garza, N.L.
const LON = -100.3021;
const WEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const currentURL = `${WEATHER_BASE}/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`;
const forecastURL = `${WEATHER_BASE}/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`;

const weatherIcon = document.querySelector("#weather-icon");
const currentTemp = document.querySelector("#current-temp");
const weatherDesc = document.querySelector("#weather-desc");
const weatherDetails = document.querySelector("#weather-details");
const forecastList = document.querySelector("#forecast");

const capitalize = (text) => text.replace(/\b\w/g, (c) => c.toUpperCase());

async function apiFetch(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function formatTime(unixSeconds, offsetSeconds) {
  // Show the time in the chamber's local time zone, regardless of the visitor's
  const date = new Date((unixSeconds + offsetSeconds) * 1000);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function displayCurrent(data) {
  const { temp, temp_max, temp_min, humidity } = data.main;
  const { description, icon } = data.weather[0];

  currentTemp.innerHTML = `${Math.round(temp)}&deg;C`;
  weatherDesc.textContent = capitalize(description);
  weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  weatherIcon.alt = description;
  weatherIcon.hidden = false;

  weatherDetails.innerHTML = `
    <p><span>High:</span> ${Math.round(temp_max)}&deg;C &nbsp; <span>Low:</span> ${Math.round(temp_min)}&deg;C</p>
    <p><span>Humidity:</span> ${humidity}%</p>
    <p><span>Sunrise:</span> ${formatTime(data.sys.sunrise, data.timezone)}</p>
    <p><span>Sunset:</span> ${formatTime(data.sys.sunset, data.timezone)}</p>
  `;
}

function displayForecast(data) {
  // The free forecast is in 3-hour steps; group them by local day and keep each day's high
  const offset = data.city.timezone;
  const days = new Map();

  data.list.forEach((item) => {
    const local = new Date((item.dt + offset) * 1000);
    const key = local.toISOString().slice(0, 10);
    const high = item.main.temp_max;
    if (!days.has(key)) {
      days.set(key, { date: local, high });
    } else if (high > days.get(key).high) {
      days.get(key).high = high;
    }
  });

  const nextThree = [...days.values()].slice(0, 3);
  forecastList.innerHTML = "";
  nextThree.forEach((day, index) => {
    const label = index === 0
      ? "Today"
      : day.date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    const li = document.createElement("li");
    li.innerHTML = `<span>${label}</span><strong>${Math.round(day.high)}&deg;C</strong>`;
    forecastList.appendChild(li);
  });
}

async function loadWeather() {
  if (API_KEY === "YOUR_OPENWEATHER_API_KEY") {
    weatherDesc.textContent = "Add your OpenWeatherMap API key in scripts/home.js.";
    forecastList.innerHTML = `<li class="status">Forecast unavailable.</li>`;
    return;
  }
  try {
    const [current, forecast] = await Promise.all([apiFetch(currentURL), apiFetch(forecastURL)]);
    displayCurrent(current);
    displayForecast(forecast);
  } catch (error) {
    weatherDesc.textContent = "Weather data is unavailable right now.";
    forecastList.innerHTML = `<li class="status">Forecast unavailable.</li>`;
    console.error("Error loading weather:", error);
  }
}

/* ---------- Member spotlights ---------- */
const spotlightContainer = document.querySelector("#spotlight-container");
const levels = { 1: "Member", 2: "Silver", 3: "Gold" };

function shuffle(array) {
  // Fisher–Yates shuffle
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function displaySpotlights(members) {
  spotlightContainer.innerHTML = "";
  members.forEach((member) => {
    const card = document.createElement("article");
    card.className = "card spotlight";
    card.innerHTML = `
      <h3>${member.name}</h3>
      <p class="tagline">${member.tagline}</p>
      <div class="spotlight-body">
        <img src="images/${member.image}" alt="${member.name} logo" width="80" height="80" loading="lazy">
        <div>
          <p><strong>Phone:</strong> <a href="tel:${member.phone.replace(/\s/g, "")}">${member.phone}</a></p>
          <p><strong>Address:</strong> ${member.address}</p>
          <p><strong>Website:</strong> <a href="${member.website}" target="_blank" rel="noopener">${member.website.replace("https://", "")}</a></p>
          <span class="level level-${member.membershipLevel}">${levels[member.membershipLevel]} Member</span>
        </div>
      </div>
    `;
    spotlightContainer.appendChild(card);
  });
}

async function loadSpotlights() {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const members = await response.json();
    const eligible = members.filter((m) => m.membershipLevel >= 2); // gold (3) or silver (2)
    displaySpotlights(shuffle(eligible).slice(0, 3));
  } catch (error) {
    spotlightContainer.innerHTML = `<p class="status">Spotlights are unavailable right now.</p>`;
    console.error("Error loading spotlights:", error);
  }
}

loadWeather();
loadSpotlights();
