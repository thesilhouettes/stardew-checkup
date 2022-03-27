import $ from "jquery";
import { togglePlayer } from "./togglePlayer";

export function createPlayerList(numPlayers, farmer, farmhands) {
  var width = Math.floor(100 / (1 + numPlayers)),
    i,
    text =
      "<table><tr><th>Toggle Player Display:</th>" +
      '<td id="List_PL_1" class="on">' +
      farmer +
      "</td>";
  for (i = 2; i <= numPlayers; i++) {
    text +=
      ' <td id="List_PL_' + i + '" class="on">' + farmhands[i - 2] + "</td>";
  }
  text += "</tr></table>";
  $("#PlayerList").html(text);
  $("#PlayerList").show();
  // Add click handlers
  for (i = 1; i <= numPlayers; i++) {
    var ID = "#List_PL_" + i;
    $(ID).click(togglePlayer);
  }
}
