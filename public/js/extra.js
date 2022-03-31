// MapBox API-
mapboxgl.accessToken =
  "pk.eyJ1IjoiYXJ5YW4wMTQxIiwiYSI6ImNrc21zbzJwaTBhMTYyb3A3MWpsd2M3eWQifQ.vH9l7ustzfMTQxOAcpfDww";

var map = new mapboxgl.Map({
  container: "geoMap",
  style: "mapbox://styles/mapbox/streets-v11",
  // Coordinates of IIT Jodhpur.
  center: [73.1135, 26.471],
  zoom: 10,
});

// Show sensors color according to the weight-
function sensorColorByWeight(weight) {
  if (weight == "x") {
    return "rgb(255, 255, 255)";
  }
  if (weight < 25) {
    // Green
    return "rgb(0, 255, 127)";
  }
  if (weight >= 25 && weight < 50) {
    // Yellow
    return "rgb(255,255,49)";
  }
  if (weight >= 50 && weight < 75) {
    // Blue
    return "#007FFF";
  }
  if (weight >= 75) {
    // Red
    return "rgb(220, 20, 60)";
  }
  return "#FFB400";
}

// Show different sensor symbols according to their type-
function showThatSymbolOfSensor(text) {
  if (text == "Temperature") return '<i class="fas fa-temperature-high"></i>';
  if (text == "Humidity") return '<i class="fas fa-tint"></i>';
  if (text == "LightIntensity") return '<i class="fas fa-sun"></i>';
  if (text == "HeartBeat") return '<i class="fas fa-heartbeat"></i>';
  if (text == "Snow") return '<i class="fas fa-snowflake"></i>';
  if (text == "GasStation") return '<i class="fas fa-gas-pump"></i>';
  if (text == "GasMeasure") return '<i class="fas fa-burn"></i>';
  if (text == "Garbage") return '<i class="fas fa-trash-alt"></i>';
  // if (text == "Pressure") return '<i class="fas fa-tachometer-alt"></i>';
  if (text == "Pressure") return '<i class="fas fa-tachometer-alt"></i>';
  if (text == "Bacteria") return '<i class="fas fa-bacteria"></i>';
  if (text == "Animals") return '<i class="fab fa-sticker-mule"></i>';
  if (text == "Location") return '<i class="fas fa-map-marker-alt"></i>';
  if (text == "ChargingStation")
    return '<i class="fas fa-charging-station"></i>';
  if (text == "Water") return '<i class="fas fa-water"></i>';
  if (text == "Tint") return '<i class="fas fa-tint"></i>';
  if (text == "MPU") return '<i class="fab fa-audible"></i>';
  if (text == "Ultrasonic") return '<i class="fas fa-satellite-dish"></i>';
}

// Show a particular sensor on the image map-
function showSensor(res) {
  var hRatio = res.imageCoordinates.hRatio;
  var vRatio = res.imageCoordinates.vRatio;
  var sensorSymbol = showThatSymbolOfSensor(res.sensorType);

  var sensorLiveData = getSensorLiveDataUsingSensorID(res.sensorId);
  var sensorLiveWeight;
  if (
    sensorLiveData == null ||
    sensorLiveData.length == 0 ||
    res.isVerified == false
  ) {
    sensorLiveWeight = "x";
  } else {
    sensorLiveWeight = sensorLiveData.data[0].data;
  }

  var top = hRatio * $image.height() + imgPos[1];
  var left = vRatio * $image.width() + imgPos[0];

  $("body").append(
    $(
      '<div title="Click for more info" onclick="showDataOfSensor(this)" id="' +
        res._id +
        '" class="permanentMarker">' +
        sensorSymbol +
        "</div>"
    ).css({
      top: top - 29 + "px",
      left: left - 11 + "px",
      color: sensorColorByWeight(sensorLiveWeight),
      // fill: "black",
      // position: "relative",
      // width: "60%",
      // height: "100%",
      // backgroundColor: "blue",
    })
  );
}

// Function to show all the sensors on the Image Map-
function showAllTheSensorsOnImageMap(data) {
  if (
    data == null ||
    data[0] == null ||
    data[0].data[0].sensorDetail.length == 0
  ) {
    return;
  }
  data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        showSensor(res);
      });
    });
  });
}

// Fly to the required first coordinate in the geo map-
function flyToTheFirstCoordinateInTheGeoMap(geoID, sensorsData) {
  // Coordinates of the first flying position in the geo map-
  var lat = null;
  var lon = null;
  var currentGeolocation = getGeolocationByGeoID(geoID);
  if (currentGeolocation == null) {
    return;
  }
  if (currentGeolocation.latitude == -1 || currentGeolocation.longitude == -1) {
    // No coordinates are given to the geolocation, so we have to show the coordinates of the first sensor-
    if (
      sensorsData == null ||
      sensorsData[0] == null ||
      sensorsData[0].data[0].sensorDetail.length == 0
    ) {
      return;
    } else {
      lat = sensorsData[0].data[0].sensorDetail[0].latitude;
      lon = sensorsData[0].data[0].sensorDetail[0].longitude;
      // Also if sensors coordinates are also not given-
      if (lat == -1 || lon == -1) {
        return;
      }
    }
  } else {
    lat = currentGeolocation.latitude;
    lon = currentGeolocation.longitude;
  }
  if (lat == null || lon == null) {
    // alert("Here");
    return;
  }
  // Fly to the required coordinates-
  map.flyTo({
    center: [lon, lat],
    zoom: 12,
    bearing: 0,
    speed: 1.4, // make the flying slow
    curve: 1.8, // change the speed at which it zooms out
    easing: function (t) {
      return t;
    },
    essential: true,
  });
}

// Function to show only a particular type of sensor on the image map-
function showThatTypeOfSensor(sensorType, sensorsData) {
  if (
    sensorsData == null ||
    sensorsData[0] == null ||
    sensorsData[0].data[0].sensorDetail.length == 0
  ) {
    return;
  }
  sensorsData.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        if (res.sensorType == sensorType) {
          showSensor(res);
        }
      });
    });
  });
}

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxx".replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

function showAddSensorForm() {
  $("#sensor-id").attr("value", create_UUID());
  $("#add-sensor-top-slider").slideDown("slow");
  $("#left-coloumn").css({ opacity: "0.4" });
  $("#right-coloumn").css({ opacity: "0.4" });
}

function showCreateUserForm() {
  $("#createUser").slideToggle("slow");
}

function closeEditSensorForm() {
  $("#edit-sensor-top-slider").slideUp("slow");
  // $("#left-coloumn").css({ opacity: "1" });
  // $("#right-coloumn").css({ opacity: "1" });
}

function centerDivUsingID(div_id) {
  var w = screen.width / 2 - $("#" + div_id).width() / 2;
  var len = w.toString() + "px";
  document.getElementById(div_id).style.left = len;
}

// It takes the ADD SENSOR form exactly in the center of the frame.
centerDivUsingID("add-sensor-top-slider");

// It takes the EDIT SENSOR form exactly in the center of the frame.
centerDivUsingID("edit-sensor-top-slider");

// It takes the CREATE USER form exactly in the center of the frame.
centerDivUsingID("createUser");

// It takes the CREATE ALERT form exactly in the center of the frame.
centerDivUsingID("emailAlertsTooltip");

// Closses the slider, when we click outside that div and outside the image.
$(document).mouseup(function (e) {
  var container = $("#add-sensor-top-slider");
  var mapImage = $("#inside-map");
  var createUserForm = $("#createUser");
  var sensorDataTooltip = $(".sensorsDataDiv");
  var permanentMarkers = $(".permanentMarker");
  var edit_sensor_top_slider = $("#edit-sensor-top-slider");
  var emailAlertsTooltip = $("#emailAlertsTooltip");
  if (
    !container.is(e.target) &&
    container.has(e.target).length === 0 &&
    !mapImage.is(e.target) &&
    mapImage.has(e.target).length === 0
  ) {
    closeSlider();
  }
  if (
    !createUserForm.is(e.target) &&
    createUserForm.has(e.target).length === 0
  ) {
    createUserForm.slideUp("slow");
  }
  if (
    !sensorDataTooltip.is(e.target) &&
    sensorDataTooltip.has(e.target).length === 0 &&
    !permanentMarkers.is(e.target) &&
    permanentMarkers.has(e.target).length === 0 &&
    !emailAlertsTooltip.is(e.target) &&
    emailAlertsTooltip.has(e.target).length === 0 &&
    !edit_sensor_top_slider.is(e.target) &&
    edit_sensor_top_slider.has(e.target).length === 0
  ) {
    // removeDataOfSensor();
    $(".sensorsDataDiv").fadeOut("slow");
  }
  if (
    !edit_sensor_top_slider.is(e.target) &&
    edit_sensor_top_slider.has(e.target).length === 0
  ) {
    closeEditSensorForm();
  }
  if (
    !emailAlertsTooltip.is(e.target) &&
    emailAlertsTooltip.has(e.target).length === 0
  ) {
    $("#emailAlertsTooltip").slideUp("slow");
  }
});

// Many Functionalities
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $(".image-btn-and-dragger").hide();
      // $('.file-upload-btn').hide();
      $(".file-upload-content").show();

      $(".file-upload-image").attr("src", e.target.result);

      $(".image-title").html(input.files[0].name);
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    removeUpload();
  }
}

function removeUpload() {
  $(".file-upload-input").replaceWith($(".file-upload-input").clone());
  $(".file-upload-content").hide();
  $(".image-btn-and-dragger").show();
  $(".file-upload-image").attr("src", "#");
  // $('.file-upload-btn').show();
}
$(".image-upload-wrap").bind("dragover", function () {
  $(".image-upload-wrap").addClass("image-dropping");
});
$(".image-upload-wrap").bind("dragleave", function () {
  $(".image-upload-wrap").removeClass("image-dropping");
});
