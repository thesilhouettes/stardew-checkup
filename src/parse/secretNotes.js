import $ from "jquery";
import compareSemVer from "semver-compare";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseSecretNotes(xmlDoc, saveInfo) {
  var title = "Secret Notes",
    anchor = makeAnchor(title),
    version = "1.3",
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
  meta.hasStoneJunimo = false;

  if (compareSemVer(saveInfo.version, "1.3") < 0) {
    return "";
  }

  // Stone Junimo is a giant pain in the ass. It seems to not have any confirmation so we have to search
  // the entire save for it. Worse, the buried one may reappear later so we need to ignore that one when
  // searching. The buried one is at (57, 16) on the Town map.
  // It also should not be obtainable if the players went the Joja route, but we will deal with that later.
  $(xmlDoc)
    .find("Item > name")
    .each(function () {
      if ($(this).text() === "Stone Junimo") {
        // Found one in storage somewhere. We good.
        meta.hasStoneJunimo = true;
        return false;
      }
    });
  if (!meta.hasStoneJunimo) {
    $(xmlDoc)
      .find("Object > name")
      .each(function () {
        if ($(this).text() === "Stone Junimo") {
          var loc = $(this).parents("GameLocation").children("name").text();
          if (loc === "Town") {
            var x = $(this).parents("item").find("key > Vector2 > X").text();
            var y = $(this).parents("item").find("key > Vector2 > Y").text();
            if (x !== "57" || y !== "16") {
              meta.hasStoneJunimo = true;
              return false;
            }
          } else {
            meta.hasStoneJunimo = true;
            return false;
          }
        }
      });
  }

  table[0] = parsePlayerSecretNotes(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerSecretNotes(this, saveInfo, meta));
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

export function parsePlayerSecretNotes(player, saveInfo, meta) {
  var output = "",
    table = [],
    farmer = $(player).children("name").html(),
    hasSeenKrobus = false,
    hasMagnifyingGlass =
      $(player).children("hasMagnifyingGlass").text() === "true",
    isJojaMember = false,
    notes = {},
    need = [],
    rewards = {},
    reward_skip = {},
    found_notes = 0,
    found_rewards = 0,
    note_count = 23,
    reward_start = 13,
    reward_count = note_count - reward_start + 1,
    reward_re,
    i;

  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    note_count = 25;
    reward_count = 12;
    reward_skip[24] = true;
  }
  // Check Krobus event, then check for magnifier, then check number of notes
  // Also checking for one of the reward events here, so don't use "return false" to end early.
  $(player)
    .find("eventsSeen > int")
    .each(function () {
      if ($(this).text() === "520702") {
        hasSeenKrobus = true;
      } else if ($(this).text() === "2120303") {
        rewards[23] = true;
        found_rewards++;
      }
    });
  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has " +
    (hasSeenKrobus ? "" : "not ") +
    " seen the Shadow Guy at the Bus Stop.</span><br />\n";
  output +=
    '<span class="result">' +
    farmer +
    " has " +
    (hasMagnifyingGlass ? "" : "not ") +
    " found the Magnifying Glass.</span><br />\n";
  $(player)
    .find("secretNotesSeen > int")
    .each(function () {
      // Filter out journal scraps
      if (Number($(this).text()) < 1000) {
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
    " secret notes.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    found_notes >= note_count
      ? getMilestoneString("Read all the secret notes", 1)
      : getMilestoneString("Read all the secret notes", 0) +
        (note_count - found_notes) +
        " more";
  output += "</li></ul></div>";
  if (found_notes < note_count) {
    for (i = 1; i <= note_count; i++) {
      if (!notes.hasOwnProperty(i)) {
        need.push(
          "<li>" + wikify("Secret Note #" + i, "Secret Notes") + "</li>"
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
  // Most rewards are noted by SecretNoteXX_done mail items. The one for note 21 starts with lower-case s though.
  reward_re = new RegExp("[Ss]ecretNote(\\d+)_done");
  $(player)
    .find("mailReceived > string")
    .each(function () {
      var match = reward_re.exec($(this).text());
      if (match !== null) {
        rewards[match[1]] = true;
        found_rewards++;
      } else if ($(this).text() === "gotPearl") {
        rewards[15] = true;
        found_rewards++;
      } else if ($(this).text() === "junimoPlush") {
        rewards[13] = true;
        found_rewards++;
      } else if ($(this).text() === "TH_Tunnel") {
        // Qi quest we just check for the start. Full completion is 'TH_Lumberpile'
        rewards[22] = true;
        found_rewards++;
      } else if ($(this).text() === "carolinesNecklace") {
        rewards[25] = true;
        found_rewards++;
      } else if ($(this).text() === "JojaMember") {
        isJojaMember = true;
      }
    });
  // Stone Junimo not available for Joja route. We silently remove it from the list, which isn't optimal
  if (isJojaMember) {
    reward_count--;
    reward_skip[14] = true;
  } else if (meta.hasStoneJunimo) {
    rewards[14] = true;
    found_rewards++;
  }

  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has found the rewards from  " +
    found_rewards +
    " of " +
    reward_count +
    " secret notes.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    found_rewards >= reward_count
      ? getMilestoneString("Find all the secret note rewards", 1)
      : getMilestoneString("Find all the secret note rewards", 0) +
        (reward_count - found_rewards) +
        " more";
  output += "</li></ul></div>";
  if (found_rewards < reward_count) {
    need = [];
    for (i = reward_start; i <= note_count; i++) {
      if (!reward_skip.hasOwnProperty(i) && !rewards.hasOwnProperty(i)) {
        var extra = "";
        if (i == 14) {
          extra =
            " (Note: may be inaccurate if item was collected and destroyed.)";
        }
        need.push(
          "<li> Reward from " +
            wikify("Secret Note #" + i, "Secret Notes") +
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
