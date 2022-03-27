import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";

export function parseQuests(xmlDoc, saveInfo) {
  var title = "Quests",
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

  table[0] = parsePlayerQuests(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerQuests(this, saveInfo, meta));
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

export function parsePlayerQuests(player, saveInfo, meta) {
  var output = "",
    count;

  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    count = Number($(player).find("stats > questsCompleted").text());
  } else {
    // In 1.2, stats are under the root SaveGame so we must go back up the tree
    count = Number($(player).parent().find("stats > questsCompleted").text());
  }

  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    $(player).children("name").html() +
    " has completed " +
    count +
    ' "Help Wanted" quest(s).</span><br />\n';
  output += '<ul class="ach_list"><li>';
  output +=
    count >= 10
      ? getAchieveString("Gofer", "complete 10 quests", 1)
      : getAchieveString("Gofer", "complete 10 quests", 0) +
        (10 - count) +
        " more";
  output += "</li>\n<li>";
  output +=
    count >= 40
      ? getAchieveString("A Big Help", "complete 40 quests", 1)
      : getAchieveString("A Big Help", "complete 40 quests", 0) +
        (40 - count) +
        " more";
  output += "</li></ul></div>";
  return [output];
}
