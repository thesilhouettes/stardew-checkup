import $ from "jquery";
import compareSemVer from "semver-compare";
import { getAchieveString } from "../utils/achievement";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { getPTLink } from "../utils/getPTLink";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { printTranspose } from "../utils/printTranpose";
import { getSectionHeader, getSectionFooter } from "../utils/section";
import { wikimap } from "../utils/wiki";

export function parseMonsters(xmlDoc, saveInfo) {
  /* Conditions & details from decompiled source StardewValley.Locations.AdventureGuild.gil()
   * The game counts some monsters which are not currently available; we will count them too
   * just in case they are in someone's save file, but not list them in the details. */
  var title = "Monster Hunting",
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
  meta.goals = {
    Slimes: 1000,
    "Void Spirits": 150,
    Bats: 200,
    Skeletons: 50,
    "Cave Insects": 125,
    Duggies: 30,
    "Dust Sprites": 500,
  };
  meta.categories = {
    "Green Slime": "Slimes",
    "Frost Jelly": "Slimes",
    Sludge: "Slimes",
    "Shadow Brute": "Void Spirits",
    "Shadow Shaman": "Void Spirits",
    "Shadow Guy": "Void Spirits", // not in released game
    "Shadow Girl": "Void Spirits", // not in released game
    Bat: "Bats",
    "Frost Bat": "Bats",
    "Lava Bat": "Bats",
    Skeleton: "Skeletons",
    "Skeleton Mage": "Skeletons", // not in released game
    Bug: "Cave Insects",
    Fly: "Cave Insects", // wiki calls this "Cave Fly"
    Grub: "Cave Insects",
    Duggy: "Duggies",
    "Dust Spirit": "Dust Sprites",
  };
  meta.monsters = {
    Slimes: ["Green Slime", "Frost Jelly", "Sludge"],
    "Void Spirits": ["Shadow Brute", "Shadow Shaman"],
    Bats: ["Bat", "Frost Bat", "Lava Bat"],
    Skeletons: ["Skeleton"],
    "Cave Insects": ["Bug", "Cave Fly", "Grub"],
    Duggies: ["Duggy"],
    "Dust Sprites": ["Dust Spirit"],
  };
  if (compareSemVer(saveInfo.version, "1.4") >= 0) {
    meta.goals["Rock Crabs"] = 60;
    meta.goals["Mummies"] = 100;
    meta.goals["Pepper Rex"] = 50;
    meta.goals["Serpents"] = 250;
    meta.categories["Rock Crab"] = "Rock Crabs";
    meta.categories["Lava Crab"] = "Rock Crabs";
    meta.categories["Iridium Crab"] = "Rock Crabs";
    meta.categories["Mummy"] = "Mummies";
    meta.categories["Pepper Rex"] = "Pepper Rex";
    meta.categories["Serpent"] = "Serpents";
    meta.monsters["Rock Crabs"] = ["Rock Crab", "Lava Crab", "Iridium Crab"];
    meta.monsters["Mummies"] = ["Mummy"];
    meta.monsters["Pepper Rex"] = ["Pepper Rex"];
    meta.monsters["Serpents"] = ["Serpent"];
  }
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    meta.goals["Flame Spirits"] = 150;
    meta.categories["Magma Sprite"] = "Flame Spirits";
    meta.categories["Magma Sparker"] = "Flame Spirits";
    meta.monsters["Flame Spirits"] = ["Magma Sprite", "Magma Sparker"];
    meta.categories["Tiger Slime"] = "Slimes";
    meta.monsters["Slimes"].push("Tiger Slime");
    meta.categories["Shadow Sniper"] = "Void Spirits";
    meta.monsters["Void Spirits"].push("Shadow Sniper");
    // These are included now
    meta.categories["Magma Duggy"] = "Duggies";
    meta.monsters["Duggies"].push("Magma Duggy");
    meta.categories["Iridium Bat"] = "Bats";
    meta.monsters["Bats"].push("Iridum Bat");
    meta.categories["Royal Serpent"] = "Serpents";
    meta.monsters["Serpents"].push("Royal Serpent");
    // These exist now in hard mode so need to be included in output
    meta.monsters["Skeletons"].push("Skeleton Mage");
  }
  table[0] = parsePlayerMonsters(
    $(xmlDoc).find("SaveGame > player"),
    saveInfo,
    meta
  );
  if (saveInfo.numPlayers > 1) {
    $(xmlDoc)
      .find("farmhand")
      .each(function () {
        if (isValidFarmhand(this)) {
          table.push(parsePlayerMonsters(this, saveInfo, meta));
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

export function parsePlayerMonsters(player, saveInfo, meta) {
  var output = "",
    table = [],
    goal_count = Object.keys(meta.goals).length,
    killed = [],
    completed = 0,
    need = [],
    id,
    umid = $(player).children("UniqueMultiplayerID").text(),
    pt_pct = "",
    stats,
    mineLevel = Number($(player).children("deepestMineLevel").text()),
    hasSkullKey = $(player).children("hasSkullKey").text(),
    farmer = $(player).children("name").html();

  // Have seen some inconsitencies in multiplayer, so will use presence of skull key to override the level & bump it to 120.
  if (hasSkullKey === "true") {
    mineLevel = Math.max(120, mineLevel);
  }
  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  if (mineLevel <= 0) {
    output +=
      '<span class="result">' +
      farmer +
      " has not yet explored the mines.</span><br />\n";
  } else {
    output +=
      '<span class="result">' +
      farmer +
      " has reached level " +
      Math.min(mineLevel, 120) +
      " of the mines.</span><br />\n";
    output +=
      '<span class="result">' +
      farmer +
      (mineLevel > 120
        ? " has reached level " + (mineLevel - 120) + " of the Skull Cavern"
        : " has not yet explored the Skull Cavern");
    output += ".</span></div>";
  }
  table.push(output);
  output = '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output += '<ul class="ach_list"><li>\n';
  output +=
    mineLevel >= 120
      ? getAchieveString("The Bottom", "reach mine level 120", 1)
      : getAchieveString("The Bottom", "reach mine level 120", 0) +
        (120 - mineLevel) +
        " more";
  output += "</li></ul></div>";

  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    stats = $(player).find("stats > specificMonstersKilled");
  } else {
    // In 1.2, stats are under the root SaveGame so we must go back up the tree
    stats = $(player).parent().find("stats > specificMonstersKilled");
  }

  $(stats)
    .children("item")
    .each(function () {
      var id = $(this).find("key > string").text(),
        num = Number($(this).find("value > int").text()),
        old = 0;
      if (meta.categories.hasOwnProperty(id) && num > 0) {
        if (killed.hasOwnProperty(meta.categories[id])) {
          old = killed[meta.categories[id]];
        }
        killed[meta.categories[id]] = old + num;
      }
    });
  for (id in meta.goals) {
    if (meta.goals.hasOwnProperty(id)) {
      if (killed.hasOwnProperty(id)) {
        if (killed[id] >= meta.goals[id]) {
          completed++;
        } else {
          need.push(
            "<li>" +
              id +
              " -- kill " +
              (meta.goals[id] - killed[id]) +
              " more of: " +
              meta.monsters[id].map(wikimap).join(", ") +
              "</li>"
          );
        }
      } else {
        need.push(
          "<li>" +
            id +
            " -- kill " +
            meta.goals[id] +
            " more of: " +
            meta.monsters[id].map(wikimap).join(", ") +
            "</li>"
        );
      }
    }
  }

  saveInfo.perfectionTracker[umid]["Monsters"] = completed >= goal_count;
  if (compareSemVer(saveInfo.version, "1.5") >= 0) {
    pt_pct = getPTLink(completed >= goal_count ? "Yes" : "No");
  }
  output += '<div class="' + meta.anchor + "_summary " + meta.sum_class + '">';
  output +=
    '<span class="result">' +
    farmer +
    " has completed " +
    completed +
    " of the " +
    goal_count +
    " Monster Eradication goals." +
    pt_pct +
    '</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    completed >= goal_count
      ? getAchieveString("Protector of the Valley", "all monster goals", 1)
      : getAchieveString("Protector of the Valley", "all monster goals", 0) +
        (goal_count - completed) +
        " more";
  output += "</li></ul></div>";
  if (need.length > 0) {
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output +=
      '<span class="need">Goals left:<ol>' +
      need.sort().join("") +
      "</ol></span></div>";
  }
  table.push(output);
  return table;
}
