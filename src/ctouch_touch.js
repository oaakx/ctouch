//ctouch_touch: execute anytime
(function(){
//Generating touch event will break Google Map. cTouch (true) will disable touch event if UA is unmodified. 

//fix ExGame fillText issue by monkey patch.
//This code is not required anymore. I thank @__gfx__ to have accepted my bug report (as Android Chrome).
//if(!CanvasRenderingContext2D.prototype.__ctouch_fillText){
//	CanvasRenderingContext2D.prototype.__ctouch_fillText=CanvasRenderingContext2D.prototype.fillText;
//	CanvasRenderingContext2D.prototype.fillText=function(s,x,y,l){
//		l = l || 0;
//		if(l<10)CanvasRenderingContext2D.prototype.__ctouch_fillText.call(this,s,x,y);
//		else CanvasRenderingContext2D.prototype.__ctouch_fillText.call(this,s,x,y,l);
//	};
//}

//Let's fire element.ontouchstart.
var rec1=function(other,elem,ownerDocument,ev,typ){
	var sent=false;
	if(elem==other||!elem)return false;
	if(elem[typ]){elem[typ](ev);sent=true;}
	if(rec1(elem,elem.parentNode,ownerDocument,ev,typ)){sent=true;}
	return sent;
};
var rec2=function(other,x,y,ownerDocument,ev,typ){
	var sent=false;
	var elem = ownerDocument.elementFromPoint(x,y); //
	if(elem==other||!elem)return false;
	if(elem[typ]){elem[typ](ev);sent=true;}
	var v = elem.style.visibility; //
	elem.style.visibility = 'hidden'; //
	if(rec2(elem,x,y,ownerDocument,ev,typ)){sent=true;}
	elem.style.visibility=v; //
	return sent;
};
var rec=function(x,y,ownerDocument,ev,typ){
	if(rec1(null,ownerDocument.elementFromPoint(x,y),ownerDocument,ev,typ))return true;
	//if(rec2(null,x,y,ownerDocument,ev,typ))return true;
	return false;
};

//Compile touch event.
//http://kozy.heteml.jp/pukiwiki/JavaScript%2528iPhone%2529%2520%25A5%25A4%25A5%25D9%25A5%25F3%25A5%25C8/index.html
var isMouseDown=null;
var g_touchID=null;
var preventDefault=false;
var touchevent=function(e,type){
	//if(type=='touchstart')g_touchID=parseInt(Math.random()*1000000000)+1;
	var touch={
		clientX: e.clientX,
		clientY: e.clientY,
		force: 1.0,
		//identifier: g_touchID,
		pageX: e.pageX,
		pageY: e.pageY,
		//radiusX:
		//radiusY:
		screenX: e.screenX,
		screenY: e.screenY,
		target: e.target,
	};

	var ev;
	//try{
	//	var touches=new Array();
	//	touches[0]=new Touch(touch);
	//	ev=new TouchEvent(type,{
	//		touches: touches,
	//		changedTouches: touches,
	//		targetTouches: touches,
	//	});
	//}catch(x){
		//console.log(x);
	//	try{
	//	  ev=document.createEvent('TouchEvent');
	//	}catch(x){
	//		try{
	//			ev=document.createEvent('UIEvent');
	//		}catch(x){
	//			ev=document.createEvent('Event');
	//		}
	//	}
	{
		//fixme: we cannot use TouchEvent or UIEvent, which are not so flexible...
		ev=document.createEvent('Event');
		ev.initEvent(type,true,true);
		var touches=new Array();
		touches[0]=touch;
		ev.touches=touches;
		ev.changedTouches=ev.targetTouches=ev.touches;
	}

	ev.altkey=false;
	ev.bubbles=true;
	ev.cancelBubble=false;
	ev.cancelable=true;
	ev.charCode=0;
	ev.clientX=e.clientX;
	ev.clientY=e.clientY;
	//ev.clipboardData
	ev.ctrlKey=false;
	ev.currentTarget=e.currentTarget;
	//ev.detail
	//ev.eventPhase
	ev.keyCode=0;
	//ev.layerX=e.layerX;
	//ev.layerY=e.layerY;
	ev.metaKey=false;
	ev.offsetX=e.offsetX;
	ev.offsetY=e.offsetY;
	ev.pageX=e.pageX;
	ev.pageY=e.pageY;
	//ev.preventDefault=e.preventDefault; //function shouldn't be copied.
	ev.returnValue=e.returnValue;
	ev.screenX=e.screenX;
	ev.screenY=e.screenY;
	ev.shiftKey=false;
	ev.srcElement=e.srcElement;
	ev.target=e.target;
	ev.timeStamp=e.timeStamp;
	ev.view=e.view;

	ev.rotation=0.0;
	ev.scale=1.0;

	if(type=='touchstart'||isMouseDown)isMouseDown=ev.touches;
	if(type=='touchend')isMouseDown=null;
	return ev;
};

//Generate touchevent and fire it. And kills inside mouse events.
var mouseevent=function(e){
	if(e.target.nodeName.toLowerCase()=='object'||e.target.nodeName.toLowerCase()=='embed'){
		//if(e.type=='mouseup'||e.type=='click')
			{isMouseDown=null;preventDefault=false;}
		return true;
	}
	if(e.type=='mousedown'){
		preventDefault=false; //in case...
		var ev=touchevent(e,'touchstart');
		if(!e.shiftKey || !rec(e.clientX,e.clientY,e.target.ownerDocument,ev,'ontouchstart')){
			var b=e.target.dispatchEvent(ev);
			//console.log(b);
			if(!b){
				preventDefault=true;
				//since mouse event is already issued,
				//I need to kill rest events using stopPropagation().
				//preventDefault() isn't OK.
				e.stopPropagation();
			}
			return true;//b;
		}else return true;
	}else if(e.type=='mousemove'){
		if(isMouseDown){
			var ev=touchevent(e,'touchmove');
			if(!e.shiftKey || !rec(e.clientX,e.clientY,e.target.ownerDocument,ev,'ontouchmove')){
				var b=e.target.dispatchEvent(ev);
				if(!b||preventDefault){
					preventDefault=true;
					e.stopPropagation();
				}
				return true;//b;
			}else return true;
		}
	}else if(e.type=='mouseup'){
		var ev=touchevent(e,'touchend');
		if(!e.shiftKey || !rec(e.clientX,e.clientY,e.target.ownerDocument,ev,'ontouchend')){
			var b=e.target.dispatchEvent(ev);
			//console.log(b);
			if(!b||preventDefault){
				preventDefault=true;
				e.stopPropagation();
			}
			return true;//b;
		}else return true;
	}else if(e.type=='click'){
		if(window.click){window.click();preventDefault=false;return true;}
		//if(!e.shiftKey || !rec(e.clientX,e.clientY,e.target.ownerDocument,ev,'on')){
			if(preventDefault){
				//preventDefault=true;
				//e.stopPropagation();
			}
			preventDefault=false;
			return true;
		//}else{
		//	preventDefault=false;
		//	return true;
		//}
	}
	return true;
};

//Finally set the event.
//var useragent=''; //meh, I'll fix after releasing ctouch_true. When? I never know.
//var platform='none';
//if(useragent.indexOf('Android')!=-1)platform='Linux armv7l';
//if(useragent.indexOf('iPhone')!=-1)platform='iPhone';
//if(useragent.indexOf('iPod')!=-1)platform='iPod';
//if(useragent.indexOf('iPad')!=-1)platform='iPad';
//if(platform!='none'){
	document.addEventListener('mousedown',mouseevent,true);
	document.addEventListener('mousemove',mouseevent,true);
	document.addEventListener('mouseup',mouseevent,true);
	document.addEventListener('click',mouseevent,true);
//}

var myself = document.getElementById('ctouch_touch_js');
if(myself)myself.parentNode.removeChild(myself);
})();
