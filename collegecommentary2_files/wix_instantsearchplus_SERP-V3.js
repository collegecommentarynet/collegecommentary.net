// InstantSearch+ for Wix - Oct. 2016
// Copyright (c) Fast Simon Inc.
// wix_instantsearchplus_modal-fixed.v.0.1.js

var _isp_endpoint = 'http://wix.instantsearchplus.com';
if (location.protocol == 'https:')	{
	var _isp_endpoint = 'https://acp-mobile.appspot.com';
}
var _isp_endpoint = 'https://wix-instantsearchplus-ssl.akamaized.net';

var base_site_url = '';
try {
	base_site_url = encodeURIComponent( document.referrer );
} catch (e) {}

var isp_locale = 'en';
try {
	isp_locale = Wix.Utils.getLocale().substring(0,2).toLowerCase();
} catch(e) {}

function getParameterByName(name, default_val) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? default_val : decodeURIComponent(results[1].replace(/\+/g, " "));
}



  
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
	
	
function isp_db_get(key, default_value)	{	
	try	{ 	
		var ret = localStorage.getItem('isp_'+key); 
	} catch (e)	{
		var ret = docCookies.getItem('isp_'+key);
	}
	if (ret == null || ret == '')	{
		ret = default_value;
	}	
	return ret;
}

var isp_obj_serp = {
	'base_url': null,
	'url':		null,
	'pages':	null
}
try {
	var r = localStorage.getItem(base_site_url+'sitePages');	// First attempt to get the pages from previous visits
	isp_obj_serp['pages'] = JSON.parse( r );
} catch (e) {}

Wix.getSitePages( function(sitePages) {
	isp_obj_serp['pages'] = sitePages;	
	try {
		localStorage.setItem(base_site_url+'sitePages', JSON.stringify(sitePages));	
	} catch (e) {}
});	

function updateSiteInfo(siteInfo)	{
	isp_obj_serp['url'] = siteInfo.url;
	isp_obj_serp['base_url'] = siteInfo.baseUrl;
}
Wix.getSiteInfo( function(siteInfo) {
	updateSiteInfo(siteInfo);	
});
Wix.addEventListener(Wix.Events.EDIT_MODE_CHANGE, function(data) {	
	Wix.getSiteInfo( function(siteInfo) {
		updateSiteInfo(siteInfo);
	});	
});
Wix.addEventListener(Wix.Events.PAGE_NAVIGATION_CHANGE, function(data) {	
	Wix.getSiteInfo( function(siteInfo) {	  
		updateSiteInfo(siteInfo);
	});
});
Wix.addEventListener(Wix.Events.PAGE_NAVIGATION_OUT, function(e) {
	Wix.PubSub.publish("isp_navigation_out", {value:"ok"}, true); 
});

Wix.PubSub.subscribe("isp_hidden_page_exist_wakeup", function(event) {
	Wix.PubSub.publish("isp_hidden_page_exist", {exist:true}, true); 
}, true);


function is_RTL( term )	{
	for (var i=0;i<term.length;i++){
		if ( (term.charCodeAt(i) > 0x590) && (term.charCodeAt(i) < 0x5FF) )  {	
			return true;
		}	
	}
	return false;
}

var is_premium = isp_db_get('premium', '0');
var CLIENT_VER = isp_db_get('v', '1.0.2');
var MOBILE_ENDPOINT = 0;	// var MOBILE_ENDPOINT = isp_db_get('mobile', '0');
var is_mobile_useragent = ( /Android|BlackBerry|webOS|iPhone|iPod/i.test(navigator.userAgent));
var is_ipad_useragent = ( /iPad/i.test(navigator.userAgent));

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

var COLOR_FACET_REGEX = new RegExp("^\#[0-9A-F]{6}(,\#[0-9A-F]{6})*$");
var COLOR_FACET_REGEX_SHORT = new RegExp("^\#[0-9A-F]{3}(,\#[0-9A-F]{3})*$")

var related_web_searches = isp_db_get('related_web_searches', 'true'); 
related_web_searches = 'false';	//	Feb. 26 2014 - avoid related searches for all folks
var poweredBy  			 = isp_db_get('poweredBy', 'true'); 
var resultOpenInTab      = isp_db_get('resultOpenInTab', 'true'); 
var resultOpenInTab_part;
if (resultOpenInTab == 'true')	{	
	resultOpenInTab_part = ' target="_blank" ';
}	else	{
	resultOpenInTab_part = ' target="_top" ';	
}

/* No need for dropdown support in SERP v3
var s = document.createElement('script');
s.type = 'text/javascript';					
s.src = _isp_endpoint + '/js/instantsearch-desktop.v.1.01.js?v=' + CLIENT_VER + '&mobile=' + MOBILE_ENDPOINT;
var x = document.getElementsByTagName('script')[0];
x.parentNode.insertBefore(s, x);
*/
var navLang = (navigator.language) ? navigator.language : navigator.userLanguage;
navLang = navLang.substring(0,2);
var detected_language = null;
try {
	detected_language = localStorage.getItem(base_site_url+'detected_language');	// The widget js entered this hopefully...
} catch (e) {}
if (detected_language != null && detected_language!='undefined' && detected_language.length == 2)	{	navLang = detected_language;	}

var isp_langs = {
	"en" : {
		"searched_but_couldnt_find_text": "Tell us what you are looking for HERE. Enter your email below so we can respond to you.", 
		"search_results_for_text": "Search results for",
		"loading_text": 'Loading results',
		"no_results_text": 'No results for',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggestions:</p><ul><li>Make sure all words are spelled correctly.</li><li>Try different keywords.</li><li>Try more general keywords.</li><li>Try fewer keywords.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Send us a message',
		"price_option_any": 'Any',
		"price_filter_name": 'Price'	
	},
	"he" : {
		"searched_but_couldnt_find_text": "ספר לנו מה אתה מחפש כאן. הזן את כתובת הדואל שלך למטה כדי שנוכל לענות לך.", 
		"search_results_for_text": "תוצאות חיפוש עבור",
		"loading_text": 'טוען תוצאות',
		"no_results_text": 'אין תוצאות עבור',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">הצעות:</p><ul><li>ודא שכל המילים מאוייתות נכון</li><li>נסה מילות מפתח אחרות</li><li>נסה מילות מפתח כלליות יותר</li><li>נסה פחות מילות מפתח</li></ul>',
		"in_category_text":  'בדף',
		"more_nav_text":  'עוד &#187;',
		"send_us_a_msg_text": 'שלח לנו הודעה',
		"price_option_any": 'Any',
		"price_filter_name": 'Price'	
	},	
	"bu" : {
		"searched_but_couldnt_find_text": "Кажете ни какво търсите ТУК. Въведете си мейла по-долу, за да можем да Ви отговорим", 
		"search_results_for_text": "Için arama sonuçlari",
		"loading_text": 'Loading results',
		"no_results_text": 'Не намерихме резултати за',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Предложения:</p><ul><li>Уверете се, че всички думи са написани правилно</li><li>Опитайте с други думи</li><li>Опитайте с повече основни думи</li><li>Опитайте с няколко думи</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Изпратете ни съобщение',
		"price_option_any": 'Any',
		"price_filter_name": 'Price'	
	},
	"ru" : {
		"searched_but_couldnt_find_text": "Расскажите, что вы ищете здесь. Введите адрес электронной почты ниже, чтобы мы могли ответить вам.", 
		"search_results_for_text": "Результаты поиска",
		"loading_text": 'Загружает результаты',
		"no_results_text": 'Нет результатов по',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Рекомендации:</p><ul><li>Убедитесь, что все слова написаны без ошибок.</li><li>Попробуйте использовать другие ключевые слова.</li><li>Попробуйте использовать более популярные ключевые слова.</li><li>Попробуйте уменьшить количество слов в запросе.</li></ul>',
		"in_category_text":  'в',
		"more_nav_text":  'более &#187;',
		"send_us_a_msg_text": 'отправить нам сообщение',
		"price_option_any": 'любой',
		"price_filter_name": 'цена'	
	}, "sr" : {
		"searched_but_couldnt_find_text": "Реците нам шта тражите ОВДЕ. Унесите вашу емаил испод тако да можемо да одговоримо на вас.", 
		"search_results_for_text": "Резултати претраге за",
		"loading_text": 'Učitavam rezultate',
		"no_results_text": 'Nema rezultata za',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Takodje pokušajte:</p><ul><li>Proverite da li su sve reči ispravno unete.</li><li>Pokušajte sa drugim ključnim rečima.</li><li>Pokušajte sa opštim frazama.</li><li>Pokušajte sa manje ključnih reči.</li></ul>',
		"in_category_text":  'u sekciji',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'пошаљите нам поруку',
		"price_option_any": 'Any',
		"price_filter_name": 'Price'	
	}, "de" : {
		"searched_but_couldnt_find_text": "Sagen Sie uns, was Sie hier suchen. Geben Sie Ihre e-Mail unten, damit wir Ihnen antworten.", 
		"search_results_for_text": "Suchergebnisse für",
		"loading_text": 'Ergebnisse werden geladen',
		"no_results_text": 'Keine Ergebnisse für',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Vorschläge:</p><ul><li>Achten Sie darauf, dass alle Wörter richtig geschrieben sind.</li><li>Probieren Sie es mit anderen Suchbegriffen.</li><li>Probieren Sie es mit allgemeineren Suchbegriffen.</li><li>Probieren Sie es mit weniger Suchbegriffen.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'mehr &#187;',
		"send_us_a_msg_text": 'Senden Sie uns eine Nachricht',
		"price_option_any": 'Jeder',
		"price_filter_name": 'Preis'	
	}, "fr" : {
		"searched_but_couldnt_find_text": "Dites-nous ce que vous cherchez ici. Entrez votre email ci-dessous afin que nous puissions vous répondre.", 
		"search_results_for_text": "Résultats de recherche pour",
		"loading_text": 'Chargement des résultats',
		"no_results_text": 'Pas de résultats pour',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggestions:</p><ul><li>Vérifiez l’orthographe des termes de recherche.</li><li>Essayez d\'autres mots.</li><li>Utilisez des mots clés plus généraux.</li><li>Spécifiez un moins grand nombre de mots.</li></ul>',
		"in_category_text":  'dans',
		"more_nav_text":  'plus &#187;',
		"send_us_a_msg_text": 'Envoyez-nous un message',
		"price_option_any": 'Tout',
		"price_filter_name": 'Prix'	
	}, "it" : {
		"searched_but_couldnt_find_text": "Tell us what you are looking for HERE. Enter your email below so we can respond to you.", 
		"search_results_for_text": "Facci sapere che cosa stai cercando qui. Inserisci la tua email qui sotto in modo che possiamo rispondere a voi.",
		"loading_text": 'Caricamento dei risultati',
		"no_results_text": 'Nessun risultato per',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggerimenti:</p><ul><li>Assicurarsi che tutte le parole siano state digitate correttamente.</li><li>Provare con parole chiave diverse.</li><li>Provare con parole chiave più generiche.</li><li>Provare con un numero minore di parole chiave.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'di più &#187;',
		"send_us_a_msg_text": 'Inviaci un messaggio',
		"price_option_any": 'Qualsiasi',
		"price_filter_name": 'Prezzo'	
	}, "pt" : {
		"searched_but_couldnt_find_text": "Diga-nos o que você está procurando aqui. Digite seu email abaixo para que possamos responder a você.", 
		"search_results_for_text": "Resultados da pesquisa para",
		"loading_text": 'Carregando resultados',
		"no_results_text": 'Nenhum resultado para',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Sugestões:</p><ul><li>Certifique-se de que todas as palavras estejam escritas corretamente.</li><li>Tente palavras-chave diferentes.</li><li>Tente palavras-chave mais genéricas.</li><li>Tente usar menos palavras-chave.</li></ul>',
		"in_category_text":  'em',
		"more_nav_text":  'mais &#187;',
		"send_us_a_msg_text": 'Envie-nos uma mensagem',
		"price_option_any": 'Qualquer',
		"price_filter_name": 'Preço'	
	}, "da" : {
		"searched_but_couldnt_find_text": "Fortæl os, hvad du søger her. Indtast din e-mail nedenfor, så vi kan svare dig.", 
		"search_results_for_text": "Søgeresultat for",
		"loading_text": 'Henter resultater',
		"no_results_text": 'Ingen resultater for',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Forslag:</p><ul><li>Sørg for, at alle ord er stavet korrekt.</li><li>Prøv forskellige søgeord.</li><li>Prøv mere generelle søgeord.</li><li>Prøv færre søgeord.</li></ul>',
		"in_category_text":  'i',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Send os en besked',
		"price_option_any": 'Enhver',
		"price_filter_name": 'Pris'	
	}, "es" : {
		"searched_but_couldnt_find_text": "Si no encuentra el articulo deseado. Por favor ponga su email a continuación y nos pondremos en contacto con usted.", 
		"search_results_for_text": "Resultados de la búsqueda",
		"loading_text": 'Cargando resultados',
		"no_results_text": 'Ningún resultado para',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Sugerencias:</p><ul><li>Comprueba que todas las palabras están escritas correctamente.</li><li>Intenta usar otras palabras.</li><li>Intenta usar palabras más generales.</li><li>Intente usar menos palabras.</li></ul>',
		"in_category_text":  'en',
		"more_nav_text":  'más &#187;',
		"send_us_a_msg_text": 'Envíenos un mensaje',
		"price_option_any": 'Cualquier',
		"price_filter_name": 'Precio'	
	}, "fi" : {
		"searched_but_couldnt_find_text": "Kerro meille mitä etsit täältä. Kirjoita sähköpostiosoitteesi alla, jotta voimme vastata sinulle.", 
		"search_results_for_text": "Hakutulokset",
		"loading_text": 'Lataa tulokset',
		"no_results_text": 'Ei tuloksia',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Ehdotuksia:</p><ul><li>Varmista, että kaikki sanat on kirjoitettu oikein.</li><li>Kokeile eri hakusanoja.</li><li>Kokeile yleisempiä hakusanoja.</li><li>Vähennä hakusanoja.</li></ul>',
		"in_category_text":  'sisään',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Lähetä meille viesti',
		"price_option_any": 'Kaikki',
		"price_filter_name": 'Hinta'	
	},	"nl" : {
		"searched_but_couldnt_find_text": "Vertel ons wat u zoekt HIER. Voer uw e-mail hieronder in zodat wij op jou reageren.", 
		"search_results_for_text": "Zoekresultaten voor",
		"loading_text": 'resultaat wordt geladen',
		"no_results_text": 'Geen resultaten voor',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggesties:</p><ul><li>Zorg ervoor dat alle woorden goed gespeld zijn.</li><li>Probeer andere zoektermen.</li><li>Maak de zoektermen algemener.</li><li>Gebruik minder zoekwoorden.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Stuur ons een bericht',
		"price_option_any": 'Elke',
		"price_filter_name": 'Prijs'	
	},	"se" : {
		"searched_but_couldnt_find_text": "Berätta för oss vad du letar efter här. Fyll i din e-post nedan så att vi kan svara dig.", 
		"search_results_for_text": "Sökresultat för",
		"loading_text": 'Laddar',
		"no_results_text": 'Inga resultat för',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Förslag:</p><ul><li>Kontrollera att alla ord är rättstavade.</li><li>Försök med andra sökord.</li><li>Försök med mer allmänna sökord.</li><li>Försök med färre sökord.</li></ul>',
		"in_category_text":  'i',
		"more_nav_text":  'mer &#187;',
		"send_us_a_msg_text": 'Skicka oss ett meddelande',
		"price_option_any": 'någon',
		"price_filter_name": 'Pris'	
	},	"no" : {
		"searched_but_couldnt_find_text": "Fortell oss hva du leter etter her. Skriv inn din e nedenfor, slik at vi kan svare deg.'", 
		"search_results_for_text": "Søkeresultater for",
		"loading_text": 'Laster treff',
		"no_results_text": 'Ingen resultater for',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Forslag:</p><ul><li>Sjekk at alle ordene er stavet rett.</li><li>Prøv andre søkeord.</li><li>Prøv mer generelle søkeord.</li><li>Prøv færre søkeord.</li></ul>',
		"in_category_text":  'i',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Send oss en melding',
		"price_option_any": 'Noen',
		"price_filter_name": 'Pris'	
	},	"tr" : {
		"searched_but_couldnt_find_text": "BURAYA aradığınızı bize bildirin. Bu yüzden size cevap aşağıda E-postanızı girin.", 
		"search_results_for_text": "Için arama sonuçlari",
		"loading_text": 'yükleme sonuçlari',
		"no_results_text": 'Için sonuç yok',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Öneriler:</p><ul><li>Tüm kelimeleri dogru yazdiginizdan emin olun.</li><li>Baska anahtar kelimeleri deneyin.</li><li>Daha genel anahtar kelimeleri deneyin.</li><li>Daha az anahtar kelime deneyin.</li></ul>',
		"in_category_text":  'içinde',
		"more_nav_text":  'daha fazla &#187;',
		"send_us_a_msg_text": 'Bize bir mesaj göndermek',
		"price_option_any": 'herhangi bir',
		"price_filter_name": 'Fiyat'	
	}, "pl" : {
		"searched_but_couldnt_find_text": "Powiedz nam czego szukasz TUTAJ. Wpisz swój adres email poniżej, abyśmy mogli reagować na Ciebie.", 
		"search_results_for_text": "Wyniki wyszukiwania dla",
		"loading_text": 'Laduje wyniki',
		"no_results_text": 'Brak wyników dla',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Podpowiedzi:</p><ul><li>Sprawdz, czy wszystkie slowa zostaly poprawnie napisane.</li><li>Spróbuj uzyc innych slów kluczowych.</li><li>Spróbuj uzyc bardziej ogólnych slów kluczowych.</li><li>Spróbuj uzyc mniejszej liczby slów kluczowych.</li></ul>',
		"in_category_text":  'na',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Wyślij do nas wiadomość',
		"price_option_any": 'Dowolny',
		"price_filter_name": 'Cena'	
	},	"lv" : {
		"searched_but_couldnt_find_text": "Tell us what you are looking for HERE. Enter your email below so we can respond to you.", 
		"search_results_for_text": "Search results for",
		"loading_text": 'Loading results',
		"no_results_text": 'No results for',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggestions:</p><ul><li>Make sure all words are spelled correctly.</li><li>Try different keywords.</li><li>Try more general keywords.</li><li>Try fewer keywords.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Send us a message',
		"price_option_any": 'Jebkurš',
		"price_filter_name": 'Cena'	
	},	"cs" : {
		"searched_but_couldnt_find_text": "Tell us what you are looking for HERE. Enter your email below so we can respond to you.", 
		"search_results_for_text": "Search results for",
		"loading_text": 'Loading results',
		"no_results_text": 'No results for',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggestions:</p><ul><li>Make sure all words are spelled correctly.</li><li>Try different keywords.</li><li>Try more general keywords.</li><li>Try fewer keywords.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Send us a message',
		"price_option_any": 'Jakýkoli',
		"price_filter_name": 'Cena'	
	},	"el" : {
		"searched_but_couldnt_find_text": "Tell us what you are looking for HERE. Enter your email below so we can respond to you.", 
		"search_results_for_text": "Search results for",
		"loading_text": 'Loading results',
		"no_results_text": 'No results for',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggestions:</p><ul><li>Make sure all words are spelled correctly.</li><li>Try different keywords.</li><li>Try more general keywords.</li><li>Try fewer keywords.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Send us a message',
		"price_option_any": 'οποιαδήποτε',
		"price_filter_name": 'τιμή'	
	},	"ro" : {
		"searched_but_couldnt_find_text": "Tell us what you are looking for HERE. Enter your email below so we can respond to you.", 
		"search_results_for_text": "Search results for",
		"loading_text": 'Loading results',
		"no_results_text": 'No results for',
		"no_results_suggestion_text": '<p style="padding-left: 10px;">Suggestions:</p><ul><li>Make sure all words are spelled correctly.</li><li>Try different keywords.</li><li>Try more general keywords.</li><li>Try fewer keywords.</li></ul>',
		"in_category_text":  'in',
		"more_nav_text":  'More &#187;',
		"send_us_a_msg_text": 'Send us a message',
		"price_option_any": 'Orice',
		"price_filter_name": 'Preț'	
	}
}

var searched_but_couldnt_find_text 	= isp_langs['en']['searched_but_couldnt_find_text'];
var search_results_for_text 		= isp_langs['en']['search_results_for_text'];
var loading_text					= isp_langs['en']['loading_text'];
var no_results_text					= isp_langs['en']['no_results_text'];
var no_results_suggestion_text 		= isp_langs['en']['no_results_suggestion_text'];
var in_category_text 				= isp_langs['en']['in_category_text'];
var more_nav_text					= isp_langs['en']['more_nav_text'];
var send_us_a_msg_text				= isp_langs['en']['send_us_a_msg_text'];
var price_option_any				= isp_langs['en']['price_option_any'];
var price_filter_name 				= isp_langs['en']['price_filter_name'];

if (navLang in isp_langs) {
	if ('searched_but_couldnt_find_text' in isp_langs[navLang])	{ searched_but_couldnt_find_text = isp_langs[navLang]['searched_but_couldnt_find_text']; }
	if ('search_results_for_text' in isp_langs[navLang])		{ search_results_for_text = isp_langs[navLang]['search_results_for_text']; }
	if ('loading_text' in isp_langs[navLang])					{ loading_text = isp_langs[navLang]['loading_text']; }
	if ('no_results_text' in isp_langs[navLang])				{ no_results_text = isp_langs[navLang]['no_results_text']; }
	if ('no_results_suggestion_text' in isp_langs[navLang])		{ no_results_suggestion_text = isp_langs[navLang]['no_results_suggestion_text']; }
	if ('in_category_text' in isp_langs[navLang])				{ in_category_text = isp_langs[navLang]['in_category_text']; }
	if ('more_nav_text' in isp_langs[navLang])					{ more_nav_text = isp_langs[navLang]['more_nav_text']; }
	if ('send_us_a_msg_text' in isp_langs[navLang])				{ send_us_a_msg_text = isp_langs[navLang]['send_us_a_msg_text']; }
	if ('price_option_any' in isp_langs[navLang])				{ price_option_any = isp_langs[navLang]['price_option_any']; }
	if ('price_filter_name' in isp_langs[navLang])				{ price_filter_name = isp_langs[navLang]['price_filter_name']; }
}

// IMAGE GALLERY... [START]
var image_container_id = 'images_container';	// The div holding the images
var images_data, images_data_q;					// Internal array holding the image search gallery
var images_loaded_cnt = 0;						// Internal counter for total images fetched already
var image_total = 0;							// Internal counter for # of total images
var IMAGE_ROW_WIDTH  = GetWindowWidth()*0.85;	// Number of Pixels in a row
var IMAGE_MIN_HEIGHT = 100;						// Minimal image gallery height
var IMAGE_MAX_HEIGHT = 175;

function GetWindowWidth()  {
	var x = 0;
	if (self.innerHeight)	{
		x = self.innerWidth;
	}	else if (document.documentElement && document.documentElement.clientHeight)	{
		x = document.documentElement.clientWidth;
	}	else if (document.body)	{
		  x = document.body.clientWidth;
	}
	return x;
}


  
function fetch_image_size(image_data)	{
	var img = new Image();
	img.src = image_data.url;
	img.onload = function() {
		image_data.width = this.width;
		image_data.height=this.height;		
		check_all_images_fetched();		
	}
	img.onerror = function()	{
		image_data.width  = 0;
		image_data.height = 0;		
		check_all_images_fetched();
	}
}

function check_all_images_fetched()	{
	images_loaded_cnt += 1;
	var img_cnt_obj = document.getElementById('progress_images_counter');
	if (img_cnt_obj)	{	
		// verify that we still have the counter...
		img_cnt_obj.innerHTML = (image_total-images_loaded_cnt);	
	}
	if (images_loaded_cnt == image_total)	{
		if (!all_images_loaded_in_progress)	{	all_images_loaded();	}
		// Prepare for the next round zero-ing the counters		
		images_loaded_cnt = 0;		
	}
}

var all_images_loaded_in_progress = false;

function all_images_loaded()	{
	all_images_loaded_in_progress = true;
	var html = '<table>';
	var img_cnt = 0;
	var img_gallery_width, agg_row_width = 0, agg_row_index_start= 0, last_line = false;
	html += '<tr><td>';
	for (var i=0;i<images_data.length;i++)	{				
		// Calc what to fit in this row...				
		img_gallery_width = IMAGE_MIN_HEIGHT*(images_data[i].width)/(images_data[i].height);
		agg_row_width += img_gallery_width + 3;	// Add 3 pixels as extra padding 
		if ( agg_row_width > IMAGE_ROW_WIDTH || i==(images_data.length-1) )	{	// Ran out of space for this line (or just end of images...					
			// now we have extra pixels... let's make the images higher then IMAGE_ROW_WIDTH!	
			if (i==(images_data.length-1) && agg_row_width < IMAGE_ROW_WIDTH )	{	
				agg_row_width_ratio = (IMAGE_ROW_WIDTH - agg_row_width)/agg_row_width ;	// Let's compute the ratio				
				var right_image_height = IMAGE_MIN_HEIGHT * (1+agg_row_width_ratio);
				if (right_image_height > IMAGE_MAX_HEIGHT) {	right_image_height = IMAGE_MAX_HEIGHT;	}	//		var right_image_height = IMAGE_MIN_HEIGHT;	// last row... let's do it with the minimal height
				var last_to_include = images_data.length;
				last_line = true;
			}	else	{
				agg_row_width -= img_gallery_width;	// Avoid the last image width if it's the overflow image...
				agg_row_width_ratio = (IMAGE_ROW_WIDTH - agg_row_width)/agg_row_width ;	// Let's compute the ratio				
				var right_image_height = IMAGE_MIN_HEIGHT * (1+agg_row_width_ratio);
				var last_to_include = i;
				last_line = false;
			}
						
			for (var j=agg_row_index_start; j<last_to_include; j++)	{						
				var wix_title_url = images_data[j].title.replace(/([\'])/g, '');
				var	data_q 		  = images_data_q.replace(/([\'])/g, ''); 
				var tar_url 	  = images_data[j].target_url.replace(/([\'])/g, ''); 
				tar_url = tar_url.replace('_escaped_fragment_=', '#!');
				var onclick = ' onclick="api_openURL_modal_V3(\'' + data_q + '\', \'' + wix_title_url + '\',' + i + ', \'' + tar_url + '\', \'tab\', false, \'' + images_data[j].wix_page_id + '\'); return true;"';	
				var onhover = ' onmouseover=\'show_hide_img_title_div(' + j + ');\' onmouseout=\'show_hide_img_title_div(' + j + ');\' ';
				html += '<div style="display:inline-table; margin-right:7px"><a href="' + tar_url + '"' + onclick + resultOpenInTab_part + '>';	// title="' + images_data[j].title + '"
				var	this_width = images_data[j].width*right_image_height/images_data[j].height;
				if ( this_width >= IMAGE_ROW_WIDTH )	{
					// panoramic image
					html += '<img ' + onhover + ' style="max-width:' + IMAGE_ROW_WIDTH + 'px"  height="' + IMAGE_MIN_HEIGHT + 'px" src="' +  images_data[j].url + '"/>';
					this_width = IMAGE_ROW_WIDTH;
				}	else	{
					html += '<img ' + onhover + ' height="' + right_image_height + '" src="' +  images_data[j].url + '"/>';					 
				}
								
				html += '<div id="img_hover_' + j + '" class="img_hover_div"><div class="img_hover_div2"><span class="img_hover_span">' + images_data[j].width + '&nbsp;×&nbsp;' + images_data[j].height + '&nbsp;-&nbsp;' + images_data[j].title + ' &nbsp;</span></div></div>';
				html += '</a></div>';
			} 
						
			// Set it up for the next row...			
			agg_row_index_start = i;
			html += '</td></tr>'
			if ( i < (images_data.length-1) && !last_line && agg_row_width>3)	{
				html += '<tr><td style="padding-top:5px">';				
				i -= 1;	// Need the last image we dropped...				
			}			
			agg_row_width = 0;
		}		
		all_images_loaded_in_progress = false;
	}
	html += '</table>';
	try {
		document.getElementById(image_container_id).innerHTML = html;
	} catch (e)	{}
}
// IMAGE GALLERY... [END]



function show_hide_img_title_div(id)	{
	var obj = document.getElementById("img_hover_"+id).style;
	if (obj.display == 'block')	{	
		obj.display = 'none';	
	}	else	{
		obj.display = 'block';
	}
}








document.getElementById('search_res_progress').innerHTML = loading_text;

function injectCSS(styles) {
	var css = document.createElement('style');
	css.type = 'text/css';
	if (css.styleSheet) {	css.styleSheet.cssText = styles;	}
	else {	css.appendChild(document.createTextNode(styles));	}
	document.getElementsByTagName("head")[0].appendChild(css);
}

if (MOBILE_ENDPOINT == '0' && poweredBy == 'true')	{	
	injectCSS('.isp_watermark { display: inline }');
	// injectCSS('#search_res_container { overflow-y: scroll; }');	
}
			
function hideKeyboard(element) {
	var field = document.createElement('input');
	field.setAttribute('type', 'text');
	field.setAttribute('style', 'border:0;outline:none;');
	document.body.appendChild(field);

	setTimeout(function() {
		field.focus();
		setTimeout(function() {
			field.setAttribute('style', 'display:none;');
		}, 10);
	}, 10);

	return;
	
	// EARLIER APPROACH...
	
    element.setAttribute('readonly', 'readonly'); // Force keyboard to hide on input field.
    // element.setAttribute('disabled', 'true'); // Force keyboard to hide on textarea field.
    setTimeout(function() {
        element.blur();  //actually close the keyboard
        // Remove readonly attribute after keyboard is hidden.
        element.removeAttribute('readonly');
        // element.removeAttribute('disabled');
    }, 111);
}
	

function api_get_parent_breadcrumbs_of_wix_page( url )	{	
	if (typeof url != 'undefined' && isp_obj_serp && isp_obj_serp['pages'])	{					
		var w_url = url;			
		var frag = w_url.indexOf('#!');					
		if (frag >= 0)	{					
			var frag = w_url.indexOf('/', frag);
			if (frag == -1)	{	
				var frag = w_url.indexOf('|', frag);
			}	
			if (frag >= 0)	{
				w_url = w_url.substr(frag+1);		
				var first_level_page_name;
				for (var i=0;i<isp_obj_serp['pages'].length;i++)	{	// Scan through the site Wix pages...
					var p_url = isp_obj_serp['pages'][i].id;								
					if (p_url == w_url)	{	
						// First level navigation...
						return '';
					}
					if (!isp_obj_serp['pages'][i].title)	{	continue;	}
					first_level_page_name = ' <span class="in_category">'+ in_category_text + ' ' + isp_obj_serp['pages'][i].title + '</span>';
					if (isp_obj_serp['pages'][i].subPages)	{
						for (var j=0;j<isp_obj_serp['pages'][i].subPages.length;j++)	{
							if (isp_obj_serp['pages'][i].subPages[j].id == w_url && isp_obj_serp['pages'][i].subPages[j].title)	{																			
								return first_level_page_name;
							}								
						}
					}
				}
			}	
		}
	}	
	return '';
}

function js_trim(str)	{
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function api_get_category_of_wix_page( url )	{	
	if (typeof url != 'undefined' && isp_obj_serp && isp_obj_serp['pages'])	{					
		var w_url = url;			
		var frag = w_url.indexOf('#!');					
		if (frag >= 0)	{					
			var frag = w_url.indexOf('/', frag);
			if (frag == -1)	{	
				var frag = w_url.indexOf('|', frag);
			}	
			if (frag >= 0)	{
				w_url = w_url.substr(frag+1);					
				for (var i=0;i<isp_obj_serp['pages'].length;i++)	{	// Scan through the site Wix pages...
					var p_url = isp_obj_serp['pages'][i].id;			
					if (p_url == w_url && isp_obj_serp['pages'][i].title)	{	
						return js_trim( isp_obj_serp['pages'][i].title );
					}
					if (isp_obj_serp['pages'][i].subPages)	{
						for (var j=0;j<isp_obj_serp['pages'][i].subPages.length;j++)	{
							if (isp_obj_serp['pages'][i].subPages[j].id == w_url && isp_obj_serp['pages'][i].subPages[j].title)	{											
								return js_trim( isp_obj_serp['pages'][i].subPages[j].title );
							}								
						}
					}
				}
			}	
		}
	}	
	return '';
}

var acp_options = {			
	HOSTNAME: 		isp_db_get('site_url', 'editor.wix.com'),	
	search_target:	"wix",
	MAX_INSTANT_SUGGESTIONS: 0,
	GLOBAL_MIN_CHARS: 999,
	MIN_SUGGEST_WIDTH: 545,
	DISABLE_DROPDOWN: true
};	

if (MOBILE_ENDPOINT=='1' && false)	{	
	var searchbox = document.getElementById('acp_magento_search_id_main_page');
	
	searchbox.style.width 		 = '70%';
	searchbox.style.marginTop 	 = '5px';
	searchbox.style.marginBottom = '5px';
	
	var greybox = document.getElementById('grey');
	greybox.style.width 		= '65%';
	greybox.style.marginTop 	= '5px';
	greybox.style.marginBottom 	= '5px';
	
	var searchcontainer = document.getElementById('search-container-modal');
	searchcontainer.style.paddingTop 	= '5px';
	searchcontainer.style.paddingBottom = '5px';	
	searchcontainer.style.top = '0';
	searchcontainer.style.height = '50px';
	searchcontainer.style.position = 'fixed';
	
	var searchheader = document.getElementById('search_res_header');
	searchheader.style.display = 'none';

	/*
	var fb_reveal = document.getElementById('myModal');
	fb_reveal.style.display = 'none';
	*/
	
	var searchrescontainer = document.getElementById('search_res_container');
	//searchrescontainer.style.width = '75%';
	searchrescontainer.style.height = '350px';
	searchrescontainer.style.marginTop = '50px';
	searchrescontainer.style.overflowY = 'scroll';
	
	// var searchrescontainer = document.getElementById('isp_container');
	// searchrescontainer.style.overflowY = 'visible';
	
	
	acp_options.MIN_SUGGEST_WIDTH = 200;	
	acp_options.MAX_INSTANT_SUGGESTIONS =3;
}

function clear_facets()	{
	FACETS_DATA = [];
	FACETS_ORDERED_SELECTIONS = [];
}

var latest_full_text_search;
function api_do_full_text_search()	{
	// Called from the html modal search button
	clear_facets();
	do_full_text_search(document.getElementById('acp_magento_search_id_main_page').value, 1 , 13, false);
}


// instanceId will get a GUID like value - e.g. '12de5bae-01e7-eaab-325f-436462858228'
var instanceId = Wix.Utils.getInstanceId();	// var instanceId = isp_db_get('instanceId', '');
		
function do_full_text_search( search_term, page, keycode, onload )	{
	var search_term = trim11( search_term.replace(/\s\s+/g, ' ') );
	if (related_web_searches=='true')	{
		get_related_web_searches( search_term );
	}

	document.getElementById('search_res_progress').style.display = '';			// Show progress gif
	if (page==1)	{		
		document.getElementById('search_res_container').style.display = 'none';		// Hide results...
	}
	
	var cache_key  = get_isp_response_cache_key( search_term, page );
	latest_full_text_search = search_term;
	
	if ((cache_key in isp_response_cache) && (keycode != 13))	{ // for ENTER we need it to go into the loopback...
		setTimeout(function() { isp_srch_res( isp_response_cache[ cache_key ] ); }, 55);
	}	else	{
		var s = document.createElement('script');
		s.type = 'text/javascript';						
		var s_url = _isp_endpoint + '/full_text_search?wix_v3=1&p=' + page + '&keycode=' + keycode + '&instance=' + encodeURIComponent(instanceId) + '&q=' + encodeURIComponent(search_term) + '&s=' + encodeURIComponent(acp_options.HOSTNAME) + '&editor=' + editor_url + '&mobile=' + MOBILE_ENDPOINT + '&callback=isp_srch_res&v=' + CLIENT_VER + '&locale=' + encodeURIComponent( isp_locale ) + '&n=20';
		/*if (screen.height<800 && MOBILE_ENDPOINT == '0')	{	
			// Bloody IE on 1366x768 screens
			s_url += '&n=4';
		}*/
		/*
		if (editor_url==1)	{	
			s_url += '&r=' + Math.random();	
			
			var FB_LIKE_COOKIE = 'FB_LIKE_COOKIE';
			FB.Event.subscribe( 'edge.create', function(response) { 												  
										          $.cookie(FB_LIKE_COOKIE, -1); // User has liked us!				
											   } );
						
			// FACEBOOK LIKE MODAL to be shown every 3 times for folks who haven't liked us!
			var fb_cookie_num = parseInt( $.cookie(FB_LIKE_COOKIE) )
			if ( fb_cookie_num == null || isNaN(fb_cookie_num) )	{	fb_cookie_num = 0;	}	
			if (fb_cookie_num != -1)	{				
				if ( fb_cookie_num == 7 )	{	
					fb_cookie_num = 0;
					$('#myModal').reveal();	 					
				}			
				$.cookie( FB_LIKE_COOKIE, (fb_cookie_num+1) );			
			}
		}
		*/
			
		if ( true )	{	// FACETTED SEARCH IS ON!!!!!!
			s_url += '&facets=1';	
			var narrow = '';
			for (var j = 0; j < FACETS_ORDERED_SELECTIONS.length; j++) {
				var selected = FACETS_DATA[FACETS_ORDERED_SELECTIONS[j]];
				if (narrow != '')	{ narrow += ',';	}
				narrow += '["' + selected[0] + '","' + selected[2] + '"]'; 
			}
			/*
			if (FACET_SELECTED_PRICE_MIN != null && FACET_SELECTED_PRICE_MAX != null)	{	
				if (narrow != '')	{ narrow += ',';	}
				narrow += '"price":{"currency":"'+FACET_PRICE_CURRENCY+'","min":'+FACET_SELECTED_PRICE_MIN+',"max":'+FACET_SELECTED_PRICE_MAX+'}';				
			}
			*/
			
			if (narrow != '')	{
				s_url += '&narrow=' + encodeURIComponent( '[' + narrow + ']' );
			}			
		}		
			
		s.src = s_url;				
		var x = document.getElementsByTagName('script')[0];
		x.parentNode.insertBefore(s, x);	
	}
	
	if (MOBILE_ENDPOINT=='1')	{		
		hideKeyboard( document.getElementById('acp_magento_search_id_main_page') );			
	}	else	{
		if (onload)	{
			var obj = document.getElementById('acp_magento_search_id_main_page');
			obj.focus();
			obj.value = obj.value;
		}
	}
}




var related_response_cache = {};
function get_related_web_searches( search_term )	{
	if (!(search_term in related_response_cache))	{
		var s = document.createElement('script');
		s.type = 'text/javascript';						
		s.src = 'http://api.autocompleteplus.com/rl?q=' + encodeURIComponent(search_term) + '&l=' + encodeURIComponent(navLang) + '&callback=acp_rl_callback';
		var x = document.getElementsByTagName('script')[0];
		x.parentNode.insertBefore(s, x);
	}
}
function acp_rl_callback(data)	{
	if (data && data.query && data.items)	{
		related_response_cache[data.query] = data.items;
	}
}

function isp_change_page( page )	{
	// Show me more hyperlink
	document.getElementById('next_pager_' + page).style.display = 'none';
	do_full_text_search( latest_full_text_search, page, 0, false);
	
}


document.getElementById('acp_magento_search_id_main_page').onkeyup= function(e){	//**	onkeypress
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (
		(MOBILE_ENDPOINT=='0' && !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey && (keyCode >= 48 || keyCode == '13' || keyCode == '8')) ||
		(MOBILE_ENDPOINT=='1' && keyCode == '13')
		)	{
      // instant search on every keystroke
	  clear_facets();
	  do_full_text_search( document.getElementById('acp_magento_search_id_main_page').value, 1, keyCode, false );
	  setTimeout(function()	{
							  try {	  document.getElementById('ui-id-0').style.display = 'none';	}	catch (e)	{}
							  try {	  document.getElementById('ui-id-1').style.display = 'none';	}	catch (e)	{}
							  try {	  document.getElementById('ui-id-2').style.display = 'none';	}	catch (e)	{}							  
							}, 666);							
      return true;	//	false;
    }
}
function containsAllAscii(str) {
    return  /^[\000-\177]*$/.test(str) ;
}

function highlightWords( line, word ) {
	if (containsAllAscii(line))	{
		var regex = new RegExp( '(' + word + ')', 'gi' );
		return line.replace( regex, "<b>$1</b>" );
	}	else	{
		return line;
	}
}

function format_related_item( text )	{	
	var ret = '<span class="related_item">';
	ret += '<a href="#" onclick="api_openURL_modal(\'' + api_get_search_redirect_url( text ) + '\', \'tab\', false)">';
	ret	+= '&#9658; ' + text + '</a></span> ';
	return ret;
}

function format_related( search_term, recursive )	{
	if (!recursive && (typeof api_get_search_redirect_url === 'undefined' || !(search_term in related_response_cache)))	{	
		// Some JS in the desktop JS is not ready yet or maybe AC+ Related hasn't returned... give it another second...
		setTimeout(function(search_term)	{						
						var obj = document.getElementById('related_placeholder');
						if (obj) {
							obj.innerHTML = format_related( search_term, true );
							obj.style.display = '';
						}		
				   }, 1111);		
		return '<div id="related_placeholder" style="display:none"></div>';	
	}
	var ret = '';
	var num_related = 3;	// remember there's the term itself also! so it's 4
	if (MOBILE_ENDPOINT == '1')	{	return '';	}
	var max_char = 40;		// Avoid adding a related suggestion if the total chars is already above this!
	var cur_search_term = document.getElementById('acp_magento_search_id_main_page').value;
	var cur_char = cur_search_term.length;
	
	if ((related_web_searches == 'true') && (cur_search_term in related_response_cache))	{
		ret += '<div class="search_ads">Related web searches: ';
		ret += format_related_item(cur_search_term);	
		var relateds = related_response_cache[cur_search_term];
		if  (relateds && relateds.length>0)	{			
			for (var i=0;i<num_related && i<relateds.length;i++)	{
				if (relateds.length>=i)	{					
					cur_char += relateds[i].length;
					if (cur_char > max_char)	{	break;	}
					ret += format_related_item( relateds[i] );
				}
			}					
		}
		ret += '</div>';	
	}
	
	return ret;
}

var isp_response_cache = {};
function get_isp_response_cache_key( term, page)	{
	return term + '|' + page; 
}

function get_fb_share_html(title, url, summary)	{
	// var image = 'http://www.mydomain.com/images/myimage.png';
	var tar_url  = 'http://www.facebook.com/sharer.php?s=100&p[title]='+encodeURIComponent(title)+'&p[url]='+encodeURIComponent(url);	
	//+'&p[summary]='+encodeURIComponent(summary);	
	// +'&p[images][0]='+encodeURIComponent(image));
	var ret_html = ' <img src="' + _isp_endpoint + '/images/fb_share.gif" alt="Facebook" class="isp_share_button" title="Share on Facebook" onclick="popupwindow(\'' + tar_url + '\')"/>';	//	 onclick="window.open(\'' + tar_url + '\');"/>';
	return '';// ret_html;
}

/*function popupwindow(url)	{	// , title, w, h) {  
  var title="Share on Facebook";
  var w = 400;
  var h = 400;
  var left = 300;	// (screen.width/2)-(w/2);
  var top = 300;	// (screen.height/2)-(h/2);
  return window.open(url, title, "status=no,height=" + h + ",width=" + w + ",resizable=yes,left=" + left + ",top=" + top + ",screenX=" + left + ",screenY=" + top + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");  
} */

function popupwindow(url) {
	var width=520;
	var height=330;
    var leftPosition, topPosition;
    //Allow for borders.
    leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
    //Allow for title and status bars.
    topPosition = (window.screen.height / 2) - ((height / 2) + 50);
    
	/*
	var windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition +",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";
    u=location.href;
    t=document.title;
    window.open(url, windowFeatures);
	*/
	
	var win = window.open(url, "_blank", 'toolbar=no,location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+width+', height='+height);
	win.moveTo(leftPosition, topPosition);

    return false;
}

var FACETS_DATA = [];
var FACETS_ORDERED_SELECTIONS = [];
/*var FACET_SELECTED_PRICE_MIN, FACET_SELECTED_PRICE_MAX;
var FACET_PRICE_CURRENCY;*/

function do_faceted_search(element)	{
	if (element.classList == 'selected_facet_value')	{	
		return;	// already selected filter name - let's ignore
	}
	var facet_name  = element.getAttribute('facet_name');
	var facet_value = element.getAttribute('facet_value');
	if (facet_value == '')	{ facet_value = null;	}
	for (var i = 0; i < FACETS_DATA.length; i++) {
		if (FACETS_DATA[i][0] == facet_name) {
			FACETS_DATA[i][2] = facet_value;
			var new_selections = [];
			var null_facet_value = false;
			for (var j = 0; j < FACETS_ORDERED_SELECTIONS.length; j++) {
				if (FACETS_ORDERED_SELECTIONS[j] == i) {
					if (facet_value == null) {
						// clearing narrow constraint, remove it and all later constraints
						null_facet_value = true;
						break;
					} else {
						// narrow constraint value changed
						break;
					}
				} else {
					new_selections.push(FACETS_ORDERED_SELECTIONS[j]);
				}
			}
			if (!null_facet_value) {
				new_selections.push([i]);
			}
			FACETS_ORDERED_SELECTIONS = new_selections;
			break;
		}
	}
	do_full_text_search(document.getElementById('acp_magento_search_id_main_page').value, 1 , 13, false);
}

function is_IE(v) {
	try {
		var r = RegExp('msie' + (!isNaN(v) ? ('\\s' + v) : ''), 'i');
		return r.test(navigator.userAgent);
	} catch (e) {
		return false;
	}
}

/*
var price_slider_id = '';
function price_facet_change()	{
	setTimeout(function()	{
		var values = jQuery("#"+price_slider_id).slider("value");
		var del_pos = values.indexOf(';');
		var NEW_FACET_SELECTED_PRICE_MIN = values.substr(0,del_pos);
		var NEW_FACET_SELECTED_PRICE_MAX = values.substr(del_pos+1);
		if ( Math.abs(NEW_FACET_SELECTED_PRICE_MIN-FACET_SELECTED_PRICE_MIN)> 3 || Math.abs(NEW_FACET_SELECTED_PRICE_MAX-FACET_SELECTED_PRICE_MAX)> 3 )	{
			FACET_SELECTED_PRICE_MIN = NEW_FACET_SELECTED_PRICE_MIN;
			FACET_SELECTED_PRICE_MAX = NEW_FACET_SELECTED_PRICE_MAX;
				
			do_full_text_search(document.getElementById('acp_magento_search_id_main_page').value, 1 , 13, false);
		}
	}, 333);
}
*/

function get_narrow_value(data_narrow, facet_name) {
	if (data_narrow == null) {
		return null;
	}
	for (var i = 0; i < data_narrow.length; i++) {
		var pair = data_narrow[i];
		if (pair[0] == facet_name) {
			return pair[1];
		}
	}
	return null;
}

function trim11 (str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

function colorToHex(color) {
    if (color.substr(0, 1) === '#') {
        return color;
    }
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    
    var rgb = blue | (green << 8) | (red << 16);
    return digits[1] + '#' + rgb.toString(16);
};

function isp_srch_res(data)	{
	FACETS_DATA = [];
	/*FACET_SELECTED_PRICE_MIN = null;
	FACET_SELECTED_PRICE_MAX = null;
	FACET_PRICE_CURRENCY = null;*/
	
	var cur_text_entered = trim11( document.getElementById('acp_magento_search_id_main_page').value.replace(/\s\s+/g, ' ') );	
	var cache_key  = get_isp_response_cache_key( data.q, data.p );
	var cache_key2 = get_isp_response_cache_key( cur_text_entered, data.p );
	isp_response_cache[ cache_key ] = data;	//	place in the local memory for further caching etc
	if (cache_key2 in isp_response_cache)	{	
		data = isp_response_cache[cache_key2];	
	} 
	if (!(cache_key2 in isp_response_cache))	{
		return;
	}
	document.getElementById('search_res_progress').style.display = 'none';	// Hide progress gif
	document.getElementById('search_res_container').style.display = '';		// Show results...
	
	var cont 		= document.getElementById('search_res_container');
	var cont_header = document.getElementById('search_res_header');
	var html = '';
	var html_header = '';
	var MAX_FACET_OPTIONS = 10;
	var MAX_SUPPORTED_FACETS_COUNT = 5;
	var MAX_SUPPORTED_FACETS_COUNT_MOBILE = 2;
		
	if (data)	{	
		if (data.facets && !isEmptyDict(data.facets))	{
			document.getElementById('search_facets_container').style.display = '';
			var SUPPORTED_FACETS_COUNT = 1;
			document.getElementById('face_drop_container_1').style.display = 'none';
			document.getElementById('face_drop_container_2').style.display = 'none';
			document.getElementById('face_drop_container_3').style.display = 'none';
			document.getElementById('face_drop_container_4').style.display = 'none';
			var data_narrow = null;
			if (data.narrow) {
				data_narrow = JSON.parse(data.narrow);
			}
			for (var facet_name in data.facets) {
				var all_names = facet_name.split(';');
				var actual_name = "";
				for (var i=0;i<all_names.length;i++)	{
					var trimmed = all_names[i].trim();
					if (trimmed.length > 0) {
						actual_name = trimmed;
						break;
					}
				}
				// Change Price facet name according to the site detected language
				if (actual_name.toLowerCase() == 'price')	{
					actual_name = price_filter_name;					
				}

				var current_facet_data = [facet_name, actual_name, narrow_value];
				FACETS_DATA.push(current_facet_data);

				if (!data.facets[facet_name] || data.facets[facet_name].length < 2)	{
					// avoid filters with just one option (including the ANY option) ) {
					continue;
				}
				
				// All [facet_name]
				var	selected_facet_value_css_class = ' class="selected_facet_value" ';
				var narrow_value = get_narrow_value(data_narrow, facet_name);
				if (narrow_value)	{	// Something else is selected in this facet					
					selected_facet_value_css_class = '';
				}
				var facet_drop_list_html = '<li role="presentation">'
										  + '<a facet_name="' +facet_name+ '" facet_value=""' + selected_facet_value_css_class + ' style="padding-left:24px" role="menuitem" tabindex="-1" onclick="do_faceted_search(this)" href="#">' + price_option_any + ' ' + actual_name.toLowerCase() + '</a></li>';
										  
				// if (facet_name == 'price')	{	continue;	}
				var facet_drop_name = 'facet_drop_name_' + SUPPORTED_FACETS_COUNT
				
				document.getElementById('face_drop_container_' + SUPPORTED_FACETS_COUNT).style.display = '';
				document.getElementById(facet_drop_name).innerHTML = actual_name;
				
				for (var i=0;i<data.facets[facet_name].length && i<MAX_FACET_OPTIONS;i++)	{					
					var facet_option = data.facets[facet_name][i][0];	// drop the counter per each filter values... June 30 2016 //  + ' (' + data.facets[facet_name][i][1] +')';
					var is_color_facet = false;
					var actual_value = data.facets[facet_name][i][0];
					
					var rgb_matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
					if ( rgb_matchColors.exec(actual_value) )	{
						actual_value = colorToHex(actual_value);
					}
					if (actual_value && actual_value.toUpperCase().match(COLOR_FACET_REGEX) || actual_value.toUpperCase().match(COLOR_FACET_REGEX_SHORT) )	{
						// Color facet...
						is_color_facet = true;
						facet_option = '<table><tbody><tr><td><span  class="color_facet" style="background-color:' + actual_value.split(',')[0] + '"> </span></td>'
									 // + ' <td> &nbsp; (' + data.facets[facet_name][i][1] + ')</td>'
									 + '</tr></tbody></table>';
					} else if (facet_name != "Price") {
						actual_value = actual_value.split(',')[0].replace("\"", "QUOTES");
					}
					selected_facet_value_css_class = '';
					if (narrow_value && narrow_value == actual_value)	{
						selected_facet_value_css_class = ' class="selected_facet_value" ';
						current_facet_data[2] = narrow_value;
						var to_inner_html;
						if (is_color_facet)	{
							to_inner_html = current_facet_data[1] + ': <span class="color_facet_header" style="background-color:' + narrow_value.split(',')[0] + '"> </span>';
						} else {
							to_inner_html = current_facet_data[1] + ': ' + narrow_value.replace("QUOTES", "\"");
						}
						document.getElementById(facet_drop_name).innerHTML = to_inner_html;
					}
										
					facet_drop_list_html += '<li role="presentation">'
										  + '<a facet_name="' +facet_name+ '" facet_value="'  + actual_value + '"' + selected_facet_value_css_class + ' style="padding-left:24px" role="menuitem" tabindex="-1" onclick="do_faceted_search(this)" href="#">' 
										  + facet_option + '</a></li>';
				}				
				document.getElementById('face_drop_list_' + SUPPORTED_FACETS_COUNT).innerHTML = facet_drop_list_html;				
				SUPPORTED_FACETS_COUNT += 1;
				if ( SUPPORTED_FACETS_COUNT > MAX_SUPPORTED_FACETS_COUNT || 
					 SUPPORTED_FACETS_COUNT > MAX_SUPPORTED_FACETS_COUNT_MOBILE && MOBILE_ENDPOINT == '1' )	{	
					break;	
				}	
								
			}
			/*
			if ( data.facets.price && data.facets.price.min < data.facets.price.max)	{				
				// Price slider...		
				FACET_PRICE_CURRENCY = data.facets.price.currency;
				FACET_SELECTED_PRICE_MIN = data.facets.price.min;
				FACET_SELECTED_PRICE_MAX = data.facets.price.max;
				document.getElementById('price_slider_container').innerHTML = '';	// Clear the previous slider...
				price_slider_id = 'slider_' + parseInt(Math.random()*10000);
				var slider_values = data.facets.price.min+';'+data.facets.price.max; 
				if ( data.narrow && data.narrow['price'] && data.narrow['price']['min'] && data.narrow['price']['max'] )	{
					slider_values = data.narrow['price']['min'] + ';' + data.narrow['price']['max'];
				}
				var slider_html = '<div class="span4" style="width:200px"><input id="'+price_slider_id+'" type="slider" value="'+ slider_values +'" name="price"/></div>';
				document.getElementById('price_slider_container').innerHTML = slider_html;	// the new  slider...
				
				setTimeout(function() {
					jQuery("#"+price_slider_id).slider({  from: data.facets.price.min, 
													to: data.facets.price.max, 
													value: slider_values, 
													step: (parseInt(data.facets.price.max,10) - parseInt(data.facets.price.min, 10))/10, 
													format: { format: data.facets.price.currency + '##.0', locale: 'us' }, 
													callback: price_facet_change,
													dimension: '&nbsp;' });
					}, 11);
				document.getElementById('price_slider_container').style.display = '';												  
			}	else	{
				// No price slider...
				document.getElementById('price_slider_container').style.display = 'none';
			}
			*/
			
		}	else	{
			// Hide the facets pane completely!
			document.getElementById('search_facets_container').style.display = 'none';		
		}
	
	
		if (data.images && data.images.length>0)	{
				images_data_q = data.q;
				images_data = new Array();
				var images  = data.images;	
				image_total = 0;
				images_loaded_cnt = 0;				
				for (var i=0;i<images.length && i<20;i++)	{
					var image_data = new Object();
					image_data.title 	  = images[i][0];
					image_data.target_url = images[i][1];
					if (images[i][2] != null && images[i][2].indexOf('http')==0)	{
						image_data.url 		  = images[i][2];
						image_data.height 	  = null;
						image_data.width  	  = null;
						if (images[i].length >= 4)	{
							image_data.wix_page_id = images[i][3];
						}	else	{
							image_data.wix_page_id = '';
						}
						images_data.push( image_data );
						fetch_image_size(image_data);
						image_total += 1;
					}
				}		
		}
		
		if (data.results)	{
			if (data.results.length > 0 || (data.images && data.images.length>0) )	{
				if (data.p == 1)	{
					html_header += '<div class="search_res_found">';
					var results_host_filler = '<span class="search_res_found_site_url">' +  acp_options.HOSTNAME + '</span>';
					if ( acp_options.HOSTNAME.indexOf('editor.wix.com') >=0 )	{
						results_host_filler = 'this site';
					}
					if (data.correction)	{
						html_header += no_results_text + ' <b>' + data.q + '</b>. ';
						html_header +=	search_results_for_text + ' <span class="search_res_found_highlight">' + data.correction + '</span>';					
					}	else	{
						// No autocorrect
						html_header +=	search_results_for_text + ' <span class="search_res_found_highlight">' + data.q + '</span>';					
					}
					// if (MOBILE_ENDPOINT == '0')	{	html_header += ' (' +  results_host_filler + ')';	}					
					
					html_header += '</div>'
					
					if (data.msg)	{
						html_header += '<div class="search_ads" style="background-color:#ffc">' + data.msg + '</div>';
					}	else	{
						html_header += format_related( data.q, false );					
					}
				}	else	{
					// Next>> paging...
					html = cont.innerHTML;
				}
				
				if (data.images && data.images.length>0)	{
					image_container_id = 'image_container_' + parseInt(Math.random()*10000);
					html += '<div id="' + image_container_id + '" style="border-bottom:1px solid #f1f1f1;padding-bottom:3px;"><div id="search_res_progress_images" style="min-height:50px">Loading <span id="progress_images_counter">' + image_total + '</span> images...</div></div>';				
				}
					
				var limit_usage = false;
				if (data.limit_usage)	{	limit_usage = true;	}				
				var selected_index = 0;
				if (data.p)	{	selected_index += 4*(parseInt(data.p, 10)-1);		}
				
				for (var i=0;i<data.results.length;i++)	{
					try {
					 if (data.results[i][1].indexOf('/search-results-page')>0)	{	continue; 	}
					} catch (e) {}
				
					var is_product = false;
					selected_index += 1;
					var item_title   = data.results[i][0];
					var item_url 	 = data.results[i][1];
					if (item_url.indexOf('/product-page') > 0)	{	is_product = true;	}
					var item_snippet = data.results[i][2].replace('-->', '');
					if (item_title == '')	{	item_title = item_url;	}
					
					if (editor_url!=1 && is_premium=='true' && (data.results[i].length == 5) && (data.results[i][4] == '2'))	{
						// runtime blocked item...  let's skip
						continue;
					}
					var wix_page_id = '';
					try {
						wix_page_id = data.results[i][3];
					} catch (e) {}
					if (is_product)	{
						html += '<div class="search_res_item isp_product">';						
					}	else	{
						html += '<div class="search_res_item">';
					}
					
					title_html = '<div class="search_res_item_title">';
					var item_hyperlink = '';
					if (item_url == '#')	{
						var onclick = ' onclick="Wix.closeWindow({\'reason\': \'button-clicked\'});"';
						if (limit_usage)	{	var onclick = '';	}		
						item_hyperlink = '<a href="#" ' + onclick + '>';
						title_html += item_hyperlink + item_title + '</a>' + api_get_parent_breadcrumbs_of_wix_page(item_url);
					}	else	{						
						if ( typeof api_get_category_of_wix_page === 'undefined' )	{
							var wix_title_url = item_title;
						} else	{
							var wix_title_url = api_get_category_of_wix_page( item_url );
						}												
						if (wix_title_url == '')	{	wix_title_url = item_title;		}
						var html_wix_title_url = wix_title_url.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
						html_wix_title_url = highlightWords( html_wix_title_url, data.q );
						wix_title_url = wix_title_url.replace(/(["])/g, '');
						wix_title_url = wix_title_url.replace(/([\'])/g, '');
						var data_q = data.q.replace(/([\'])/g, '');
												
						var onclick = ' onclick="api_openURL_modal_V3(\'' + data_q + '\', \'' + wix_title_url + '\',' + selected_index + ', \'' + item_url + '\', \'tab\', false, \'' + wix_page_id + '\'); return true;"';
						if (limit_usage)	{	onclick = '';	}
						item_url = item_url.replace('_escaped_fragment_=', '#!');		
						
						item_hyperlink = ' <a href="' + item_url + '" ' + onclick + resultOpenInTab_part + '>';
						title_html += item_hyperlink + html_wix_title_url + '</a>' + api_get_parent_breadcrumbs_of_wix_page(item_url);
						var is_marked = false;						
					}										
					title_html += ' </div>';					
					if (is_product)	{
						item_snippet = item_hyperlink + item_snippet.replace('<span class="isp_product_title">', title_html) + '</a>';
					}	else	{
						html += title_html;
					}
										
					html += ' <div class="search_res_item_snippet">' + item_snippet + '</b></div>';	 // close the bold section anyways in case left open
					html += '</div>';			
				}		
			}	else	{
				var ms_to_render=1;
				if ( typeof api_get_search_redirect_url === 'undefined' )	{
					ms_to_render = 444;	// wait a little while if the main JS is not ready yet...
				}
				if (data.q!='')	{
					setTimeout(function()	{
								var cont = document.getElementById('search_res_container');
								var no_results_host_filler = '<span class="search_res_not_found_site_url">' +  acp_options.HOSTNAME + '</span>';
								if ( acp_options.HOSTNAME.indexOf('editor.wix.com') >=0 )	{
									no_results_host_filler = 'this site';
								}
								html_header  = '<div class="search_res_not_found">';
								
								html_header +=	'<span class="search_res_not_found_msg">' + no_results_text + ' <span class="search_res_not_found_highlight">' + data.q + '</span> (' + no_results_host_filler + ')<br>';					
								if (false && data.didyoumean && data.didyoumean.length>0){
                                    html_header += '<span class="search_res_did_you_mean">Did you mean <a href="#" onclick="api_openURL_modal(\'' + data.didyoumean[0].value + '\', \'tab\', false)">' + data.didyoumean[0].label + '</a></span><br>';
                                }
								html_header += '</span>';
								if (typeof api_get_search_redirect_url === 'undefined')	{
									// nada...
								}	else	{
									// We have related searches now...
									// html_header += '<span class="search_res_not_found_web_search">Search the web for <a href="#" onclick="api_openURL_modal(\'' + api_get_search_redirect_url( data.q ) + '\', \'tab\', false)">' + data.q + '</a></span>';
								}
								html_header += '</div>'	

								
								if (data.msg)	{
									html_header += '<div class="search_ads" style="background-color:#ffc">' + data.msg + '</div>';
								}	else	{
									html_header += format_related( data.q, false );					
								}
								html_header += no_results_suggestion_text;		 // No results suggestions text																
								if (contact_form=="true")	{
									// Premium contact form...
									html += '<ul><li>' + send_us_a_msg_text + ':</li></ul>';
									html += '<p id="contact_form_id" class="contact_form_p"><textarea id="user_msg" placeholder="' + searched_but_couldnt_find_text + '" class="contact_form_text">';
									if (is_IE())	{	html += searched_but_couldnt_find_text;	}									
									html += '</textarea><br>';
									html += '<input id="user_email" placeholder="email@domain.com" class="contact_form_email"><br>';
									html += '<input type="button" onclick="sendContactEmail()" value="Send" class="contact_form_button"></p>';								
								}	
								cont_header.innerHTML = html_header;
								cont.innerHTML = html;														
							}, ms_to_render);
				}
			}			
		}
		
		if (data.tp && data.tp > 1)	{
			html += '<div id="next_pager_' + (data.p+1) +'" class="search_footer_paging">';
			/*
			if (data.p > 1)	{
				html += '<span class="search_pager"><a href="#" onclick="isp_change_page(' + (data.p-1) + ')"><b>&#171; Previous</b></a></span> &nbsp;';
			}
			
			for (var i=1;i<=data.tp;i++)	{
				if (data.p && i == data.p)	{
					html += '<span class="search_pager_selected">' + i + '</span>';
				}	else	{
					html += '<span class="search_pager"><a href="#" onclick="isp_change_page(' + i + ')">' + i + '</a></span>';
				}
			}
			*/
			if (data.p < data.tp && (data.results.length >0 || data.images.length>0))	{
				html += '&nbsp; <span class="search_pager"><a href="#" onclick="isp_change_page(' + (data.p+1) + ')"><b>' + more_nav_text + '</b></a></span>';
			}
			html += '</div>';
		}
	}
	if (data && data.q == '')	{
		html_header += '<div class="search_res_found">What would you like to search for?</div>';
		cont_header.innerHTML = html_header;
	} else if (!data || data.p == 1) {
		// Something bad happened...
		if (html_header == '')	{
			html_header += '<div class="search_res_found">Our search engine is a bit slow today... Please give it another chance and contact our support if the issue persist. </div>';
		}
		cont_header.innerHTML = html_header;
	}
	cont.innerHTML = html;	
	
	Wix.setHeight($('#search_res_container').height()+500 ,{overflow:false});
	/*
	Wix.getBoundingRectAndOffsets(function(data){
		var height = data.offsets.y + data.rect.height + 50;
		var width = data.offsets.x + data.rect.width;
		// Wix.resizeWindow(width, height);
	});
	*/
	
	// var scroll_delta = cont.scrollTop - cont.scrollHeight;
	// cont.scrollTop = cont.scrollHeight;
	if (data.p > 1)	{
		smooth_scroll(cont.scrollTop, cont.scrollHeight);
	}
	
	
	$('.stack_holder, .search_res_img_container').each( function(){ 
		this.style.backgroundImage = "url('https://acp-magento.appspot.com/images/progress.gif')"; 
		this.style.backgroundRepeat = 'no-repeat'; 
		this.style.backgroundPosition ='center';
		this.style.backgroundColor ='transparent';
		} );
	
	// Hide it in 2sec anyways to avoid transparent thumbnails
	setTimeout(function()	{	
				$('.stack_holder, .search_res_img_container').each( function(){ 
						this.style.background = 'none'; 
						});	
				}, 1500);
	
}

function isEmptyDict(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function starrank_callback(status)	{
	api_do_full_text_search();
}

function starrank(element, url, mark_as_starred)	{
	var star;
	if (mark_as_starred)	{	
		star = '1';	
	}	else	{
		star = '0';	

	}
	var url = _isp_endpoint + '/rank_star?instance=' + encodeURIComponent(instanceId) + '&url=' + encodeURIComponent(url) + '&star=' + star + '&callback=starrank_callback' + '&r=' + Math.random();
	injectJS(url);
}

function blockrank_callback(status)	{
	api_do_full_text_search();
}

function blockrank(element, url, mark_as_blocked)	{
	var block;
	if (mark_as_blocked)	{	
		block = '1';	
	}	else	{
		block = '0';	
	}
	var url = _isp_endpoint + '/rank_block?instance=' + encodeURIComponent(instanceId) + '&url=' + encodeURIComponent(url) + '&block=' + block + '&callback=blockrank_callback' + '&r=' + Math.random();
	injectJS(url);
}




function smooth_scroll(scroll_top, scroll_top_end)	{
	var cont = document.getElementById('search_res_container');
	if (scroll_top >= scroll_top_end)	{	return;	}
	cont.scrollTop = scroll_top + 10;
	setTimeout(function () {
					smooth_scroll(scroll_top + 10, scroll_top_end);
				}, 1);
}

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

try {
	var custom_css = localStorage.getItem(instanceId+'custom_css');	// The widget js entered this hopefully...
	if (custom_css)	{	//  && MOBILE_ENDPOINT == '0')	{	
		injectCSS(custom_css);
	}
} catch (e) {}

var contact_form = 'false';
try {
	contact_form = localStorage.getItem(base_site_url+'contact_form');	// The widget js entered this hopefully...
} catch (e) {}

var editor_url = 0;
try {
	var CURRENT_URL = localStorage.getItem(base_site_url+'CURRENT_URL');	// The widget js entered this hopefully...
	if (CURRENT_URL && CURRENT_URL.toLowerCase().indexOf('editor.wix.com')>=0)	{
		editor_url = 1;
	}
} catch (e) {}



var placeholder = '';
try {
	placeholder = localStorage.getItem(base_site_url+'placeholder');	// The widget js entered this hopefully...
	if (placeholder)	{
		document.getElementById('acp_magento_search_id_main_page').setAttribute("placeholder", placeholder);
		document.getElementById('isp_icon_id').setAttribute("title", placeholder);

		if (is_RTL(placeholder))	{
			var rtl_css = "#grey, #acp_magento_search_id_main_page {text-align:right;} .acp_modal_body { direction: rtl;}";
			rtl_css    += ".isp_watermark { float:left; margin-left: 40px; }";
			injectCSS( rtl_css );
		}
	}
} catch (e) {}




var query_string = decodeURIComponent(location.pathname.replace('/wix_widget/wix_instantsearchplus_SERP/serp/', '')); //** 	getParameterByName('q', '');
document.getElementById('acp_magento_search_id_main_page').value = query_string; 

do_full_text_search( query_string, 1, 13, true );	// fired upon first load




function injectJS(url)	{
	var s = document.createElement('script');
	s.type = 'text/javascript';					
	s.src = url;
	var x = document.getElementsByTagName('script')[0];
	x.parentNode.insertBefore(s, x);
}


function sendContactEmail()	{
	var user_email = document.getElementById('user_email').value;
	var user_msg   = document.getElementById('user_msg').value;
	
	var isp_contact_url = _isp_endpoint + '/contact_form_msg?user_msg=' + encodeURIComponent( user_msg ) + '&user_email=' + encodeURIComponent(user_email) + '&instance=' + encodeURIComponent(instanceId) + '&callback=sendContactEmailCallback&v=' + CLIENT_VER + '&r=' + Math.random();
	injectJS( isp_contact_url );
}

function sendContactEmailCallback(data)	{
	var msg;
	if (data)	{
		msg = 'Your message was sent!  We will get back to you soon';
	}	else	{
		msg = 'Unfortunately we could not deliver your message at this time';
	}
	document.getElementById('contact_form_id').innerHTML = msg;
}

function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset;
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
}

$(document).keyup(function(e) {  
	if (e.keyCode == 27) { 
		Wix.closeWindow({'reason': 'button-clicked'});
	}  
});

