import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { addCommas } from "../utils/addCommas";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { getPTLink } from "../utils/getPTLink";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseSkills(xmlDoc, saveInfo) {
  var title = "Skills",
    output = "",
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

  (meta.skills = ["Farming", "Fishing", "Foraging", "Mining", "Combat"]),
    (meta.next_level = [
      100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000,
    ]);

  table[0] = parsePlayerSkills(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerSkills(this, saveInfo, meta));
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

export function parsePlayerSkills(player, saveInfo, meta) {
  var output = "",
    xp = {},
    i = 0,
    j,
    level = 10,
    num,
    count = 0,
    umid = $(player).children("UniqueMultiplayerID").text(),
    isMale = $(player).children("isMale").text() === "true",
    pt_pct = "",
    pt_level = 0,
    title = "",
    need = [];

  $(player)
    .find("experiencePoints > int")
    .each(function () {
      // We need to skip the unused 6th entry (Luck)
      if (i < 5) {
        num = Number($(this).text());
        xp[meta.skills[i]] = num;
        // The current skill levels are also stored separately in 'player > fishingLevel' (and similar)
        if (num < 15000) {
          for (j = 0; j < 10; j++) {
            if (meta.next_level[j] > num) {
              level = j;
              break;
            }
          }
          need.push(
            "<li>" +
              wikify(meta.skills[i]) +
              " (level " +
              level +
              ") -- need " +
              addCommas(meta.next_level[level] - num) +
              " more xp to next level and " +
              addCommas(15000 - num) +
              " more xp to max</li>\n"
          );
        } else {
          count++;
        }
        i++;
      }
    });

  // We could tally this up while we are checking the xp values, but since we need to account for Luck anyway, we might
  //  as well just directly calculate this the same way the game does.
  pt_level = Math.floor(
    (Number($(player).find("farmingLevel").text()) +
      Number($(player).find("miningLevel").text()) +
      Number($(player).find("combatLevel").text()) +
      Number($(player).find("foragingLevel").text()) +
      Number($(player).find("fishingLevel").text()) +
      Number($(player).find("luckLevel").text())) /
      2
  );
  saveInfo.perfectionTracker[umid]["Skills"] = { count: pt_level, total: 25 };
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    pt_pct = getPTLink(pt_level / 0.25 + "%");
  }
  switch (pt_level) {
    case 0:
    case 1:
    case 2:
      title = "Newcomer";
      break;
    case 3:
    case 4:
      title = "Greenhorn";
      break;
    case 5:
    case 6:
      title = "Bumpkin";
      break;
    case 7:
    case 8:
      title = "Cowpoke";
      break;
    case 9:
    case 10:
      title = "Farmhand";
      break;
    case 11:
    case 12:
      title = "Tiller";
      break;
    case 13:
    case 14:
      title = "Smallholder";
      break;
    case 15:
    case 16:
      title = "Sodbuster";
      break;
    case 17:
    case 18:
      title = "Farm" + (isMale ? "boy" : "girl");
      break;
    case 19:
    case 20:
      title = "Granger";
      break;
    case 21:
    case 22:
      title = "Planter";
      break;
    case 23:
    case 24:
      title = "Rancher";
      break;
    case 25:
    case 26:
      title = "Farmer";
      break;
    case 27:
    case 28:
      title = "Agriculturist";
      break;
    case 29:
      title = "Cropmaster";
      break;
    default:
      title = "Farm King";
  }

  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    $(player).children("name").html() +
    ' is <a href="https://stardewvalleywiki.com/Skills#Skill-Based_Title">Farmer Level</a> ' +
    pt_level +
    " with title " +
    title +
    "." +
    pt_pct +
    "</span><br />";
  output +=
    '<span class="result">' +
    $(player).children("name").html() +
    " has reached level 10 in " +
    count +
    " of 5 skills.</span><br />";
  output += '<ul class="ach_list"><li>';
  output +=
    count >= 1
      ? getAchieveString("Singular Talent", "level 10 in a skill", 1)
      : getAchieveString("Singular Talent", "level 10 in a skill", 0) +
        (1 - count) +
        " more";
  output += "</li>\n<li>";
  output +=
    count >= 5
      ? getAchieveString(
          "Master of the Five Ways",
          "level 10 in every skill",
          1
        )
      : getAchieveString(
          "Master of the Five Ways",
          "level 10 in every skill",
          0
        ) +
        (5 - count) +
        " more";
  output += "</li></ul></div>";

  if (need.length > 0) {
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output +=
      '<span class="need">Skills left:<ol>' +
      need.sort().join("") +
      "</ol></span></div>";
  }
  return [output];
}
