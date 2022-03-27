import $ from "jquery";
import compareSemVer from "semver-compare";
import {
  getAchieveImpossibleString,
  getAchieveString,
} from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { makeAnchor } from "../utils/makeAnchor";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseBundlesOld(xmlDoc, saveInfo) {
  // TODO - boy howdy is 1.5 different
  // Bundle info from Data\Bundles.xnb & StardewValley.Locations.CommunityCenter class
  var title = "Community Center / Joja Community Development",
    anchor = makeAnchor(title),
    version = "1.2",
    sum_class = getSummaryClass(saveInfo, version),
    det_class = getDetailsClass(saveInfo, version),
    output = "",
    farmer = $(xmlDoc).find("player > name").html(),
    hasDetails = false,
    isJojaMember = 0,
    room = {
      0: {
        name: "Pantry",
        bundles: {
          0: "Spring Crops",
          1: "Summer Crops",
          2: "Fall Crops",
          3: "Quality Crops",
          4: "Animal",
          5: "Artisan",
        },
      },
      1: {
        name: "Crafts Room",
        bundles: {
          13: "Spring Foraging",
          14: "Summer Foraging",
          15: "Fall Foraging",
          16: "Winter Foraging",
          17: "Construction",
          19: "Exotic Foraging",
        },
      },
      2: {
        name: "Fish Tank",
        bundles: {
          6: "River Fish",
          7: "Lake Fish",
          8: "Ocean Fish",
          9: "Night Fishing",
          10: "Specialty Fish",
          11: "Crab Pot",
        },
      },
      3: {
        name: "Boiler Room",
        bundles: {
          20: "Blacksmith's",
          21: "Geologist's",
          22: "Adventurer's",
        },
      },
      4: {
        name: "Vault",
        bundles: {
          23: " 2,500g",
          24: " 5,000g",
          25: "10,000g",
          26: "25,000g",
        },
      },
      5: {
        name: "Bulletin Board",
        bundles: {
          31: "Chef's",
          32: "Field Research",
          33: "Enchanter's",
          34: "Dye",
          35: "Fodder",
        },
      },
    },
    bundleHave = {},
    bundleCount = {
      // number of items in each bundle
      0: 4,
      1: 4,
      2: 4,
      3: 3,
      4: 5,
      5: 6,
      6: 4,
      7: 4,
      8: 4,
      9: 3,
      10: 4,
      11: 5,
      13: 4,
      14: 3,
      15: 4,
      16: 4,
      17: 4,
      19: 5,
      20: 3,
      21: 4,
      22: 2,
      23: 1,
      24: 1,
      25: 1,
      26: 1,
      31: 6,
      32: 4,
      33: 4,
      34: 6,
      35: 3,
    },
    ccMail = {
      ccBoilerRoom: 3,
      ccCraftsRoom: 1,
      ccPantry: 0,
      ccFishTank: 2,
      ccVault: 4,
      ccBulletin: 5,
    },
    ccCount = 6,
    ccHave = 0,
    ccEvent = "191393",
    project = ["Greenhouse", "Bridge", "Panning", "Minecarts", "Bus"],
    price = ["35,000g", "25,000g", "20,000g", "15,000g", "40,000g"],
    jojaMail = {
      jojaBoilerRoom: 3,
      jojaCraftsRoom: 1,
      jojaPantry: 0,
      jojaFishTank: 2,
      jojaVault: 4,
    },
    jojaCount = 5,
    jojaHave = 0,
    jojaEvent = "502261",
    eventToCheck = "",
    hasSeenCeremony = 0,
    done = {},
    hybrid = 0,
    hybridLeft = 0,
    id,
    r,
    b,
    temp,
    bundleNeed = [],
    need = [],
    ccLoc = $(xmlDoc).find(
      "locations > GameLocation[" +
        saveInfo.ns_prefix +
        "\\:type='CommunityCenter']"
    );

  // First check basic completion
  r = 0;
  $(ccLoc)
    .find("areasComplete > boolean")
    .each(function () {
      if ($(this).text() === "true") {
        ccHave++;
        done[r] = 1;
      }
      r++;
    });
  // Now look at bundles. Getting an item count but not which items are placed
  $(ccLoc)
    .find("bundles > item")
    .each(function () {
      id = $(this).find("key > int").text();
      bundleHave[id] = 0;
      $(this)
        .find("ArrayOfBoolean > boolean")
        .each(function () {
          if ($(this).text() === "true") {
            bundleHave[id]++;
          }
        });
    });
  $(xmlDoc)
    .find("player > mailReceived > string")
    .each(function () {
      var id = $(this).text();
      if (id === "JojaMember") {
        isJojaMember = 1;
      } else if (jojaMail.hasOwnProperty(id)) {
        jojaHave++;
        done[jojaMail[id]] = 1;
      }
    });
  if (ccHave > 0 && isJojaMember) {
    hybrid = 1;
  }
  hybridLeft = jojaCount - ccHave;
  if (done.hasOwnProperty(ccMail.ccBulletin)) {
    hybridLeft++;
  }
  eventToCheck = isJojaMember ? jojaEvent : ccEvent;
  $(xmlDoc)
    .find("player > eventsSeen > int")
    .each(function () {
      if ($(this).text() === eventToCheck) {
        hasSeenCeremony = 1;
      }
    });

  output += '<div class="' + anchor + "_summary " + sum_class + '">';
  // New information from Gigafreak#4754 on Discord confirms that the Joja achieve does trigger even if
  // most of the CC was completed through bundles. So warnings are removed and Joja will not be marked
  // impossible unless the CC is actually done.
  if (isJojaMember) {
    if (hybrid) {
      output +=
        '<span class="result">' +
        farmer +
        " completed " +
        ccHave +
        " Community Center room(s) and then became a Joja member.</span><br />\n";
      output +=
        '<span class="result">' +
        farmer +
        " has since completed " +
        jojaHave +
        " of the remaining " +
        hybridLeft +
        " projects on the Community Development Form.</span><br />\n";
    } else {
      output +=
        '<span class="result">' +
        farmer +
        " is a Joja member and has completed " +
        jojaHave +
        " of the " +
        jojaCount +
        " projects on the Community Development Form.</span><br />\n";
    }
    hybridLeft -= jojaHave;
    output +=
      '<span class="result">' +
      farmer +
      (hasSeenCeremony ? " has" : " has not") +
      ' attended the completion ceremony</span><br />\n<ul class="ach_list"><li>';
    output += getAchieveImpossibleString(
      "Local Legend",
      "restore the Pelican Town Community Center"
    );
    output += "</li><li>\n";
    if (!hasSeenCeremony) {
      if (hybridLeft > 0) {
        temp = hybridLeft + " more project(s) and the ceremony";
        // Since we are supporting hybrid playthrough, we check the CC versions of mail, not joja
        for (id in ccMail) {
          if (ccMail.hasOwnProperty(id) && id !== "ccBulletin") {
            if (!done.hasOwnProperty(ccMail[id])) {
              need.push(
                "<li> Purchase " +
                  project[ccMail[id]] +
                  " project for " +
                  price[ccMail[id]] +
                  "</li>"
              );
            }
          }
        }
      } else {
        temp = " to attend the ceremony";
      }
      need.push(
        "<li>Attend the completion ceremony at the Joja Warehouse</li>"
      );
    }
    output += hasSeenCeremony
      ? getAchieveString("Joja Co. Member Of The Year", "", 1)
      : getAchieveString("Joja Co. Member Of The Year", "", 0) + temp;
    output += "</li></ul>\n";
  } else {
    output +=
      '<span class="result">' +
      farmer +
      " is not a Joja member and has completed " +
      ccHave +
      " of the " +
      ccCount +
      " Community Center rooms.</span><br />\n";
    output +=
      '<span class="result">' +
      farmer +
      (hasSeenCeremony ? " has" : " has not") +
      ' attended the completion ceremony</span><br />\n<ul class="ach_list"><li>';
    if (ccHave === 0) {
      output +=
        getAchieveString("Joja Co. Member Of The Year", "", 0) +
        "to become a Joja member and purchase all community development perks";
    } else if (ccHave < ccCount) {
      output +=
        getAchieveString("Joja Co. Member Of The Year", "", 0) +
        "to become a Joja member and purchase any remaining community development perks (" +
        hybridLeft +
        " left)";
    } else {
      output += getAchieveImpossibleString(
        "Joja Co. Member Of The Year",
        "become a Joja member and purchase all community development perks"
      );
    }
    output += "</li><li>\n";
    if (!hasSeenCeremony) {
      if (ccHave < ccCount) {
        temp = ccCount - ccHave + " more room(s) and the ceremony";
        for (id in ccMail) {
          if (ccMail.hasOwnProperty(id)) {
            r = ccMail[id];
            if (!done.hasOwnProperty(r)) {
              bundleNeed = [];
              if (room.hasOwnProperty(r)) {
                for (b in room[r].bundles) {
                  if (room[r].bundles.hasOwnProperty(b)) {
                    if (bundleHave[b] < bundleCount[b]) {
                      bundleNeed.push(
                        "<li>" +
                          room[r].bundles[b] +
                          " Bundle -- " +
                          (bundleCount[b] - bundleHave[b]) +
                          " more item(s)</li>"
                      );
                    }
                  }
                }
              }
              need.push(
                "<li> " +
                  wikify(room[r].name, "Bundles") +
                  "<ol>" +
                  bundleNeed.sort().join("") +
                  "</ol></li>"
              );
            }
          }
        }
      } else {
        temp = " to attend the ceremony";
      }
      need.push(
        "<li>Attend the re-opening ceremony at the Community Center</li>"
      );
    }
    output +=
      ccHave >= ccCount && hasSeenCeremony
        ? getAchieveString("Local Legend", "", 1)
        : getAchieveString("Local Legend", "", 0) + temp;
    output += "</li></ul></div>";
  }
  if (need.length > 0) {
    hasDetails = true;
    output += '<div class="' + anchor + "_details " + det_class + '">';
    output +=
      '<span class="result warn">Note: This does not yet support the randomized bundles from version 1.5, so the details may be inaccurate.<br /></span>';
    output +=
      '<span class="need">Left to do:<ol>' +
      need.sort().join("") +
      "</ol></span></div>";
  }

  output =
    getSectionHeader(saveInfo, title, anchor, hasDetails, version) +
    output +
    getSectionFooter();
  return output;
}

export function parseBundles(xmlDoc, saveInfo) {
  // This was substantially rewritten for Stardew 1.5 since that version's Random Bundles option caused
  //  the full bundle information to be placed in the save. Since we are going to at least have to partly
  //  parse the bundle definitions now, we might as well hardcode the default bundles and handle older
  //  versions that way.
  var title = "Community Center / Joja Community Development",
    anchor = makeAnchor(title),
    version = "1.5",
    sum_class = getSummaryClass(saveInfo, version),
    det_class = getDetailsClass(saveInfo, version),
    output = "",
    farmer = $(xmlDoc).find("player > name").html(),
    hasDetails = false,
    isJojaMember = 0,
    room = {},
    bundleHave = {},
    bundleCount = {},
    ccMail = {
      ccBoilerRoom: 3,
      ccCraftsRoom: 1,
      ccPantry: 0,
      ccFishTank: 2,
      ccVault: 4,
      ccBulletin: 5,
    },
    ccCount = 6,
    ccHave = 0,
    ccEvent = "191393",
    project = ["Greenhouse", "Bridge", "Panning", "Minecarts", "Bus"],
    price = ["35,000g", "25,000g", "20,000g", "15,000g", "40,000g"],
    jojaMail = {
      jojaBoilerRoom: 3,
      jojaCraftsRoom: 1,
      jojaPantry: 0,
      jojaFishTank: 2,
      jojaVault: 4,
    },
    jojaCount = 5,
    jojaHave = 0,
    jojaEvent = "502261",
    eventToCheck = "",
    hasSeenCeremony = 0,
    done = {},
    hybrid = 0,
    hybridLeft = 0,
    id,
    r,
    b,
    temp,
    bundleNeed = [],
    need = [],
    ccLoc = $(xmlDoc).find(
      "locations > GameLocation[" +
        saveInfo.ns_prefix +
        "\\:type='CommunityCenter']"
    ),
    defaultData = {
      "Pantry/0": "Spring Crops/O 465 20/24 1 0 188 1 0 190 1 0 192 1 0/0",
      "Pantry/1": "Summer Crops/O 621 1/256 1 0 260 1 0 258 1 0 254 1 0/3",
      "Pantry/2": "Fall Crops/BO 10 1/270 1 0 272 1 0 276 1 0 280 1 0/2",
      "Pantry/3": "Quality Crops/BO 15 1/24 5 2 254 5 2 276 5 2 270 5 2/6/3",
      "Pantry/4":
        "Animal/BO 16 1/186 1 0 182 1 0 174 1 0 438 1 0 440 1 0 442 1 0 639 1 0 640 1 0 641 1 0 642 1 0 643 1 0/4/5",
      "Pantry/5":
        "Artisan/BO 12 1/432 1 0 428 1 0 426 1 0 424 1 0 340 1 0 344 1 0 613 1 0 634 1 0 635 1 0 636 1 0 637 1 0 638 1 0/1/6",
      "Crafts Room/13":
        "Spring Foraging/O 495 30/16 1 0 18 1 0 20 1 0 22 1 0/0",
      "Crafts Room/14": "Summer Foraging/O 496 30/396 1 0 398 1 0 402 1 0/3",
      "Crafts Room/15":
        "Fall Foraging/O 497 30/404 1 0 406 1 0 408 1 0 410 1 0/2",
      "Crafts Room/16":
        "Winter Foraging/O 498 30/412 1 0 414 1 0 416 1 0 418 1 0/6",
      "Crafts Room/17":
        "Construction/BO 114 1/388 99 0 388 99 0 390 99 0 709 10 0/4",
      "Crafts Room/19":
        "Exotic Foraging/O 235 5/88 1 0 90 1 0 78 1 0 420 1 0 422 1 0 724 1 0 725 1 0 726 1 0 257 1 0/1/5",
      "Fish Tank/6": "River Fish/O 685 30/145 1 0 143 1 0 706 1 0 699 1 0/6",
      "Fish Tank/7": "Lake Fish/O 687 1/136 1 0 142 1 0 700 1 0 698 1 0/0",
      "Fish Tank/8": "Ocean Fish/O 690 5/131 1 0 130 1 0 150 1 0 701 1 0/5",
      "Fish Tank/9": "Night Fishing/R 516 1/140 1 0 132 1 0 148 1 0/1",
      "Fish Tank/10":
        "Specialty Fish/O 242 5/128 1 0 156 1 0 164 1 0 734 1 0/4",
      "Fish Tank/11":
        "Crab Pot/O 710 3/715 1 0 716 1 0 717 1 0 718 1 0 719 1 0 720 1 0 721 1 0 722 1 0 723 1 0 372 1 0/1/5",
      "Boiler Room/20": "Blacksmith's/BO 13 1/334 1 0 335 1 0 336 1 0/2",
      "Boiler Room/21": "Geologist's/O 749 5/80 1 0 86 1 0 84 1 0 82 1 0/1",
      "Boiler Room/22":
        "Adventurer's/R 518 1/766 99 0 767 10 0 768 1 0 769 1 0/1/2",
      "Vault/23": "2,500g/O 220 3/-1 2500 2500/4",
      "Vault/24": "5,000g/O 369 30/-1 5000 5000/2",
      "Vault/25": "10,000g/BO 9 1/-1 10000 10000/3",
      "Vault/26": "25,000g/BO 21 1/-1 25000 25000/1",
      "Bulletin Board/31":
        "Chef's/O 221 3/724 1 0 259 1 0 430 1 0 376 1 0 228 1 0 194 1 0/4",
      "Bulletin Board/32":
        "Field Research/BO 20 1/422 1 0 392 1 0 702 1 0 536 1 0/5",
      "Bulletin Board/33":
        "Enchanter's/O 336 5/725 1 0 348 1 0 446 1 0 637 1 0/1",
      "Bulletin Board/34":
        "Dye/BO 25 1/420 1 0 397 1 0 421 1 0 444 1 0 62 1 0 266 1 0/6",
      "Bulletin Board/35": "Fodder/BO 104 1/262 10 0 178 10 0 613 3 0/3",
      "Abandoned Joja Mart/36":
        "The Missing//348 1 1 807 1 0 74 1 0 454 5 2 795 1 2 445 1 0/1/5",
    };

  if (compareSemVer(saveInfo.version, version) < 0) {
    return parseBundlesOld(xmlDoc, saveInfo);
  } else {
    return parseBundlesOld(xmlDoc, saveInfo);
  }

  /*		
		// TODO - boy howdy is 1.5 different
		// Bundle info from Data\Bundles.xnb & StardewValley.Locations.CommunityCenter class
			room = {
				0: {
					'name': 'Pantry',
					'bundles': {
						0: 'Spring Crops',
						1: 'Summer Crops',
						2: 'Fall Crops',
						3: 'Quality Crops',
						4: 'Animal',
						5: 'Artisan'
					}
				},
				1: {
					'name': 'Crafts Room',
					'bundles': {
						13: 'Spring Foraging',
						14: 'Summer Foraging',
						15: 'Fall Foraging',
						16: 'Winter Foraging',
						17: 'Construction',
						19: 'Exotic Foraging'
					}
				},
				2: {
					'name': 'Fish Tank',
					'bundles': {
						6: 'River Fish',
						7: 'Lake Fish',
						8: 'Ocean Fish',
						9: 'Night Fishing',
						10: 'Specialty Fish',
						11: 'Crab Pot'
					}
				},
				3: {
					'name': 'Boiler Room',
					'bundles': {
						20: "Blacksmith's",
						21: "Geologist's",
						22: "Adventurer's"
					}
				},
				4: {
					'name': 'Vault',
					'bundles': {
						23: ' 2,500g',
						24: ' 5,000g',
						25: '10,000g',
						26: '25,000g'
					}
				},
				5: {
					'name': 'Bulletin Board',
					'bundles': {
						31: "Chef's",
						32: 'Field Research',
						33: "Enchanter's",
						34: 'Dye',
						35: 'Fodder'
					}
				}
			},
			bundleCount = { // number of items in each bundle
				0: 4,
				1: 4,
				2: 4,
				3: 3,
				4: 5,
				5: 6,
				6: 4,
				7: 4,
				8: 4,
				9: 3,
				10: 4,
				11: 5,
				13: 4,
				14: 3,
				15: 4,
				16: 4,
				17: 4,
				19: 5,
				20: 3,
				21: 4,
				22: 2,
				23: 1,
				24: 1,
				25: 1,
				26: 1,
				31: 6,
				32: 4,
				33: 4,
				34: 6,
				35: 3
			},
*/
  // First check basic completion
  r = 0;
  $(ccLoc)
    .find("areasComplete > boolean")
    .each(function () {
      if ($(this).text() === "true") {
        ccHave++;
        done[r] = 1;
      }
      r++;
    });
  // Now look at bundles. Getting an item count but not which items are placed
  $(ccLoc)
    .find("bundles > item")
    .each(function () {
      id = $(this).find("key > int").text();
      bundleHave[id] = 0;
      $(this)
        .find("ArrayOfBoolean > boolean")
        .each(function () {
          if ($(this).text() === "true") {
            bundleHave[id]++;
          }
        });
    });
  $(xmlDoc)
    .find("player > mailReceived > string")
    .each(function () {
      var id = $(this).text();
      if (id === "JojaMember") {
        isJojaMember = 1;
      } else if (jojaMail.hasOwnProperty(id)) {
        jojaHave++;
        done[jojaMail[id]] = 1;
      }
    });
  if (ccHave > 0 && isJojaMember) {
    hybrid = 1;
  }
  hybridLeft = jojaCount - ccHave;
  if (done.hasOwnProperty(ccMail.ccBulletin)) {
    hybridLeft++;
  }
  eventToCheck = isJojaMember ? jojaEvent : ccEvent;
  $(xmlDoc)
    .find("player > eventsSeen > int")
    .each(function () {
      if ($(this).text() === eventToCheck) {
        hasSeenCeremony = 1;
      }
    });

  output += '<div class="' + anchor + "_summary " + sum_class + '">';
  // New information from Gigafreak#4754 on Discord confirms that the Joja achieve does trigger even if
  // most of the CC was completed through bundles. So warnings are removed and Joja will not be marked
  // impossible unless the CC is actually done.
  if (isJojaMember) {
    if (hybrid) {
      output +=
        '<span class="result">' +
        farmer +
        " completed " +
        ccHave +
        " Community Center room(s) and then became a Joja member.</span><br />\n";
      output +=
        '<span class="result">' +
        farmer +
        " has since completed " +
        jojaHave +
        " of the remaining " +
        hybridLeft +
        " projects on the Community Development Form.</span><br />\n";
    } else {
      output +=
        '<span class="result">' +
        farmer +
        " is a Joja member and has completed " +
        jojaHave +
        " of the " +
        jojaCount +
        " projects on the Community Development Form.</span><br />\n";
    }
    hybridLeft -= jojaHave;
    output +=
      '<span class="result">' +
      farmer +
      (hasSeenCeremony ? " has" : " has not") +
      ' attended the completion ceremony</span><br />\n<ul class="ach_list"><li>';
    output += getAchieveImpossibleString(
      "Local Legend",
      "restore the Pelican Town Community Center"
    );
    output += "</li><li>\n";
    if (!hasSeenCeremony) {
      if (hybridLeft > 0) {
        temp = hybridLeft + " more project(s) and the ceremony";
        // Since we are supporting hybrid playthrough, we check the CC versions of mail, not joja
        for (id in ccMail) {
          if (ccMail.hasOwnProperty(id) && id !== "ccBulletin") {
            if (!done.hasOwnProperty(ccMail[id])) {
              need.push(
                "<li> Purchase " +
                  project[ccMail[id]] +
                  " project for " +
                  price[ccMail[id]] +
                  "</li>"
              );
            }
          }
        }
      } else {
        temp = " to attend the ceremony";
      }
      need.push(
        "<li>Attend the completion ceremony at the Joja Warehouse</li>"
      );
    }
    output += hasSeenCeremony
      ? getAchieveString("Joja Co. Member Of The Year", "", 1)
      : getAchieveString("Joja Co. Member Of The Year", "", 0) + temp;
    output += "</li></ul>\n";
  } else {
    output +=
      '<span class="result">' +
      farmer +
      " is not a Joja member and has completed " +
      ccHave +
      " of the " +
      ccCount +
      " Community Center rooms.</span><br />\n";
    output +=
      '<span class="result">' +
      farmer +
      (hasSeenCeremony ? " has" : " has not") +
      ' attended the completion ceremony</span><br />\n<ul class="ach_list"><li>';
    if (ccHave === 0) {
      output +=
        getAchieveString("Joja Co. Member Of The Year", "", 0) +
        "to become a Joja member and purchase all community development perks";
    } else if (ccHave < ccCount) {
      output +=
        getAchieveString("Joja Co. Member Of The Year", "", 0) +
        "to become a Joja member and purchase any remaining community development perks (" +
        hybridLeft +
        " left)";
    } else {
      output += getAchieveImpossibleString(
        "Joja Co. Member Of The Year",
        "become a Joja member and purchase all community development perks"
      );
    }
    output += "</li><li>\n";
    if (!hasSeenCeremony) {
      if (ccHave < ccCount) {
        temp = ccCount - ccHave + " more room(s) and the ceremony";
        for (id in ccMail) {
          if (ccMail.hasOwnProperty(id)) {
            r = ccMail[id];
            if (!done.hasOwnProperty(r)) {
              bundleNeed = [];
              if (room.hasOwnProperty(r)) {
                for (b in room[r].bundles) {
                  if (room[r].bundles.hasOwnProperty(b)) {
                    if (bundleHave[b] < bundleCount[b]) {
                      bundleNeed.push(
                        "<li>" +
                          room[r].bundles[b] +
                          " Bundle -- " +
                          (bundleCount[b] - bundleHave[b]) +
                          " more item(s)</li>"
                      );
                    }
                  }
                }
              }
              need.push(
                "<li> " +
                  wikify(room[r].name, "Bundles") +
                  "<ol>" +
                  bundleNeed.sort().join("") +
                  "</ol></li>"
              );
            }
          }
        }
      } else {
        temp = " to attend the ceremony";
      }
      need.push(
        "<li>Attend the re-opening ceremony at the Community Center</li>"
      );
    }
    output +=
      ccHave >= ccCount && hasSeenCeremony
        ? getAchieveString("Local Legend", "", 1)
        : getAchieveString("Local Legend", "", 0) + temp;
    output += "</li></ul></div>";
  }
  if (need.length > 0) {
    hasDetails = true;
    output += '<div class="' + anchor + "_details " + det_class + '">';
    output +=
      '<span class="need">Left to do:<ol>' +
      need.sort().join("") +
      "</ol></span></div>";
  }

  output =
    getSectionHeader(saveInfo, title, anchor, hasDetails, version) +
    output +
    getSectionFooter();
  return output;
}
