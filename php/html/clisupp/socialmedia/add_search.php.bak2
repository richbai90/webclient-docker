<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');
	include('clsswsocialmedia.php');
	include('./twitter/clsTwitter.php');
	include('./twitter/clsBitLy.php');
	include_once('lib_oauth.php');
	include_once('lib_json.php');


	include_once('stdinclude.php');								//-- standard functions
	include_once('itsm_default/xmlmc/classactivepagesession.php');		
	
	//-- Construct a new active page session
	$session = new classActivePageSession(gv('sessid'));

	//-- Initialise the session
	if(!$session->IsValidSession())
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Session Authentication Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br><br>
					<center>
						<span class="error">
							There has been a session authentication error<br>
							Please contact your system administrator.
						</span>
					</center>
				</body>
		</html>
	<?php 		exit;
	}
	$_SESSION['sessid'] = gv('sessid');

?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>

<head>
<title>Search Settings - Supportworks Social Media</title>

<link rel="stylesheet" href="css/smstructure.css">
<link href="css/structure.css" rel="stylesheet" type="text/css" />
<link href="css/elements.css" rel="stylesheet" type="text/css" />

<script src="js/portal.control.js"></script>
<script src="js/xmlhttp.control.js"></script>
<script src="js/socialmedia.js"></script>
<script src="js/date.control.js"></script>
<script src="js/portal.selectors.js"></script>

<script>
	var app = top; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "<?php echo docURL();?>";
</script>
<script>
	function refreshMenu()
	{
		//-- Call to reload feed
		var msgMenuDiv = window.opener.document.getElementById('navColum');
		app.loadMsgMenu(msgMenuDiv,'<?php echo gv('sessid')?>');
		window.close();
	}
</script>
</head>
<body>
<div id="IE6MinWidth">
	<div id="wrapper">
	
	
		<div id="contentColumn">
			
			<div id="contentWrapper">

<!-- ********** page head **********-->
			
				<div id="swtPageTop" style="height:1px;"></div>
				
<!-- ********** End page head **********-->

<!-- ********** Start page body **********-->		

					<div id="swtInfoBody">
						<!--<br><img src="img/structure/hornbill.jpg" title="SupportWorks Social" / >--><br>

<?php 	$bUpdating = false;
	$SwSocialMedia = new SwSocialMedia();
	
	//-- check if we have a search id, in which case we are editing
	$strSearchName="";
	$strSearchQuery="";
	$intStartDatex=0;
	$intEndDatex=0;
	$intSearchID = gv('searchid');
	if($intSearchID!="")
	{
		$rsSearch = $SwSocialMedia->getSearch($intSearchID);
		$strSearchName=$rsSearch->f('monitor_name');
		$strSearchQuery=$rsSearch->f('search_query');
		$intStartDatex=$rsSearch->f('start_datex');
		$intStartDatex= date("Y-m-d", $intStartDatex);
		$intEndDatex=$rsSearch->f('end_datex');
		$intEndDatex= date("Y-m-d", $intEndDatex);
		$bSharedSearch=$rsSearch->f('shared_search');
		$bUpdating = true;
	}

	//-- get passed in form data
	//-- loop through posted vars and id each input
	foreach ($_REQUEST as $key => $val)
	{
		//-- check if we need to split data
		if(strpos($val,ANSWER_SPLIT)!==false)$val = str_replace(ANSWER_SPLIT," and ",$val);
		
			if(strpos($key,"__")!==false){
				$key = substr_replace($key,".",strpos($key,"__"),2);
				$arrReportCriteria[$key] = stripslashes($val);
			}else
				$arrReportCriteria[$key] = stripslashes($val);
	}

	//if(($arrReportCriteria['searchname']!="") && ($arrReportCriteria['searchquery']!=""))
	if($arrReportCriteria['searchquery']!="")
	{
		//-- Add Search
		$appid=1; // Currently hardcoded to "Twitter"
		//-- Dates returned from the JS Date control have the current time so we reformat here to start and end of selected days
		$intStartDate=mktime(0,0,0,date('m',$arrReportCriteria['socmed_monitors_start_datex']),date('d',$arrReportCriteria['socmed_monitors_start_datex']),date('Y',$arrReportCriteria['socmed_monitors_start_datex']));
		$intEndDate=mktime(23,59,59,date('m',$arrReportCriteria['socmed_monitors_end_datex']),date('d',$arrReportCriteria['socmed_monitors_end_datex']),date('Y',$arrReportCriteria['socmed_monitors_end_datex']));
		if($arrReportCriteria['bupdating'])
		{
			$SwSocialMedia->updateSearch($arrReportCriteria['socmed_monitors_pk_id'], $arrReportCriteria['searchquery'], $appid, $intStartDate, $intEndDate, $arrReportCriteria['searchquery'],$arrReportCriteria['socmed_monitors_search_analyst'],($arrReportCriteria['socmed_monitors_shared_search']=="on"));	
		}
		else
		{
			$SwSocialMedia->addSearch($arrReportCriteria['searchquery'], $appid, $intStartDate, $intEndDate, $arrReportCriteria['searchquery'],$arrReportCriteria['socmed_monitors_search_analyst'],($arrReportCriteria['socmed_monitors_shared_search']=="on"));			
		}
		?>
			Your search has been saved.
			<br/><a href='Javascript:refreshMenu();'>Close Window</a>
			</div> <!-- id="swtInfoBody"-->				
				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
				</div>
			
				</div>
				</div>
			</div>
			</div>
		<?php 		exit;
	}

	if(($strSearchName=="") && (gv('searchqry')!=""))
	{	
		$strSearchQuery = gv('searchqry');
	}

?>

<form name="frmAddSearch" id="frmAddSearch" method="POST" action="add_search.php">
	
	Search Query: <input type="text" name="searchquery" id="searchquery" style="width:75%;" value="<?php echo $strSearchQuery;?>"/>&nbsp;<!--<a href=
	"Javascript:runSearch(document.getElementById('searchquery').value,document.getElementById('searchresults'));">Search</a>-->
	
	<div class="searchoperators"><a href="https://support.twitter.com/groups/53-discover/topics/215-search/articles/71577-using-advanced-search" target="_blank">View advanced search options</a></div>
	
	<div id="searchresults"></div>
	
	<!--Search Name: <input type="text" name="searchname" id="searchname" value="<?php echo $strSearchName;?>"/>
	<br/>-->
	<div class="searchschedule">
	<p>Run Search Between: <br/><br/><input onclick='app.get_dateinput(event);' readonly style='width:133px;' class='input-date' maxlength=10 type='text' id='socmed_monitors.start_datex' intype='daterange' op='>=' dbvalue="<?php echo $intStartDatex;?>" value="<?php echo $intStartDatex;?>"> and <input readonly onclick='app.get_dateinput(event);' class='input-date' maxlength=10 style='width:133px;' type='text' id='socmed_monitors.end_datex' intype='daterange' op='<=' dbvalue="<?php echo $intEndDatex;?>" value="<?php echo $intEndDatex;?>"></p>
	<br/>
	</div>
	<?php if($SwSocialMedia->swAnalystIsAdmin) { ?>
		<div class="searchshare">
			<input id="socmed_monitors.shared_search" type="checkbox" <?php if($bSharedSearch==1){echo "checked";}?>/>Make search available to all analysts
		</div>
	<?php } ?>
	<div class="searchsave">
	<input type="button" id="btn_submit" onclick="window.close();" value="Close"   />
	<input type="button" id="btn_submit" onclick="app.submit_form('frmAddSearch');" value="Save Search" />
	</div>
	<input type="hidden" id="sessid" value="<?php echo gv('sessid');?>"/>
	<input type="hidden" id="bupdating" value="<?php echo $bUpdating;?>"/>
	<input type="hidden" id="socmed_monitors.pk_id" value="<?php echo $intSearchID;?>"/>
	<input type="hidden" id="socmed_monitors.search_analyst" value="<?php echo $SwSocialMedia->swAnalystID;?>"/>
</form>

					</div> <!-- id="swtInfoBody"-->				
				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
			</div>
			
		</div>
		</div>
	</div>
	</div>

<!-- date picker div - DO NOT REMOVE -->
<!-- date picker div - DO NOT REMOVE -->
<!-- date picker div - DO NOT REMOVE -->
<iframe id="date-picker-shimer" class="calendar-shimer"></iframe>

<div id="date-picker" class="calendar-holder">
	<table class="calendar-bar">
		<tr>
			<td onClick="prev_year()" title="back a year">
				<img src="img/icons/arr_ll.gif"></img>
			</td>
			<td onClick="prev_month()" title="back a month">
				<img src="img/icons/arr_left.gif"></img>
			</td>
			<td width="100%">
				<span id="cal_date"></span>
			</td>
			<td  onClick="next_month()" title="forward a month">
				<img src="img/icons/arr_right.gif"></img>
			</td>
			<td onClick="next_year()" title="forward a year">
				<img src="img/icons/arr_rr.gif"></img>
			</td>
		</tr>
	</table>
	<div id="date-picker-days">
		<table class="calendar-table" onClick="select_day(event)" onmouseover="hover_in_day(event)" onmouseOut="hover_out_day(event)" border=0 cellspacing=0 cellpadding=0>
		</table>
	</div>
</div>
<!-- eof date picker div -->

</body>
</html>