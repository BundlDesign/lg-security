console.log('code synced');
var isNL = partOfURL('ziggo');
var addons;
var unlimited_devices_extra = false;
var unlimited_devices_extra_amount = 0.5;
var total_price_full_pack_nl = 5;
var total_price_full_pack_uk = 4;

if(isNL){
	addons = {
		1: false,
		2: false,
		3: false,
		4: false
	};
}else{
	addons = {
		1: false,
		2: false,
		3: false
	};
}

var label_btn_add = isNL? 'Toevoegen aan pakket' : 'Add to base package';
var label_btn_add_all = isNL? 'Kies alle producten' : 'Add all packages';
var label_btn_remove = isNL? 'Toegevoegd (verwijder)' : 'Added';

$(document).ready(function()
{
	$('.hide').hide();
	$('.popup').hide();

	// AB testing inits
	initUTMCookies();
	abInit();
	$('.checkout-list-mini').hide();

	// POPUP GENERAL
	$('.btn-popup').click(openPopup);
	$('.btn-close-popup').click(closePopup);
	$('.btn-close-checkout').click(closeCheckout);

	$('#btn-dont-accept-nda').click(rejectNDA);
	$('.btn.addon').click(addonClicked);
	$('.btncheckout').click(showCheckout);
	$('.btn-select-all-addons').click(selectAllPacks);
	$('.btn-add-unlimited').click(toggleUnlimited);
});

function setUnlimitedDevices()
{
	unlimited_devices_extra = true;
	$('.btn-add-unlimited').addClass('added');
	$('.onthego-devices-covered').text('al je apparaten');
}

function unsetUnlimitedDevices()
{
	unlimited_devices_extra = false;
	$('.btn-add-unlimited').removeClass('added');
	$('.onthego-devices-covered').text('20 apparaten');
}

function toggleUnlimited()
{
	if(unlimited_devices_extra){
		unsetUnlimitedDevices();
	}else{
		setUnlimitedDevices();
	}
}

function selectAllPacks()
{
	$('.btn.addon:not(.added)').click();
	$(this).addClass('added').text(label_btn_remove);
	cl('all');
}

function closeCheckout()
{
	$('.checkout-overlay').hide();
	unLockPageScroll();
}

function showCheckout()
{
	if($(this).hasClass('inactive')) return false;
	$('.checkout-overlay .addon').hide();
	$('.unlimited-devices-text').hide();
	$('.promo').hide();

	var total_price = 0;
	var item_price;

	for(var i=1; i<=Object.keys(addons).length;i++){
		if(addons[i]==true)
		{
			$('#checkout-addon-'+i).show();
			if(isNL){item_price = $('#checkout-addon-'+i).find('.addon-price').text().replace(',','.');}
			else{item_price = $('#checkout-addon-'+i).find('.addon-price').text();}
			total_price += parseFloat(item_price);

			// unlimited devices added
			if(isNL && i==1 && unlimited_devices_extra){
				total_price += unlimited_devices_extra_amount;
				$('.unlimited-devices-extra-price-checkout').show();
				$('.unlimited-devices-text').show();
			}
		}
	}

	// if all addons added gets discount
	if(countAddons() == Object.keys(addons).length){
		$('.unlimited-devices-extra-price-checkout').hide();
		$('.unlimited-devices-text').show();
		$('.promo').show();
		total_price = isNL? total_price_full_pack_nl : total_price_full_pack_uk;
	}

	var addons_str = stringifyAddons();

	$('.txt-total-price').val(total_price);
	$('.txt-purchases').val(addons_str);

	$('.total-price-value').text(total_price);
	$('.checkout-overlay').show();

	lockPageScroll();
}

function addonClicked()
{
	var addon_nr = $(this).attr('data-addon-nr');

	if($(this).hasClass('added'))
	{
		$(this).text(label_btn_add);
		$(this).removeClass('added');
		addons[addon_nr] = false;
		$('.btn-select-all-addons').removeClass('added').text(label_btn_add_all);
	}
	else
	{
		$(this).text(label_btn_remove);
		$(this).addClass('added');
		addons[addon_nr] = true;
	}

	// only for the On the go security addon
	if(addon_nr == 1){
		$('.box-unlimited-devices').toggle();
	}

	// if all 4 addons added
	if(countAddons() == Object.keys(addons).length){
		setUnlimitedDevices();
	}

	if(countAddons() > 0){
		$('.cta-checkout-alert').hide();
		$('.btncheckout').removeClass('inactive');
	}else{
		$('.cta-checkout-alert').show();
		$('.btncheckout').addClass('inactive');
	}
}

function countAddons()
{
	var amount = 0;
	for(var i=1; i<=Object.keys(addons).length;i++){
		if(addons[i]==true) amount++;
	}
	return amount;
}

function stringifyAddons()
{
	var addons_str = JSON.stringify(addons);
	addons_str = addons_str.replace('"1"', 'Security on-the-go');
	addons_str = addons_str.replace('"2"', ' Digital ID Shield');
	addons_str = addons_str.replace('"3"', ' Digital Habit Manager');
	addons_str = addons_str.replace('"4"', ' PW Safe');

	return addons_str;
}

function rejectNDA()
{
	$('#p-nda-explainer, #btn-accept-nda, #btn-dont-accept-nda').hide();
	$('#p-nda-rejected').show();
}

function abInit()
{
	$('*[data-ab="1"], *[data-ab="2"]').hide(); // hide all ab sections

	var ab = getCookie('ab');

	// only show the ones needed for this AB test
	$('*[data-ab="'+ab+'"]').show();
}

function initUTMCookies()
{
	var ab;
	var utm_source;
	var utm_campaign;
	var utm_content;

	if(urlParam('utm_source') != undefined){
		ab = urlParam('ab');
		utm_source = urlParam('utm_source');
		utm_campaign = urlParam('utm_campaign');
		utm_content = urlParam('utm_content');

		setCookie('ab',ab,1);
		setCookie('utm_source',utm_source,1);
		setCookie('utm_campaign',utm_campaign,1);
		setCookie('utm_content',utm_content,1);
	}else{
		ab = getCookie('ab');
		utm_source = getCookie('utm_source');
		utm_campaign = getCookie('utm_campaign');
		utm_content = getCookie('utm_content');
	}

	$('.btn, .btn-close-popup, .pack-sign-up-link').addClass('AB'+ab);

	// the url data will be implemented in each form with class 'form-fields'
	$('.form-fields, .form-breach').append('<input type="hidden" name="AB" value="'+ab+'">');
	$('.form-fields, .form-breach').append('<input type="hidden" name="UTM_Source" value="'+utm_source+'">');
	$('.form-fields, .form-breach').append('<input type="hidden" name="UTM_Campaign" value="'+utm_campaign+'">');
	$('.form-fields, .form-breach').append('<input type="hidden" name="UTM_Content" value="'+utm_content+'">');
}

function openPopup()
{
	$('.popup').hide();
	var popup_id = $(this).attr('data-popup-id');
	cl(popup_id);

	$('.selected-pack').hide();
	var selected_pack = $(this).attr('data-pack-id');
	$('.selected-pack.'+selected_pack).show();
	cl(selected_pack);

	$('#'+popup_id).show();

	lockPageScroll();
}

function closePopup()
{
	$(this).closest('.popup').hide();
	unLockPageScroll();
}

function unLockPageScroll()
{
	$('html').css('overflow','scroll');
}

function lockPageScroll()
{
	$('html').css('overflow','hidden');
}

function scrollToPos(elem)
{
	var header_offset = 148;
		$([document.documentElement, document.body]).animate({
        scrollTop: $(elem).offset().top - header_offset
    }, 2000);
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function partOfURL(name)
{
    return window.location.href.indexOf(name) > -1;
}

function urlParam(name)
{
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

function cl(mssg)
{
	console.log(mssg);
}
