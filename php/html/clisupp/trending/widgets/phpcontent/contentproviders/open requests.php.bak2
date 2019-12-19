<?php

//-- we have xmlc and sqlquery to hand so we can do a sql statement and construct fusion chart data set

function hslanchor_opencall($cr)
{
	return "<a href='#' onclick='run_hsl_anchor(this)' atype='calldetails' key='".$cr."'>".$cr."</a>";
}

$rs = new SqlQuery();
$strSql = "select callref, itsm_title, cust_name, callclass, lastactdate from opencall where status<16 and withinfix='0' and prb_state != ''";

$rs->Query($strSql);

$tabledata="";
$x=1;
while ($rs->Fetch())
{
	$class = ($x % 2 == 0)?"":"class='tr-odd'";
	$x++;
	$cRef = swdti_formatvalue("opencall.callref",$rs->GetValueAsNumber("callref"));
	$title = $rs->GetValueAsString("itsm_title");
	$state = $rs->GetValueAsString("cust_name");
    $class = $rs->GetValueAsString("callclass");
    $fixby = $rs->GetValueAsString("lastactdate");
	$tabledata.="<tr ".$class."><td>".hslanchor_opencall($cRef)."</td><td>".$title."</td><td>".$state."</td><td>".$class."</td><td>".$fixby."</td></tr>";
}
?>


<table cellspacing='0' cellpadding='2'>
	<tr class='tbl-h'>
		<td>Reference</td>
		<td>Desc</td>
		<td>Customer</td>
		<td>Type</td>
		<td>Last Updated</td>
	</tr>
	<?php echo $tabledata;?>
</table>