// validation

var error_req		= "This field is required.";
var error_min		= "Must be min ";
var error_max		= "Must be max ";
var error_len		= " characters.";
var error_email		= "Please enter a valid email.";
var error_phone		= "Please enter a valid phone number.";
var error_website	= "Please enter a valid url.";
var error_time		= "Please enter a valid time.";

function validate_radio(div, value)
{
	var req	= div.attr("req")*1;
	if(req == undefined)
		req = 0;
		
	if(req == 1 && (value == undefined || value == ""))
	{
		div.children(".validation_error").html(error_req);
		div.children(".validation_error").show();
		validated--;
		return;
	}
	div.children(".validation_error").hide();
}

function validate_address(div, st, st2, ct, rg, zp, cy)
{
	div.find('input[type=text],select').removeClass("fieldValidationError");
	var req	= div.attr("req")*1;
	if(req == undefined)
		req = 0;	
		
	if(req == 1 && (st == "" || st2 == "" || ct == "" || rg == "" || zp == "" || cy == ""))
	{
		div.children(".validation_error").html(error_req);
		var i = 1;		
		if(st == "")
			div.find('input[type=text]').filter(':nth-child('+i+')').addClass("fieldValidationError");
		if(st != undefined) 
			i++;
		if(st2 == "")
			div.find('input[type=text]').filter(':nth-child('+i+')').addClass("fieldValidationError");
		if(st2 != undefined) 
			i++;
		if(ct == "")
			div.find('input[type=text]').filter(':nth-child('+i+')').addClass("fieldValidationError");
		if(ct != undefined) 
			i++;
		if(rg == "")
			div.find('input[type=text]').filter(':nth-child('+i+')').addClass("fieldValidationError");
		if(rg != undefined) 
			i++;
		if(zp == "")
			div.find('input[type=text]').filter(':nth-child('+i+')').addClass("fieldValidationError");
		if(zp != undefined) 
			i++;
		if(cy == "")
			div.find('select').addClass("fieldValidationError");

		div.children("input").addClass("fieldValidationError");
		validated--;
		return;
	}
	div.find('input[type=text],select').removeClass("fieldValidationError");
	div.children(".validation_error").hide();
}

function validate_date(field) {
	if (field.val() == "")
		return;
	if (field.val() > field.attr("max") * 1)
		field.val(field.attr("max") * 1);
	if (field.val() < field.attr("min") * 1)
	{
		field.addClass("fieldValidationError");
		field.parent().children(".validation_error").html(error_min + field.attr("min"));
		field.parent().children(".validation_error").show();
		validated--;
		return;
	}
	field.removeClass("fieldValidationError");
	field.parent().children(".validation_error").hide();
}

function validate_field(field, type)
{
	type 		=  type.replace(' fieldValidationError', '').trim();
	var req		= field.attr("req")*1;	if(req == undefined)	req = 0;
	var min		= field.attr("min")*1;	if(min == undefined)	min = 0;
	var max 	= field.attr("max")*1;	if(max == undefined)	max = 0;
	var minl	= field.attr("minl")*1;	if(minl == undefined)	minl = 0;
	var maxl 	= field.attr("maxl")*1;	if(maxl == undefined)	maxl = 0;
	var format	= field.attr("format");	if(format == undefined)	format = "";
	
	var val = field.val();
	var length = val.length;
	
	// input
	if(req == 1 && length == 0)
	{
		field.parent().children(".validation_error").html(error_req);
		field.addClass("fieldValidationError");
		validated--;
		return;
	}
	if(type != "number" && type != "date" && (min != 0 && length < min))
	{
		field.parent().children(".validation_error").html(error_min + min + error_len);
		field.addClass("fieldValidationError");
		validated--;
		return;
	}
	if(type != "number" && type != "date" && (max != 0 && length > max))
	{
		field.val(val.substring(0, max));
	}
	
	// number
	if(type == "number" && (min != 0 && val*1 < min))
	{
		field.parent().children(".validation_error").html(error_min + min + ".");
		field.addClass("fieldValidationError");
		validated--;
		return;
	}
	if(type == "number" && (max != 0 && val*1 > max))
	{
		field.parent().children(".validation_error").html(error_max + max + ".");
		field.addClass("fieldValidationError");
		validated--;
		return;
	}
	if(type == "number" && (minl != 0 && length < minl))
	{
		field.parent().children(".validation_error").html(error_min + minl + error_len);
		field.addClass("fieldValidationError");
		validated--;
		return;
	}
	if(type == "number" && (maxl != 0 && length > maxl))
	{
		field.val(val.substring(0, maxl));
	}
	
	// email
	if(type == "email" && !isValidEmailAddress(val))
	{
		field.parent().children(".validation_error").html(error_email);
		field.addClass("fieldValidationError");
		validated--;
		return;
	}
	
	// website
	if(type == "website" && !isValidURL(val))
	{
		field.parent().children(".validation_error").html(error_website);
		field.addClass("fieldValidationError");
		validated--;
		return;
	}
	
	//time
	if(type == "time")
	{
		var sID = field.attr("id");
		var timeType = sID[sID.length-1];
		if((timeType == "H" && !isValidTimeH(val, format)) || !isValidTimeM(val))
		{
			field.parent().children(".validation_error").html(error_time);
			field.addClass("fieldValidationError");
			validated--;
			return;			
		}
	}
	
	
	field.removeClass("fieldValidationError");
	field.parent().children(".validation_error").hide();
}

function isValidEmailAddress(emailAddress) {
	if(emailAddress == "")
		return true;
    var pattern = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,7})$/
    return pattern.test(emailAddress.toLowerCase());
}

function isValidURL(url) {
	if(url == "")
		return true;
    var pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,7})([\/\w \.-]*)*\/?$/
    return pattern.test(url);
};

function isValidTimeH(time, format) {
	
	if(time == "")
		return true;
		
	if(format == "AM/PM")
	{
		if(time < 0 || time > 11)
			return false;
	}
	else if(time < 0 || time > 23)
		return false;
    
    return true;
};

function isValidTimeM(time) {
	
	if(time == "")
		return true;
		
	if(time < 0 || time > 59)
		return false;
		
	return true;
};

//show error

$('body').on({
    mouseenter: function() {
        $(this).parent().children(".validation_error").show();
        $(this).parent().parent().children(".validation_error").show();
    },
    mouseleave: function() {
        $(this).parent().children(".validation_error").hide();
        $(this).parent().parent().children(".validation_error").hide();
    }
}, '.fieldValidationError, .validation_error');

 $(document).on("click",".validation_error",function() {
	 $(this).parent().find(".fieldValidationError").first().focus();
});
