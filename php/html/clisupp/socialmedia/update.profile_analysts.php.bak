<?php
	include_once('itsm_default/xmlmc/common.php');

	$swSystemDB = new CSwDbConnection;
	if(!$swSystemDB->Connect("sw_systemdb", swcuid(), swcpwd()))
	{
		echo "Failed to create connection to (Supportworks Cache)";
		exit;
	}

	$swDATA = new CSwDbConnection;
	if(!$swDATA->Connect(swdsn(), swuid(), swpwd()))
	{
		echo "Failed to create connection to (".swdsn().")";
		exit;
	}

		
	$strSelectedGroup = gv("groupid");
	$strSelectedAnalysts = "";

	foreach($_POST as $key => $value)
	{
		//$test .= $key." = ".$value."<br>";
		if(substr($key,0,3)!="kb_")
		continue;

		$keyprefix=substr($key,0,3);
		$key_profile=substr($key,3,strpos(substr($key,3,strlen($key)),"_"));
		$key_analyst_id=substr($key, strpos(substr($key,3,strlen($key)),"_")+4, strlen($key));

		if($strSelectedAnalysts!="")
			$strSelectedAnalysts .= ",";
		$strSelectedAnalysts .= "'".pfs($key_analyst_id)."'";
	}

	$strSelect = "select distinct(swanalysts.analystid) from swanalysts join swanalysts_groups on swanalysts.analystid=swanalysts_groups.analystid where class=1";
	if($strSelectedGroup!="")
		$strSelect .= " and swanalysts_groups.groupid='".pfs($strSelectedGroup)."'";
	$strSelect .= " order by swanalysts.analystid asc";
	$test = $strSelect;
	$rsComp = $swSystemDB->Query($strSelect,true);
	if(($rsComp!=false)&&(!$rsComp->eof))
	{
		while(!$rsComp->eof)
		{
				//$test .= $rsComp->f("analystid")."<br>";
				
				$keylookup = "kb_".strtolower($_REQUEST["profileid"])."_".strtolower($rsComp->f("analystid"));
				$test .= "<BR>".$keylookup;
	
				$test.="isset(".$keylookup.") ? : ".isset($_POST[$keylookup]);

				if(isset($_POST[$keylookup]))
				{
					//--Lookup setting in socmed_analysts and insert if needed
					$count=-1;
					$strSQL = "select count(*) as analystcount from socmed_analysts where fk_acc_id = '". PrepareForSQL(strtolower(gv("profileid"))). "' and fk_analyst_id = '". PrepareForSQL(strtolower($rsComp->f("analystid"))) ."'";
					$rsCount = $swDATA->Query($strSQL,true);
					if(($rsCount!=false)&&(!$rsCount->eof))
					{
						$count = $rsCount->f("analystcount");
					}

					if($count==0)
					{
						$strInsert = "insert into socmed_analysts (fk_acc_id,fk_analyst_id,fk_analyst_name) values ('". PrepareForSQL($key_profile). "','". PrepareForSQL($rsComp->f("analystid")). "','".PrepareForSQL($_POST[$keylookup])."')";
						$test.= $strInsert."<BR>";
						$swDATA->Query($strInsert);
					}
					
				}
				else
				{
					$strDelete = "delete from socmed_analysts where fk_acc_id = '". PrepareForSQL(strtolower(gv("profileid"))). "' and fk_analyst_id = '". PrepareForSQL(strtolower($rsComp->f("analystid"))) ."'";
					$test.= $strDelete."<BR>";
					$swDATA->Query($strDelete);
				}

				$rsComp->movenext();
		}
	}

		
		
	
	
	//$_SESSION["profileid"]="";

	$evalphp=gv('evalphp');
	if($evalphp!="")
	{
		eval($evalphp.";");
	}
	
	function profiles_updok()
	{
		//global $test;
		echo "<font style='color:green'>".$test."Your subscriptions were successfully updated.</font>";
	}
?>
