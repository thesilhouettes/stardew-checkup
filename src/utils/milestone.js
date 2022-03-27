export function getMilestoneString(desc, yes) {
  return yes
    ? '<span class="ms_yes">' + desc + "</span>"
    : '<span class="ms_no">' + desc + "</span> -- need ";
}
