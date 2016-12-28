require([
  "esri/map",
  "esri/layers/VectorTileLayer",
  "dojo/domReady!"
], function(Map, VectorTileLayer) {

  var map = new Map("map", {
    center: [2.3508, 48.8567], // longitude, latitude
    zoom: 2
  });

  //The URL referenced in the constructor may point to a style url JSON (as in this sample)
  //or directly to a vector tile service
  var vtlayer = new VectorTileLayer("https://www.arcgis.com/sharing/rest/content/items/bf79e422e9454565ae0cbe9553cf6471/resources/styles/root.json");
  map.addLayer(vtlayer);
});
