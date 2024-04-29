//Global Variables//
var parksInformation = false;
var parksShapes = false;
let parkNames;
let deduplicatedParks;
var southwarkParksShapes = false;
var popup = new maplibregl.Popup({closeOnClick: false});
let searchBar = document.getElementById("map_view_search_bar");

//Dropdown Menu for Mobile//
function dropdownMenu(x) {
    let dropdownBackground = document.getElementById("dropdown_background");
    if (dropdownBackground.style.display === "flex"){
        dropdownBackground.style.display = "none";
    }
    else{
        dropdownBackground.style.display = "flex";
    };
    let navOptions = document.getElementById("nav_container");
    if(navOptions.style.display === "flex"){
        navOptions.style.display = "none";
    }
    else{
        navOptions.style.display = "flex";
    }
    x.classList.toggle("changeDropdown");
};

//Base Map Set Up//
const bounds = [
    [-0.6169495524080867,51.25653223074311], // Southwest coordinates
    [0.40065908656101884,51.72595361089737] // Northeast coordinates
];
var mapContainer = document.getElementById('map');
var map = new maplibregl.Map({
    container: mapContainer, 
    style: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json', 
    center: [-0.0670045430832684,51.47066260405178], 
    zoom: 12,
    maxBounds: bounds
});

//Status Polygon Colours//
var statusOpenColor = "#50b848";
document.getElementById("status_open").style = `background-color: ${statusOpenColor}`;
document.getElementById("alterations_unchanged").style = `background-color: ${statusOpenColor}`;
var statusDefunctColor = "#ff4c3f";
document.getElementById("status_defunct").style = `background-color: ${statusDefunctColor}`;
var statusUnderThreatColor = "#fee400";
document.getElementById("status_under_threat").style = `background-color: ${statusUnderThreatColor}`;
document.getElementById("alterations_under_threat").style = `background-color: ${statusUnderThreatColor}`

//Year Opened Polygon Colours//
var yoBefore1850Color = "#FA2DFF";
document.getElementById("yo_before1850").style = `background-color: ${yoBefore1850Color}`;
var yo1850to1874Color = "#FD70FF";
document.getElementById("yo_1850to1874").style = `background-color: ${yo1850to1874Color}`;
var yo1875to1899Color = "#FEC7FF";
document.getElementById("yo_1875to1899").style = `background-color: ${yo1875to1899Color}`;
var yo1900to1924Color = "#00A3FF";
document.getElementById("yo_1900to1924").style = `background-color: ${yo1900to1924Color}`;
var yo1925to1949Color = "#45BBFD";
document.getElementById("yo_1925to1949").style = `background-color: ${yo1925to1949Color}`;
var yo1950to1974Color = "#A2DEFF";
document.getElementById("yo_1950to1974").style = `background-color: ${yo1950to1974Color}`;
var yo1975to1999Color = "#D1EEFF";
document.getElementById("yo_1975to1999").style = `background-color: ${yo1975to1999Color}`;
var yo2000to2024Color = "#AAA30D";
document.getElementById("yo_2000to2024").style = `background-color: ${yo2000to2024Color}`;

//Alterations Polygon Colours//
var alterationsExpandedColor = "#62d0fb";
document.getElementById("alterations_expanded").style = `background-color: ${alterationsExpandedColor}`;
var alterationsShrunkColor = "#ff4c3f";
document.getElementById("alterations_shrunk").style = `background-color: ${alterationsShrunkColor}`;

//View Modes// 
var parkStatusViewMode = {
    id : "park_status_layer",
    type : "fill",
    source : "parkShapesSource",
    paint : {
        'fill-color' : [
            'match',
            ['get', 'status'],
            'Open', statusOpenColor,
            'Defunct', statusDefunctColor,
            'Under Threat', statusUnderThreatColor,
            '#5A5AE2'
        ],
        'fill-opacity' : 0.8
    }
};
var yearOpenedViewMode = {
    id : "year_opened_layer",
    type : "fill",
    source : "parkShapesSource",
    paint : {
        "fill-color" : [
            "match",
            ["get", "period_opened"],
            "Before 1850", yoBefore1850Color,
            "1850-1874", yo1850to1874Color,
            "1875-1899", yo1875to1899Color,
            "1900-1924", yo1900to1924Color,
            "1925-1949", yo1925to1949Color,
            "1950-1974", yo1950to1974Color,
            "1975-1999", yo1975to1999Color,
            "2000-2024", yo2000to2024Color,
            "#000000"
        ],
        'fill-opacity' : 0
    }
};
var underThreatParksLayer = {
    id : "under_threat_park_areas",
    type : "fill",
    source : "parksAlterationsSource",
    paint : {
        "fill-color" : statusUnderThreatColor ,
        "fill-opacity" : 0
    },
    filter : ["==", ["get", "alteration"], "Under Threat"],
   
}
var shrunkParksLayer = {
    id : "shrunk_park_areas",
    type : "fill",
    source : "parksAlterationsSource",
    paint : {
        "fill-color" : alterationsShrunkColor,
        "fill-opacity" : 0
    },
    filter : ["==", ["get", "alteration"], "Shrunk"],
   
}
var alterationParksLayer = {
    id : "park_alterations",
    type : "fill",
    source : "parkShapesSource",
    paint : {
        "fill-color" : [
            "match",
            ["get", "alteration"],
            "Unchanged", statusOpenColor,
            "Expanded", alterationsExpandedColor,
            "Shrank", statusOpenColor,
            "Closed", statusDefunctColor,
            "Uncertain", statusOpenColor,
            "#000000"
        ],
        "fill-opacity" : 0,
        
    }
}
var expandedParksLayer = {
    id : "expanded_park_areas",
    type : "fill",
    source : "parksAlterationsSource",
    paint :  {
        "fill-color" : statusOpenColor,
        "fill-opacity" : 0
    },
    filter : ["==", ["get", "alteration"], "Expanded"]
} 
// function openParkOverlayfromListView(){
//      let park_data_string = window.localStorage.getItem("list_view_clicked_park");
//     console.log(park_data_string);
//     if(park_data_string){
//         console.log(JSON.parse(park_data_string));    
//     }
// }
function checkStorage(){
    var localStorageContent = window.localStorage.getItem("list_view_clicked_park");
    if(localStorageContent){
        var listViewParkData = JSON.parse(localStorageContent);
        var park_data = getParkData(listViewParkData);
        openParkOverlay(undefined, park_data);
        window.localStorage.setItem("list_view_clicked_park", "");
       
    }
    else{
        launchPopup.style.display = "block";
    }
}
map.on('load', () =>{

    // fetch('./data_files/london_parks_info.json')
    // .then(response => response.json())
    // .then(response => {
    //     parksInformation = response;
    //     console.log(parksInformation);
    // })
    fetch('./data_files/park_shapes_source.json')
    .then(response => response.json())
    .then(response => {
        parksShapes = response;
        console.log(parksShapes);
        deduplicatedParks = parksShapes.features.reduce((accumulator, current) =>{
            if(!accumulator.find((item) => item.properties.name === current.properties.name)){
                accumulator.push(current);
            }
            return accumulator;
        }, 
        []);
        console.log(deduplicatedParks);
        parkNames = deduplicatedParks.map(feature => feature.properties.name);
        console.log(parkNames);
    });
    map.addSource("parkShapesSource",{
        type : "geojson",
        data : './data_files/park_shapes_source.json'
    })
    map.addSource("boroughs_shapes",{
        type : "geojson",
        data : './data_files/uk_local_district_boundaries.json'            
    })
    map.addSource("parksAlterationsSource",{
        type : "geojson",
        data : "./data_files/parks_alterations_source.json"
    });

    map.addLayer({
        id : "boroughs_line_layer",
        type : "line",
        source : "boroughs_shapes",
        paint : {
            "line-opacity" : 0.5,
            "line-color" : "#000000",
            "line-width" : 2.5
        }
    })
    map.addLayer(parkStatusViewMode);
    map.addLayer(yearOpenedViewMode);
    map.addLayer(shrunkParksLayer);
    map.addLayer(alterationParksLayer);
    map.addLayer(expandedParksLayer);
    map.addLayer(underThreatParksLayer);
   checkStorage();
  
})

//Functions that assign colours depending on different values. (Used for the colour coded boxes in the popups)//

function setOpeningDateColor(clickedParkPeriod){
    let returnColor;
    switch(clickedParkPeriod){
        case "Before 1850":
            returnColor = yoBefore1850Color;
            break;
        case "1850-1874":
            returnColor = yo1850to1874Color;
            break;
        case "1875-1899":
            returnColor = yo1875to1899Color;
            break;
        case "1900-1924":
            returnColor = yo1900to1924Color;
            break;
        case "1925-1949":
            returnColor = yo1925to1949Color;
            break;
        case "1950-1974":
            returnColor = yo1950to1974Color;
            break;
        case "1975-1999":
            returnColor = yo1975to1999Color;
            break;
        case "2000-2024":
            returnColor = yo2000to2024Color;
            break;
        default:
            returnColor = "#000000";
    }
    return returnColor;
}
function setStatusColor(clickedParkStatus){
    let returnColor;
    switch(clickedParkStatus){
        case "Open":
            returnColor = statusOpenColor;
            break;
        case "Under Threat":
            returnColor = statusUnderThreatColor;
            break;
        case "Defunct":
            returnColor = statusDefunctColor;
            break;
        default:
            returnColor = "#000000";
    }
    return returnColor;
};
function setAlterationColor(clickedParkAlteration){
    let returnColor;
    switch(clickedParkAlteration){
        case "Unchanged":
            returnColor = statusOpenColor;
            break;
        case "Under Threat":
            returnColor = statusUnderThreatColor;
            break;
        case "Expanded":
            returnColor = alterationsExpandedColor;
            break;
        case "Shrank":
            returnColor = statusDefunctColor;
            break;
        default:
            returnColor = "#000000";
    }
    return returnColor;
}

//PopUps//
let clickedPark_acres;
let rounded_area;

function determineParkZoom(parkArea){
    if(window.innerWidth >= 1200){
        if(parkArea >=0 && parkArea < 1){
            return 18;
         }
         else if(parkArea >= 1 && parkArea < 2.5){
            return 17;
         }
         else if(parkArea >= 2.5 && parkArea < 4){
            return 16.5;
         }
         else if(parkArea >= 4 && parkArea < 10){
            return 16;
         }
         else if(parkArea >=10 && parkArea < 25){
            return 15.5;
         }
         else if(parkArea >=25 && parkArea < 75){
            return 15;
         }
         else{
             return 14;
         };
    } else if(window.innerWidth >= 900 && window.innerWidth < 1200){
        if(parkArea >=0 && parkArea < 1){
            return 17.5;
         }
         else if(parkArea >= 1 && parkArea < 2.5){
            return 16.5;
         }
         else if(parkArea >= 2.5 && parkArea < 4){
            return 16;
         }
         else if(parkArea >= 4 && parkArea < 10){
            return 15.5;
         }
         else if(parkArea >=10 && parkArea < 25){
            return 15;
         }
         else if(parkArea >=25 && parkArea < 75){
            return 14.5;
         }
         else{
             return 13.7;
         };
    } else if(window.innerWidth < 400){
        if(parkArea >=0 && parkArea < 1){
            return 17;
        }
        else if(parkArea >= 1 && parkArea < 2.5){
        return 15.5;
        }
        else if(parkArea >= 2.5 && parkArea < 4){
        return 16;
        }
        else if(parkArea >= 4 && parkArea < 10){
        return 15.5;
        }
        else if(parkArea >=10 && parkArea < 25){
        return 15;
        }
        else if(parkArea >=25 && parkArea < 75){
        return 13.5;
        }
        else{
            return 13;
        };
    }
    else {
        if(parkArea >=0 && parkArea < 1){
            return 17;
         }
         else if(parkArea >= 1 && parkArea < 2.5){
            return 16.3;
         }
         else if(parkArea >= 2.5 && parkArea < 4){
            return 16;
         }
         else if(parkArea >= 4 && parkArea < 10){
            return 15;
         }
         else if(parkArea >=10 && parkArea < 25){
            return 14.5;
         }
         else if(parkArea >=25 && parkArea < 75){
            return 13.8;
         }
         else{
             return 13.4;
         };
    };       
};
function determineLongitudeDiscrepancy(parkArea){
    if(window.innerWidth >= 1200){

        if(parkArea >= 0 && parkArea < 1){
            return -0.0008;
        }
        else if(parkArea >= 1 && parkArea < 4){
            return -0.002;
        }
        else if(parkArea >= 4 && parkArea < 25){
            return -0.004;
        }
        else if(parkArea >= 25 && parkArea < 75){
            return -0.007;
        }
        else{
            return -0.015;
        }
    } 
    else if (window.innerWidth >= 900 && window.innerWidth < 1200){
        if(parkArea >= 0 && parkArea < 1){
            return -0.0008;
        }
        else if(parkArea >= 1 && parkArea < 4){
            return -0.002;
        }
        else if(parkArea >= 4 && parkArea < 25){
            return -0.004;
        }
        else if(parkArea >= 25 && parkArea < 75){
            return -0.006;
        }
        else{
            return -0.014;
        }
    }
    else{
        if(parkArea >= 0 && parkArea < 1){
            return -0.00008;
        }
        else if(parkArea >= 1 && parkArea < 4){
            return -0.0003;
        }
        else if(parkArea >= 4 && parkArea < 25){
            return -0.000006;
        }
        else if(parkArea >= 25 && parkArea < 75){
            return -0.00002;
        }
        else{
            return -0.001;
        }
    }
}
function determineLatitudeDiscrepancy(parkArea){
    if(window.innerWidth >= 400 && window.innerWidth < 900){
        if(parkArea >= 0 && parkArea < 1){
            return -0.0006;
        }
        else if(parkArea >= 1 && parkArea < 4){
            return -0.0009;
        }
        else if(parkArea >= 4 && parkArea < 25){
            return -0.0028;
        }
        else if(parkArea >= 25 && parkArea < 75){
            return -0.005;
        }
        else{
            return -0.005;
        }
    }
    else if(window.innerWidth < 400) {
        if(parkArea >= 0 && parkArea < 1){
            return -0.0003;
        }
        else if(parkArea >= 1 && parkArea < 4){
            return -0.0004;
        }
        else if(parkArea >= 4 && parkArea < 25){
            return -0.0007;
        }
        else if(parkArea >= 25 && parkArea < 75){
            return -0.003;
        }
        else{
            return -0.003;
        }
    }
    else {
        return 0;
    };
};

map.on('click', 'park_status_layer', (e) => {
    const clickedFeatures = map.queryRenderedFeatures(e.point, { layers : ['park_status_layer']})
    let my_data = getParkData(clickedFeatures[0]);
    console.log('data:', my_data);
    let clickedParkName = clickedFeatures[0].properties.name;
    let clickedParkLongitude = clickedFeatures[0].properties.longitude;
    let clickedParkLatitude = clickedFeatures[0].properties.latitude;
    let clickedParkOpeningPeriod = clickedFeatures[0].properties.period_opened;
    let clickedParkStatus = clickedFeatures[0].properties.status;
    let clickedParkAlterations = clickedFeatures[0].properties.alteration;
    let clickedParkOtherNames = clickedFeatures[0].properties.other_names;
    let clickedParkHistory = clickedFeatures[0].properties.brief_history;
    let clickedParkSize = clickedFeatures[0].properties.size;
    let zoomLevel = determineParkZoom(clickedParkSize);
    let longitudeDiscrepancy = determineLongitudeDiscrepancy(clickedParkSize);
    let latitudeDiscrepancy = determineLatitudeDiscrepancy(clickedParkSize);
    let clickedParkCoordinates =  {lng: clickedFeatures[0].properties.longitude + longitudeDiscrepancy, lat: clickedFeatures[0].properties.latitude + latitudeDiscrepancy};
    console.log(clickedParkSize);
    console.log(latitudeDiscrepancy);
   
    let openingPeriodColor = setOpeningDateColor(clickedParkOpeningPeriod);
    let statusColor = setStatusColor(clickedParkStatus);
    let alterationsColor = setAlterationColor(clickedParkAlterations);
  
    // let data = {
    //     color: alterationsColor
    // }

    // document.dispatchEvent(new CustomEvent("kaneiscool", {
    //     detail: data
    // }));
    
    console.log(longitudeDiscrepancy);
   
    popup.setLngLat(e.lngLat).setHTML(
        `
        <div class="popup_container">
            <h3 class="popup_park_name">${clickedParkName}</h3>
            <p class="popup_coordinates">${clickedParkLatitude}, ${clickedParkLongitude}</p>
            <div class="popup_info_section">
                <div class="popup_info_row">
                    <p class="popup_info_type">Opened:</p>
                    <div class="popup_info_box popup_opening_period" style="background-color:${openingPeriodColor}">
                        <p class="popup_info_text">${clickedParkOpeningPeriod}</p>
                    </div>
                </div>
                <div class="popup_info_row">
                    <p class="popup_info_type">Status:</p>
                    <div class="popup_info_box pop_up_status" style="background-color:${statusColor}">
                        <p class="popup_info_text">${clickedParkStatus}</p>
                    </div>
                </div>
                <div class="popup_info_row">
                    <p class="popup_info_type">Alterations: </p>
                    <div class="popup_info_box popup_alterations" style="background-color:${alterationsColor}">
                        <p class="popup_info_text">${clickedParkAlterations}</p>
                    </div>
                </div>
            </div>
            <button id="tell_me_more_button">Tell Me More</button>
        </div>
        
        `
    ).addTo(map)
    

    document.getElementById("tell_me_more_button").addEventListener("click", (evt) => { openParkOverlay(evt, my_data) });
});

function showHideOtherNames(clickedPark, clickedParkOtherNames){
    let parkInfoOtherNames = document.getElementById("park_info_overlay_other_names");

    if (clickedPark === ""){
        parkInfoOtherNames.style.display = "none";
    }
    else{
        parkInfoOtherNames.style.display = "flex";
        parkInfoOtherNames.innerHTML = `Other Names: ${clickedParkOtherNames}`;
    }
};
function historyDescription(clickedPark, clickedParkName, clickedParkHistory){
    let parkInfoHistory = document.getElementById("park_info_overlay_history_text");

    if (clickedPark === ""){
        parkInfoHistory.innerHTML = `The history of ${clickedParkName} is yet to be discovered by the London Parkive!`
    }
    else{
        parkInfoHistory.innerHTML = clickedParkHistory;
    }
}

let parkInfoOverlay = document.getElementById("parks_information_overlay_container");

function closeOverlay(){
    let accessMode = window.localStorage.getItem("map_access_mode");
    let launchPopup = document.getElementById("launchPopup");
    if(accessMode === "from_list_view"){
        var baseurl = window.location.pathname;
        var spliturl = baseurl.split("index.html");
        var targeturl = spliturl[0] + "lp_list_page.html";
        console.log(targeturl);
        var targetHref = window.location.origin + targeturl;
        window.open(targetHref, "_self");
        window.localStorage.setItem("map_access_mode", "");
    } else if(parkInfoOverlay.style.display === "block"){
            parkInfoOverlay.style.display = "none";
    };
}
document.getElementById("parks_info_backButton").addEventListener("click",closeOverlay)


//Overlay History Section Toggle//
function overlayHistoryToggle(x){
    let overlayHistoryText = document.getElementById("park_info_overlay_history_text");
    if (overlayHistoryText.style.display === "flex"){
        overlayHistoryText.style.display = "none";
    }
    else{
        overlayHistoryText.style.display = "flex";
    }
    x.classList.toggle("changeHistoryToggle");
}

//View Mode Buttons//

document.getElementById("status_button").addEventListener("click", function(){
    document.getElementById("year_opened_button").classList.remove("view_mode_active");
    document.getElementById("status_button").classList.add("view_mode_active");
    document.getElementById("alterations_button").classList.remove("view_mode_active");
    map.setPaintProperty("year_opened_layer", "fill-opacity", 0)
    map.setPaintProperty("park_status_layer", "fill-opacity", 0.8)
    map.setPaintProperty("shrunk_park_areas", "fill-opacity", 0)
    map.setPaintProperty("expanded_park_areas", "fill-opacity", 0)
    map.setPaintProperty("park_alterations", "fill-opacity", 0)
    map.setPaintProperty("under_threat_park_areas", "fill-opacity", 0)
    
    document.getElementById("status_keys").style.display = "flex";
    document.getElementById("yearOpened_keys").style.display = "none";
    document.getElementById("alterations_keys").style.display = "none";
});
document.getElementById("year_opened_button").addEventListener("click", function(){
    document.getElementById("status_button").classList.remove("view_mode_active");
    document.getElementById("year_opened_button").classList.add("view_mode_active");
    document.getElementById("alterations_button").classList.remove("view_mode_active");
    map.setPaintProperty("year_opened_layer", "fill-opacity", 0.8)
    map.setPaintProperty("park_status_layer", "fill-opacity", 0)
    map.setPaintProperty("shrunk_park_areas", "fill-opacity", 0)
    map.setPaintProperty("expanded_park_areas", "fill-opacity", 0)
    map.setPaintProperty("park_alterations", "fill-opacity", 0)
    map.setPaintProperty("under_threat_park_areas", "fill-opacity", 0)
    
    document.getElementById("status_keys").style.display = "none";
    document.getElementById("yearOpened_keys").style.display = "flex";
    document.getElementById("alterations_keys").style.display = "none";
});
document.getElementById("alterations_button").addEventListener("click", function(){
    document.getElementById("status_button").classList.remove("view_mode_active");
    document.getElementById("alterations_button").classList.add("view_mode_active");
    document.getElementById("year_opened_button").classList.remove("view_mode_active");
    map.setPaintProperty("year_opened_layer", "fill-opacity", 0)
    map.setPaintProperty("park_status_layer", "fill-opacity", 0)
    map.setPaintProperty("shrunk_park_areas", "fill-opacity", 0.8)
    map.setPaintProperty("expanded_park_areas", "fill-opacity", 0.8)
    map.setPaintProperty("park_alterations", "fill-opacity", 0.8)  
    map.setPaintProperty("under_threat_park_areas", "fill-opacity", 0.8)
    
    document.getElementById("status_keys").style.display = "none";
    document.getElementById("yearOpened_keys").style.display = "none";
    document.getElementById("alterations_keys").style.display = "flex";
});

function roundToFiveDecimals(num){
    try{
        if (num < 0){
            return -this.roundToFiveDecimals(-num);
        }
        return +(Math.round(num + "e+5") + "e-5");
    } catch(e){
        return num;
    }
};

function openParkOverlay(event, park_data){
    if(event){
        event.stopPropagation();
    }
    popup.remove();
    map.flyTo({
        center: park_data.clickedParkCoordinates,
        zoom: park_data.zoomLevel
    })
    console.log(park_data.clickedParkCoordinates)
    document.getElementById("parks_information_overlay_container").style.display = "block";
    document.getElementById("park_info_overlay_park_name").innerHTML = park_data.clickedParkName;
    document.getElementById("park_info_overlay_coordinates").innerHTML = `${park_data.clickedParkLatitude}, ${park_data.clickedParkLongitude}`;
    showHideOtherNames(park_data.clickedPark,park_data.clickedParkOtherNames);
    document.getElementById("park_info_overlay_year_opened").innerHTML = park_data.clickedParkOpeningPeriod;
    document.getElementById("park_info_overlay_year_opened_box").style = `background-color: ${park_data.openingPeriodColor}`;
    document.getElementById("park_info_overlay_status").innerHTML = park_data.clickedParkStatus;
    document.getElementById("park_info_overlay_status_box").style = `background-color: ${park_data.statusColor}`;
    document.getElementById("park_info_overlay_alterations").innerHTML = park_data.clickedParkAlterations;
    document.getElementById("park_info_overlay_alterations_box").style = `background-color: ${park_data.alterationsColor}`;
    historyDescription(park_data.clickedPark, park_data.clickedParkName, park_data.clickedParkHistory);
    mapContainer.addEventListener("click", closeOverlay);
}

function getParkData(clickedFeature){
    let clickedParkName = clickedFeature.properties.name;
    let clickedParkLongitude = clickedFeature.properties.longitude;
    let clickedParkLatitude = clickedFeature.properties.latitude;
    let clickedParkOpeningPeriod = clickedFeature.properties.period_opened;
    let clickedParkStatus = clickedFeature.properties.status;
    let clickedParkAlterations = clickedFeature.properties.alteration;
    let clickedParkOtherNames = clickedFeature.properties.other_names;
    let clickedParkHistory = clickedFeature.properties.brief_history;
    let clickedParkSize = clickedFeature.properties.size;
    let zoomLevel = determineParkZoom(clickedParkSize);
    let longitudeDiscrepancy = determineLongitudeDiscrepancy(clickedParkSize);
    let latitudeDiscrepancy = determineLatitudeDiscrepancy(clickedParkSize);
    let clickedParkCoordinates =  {lng: clickedFeature.properties.longitude + longitudeDiscrepancy, lat: clickedFeature.properties.latitude + latitudeDiscrepancy};
    console.log(clickedParkSize);
    console.log(latitudeDiscrepancy);
   
    let openingPeriodColor = setOpeningDateColor(clickedParkOpeningPeriod);
    let statusColor = setStatusColor(clickedParkStatus);
    let alterationsColor = setAlterationColor(clickedParkAlterations);

    let park_data = {
        clickedParkCoordinates: clickedParkCoordinates,
        zoomLevel: zoomLevel,
        clickedParkName: clickedParkName,
        clickedParkLatitude: clickedParkLatitude,
        clickedParkLongitude: clickedParkLongitude,
        clickedParkOtherNames: clickedParkOtherNames,
        clickedParkHistory: clickedParkHistory,
        clickedParkStatus: clickedParkStatus,
        statusColor: statusColor,
        clickedParkAlterations: clickedParkAlterations,
        alterationsColor: alterationsColor,
        openingPeriodColor: openingPeriodColor,
        clickedParkOpeningPeriod: clickedParkOpeningPeriod
    }

    return park_data;
}
const searchInput = document.getElementById("map_view_search_bar");
const searchResults = document.getElementById("search_bar_results");


function filterParks(searchTerm){
    return parkNames.filter(feature => feature.toUpperCase().includes(searchTerm.toUpperCase()));
    // return deduplicatedParks.filter(feature => feature.properties.name.toUpperCase().includes(searchTerm.toUpperCase()));
}
function displaySearchResults(results){
    const resultList = results.map(result => `<div class="searchResultsRow">${result}</div>`).join('');
    searchResults.innerHTML = `<div class="searchResults">${resultList}</div>`;
    searchResults.style.display = results.length ? "block" : "none";
}
searchInput.addEventListener("input", function(){
       const searchTerm = this.value.trim();
       console.log(searchTerm);
       if(searchTerm !== ''){
        const filteredParks = filterParks(searchTerm);
        displaySearchResults(filteredParks);
       } else{
        searchResults.style.display = "none";
       }  
});
document.addEventListener("click", function(event){
    if(!searchInput.contains(event.target) && !searchResults.contains(event.target)){
        displaySearchResults.style.display = "none";
    }
});
searchResults.addEventListener("click", function(event){
    if(event.target.className === "searchResultsRow"){
        let searchParkName = event.target.textContent;
        searchInput.value = searchParkName;
        searchResults.style.display = "none";
        let targetPark = deduplicatedParks.filter((park) => park.properties.name == searchParkName);
        console.log(targetPark[0]);
       let data = getParkData(targetPark[0]);
       console.log(data);
       openParkOverlay(undefined, data);
    }
})
function closeLaunchPopup(){
    let popUp = document.getElementById("launchPopup");
    popUp.style.display = "none";
}
//Find code that is currently not being used but could be useful later down the line here://
    //Function for merging park data.//

    // mergeParkData = function (parkinfo, parkshapes){
    //     console.log(parkinfo);
    //     console.log(parkshapes);
    //     parkshapes.features.forEach((feature) => {
    //     console.log(feature.properties);
    //     let data = parkinfo.filter((info)=>info.name == feature.properties.name);
    //     console.log(data);
    //     feature.properties = data[0]
    //     });
    //     console.log(parkshapes);
    // }

    //Function for calculating a parks area and adding it to the geoJSON file. 
    // To use it add it add the end of the fetch function which calls for the 'parks_shapes_source'. 
    // This is around lione 172. 
    // Don't forget to add it to the actual JSON file you have to copy and paste it from the console!!!

    // function calculateGeoJSONPolygonArea(current_park){
    //     let polygon_square_meters = turf.area(current_park);
    //     let polygon_acres = polygon_square_meters / 4046.85642;
    //     let polygon_area = Math.round(polygon_acres * 100) / 100;
    //     current_park.properties.area = polygon_area;
    //     console.log(polygon_area);
    // }
    // parksShapes.features.forEach((current_park) => calculateGeoJSONPolygonArea(current_park));
    // console.log(parksShapes);
