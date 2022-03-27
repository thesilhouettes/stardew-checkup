import $ from "jquery";
import compareSemVer from "semver-compare";
import { capitalize } from "../utils/capitalize";
import { createPlayerList } from "../utils/createPlayerList";
import { getSummaryClass } from "../utils/getClasses";
import { isValidFarmhand } from "../utils/isValidFarmhand";
import { makeAnchor } from "../utils/makeAnchor";
import { getSectionHeader, getSectionFooter } from "../utils/section";
// Individual chunks of save parsing.
// Each receives the xmlDoc object to parse & the saveInfo information structure and returns HTML to output.
// Most also create a meta object which is passed to the per-player info subroutine primarily to find out if
// there are any details so that we know whether to show a button later.
export function parseSummary(xmlDoc, saveInfo) {
  var title = "Summary",
    anchor = makeAnchor(title),
    version = "1.2",
    sum_class = getSummaryClass(saveInfo, version),
    output = "",
    details = "",
    farmTypes = [
      "Standard",
      "Riverland",
      "Forest",
      "Hill-top",
      "Wilderness",
      "Four Corners",
      "Beach",
    ],
    playTime = Number($(xmlDoc).find("player > millisecondsPlayed").text()),
    playHr = Math.floor(playTime / 36e5),
    playMin = Math.floor((playTime % 36e5) / 6e4),
    id = "0",
    name = $(xmlDoc).find("player > name").html(),
    farmer = name,
    farmhands = [];

  // Versioning has changed from bools to numers, to now a semver string.
  saveInfo.version = $(xmlDoc).find("gameVersion").first().text();
  if (saveInfo.version === "") {
    saveInfo.version = "1.2";
    if ($(xmlDoc).find("hasApplied1_4_UpdateChanges").text() === "true") {
      saveInfo.version = "1.4";
    } else if (
      $(xmlDoc).find("hasApplied1_3_UpdateChanges").text() === "true"
    ) {
      saveInfo.version = "1.3";
    }
  }

  // Namespace prefix varies by platform; iOS saves seem to use 'p3' and PC saves use 'xsi'.
  saveInfo.ns_prefix =
    $(xmlDoc).find("SaveGame[xmlns\\:xsi]").length > 0 ? "xsi" : "p3";
  // Farmer, farm, and child names are read as html() because they come from user input and might contain characters
  // which must be escaped.
  saveInfo.players = {};
  saveInfo.children = {};
  if (compareSemVer(saveInfo.version, "1.3") >= 0) {
    id = $(xmlDoc).find("player > UniqueMultiplayerID").text();
  }
  saveInfo.players[id] = name;
  saveInfo.children[id] = [];
  $(xmlDoc)
    .find(
      "[" +
        saveInfo.ns_prefix +
        "\\:type='FarmHouse'] NPC[" +
        saveInfo.ns_prefix +
        "\\:type='Child']"
    )
    .each(function () {
      saveInfo.children[id].push($(this).find("name").html());
    });
  saveInfo.numPlayers = 1;
  // Initializing structures needed for perfectionTracker since a lot of it builds on other milestones
  saveInfo.perfectionTracker = {
    global: {
      "Gold Clock": false,
      "Earth Obelisk": false,
      "Water Obelisk": false,
      "Desert Obelisk": false,
      "Island Obelisk": false,
      Walnuts: { count: 0, total: 130 },
    },
  };
  saveInfo.perfectionTracker[id] = {};

  output = getSectionHeader(saveInfo, title, anchor, false, version);
  output += '<div class="' + anchor + "_summary " + sum_class + '">';
  output +=
    '<span class="result">' +
    $(xmlDoc).find("player > farmName").html() +
    " Farm (" +
    farmTypes[$(xmlDoc).find("whichFarm").text()] +
    ")</span><br />";
  output += '<span class="result">Farmer ' + name;
  $(xmlDoc)
    .find("farmhand")
    .each(function () {
      if (isValidFarmhand(this)) {
        saveInfo.numPlayers++;
        id = $(this).children("UniqueMultiplayerID").text();
        name = $(this).children("name").html();
        farmhands.push(name);
        saveInfo.players[id] = name;
        saveInfo.children[id] = [];
        $(this)
          .parent("indoors[" + saveInfo.ns_prefix + '\\:type="Cabin"]')
          .find("NPC[" + saveInfo.ns_prefix + "\\:type='Child']")
          .each(function () {
            saveInfo.children[id].push($(this).find("name").html());
          });
        saveInfo.perfectionTracker[id] = {};
      }
    });
  if (saveInfo.numPlayers > 1) {
    output += " and Farmhand(s) " + farmhands.join(", ");
    createPlayerList(saveInfo.numPlayers, farmer, farmhands);
  }
  output += "</span><br />";
  // Searching for marriage between players & their children
  saveInfo.partners = {};
  $(xmlDoc)
    .find("farmerFriendships > item")
    .each(function () {
      var item = this;
      if ($(this).find("value > Friendship > Status").text() === "Married") {
        var id1 = $(item).find("key > FarmerPair > Farmer1").text();
        var id2 = $(item).find("key > FarmerPair > Farmer2").text();
        saveInfo.partners[id1] = id2;
        saveInfo.partners[id2] = id1;
      }
    });
  // Dump of most items in ObjectInformation, needed for Bundle processing.
  saveInfo.objects = {
    16: "Wild Horseradish",
    18: "Daffodil",
    20: "Leek",
    22: "Dandelion",
    24: "Parsnip",
    60: "Emerald",
    62: "Aquamarine",
    64: "Ruby",
    66: "Amethyst",
    68: "Topaz",
    69: "Banana Sapling",
    70: "Jade",
    72: "Diamond",
    74: "Prismatic Shard",
    78: "Cave Carrot",
    80: "Quartz",
    82: "Fire Quartz",
    84: "Frozen Tear",
    86: "Earth Crystal",
    88: "Coconut",
    90: "Cactus Fruit",
    91: "Banana",
    92: "Sap",
    93: "Torch",
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
    126: "Strange Doll (Green)",
    127: "Strange Doll (Yellow)",
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
    152: "Seaweed",
    153: "Green Algae",
    154: "Sea Cucumber",
    155: "Super Cucumber",
    156: "Ghostfish",
    157: "White Algae",
    158: "Stonefish",
    159: "Crimsonfish",
    160: "Angler",
    161: "Ice Pip",
    162: "Lava Eel",
    163: "Legend",
    164: "Sandfish",
    165: "Scorpion Carp",
    166: "Treasure Chest",
    167: "Joja Cola",
    168: "Trash",
    169: "Driftwood",
    170: "Broken Glasses",
    171: "Broken CD",
    172: "Soggy Newspaper",
    174: "Large Egg (White)",
    176: "Egg (White)",
    178: "Hay",
    180: "Egg (Brown)",
    182: "Large Egg (Brown)",
    184: "Milk",
    186: "Large Milk",
    188: "Green Bean",
    190: "Cauliflower",
    192: "Potato",
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
    245: "Sugar",
    246: "Wheat Flour",
    247: "Oil",
    248: "Garlic",
    250: "Kale",
    251: "Tea Sapling",
    252: "Rhubarb",
    253: "Triple Shot Espresso",
    254: "Melon",
    256: "Tomato",
    257: "Morel",
    258: "Blueberry",
    259: "Fiddlehead Fern",
    260: "Hot Pepper",
    261: "Warp Totem: Desert",
    262: "Wheat",
    264: "Radish",
    265: "Seafoam Pudding",
    266: "Red Cabbage",
    267: "Flounder",
    268: "Starfruit",
    269: "Midnight Carp",
    270: "Corn",
    271: "Unmilled Rice",
    272: "Eggplant",
    273: "Rice Shoot",
    274: "Artichoke",
    275: "Artifact Trove",
    276: "Pumpkin",
    278: "Bok Choy",
    279: "Magic Rock Candy",
    280: "Yam",
    281: "Chanterelle",
    282: "Cranberries",
    283: "Holly",
    284: "Beet",
    286: "Cherry Bomb",
    287: "Bomb",
    288: "Mega Bomb",
    289: "Ostrich Egg",
    292: "Mahogany Seed",
    293: "Brick Floor",
    296: "Salmonberry",
    297: "Grass Starter",
    298: "Hardwood Fence",
    299: "Amaranth Seeds",
    300: "Amaranth",
    301: "Grape Starter",
    302: "Hops Starter",
    303: "Pale Ale",
    304: "Hops",
    305: "Void Egg",
    306: "Mayonnaise",
    307: "Duck Mayonnaise",
    308: "Void Mayonnaise",
    309: "Acorn",
    310: "Maple Seed",
    311: "Pine Cone",
    322: "Wood Fence",
    323: "Stone Fence",
    324: "Iron Fence",
    325: "Gate",
    328: "Wood Floor",
    329: "Stone Floor",
    330: "Clay",
    331: "Weathered Floor",
    333: "Crystal Floor",
    334: "Copper Bar",
    335: "Iron Bar",
    336: "Gold Bar",
    337: "Iridium Bar",
    338: "Refined Quartz",
    340: "Honey",
    341: "Tea Set",
    342: "Pickles",
    344: "Jelly",
    346: "Beer",
    347: "Rare Seed",
    348: "Wine",
    349: "Energy Tonic",
    350: "Juice",
    351: "Muscle Remedy",
    368: "Basic Fertilizer",
    369: "Quality Fertilizer",
    370: "Basic Retaining Soil",
    371: "Quality Retaining Soil",
    372: "Clam",
    373: "Golden Pumpkin",
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
    395: "Coffee",
    396: "Spice Berry",
    397: "Sea Urchin",
    398: "Grape",
    399: "Spring Onion",
    400: "Strawberry",
    401: "Straw Floor",
    402: "Sweet Pea",
    403: "Field Snack",
    404: "Common Mushroom",
    405: "Wood Path",
    406: "Wild Plum",
    407: "Gravel Path",
    408: "Hazelnut",
    409: "Crystal Path",
    410: "Blackberry",
    411: "Cobblestone Path",
    412: "Winter Root",
    413: "Blue Slime Egg",
    414: "Crystal Fruit",
    415: "Stepping Stone Path",
    416: "Snow Yam",
    417: "Sweet Gem Berry",
    418: "Crocus",
    419: "Vinegar",
    420: "Red Mushroom",
    421: "Sunflower",
    422: "Purple Mushroom",
    423: "Rice",
    424: "Cheese",
    425: "Fairy Seeds",
    426: "Goat Cheese",
    427: "Tulip Bulb",
    428: "Cloth",
    429: "Jazz Seeds",
    430: "Truffle",
    431: "Sunflower Seeds",
    432: "Truffle Oil",
    433: "Coffee Bean",
    436: "Goat Milk",
    437: "Red Slime Egg",
    438: "L. Goat Milk",
    439: "Purple Slime Egg",
    440: "Wool",
    441: "Explosive Ammo",
    442: "Duck Egg",
    444: "Duck Feather",
    445: "Caviar",
    446: "Rabbit's Foot",
    447: "Aged Roe",
    453: "Poppy Seeds",
    454: "Ancient Fruit",
    455: "Spangle Seeds",
    456: "Algae Soup",
    457: "Pale Broth",
    459: "Mead",
    463: "Drum Block",
    464: "Flute Block",
    465: "Speed-Gro",
    466: "Deluxe Speed-Gro",
    472: "Parsnip Seeds",
    473: "Bean Starter",
    474: "Cauliflower Seeds",
    475: "Potato Seeds",
    476: "Garlic Seeds",
    477: "Kale Seeds",
    478: "Rhubarb Seeds",
    479: "Melon Seeds",
    480: "Tomato Seeds",
    481: "Blueberry Seeds",
    482: "Pepper Seeds",
    483: "Wheat Seeds",
    484: "Radish Seeds",
    485: "Red Cabbage Seeds",
    486: "Starfruit Seeds",
    487: "Corn Seeds",
    488: "Eggplant Seeds",
    489: "Artichoke Seeds",
    490: "Pumpkin Seeds",
    491: "Bok Choy Seeds",
    492: "Yam Seeds",
    493: "Cranberry Seeds",
    494: "Beet Seeds",
    495: "Spring Seeds",
    496: "Summer Seeds",
    497: "Fall Seeds",
    498: "Winter Seeds",
    499: "Ancient Seeds",
    535: "Geode",
    536: "Frozen Geode",
    537: "Magma Geode",
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
    591: "Tulip",
    593: "Summer Spangle",
    595: "Fairy Rose",
    597: "Blue Jazz",
    599: "Sprinkler",
    604: "Plum Pudding",
    605: "Artichoke Dip",
    606: "Stir Fry",
    607: "Roasted Hazelnuts",
    608: "Pumpkin Pie",
    609: "Radish Salad",
    610: "Fruit Salad",
    611: "Blackberry Cobbler",
    612: "Cranberry Candy",
    613: "Apple",
    614: "Green Tea",
    618: "Bruschetta",
    621: "Quality Sprinkler",
    628: "Cherry Sapling",
    629: "Apricot Sapling",
    630: "Orange Sapling",
    631: "Peach Sapling",
    632: "Pomegranate Sapling",
    633: "Apple Sapling",
    634: "Apricot",
    635: "Orange",
    636: "Peach",
    637: "Pomegranate",
    638: "Cherry",
    645: "Iridium Sprinkler",
    648: "Coleslaw",
    649: "Fiddlehead Risotto",
    651: "Poppyseed Muffin",
    680: "Green Slime Egg",
    681: "Rain Totem",
    682: "Mutant Carp",
    684: "Bug Meat",
    685: "Bait",
    686: "Spinner",
    687: "Dressed Spinner",
    688: "Warp Totem: Farm",
    689: "Warp Totem: Mountains",
    690: "Warp Totem: Beach",
    691: "Barbed Hook",
    692: "Lead Bobber",
    693: "Treasure Hunter",
    694: "Trap Bobber",
    695: "Cork Bobber",
    698: "Sturgeon",
    699: "Tiger Trout",
    700: "Bullhead",
    701: "Tilapia",
    702: "Chub",
    703: "Magnet",
    704: "Dorado",
    705: "Albacore",
    706: "Shad",
    707: "Lingcod",
    708: "Halibut",
    709: "Hardwood",
    710: "Crab Pot",
    715: "Lobster",
    716: "Crayfish",
    717: "Crab",
    718: "Cockle",
    719: "Mussel",
    720: "Shrimp",
    721: "Snail",
    722: "Periwinkle",
    723: "Oyster",
    724: "Maple Syrup",
    725: "Oak Resin",
    726: "Pine Tar",
    727: "Chowder",
    728: "Fish Stew",
    729: "Escargot",
    730: "Lobster Bisque",
    731: "Maple Bar",
    732: "Crab Cakes",
    733: "Shrimp Cocktail",
    734: "Woodskip",
    745: "Strawberry Seeds",
    746: "Jack-O-Lantern",
    747: "Rotten Plant",
    748: "Rotten Plant",
    749: "Omni Geode",
    766: "Slime",
    767: "Bat Wing",
    768: "Solar Essence",
    769: "Void Essence",
    770: "Mixed Seeds",
    771: "Fiber",
    772: "Oil of Garlic",
    773: "Life Elixir",
    774: "Wild Bait",
    775: "Glacierfish",
    787: "Battery Pack",
    795: "Void Salmon",
    796: "Slimejack",
    797: "Pearl",
    798: "Midnight Squid",
    799: "Spook Fish",
    800: "Blobfish",
    802: "Cactus Seeds",
    805: "Tree Fertilizer",
    807: "Dinosaur Mayonnaise",
    812: "Roe",
    814: "Squid Ink",
    815: "Tea Leaves",
    820: "Fossilized Skull",
    821: "Fossilized Spine",
    822: "Fossilized Tail",
    823: "Fossilized Leg",
    824: "Fossilized Ribs",
    825: "Snake Skull",
    826: "Snake Vertebrae",
    827: "Mummified Bat",
    828: "Mummified Frog",
    829: "Ginger",
    830: "Taro Root",
    831: "Taro Tuber",
    832: "Pineapple",
    833: "Pineapple Seeds",
    834: "Mango",
    835: "Mango Sapling",
    836: "Stingray",
    837: "Lionfish",
    838: "Blue Discus",
    840: "Rustic Plank Floor",
    841: "Stone Walkway Floor",
    848: "Cinder Shard",
    851: "Magma Cap",
    852: "Dragon Tooth",
    856: "Curiosity Lure",
    857: "Tiger Slime Egg",
    872: "Fairy Dust",
    873: "Piña Colada",
    874: "Bug Steak",
    877: "Quality Bobber",
    879: "Monster Musk",
    881: "Bone Fragment",
    885: "Fiber Seeds",
    886: "Warp Totem: Island",
    889: "Qi Fruit",
    890: "Qi Bean",
    891: "Mushroom Tree Seed",
    892: "Warp Totem: Qi's Arena",
    893: "Fireworks (Red)",
    894: "Fireworks (Purple)",
    895: "Fireworks (Green)",
    896: "Galaxy Soul",
    898: "Son of Crimsonfish",
    899: "Ms. Angler",
    900: "Legend II",
    901: "Radioactive Carp",
    902: "Glacierfish Jr.",
    903: "Ginger Ale",
    904: "Banana Pudding",
    905: "Mango Sticky Rice",
    906: "Poi",
    907: "Tropical Curry",
    908: "Magic Bait",
    909: "Radioactive Ore",
    910: "Radioactive Bar",
    911: "Horse Flute",
    913: "Enricher",
    915: "Pressure Nozzle",
    917: "Qi Seasoning",
    918: "Hyper Speed-Gro",
    919: "Deluxe Fertilizer",
    920: "Deluxe Retaining Soil",
    921: "Squid Ink Ravioli",
    926: "Cookout Kit",
    928: "Golden Egg",
  };
  // Date originally used XXForSaveGame elements, but those were not always present on saves downloaded from upload.farm
  output +=
    '<span class="result">Day ' +
    Number($(xmlDoc).find("dayOfMonth").text()) +
    " of " +
    capitalize($(xmlDoc).find("currentSeason").html()) +
    ", Year " +
    Number($(xmlDoc).find("year").text()) +
    "</span><br />";
  output += '<span class="result">Played for ';
  if (playHr === 0 && playMin === 0) {
    output += "less than 1 minute";
  } else {
    if (playHr > 0) {
      output += playHr + " hr ";
    }
    if (playMin > 0) {
      output += playMin + " min ";
    }
  }
  output += "</span><br />";
  var version_num = saveInfo.version;
  output +=
    '<span class="result">Save is from version ' +
    version_num +
    "</span><br /></div>";
  output += getSectionFooter();
  return output;
}
