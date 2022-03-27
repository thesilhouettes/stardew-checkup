import $ from "jquery";
import compareSemVer from "semver-compare";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import {
  getPerfectionPctString,
  getPerfectionNumString,
  getPerfectionBoolString,
  getPerfectionPctNumString,
} from "../utils/perfection";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parsePerfectionTracker(xmlDoc, saveInfo) {
  // Scoring details from Utility.percentGameComplete()
  var title = "Perfection Tracker",
    anchor = makeAnchor(title),
    version = "1.5",
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
    buildings = $(xmlDoc).find(
      "locations > GameLocation[" +
        saveInfo.ns_prefix +
        "\\:type='Farm'] > buildings"
    ),
    type,
    table = [];

  if (compareSemVer(saveInfo.version, version) < 0) {
    return "";
  }

  $(buildings)
    .children("Building")
    .each(function () {
      type = $(this).children("buildingType").text();
      if (saveInfo.perfectionTracker.global.hasOwnProperty(type)) {
        saveInfo.perfectionTracker.global[type] = true;
      }
    });

  table[0] = parsePlayerPerfection(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerPerfection(this, saveInfo, meta));
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

export function parsePlayerPerfection(player, saveInfo, meta) {
  var output = "",
    table = [],
    farmer = $(player).children("name").html(),
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = 0,
    left,
    places = 1,
    numObelisks = 0,
    missingObelisks = [],
    need = "";

  if (saveInfo.perfectionTracker.global["Earth Obelisk"]) {
    numObelisks++;
  } else {
    missingObelisks.push("Earth");
  }
  if (saveInfo.perfectionTracker.global["Water Obelisk"]) {
    numObelisks++;
  } else {
    missingObelisks.push("Water");
  }
  if (saveInfo.perfectionTracker.global["Desert Obelisk"]) {
    numObelisks++;
  } else {
    missingObelisks.push("Desert");
  }
  if (saveInfo.perfectionTracker.global["Island Obelisk"]) {
    numObelisks++;
  } else {
    missingObelisks.push("Island");
  }

  var pct = {
    Walnuts: Math.min(
      saveInfo.perfectionTracker.global["Walnuts"].count /
        saveInfo.perfectionTracker.global["Walnuts"].total,
      1
    ),
    Shipping:
      saveInfo.perfectionTracker[umid]["Shipping"].count /
      saveInfo.perfectionTracker[umid]["Shipping"].total,
    Cooking:
      saveInfo.perfectionTracker[umid]["Cooking"].count /
      saveInfo.perfectionTracker[umid]["Cooking"].total,
    Crafting:
      saveInfo.perfectionTracker[umid]["Crafting"].count /
      saveInfo.perfectionTracker[umid]["Crafting"].total,
    Fishing:
      saveInfo.perfectionTracker[umid]["Fishing"].count /
      saveInfo.perfectionTracker[umid]["Fishing"].total,
    "Great Friends":
      saveInfo.perfectionTracker[umid]["Great Friends"].count /
      saveInfo.perfectionTracker[umid]["Great Friends"].total,
    Skills: Math.min(
      saveInfo.perfectionTracker[umid]["Skills"].count /
        saveInfo.perfectionTracker[umid]["Skills"].total,
      1
    ),
  };
  numObelisks = Math.min(numObelisks, 4);

  pt_pct =
    numObelisks +
    (saveInfo.perfectionTracker.global["Gold Clock"] ? 10 : 0) +
    (saveInfo.perfectionTracker[umid]["Monsters"] ? 10 : 0) +
    (saveInfo.perfectionTracker[umid]["Stardrops"] ? 10 : 0) +
    15 * pct["Shipping"] +
    11 * pct["Great Friends"] +
    10 * pct["Cooking"] +
    10 * pct["Crafting"] +
    10 * pct["Fishing"] +
    5 * pct["Walnuts"] +
    5 * pct["Skills"];
  0;
  pt_pct = pt_pct.toFixed(pt_pct < 100 ? 1 : 0);
  left = 100 - pt_pct;
  left = left.toFixed(left < 100 ? 1 : 0);

  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has " +
    pt_pct +
    "% Total Completion (details below).</span>";
  output += '<ul class="ach_list"><li>';
  output +=
    pt_pct >= 100
      ? getMilestoneString("100% Completion", 1)
      : getMilestoneString("100% Completion", 0) + left + "% more";
  output += "</li></ul></div>";
  meta.hasDetails = true;
  output += '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
  output += '<span class="result">Percentage Breakdown</span>';
  output += '<ul class="ach_list"><li>';
  output +=
    pct["Shipping"] >= 1
      ? getPerfectionPctString(
          pct["Shipping"],
          15,
          "Produce &amp; Forage Shipped",
          1
        )
      : getPerfectionPctString(
          pct["Shipping"],
          15,
          "Produce &amp; Forage Shipped",
          0
        ) + ' -- <a href="#sec_Basic_Shipping">see above for needs</a>';
  output += "</li><li>";
  output +=
    numObelisks == 4
      ? getPerfectionNumString(numObelisks, 4, "Obelisks on Farm", 1)
      : getPerfectionNumString(numObelisks, 4, "Obelisks on Farm", 0) +
        " -- need " +
        missingObelisks.join(", ");
  output += "</li><li>";
  output +=
    getPerfectionBoolString(
      10,
      "Golden Clock on Farm",
      saveInfo.perfectionTracker.global["Gold Clock"]
    ) +
    (saveInfo.perfectionTracker.global["Gold Clock"]
      ? ""
      : " -- need to build a " + wikify("Gold Clock"));
  output += "</li><li>";
  output +=
    getPerfectionBoolString(
      10,
      "Monster Slayer Hero (all slayer goals)",
      saveInfo.perfectionTracker[umid]["Monsters"]
    ) +
    (saveInfo.perfectionTracker[umid]["Monsters"]
      ? ""
      : ' -- <a href="#sec_Monster_Hunting">see above for needs</a>');
  output += "</li><li>";
  output +=
    pct["Great Friends"] >= 1
      ? getPerfectionPctString(
          pct["Great Friends"],
          11,
          "Great Friends (maxing all relationships)",
          1
        )
      : getPerfectionPctString(
          pct["Great Friends"],
          11,
          "Great Friends (maxing all relationships)",
          0
        ) + ' -- <a href="#sec_Social">see above for needs</a>';
  output += "</li><li>";
  output +=
    pct["Skills"] >= 1
      ? getPerfectionPctNumString(
          pct["Skills"],
          5,
          25,
          "Farmer Level (max all skills)",
          1
        )
      : getPerfectionPctNumString(
          pct["Skills"],
          5,
          25,
          "Farmer Level (max all skills)",
          0
        ) + ' -- <a href="#sec_Skills">see above for needs</a>';
  output += "</li><li>";
  output +=
    getPerfectionBoolString(
      10,
      "Found All Stardrops",
      saveInfo.perfectionTracker[umid]["Stardrops"]
    ) +
    (saveInfo.perfectionTracker[umid]["Stardrops"]
      ? ""
      : ' -- <a href="#sec_Stardrops">see above for needs</a>');
  output += "</li><li>";
  output +=
    pct["Cooking"] >= 1
      ? getPerfectionPctString(pct["Cooking"], 10, "Cooking Recipes Made", 1)
      : getPerfectionPctString(pct["Cooking"], 10, "Cooking Recipes Made", 0) +
        ' -- <a href="#sec_Cooking">see above for needs</a>';
  output += "</li><li>";
  output +=
    pct["Crafting"] >= 1
      ? getPerfectionPctString(pct["Crafting"], 10, "Crafting Recipes Made", 1)
      : getPerfectionPctString(
          pct["Crafting"],
          10,
          "Crafting Recipes Made",
          0
        ) + ' -- <a href="#sec_Crafting">see above for needs</a>';
  output += "</li><li>";
  output +=
    pct["Fishing"] >= 1
      ? getPerfectionPctString(pct["Fishing"], 10, "Fish Caught", 1)
      : getPerfectionPctString(pct["Fishing"], 10, "Fish Caught", 0) +
        ' -- <a href="#sec_Fishing">see above for needs</a>';
  output += "</li><li>";
  output +=
    pct["Walnuts"] >= 1
      ? getPerfectionPctNumString(
          pct["Walnuts"],
          5,
          130,
          "Golden Walnuts Found",
          1
        )
      : getPerfectionPctNumString(
          pct["Walnuts"],
          5,
          130,
          "Golden Walnuts Found",
          0
        ) + ' -- <a href="#sec_Skills">see above for needs</a>';
  output += "</li></ul></div>";
  table.push(output);

  return table;
}
