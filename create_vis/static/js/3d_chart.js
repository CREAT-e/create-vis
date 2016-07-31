
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

var getUrlFor = function(options) {
  return "/intersection/?category1=" + options.category1 + "&category2=" + options.category2 + "&category3=" + options.category3;
};

var fieldDropdownChange = function() {
  var options = getOptions();
  var url = getUrlFor(options);

  console.info(url);


}

var hideSpinner = function() {
  $(".loading-spinner").hide();
  $(".load-hidden").show();
};

hideSpinner();
