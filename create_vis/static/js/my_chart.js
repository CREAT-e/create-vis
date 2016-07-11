var fieldDropdownChange = function(sel) {
  var value = sel.value;
  window.location.replace("/bar_chart?field=" + value);
};

var changeChart = function(sel) {
  var field = $(".field").val();
  var value = $(".value").val();
  var aggregate_on = $(".aggregate_on").val();

  var url = makeUrlFor(field, value, aggregate_on);

  axios.get(url).then(getLabelsAndValues).then(renderBarChart);
};

var makeUrlFor = function(field, fieldValue, aggregateOn) {
  return encodeURI("/api/studies?filter=" + field + ":" + fieldValue + "&" + "fields=" + aggregateOn);
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

var myChart = null;

var renderBarChart = function(data) {
  var ctx = document.getElementById("myChart");

  var keys = data.keys;
  var values = data.values;

  keys = keys.map(function(key) {
    // bleurgh, do this better

    //trim the string to the maximum length
    var trimmedString = key.substr(0, 20);

    //re-trim if we are in the middle of a word
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
    return trimmedString;
  })

  if (myChart)
    myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: keys,
      datasets: [{
        data: values,
        borderWidth: 1
      }]
    }
  });
};

var drawBarChart = function() {
  var url = makeUrlFor("funded_by", "European Commission", "evidence_based_policy")

  axios.get(url).then(getLabelsAndValues).then(renderBarChart);
}
