<?php
	$intFKService = $_POST['fks'];
	$where = $intFKService." = fk_service ";
	
	$boolSubscription = $_POST['bls'];
	if($boolSubscription)
		$where .= " and apply_type='Per Subscription' ";
	else
		$where .= " and apply_type='Per Request' ";

	$where =" where ".$where." and cost_type = 'component' and (flg_isoptional=0)";
	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from sc_rels " . $where . swfc_orderby();
?>