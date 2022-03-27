import $ from "jquery";
import Cookies from "js-cookie";
import { parseSummary } from "../parse/summary";
import { parseMonsters } from "../parse/monsters";
import { parseMoney } from "../parse/money";
import { parseSkills } from "../parse/skills";
import { parseStardrops } from "../parse/stardrops";
import { parseFamily } from "../parse/family";
import { parseSocial } from "../parse/social";
import { parseCooking } from "../parse/cooking";
import { parseCrafting } from "../parse/crafting";
import { parseFishing } from "../parse/fishing";
import { parseBasicShipping } from "../parse/basicShipping";
import { parseJournalScraps } from "../parse/journalScraps";
import { parseIslandUpgrades } from "../parse/islandUpgrads";
import { parsePerfectionTracker } from "../parse/playerPerfection";
import { parseWalnuts } from "../parse/walnuts";
import { parseSpecialOrders } from "../parse/specialOrders";
import { parseGrandpa } from "../parse/grandpa";
import { parseSecretNotes } from "../parse/secretNotes";
import { parseBundles } from "../parse/bundles";
import { parseCropShipping } from "../parse/cropShipping";
import { parseMuseum } from "../parse/museum";
import { parseQuests } from "../parse/quests";
import { createTOC } from "./createTOC";
import { toggleVisible } from "./toggleVisible";

export function handleFileSelect(evt) {
  var file = evt.target.files[0],
    reader = new FileReader(),
    prog = document.getElementById("progress");

  prog.value = 0;
  $("#output-container").hide();
  $("#progress-container").show();
  $("#changelog").hide();
  $("#PlayerList").hide();
  reader.onloadstart = function (e) {
    prog.value = 20;
  };
  reader.onprogress = function (e) {
    if (e.lengthComputable) {
      var p = 20 + (e.loaded / e.total) * 60;
      prog.value = p;
    }
  };
  reader.onload = function (e) {
    var output = "",
      xmlDoc = $.parseXML(e.target.result),
      saveInfo = {};

    saveInfo.outputPrefOld = "hide_details";
    var opt = document.getElementsByName("opt-old");
    if (opt !== null) {
      for (var i = 0; i < opt.length; i++) {
        if (opt[i].checked) {
          saveInfo.outputPrefOld = opt[i].value;
          Cookies.set("checkup-opt-old", opt[i].value, {
            expires: 365,
            path: "",
          });
          break;
        }
      }
    }
    saveInfo.outputPrefNew = "hide_all";
    var opt = document.getElementsByName("opt-new");
    if (opt !== null) {
      for (var i = 0; i < opt.length; i++) {
        if (opt[i].checked) {
          saveInfo.outputPrefNew = opt[i].value;
          Cookies.set("checkup-opt-new", opt[i].value, {
            expires: 365,
            path: "",
          });
          break;
        }
      }
    }

    output += parseSummary(xmlDoc, saveInfo);
    output += parseMoney(xmlDoc, saveInfo);
    output += parseSkills(xmlDoc, saveInfo);
    output += parseQuests(xmlDoc, saveInfo);
    output += parseMonsters(xmlDoc, saveInfo);
    output += parseStardrops(xmlDoc, saveInfo);
    output += parseFamily(xmlDoc, saveInfo);
    output += parseSocial(xmlDoc, saveInfo);
    output += parseCooking(xmlDoc, saveInfo);
    output += parseCrafting(xmlDoc, saveInfo);
    output += parseFishing(xmlDoc, saveInfo);
    output += parseBasicShipping(xmlDoc, saveInfo);
    output += parseCropShipping(xmlDoc, saveInfo);
    output += parseMuseum(xmlDoc, saveInfo);
    output += parseSecretNotes(xmlDoc, saveInfo);
    output += parseBundles(xmlDoc, saveInfo);
    output += parseGrandpa(xmlDoc, saveInfo);
    output += parseSpecialOrders(xmlDoc, saveInfo);
    output += parseJournalScraps(xmlDoc, saveInfo);
    output += parseWalnuts(xmlDoc, saveInfo);
    output += parseIslandUpgrades(xmlDoc, saveInfo);
    output += parsePerfectionTracker(xmlDoc, saveInfo);

    // End of checks
    prog.value = 100;

    document.getElementById("out").innerHTML = output;

    // Now that output has been added to the page, we need to add the output-toggling to each section
    $("#output-container .collapsible").each(function () {
      $(this).children("button").click(toggleVisible);
    });

    $("#output-container").show();
    $("#progress-container").hide();
    createTOC();
    $("#TOC").show();
  };
  reader.readAsText(file);
}
