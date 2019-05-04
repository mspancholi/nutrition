/*
Rutgers Full Stack coding Bootcamp Program Project
Description: This Javascript app.js is tied to dashboard.html page and is responsible for 
            1. Fetching user preferences from Firebase
            2. Getting user location (lat/long co-ordinates)
            3. Firing the nested Nutritionix API calls and building the JSON object array 
               based on user preferences and user food keyword search selection made
            4. Building the dynamic webelements in search results table
            5. Providing option for user to go restaurant of his choice or go to the restaurant website.
            
Author : Mukti Pancholi, Jason Mapou, Prashanth Mijar, John Maquire
Date: 12-Jan-2019
*/

var Brand_Name_City_State_Website; // the object that holds the AJAX response from the instant search that filters the products based on user location
var si_Response; // the object that holds the AJAX response from the instant search that filters the products based on user preference value

$(document).ready(function () {

    // Need to add any Firebase stuff
    var config = {
        apiKey: "AIzaSyC1c1GiOESAxQ8-aEPGYH8Bf2VdsBoTXWw",
        authDomain: "project1mjpj.firebaseapp.com",
        databaseURL: "https://project1mjpj.firebaseio.com",
        projectId: "project1mjpj",
        storageBucket: "project1mjpj.appspot.com",
        messagingSenderId: "755858814706"
    };
    firebase.initializeApp(config);
    var database = firebase.database();

    // data that will come from Firebase but hard-coding for now.
    var firebase_calories;
    var firebase_carbs;
    var firebase_protein;
    var firebase_sugar;

    var uid;

    var ocdkey = "&key=e39eaae9080247218a11a430ebd3a003&limit=1&pretty=1";
    var ocdbase = "https://api.opencagedata.com/geocode/v1/json?q=";
    const limit = 50;
    const distance = '10mi';

    firebase.auth().onAuthStateChanged(function (fbUser) {
        if (fbUser) {
            var user = firebase.auth().currentUser;
            uid = user.uid;

            database.ref("users/" + uid).once("value", function (userSnap) {
                var snap = userSnap.val();
                $("#Calories").text(snap.calories);
                $("#Carbs").text(snap.carbs);
                $("#Protein").text(snap.protein);
                $("#Sugars").text(snap.sugar);
            });
        }
    });

    // call the function to display the values of preferences on the search screen
    displayPreferences(firebase_calories, firebase_carbs, firebase_protein, firebase_sugar)

    //  searching action invoked on the submit button click in search page
    $("#search-btn").on("click", function (event) {
        console.log("search-btn click");
        event.preventDefault();

        // Grabing user input and triming
        var useMyLocation = $("#currentLocation").is(":checked");
        var address = $("#address-input").val().trim();
        var city = $("#city-input").val().trim();
        var state = $("#state-input").val().trim();
        var zipcode = $("#zip-code-input").val().trim();
        var food = $("#food-input").val().trim()

        console.log("useMyLocation = " + useMyLocation);
        console.log("address = " + address);
        console.log("city    = " + city);
        console.log("state   = " + state);
        console.log("zipcode = " + zipcode);
        console.log("food    = " + food);
        // need to verify all entries to make sure valid or at least user entered data
        // checking that user entered food
        if (food == "") {
            // alert("Enter valid Food");
            $("#errorText").text("Enter valid Food");
            return;
        }
        // checking if both zip and address are blank
        if (useMyLocation == false && zipcode == "" &&
            (address == "" || city == "" || state == "")) {
            $("#errorText").text("Enter zipcode or valid address or check Use My Location");
            return;
        }
        else if (useMyLocation == true && zipcode != "" && (address != "" || city != "" || state != "")) {
            $("#errorText").text("Please only enter Use My Location or zipcode or address");
            return;
        }
        else if (useMyLocation == true && (address != "" || city != "" || state != "")) {
            $("#errorText").text("Please only enter Use My Location or address");
            return;
        }
        else if (useMyLocation == true && zipcode != "") {
            $("#errorText").text("Please only enter Use My Location or zipcode");
            return;
        }
        else if (zipcode != "" && (address != "" || city != "" || state != "")) {
            $("#errorText").text("Please only enter zipcode or address");
            return;
        }
        //clear out error message
        $("#errorText").text("");

        // if all entries valid, then call Prashanth' function to search
        newSearchCall(food, useMyLocation, address, city, state, zipcode);

    });


    // The Go button click will take the user to mapquest page with the destination latitude and longitude information and current location
    $(document).on("click", ".goBtn", function () {
        event.preventDefault();
        console.log("Destination LatLong are:" + ($(this).attr('destlatlong')));
        window.location = "http://www.mapquest.com/embed/?q=" + ($(this).attr('destlatlong')) + "&maptype=hybrid&layer=traffic";
    });



    /* The Section below provides the collections of all the functions needed for this page */

    // this function displays values for the attributes stored in firebase under preferences section of search page
    function displayPreferences(calories, carbs, protein, sugar) {
        $("#Calories").text(calories);
        $("#Carbs").text(carbs);
        $("#Protein").text(protein);
        $("#Sugar").text(sugar);
    }


    // this function adds and displays the search results returned by API search result JSON array of objects
    function addToTable(arr) {
        // clear table first
        $("#results-table tbody tr").remove();

        for (i = 0; i < arr.length; i++) {
            // Below creates the new row
            var dist = (arr[i].distance / 1.609).toFixed(2);
            var destLatLong = arr[i].loclat + "," + arr[i].loclng;
            var v_retaurant_link = $("<a>").attr("href", arr[i].website).text(arr[i].restaurant);
            var newRow = $("<tr>").append(
                $("<td>").text(arr[i].food),
                $("<td>").append(v_retaurant_link),
                $("<td>").text(arr[i].location),
                $("<td>").text(dist + "mi"),
                $("<td>").text(arr[i].address),
                $("<button>").text("GO!").addClass("goBtn btn btn-primary").attr("destLatLong", destLatLong));

            // Below appends the new row to the table
            $("#results-table > tbody").append(newRow);

        }
    }

    // this function populates the search results of food, restaurants, location, distance based on user preferences
    function access_nutritionix_api(userSearchQuery, lat, long, distance, limit) {
        var appID = '88905904';
        var appKey = '61e818ca55274f66563f3835e3fe414e';
        var locationURL = 'https://trackapi.nutritionix.com/v2/locations?ll='

        locationURL = locationURL + lat + ',' + long + '&distance=' + distance + '&limit=' + limit;

        $("#mapID").attr("src", "https://www.mapquestapi.com/staticmap/v5/map?key=ZLTJ2TcrHRACk9jX7Q0aIG21cNlyQoL1&center=" + lat + ',' + long);
        console.log("URL = " + locationURL);

        // Perfoming an AJAX GET request to our queryURL
        $.ajax({
            url: locationURL,
            headers: {
                'x-app-id': appID,
                'x-app-key': appKey
            },
            method: 'GET',
            contentType: 'application/json'
        }).then(function (response) {
            // javascript map method - goes through all locations from response and creates new array
            var brand_ids = response.locations.map(function (locations) { return locations.brand_id });
            console.log(response.locations);
            // returns the JSON object needed in PART A section above for Prashanth's code
            Brand_Name_City_State_Website = response.locations.map(function (locations) {
                return {
                    food: userSearchQuery,
                    brand: locations.brand_id,
                    restaurant: locations.name,
                    location: locations.city,
                    website: locations.website,
                    distance: locations.distance_km,
                    loclat: locations.lat,
                    loclng: locations.lng,
                    address: locations.address + ',\n' + locations.city + ', ' + locations.state + ' ' + locations.zip
                }
            })
            //console.log("RESPONSE: " + JSON.stringify(response));
            console.log('Brand_Name_City_State_Website ' + JSON.stringify(Brand_Name_City_State_Website));

            // Need to do next AJAX call for search/instant/
            var siURL = 'https://trackapi.nutritionix.com/v2/search/instant';


            return $.ajax({
                url: siURL,
                headers: {
                    'x-app-id': appID,
                    'x-app-key': appKey,
                    'contentType': 'application/json'
                },
                method: 'POST',
                data: {
                    "query": userSearchQuery,
                    "common": false,
                    "self": false,
                    "branded": true,
                    "brand_ids": brand_ids,
                    "detailed": true,
                    "full_nutrients": {
                        "203": {
                            "lte": firebase_protein
                        },
                        "269": {
                            "lte": firebase_sugar
                        },
                        "205": {
                            "lte": firebase_carbs
                        },
                        "208": {
                            "lte": firebase_calories
                        }
                    }
                }
            })
        })
            .then(function (response) {
                //console.log("SI RESPONSE: " + JSON.stringify(response));   
                //This returns the response JSON object as below after filtering the preference values of the user
                si_Response = response.branded.map(function (branded) {
                    return {
                        food: branded.food_name,
                        brand: branded.nix_brand_id,
                        restaurant: branded.brand_name,
                        full_nutrient: branded.full_nutrients
                    }
                })
                console.log(response.branded);
                console.log("SI RESPONSE JSON :: " + JSON.stringify(si_Response));
                // once function returns consolidated array list, need to update table with response
                addToTable(consolidateArray());
            });
    };


    // this function is called to have the lat/long position retrieved based on user selected option and pass it on to the Nutritionix API
    function newSearchCall(food, useMyLocation, address, city, state, zipcode) {
        userSearchQuery = food;
        if (useMyLocation == true) { // if user allows system to track his current location this block of code executes
            navigator.geolocation.getCurrentPosition(getPosition);
        }
        else { // If user selects block my location then this block of code is executed and system uses the entered address to locate user position
            var ocdURL = ocdbase + "," + address + "," + city + "," + state + "," + zipcode + ocdkey
            openGate(ocdURL);
        }
    }

    // this is a callback function to getCurrentPosition() and will be called when user allows the system to trak his current position
    function getPosition(position) {
        lat = position.coords.latitude;
        long = position.coords.longitude;
        console.log("Your Latitude :: " + lat);
        console.log("Your Longitude :: " + long);
        access_nutritionix_api(userSearchQuery, lat, long, distance, limit);
    }

    //this function is called if user does not want his location tracked and provides his current address (address, city, state or zip)
    function openGate(x) {
        $.ajax({
            url: x,
            method: "GET"
        })
            .then(function (response) {
                lat = (response.results[0].geometry.lat)
                long = (response.results[0].geometry.lng)
                console.log("Your Latitude :: " + lat);
                console.log("Your Longitude :: " + long);
                access_nutritionix_api(userSearchQuery, lat, long, distance, limit);
            })
    }

    // this function looks into 2 array (Brand_Name_City_State_Website, si_Response)
    // of json objects and return only the records common to both based on brand
    function consolidateArray() {

        var arrayList = [];
        // var results;

        for (var i in si_Response) {

            var obj = { food: si_Response[i].food };

            for (var j in Brand_Name_City_State_Website) {
                if (Brand_Name_City_State_Website[j].brand === si_Response[i].brand) {
                    obj.brand = Brand_Name_City_State_Website[j].brand;
                    obj.restaurant = Brand_Name_City_State_Website[j].restaurant;
                    obj.location = Brand_Name_City_State_Website[j].location;
                    obj.website = Brand_Name_City_State_Website[j].website;
                    obj.distance = Brand_Name_City_State_Website[j].distance;
                    obj.address = Brand_Name_City_State_Website[j].address;
                    obj.loclat = Brand_Name_City_State_Website[j].loclat,
                    obj.loclng = Brand_Name_City_State_Website[j].loclng
                }
            }

            arrayList.push(obj);
            console.log("This is the final arrayList values " + i + " - " + JSON.stringify(arrayList[i]));
        }
        return arrayList;
    }
}) // end document ready