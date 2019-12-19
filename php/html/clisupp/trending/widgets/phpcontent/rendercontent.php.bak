<?php


//-- if posted data provider then load
if(isset($_POST["dp"]))
{
	
	include("../../".$_POST["dp"]);
}
else
{
	$rsWidget = get_widgetrecord($_POST['wid']);
	if($rsWidget->Fetch())
	{
		$strPhpIncludeDefinition = $rsWidget->GetValueAsString("h_dataprovider");

		//-- include php - this include should echo out the content of the widget
		include("../".$strPhpIncludeDefinition);
	}
}
exit;
?>