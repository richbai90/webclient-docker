<?php

//-- we have xmlc and sqlquery to hand so we can do a sql statement and construct fusion chart data set

function hslanchor_opencall($cr)
{
	return "<a href='#' onclick='run_hsl_anchor(this)' atype='calldetails' key='".$cr."'>".$cr."</a>";
}

$rs = new SqlQuery();
$strSql = "select callref, itsm_title, prb_state from opencall where status<16 and callclass='problem' and prb_state != ''";

$rs->Query($strSql);

$tabledata="";
$x=1;
while ($rs->Fetch())
{
	$class = ($x % 2 == 0)?"":"class='tr-odd'";
	$x++;
	$cRef = swdti_formatvalue("opencall.callref",$rs->GetValueAsNumber("callref"));
	$title = $rs->GetValueAsString("itsm_title");
	$state = $rs->GetValueAsString("prb_state");
	$tabledata.="<tr ".$class."><td>".hslanchor_opencall($cRef)."</td><td>".$title."</td><td>".$state."</td></tr>";
}
?>


<table cellspacing='0' cellpadding='2'>
	<tr class='tbl-h'>
		<td>Reference</td>
		<td>Problem</td>
		<td>Status</td>
	</tr>
	<?php echo $tabledata;?>
</table>