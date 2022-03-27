import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { getPTLink } from "../utils/getPTLink";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseSocial(xmlDoc, saveInfo) {
  var title = "Social",
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
    table = [],
    spouse = $(xmlDoc).find("player > spouse").text(); // only used for 1.2 engagement checking

  meta.countdown = Number($(xmlDoc).find("countdownToWedding").text());
  meta.daysPlayed = Number($(xmlDoc).find("stats > daysPlayed").first().text());
  // NPCs and NPC Types we are ignoring either in location data or friendship data
  meta.ignore = {
    Horse: 1,
    Cat: 1,
    Dog: 1,
    Fly: 1,
    Grub: 1,
    GreenSlime: 1,
    Gunther: 1,
    Marlon: 1,
    Bouncer: 1,
    "Mister Qi": 1,
    Henchman: 1,
    Birdie: 1,
  };
  meta.npc = {};
  // <NPC>: [ [<numHearts>, <id>], ... ]
  meta.eventList = {
    Abigail: [
      [2, 1],
      [4, 2],
      [6, 4],
      [8, 3],
      [10, 901756],
    ],
    Alex: [
      [2, 20],
      [4, 2481135],
      [5, 21],
      [6, 2119820],
      [8, 288847],
      [10, 911526],
    ],
    Elliott: [
      [2, 39],
      [4, 40],
      [6, 423502],
      [8, 1848481],
      [10, 43],
    ],
    Emily: [
      [2, 471942],
      [4, 463391],
      [6, 917409],
      [8, 2123243],
      [10, 2123343],
    ],
    Haley: [
      [2, 11],
      [4, 12],
      [6, 13],
      [8, 14],
      [10, 15],
    ],
    Harvey: [
      [2, 56],
      [4, 57],
      [6, 58],
      [8, 571102],
      [10, 528052],
    ],
    Leah: [
      [2, 50],
      [4, 51],
      [6, 52],
      [8, "53|584059"],
      [10, 54],
    ], // 53 art show, 584059 online
    Maru: [
      [2, 6],
      [4, 7],
      [6, 8],
      [8, 9],
      [10, 10],
    ],
    Penny: [
      [2, 34],
      [4, 35],
      [6, 36],
      [8, 181928],
      [10, 38],
    ],
    Sam: [
      [2, 44],
      [3, 733330],
      [4, 46],
      [6, 45],
      [8, 4081148],
      [10, 233104],
    ],
    Sebastian: [
      [2, 2794460],
      [4, 384883],
      [6, 27],
      [8, 29],
      [10, 384882],
    ],
    Shane: [
      [2, 611944],
      [4, 3910674],
      [6, 3910975],
      ["6.8", 3910974],
      [7, 831125],
      [8, 3900074],
      [10, 9581348],
    ],
    Caroline: [[6, 17]],
    Clint: [
      [3, 97],
      [6, 101],
    ],
    Demetrius: [[6, 25]],
    Dwarf: [["0.2", 691039]],
    Evelyn: [[4, 19]],
    George: [[6, 18]],
    Gus: [[4, 96]],
    Jas: [],
    Jodi: [[4, "94|95"]], // 94 y1, 95 y2
    Kent: [[3, 100]],
    Krobus: [],
    Lewis: [[6, 639373]],
    Linus: [
      ["0.2", 502969],
      [4, 26],
    ],
    Marnie: [[6, 639373]],
    Pam: [],
    Pierre: [[6, 16]],
    Robin: [[6, 33]],
    Sandy: [],
    Vincent: [],
    Willy: [],
    Wizard: [],
  };
  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    meta.eventList.Jas.push([8, 3910979]);
    meta.eventList.Vincent.push([8, 3910979]);
    meta.eventList.Linus.push([8, 371652]);
    meta.eventList.Pam.push([9, 503180]);
    meta.eventList.Willy.push([6, 711130]);
  }
  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    meta.eventList.Gus.push([5, 980558]);
    // This event does not require 2 hearts, but getting into the room does
    meta.eventList.Caroline.push([2, 719926]);
    // 14-Heart spouse events. Many have multiple parts; to preserve their proper order,
    //  we will use 14.2, 14.3, etc. even though it the requirements are exactly 14
    meta.eventList.Abigail.push([14, 6963327]);
    meta.eventList.Emily.push([14.1, 3917600], [14.2, 3917601]);
    meta.eventList.Haley.push(
      [14.1, 6184643],
      [14.2, 8675611],
      [14.3, 6184644]
    );
    meta.eventList.Leah.push([14.1, 3911124], [14.2, 3091462]);
    meta.eventList.Maru.push([14.1, 3917666], [14.2, 5183338]);
    meta.eventList.Penny.push([14.1, 4325434], [14.2, 4324303]);
    meta.eventList.Alex.push([14.1, 3917587], [14.2, 3917589], [14.3, 3917590]);
    meta.eventList.Elliott.push([14.1, 3912125], [14.2, 3912132]);
    meta.eventList.Harvey.push([14, 3917626]);
    meta.eventList.Sam.push(
      [14.1, 3918600],
      [14.2, 3918601],
      [14.3, 3918602],
      [14.4, 3918603]
    );
    meta.eventList.Sebastian.push([14.1, 9333219], [14.2, 9333220]);
    meta.eventList.Shane.push(
      [14.1, 3917584],
      [14.2, 3917585],
      [14.3, 3917586]
    );
    meta.eventList.Krobus.push([14, 7771191]);
  }
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    meta.eventList["Leo"] = [
      [2, 6497423],
      [4, 6497421],
      [6, 6497428],
      [9, 8959199],
    ];
  }

  // Search locations for NPCs. They could be hardcoded, but this is somewhat more mod-friendly and it also
  // lets us to grab children and search out relationship status for version 1.2 saves.
  $(xmlDoc)
    .find("locations > GameLocation")
    .each(function () {
      $(this)
        .find("characters > NPC")
        .each(function () {
          var type = $(this).attr(saveInfo.ns_prefix + ":type");
          var who = $(this).find("name").html();
          // Filter out animals and monsters
          if (
            meta.ignore.hasOwnProperty(type) ||
            meta.ignore.hasOwnProperty(who)
          ) {
            return;
          }
          meta.npc[who] = {};
          meta.npc[who].isDatable = $(this).find("datable").text() === "true";
          meta.npc[who].isGirl = $(this).find("gender").text() === "1";
          meta.npc[who].isChild = type === "Child";
          if (compareSemVer(saveInfo.version, "1.3") < 0) {
            if ($(this).find("divorcedFromFarmer").text() === "true") {
              meta.npc[who].relStatus = "Divorced";
            } else if (countdown > 0 && who === spouse.slice(0, -7)) {
              meta.npc[who].relStatus = "Engaged";
            } else if ($(this).find("daysMarried").text() > 0) {
              meta.npc[who].relStatus = "Married";
            } else if ($(this).find("datingFarmer").text() === "true") {
              meta.npc[who].relStatus = "Dating";
            } else {
              meta.npc[who].relStatus = "Friendly";
            }
          }
        });
    });
  table[0] = parsePlayerSocial(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerSocial(this, saveInfo, meta));
        }
      });
  }
  playerOutput = printTranspose(table);
  output =
    getSectionHeader(saveInfo, title, anchor, meta.hasDetails, version) +
    playerOutput +
    getSectionFooter();
  return output;
}

export function parsePlayerSocial(player, saveInfo, meta) {
  var output = "",
    table = [],
    count_5h = 0,
    count_10h = 0,
    maxed_count = 0,
    maxed_total = 0,
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = "",
    points = {},
    list_fam = [],
    list_bach = [],
    list_other = [],
    list_poly = [],
    farmer = $(player).children("name").html(),
    spouse = $(player).children("spouse").html(),
    dumped_Girls = 0,
    dumped_Guys = 0,
    hasSpouseStardrop = false,
    eventsSeen = {},
    hasNPCSpouse = false,
    hasPamHouse = false,
    hasCompletedIntroductions = true,
    list_intro = [],
    polyamory = {
      "All Bachelors": [195013, 195099],
      "All Bachelorettes": [195012, 195019],
    };
  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    $(player)
      .find("activeDialogueEvents > item")
      .each(function () {
        var which = $(this).find("key > string").text();
        var num = Number($(this).find("value > int").text());
        if (which === "dumped_Girls") {
          dumped_Girls = num;
        } else if (which === "dumped_Guys") {
          dumped_Guys = num;
        }
      });
    $(player)
      .find("friendshipData > item")
      .each(function () {
        var who = $(this).find("key > string").html();
        if (meta.ignore.hasOwnProperty(who)) {
          return;
        }
        if (!meta.npc.hasOwnProperty(who)) {
          // This shouldn't happen
          meta.npc[who] = { isDatable: false, isGirl: false, isChild: false };
        }
        var num = Number($(this).find("value > Friendship > Points").text());
        if (num >= 2500) {
          count_10h++;
        }
        if (num >= 1250) {
          count_5h++;
        }
        // Some redundancy because of keeping the achievement tally separate from Perfection Tracker
        if (meta.eventList.hasOwnProperty(who)) {
          maxed_total++;
          if ((meta.npc[who].isDatable && num >= 2000) || num >= 2500) {
            maxed_count++;
          }
        }
        points[who] = num;
        meta.npc[who].relStatus = $(this)
          .find("value > Friendship > Status")
          .html();
        var isRoommate =
          $(this).find("value > Friendship > RoommateMarriage").text() ===
          "true";
        if (meta.npc[who].relStatus === "Married" && isRoommate) {
          meta.npc[who].relStatus = "Roommate";
        }
      });
  } else {
    $(player)
      .find("friendships > item")
      .each(function () {
        var who = $(this).find("key > string").html();
        var num = Number(
          $(this).find("value > ArrayOfInt > int").first().text()
        );
        if (num >= 2500) {
          count_10h++;
        }
        if (num >= 1250) {
          count_5h++;
        }
        points[who] = num;
      });
    if (meta.countdown > 0) {
      spouse = spouse.slice(0, -7);
    }
  }

  $(player)
    .find("eventsSeen > int")
    .each(function () {
      eventsSeen[$(this).text()] = 1;
    });
  $(player)
    .find("mailReceived > string")
    .each(function () {
      if ($(this).text() === "CF_Spouse") {
        hasSpouseStardrop = true;
      }
      if ($(this).text() === "pamHouseUpgrade") {
        hasPamHouse = true;
      }
    });
  var eventCheck = function (arr, who) {
    var seen = false;
    var neg = "no";
    // Note we are altering eventInfo from parent function
    String(arr[1])
      .split("|")
      .forEach(function (e) {
        if (eventsSeen.hasOwnProperty(e)) {
          seen = true;
        }
      });
    // checks for events which can be permanently missed; 1st is Clint 6H, second is Sam 3H
    // Penny 4H & 6H added if Pam House Upgrade is done in some versions.
    if (
      (arr[1] === 101 &&
        (eventsSeen.hasOwnProperty(2123243) ||
          eventsSeen.hasOwnProperty(2123343))) ||
      (arr[1] === 733330 && meta.daysPlayed > 84) ||
      (arr[1] === 35 &&
        hasPamHouse &&
        compareSemVer(saveInfo.version, "1.5") < 0) ||
      (arr[1] === 36 &&
        hasPamHouse &&
        compareSemVer(saveInfo.version, "1.4") < 0)
    ) {
      neg = "imp";
    }
    // 10-heart events will be tagged impossible if there is no bouquet.
    if (
      arr[0] == 10 &&
      meta.npc[who].isDatable &&
      meta.npc[who].relStatus == "Friendly"
    ) {
      neg = "imp";
    }
    // 14-heart events will be tagged impossible if the player is married to someone else.
    if (arr[0] >= 14 && who !== spouse) {
      neg = "imp";
    }
    // Now we are hardcoding 2 events that involve multiple NPCs too.
    var extra = "";
    if (arr[1] === 3910979) {
      extra = " (Jas &amp; Vincent both)";
    } else if (arr[1] === 639373) {
      extra = " (Lewis &amp; Marnie both)";
    }
    eventInfo +=
      ' [<span class="ms_' +
      (seen ? "yes" : neg) +
      '">' +
      arr[0] +
      "&#x2665;" +
      extra +
      "</span>]";
  };
  for (var who in meta.npc) {
    // Overriding status for the confrontation events
    if (dumped_Girls > 0 && npc[who].isDatable && npc[who].isGirl) {
      meta.npc[who].relStatus = "Angry (" + dumped_Girls + " more day(s))";
    } else if (dumped_Guys > 0 && npc[who].isDatable && !npc[who].isGirl) {
      nmeta.pc[who].relStatus = "Angry (" + dumped_Guys + " more day(s))";
    }
    var pts = 0;
    if (points.hasOwnProperty(who)) {
      pts = points[who];
    } else {
      meta.npc[who].relStatus = "Unmet";
    }
    var hearts = Math.floor(pts / 250);
    var entry = "<li>";
    entry += meta.npc[who].isChild
      ? who + " (" + wikify("Child", "Children") + ")"
      : wikify(who);
    entry +=
      ": " +
      meta.npc[who].relStatus +
      ", " +
      hearts +
      "&#x2665; (" +
      pts +
      " pts) -- ";

    // Check events
    // We want to only make an Event list item if there are actually events for this NPC.
    var eventInfo = "";
    if (meta.eventList.hasOwnProperty(who)) {
      if (meta.eventList[who].length > 0) {
        eventInfo += '<ul class="compact"><li>Event(s): ';
        meta.eventList[who].sort(function (a, b) {
          return a[0] - b[0];
        });
        meta.eventList[who].forEach(function (a) {
          eventCheck(a, who);
        });
        eventInfo += "</li></ul>";
      }
    }
    var max;
    if (who === spouse) {
      // Spouse Stardrop threshold is 3375 from StardewValley.NPC.checkAction(); 3500 (14 hearts) in 1.4
      max = hasSpouseStardrop ? 3250 : 3375;
      if (compareSemVer(saveInfo.version, "1.4") >= 0) {
        max = 3500;
      }
      entry +=
        pts >= max
          ? '<span class="ms_yes">MAX (can still decay)</span></li>'
          : '<span class="ms_no">need ' + (max - pts) + " more</span></li>";
      hasNPCSpouse = true;
      list_fam.push(entry + eventInfo);
    } else if (meta.npc[who].isDatable) {
      max = 2000;
      if (meta.npc[who].relStatus === "Dating") {
        max = 2500;
      }
      entry +=
        pts >= max
          ? '<span class="ms_yes">MAX</span></li>'
          : '<span class="ms_no">need ' + (max - pts) + " more</span></li>";
      list_bach.push(entry + eventInfo);
    } else {
      entry +=
        pts >= 2500
          ? '<span class="ms_yes">MAX</span></li>'
          : '<span class="ms_no">need ' + (2500 - pts) + " more</span></li>";
      if (meta.npc[who].isChild) {
        list_fam.push(entry + eventInfo);
      } else {
        list_other.push(entry + eventInfo);
      }
    }
  }
  if (saveInfo.version >= 1.3) {
    for (var who in polyamory) {
      // Rather than trying to force these to work in the eventCheck function, we make a new checker.
      var seen = false;
      var span = "no";
      var entry = "<li>" + who;
      for (var id = 0; id < polyamory[who].length; id++) {
        if (eventsSeen.hasOwnProperty(polyamory[who][id])) {
          seen = true;
        }
      }
      if (seen) {
        span = "yes";
      } else if (hasNPCSpouse) {
        span = "imp";
      }
      entry += ': [<span class="ms_' + span + '">10&#x2665;</span>]</li>';
      list_poly.push(entry);
    }
  }
  $(player)
    .find(
      "questLog > [" +
        saveInfo.ns_prefix +
        "\\:type='SocializeQuest'] > whoToGreet > string"
    )
    .each(function () {
      list_intro.push($(this).text());
      hasCompletedIntroductions = false;
    });

  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has " +
    (hasCompletedIntroductions ? "" : "not ") +
    'met everyone in town.</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    list_intro.length == 0
      ? getMilestoneString(
          'Complete <span class="ach">Introductions</span> quest',
          1
        )
      : getMilestoneString(
          'Complete <span class="ach">Introductions</span> quest',
          0
        ) +
        list_intro.length +
        " more";
  output += "</li></ul></div>";
  output += '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
  if (list_intro.length > 0) {
    output +=
      '<span class="need">Villagers left to meet<ol><li>' +
      list_intro.sort().join("</li><li>") +
      "</li></ol></span>\n";
  }
  output += "</div>";
  table.push(output);

  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has " +
    count_5h +
    ' relationship(s) of 5+ hearts.</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    count_5h >= 1
      ? getAchieveString("A New Friend", "5&#x2665; with 1 person", 1)
      : getAchieveString("A New Friend", "5&#x2665; with 1 person", 0) +
        (1 - count_5h) +
        " more";
  output += "</li>\n<li>";
  output +=
    count_5h >= 4
      ? getAchieveString("Cliques", "5&#x2665; with 4 people", 1)
      : getAchieveString("Cliques", "5&#x2665; with 4 people", 0) +
        (4 - count_5h) +
        " more\n";
  output += "</li>\n<li>";
  output +=
    count_5h >= 10
      ? getAchieveString("Networking", "5&#x2665; with 10 people", 1)
      : getAchieveString("Networking", "5&#x2665; with 10 people", 0) +
        (10 - count_5h) +
        " more";
  output += "</li>\n<li>";
  output +=
    count_5h >= 20
      ? getAchieveString("Popular", "5&#x2665; with 20 people", 1)
      : getAchieveString("Popular", "5&#x2665; with 20 people", 0) +
        (20 - count_5h) +
        " more";
  output += "</li></ul></div>";
  table.push(output);

  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has " +
    count_10h +
    ' relationships of 10+ hearts.</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    count_10h >= 1
      ? getAchieveString("Best Friends", "10&#x2665; with 1 person", 1)
      : getAchieveString("Best Friends", "10&#x2665; with 1 person", 0) +
        (1 - count_10h) +
        " more";
  output += "</li>\n<li>";
  output +=
    count_10h >= 8
      ? getAchieveString("The Beloved Farmer", "10&#x2665; with 8 people", 1)
      : getAchieveString("The Beloved Farmer", "10&#x2665; with 8 people", 0) +
        (8 - count_10h) +
        " more";
  output += "</li></ul></div>";
  table.push(output);

  saveInfo.perfectionTracker[umid]["Great Friends"] = {
    count: maxed_count,
    total: maxed_total,
  };
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    pt_pct = getPTLink(maxed_count / maxed_total, true);
  }
  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has maxed " +
    maxed_count +
    " of " +
    maxed_total +
    " base game villager relationships." +
    pt_pct +
    "</span><br />";
  output +=
    '<span class="explain">Note: for this milestone, all dateable NPCs are considered maxed at 8 hearts.</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    maxed_count >= maxed_total
      ? getMilestoneString("Max out hearts with all base game villagers", 1)
      : getMilestoneString("Max out hearts with all base game villagers", 0) +
        (maxed_total - maxed_count) +
        " more";
  output += "</li></ul></div>";
  table.push(output);

  output = '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
  output +=
    '<span class="result">Individual Friendship Progress for ' +
    farmer +
    '</span><ul class="outer">';
  if (list_fam.length > 0) {
    output +=
      '<li>Family (includes all player children)<ol class="compact">' +
      list_fam.sort().join("") +
      "</ol></li>\n";
  }
  if (list_bach.length > 0) {
    output +=
      '<li>Datable Villagers<ol class="compact">' +
      list_bach.sort().join("") +
      "</ol></li>\n";
  }
  if (list_poly.length > 0) {
    output +=
      '<li>Polyamory Events<ol class="compact">' +
      list_poly.sort().join("") +
      "</ol></li>\n";
  }
  if (list_other.length > 0) {
    output +=
      '<li>Other Villagers<ol class="compact">' +
      list_other.sort().join("") +
      "</ol></li>\n";
  }
  output += "</ul></div>";
  meta.hasDetails = true; // this one always has details because of the friendship progress
  table.push(output);
  return table;
}
