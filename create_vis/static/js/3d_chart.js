var hideSpinner = function() {
  $(".loading-spinner").hide();
  $(".load-hidden").show();
};

var showSpinner = function () {
  $(".loading-spinner").show();
  $(".load-hidden").hide();
};

var getOptions = function() {
  var category1 = $("#category1").val();
  var category2 = $("#category2").val();
  var category3 = $("#category3").val();

  return {
          'category1': category1,
          'category2' : category2,
          'category3' : category3
        }
}

var drawChart = function(data) {

  var results = data.results;

  var dataset = new vis.DataSet();

  results.forEach(function(d) {
    dataset.add(d);
  });

  var xLabels = data.xLabels;
  var yLabels = data.yLabels;
  var zLabels = data.zLabels;

  var xLabelFunc = function(idx) {
    return xLabels[idx];
  };

  var yLabelFunc = function(idy) {
    return yLabels[idy];
  };

  var zLabelFunc = function(idz) {
    return zLabels[idz];
  };

  // specify options
  var options = {
    width:  '600px',
    height: '600px',
    style: 'dot-color',
    xValueLabel: xLabelFunc,
    yValueLabel: yLabelFunc,
    zValueLabel: zLabelFunc,
    showPerspective: false,
    showGrid: true,
    keepAspectRatio: true,
    verticalRatio: 1.0,
    cameraPosition: {
      horizontal: -0.54,
      vertical: 0.5,
      distance: 1.6
    }  };

  var container = document.getElementById('3d_graph');

  var graph3d = new vis.Graph3d(container, dataset, options);
  //console.dir(graph3d);
};

var getData = function(response) {
    return response.data;
}

var getUrlFor = function(options) {
  return "/intersection?category1=" + options.category1 + "&category2=" + options.category2 + "&category3=" + options.category3;
};

var handleViewButtonClick = function() {
  console.info("click!~");
  var options = getOptions();
  var url = getUrlFor(options);

  showSpinner();
  axios.get(url)
        .then(getData)
        .then(drawChart)
        .then(hideSpinner);
}

hideSpinner();

$(document).ready(function() {
    $("#viewBtn").on("click", handleViewButtonClick);
});
