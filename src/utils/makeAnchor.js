export function makeAnchor(text) {
  // forces lower-case and converts non-alpha characters to underscore for simple ID attributes
  var id = text;
  id.toLowerCase();
  return id.replace(/[^\w*]/g, "_");
}
