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

var getSelectedOptions = function() {
  var field = $("#field").val();
  var value = $("#value").val();
  var aggregateOn = $("#aggregate_on").val();
  var chartType = $("#chart_type").val();

  var maxResults = $("#max_results").val();
  var sortBy = $("#sort_by").val();

  return {
    "field" : field,
    "value" : value,
    "aggregateOn": aggregateOn,
    "chartType" : chartType,
    "maxResults" : maxResults,
    "sortBy" : sortBy
  }
}

var changeChart = function(sel) {
  var options = getSelectedOptions();

  var url = makeUrlFor(options.field, options.value, options.aggregateOn);

  var sortAndTrim = function(data) {
    return applySortAndMaxResults(data, options.sortBy, options.maxResults)
  }

  showSpinner();
  axios.get(url).then(getLabelsAndValues).then(sortAndTrim).then(function(data) {
    hideSpinner();
    renderChart(options.chartType, data, options.field, options.value, options.aggregateOn);
  });
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

var applySortAndMaxResults = function(data, sortBy, maxResults) {

  var keys = data.keys;
  var values = data.values;

  var zipped = _.zip(keys, values);

  var sortedAscending = _.sortBy(zipped, function(arr) {
    return arr[1]
  });

  // Trim
  if (maxResults !== "None") {
    var max = parseInt(maxResults);
    sortedAscending = _.rest(sortedAscending, (sortedAscending.length - max));
  }

  var sortedAndTrimmed = null;
  switch (sortBy) {
    case "Descending":
      sortedAndTrimmed = sortedAscending.reverse();
      break;
    case "Ascending":
      sortedAndTrimmed = sortedAscending;
      break;
    case "Alphabetical":
      sortedAndTrimmed = _.sortBy(sortedAscending, function(arr) {
        return arr[0]
      });
      break;
    default:
        break;
  }

  var unzipped = _.unzip(sortedAndTrimmed);

  data.keys = unzipped[0];
  data.values = unzipped[1];

  return data;
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

  var lineWrapLabels = function(labels) {
    return data.labels.map(function(label) {
      return label.split(" ");
    });
  }

  switch (type) {
    case "pie" :
      break;
    case 'bar':
      // For long labels, this puts each new word on a new line
      data.labels = lineWrapLabels(data.labels);
      break;
    case "line" :
      var datasets = data['datasets'];
      data.labels = lineWrapLabels(data.labels);

      if (datasets && datasets[0]) {
        var dataset = datasets[0];
        dataset["backgroundColor"] = "rgba(255,255,255,0)";
        dataset["borderColor"] = randomColor();
      };
      break;
  }
};


var makeCSV = function(data) {
  var keys = data.keys;
  var values = data.values;

  var csv = Papa.unparse({
    fields : ["Field", "Value"],
    data : _.zip(keys,values)
  });

  return csv;
};

var optionsToFilename = function(options, fileType) {
  var value = options.value;
  var aggregateOn = options.aggregateOn;

  return value + "_" + "by" + "_" + aggregateOn + "." + fileType;
};

var downloadCSV = function(csvString) {
  var options = getSelectedOptions();

  var sortAndTrim = function(data) {
    return applySortAndMaxResults(data, options.sortBy, options.maxResults)
  }

  var url = makeUrlFor(options.field, options.value, options.aggregateOn);

  axios.get(url).then(getLabelsAndValues).then(sortAndTrim).then(makeCSV).then(function(csvString) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString));

    var fileName = optionsToFilename(options, ".csv")
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  });

};

var downloadChartImage = function () {
  var options = getSelectedOptions();

  var canvas = document.getElementById("myChart");
  var canvasData = canvas.toDataURL("image/png");

  var image = canvasData.replace("image/png", "image/octet-stream");

  var aLink = document.createElement('a');
  var evt = document.createEvent("HTMLEvents");
  evt.initEvent("click");

  var fileName = optionsToFilename(options, ".png")
  aLink.download = fileName;

  aLink.href = image;
  aLink.dispatchEvent(evt);

  document.body.removeChild(aLink);
};

var randomlyColorKeys = function(keys) {

    var colors = ["red",
                  "orange",
                  "yellow",
                  "blue",
                  "green",
                  "purple",
                  "pink"]

    var cycledColors = [];
    _.times(10, function() {
        cycledColors = cycledColors.concat(colors);
    })

    return cycledColors.map(function(color) {
      return randomColor({luminosity: 'bright', hue: color})
    });
}

var renderChart = function(chartType, data, field, value, aggregateOn) {

  var ctx = document.getElementById("myChart");

  var keys = data.keys;
  var values = data.values;

  labelColors = randomlyColorKeys(keys);

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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

window.onload = changeChart;
hideSpinner();
