validated = 0;
submit_pressed = false;
started = false;

$(window).load(function () {
  $(".loader").hide();
  $("#loader").hide();
  if(labelAlign == 0)
    labelAlign = 1;
  if(widgetWidth == 0)
    widgetWidth = $(window).width();
  w = Math.max.apply(Math, $('.label').map(function(){ return $(this).width(); }).get());
  label_width(labelAlign);
  
  correct_height();
  
  console.log(form_submited);
	if(viewMode == "site" && form_submited == 1)
	{
		set_submited();
	}
});

$(window).resize(function () {
  widgetWidth = $(window).width();
  if(labelAlign != 2)
    label_width(labelAlign);
  //correct_height();
});

$(function() {

  Wix.addEventListener(Wix.Events.COMPONENT_DELETED, function(data)
  {
    $.ajax({
    type: "POST",
    url: "../ajax/deleteForm/",
    data: { instance: instance, compId: compId },
      cache: false
    })
    .done(function( result ) {
    })
    .fail(function(result) {
      console.log(result);
    })
    .always(function(result) {
    });  
    
  });

  Wix.addEventListener(Wix.Events.EDIT_MODE_CHANGE, function(data)
  {
    if(data.editMode == "preview")
    {
      if(form_submited == 1)
      {
		  set_submited();
      }
    }
    else
    {
      location.reload();
    }
  });

	$('#submit').click(function () {
		console.log("clicked submit");
		var a = $("#captcha").val();
		if(a != undefined)
		{
			var b = $("#captcha").attr("class").replace("v_number ", "");
			if(a == b)
			{
				$("#captcha").removeClass("fieldValidationError");	
			}	
			else
			{
                submit_shake();
				$("#captcha").addClass("fieldValidationError");	
				return;
			}		
		}	
		console.log("submit_pressed="+submit_pressed);
		if(!submit_pressed)
		{
			submit_pressed = true;
			submit();
		}		
	});
  
  $('#backToForm').click(function () {
    location.reload();
  });
  
  $( ".info" )
    .mouseover(function() {
      $( this ).next().show();
    })
    .mouseout(function() {
      $( this ).next().hide();
  });
  
  $( ".v_error" )
    .mouseover(function() {
      $( this ).next().show();
    })
    .mouseout(function() {
      $( this ).next().hide();
  });
  
  // validation
  
  $(".v_number").numeric();
  $(".v_time").numeric();
  
  $( ".v_input, .v_text, .v_name, .v_email, .v_phone, .v_number, .v_website, .v_date, .v_time").focusout(function() {
    validate_field($(this), $(this).attr("class").replace("v_", ""));
  });
  
  $( ".v_input, .v_text, .v_name, .v_email, .v_phone, .v_number, .v_website, .v_date, .v_time").keypress(function() {
    validate_field($(this), $(this).attr("class").replace("v_", ""));
  });
  
  $( ".v_input, .v_text, .v_name, .v_email, .v_phone, .v_number, .v_website, .v_date, .v_time").keyup(function() {
    validate_field($(this), $(this).attr("class").replace("v_", ""));
    if(!started)
      ajax_started();
  });
  
    $(".v_date").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: "-100:+100",
        onSelect: function(dateText, inst) {
          validate_field($(this), "date");
        }
    });
  
  $( ".v_date" ).each(function( index ) {
    $( $(this) ).datepicker( "option", "dateFormat", $( this ).attr("format").toLowerCase().slice(0,-2));
  });

  $(".v_dateDD").numeric();
  $(".v_dateMM").numeric();
  $(".v_dateYY").numeric();

  $('.v_dateDD').mask('00');
  $('.v_dateMM').mask('00');
  $('.YY').mask('00');
  $('.YYYY').mask('0000');


  $(".v_dateDD, .v_dateMM, .v_dateYY").keypress(function() {
    validate_date($(this));
  });
  $(".v_dateDD, .v_dateMM, .v_dateYY").keyup(function() {
    validate_date($(this));
  });

  // file upload

  files = new Array();
  $(document).on('change','.v_upload' , function()
  {
    files = this.files;
    var fieldId = $(this).attr("id");
    var maxsize = $(this).attr("maxsize");
    var extensions = $(this).attr("extensions");
    uploadFiles(fieldId, maxsize, extensions);
  });

  // file delete
  $(document).on('click', '.removeFile', function (e) {
    var key = $(this).attr("id");
    var fileDiv = $(this).parent();

    $.ajax({
      type: "POST",
      url: "../ajax/deleteFile/",
      data: { key: key },
      cache: false
    })
    .done(function( result ) {
      fileDiv.remove();
    })
    .fail(function(result) {
      console.log(result);
    })
    .always(function(result) {
    });

  });
  
});

function uploadFiles(fieldId, maxsize, extensions)
{
  var data = new FormData();
  $.each(files, function(key, value)
  {
    data.append(key, value);
  });

  $("#upload_loader_"+fieldId).show();

  $.ajax({
    url: "../ajax/upload/?maxsize=" + maxsize + "&extensions=" + extensions,
    type: 'POST',
    data: data,
    cache: false,
    dataType: 'json',
    processData: false,
    contentType: false,
    success: function(data, textStatus, jqXHR)
    {
      $("#error_"+fieldId).html(data.error);
      if(data.error != "")
        $("#error_"+fieldId).fadeIn().delay(5000).fadeOut();

      if(data.files != null) {
        $.each(data.files, function (key, value) {
          var fileDiv = "<div>" + value.name + "<div class='removeFile' id='" + value.realname + "'></div></div>";
          $("#files_" + fieldId).append(fileDiv);
        });
      }

      correct_height();
      $("#upload_loader_"+fieldId).hide();
    },
    error: function(jqXHR, textStatus, errorThrown)
    {
      $("#upload_loader_"+fieldId).hide();
      console.log('ERRORS: ' + textStatus);
    }
  });
}

function submit()
{
console.log("submit() called");

  validated = 0;
  var fields = [];

  $( ".field" ).each(function( index ) {
  
    var type = $(this).attr("class").replace("field ", "");
    var name = $(this).parent().find("label").html().trim().replace("<b> * </b>", "").trim();
    var id = "";
    var value = "";
    
    if(type == "input")
    {
      id = $(this).children("input").attr("id").replace("field_", "");
      value = $("#field_"+id).val();
      validate_field($("#field_"+id), type);
    }
    else if(type == "text")
    {
      id = $(this).children("textarea").attr("id").replace("field_", "");
      value = $("#field_"+id).val();
      validate_field($("#field_"+id), type);
    }
    else if(type == "name")
    {
      id = $(this).children("input").first().attr("id").replace("field_", "").replace("F", "");
      value = $("#field_"+id+"F").val() + " " + $("#field_"+id+"L").val();
      validate_field($("#field_"+id+"F"), type);
      validate_field($("#field_"+id+"L"), type);
    }
    else if(type == "email")
    {
      id = $(this).children("input").attr("id").replace("field_", "");
      value = $("#field_"+id).val();
      validate_field($("#field_"+id), type);
    }
    else if(type == "phone")
    {
      id = $(this).children("input").attr("id").replace("field_", "");
      value = $("#field_"+id).val();
      validate_field($("#field_"+id), type);
    }
    else if(type == "number")
    {
      id = $(this).children("input").attr("id").replace("field_", "");
      value = $("#field_"+id).val();
      validate_field($("#field_"+id), type);
    }
    else if(type == "website")
    {
      id = $(this).children("input").attr("id").replace("field_", "");
      value = $("#field_"+id).val();
      validate_field($("#field_"+id), type);
    }
    else if(type == "date")
    {
      id = $(this).children("input").attr("id").replace("field_", "").replace("DD", "").replace("MM", "").replace("YY", "");
      value = $("#field_"+id).val();
      if(value != undefined)
        validate_field($("#field_"+id), type);
      else
      {
        var dd = $("#field_"+id+"DD").val();
        if(dd != undefined)
          validate_field($("#field_"+id+"DD"), type);
        var mm = $("#field_"+id+"MM").val();
        if(mm != undefined)
          validate_field($("#field_"+id+"MM"), type);
        var yy = $("#field_"+id+"YY").val();
        if(yy != undefined)
          validate_field($("#field_"+id+"YY"), type);

        if(dd == undefined)
        {
          if(mm == undefined)
            value = yy;
          else
            value = mm + " / " + yy;
        }
        else
          value = dd + " - " + mm;
      }
    }
    else if(type == "time")
    {      
      id = $(this).children("input").first().attr("id").replace("field_", "").replace("H", "");
      value = $("#field_"+id+"H").val() + ":" + $("#field_"+id+"M").val();
      validate_field($("#field_"+id+"H"), type+"H");
      validate_field($("#field_"+id+"M"), type+"M");
    }
    else if(type == "checkbox")
    {
      id = $(this).attr("id").replace("field_", "");
      value = "";
      $("#field_"+id+" input[type=checkbox]:checked").each(function( index ) {
        value += $( this ).val() + ",";
      });
      if(value != "")
        value = value.slice(0,-1);
      validate_radio($(this), value);
    }
    else if(type == "radio")
    {
      id = $(this).attr("id").replace("field_", "");
      value = $('input[name=radio_field_'+id+']:checked').val();
      validate_radio($(this), value);
    }
    else if(type == "select")
    {
      id = $(this).children("select").attr("id").replace("field_", "");
      value = $("#field_"+id).val();
    }
    else if(type == "address")
    {
      var elementID = $(this).children(".address_fields").children("input").first().attr("id");
      if(elementID == undefined)
        elementID = $(this).children(".address_fields").children("select").first().attr("id");
      id = elementID.replace("field_", "").replace("st", "").replace("st2", "").replace("ct", "").replace("rg", "").replace("zp", "").replace("cy", "");
      
      var st = $("#field_"+id+"st").val();  if(st != "" && st != undefined)    value += st + ", ";
      var st2 = $("#field_"+id+"st2").val();  if(st2 != "" && st2 != undefined)  value += st2 + ", ";
      var ct = $("#field_"+id+"ct").val();  if(ct != "" && ct != undefined)    value += ct + ", ";
      var rg = $("#field_"+id+"rg").val();  if(rg != "" && rg != undefined)    value += rg + ", ";
      var zp = $("#field_"+id+"zp").val();  if(zp != "" && zp != undefined)    value += zp + ", ";
      var cy = $("#field_"+id+"cy").val();  if(cy != "" && cy != undefined && cy != null) value += cy;
      if($("#field_"+id+"cy").html() != undefined && (cy == undefined || cy == null) )
        cy = "";

      validate_address($(this), st, st2, ct, rg, zp, cy);
    }
    else if(type == "upload")
    {
      id = $(this).children(".attachedFiles").attr("id").replace("files_field_", "");
      var q = 0;
      value = "";

      $(this).find(".removeFile").each(function() {
        q++;
        value += $(this).attr("id") + ",";
      });
      value = value.slice(0,-1);

      var req = $(this).children(".attachedFiles").attr("req")*1;
      if(req == undefined)
        req = 0;
      if(req == 1 && q == 0)
      {
        $(this).children(".uploadError").html("This field is required.");
        $(this).children(".uploadError").fadeIn().delay(5000).fadeOut();
        validated--;
      }
    }

    if(value == undefined)
      value = "";
    
    fields.push( { id:id, value:value, type:type, name:name } );
  });

console.log(validated);
  
  if(validated < 0)
  {
    submit_shake();
    submit_pressed = false;
    return false;
  }
  
  console.log(fields);

  wix_hive(fields);

  $("#loader").show();
  $.ajax({
    type: "POST",
    url: "../ajax/submit/",
    dataType: "json",
    data: {
        compId:compId,
        instance:instance,
        fields: fields,
        ip: ip
      },
    cache: false
  })
  .done(function( result ) {
    console.log(result);
    if(result.submissionId > 0)
    {
      submited();
    }
    else
    {
      show_error();
    }
  })
  .fail(function(result) {
    console.log(result);
    show_error();
  })
  .always(function(result) {
    submit_pressed = false;
    $("#loader").hide();
    correct_height();
  });
}

function wix_hive(fields)
{
  var additional = [];
  var name = "";
  var email = "";
  var phone = "";
  var address = "";

  for(var i in fields) {
    if(fields[i].type == "name" && name == "") {
	name = { "first": fields[i].value };
    }
    else if(fields[i].type == "email" && email == "") {
      email = [{ "tag": "main", "email": fields[i].value }];
    }
    else if(fields[i].type == "phone" && phone == "") {
      phone = [{ "tag": "main", "phone": fields[i].value }];
    }
    else if(fields[i].type == "address" && address == "") {
      address = [{ "tag": "home", "address": fields[i].value }];
    }
    else {
      additional.push({"name": fields[i].name , "value":fields[i].value  });
    }
  }
  
  var activity =
  {
    type:"form/contact-form",
    info:{
      subject:"New Magic Submission",
      content:{message:"You have New Magic Submission!"},
      additionalFields:additional
    },
    contactUpdate:{
      name: name,
      emails: email,
      phones: phone,
      addresses: address
    }
  };

  var onSuccess = function(d){console.log("Activity ID: " + d.activityId + ", Contact ID: " + d.contactId)};
  var onFailure = function(d){console.log("Failure message:" + d)};
  Wix.Activities.postActivity(activity, onSuccess, onFailure);
}

function submit_shake()
{
  var dir = "left";
  if($("#submit").css("margin-left") == "0px") {
    dir = "right";
  }

  for(i=0;i<5;i++) {
    if (dir == "left") {
      $("#submit").animate({marginLeft: '-=9px'}, 50);
      $("#submit").animate({marginLeft: '+=9px'}, 50);
    }
    else {
      $("#submit").animate({marginRight: '-=9px'}, 50);
      $("#submit").animate({marginRight: '+=9px'}, 50);
    }
  }
}

function show_error()
{
  $("#error").show(400);
  setTimeout(function() { $("#error").hide(400); }, 5000);
}

function submited()
{
  $("#form").remove();
  $("#submited").show(400);
}

function label_width(labelAlign) {
  if(labelAlign == 2) // top alignment
  {
    $('.label').width("100%");
  }
  else
  {
    if(w > widgetWidth / 1.5)
    {
      label_width(2);
      return;
    }
    $('.label').width(w+2);
  }
  field_width(labelAlign);
}

function field_width(labelAlign) {
  if(labelAlign == 2 ) // top alignment
  {
    $('.field').width(widgetWidth - 12);
  }
  else
  {  
    $('.field').width(widgetWidth - w - 40);
  }
}

function center_button()
{
  $('#submit').css('margin-left', ( $('#form').width() - $('#submit').width() - 20) / 2);
}

function correct_height()
{
	setTimeout(function() {
      var descM = $(".description").css("marginTop");
      var headerM = $(".header").css("marginTop");
      descM  = (descM == undefined) ? 8 : descM.replace("px", "") * 1.0;
      headerM  = (headerM == undefined) ? 8 : headerM.replace("px", "") * 1.0;
	  if(descM  + headerM == 16)
	{
		descM = 20;
		descM = 20;
	}
      console.log(descM);
      console.log(headerM);
      console.log($("#content").height());
		Wix.setHeight($("#content").height() + 2*(descM + headerM));
	}, 800);
}

function ajax_started()
{
  $.ajax({
    type: "POST",
    url: "../ajax/started/",
    data: {
        compId:compId,
        instance:instance,
        ip: ip
      },
    cache: false
  })
  .done(function( result ) {
    started = true;
  })
  .fail(function(result) {
    console.log("error");
    console.log(result);
  })
  .always(function(result) {
  });
}

function set_submited() {	
	$("#submitedonce").show();
	$("#form").hide();
	correct_height();
}

