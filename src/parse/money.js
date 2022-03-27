import $ from "jquery";
import { getAchieveString } from "../utils/achievement";
import { addCommas } from "../utils/addCommas";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";

export function parseMoney(xmlDoc, saveInfo) {
  var title = "Money",
    anchor = makeAnchor(title),
    version = "1.2",
    sum_class = getSummaryClass(saveInfo, version),
    det_class = getDetailsClass(saveInfo, version),
    output = "",
    playerOutput = "",
    meta = {
      hasDetails: false,
      anchor: anchor,
      sum_class: sum_class,
      det_class: det_class,
    },
    table = [];
  // This is pretty pointless with shared gold, but I separate everything else for multiplayer...
  table[0] = parsePlayerMoney(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerMoney(this, saveInfo, meta));
        }
      });
  }
  playerOutput += printTranspose(table);
  output =
    getSectionHeader(saveInfo, title, anchor, meta.hasDetails, version) +
    playerOutput +
    getSectionFooter();
  return output;
}

function parsePlayerMoney(player, saveInfo, meta) {
  var output = "",
    money = Number($(player).children("totalMoneyEarned").text());

  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    $(player).children("name").html() +
    " has earned " +
    addCommas(money) +
    "g.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    money >= 15e3
      ? getAchieveString("Greenhorn", "earn 15,000g", 1)
      : getAchieveString("Greenhorn", "earn 15,000g", 0) +
        addCommas(15e3 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 5e4
      ? getAchieveString("Cowpoke", "earn 50,000g", 1)
      : getAchieveString("Cowpoke", "earn 50,000g", 0) +
        addCommas(5e4 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 25e4
      ? getAchieveString("Homesteader", "earn 250,000g", 1)
      : getAchieveString("Homesteader", "earn 250,000g", 0) +
        addCommas(25e4 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 1e6
      ? getAchieveString("Millionaire", "earn 1,000,000g", 1)
      : getAchieveString("Millionaire", "earn 1,000,000g", 0) +
        addCommas(1e6 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 1e7
      ? getAchieveString("Legend", "earn 10,000,000g", 1)
      : getAchieveString("Legend", "earn 10,000,000g", 0) +
        addCommas(1e7 - money) +
        "g more";
  output += "</li></ul></div>";
  return [output];
}
