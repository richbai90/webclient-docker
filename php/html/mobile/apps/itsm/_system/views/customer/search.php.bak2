<?php
	foreach($_POST as $key => $val)
	{
		if(strpos($key,"opencall_")===0)
		{
			$arrInfo = explode("_",$key,2);
			$colName = $arrInfo[1];
			$strOtherInputs .= 	"<input type='hidden' name='"._html_encode($key)."' id='"._html_encode($key)."' value='"._html_encode(stripslashes($val))."'>";
		}

	}
	
	$cust_id = $_POST['opencall_cust_id'];
	$searchmode = $_POST['custsearchmode'];
	$searchcriteria = $_POST['custsearchcriteria'];
	if($flgnocust==1)
	{
		$strOtherInputs .= 	"<input type='hidden' name='flgnocust' id='flgnocust' value='1'>";
		$strHTML = "<div class='grptitle'><span class='grptitlecontainer'><span class='grptitle' width='100%'>Selected Customer</span></span></div><table width='100%'><tr><td width='50%'>Customer: </td><td>NO CUSTOMER</td></tr></table>";
		echo $strHTML;
	}
	else
	{
		include(_get_file_loc("[:_swm_client_path]/_helpers/cust.search.php"));
		$boolSearch = true;
		if(isset($_POST['opencall_cust_id']))
			if($_POST['opencall_cust_id']!="")
				$boolSearch = false;

		if(!$boolSearch)
		{
			$_POST['_keysearch'] = $_POST['opencall_cust_id'];
			ob_start();
			include(_get_file_loc("[:_swm_app_path]/generic/me.userdb.detail.php"));
			$strOtherInputs .= ob_get_clean();
			$xmlContentLayers = $root->get_elements_by_tagname("menu");
			foreach($xmlContentLayers as $pos => $xLayer)
			{
				$xmlLayers = $xLayer->get_elements_by_tagname("leftaction");
				foreach($xmlLayers as $pos => $xaLayer)
				{
					$xmlaLayers = $xaLayer->get_elements_by_tagname("title");
					foreach($xmlaLayers as $pos => $xfLayer)
					{
						replace_content($xfLayer,"Search");
					}
					$xmlaLayers = $xaLayer->get_elements_by_tagname("action");
					foreach($xmlaLayers as $pos => $xfLayer)
					{
						replace_content($xfLayer,"var oHolder=document.getElementById('opencall_cust_id');oHolder.value='';_process_navigation('[:_swm_app_path]/views/customer/search.xml');");
					}
				}
			}
		}else
		{
			_customer_search($cust_id,true,$searchmode,$searchcriteria,$strOtherInputs);
		}
	}

?>