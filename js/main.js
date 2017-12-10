// find stations siteId on SL Platsuppslag: https://www.trafiklab.se/node/12606/console

const myConfig = {
	"weather": { 
		// sthlm coordinates
		"longitude": "18.0686", 
		"latitude": "59.3293" 
	},
	// departures[0] is the main departure (from home),
	// departures[1] is the 'from-work-departure'.
	// and all departures goes in the menu
	"departures": [
		{ 
			"siteId": "1804",
			"departure": "Dalbobranten",
			"destination": "Gullmarsplan",
			"destinationMenuName": "Gullmarsplan"
		},
		{ 
			"siteId": "9128",
			"departure": "Alléparken",
			"destination": "Alvik",
			"destinationMenuName": "Alvik"
		},
		{ 
			"siteId": "9189",
			"departure": "Gullmarsplan",
			"destination": "Sköndalsbro",
			"destinationMenuName": "Dalbobranten"
		},
		{ 
			"siteId": "1810",
			"departure": "Norra Sköndal",
			"destination": "Norsborg",
			"destinationMenuName": "Huddinge Gymnasium"
		},
		{ 
			"siteId": "7062",
			"departure": "Huddinge Gymnasium",
			"destination": "Skarpnäck",
			"destinationMenuName": "Norra Sköndal"
		},
		{ 
			"siteId": "9112",
			"departure": "Alvik",
			"destination": "Abrahamsberg",
			"destinationMenuName": "Västerledstorget"
		}
	]
};


const weatherLong         = myConfig.weather.longitude;
const weatherLat          = myConfig.weather.latitude;
const toWorkSiteId        = myConfig.departures[0].siteId;
const toWorkDestination   = myConfig.departures[0].destination;
const fromWorkSiteId      = myConfig.departures[1].siteId;
const fromWorkDestination = myConfig.departures[1].destination;
const departuresInMenu    = myConfig.departures;

const d       = new Date();
const date    = d.getDate();
const hour    = d.getHours();
const minutes = d.getMinutes();
const day     = d.getDay();
const isWeekend = (day === 6) || (day === 0); 
const isWorkTime = (!isWeekend && hour >= 9 && hour <= 18);

const body                    = document.getElementsByTagName('body')[0];
const weatherContainer        = document.getElementById('weather');
const weatherToday            = document.getElementById('weather-today');
const weatherTomorrow         = document.getElementById('weather-tomorrow');
const weatherNowIcon          = document.getElementById('weather-now-icon');
const weatherNowDegree        = document.getElementById('weather-now-degree');
const weatherNowWindspeed     = document.getElementById('weather-now-windspeed');
const weatherNowPrecipitation = document.getElementById('weather-now-precipitation');
const departureContainer      = document.getElementById('departure-container');
const routesMenu              = document.getElementById('routes-menu__ul');
const overlayMenu             = document.getElementById('routes-menu--overlay');
const ajaxLoader              = document.getElementById('ajax-loader');
const btnExpandWeather        = document.getElementById('expand-weather');
const btnRefresh              = document.getElementById('refresh');
const btnMenu                 = document.getElementById('show-routes-menu');

document.addEventListener("DOMContentLoaded", function() {
	
	let departureSiteId = isWorkTime ? fromWorkSiteId : toWorkSiteId;
	let destination     = isWorkTime ? fromWorkDestination : toWorkDestination;

	updateWeather();
  updateDepartures(departureSiteId, destination);

  
  btnRefresh.addEventListener('click', function(){
		updateDepartures(departureSiteId, destination);
  }, false);

	btnExpandWeather.addEventListener('click', function(){
		weatherContainer.classList.toggle('open');
	}, false);

	// --------------- ROUTE MENU ---------------
	for (var i = 0; i < departuresInMenu.length; i++) {
  	const menuItem = drawMenuItem(departuresInMenu[i].departure, departuresInMenu[i].destinationMenuName, i);

		routesMenu.insertAdjacentHTML('beforeend', menuItem);
  }

	btnMenu.addEventListener('click', function(){
		addClass(body, 'show-nav');
	}, false);

	overlayMenu.addEventListener('click', function() {
		removeClass(body, 'show-nav');
	}, false);

	document.addEventListener('click', function(e) {
    if(e.target.className !== 'routes-menu__link') return;
	    e.preventDefault();

    	const itemIndex = e.target.getAttribute('data-item-index');

    	departureSiteId = departuresInMenu[itemIndex].siteId;
    	destination = departuresInMenu[itemIndex].destination;

			updateDepartures(departureSiteId, destination);
	}, false);
	// --------------- /ROUTE MENU ---------------
		
});


function updateWeather() {
		  
	weatherToday.innerHTML = '';
	weatherTomorrow.innerHTML = '';
													
	let tomorrowDate = new Date();
			tomorrowDate.setDate(tomorrowDate.getDate() + 1);
			tomorrowDate = tomorrowDate.getDate();

 	const weatherRequestUrl = 'http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/'+weatherLong+'/lat/'+weatherLat+'/data.json';

	fetchData('SMHI: ', weatherRequestUrl, function(data){
		
		const weatherData = data.timeSeries;
		const weatherIconClasses = ['weather__icon--sunny', // 1
									'weather__icon--almost-sunny', // 2
									'weather__icon--semi-sunny', 	// 3
									'weather__icon--cloudy',	   // 4
									'weather__icon--cloudy',	   // 5
									'weather__icon--cloudy',	   // 6
									'weather__icon--foggy',	   		// 7
									'weather__icon--rainy',	   		// 8
									'weather__icon--thunder',	   // 9
									'weather__icon--sleety',      // 10
									'weather__icon--snowy',	   		// 11
									'weather__icon--rainy',	   		// 12
									'weather__icon--thunder',	   // 13
									'weather__icon--sleety',	   // 14
									'weather__icon--snowy'];	   //15


		for (let i = 0; i < weatherData.length; i++) {

			let loopDate = parseInt(weatherData[i].validTime.substr(8, 2));
			let loopHour = parseInt(weatherData[i].validTime.substr(11, 2));
			let degree = Math.round(weatherData[i].parameters[1].values[0]);
			let weatherIconNr = weatherData[i].parameters[18].values[0] - 1;
			let windSpeed = Math.round(weatherData[i].parameters[4].values[0]);

			let precipitationMin = weatherData[i].parameters[12].values[0];
			let precipitationMax = weatherData[i].parameters[13].values[0];
			let precipitation = (precipitationMin + precipitationMax) / 2;

			if (precipitation !== 0) {
				precipitation = precipitation.toFixed(1);
			}				
			
			if (loopDate === date) {

				if (loopHour === hour) {
					// RIGHT NOW

					addClass(weatherNowIcon, weatherIconClasses[weatherIconNr]);
					weatherNowWindspeed.insertAdjacentHTML('beforeend', windSpeed);
					weatherNowDegree.insertAdjacentHTML('beforeend', degree);
					weatherNowPrecipitation.insertAdjacentHTML('beforeend', precipitation);
				}

				if (loopHour > hour ) {
					// TODAY

					const weatherRow = drawWeatherRow(loopHour, weatherIconClasses[weatherIconNr], degree, precipitation, windSpeed);
					weatherToday.insertAdjacentHTML('beforeend', weatherRow);
				}

			} else if (loopDate === tomorrowDate && loopHour > 6) {
				// TOMORROW

				const weatherRow = drawWeatherRow(loopHour, weatherIconClasses[weatherIconNr], degree, precipitation, windSpeed);
				weatherTomorrow.insertAdjacentHTML('beforeend', weatherRow);
			}
		}		
	});
}

function updateDepartures(departureSiteId, destinationName) {
	const updatedDate = new Date();
	const updatedHour = updatedDate.getHours();
	const updatedMinutes = updatedDate.getMinutes();
	
	const myDepartures = [];
	const departureRequestUrl = 'getdepartures.php?departurestop='+departureSiteId;
	ajaxLoader.style.display = '';

	fetchData('Trafiklab: ', departureRequestUrl, function(data){
		const departures = data.ResponseData;
		ajaxLoader.style.display = 'none';
		departureContainer.innerHTML = '';

		for (let key in departures) {
			if (departures.hasOwnProperty(key)) {
				for (let i = 0; i < departures[key].length; i++) {

					if (departures[key][i].Destination && destinationName.includes(departures[key][i].Destination)) {

						myDepartures.push(departures[key][i]);
					}
				}
			}
		}	

		// sort departures on expected arrival time
		myDepartures.sort(compareExpectedDateTime);

		for (let i = 0; i < myDepartures.length; i++) {
			const destination       = myDepartures[i].Destination;
			const lineNumber        = myDepartures[i].LineNumber;
			const departureDateTime = myDepartures[i].ExpectedDateTime; 
			const transportMode     = myDepartures[i].TransportMode.toLowerCase();

			const departureDate = new Date(departureDateTime);
			const departureMs = (departureDate - updatedDate);
			const departureMins = Math.round(((departureMs % 86400000) % 3600000) / 60000);

			const timeLeft = checkDeparture(departureMins);

			if (timeLeft.length) {
				const departureRow = drawDepartureRow(lineNumber, destination, timeLeft, transportMode);
				departureContainer.insertAdjacentHTML('beforeend', departureRow);
			}
		}

		updateLog('<i class="fa fa-check"></i>Uppdaterat '+ addZero(updatedHour) +':'+ addZero(updatedMinutes), false);
	});
}

function updateLog(logMessage, isError) {
	const log = document.getElementById('log');

	log.innerHTML = '';
	log.insertAdjacentHTML('beforeend', logMessage);

	addClass(log, 'active');

	if (!isError) {
		setTimeout(function(){
			removeClass(log, 'active');
		}, 1500);	
	}	
}

function addClass(el, className) {
	if (el.classList)
		el.classList.add(className);
	else
		el.className += ' ' + className;
}

function removeClass(el, className) {
	if (el.classList)
		el.classList.remove(className);
	else
		el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function compareExpectedDateTime(a,b) {
  if (a.ExpectedDateTime < b.ExpectedDateTime)
    return -1;
  if (a.ExpectedDateTime > b.ExpectedDateTime)
    return 1;
  return 0;
}

function addZero(n) {
  return (n < 10 ? '0' : '') + n;
}

function checkDeparture(mins) {
	let s = '';

	if (mins > 0 && mins < 59) {

		s = mins + '<span class="smaller">min</span>';
	} else if (mins === 0) {

		s = 'Nu';
	}

	return s;
}


function fetchData(apiName, url, callback) {
	
	const request = new XMLHttpRequest();
		  	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			const data = JSON.parse(request.response);
			callback(data);

		} else {
			console.error('We reached our target server, but it returned an error');
			updateLog(apiName + 'server returned error...', true);
		}
	};

	request.onerror = function() {
		console.error('There was a connection error of some sort');
		updateLog(apiName + 'connection error...', true);
	};

	request.send();
}

function drawWeatherRow(hour, weatherIconClass, degree, precipitation, windSpeed) {
	let row = '';	

	row += '<div class="row--weather">';
	row += 		'<div class="col-weather col-weather--hour">';
	row += 			'<p class="weather__hour">kl<span class="hour">'+ hour +'</span></p>';
	row += 		'</div>';

	row += '	<div class="col-weather col-weather--icon">';
	row += '		<span class="weather__icon weather__icon--small '+ weatherIconClass +'"></span>';
	row += '	</div>';

	row += '	<div class="col-weather col-weather--temperature">';
	row += '		<p class="weather__temperature">';
	row += '			<span class="weather__temperature-degree">'+ degree +'</span> &#8451;';
	row += '		</p>';
	row += '	</div>';

	row += '	<div class="col-weather col-weather--precipitation">';
	row += '		<p class="weather__precipitation">';
	row += '			<span class="weather__precipitation-nr">'+ precipitation +'</span> mm';
	row += '		</p>';
	row += '	</div>';

	row += '	<div class="col-weather col-weather--wind-speed">';
	row += '		<p class="weather__wind-speed">';
	row += '			<span class="weather__wind-speed-nr">'+ windSpeed +'</span> m/s';
	row += '		</p>';
	row += '	</div>';
	row += '</div>';

	return row;
}


function drawDepartureRow(lineNumber, destination, departureTime, departureIconClass) {
	let row = '';

	row += 	'<div class="row row--departure">';
	row +=		'<div class="col-xs-2 row--departure__icon-container">';
	row +=			'<span class="departure-icon '+ departureIconClass +'"></span>';
	row +=		'</div>';

	row +=		'<div class="col-xs-5">';
	row +=			'<span class="departure__line-nr">'+ lineNumber +'</span>';
	row +=			'<span class="departure__destination">'+ destination +'</span>';
	row +=		'</div>';

	row +=		'<div class="col-xs-5">';
	row +=			'<p class="row--departure__departure-time">'+ departureTime +'</p>';
	row +=		'</div>';
	row +=	'</div>';

	return row;
}

function drawMenuItem(itemFrom, itemTo, itemIndex) {
	let item = '';

	item += '<li class="routes-menu__li">';
  item += 	'<a href="#" class="routes-menu__link" data-item-index="'+ itemIndex +'">';
  item +=     	'<span class="routes-menu__item from">'+ itemFrom +'</span>';
  item +=     	'<span class="routes-menu__arrow">&rarr;</span><br>';
  item +=     	'<span class="routes-menu__item to">'+ itemTo +'</span>';
  item += 	'</a>';
  item += '</li> ';

	return item;
}

function c(yey) {
    console.log(yey);
}