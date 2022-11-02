let edit_grid = GridStack.init({
      cellHeight: 70,
      acceptWidgets: true,
      dragIn: '.newWidget',  // class that can be dragged from outside
      dragInOptions: { revert: 'invalid', scroll: false, appendTo: 'body', helper: 'clone' }, // clone or can be your function
      removable: '.trashedit' // drag-out delete class
    });

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

function getAllDevices(){

  const selectedDashboardID = getUrlParameter('id');

  // Getting Header section dropdown values
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "device",
      action: "get"
    },
    success: function(response) {
      var result = JSON.parse(response);
      var deviceOptions = "";
      deviceOptions += "<option value='select'>Select Device</option>";
      if (result.is_error == 0) {
        $.each(result.devices, function(index, value) {
          deviceOptions += "<option  data-mac='"+ value["mac_id"] +"'  value='" + value["device_id"] + "'>" + value["device_name"] + "</option>";
        });
        $('#editSelectDevice').html(deviceOptions);
      }
    }
  });

  // Getting Selected Dashboard Content
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "create_dashboard",
      action: "get_item",
      dashboard_id:selectedDashboardID
    },
    success: function(response) {
      var result = JSON.parse(response);

      if(result.is_error==0){
        $("h6.dashboard_title").html(result.dashboard["dashboard_name"]);
        $('#editDashboardName').val(result.dashboard["dashboard_name"]);
        $('#editDashboardID').val(result.dashboard["dashboard_id"]);

        var serializedData = result.dashboard["layout"];
        edit_grid.removeAll();
        edit_grid.load(serializedData, true);
        console.log("serializedData data loaded");

        loadBarChart("");
        loadLineChart("");
      }
    }
  });

}

// Edit Modal : Get Available Sensors for device //
$("#editSelectDevice").on('change', function(e) {
  var firstDeviceSensors = "";
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "device",
      action: "get_item",
      device_id: $(this).val()
    },
    success: function(response) {
      var result = JSON.parse(response);
      firstDeviceSensors = "";
      firstDeviceSensors += "<option value='select'>Select Sensor</option>";
      $.each(result.device["sensors"], function(key, value) {
        firstDeviceSensors += '<option value="'+value["id"]+'">'+value["name"]+'</option>';
      });
      $('#editSelectSensor').html(firstDeviceSensors);
    }
  });
});




// Edit Modal : Get Available widgets for sensor //
$("#editSelectSensor").on('change', function(e) {
  var tempWidgetTypes = widgetTypes;
  var options = "";
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "widget",
      action: "get_widget",
      sensor_id: $(this).val()
    },
    success: function(response) {
      var result = JSON.parse(response);
      options = "";
      options += "<option value='select'>Select Widget</option>";
      $.each(result.info, function(key, value) {
        options += "<option value='" + value["id"] + "'>" + value["type"] + "</option>";
      });
      $('#editChartType').html(options);
    }
  });
});



// Add Grid Stack Item //
$("#editNewStack").on("click", function() {

  let selectedDeviceVal = $("#editSelectDevice option:selected").val();
  let selectSensorVal = $("#editSelectSensor option:selected").val();
  let chartTypeVal = $("#editChartType option:selected").val();
  if(selectedDeviceVal=="select" || selectSensorVal=="select" || chartTypeVal=="select"){
      return;
  }

  var si_unit;
  var widgetIdPrefix = $("#editSelectDevice option:selected").data('mac');
  var title = $("#editSelectDevice option:selected").text() + ":";
  widgetIdPrefix += "_"+$("#editSelectSensor option:selected").text();
  switch ($("#editSelectSensor").val()) {
    case "1":
    // case "ambient":
      title += " Dissolved Oxygen (&percnt;)";
      si_unit = "\u0025";
      //widgetIdPrefix += "_ambientLight";
      break;
    case "2":
    // case "co2":
      title += " Dissolved Solids (mg/L)";
      si_unit = "mg/L";
      //widgetIdPrefix += "_co2";
      break;
    case "3":
    // case "level":
      title += " Humidity (&percnt;)";
      si_unit = "\u0025";
      //widgetIdPrefix += "_level";
      break;
    case "4":
    // case "pressure":
      title += " pH";
      si_unit = "pH";
      //widgetIdPrefix += "_pressure";
      break;
    case "5":
    // case "temp":
      title += " Temperature (&#176;C)";
      si_unit = "\u2103";
      //widgetIdPrefix += "_temperature";
      break;
    case "6":
      title += " Water Level (ft)";
      si_unit = "ft";
      break;
    case "7":
      title += " Water Current (cm)";
      si_unit = "cm";
      break;
    case "8":
      title += " Wind Speed (kt)";
      si_unit = "kt";
      break;
    default:
  }

  var serializedData;
  widgetIdPrefix += "_"+$("#editChartType option:selected").text();
  switch ($("#editChartType :selected").val()) {
    case "2":
      serializedData = [{
        "w": 6,
        "h": 5,
        "minW": 3,
        "minH": 2,
        "x": 0,
        "y": 0,
        "content": "<div data-display-id='" + widgetIdPrefix + "' class='newdashboard card shadow h-100'><div class='card-header py-3'><h6 class='m-0 font-weight-bold text-primary'>" + title + "</h6></div> <div class='card-body'><div class='no-gutters align-items-center h-100'>   <div class='col mr-2 h-100'><div class='chart-area h-100'><div class='chartjs-size-monitor'><div class='chartjs-size-monitor-expand'><div class=''></div></div><div class='chartjs-size-monitor-shrink'><div class=''></div></div></div><div class='chartjs-size-monitor'><div class='chartjs-size-monitor-expand'><div class=''></div></div><div class='chartjs-size-monitor-shrink'><div class=''></div></div></div><canvas id='" + widgetIdPrefix + "' style='display: block; height: 320px; width: 506px;' class='lineChart chartjs-render-monitor' width='759' height='480'></canvas></div></div></div></div></div>"
      }];
      break;
    case "1":
      serializedData = [{
        "w": 6,
        "h": 5,
        "minW": 3,
        "minH": 2,
        "x": 0,
        "y": 0,
        "content": "<div data-display-id='" + widgetIdPrefix + "' class='newdashboard card shadow h-100'><div class='card-header py-3'><h6 class='m-0 font-weight-bold text-primary'>" + title + "</h6></div> <div class='card-body'><div class='no-gutters align-items-center h-100'>   <div class='col mr-2 h-100'><div class='chart-area h-100'><div class='chartjs-size-monitor'><div class='chartjs-size-monitor-expand'><div class=''></div></div><div class='chartjs-size-monitor-shrink'><div class=''></div></div></div><div class='chartjs-size-monitor'><div class='chartjs-size-monitor-expand'><div class=''></div></div><div class='chartjs-size-monitor-shrink'><div class=''></div></div></div><canvas id='" + widgetIdPrefix + "' style='display: block; height: 320px; width: 506px;' class='barChart chartjs-render-monitor' width='759' height='480'></canvas></div></div></div></div></div>"
      }];
      break;
    case "5":
      serializedData = [{
        "w": 3,
        "h": 5,
        "maxW": 7,
        "minW": 2,
        "maxH": 7,
        "minH": 3,
        "x": 0,
        "y": 0,
        "content": "<div data-display-id='" + widgetIdPrefix + "' class='thermometer newdashboard card shadow h-100 '><div class='card-header py-3'><h6 class='m-0 font-weight-bold text-primary'>" + title + "<span class='"+widgetIdPrefix+"_readings'></span></h6></div><div class='card-body'><div class='row no-gutters h-100 align-items-center'><div class='col mr-2 mx-auto'><div class='col-lg-12 text-center'><h6>Max:100</h6></div><div id='" + widgetIdPrefix + "' class='industrial thermometer guage1 size two mx-auto'> <span class='ticks' data-amount='10'><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div><div class='tick' style='height: 3%; margin-bottom: 114.328%;'></div></span><div class='space' style='height: 7%;'></div><div class='meter warning'></div></div><div class='col-lg-12 text-center'><h6>Min:0</h6></div></div> </div></div></div>"
      }];
      break;
    case "4":
      serializedData = [{
        "w": 4,
        "h": 5,
        "maxW": 7,
        "minW": 3,
        "maxH": 7,
        "minH": 3,
        "x": 0,
        "y": 0,
        "content": "<div data-display-id='" + widgetIdPrefix + "' class='newdashboard card shadow h-100'><div class='card-header py-3'><h6 class='m-0 font-weight-bold text-primary'>" + title + "<span class='"+widgetIdPrefix+"_readings'></span></h6></div><div class='card-body'><div class='row no-gutters h-100 align-items-center'><div class='col mr-2 mx-auto'><div class='col-lg-12 text-center'><h6>Max:100</h6></div><div id='" + widgetIdPrefix + "' class='industrial tank size two mx-auto'><span class='ticks' data-amount='10'><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div><div class='tick' style='height: 3%; margin-bottom: 87.8704%;'></div></span><div class='space'></div><div class='meter info'></div></div><div class='col-lg-12 text-center'><h6>Min:0</h6></div></div></div></div></div>"
      }];
      break;
    case "3":
      serializedData = [{
        "w": 5,
        "h": 5,
        "maxW": 7,
        "minW": 4,
        "maxH": 5,
        "minH": 3,
        "x": 0,
        "y": 0,
        "content": "<div data-display-id='" + widgetIdPrefix + "' class='newdashboard card shadow h-100 '><div class='card-header py-3'><h6 class='m-0 font-weight-bold text-primary'>" + title + "<span class='"+widgetIdPrefix+"_readings'></span></h6></div><div class='card-body'><div class='row no-gutters h-100 align-items-center'><div class='col mr-2 mx-auto'><div  id='" + widgetIdPrefix + "' class='industrial gauge gpressure size two mx-auto'><span class='ticks' data-amount='10' data-scale-freq='1'><div class='tick' style='width: 2.5%;'></div><div class='tick' style='width: 2.5%; top: -100%; transform: rotate(-70deg);'><span class='scale'>0</span></div><div class='tick' style='width: 2.5%; top: -200%; transform: rotate(-54.4444deg);'><span class='scale'>11</span></div><div class='tick' style='width: 2.5%; top: -300%; transform: rotate(-38.8889deg);'><span class='scale'>22</span></div><div class='tick' style='width: 2.5%; top: -400%; transform: rotate(-23.3333deg);'><span class='scale'>33</span></div><div class='tick' style='width: 2.5%; top: -500%; transform: rotate(-7.77778deg);'><span class='scale'>44</span></div><div class='tick' style='width: 2.5%; top: -600%; transform: rotate(7.77778deg);'><span class='scale'>55</span></div><div class='tick' style='width: 2.5%; top: -700%; transform: rotate(23.3333deg);'><span class='scale'>66</span></div><div class='tick' style='width: 2.5%; top: -800%; transform: rotate(38.8889deg);'><span class='scale'>77</span></div><div class='tick' style='width: 2.5%; top: -900%; transform: rotate(54.4444deg);'><span class='scale'>88</span></div><div class='tick' style='width: 2.5%; top: -1000%; transform: rotate(70deg);'><span class='scale'>100</span></div></span><div class='space'></div><div class='meter'></div></div><div class='row'><div class='col-lg-6 text-center'><h6>Min:0</h6></div><div class='col-lg-6 text-center'><h6>Max:100</h6></div></div></div></div></div></div>"
      }];
      break;
  }
  if ($("#" + widgetIdPrefix).length > 0) {
    flash.error("Widget Already Exist!");
  } else {
    let options = {
      removable: '.trashedit'
    };
    edit_grid.load(serializedData, true); // update things
    edit_grid.compact();
    // Initialize Chart //
    switch ($("#editChartType :selected").val()) {
      case "2":
        loadLineChart(si_unit);
        break;
      case "1":
        loadBarChart(si_unit);
        break;
    }
  }
});

// Compacting the layout
$("#editCompactLayout").on('click', function(e) {
  edit_grid.compact();
});


// Dashboard Save
$("#updateDashBoard").on('click', function(e) {
  if ($("#editDashboardName").val() == "") {
    flash.error("Invalid waterbody, Name is missing.");
  } else {

    //serializedFull = edit_grid.save(true, true);
    //serializedData = serializedFull.children;
	serializedData = edit_grid.save();

    if (serializedData.length == 0) {
      flash.error("Waterbody cannot be empty! Please add atleast one widget.");
    } else {
      var uids = [];
      var finalOutput = [];
      $('.newdashboard').each(function() {
        uids.push($(this).data("display-id"));
      });
      uids.sort();
      var uniqueArray = [];
      var currentSensors = [];
      var checks = [];
      var ids = [];
      $.each(uids, function(key, value) {
        var uid = value.split("_");
        var deviceID = uid[0];
        var currentWidgets = [];

        $.each(uids, function(index1, value1) {
          var tempVal1 = value1.split("_");
          if (value1.indexOf(uid[0] + "_" + uid[1]) >= 0 && deviceID == tempVal1[0]) {
            var sensorID = tempVal1[1];
            currentWidgets.push(tempVal1[2]);
          }
        });
        currentSensors.push({
          device: deviceID,
          name: uid[1],
          widgets: currentWidgets
        });

        if ($.inArray(deviceID, ids) == -1) {
          ids.push(deviceID);
        }

      });

      $.each(currentSensors, function(key, val) {
        var checkKey = val.device + "_" + val.name;
        if ($.inArray(checkKey, checks) == -1) {
          checks.push(checkKey);
          uniqueArray.push(val);
        }

      });

      $.each(ids, function(x, y) {
        var finaldevice = y;
        var finalSensors = [];
        $.each(uniqueArray, function(x1, y1) {
          if (y1.device == finaldevice) {

            delete y1['device'];
            finalSensors.push(y1);
          }
        });
        finalOutput.push({
          device_id: finaldevice,
          sensors: finalSensors
        });
      });
      //console.log(JSON.stringify(finalOutput));

      var name = $("#editDashboardName").val();
      var dashboardID = $("#editDashboardID").val();
      var layout = serializedData;
      var sensor_info = JSON.stringify(finalOutput);
      console.log(sensor_info);
      console.log(layout);
      console.log(name);
      $.ajax({
        type: "POST",
        url: "/root",
        data: {
          csrfmiddlewaretoken: getCookie("csrftoken"),
          page: "create_dashboard",
          action: "update",
          sensor_info: sensor_info,
          layout: JSON.stringify(layout),
          dashboard_name: name,
          dashboard_id : dashboardID
        },
        success: function(response) {
          var result = JSON.parse(response);
          if (result.is_error == 1) {
            flash.error(result.message);
          } else {
            flash.success(result.message);
            var url = "/createdashboard";
            // document.location.href = url;
          }
        }
      });
    }
  }
});



// Number formatter for charts plugin //
function number_format(number, decimals, dec_point, thousands_sep) {
    // *   example: number_format(1234.56, 2, ',', ' ');
    // *   return: '1 234,56'
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
      dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
      s = '',
      toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.round(n * k) / k;
      };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
  }

// Initializing the Empty Line chart while adding new widget //

function loadLineChart(si_unit) {
  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  let lineXaxis = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  let lineYaxis = [];
  // Area Chart Example
  // var ctx = document.getElementById("myAreaChart");
  // var ctx = document.getElementById("myAreaChart");
  var ctx = document.getElementsByClassName("lineChart");
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: lineXaxis,
      datasets: [{
        label: "Temp",
        lineTension: 0.3,
        backgroundColor: "rgba(78, 115, 223, 0.05)",
        borderColor: "rgba(78, 115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78, 115, 223, 1)",
        pointBorderColor: "rgba(78, 115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: lineYaxis,
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 100,
            maxTicksLimit: 5,
            padding: 10,
            // Include a dollar sign in the ticks
            callback: function(value, index, values) {
              return number_format(value) + " " + si_unit;
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ':' + number_format(tooltipItem.yLabel) + " " + si_unit;
          }
        }
      }
    }
  });
}

// Initializing the Empty Line chart while adding new widget //
function loadBarChart(si_unit) {
  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  // Bar Chart Example
  var ctx = document.getElementsByClassName("barChart");
  let barXaxis = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  let barYaxis = [];
  var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: barXaxis,
      datasets: [{
        label: "Revenue",
        backgroundColor: "#4e73df",
        hoverBackgroundColor: "#2e59d9",
        borderColor: "#4e73df",
        data: barYaxis,
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 6
          },
          maxBarThickness: 25,
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 100,
            maxTicksLimit: 5,
            padding: 10,
            // Include a measuring unit sign in the ticks
            callback: function(value, index, values) {
              return number_format(value) + " " + si_unit;
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ':' + number_format(tooltipItem.yLabel) + " " + si_unit;
          }
        }
      },
    }
  });

}

// Export Pdf timer //
function pdfTimerFunc()
{
	var inprogress = sessionStorage.getItem("exportpdf_inprogress");
	//var export_type = sessionStorage.getItem("export_type")

	if (inprogress == "true")
	{
		let flag = 0;
		var id = setInterval(function()
		{
			$.ajax({
				type: "POST",
				url: "/root",
				data: {
					csrfmiddlewaretoken: getCookie("csrftoken"),
					page: "export_progress",
					file_type: "pdf"
				},
				success: function(response)
				{
					var result = JSON.parse(response);
					if (result.res == 1)
					{
						var filename = "Download "+result.filename;
						flag = 1;
						$("#exportPdf").hide();
						$("#exportMsgBottom").hide();

						sessionStorage.button_disable = "false";
						var msgCount = document.getElementById("messageCount");
						let count = parseInt(msgCount.getAttribute("data-count"));
						let final_count = 0;
						if (count > 0)
						{
							if (count == 2)
							{
								final_count = count;
							}
							else
							{
								final_count = count+1;
							}
						}
						else
						{
							final_count = 1;
						}
						msgCount.setAttribute("data-count",final_count.toString());

						$("#notifications").find("#exportedPdfFile").remove();
						$("#notifications").append('<a id="exportedPdfFile" onclick="downloadPdf()" class="dropdown-item d-flex align-items-center" href="#"><div class="dropdown-list-image mr-3"><i class="fas fa-download"></i></div><div class="font-weight-bold"><div class="text-truncate">Download Exported pdf file</div><div class="small text-gray-800">'+filename+'</div></div></a>');

						if (flag == 1){
							clearInterval(id);
						}
					}
				}
			});

		},2000);
	}
}


//Export Csv timer //
function csvTimerFunc()
{
	var inprogress = sessionStorage.getItem("exportcsv_inprogress");
	//var export_type = sessionStorage.getItem("export_type")

	if (inprogress == "true")
	{
		let flag = 0;
		var id = setInterval(function()
		{
			$.ajax({
				type: "POST",
				url: "/root",
				data: {
					csrfmiddlewaretoken: getCookie("csrftoken"),
					page: "export_progress",
					file_type: "csv"
				},
				success: function(response)
				{
					var result = JSON.parse(response);
					if (result.res == 1)
					{
						var filename = "Download "+result.filename;
						flag = 1;
						$("#exportPdf").hide();
						$("#exportMsgBottom").hide();

						sessionStorage.button_disable = "false";
						var msgCount = document.getElementById("messageCount");
						let count = parseInt(msgCount.getAttribute("data-count"));
						let final_count = 0;
						if (count > 0)
						{
							if (count == 2)
							{
								final_count = count;
							}
							else
							{
								final_count = count+1;
							}
						}
						else
						{
							final_count = 1;
						}
						msgCount.setAttribute("data-count",final_count.toString());

						$("#notifications").find("#exportedCsvFile").remove();
						$("#notifications").append('<a id="exportedCsvFile" onclick="downloadCsv()" class="dropdown-item d-flex align-items-center" href="#"><div class="dropdown-list-image mr-3"><i class="fas fa-download"></i></div><div class="font-weight-bold"><div class="text-truncate">Download Exported csv file</div><div class="small text-gray-800">'+filename+'</div></div></a>');

						if (flag == 1){
							clearInterval(id);
						}
					}
				}
			});

		},2000);
	}
}

// idleTimeout Function //
function idle(){
	$.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "settings",
      action: "read"
    },
    success: function(response) {
		var result = JSON.parse(response);
		const idleDurationSecs = parseInt(result.idle_timeout);

		const redirectUrl = "/";
		let idleTimeout;

		const resetIdleTimeout = function() {
			if(idleTimeout) clearTimeout(idleTimeout);
			idleTimeout = setTimeout(function() {
				sessionStorage.clear();
				document.location.href = redirectUrl;
			},idleDurationSecs * 1000);
		};

		// Key events for reset time
		resetIdleTimeout();
		window.onmousemove = resetIdleTimeout;
		window.onkeypress = resetIdleTimeout;
		window.click = resetIdleTimeout;
		window.onclick = resetIdleTimeout;
		window.touchstart = resetIdleTimeout;
		window.onfocus = resetIdleTimeout;
		window.onchange = resetIdleTimeout;
		window.onmouseover = resetIdleTimeout;
		window.onmouseout = resetIdleTimeout;
		window.onmousemove = resetIdleTimeout;
		window.onmousedown = resetIdleTimeout;
		window.onmouseup = resetIdleTimeout;
		window.onkeypress = resetIdleTimeout;
		window.onkeydown = resetIdleTimeout;
		window.onkeyup = resetIdleTimeout;
		window.onsubmit = resetIdleTimeout;
		window.onreset = resetIdleTimeout;
		window.onselect = resetIdleTimeout;
		window.onscroll = resetIdleTimeout;
      }
    });
}
