import $ from "jquery";
import compareSemVer from "semver-compare";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseSpecialOrders(xmlDoc, saveInfo) {
  var title = "Special Orders",
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
    found = {},
    found_count = 0,
    need = [],
    hasWalnutRoomAccess = false,
    town = {
      Caroline: "Island Ingredients",
      Clint: "Cave Patrol",
      Demetrius: "Aquatic Overpopulation",
      Demetrius2: "Biome Balance",
      Emily: "Rock Rejuvenation",
      Evelyn: "Gifts for George",
      Gunther: "Fragments of the past",
      Gus: "Gus' Famous Omelet",
      Lewis: "Crop Order",
      Linus: "Community Cleanup",
      Pam: "The Strong Stuff",
      Pierre: "Pierre's Prime Produce",
      Robin: "Robin's Project",
      Robin2: "Robin's Resource Rush",
      Willy: "Juicy Bugs Wanted!",
      Willy2: "Tropical Fish",
      Wizard: "A Curious Substance",
      Wizard2: "Prismatic Jelly",
    },
    town_count = Object.keys(town).length,
    qi = {
      QiChallenge2: "Qi's Crop",
      QiChallenge3: "Let's Play A Game",
      QiChallenge4: "Four Precious Stones",
      QiChallenge5: "Qi's Hungry Challenge",
      QiChallenge6: "Qi's Cuisine",
      QiChallenge7: "Qi's Kindness",
      QiChallenge8: "Extended Family",
      QiChallenge9: "Danger In The Deep",
      QiChallenge10: "Skull Cavern Invasion",
      QiChallenge12: "Qi's Prismatic Grange",
    },
    id;

  if (compareSemVer(saveInfo.version, version) < 0) {
    return "";
  }

  $(xmlDoc)
    .find("completedSpecialOrders > string")
    .each(function () {
      id = $(this).text();

      if (town.hasOwnProperty(id)) {
        found[id] = true;
        found_count++;
      }
    });

  var intro;
  if (saveInfo.numPlayers > 1) {
    intro = "Inhabitants of " + $(xmlDoc).find("player > farmName").html();
    +" Farm have";
  } else {
    intro = $(xmlDoc).find("player > name").html() + " has";
  }
  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    intro +
    " completed " +
    found_count +
    " of " +
    town_count +
    " town special orders.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    found_count >= town_count
      ? getMilestoneString("Complete all Special Orders", 1)
      : getMilestoneString("Complete all Special Orders", 0) +
        (town_count - found_count) +
        " more";
  output += "</li></ul></div>";
  if (found_count < town_count) {
    for (id in town) {
      if (!found.hasOwnProperty(id)) {
        need.push(
          "<li>" +
            wikify(town[id], "Quests#List_of_Special_Orders", true) +
            "</li>"
        );
      }
    }
    if (need.length > 0) {
      meta.hasDetails = true;
      output +=
        '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
      output +=
        '<span class="need">Left to complete:<ol>' +
        need.sort().join("") +
        "</ol></span></div>";
    }
  }

  output =
    getSectionHeader(saveInfo, title, anchor, meta.hasDetails, version) +
    output +
    getSectionFooter();
  return output;
}
