/**
 * Configs
 * */

let widgetTypes = {
  "bar": "Bar Graph",
  "line": "Line Graph",
  "tank": "Tank",
  "temp": "Temperature Gauge",
  "pressure": "Pressure Gauge"
};


/* ******************************************************************************************************** */


/**
 * Common for all Page
 * */

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

$.ajaxSetup({
  global: true,
  error: function(jqXHR, exception) {
    var message = "";
    if (jqXHR.status === 0) {
      message = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status == 404) {
      message = 'Requested page not found. [404]';
    } else if (jqXHR.status == 403) {
      message = 'Access Forbidden. [403]';
    } else if (jqXHR.status == 500) {
      message = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
      message = 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
      message = 'Time out error.';
    } else if (exception === 'abort') {
      message = 'Ajax request aborted.';
    } else {
      message = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    flash.error(message);
  }
});

// Toast Message //
function showFlashMessage(message, type) {

  $.alert(message, {
    type: 'warning',
    autoClose: true,
    closeTime: 5000,
    withTime: false,
    position: ['top-center', [-0.42, 0]]
  });
}

$("#sidebarToggle").on('click', function(e)
{
	$("#mistralLogo").toggleClass("white_logo logo");
});

/* ******************************************************************************************************** */


/**
 * Login Page
 * */

$("#login").on('click', function(e) {
  let pass = $("#inputPassword").val();
  let username = $("#inputEmail").val();
  if (pass != "" && username != "") {
    $.ajax({
      type: "POST",
      url: "/root",
      data: {
        csrfmiddlewaretoken: getCookie("csrftoken"),
        page: "user",
        action: "login",
        username: username,
        password: pass
      },
      success: function(response) {
        var result = JSON.parse(response);
        if (result.is_error == 1) {
          $("#errorMessage").html(result.message);
        } else {
		  sessionStorage.setItem("exportpdf_inprogress", "false");
		  sessionStorage.setItem("exportcsv_inprogress", "false");
		  sessionStorage.setItem("button_disable","false");
		  sessionStorage.setItem("export_type","");
		  sessionStorage.setItem("user_name",username);
		  getRole(username);
          $("#errorMessage").html("");
          var url = "/dashboard";
          document.location.href = url;
		  //idle();
        }
      }
    });
  } else {
    $("#errorMessage").html("Please enter the required fields....");
  }
});

function getRole(username)
{
	$.ajax({
      type: "POST",
      url: "/root",
      data: {
        csrfmiddlewaretoken: getCookie("csrftoken"),
        page: "user",
        action: "get_item",
		field: "user_name",
        value: username
      },
      success: function(response) {
        var result = JSON.parse(response);
        if (result.is_error == 1) {
          $("#errorMessage").html(result.message);
        } else {
		  sessionStorage.setItem("role",result.user["role"]);
        }
      }
    });
}

$("#logout").on('click', function(e) {
	sessionStorage.clear();
	var url = "/";
	document.location.href = url;
});

//Forgot Password
$("#loginForgotPsw").on('click', function(e) {
	var username = $("#inputEmail").val();

	if (username == '') {
		$("#errorMessage").html("Please enter username.");
	}
	else {
		$.ajax({
		  type: "POST",
		  url: "/root",
		  data: {
			csrfmiddlewaretoken: getCookie("csrftoken"),
			page: "user",
			action: "get_item",
			field: "user_name",
			value: username
		  },
		  success: function(response) {
			var result = JSON.parse(response);
			if (result.is_error == 1) {
			  $("#errorMessage").html("Username doesn't exist!");
			}
			else {
				sessionStorage.setItem("user_name",username);
				var url = "forgot-password/";
				document.location.href = url;
			}
		  }
		});
	}
});


/* ******************************************************************************************************** */


/**
 * Forgot password
 * */

$("#getPassword").on('click', function(e) {
	var mail_id = $("#forgotInputEmail").val();
	var user_name = sessionStorage.getItem('user_name');
	var mail_regx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	if (mail_id == '') {
		flash.error("Please enter Email ID.");
	} else if (!mail_regx.test(mail_id)) {
		flash.error("Please enter valid Mail ID.");
	} else {
		$.ajax({
		type: "POST",
		url: "/root",
		data: {
		  csrfmiddlewaretoken: getCookie("csrftoken"),
		  page: "forgot_password",
		  action: "reset",
		  username: user_name,
		  mail_id: mail_id
		},
		success: function(response) {
			var result = JSON.parse(response);
			if (result.is_error == 0)
			{
				$("#forgotModal").modal();
			}
			else
			{
				if (result.verified == 0)
				{
					$("#resend").html('<a href="#" onclick="getVerificationMail()">Resend Verification Mail</a>');
				}
				flash.error(result.message);
			}
		  }
		});
	}
});


function getVerificationMail() {
	var mail_id = $("#forgotInputEmail").val();
	var user_name = sessionStorage.getItem('user_name');
	var mail_regx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	if (mail_id == '') {
		flash.error("Please enter Email ID.");
	} else if (!mail_regx.test(mail_id)) {
		flash.error("Please enter valid Mail ID.");
	} else {
		$.ajax({
		type: "POST",
		url: "/root",
		data: {
		  csrfmiddlewaretoken: getCookie("csrftoken"),
		  page: "forgot_password",
		  action: "verify_email",
		  username: user_name,
		  mail_id: mail_id
		},
		success: function(response) {
			var result = JSON.parse(response);
			if (result.is_error == 0)
			{
				flash.success(result.message);
			}
			else{
				flash.error(result.message);
			}
		  }
		});
	}
}


//close modal
$("#forgotCloseModal").on('click',function(e){
	var url = "/";
	document.location.href = url;
});





/* ******************************************************************************************************** */


/**
 * Firmware Page
 * */
$("#selectAsset").on('change', function(e) {
  var options = "";
  switch ($(this).val()) {
    case "1":
      options += '<option value="1">DeviceOne_20210621</option><option value="2">DeviceOne_20210521</option><option value="3">DeviceOne_20210421</option>';
      $("#current_firmware").val("DeviceOne_20200101");
      break;
    case "2":
      options += '<option value="1">DeviceTwo_20210321</option><option value="2">DeviceTwo_20210221</option><option value="3">DeviceTwo_20210121</option>';
      $("#current_firmware").val("DeviceTwo_20200101");
      break;
    case "3":
      options += '<option value="1">DeviceThree_20210621</option><option value="2">DeviceThree_20210521</option><option value="3">DeviceThree_20210421</option>';
      $("#current_firmware").val("DeviceThree_20200101");
      break;
    default:
  }
  $("#selectFile").html(options);
});


/* ******************************************************************************************************** */


/**
 * Device Page
 * */

// Get Devices List //
function getDevicesList() {
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
      var row = "";
      if (result.is_error == 1) {
        row = '<tr><td class="text-center" colspan="7">No Data Found!</td></tr>';
      } else {
        $.each(result.devices, function(index, value) {
          row += '<tr><td>' + value["device_id"] + '</td><td>' + value["device_name"] + '</td><td>' + value["mac_id"] + '</td><td>';
          row += value["sensors"] + '</td>';
          if (value["status"] == true || value["status"] == 1 || value["status"] == 't') {
            row += '<td class="text-center"><label class="switch"><input name="status" type="checkbox" data-display-id="' + value["device_id"] + '" data-display-name="' + value["device_name"] + '" onchange="deviceStatus(event)" checked><span class="slider round"></span></label></td>';
          } else {
            row += '<td class="text-center"><label class="switch"><input name="status" type="checkbox" data-display-id="' + value["device_id"] + '" data-display-name="' + value["device_name"] +'" onchange="deviceStatus(event)" ><span class="slider round"></span></label></td>';
          }
          row += '<td class="text-center"><a href="#" class="btn" data-display-name="' + value["device_id"] + '" data-toggle="modal" data-target="#editModal"><i class="fas fa-pencil-alt text-primary"></i></a></td>';
          row += '<td class="text-center"><a href="#" class="btn" data-display-name="' + value["device_name"] + '" data-toggle="modal" data-target="#deleteModal"><i class="fas fa-trash text-danger"></i></a></td></tr>';
        });
      }
      $("#assetsTable tbody").html(row);
      $("#assetsTable").DataTable();
    }
  });
}

//Add model
$('#myModal').on('show.bs.modal', function(e) {
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
	  var allSensors = "";
	  $.each(result.sensors, function(index, value) {
        allSensors += '<option value="'+value["id"]+'">'+value["name"]+'</option>';//"<option value='" + value + "'>" + value + "</option>";
      });
	  $('#selectSensors').html(allSensors);
	}
	});
});



// Add Device //
$("#addDevice").on('click', function(e) {
  let device_name = $("#inputAssetName").val();
  let mac_id = $("#inputAssetMac").val();
  let sensors = $("#selectSensors").val();
  let description = $("#inputDescription").val();
  // var regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
  // else if (!regex.test(mac_id)) {
  //   $("#errorMessage").html("Please enter valid Mac ID.");
  // }
  if (device_name == '') {
    $("#errorMessage").html("Please enter location name.");
  } else if (mac_id == '') {
    $("#errorMessage").html("Please enter reference number.");
  } else if (sensors.length == 0) {
    $("#errorMessage").html("Please select atleast one sensor.");
  } else {
    $("#errorMessage").html("");
    console.log(device_name);
    console.log(mac_id);
    console.log(JSON.stringify(sensors));
    console.log(description);
    $.ajax({
      type: "POST",
      url: "/root",
      data: {
        csrfmiddlewaretoken: getCookie("csrftoken"),
        page: "device",
        action: "add",
        device_name: device_name,
        mac_id: mac_id,
        sensor_id: JSON.stringify(sensors),
        description: description
      },
      success: function(response) {
        var result = JSON.parse(response);
        if (result.is_error == 1) {
          $("#errorMessage").html(result.message);
        } else {
          $("#errorMessage").html("");
          var url = "/assets";
          document.location.href = url;
        }
      }
    });
  }
});

// Edit Modal //
$('#editModal').on('show.bs.modal', function(e) {
  let id = $(e.relatedTarget).data('display-name');

  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "device",
      action: "get_dev_sensors",
      device_id: id
    },
    success: function(response) {
      var result = JSON.parse(response);

	  var ids = [];
	  $.each(result.device["sensors"], function(index, value) {
		ids.push(parseInt(value["id"]));
      });
	  var allSensors = "";
      $.each(result.sensor, function(index, value) {
		if ($.inArray(value["id"], ids) != -1) {
			allSensors += '<option selected="selected" value="'+value["id"]+'">'+value["name"]+'</option>';
		}else{
			allSensors += '<option value="'+value["id"]+'">'+value["name"]+'</option>';
		}
      });
      $('#selectEditSensor').html(allSensors);
      $(e.currentTarget).find("#deviceId").html(id);
      $(e.currentTarget).find('#inputEditAssetName').val(result.device["device_name"]);
      $(e.currentTarget).find('#inputEditAssetMac').val(result.device["mac_id"]);
      $(e.currentTarget).find('#inputEditDescription').val(result.device["description"]);
    }
  });
});

$("#editDevice").on('click', function(e) {
  let device_id = $("#deviceId").html();
  let device_name = $("#inputEditAssetName").val();
  let mac_id = $("#inputEditAssetMac").val();
  let sensors = $("#selectEditSensor").val();
  let description = $("#inputEditDescription").val();

  // var regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
  // else if (!regex.test(mac_id)) {
  //   $("#editErrorMessage").html("Please enter valid Mac ID.");
  // }
  if (device_name == '') {
    $("#editErrorMessage").html("Please enter location name.");
  } else if (mac_id == '') {
    $("#editErrorMessage").html("Please enter reference number.");
  } else if (sensors.length == 0) {
    $("#editErrorMessage").html("Please select atleast one sensor.");
  } else {
    $.ajax({
      type: "POST",
      url: "/root",
      data: {
        csrfmiddlewaretoken: getCookie("csrftoken"),
        page: "device",
        action: "update",
        device_id: device_id,
        device_name: device_name,
        mac_id: mac_id,
        sensor_id: JSON.stringify(sensors),
        description: description
      },
      success: function(response) {
        var result = JSON.parse(response);
        if (result.is_error == 1) {
          $("#editErrorMessage").html(result.message);
        } else {
          $("#editErrorMessage").html("");
          var url = "/assets";
          document.location.href = url;
        }
      }
    });
  }
});

// Delete Modal //
$('#deleteModal').on('show.bs.modal', function(e) {
  let deviceName = $(e.relatedTarget).data('display-name');
  console.log(deviceName);
  $(e.currentTarget).find('.display_val').html(deviceName);
});


$("#deleteDevice").on('click', function(e) {
  let device_name = $('.display_val').html();

  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "device",
      action: "delete",
      device_name: device_name
    },
    success: function(response) {
      var result = JSON.parse(response);
      if (result.is_error == 1) {
        flash.error(result.message);
      } else {
        var url = "/assets";
        document.location.href = url;
		flash.success(result.message);
      }
    }
  });
});

function deviceStatus(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  var device_id = $(target).data('display-id');
  var dev_name = $(target).data('display-name');
  let check = $(target).is(":checked");
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "device",
      action: "update_status",
      device_id: device_id,
      device_status: check
    },
    success: function(response) {
      var result = JSON.parse(response);
      if (result.is_error == 1) {
        $("#errorMessage").html(result.message);
      } else {
        $("#errorMessage").html("");
        //var url = "/assets";
        //document.location.href = url;
      }
    }
  });

  if (check) {
    let msg = "Device " + dev_name + " is ON";
    flash.success(msg)
  } else {
    let msg = "Device " + dev_name + " is OFF";
    flash.error(msg)
  }
}


/* ******************************************************************************************************** */

/**
 * Create Dashboard Page
 * */
 function getDashboardsList() {
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
         row = '<tr><td class="text-center" colspan="4">No Data Found!</td></tr>';
       } else {
         $.each(result.dashboards, function(index, value) {
           row += '<tr><td>'+value["dashboard_id"]+'</td><td>'+value["dashboard_name"]+'</td>';
           row += '<td class="text-center"><a href="#" class="btn editDashBoard" data-display-name="' + value["dashboard_id"] + '" data-toggle="modal" data-target="#editDashBoard"><i class="fas fa-pencil-alt text-primary"></i></a></td>';
           row += '<td class="text-center"><a href="#" class="btn" data-display-name="' + value["dashboard_name"] + '" data-toggle="modal" data-target="#deleteDashboard"><i class="fas fa-trash text-danger"></i></a></td></tr>';

         });
       }
       $("#dashboardsTable tbody").html(row);
       $("#dashboardsTable").DataTable();
     }
   });
 }

 $( document ).delegate( ".editDashBoard", "click", function() {
   var url = "/editdashboard?id=" + $(this).data('display-name');
   document.location.href = url;
 });

// Delete Dashboard //
$('#deleteDashboard').on('show.bs.modal', function(e) {
  //get data-id attribute of the clicked element
  var bookId = $(e.relatedTarget).data('display-name');
  //populate the textbox
  $(e.currentTarget).find('.display_val1').html(bookId);
});

$("#deleteSelectedDashboard").on('click', function(e) {
  let dash_name = $('.display_val1').html();

  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "create_dashboard",
      action: "delete",
      dashboard_name: dash_name
    },
    success: function(response) {
      var result = JSON.parse(response);
      if (result.is_error == 1) {
        flash.error(result.message);
      } else {
        var url = "/createdashboard";
        document.location.href = url;
		flash.success(result.message);
      }
    }
  });
});

/* ******************************************************************************************************** */


/**
 * Health Page
 * */

// get Devices //
function getHealthList() {
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "device",
      action: "get_stat"
    },
    success: function(response) {
      //var response = '{"is_error":0,"message":"Data fetched successfully","devices":[{"device_id":1,"device_name":"one","mac_id":"a6-56-h7","sensors":["temperature","pressure"],"description":"first device","status":0},{"device_id":2,"device_name":"two","mac_id":"86-5b-97","sensors":["c02","level"],"description":"second device","status":1}]}';
      var result = JSON.parse(response);
      var row = "";

      if (result.is_error == 1) {
        row = '<tr><td class="text-center" colspan="7">No Data Found!</td></tr>';
      } else {
        $.each(result.devices, function(index, value) {
          let dev_id = value["device_id"].toString()
          let icon = "icon_" + dev_id;
          let status_id = "status_" + dev_id;
          row += '<tr><td>' + value["device_id"] + '</td><td>' + value["device_name"] + '</td><td class="text-center"><i id=' + icon + ' class="spinner-border text-primary small" role="status"></i></td><td><span id=' + status_id + '>Fetching data...!</span></td></tr>';
        });
      }
      $("#healthTable tbody").html(row);
      $("#healthTable").DataTable();
    }
  });

  var options = {
    timeout: 3,
    onSuccess: onConnect,
    onFailure: onFailed
  };
  var reconnecttimeout = 2000;
  var client;

  function onConnect() {
    console.log("onConnect");
    client.subscribe("mistral/health");
  }

  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  }

  // called when a message arrives
  function onMessageArrived(message) {
    console.log("onMessageArrived:" + message.payloadString);
    var result = JSON.parse(message.payloadString)
    $.each(result.devices, function(index, value) {
      let dev_id = value["device_id"].toString()
      let icon = "icon_" + dev_id;
      let status_id = "status_" + dev_id;
      if (value["sensor_status"] == 0) {
        $("#" + icon).removeClass("spinner-border text-primary small");
        $("#" + icon).removeClass("fas fa-check-circle text-success");
        $("#" + icon).removeClass("fas fa-exclamation-triangle text-danger");
        $("#" + icon).addClass("fas fa-check-circle text-success");
      } else {
        $("#" + icon).removeClass("spinner-border text-primary small");
        $("#" + icon).removeClass("fas fa-check-circle text-success");
        $("#" + icon).removeClass("fas fa-exclamation-triangle text-danger");
        $("#" + icon).addClass("fas fa-exclamation-triangle text-danger");
      }
      $("#" + status_id).html(value["sensor_msg"]);
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
    client.connect(options);

  }

  MQTTconnect();
}


/* ******************************************************************************************************** */


/**
 * Export Page
 * */

function getExportDevice() {
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
      var options = "";
      options += '<option value="select">Select Device</option>';
      if (result.is_error == 1) {
        console.log(result.message);
      } else {
        $.each(result.devices, function(index, value) {
          options += '<option value="'+value["device_id"]+'">'+value["device_name"]+'</option>';
        });
        $("#selectExportDevice").html(options);
		$("#selectExportDevice").change();
      }
    }
  });
}

// Get Available Sensors for device //
$("#selectExportDevice").on('change', function(e) {
  var firstDeviceSensors = "";
  $("#startDate").val(" ");
  $("#endDate").val(" ");
  if ($(this).val() != "select")
  {
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
		  $.each(result.device["sensors"], function(index, value) {
			firstDeviceSensors += '<option value="'+value["id"]+'">'+value["name"]+'</option>';//"<option value='" + value + "'>" + value + "</option>";
		  });
		  $('#selectExportSensors').html(firstDeviceSensors);
		  //$('#selectExportSensors').multiSelect();
		}
	  });
  }
  else
  {
	  $("#selectExportSensors").empty();
  }
});

//start Export Pdf //
$("#startExportPDF").on('click', function(e) {

  if (sessionStorage.getItem("button_disable") == "true")
  {
	e.preventDefault();
  }
  else
  {
	  var device_id = $("#selectExportDevice").val();
	  var device_name = $("#selectExportDevice option:selected").text();
	  var sensor_ids = $("#selectExportSensors").val();

	  var sensor_names=[];
	  $("#selectExportSensors option:selected").each(function () {
		var $this = $(this);
		if ($this.length) {
			var selText = $this.text();
			console.log(selText);
			sensor_names.push(selText);
		}
	  });

	  var start_date = $("#startDate").val();
	  var end_date = $("#endDate").val();

	  if ($("#selectExportSensors").get(0).selectedIndex == -1)
	  {
		var notSelected = $("#selectExportSensors").find('option').not(':selected');
		sensor_ids = notSelected.map(function () {
			return this.value;
		}).get();

		sensor_names = notSelected.map(function () {
			return this.text;
		}).get();
	  }
	  let regx = /^(19[0-9][0-9]|20[0-9][0-9])\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01]) (2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;
	  if (device_id == '') {
		$("#errorMessage").html("Please select the location name.");
	  } else if (start_date == '') {
		$("#errorMessage").html("Please select the start Date.");
	  } else if (!regx.test(start_date)) {
		$("#errorMessage").html("Please enter valid start Date.")
	  } else if (end_date == '') {
		$("#errorMessage").html("Please select the end Date.");
	  } else if (!regx.test(end_date)) {
		$("#errorMessage").html("Please enter valid end Date.");
	  } else {
		$("#errorMessage").html("");
		$("#exportPdf").html('<h6 id="progressText" class= "text-gray-800 small" ><i class="spinner-border text-primary small" role="status"></i> &nbsp; Export in progress </h6>');

		$("#exportMsgBottom").html('<h5 class= "text-gray-800 small text-center"><i class="spinner-border text-primary small" role="status"></i> &nbsp; Export in progress </h5>');
		$("#exportPdf").show();
		$("#exportMsgBottom").show();

		$.ajax({
		  type: "POST",
		  url: "/root",
		  data: {
			csrfmiddlewaretoken: getCookie("csrftoken"),
			page: "export_pdf",
			device_id: device_id,
			device_name: device_name,
			sensor_ids: JSON.stringify(sensor_ids),
			sensor_names: JSON.stringify(sensor_names),
			start_date: start_date,
			end_date: end_date
		  },
		  success: function(response) {

			if (response == 1)
			{
				sessionStorage.exportpdf_inprogress = "true";
				sessionStorage.button_disable = "true";
				sessionStorage.export_type ="pdf";
				pdfTimerFunc();
			}
		  }
		});
	  }
	}

});


// start Export CSV
$("#startExportCSV").on('click', function(e) {
  if (sessionStorage.getItem("button_disable") == "true")
  {
	e.preventDefault();
  }
  else
  {
	  var device_id = $("#selectExportDevice").val();
	  var device_name = $("#selectExportDevice option:selected").text();
	  var sensor_ids = $("#selectExportSensors").val();

	  var sensor_names=[];
	  $("#selectExportSensors option:selected").each(function () {
		var $this = $(this);
		if ($this.length) {
			var selText = $this.text();
			console.log("seltex "+selText);
			sensor_names.push(selText);
		}
	  });

	  var start_date = $("#startDate").val();
	  var end_date = $("#endDate").val();

	  if ($("#selectExportSensors").get(0).selectedIndex == -1)
	  {
		var notSelected = $("#selectExportSensors").find('option').not(':selected');
		sensor_ids = notSelected.map(function () {
			return this.value;
		}).get();

		sensor_names = notSelected.map(function () {
			return this.text;
		}).get();
	  }
	  let regx = /^(19[0-9][0-9]|20[0-9][0-9])\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01]) (2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;
	  if (device_id == '') {
		$("#errorMessage").html("Please select the device name.");
	  } else if (start_date == '') {
		$("#errorMessage").html("Please select the start Date.");
	  } else if (!regx.test(start_date)) {
		$("#errorMessage").html("Please enter valid start Date.")
	  } else if (end_date == '') {
		$("#errorMessage").html("Please select the end Date.");
	  } else if (!regx.test(end_date)) {
		$("#errorMessage").html("Please enter valid end Date.");
	  } else {

		$("#exportPdf").html('<h6 id="progressText" class= "text-gray-800 small" ><i class="spinner-border text-primary small" role="status"></i> &nbsp; Export in progress </h6>');

		$("#exportMsgBottom").html('<h5 class= "text-gray-800 small text-center"><i class="spinner-border text-primary small" role="status"></i> &nbsp; Export in progress </h5>');

		$("#exportPdf").show();
		$("#exportMsgBottom").show();
    console.log("device_id "+device_id),
    console.log("device_name"+device_name)
    console.log("sensor_ids "+sensor_ids),
    console.log("sensor_names "+sensor_names),
		$.ajax({
		  type: "POST",
		  url: "/root",
		  data: {      
			csrfmiddlewaretoken: getCookie("csrftoken"),
			page: "export_csv",
			device_id: device_id,
			device_name: device_name,
			sensor_ids: JSON.stringify(sensor_ids),
			sensor_names: JSON.stringify(sensor_names),
			start_date: start_date,
			end_date: end_date     
		  },
		  success: function(response) {

			if (response == 1)
			{
				sessionStorage.exportcsv_inprogress = "true";
				sessionStorage.button_disable = "true";
				sessionStorage.export_type = "csv";
				csvTimerFunc();
			}
		  }
		});
	  }
	}

});

//download pdf
function downloadPdf() {
	sessionStorage.exportpdf_inprogress = "false";
	var url = "/pdf";
	$("#exportedPdfFile").hide();
	var msgCount = document.getElementById("messageCount");
	msgCount.removeAttribute("data-count");
	window.open(url,'_blank');
}

// download csv //
function downloadCsv() {
	sessionStorage.exportcsv_inprogress = "false";
	var url = "/csv";
	$("#exportedCsvFile").hide();
	var msgCount = document.getElementById("messageCount");
	msgCount.removeAttribute("data-count");
	window.open(url,'_blank');
}


// Reset Fields //
$("#resetExport").on('click', function(e) {

	if (sessionStorage.getItem("button_disable") == "true")
	{
		e.preventDefault();
	}
	else
	{
		$("#selectExportDevice").val("select");
		$("#selectExportSensors").empty();

		$("#startDate").val(" ");
		$("#endDate").val(" ");
	}

});



/**
 * User tab
 * */

 // get Users List //
 function getUsersList() {
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "user",
      action: "get"
    },
    success: function(response) {
      var result = JSON.parse(response);
      var row = "";
      if (result.is_error == 1) {
        row = '<tr><td class="text-center" colspan="7">No Data Found!</td></tr>';
      } else {
        $.each(result.users, function(index, value) {
          row += '<tr><td>' + value["user_id"] + '</td><td>' + value["user_name"] + '</td><td>' + value["mail_id"] + '</td><td>';
          row += value["role"] + '</td>';
          if (value["status"] == true || value["status"] == 1 || value["status"] == 't') {
            row += '<td class="text-center"><label class="switch"><input name="status" type="checkbox" data-display-name="' + value["user_name"] + '" data-display-id="' + value["user_id"] +'" onchange="userStatus(event)" checked><span class="slider round"></span></label></td>';
          } else {
            row += '<td class="text-center"><label class="switch"><input name="status" type="checkbox" data-display-name="' + value["user_name"] + '" data-display-id="' + value["user_id"] + '" onchange="userStatus(event)" ><span class="slider round"></span></label></td>';
          }
		  if (value["mail_status"] == "Verified") {
			row += '<td class="text-center"><span title="Verified"><i class="fas fa-check-circle text-success"></i></span></td>';
		  } else if(value["mail_status"] == "Pending") {
			row += '<td class="text-center text-warning"><span title="Pending"><i class="fas fa-clock"></i></span></td>';
		  } else {
			row += '<td class="text-center text-danger"><span title="Not Verified"><i class="fa fa-exclamation-triangle"></i></span></td>';
		  }
          row += '<td class="text-center"><a href="#" class="btn" data-display-name="' + value["user_id"] + '" data-toggle="modal" data-target="#editUserModal"><i class="fas fa-pencil-alt text-primary"></i></a></td>';
          row += '<td class="text-center"><a href="#" class="btn" data-display-name="' + value["user_name"] + '" data-toggle="modal" data-target="#deleteUserModal"><i class="fas fa-trash text-danger"></i></a></td></tr>';
        });
      }
      $("#usersTable tbody").html(row);
      $("#usersTable").DataTable();
    }
  });
}


//add user modal //
$('#addUserModal').on('show.bs.modal', function(e) {
	$.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "role",
      action: "get"
    },
    success: function(response) {
      var result = JSON.parse(response);
	  var role = "";
	  role += '<option value="select">Select Role</option>';
	  $.each(result.roles, function(index, value) {
        role += '<option value="'+value["role_id"]+'">'+value["role_name"]+'</option>'
      });
	  $('#selectUserRole').html(role);
	}
	});
});


//add user //
$("#addUser").on('click', function(e) {
  var user_name = $("#inputUserName").val();
  var pword = $("#inputUserPassword").val();
  var mail_id = $("#inputUserEmail").val();
  var role = $("#selectUserRole").val();

  var mail_regx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  var pass_regx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  if (user_name == '') {
    $("#errorMessage").html("Please enter user name.");
  } else if (pword == '') {
    $("#errorMessage").html("Please enter password.");
  } else if (!pass_regx.test(pword)) {
	$("#errorMessage").html("Please enter valid password.");
  }	else if (mail_id == '') {
    $("#errorMessage").html("Please enter Mail ID.");
  } else if (!mail_regx.test(mail_id)) {
	$("#errorMessage").html("Please enter valid Mail ID.");
  } else if (role.length == 0) {
    $("#errorMessage").html("Please select role.");
  } else {
    $("#errorMessage").html("");
    $.ajax({
      type: "POST",
      url: "/root",
      data: {
        csrfmiddlewaretoken: getCookie("csrftoken"),
        page: "user",
        action: "add",
        user_name: user_name,
		pass_word: pword,
        mail_id: mail_id,
        role: role
      },
      success: function(response) {
        var result = JSON.parse(response);
        if (result.is_error == 1) {
          flash.error(result.message);
        } else {
          //$("#errorMessage").html("");
		  flash.success(result.verify_message);
          var url = "/settings";
          document.location.href = url;
        }
      }
    });
  }
});

//edit modal //
$('#editUserModal').on('show.bs.modal', function(e) {
  let id = $(e.relatedTarget).data('display-name');

  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "user",
      action: "get_item",
      field: "user_id",
	  value: id
    },
    success: function(response) {
      var result = JSON.parse(response);

      $("#userId").html(id);
      $("#inputEditUserName").val(result.user["user_name"]);
      $("#inputEditUserEmail").val(result.user["mail_id"]);
	  $("#inputEditUserEmail").prop('disabled', true);
	  if (result.user["role"] == "Admin")
	  {
		$("#selectEditUserRole").val(1);
	  }
	  else
	  {
		$("#selectEditUserRole").val(2);
	  }
    }
  });
});

// edit user //
$("#editUser").on('click', function(e) {
  var user_id = $("#userId").html();
  var user_name = $("#inputEditUserName").val();
  var pass_word = $("inputEditUserPassword").val();
  var mail_id = $("#inputEditUserEmail").val();
  var role = $("#selectEditUserRole").val();

  if (user_name == '') {
    $("#editErrorMessage").html("Please enter user name.");
  } else if (mail_id == '') {
    $("#editErrorMessage").html("Please enter Mail ID.");
  } else if (pass_word = '') {
    $("#editErrorMessage").html("Please enter password");
  } else if (role == '') {
    $("#editErrorMessage").html("Please select role.");
  } else {
    $.ajax({
      type: "POST",
      url: "/root",
      data: {
        csrfmiddlewaretoken: getCookie("csrftoken"),
        page: "user",
        action: "update",
        user_id: user_id,
        user_name: user_name,
		pass_word: pass_word,
        mail_id: mail_id,
        role: role
      },
      success: function(response) {
        var result = JSON.parse(response);
        if (result.is_error == 1) {
          $("#editErrorMessage").html(result.message);
        } else {
          $("#editErrorMessage").html("");
          var url = "/settings";
          document.location.href = url;
        }
      }
    });
  }
});

//delete Modal //
$('#deleteUserModal').on('show.bs.modal', function(e) {
  let userName = $(e.relatedTarget).data('display-name');
  $(e.currentTarget).find('.display_val').html(userName);
});


//delete User //
$("#deleteUser").on('click', function(e) {
  let user_name = $('.display_val').html();

  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "user",
      action: "delete",
      user_name: user_name
    },
    success: function(response) {
      var result = JSON.parse(response);
      if (result.is_error == 1) {
        flash.error(result.message);
      } else {
        var url = "/settings";
        document.location.href = url;
		flash.success(result.message);
      }
    }
  });
});


function userStatus(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  var user_id = $(target).data('display-id');
  var user_name = $(target).data('display-name')

  let check = $(target).is(":checked");
  $.ajax({
    type: "POST",
    url: "/root",
    data: {
      csrfmiddlewaretoken: getCookie("csrftoken"),
      page: "user",
      action: "update_status",
      user_id: user_id,
      user_status: check
    },
    success: function(response) {
      var result = JSON.parse(response);
      if (result.is_error == 1) {
        $("#errorMessage").html(result.message);
      } else {
        $("#errorMessage").html("");

      }
    }
  });

  if (check) {
    let msg = "User " + user_name + " is Enabled";
    flash.success(msg)
  } else {
    let msg = "User " + user_name + " is Disabled";
    flash.error(msg)
  }
}



/**
 * General tab
 * */

function getSettings(){
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
		$("#inputIdleTimeout").val(result.idle_timeout);
		$("#inputDbLogging").val(result.database_logging);
		$("#inputMqttPublish").val(result.publish_time);
      }
    });
}

$("#applyIdleTime").on('click', function() {

	var idleTimeout = $("#inputIdleTimeout").val();
	$.ajax({
	type: "POST",
	url: "/root",
	data: {
	  csrfmiddlewaretoken: getCookie("csrftoken"),
	  page: "settings",
	  action: "update",
	  field: "timeout",
	  value: idleTimeout
	},
	success: function(response) {
		var result = JSON.parse(response);
		if (result.is_error == 0)
		{
			idle();
		}
	  }
	});

});


/**
 * Change Password tab
 * */

$("#applyChangePsw").on('click', function(e) {
	var new_psw = $("#inputNewPassword").val();
	var confirm_psw = $("#inputConfirmNewPassword").val();
	var user_name = sessionStorage.getItem("user_name");
	var pass_regx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;

	if (new_psw == '') {
		$("#errorPswMessage").html("Please enter new password.");
	} else if (!pass_regx.test(new_psw)) {
		$("#errorPswMessage").html("Please enter valid new password.");
	} else if (confirm_psw == ''){
		$("#errorPswMessage").html("Please enter confirm new password.")
	} else if (!pass_regx.test(confirm_psw)) {
		$("#errorPswMessage").html("Please enter valid confirm new password.");
	} else if (new_psw != confirm_psw){
		$("#errorPswMessage").html("New password and Confirm new password does not match.");
	} else {
		$.ajax({
		type: "POST",
		url: "/root",
		data: {
		  csrfmiddlewaretoken: getCookie("csrftoken"),
		  page: "user",
		  action: "update_psw",
		  user_name: user_name,
		  pass_word: confirm_psw
		},
		success: function(response) {
			var result = JSON.parse(response);
			if (result.is_error == 0)
			{
				$("#changePswModal").modal();
			}
		  }
		});
	}

});

//close modal //

$("#changePswClose").on('click',function(e){
	var url = "/";
	document.location.href = url;
});

//clear fields //
$("#clearPassword").on('click', function(e) {
	$("#inputNewPassword").val("");
	$("#inputConfirmNewPassword").val("");
});

// sleep function //
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
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
