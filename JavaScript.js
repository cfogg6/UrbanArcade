// Note: This example requires that you consent to location sharing when
      // prompted by your browser. If you see the error "The Geolocation service
      // failed.", it means you probably did not give permission for the browser to
      // locate you.
var east;
var west;
var north;
var south;
var id;
var options;
var pacman;
var score = 0;
var currPosition;

var overlay;
var map;
var centerCoords;
var lat;
var lng;
var buttonSize = .00006;
var horizontalMax = .0005;
var horizontalSpacing = horizontalMax;
var verticalMax = .0005;
var verticalSpacing = verticalMax;
var dotLocations;
var ghostTol = .000005;
var tol = .0002;
var actualDotLocations = [];
var overlayArray = [];
var temp;

var redGhostOverlay;
var pinkGhostOverlay;
var myPacY;
var myPacX;
var myPacXPrev;
var myPacYPrev;

      /*
        Initializes Map
      */
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 17
        });

        // East, West, North, and South are 4 different pictures for
        // different location directions facing

        east = {
        url: "east.png",
        size: new google.maps.Size(30,30),
        scaledSize: new google.maps.Size(30,30)
        };
        west = {
        url: "west.png",
        size: new google.maps.Size(30,30),
        scaledSize: new google.maps.Size(30,30)
        };
        north = {
        url: "north.png",
        size: new google.maps.Size(30,30),
        scaledSize: new google.maps.Size(30,30)
        };
        south = {
        url: "south.png",
        size: new google.maps.Size(30,30),
        scaledSize: new google.maps.Size(30,30)
        };

        //Initializes the pacman for the maps as a Marker object

        pacman = new google.maps.Marker({
            map: map,
            icon: east
        });

        // Gets Location and moves map and pacman onto the map at the current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
           centerCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            walkersStuff();
            currPosition = centerCoords;
            pacman.setPosition(pos);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }

        //Specifies the options for the geo watching detection method below

        options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        id = navigator.geolocation.watchPosition(success, error, options);
      }
      /*
        Success function for when a movement is detected
      */
      function success(position) {
        currPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        myPacX = lng;
        myPacY = lat;
        var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        if (actualDotLocations.length > 0) {
            for (i = 0; i < actualDotLocations.length; i++) {
                if (((Math.abs(actualDotLocations[i].lat() - lat)) < tol)
                    && (Math.abs(actualDotLocations[i].lng() - lng)) < tol) {
                        score += 100;
                        document.getElementById("score").innerHTML = score.toString();
                        actualDotLocations.splice(i,1);
                        updateYellowDots(i);
                        //console.log(actualDotLocations);
                    }
            }
        }
        pacman.setPosition(pos);
        navigator.geolocation.clearWatch(id);
        id = navigator.geolocation.watchPosition(success, error, options);
      }
      /*
        Error method for when no movement is detected
      */
      function error(err) {
        console.warn("Hey it didn't work");
        navigator.geolocation.clearWatch(id);
        id = navigator.geolocation.watchPosition(success, error, options);
      }

      /*
        Hanles location error in case the browser does not support our functionality
      */
      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }
      /*
        Walker's Big Function
      */
      function walkersStuff() {
              var markerArray = [];
              lat = centerCoords.lat();
              lng = centerCoords.lng();

                // Instantiate a directions service.
                var directionsService = new google.maps.DirectionsService;

                var directionsDisplay = new google.maps.DirectionsRenderer({map: map});

                // Instantiate an info window to hold step text.
                var stepDisplay = new google.maps.InfoWindow;

                dotLocations = [];
                var toAdd;
                for (y = centerCoords.lat() - verticalMax; y <= centerCoords.lat() + verticalMax; y = y + verticalSpacing) {
                  for (x = centerCoords.lng() - horizontalMax; x <= centerCoords.lng() + horizontalMax; x = x + horizontalSpacing) {
                      if ((Math.abs(y - centerCoords.lat()) > .0001) && (Math.abs(x
                       - centerCoords.lng()) > .0001)) {
                          toAdd = new google.maps.LatLng(y, x);
                          dotLocations.push(toAdd);
                          //console.log((actualDotLocations[actualDotLocations.length - 1]).lat());
                       }
                  }
                }

                for (i = 0; i < dotLocations.length; i++) {
                  calculateAndDisplayRoute(
                    directionsDisplay, directionsService, markerArray, stepDisplay, map, dotLocations[i]);
                    //makeYellowDots(actualDotLocations[i]);
                }

                // Listen to change events from the start and end lists.
                var onChangeHandler = function() {
                  calculateAndDisplayRoute(
                      directionsDisplay, directionsService, markerArray, stepDisplay, map);
                };

      //          console.log('hey!');
      //          for (i = 0; i < actualDotLocations.length; i++) {
      //              console.log(i);
      //              makeYellowDots(actualDotLocations[i]);
      //              console.log(actualDotLocations[i]);
      //           }
              }
            /*
              Walker's function
            */
            function makeYellowDots(latitudeLongitude) {
              var imageBounds = {
                north: latitudeLongitude.lat() + .666*buttonSize,
                south: latitudeLongitude.lat() - .666*buttonSize,
                east: latitudeLongitude.lng() + buttonSize,
                west: latitudeLongitude.lng() - buttonSize
              };
              overlayBefore = new google.maps.GroundOverlay('yellowdot.png',imageBounds);
              overlayBefore.setMap(map);
              overlayArray.push(overlayBefore);


              //console.log(dotLocations);
            }

            function updateYellowDots(i) {

              //console.log(actualDotLocations.length);

              overlayArray[i].setMap(null);
              overlayArray.splice(i,1);
      //        for (i = 0; i < actualDotLocations.length; i++) {
      //          makeYellowDots(actualDotLocations[i]);
      //        }
            }

            /*
              Walker's function
            */
            function showSteps(directionResult, markerArray, stepDisplay, map) {
              var myRoute = directionResult.routes[0].legs[0];
              var endPoint = myRoute.steps[myRoute.steps.length - 1].end_location
              //############makeYellowDots(endPoint);
              actualDotLocations.push(endPoint);

              console.log((actualDotLocations[actualDotLocations.length - 1]).lat());
              makeYellowDots(endPoint);
            }
            /*
              Walker's function
            */
            function calculateAndDisplayRoute(directionsDisplay, directionsService,
                      markerArray, stepDisplay, map, thisDestination) {
                      directionsService.route({
                origin: centerCoords,
                destination: thisDestination,
                travelMode: google.maps.TravelMode.WALKING
              }, function(response, status) {
                // Route the directions and pass the response to a function to create
                // markers for each step.
                if (status === google.maps.DirectionsStatus.OK) {
                  document.getElementById('warnings-panel').innerHTML =
                      '<b>' + response.routes[0].warnings + '</b>';
                  showSteps(response, markerArray, stepDisplay, map);
                } else {
                  window.alert('Directions request failed due to ' + status);
                }
              });
            }


       function makePinkGhost(ghostY, ghostX) {
        var ghostYUp = ghostY + .00002;
        var ghostYDown = ghostY - .00002;
        var ghostXUp = ghostX + .000025;
        var ghostXDown = ghostX - .000025;
        var imageBounds = {
        north: ghostYUp,
        south: ghostYDown,
        east: ghostXUp,
        west: ghostXDown
        };
        if (pinkGhostOverlay)
            pinkGhostOverlay.setMap(null);
            pinkGhostOverlay = new google.maps.GroundOverlay('pacman_ghost_pink.png', imageBounds);
            pinkGhostOverlay.setMap(map);
    }

       function makeRedGhost(ghostY, ghostX) {
        var ghostYUp = ghostY + .00002;
        var ghostYDown = ghostY - .00002;
        var ghostXUp = ghostX + .000025;
        var ghostXDown = ghostX - .000025;
        var imageBounds = {
        north: ghostYUp,
        south: ghostYDown,
        east: ghostXUp,
        west: ghostXDown
        };
        if (redGhostOverlay)
            redGhostOverlay.setMap(null);
            redGhostOverlay = new google.maps.GroundOverlay('pacman_ghost_red.png', imageBounds);
            redGhostOverlay.setMap(map);
    }

       function movePinkGhost(pacX, pacY, pacXPrev, pacYPrev) {
        deltaX = pacX - pacXPrev;
        deltaY = pacY - pacYPrev;
        pacX = pacX + (2 * deltaX);
        pacY = pacY + (2 * deltaY);
        var ghostX = pinkGhostOverlay.getBounds().getCenter().lng();
        var ghostY = pinkGhostOverlay.getBounds().getCenter().lat();
        if(pacY > ghostY) {
            ghostY = ghostY + .00001;
        } else if (pacY < ghostY) {
            ghostY = ghostY - .00001;
        }
        if(pacX > ghostX) {
            ghostX = ghostX + .00001;
        } else if(pacX < ghostX) {
            ghostX = ghostX - .00001;
        }
        makePinkGhost(ghostY, ghostX);
    }

       function moveRedGhost(pacX, pacY) {
        var ghostX = redGhostOverlay.getBounds().getCenter().lng();
        var ghostY = redGhostOverlay.getBounds().getCenter().lat();
        if(pacY > ghostY) {
            ghostY = ghostY + .00001;
        } else if (pacY < ghostY) {
            ghostY = ghostY - .00001;
        }
        if(pacX > ghostX) {
            ghostX = ghostX + .00001;
        } else if(pacX < ghostX) {
            ghostX = ghostX - .00001;
        }
        makeRedGhost(ghostY, ghostX);
        checkCollision(ghostX, pacX, ghostY, pacY);
    }

       function moveGhosts(pacX, pacY, pacXPrev, pacYPrev) {
        moveRedGhost(pacX, pacY);
        //movePinkGhost(pacX, pacY, pacXPrev, pacYPrev);
    }

        // Use the DOM setInterval() function to change the offset of the symbol
        // at fixed intervals.
       function startGame() {
        var count = 0;
        window.setInterval(function() {
        moveGhosts(myPacX, myPacY, myPacXPrev, myPacYPrev);
        }, 1000);
    }

    /*
        Start Method
    */
    function start() {
        makeRedGhost(lat - .0003, lng - .00007);
        //makePinkGhost(lat + .0003, lng + .00007);
        myPacX = lng;
        myPacY = lat;
        var audio = document.getElementById("chomp");
        audio.play();
        startGame();
    }

    /*
        Checks Collision of Pacman and Ghosts and ends game if you lose.
    */
    function checkCollision(gX, pX, gY, pY) {
        if ((Math.abs(gX - pX) < ghostTol) && (Math.abs(gY - pY)) < ghostTol) {
            gameOver();
        }
    }
    /*
        Game Over
    */
    function gameOver() {
        var audio = document.getElementById("death");
        window.location.href = "GameOver.html";
        audio.play();
    }
    function somethingReallyCool() {
        if (actualDotLocations.length > 0) {
                temp = actualDotLocations.length - 1;
                score += 100;
                document.getElementById("score").innerHTML = score.toString();

                actualDotLocations.splice(temp,1);

                updateYellowDots(temp);
                console.log(actualDotLocations);
         }
     }

