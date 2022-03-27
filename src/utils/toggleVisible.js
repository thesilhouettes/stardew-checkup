import $ from "jquery";
export function toggleVisible(evt) {
  var e = evt.target;
  var text = $(e).html();
  var theClass = "." + $(e).attr("data-target");
  $(theClass).each(function () {
    if ($(this).is(":visible")) {
      $(this).hide();
      $(e).html(text.replace("Hide", "Show"));
    } else {
      $(this).show();
      $(e).html(text.replace("Show", "Hide"));
    }
  });
}
