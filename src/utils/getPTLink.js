export function getPTLink(input, isPct) {
  // Makes link to Perfection Tracker from given info
  // If 'isPct' is true, will convert to a percentage rounded to 1 decimal
  if (isPct) {
    var places = input === 1 ? 0 : 1;
    var n = Number(100 * input).toFixed(places);
    input = n + "%";
  }

  return ' (<a href="#sec_Perfection_Tracker">PT: ' + input + "</a>)";
}
