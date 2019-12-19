
//Daniel Edwards
//06/04/05
//Basic VCM template for ITSM template

///////////////////////////////////////////////////////////////////////////////////////////

function OnFormLoaded()
{
add_contextmenuitem (99,"New view for CI");
add_contextmenuitem (98,"Open New VCM for CI");
add_contextmenuitem (97,"Show impact");
add_contextmenuitem (96,"Hide impact");
add_contextmenuitem (94,"***Custom function call");

}

///////////////////////////////////////////////////////////////////////////////////////////

function OnDeleteObject(strObjId)
{
var relation = new String(strObjId);
var underscorepos = relation.indexOf("_"); 
var parentci = relation.substring(1,underscorepos);
var childci = relation.substring(underscorepos + 1);
alert("The relationship between the parent CI with ref " + parentci + " and the child CI with reference" + childci + " is being removed please reload the view.");
var query = "delete from config_relation where fk_parent_ci_id = " +parentci+ " and fk_child_ci_id = " + childci;
SqlExecute("swdata",query);
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
if (strMenuString == "***Custom function call") 
{
MessageBox("This menu item would run any custom javascript function that you have defined within the vcmview.js file");
}
else if (strMenuString == "Show impact") 
	{
display_failure_effect(nId,1);
	}
else if (strMenuString == "Hide impact") 
{
display_failure_effect(nId,0);
}

else if (strMenuString == "New view for CI") 
{

	display_dependent_ci(nId,"",1); 
}
else if (strMenuString == "Open New VCM for CI") 
{
open_vcm(nId,"vcmconfig.xml",0,50,20,100);
}
else
{
var NewVal = "Update config_item set fk_status_level = '" + strMenuString + "' where Pk_auto_id = " + nId;
SqlExecute("swdata",NewVal);
}
}

///////////////////////////////////////////////////////////////////////////////////////////

function OnRemoveDependency(strObjId)
{
MessageBox("Currently this calls the CI details form in the standard configuration, custom forms may be defined for this action if required.");
var keyvalue = strObjId;
strUrl = "formmode=update&pk_auto_id=" + keyvalue;
app.OpenForm("frmConfigItem", strUrl, true);
}

///////////////////////////////////////////////////////////////////////////////////////////

function OnCreateDependency(strObjId)
{
MessageBox("Currently this calls the CI details form in the standard configuration, custom forms may be defined for this action if required.");
var keyvalue = strObjId;
strUrl = "formmode=update&pk_auto_id=" + keyvalue;
app.OpenForm("frmConfigItem", strUrl, true);
}

///////////////////////////////////////////////////////////////////////////////////////////

function OnViewObjectDetails(strObjId)
{
var keyvalue = strObjId;
strUrl = "formmode=update&pk_auto_id=" + keyvalue;
app.OpenForm("frmConfigItem", strUrl, true);
}
