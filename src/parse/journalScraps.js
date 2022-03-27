import $ from "jquery";
import compareSemVer from "semver-compare";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseJournalScraps(xmlDoc, saveInfo) {
  var title = "Journal Scraps",
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
    table = [];

  if (compareSemVer(saveInfo.version, version) < 0) {
    return "";
  }

  table[0] = parsePlayerJournalScraps(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerJournalScraps(this, saveInfo, meta));
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

export function parsePlayerJournalScraps(player, saveInfo, meta) {
  var output = "",
    table = [],
    farmer = $(player).children("name").html(),
    hasVisitedIsland = false,
    notes = {},
    need = [],
    rewards = { 1004: false, 1006: false, 1009: false, 1010: false },
    found_notes = 0,
    found_rewards = 0,
    note_count = 11,
    reward_count = 4,
    i;

  // Checking some reward completions here too
  $(player)
    .find("mailReceived > string")
    .each(function () {
      var mail = $(this).text();
      if (mail === "Visited_Island") {
        hasVisitedIsland = true;
      } else if (mail === "Island_W_BuriedTreasure2") {
        rewards[1006] = true;
        found_rewards++;
      } else if (mail === "Island_W_BuriedTreasure") {
        rewards[1004] = true;
        found_rewards++;
      } else if (mail === "Island_N_BuriedTreasure") {
        rewards[1010] = true;
        found_rewards++;
      }
    });

  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has " +
    (hasVisitedIsland ? "" : "not ") +
    " visited the Island.</span><br />\n";
  $(player)
    .find("secretNotesSeen > int")
    .each(function () {
      // Only count Journal Scraps
      if (Number($(this).text()) >= 1000) {
        notes[$(this).text()] = true;
        found_notes++;
      }
    });
  output +=
    '<span class="result">' +
    farmer +
    " has read " +
    found_notes +
    " of " +
    note_count +
    " journal scraps.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    found_notes >= note_count
      ? getMilestoneString("Read all the journal scraps", 1)
      : getMilestoneString("Read all the journal scraps", 0) +
        (note_count - found_notes) +
        " more";
  output += "</li></ul></div>";
  if (found_notes < note_count) {
    for (i = 1; i <= note_count; i++) {
      if (!notes.hasOwnProperty(1000 + Number(i))) {
        need.push(
          "<li>" + wikify("Journal Scrap #" + i, "Journal Scraps") + "</li>"
        );
      }
    }
    if (need.length > 0) {
      meta.hasDetails = true;
      output +=
        '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
      output +=
        '<span class="need">Left to read:<ol>' +
        need.join("") +
        "</ol></span></div>";
    }
  }
  table.push(output);
  // Most rewards are noted by mail flags already checked. For mermaid puzzle, we only check for walnut award.
  $(player)
    .parents("SaveGame")
    .first()
    .find("collectedNutTracker > string")
    .each(function () {
      if ($(this).text() === "Mermaid") {
        rewards[1009] = true;
        found_rewards++;
        return false;
      }
    });
  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has found the rewards from  " +
    found_rewards +
    " of " +
    reward_count +
    " journal scraps.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    found_rewards >= reward_count
      ? getMilestoneString("Find all the journal scrap rewards", 1)
      : getMilestoneString("Find all the journal scrap rewards", 0) +
        (reward_count - found_rewards) +
        " more";
  output += "</li></ul></div>";
  if (found_rewards < reward_count) {
    need = [];
    var k = Object.keys(rewards).sort();
    for (i in k) {
      if (rewards.hasOwnProperty(k[i]) && !rewards[k[i]]) {
        var extra = "";
        need.push(
          "<li> Reward from " +
            wikify(
              "Journal Scrap #" + (Number(k[i]) - 1000),
              "Journal Scraps"
            ) +
            extra +
            "</li>"
        );
      }
    }
    if (need.length > 0) {
      meta.hasDetails = true;
      output +=
        '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
      output +=
        '<span class="need">Left to find:<ol>' +
        need.join("") +
        "</ol></span></div>";
    }
  }
  table.push(output);
  return table;
}
