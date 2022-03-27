import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { getPTLink } from "../utils/getPTLink";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";

export function parseStardrops(xmlDoc, saveInfo) {
  /* mailReceived identifiers from decompiled source of StardewValley.Utility.foundAllStardrops()
   * descriptions are not from anywhere else and are just made up. */
  var title = "Stardrops",
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
  meta.stardrops = {
    CF_Fair: "Purchased at the Fair for 2000 star tokens.",
    CF_Mines: "Found in the chest on mine level 100.",
    CF_Spouse: "Given by NPC spouse at 13.5 hearts (3375 points).",
    CF_Sewer: "Purchased from Krobus in the Sewers for 20,000g.",
    CF_Statue: "Received from Old Master Cannoli in the Secret Woods.",
    CF_Fish: "Mailed by Willy after Master Angler achievement.",
    museumComplete: "Reward for completing the Museum collection.",
  };

  table[0] = parsePlayerStardrops(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerStardrops(this, saveInfo, meta));
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

export function parsePlayerStardrops(player, saveInfo, meta) {
  var output = "",
    count = 0,
    id,
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = "",
    need = [],
    received = {},
    stardrop_count = Object.keys(meta.stardrops).length;

  $(player)
    .find("mailReceived > string")
    .each(function () {
      var id = $(this).text();
      if (meta.stardrops.hasOwnProperty(id)) {
        count++;
        received[id] = 1;
      }
    });
  for (id in meta.stardrops) {
    if (meta.stardrops.hasOwnProperty(id)) {
      if (!received.hasOwnProperty(id)) {
        need.push("<li>" + meta.stardrops[id] + "</li>");
      }
    }
  }

  saveInfo.perfectionTracker[umid]["Stardrops"] = count >= stardrop_count;
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    pt_pct = getPTLink(count >= stardrop_count ? "Yes" : "No");
  }
  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    $(player).children("name").html() +
    " has received " +
    count +
    " of " +
    stardrop_count +
    " stardrops." +
    pt_pct +
    "</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    count >= stardrop_count
      ? getAchieveString("Mystery Of The Stardrops", "find every stardrop", 1)
      : getAchieveString("Mystery Of The Stardrops", "find every stardrop", 0) +
        (stardrop_count - count) +
        " more";
  output += "</li></ul></div>";
  if (need.length > 0) {
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output +=
      '<span class="need">Stardrops left:<ol>' +
      need.sort().join("") +
      "</ol></span></div>";
  }
  return [output];
}
