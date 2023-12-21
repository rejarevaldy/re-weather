const searchForm = document.getElementById("searchLocation");
const currentCity = document.getElementById("cityName");
const currentTime = document.getElementById("currentTime");
const currentIcon = document.getElementById("currentIcon");
const currentTemp = document.getElementById("currentTemp");

const detailHumidity = document.getElementById("detailHumidity");
const detailWind = document.getElementById("detailWind");
const detailMax = document.getElementById("detailMax");
const detailMin = document.getElementById("detailMin");

const loadingScreen = document.getElementById("loadingScreen");

const panel = document.getElementById("panel");
const body = document.body;

const API_KEY = "ddb210bc158523392e3ea81093215841";

let geoLocationData;

function showLoadingScreen() {
  loadingScreen.style.display = "flex";
}

function hideLoadingScreen() {
  loadingScreen.style.display = "none";
}

getClientData();

panel.addEventListener("mouseenter", function () {
  body.style.cursor = 'url("/img/icons/scroll.svg"), auto';
});

panel.addEventListener("mouseleave", function () {
  body.style.cursor = "auto";
});

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const cityInput = document.querySelector(".search--input");
  const cityName = cityInput.value.toLowerCase();

  showLoadingScreen();

  getGeoLocation(cityName)
    .then((result) => {
      hideLoadingScreen();
      getWeatherData(result.lat, result.lon);
      getForecast(result.lat, result.lon);
    })
    .catch((error) => {
      alert(`Location not found`);
    });
});

function getClientData() {
  showLoadingScreen();

  navigator.geolocation.getCurrentPosition((success) => {
    let { latitude, longitude } = success.coords;
    getLocationCordinate(latitude, longitude)
      .then((result) => {
        hideLoadingScreen();
        getWeatherData(result.lat, result.lon);
        getForecast(result.lat, result.lon);
      })
      .catch((error) => {
        alert(`Location not found`);
      });
  });
}

async function getWeatherData(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    changeCurrent(data);
    changeDetail(data);

    return data;
  } catch (error) {
    return error;
  }
}

async function getForecast(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&cnt=16`
    );
    const data = await response.json();
    changeForecast(data);

    return data;
  } catch (error) {
    return error;
  }
}

async function getGeoLocation(city) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    const data = await response.json();
    geoLocationData = data[0];
    return data[0];
  } catch (error) {
    return error;
  }
}

async function getLocationCordinate(lat, lon) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    const data = await response.json();
    geoLocationData = data[0];
    return data[0];
  } catch (error) {
    return error;
  }
}

function changeCurrent(data) {
  const cityInput = document.querySelector(".search--input");
  let datetime = getLocalDateTime(data);

  currentTime.innerHTML = datetime;
  currentCity.innerHTML = geoLocationData.name;

  currentTemp.innerHTML = `${Math.round(data.main.temp)}°`;
  currentIcon.src = `./img/icons/${data.weather[0].icon}.svg`;

  cityInput.value = `${geoLocationData.name}, ${geoLocationData.country}`;

  changeBackground(data.weather[0].main, data.weather[0].icon);
}

function changeDetail(data) {
  detailHumidity.innerHTML = `${data.main.humidity}%`;
  detailWind.innerHTML = `${data.wind.speed} km/h`;
  detailMax.innerHTML = `${Math.round(data.main.temp_max)}°`;
  detailMin.innerHTML = `${Math.round(data.main.temp_min)}°`;
}

function changeForecast(data) {
  const weatherList = data.list;
  const forecastContainer = document.getElementById("forecastList");

  weatherList.forEach((listItem) => {
    let time = extractTimeFromDate(listItem.dt_txt);

    const listItemElement = document.createElement("li");
    listItemElement.className = "forecast--item";

    const iconElement = document.createElement("div");
    iconElement.className = "icon";
    const iconImage = document.createElement("img");
    iconImage.src = `./img/icons/${listItem.weather[0].icon}.svg`;
    iconImage.alt = "";
    iconImage.height = "32";
    iconImage.width = "32";
    iconElement.appendChild(iconImage);

    const leftContentElement = document.createElement("div");
    leftContentElement.className = "left--content";
    const timeSpan = document.createElement("span");
    timeSpan.className = "forecast--time";
    timeSpan.innerHTML = `${time} <br /><span class="forecast--weather">${listItem.weather[0].main}</span>`;
    leftContentElement.appendChild(timeSpan);

    const detailElement = document.createElement("div");
    detailElement.className = "forecast--detail";
    const temperatureParagraph = document.createElement("p");
    temperatureParagraph.innerHTML = `${Math.round(listItem.main.temp)}°`;
    detailElement.appendChild(temperatureParagraph);

    listItemElement.appendChild(iconElement);
    listItemElement.appendChild(leftContentElement);
    listItemElement.appendChild(detailElement);
    forecastContainer.appendChild(listItemElement);
  });
}

function getLocalDateTime(data) {
  const timestamp = data.dt;
  const timezoneOffset = data.timezone;
  const date = new Date(timestamp * 1000);
  const localDate = new Date(date.getTime() + timezoneOffset * 1000);

  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const formattedDate = localDate.toLocaleString("en-US", options);
  const timeString = localDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${timeString} | ${formattedDate}`;
}

function extractTimeFromDate(dateString) {
  const dateObject = new Date(dateString);

  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return formattedTime;
}

function changeBackground(weather, icon) {
  const lastChar = icon.charAt(icon.length - 1);
  const body = document.body;

  const bgData = `${weather} ${lastChar}`;

  switch (bgData) {
    case "Thunderstorm d":
    case "Thunderstorm n":
      body.style.backgroundImage = 'url("/img/bg/thunderstorm.jpg")';
      break;
    case "Snow d":
    case "Snow n":
      body.style.backgroundImage = 'url("/img/bg/snow.jpg")';
      break;
    case "Rain d":
    case "Rain n":
    case "Drizzle d":
    case "Drizzle n":
      body.style.backgroundImage = 'url("/img/bg/rain.jpg")';
      break;
    case "Clear d":
      body.style.backgroundImage = 'url("/img/bg/clear.jpg")';
      break;
    case "Clear n":
      body.style.backgroundImage = 'url("/img/bg/night.jpg")';
      break;
    case "Clouds d":
      body.style.backgroundImage = 'url("/img/bg/clouds.jpg")';
      break;
    case "Clouds n":
      body.style.backgroundImage = 'url("/img/bg/clouds-night.jpg")';
      break;
    default:
      body.style.backgroundImage = 'url("/img/bg/mist.jpg")';
  }
}
