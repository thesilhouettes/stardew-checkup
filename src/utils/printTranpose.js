export function printTranspose(table) {
  var output = '<table class="output">',
    id;
  for (var r = 0; r < table[0].length; r++) {
    output += "<tr>";
    for (var c = 0; c < table.length; c++) {
      id = "PL_" + (c + 1);
      output += '<td class="' + id + '">' + table[c][r] + "</td>";
    }
    output += "</tr>";
  }
  output += "</table>";
  return output;
}
