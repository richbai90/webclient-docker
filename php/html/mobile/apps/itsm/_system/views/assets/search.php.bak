<?php
	foreach($_POST as $key => $val)
	{
		if(strpos($key,"cmdb_")===0)
		{
			$strOtherInputs .= 	"<input type='hidden' name='"._html_encode($key)."' id='"._html_encode($key)."' value='"._html_encode(stripslashes($val))."'>";
		}
	}

	$cmdb_id = $_POST['cmdb_holder'];
	$searchmode = $_POST['cmdbsearchmode'];
	$searchcriteria = $_POST['cmdbsearchcriteria'];

	//var_dump($_POST);

	include(_get_file_loc("[:_swm_client_path]/_helpers/cmdb.search.php"));
	$boolSearch = true;
	if(isset($cmdb_id))
		if($cmdb_id!="")
			$boolSearch = false;

	if(!$boolSearch)
	{
		$_POST['_cmdb_id'] = $cmdb_id;
		ob_start();
		include(_get_file_loc("[:_swm_app_path]/generic/me.cmdb.detail.php"));
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
					replace_content($xfLayer,"var oHolder=document.getElementById('cmdb_holder');oHolder.value='';_process_navigation('[:_swm_app_path]/views/assets/search.xml');");
				}
			}
		}
	
	
	
	}
	else
	{
		_cmdb_search($$cmdb_id,true,$searchmode,$searchcriteria,$strOtherInputs,"cmdb_holder");
	}

?>