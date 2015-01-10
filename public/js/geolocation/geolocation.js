document.addEventListener("DOMContentLoaded", init);

var html = document.getElementById("geolocation");

function init() {
    getCoordinates();
}

function getCoordinates() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        html.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    var geocoder = new google.maps.Geocoder();
    var latlong = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    geocoder.geocode({'latLng': latlong}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                var loc = getLocation(results);
                var country = loc["country"];
                var city = loc["city"];
                html.innerHTML = city + ", " + country;
            }
        }
    });


}

function getLocation(results)
{
    var location = [];
    for (var i = 0; i < results[0].address_components.length; i++)
    {
        var longname = results[0].address_components[i].long_name;
        var type = results[0].address_components[i].types;
        if (type.indexOf("country") != -1) {
            location["country"] =  longname;
        }
        if (type.indexOf("locality") != -1){
            location["city"] = longname;
        }
    }
    return location;
}
