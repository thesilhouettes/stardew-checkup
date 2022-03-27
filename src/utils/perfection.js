export function getPerfectionPctString(pct, max, desc, yes) {
  var pts = max * pct;
  var places = 2;
  if (pct < 0.0001 || pct > 0.9999) {
    places = 0;
  }
  pts = pts.toFixed(places);
  var pretty_pct = 100 * pct;
  pretty_pct = pretty_pct.toFixed(Math.max(0, places - 1));
  return yes
    ? '<span class="pt_yes"><span class="pts">' +
        pts +
        "%</span> from completion of " +
        desc +
        "</span>"
    : '<span class="pt_no"><span class="pts"> ' +
        pts +
        "%</span> (of " +
        max +
        "% possible) from " +
        desc +
        " (" +
        pretty_pct +
        "%)</span>";
}

export function getPerfectionNumString(num, max, desc, yes) {
  var pts = num;
  var pretty_pct = num + "/" + max;
  return yes
    ? '<span class="pt_yes"><span class="pts">' +
        pts +
        "%</span> from completion of " +
        desc +
        "</span>"
    : '<span class="pt_no"><span class="pts"> ' +
        pts +
        "%</span> (of " +
        max +
        "% possible) from " +
        desc +
        " (" +
        pretty_pct +
        ")</span>";
}

export function getPerfectionPctNumString(pct, max, count, desc, yes) {
  var pts = max * pct;
  var places = 2;
  if (pct < 0.0001 || pct > 0.9999) {
    places = 0;
  }
  pts = pts.toFixed(places);
  var pretty_pct =
    Math.round(count * pct) +
    "/" +
    count +
    " or " +
    Number(100 * pct).toFixed(Math.max(0, places - 1)) +
    "%";
  return yes
    ? '<span class="pt_yes"><span class="pts">' +
        pts +
        "%</span> from completion of " +
        desc +
        "</span>"
    : '<span class="pt_no"><span class="pts"> ' +
        pts +
        "%</span> (of " +
        max +
        "% possible) from " +
        desc +
        " (" +
        pretty_pct +
        ")</span>";
}

export function getPerfectionBoolString(max, desc, yes) {
  return yes
    ? '<span class="pt_yes"><span class="pts">' +
        max +
        "%</span> from completion of " +
        desc +
        "</span>"
    : '<span class="pt_no"><span class="pts"> 0%</span> (of ' +
        max +
        "% possible) from " +
        desc +
        "</span>";
}
