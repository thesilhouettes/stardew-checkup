export function getAchieveString(name, desc, yes) {
  if (desc.length > 0) {
    desc = "(" + desc + ") ";
  }
  return yes
    ? '<span class="ach_yes"><span class="ach">' +
        name +
        "</span> " +
        desc +
        " done</span>"
    : '<span class="ach_no"><span class="ach">' +
        name +
        "</span> " +
        desc +
        "</span> -- need ";
}

export function getAchieveImpossibleString(name, desc) {
  if (desc.length > 0) {
    desc = "(" + desc + ") ";
  }
  return (
    '<span class="ach_imp"><span class="ach">' +
    name +
    "</span> " +
    desc +
    " impossible</span>"
  );
}
