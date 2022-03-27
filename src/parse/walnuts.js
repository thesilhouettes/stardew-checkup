import $ from "jquery";
import compareSemVer from "semver-compare";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { getPTLink } from "../utils/getPTLink";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { getSectionHeader, getSectionFooter } from "../utils/section";

export function parseWalnuts(xmlDoc, saveInfo) {
  var title = "Golden Walnuts",
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
    farmName = $(xmlDoc).find("player > farmName").html(),
    count = 0,
    found_count = 0,
    game_count = Number($(xmlDoc).find("goldenWalnutsFound").text()),
    found = {},
    need = {},
    id,
    umid = "global", // No per-player parsing
    pt_pct = "",
    num,
    // Using same IDs as game uses internally
    trackerAllAtOnce = {
      // These are awarded all at once so the actual count is not listed in the save file
      Bush_IslandEast_17_37: {
        num: 1,
        name: "Island Jungle Bush",
        hint: "In open center area (17,37)",
      },
      Bush_IslandShrine_23_34: {
        num: 1,
        name: "Island Jungle Shrine Bush",
        hint: "Along Southern edge (23,34)",
      },
      Bush_IslandSouth_31_5: {
        num: 1,
        name: "Island South Bush",
        hint: "Accessed from hidden path East of stairs on Island North map (31,5)",
      },
      Bush_IslandNorth_9_84: {
        num: 1,
        name: "Island North Bush",
        hint: "Hidden clearing in trees West of stairs from dock area (9,84)",
      },
      Bush_IslandNorth_20_26: {
        num: 1,
        name: "Island North Bush",
        hint: "Hidden clearing in trees on West side in front of Volcano (20,26)",
      },
      Bush_IslandNorth_56_27: {
        num: 1,
        name: "Island North Bush",
        hint: "Behind coconut tree on East side in front of Volcano (56,27)",
      },
      Bush_IslandNorth_4_42: {
        num: 1,
        name: "Island North Bush",
        hint: "Grassy area above Dig Site (4,42)",
      },
      Bush_IslandNorth_45_38: {
        num: 1,
        name: "Island North Bush",
        hint: "Grassy area above Field Office (45,38)",
      },
      Bush_IslandNorth_47_40: {
        num: 1,
        name: "Island North Bush",
        hint: "Grassy area above Field Office (47,40)",
      },
      Bush_IslandNorth_13_33: {
        num: 1,
        name: "Island North Bush",
        hint: "Along river accessed via secret passage from Volcano entrance (13,33)",
      },
      Bush_IslandNorth_5_30: {
        num: 1,
        name: "Island North Bush",
        hint: "Along river accessed via secret passage from Volcano entrance (5,39)",
      },

      Bush_Caldera_28_36: {
        num: 1,
        name: "Volcano Caldera Bush",
        hint: "Along Southern edge (28,36)",
      },
      Bush_Caldera_9_34: {
        num: 1,
        name: "Volcano Caldera Bush",
        hint: "Along Southern edge (9,34)",
      },
      Bush_CaptainRoom_2_4: {
        num: 1,
        name: "Island West Shipwreck Bush",
        hint: "Shipwreck is enterable from left side (2,4)",
      },

      TreeNut: {
        num: 1,
        name: "Tree in Leo's Hut",
        hint: "Hit the tree with an axe",
      },
      Buried_IslandNorth_19_39: {
        num: 1,
        name: "Island North Buried",
        hint: "At top of stairs from Dig Site, marked by a circle of small rocks (19,39)",
      },
      Buried_IslandNorth_19_13: {
        num: 1,
        name: "Island North Buried",
        hint: "Cliff edge West of Volcano, marked by a circle of small rocks (19,13)",
      },
      Buried_IslandNorth_57_79: {
        num: 1,
        name: "Island North Buried",
        hint: "Sand patch within grass patch in SE corner, marked by a circle of small rocks (57,79)",
      },
      Buried_IslandNorth_54_21: {
        num: 1,
        name: "Island North Buried",
        hint: "Along Eastern edge of Volcano, between rocks and plants (54,21)",
      },
      Buried_IslandNorth_42_77: {
        num: 1,
        name: "Island North Buried",
        hint: "Dark grassy area just NE of stairs from dock, between tufts of long grass (42,77)",
      },
      Buried_IslandNorth_62_54: {
        num: 1,
        name: "Island North Buried",
        hint: "NE corner of path between docks and Field Office, marked by slightly raised sand (62,54)",
      },
      Buried_IslandNorth_26_81: {
        num: 1,
        name: "Island North Buried",
        hint: "Beneath curved tree West of stairs from dock, marked by a circle of small rocks (26,81)",
      },
      IslandLeftPlantRestored: {
        num: 1,
        name: "Field Office Plant Survey Reward",
        hint: "Correct count is 22 plants",
      },
      IslandRightPlantRestored: {
        num: 1,
        name: "Field Office Starfish Survey Reward",
        hint: "Correct count is 18 starfish",
      },
      IslandBatRestored: {
        num: 1,
        name: "Field Office Mummified Bat Reward",
        hint: "Found by breaking non-ore rocks in the Volcano",
      },
      IslandFrogRestored: {
        num: 1,
        name: "Field Office Mummified Frog Reward",
        hint: "Found by cutting weeds in Jungle",
      },
      IslandCenterSkeletonRestored: {
        num: 6,
        name: "Field Office Mammal Skeleton Reward",
        hint: "Skull -- Found in Golden Coconuts\nSpine -- Found by fishing in Island North\nLeg (2) -- Found by breaking fossil stones (high chance)\nRibs -- Found by breaking fossil stones (low chance)\nTail -- Found by panning in Island North",
      },
      IslandSnakeRestored: {
        num: 3,
        name: "Field Office Snake Skeleton Reward",
        hint: "Skull -- Found by digging artifact spots in Island North or West\n    and fishing in Island West\nVertebra (2) -- Found by digging artifact spots in Island West",
      },
      Bush_IslandWest_104_3: {
        num: 1,
        name: "Island West Bush",
        hint: "End of hidden path through dense trees in NE part of map (104,3)",
      },
      Bush_IslandWest_31_24: {
        num: 1,
        name: "Island West Bush",
        hint: "Behind Mahogany tree in Tiger Slime area (31,24)",
      },
      Bush_IslandWest_38_56: {
        num: 1,
        name: "Island West Bush",
        hint: "Behind palm tree near pond West of Birdie's hut (38,56)",
      },
      Bush_IslandWest_75_29: {
        num: 1,
        name: "Island West Bush",
        hint: "In front of the trees above farmhouse (75,29)",
      },
      Bush_IslandWest_64_30: {
        num: 1,
        name: "Island West Bush",
        hint: "Elevated area on West side of river; follow path counter-clockwise from Tiger Slimes (64,30)",
      },
      Bush_IslandWest_54_18: {
        num: 1,
        name: "Island West Bush",
        hint: "Obscured by dense trees along path between Tiger Slimes and suspension bridge (54,18)",
      },
      Bush_IslandWest_25_30: {
        num: 1,
        name: "Island West Bush",
        hint: "Along wall SE of walnut door (25,30)",
      },
      Bush_IslandWest_15_3: {
        num: 1,
        name: "Island West Bush",
        hint: "Follow coastline N past walnut door (15,3)",
      },
      Buried_IslandWest_21_81: {
        num: 1,
        name: "Island West Buried",
        hint: "In dark sand on SW coast, between circular indentations. (21,81)",
      },
      Buried_IslandWest_62_76: {
        num: 1,
        name: "Island West Buried",
        hint: "Among debris pile S of farm, between blue starfish (62,76)",
      },
      Buried_IslandWest_39_24: {
        num: 1,
        name: "Island West Buried",
        hint: "In Tiget Slime area, between tufts of long grass (39,24)",
      },
      Buried_IslandWest_88_14: {
        num: 1,
        name: "Island West Buried",
        hint: "In grass in NE corner, between animated tiles (88,14)",
      },
      Buried_IslandWest_43_74: {
        num: 1,
        name: "Island West Buried",
        hint: "Near tidal pools between blue and yellow starfish, initially blocked by boulder (43,74)",
      },
      Buried_IslandWest_30_75: {
        num: 1,
        name: "Island West Buried",
        hint: "Between tidal pools, marked by X (30,75)",
      },
      IslandWestCavePuzzle: {
        num: 3,
        name: "Island West Cave Puzzle",
        hint: '"Simon Says" musical crystals in hidden cave N of suspension bridge',
      },
      SandDuggy: {
        num: 1,
        name: "Island West Sand Duggy",
        hint: "Can place items to block other holes",
      },
      TreeNutShot: {
        num: 1,
        name: "Island North Palm Tree",
        hint: "Can use slingshot to knock walnut from tree",
      },
      Mermaid: {
        num: 5,
        name: "Island Cove Mermaid Puzzle",
        hint: "Use flute blocks to play Mermaids song; stones provide tuning clues",
      },
      Buried_IslandSouthEastCave_36_26: {
        num: 1,
        name: "Island Cove Cave Buried",
        hint: "Among the barrels across from the dock (36,26)",
      },
      Buried_IslandSouthEast_25_17: {
        num: 1,
        name: "Island Cove Buried",
        hint: "NE of star pool, between yellow starfish (25,17)",
      },
      StardropPool: {
        num: 1,
        name: "Island Cove Star Pool",
        hint: "Fish a walnut out of the pool",
      },
      BananaShrine: {
        num: 3,
        name: "Island Jungle Banana Shrine Reward",
        hint: "Place a banana on the shrine",
      },
      IslandGourmand1: {
        num: 5,
        name: "Island Farm Cave Gourmand Reward #1",
        hint: "Grow some melons for the Gourmand",
      },
      IslandGourmand2: {
        num: 5,
        name: "Island Farm Cave Gourmand Reward #2",
        hint: "Grow some wheat for the Gourmand",
      },
      IslandGourmand3: {
        num: 5,
        name: "Island Farm Cave Gourmand Reward #3",
        hint: "Grow some garlic for the Gourmand",
      },
      IslandShrinePuzzle: {
        num: 5,
        name: "Island Jungle Gem Shrine Reward",
        hint: "Place gems dropped by the birds on appropriate pedestals",
      },
    },
    trackerExtra = {
      // Extra because it has unique handling via a special NetWorldState variable
      GoldenCoconut: { num: 1, name: "Break a Golden Coconut", hint: "" },
    },
    trackerLimited = {
      // These are (usually) awarded one at a time, sometimes with a random component.
      Birdie: { num: 5, name: "Birdie's Quest Reward", hint: "" },
      Darts: { num: 3, name: "Winning Darts Minigame", hint: "" },
      TigerSlimeNut: {
        num: 1,
        name: "Killing Island West Tiger Slimes",
        hint: "",
      },
      VolcanoNormalChest: {
        num: 1,
        name: "Looting Volcano Common Chests",
        hint: "",
      },
      VolcanoRareChest: {
        num: 1,
        name: "Looting Volcano Rare Chests",
        hint: "",
      },
      VolcanoBarrel: { num: 5, name: 'Breaking Volcano "Barrels"', hint: "" },
      VolcanoMining: { num: 5, name: "Mining Stones in Volcano", hint: "" },
      VolcanoMonsterDrop: {
        num: 5,
        name: "Killing Monsters in Volcano",
        hint: "",
      },
      IslandFarming: {
        num: 5,
        name: "Harvesting Crops on Island Farm",
        hint: "",
      },
      MusselStone: {
        num: 5,
        name: "Breaking Shell Stones on Island Farm Beach",
        hint: "",
      },
      IslandFishing: { num: 5, name: "Fishing on the Island", hint: "" },
      Island_N_BuriedTreasureNut: {
        num: 1,
        name: "Journal Scrap #10 Buried Treasure",
        hint: "By curved tree just SW of Volcano entrance (27,28); must have read journal scrap",
      },
      Island_W_BuriedTreasureNut: {
        num: 1,
        name: "Journal Scrap #4 Buried Treasure",
        hint: "Between the bush clumps on beach N of Birdie's hut (18,42); must have read journal scrap",
      },
      Island_W_BuriedTreasureNut2: {
        num: 1,
        name: "Journal Scrap #6 Buried Treasure",
        hint: "Against wall on beach in SE corner of farm (104,74); must have read journal scrap",
      },
    };

  if (compareSemVer(saveInfo.version, version) < 0) {
    return "";
  }

  // These are shared in multiplayer so do not need any parsePlayer subroutines
  var gcc = $(xmlDoc).find("SaveGame > goldenCoconutCracked").text();
  if (gcc === "true") {
    found["GoldenCoconut"] = 1;
    found_count++;
  }
  $(xmlDoc)
    .find("collectedNutTracker > string")
    .each(function () {
      id = $(this).text();

      if (trackerAllAtOnce.hasOwnProperty(id)) {
        found[id] = trackerAllAtOnce[id].num;
        found_count += trackerAllAtOnce[id].num;
      }
    });
  $(xmlDoc)
    .find("limitedNutDrops > item")
    .each(function () {
      id = $(this).find("key > string").text();
      num = Number($(this).find("value > int").text());
      if (trackerLimited.hasOwnProperty(id) && num > 0) {
        found[id] = num;
        found_count += num;
      }
    });

  for (id in trackerAllAtOnce) {
    if (trackerAllAtOnce.hasOwnProperty(id)) {
      count += trackerAllAtOnce[id].num;
      if (!found.hasOwnProperty(id)) {
        need[id] = trackerAllAtOnce[id].num;
      }
    }
  }
  for (id in trackerExtra) {
    if (trackerExtra.hasOwnProperty(id)) {
      count += trackerExtra[id].num;
      if (!found.hasOwnProperty(id)) {
        need[id] = trackerExtra[id].num;
      }
    }
  }
  for (id in trackerLimited) {
    if (trackerLimited.hasOwnProperty(id)) {
      count += trackerLimited[id].num;
      if (found.hasOwnProperty(id)) {
        if (found[id] < trackerLimited[id].num) {
          need[id] = trackerLimited[id].num - found[id];
        }
      } else {
        need[id] = trackerLimited[id].num;
      }
    }
  }

  // The game_count vs found_count discrepancy should only happen through mods or cheating, but we will account for it
  // Most goals will use goal_count except for the "collect all" milestone since we can still list unfound ones after.
  saveInfo.perfectionTracker[umid]["Walnuts"] = {
    count: game_count,
    total: count,
  };
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    var x = Math.min(100, (100 * game_count) / count);
    var places = x < 100 ? 1 : 0;
    x = x.toFixed(places);
    pt_pct = getPTLink(x + "%");
  }
  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  var intro;
  if (saveInfo.numPlayers > 1) {
    intro = "Inhabitants of " + $(xmlDoc).find("player > farmName").html();
    +" Farm have";
  } else {
    intro = $(xmlDoc).find("player > name").html() + " has";
  }
  output +=
    '<span class="result">' +
    intro +
    " found " +
    game_count +
    " of " +
    count +
    " golden walnuts." +
    pt_pct +
    "</span>";
  if (found_count !== game_count) {
    output +=
      '<br /><span class="result warn">Warning: Save lists a count of ' +
      game_count +
      " but we've found markers for " +
      found_count +
      "</span>";
  }
  output += '<ul class="ach_list"><li>';
  output +=
    game_count >= 10
      ? getMilestoneString(
          "Collect enough walnuts (10) to earn Leo's trust.",
          1
        )
      : getMilestoneString(
          "Collect enough walnuts (10) to earn Leo's trust.",
          0
        ) +
        (10 - game_count) +
        " more";
  output += "</li>\n<li>";
  output +=
    game_count >= 101
      ? getMilestoneString(
          "Collect enough walnuts (101) to access the secret room.",
          1
        )
      : getMilestoneString(
          "Collect enough walnuts (101) to access the secret room",
          0
        ) +
        (101 - game_count) +
        " more";
  output += "</li>\n<li>";
  output +=
    found_count >= count
      ? getMilestoneString("Collect all golden walnuts.", 1)
      : getMilestoneString("Collect all golden walnuts", 0) +
        (count - found_count) +
        " more";
  output += "</li></ul></div>";

  if (found_count < count) {
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output += '<span class="need">Left to find:<ol>';
    var val = 0;
    var keys = Object.keys(need);
    var forceShowSpoilers = false;
    for (var i in keys) {
      id = keys[i];
      val += need[id];
      output += '<li value="' + val + '">';
      var extra = "";
      if (need[id] > 1) {
        extra = " -- " + need[id] + " walnuts";
      }

      if (trackerAllAtOnce.hasOwnProperty(id)) {
        output += trackerAllAtOnce[id].name + extra;
        if (trackerAllAtOnce[id].hint !== "") {
          if (forceShowSpoilers) {
            output +=
              ' -- <span class="note">' + trackerAllAtOnce[id].hint + "</span>";
          } else {
            output +=
              ' (<span class="note" data-tooltip="' +
              trackerAllAtOnce[id].hint +
              '">Hover for spoilers</span>)';
          }
        }
        output += "</li>";
      } else if (trackerExtra.hasOwnProperty(id)) {
        output += trackerExtra[id].name + extra;
        if (trackerExtra[id].hint !== "") {
          if (forceShowSpoilers) {
            output +=
              ' -- <span class="note">' + trackerExtra[id].hint + "</span>";
          } else {
            output +=
              ' (<span class="note" data-tooltip="' +
              trackerExtra[id].hint +
              '">Hover for spoilers</span>)';
          }
        }
        output += "</li>";
      } else if (trackerLimited.hasOwnProperty(id)) {
        output += trackerLimited[id].name + extra;
        if (trackerLimited[id].hint !== "") {
          if (forceShowSpoilers) {
            output +=
              ' -- <span class="note">' + trackerLimited[id].hint + "</span>";
          } else {
            output +=
              ' (<span class="note" data-tooltip="' +
              trackerLimited[id].hint +
              '">Hover for spoilers</span>)';
          }
        }
        output += "</li>";
      } else {
        console.log("Walnut tracking found unknown id: " + id);
      }
    }
    output += "</ol></span></div>";
  }

  output =
    getSectionHeader(saveInfo, title, anchor, meta.hasDetails, version) +
    output +
    getSectionFooter();
  return output;
}
