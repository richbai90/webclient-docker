<?php 
// This file is used to change the database connection information.
// Further configuration files are as follows:
// 		viewer/config.xml 				- Contains all of the information from which to build the tree browser and change 
//										  other viewer settings
//		viewer/dbPrimaryKeyConfig.php 	- Contains the query statement that identifies the primary key based upon
//										  the information passed to the .exe
//
set_time_limit(60);
$strDB = "SMS";
$strUser = "sa";
$strPassword = "";
// $view contains a value to determine which way to display the data in the hardware and hardware history sections.
// if $view = "list", then the items will display in a list similar to the software--with column headings at the top of
// the page, and all values in a list.  if $view = "table", then each item will be displayed in its own table, with column
// names at the left, and values on the right.
//
// This can also be changed in the xml file, if the client wishes to have a mixture of the two views.  In this case, comment
// out the below line, and edit the config.xml file, so that each url element is defined as follows:
// <Url>&[app.webroot]/tableview.php?strCompID=%strCompID%&strTableName=Boot_Configuration_DATA&strPageTitle=Boot Configuration&strImage=32.gif&view=table</Url>
$view = "table";
?>
