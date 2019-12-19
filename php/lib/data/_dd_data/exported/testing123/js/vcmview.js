
//-- NWJ
//-- 22.03.2007
//-- Basic VCM template for ITSMv2 template

///////////////////////////////////////////////////////////////////////////////////////////

function OnFormLoaded()
{
	add_contextmenuitem (98,"Open New VCM window for CI");
	add_contextmenuitem (99,"Open New tab view for CI");
	add_contextmenuitem (101,"");
	add_contextmenuitem (96,"View Inventory");
	add_contextmenuitem (97,"View Change Schedule");
	add_contextmenuitem (100,"");
	add_contextmenuitem (102,"Show Impact Upstream");
	add_contextmenuitem (95,"Show Impact Downstream");
	add_contextmenuitem (94,"Hide Impact");
	//add_contextmenuitem (94,"***Custom function call");

}

///////////////////////////////////////////////////////////////////////////////////////////

function OnDeleteObject(strObjId)
{
	return true;
	var relation = String(strObjId);
	var underscorepos = relation.indexOf("_"); 
	var parentci = relation.substring(1,underscorepos);
	var childci = relation.substring(underscorepos + 1);
	//-- nwj - 2012.11.21 - this table does not exist any more - apps dev need to check if they need to change this
	//var query = "dxelete from config_relation where fk_parent_ci_id = " +parentci+ " and fk_child_ci_id = " + childci;
	//SxqlExecute("swdata",query);

 return true;
}

///////////////////////////////////////////////////////////////////////////////////////////

function OnDbClickObject(strObjId)
{
	 display_dependent_ci(strObjId,"",1);
}

///////////////////////////////////////////////////////////////////////////////////////////

function OnSearchItem()
{
	MessageBox("Open a javascript search form...");
}
//////////////////////////////////////////////////////////////////////////////////////////
function OnContextMenuItemSelected(nId,strMenuString)
{
	if (strMenuString === "***Custom function call") 
	{
		MessageBox("This menu item would run any custom javascript function that you have defined within the vcmview.js file");
	}
	else if (strMenuString === "Show Impact Downstream") 
	{
		display_failure_effect(nId,0);
		display_failure_effect(nId,1);
	}
	else if (strMenuString === "Hide Impact")
	{
		display_failure_effect(nId,0);
	}
	else if (strMenuString === "Show Impact Upstream") 
	{
		display_failure_effect(nId,0);
		display_failure_effect(nId,1,false);
	}
	else if (strMenuString === "New view for CI") 
	{
		display_dependent_ci(nId,"",1); 
	}
	else if (strMenuString === "Open New VCM for CI") 
	{
		open_vcm(nId,"vcmconfig.xml",0,50,20,100);
	}
	else if (strMenuString === "View Inventory") 
	{
		view_vcm_inventory(nId);
	}
	else if (strMenuString === "View Change Schedule") 
	{
		view_vcm_schedule(nId);
	}
}

function view_vcm_schedule(strObjId)
{
	var keyvalue = strObjId;
	app.cmdb.view_schedule(keyvalue,"");
}

function view_vcm_inventory(strObjId)
{
	var keyvalue = strObjId;
	//-- select the ci record
	app.cmdb.view_inventory(keyvalue,"");
}

///////////////////////////////////////////////////////////////////////////////////////////

function OnRemoveDependency(strObjId)
{
	//MessageBox("Currently this calls the CI details form in the standard configuration, custom forms may be defined for this action if required.");
	var keyvalue = strObjId;
	app.cmdb.popup_configitem(keyvalue,true,"",true,function()
	{
		return false;
	});

}

///////////////////////////////////////////////////////////////////////////////////////////

function OnCreateDependency(strObjId)
{
	//MessageBox("Currently this calls the CI details form in the standard configuration, custom forms may be defined for this action if required.");
	var keyvalue = strObjId;
	app.cmdb.popup_configitem(keyvalue,true,"",true,function()
	{
		return false;
	});	
}

///////////////////////////////////////////////////////////////////////////////////////////

function OnViewObjectDetails(strObjId)
{
	var keyvalue = strObjId;
	app.cmdb.popup_configitem(keyvalue,true,"",true,function()
	{
		return false;
	});	
}
