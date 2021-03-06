// ==UserScript==
// @name        Qiita TopPage Search
// @namespace   com.cielavenir
// @description Add search button in top page.
// @include     https://qiita.com/
// @version     0.0.0.2
// ==/UserScript==

var toppage_search_main=function(){
	var before=document.getElementsByClassName('landingHeaderCatchCopy')[0];
	if(!before)return;
	var div=document.getElementsByClassName('col-sm-7')[0];
	var form=document.createElement('form');
	form.action='https://qiita.com/search';
	form.method='GET';
	var input=document.createElement('input');
	input.type='text';
	input.placeholder='Search';
	input.id='toppage-search';
	input.name='q';
	input.size=50;
	input.tabIndex=0;
	form.appendChild(input);
	document.addEventListener('keydown',function(e){
		if(window.event)e=window.event;
		var keycode=e.keyCode||e.which;
		//console.log(keycode);
		var input=document.getElementById('toppage-search');
		if(document.activeElement!=input){
			switch(keycode){
				case 83: case 115:
					input.value='';
					input.focus();
					e.preventDefault();
					break;
				case 84: case 116:
					input.value='tag:';
					input.focus();
					e.preventDefault();
					break;
				case 85: case 117:
					input.value='user:';
					input.focus();
					e.preventDefault();
					break;
			}
		}
	});
	div.insertBefore(form,before);
};

if(typeof 'chrome'==='undefined'){
	toppage_search_main();
}else{
	chrome.runtime.sendMessage({tool:'toppage_search'},function(res){
		if(res['result'])toppage_search_main();
	});
}