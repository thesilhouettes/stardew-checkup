import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { getPTLink } from "../utils/getPTLink";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseCrafting(xmlDoc, saveInfo) {
  /* Manually listing all crafting recipes in the order they appear on http://stardewvalleywiki.com/Crafting
   * A translation is needed again because of text mismatch. */
  var title = "Crafting",
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

  meta.recipes = [
    "Cherry Bomb",
    "Bomb",
    "Mega Bomb",
    "Gate",
    "Wood Fence",
    "Stone Fence",
    "Iron Fence",
    "Hardwood Fence",
    "Sprinkler",
    "Quality Sprinkler",
    "Iridium Sprinkler",
    "Mayonnaise Machine",
    "Bee House",
    "Preserves Jar",
    "Cheese Press",
    "Loom",
    "Keg",
    "Oil Maker",
    "Cask",
    "Basic Fertilizer",
    "Quality Fertilizer",
    "Speed-Gro",
    "Deluxe Speed-Gro",
    "Basic Retaining Soil",
    "Quality Retaining Soil",
    "Wild Seeds (Sp)",
    "Wild Seeds (Su)",
    "Wild Seeds (Fa)",
    "Wild Seeds (Wi)",
    "Ancient Seeds",
    "Wood Floor",
    "Straw Floor",
    "Weathered Floor",
    "Crystal Floor",
    "Stone Floor",
    "Wood Path",
    "Gravel Path",
    "Cobblestone Path",
    "Stepping Stone Path",
    "Crystal Path",
    "Spinner",
    "Trap Bobber",
    "Cork Bobber",
    "Treasure Hunter",
    "Dressed Spinner",
    "Barbed Hook",
    "Magnet",
    "Bait",
    "Wild Bait",
    "Crab Pot",
    "Sturdy Ring",
    "Warrior Ring",
    "Ring of Yoba",
    "Iridium Band",
    "Field Snack",
    "Life Elixir",
    "Oil of Garlic",
    "Torch",
    "Campfire",
    "Wooden Brazier",
    "Stone Brazier",
    "Gold Brazier",
    "Carved Brazier",
    "Stump Brazier",
    "Barrel Brazier",
    "Skull Brazier",
    "Marble Brazier",
    "Wood Lamp-post",
    "Iron Lamp-post",
    "Jack-O-Lantern",
    "Chest",
    "Furnace",
    "Scarecrow",
    "Seed Maker",
    "Staircase",
    "Explosive Ammo",
    "Transmute (Fe)",
    "Transmute (Au)",
    "Crystalarium",
    "Charcoal Kiln",
    "Lightning Rod",
    "Recycling Machine",
    "Tapper",
    "Worm Bin",
    "Slime Egg-Press",
    "Slime Incubator",
    "Warp Totem: Beach",
    "Warp Totem: Mountains",
    "Warp Totem: Farm",
    "Rain Totem",
    "Tub o' Flowers",
    "Wicked Statue",
    "Flute Block",
    "Drum Block",
  ];
  meta.recipeTranslate = {
    "Oil Of Garlic": "Oil of Garlic",
  };

  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    // Wedding Ring is specifically excluded in StardewValley.Stats.checkForCraftingAchievments() so it is not listed here.
    meta.recipes.push("Wood Sign", "Stone Sign", "Garden Pot");
  }
  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    meta.recipes.push(
      "Brick Floor",
      "Grass Starter",
      "Deluxe Scarecrow",
      "Mini-Jukebox",
      "Tree Fertilizer",
      "Tea Sapling",
      "Warp Totem: Desert"
    );
  }
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    meta.recipes.push(
      "Rustic Plank Floor",
      "Stone Walkway Floor",
      "Fairy Dust",
      "Bug Steak",
      "Dark Sign",
      "Quality Bobber",
      "Stone Chest",
      "Monster Musk",
      "Mini-Obelisk",
      "Farm Computer",
      "Ostrich Incubator",
      "Geode Crusher",
      "Fiber Seeds",
      "Solar Panel",
      "Bone Mill",
      "Warp Totem: Island",
      "Thorns Ring",
      "Glowstone Ring",
      "Heavy Tapper",
      "Hopper",
      "Magic Bait",
      "Hyper Speed-Gro",
      "Deluxe Fertilizer",
      "Deluxe Retaining Soil",
      "Cookout Kit"
    );
  }

  table[0] = parsePlayerCrafting(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerCrafting(this, saveInfo, meta));
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

export function parsePlayerCrafting(player, saveInfo, meta) {
  var output = "",
    recipe_count,
    known = {},
    known_count = 0,
    craft_count = 0,
    need_k = [],
    need_c = [],
    mod_known = 0,
    mod_craft = 0,
    id,
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = "",
    r;

  recipe_count = meta.recipes.length;
  $(player)
    .find("craftingRecipes > item")
    .each(function () {
      var id = $(this).find("key > string").text(),
        num = Number($(this).find("value > int").text());
      if (meta.recipeTranslate.hasOwnProperty(id)) {
        id = meta.recipeTranslate[id];
      }
      if (id === "Wedding Ring") {
        return true;
      }
      if (meta.recipes.indexOf(id) === -1) {
        mod_known++;
        if (num > 0) {
          mod_craft++;
        }
        return true;
      }
      known[id] = num;
      known_count++;
      if (num > 0) {
        craft_count++;
      } else {
        need_c.push("<li>" + wikify(id) + "</li>");
      }
    });

  saveInfo.perfectionTracker[umid]["Crafting"] = {
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
    " has crafted " +
    craft_count +
    " and knows " +
    known_count +
    " of " +
    recipe_count +
    " base game recipes." +
    pt_pct +
    "</span>\n";
  if (mod_known > 0) {
    output +=
      '<br /><span class="result"><span class="note">' +
      $(player).children("name").html() +
      " has also crafted " +
      mod_craft +
      " and knows " +
      mod_known +
      " mod recipes (total unavailable).</span></span>\n";
  }
  output += '<ul class="ach_list"><li>';
  output +=
    craft_count + mod_craft >= 15
      ? getAchieveString("D.I.Y.", "craft 15 different items", 1)
      : getAchieveString("D.I.Y.", "craft 15 different items", 0) +
        (15 - craft_count - mod_craft) +
        " more";
  output += "</li>\n<li>";
  output +=
    craft_count + mod_craft >= 30
      ? getAchieveString("Artisan", "craft 30 different items", 1)
      : getAchieveString("Artisan", "craft 30 different items", 0) +
        (30 - craft_count - mod_craft) +
        " more";
  output += "</li>\n<li>";
  output +=
    craft_count + mod_craft >= recipe_count + mod_known
      ? getAchieveString("Craft Master", "craft every item", 1)
      : getAchieveString("Craft Master", "craft every item", 0) +
        (mod_known > 0 ? "at least " : "") +
        (recipe_count + mod_known - craft_count - mod_craft) +
        " more";
  output += "</li></ul></div>";
  if (craft_count + mod_craft < recipe_count + mod_known) {
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output += '<span class="need">Left to craft:<ul>';

    if (need_c.length > 0) {
      output +=
        "<li>Known Recipes<ol>" + need_c.sort().join("") + "</ol></li>\n";
    }

    if (known_count < recipe_count) {
      need_k = [];
      for (id in meta.recipes) {
        if (meta.recipes.hasOwnProperty(id)) {
          r = meta.recipes[id];
          if (!known.hasOwnProperty(r)) {
            need_k.push("<li>" + wikify(r) + "</li>");
          }
        }
      }
      output +=
        "<li>Unknown Recipes<ol>" + need_k.sort().join("") + "</ol></li>";
    }
    if (mod_known > 0) {
      if (mod_craft >= mod_known) {
        output += "<li>Possibly additional mod recipes</li>";
      } else {
        output +=
          "<li>Plus at least " + (mod_known - mod_craft) + " mod recipes</li>";
      }
    }
    output += "</ul></span></div>";
  }
  return [output];
}
