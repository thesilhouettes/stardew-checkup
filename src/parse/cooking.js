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

export function parseCooking(xmlDoc, saveInfo) {
  var title = "Cooking",
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
    id;

  meta.recipes = {
    194: "Fried Egg",
    195: "Omelet",
    196: "Salad",
    197: "Cheese Cauliflower",
    198: "Baked Fish",
    199: "Parsnip Soup",
    200: "Vegetable Medley",
    201: "Complete Breakfast",
    202: "Fried Calamari",
    203: "Strange Bun",
    204: "Lucky Lunch",
    205: "Fried Mushroom",
    206: "Pizza",
    207: "Bean Hotpot",
    208: "Glazed Yams",
    209: "Carp Surprise",
    210: "Hashbrowns",
    211: "Pancakes",
    212: "Salmon Dinner",
    213: "Fish Taco",
    214: "Crispy Bass",
    215: "Pepper Poppers",
    216: "Bread",
    218: "Tom Kha Soup",
    219: "Trout Soup",
    220: "Chocolate Cake",
    221: "Pink Cake",
    222: "Rhubarb Pie",
    223: "Cookie",
    224: "Spaghetti",
    225: "Fried Eel",
    226: "Spicy Eel",
    227: "Sashimi",
    228: "Maki Roll",
    229: "Tortilla",
    230: "Red Plate",
    231: "Eggplant Parmesan",
    232: "Rice Pudding",
    233: "Ice Cream",
    234: "Blueberry Tart",
    235: "Autumn's Bounty",
    236: "Pumpkin Soup",
    237: "Super Meal",
    238: "Cranberry Sauce",
    239: "Stuffing",
    240: "Farmer's Lunch",
    241: "Survival Burger",
    242: "Dish O' The Sea",
    243: "Miner's Treat",
    244: "Roots Platter",
    456: "Algae Soup",
    457: "Pale Broth",
    604: "Plum Pudding",
    605: "Artichoke Dip",
    606: "Stir Fry",
    607: "Roasted Hazelnuts",
    608: "Pumpkin Pie",
    609: "Radish Salad",
    610: "Fruit Salad",
    611: "Blackberry Cobbler",
    612: "Cranberry Candy",
    618: "Bruschetta",
    648: "Coleslaw",
    649: "Fiddlehead Risotto",
    651: "Poppyseed Muffin",
    727: "Chowder",
    728: "Fish Stew",
    729: "Escargot",
    730: "Lobster Bisque",
    731: "Maple Bar",
    732: "Crab Cakes",
  };
  meta.recipeTranslate = {
    "Cheese Cauli.": "Cheese Cauliflower",
    Cookies: "Cookie",
    "Cran. Sauce": "Cranberry Sauce",
    "Dish o' The Sea": "Dish O' The Sea",
    "Eggplant Parm.": "Eggplant Parmesan",
    "Vegetable Stew": "Vegetable Medley",
  };
  meta.recipeReverse = {};

  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    meta.recipes[733] = "Shrimp Cocktail";
    meta.recipes[253] = "Triple Shot Espresso";
    meta.recipes[265] = "Seafoam Pudding";
  }

  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    meta.recipes[903] = "Ginger Ale";
    meta.recipes[904] = "Banana Pudding";
    meta.recipes[905] = "Mango Sticky Rice";
    meta.recipes[906] = "Poi";
    meta.recipes[907] = "Tropical Curry";
    meta.recipes[921] = "Squid Ink Ravioli";
  }

  for (id in meta.recipes) {
    if (meta.recipes.hasOwnProperty(id)) {
      meta.recipeReverse[meta.recipes[id]] = id;
    }
  }

  table[0] = parsePlayerCooking(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerCooking(this, saveInfo, meta));
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

export function parsePlayerCooking(player, saveInfo, meta) {
  /* cookingRecipes is keyed by name, but recipesCooked is keyed by ObjectInformation ID.
   * Also, some cookingRecipes names are different from the names in ObjectInformation (e.g. Cookies vs Cookie) */
  var output = "",
    recipe_count = Object.keys(meta.recipes).length,
    known = {},
    known_count = 0,
    crafted = {},
    craft_count = 0,
    need_k = [],
    need_c = [],
    mod_known = 0,
    mod_craft = 0,
    id,
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = "",
    r;

  $(player)
    .find("cookingRecipes > item")
    .each(function () {
      var id = $(this).find("key > string").text(),
        num = Number($(this).find("value > int").text());
      if (meta.recipeTranslate.hasOwnProperty(id)) {
        id = meta.recipeTranslate[id];
      }
      if (meta.recipeReverse.hasOwnProperty(id)) {
        known[id] = num;
        known_count++;
      } else {
        mod_known++;
      }
    });
  $(player)
    .find("recipesCooked > item")
    .each(function () {
      var id = $(this).find("key > int").text(),
        num = Number($(this).find("value > int").text());
      if (meta.recipes.hasOwnProperty(id)) {
        if (num > 0) {
          crafted[meta.recipes[id]] = num;
          craft_count++;
        }
      } else {
        if (num > 0) {
          mod_craft++;
        }
      }
    });

  saveInfo.perfectionTracker[umid]["Cooking"] = {
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
    " has cooked " +
    craft_count +
    " and knows " +
    known_count +
    " of " +
    recipe_count +
    (mod_known > 0 ? " base game" : "") +
    " recipes." +
    pt_pct +
    "</span>\n";
  if (mod_known > 0) {
    output +=
      '<br /><span class="result"><span class="note">' +
      $(player).children("name").html() +
      " has also cooked " +
      mod_craft +
      " and knows " +
      mod_known +
      " mod recipes (total unavailable).</span></span>\n";
  }
  output += '<ul class="ach_list"><li>';
  output +=
    craft_count + mod_craft >= 10
      ? getAchieveString("Cook", "cook 10 different recipes", 1)
      : getAchieveString("Cook", "cook 10 different recipes", 0) +
        (10 - craft_count - mod_craft) +
        " more";
  output += "</li>\n<li>";
  output +=
    craft_count + mod_craft >= 25
      ? getAchieveString("Sous Chef", "cook 25 different recipes", 1)
      : getAchieveString("Sous Chef", "cook 25 different recipes", 0) +
        (25 - craft_count - mod_craft) +
        " more";
  output += "</li>\n<li>";
  output +=
    craft_count + mod_craft >= recipe_count + mod_known
      ? getAchieveString("Gourmet Chef", "cook every recipe", 1)
      : getAchieveString("Gourmet Chef", "cook every recipe", 0) +
        (mod_known > 0 ? "at least " : "") +
        (recipe_count + mod_known - craft_count - mod_craft) +
        " more";
  output += "</li></ul></div>";
  // We are assuming it is impossible to craft something without knowing the recipe.
  if (craft_count + mod_craft < recipe_count + mod_known) {
    for (id in meta.recipes) {
      if (meta.recipes.hasOwnProperty(id)) {
        r = meta.recipes[id];
        if (!known.hasOwnProperty(r)) {
          need_k.push("<li>" + wikify(r) + "</li>");
        } else if (!crafted.hasOwnProperty(r)) {
          need_c.push("<li>" + wikify(r) + "</li>");
        }
      }
    }
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output += '<span class="need">Left to cook:<ul>';
    if (need_c.length > 0) {
      output +=
        "<li>Known Recipes<ol>" + need_c.sort().join("") + "</ol></li>\n";
    }
    if (need_k.length > 0) {
      output +=
        "<li>Unknown Recipes<ol>" + need_k.sort().join("") + "</ol></li>\n";
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
