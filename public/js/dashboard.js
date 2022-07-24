// All the required Global Variables-
let mainLocationsDiv = document.getElementById("mainLocationsDiv");
let navbarLocationsDiv = document.getElementById("navbarLocationsDiv");
let geolocation_id = "";
let sensors_data;
let global_del_image_id = "";
let ratio = {};
let edit_ratio = {};
var addSensorBtnClicked = false;
var imgPos = [];
let image; // Global Variable to store image informtion.
let liveSensorData;
let idOfSensorWhichIsClicked = null;
var allGlobalGeolocations = null;
$("#geoMap").fadeOut("fast");

// Add New User
document
  .querySelector("#createUserForm-submit-btn")
  .addEventListener("click", addNewUser);
async function addNewUser(e) {
  e.preventDefault();
  try {
    const email = document.getElementById("createUserForm-email").value;

    if (!email) {
      alert("Please enter a email address");
      return;
    }

    const me = await myDetails();
    let obj = {
      admin: "orghead",
      orghead: "user",
    };

    let formData = {
      email,
      type: obj[me.type],
    };

    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    let response = await fetch("/addUser", settings);
    let data = await response.json();

    if (data.status == 400) {
      alert(data.msg);
      return;
    } else {
      alert(`User Created successfully of type ${data.type}`);
      return;
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Logout User
document.querySelector("#logoutUser").addEventListener("click", logout);
async function logout() {
  try {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const myAllDetails = await fetch("/logout", settings);
    // const response = await myAllDetails.json();
    window.location.reload();
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Settings for diffrent type of users
async function settingsForDiffrentUser() {
  try {
    const currentUser = await myDetails();
    if (currentUser.type == "admin") {
      console.log("ADMIN");
    } else if (currentUser.type == "orghead") {
      console.log("ORG HEAD");
      $("#sensor-verification-btn").css("display", "none");
      $("#sensor-verification-btn-hamburger").css("display", "none");
    } else if (currentUser.type == "user") {
      document.getElementById("addSensor-btn").style.display = "none";
      document.getElementById("add-new-btn").style.display = "none";
      document.getElementById("create-user-btn").style.display = "none";
      document.getElementById("exportAllSensorDataBtn").style.display = "none";
      $("#sensor-verification-btn").css("display", "none");
      $("#sensor-verification-btn-hamburger").css("display", "none");

      console.log("USER");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

settingsForDiffrentUser();

// To check weather the Hamburger Nav is clicked or not-
function checkedFunc(el) {
  var body = document.getElementsByTagName("BODY")[0];
  if (el.checked == true) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "visible";
  }
}

// Refreshing the data in every 5sec-
function getRefreshData() {
  try {
    $(".permanentMarker").remove();
    if (sensors_data == null) {
      return;
    }

    getLiveSensorData();
    applyFilterForWeight();
    if (
      sensors_data == null ||
      sensors_data[0] == null ||
      sensors_data[0].data[0].sensorDetail.length == 0
    ) {
      return;
    }
    sensors_data.forEach((data) => {
      data.data.forEach((data) => {
        data.sensorDetail.forEach((res) => {
          updateDataOfSensorInTooltip(res);
        });
      });
    });
    // getGeolocation();
  } catch (err) {
    console.log(err);
  }
}
getGeolocation();
getLiveSensorData();
getRefreshData();

setInterval(() => {
  getRefreshData();
}, 5 * 1000);

// Get Live Sensor Data
async function getLiveSensorData() {
  const settings = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  let response = await fetch("/getLiveSensorData", settings);
  let data = await response.json();
  console.log(data);
  if (data == null) {
    liveSensorData = [];
    return;
  }

  liveSensorData = data;
  return;
}

function getSensorLiveDataUsingSensorID(sensorId) {
  let mainData;
  if (liveSensorData == null || liveSensorData.length == 0) return null;
  liveSensorData.forEach((data) => {
    if (data.sensorId == sensorId) {
      // alert(data.distance);
      mainData = data;
      return;
    }
  });
  return mainData;
}

// Function to get the geolocation by using the geolocation id-
function getGeolocationByGeoID(geoID) {
  var currentGeolocation = null;
  if (allGlobalGeolocations == null) {
    alert("Add a geolocation.");
    return null;
  }
  allGlobalGeolocations.allGeoLocations.forEach((data) => {
    if (data._id == geoID) {
      currentGeolocation = data;
      return;
    }
  });
  return currentGeolocation;
}

// Function to show all the sensors on the Geo Map-
function showAllTheSensorsOnGeoMap(data) {
  $(".geoMarker").remove();
  if (
    data != null &&
    data[0] != null &&
    data[0].data[0].sensorDetail.length != 0
  ) {
    data.forEach((data) => {
      data.data.forEach((data) => {
        data.sensorDetail.forEach((res) => {
          var lat = res.latitude;
          var lon = res.longitude;
          if (lat == "-1" || lon == "-1") {
            return;
          }
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

          var el = document.createElement("p");
          el.className = "geoMarker";
          el.innerHTML = sensorSymbol;
          el.style.color = sensorColorByWeight(sensorLiveWeight);

          // Add marker
          new mapboxgl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat([lon, lat])
            .addTo(map);
        });
      });
    });
  }
  flyToTheFirstCoordinateInTheGeoMap(geolocation_id, data);
}

// Function which can give the hRatio & vRatio of the image-
function giveCoorsToImage() {
  $image = $("#inside-map");
  if (image == null) {
    return;
  }
  imgPos = [
    $image.offset().left,
    $image.offset().top,
    $image.offset().left + $image.outerWidth(),
    $image.offset().top + $image.outerHeight(),
  ];

  $image.mousemove(function (e) {
    $("#coords").html(
      (e.pageX - imgPos[0]).toFixed(0) + ", " + (e.pageY - imgPos[1]).toFixed(0)
    );
  });

  $image.click(function (ev) {
    if (addSensorBtnClicked == true) {
      var width_ratio = (ev.pageX - imgPos[0]) / $image.width();
      var height_ratio = (ev.pageY - imgPos[1]) / $image.height();

      ratio["hRatio"] = height_ratio;
      ratio["vRatio"] = width_ratio;

      $(".marker").remove(); // Removes the previous marker, when we select a new marker.

      $("body").append(
        $(
          '<div class="marker"><i class="fas fa-map-marker-alt"></i></div>'
        ).css({
          position: "absolute",
          top: ev.pageY - 29 + "px",
          left: ev.pageX - 11 + "px",
          fontSize: "1.8rem",
          color: "red",
        })
      );
      showAddSensorForm();
    }
  });
  $image.mouseenter(function () {
    $("html").css({ cursor: "crosshair" });
  });
  $image.mouseleave(function () {
    $("html").css({ cursor: "default" });
  });
}

// Function to show sensor only for a particular weight-
function showSensorsAccordingToWeightOfThatType(low, high, sensorType) {
  var filter = sensorType == "All Sensors" ? false : true;
  if (
    sensors_data == null ||
    sensors_data[0] == null ||
    sensors_data[0].data[0].sensorDetail.length == 0
  ) {
    return;
  }
  sensors_data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        let sensorLiveData = getSensorLiveDataUsingSensorID(res.sensorId);
        if (sensorLiveData == null) {
          // showSensor(res);
          return;
        }
        if (filter) {
          if (
            sensorLiveData.data[0].data >= low &&
            sensorLiveData.data[0].data < high &&
            res.sensorType == sensorType
          ) {
            showSensor(res);
          }
        } else {
          if (
            sensorLiveData.data[0].data >= low &&
            sensorLiveData.data[0].data < high
          ) {
            showSensor(res);
          }
        }
      });
    });
  });
}

async function getGeolocationUserByGeoId(geoId) {
  try {
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: geoId }),
    };

    const response = await fetch("/getUserIdbyGeoId", settings);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
}

// Get sensors detail of user
async function getSensorDetail(geolocation_id) {
  try {
    // Get Geolocation User Details
    let geoUser = (await getGeolocationUserByGeoId(geolocation_id)).user;
    let currentuser = await myDetails();

    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ geolocation: geolocation_id, user: geoUser }),
    };

    $("#inside-map").attr("src", "/img/loader.gif");
    const findImage = await fetch("/getImageUsingGeolocation", settings);
    const Image = await findImage.json();
    image = Image;
    console.log(Image, "image data");

    // Loader for loading the sensors is only visible on big frames.
    if ($(window).width() > 1250) {
      $("#loaderSensorDiv").css("display", "block");
    }
    const response = await fetch("/getSensorgeolocation", settings);
    const data = await response.json();
    sensors_data = data;
    console.log(sensors_data, "sensor data");
    $("#loaderSensorDiv").css("display", "none");

    // If image is not found, then show the add image option.

    if (Image.length == 0 || Image.status == 400) {
      if (currentuser.type == "user") {
        $("#insideImage").css({ display: "none" });
        $("#inside-map").css({ display: "block" });
        $("#inside-map").attr({
          src: "https://agrimart.in/uploads/vendor_logo_image/default.jpg",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        return;
      } else {
        $("#insideImage").css({ display: "block" });
        $("#inside-map").css({ display: "none" });
        $("#inside-map").attr({
          src: "https://agrimart.in/uploads/vendor_logo_image/default.jpg",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        return;
      }
    }
    global_del_image_id = Image[0]._id;

    $("#insideImage").css({ display: "none" });
    $("#inside-map").css({ display: "block" });
    $("#geoMap").css({ display: "none" });
    $("#inside-map").attr("src", Image[0].name);
    $("#inside-map").attr("imageid", Image[0]._id);

    giveCoorsToImage();

    // If sensor data is not found, then only show the uploaded image.
    if (data.status == 400) {
      $("#insideImage").css({ display: "none" });
      $("#inside-map").css({ display: "block" });
      $("#inside-map").attr("src", Image[0].name);
      $("#inside-map").attr("imageid", Image[0]._id);

      return;
    }

    // showAllTheSensorsOnImageMap(sensors_data);
    applyFilterForWeight();
  } catch (err) {
    console.log(err);
    // alert('Something went wrong...');
  }
}

async function deleteGeolocation(geoId) {
  if (confirm("Are you sure want to delete that location?") == false) {
    return;
  }
  // Get Geolocation User Details
  let geoUser = (await getGeolocationUserByGeoId(geoId)).user;
  let currentuser = await myDetails();
  // alert("GeoID: " + geoId + " User: " + geoUser);

  // @Arjun Porwal - Write Backend Here
  const settings = {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ geoId: geoId, user: geoUser }),
  };
  let response = await fetch("/deleteGeolocation", settings);
  let data = await response.json();
  window.location.reload();
  // return;
}

function createGeolocationColoumn(res, currentUser, data, isHamburgerNavbar) {
  var div = document.createElement("div");
  div.className = "location_card";
  div.tabIndex = 1;

  if (isHamburgerNavbar) {
    div.id = "HamNav" + res._id;
  } else {
    div.id = res._id;
  }

  const state = res.location;
  const place = res.name;

  var div2 = document.createElement("div");
  div2.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

  div.appendChild(div2);
  if (currentUser.type == "admin" || currentUser.type == "orghead") {
    var div3 = document.createElement("div");
    div3.className = "deleteGeolocationBtn";
    div3.title = "Delete Geolocation";
    div3.style.margin = "auto";
    div3.innerHTML = `<h2><i class="fas fa-trash"></i></h2>`;

    div3.onclick = function () {
      geolocation_id = res._id;
      deleteGeolocation(geolocation_id);
    };
    div.appendChild(div3);
  }

  div.onclick = function () {
    $(".permanentMarker").remove();
    geolocation_id = res._id;
    $("#geolocation-form").val(geolocation_id);

    getSensorDetail(geolocation_id);

    // Removing active class from the remaining geolocations.
    data.allGeoLocations.forEach((res) => {
      var div;
      if (isHamburgerNavbar) {
        div = document.getElementById("HamNav" + res._id);
      } else {
        div = document.getElementById(res._id);
      }
      div.classList.remove("active-geolocation");
    });
    // Adding active class to the clicked geolocation.
    div.classList.add("active-geolocation");
  };
  if (isHamburgerNavbar) {
    navbarLocationsDiv.appendChild(div);
  } else {
    mainLocationsDiv.appendChild(div);
  }
}

// Getting geolocations
async function getGeolocation() {
  try {
    // Checking Parent User Details
    const currentUser = await myDetails();
    let parentId = null;
    if (currentUser.type != "admin") {
      parentId = (await parentUser(currentUser.email)).user;
    }

    // Get geolocations

    // @ If currentUser is admin, he will get all geolocations in db
    // @ If currentUser is orghead, he will get geolocations created by him
    // @ If currentUser is user, he will get geolocations created by his parent (any orghead)

    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parent: parentId }),
    };
    $("#loaderGeolocations").css({ display: "block" });
    let response = await fetch("/getGeolocations", settings);
    let data = await response.json();
    $("#loaderGeolocations").css({ display: "none" });

    // If parent User is admin/orghead
    if (currentUser.type == "admin" || currentUser.type == "orghead") {
      if (data.status === 404) {
        $("#insideImage").css({ display: "none" });
        $("#inside-map").css({ display: "block" });
        $("#inside-map").attr({
          src: "https://agrimart.in/uploads/vendor_logo_image/default.jpg",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        alert("Add a geolocation");
        return;
      }
    }

    // If parent User is admin/orghead
    if (currentUser.type == "user") {
      if (data.status === 404) {
        $("#insideImage").css({ display: "none" });
        $("#inside-map").css({ display: "block" });
        $("#inside-map").attr({
          src: "https://agrimart.in/uploads/vendor_logo_image/default.jpg",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        alert("No Geolocations Created by your head.");
        return;
      }
    }

    allGlobalGeolocations = data;

    // Getting All the Users.
    const settingsForGettingUsers = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    let users = await fetch("/getAllUsers", settingsForGettingUsers);
    let userDetails = await users.json();
    // console.log("All USERS", userDetails);

    geolocation_id = data.allGeoLocations[0]._id;
    $("#geolocation-form").val(geolocation_id);
    getSensorDetail(geolocation_id);

    $("#geolocation").val(geolocation_id);

    var userIndex = 1;

    userDetails.forEach((user) => {
      var div = document.createElement("div");
      var clonedDiv = document.createElement("div");
      if (currentUser.type == "admin") {
        div.style.display = "flex";
        div.style.margin = "5px auto";
        div.style.color = "white";
        div.innerHTML = `<h4 style="margin: auto; flex-grow: 1;">${userIndex}. ${
          user.name.charAt(0).toUpperCase() + user.name.slice(1)
        }</h4><p style="font-size: 0.8rem; margin: auto;">[${
          user.type.charAt(0).toUpperCase() + user.type.slice(1)
        }]</p>`;
        mainLocationsDiv.appendChild(div);
        clonedDiv = div.cloneNode(true);
        navbarLocationsDiv.appendChild(clonedDiv);
      }

      var isLocationFound = false;

      data.allGeoLocations.forEach((res) => {
        if (res.user == user._id) {
          isLocationFound = true;
          createGeolocationColoumn(res, currentUser, data, false);
          // Giving active class to the first geolocation.
          var firstGeoDiv = document.getElementById(geolocation_id);
          firstGeoDiv.classList.add("active-geolocation");

          // Assigning Geolocations to Hamburger Navbar.
          createGeolocationColoumn(res, currentUser, data, true);
          // Giving active class to the first geolocation.
          var firstGeoDiv = document.getElementById("HamNav" + geolocation_id);
          firstGeoDiv.classList.add("active-geolocation");
        }
      });

      if (!isLocationFound) {
        userIndex--;
        div.style.display = "none";
        clonedDiv.style.display = "none";
      }

      userIndex++;
    });
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// getGeolocation();

// Function to show ImageMap and Remove GeoMap-
function showImageMap() {
  // if(image.length == 0) {
  //   return;
  // }
  $(".permanentMarker").remove();
  $("#insideImage").css({ display: "none" });
  $("#inside-map").fadeIn("fast");
  // $('#geoMap').fadeOut('fast');
  $("#geoMap").css({ display: "none" });
  showAllTheSensorsOnImageMap(sensors_data);
}

// Function to show GeoMap and Remove Image Map-
function showGeoMap() {
  // $('#insideImage').fadeOut('fast');
  $("#insideImage").css({ display: "none" });
  // $('#inside-map').fadeOut('fast');
  $("#inside-map").css({ display: "none" });
  $("#geoMap").fadeIn("fast");
  $(".permanentMarker").remove();
  showAllTheSensorsOnGeoMap(sensors_data);
}

// Filter Funtions-
function applyFilter(el) {
  var val = el.value;
  var img = document.getElementById("inside-map");
  // Does not apply filters when Geo Map is open-
  if (img.style.display == "none") {
    alert("Currently Filters are only applicable to Image Map");
    return;
  }
  $(".permanentMarker").remove();
  if (val == "All Sensors") {
    showAllTheSensorsOnImageMap(sensors_data);
  } else {
    showThatTypeOfSensor(val, sensors_data);
  }
}

function applyFilterForWeight() {
  var img = document.getElementById("inside-map");
  if (img.style.display == "none") {
    // alert("Currently Filters are only applicable to Image Map");
    return;
  }
  if (
    sensors_data == null ||
    sensors_data[0] == null ||
    sensors_data[0].data[0].sensorDetail.length == 0
  ) {
    return;
  }
  var box25 = document.getElementById("25");
  var box50 = document.getElementById("50");
  var box75 = document.getElementById("75");
  var box100 = document.getElementById("100");
  var val = document.getElementById("filter-sensor-types").value;
  if (
    box25.checked == false &&
    box50.checked == false &&
    box75.checked == false &&
    box100.checked == false
  ) {
    // showAllTheSensorsOnImageMap(sensors_data);
    if (val == "All Sensors") {
      showAllTheSensorsOnImageMap(sensors_data);
    } else {
      showThatTypeOfSensor(val, sensors_data);
    }
  } else {
    $(".permanentMarker").remove();
    if (box25.checked == true) {
      showSensorsAccordingToWeightOfThatType(0, 25, val);
    }
    if (box50.checked == true) {
      showSensorsAccordingToWeightOfThatType(25, 50, val);
    }
    if (box75.checked == true) {
      showSensorsAccordingToWeightOfThatType(50, 75, val);
    }
    if (box100.checked == true) {
      showSensorsAccordingToWeightOfThatType(75, 10000, val);
    }
  }
}

// It gives the complete detail of the sensor by the sensor id-
function getSensorDetailUsingSensorID(sensor_id) {
  let currSensorData;
  if (
    sensors_data == null ||
    sensors_data[0] == null ||
    sensors_data[0].data[0].sensorDetail.length == 0
  ) {
    return null;
  }
  sensors_data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        if (res._id == sensor_id) {
          currSensorData = res;
        }
      });
    });
  });
  return currSensorData;
}

async function showCreateAlertTooltip(sensorId) {
  $("#emailAlertsTooltip").slideDown("slow");
  var mainDiv = document.getElementById("emailAlertsTooltipPreviousAlerts");
  let currSensorData = getSensorDetailUsingSensorID(sensorId);
  var alertList = currSensorData.alertList;

  // Removes all the previous classes.
  mainDiv.innerHTML = "";

  var currUserMin = null;
  var currUserMax = null;
  let currentUser = await myDetails();
  alertList.forEach((data, index) => {
    if (currentUser.email == data.userEmail) {
      currUserMin = data.min;
      currUserMax = data.max;
    } else {
      var p = document.createElement("p");
      p.style.color = "white";
      p.style.fontFamily = "'Montserrat', sans-serif";
      p.style.fontSize = "0.8rem";
      p.style.margin = "3px 0px";
      p.innerHTML = `	&#8226; Min: ${data.min} - Max: ${data.max}`;
      mainDiv.appendChild(p);
    }
  });
  if (currUserMin) {
    document.getElementById("minThreshold").value = currUserMin;
  } else {
    document.getElementById("minThreshold").value = -1000;
  }
  if (currUserMax) {
    document.getElementById("maxThreshold").value = currUserMax;
  } else {
    document.getElementById("maxThreshold").value = 1000;
  }
}

function showEditSensorForm(sensor_id) {
  $("#edit-sensor-top-slider").slideDown("slow");
  // $("#left-coloumn").css({ opacity: "0.4" });
  // $("#right-coloumn").css({ opacity: "0.4" });
  var sensor_details = getSensorDetailUsingSensorID(sensor_id);
  edit_ratio = {
    hRatio: sensor_details.imageCoordinates.hRatio,
    vRatio: sensor_details.imageCoordinates.vRatio,
    isVerified: sensor_details.isVerified,
  };
  $(
    `select[id='edit-sensor-types'] option[value=${sensor_details.sensorType}]`
  ).attr("selected", true);
  $("#edit-sensor-name-form").val(sensor_details.sensorName);
  $("#edit-sensor-location-form").val(sensor_details.location);
  $("#edit-sensor-id").val(sensor_details.sensorId);
  $("#edit-latitude").val(sensor_details.latitude);
  $("#edit-longitude").val(sensor_details.longitude);
}

async function createAlert(e) {
  // e.preventDefault();
  var minThreshold = document.getElementById("minThreshold").value;
  var maxThreshold = document.getElementById("maxThreshold").value;
  if (idOfSensorWhichIsClicked == null) {
    alert("No sensor found");
    return;
  }
  var sensorId = idOfSensorWhichIsClicked;
  var geolocation = geolocation_id;
  var imageID = global_del_image_id;

  if (minThreshold == "" || maxThreshold == "") {
    alert("These fields cannot be empty.");
    return;
  }
  // if(minThreshold > maxThreshold) {
  //   // alert("Min Value cannot be greater than the Max Value.");
  //   alert(minThreshold +  " " + maxThreshold);
  //   return;
  // }

  // Get Geolocation User Details
  const geoUser = (await getGeolocationUserByGeoId(geolocation)).user;

  const obj = {
    geolocation,
    imageID,
    sensorId,
    geoUser,
    minThreshold,
    maxThreshold,
  };
  createAlertAPICall(obj);
}

async function deleteSensor(sensor_id) {
  if (confirm("Are you sure want to delete the sensor?") == false) {
    return;
  }
  var sensorId = sensor_id;
  var geolocation = geolocation_id;
  var imageID = global_del_image_id;
  var sensorIdUUID = getSensorDetailUsingSensorID(sensor_id).sensorId;

  // Get Geolocation User Details
  const geoUser = (await getGeolocationUserByGeoId(geolocation)).user;

  const obj = {
    sensorId,
    geolocation,
    imageID,
    geoUser,
    sensorIdUUID,
  };
  deleteSensorAPICall(obj);
}

function closeSlider() {
  $("#add-sensor-top-slider").slideUp("slow");
  $("#left-coloumn").css({ opacity: "1" });
  $("#right-coloumn").css({ opacity: "1" });
  $("#inside-map").css({ opacity: "1" });
  addSensorBtnClicked = false;
  $(".marker").remove();
}

function addSensorBtn() {
  if (image == undefined || image == null || image.length == 0) {
    alert("Uploaded an Image to Add Sensor.");
    return;
  }
  // if(sensors_data==null) return;
  $("#inside-map").css({ opacity: "0.5" });
  addSensorBtnClicked = true;
  // $('body').css({overflow: "hidden" });
}

async function showDataOfSensor(el) {
  idOfSensorWhichIsClicked = el.id;
  let currSensorData = getSensorDetailUsingSensorID(el.id);
  var hRatio = currSensorData.imageCoordinates.hRatio;
  var vRatio = currSensorData.imageCoordinates.vRatio;
  var sensorName = currSensorData.sensorName;
  var sensorId = currSensorData.sensorId;
  var sensorLocation = currSensorData.location;

  var top = hRatio * $image.height() + imgPos[1];
  var left = vRatio * $image.width() + imgPos[0];

  var sensorLiveData = getSensorLiveDataUsingSensorID(sensorId);

  var sensorLiveWeight;
  if (sensorLiveData == null || currSensorData.isVerified == false) {
    sensorLiveWeight = "x";
  } else {
    sensorLiveWeight = sensorLiveData.data[0].data;
  }
  var sensorLiveTime =
    sensorLiveData == null ||
    sensorLiveData.data[0].time == null ||
    currSensorData.isVerified == false
      ? "x"
      : sensorLiveData.data[0].time;

  $("#sensorNameTooltip").html(sensorName);
  $("#sensorIdTooltip").html("Id: " + sensorId);

  $("#sensorLocationTooltip").html(
    '<i class="fas fa-map-marker-alt"></i> ' + sensorLocation
  );

  if (currSensorData.isVerified == true) {
    var isVerifiedPara = $("#isSensorVerifiedPara");
    isVerifiedPara.css("color", "rgb(50, 205, 50)");
    isVerifiedPara.css("cursor", "pointer");
    isVerifiedPara.css("margin", "auto 2px");
    isVerifiedPara.css("fontSize", "0.9rem");
    isVerifiedPara.prop("title", "Verified");
    isVerifiedPara.html('<i class="fas fa-check"></i>');
  } else {
    var isVerifiedPara = $("#isSensorVerifiedPara");
    isVerifiedPara.css("color", "red");
    isVerifiedPara.css("cursor", "pointer");
    isVerifiedPara.css("margin", "auto 2px");
    isVerifiedPara.css("fontSize", "0.9rem");
    isVerifiedPara.prop("title", "Not Verified");
    isVerifiedPara.html('<i class="fas fa-times"></i>');
  }

  $("#sensorWeightTooltip").html(sensorLiveWeight);
  // $("#sensorTimeTooltip").html('<i class="far fa-clock"></i> ' + "5:44PM | 21st May 2021");
  const date =
    sensorLiveTime == "x"
      ? "Invalid date"
      : new Date(sensorLiveTime).toDateString();
  const time =
    sensorLiveTime == "x"
      ? "Invalid time"
      : new Date(sensorLiveTime).toLocaleTimeString();
  $("#sensorTimeTooltip").html(
    '<i class="far fa-clock"></i> ' + date + " | " + time
  );

  // Anchor Tag to Edit the Sensor
  var editBtn = document.getElementById("editBtnTooltip");
  editBtn.onclick = function () {
    showEditSensorForm(el.id);
  };

  // // Anchor Tag to Delete the Sensor
  var deleteBtn = document.getElementById("deleteBtnTooltip");
  deleteBtn.onclick = function () {
    deleteSensor(el.id);
  };

  var createAlertBtn = document.getElementById("createAlertBtn");
  createAlertBtn.onclick = function () {
    showCreateAlertTooltip(el.id);
  };

  var exportSingleSensorData = document.getElementById(
    "exportSingleSensorData"
  );
  exportSingleSensorData.onclick = function () {
    exportData(currSensorData);
  };

  const currentUser = await myDetails();
  if (currentUser.type == "user") {
    document.getElementById("editBtnTooltip").style.display = "none";
    document.getElementById("deleteBtnTooltip").style.display = "none";
    // document.getElementById("createAlertBtn").style.display = "none";
    document.getElementById("exportSingleSensorData").style.display = "none";
    document.getElementById("lower-border").style.marginBottom = "18px";

    // Normal Users Cannot See the Sesnor ID
    document.getElementById("sensorIdTooltip").style.display = "none";
  }

  var currentWindowSize = $(window).width();
  var widthOfTooltip = $(".sensorsDataDiv").width();
  var rightWidth = currentWindowSize - left;
  var leftWidth = left;

  if (currentWindowSize < widthOfTooltip + 10) {
    $("#sensorsDataDivGrid").css("grid-template-columns", "100%");
    $("#sensorsDataDivGrid").css("max-width", currentWindowSize - 20 + "px");
    $(".sensorsDataDiv").css({
      maxWidth: currentWindowSize - 40 + "px",
      // left: (currentWindowSize-widthOfTooltip)/2 + "px",
      margin: "0px 15px",
      top: top + "px",
    });
    $("#mapPlots").css("height", "150px");
  } else if (currentWindowSize < 2 * widthOfTooltip + 10) {
    $(".sensorsDataDiv").css({
      left: (currentWindowSize - widthOfTooltip) / 2 + "px",
      top: top + "px",
    });
  } else {
    if (rightWidth < widthOfTooltip + 10) {
      if (rightWidth > leftWidth) {
        $(".sensorsDataDiv").css({
          left: left + "px",
          top: top + "px",
        });
      } else {
        $(".sensorsDataDiv").css({
          left: leftWidth - widthOfTooltip - 20 + "px",
          top: top + "px",
        });
      }
    } else {
      $(".sensorsDataDiv").css({
        left: left + "px",
        top: top + "px",
      });
    }
  }

  $(".sensorsDataDiv").fadeIn("slow");

  // -------------------------------------------------------------------------------------
  // indexLabel: "\u2191 highest",markerColor: "red", markerType: "triangle" }
  // , indexLabel: "\u2193 lowest",markerColor: "DarkSlateGrey", markerType: "cross" }
  makeOrUpdateLinePlot(sensorLiveData, currSensorData);
}

function makeOrUpdateLinePlot(sensorLiveData, currSensorData) {
  CanvasJS.addColorSet("defaultShade", [
    "#f96332",
    "pink",
    "green",
    "brown",
    "purple",
  ]);

  var maxValuesToDisplay = 10;
  mainData = [];

  if (sensorLiveData == null || currSensorData.isVerified == false) {
    // No need to display the line plot.
    // We will draw an empty graph.
    var chart = new CanvasJS.Chart("mapPlots", {
      animationEnabled: true,
      colorSet: "defaultShade",
      title: {
        text: `No Data`,
        fontFamily: "tahoma",
      },
      data: [
        {
          type: "line",
          indexLabelFontSize: 15,
          xValueType: "dateTime",
          xValueFormatString: "DD MMM hh:mm TT",
          dataPoints: [],
        },
      ],
    });

    chart.render();
    return;
  }

  if (sensorLiveData.data[0].data.indexOf(",") >= 0) {
    // Multiple Values in one sensor is found.
    var n = 0;
    var diffPartsWholeArray = [];
    for (
      var itr = 0;
      itr < Math.min(sensorLiveData.data.length, maxValuesToDisplay);
      itr++
    ) {
      var diffParts = sensorLiveData.data[itr].data.split(",");
      n = diffParts.length;
      diffPartsWholeArray.push(diffParts);
    }
    for (var i = 0; i < n; i++) {
      var tempObj = {
        type: "line",
        indexLabelFontSize: 15,
        xValueType: "dateTime",
        xValueFormatString: "DD MMM hh:mm TT",
        dataPoints: [],
      };
      for (
        var itr = 0;
        itr < Math.min(sensorLiveData.data.length, maxValuesToDisplay);
        itr++
      ) {
        obj = {
          y: parseFloat(diffPartsWholeArray[itr][i]),
          x: new Date(sensorLiveData.data[itr].time),
        };
        tempObj.dataPoints.push(obj);
      }
      mainData.push(tempObj);
    }
  } else {
    var tempObj = {
      type: "line",
      indexLabelFontSize: 15,
      xValueType: "dateTime",
      xValueFormatString: "DD MMM hh:mm TT",
      dataPoints: [],
    };
    for (
      var itr = 0;
      itr < Math.min(sensorLiveData.data.length, maxValuesToDisplay);
      itr++
    ) {
      obj = {
        y: parseFloat(sensorLiveData.data[itr].data),
        x: new Date(sensorLiveData.data[itr].time),
      };
      tempObj.dataPoints.push(obj);
    }
    mainData.push(tempObj);
  }

  var chart = new CanvasJS.Chart("mapPlots", {
    animationEnabled: true,
    colorSet: "defaultShade",
    title: {
      text: `${currSensorData.sensorType} Data`,
      fontFamily: "tahoma",
    },
    data: mainData,
  });

  chart.render();
}

async function exportData(sensorData = sensors_data) {
  if (
    sensors_data == null ||
    sensors_data[0] == null ||
    sensors_data[0].data[0].sensorDetail.length == 0
  ) {
    alert("Add Some Sensors to get the data.");
    return;
  }
  if (sensors_data == null) {
  }
  let settings = {};
  if (sensorData === sensors_data) {
    //For all Sensors-
    allSensorsIds = [];
    sensorData.forEach((data) => {
      data.data.forEach((data) => {
        data.sensorDetail.forEach((res) => {
          allSensorsIds.push(res.sensorId);
        });
      });
    });

    settings = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "all", sensorId: allSensorsIds }),
    };
  } else {
    // Only for Single Sensor-
    settings = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "single", sensorId: sensorData.sensorId }),
    };
  }

  await fetch("/exportdata", settings);

  var element = document.createElement("a");
  element.setAttribute("href", "temp.csv");
  element.setAttribute("download", "temp.csv");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

async function updateDataOfSensorInTooltip(currSensorData) {
  if (
    idOfSensorWhichIsClicked == null ||
    idOfSensorWhichIsClicked != currSensorData._id
  ) {
    // alert("Not Updated!");
    return;
  }

  var sensorId = currSensorData.sensorId;
  var sensorLiveData = getSensorLiveDataUsingSensorID(sensorId);
  // var sensorLiveData = getSensorLiveWeightUsingSensorID(res.sensorId);
  var sensorLiveWeight;
  if (sensorLiveData == null || currSensorData.isVerified == false) {
    sensorLiveWeight = "x";
  } else {
    // sensorLiveWeight = "59 cd";
    sensorLiveWeight = sensorLiveData.data[0].data;
  }
  var sensorLiveTime =
    sensorLiveData == null || currSensorData.isVerified == false
      ? "x"
      : sensorLiveData.data[0].time;
  $("#sensorWeightTooltip").html(sensorLiveWeight);
  const date =
    sensorLiveTime == "x"
      ? "Invalid date"
      : new Date(sensorLiveTime).toDateString();
  const time =
    sensorLiveTime == "x"
      ? "Invalid time"
      : new Date(sensorLiveTime).toLocaleTimeString();
  $("#sensorTimeTooltip").html(
    '<i class="far fa-clock"></i> ' + date + " | " + time
  );

  // We will update the graph only when the last stored value is not equal to the current value.
  // if(sensorLiveData.data[0] && sensorLiveData.data[1] && parseInt(sensorLiveData.data[0].data)!=parseInt(sensorLiveData.data[1].data)) {
  //   makeOrUpdateLinePlot(sensorLiveData, currSensorData);
  // }
}

// API calling for adding a new sensor when user clicks Add Sensor button on popUp
document
  .querySelector("#add-sensor-btn")
  .addEventListener("click", addSensorAPICall);

async function addSensorAPICall(e) {
  e.preventDefault();
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      const imageId = $("#inside-map").attr("imageid");
      const sensorName = document.getElementById("sensor-name-form").value;
      let latitude = document.getElementById("latitude").value;
      let longitude = document.getElementById("longitude").value;
      const location = document.getElementById("sensor-location-form").value;
      const sensorId = document.getElementById("sensor-id").value;
      const microId = document.getElementById("microcontrollerID").value;
      let e = document.getElementById("sensor-categories");
      // const category = e.options[e.selectedIndex].value;
      const geolocation = geolocation_id;
      e = document.getElementById("sensor-types");
      const sensorType = e.options[e.selectedIndex].value;

      if (
        sensorName === "" ||
        location === "" ||
        sensorId === "" ||
        microId == ""
      ) {
        alert("Please fill all the required fields");
        return;
      }

      if (latitude == "" || longitude == "") {
        latitude = -1;
        longitude = -1;
      }

      const formData = {
        imageId,
        sensorName,
        latitude,
        longitude,
        sensorId,
        // category,
        hRatio: ratio.hRatio,
        vRatio: ratio.vRatio,
        geolocation,
        location,
        sensorType,
        microId,
      };

      const settings = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/addSensor", settings);
      if (response.status == 400) {
        let data = await response.json();
        alert(data.msg);
      } else if (response.status == 202) {
        let data = await response.json();
        alert(data.msg);
      } else {
        window.location.replace("/dashboard");
      }
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Edit Sensor
// API calling for adding a new sensor when user clicks Add Sensor button on popUp
document
  .querySelector("#edit-sensor-btn")
  .addEventListener("click", editSensorAPICall);

async function editSensorAPICall(e) {
  e.preventDefault();
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      const imageId = $("#inside-map").attr("imageid");
      const sensorName = document.getElementById("edit-sensor-name-form").value;
      const latitude = document.getElementById("edit-latitude").value;
      const longitude = document.getElementById("edit-longitude").value;
      const location = document.getElementById(
        "edit-sensor-location-form"
      ).value;
      const sensorId = document.getElementById("edit-sensor-id").value;
      let e = document.getElementById("edit-sensor-categories");
      // const category = e.options[e.selectedIndex].value;
      const geolocation = geolocation_id;
      e = document.getElementById("edit-sensor-types");
      const sensorType = e.options[e.selectedIndex].value;

      if (
        sensorName === "" ||
        location === "" ||
        sensorId === "" ||
        latitude == "" ||
        longitude == ""
      ) {
        alert("Please fill all the required fields");
        return;
      }

      const formData = {
        imageId,
        sensorName,
        latitude,
        longitude,
        sensorId,
        // category,
        hRatio: edit_ratio.hRatio,
        vRatio: edit_ratio.vRatio,
        geolocation,
        location,
        sensorType,
        isVerified: edit_ratio.isVerified,
      };

      const settings = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/addSensor", settings);
      let data = await response.json();
      console.log(data);
      window.location.replace("/dashboard");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// API Call to Create Alert
async function createAlertAPICall(obj) {
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      const formData = {
        geolocation: obj.geolocation,
        imageId: obj.imageID,
        sensorId: obj.sensorId,
        geoUser: obj.geoUser,
        minThreshold: obj.minThreshold,
        maxThreshold: obj.maxThreshold,
      };
      const settings = {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/emailalert", settings);
      let data = await response.json();
      console.log(data);
      window.location.replace("/dashboard");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Delete a sensor
async function deleteSensorAPICall(obj) {
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      const formData = {
        geolocation: obj.geolocation,
        imageId: obj.imageID,
        sensorId: obj.sensorId,
        sensorIdUUID: obj.sensorIdUUID,
        geoUser: obj.geoUser,
      };
      const settings = {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/deleteSensor", settings);
      let data = await response.json();
      console.log(data);
      window.location.replace("/dashboard");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Get Current User
async function myDetails() {
  try {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const myAllDetails = await fetch("/me", settings);
    const response = await myAllDetails.json();
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Get Parent User Detail
async function parentUser(email) {
  try {
    const formdata = { email };
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    };
    const myAllDetails = await fetch("/parentUser", settings);
    const response = await myAllDetails.json();
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}
