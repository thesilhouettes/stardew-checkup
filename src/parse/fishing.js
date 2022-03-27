import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { getDetailsClass, getSummaryClass } from "../utils/getClasses";
import { getPTLink } from "../utils/getPTLink";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseFishing(xmlDoc, saveInfo) {
  var title = "Fishing",
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
  meta.recipes = {
    // "Fish" category
    152: "Seaweed",
    153: "Green Algae",
    157: "White Algae",
    // "Fish -4" category
    128: "Pufferfish",
    129: "Anchovy",
    130: "Tuna",
    131: "Sardine",
    132: "Bream",
    136: "Largemouth Bass",
    137: "Smallmouth Bass",
    138: "Rainbow Trout",
    139: "Salmon",
    140: "Walleye",
    141: "Perch",
    142: "Carp",
    143: "Catfish",
    144: "Pike",
    145: "Sunfish",
    146: "Red Mullet",
    147: "Herring",
    148: "Eel",
    149: "Octopus",
    150: "Red Snapper",
    151: "Squid",
    154: "Sea Cucumber",
    155: "Super Cucumber",
    156: "Ghostfish",
    158: "Stonefish",
    159: "Crimsonfish",
    160: "Angler",
    161: "Ice Pip",
    162: "Lava Eel",
    163: "Legend",
    164: "Sandfish",
    165: "Scorpion Carp",
    682: "Mutant Carp",
    698: "Sturgeon",
    699: "Tiger Trout",
    700: "Bullhead",
    701: "Tilapia",
    702: "Chub",
    704: "Dorado",
    705: "Albacore",
    706: "Shad",
    707: "Lingcod",
    708: "Halibut",
    715: "Lobster",
    716: "Crayfish",
    717: "Crab",
    718: "Cockle",
    719: "Mussel",
    720: "Shrimp",
    721: "Snail",
    722: "Periwinkle",
    723: "Oyster",
    734: "Woodskip",
    775: "Glacierfish",
    795: "Void Salmon",
    796: "Slimejack",
  };
  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    meta.recipes[798] = "Midnight Squid";
    meta.recipes[799] = "Spook Fish";
    meta.recipes[800] = "Blobfish";
  }
  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    meta.recipes[269] = "Midnight Carp";
    meta.recipes[267] = "Flounder";
  }
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    meta.recipes[836] = "Stingray";
    meta.recipes[837] = "Lionfish";
    meta.recipes[838] = "Blue Discus";
    // Ones which don't count for collection/achieve must be commented out; we may look at handling them later
    //meta.recipes[898] = 'Son of Crimsonfish';
    //meta.recipes[899] = 'Ms. Angler';
    //meta.recipes[900] = 'Legend II';
    //meta.recipes[901] = 'Radioactive Carp';
    //meta.recipes[902] = 'Glacierfish Jr.';
  }
  table[0] = parsePlayerFishing(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerFishing(this, saveInfo, meta));
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

export function parsePlayerFishing(player, saveInfo, meta) {
  // Much of the logic was ported from the crafting function which is why the variables are weirdly named
  var output = "",
    recipe_count = Object.keys(meta.recipes).length,
    count = 0,
    craft_count = 0, // for fish types
    mod_count = 0,
    known = [],
    need = [],
    ignore = {
      // Things you can catch that aren't counted in fishing achieve
      372: 1, // Clam is category "Basic -23"
      308: 1, // Void Mayo can be caught in Witch's Swamp during "Goblin Problems"
      79: 1, // Secret Notes can be caught directly
      797: 1, // Pearl can be caught directly in Night Market Submarine
      191: 1, // Ornate necklace, from secret note quest added in 1.4
      103: 1, // Ancient doll, can be caught on 4 corners once after viewing the "doving" TV easter egg
      73: 1, // 1.5 Golden Walnuts
      842: 1, // 1.5 Journal Scraps
      821: 1, // 1.5 Fossilized Spine
      825: 1, // 1.5 Snake Skull
      890: 1, // 1.5 Qi Bean
      898: 1, // 1.5 "Extended Family" Legendary -- Son of Crimsonfish
      899: 1, // 1.5 "Extended Family" Legendary -- Ms. Angler
      900: 1, // 1.5 "Extended Family" Legendary -- Legend II
      901: 1, // 1.5 "Extended Family" Legendary -- Radioactive Carp
      902: 1, // 1.5 "Extended Family" Legendary -- Glacierfish Jr.
      388: 1, // 1.5 Town Fountain Wood
      390: 1, // 1.5 Town Fountain Stone
      2332: 1, // 1.5 Special Furniture
      2334: 1, // 1.5 Special Furniture
      2396: 1, // 1.5 Special Furniture
      2418: 1, // 1.5 Special Furniture
      2419: 1, // 1.5 Special Furniture
      2421: 1, // 1.5 Special Furniture
      2423: 1, // 1.5 Special Furniture
      2425: 1, // 1.5 Special Furniture
      2427: 1, // 1.5 Special Furniture
      2428: 1, // 1.5 Special Furniture
      2732: 1, // 1.5 Special Furniture
      2814: 1, // 1.5 Special Furniture
    },
    id,
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = "",
    r;

  $(player)
    .find("fishCaught > item")
    .each(function () {
      var id = $(this).find("key > int").text(),
        num = Number($(this).find("value > ArrayOfInt > int").first().text());
      if (!ignore.hasOwnProperty(id) && num > 0) {
        // We are adding up the count ourselves, but the total is also stored in (stats > fishCaught) and (stats > FishCaught)
        count += num;
        if (meta.recipes.hasOwnProperty(id)) {
          craft_count++;
          known[meta.recipes[id]] = num;
        } else {
          console.log("Mod fish? ID =" + id);
          mod_count++;
        }
      }
    });

  saveInfo.perfectionTracker[umid]["Fishing"] = {
    count: craft_count,
    total: recipe_count,
  };
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    pt_pct = getPTLink(craft_count / recipe_count, true);
  }
  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    $(player).children("name").html() +
    " has " +
    count +
    " total catches and has caught " +
    craft_count +
    " of " +
    recipe_count +
    " base game fish." +
    pt_pct +
    "</span>";
  if (mod_count > 0) {
    output +=
      '<br /><span class="result note">' +
      $(player).children("name").html() +
      " has also caught " +
      mod_count +
      " mod fish (total unavailable).</span>";
  }
  output += '<ul class="ach_list"><li>';
  output +=
    count >= 100
      ? getAchieveString("Mother Catch", "catch 100 total fish", 1)
      : getAchieveString("Mother Catch", "catch 100 total fish", 0) +
        (100 - count) +
        " more";
  output += "</li>\n<li>";
  output +=
    craft_count >= 10
      ? getAchieveString("Fisherman", "catch 10 different fish", 1)
      : getAchieveString("Fisherman", "catch 10 different fish", 0) +
        (10 - craft_count) +
        " more";
  output += "</li>\n<li>";
  output +=
    craft_count >= 24
      ? getAchieveString("Ol' Mariner", "catch 24 different fish", 1)
      : getAchieveString("Ol' Mariner", "catch 24 different fish", 0) +
        (24 - craft_count) +
        " more";
  output += "</li>\n<li>";
  // 1.5 has some new fish that are ignored, but the logic has not changed.
  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    output +=
      craft_count >= recipe_count
        ? getAchieveString("Master Angler", "catch every type of fish", 1)
        : getAchieveString("Master Angler", "catch every type of fish", 0) +
          (recipe_count - craft_count) +
          " more";
  } else {
    output +=
      craft_count >= Math.min(59, recipe_count)
        ? getAchieveString("Master Angler", "catch 59 different fish", 1)
        : getAchieveString("Master Angler", "catch 59 different fish", 0) +
          (Math.min(59, recipe_count) - craft_count) +
          " more";
    if (compareSemVer(saveInfo.version, "1.3") === 0) {
      output += "</li>\n<li>";
      output +=
        craft_count >= recipe_count
          ? getMilestoneString("Catch every type of fish", 1)
          : getMilestoneString("Catch every type of fish", 0) +
            (recipe_count - craft_count) +
            " more";
    }
  }

  output += "</li></ul></div>";
  if (craft_count < recipe_count) {
    need = [];
    for (id in meta.recipes) {
      if (meta.recipes.hasOwnProperty(id)) {
        r = meta.recipes[id];
        if (!known.hasOwnProperty(r)) {
          need.push("<li>" + wikify(r) + "</li>");
        }
      }
    }
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output +=
      '<span class="need">Left to catch:<ol>' +
      need.sort().join("") +
      "</ol></span></div>";
  }
  return [output];
}
