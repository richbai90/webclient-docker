//-- functions to help control the behaviour of toolbars
var __array_toolbar_groups = new Array();
var __array_toolbar_lastitem = new Array();
var __array_menu_lastitem = new Array();
var __array_open_menus = new Array();
var __o_last_toolbar_item = null;
var __bCancelDocumentMouseUpHideEvent = false;

//-- hilite - makes it look active
function toolbar_mouseover(eToolBarItem, e)
{
	
	if(eToolBarItem.getAttribute("mo")=="1") 
	{
		return;
	}
	eToolBarItem.setAttribute("mo","1");


	//-- is it checked
	if(eToolBarItem.getAttribute("checked")=="1") 
	{
		eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button-select":"toolbar-item-select";
		return;
	}

	if(eToolBarItem.className == "toolbar-item-disable") return;
	if(eToolBarItem.className == "toolbar-item-select") return;
	if(eToolBarItem.className == "toolbar-button-select") return;
	

	eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button-high":"toolbar-item-high";

	//-- if last button has menu down then this one should as well
	var lastMenuDropped=false;
	var lastBTN = __array_toolbar_lastitem[eToolBarItem.getAttribute("pid")]
	if(lastBTN!=undefined)
	{
		try{
			var lastMenuDropped = lastBTN.getAttribute("mnudown");
		}
		catch(e){lastMenuDropped=false;}
	}


	if(lastBTN!=eToolBarItem)
	{
		hide_all_menu_divs();	

		//-- if last button was a enhanced menu then hide its children
		try
		{
			
			if(lastBTN!=undefined && lastBTN.getAttribute('displayenhanced') == "1")
			{
				lastBTN.popupmenu.hide();			
			}

		}	
		catch (e)
		{
		}	
	}


	//-- if lastmenu was drop the show this ones menu
	if(lastMenuDropped=="1")
	{
		eToolBarItem.setAttribute("mnudown",0);
	}
	else
	{
		eToolBarItem.setAttribute("mnudown",1);
	}
	toolbar_check_btn_type(eToolBarItem);

}


function toolbar_enhanced_hilo(aToolbarBtn, boolHi)
{
	//-- if enhanced we need to set last td border
	var iEnhanced = aToolbarBtn.getAttribute("enhanced");
	if(iEnhanced=="1")
	{
		var aTR = aToolbarBtn.childNodes[0].rows[0];
		if(aTR!=undefined)
		{
			var useCell = aTR.cells.length -1;
			var aDiv = aTR.cells[2].childNodes[0];
			if(aDiv!=undefined)
			{
				if(boolHi)
				{
					aDiv.style.borderLeft = '1px #000000 solid';
				}
				else
				{
					aToolbarBtn.className = "toolbar-item";
					aDiv.style.borderLeft = '';
				}
			}
		}
	}

}

//-- lolite - makes it look in active
function toolbar_mouseout(eToolBarItem, e)
{
	
	try
	{
		//-- is it checked
		if(eToolBarItem.getAttribute("checked")=="1") 
		{
			eToolBarItem.className = "toolbar-item-select";
			eToolBarItem.setAttribute("mo","0");
			return;
		}

		if(eToolBarItem.className == "toolbar-item-disable") 
		{
			eToolBarItem.setAttribute("mo","0");
			return;
		}
	}
	catch(e)
	{
		return;
	}

	if(eToolBarItem.getAttribute("mnudown")=="1") 
	{
		return;
	}

	eToolBarItem.setAttribute("mo","0");
	var iEnhanced = eToolBarItem.getAttribute("enhanced");
	if(iEnhanced=="1")
	{
		toolbar_enhanced_hilo(eToolBarItem, false);
	}
	else
	{
		eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button":"toolbar-item";
	}
}

//-- used to show enhanced menu options
function _toolbar_enhanced_mousedown(eToolBaritem,e)
{
	

	//-- 87222 - forfox not showing menu properly
	if(app.isFirefox)
	{
		if(eToolBaritem.getAttribute("mnudown")=="1")
		{
			//-- hide items
			eToolBaritem.setAttribute("mnudown","0");
			eToolBaritem.className = "toolbar-item-high";
		}
		else
		{
			eToolBaritem.setAttribute("mnudown","1");
			eToolBaritem.className = "toolbar-item-select";
		}
	}

	var strJsFunctionLoadMenuItems = eToolBaritem.getAttribute("enhancedmenuloader");
	var jsFunc = app[strJsFunctionLoadMenuItems];
	if(jsFunc!=undefined)
	{
		var iTop = app.eleTop(eToolBaritem) + eToolBaritem.offsetHeight;
		var iLeft = app.eleLeft(eToolBaritem.parentNode);
		jsFunc(eToolBaritem,iLeft,iTop,e);

	}
}

function toolbar_mouseup(eToolBarItem,e)
{
	if(eToolBarItem.className == "toolbar-item-disable") return;
	//__bCancelDocumentMouseUpHideEvent = true;
	
	return false;
}

//-- select - makes it look selected
function toolbar_mousedown(eToolBarItem, e)
{
	
	
	if(eToolBarItem.className == "toolbar-item-select") return;
	if(eToolBarItem.className == ("toolbar-button-select")) return;
	if(eToolBarItem.className == "toolbar-item-disable") return;

	hide_application_menu_divs()

	var eS = app.getEventSourceElement(e);
	if(eS!=null && eS.getAttribute("enhancedmenu")=="1")
	{
		eToolBarItem.setAttribute('displayenhanced',"1");
		_toolbar_enhanced_mousedown(eToolBarItem,e);
		return true;
	}
	eToolBarItem.setAttribute('displayenhanced',"0");

	//-- is this a sticky (once pressed stay depressed until another one in its group is pressed)
	if(eToolBarItem.getAttribute("stick")=="1") 
	{
		//-- check if another member of its group is checked if so uncheck it
		var strGroup = eToolBarItem.getAttribute("checkgrp");
		if(__array_toolbar_groups[strGroup])
		{
			__array_toolbar_groups[strGroup].className = "toolbar-item";
			__array_toolbar_groups[strGroup].setAttribute("checked","0");
		}
		eToolBarItem.setAttribute("checked","1");
		__array_toolbar_groups[strGroup] = eToolBarItem;
	}

	eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button-select":"toolbar-item-select";
	return true;
}

function toolbar_item_check(strToolBarID, strToolBarItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var eDiv = document.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		toolbar_mousedown(eDiv);
	}
	return;


}

//--
//-- context menu item enable / disable 
function toolbarmenu_item_disable(strItemID , boolDisable,aDoc)
{
	strItemID = "mnu_" + strItemID;
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		oE.className =(boolDisable)?"mnu-disabled":"";
		app.toggleDisabled(oE,boolDisable);
	}
}

function toolbarmenu_item_sorh(strItemID , boolShow,aDoc)
{
	strItemID = "mnu_" + strItemID;
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		oE.style.display =(!boolShow)?"none":"";
	}
}


//--
//-- context menu item enable / disable 
function contextmenu_item_dore(eContextMenu, strItemID , boolEnable,aDoc)
{
	strItemID = "contextmnu_" + strItemID;
	if(boolEnable)
	{
		contextmenu_item_enable(eContextMenu, strItemID , aDoc);
	}
	else
	{
		//alert(strItemID)
		contextmenu_item_disable(eContextMenu, strItemID , aDoc);
	}
}

//-- diaable menu item - 
function contextmenu_item_disable(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		app.toggleDisabled(oE,true);
		oE.className="mnu-disabled";
		//-- get text element and reset color style
		oE.childNodes[1].childNodes[0].style.color="#808080";

		if(oE.getAttribute('disimg')!="" && oE.getAttribute('disimg')!=null)
		{
			//-- change image to disabled
			var oImg = oE.childNodes[0].childNodes[0].childNodes[0];
			if(oImg!=undefined && oImg.tagName=="IMG")
			{
				if(oImg.getAttribute('origimg')==null)oImg.setAttribute('origimg',oImg.src);
				oImg.src = oE.getAttribute('disimg');
			}
		}
	}
}

//-- enable menu item - 
function contextmenu_item_enable(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		app.toggleDisabled(oE,false);
		
		oE.className="";
		//-- get text element and reset color style
		oE.childNodes[1].childNodes[0].style.color="#000000";


		if(oE.getAttribute('disimg')!="" && oE.getAttribute('disimg')!=null)
		{
			//-- change image
			//-- change image to disabled
			var oImg = oE.childNodes[0].childNodes[0].childNodes[0];
			if(oImg!=undefined && oImg.tagName=="IMG")
			{
				if(oImg.getAttribute('origimg')!=null)oImg.src = oImg.getAttribute('origimg');
			}
		}
	}
}

//--
//-- context menu item hide / show
//--
function contextmenu_item_hors(eContextMenu, strItemID , boolShow,aDoc)
{
	//alert(strItemID)
	strItemID = "contextmnu_" + strItemID;
	if(boolShow)
	{
		contextmenu_item_show(eContextMenu, strItemID , aDoc);
	}
	else
	{
		//alert(strItemID)
		contextmenu_item_hide(eContextMenu, strItemID , aDoc);
	}
}

//-- hide menu item - 
function contextmenu_item_hide(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		oE.style.display="none";
	}
}

//-- show menu item - 
function contextmenu_item_show(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		if(app.isIE)
		{
			oE.style.display="inline";
		}
		else
		{
			oE.style.display="table-row";
		}
	}
}


//-- set toolbar item label
function toolbar_item_setlabel(strToolBarID, strToolBarItemID , strLabel, aDoc)
{
	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		var pos = eDiv.childNodes[0].rows[0].childNodes.length-1;
		app.setElementText(eDiv.childNodes[0].rows[0].childNodes[pos]," "+strLabel);
	}
}

//--
//-- toolbar item enable disable etc
function toolbar_item_dore(strToolBarID, strToolBarItemID , boolEnable,aDoc)
{
	if(boolEnable)
	{
		//toolbar_item_enable(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			if(eDiv.getAttribute("checked")=="1")
			{
				toolbar_item_check(strToolBarID, strToolBarItemID , aDoc);
			}
			else
			{
				eDiv.className = "toolbar-item";
			}
			app.toggleDisabled(eDiv,false);

			if(eDiv.getAttribute('disimg')!="" && eDiv.getAttribute('disimg')!=null)
			{
				//-- change image
				//-- change image to disabled
				var oImg = eDiv.childNodes[0].rows[0].childNodes[0].childNodes[0];
				if(oImg!=undefined && oImg.tagName=="IMG")
				{
					if(oImg.getAttribute('origimg')!=null)oImg.src = oImg.getAttribute('origimg');
				}
			}
		}

	}
	else
	{
		//toolbar_item_disable(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			if(eDiv.getAttribute("checked")=="1")
			{
				toolbar_item_check(strToolBarID, strToolBarItemID , aDoc);
			}
			else
			{
				eDiv.className = "toolbar-item-disable";
			}
			app.toggleDisabled(eDiv,true);
			if(eDiv.getAttribute('disimg')!="" && eDiv.getAttribute('disimg')!=null)
			{
				//-- change image to disabled
				var oImg = eDiv.childNodes[0].rows[0].childNodes[0].childNodes[0];
				if(oImg!=undefined && oImg.tagName=="IMG")
				{
					if(oImg.getAttribute('origimg')==null)oImg.setAttribute('origimg',oImg.src);
					oImg.src = eDiv.getAttribute('disimg');
				}

			}
		}

	}
}

//-- diaable toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_disable(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;

	if(aDoc==undefined)aDoc=document;

	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.className = "toolbar-item-disable";
		app.toggleDisabled(eDiv,true);
	}


}

//-- enable toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_enable(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;

	if(aDoc==undefined)aDoc=document;

	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.className = "toolbar-item";
		app.toggleDisabled(eDiv,false);
	}
}

function toolbar_item_isvisible(strToolBarID, strToolBarItemID,aDoc)
{
	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		return (eDiv.style.display != "none")?true:false;
	}
	return false;
}
//-- show or hide
function toolbar_item_sorh(strToolBarID, strToolBarItemID , boolEnable,aDoc)
{
	if(boolEnable)
	{
		//toolbar_item_show(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			eDiv.style.display = "block";		
		}

	}
	else
	{
		//toolbar_item_hide(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			eDiv.style.display = "none";
		}

	}
}


//-- hide toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_hide(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;

	if(aDoc==undefined)aDoc=document;

	var eDiv = document.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.style.display = "none";
	}
	return;

}

//-- show toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_show(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;
	if(aDoc==undefined)aDoc=document;

	var eDiv = document.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.style.display = "block";
	}


	return;

}


//-- called when clicked
//-- check btn type - if menu then display appropiriate menu
function toolbar_check_btn_type(aBtn)
{
	//-- store this item as last clicked
	__array_toolbar_lastitem[aBtn.getAttribute("pid")] = aBtn;
	
	if(aBtn.getAttribute('displayenhanced') == "1") 
	{
		if(aBtn.popupmenu)aBtn.popupmenu.hide();
		if(aBtn.getAttribute("mnudown")=="1")
		{
			aBtn.setAttribute("mnudown","0");
			aBtn.className = "toolbar-item-high";
		}
		else
		{
			aBtn.setAttribute("mnudown","1");
			aBtn.className = "toolbar-item-select";
			if(aBtn.popupmenu)
			{
				aBtn.popupmenu.show();
			}
		}
	}
	else
	{
		var strType = aBtn.getAttribute("btntype");
		if(strType=="menu")
		{
			if(aBtn.getAttribute("mnudown")=="1")
			{
				hide_all_menu_divs();
				aBtn.setAttribute("mnudown","0");
				aBtn.className = (aBtn.getAttribute("btn")=="1")?"toolbar-button-high":"toolbar-item-high";			
			}
			else
			{
				showBtnMenu(aBtn,false);
			}

		}
		else
		{
			aBtn.setAttribute("mnudown","0");
			aBtn.className = (aBtn.getAttribute("btn")=="1")?"toolbar-button-high":"toolbar-item-high";
		}
	}
	__o_last_toolbar_item = aBtn;
}

function showBtnMenu(aBtn, boolForceHide)
{
		try
		{
			var aDoc = app.getEleDoc(aBtn);	
		}
		catch (e)
		{
			return;
		}
		

		var menuDiv	= aDoc.getElementById("mnu_"+ aBtn.id);		
		if(menuDiv==null)return;

		//-- is it already checked? if so hide menu
		if(boolForceHide==undefined)boolForceHide=false;
		var boolShow=true;
		try{

			if((aBtn.getAttribute("mnudown")=="1")||(boolForceHide))
			{
				boolShow=false;
				var btnoritem = (aBtn.getAttribute("btn")=="1")?"button":"item";
				aBtn.className = (!boolForceHide)?"toolbar-"+btnoritem+"-high":"toolbar-"+btnoritem;
				aBtn.setAttribute("mnudown","0");
			}
			else
			{
				//-- keep menu item depressed
				aBtn.setAttribute("mnudown","1");
				if(aBtn.className.indexOf("toolbar-button")==-1) aBtn.className = "toolbar-item-select";
				var btnoritem = (aBtn.getAttribute("btn")=="1")?"button":"item";
				aBtn.className = "toolbar-"+btnoritem+"-select";

			}

			//-- get menu for btn
			if(menuDiv!=null)
			{
				//-- just hiding so return
				if(!boolShow)
				{
					//menuDiv.style.visibility="hidden";
					menuDiv.style.display="none";
					var oIF = _get_menu_shimmer(menuDiv);
					oIF.style.display="none";
					return;
				}
				else
				{
					if(menuDiv.style.display=="block") return; // already visible
					menuDiv.style.display="block";
				}

				var iTop = app.eleTop(aBtn) + aBtn.offsetHeight - 1;
				menuDiv.style.top = iTop;
				//-- for safari have to resize table
				if((app.isIE || app.isSafari || app.isChrome ) && menuDiv.getAttribute("resized")!="1") 
				{
					var tbl = aDoc.getElementById("mnu_tbl_" + aBtn.id);

					if(tbl!=null)
					{
						var iWidth = 0;
						for(var x=0;x<tbl.rows.length;x++)
						{
							var oDiv = tbl.rows[x].cells[1].childNodes[0];
							if(oDiv.className!="mnu-splitter")
							{
								if(iWidth<oDiv.offsetWidth)	
								{
									iWidth = oDiv.offsetWidth;
								}
							}
						}

						for(var x=0;x<tbl.rows.length;x++)
						{
							tbl.rows[x].cells[1].style.width= iWidth;
						}

					}
					menuDiv.setAttribute("resized","1")	;	
				}

				//- -check if need to repos as may be going off to righ of form
				var iLeft = app.eleLeft(aBtn)-0;
				var iWidth = menuDiv.offsetWidth-0;
				var iRight = iWidth + iLeft
				var eleDoc = app.getEleDoc(aBtn);
				if(iRight>eleDoc.body.offsetWidth)
				{
					iLeft = iLeft - (iWidth-aBtn.offsetWidth);

				}
				menuDiv.style.left = iLeft;

				var oIF = _get_menu_shimmer(menuDiv);
				oIF.style.top = iTop;
				oIF.style.left = iLeft;

				oIF.style.display="none";
				if(boolShow)
				{
					oIF.style.width=menuDiv.offsetWidth;
					oIF.style.height=menuDiv.offsetHeight;
				}
			}
		}
		catch(e){}
}

//-- menu item clicked so action and hide options div
function menu_item_clicked(anItem,e)
{
	var strType = anItem.getAttribute("mnutype");
	var strContextMenu = anItem.getAttribute("context");
	if(strContextMenu=="1")
	{
		hide_all_menu_divs();
		return true;
	}

	if(strType!="menu")	
	{
		hide_all_menu_divs();

		//-- get parent div and see if its parent is a toolbar btn if so hide
		var pEle = app.get_parent_owner_by_tag(anItem,"DIV");
		if(pEle!=null)
		{
			var aDoc = app.getEleDoc(anItem);
			var ppItem = aDoc.getElementById(pEle.getAttribute("pid"));
			if(ppItem!=null)
			{
				if(ppItem.id.indexOf("tbi")==0)
				{
					//-- deactivate toolbar item
					showBtnMenu(ppItem, true);
				}
			}		
		}
		if(__o_last_toolbar_item!=null)	showBtnMenu(__o_last_toolbar_item, true);
		return true;
	}

	return false;

}

function contextmenu_item_mousedown(anItem,e)
{
	//-- hide menu
	var pEle = app.get_parent_owner_by_tag(anItem,"DIV");
	if(pEle!=null)
	{
		pEle.style.display="none";
	}

	if(anItem.className=="mnu-disabled") return false;
	return true;
}


//-- check menu item
function menu_check_item(anItem,e)
{
	

	//-- get parent item and make
	var aDoc = app.getEleDoc(anItem);
	var pItem = aDoc.getElementById(anItem.getAttribute("pid"));
	var lastItem = __array_menu_lastitem[anItem.getAttribute("pid")];
	if(lastItem!=undefined)
	{
		if(pItem!=lastItem && anItem!=lastItem)
		{
			//-- if last item has a menu down then hide it
			try
			{
				if(lastItem.getAttribute("mnudown")=="1")
				{
					if(lastItem.className!="")lastItem.className="";
					showMenuMenu(lastItem,true)
					lastItem.setAttribute("mnudown","0");

					for(var strMenuID in __array_open_menus)
					{
						if(__array_open_menus[strMenuID]!=null)
						{
							if(pItem.id!=strMenuID)	__array_open_menus[strMenuID].style.display="none";
						}
					}
				}
			}catch(e){}
		}
	}

	//-- parent is also a menu item so keep hihglighted
	if(pItem.id.indexOf("mnu")==0)
	{
		pItem.className="mnu-highlighter";
	}

	//-- if has children then show its menu
	var strType = anItem.getAttribute("mnutype");
	if(strType=="menu")
	{
		showMenuMenu(anItem);
		anItem.setAttribute("mnudown","1");
	}

	return false;
}

function showMenuMenu(anItem,boolHide)
{
	//-- get menu for btn
	if(boolHide==undefined)boolHide=false;
	var aDoc = app.getEleDoc(anItem);
	if(aDoc==null)return;

	//var arrmnu	= app.get_children_by_att_value(aDoc.body, "pid", anItem.id,false);
	var menuDiv = aDoc.getElementById("mnu_" + anItem.id);
	if(menuDiv!=null && anItem!=menuDiv)
	{
		var iTop = app.eleTop(anItem) + anItem.offsetHeight - 18;
		var iLeft = app.eleLeft(anItem) + anItem.offsetWidth-15;

		//--
		//-- this menu items suyb menu is loaded using a js function
		var strJsFunctionLoadMenuItems = anItem.getAttribute("itemloader");
		var jsFunc = app[strJsFunctionLoadMenuItems];
		if(jsFunc!=undefined)
		{
			if(!boolHide)
			{
				jsFunc(anItem,iLeft,iTop,window.event);
			}
			else
			{	
				anItem.popupmenu.hide();
			}
			return;
		}

		//-- items have been loaded by php so just show or hide containing div
		var oIF = _get_menu_shimmer(menuDiv);
		if(boolHide)
		{
			menuDiv.style.display="none";
			oIF.style.display="none";
			__array_open_menus[anItem.id] = null;
		}
		else
		{
			__array_open_menus[anItem.id] = menuDiv;
			menuDiv.style.top = iTop
			menuDiv.style.left = iLeft
			menuDiv.style.display="inline";

			//-- for safari have to resize table
			if((app.isSafari || app.isChrome) && menuDiv.getAttribute("resized")!="1")
			{
				var tbl = menuDiv.childNodes[0];
				if(tbl!=null)
				{
					var iWidth = 0;
					for(var x=0;x<tbl.rows.length;x++)
					{
						var oDiv = tbl.rows[x].cells[1].childNodes[0];
						if(iWidth<oDiv.offsetWidth)	iWidth = oDiv.offsetWidth;
					}

					for(var x=0;x<tbl.rows.length;x++)
					{
						tbl.rows[x].cells[1].style.width= iWidth;
					}

				}
				menuDiv.setAttribute("resized","1")	;	
			}

			//-- move shimmer
			oIF.style.top = iTop;
			oIF.style.left = iLeft;
			oIF.style.display="inline";
			oIF.style.width=menuDiv.offsetWidth;
			oIF.style.height=menuDiv.offsetHeight;
		}
	}
}

//-- create iframe to place under menu div
function _get_menu_shimmer(menuDiv)
{
	var aDoc = app.getEleDoc(menuDiv);

	if(aDoc==null)return;

	var strIframeID = menuDiv.id + "_if";
	var oIframe = aDoc.getElementById(strIframeID);
	if(oIframe==null)
	{
		//-- create it
		var strHTML = "<iframe id='"+strIframeID+"' class='iframe-shimmer' frameborder='0'></iframe>";
		app.insertBeforeEnd(aDoc.body,strHTML);

		//-- get pointer
		oIframe = aDoc.getElementById(strIframeID);
		oIframe.style.zIndex = menuDiv.style.zIndex-1;
	}
	return oIframe;
}

function menu_item_hover(aRow,e)
{
	
	
	if(aRow.className=="mnu-disabled") 
	{
		return false;
	}

	//-- highlight menu if not done already
	if(aRow.className=="mnu-highlighter") return false;
	aRow.className="mnu-highlighter";
	menu_check_item(aRow,e)

	__array_menu_lastitem[aRow.getAttribute("pid")] = aRow;
	//aRow.style.backgroundColor = "#B6BD02";
	//aRow.style.color = "#ffffff";
}

function menu_item_out(aRow,e)
{
	

	if(aRow.className=="mnu-disabled") return false;	

	//-- reset item style
	if(aRow.className=="") return false;
	aRow.className="";
}


//-- hide menu divs when moving from toolbar item to toolbar item
function hide_all_menu_divs(excludeItems)
{
	if(app._swcore.bHidingMenus) return;
	if(excludeItems==undefined)excludeItems=[];
	var anItem;
	var aDoc;
	var pItem;
	app._swcore.bHidingMenus = true;
	for(strPID in __array_menu_lastitem)
	{
		anItem = __array_menu_lastitem[strPID];
		try
		{
			anItem.className="";			
			showMenuMenu(anItem,true);
			anItem.setAttribute("mnudown","0");
		}
		catch (e)
		{
			continue;
		}

	}

	if(__o_last_toolbar_item!=null)	
	{
		showBtnMenu(__o_last_toolbar_item, true);
	}

	__array_menu_lastitem= new Array();
	
	app._swcore.bHidingMenus = false;
}

function hide_application_menu_divs(e)
{
	if(e && app.get_parent_owner_by_class(e.srcElement,"menu-holder"))
	{
		
		return false;
	}
	hide_all_menu_divs()
}
