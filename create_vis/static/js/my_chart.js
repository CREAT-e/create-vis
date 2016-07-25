var myChart = null;

var fieldDropdownChange = function(sel) {
  var value = sel.value;
  window.location.replace("/chart?field=" + value);
};

var hideSpinner = function() {
  $(".loading-spinner").hide();
  $(".load-hidden").show();
};

var showSpinner = function () {
  $(".loading-spinner").show();
  $(".load-hidden").hide();
};

var changeChart = function(sel) {
  var field = $(".field").val();
  var value = $(".value").val();
  var aggregateOn = $(".aggregate_on").val();
  var chartType = $(".chart_type").val();

  if (!field) return;

  var url = makeUrlFor(field, value, aggregateOn);

  showSpinner();
  axios.get(url).then(getLabelsAndValues).then(function(data) {
    hideSpinner();
    renderChart(chartType, data, field, value, aggregateOn);
  });
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var makeUrlFor = function(field, fieldValue, aggregateOn) {
  var encodedVal = fieldValue.replaceAll(",","\\,");
  return encodeURI("/studies?filter=" + field + ":" + encodedVal + "&" + "fields=" + aggregateOn);
};

var incCount = function(counts, value) {
  var currentCount = counts[value];

  if (!currentCount) {
    counts[value] = 1;
  }
  else {
    counts[value] = currentCount + 1;
  }
};

var getLabelsAndValues = function(httpResult) {
  var counts = {}
  var studies = httpResult.data.studies;

  studies.forEach(function(study) {
    var values = _.values(study)[0];

    if (!values)
      return {keys: [], values: []};

    if (typeof(values) === "object") {
      values.forEach(function(value) {
        incCount(counts, value);
      });
    } else {
      incCount(counts, values);
    }

  });

  var keys = _.keys(counts);
  var values = _.values(counts);

  return {"keys" : keys, "values": values};
};

/**
 * Applies chart type specific config to the chart data by expanding it
 * or replacing values.
*/
var applyChartTypeConfig = function(type, data) {
  switch (type) {
    case "pie" :
      break;
    case "line" :
      var datasets = data['datasets'];

      if (datasets && datasets[0]) {
        var dataset = datasets[0];
        dataset["backgroundColor"] = "rgba(255,255,255,0)";
        dataset["borderColor"] = randomColor();
      };
      break;
  }
};

var renderChart = function(chartType, data, field, value, aggregateOn) {
  var ctx = document.getElementById("myChart");

  var keys = data.keys;
  var values = data.values;

  var labelColors = keys.map(randomColor);

  if (myChart)
    myChart.destroy();

  var chartData = {
    labels: keys,
    datasets: [{
      label: value + " by " + aggregateOn,
      data: values,
      backgroundColor: labelColors
    }]
  };

  applyChartTypeConfig(chartType, chartData);

  if (keys && keys.length > 0) {
    myChart = new Chart(ctx, {
      type: chartType,
      data: chartData
    });
  } else {
  }
};

window.onload = changeChart;
hideSpinner();
