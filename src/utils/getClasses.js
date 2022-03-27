import compareSemVer from "semver-compare";
export function getSummaryClass(saveInfo, version) {
  // Relatively simple conditional checks that need to be done a whole lot
  var prefs =
    compareSemVer(version, "1.5") < 0
      ? saveInfo.outputPrefOld
      : saveInfo.outputPrefNew;
  var sum_class = "initial_hide";
  if (prefs === "show_all" || prefs === "hide_details") {
    sum_class = "initial_show";
  }
  return sum_class;
}

export function getDetailsClass(saveInfo, version) {
  // Relatively simple conditional checks that need to be done a whole lot
  var prefs =
    compareSemVer(version, "1.5") < 0
      ? saveInfo.outputPrefOld
      : saveInfo.outputPrefNew;
  var det_class = "initial_show";
  if (prefs === "hide_all" || prefs === "hide_details") {
    det_class = "initial_hide";
  }
  return det_class;
}
