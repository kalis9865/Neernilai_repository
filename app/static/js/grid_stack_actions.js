var gridAction = GridStack.init();
gridAction.on('resize', function (e, items) {
  /* items contains info */
  let width = parseInt(items.getAttribute('gs-h')) || 0;

  /**
   * Gridstack's id attribute will not allows to add multiple widgets to same container
   * ----------------------------------------------------------------------------------
   * To identify the resized widget:
   * Getting the content from node info and loading it in dummy container
   * From the dummy container getting the data-display-id which will be same as chart id
   */

  let node = items.gridstackNode;
  $("#dummyContent").html(" ");
  $("#dummyContent").html(node.content);

  var gridStackID = $("#dummyContent > div").data("display-id");
  console.log(gridStackID);
  var gridStackIDInfo = gridStackID.split("_");
  switch (gridStackIDInfo[2]) {
    case "Temperature-Gauge":
      console.log(width);
      $("#"+gridStackID).removeClass("_one");
      $("#"+gridStackID).removeClass("one");
      $("#"+gridStackID).removeClass("two");
      $("#"+gridStackID).removeClass("three");
      $("#"+gridStackID).removeClass("four");
      $("#"+gridStackID).removeClass("five");
      switch (width) {
        case 1:
        case 2:
          $("#"+gridStackID).addClass("_one");
          console.log("AddClass One");
          break;
        case 3:
          $("#"+gridStackID).addClass("_one");
          console.log("AddClass One");
          break;
          break;
        case 4:
          $("#"+gridStackID).addClass("one");
          console.log("AddClass one");
          break;
          break;
        case 5:
          $("#"+gridStackID).addClass("two");
          console.log("AddClass two");
          break;
        default:
          $("#"+gridStackID).addClass("three");
          console.log("AddClass Three");
      }
      break;
    case "Tank-Gauge":
      $("#"+gridStackID).removeClass("one");
      $("#"+gridStackID).removeClass("one_");
      $("#"+gridStackID).removeClass("two");
      $("#"+gridStackID).removeClass("three");
      $("#"+gridStackID).removeClass("four");
      $("#"+gridStackID).removeClass("five");
      switch (width) {
        case 1:
        case 2:
          $("#"+gridStackID).addClass("one");
          break;
        case 3:
          $("#"+gridStackID).addClass("one");
          break;
          break;
        case 4:
          $("#"+gridStackID).addClass("one_");
          break;
          break;
        case 5:
          $("#"+gridStackID).addClass("two");
          break;
        default:
          $(".tank").addClass("three");
      }
      break;
    case "Pressure-Gauge":
      $("#"+gridStackID).removeClass("one");
      $("#"+gridStackID).removeClass("two");
      $("#"+gridStackID).removeClass("three");
      $("#"+gridStackID).removeClass("four");
      $("#"+gridStackID).removeClass("five");
      switch (width) {
        case 1:
        case 2:
          $("#"+gridStackID).addClass("one");
          break;
        case 3:
          $("#"+gridStackID).addClass("one");
          break;
          break;
        case 4:
          $("#"+gridStackID).addClass("two");
          break;
          break;
        case 5:
          $("#"+gridStackID).addClass("three");
          break;
        default:
          $("#"+gridStackID).addClass("four");
      }
      break;
  }

});
