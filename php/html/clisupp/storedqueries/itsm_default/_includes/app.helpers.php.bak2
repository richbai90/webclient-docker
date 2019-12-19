<?php
//-- Application Helpers File

//-- Handle error Messages Function
function handle_app_error($strError)
{
	//-- Function to take XMLMC Error and procduce a user frindly message.
	
	//-- Check if error message is Permission Based
	$Privileges= 'Insufficient privileges to perform operation';
	if (strpos($strError,$Privileges)) 
	{ 
		//-- Get Table and Rights from XMLMC Error
		$arrError = explode("[",$strError);
		$arrError2 = explode("]",$arrError[1]);
		$arrError3 = explode("]",$arrError[2]);
		$arrError4 = explode(".",$arrError[0]);
		$Right = $arrError2[0]; //-- Right
		$Table = $arrError3[0]; //-- Table
		$Message = $arrError4[2];
		//-- String to return in error
		$String = "

Insufficient privileges to perform operation.
	
".$Message."[".$Right."] permission on the [".$Table."] table.

Please contact you Supportworks system administrator.
"; 
		echo generateCustomErrorString("",$String);
	}else{
		//-- Give full XMLMC Error
		echo $strError;
	}
}

?>