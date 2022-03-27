import $ from "jquery";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseCropShipping(xmlDoc, saveInfo) {
  // Relevant IDs were pulled from decompiled source - StardewValley.Stats.checkForShippingAchievments()
  // Note that there are 5 more "crops" for Monoculture than there are for Polyculture
  var title = "Crop Shipping",
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

  meta.poly_crops = {
    // Some, but not all of "Basic -75" category (All veg except fiddlehead)
    24: "Parsnip",
    188: "Green Bean",
    190: "Cauliflower",
    192: "Potato",
    248: "Garlic",
    250: "Kale",
    256: "Tomato",
    262: "Wheat",
    264: "Radish",
    266: "Red Cabbage",
    270: "Corn",
    272: "Eggplant",
    274: "Artichoke",
    276: "Pumpkin",
    278: "Bok Choy",
    280: "Yam",
    284: "Beet",
    300: "Amaranth",
    304: "Hops",
    // Some, but not all of "Basic -79" category (All fruit except Ancient, tree & forageables)
    252: "Rhubarb",
    254: "Melon",
    258: "Blueberry",
    260: "Hot Pepper",
    268: "Starfruit",
    282: "Cranberries",
    398: "Grape",
    400: "Strawberry",
    // Others
    433: "Coffee Bean",
  };
  meta.mono_extras = {
    // Ancient Fruit and 4 of the "Basic -80" flowers
    454: "Ancient Fruit",
    591: "Tulip",
    593: "Summer Spangle",
    595: "Fairy Rose",
    597: "Blue Jazz",
  };

  table[0] = parsePlayerCropShipping(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerCropShipping(this, saveInfo, meta));
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

export function parsePlayerCropShipping(player, saveInfo, meta) {
  // Much of the logic was ported from the crafting function which is why the variables are weirdly named
  var output = "",
    recipe_count = Object.keys(meta.poly_crops).length,
    crafted = {},
    craft_count = 0,
    max_ship = 0,
    max_crop = "of any crop",
    need = [],
    id,
    r,
    n,
    farmer = $(player).children("name").html();

  $(player)
    .find("basicShipped > item")
    .each(function () {
      var id = $(this).find("key > int").text(),
        num = Number($(this).find("value > int").text());
      if (meta.poly_crops.hasOwnProperty(id)) {
        crafted[meta.poly_crops[id]] = num;
        if (num >= 15) {
          craft_count++;
        }
        if (num > max_ship) {
          max_ship = num;
          max_crop = meta.poly_crops[id];
        }
      } else if (meta.mono_extras.hasOwnProperty(id)) {
        if (num > max_ship) {
          max_ship = num;
          max_crop = meta.mono_extras[id];
        }
      }
    });

  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    max_ship > 0
      ? '<span class="result">' +
        farmer +
        " has shipped " +
        max_crop +
        " the most (" +
        max_ship +
        ").</span>"
      : '<span class="result">' +
        farmer +
        " has not shipped any crops yet.</span>";
  output += '<ul class="ach_list"><li>\n';
  output +=
    max_ship >= 300
      ? getAchieveString("Monoculture", "ship 300 of one crop", 1)
      : getAchieveString("Monoculture", "ship 300 of one crop", 0) +
        (300 - max_ship) +
        " more " +
        max_crop;
  output += "</li></ul>\n";
  output +=
    '<span class="result">' +
    farmer +
    " has shipped 15 items from " +
    craft_count +
    " of " +
    recipe_count +
    ' different crops.</span><ul class="ach_list">\n<li>';
  output +=
    craft_count >= recipe_count
      ? getAchieveString("Polyculture", "ship 15 of each crop", 1)
      : getAchieveString("Polyculture", "ship 15 of each crop", 0) +
        " more of " +
        (recipe_count - craft_count) +
        " crops";
  output += "</li></ul></div>";
  if (craft_count < recipe_count) {
    need = [];
    for (id in meta.poly_crops) {
      if (meta.poly_crops.hasOwnProperty(id)) {
        r = meta.poly_crops[id];
        if (!crafted.hasOwnProperty(r)) {
          need.push("<li>" + wikify(r) + " -- 15 more</li>");
        } else {
          n = Number(crafted[r]);
          if (n < 15) {
            need.push("<li>" + wikify(r) + " --" + (15 - n) + " more</li>");
          }
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
