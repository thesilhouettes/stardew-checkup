import $ from "jquery";
export function togglePlayer(e) {
  console.log(
    "Somebody clicked on " +
      $(e.currentTarget).attr("id") +
      " which has a class of " +
      $(e.currentTarget).attr("class")
  );
  // Adjust PlayerList entry to reflect status of this player
  var isOn = $(e.currentTarget).attr("class") === "on",
    match = "td." + $(e.currentTarget).attr("id").substring(5);
  $(e.currentTarget).attr("class", isOn ? "off" : "on");
  // Go find all the entries for this player and toggle them.
  $(match).each(function () {
    if ($(this).is(":visible")) {
      $(this).hide();
    } else {
      $(this).show();
    }
  });
}
