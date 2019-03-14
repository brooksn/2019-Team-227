var map = L.map("mapid").setView([32.7139337, -117.1625655], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
  foo: "bar",
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(map);

$.getJSON("census_tracts.json", function(obj) {
  load_features(obj);
  console.log(obj);
});

function load_features(features) {
  function onEachFeature(feature, layer) {
    var popupContent =
      "<p>Tract " +
      feature.properties.GEOID +
      "<br>" +
      "total population:" +
      feature.properties.total_pop +
      "<br>" +
      "elder population:" +
      feature.properties.elder_pop +
      "<br>" +
      "%elders:" +
      feature.properties.elder_percent +
      "%<br></p>";
    layer.bindPopup(popupContent);
  }
  var max_percent = _.max(
    _.map(features.features, function(f) {
      return f.properties.elder_percent;
    })
  );
  console.log(max_percent);

  L.geoJSON(features, {
    onEachFeature: onEachFeature,
    style: function(feature) {
      var v = feature.properties.elder_percent / max_percent;
      var r = v * 255;
      var b = 0;
      var g = 0;
      return { color: "#" + (g | (b << 8) | (r << 16)).toString(16) };
    }
  }).addTo(map);
}
