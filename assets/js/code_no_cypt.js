// set structure main
var map = L.map('map').setView([0, 0], 14);
var lat = null;
var lon = null;
var endMarker = null;
var set_point_my_map = 1;
var endMap = null;
var startMap = null;
var userMarker;
var is_marker_car_running = false;
var previousTimeouts = []; // สร้างตัวแปรเพื่อเก็บ Timeout ของลูปเดิม

var routingControl = L.Routing.control({
  waypoints: [],  // เริ่มต้นที่ไม่มี waypoints
  routeWhileDragging: true,
  serviceUrl: 'https://router.project-osrm.org/route/v1',
  lineOptions: {
    styles: [{ color: 'red', opacity: 1, weight: 10 }] // กำหนดสีเป็นแดง
  }
}).addTo(map);
var is_active = false;

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// กำหนดเลเยอร์เป็นตัวเลือกในการเปลี่ยนแผนที่
var terrainLayer = L.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Tiles by <a href="http://stamen.com">Stamen</a>'
});

var Stamen = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
  attribution: '© <a href="http://maps.stamen.com/toner/">Stamen Design</a>',
  subdomains: 'abcd',
  maxZoom: 20,
  ext: 'png'
})

var arcgisonline = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: '© <a href="https://www.esri.com/">Esri</a>',
  maxZoom: 19
});


var basemaps = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

var opentopomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://opentopomap.org/">OpenTopoMap</a>',
  maxZoom: 19
})

// ภูมิประเทศ
var baseLayers = {
  "Street Map": tiles,
  "Stamen": Stamen,
  "Terrain Map": terrainLayer,
  "arcgisonline": arcgisonline,
  "basemaps": basemaps,
  "opentopomap": opentopomap,
};
// เพิ่มตัวเลือกเปลี่ยนแผนที่ใน Leaflet
L.control.layers(baseLayers).addTo(map);
L.control.locate().addTo(map); // location my

var taxiIcon = L.icon({
  iconUrl: 'assets/img/car.png',
  iconSize: [70, 70]
})

var marker_car = L.marker([0, 0], { icon: taxiIcon }).addTo(map);
var searchControl = L.Control.geocoder().addTo(map);
// set structure main

// for search location 
searchControl.on('markgeocode', function (e) {
  var selectedLocation = e.geocode;

  // เก็บตำแหน่งปัจจุบันของผู้ใช้
  var userLatLng = L.latLng(lat, lon);

  // เก็บตำแหน่งของสถานที่ที่ค้นหาเจอ
  var destinationLatLng = L.latLng(selectedLocation.center.lat, selectedLocation.center.lng);

  // ลบเส้นทางการเดินทางเก่า (หากมี)
  if (map.hasLayer(routingControl)) {
    map.removeLayer(routingControl);
  }

  // สร้างเส้นทางการเดินทางใหม่
  routingControl.setWaypoints([
    userLatLng,  // ตำแหน่งปัจจุบันของผู้ใช้
    destinationLatLng  // ตำแหน่งของสถานที่ที่ค้นหาเจอ
  ]).on('routesfound', function (e) {
    console.log(e)
    var routes = e.routes;
    let marker_car = L.marker([lat, lon], { icon: taxiIcon }).addTo(map); //start marker
    e.routes[0].coordinates.forEach(function (coord, index) {
      setTimeout(function () {
        marker_car.setLatLng([coord.lat, coord.lng]);
      }, 100 * index)
    })
  }).addTo(map);

  // เพิ่มเส้นทางการเดินทางใหม่ลงแผนที่
  // map.addLayer(routingControl);
});

const get_localtion = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      var accuracy = position.coords.accuracy;  // ค่าความแม่นยำ
      // ตรวจสอบว่าความแม่นยำมากพอที่จะนำค่าตำแหน่งมาใช้หรือไม่
      if (accuracy >= 100) {  // ตัวเลข 100 คือค่าที่คุณสามารถปรับเปลี่ยนได้
        console.log("Location accuracy is too low to use.");
      }
      // ตั้งค่ามุมมองแผนที่ให้แสดงตำแหน่งปัจจุบัน
      map.setView([lat, lon], 13);

      // var redIcon = L.icon({
      //   iconUrl: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png', // รูปไอคอนของสีแดง
      //   iconSize: [45, 41], // ขนาดไอคอน [กว้าง, สูง]
      //   iconAnchor: [22, 20] // จุดระบุตำแหน่งของไอคอนบนแผนที่ [x, y]
      // });

      // เพิ่มเครื่องหมายบนแผนที่เพื่อแสดงตำแหน่งปัจจุบัน
      userMarker = L.marker([lat, lon]).addTo(map);
      userMarker.bindPopup("Your Current Location").openPopup();

      // ลบเส้นทางการเดินทางเก่า (หากมี)
      if (map.hasLayer(routingControl)) {
        map.removeLayer(routingControl);
      }

      // รีเซ็ตการเดินทางเดิม
      // routingControl.spliceWaypoints(0, 2);
      // is_active = false;
    });
  }
}
get_localtion();


// เริ่มต้นการเดินทางจากจุดตัวเอง
const my_starting_point = () => {
  startMap = null;
  endMap = null;
  routingControl.spliceWaypoints(0, 2);
  document.querySelector(".my_location_poin").classList.toggle("active");
  if (set_point_my_map == 2) {
    set_point_my_map = 1;
  } else {
    set_point_my_map = 2;
  }
}


// ข้อมูลผู้ใช้
var peopleInNorthernThailand = [
  { name: "John", lat: 18.7883, lon: 98.9850 },
  { name: "Jane", lat: 19.9024, lon: 99.8286 },
  { name: "Alex", lat: 19.9072, lon: 99.8301 },
  { name: "Emma", lat: 18.7922, lon: 98.9936 },
  { name: "Michael", lat: 18.7659, lon: 98.9530 },
  { name: "Sophia", lat: 19.3582, lon: 98.4370 },
  { name: "William", lat: 18.9106, lon: 98.9339 },
  { name: "Olivia", lat: 18.7681, lon: 98.9847 },
  { name: "Ethan", lat: 19.8515, lon: 99.7712 },
  { name: "Ava", lat: 18.7783, lon: 98.9850 },
  { name: "Liam", lat: 19.8551, lon: 99.2185 },
  { name: "Mia", lat: 19.9100, lon: 99.8325 },
  { name: "Noah", lat: 18.9249, lon: 99.2365 },
  { name: "Isabella", lat: 19.3613, lon: 98.4437 },
  { name: "James", lat: 18.7826, lon: 98.9851 },
  { name: "Sophia", lat: 19.8575, lon: 99.1870 },
  { name: "Logan", lat: 19.9117, lon: 99.8323 },
  { name: "Charlotte", lat: 18.7649, lon: 98.9550 },
  { name: "Benjamin", lat: 19.3603, lon: 98.4375 },
  { name: "Amelia", lat: 18.9245, lon: 98.2345 },
  { name: "Elijah", lat: 19.8552, lon: 99.1215 },
  { name: "Logan", lat: 13.7563, lon: 100.5018 },
  { name: "Charlotte", lat: 13.6858, lon: 100.5370 },
  { name: "Benjamin", lat: 13.7651, lon: 100.5467 },
  { name: "Amelia", lat: 13.7367, lon: 100.5232 },
  { name: "Elijah", lat: 13.7461, lon: 100.5291 },
  { name: "Olivia", lat: 13.7434, lon: 100.5642 },
  { name: "William", lat: 13.7279, lon: 100.5242 },
  { name: "Ava", lat: 13.7083, lon: 100.4569 },
  { name: "James", lat: 13.7384, lon: 100.5360 },
  { name: "Sophia", lat: 13.7196, lon: 100.5532 }
];

// data list members
const function_search_member = () => {
  let data_list = ``;
  peopleInNorthernThailand.forEach(function (person) {
    data_list += `<option value="${person.name},${person.lat},${person.lon}">`;
  })
  document.getElementById("list_members").innerHTML = data_list;
}

function_search_member();


// function search members by input and get location
document.getElementById("search_member_map").addEventListener("submit", (e) => {
  e.preventDefault();
  let start_this = document.getElementById("input_start").value;
  let end_this = document.getElementById("input_end").value;
  start_this = split_text_into_array(start_this);
  end_this = split_text_into_array(end_this);
  routingControl.setWaypoints([
    L.latLng(start_this[1], start_this[2]),  // ตำแหน่งปัจจุบันของผู้ใช้
    L.latLng(end_this[1], end_this[2])  // ตำแหน่งของคนที่คลิก
  ]);

  document.getElementById("input_start").value = "";
  document.getElementById("input_end").value = "";
  document.getElementById("close_modal").click();
})

// func sub str tp arr
function split_text_into_array(text) {
  text_array = text.split(',')
  return text_array
}

// เพิ่มเครื่องหมายสำหรับแต่ละคนในประเทศไทย
peopleInNorthernThailand.forEach(function (person) {
  var marker = L.marker([person.lat, person.lon]).addTo(map);
  var popupContent = `
  <b>Name:</b> ${person.name}<br>
    <b>Latitude:</b> ${person.lat}<br>
      <b>Longitude:</b> ${person.lon}
      `;
  marker.bindPopup(popupContent);

  marker.on('mouseover', function (e) {
    marker.openPopup();
  });

  marker.on('mouseout', function (e) {
    marker.closePopup();
  });


  marker.on('click', function (e) {
    previousTimeouts.forEach(function (timeout) {
      clearTimeout(timeout);
    });


    // clear marker car
    if (marker_car) {
      marker_car.off('click'); // ลบกิจกรรมคลิกเก่า
      map.removeLayer(marker_car);
      marker_car = null; // เคลียร์ค่าตัวแปร marker_car
    }
    if (is_marker_car_running) {
      is_marker_car_running = false; // ยกเลิกการทำงานของ marker_car
    }

    is_active = true;
    is_marker_car_running = true; // กำหนดให้ marker_car กำลังทำงานอยู่
    startMap = endMap;
    // console.log(set_point_my_map)
    if (startMap == null || startMap.lat == null || set_point_my_map == 2) {
      marker_car = L.marker([lat, lon], { icon: taxiIcon }).addTo(map); //start marker
      routingControl.setWaypoints([
        L.latLng(lat, lon),  // ตำแหน่งปัจจุบันของผู้ใช้
        L.latLng(e.latlng.lat, e.latlng.lng)  // ตำแหน่งของคนที่คลิก
      ]).on('routesfound', function (e) {
        var routes = e.routes;
        e.routes[0].coordinates.forEach(function (coord, index) {
          var timeout = setTimeout(function () {
            if (is_marker_car_running) { // ตรวจสอบว่า marker_car ยังคงทำงานอยู่หรือไม่
              marker_car.setLatLng([coord.lat, coord.lng]);
            } else {
            }
          }, 100 * index)
          previousTimeouts.push(timeout); //เก็บ Timeout ของลูปใหม่เพื่อใช้งานในอนาคต จากนั้น clear อันเดิม
        })
      }).addTo(map);
    } else {
      marker_car = L.marker([startMap.lat, startMap.lng], { icon: taxiIcon }).addTo(map); //start marker
      // กรณีเดินทางหลายรายการ
      // routingControl = L.Routing.control({
      //   waypoints: [
      //     L.latLng(startMap.getLatLng()),  // ตำแหน่งเริ่มต้น (marker ก่อนหน้า)
      //     L.latLng(person.lat, person.lon)    // ตำแหน่งของคนที่คลิก
      //   ]
      // }).addTo(map);
      routingControl.setWaypoints([
        L.latLng(startMap.lat, startMap.lng),  // ตำแหน่งปัจจุบันของผู้ใช้
        L.latLng(e.latlng.lat, e.latlng.lng)  // ตำแหน่งของจุดที่คลิก
      ]).on('routesfound', function (e) {
        var routes = e.routes;
        e.routes[0].coordinates.forEach(function (coord, index) {
          var timeout = setTimeout(function () {
            if (is_marker_car_running) { // ตรวจสอบว่า marker_car ยังคงทำงานอยู่หรือไม่
              marker_car.setLatLng([coord.lat, coord.lng]);
            } else {
            }
          }, 100 * index)
          previousTimeouts.push(timeout); //เก็บ Timeout ของลูปใหม่เพื่อใช้งานในอนาคต จากนั้น clear อันเดิม
        })
      }).addTo(map);
    }

    endMap = {
      lat: e.latlng.lat, lng: e.latlng.lng
    };

    // detail
    routingControl.on('routesfound', function (e) {
      var routes = e.routes;
      var summary = routes[0].summary;
      console.log(`Distance: ${summary.totalDistance / 1000} km`);
      console.log(`Duration: ${summary.totalTime / 60} minutes`);
    });
  });
});

// click location on map
map.on('click', function (e) {
  // clear time out
  previousTimeouts.forEach(function (timeout) {
    clearTimeout(timeout);
  });

  if (is_active) {
    if (marker_car) {
      marker_car.off('click'); // ลบกิจกรรมคลิกเก่า
      map.removeLayer(marker_car);
      marker_car = null; // เคลียร์ค่าตัวแปร marker_car
    }
    if (is_marker_car_running) {
      is_marker_car_running = false; // ยกเลิกการทำงานของ marker_car
    }
    // ถ้ามีเส้นทางที่กำลังเดินอยู่ ให้ยกเลิกเส้นทาง
    routingControl.spliceWaypoints(0, 2);
    is_active = false;
  } else {
    is_marker_car_running = true; // กำหนดให้ marker_car กำลังทำงานอยู่
    is_active = true;
    startMap = endMap;
    if (startMap == null || startMap.lat == null || set_point_my_map == 2) {
      marker_car = L.marker([lat, lon], { icon: taxiIcon }).addTo(map); //start marker
      routingControl.setWaypoints([
        L.latLng(lat, lon),  // ตำแหน่งปัจจุบันของผู้ใช้
        L.latLng(e.latlng.lat, e.latlng.lng)  // ตำแหน่งของคนที่คลิก
      ]).on('routesfound', function (e) {
        var routes = e.routes;
        e.routes[0].coordinates.forEach(function (coord, index) {
          var timeout = setTimeout(function () {
            if (is_marker_car_running) { // ตรวจสอบว่า marker_car ยังคงทำงานอยู่หรือไม่
              marker_car.setLatLng([coord.lat, coord.lng]);
            } else {
            }
          }, 100 * index)
          previousTimeouts.push(timeout); //เก็บ Timeout ของลูปใหม่เพื่อใช้งานในอนาคต จากนั้น clear อันเดิม
        })
      }).addTo(map);
    } else {
      // ถ้าไม่มีเส้นทางที่กำลังเดินอยู่ ให้เริ่มเส้นทางจากตำแหน่งปัจจุบันไปยังจุดที่คลิก
      marker_car = L.marker([startMap.lat, startMap.lng], { icon: taxiIcon }).addTo(map); //start marker
      routingControl.setWaypoints([
        L.latLng(startMap.lat, startMap.lng),  // ตำแหน่งปัจจุบันของผู้ใช้
        L.latLng(e.latlng.lat, e.latlng.lng)  // ตำแหน่งของจุดที่คลิก
      ]).on('routesfound', function (e) {
        var routes = e.routes;
        e.routes[0].coordinates.forEach(function (coord, index) {
          var timeout = setTimeout(function () {
            if (is_marker_car_running) { // ตรวจสอบว่า marker_car ยังคงทำงานอยู่หรือไม่
              marker_car.setLatLng([coord.lat, coord.lng]);
            } else {
              return;
            }
          }, 100 * index)
          previousTimeouts.push(timeout); // เก็บ Timeout ของลูปใหม่เพื่อใช้งานในอนาคต จากนั้น clear อันเดิม
        })
      }).addTo(map);
    }
    endMap = {
      lat: e.latlng.lat, lng: e.latlng.lng
    };
  }
});
