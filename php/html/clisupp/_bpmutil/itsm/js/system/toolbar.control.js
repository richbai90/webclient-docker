//-- highlite current bar item that mouse is over
function toolbar_mouseover(eleDiv, anEvent)
{
	var oSrcEle = app.getEventSourceElement(anEvent);
	if (oSrcEle)
	{
		if(oSrcEle.className.indexOf("toolbar-item")==0)
		{
			oSrcEle.className = "toolbar-item-high";
		}
	}
}

function toolbar_mouseout(eleDiv, anEvent)
{
	var oSrcEle = app.getEventSourceElement(anEvent);
	if (oSrcEle)
	{
		oSrcEle.className = "toolbar-item";
	}
}

