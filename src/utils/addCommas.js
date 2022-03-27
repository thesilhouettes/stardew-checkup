export function addCommas(x) {
  // Jamie Taylor @ https://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
  return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
}
