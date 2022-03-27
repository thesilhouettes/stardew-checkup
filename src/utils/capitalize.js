export function capitalize(s) {
  // joelvh @ https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
  return s && s[0].toUpperCase() + s.slice(1);
}
