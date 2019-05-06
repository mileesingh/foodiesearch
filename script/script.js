
$(function () {
    $("#tabs").tabs();
    $("#dialog").dialog({
        autoOpen: false,
        width: 1100,
        show: {
            effect: "explode",
            duration: 500
        },
        hide: {
            effect: "explode",
            duration: 500
        },
        buttons: [
            {
                text: "Close",

                click: function () {
                    $(this).dialog("close");
                }

                // Uncommenting the following line would hide the text,
                // resulting in the label being used as a tooltip
                //showText: false
            },

        ],
        closeText: "Close"

    });
    $("#dialogmore").dialog({
        autoOpen: false,
        width: 500,
        show: {
            effect: "explode",
            duration: 500
        },
        hide: {
            effect: "explode",
            duration: 500
        },
        buttons: [
            {
                text: "Close",

                click: function () {
                    $(this).dialog("close");
                }

                // Uncommenting the following line would hide the text,
                // resulting in the label being used as a tooltip
                //showText: false
            },

        ],
        closeText: "Close"

    });
    $("#dialoginfo").dialog({
        autoOpen: false,
        width: 1100,
        show: {
            effect: "explode",
            duration: 500
        },
        hide: {
            effect: "explode",
            duration: 500
        },
        buttons: [
            {
                text: "Close",

                click: function () {
                    $(this).dialog("close");
                }

                // Uncommenting the following line would hide the text,
                // resulting in the label being used as a tooltip
                //showText: false
            },

        ],
        closeText: "Close"

    });
    $("#dialog-form").dialog({
        autoOpen: false,
        width: 400,
        modal: true,
        show: {
            effect: "explode",
            duration: 500
        },
        hide: {
            effect: "explode",
            duration: 500
        },
        buttons: [
            {
                text: "Close",

                click: function () {
                    $(this).dialog("close");
                }

                // Uncommenting the following line would hide the text,
                // resulting in the label being used as a tooltip
                //showText: false
            },

        ],
        closeText: "Close"

    });

});

var directionsDisplay = new google.maps.DirectionsRenderer;
var directionsService = new google.maps.DirectionsService;
var current_position;
var start;
var end;
//check whether geolocation service is available or not
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(initMap);
} else {
    console.log("Cannot Get Current Location")
}

function initMap(position) {
    console.log(position);
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: position.coords.latitude, lng: position.coords.longitude}
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('right-panel'));
    current_position = position;

}
function showmap(end_direction_latitude, end_direction_longitude) {
    $("#dialog").dialog("open");
    initMap(current_position);
    start = new google.maps.LatLng(current_position.coords.latitude, current_position.coords.longitude);
    end = new google.maps.LatLng(parseFloat(end_direction_latitude), parseFloat(end_direction_longitude));

    calculateAndDisplayRoute(directionsService, directionsDisplay);
}
function showinfo() {
    $("#dialoginfo").dialog("open");
    return false;
}
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function openmore() {
    $("#dialogmore").dialog("open");
}
function openfeedback() {
    $("#dialog-form").dialog("open");
    return false;
}

$(function () {
    $("#progressbar").progressbar({
        value: false
    });
    $("#feedbackform").submit(function (e) {
        e.preventDefault();
        var formData = {
            name: $("#name").val(),
            email: $("#email").val(),
            comments: $("#comments").val()
        };
        $.ajax({
            url: "https://formspree.io/mileesingh17@gmail.com",
            method: "POST",
            "data": formData
        }).done(function (data) {
        });
        noty({
            text: "Feedback Form Submitted Successfully.",
            type: 'alert',
            dismissQueue: true,
            layout: 'topCenter',
            theme: 'defaultTheme',
            timeout:2000
        });
        ga('send','event','feedback','click','feedback');
        $("#dialog-form").dialog("close");
    });

});
