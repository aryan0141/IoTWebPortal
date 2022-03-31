  var allUsersData = null;
  var allGeolocationsData = null;
  var allSensorsData = null;
  async function getAllUsers() {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const response = await fetch("/getAllUsers", settings);
    allUsersData = await response.json();
    console.log(allUsersData);
  }

  async function getAllGeolocations() {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const response = await fetch("/getAllGeolocations", settings);
    allGeolocationsData = await response.json();
    console.log(allGeolocationsData);
  }

  async function getAllSensors() {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    document.getElementById("sensorVerificationLoader").style.display = "block";
    document.getElementById("sensorVerificationCards").style.display = "none";
    const response = await fetch("/getAllSensors", settings);
    allSensorsData = await response.json();
    console.log(allSensorsData);

    setTimeout(function(){ extractInfo() }, 50);
    document.getElementById("sensorVerificationLoader").style.display = "none";
    document.getElementById("sensorVerificationCards").style.display = "block";

  }

  getAllUsers();
  getAllGeolocations();
  getAllSensors();

  function getGeolocationFromGeoId(geoId) {
    var requiredGeolocation = null;
    allGeolocationsData.forEach((data) => {
      if(data._id == geoId) {
        requiredGeolocation = data;
        return;
      }
    })
    return requiredGeolocation;
  }

  function getUserFromUserId(userId) {
    var requiredUser = null;
    allUsersData.forEach((data) => {
      if(data._id == userId) {
        requiredUser = data;
        return;
      }
    })
    return requiredUser;
  }

  function extractInfo() {
    var anyUnVerifiedSensorFound = false;
    allSensorsData.forEach(a => {
      var user = getUserFromUserId(a.user);
        const sensorArray = a.sensor;
        sensorArray.forEach(b => {
          const dataArray = b.data;
          var geolocation = getGeolocationFromGeoId(b.geolocation);
          dataArray.forEach(c => {
            var imageId = (c.image) ? c.image : null;
              const sensorDetailArray = c.sensorDetail;
              sensorDetailArray.forEach(currSensorDetail => {
                // userName = (user) ? user.name : null;
                // geolocationName = (geolocation) ? geolocation.name : null;
                // sensorDetail = (currSensor) ? currSensor : null;
                if(user && geolocation && imageId && currSensorDetail && currSensorDetail.isVerified == false) {
                  anyUnVerifiedSensorFound = true;
                  createDiv(user, geolocation, imageId, currSensorDetail)
                  // console.log(user.name + " | " + geolocation.name + " | " + currSensorDetail.sensorName);
                } 
              })
          })
        })
    })

    if(anyUnVerifiedSensorFound == false) {
      document.getElementById("noSensorText").style.display = "block";
    }

  }

  function createDiv(user, geolocation, imageId, currSensorDetail) {
    var cardDiv = document.createElement("div");
    cardDiv.className = "sensorVerificationCard";


    var grid1 = document.createElement("div");
    grid1.className = "grids";
    var grid2 = document.createElement("div");
    grid2.className = "grids";
    var grid3 = document.createElement("div");
    grid3.style.margin = "auto";
    // grid3.className = "paraGrids";

    // ---------------------------------------------------------------------------
    
    // Grid-1 Elements
    var sensorName_div = document.createElement("div");
    sensorName_div.className = "paraDivs";
    sensorName_div.innerHTML = `
                                <p style="flex-grow: 1">
                                  Sensor Name:
                                </p>
                                <p>
                                  ${currSensorDetail.sensorName}
                                </p>
                              `;

    var sensorLocation_div = document.createElement("div");
    sensorLocation_div.className = "paraDivs";
    sensorLocation_div.innerHTML = `
                                  <p style="flex-grow: 1">
                                    Sensor Location:
                                  </p>
                                  <p>
                                    ${currSensorDetail.location}
                                  </p>
                                `;

    var sensorType_div = document.createElement("div");
    sensorType_div.className = "paraDivs";
    sensorType_div.innerHTML = `
                                  <p style="flex-grow: 1">
                                    Sensor Type:
                                  </p>
                                  <p>
                                    ${currSensorDetail.sensorType}
                                  </p>
                                `;


    var sensorId_div = document.createElement("div");
    sensorId_div.className = "paraDivs";
    sensorId_div.innerHTML = `
                                  <p style="flex-grow: 1">
                                    Sensor Id:
                                  </p>
                                  <p>
                                    ${currSensorDetail.sensorId}
                                  </p>
                                `;

    grid1.append(sensorName_div);
    grid1.append(sensorLocation_div);
    grid1.append(sensorType_div);
    grid1.append(sensorId_div);

    // ---------------------------------------------------------------------------

    // Grid-2 Elements
    var userName_div = document.createElement("div");
    userName_div.className = "paraDivs";
    userName_div.innerHTML = `
                                  <p style="flex-grow: 1">
                                    User Name:
                                  </p>
                                  <p>
                                    ${user.name}
                                  </p>
                                `;

    var userEmail_div = document.createElement("div");
    userEmail_div.className = "paraDivs";
    userEmail_div.innerHTML = `
                                  <p style="flex-grow: 1">
                                    User Email:
                                  </p>
                                  <p>
                                    ${user.email}
                                  </p>
                                `;

    var geolocationName_div = document.createElement("div");
    geolocationName_div.className = "paraDivs";
    geolocationName_div.innerHTML = `
                                  <p style="flex-grow: 1">
                                    Geolocation Name:
                                  </p>
                                  <p>
                                    ${geolocation.name}
                                  </p>
                                `;

    var geolocation_div = document.createElement("div");
    geolocation_div.className = "paraDivs";
    geolocation_div.innerHTML = `
                                  <p style="flex-grow: 1">
                                    Location:
                                  </p>
                                  <p>
                                    ${geolocation.location}
                                  </p>
                                `;


    grid2.append(userName_div);
    grid2.append(userEmail_div);
    grid2.append(geolocationName_div);
    grid2.append(geolocation_div);

    // ---------------------------------------------------------------------------

    // Grid-3 Elements
    var acceptBtn = document.createElement("BUTTON");
    acceptBtn.append(document.createTextNode("Accept"));
    acceptBtn.onclick = function () {
      if(confirm("Are you sure want to verify that sensor?") == false) {
        return;
      }
      var sensorId = currSensorDetail._id;
      var geoId = geolocation._id;
      var userId = user._id;
      var isVerified = true;
      var sensorIdUUID = currSensorDetail.sensorId;
      obj = {
        sensorId,
        geoId,
        userId,
        imageId,
        isVerified,
        sensorIdUUID,
      }

      isVerifiedSensorAPICall(obj)
    };
    acceptBtn.id = "acceptBtn";

    var declineBtn = document.createElement("BUTTON");
    declineBtn.append(document.createTextNode("Decline"));
    declineBtn.onclick = function () {
      if(confirm("Are you sure want to decline that sensor?") == false) {
        return;
      }
      var sensorId = currSensorDetail._id;
      var geoId = geolocation._id;
      var userId = user._id;
      var isVerified = false;
      var sensorIdUUID = currSensorDetail.sensorId;
      obj = {
        sensorId,
        geoId,
        userId,
        imageId,
        isVerified,
        sensorIdUUID,
      }
      isVerifiedSensorAPICall(obj)
    };
    declineBtn.id = "declineBtn";

    grid3.append(acceptBtn);
    grid3.append(declineBtn);

    // ---------------------------------------------------------------------------

    cardDiv.append(grid1);
    cardDiv.append(grid2);
    cardDiv.append(grid3);
    
    var sensorVerificationCards = document.getElementById("sensorVerificationCards");
    sensorVerificationCards.append(cardDiv)

  }


// Function to verify the sensor to true.
async function isVerifiedSensorAPICall(obj) {
    try {
      const formData = {
        sensorId: obj.sensorId,
        geoId: obj.geoId,
        userId: obj.userId,
        imageId: obj.imageId,
        isVerified: obj.isVerified,
        sensorIdUUID: obj.sensorIdUUID,
      };
      const settings = {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/verifyTheSensor", settings);
      let data = await response.json();
      console.log(data);
      window.location.replace("/sensorVerification");
    }
    catch (err) {
      console.log(err);
      alert("Something went wrong...");
    }
}
  

