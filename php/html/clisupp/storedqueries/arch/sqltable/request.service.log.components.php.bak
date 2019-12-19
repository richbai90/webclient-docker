<?php
	$intFKService = $_POST['fks'];
	if(isset($_POST['rids']))
	{
		$intFKRles = $_POST['rids'];
		$where = "where pk_auto_id in (".$intFKRles.")";
	}
	else
	{
		$where = $intFKService." = fk_service ";
		
		$boolSubscription = $_POST['bls'];
		if($boolSubscription)
			$where .= " and apply_type='Per Subscription' ";
		else
			$where .= " and apply_type='Per Request' ";

		$where =" where ".$where." and cost_type = 'component' and (flg_isoptional=1 or flg_isoptional IS NULL or flg_isoptional='')";
	}
	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from sc_rels " . $where . swfc_orderby();
?>