export function getPointString(pts, desc, cum, yes) {
  var c = cum ? " more" : "";
  return yes
    ? '<span class="pt_yes"><span class="pts">+' +
        pts +
        c +
        "</span> earned (" +
        desc +
        ")</span>"
    : '<span class="pt_no"><span class="pts"> (' +
        pts +
        c +
        ")</span> possible (" +
        desc +
        ")</span>";
}

export function getPointImpossibleString(pts, desc) {
  return (
    '<span class="pt_imp"><span class="pts">+' +
    pts +
    "</span> impossible (" +
    desc +
    ")</span>"
  );
}
