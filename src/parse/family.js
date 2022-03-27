import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";

export function parseFamily(xmlDoc, saveInfo) {
  var title = "Home and Family",
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

  meta.wedding = Number($(xmlDoc).find("countdownToWedding").text());
  meta.isHost = true;

  table[0] = parsePlayerFamily(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    meta.isHost = false;
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerFamily(this, saveInfo, meta));
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

export function parsePlayerFamily(player, saveInfo, meta) {
  var output = "",
    table = [],
    needs = [],
    count = 0,
    maxUpgrades = meta.isHost ? 3 : 2,
    houseType = meta.isHost ? "FarmHouse" : "Cabin",
    farmer = $(player).children("name").html(),
    spouse = $(player).children("spouse").html(),
    id = $(player).children("UniqueMultiplayerID").text(),
    children = "(None)",
    child_name = [],
    houseUpgrades = Number($(player).children("houseUpgradeLevel").text());
  if (typeof id === "undefined" || id === "") {
    id = "0";
  }
  if (typeof spouse !== "undefined" && spouse.length > 0) {
    if (meta.wedding > 0 && compareSemVer(saveInfo.version, "1.3") < 0) {
      spouse = spouse.slice(0, -7);
    }
    count++;
  } else if (saveInfo.partners.hasOwnProperty(id)) {
    spouse = saveInfo.players[saveInfo.partners[id]];
    count++;
  } else {
    spouse = "(None)";
    needs.push("spouse");
  }
  // Technically, we should be searching the Friendship data for RoommateMarriage here, but for now we are hardcoding
  var title = "spouse";
  if (spouse === "Krobus") {
    title = "roommate";
  }
  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    "'s " +
    title +
    ": " +
    spouse +
    (meta.wedding ? " -- wedding in " + meta.wedding + " day(s)" : "") +
    "</span><br />\n";
  if (
    saveInfo.children.hasOwnProperty(id) &&
    saveInfo.children[id].length > 0
  ) {
    child_name = saveInfo.children[id];
    count += child_name.length;
  } else if (
    saveInfo.partners.hasOwnProperty(id) &&
    saveInfo.children.hasOwnProperty(saveInfo.partners[id]) &&
    saveInfo.children[saveInfo.partners[id]].length > 0
  ) {
    child_name = saveInfo.children[saveInfo.partners[id]];
    count += child_name.length;
  } else {
    $(player)
      .parent()
      .find(
        "[" +
          saveInfo.ns_prefix +
          "\\:type='" +
          houseType +
          "'] NPC[" +
          saveInfo.ns_prefix +
          "\\:type='Child']"
      )
      .each(function () {
        count++;
        child_name.push($(this).find("name").html());
      });
  }
  if (child_name.length) {
    children = child_name.join(", ");
    if (child_name.length === 1) {
      needs.push("1 child");
    }
  } else {
    needs.push("2 children");
  }
  output +=
    '<span class="result">' +
    farmer +
    "'s children: " +
    children +
    '</span><ul class="ach_list"><li>\n';
  output +=
    count >= 3
      ? getAchieveString("Full House", "Married + 2 kids", 1)
      : getAchieveString("Full House", "Married + 2 kids", 0) +
        needs.join(" and ");
  output += "</li></ul></div>";
  table.push(output);
  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    houseType +
    " upgraded " +
    houseUpgrades +
    " time(s) of ";
  output += maxUpgrades + ' possible.</span><br /><ul class="ach_list">\n';
  output += "<li>";
  output +=
    houseUpgrades >= 1
      ? getAchieveString("Moving Up", "1 upgrade", 1)
      : getAchieveString("Moving Up", "1 upgrade", 0) +
        (1 - houseUpgrades) +
        " more";
  output += "</li>\n<li>";
  output +=
    houseUpgrades >= 2
      ? getAchieveString("Living Large", "2 upgrades", 1)
      : getAchieveString("Living Large", "2 upgrades", 0) +
        (2 - houseUpgrades) +
        " more";
  output += "</li>\n<li>";
  output +=
    houseUpgrades >= maxUpgrades
      ? getMilestoneString("House fully upgraded", 1)
      : getMilestoneString("House fully upgraded", 0) +
        (maxUpgrades - houseUpgrades) +
        " more";
  output += "</li></ul></div>";
  table.push(output);
  return table;
}
