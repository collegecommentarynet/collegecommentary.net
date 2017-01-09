// Site Search+ for Wix
// Copyright (c) Fast Simon Inc.
// wix_instantsearchplus_widget-V3.js


/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var _isp_endpoint = 'http://wix.instantsearchplus.com';
if (location.protocol == 'https:')	{
	var _isp_endpoint = 'https://acp-mobile.appspot.com';
}
var _isp_endpoint = 'https://wix-instantsearchplus-ssl.akamaized.net'; // Akamai CDN

var docCookies = {
  getItem: function (sKey) {
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
	if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
	var sExpires = "";
	if (vEnd) {
	  switch (vEnd.constructor) {
		case Number:
		  sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
		  break;
		case String:
		  sExpires = "; expires=" + vEnd;
		  break;
		case Date:
		  sExpires = "; expires=" + vEnd.toUTCString();
		  break;
	  }
	}
	document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
	if (!sKey || !this.hasItem(sKey)) { return false; }
	document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
	return true;
  },
  hasItem: function (sKey) {
	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
	var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
	for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
	return aKeys;
  }
};
		

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};


function getJSvars(script_name, var_name, if_empty) {
	var script_elements = document.getElementsByTagName('script');
	if(if_empty == null) {	var if_empty ='';	}

	for (a = 0; a < script_elements.length; a++) {
		var source_string = script_elements[a].src;
		if(source_string.indexOf(script_name)>=0) {		
		   var_name = var_name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		   var regex_string = new RegExp("[\\?&]"+var_name+"=([^&#]*)");
		   var parsed_vars = regex_string.exec(source_string);
		   if (parsed_vars == null) { return if_empty; }
		   else { return parsed_vars[1]; }
		  }
	   }
	return if_empty;
}	

function getParameterByName(name, default_val) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? default_val : decodeURIComponent(results[1].replace(/\+/g, " "));
}	

var CLIENT_VER = getJSvars('wix_instantsearchplus_widget', 'v', '1.0.321');

var MOBILE_ENDPOINT = getParameterByName('mobile', '0');
// the real Wix instance ID as described in dev.wix.com/docs/display/DRAF/App+Endpoints#AppEndpoints-WidgetEndpoint
var wix_instance = getParameterByName('instance', '');	


var is_mobile_useragent = ( /Android|BlackBerry|webOS|iPhone|iPod/i.test(navigator.userAgent));
var is_ipad_useragent = ( /iPad/i.test(navigator.userAgent));

var ie8_mode = false;

if (is_ie8 || is_mobile_useragent || is_ipad_useragent)	{
	// not grey background inline-suggestions
	ie8_mode = true;
}


if (ie8_mode)	{
	// IE8 Hacking
	var greybox = document.getElementById('grey');
	var inputbox= document.getElementById('acp_magento_search_id_main_page');
	
	greybox.style.display = 'none';
	inputbox.style.backgroundImage = 'url(' + _isp_endpoint + '/wix_widget/images/search_icon2.png)';
	inputbox.style.backgroundRepeat = 'no-repeat';
	inputbox.style.backgroundPosition = '5px center';	
	if (is_ie8)	{
		inputbox.style.height = '26px';	
	}
}	else	{
	document.getElementById('acp_magento_search_id_main_page').style.backgroundColor = 'transparent';	
}

try {
	var is_iphone_useragent = ( /iPhone/i.test(navigator.userAgent));
	if (is_iphone_useragent && screen.width>600)	{
		is_ipad_useragent = true;
		is_mobile_useragent = false;
	}
} catch (e)	{} 


if (Wix.Utils.getDeviceType()=='mobile' || is_mobile_useragent)	{
	MOBILE_ENDPOINT = '1';
}

var original_input_box_width;

function disable_inputbox(disable)	{
	var obj 	 = document.getElementById('acp_magento_search_id_main_page');
	var grey_obj = document.getElementById('grey');
	if (disable)	{		
		obj.readOnly = true;
		obj.value = '';
		grey_obj.value = placeholder;
	}	else	{
		obj.readOnly = false;
	}
}

var inputbox_min_width = '120px',   // '120px',
	inputbox_max_width = '317px',	// '120px',	// '331px',
	iframe_min_width = '195', 	// '195',
	iframe_max_width = '394',	// '404',
	iframe_editor_width = '202',
	iframe_editor_height = '50',
	iframe_height    = '50', // '600',
	dropdown_width   = '379',
	max_site_suggestions = 6,
	global_web_search_min_char = 999;
	 


if (MOBILE_ENDPOINT=='1')	{
	inputbox_min_width = '0px';
	inputbox_max_width = '218px';
	iframe_min_width = '66';
	iframe_max_width = '303';
	iframe_height    = '50';	// '300';
	dropdown_width   = '300';
	max_site_suggestions = 6;
	global_web_search_min_char = 999;
}	

var isp_pop_cache = new Array();
function isp_callback_pop2(data)	{
	if (data)	{
		for (var i=0; i<data.length; i++)	{
			var cur_term = data[i].label.toLowerCase();
			var cur_term_words = cur_term.split(' ');	// split into words...
			for (var w=0; w<cur_term_words.length; w++)	{
				var word = cur_term_words[w];
				if ( word.length < 4 || word.length > 14 || word.indexOf('&') >=0 || isp_pop_cache.indexOf(word)>-1 )	{	continue;	}
				isp_pop_cache.push( word );								
			}
		}
	}
}


var viewMode = Wix.Utils.getViewMode();
if (viewMode == 'editor')	{
	disable_inputbox(true);
	// Wix.resizeWindow(iframe_editor_width, iframe_editor_height, function(){ });				
}

Wix.addEventListener(Wix.Events.EDIT_MODE_CHANGE, function(data) {	
	var editorMode = data.editMode == 'editor'
    disable_inputbox( editorMode );
	if (editorMode)	{
		// Wix.resizeWindow(iframe_editor_width, iframe_editor_height, function(){ });				
	}
	Wix.getSiteInfo( function(siteInfo) {
		updateSiteInfo(siteInfo);
	});	
});
Wix.PubSub.subscribe("isp_navigation_out", function(event) { 
	document.getElementById('acp_magento_search_id_main_page').value = '';	
	document.getElementById('grey').value = placeholder;
}); 

Wix.PubSub.publish("isp_hidden_page_exist_wakeup", {exist:true}, true);

var isp_hidden_page_exist = false;
Wix.PubSub.subscribe("isp_hidden_page_exist", function(event) {
	isp_hidden_page_exist = true; 
});

if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

function api_do_full_text_search()	{	
	expand_collapse_search_box(false);
	
	var obj = document.getElementById('acp_magento_search_id_main_page');
	var query = obj.value.trim();
	if (query != "")	{
		openWixModal(query);		
	}	
}


document.getElementById('acp_magento_search_id_main_page').onkeyup = function(e){
	isp_get_gray_suggest();	
}


var myInput = document.getElementById("acp_magento_search_id_main_page");
if(myInput.addEventListener ) {	
	myInput.addEventListener('keydown',this.keyHandler,false);
} else if(myInput.attachEvent ) {
	myInput.attachEvent('onkeydown',this.keyHandler); /* damn IE hack */
}

function keyHandler(e){	
	expand_collapse_search_box( true );		// User is typing... let's make sure he gets the searchbox expanded
	
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){      // Enter pressed
	  api_do_full_text_search();
      return false;
    }
	if (keyCode == 9 || keyCode == 39)	{		// tab pressed or right arrow
		isp_get_gray_suggest_to_inputbox();
		try {	e.preventDefault();		} catch(e)	{}
		try {	e.stopPropogation();	} catch(e)	{}
		try {	e.cancelBubble();		} catch(e)	{}		
        
        return false;
	}
	
	/*
	DISABLING SPACE for now
	if (keyCode == 32)	{
		// space was chosen... 
		if (isp_get_gray_suggest_to_inputbox())	{
			return false;	//	copy to the searchbox only if there's something to copy...
		}
	}
	*/
	
	if (keyCode > 46)	{
		document.getElementById('grey').value = ' ';	//	first clear out the previous mess
	}
}

var editor_locale = Wix.Utils.getLocale();



function expand_collapse_search_box(expand)	{
	var obj = document.getElementById('acp_magento_search_id_main_page');
	var h = $jquery("ul.ui-autocomplete").outerHeight() + 60;	//	iframe_height;	
	if (Wix.Utils.getViewMode() == 'editor')	{	
		h = iframe_editor_height;			
	}
	if (expand)	{
		var w = iframe_max_width;
		if (Wix.Utils.getViewMode() == 'editor')	{	w = iframe_editor_width;	}
		original_inputbox_height = document.getElementById('acp_magento_search_id_main_page').offsetHeight;
		document.getElementById('acp_magento_search_id_main_page').style.height = original_inputbox_height + 'px';
		original_inputbox_height = document.getElementById('grey').offsetHeight;
		document.getElementById('grey').style.height = original_inputbox_height + 'px';
		Wix.setHeight(600, {overflow:true});
	}	else	{
		// Collapse			
		var w = iframe_min_width;
		if (Wix.Utils.getViewMode() == 'editor')	{	w = iframe_editor_width;	}
		
		Wix.setHeight(original_widget_height, {overflow:false});        				
	}
}

var original_inputbox_height = 31;
var original_widget_height   = 36;
Wix.getBoundingRectAndOffsets(function(data) {
    original_widget_height = data.rect.height;		
});


function search_focus()	{			
	expand_collapse_search_box(true);
	var obj = document.getElementById('acp_magento_search_id_main_page');
	if (obj.value != '')	{	
		setTimeout(function()	{
						try {
							$jquery(__acp.input_id_0).autocomplete("search", obj.value); 
						} catch(e)	{
							// We might not have the autocomplete jqeury loaded...				
						}
				   }, 400);					
	}
}

function search_blur()	{
	setTimeout(function()	{
			expand_collapse_search_box(false);
		}, 222);	//	Do a timeout to allow the user to click on the search button
}

function injectJS(url)	{
	var s = document.createElement('script');
	s.type = 'text/javascript';					
	try {
		s.setAttribute('rel', 'nofollow');
	} catch (e)	{}
	s.src = url;
	var x = document.getElementsByTagName('script')[0];
	x.parentNode.insertBefore(s, x);
}

function injectCSS(styles) {
	var css = document.createElement('style');
	css.type = 'text/css';
	if (css.styleSheet) {	css.styleSheet.cssText = styles;	}
	else {	css.appendChild(document.createTextNode(styles));	}
	document.getElementsByTagName("head")[0].appendChild(css);
}



function is_RTL( term )	{
	for (var i=0;i<term.length;i++){
		if ( (term.charCodeAt(i) > 0x590) && (term.charCodeAt(i) < 0x5FF) )  {	
			return true;
		}	
	}
	return false;
}

function isp_get_gray_suggest_to_inputbox()	{
	var cur_term = document.getElementById('acp_magento_search_id_main_page').value.toLowerCase();
	var grey_term= document.getElementById('grey').value.toLowerCase();
	var cur_term_len = cur_term.length;
	if (cur_term == grey_term.substr(0, cur_term_len))	{
		document.getElementById('acp_magento_search_id_main_page').value = document.getElementById('grey').value;
		return true;
	}	
	return false;
}




function isp_get_gray_suggest()	{
	try { 
		// don't do grey background suggests on minimal height searchboxes
		if (document.getElementById('acp_magento_search_id_main_page').offsetHeight < 26)	{	return;	 }	
	}	catch (e)	{}
	
	var found_suggest = '';

	var cur_term = document.getElementById('acp_magento_search_id_main_page').value;
	if (cur_term == '')	{	
		// The user hasn't typed anything (or cleared it out) - just show the placeholder text
		found_suggest = placeholder;	
	}	else	{		
		if ( MOBILE_ENDPOINT=='0' && is_RTL(cur_term) == false && is_RTL(placeholder) == false)	{	
			// Show the inline placeholder suggestions on desktop screens but not on mobiles
			// Don't show the gray text on RTL languages 
			var cur_term_lower = cur_term.toLowerCase();
			var cur_term_len   = cur_term.length;		
			
			for (var i=0;i<isp_pop_cache.length;i++)	{	// Prefix match for whole terms
				if (cur_term_lower == isp_pop_cache[i].substr(0, cur_term_len))	{	
					found_suggest = cur_term + isp_pop_cache[i].substr(cur_term_len);	// get the original user-typed string first (to maintain lower/upper)
					break;	
				}
			}			
			
			if (found_suggest == '')	{		// Do a word match!		
				var last_space_pos = cur_term.lastIndexOf(' ');
				if (last_space_pos > 1)	{	// Verify there's at least two words		
					var last_word = cur_term.substr( last_space_pos+1 );
					var last_word_len = last_word.length;
					if (last_word_len>0)	{
						for (var i=0;i<isp_pop_cache.length;i++)	{
							if (last_word == isp_pop_cache[i].substr(0, last_word_len))	{							
								found_suggest = cur_term.substr(0, last_space_pos+1) + isp_pop_cache[i];	// get the original user-typed string first (to maintain lower/upper) + the found word
								break;	
							}
						}	
					}
				}
			}		
		
			try	{
				var box_width = document.getElementById('acp_magento_search_id_main_page').clientWidth;	// Don't show the grey suggestions if no room!
				if (cur_term.length * 12 > box_width)	{	found_suggest = '';	}
			} catch (e)	{}
			
			if (found_suggest == '')	{
				found_suggest = ' ';	// To make sure we ain't showing the placeholder upon tab
			}
		}	
	}
	
	if (inline_predict)	{
		document.getElementById('grey').value = found_suggest;	
	}
}


var custom_css = null;
var placeholder = 'Search Site';
var related_web_searches = true;
var poweredBy = true;
var is_premium = false;
var is_over_usage = false;
var resultOpenInTab = false;
var inline_predict = true;
var dropdown_predict = true;

var site_base_url = null;	
var isp_load_once = null;

var acp_options = {			
	HOSTNAME: 		'editor.wix.com',	
	search_target:	"wix",
	MAX_INSTANT_SUGGESTIONS: max_site_suggestions,
	MIN_SUGGEST_WIDTH: dropdown_width,
	GLOBAL_MIN_CHARS: global_web_search_min_char	
};	

var base_site_url = '';
try {
	base_site_url = encodeURIComponent( document.referrer );
} catch (e) {}

var printed_log = false;
var isp_obj = {
	'base_url': null,
	'url':		null,
	'pages':	null
}

// instanceId will get a GUID like value - e.g. '12de5bae-01e7-eaab-325f-436462858228'
var instanceId = Wix.Utils.getInstanceId();

function isp_load_callback(data)	{
	// var data = JSON.parse(data);
	if ('css' in data)	{		
		custom_css = data['css'];	//	 Notice this is a Global variable!
		injectCSS( custom_css );	
		try {
			localStorage.setItem(instanceId+'custom_css', custom_css);	
		} catch (e) {}
	}
	
	if ('placeholderText' in data)	{
		placeholder = data['placeholderText'].replace('&apos;', "'").replace('&quot;', '"').replace('&amp;', '&') + '   ';	//	 Notice this is a Global variable!
		document.getElementById('isp_icon_id').setAttribute("title", placeholder);	
		if (is_RTL(placeholder))	{
			var rtl_css = "#grey, #acp_magento_search_id_main_page {text-align:right;}";
			injectCSS( rtl_css );
		}		
	}
	if ('detected_language' in data)	{
		try {
			isp_site_lang =  data['detected_language'];
			localStorage.setItem(base_site_url+'detected_language', data['detected_language']);		// the detected site language - to be used in the modal
		} catch (e) {}
	}
	
	try {
		localStorage.setItem(base_site_url+'placeholder', placeholder);	
	} catch (e) {}
	if (document.getElementById('acp_magento_search_id_main_page').value == '')	{
		// Don't put the placeholder if there's already text there
		document.getElementById('grey').value = placeholder;
		if (ie8_mode)	{
			document.getElementById('acp_magento_search_id_main_page').setAttribute('placeholder', placeholder);
		}
		
	}

	if ('relatedWebSearch' in data)	{
		if (data['relatedWebSearch'] == false || data['relatedWebSearch'] == 'false')	{
			related_web_searches = false;
			acp_options.GLOBAL_MIN_CHARS = 9999;	//	 god knows if the autocomplete widget was initialized or not
			try {
				__acp.GLOBAL_MIN_CHARS = 9999;			//	 god knows if the autocomplete widget was initialized or not
			} catch (e) {}
		}		
	}
	if ('premium' in data)	{
		is_premium = data['premium'];
	}
	
	if ( Wix.Utils.getViewMode() == 'editor' && localStorage) 	{		
		// Assuming here there's only a single user in the world editing in Wix the specific instanceId
		var prev_is_premium = localStorage.getItem(base_site_url+'isp_is_premium_' + instanceId);		
		if (prev_is_premium == false && is_premium == true)	{
			// Site owner has updated to premium now!
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];/*a.async=1;*/a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			ga('create', 'UA-32957572-9', 'instantsearchplus.com');
			ga('send', 'pageview');
			  
			ga('send', 'isp_upsell', 'isp_editor_upgrade_detected', instanceId);
			
			var isp_campaign = docCookies.getItem('isp_campaign');
			if (isp_campaign != null && isp_campaign != '')	{
				var js = _isp_endpoint + '/wix_upgrade_campaign?v=' + CLIENT_VER + '&instance=' + encodeURIComponent(instanceId) + '&isp_campaign=' + encodeURIComponent(isp_campaign);
				injectJS( js );			
			}
		}				
		try	{
			localStorage.setItem(base_site_url+'isp_is_premium_' + instanceId, is_premium);
		} catch (e) {}
	}
	
	
	if ('over_usage' in data)	{
		is_over_usage = data['over_usage'];
	}
	try {
		if (!printed_log)	{
			console.log('Site Search+ (Instance: ' + instanceId + ' | Premium: ' + is_premium + ' | Over-usage: ' + is_over_usage + ')');
			printed_log = true;
		}
	} catch (e) {}
		
	if ('poweredBy' in data)	{
		poweredBy = data['poweredBy'];
	}
	if ('resultOpenInTab' in data)	{
		resultOpenInTab = data['resultOpenInTab'];
	}	
	isp_db_set('resultOpenInTab', resultOpenInTab);
	isp_obj['resultOpenInTab'] = resultOpenInTab;
	if ('inline_predict' in data)	{
		inline_predict = data['inline_predict'];
	}
	if ('dropdown_predict' in data)	{
		dropdown_predict = data['dropdown_predict'];
	}	
	if (dropdown_predict == false || dropdown_predict == 0 || dropdown_predict == 'false')	{		
		setTimeout(function() { try { $jquery(__acp.input_id_0).autocomplete("destroy"); } catch (e) {} }, 22);
		setTimeout(function() { try { $jquery(__acp.input_id_0).autocomplete("destroy"); } catch (e) {} }, 222);
		setTimeout(function() { try { $jquery(__acp.input_id_0).autocomplete("destroy"); } catch (e) {} }, 555);
		setTimeout(function() { try { $jquery(__acp.input_id_0).autocomplete("destroy"); } catch (e) {} }, 1111);		
	}
	
	var contact_form = false;
	if ('contact_form' in data)	{	contact_form = data['contact_form'];	}
	try {
		localStorage.setItem(base_site_url+'contact_form', contact_form);	
	} catch (e) {}
	
	document.getElementById('acp_modal_body').style.display ='';
	
	if (is_over_usage == true || is_over_usage == 1 || is_over_usage == 'true')	{
		try { 
			var msg = '%c Site Search+ for Wix Over Capacity Alert - upgrade now to allow unlimited user searches';
			console.warn(msg, 'font-weight: bold; background: #ffc; color: #111');
		} catch (e) {}
		
		var srchBox = document.getElementById('acp_magento_search_id_main_page');	
		var srchGrey = document.getElementById('grey');	
		var	srchBtn = document.getElementById('isp_icon_id');	
		if (viewMode == 'editor')	{
			// disable the textbox			
			srchBox.setAttribute('readonly',true);
			srchBox.setAttribute('disabled',true);		
			srchGrey.value = 'Upgrade in Settings';
			srchGrey.style.backgroundColor = '#ee1111';
			// Disable the button		
			srchBtn.style.pointerEvents = 'none';			
		}	else	{
			// In the real site... just make it all invisible...
			srchBox.style.display = 'none';
			srchGrey.style.display = 'none';
			srchBtn.style.display = 'none';
		}
	}
	
	if (viewMode == 'editor' && 'retarget_tag' in data && data.retarget_tag != "")	{
		var retar = document.getElementById('ggl_retarget_id');
		if ( retar.src != data.retarget_tag  )	{
			retar.src = data.retarget_tag;
		}	
	}
	
}






Wix.getSitePages( function(sitePages) {
	isp_obj['pages'] = sitePages;	// do something with the site pages	
	try {
		localStorage.setItem(base_site_url+'sitePages', JSON.stringify(sitePages));	
	} catch (e) {}
});		



function _getSiteBaseUrl(url)	{
	var parser = parseUri( url );
	var url_ret = parser.protocol + '://' + parser.host;
	if (url_ret.indexOf('.wix.com')>0 || url_ret.indexOf('.wixsite.com')>0)	{
		// Wix free site 
		var path = parser.path;
		var second_slash_pos = path.indexOf('/', 1);
		if (second_slash_pos > 0)	{
			// trim stuff after the 2nd slash
			path = path.substr(0, second_slash_pos);
		}
		url_ret += path;
	}
	return url_ret;	
}

function getSiteBaseUrl(siteInfo)	{
	// hacking around the Wix missing baseUrl sometimes...
	if(siteInfo.baseUrl != undefined && siteInfo.baseUrl != "")	{
		return siteInfo.baseUrl;
	}
	
	return _getSiteBaseUrl(siteInfo.url)
}

// Verify that the searchbox is loaded before adding the dropdown script
var max_polites_retries = 300;

var politeInterval = setInterval(function() {
		max_polites_retries = max_polites_retries - 1;
		if (max_polites_retries < 0)	{	clearInterval(politeInterval);	}
		var obj = document.getElementById('acp_magento_search_id_main_page');
		if (obj && obj.offsetHeight && obj.offsetHeight > 0) {
			clearInterval( politeInterval );
			injectJS(  _isp_endpoint + '/js/instantsearch-desktop.v.1.01.min.js?v=' + CLIENT_VER ); 
		}			
	}, 20);

	
function updateSiteInfo(siteInfo)	{
	isp_obj['url'] = siteInfo.url;
	isp_obj['base_url'] = siteInfo.baseUrl;
	
	var get_current_base_url = getSiteBaseUrl(siteInfo);
	if ( get_current_base_url.indexOf('editor.wix')==-1 )	{
		isp_obj['base_url'] = get_current_base_url;
		isp_load_once = false;	// Probably Wix moved to Preview mode and now we have the site URL so let's reload the widget!
	}		 			  

	if (!isp_load_once)	{
		var this_url = isp_obj['url'];
		if (this_url.indexOf('editor.wix.com')>=0)	{	this_url = 'editor.wix.com';	}
		var inject_url = _isp_endpoint + '/wix_widget_load?wix_v2=1&v=' + CLIENT_VER + '&ie8=' + (0+ie8_mode) + '&instance=' + encodeURIComponent(instanceId) + '&locale=' + encodeURIComponent(editor_locale) + '&url=' + encodeURIComponent(this_url) + '&site_base_url=' + encodeURIComponent(isp_obj['base_url']) + '&wix_instance=' + encodeURIComponent(wix_instance);
		try	{
			localStorage.setItem(base_site_url+'inject_url', inject_url);		
		} catch (e) {}
		injectJS( inject_url );			
		isp_load_once = true;
	}	
	
	if ( isp_obj['base_url'].indexOf('editor.wix')==-1 )	{
		acp_options.HOSTNAME = isp_obj['base_url'];
		var isp_pop_url = _isp_endpoint + '/pop?s=' + encodeURIComponent( acp_options.HOSTNAME) + '&instance=' + encodeURIComponent(instanceId) + '&v=' + CLIENT_VER + '&callback=isp_callback_pop2';
		injectJS( isp_pop_url );
	}	else	{
		acp_options.HOSTNAME = 'editor.wix.com';
	}		 

	try {
		localStorage.setItem(base_site_url+'CURRENT_URL', isp_obj['url']);	
	} catch (e) {}
		
}

try {
	var inject_url = localStorage.getItem(base_site_url+'inject_url');	
	if (inject_url != null && inject_url != '')	{	
		injectJS( inject_url );			
		isp_load_once = true;
	}
} catch (e)	{}
		
		
Wix.getSiteInfo( function(siteInfo) {
	updateSiteInfo(siteInfo);	
	try {
		localStorage.setItem(base_site_url+'siteInfo', JSON.stringify(siteInfo));	
	} catch (e) {}
});

Wix.addEventListener(Wix.Events.PAGE_NAVIGATION_CHANGE, function(data) {	
	Wix.getSiteInfo( function(siteInfo) {	  
		updateSiteInfo(siteInfo);
	});
});

Wix.addEventListener(Wix.Events.SITE_PUBLISHED, function(data) {	
	Wix.getSiteInfo( function(siteInfo) {	  
		var site_url = siteInfo.url;	
		var site_base_url = getSiteBaseUrl(siteInfo);
		
		var this_url = site_url;
		if (this_url.indexOf('editor.wix.com')>=0)	{	this_url = 'editor.wix.com';	}
		if (!isp_load_once)	{			
			injectJS(_isp_endpoint + '/wix_widget_load?wix_v2=1&v=' + CLIENT_VER + '&ie8=' + (0+ie8_mode) + '&instance=' + encodeURIComponent(instanceId) + '&locale=' + encodeURIComponent(editor_locale) + '&url=' + encodeURIComponent(this_url) + '&site_base_url=' + encodeURIComponent(site_base_url) ) + '&wix_instance=' + encodeURIComponent(wix_instance);
			isp_load_once = true;
		}
		if (site_url == null)	{	alert('publish error');		}		
		
				
		injectJS(_isp_endpoint + '/wix_site_published?wix_v2=1&v=' + CLIENT_VER + '&instance=' + encodeURIComponent(instanceId) + '&locale=' + encodeURIComponent(editor_locale) + '&url=' + encodeURIComponent(this_url) + '&site_base_url=' + encodeURIComponent(site_base_url) + '&wix_instance=' + encodeURIComponent(wix_instance));		
	});		
});	
	
Wix.addEventListener(Wix.Events.COMPONENT_DELETED, function(data) {
	Wix.getSiteInfo( function(siteInfo) {	  
		var site_url = siteInfo.url;	
		var site_base_url = getSiteBaseUrl(siteInfo);

		var this_url = site_url;
		if (this_url.indexOf('editor.wix.com')>=0)	{	this_url = 'editor.wix.com';	}
		
		injectJS(_isp_endpoint + '/wix_widget_deleted?wix_v2=1&v=' + CLIENT_VER + '&instance=' + encodeURIComponent(instanceId) + '&url=' + encodeURIComponent(this_url) + '&site_base_url=' + encodeURIComponent(site_base_url) );			
	});	   
});



var MobileUtils = {
    MOBILE_MAX_WIDTH:600,

    isMobile: function(){
        if (typeof this._isMobile === 'boolean'){
            return this._isMobile;
        }
        var screenWidth = this.getScreenWidth();
        var isMobileScreenSize = screenWidth < this.MOBILE_MAX_WIDTH;

        if(this.isTouchScreen() || this.isMSMobileDevice()){
            this._isMobile = isMobileScreenSize && true;
        } else {
            this._isMobile = false;
        }

        return this._isMobile;
    },

    getScreenWidth: function () {
        var sizes = this._getDeviceParamsByUA();
        if(sizes && sizes.width){
            return sizes.width;
        }
        return false;
    },

    getScreenHeight: function () {
        var sizes = this._getDeviceParamsByUA();
        if (sizes && sizes.height) {
            return sizes.height;
        }
        return false;
    },

    isAppleMobileDevice: function(){
        return (/iphone|ipod|ipad|Macintosh/i.test(navigator.userAgent.toLowerCase()));
    },

    isMSMobileDevice: function(){
    return (/iemobile/i.test(navigator.userAgent.toLowerCase()));
    },

    isAndroidMobileDevice:function(){
        return (/android/i.test(navigator.userAgent.toLowerCase()));
    },

    isNewChromeOnAndroid:function(){
        if(this.isAndroidMobileDevice()){
            var userAgent = navigator.userAgent.toLowerCase();
            if((/chrome/i.test(userAgent))){
                var parts = userAgent.split('chrome/');

                var fullVersionString = parts[1].split(" ")[0];
                var versionString = fullVersionString.split('.')[0];
                var version = parseInt(versionString);

                if(version >= 27){
                    return true;
                }
            }
        }
        return false;
    },

    isTouchScreen: function(){
        return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    },

    isViewportOpen: function() {
        return !!document.getElementById('wixMobileViewport');
    },

    _getDevicePixelRatio: function(){
        if(this.isMSMobileDevice()){
            return Math.round(window.screen.availWidth / document.documentElement.clientWidth);
        }
        return window.devicePixelRatio;
    },

    getInitZoom: function(){
        if(!this._initZoom){
            var screenWidth = this.getScreenWidth();
            this._initZoom = screenWidth /document.body.offsetWidth;
        }
        return this._initZoom;
    },

    getZoom: function(){
        var screenWidth = (Math.abs(window.orientation) === 90) ? this.getScreenHeight() : this.getScreenWidth();
        return (screenWidth /  window.innerWidth);
    },

    _getDeviceParamsByUA: function getDeviceParamsByUA(){
        if (!(navigator && navigator.userAgent)) {
            return false;
        }
        var ua = navigator.userAgent.toLowerCase();

        var specificAndroidParams = this._paramsForSpecificAndroidDevices(ua);

        var width = Math.min(screen.width, screen.height);
        var height = Math.max(screen.width, screen.height);
        if (specificAndroidParams) {
            width = specificAndroidParams.width;
            height = specificAndroidParams.height;
        }

        switch (true) {
            case /ip(hone|od|ad)/i.test(ua):
                break;
            case /android/i.test(ua):
                if (!this.isNewChromeOnAndroid() || specificAndroidParams) {
                    width = width / this._getDevicePixelRatio();
                    height = height / this._getDevicePixelRatio();
                }
                break;
            case /iemobile/i.test(ua):
                width = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
                break;
            default:
//                    width =  screen.width;
//                    height = screen.height;
                break;
        }
        return {width: width, height: height};
    },

    _paramsForSpecificAndroidDevices: function(userAgent){
        switch(true){
            case (/(GT-S5300B|GT-S5360|GT-S5367|GT-S5570I|GT-S6102B|LG-E400f|LG-E400g|LG-E405f|LG-L38C|LGL35G)/i).test(userAgent):
                return {width:240, height: 320};
                break;
            case (/(Ls 670|GT-S5830|GT-S5839i|GT-S6500D|GT-S6802B|GT-S7500L|H866C|Huawei-U8665|LG-C800|LG-MS695|LG-VM696|LGL55C|M865|Prism|SCH-R720|SCH-R820|SCH-S720C|SPH-M820-BST|SPH-M930BST|U8667|X501_USA_Cricket|ZTE-Z990G)/i).test(userAgent):
                return {width:320, height: 480};
                break;
            case (/(5860E|ADR6300|ADR6330VW|ADR8995|APA9292KT|C771|GT-I8160|GT-I9070|GT-I9100|HTC-A9192|myTouch4G|N860|PantechP9070|PC36100|pcdadr6350|SAMSUNG-SGH-I727|SAMSUNG-SGH-I777|SAMSUNG-SGH-I997|SC-03D|SCH-I405|SCH-I500|SCH-I510|SCH-R760|SGH-S959G|SGH-T679|SGH-T769|SGH-T959V|SGH-T989|SPH-D700)/i).test(userAgent):
                return {width:480, height: 800};
                break;
            case (/(DROIDX|SonyEricssonSO-02C|SonyEricssonST25i)/i).test(userAgent):
                return {width:480, height: 854};
                break;
            case (/(DROID3|MB855)/i).test(userAgent):
                return {width:540, height: 960};
                break;
            case (/F-05D/i).test(userAgent):
                return {width:720, height: 1280};
                break;
            default:
                return false;
                break;
        }
    }
};


function openWixModal(query)	{
	var modal_width = 800;
	var modal_height = 670;
	if (MOBILE_ENDPOINT == '1')	{			
		modal_width =  MobileUtils.getScreenWidth() - 20 ; //  375;	//	parseInt(0.9*window.screen.width);
		modal_height = MobileUtils.getScreenHeight()- 20 ;	// 500;	//	parseInt(0.45*window.screen.height);		
		/*switch ( ua_model )	{
			'iPhone': 
				switch (ua_OS_version)	{
					case '7.0':
					case '6.0':
						modal_width = 600; modal_height = 1000; break;
					case '5.0': 
					case '4.0':
						modal_width = 600; modal_height = 900; break;
					default: break;
				}
			
				
			default:	break;
		}*/		
	}	
	if (is_ipad_useragent)	{
		modal_width = 940;
	}
	
	
	isp_db_set('premium', 		is_premium);
	isp_db_set('mobile', 		MOBILE_ENDPOINT);
	isp_db_set('v', 			CLIENT_VER);
	isp_db_set('instanceId', 	instanceId);	
	isp_db_set('poweredBy',		poweredBy);
	isp_db_set('related_web_searches', related_web_searches);
	isp_db_set('site_url', 		acp_options.HOSTNAME);
	
	
	if ( isp_hidden_page_exist )	{
		Wix.Utils.navigateToSection({ sectionId : 'search_results_page' }, encodeURIComponent(query), function(error){});
	}	else	{
		Wix.openModal(_isp_endpoint + '/wix_widget/wix_instantsearchplus_modal-V2.html?q=' + encodeURIComponent(query) + '&premium=' + is_premium + '&mobile=' + MOBILE_ENDPOINT + '&v='+CLIENT_VER + '&instanceId=' + encodeURIComponent(instanceId) + '&resultOpenInTab=' + resultOpenInTab + '&poweredBy=' + poweredBy + '&related_web_searches=' + related_web_searches + '&site_url=' + acp_options.HOSTNAME, modal_width, modal_height, onModalClose);
	}
	
	/*
	Wix.Utils.navigateToSection({ sectionId : 'search_results_page' }, encodeURIComponent(query), function(error){
		Wix.openModal(_isp_endpoint + '/wix_widget/wix_instantsearchplus_modal-V2.html?q=' + encodeURIComponent(query) + '&premium=' + is_premium + '&mobile=' + MOBILE_ENDPOINT + '&v='+CLIENT_VER + '&instanceId=' + encodeURIComponent(instanceId) + '&resultOpenInTab=' + resultOpenInTab + '&poweredBy=' + poweredBy + '&related_web_searches=' + related_web_searches + '&site_url=' + acp_options.HOSTNAME, modal_width, modal_height, onModalClose);	
	});
	*/

     
	
	
	
}	

var onModalClose = function(message) { 	
	in_full_text_search_mode = false;
	expand_collapse_search_box( false );
	if (message && message.message && message.message.url)	{
		window.top.location = message.message.url;
	}
}

function isp_db_set(key,val)	{
	try	{ 	
		localStorage.setItem('isp_'+key, val); 
	} catch (e)	{
		docCookies.setItem('isp_'+key, val);
	}
}

/*
Wix.addEventListener(Wix.Events.WINDOW_PLACEMENT_CHANGED, function(data) {
	if (data < 2)	{
		// top left and top positions
		document.getElementById('acp_btn').style.display = 'none';
		document.getElementById('acp_magento_search_id_main_page').style.float = 'left';
		document.getElementById('acp_btn_left').style.display = '';
	}	else	{
		// top right
	}
});
*/
				
				
				
/*
setTimeout(function()	{
				expand_collapse_search_box( false );	//	 during initialization... let's make sure we operate according to the most recent code
			}, 3333);
*/
try {
	document.getElementById('acp_btn').blur();
} catch (e) {}
	

