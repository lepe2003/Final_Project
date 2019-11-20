/*
Institution: Metropolitan Community Collage
Class: CSIS228
Student: Juan Ramon Lepe Manzo
Date: November 2019
Proyect: Weather
Objective: Web Site to chek weather.
	On load:
		1. Get the IP addres of the user to get geo location.
		2. Get position of the current user.
		3. Get Latitude, Longitude of the area of user.
		4. Get information information about weather
	Then:
		1. Option to get Alerts of weather
		2. Option to get weather by state
		3. Option to get images Radar.

*/

// Declare global variables
var	gobForecast ;

var	gobDaysForecast = new Array();
var garrApi = {
	  "api_ipaddress"     : "https://api.ipify.org?format=json", 				// API to get IP adress
	  "api_location"   : "http://ip-api.com/json/", 							// API to get location user
	  "api_weather_alert"    : "https://api.weather.gov/alerts/active/area/" ,	// API to get alerts weather
	  "api_weather_forecast": "https://api.weather.gov/points/",				// API to get coordinates or position/ general
	  "api_forecast":"",														// API to get specific area with details
	  "api_forescast_state":"https://api.weather.gov/stations?state="			// API to get weather by states
	};
var garrParameter = {
		"API"     : "",
		"ip"   : "", 					// IP address
		"city": "",						// City
		"city_radar": "",				// Radar City
		"country": "",					// Country of city
		"countryCode": "",				// Code of conutry
		"isp": "",						// Proveedor
		"lat": 0,						// Latitude
		"lon": 0,						// Longitude
		"org": "",						// Organitacion
		"query": "",					// Who made query
		"region": "",					// Region weather
		"regionName": "",				// Ragion Name
		"status": "",					// Status of weather
		"timezone": "",					// Time of zone
		"zip": "",						// Code Zip
		"type_query": "",				// Weather or Alarm
		"date_query":"",				// Date
		"async": true,					// Type of request
		"timeout":2000					// Time of of the request
};
var garrDay_Week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

//Class with metods and functions
var gObjectsClass = {
	_getHttpRequest : function  (parrParameter)
	{
			var lobReturn;
			try{

				var req = new XMLHttpRequest();
				var strURL ="";
				//Apply API according request
				switch(parrParameter.API) {
					  case "api_ipaddress":
						garrParameter.async = false;
						strURL = garrApi.api_ipaddress ;
						break;
					  case "api_location":
						garrParameter.async = false;
						strURL = garrApi.api_location + parrParameter.ip;
						break;
					  case "api_weather_alert":
						strURL = garrApi.api_weather_alert + parrParameter.city;
						break;
					  case "api_weather_forecast":
						strURL = garrApi.api_weather_forecast + parrParameter.lat + "," + parrParameter.lon;
						break;
					  case "api_forescast_state":
					  	strURL = garrApi.api_forescast_state+ parrParameter.city;
						break;
					  case "api_forecast":
					  	strURL = garrApi.api_forecast;
						break;
					  default:
						event.preventDefault();
						return false;
				}
				//Set timeout of request
				req.ontimeout = function () {
					req.abort()
					showError("The request is timed out.");
				};

				// Do request
				req.onload = function() {
					if (req.readyState === 4) {
						if (req.status === 200) {
							// Create array with data
							var lobData = jQuery.parseJSON ( req.responseText );
							lobReturn =  lobData;
							if (lobData.constructor.keys(lobData)) gObjectsClass._fillData(lobData);
						} else {
							req.abort();
							console.error(req.statusText);
						}
					}
				};

				// Open HTTP
				req.open('GET',strURL,garrParameter.async);
				if (parrParameter.async) req.timeout =  parrParameter.timeout;
				req.send(null);
				event.preventDefault();

			}catch( error)
			{
				event.preventDefault();
				showError(error);
				return false;
			}finally
			{
				return lobReturn;
			}
	},

	// Create array forescast
	_arrDaysforecast : function()
	{
			var obDate = new Date();

			// Day of week
			var arrWeek = new Array();
			for (var i=0; i<5;i++)
			{
				gobDaysForecast[i] = garrDay_Week[obDate.getDay()]+"|"+obDate.getUTCFullYear()+"-"+(obDate.getUTCMonth()+1)+"-"+((obDate.getDate()<10) ? '0' + obDate.getDate(): obDate.getDate());
				obDate.setDate(obDate.getDate() + 1);
			}
	},


	//Show days forcast
	_showDaysforecast : function ()
	{
		var day_week="";
		var obTagLi ;
		var obTagA
		var strText ;
		var obH1 ;
		var obHeading ;
		var container = document.getElementById("tab_days_forecast");
		container.innerHTML = "";

		document.getElementsByClassName("heading_city")[0].innerHTML = garrParameter.city + " - "+garrParameter.regionName;

		for (var i=0; i<gobDaysForecast.length;i++)
		{
			day_week = gobDaysForecast[i].split("|")[0].toLowerCase();
			// Create node type Element
			 obTagLi = document.createElement("li");
			 obTagA = document.createElement("a");
			 obTagA.setAttribute("name", "tab_day_"+day_week );
			 obTagA.setAttribute("href", "javascript://none" );
			 obTagA.setAttribute("class", (i==0)? "tab_day active":"tab_day");

			 obTagA.addEventListener("click",function() {
				gObjectsClass._activeDay(this);

        	});

			strText = document.createTextNode(gobDaysForecast[i].split("|")[0]);
			obTagA.appendChild(strText);
			obTagLi.appendChild(obTagA);
			container.appendChild(obTagLi);
		}

	},

	// Activate current or selected Day
	_activeDay: function(activeDay)
	{

		gObjectsClass._cleanDays();
		activeDay.setAttribute("class", "tab_day active");
		document.getElementById(activeDay.text.toLocaleLowerCase()).setAttribute("style", "display: block");
	},

	// Show details of advice forecast
	_showDetailsforecast : function ()
	{
		var container ;
		var strWeather_item="";
		var is_element_of_day= false;
		var complete_elements = 0;

		//loop for week (monday to friday)
		for (var i=0; i<gobDaysForecast.length;i++)
		{
			container = document.getElementById(gobDaysForecast[i].split("|")[0].toLowerCase());
			container.getElementsByClassName("row")[0].innerHTML = "";

			if (i==0) container.setAttribute("style", "display: block");;

			//loop for elements of weather
			for (var i_details=0; i_details<gobForecast.properties.periods.length; i_details++)
			{
				is_element_of_day = function ()
					{
						//look for same date by YYYY-mm-dd
						if (
							gobForecast.properties.periods[i_details].startTime.indexOf(gobDaysForecast[i].split("|")[1])>=0
							) return true;

						//look for the same day by name
						if (
							gobForecast.properties.periods[i_details].name.toLowerCase().indexOf(gobDaysForecast[i].split("|")[0])>=0
							) return true;
					}

				//Validation of date and day of week
				if (is_element_of_day())
				{
					document.getElementById(container.id+"_date").innerHTML = "Date: "+gobForecast.properties.periods[i_details].startTime.substr(0,10);
					strWeather_item += this._DetailHTML(gobForecast.properties.periods[i_details]);
					complete_elements++;
				}
				if (complete_elements==2) break;

			}

			// create HTML with forcast day
			container.getElementsByClassName("row")[0].innerHTML = strWeather_item; strWeather_item="";
			complete_elements = 0;
		}

	},

	//Create HTML for weather
	_DetailHTML : function (parrData)
	{
		var iconWeather = function (desWeather)
		{

			if (desWeather.indexOf("snow",0)>=0)
			{
				return "weather-icon-04.png";
			}
			else if(desWeather.indexOf("sunny",0)>=0)
			{
				return "weather-icon-03.png";
			}
			else if(desWeather.indexOf("clear",0)>=0)
			{
				return "weather-icon-03.png";
			}
			else if(desWeather.indexOf("rain",0)>=0)
			{
				return "weather-icon-01.png";
			}
			else if(desWeather.indexOf("cloudy",0)>=0)
			{
				return "weather-icon-02.png";
			}
			else
			{
				return "weather-icon-03.png";
			}
		};

		return  		"				<div class='col-md-4-weather'>"+
                        "                          <div class='weather-item' >"+
                        "                              <h6 >"+((parrData.isDaytime) ? "Day":"Ningth")+"</h6>"+
                        "                              <div class='weather-icon'>"+
                        "                                  <img src='img/"+iconWeather(parrData.shortForecast.toLocaleLowerCase())+"' alt=''>"+
                        "                              </div>"+
                        "                              <span id=>"+parrData.temperature+"&deg;"+parrData.temperatureUnit+"</span>"+
                        "                              <ul class='time-weather'>"+
                        "                                  <li> Forecast<span  title='"+parrData.detailedForecast+"'>"+(parrData.shortForecast.length>=15 ? parrData.shortForecast.substr(0,15)+"..":parrData.shortForecast)+"</span></li>"+
                        "                                  <li>Win direcction <span>"+parrData.windDirection+"</span></li>"+
                        "                                  <li>Wind speed<span>"+parrData.windSpeed+"</span></li>"+
                        "                              </ul>"+
                        "                          </div>"+
                        "                      </div>"+
                        "				</div>"+
						"";

  	},
  	//Clear tab days and elements on it
  	_cleanDays : function ()
  	{
		 for (var i=0; i<gobDaysForecast.length;i++)
		 {
			document.getElementsByName("tab_day_"+gobDaysForecast[i].split("|")[0].toLowerCase())[0].setAttribute("class", "tab_day");
			document.getElementById(gobDaysForecast[i].split("|")[0].toLowerCase()).setAttribute("style", "display: none");
		 }
	},
	// Fill data from request
	_fillData : function(parrData)
	{
		for (var i = 0; i <parrData.constructor.keys(parrData).length;i++)
		{
			garrParameter[parrData.constructor.keys(parrData)[i]] = parrData[parrData.constructor.keys(parrData)[i]];
		}
	}
}

// Setup page
var setup_page = function (){

	try{
		var larrParameter = garrParameter;
		var lobData ;
		var days_forecast ;

		//IP user
		larrParameter.API = garrApi.constructor.keys(garrApi)[0];
		lobData = gObjectsClass._getHttpRequest(larrParameter);

		//location by IP adress
		larrParameter.API = garrApi.constructor.keys(garrApi)[1];
		lobData = gObjectsClass._getHttpRequest(larrParameter);

		//forecast
		larrParameter.API = garrApi.constructor.keys(garrApi)[3];
		lobData= gObjectsClass._getHttpRequest(larrParameter);

		//forecast by zone
		larrParameter.API = garrApi.constructor.keys(garrApi)[4];
		garrApi.api_forecast= lobData.properties.forecast;
		gobForecast = gObjectsClass._getHttpRequest(larrParameter);

		//Create array with day for week
		gObjectsClass._arrDaysforecast();

		// show days
		gObjectsClass._showDaysforecast();

		// Show detail of weather
		gObjectsClass._showDetailsforecast();
	}catch( error)
	{
		showError(error);
		 showLoader(0);
	}
}

// Load page and create listeners
function load_page(){

	try{

		// Set calendar for 5 next days
		$( "#dateSelected" ).datepicker({ minDate: -0, maxDate: "+4D" });

		//Show image loading
		showLoader (1);

		// Add events for objects
		document.getElementById('form-submit').addEventListener('submit',requestData,false);

		// Add event for each option
		var radios = document.querySelectorAll('input[type=radio][name="type_query"]');
		Array.prototype.forEach.call(radios, function(radio) {
		   radio.addEventListener('change', verifyQuery);
		});

		document.getElementById('city').addEventListener('change',
		  function(){
		    garrParameter.regionName = this.options[document.getElementById('city').selectedIndex].text;
  		});

		setup_page();

	}catch( error)
	{
		showError(error);
		 showLoader(0);
	}finally
	{
		//Hide image loading
		showLoader (0);
	}
}

// Validate values in form
function validateForm()
{
	try {

		garrParameter.city = document.getElementById("city").value;
		garrParameter.type_query = $('input[name=type_query]:checked').attr('value');;
		garrParameter.date_query = document.getElementById("dateSelected").value;


		// Weather Option
		if (garrParameter.type_query == "weather")
		{
			if ( garrParameter.city == ""  ||  garrParameter.type_query == "" || garrParameter.date_query == "" )
			{
				window.alert("Please, select options to see weather.");
				return false;
			}
		}
		// Alert Option
		else if (garrParameter.type_query == "alerts")
		{
			if ( garrParameter.city == ""  )
			{
				window.alert("Please, select an area to see Alerts.");
				return false;
			}
		}
		// Radar Option
		else if (garrParameter.type_query == "radar")
		{
			garrParameter.city_radar = document.getElementById("city_radar").value;
			var city_radar = garrParameter.city_radar.split("-");
			if (city_radar.length ==1)
			{
				window.alert("Select a Station to see image.");
				return false;
			}
		}

	}catch( error)
	{
		showError(error);
		 showLoader(0);
	}
}

// Request API's
function requestData( event ) {
		 try{
			var larrParameter = garrParameter;
			var lobData ;
			showLoader(1);

			// Weather Option
			if (larrParameter.type_query == "weather")
			{

				// Set Date selected
				var obDate = new Date();
				obDate.setFullYear(garrParameter.date_query.split("/")[2], (garrParameter.date_query.split("/")[0]-1), garrParameter.date_query.split("/")[1]);

				var dayWeek = document.getElementsByName("tab_day_"+garrDay_Week[obDate.getDay()].toLowerCase());

				gObjectsClass._cleanDays()
				//get ubication by state
				larrParameter.API = garrApi.constructor.keys(garrApi)[5];
				lobData = gObjectsClass._getHttpRequest(larrParameter);

				if (lobData.features.length == 0){window.alert("Not data for this option.");return false;}

				//get forecast by cordinates
				larrParameter.API = garrApi.constructor.keys(garrApi)[3];
				garrApi.lat= lobData.features[0].geometry.coordinates[0];
				garrApi.lon= lobData.features[0].geometry.coordinates[1];
				lobData = gObjectsClass._getHttpRequest(larrParameter);

				//get detail by zone
				larrParameter.API = garrApi.constructor.keys(garrApi)[4];
				garrApi.api_forecast= lobData.properties.forecast;
				gobForecast = gObjectsClass._getHttpRequest(larrParameter);

				// Create five last days of week
				gObjectsClass._showDaysforecast();

				// Create detail of weather
				gObjectsClass._showDetailsforecast();

				//Show day selected
				gObjectsClass._activeDay(dayWeek[0]);
				$('html, body').animate({scrollTop:$('#weather')[0].scrollHeight}, 'slow');

			// Alerts Option
			}else if (larrParameter.type_query == "alerts"){

				var texta="";
				var objdivData = document.getElementById("bd-alert");
				objdivData.innerHTML = "";

				//forecast_zone API
				larrParameter.API = garrApi.constructor.keys(garrApi)[2];
				gobForecast = gObjectsClass._getHttpRequest(larrParameter);

				if (gobForecast.features.length==0) objdivData.innerHTML = "<div class='row'><div class='col-sm-12'>No alerts in this area</div></div>";
				for (var i=0; i<gobForecast.features.length;i++)
				{

				  texta= "<div class='row'>"+
					"<div class='col-sm-12'>"+
					  "<span class='label_alert' style='color: brown'>Alert "+(i+1)+": </span>"+gobForecast.features[i].properties.event +

					  "<div class='row'>"+
						"<div class='col-sm-12'><span class='label_alert'>Description: </span>"+gobForecast.features[i].properties.description+
						"</div>"+
					  "</div>"+

					  "<div class='row'>"+
						"<div class='col-sm-12'>"+
						  "<span class='label_alert'>Instruction: </span>"+gobForecast.features[i].properties.instruction+
						"</div>"+
					  "</div>"+

					  "<div class='row'>"+
						"<div class='col-sm-12'>"+
						  "<span class='label_alert'>Areas affected: </span>"+gobForecast.features[i].properties.areaDesc+
						"</div>"+
					  "</div>"+

					  "<div class='row'>"+
						"<div class='col-4 col-sm-6'>"+
						"<span class='label_alert'>Urgency: </span>"+gobForecast.features[i].properties.urgency+"<br><span class='label_alert'>Status: </span>"+gobForecast.features[i].properties.severity+"</td>"+
						"</div>"+
						"<div class='col-4 col-sm-6'>"+
						"<span class='label_alert'>Effective: </span>"+gobForecast.features[i].properties.effective+"<br><span class='label_alert'>Expires: </span>"+gobForecast.features[i].properties.expires+"</td>"+
						"</div>"+
					  "</div>"+


					"</div>"+
				  "</div>";

					objdivData.innerHTML += texta;
					texta=+"";
				}
				$('#btn_alerts').click();

			// Radar Option
			}else if (larrParameter.type_query == "radar"){

				var texta="";
				var objdivData = document.getElementById("radarImages");
				objdivData.innerHTML = "";

				//Radar API
				larrParameter.API = "";
				gobForecast = gObjectsClass._getHttpRequest(larrParameter);

				var city_radar = larrParameter.city_radar.split("-");
				var clve_radar = city_radar[0].replace(" ","");

				// title Radar
				document.getElementsByClassName("heading_radar")[0].innerHTML = city_radar[1];

				texta= ""+
				"<div id='radar_more_datails'>"+
				"	<div class='row'>"+
				"		<div id='bkg_radar_modetails' >"+
				"			<div id='image0' style='visibility: visible; position: absolute;'><img style='z-index:0' src='https://radar.weather.gov/ridge/Overlays/Topo/Short/"+clve_radar+"_Topo_Short.jpg' ></div>"+
				"			<div id='image1' style='visibility: visible;position: absolute;'><img style='z-index:1' src='https://radar.weather.gov/ridge/RadarImg/N0R/"+clve_radar+"_N0R_0.gif' name='conditionalimage' ></div>"+
				"			<div id='image2' style='visibility: visible;position: absolute;'><img style='z-index:2' src='https://radar.weather.gov/ridge/Overlays/County/Short/"+clve_radar+"_County_Short.gif' ></div>"+
				"			<div id='image3' style='visibility: hidden;position: absolute;'><img style='z-index:3' src='https://radar.weather.gov/ridge/verlays/Rivers/Short/"+clve_radar+"_Rivers_Short.gif' ></div>"+
				"			<div id='image4' style='visibility: visible;position: absolute;'><img style='z-index:4' src='https://radar.weather.gov/ridge/Overlays/Highways/Short/"+clve_radar+"_Highways_Short.gif' ></div>"+
				"			<div id='image5' style='visibility: visible;position: absolute;'><img style='z-index:5' src='https://radar.weather.gov/ridge/Overlays/Cities/Short/"+clve_radar+"_City_Short.gif' ></div>"+
				"			<div id='image6' style='visibility: visible;position: absolute;'><img style='z-index:6' src='https://radar.weather.gov/ridge/Warnings/Short/"+clve_radar+"_Warnings_0.gif' border='0' ></div>"+
				"			<div id='image7' style='visibility: visible;position: absolute;'><img style='z-index:7' src='https://radar.weather.gov/ridge/Legend/N0R/"+clve_radar+"_N0R_Legend_0.gif' border='0' name='conditionallegend' ></div>"+
				"		</div>"+
				"	</div>"+
				"</div>";

				objdivData.innerHTML += texta;
				$('html, body').animate({scrollTop:$('#radarHTML')[0].scrollHeight}, 'slow');

			}

		}catch(   error)
		{
			showError(error);
			 showLoader(0);
		}finally
		{
			 showLoader(0);
		}
}

// Function Errors
function showError(error)
{
	document.write("<html><p>"+error+"</p><br><a href='index.html'> Click back</a></html>" );
}

//Show/Hide image loader
function showLoader(onOff)
{
	switch(onOff) {
	  case 0: // off
    	$(".loader").fadeOut("slow");
    	document.getElementsByClassName("loader")[0].setAttribute("style","none");
	    break;

	  case 1: //on
    	$(".loader").fadeIn("slow");
 		document.getElementsByClassName("loader")[0].setAttribute("style","display: block");
	    break;

	  default: //default off
 		document.getElementsByClassName("loader")[0].setAttribute("style","none");
	}
}

function verifyQuery(event)
{

	//Default screen
	document.getElementById("col_city_radar").setAttribute("style","display: none");
	document.getElementById("col_city").setAttribute("style","display: none");
	document.getElementById("col_dateSelected").setAttribute("style","display: none");
	document.getElementById("radarHTML").setAttribute("style","display: none");
	document.getElementById("weather").setAttribute("style","display: block");

   if ( this.value === 'alerts' ) { // Elements to get Alerts
 		document.getElementById("col_city").setAttribute("style","display: block");
   } else if ( this.value === 'weather' ) { // Elements to get weather
 		document.getElementById("col_city").setAttribute("style","display: block");
 		document.getElementById("col_dateSelected").setAttribute("style","display: block");
   } else if ( this.value === 'radar' ) { // Elements to get Images Radar
 		document.getElementById("col_city_radar").setAttribute("style","display: block");
		document.getElementById("radarHTML").setAttribute("style","display: block");
		document.getElementById("weather").setAttribute("style","display: none");
   }

}

// Create listener load page
if (window.addEventListener) {
   window.addEventListener("load", load_page, false);
} else if (window.attachEvent) {
   window.attachEvent("onload", load_page);
}


