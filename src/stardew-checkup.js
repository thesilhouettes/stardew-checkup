/* stardew-checkup.js
 * https://mouseypounds.github.io/stardew-checkup/
 */

/*jslint indent: 4, maxerr: 50, passfail: false, browser: true, regexp: true, plusplus: true */
/*global $, FileReader */
import $ from "jquery";
import Cookies from "js-cookie";
import { handleFileSelect } from "./utils/handleFileSelect";
import { toggleVisible } from "./utils/toggleVisible";

window.onload = function () {
  "use strict";

  // Show input field immediately
  $(document.getElementById("input-container")).show();

  document
    .getElementById("file_select")
    .addEventListener("change", handleFileSelect, false);

  /*		var t = evt.target;
		if ($(t).next().is(':visible')) {
			$(t).next().hide();
			$(t).html("Show Details");
		} else {
			$(t).next().show();
			$(t).html("Hide Details");
		}
*/

  // At this point, this will only affect changelog
  $(".collapsible").each(function () {
    $(this).children("button").click(toggleVisible);
  });
  var c = Cookies.get("checkup-opt-old");
  if (typeof c !== "undefined") {
    var opt = document.getElementsByName("opt-old");
    if (opt !== null) {
      for (var i = 0; i < opt.length; i++) {
        if (opt[i].value === c) {
          opt[i].checked = true;
          break;
        }
      }
    }
  }
  c = Cookies.get("checkup-opt-new");
  if (typeof c !== "undefined") {
    var opt = document.getElementsByName("opt-new");
    if (opt !== null) {
      for (var i = 0; i < opt.length; i++) {
        if (opt[i].value === c) {
          opt[i].checked = true;
          break;
        }
      }
    }
  }
};
