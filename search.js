var map;
var markercenter=null;
var markerPlaces=new Array();
var data  //parsed data

function initAutocomplete() { /*function called on loading, IIT Bombay loaded initially*/
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 19.1334, lng: 72.9133}, /*IIT Bombay Location*/
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    gestureHandling: 'greedy',/*No zoom via scroll wheel */
    disableDefaultUI: true, /*removing default buttons street view, mode,etc*/
    zoomControl: true
  });
  var marker = new google.maps.Marker({
    title:"Fixed at Center",
    position: map.getCenter(),
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10
    },
    draggable: false,
    map: map
  }); //non draggable marker
  map.addListener('center_changed', function() {
    marker.setPosition(map.getCenter());
  });

  var myLatlng = map.getCenter();
  markercenter = new google.maps.Marker({
    position: myLatlng,
    title:"Present Location",
    draggable: true,
    animation: google.maps.Animation.BOUNCE
  });

  markercenter.setMap(map);
  markercenter.addListener('dragend',dragCenterMarker);
  markercenter.setMap(map);

  document.getElementById("search").addEventListener("click",searchClicked);


  var customStyled =
  [{
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }];

  map.set('styles',customStyled); //Removing Unncessary Labels on Map

  //Search Box
  var input = document.getElementById('pac-input');
  var latlong=document.getElementById('LatLongControl');
  var searchBox = new google.maps.places.SearchBox(input);
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0)
    return;

    markercenter.setPosition(places[0].geometry.location);map.setCenter(places[0].geometry.location);
    input.value="";
    mapCenterChanged();
  });

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(latlong);

  map.addListener('dragend', function() {
    window.setTimeout(function() {
      refresh();
    }, 1000); //delay to give time for the pan after dragging

  }); //we refresh only on Pan. We dont refresh On Zoom
}
function searchClicked()
{
  var latValue=document.getElementById('lat').value;
  var longValue=document.getElementById('long').value;
  if(latValue==""||longValue=="")return;
  map.setCenter(new google.maps.LatLng(latValue,longValue));
  refresh();
  document.getElementById('lat').value="";
  document.getElementById('long').value="";
}

function refresh()
{
  if(markercenter!=null)markercenter.setPosition(map.getCenter());
  mapCenterChanged();
}

function dragCenterMarker()
{
  var latLng = markercenter.getPosition();
  map.setCenter(latLng);
  mapCenterChanged();

}
var storeinfowindow = new Array();
function mapCenterChanged()
{
  var distanceInkm;
  var centerLat=markercenter.getPosition().lat();
  var centerLng=markercenter.getPosition().lng();

  while(markerPlaces.length) { markerPlaces.pop().setMap(null); }
  markerPlaces=new Array();
  var arrayLength = data.length;
  for (var i = 0; i < arrayLength; i++) {
    distanceInkm=distanceBetween(centerLat,centerLng,data[i].latitude,data[i].longitude);

    if(distanceInkm<=10){ /*radial distance between 10 km */
      //console.log(distanceInkm);
      var content="<h5>"+data[i].name+"</h5>"+"Rating : "+data[i].rating+"<br/>"+data[i].types+"<br/>";
      var infowindow = new google.maps.InfoWindow();
      var marker = new google.maps.Marker({
        title:data[i].name,
        position:new google.maps.LatLng(data[i].latitude,data[i].longitude),
        draggable: false,
      });
      google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){
        return function() {
          infowindow.setContent(content);
          infowindow.open(map,marker);
          closeAllInfoWindows();
          storeinfowindow.push(infowindow);
        };
      })(marker,content,infowindow));
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
      marker.setMap(map);
      markerPlaces.push(marker);
    }
  }

}
function closeAllInfoWindows() {
  while(storeinfowindow.length){
    storeinfowindow.pop().close();
  }
}

function distanceBetween(lat1, lon1, lat2, lon2)
{
  var unit='K';
  var radlat1 = Math.PI * lat1/180;
  var radlat2 = Math.PI * lat2/180;
  var radlon1 = Math.PI * lon1/180;
  var radlon2 = Math.PI * lon2/180;
  var theta = lon1-lon2;
  var radtheta = Math.PI * theta/180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit=="K") { dist = dist * 1.609344;}
  if (unit=="N") { dist = dist * 0.8684; }
  return dist;
}
function handleFileSelect(evt) {
  var file = evt.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      data = results.data;console.log(data);
    }
  });
  var x = document.getElementById("dummy");
  x.style.display = "none";
  x = document.getElementById("pac-input");
  x.style.display = "block";
  x = document.getElementById("LatLongControl");
  x.style.display = "block";
  x = document.getElementById("map");
  x.style.display = "block";
}


$(document).ready(function(){
  $("#csv-file").change(handleFileSelect);
});
