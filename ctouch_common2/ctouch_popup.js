var loaded=function(config){
	var initialize=function(){
		var table=document.getElementById('UA');

			var tr=document.createElement('tr');
			var td,label,input;
			td=document.createElement('td');
				input=document.createElement('input');
				input.type='radio';
				input.name='ua';
				input.id='ctouch_ua_-1';
				input.onclick=function(){
					config.preferedUA=-1;
					if(saveConfig(JSON.stringify(config,null,' '))){
						localStorage['config']=JSON.stringify(config,null,' ');
					}
				};
				td.appendChild(input);
			tr.appendChild(td);
			td=document.createElement('td');
			td.style.whiteSpace='nowrap';
				label=document.createElement('label');
				label.htmlFor='ctouch_ua_-1';
				label.innerHTML="Don't modify (original)";
				td.appendChild(label);
			tr.appendChild(td);
			table.appendChild(tr);

		var i;
		for(i=0;i<config.UA.length;i++){
			var x=i;
			var tr=document.createElement('tr');
			var td,label,input;
			td=document.createElement('td');
				input=document.createElement('input');
				input.type='radio';
				input.name='ua';
				input.id='ctouch_ua_'+i;
				// http://nanto.asablo.jp/blog/2006/07/08/437419
				with({i:i})input.onclick=function(){
					config.preferedUA=i;
					if(saveConfig(JSON.stringify(config,null,' '))){
						localStorage['config']=JSON.stringify(config,null,' ');
					}
				};
				td.appendChild(input);
			tr.appendChild(td);
			td=document.createElement('td');
			td.style.whiteSpace='nowrap';
				label=document.createElement('label');
				label.htmlFor='ctouch_ua_'+i;
				label.innerHTML=config.UA[i][0];
				td.appendChild(label);
			tr.appendChild(td);
			table.appendChild(tr);
		}
	};

	var innerText=('innerText' in document.documentElement) ? 'innerText' : 'textContent';
	document.getElementById('title')[innerText]=chrome.runtime.getManifest().name;
	document.getElementById('extensions_page')[innerText]=chrome.runtime.getManifest().name+' '+chrome.runtime.getManifest().version;
	var flash_plugin=null;
	var flash=navigator.mimeTypes['application/x-shockwave-flash'];
	if(flash)flash_plugin=flash.enabledPlugin;
	if(!flash_plugin)document.getElementById('flash_state')[innerText]='Flash is not installed.';
	if(flash_plugin)document.getElementById('flash_state')[innerText]=flash_plugin.filename+' should be '+(flash_plugin.filename.toLowerCase().indexOf('pep')==-1?'NPAPI.':'PPAPI.');

	if(chrome.runtime.getManifest().permissions.indexOf('management')>=0)
		document.getElementById('external_daemon').innerHTML='<input type="checkbox" id="external_daemon_chrome"><label for="external_daemon_chrome">Use External Daemon Chrome</label><br><input type="text" id="external_daemon_id" size="40" value="'+config.external_daemon_id+'"><br>';

	initialize();

	document.getElementById('ctouch_ua_'+config.preferedUA).checked=true;

	if(config.enable_imitation){document.getElementById('enable_imitation').checked=true;}
	document.getElementById('enable_imitation').onclick=function(){
		config.enable_imitation=!config.enable_imitation;
		if(saveConfig(JSON.stringify(config,null,' '))){
			localStorage['config']=JSON.stringify(config,null,' ');
		}
	};
	if(config.generate_touch){document.getElementById('generate_touch').checked=true;}
	document.getElementById('generate_touch').onclick=function(){
		config.generate_touch=!config.generate_touch;
		if(saveConfig(JSON.stringify(config,null,' '))){
			localStorage['config']=JSON.stringify(config,null,' ');
		}
	};
	if(config.install_createtouch){document.getElementById('install_createtouch').checked=true;}
	document.getElementById('install_createtouch').onclick=function(){
		config.install_createtouch=!config.install_createtouch;
		if(saveConfig(JSON.stringify(config,null,' '))){
			localStorage['config']=JSON.stringify(config,null,' ');
		}
	};
	if(chrome.runtime.getManifest().permissions.indexOf('management')>=0){
	if(config.external_daemon_chrome){document.getElementById('external_daemon_chrome').checked=true;}
	document.getElementById('external_daemon_chrome').onclick=function(){
		config.external_daemon_chrome=!config.external_daemon_chrome;
		config.external_daemon_id=document.getElementById('external_daemon_id').value;
		if(config.external_daemon_chrome)chrome.management.launchApp(config.external_daemon_id);
		if(saveConfig(JSON.stringify(config,null,' '))){
			localStorage['config']=JSON.stringify(config,null,' ');
		}
	};
	}

	document.getElementById('option_page').onclick=function(){
		window.open(chrome.extension.getURL(chrome.runtime.getManifest().options_page));
	};
	document.getElementById('plugins_page').onclick=function(){
		//window.open('chrome://plugins');
		chrome.tabs.create({url:'chrome://plugins'});
	};
	//easter for debug
	document.getElementById('popup_page').onclick=function(){
		window.open(chrome.extension.getURL(chrome.runtime.getManifest().browser_action.default_popup));
	};
	document.getElementById('extensions_page').onclick=function(){
		//window.open('chrome://extensions');
		chrome.tabs.create({url:'chrome://extensions'});
	};
};


if(/*chrome.runtime.getManifest().name.indexOf('true')>=*/0){
	window.addEventListener('load',function(){
		chrome.tabs.getSelected(function(tab){
			if(!(tab.id in localStorage))localStorage[tab.id]=localStorage['config'];
			loaded(JSON.parse(localStorage[tab.id]));
		})
	});
}else{
	window.addEventListener('load',function(){
		loaded(JSON.parse(localStorage['config']));
	});
}
