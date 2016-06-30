var url = 'http://localhost:4000/studies?filter=funded_by:European%20Commission&fields=evidence_based_policy';

var makeUrlFor = function(field, fieldValue, aggregateOn) {
  return encodeURI("http://localhost:4000/studies?filter=" + field + ":" + fieldValue + "&" + "fields=" + aggregateOn);
};

var getLabelsAndValues = function(httpResult) {
  var counts = {}
  var studies = httpResult.data.studies;

  studies.forEach(function(study) {
    var values = _.values(study)[0];

    if (!values)
      return;

    values.forEach(function(value) {
      var currentCount = counts[value];

      if (!currentCount) {
        counts[value] = 1;
      }
      else {
        counts[value] = currentCount + 1;
      }
    });
  });

  var keys = _.keys(counts);
  var values = _.values(counts);

  return {"keys" : keys, "values": values};
};

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

  var myCharts = new Chart(ctx, {
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
