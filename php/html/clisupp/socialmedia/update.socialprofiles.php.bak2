<?php
	include_once('itsm_default/xmlmc/common.php');
	
	$swDATA = new CSwDbConnection;
	if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
	{
		echo "Failed to create connection to (".swdsn().")";
		exit;
	}

	$strDelete = "delete from socmed_twitter_acts where sm_acc_id = '". PrepareForSQL(gv("sm_acc_idp")). "'";
	//echo $strDelete;
	$swDATA->Query($strDelete);

	$strDelete = "delete from socmed_analysts where fk_acc_id = '". PrepareForSQL(gv("sm_acc_idp")). "'";
	//echo $strDelete;
	$swDATA->Query($strDelete);
	
	//-- Delete search instances used for mentions and DMs on the profile
	if(gv("sm_acc_namep")<>"")
	{
		$strDeleteSearch = "delete from socmed_monitors where (monitor_name='@". PrepareForSQL(gv("sm_acc_namep")). "' and monitor_type='mention') OR (monitor_name='@". PrepareForSQL(gv("sm_acc_namep")). "' and monitor_type='dm')";
	}
	//echo $strDeleteSearch;
	$swDATA->Query($strDeleteSearch);
?>
	<form id="form_updatetablep" action="update.socialprofiles.php" method="POST" accept-charset="UTF-8">
					<input id="sm_acc_idp" name="sm_acc_idp" type="hidden" value="">
					<input id="sm_acc_namep" name="sm_acc_namep" type="hidden" value="">
				</form>
<?php				
			$swDATA = new CSwDbConnection;
			if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
			{
				echo "Failed to create connection to (".swdsn().")";
				exit;
			}

			$intProfileCount=0;
			$strSelect = "select * from socmed_twitter_acts order by sm_acc_name asc";
			$rsComp = $swDATA->Query($strSelect,true);
			$strOutput = "<table border=0>";
			while(!$rsComp->eof)
			{
				$strChecked = "";
				$thisAcnt = $rsComp->f('sm_acc_id');
							
				$strOutput.= "<tr><td valign='top'><label for=\"".$rsComp->f('sm_acc_name')."\"><b>@".$rsComp->f('sm_acc_name')."</b></label><br/><a href=\"Javascript:showProfileAnalysts('assocanalysts".$rsComp->f('sm_acc_id')."','".$rsComp->f('sm_acc_id')."','".gv('sessid')."');\">Associated Analysts</a></td><td><input type=\"hidden\" value=\"".$rsComp->f('sm_acc_name')."\" id=\"".$rsComp->f('sm_acc_id')."\"></td><td width=40><img width='35' src='./img/astro_small.png' alt='Supportworks'></td><td width=20><img src='./img/icons/arrow_refresh.png'></td><td width=40><img src='./img/twitter.png' alt='Twitter Account'><td width=400 align='right'><a href=\"Javascript:deleteProfile('".$rsComp->f('sm_acc_id')."', '".$rsComp->f('sm_acc_name')."');\"><img src='./img/icons/forgetme.gif' alt='Delete Profile'></a></td></tr>";
				$strOutput .= "<tr><td></td><td></td><td colspan=4>@".$rsComp->f('sm_acc_name')." is connected to Supportworks using oAuth.</td></tr>";
				$strOutput .= "<tr><td></td><td></td><td colspan=6><div id='assocanalysts".$rsComp->f('sm_acc_id')."' style='display:none;'>Associated Analysts</div></td></tr>";
				$strOutput .= "<tr><td colspan=6><hr/></td></tr>";
				
				$strOutput .= "<tr><td colspan=6>";
				$strOutput .= "<input type='hidden' value='blank' id='holder />";
				$strOutput .= "<center><p id='strupdmsg".$rsComp->f('sm_acc_id')."'></p></center>";
				$strOutput .= "</td></tr>";

				$intProfileCount++;
				$rsComp->movenext();
			}
			$strOutput .= "</table>";

			if($intProfileCount==0)
			{
				echo "<h1>Supportworks Social Media Integration with Twitter</h1><div style='float:left;'><p>Supportworks Integration with Twitter enables you to see what people are saying about your organisation and to provide support for your customers via Twitter.  Simply associate a Twitter account to Supportworks and you are ready to start monitoring Twitter.</p></div><div style='float:right;'><img src='./img/twitterbird.png' alt='Twitter Bird'></div><p><b>You do not currently have any social media profiles associated with Supportworks.</b></p><p>Click <b>Sign in with Twitter</b> to create a new Twitter account for your company and associate it with Supportworks, or to associate your existing company Twitter account with Supportworks.</p><p><b>New to Twitter?</b>  <a href='http://business.twitter.com/basics' target='_blank'>Click here</a> to read about how Twitter can be used in your  organisation.</p>";
			}
			else
			{
				echo "<h1>Your Social Profiles</h1><p><b>Below is the list of social media profiles associated with Supportworks.</b></p>".$strOutput;
			}

			

?>
