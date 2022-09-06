/* ******************************************************************************************************** */
var sensorsInfo;
/**
 * Main Dashboard Page
 * */
// Dashboard Content By Dashboard ID//
function getDashboards(dashboard_id) {
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "create_dashboard",
      action: "get"
    },
    success: function(response) {
      //var response = '{"is_error":0,"message":"Data fetched successfully","devices":[{"device_id":1,"device_name":"one","mac_id":"a6-56-h7","sensors":["temperature","pressure"],"description":"first device","status":0},{"device_id":2,"device_name":"two","mac_id":"86-5b-97","sensors":["c02","level"],"description":"second device","status":1}]}';
      var result = JSON.parse(response);
      var row = "";
      console.log(response);
      if (result.is_error == 1) {
        row = '<option value="0">Select Dashboard</option>';
      } else {
        //row = '<option value="0">Select Dashboard</option>';
        $.each(result.dashboards, function(index, value) {
          if (dashboard_id == value["dashboard_id"]) {
            row += '<option selected value="' + value["dashboard_id"] + '">' + value["dashboard_name"] + '</option>';
          } else {
            row += '<option value="' + value["dashboard_id"] + '">' + value["dashboard_name"] + '</option>';
          }
        });
      }
      $("#selectDashboard").html(row);
      $("#selectDashboard").change();
    }
  });
}

$("#selectDashboard").on('change', function(e) {
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "create_dashboard",
      action: "get_item",
      dashboard_id: $("#selectDashboard").val()
    },
    success: function(response) {
      var result = JSON.parse(response);

      if (result.is_error == 0) {
        let serializedData = result.dashboard["layout"];
        sensorsInfo = result.dashboard["sensor_info"];
        console.log(sensorsInfo);
        //console.log(serializedData);
        var grid = GridStack.init();
        grid.removeAll();
        grid.load(serializedData, true);
        console.log("serializedData data loaded");

        // Initializing Empty Charts //
        $.each(sensorsInfo, function(key, value){
         var payloadDeviceID = value.device_id;
          $.each(value.sensors, function(skey, svalue) {
            var sensorName = svalue.name;
            $.each(svalue.widgets, function(wkey, wvalue) {
              var labelName = "";
              var si_unit = "";
              switch (sensorName) {
                case "Dissolved-O2":
                  labelName = "Dissolved Oxygen";
                  si_unit = "\u0025";
                  break;
                case "Dissolved-Solids":
                  labelName = "Dissolved Solids";
                  si_unit = "mg/L";
                  break;
                case "Humidity":
                  labelName = "Humidity";
                  si_unit = "\u0025";
                  break;
                case "pH":
                  labelName = "pH";
                  si_unit = "pH";
                  break;
                case "Temperature":
                  labelName = "Temperature";
                  si_unit = "\u2103";
                  break;
                case "Water-Level":
                  labelName = "Water Level";
                  si_unit = "ft";
                  break;
                case "Water-Current":
                  labelName = "Water Current";
                  si_unit = "cm";
                  break;
                case "Wind-Speed":
                  labelName = "Wind Speed";
                  si_unit = "kt";
                  break;
                default:
              }
              switch (wvalue) {
                case "Bar-Graph":
                  loadEmptyBarChart(payloadDeviceID + "_" + sensorName + "_" + wvalue, labelName, si_unit);
                  break;
                case "Line-Graph":
                  loadEmptyLineChart(payloadDeviceID + "_" + sensorName + "_" + wvalue, labelName, si_unit);
                  break;
                default:
              }
            });
          });
        });
      }
    }
  });
});

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Charts Methods Starts Here //

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
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

/**
 * Initializing Empty Linecharts
 * chartID : jQuerySelector
 * labelName : Name to be displayed on Hover
 * si_unit: SI Unit of sensor
 */
function loadEmptyLineChart(chartID, labelName, si_unit) {

  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  // Bar Chart Example
  var ctx = document.getElementById(chartID);
  var lineXaxis = [];
  var lineYaxis = [];

  if (typeof window['_' + chartID] == 'undefined') {
    window['C_' + chartID] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: lineXaxis,
        datasets: [{
          label: labelName,
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
              unit: 'time'
            },
            scaleLabel: {
        display: true,
        labelString: "Time"
      },
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              maxTicksLimit: 10
            }
          }],
          yAxes: [{
            scaleLabel: {
        display: true,
        labelString: si_unit
      },
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 10,
              padding: 10,
              // Include a dollar sign in the ticks
              callback: function(value, index, values) {
                return number_format(value);
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
}
/**
 * Initializing Empty Barcharts
 * chartID : jQuerySelector
 * labelName : Name to be displayed on Hover
 * si_unit: SI Unit of sensor
 */
function loadEmptyBarChart(chartID, labelName, si_unit) {
  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  // Bar Chart Example
  var ctx = document.getElementById(chartID);

  var barXaxis = [];
  var barYaxis = [];
  if (typeof window['_' + chartID] == 'undefined') {
    window['C_' + chartID] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: barXaxis,
        datasets: [{
          label: labelName,
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
              unit: 'time'
            },
            scaleLabel: {
        display: true,
        labelString: "Time"
      },
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              maxTicksLimit: 10
            },
            maxBarThickness: 25,
          }],
          yAxes: [{
            scaleLabel: {
        display: true,
        labelString: si_unit
      },
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 10,
              padding: 10,
              // Include a measuring unit sign in the ticks
              callback: function(value, index, values) {
                return number_format(value);
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
}

/*
 * Update Chart Data
 * chart : jQuerySelector
 * time : y Axis data
 * value : x Axis data
 */

function moveChart(chart, time, value) {

  var length = window['C_' + chart].data.datasets[0].data.length;
  if (length > 9) {
    window['C_' + chart].data.labels.splice(0, 1); // remove first label

    window['C_' + chart].data.datasets.forEach(function(dataset) {
      dataset.data.splice(0, 1); // remove first data point
    });
  }

  window['C_' + chart].update();

  // Formatting new value //
  var newData = [];
  newData.push(value);
  // Add new data
  window['C_' + chart].data.labels.push(time); // add new label at end

  window['C_' + chart].data.datasets.forEach(function(dataset, index) {
    dataset.data.push(newData[index]); // add new data at end
  });

  window['C_' + chart].update();
}


/**
 * Load data to chart *** This method will recreate chart ***
 * chartID : jQuerySelector
 * labelName : Name to be displayed on Hover
 * xData : X-Axis Data Array
 * yData  : Y-Axis Data Array
 * si_unit: SI Unit of sensor
 */
function loadLineChartTest(chartID, labelName, xData, yData, si_unit) {

  // Set new default font family and font color to mimic Bootstrap's default styling
  //Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  //Chart.defaults.global.defaultFontColor = '#858796';

  // Bar Chart Example
  var ctx = document.getElementById(chartID);

  // Getting last 10 entries only //
  var lineXaxis = xData.slice(Math.max(xData.length - 10, 0));
  var lineYaxis = yData.slice(Math.max(yData.length - 10, 0));

  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: lineXaxis,
      datasets: [{
        label: labelName,
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
            unit: 'time'
          },scaleLabel: {
        display: true,
        labelString: "Time"
      },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 10
          }
        }],
        yAxes: [{
          scaleLabel: {
        display: true,
        labelString: si_unit
      },
          ticks: {
            maxTicksLimit: 10,
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

/**
 * Load data to chart *** This method will recreate chart ***
 * chartID : jQuerySelector
 * labelName : Name to be displayed on Hover
 * xData : X-Axis Data Array
 * yData  : Y-Axis Data Array
 * si_unit: SI Unit of sensor
 */
function loadBarChartTest(chartID, labelName, xData, yData, si_unit) {
  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#858796';

  // Bar Chart Example
  var ctx = document.getElementById(chartID);

  // Getting last 10 entries only //
  var barXaxis = xData.slice(Math.max(xData.length - 10, 0));
  var barYaxis = yData.slice(Math.max(yData.length - 10, 0));

  var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: barXaxis,
      datasets: [{
        label: labelName,
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
            unit: 'time'
          },scaleLabel: {
        display: true,
        labelString: "Time"
      },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 10
          },
          maxBarThickness: 25,
        }],
        yAxes: [{
          scaleLabel: {
        display: true,
        labelString: si_unit
      },
          ticks: {
            maxTicksLimit: 10,
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

// Charts Ends Here //

// MQTT //
var mqtt_options = {
  timeout: 3,
  onSuccess: onConnect,
  onFailure: onFailed
};
var reconnecttimeout = 2000;
var client;

function onConnect() {
  console.log("onConnect");
  // Get all sensors to subscribe to MQTT Topics //
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "sensor",
      action: "get"
    },
    success: function(response) {
      var result = JSON.parse(response);
      $.each(result.sensors, function(index, value) {
        //allSensors += '<option value="'+value["id"]+'">'+value["name"]+'</option>';
        var topic = "mistral/" + value["name"];
        client.subscribe(topic);
      });
    }
  });

  /*client.subscribe("mistral/Ambient-Light");
  client.subscribe("mistral/Co2");
  client.subscribe("mistral/Level");
  client.subscribe("mistral/Pressure");
  client.subscribe("mistral/Temperature");*/
  //flash.success("MQTT Connected successfully. Fetching data...");
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
    //flash.error("MQTT Disconnected : " + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  //console.log("Destination", message.destinationName);
  var payload = JSON.parse(message.payloadString);
  var destination = message.destinationName;
  //var sensorInfo = [{"device_id": "2", "sensors": [{"name": "ambientLight", "widgets": ["bar"]}, {"name": "co2", "widgets": ["line", "tank"]}, {"name": "level", "widgets": ["line", "tank"]}]}];

  //console.log(payload.mac_id);
  var payloadDeviceID = payload.mac_id;
  var payloadValue = payload.value;
  var topicParts = destination.split("/");
  topic = topicParts[topicParts.length - 1];
  console.log("Topic" + topic + "=>" + message.payloadString);

  //console.log(payloadDeviceID + "-" + payloadValue + "-" + topic);
  $.each(sensorsInfo, function(key, value) {
    if (payloadDeviceID == value.device_id) {
      $.each(value.sensors, function(skey, svalue) {
        var sensorName = svalue.name;
        if (sensorName == topic) {
          $.each(svalue.widgets, function(wkey, wvalue) {
            switch (wvalue) {
              case "Pressure-Gauge":
              case "Temperature-Gauge":
              case "Tank-Gauge":
                var findID = "#" + payloadDeviceID + "_" + sensorName + "_" + wvalue;
                var findIDReadings = "." + payloadDeviceID + "_" + sensorName + "_" + wvalue + "_readings";
                $(findID).industrial(payloadValue);
                $(findIDReadings).html(" &nbsp; " + payloadValue);
                console.log("Updated " + findID + " value to " + payloadValue);
                break;
              case "Bar-Graph":
                var labelName = "";
                var si_unit = "";
                switch (sensorName) {
                  case "Dissolved-O2":
                    labelName = "Dissolved Oxygen";
                    si_unit = "\u0025";
                    break;
                  case "Dissolved-Solids":
                    labelName = "Dissolved Solids";
                    si_unit = "mg/L";
                    break;
                  case "Humidity":
                    labelName = "Humidity";
                    si_unit = "\u0025";
                    break;
                  case "pH":
                    labelName = "pH";
                    si_unit = "pH";
                    break;
                  case "Temperature":
                    labelName = "Temperature";
                    si_unit = "\u2103";
                    break;
                  case "Water-Level":
                    labelName = "Water Level";
                    si_unit = "ft";
                    break;
                  case "Water-Current":
                    labelName = "Water Current";
                    si_unit = "cm";
                    break;
                  case "Wind-Speed":
                    labelName = "Wind Speed";
                    si_unit = "kt";
                    break;
                  default:
                }
                // Data //
                var a = payloadDeviceID + "_" + sensorName + "_" + wvalue + "_Xdata";
                var b = payloadDeviceID + "_" + sensorName + "_" + wvalue + "_Ydata";
                var dt = new Date();
                if (typeof window['_' + a] == 'undefined') {
                  window['_' + a] = [];
                }
                window['_' + a].push(dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds());

                if (typeof window['_' + b] == 'undefined') {
                  window['_' + b] = [];
                }
                window['_' + b].push(payloadValue);
                moveChart(payloadDeviceID + "_" + sensorName + "_" + wvalue, dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds(), payloadValue);
                //loadBarChartTest(payloadDeviceID + "_" + sensorName + "_" + wvalue, labelName, window['_' + a], window['_' + b], si_unit);
                break;
              case "Line-Graph":
                var labelName = "";
                var si_unit = "";
                switch (sensorName) {
                  case "Dissolved-O2":
                    labelName = "Dissolved Oxygen";
                    si_unit = "\u0025";
                    break;
                  case "Dissolved-Solids":
                    labelName = "Dissolved Solids";
                    si_unit = "mg/L";
                    break;
                  case "Humidity":
                    labelName = "Humidity";
                    si_unit = "\u0025";
                    break;
                  case "pH":
                    labelName = "pH";
                    si_unit = "pH";
                    break;
                  case "Temperature":
                    labelName = "Temperature";
                    si_unit = "\u2103";
                    break;
                  case "Water-Level":
                    labelName = "Water Level";
                    si_unit = "ft";
                    break;
                  case "Water-Current":
                    labelName = "Water Current";
                    si_unit = "cm";
                    break;
                  case "Wind-Speed":
                    labelName = "Wind Speed";
                    si_unit = "kt";
                    break;
                  default:
                }
                // Data //
                var a = payloadDeviceID + "_" + sensorName + "_" + wvalue + "_Xdata";
                var b = payloadDeviceID + "_" + sensorName + "_" + wvalue + "_Ydata";
                var dt = new Date();
                if (typeof window['_' + a] == 'undefined') {
                  window['_' + a] = [];
                }
                window['_' + a].push(dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds());

                if (typeof window['_' + b] == 'undefined') {
                  window['_' + b] = [];
                }
                window['_' + b].push(payloadValue);
                moveChart(payloadDeviceID + "_" + sensorName + "_" + wvalue, dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds(), payloadValue);
                //loadLineChartTest(payloadDeviceID + "_" + sensorName + "_" + wvalue, labelName, window['_' + a], window['_' + b], si_unit);
                break;
              default:

            }
            //console.log(payloadDeviceID+"_"+sensorName+"_"+wvalue+"=>"+payloadValue);
          });
        }

      });
    }
  });
}

function onFailed(message) {
  console.log("Reconnecting.........");
  setTimeout(MQTTconnect, reconnecttimeout);
}

function MQTTconnect() {
  // Create a client instance
  console.log("location host :" + location.host);
  client = new Paho.MQTT.Client(location.host, Number(9001), "/ws");

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // connect the client
  client.connect(mqtt_options);

}
