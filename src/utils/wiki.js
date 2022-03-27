export function wikify(item, page, no_anchor) {
  // removing egg colors & changing spaces to underscores
  var trimmed = item.replace(" (White)", "");
  trimmed = trimmed.replace(" (Brown)", "");
  trimmed = trimmed.replace(/#/g, ".23");
  trimmed = trimmed.replace(/ /g, "_");
  if (page) {
    return no_anchor
      ? '<a href="http://stardewvalleywiki.com/' + page + '">' + item + "</a>"
      : '<a href="http://stardewvalleywiki.com/' +
          page +
          "#" +
          trimmed +
          '">' +
          item +
          "</a>";
  } else {
    return (
      '<a href="http://stardewvalleywiki.com/' + trimmed + '">' + item + "</a>"
    );
  }
}

export function wikimap(item, index, arr) {
  // Wrapper to allow wikify to be used within an array map without misinterpreting the 2nd and 3rd arguments.
  return wikify(item);
}
