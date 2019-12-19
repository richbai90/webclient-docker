
function dtable_goto(intType,oSpan)
{
	var eDiv = app.get_parent_owner_by_tag(oSpan,"DIV");
	var intCurrStart = eDiv.getAttribute('startrow');
	var intTotalRows = eDiv.getAttribute('totalrows');

	if((intTotalRows != null) && (intCurrStart!=null))
	{
		var eRPP = app.get_parent_child_by_id(eDiv, "tbl_rpp");
		var intRowsPerPage = (eRPP!=null)?eRPP.value:20;
		intRowsPerPage++;intRowsPerPage--;
		//-- cast to numbers
		intTotalRows++;intTotalRows--;
		intCurrStart++;intCurrStart--;

		if(intType==0)
		{
			intNewStartRowPos=1;
		}

		if(intType==3)
		{
			intNewStartRowPos=-9999;
		}


		if(intType==1)
		{
			intNewStartRowPos= intCurrStart-intRowsPerPage;
		}


		if(intType==2)
		{
			intNewStartRowPos= intCurrStart+intRowsPerPage;
		}

		var intStartFromRow = intNewStartRowPos;


		if((intNewStartRowPos < 1) && (intNewStartRowPos!=-9999))
		{
			//-- move to start as going past length
			intStartFromRow=1;
		}
		else if (intNewStartRowPos==-9999)
		{
			//-- goto last page
			intStartFromRow = intTotalRows - intRowsPerPage + 1;
			
		}
		else if(intStartFromRow >= intTotalRows)
		{

			//-- trying to go past last page to stop
			intStartFromRow = intTotalRows - intRowsPerPage + 1;
		}


		//alert(intStartFromRow);
		eDiv.setAttribute('startrow',intStartFromRow);

		if(intStartFromRow<1)intStartFromRow=1;
		var oDiv = get_parent_owner_by_tag(oSpan, "DIV");

		var oTable = oDiv.childNodes[1];
		var oTbody = oTable.childNodes[1];

		var uppLimit = intStartFromRow+intRowsPerPage;

		for(var x=0;x<oTbody.childNodes.length;x++)
		{
			var tr = oTbody.childNodes[x];
			if(tr.id < intStartFromRow)
			{
				tr.setAttribute("className","row-data-invisible");
			}else if(tr.id >= (uppLimit))
			{
				tr.setAttribute("className","row-data-invisible");
			}else
			{
				tr.setAttribute("className","row-data");
			}
		}
		var fdiv = ge("tbl_disp");
		uppLimit--;
		fdiv.innerHTML = "&nbsp;"+intStartFromRow+" to "+uppLimit+" of "+intTotalRows+" &nbsp;";
	}
}


//-- nwj - 30.07.2008
function dtable_changerpp(eTB)
{
	var intValue = eTB.value;
	intValue++;intValue--;

	//-- if not a number default value
	if(isNaN(intValue))
	{
		intValue=20;
		eTb.value = intValue;
	}

	var eDiv = app.get_parent_owner_by_tag(eTB,"DIV");
	var intCurrStart = eDiv.getAttribute('startrow');
	var intTotalRows = eDiv.getAttribute('totalrows');
	
	intTotalRows++;intTotalRows--;
	intCurrStart++;intCurrStart--;
	
	eDiv.setAttribute('startrow',intCurrStart);
	var intStartFromRow=intCurrStart;
	if(intStartFromRow<1)intStartFromRow=1;
	var oDiv = get_parent_owner_by_tag(eTB, "DIV");

	var oTable = oDiv.childNodes[1];
	var oTbody = oTable.childNodes[1];

	var uppLimit = intStartFromRow+intValue;

	for(var x=0;x<oTbody.childNodes.length;x++)
	{
		var tr = oTbody.childNodes[x];
		if(tr.id < intStartFromRow)
		{
			tr.setAttribute("className","row-data-invisible");
		}else if(tr.id >= (uppLimit))
		{
			tr.setAttribute("className","row-data-invisible");
		}else
		{
			tr.setAttribute("className","row-data");
		}
	}
	var fdiv = ge("tbl_disp");
	uppLimit--;
	fdiv.innerHTML = "&nbsp;"+intStartFromRow+" to "+uppLimit+" of "+intTotalRows+" &nbsp;";


}

