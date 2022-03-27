import $ from "jquery";
export function isValidFarmhand(player) {
  // Had been using a blank userID field to determine that a farmhand slot is empty
  // until a user sent a save where a valid farmhand had no ID. Now using both a blank
  // userID and name field and hoping that it's enough.
  if (
    $(player).children("userID").text() === "" &&
    $(player).children("name").text() === ""
  ) {
    return false;
  }
  return true;
}
