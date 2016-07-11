var myChart = null;

var trimKey = function(key) {
    // bleurgh, do this better

    //trim the string to the maximum length
    var trimmedString = key.substr(0, 25);

    //re-trim if we are in the middle of a word
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));

    if (key.length > 25) {
      return trimmedString + "...";
    }
    else {
      return trimmedString;
    }
};

var fieldDropdownChange = function(sel) {
  var value = sel.value;
  window.location.replace("/bar_chart?field=" + value);
};

var changeChart = function(sel) {
  var field = $(".field").val();
  var value = $(".value").val();
  var aggregateOn = $(".aggregate_on").val();

  var url = makeUrlFor(field, value, aggregateOn);

  axios.get(url).then(getLabelsAndValues).then(function(data) {
    renderBarChart(data, field, value, aggregateOn);
  });
};

var makeUrlFor = function(field, fieldValue, aggregateOn) {
  return encodeURI("/studies?filter=" + field + ":" + fieldValue + "&" + "fields=" + aggregateOn);
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
      return;

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

var renderBarChart = function(data, field, value, aggregateOn) {
  var ctx = document.getElementById("myChart");

  var keys = data.keys;
  var values = data.values;

  keys = keys.map(trimKey)

  if (myChart)
    myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: keys,
      datasets: [{
        label: aggregateOn + " by " + value + " (" + field + ")" ,
        data: values,
        borderWidth: 1
      }]
    }
  });
};
