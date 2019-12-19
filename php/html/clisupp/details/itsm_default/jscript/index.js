  
 var app = this;
//-- datatable event functions
function dtable_sort()
{
	return false;
}


function dtable_row_dblclicked()
{
	return false;
}

function dtable_row_clicked()
{
	return false;
}

function dtable_row_lowlight()
{
	return false;
}

function dtable_row_highlight()
{
	return false;
}

function dtable_previewrow_highlight()
{
	return false;
}

function dtable_previewrow_lowlight()
{
	return false;
}

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

function enable_kb(boolEnable)
{
	var x = document.getElementById('so_title');
	x.disabled = boolEnable;
	var x = document.getElementById('so_key');
	x.disabled = boolEnable;
	var x = document.getElementById('so_probtext');
	x.disabled = boolEnable;
	var x = document.getElementById('so_soltext');
	x.disabled = boolEnable;
}
