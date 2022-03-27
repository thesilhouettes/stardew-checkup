import $ from "jquery";
import { makeAnchor } from "./makeAnchor";

export function createTOC() {
  var text,
    id,
    list = "<ul>";
  $("h2, h3").each(function () {
    if ($(this).is(":visible")) {
      text = $(this).text();
      id = "sec_" + makeAnchor(text);
      $(this).attr("id", id);
      list += '<li><a href="#' + id + '">' + text + "</a></li>\n";
    }
  });
  list += "</ul>";
  document.getElementById("TOC-details").innerHTML = list;
}
