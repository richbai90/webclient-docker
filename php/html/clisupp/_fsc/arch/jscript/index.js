
function ge(strID)
{
	return document.getElementById(strID)
}

function expand_collapse(oImg, elementID, strColour)
{

	var oEle = ge(elementID);
	if(oEle!=null)
	{
		if(oEle.getAttribute("expanded")=="1")
		{
			oEle.setAttribute("expanded","0");
			oEle.style.display="none";
			oImg.src="img/icons/" + strColour + "_expand.gif"
		}
		else
		{
			oEle.setAttribute("expanded","1");
			oEle.style.display="inline";
			oImg.src="img/icons/" + strColour + "_contract.gif"
		}
	}
}
