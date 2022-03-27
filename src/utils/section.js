import compareSemVer from "semver-compare";

export function getSectionHeader(
  saveInfo,
  title,
  anchor,
  showDetailsButton,
  version
) {
  // Sets up title and buttons which control the collapsible output
  // showDetailsButton is a bool so that we don't have a control for empty details
  // version is when that section was added and is used for old vs new interpretation
  //   version 1.2 is the baseline value for most original sections
  //   "old" currently means before version 1.5 and "new" is 1.5 & later
  var prefs =
    compareSemVer(version, "1.5") < 0
      ? saveInfo.outputPrefOld
      : saveInfo.outputPrefNew;

  var output =
    '<div class="collapsible" id="wrap_' + anchor + '"><h3>' + title + "</h3>";
  var sum_button, sum_class, det_button, det_class;

  if (prefs === "show_all" || prefs === "hide_details") {
    sum_button = "Hide Summary";
  } else {
    sum_button = "Show Summary";
  }
  if (prefs === "hide_all" || prefs === "hide_details") {
    det_button = "Show Details";
  } else {
    det_button = "Hide Details";
  }

  // Supporting sections that don't have details also should not have the button. We'll leave the empty div alone
  var button_element = "(No Details)";
  if (showDetailsButton) {
    button_element =
      '<button id="toggle_' +
      anchor +
      '_details" type="button" data-target="' +
      anchor +
      '_details">' +
      det_button +
      "</button>";
  }

  output +=
    ' <button id="toggle_' +
    anchor +
    '_summary" type="button" data-target="' +
    anchor +
    '_summary">' +
    sum_button +
    "</button> " +
    button_element;
  return output;
}

export function getSectionFooter() {
  // Companion to getSectionHeader() that mainly exists so that we close all the things the header opened
  // Currently almost pointless but better base for future expansion.
  return "</div>";
}
