<?php 
if ((sw_getcfgdword("RuntimeOptions")&0x00000800) == 0)
{
	print "<br><br><br><br><center>Sorry, Centennial integration is not licensed for this system, please contact your Supportworks provider.</center>";
	exit;
}
global $compid;
global $unit;
include_once("../incl_odbc.php");
// Create a new connection object

$query = "SELECT * FROM Client WHERE Client='".$compid."'";
if ($msql = odbc_connect($databasename, $username, $password))
{
	if ($results = odbc_exec($msql,$query))
	{
		while ($row = odbc_fetch_array($results))
		{
			if ($row["Location"]==""){
				$location = "Not currently assigned to a location.";
			}
			else{
				$index=0;
				$locationarray = array();
				$tablebegin='<table border="0" cellpadding="0" cellspacing="0">';
				$tableend='</table>';
				$locationid=$row["Location"];
				$query = "SELECT * FROM Location WHERE Location='".$locationid."'";
				if ($results = odbc_exec($msql,$query))
				{
					while ($row = odbc_fetch_array($results)){
						$locationarray[$index] = $row["Name"];
						$index++;
						if ($row["Parent"]){
							$locationid=$row["Parent"];
							$query = "SELECT * FROM Location WHERE Location='".$locationid."'";
							$results = odbc_exec($msql,$query);
						}//end if
					}//end while fetch row
				}//end if results
				$html="";
				for($index=count($locationarray);$index>=0;$index--){
					$html .= "<tr>";
					$numberofspacers = count($locationarray)-$index;
					for ($index2=0;$index2<$numberofspacers;$index2++){
						$html.='<td><img src="images/space.gif" width="10" height="2" alt="" border="0"></td>';
					}
					$html.='<td colspan="'.($index+1).'" NOWRAP>'.$locationarray[$index].'</td>';
					$html.=	"</tr>";
				}
				$location = $tablebegin.$html.$tableend;
			}//end if/else
		}//end while
?>
<html>
	<head>
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Expires" content="-1">
		<title>Notes</title>
		<link rel="stylesheet" href="maincss.css" type="text/css">
	</head>

<body topmargin="0" marginheight="0" marginwidth="0" leftmargin="0" bgcolor="#EFF7FF">
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Current Location&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		
		<tr>
			<td background="images/title.gif" nowrap width="1"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Location&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		
		<tr bgcolor="#ffffff">
			<td></td>
			<td valign="top" nowrap><?php print $location?>&nbsp;</td>
			<td></td>
		</tr>
		
		
	
	</table><br><br>
	<table border="0" cellspacing="0" cellpadding="0" width="100%">
		<tr>
			<td background="images/gradientbg.gif"></td>
			<td background="images/gradientbg.gif" nowrap><span class="header1">&nbsp;&nbsp;Previous Locations&nbsp;</span></td>
			<td background="images/gradientbg.gif"></td>
		</tr>
		
		<tr>
			<td background="images/title.gif" nowrap width="1"><img src="images/titleleft.gif" width="1" height="16" vspace="0" hspace="0"></td>
			<td background="images/title.gif" nowrap><span class="header1">&nbsp;&nbsp;Location&nbsp;</span></td>
			<td background="images/title.gif" width="2" nowrap><img src="images/titleright.gif" width="2" height="16" vspace="0" hspace="0"></td>
		</tr>
		<tr bgcolor="#ffffff">
			<td></td>
			<td valign="top" nowrap>&nbsp;&nbsp;No previous location information for this item.&nbsp;</td>
			<td></td>
		</tr>
	</table>
</body>
</html>
<?php 
	}
	else
	{
		print "No Rows Returned";
		exit;
	}
}
else
{
	print "No DB Connection";
	exit;
}
?>