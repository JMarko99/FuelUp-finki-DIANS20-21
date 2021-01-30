let latitude = -1, longitude = -1, marker = [], theMarker = [];

class FuelsStation {
    getFuels(button) {
        let minDif = 99999, nearestFuel, flag, input, fuels = [], range = [];
        if (button === 'btn4' || button === 'enterName') {
            input = $('#enterName').val();
            flag = false;
            if (input.length < 1){
                alert('Put fuels station name!');
            }
            else {
                input = input[0].toUpperCase() + input.slice(1);
            }
        }
        $.getJSON('benzinski.txt', function (data) {
            $.each(data.benzinski, function (i, fuel) {
                let name = fuel.name, fuelLongitude = fuel.lon, fuelLatitude = fuel.lat, diesel = fuel.diesel,
                    lpg = fuel.lpg, open = fuel.opening_hours;
                if (name !== "" && name !== "none") {
                    if (button === 'btn1') {                                                                            //get all fuels station in macedonia
                        PutMarker(fuelLatitude, fuelLongitude, name, diesel, lpg, open);
                        map.setView([41.6086, 21.7453], 8);
                    } else if (button === 'btn2') {                                                                     //get nearest 5 fuels stations
                        let area = arePointsNear(latitude, longitude, fuelLatitude, fuelLongitude, 40);
                        if (area) {
                            let station = fuelLatitude + '/' + fuelLongitude + '/' + name + '/' + diesel + '/' + lpg + '/' + open;
                            let rangeFuel = distance(latitude, longitude, fuelLatitude, fuelLongitude);
                            let fuelInfo = {rangeFuel, station}
                            fuels.push(fuelInfo);
                            range.push(distance(latitude, longitude, fuelLatitude, fuelLongitude));
                        }
                    } else if (button === 'btn3') {                                                                     //get nearest fuel station
                        let dif = distance(latitude, longitude, fuelLatitude, fuelLongitude);
                        if (dif < minDif) {
                            nearestFuel = fuelLatitude + '/' + fuelLongitude + '/' + name + '/' + diesel + '/' + lpg + '/' + open;
                            minDif = dif;
                        }
                    } else if ((button === 'btn4' || button === 'enterName') &&                                         //find the nearest petrol stations by name
                        parseFloat(fuelLongitude).toFixed(0) === parseFloat(longitude).toFixed(0)
                        && parseFloat(fuelLatitude).toFixed(0) === parseFloat(latitude).toFixed(0)) {
                        if (name === input) {
                            flag = true;
                            PutMarker(fuelLatitude, fuelLongitude, name, diesel, lpg, open);
                        }
                    }
                }
            });
            if (button === 'btn3') {
                let fuelsParts = nearestFuel.split('/');
                PutMarker(fuelsParts[0], fuelsParts[1], fuelsParts[2], fuelsParts[3], fuelsParts[4], fuelsParts[5]);
                map.setView([latitude, longitude], 11);
            } else if (button === 'btn4' || button === 'enterName') {
                if (!flag) {
                    alert("There is not fuel station with that name or nearest you!")
                } else map.setView([latitude, longitude], 11);
            } else if (button === 'btn2') {
                getFiveNearest(range, fuels)
                map.setView([latitude, longitude], 11)
            }
        }).error(function () {
            console.log('Base not loaded');
        });
    }
}

function deleteLayers() {                                                                                               //Gi brise prethodno postavenite markeri na mapata od
    for (let i = 0; i < marker.length; i++) {                                                                           //druga funkcija
        map.removeLayer(marker[i]);
    }
    marker.length = 0;
}

function arePointsNear(myLatitude, myLongitude, fuelLatitude, fuelLongitude, km) {                                      //Ova funkcija gi pronaogja benzinskite vo opseg od odredeni
    let ky = 40000 / 360;                                                                                               // kilometri spored momentalna lokacija na korisnikot.
    let kx = Math.cos(Math.PI * myLatitude / 180.0) * ky;                                                            // Promenlivite myLatitude/myLongitude se za lokacijata na
    let dx = Math.abs(myLongitude - fuelLongitude) * kx;                                                             // korisnikot, a fuelLatitude/fuelLongitude lokacijata na
    let dy = Math.abs(myLatitude - fuelLatitude) * ky;                                                               // benzinskata za koja se proveruva dali e vo toj opseg.
    return Math.sqrt(dx * dx + dy * dy) <= km;
}

function distance(myLatitude, myLongitude, fuelLatitude, fuelLongitude) {                                               //
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((fuelLatitude - myLatitude) * p) / 2 +
        c(myLatitude * p) * c(fuelLatitude * p) *
        (1 - c((fuelLongitude - myLongitude) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function getFiveNearest(range, fuels) {                                                                                   // Ova funkcija gi pronaogja najbliskite pet od prethodno
    range.sort(function (a, b) {return a - b});                                                                             // povikanata funkcija arePointsNear() i so toa se pronaogjat
    for (let i = 0; i < 5; i++) {                                                                                            // najbliskite pet benzinski
        for (let j = 0; j < range.length; j++) {
            if (range[i] === fuels[j].rangeFuel) {
                let fuelsParts = fuels[j].station.split('/');
                PutMarker(fuelsParts[0], fuelsParts[1], fuelsParts[2], fuelsParts[3], fuelsParts[4], fuelsParts[5]);
            }
        }
    }
}

function PutMarker(fuelLatitude, fuelLongitude, name, diesel, lpg, open) {                                              // Ova funkcija stava markeri na mapata od benzinskite vo
    let LamMarker = L.marker([fuelLatitude, fuelLongitude]).addTo(map)                                            // zavisnost od potrebite
        .bindPopup('<div  id="popUpMarker"><h5>' + name + '</h5><br>'
            + '<ul><li>Diesel: ' + diesel.toUpperCase() + '</li><li>LPG: ' + lpg.toUpperCase() + '<li>'
            + 'Open: ' + open + '<t></ul>' + 'Evaluate the service:' + '<br>' +
            '<div class="stars">\n' +
            '    <form action="">\n' +
            '        <input class="star star-5" id="star-5" type="radio" name="star"/>' +
            '        <label class="star star-5" for="star-5"></label>\n' +
            '        <input class="star star-4" id="star-4" type="radio" name="star"/>\n' +
            '        <label class="star star-4" for="star-4"></label>\n' +
            '        <input class="star star-3" id="star-3" type="radio" name="star"/>\n' +
            '        <label class="star star-3" for="star-3"></label>\n' +
            '        <input class="star star-2" id="star-2" type="radio" name="star"/>\n' +
            '        <label class="star star-2" for="star-2"></label>\n' +
            '        <input class="star star-1" id="star-1" type="radio" name="star"/>\n' +
            '        <label class="star star-1" for="star-1"></label>\n' +
            '</form></div>' +
            '<input type="text" id="comment" placeholder="Comment for service"></div>');
    marker.push(LamMarker);
}

function getYourLocation() {                                                                                            // So ova funkcija se pronaogja momentalnata lokacija na korisnikot.
    navigator.geolocation.getCurrentPosition(getLocation, unknownLocation);
    function getLocation(pos)
    {
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
    }
    function unknownLocation()
    {
        alert('Could not find location');
    }
}

function showPosition(position) {                                                                                       // Ova funkcija stava marker na mapata od lokacijata
    latitude = position.coords.latitude;                                                                                // na korisnikot.
    longitude = position.coords.longitude;
    if (theMarker !== undefined) {
        map.removeLayer(theMarker);
    }
    let myIcon = L.icon({
        iconUrl: 'images/pin48.png',
        iconRetinaUrl: 'images/pin48.png',
        iconSize: [40, 40],
        iconAnchor: [9, 21],
        popupAnchor: [0, -14]
    });
    theMarker = L.marker([latitude, longitude], {icon: myIcon}).addTo(map)
        .bindPopup('<label><h5>' + "Your Location" + '</h5></label>').openPopup();
    map.setView([latitude, longitude], 11);
}

function ButtonClick(button) {                                                                                          // Preku ova funkcija se povikuvaat site funkcii za kopcinjata
    deleteLayers();
    getYourLocation();
    let object = new FuelsStation();
    object.getFuels(button.id);
}

$(document).ready(function () {
    //=================== ALL FUEL STATIONS IN MACEDONIA ================================================
    $("#btn1").click(function () {
        ButtonClick(this);
    });
    //=================== NEAREST FUEL STATIONS AROUND YOU ================================================
    $("#btn2").click(function () {
        ButtonClick(this);
    });
    //=================== NEAREST FUEL STATION ================================================
    $("#btn3").click(function () {
        ButtonClick(this);
    });
    //=================== FIND THE NEAREST PETROL STATIONS BY NAME ================================================
    $("#btn4").click(function () {
        ButtonClick(this);
    });
    $("#enterName").on('keyup', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            ButtonClick(this);
        }
    });
    //=================== FIND YOUR LOCATION ================================================
    $(".btn-location").click(function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });
    //=================== STARS CLICK ================================================
    $('.stars a').on('click', function () {
        $('.stars span, .stars a').removeClass('active');
        $(this).addClass('active');
        $('.stars span').addClass('active');
    });
});



