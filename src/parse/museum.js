import $ from "jquery";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikify } from "../utils/wiki";

export function parseMuseum(xmlDoc, saveInfo) {
  var title = "Museum Collection",
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
    museum = $(xmlDoc).find(
      "locations > GameLocation[" +
        saveInfo.ns_prefix +
        "\\:type='LibraryMuseum']"
    );

  meta.artifacts = {
    96: "Dwarf Scroll I",
    97: "Dwarf Scroll II",
    98: "Dwarf Scroll III",
    99: "Dwarf Scroll IV",
    100: "Chipped Amphora",
    101: "Arrowhead",
    103: "Ancient Doll",
    104: "Elvish Jewelry",
    105: "Chewing Stick",
    106: "Ornamental Fan",
    107: "Dinosaur Egg",
    108: "Rare Disc",
    109: "Ancient Sword",
    110: "Rusty Spoon",
    111: "Rusty Spur",
    112: "Rusty Cog",
    113: "Chicken Statue",
    114: "Ancient Seed",
    115: "Prehistoric Tool",
    116: "Dried Starfish",
    117: "Anchor",
    118: "Glass Shards",
    119: "Bone Flute",
    120: "Prehistoric Handaxe",
    121: "Dwarvish Helm",
    122: "Dwarf Gadget",
    123: "Ancient Drum",
    124: "Golden Mask",
    125: "Golden Relic",
    126: "Strange Doll (green)",
    127: "Strange Doll (yellow)",
    579: "Prehistoric Scapula",
    580: "Prehistoric Tibia",
    581: "Prehistoric Skull",
    582: "Skeletal Hand",
    583: "Prehistoric Rib",
    584: "Prehistoric Vertebra",
    585: "Skeletal Tail",
    586: "Nautilus Fossil",
    587: "Amphibian Fossil",
    588: "Palm Fossil",
    589: "Trilobite",
  };
  meta.minerals = {
    60: "Emerald",
    62: "Aquamarine",
    64: "Ruby",
    66: "Amethyst",
    68: "Topaz",
    70: "Jade",
    72: "Diamond",
    74: "Prismatic Shard",
    80: "Quartz",
    82: "Fire Quartz",
    84: "Frozen Tear",
    86: "Earth Crystal",
    538: "Alamite",
    539: "Bixite",
    540: "Baryte",
    541: "Aerinite",
    542: "Calcite",
    543: "Dolomite",
    544: "Esperite",
    545: "Fluorapatite",
    546: "Geminite",
    547: "Helvite",
    548: "Jamborite",
    549: "Jagoite",
    550: "Kyanite",
    551: "Lunarite",
    552: "Malachite",
    553: "Neptunite",
    554: "Lemon Stone",
    555: "Nekoite",
    556: "Orpiment",
    557: "Petrified Slime",
    558: "Thunder Egg",
    559: "Pyrite",
    560: "Ocean Stone",
    561: "Ghost Crystal",
    562: "Tigerseye",
    563: "Jasper",
    564: "Opal",
    565: "Fire Opal",
    566: "Celestine",
    567: "Marble",
    568: "Sandstone",
    569: "Granite",
    570: "Basalt",
    571: "Limestone",
    572: "Soapstone",
    573: "Hematite",
    574: "Mudstone",
    575: "Obsidian",
    576: "Slate",
    577: "Fairy Stone",
    578: "Star Shards",
  };
  meta.donated = {};

  var artifact_count = Object.keys(meta.artifacts).length,
    mineral_count = Object.keys(meta.minerals).length,
    donated_count = 0,
    museum_count = artifact_count + mineral_count;

  $(museum)
    .find("museumPieces > item")
    .each(function () {
      var id = Number($(this).find("value > int").text());
      if (
        meta.artifacts.hasOwnProperty(id) ||
        meta.minerals.hasOwnProperty(id)
      ) {
        meta.donated[id] = 1;
      }
    });
  donated_count = Object.keys(meta.donated).length;

  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
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
    " donated " +
    donated_count +
    " of " +
    museum_count +
    ' items to the museum.</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    donated_count >= 40
      ? getAchieveString("Treasure Trove", "donate 40 items", 1)
      : getAchieveString("Treasure Trove", "donate 40 items", 0) +
        (40 - donated_count) +
        " more";
  output += "</li>\n<li>";
  output +=
    donated_count >= 60
      ? getMilestoneString("Donate enough items (60) to get the Rusty Key", 1)
      : getMilestoneString("Donate enough items (60) to get the Rusty Key", 0) +
        (60 - donated_count) +
        " more";
  output += "</li>\n<li>";
  output +=
    donated_count >= museum_count
      ? getAchieveString("A Complete Collection", "donate every item", 1)
      : getAchieveString("A Complete Collection", "donate every item", 0) +
        (museum_count - donated_count) +
        " more";
  output += "</li></ul></div>";
  if (donated_count < museum_count) {
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output +=
      '<span class="need">See below for items left to donate</span><br /><br /></div>';
  }

  table[0] = parsePlayerMuseum(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerMuseum(this, saveInfo, meta));
        }
      });
  }
  playerOutput += printTranspose(table);
  output =
    getSectionHeader(saveInfo, title, anchor, meta.hasDetails, version) +
    output +
    playerOutput +
    getSectionFooter();
  return output;
}

export function parsePlayerMuseum(player, saveInfo, meta) {
  var output = "",
    donated_count = Object.keys(meta.donated).length,
    artifact_count = Object.keys(meta.artifacts).length,
    mineral_count = Object.keys(meta.minerals).length,
    museum_count = artifact_count + mineral_count,
    found = {},
    found_art = 0,
    found_min = 0,
    need_art = [],
    need_min = [],
    need = [],
    id,
    r,
    farmer = $(player).children("name").html();

  $(player)
    .find("archaeologyFound > item")
    .each(function () {
      var id = $(this).find("key > int").text(),
        num = Number($(this).find("value > ArrayOfInt > int").first().text());
      if (meta.artifacts.hasOwnProperty(id) && num > 0) {
        found[id] = num;
        found_art++;
      }
    });
  $(player)
    .find("mineralsFound > item")
    .each(function () {
      var id = $(this).find("key > int").text(),
        num = Number($(this).find("value > int").text());
      if (meta.minerals.hasOwnProperty(id) && num > 0) {
        found[id] = num;
        found_min++;
      }
    });

  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has found " +
    found_art +
    " of " +
    artifact_count +
    " artifacts.</span><br />\n";
  output +=
    '<span class="result">' +
    farmer +
    " has found " +
    found_min +
    " of " +
    mineral_count +
    ' minerals.</span><ul class="ach_list">\n';
  output += "<li>";
  output += "</li>\n<li>";
  output +=
    found_art >= artifact_count
      ? getMilestoneString("All artifacts found", 1)
      : getMilestoneString("All artifacts found", 0) +
        (artifact_count - found_art) +
        " more";
  output += "</li>\n<li>";
  output +=
    found_min >= mineral_count
      ? getMilestoneString("All minerals found", 1)
      : getMilestoneString("All minerals found", 0) +
        (mineral_count - found_min) +
        " more";
  output += "</li></ul></div>";

  if (donated_count < museum_count || found_art + found_min < museum_count) {
    for (id in meta.artifacts) {
      if (meta.artifacts.hasOwnProperty(id)) {
        r = meta.artifacts[id];
        need = [];
        if (!found.hasOwnProperty(id)) {
          need.push("found");
        }
        if (!meta.donated.hasOwnProperty(id)) {
          need.push("donated");
        }
        if (need.length > 0) {
          need_art.push(
            "<li>" + wikify(r) + " -- not " + need.join(" or ") + "</li>"
          );
        }
      }
    }
    for (id in meta.minerals) {
      if (meta.minerals.hasOwnProperty(id)) {
        r = meta.minerals[id];
        need = [];
        if (!found.hasOwnProperty(id)) {
          need.push("found");
        }
        if (!meta.donated.hasOwnProperty(id)) {
          need.push("donated");
        }
        if (need.length > 0) {
          need_min.push(
            "<li>" + wikify(r) + " -- not " + need.join(" or ") + "</li>"
          );
        }
      }
    }
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output += '<span class="need">Items left:<ul>';
    if (need_art.length > 0) {
      output += "<li>Artifacts<ol>" + need_art.sort().join("") + "</ol></li>\n";
    }
    if (need_min.length > 0) {
      output += "<li>Minerals<ol>" + need_min.sort().join("") + "</ol></li>\n";
    }
    output += "</ul></span></div>";
  }

  return [output];
}
