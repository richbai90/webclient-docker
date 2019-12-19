<?php //-- start php session
@session_start();

//--
//-- set the install portal common files path - used for loading files
//-- have option to override  install path i.e. webserver or something similar
//-- include php file that can be edited by consultant to point ot pat
include('installpath.php');


//-- NWJ - make sure session save path exists
$savepath = ini_get('session.save_path');
if (file_exists($savepath)==false)
{
    RecursiveMkdir($savepath);
}

//--
//-- determine the mode we are running in

if(isAnalystPortal()==true)
{
    //-- ANALYST PORTAL
    //-- check analyst session
    if(check_analyst_session_state()==false)
    {
        //-- analyst session expired or invalide
        if(gv("httpreqid")!="")
        {
            //-- being called by xmlhttp request so return session message
            echo "SESSION:Your Supportworks session has expired or is invalid. Please log on again.";
        }
        else
        {
            //-- being called in an include so goto index
            ?>
				<script>
					var undefined;
					if(portalroot==undefined)
					{
						//-- more than likely a popup page
						if(opener) 
						{
							opener.create_submit_form("index.php?errorid=1702", "_self");
							//opener.document.location.href="index.php?errormsg=Your Supportworks session has expired or is invalid. Please log on again.";
						}
						self.close();
					}
					else
					{
						create_submit_form("index.php?errorid=1702", "_self");
						//document.location.href="index.php?errormsg=Your Supportworks session has expired or is invalid. Please log on again.";
					}				
				</script>
            <?php 		}
		exit;
	}
	else
	{
		//-- analyst portal specific includes
	    swdti_load($_SESSION['wc_dd']);

		//-- load app rights into session so we can do checks for menu options etc
		if(!isSet($_SESSION['wc_apprights']))
		{
			$xmlmc = new XmlMethodCall();
			$xmlmc->Invoke("session","getSessionInfo2");
			$strLastError = $xmlmc->GetLastError();
			$appRights = Array();
			if($strLastError=="")
			{
				$sessionok = true;
				$arrRows = $xmlmc->xmlDom->get_elements_by_tagname("params");
				foreach($arrRows as $cats)
				{
					$children = $cats->child_nodes();
					$dTotal = count($children);
					$catItem = array();
					for ($i=0;$i<$dTotal;$i++)
					{
						$colNode = $children[$i];
						if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
						{
							$strColName = $colNode->tagname();
							$strColName = strtolower($strColName);
							if($strColName=="appright")
							{
								$appDD = _getxml_childnode_content($colNode,"appName");
								$appRights[$appDD] = Array(); 
								$appRights[$appDD]["A"] = _getxml_childnode_content($colNode,"rightA");
								$appRights[$appDD]["B"] = _getxml_childnode_content($colNode,"rightB");
								$appRights[$appDD]["C"] = _getxml_childnode_content($colNode,"rightC");
								$appRights[$appDD]["D"] = _getxml_childnode_content($colNode,"rightD");
								$appRights[$appDD]["E"] = _getxml_childnode_content($colNode,"rightE");
								$appRights[$appDD]["F"] = _getxml_childnode_content($colNode,"rightF");
								$appRights[$appDD]["G"] = _getxml_childnode_content($colNode,"rightG");
								$appRights[$appDD]["H"] = _getxml_childnode_content($colNode,"rightH");
								continue;
							}
						}
					}
				}
				$_SESSION['wc_apprights'] = $appRights[$_SESSION['dd']];
			}
		}
	}
}
else if ($_SESSION['portalmode'] == "FATCLIENT")
{
    //--
    //-- reset portal instance path to be portal when using the fat client
    $GLOBALS['instance_path'] = sw_getcfgstring("InstallPath");
    $GLOBALS['instance_path'] .= "\html\_phpinclude\\". APPCODE ."\xmlmc\\";
}
else if ($_SESSION['portalmode'] == "CUSTOMER")
{
    //-- ASSUME SELFSERVICE / CUSTOMER LOGIN BASED
    //-- include any self service specific stuff here
    //include_once('_ssconfig.php');

	// Load Application System Setting to check for a single selfservice root being used
	$_SESSION['use_single_portal_root'] = false;
	$sql = "select * from sw_sbs_settings where setting_name = 'SELFSERVICE.USE_SINGLE_PORTAL_ROOT' and appcode = '".$_SESSION['dataset']."'";
	$con = database_connect("swdata");
	if($con)
	{
		$oRS = $con->Query($sql,true);
		if($oRS)
		{
			if(!$oRS->eof)
			{
				if($oRS->f('setting_value')=="True")
					$_SESSION['use_single_portal_root'] = true;
			}
		}
	}

    include_once('classcustomersession.php');	//-- class to handle customer session (setup session vars)
	if(!$_SESSION['use_single_portal_root'])	//-- No need to perform checks for alternative selfservice portal if one portal being used
	{
		if(preg_match("/" . $_SESSION['app_path'] . "/i",$_SERVER['SCRIPT_URL'])===false)
		{
			$strDest = $_SERVER['HTTP_REFERER'];
			$strURL = $_SERVER['SCRIPT_URL'];
			$strDest =  str_replace('portal.php' , '' , $strDest);
			   //-- being called in an include so goto index

			if(gv("httpreqid")!="")
			{
				//-- being called by xmlhttp request so return session message
				echo "SESSION:" . $strSessionResult;
			}
			else
			{
			?>
			<html>
			<head>
				<script>
					//-- F0098407
					if(!opener)
						opener = window.opener;
					//-- F0
					//-- more than likely a popup page
					if(opener)
					{
						//opener.document.location.href="index.php?errormsg=Your Supportworks session has expired or is invalid. Please log on again.";
						alert("Your Supportworks session has expired or is invalid. Please log on again");
						opener.create_submit_form("index.php?errorid=1702", "_self");
						//opener.location.href="<?php echo $strDest;?>index.php?errormsg=6Your Supportworks session has expired or is invalid. Please log on again";
						self.close();
					}else
					{
						alert("Your Supportworks session has expired or is invalid. Please log on again");
						parent.window.location.href="index.php?errorid=1702";
					}
				</script>
			</head>
			<body>
			  <p>Please go <a href="index.php">here</a>.</p>
			</body>
			</html>
			<?php 			}
			exit;
		}
	}

    //--
    //-- check we have a valid session
    GLOBAL $customer_session;
    $customer_session = new classCustomerSession;
    $strSessionResult = check_customer_session_state();
    if($strSessionResult!="OK")
    {
		//-- we are using sspi
		if(($_SESSION['SSPION']) && ($_SERVER['HTTP_REFERER'] != 'sspi/index.php'))
		{
		    // header('Location: index.php?errormsg=' . $strSessionResult , 303);
			header('Location: index.php?errorid=1702' , 303);
		     exit;
		}

        if(gv("httpreqid")!="")
        {
            //-- being called by xmlhttp request so return session message
            echo "SESSION:" . $strSessionResult;
        }
        else
        {
			$strURL = $_SERVER['SCRIPT_URL'];
			if(strpos($strURL,'/action.php')!==false)
			{


			}
			else
			{
				//-- being called in an include so goto index
				?>
					<script>
						//-- F0098407
						if(!opener)
							opener = window.opener;
						if(opener)
						{
							//opener.document.location.href="index.php?errormsg=Your Supportworks session has expired or is invalid. Please log on again.";
							alert("Your Supportworks session has expired or is invalid. Please log on again");
							opener.location.href="<?php echo $_SESSION['www_portalroot'];?>index.php?errorid=17021234";
							self.close();
						}
						else
						{
							alert("Your Supportworks session has expired or is invalid. Please log on again");
							parent.window.location.href="index.php?errorid=1702";
						}
					</script>
				<?php 				exit;
			}
		}
	}

	//-- load customer ss ddf info (so we can use swdti_getcolname etc0
	swdti_load($_SESSION['config_dd']);
}
else
{
        if(gv("httpreqid")!="")
        {
            //-- being called by xmlhttp request so return session message
            echo "SESSION:Your Supportworks session has expired or is invalid. Please log on again";// . $strSessionResult;
 			exit;
        }
        else
        {

		//-- not a recognised session
		?>
        <html>
        <head>
        <script>
			//-- more than likely a popup page
			if(!opener)
				opener = window.opener;
			if(opener) 
			{
				alert("Your Supportworks session has expired or is invalid. Please log on again");
				opener.location.href="index.php?errorid=1702";
				//opener.document.location.href="index.php?errormsg=Your Supportworks session has expired or is invalid. Please log on again.";
				self.close();
			}
			else
			{
				alert("Your Supportworks session has expired or is invalid. Please log on again");
				parent.window.location.href="index.php?errorid=1702";
			}
		</script>
		</head>
		<body>
		  <p>Please go <a href="index.php">here</a>.</p>
		</body>
		</html>
    <?php     die();
		}
}

//--
//-- get customer session state message
function check_customer_session_state()
{
    $strResult="OK";
    GLOBAL $customer_session;
    switch($customer_session->check_session_state())
    {
        case SW_SESSION_INVALID:					// Invalid session ID string
            $strResult= "Invalid Session ID found. Please log in again";
            break;
        case SW_SESSION_TIMEOUT:					// Session ID has expired
            $strResult= "Your session has timed out. Please log in again";
            break;
        case SW_SESSION_OK:							// We are a valid session
            break;
    }//end switch/case on session
    return $strResult;
}

//--
//-- get analyst session state message
function check_analyst_session_state()
{
    return $_SESSION['wcsession']->IsValidSession($_SESSION['sw_sessionid']);
}

//-- t / f if running in webportal mode
function isAnalystPortal()
{
    return ($_SESSION['portalmode']=="WEBPORTAL");
}


?>