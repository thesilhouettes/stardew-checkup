// Check for required File API support.
export function checkFileAPI() {
  if (!(window.File && window.FileReader)) {
    document.getElementById("out").innerHTML =
      '<span class="error">Fatal Error: Could not load the File & FileReader APIs</span>';
    return;
  }
}
