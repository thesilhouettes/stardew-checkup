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

export function parseBasicShipping(xmlDoc, saveInfo) {
  /* Basic shipping achieve details are not easy to pull from decompiled source -- lots of filtering of
   * ObjectInformation in StardewValley.Utility.hasFarmerShippedAllItems() with additional calls to
   * StardewValley.Object.isPotentialBasicShippedCategory().
   * For now, we will simply assume it matches the Collections page and hardcode everything there
   * using wiki page http://stardewvalleywiki.com/Collections as a guideline. */
  var title = "Basic Shipping",
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
    16: "Wild Horseradish",
    18: "Daffodil",
    20: "Leek",
    22: "Dandelion",
    24: "Parsnip",
    78: "Cave Carrot",
    88: "Coconut",
    90: "Cactus Fruit",
    92: "Sap",
    174: "Large Egg (White)",
    176: "Egg (White)",
    180: "Egg (Brown)",
    182: "Large Egg (Brown)",
    184: "Milk",
    186: "Large Milk",
    188: "Green Bean",
    190: "Cauliflower",
    192: "Potato",
    248: "Garlic",
    250: "Kale",
    252: "Rhubarb",
    254: "Melon",
    256: "Tomato",
    257: "Morel",
    258: "Blueberry",
    259: "Fiddlehead Fern",
    260: "Hot Pepper",
    262: "Wheat",
    264: "Radish",
    266: "Red Cabbage",
    268: "Starfruit",
    270: "Corn",
    272: "Eggplant",
    274: "Artichoke",
    276: "Pumpkin",
    278: "Bok Choy",
    280: "Yam",
    281: "Chanterelle",
    282: "Cranberries",
    283: "Holly",
    284: "Beet",
    296: "Salmonberry",
    300: "Amaranth",
    303: "Pale Ale",
    304: "Hops",
    305: "Void Egg",
    306: "Mayonnaise",
    307: "Duck Mayonnaise",
    308: "Void Mayonnaise",
    330: "Clay",
    334: "Copper Bar",
    335: "Iron Bar",
    336: "Gold Bar",
    337: "Iridium Bar",
    338: "Refined Quartz",
    340: "Honey",
    342: "Pickles",
    344: "Jelly",
    346: "Beer",
    348: "Wine",
    350: "Juice",
    372: "Clam",
    376: "Poppy",
    378: "Copper Ore",
    380: "Iron Ore",
    382: "Coal",
    384: "Gold Ore",
    386: "Iridium Ore",
    388: "Wood",
    390: "Stone",
    392: "Nautilus Shell",
    393: "Coral",
    394: "Rainbow Shell",
    396: "Spice Berry",
    397: "Sea Urchin",
    398: "Grape",
    399: "Spring Onion",
    400: "Strawberry",
    402: "Sweet Pea",
    404: "Common Mushroom",
    406: "Wild Plum",
    408: "Hazelnut",
    410: "Blackberry",
    412: "Winter Root",
    414: "Crystal Fruit",
    416: "Snow Yam",
    417: "Sweet Gem Berry",
    418: "Crocus",
    420: "Red Mushroom",
    421: "Sunflower",
    422: "Purple Mushroom",
    424: "Cheese",
    426: "Goat Cheese",
    428: "Cloth",
    430: "Truffle",
    432: "Truffle Oil",
    433: "Coffee Bean",
    436: "Goat Milk",
    438: "Large Goat Milk",
    440: "Wool",
    442: "Duck Egg",
    444: "Duck Feather",
    446: "Rabbit's Foot",
    454: "Ancient Fruit",
    459: "Mead",
    591: "Tulip",
    593: "Summer Spangle",
    595: "Fairy Rose",
    597: "Blue Jazz",
    613: "Apple",
    634: "Apricot",
    635: "Orange",
    636: "Peach",
    637: "Pomegranate",
    638: "Cherry",
    684: "Bug Meat",
    709: "Hardwood",
    724: "Maple Syrup",
    725: "Oak Resin",
    726: "Pine Tar",
    766: "Slime",
    767: "Bat Wing",
    768: "Solar Essence",
    769: "Void Essence",
    771: "Fiber",
    787: "Battery Pack",
  };

  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    meta.recipes[807] = "Dinosaur Mayonnaise";
    meta.recipes[812] = "Roe";
    meta.recipes[445] = "Caviar";
    meta.recipes[814] = "Squid Ink";
    meta.recipes[815] = "Tea Leaves";
    meta.recipes[447] = "Aged Roe";
    meta.recipes[614] = "Green Tea";
    meta.recipes[271] = "Unmilled Rice";
  }
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    // Note: Qi Fruit (889) is specifically excluded by Object.isIndexOkForBasicShippedCategory()
    meta.recipes[91] = "Banana";
    meta.recipes[289] = "Ostrich Egg";
    meta.recipes[829] = "Ginger";
    meta.recipes[830] = "Taro Root";
    meta.recipes[832] = "Pineapple";
    meta.recipes[834] = "Mango";
    meta.recipes[848] = "Cinder Shard";
    meta.recipes[851] = "Magma Cap";
    meta.recipes[881] = "Bone Fragment";
    meta.recipes[909] = "Radioactive Ore";
    meta.recipes[910] = "Radioactive Bar";
  }
  table[0] = parsePlayerBasicShipping(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerBasicShipping(this, saveInfo, meta));
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

export function parsePlayerBasicShipping(player, saveInfo, meta) {
  // Much of the logic was ported from the crafting function which is why the variables are weirdly named
  var output = "",
    recipe_count = Object.keys(meta.recipes).length,
    crafted = {},
    craft_count = 0,
    need = [],
    id,
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = "",
    r;

  $(player)
    .find("basicShipped > item")
    .each(function () {
      var id = $(this).find("key > int").text(),
        num = Number($(this).find("value > int").text());
      if (meta.recipes.hasOwnProperty(id) && num > 0) {
        crafted[meta.recipes[id]] = num;
        craft_count++;
      }
    });

  saveInfo.perfectionTracker[umid]["Shipping"] = {
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
    " has shipped " +
    craft_count +
    " of " +
    recipe_count +
    " basic items." +
    pt_pct +
    '</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    craft_count >= recipe_count
      ? getAchieveString("Full Shipment", "ship every item", 1)
      : getAchieveString("Full Shipment", "ship every item", 0) +
        (recipe_count - craft_count) +
        " more";
  output += "</li></ul></div>";
  if (craft_count < recipe_count) {
    need = [];
    for (id in meta.recipes) {
      if (meta.recipes.hasOwnProperty(id)) {
        r = meta.recipes[id];
        if (!crafted.hasOwnProperty(r)) {
          need.push("<li>" + wikify(r) + "</li>");
        }
      }
    }
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output +=
      '<span class="need">Left to ship:<ol>' +
      need.sort().join("") +
      "</ol></span></div>";
  }
  return [output];
}
