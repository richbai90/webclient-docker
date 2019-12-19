<?php 	//-- 20.05.2004 - NWJ
	//-- Called by Supportworks after a call search
	//-- determines which php to show based on call class

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include_once("global.settings.php");
	include_once('itsm_default/xmlmc/common.php');

	/**
	 * Splits a single line string into two lines.
	 * 
	 * Used for workflow progress boxes.
	 *
	 * @param String $str
	 * @param Bool &$didWrap 
	 * @return String
	 */
	function str_multiline($str, &$didWrap)
	{
	    $str = trim($str);
	    
	    $left  = ' '.substr($str, 0, strlen($str) / 2);
	    $right = substr($str, strlen($left) - 1).' ';

	    $leftPos  = strrpos($left, ' ');
	    $rightPos = strpos($right, ' ');
	    
        if(strlen($left) - $leftPos < $rightPos)
        {
            // space on left nearer to center then on right
            $str = trim(trim(substr($left, 0, $leftPos)).PHP_EOL.trim(substr($left, $leftPos)).trim($right));
        }
        else
        {
            $str = trim(trim($left).trim(substr($right, 0, $rightPos)).PHP_EOL.trim(substr($right, $rightPos)));
        }
	    if(strpos($str, PHP_EOL) === FALSE)
	    {
	        $didWrap = FALSE;
	    }
	    else
	    {
	        $didWrap = TRUE;
	    }
	    return $str;
	}
	

	if ( (gv('callref') == "") && (gv('CALLREF') != "") ) 
	{
		$callref = gv('CALLREF');
	}
	else
	{
		$callref = gv('callref'); //-- make local
	}

	//-- create our database connects to swdata and systemdb
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());

	$sysconn = new CSwDbConnection();
	$sysconn->SwCacheConnect();
	$sysconn->LoadDataDictionary("itsmv2");

	//-- try get call from cache
	$sysconn->Query("SELECT * FROM opencall where callref = " . pfs($callref));
	$rsCall = $sysconn->CreateRecordSet();
	if((!$rsCall)||($rsCall->eof))
	{
		//-- failed to get call from cache so get it from swdata
		$swconn->Query("SELECT * FROM opencall where callref = " . pfs($callref));
		$rsCall = $swconn->CreateRecordSet();
		if((!$rsCall)||($rsCall->eof))
		{
			//-- call not found ?? in theory should never happen
			?>
			<html>
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
					<meta http-equiv="Pragma" content="no-cache">
					<meta http-equiv="Expires" content="-1">
					<title>Support-Works Call Search Failure</title>
				</head>
					<body>
						<br><br>
						<center>
						<p>
							The Supportworks record could not be found<br>
							Please contact your system administrator.
						</p>
						</center>
					</body>
			</html>
			<?php 			exit;
		}
	}

	//-- if cust_id is not empty load userdb record
	if($rsCall->xf("cust_id")!="")
	{
		$selcust = "select * from userdb where keysearch = '" . PrepareForSQL($rsCall->f("cust_id")) . "'";
		$swconn->Query($selcust);
		$rsCust = $swconn->CreateRecordSet();
	}
    if($rsCall->xf("bpm_progress")!="")
    {
        $selprogress = "select * from bpm_progress where fk_workflow_id = '".$rsCall->xf('bpm_workflow_id')."' order by pindex asc";
        $swconn->Query($selprogress);
        $rsProgress = $swconn->CreateRecordSet();
    }
	if(isset($rsCust)==false)$rsCust = new odbcRecordsetDummy;
	
	//-- get extended table info for the workflow process
	$strSelectWorkflowTableName = "select ext_db_table from bpm_workflow where pk_workflow_id = '".$rsCall->xf('bpm_workflow_id')."'";
	$swconn->Query($strSelectWorkflowTableName);
	$rsWF = $swconn->CreateRecordSet();
	if(isset($rsWF) && !$rsWF->eof)
	{
		//-- now get ext table data
		$extendedTableName = $rsWF->xf('ext_db_table');
		if($extendedTableName!="")
		{
			$strSelectWorkflowTableData = "select * from ".$extendedTableName." where opencall = " . pfs($callref);
			if($swconn->Query($strSelectWorkflowTableData))
			{
				$rsWFData = $swconn->CreateRecordSet();
				if(isset($rsWFData)==false)
				{
					$rsWFData = new odbcRecordsetDummy;
				}
			}
		}
	}
	
	//-- set up some vars that we will use
	$callclass=$rsCall->xf('callclass');
	$callstatus=$rsCall->xf('status');
	$cicallcausecode="";

	//--
	//-- depending on callclass include content page ???

	//-- get text we will show on causeing items header
	$citextcode=explode("-",$cicallcausecode);
	$citextcode=(isset($citextcode[1]))?$citextcode[1]:$citextcode[0];
	$citextcode=	ucfirst(strtolower($citextcode));
	
	//-- nwj - just use standard call for now unril noko gives us pages
	$include_content='bpmcalldata.php';
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Workflow Progress</title>
<body class="activepagebody">
<div id="activepagecontentColumn" >
	<div id="formArea" style="width:100%;">
			<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
			<div id="swtInfoBody">
					<div class="sectionHead">
							<table class="sectionTitle">
									<tr>
										<td class="titleCell" noWrap><h1><center><?php echo"Workflow Information";?><center></h1></td>
										<td class="endCell"></td>
									</tr>
							</table>	
					</div>
			</div>
	</div>
</div>	

<!-- ES 109085 -->
<style>center{font-size: 12px;}</style>
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>

</head>
<body class="activepagebody">
<?php include($include_content);?>
</body>
</html>