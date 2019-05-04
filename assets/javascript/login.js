/*
Rutgers Full Stack coding Bootcamp Program Project
Description: This Javascript login.js is tied to index.html page and is responsible for
           1. Registering new users and generating a unique ID within Google's Firebase
           2. Signing in existing users and linking re-initializing their unique profiles within Firebase
           3. Passing through the required keys and data to move to the Preferences page
           4. Addressing any login/registration errors utilizing Bootstrap 4 Alerts

Author : Mukti Pancholi, Jason Mapou, Prashanth Mijar, John Maquire
Date: 12-Jan-2019
*/

console.log("hello");

var config = {
    apiKey: "AIzaSyC1c1GiOESAxQ8-aEPGYH8Bf2VdsBoTXWw",
    authDomain: "project1mjpj.firebaseapp.com",
    databaseURL: "https://project1mjpj.firebaseio.com",
    projectId: "project1mjpj",
    storageBucket: "project1mjpj.appspot.com",
    messagingSenderId: "755858814706"
};
firebase.initializeApp(config);

$(document).on("click", "#signInOpen", openSignIn);
$(document).on("click", "#registerOpen", openRegister);
$(document).on("click", "#signInSubmit", signInSubmit);
$(document).on("click", "#registerSubmit", registerSubmit);

var errorCaught = false;

function openSignIn() {
    console.log("click");
    $(".signIn").removeClass("d-none");
    $(".register").addClass("d-none");
    $("#registerOpen").hide();
    $("#signInOpen").hide();

    console.log("click2")
}

function openRegister() {
    console.log("click3");
    $(".register").removeClass("d-none");
    $(".signIn").addClass("d-none")
    $("#signInOpen").hide();
    $("#registerOpen").hide();
    console.log("click4")
}


function registerSubmit() {
    console.log("click");
    var email = $("#emailRegister").val().trim();
    var password = $("#passwordRegister").val().trim();
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == "auth/email-already-in-use") {
            $("#errorText").text("Email already in use");
        }
        if (errorCode == "auth/invalid-email") {
            $("#errorText").text("This does not appear to be a valid email address");
        } else {
            $("#errorText").text(errorMessage);
        }
        console.log(error);
    }).then(function () {
        window.open("preferences.html", "_self")
    })
}

function signInSubmit() {
    email = $("#emailSignIn").val().trim();
    password = $("#passwordSignIn").val().trim();
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == "auth/invalid-email") {
            $("#errorText").text("Invalid Email");
        }
        if (errorCode == "auth/user-not-found") {
            $("#errorText").text("Username Not Found");
        }
        if (errorCode == "auth/wrong-password") {
            $("#errorText").text("Incorrect Password");
        } else {
            $("#errorText").text(errorMessage);
        }
        return errorCaught = true;
    }).then(function () {
        if (!errorCaught) {
            window.open("dashboard.html", "_self")
        }
        else {
            errorCaught = false;
        }

    })
}
