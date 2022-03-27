import $ from "jquery";
import compareSemVer from "semver-compare";
import { addCommas } from "../utils/addCommas";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { getPointString, getPointImpossibleString } from "../utils/points";
import { getSectionHeader, getSectionFooter } from "../utils/section";

export function parseGrandpa(xmlDoc, saveInfo) {
  // Scoring details from StardewValley.Utility.getGrandpaScore() & getGrandpaCandlesFromScore()
  var title = "Grandpa's Evaluation",
    anchor = makeAnchor(title),
    version = "1.2",
    sum_class = getSummaryClass(saveInfo, version),
    det_class = getDetailsClass(saveInfo, version),
    output = "",
    farmer = $(xmlDoc).find("player > name").html(),
    count = 0,
    max_count = 21,
    candles = 1,
    max_candles = 4,
    currentCandles = Number(
      $(xmlDoc)
        .find(
          "locations > GameLocation[" +
            saveInfo.ns_prefix +
            "\\:type='Farm'] > grandpaScore"
        )
        .text()
    ),
    need = "",
    money = Number($(xmlDoc).find("player > totalMoneyEarned").text()),
    achieves = {
      5: "A Complete Collection",
      26: "Master Angler",
      34: "Full Shipment",
    },
    ach_count = 3,
    ach_have = {},
    cc_done = 0,
    ccRooms = {
      ccBoilerRoom: "Boiler Room",
      ccCraftsRoom: "Crafts Room",
      ccPantry: "Pantry",
      ccFishTank: "Fish Tank",
      ccVault: "Vault",
      ccBulletin: "Bulletin Board",
    },
    cc_have = 0,
    cc_count = 6,
    isJojaMember = 0,
    spouse = $(xmlDoc).find("player > spouse"), // will trigger during 3 day engagement too
    houseUpgrades = Number($(xmlDoc).find("player > houseUpgradeLevel").text()),
    hasRustyKey = $(xmlDoc).find("player > hasRustyKey").text(),
    hasSkullKey = $(xmlDoc).find("player > hasSkullKey").text(),
    hasKeys = [],
    heart_count = 0,
    hasPet = 0,
    petLove = 0,
    realPlayerLevel =
      Number($(xmlDoc).find("player > farmingLevel").text()) +
      Number($(xmlDoc).find("player > miningLevel").text()) +
      Number($(xmlDoc).find("player > combatLevel").text()) +
      Number($(xmlDoc).find("player > foragingLevel").text()) +
      Number($(xmlDoc).find("player > fishingLevel").text()) +
      Number($(xmlDoc).find("player > luckLevel").text()),
    playerLevel = realPlayerLevel / 2;

  // Pre-calculating totals to put summary info up top.
  if (money >= 1e6) {
    count += 7;
  } else if (money >= 5e5) {
    count += 5;
  } else if (money >= 3e5) {
    count += 4;
  } else if (money >= 2e5) {
    count += 3;
  } else if (money >= 1e5) {
    count += 2;
  } else if (money >= 5e4) {
    count += 1;
  }
  $(xmlDoc)
    .find("player > achievements > int")
    .each(function () {
      var id = $(this).text();
      if (achieves.hasOwnProperty(id)) {
        count++;
        ach_have[id] = 1;
      }
    });
  $(xmlDoc)
    .find("player > eventsSeen > int")
    .each(function () {
      if ($(this).text() === "191393") {
        cc_done = 1;
      }
    });
  if (cc_done) {
    count += 3;
  } else {
    $(xmlDoc)
      .find("player > mailReceived > string")
      .each(function () {
        var id = $(this).text();
        if (id === "JojaMember") {
          isJojaMember = 1;
        } else if (ccRooms.hasOwnProperty(id)) {
          cc_have++;
        }
      });
    if (cc_have >= cc_count) {
      count++;
    }
  }
  if (hasRustyKey === "true") {
    count++;
    hasKeys.push("Rusty Key");
  }
  if (hasSkullKey === "true") {
    count++;
    hasKeys.push("Skull Key");
  }
  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    var uid = $(xmlDoc).find("player").children("UniqueMultiplayerID").text();
    if (saveInfo.partners.hasOwnProperty(uid)) {
      spouse = saveInfo.players[saveInfo.partners[uid]];
    }
  }
  if (spouse.length > 0 && houseUpgrades >= 2) {
    count++;
  }
  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    $(xmlDoc)
      .find("player> friendshipData > item")
      .each(function () {
        var num = Number($(this).find("value > Friendship > Points").text());
        if (num >= 1975) {
          heart_count++;
        }
      });
  } else {
    $(xmlDoc)
      .find("player> friendships > item")
      .each(function () {
        var num = Number(
          $(this).find("value > ArrayOfInt > int").first().text()
        );
        if (num >= 1975) {
          heart_count++;
        }
      });
  }
  if (heart_count >= 10) {
    count += 2;
  } else if (heart_count >= 5) {
    count += 1;
  }
  if (playerLevel >= 25) {
    count += 2;
  } else if (playerLevel >= 15) {
    count += 1;
  }
  $(xmlDoc)
    .find("locations > GameLocation > Characters > NPC")
    .each(function () {
      if (
        $(this).attr(saveInfo.ns_prefix + ":type") === "Cat" ||
        $(this).attr(saveInfo.ns_prefix + ":type") === "Dog"
      ) {
        hasPet = 1;
        petLove = Number($(this).find("friendshipTowardFarmer").text());
      }
    });
  if (petLove >= 999) {
    count++;
  }
  if (count >= 12) {
    candles = 4;
  } else if (count >= 8) {
    candles = 3;
  } else if (count >= 4) {
    candles = 2;
  }
  output = getSectionHeader(saveInfo, title, anchor, true, version);
  output += '<div class="' + anchor + "_summary " + sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has earned a total of " +
    count +
    " point(s) (details below); the maximum possible is " +
    max_count +
    " points.</span><br />\n";
  output +=
    '<span class="result">The shrine has ' +
    currentCandles +
    " candle(s) lit. The next evaluation will light " +
    candles +
    " candle(s).</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    candles >= max_candles
      ? getMilestoneString("Four candle evaluation", 1)
      : getMilestoneString("Four candle evaluation", 0) +
        (12 - count) +
        " more point(s)";
  output += "</li></ul></span>";

  output += '<div class="' + anchor + "_details " + det_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has earned a total of " +
    addCommas(money) +
    "g.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    money >= 5e4
      ? getPointString(1, "at least 50,000g earnings", 0, 1)
      : getPointString(1, "at least 50,000g earnings", 0, 0) +
        " -- need " +
        addCommas(5e4 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 1e5
      ? getPointString(1, "at least 100,000g earnings", 1, 1)
      : getPointString(1, "at least 100,000g earnings", 1, 0) +
        " -- need " +
        addCommas(1e5 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 2e5
      ? getPointString(1, "at least 200,000g earnings", 1, 1)
      : getPointString(1, "at least 200,000g earnings", 1, 0) +
        " -- need " +
        addCommas(2e5 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 3e5
      ? getPointString(1, "at least 300,000g earnings", 1, 1)
      : getPointString(1, "at least 300,000g earnings", 1, 0) +
        " -- need " +
        addCommas(3e5 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 5e5
      ? getPointString(1, "at least 500,000g earnings", 1, 1)
      : getPointString(1, "at least 500,000g earnings", 1, 0) +
        " -- need " +
        addCommas(5e5 - money) +
        "g more";
  output += "</li>\n<li>";
  output +=
    money >= 1e6
      ? getPointString(2, "at least 1,000,000g earnings", 1, 1)
      : getPointString(2, "at least 1,000,000g earnings", 1, 0) +
        " -- need " +
        addCommas(1e6 - money) +
        "g more";
  output += "</li></ul>\n";

  output +=
    '<span class="result">' +
    farmer +
    " has earned " +
    Object.keys(ach_have).length +
    " of the " +
    ach_count +
    " relevant achievements.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output += ach_have.hasOwnProperty(5)
    ? getPointString(
        1,
        '<span class="ach">A Complete Collection</span> Achievement',
        0,
        1
      )
    : getPointString(
        1,
        '<span class="ach">A Complete Collection</span> Achievement',
        0,
        0
      );
  output += "</li>\n<li>";
  output += ach_have.hasOwnProperty(26)
    ? getPointString(
        1,
        '<span class="ach">Master Angler</span> Achievement',
        0,
        1
      )
    : getPointString(
        1,
        '<span class="ach">Master Angler</span> Achievement',
        0,
        0
      );
  output += "</li>\n<li>";
  output += ach_have.hasOwnProperty(34)
    ? getPointString(
        1,
        '<span class="ach">Full Shipment</span> Achievement',
        0,
        1
      )
    : getPointString(
        1,
        '<span class="ach">Full Shipment</span> Achievement',
        0,
        0
      );
  output += "</li></ul>\n";

  if (isJojaMember) {
    output +=
      '<span class="result">' +
      farmer +
      " has purchased a Joja membership and cannot restore the Community Center";
    output += '<ul class="ach_list"><li>';
    output += getPointImpossibleString(1, "complete Community Center");
    output += "</li>\n<li>";
    output += getPointImpossibleString(
      2,
      "attend the Community Center re-opening"
    );
    output += "</li></ul>\n";
  } else {
    if (cc_done || cc_have >= cc_count) {
      output +=
        '<span class="result">' +
        farmer +
        " has completed the Community Center restoration";
      output += cc_done
        ? " and attended the re-opening ceremony."
        : " but has not yet attended the re-opening ceremony.";
      output += "</span><br />\n";
    } else {
      output +=
        '<span class="result">' +
        farmer +
        " has not completed the Community Center restoration.";
    }
    output += '<ul class="ach_list"><li>';
    output +=
      cc_done || cc_have >= cc_count
        ? getPointString(1, "complete Community Center", 0, 1)
        : getPointString(1, "complete Community Center", 0, 0);
    output += "</li>\n<li>";
    output += cc_done
      ? getPointString(2, "attend the Community Center re-opening", 0, 1)
      : getPointString(2, "attend the Community Center re-opening", 0, 0);
    output += "</li></ul>\n";
  }

  output +=
    '<span class="result">' +
    farmer +
    " has " +
    realPlayerLevel +
    " total skill levels.</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    playerLevel >= 15
      ? getPointString(1, "30 total skill levels", 0, 1)
      : getPointString(1, "30 total skill levels", 0, 0) +
        " -- need " +
        (30 - realPlayerLevel) +
        " more";
  output += "</li>\n<li>";
  output +=
    playerLevel >= 25
      ? getPointString(1, "50 total skill levels", 1, 1)
      : getPointString(1, "50 total skill levels", 1, 0) +
        " -- need " +
        (50 - realPlayerLevel) +
        " more";
  output += "</li></ul>\n";

  output +=
    '<span class="result">' +
    farmer +
    " has " +
    heart_count +
    " relationship(s) of 1975+ friendship points (~8 hearts.)</span><br />\n";
  output += '<ul class="ach_list"><li>';
  output +=
    heart_count >= 5
      ? getPointString(1, "~8&#x2665; with 5 people", 0, 1)
      : getPointString(1, "~8&#x2665; with 5 people", 0, 0) +
        " -- need " +
        (5 - heart_count) +
        " more";
  output += "</li>\n<li>";
  output +=
    heart_count >= 10
      ? getPointString(1, "~8&#x2665; with 10 people", 1, 1)
      : getPointString(1, "~8&#x2665; with 10 people", 1, 0) +
        " -- need " +
        (10 - heart_count) +
        " more";
  output += "</li></ul>\n";

  if (hasPet) {
    output +=
      '<span class="result">' +
      farmer +
      " has a pet with " +
      petLove +
      " friendship points.</span><br />\n";
  } else {
    need = " a pet and ";
    output +=
      '<span class="result">' + farmer + " does not have a pet.</span><br />\n";
  }
  output += '<ul class="ach_list"><li>';
  output +=
    petLove >= 999
      ? getPointString(1, "pet with at least 999 friendship points", 0, 1)
      : getPointString(1, "pet with at least 999 friendship points", 0, 0) +
        " -- need " +
        need +
        (999 - petLove) +
        " friendship points";
  output += "</li></ul>\n";

  output +=
    '<span class="result">' +
    farmer +
    (spouse.length > 0 ? " is" : " is not") +
    " married and has upgraded the farmhouse " +
    houseUpgrades +
    " time(s).</span><br />\n";
  output += '<ul class="ach_list"><li>';
  need = [];
  if (spouse.length === 0) {
    need.push("a spouse");
  }
  if (houseUpgrades < 2) {
    need.push(2 - houseUpgrades + " more upgrade(s)");
  }
  output +=
    need.length === 0
      ? getPointString(1, "married with at least 2 house upgrades", 0, 1)
      : getPointString(1, "married with at least 2 house upgrades", 0, 0) +
        " -- need " +
        need.join(" and ");
  output += "</li></ul>\n";

  if (hasKeys.length > 0) {
    output +=
      '<span class="result">' +
      farmer +
      " has acquired the " +
      hasKeys.join(" and ") +
      ".</span><br />\n";
  } else {
    output +=
      '<span class="result">' +
      farmer +
      " has not acquired either the Rusty Key or Skull Key.</span><br />\n";
  }
  output += '<ul class="ach_list"><li>';
  output +=
    hasRustyKey === "true"
      ? getPointString(1, "has the Rusty Key", 0, 1)
      : getPointString(1, "get the Rusty Key", 0, 0) +
        " -- acquired after 60 museum donations";
  output += "</li>\n<li>";
  output +=
    hasSkullKey === "true"
      ? getPointString(1, "has the Skull Key", 0, 1)
      : getPointString(1, "get the Skull Key", 0, 0) +
        " -- acquired on level 120 of the mines";
  output += "</li></ul></div>";
  output += getSectionFooter();

  return output;
}
