
exports.getDay = getDay;

function getDay(){
  var today = new Date();
    var options = {
      weekday: "long"
    }
  return today.toLocaleDateString("en-us", options);
}