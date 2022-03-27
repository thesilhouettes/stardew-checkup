import $ from "jquery";
import compareSemVer from "semver-compare";
import { getSummaryClass, getDetailsClass } from "../utils/getClasses";
import { makeAnchor } from "../utils/makeAnchor";
import { getMilestoneString } from "../utils/milestone";
import { getSectionHeader, getSectionFooter } from "../utils/section";

export function parseIslandUpgrades(xmlDoc, saveInfo) {
  var title = "Island Upgrades",
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
    bought_count = 0,
    bought = {},
    need = {},
    id,
    cost = 0,
    upgrades = {
      Island_FirstParrot: { cost: 1, name: "Feed Leo's Friend" },
      Island_Turtle: { cost: 10, name: "Turtle Relocation" },
      Island_UpgradeHouse: { cost: 20, name: "Island Farmhouse" },
      Island_Resort: { cost: 20, name: "Resort" },
      Island_UpgradeTrader: { cost: 10, name: "Island Trader" },
      Island_UpgradeBridge: { cost: 10, name: "Bridge to Dig Site" },
      Island_UpgradeParrotPlatform: {
        cost: 10,
        name: "Parrot Express Platforms",
      },
      Island_UpgradeHouse_Mailbox: { cost: 5, name: "Mailbox" },
      Island_W_Obelisk: { cost: 20, name: "Obelisk to Return to Valley" },
      Island_VolcanoBridge: { cost: 5, name: "Bridge in Volcano entrance" },
      Island_VolcanoShortcutOut: {
        cost: 5,
        name: "Exit hole from Volcano vendor",
      },
    };

  if (compareSemVer(saveInfo.version, version) < 0) {
    return "";
  }
  count = Object.keys(upgrades).length;
  $(xmlDoc)
    .find("player > mailReceived > string")
    .each(function () {
      id = $(this).text();

      if (upgrades.hasOwnProperty(id)) {
        bought[id] = 1;
        bought_count++;
      }
    });

  if (bought_count < count) {
    var keys = Object.keys(upgrades);
    for (var i = 0; i < count; i++) {
      if (!bought.hasOwnProperty(keys[i])) {
        need[keys[i]] = upgrades[keys[i]].cost;
        cost += upgrades[keys[i]].cost;
      }
    }
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
    " purchased " +
    bought_count +
    " of " +
    count +
    ' Island Upgrades.</span><ul class="ach_list">\n';
  output += "<li>";
  output +=
    bought_count >= count
      ? getMilestoneString("Purchase all upgrades.", 1)
      : getMilestoneString("Purchase all upgrades", 0) +
        (count - bought_count) +
        " more (costs " +
        cost +
        " walnuts)";
  output += "</li></ul></div>";

  if (bought_count < count) {
    meta.hasDetails = true;
    output +=
      '<div class="' + meta.anchor + "_details " + meta.det_class + '">';
    output += '<span class="need">Left to buy:<ol>';
    var val = 0;
    var keys = Object.keys(need);
    for (var i in keys) {
      id = keys[i];
      var extra = "";
      if (need[id] > 1) {
        extra = " -- costs " + need[id] + " walnuts";
      }
      output += "<li>" + upgrades[id].name + extra + "</li>";
    }
    output += "</ol></span></div>";
  }

  output =
    getSectionHeader(saveInfo, title, anchor, meta.hasDetails, version) +
    output +
    getSectionFooter();
  return output;
}
