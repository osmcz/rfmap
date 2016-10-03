// rfmap

$(function(){
	var overpassEndpoint = 'http://overpass-api.de/api/interpreter';
	var initQuery = '[out:json][timeout:25];' +
	'(' + 
  	'node["rf:frequency"];' + 
  	'way["rf:frequency"];' +
  	'rel["rf:frequency"];' +
  	'>;' +
	');' +
	'out body;';

  function arEach(obj, fun){
    var i, j, length;
    for (i = 0, length = obj.length; i < length; i++) {
        fun(obj[i]);
    }
  }
  

  function showInfo(f) {
      var out = '';
      var tags = f.properties && f.properties.tags || {};
      var rels = f.properties && f.properties.relations || {};

      if (tags['rf:frequency']) {
        rels.push({reltags: tags});
      }
      
      out += '<h2>'+ (tags.name || f.id) +'</h2>';
      if (tags.description) {
        out += '<p>'+ tags.description +'</p>';
      }

      out += '<ul>';
      arEach(rels,function(rel){
          var tags = rel.reltags || {}
          out += '<li>'+(tags['rf:content'] || tags['name']) +' at ' + tags['rf:frequency']+ ' '+tags['rf:modulation']+'</li>';
      });

      out += '</ul>';

      out += '<br><a href="https://www.openstreetmap.org/' + f.id + '">show details on OSM</a>'
      $('#output').html(out);
  };

  function makeInfo(feature, layer) {
      layer.on('click', function() {
        console.log(feature);
        showInfo(feature);
      });
  };


	var map = L.map('rfmap', {
    	center: [50.09027, 14.41025],
    	zoom: 12
	});
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
  var dataLayer = L.geoJSON(null, {onEachFeature: makeInfo}).addTo(map);

	var  request_headers = {};
	request_headers["X-Requested-With"] = 'RFmap (http://rfmap.svita.cz)';
	$.ajax({
  		type: 'POST',
  		url: overpassEndpoint,
  		data: { data: initQuery },
  		headers: request_headers,
  		success: function(data) {
  			var processed = osmtogeojson(data);
        dataLayer.clearLayers();
  			dataLayer.addData(processed);
        map.fitBounds(dataLayer.getBounds());
        $('#output').html('Click on any marker to see details...');
  		}
  	});

  /*$.ajax({
      type: 'GET',
      url: 'testdata.json',
      data: { data: initQuery },
      headers: request_headers,
      success: function(data) {
        data = JSON.parse(data);
        var processed = osmtogeojson(data);
        dataLayer.clearLayers();
        dataLayer.addData(processed);
        map.fitBounds(dataLayer.getBounds());
        $('#output').html('Click on any marker to see details...');
      }
    });*/


});