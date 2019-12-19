<?php
	# This is an include and NOT a function. It forms part of the main source and has been separated into an include simply
	# because the same exact code is used by many templates and it is more efficient to maintain it in just one place.
	$xml = '<Config><Graphs><Graph name="'.$which.'">';
	$xml .= '<SizeX value="'.$sizex.'"/>';
	$xml .= '<SizeY value="'.$sizey.'"/>';
	$xml .= '<PlotX value="'.$plotx.'"/>';
	$xml .= '<PlotY value="'.$ploty.'"/>';
	if (strlen($margx) > 0) $xml .= '<MarginLeft value="'.$margx.'"/>';
	if (strlen($margy) > 0) $xml .= '<MarginTop value="'.$margy.'"/>';
	if (strlen($chartx) > 0) $xml .= '<ChartOffsetX value="'.$chartx.'"/>';
	if (strlen($charty) > 0) $xml .= '<ChartOffsetY value="'.$charty.'"/>';
	if (strlen($radius) > 0) $xml .= '<PieScalingFactor value="'.$radius.'"/>';
	if (strlen($title) > 0) $xml .= '<Title value="'.$title.'"/>';
	if (strlen($xtitle) > 0) $xml .= '<XTitle value="'.$xtitle.'"/>';
	if (strlen($ytitle) > 0) $xml .= '<YTitle value="'.$ytitle.'"/>';
	if (strlen($labelangle) > 0) $xml .= '<LabelAngle value="'.$labelangle.'"/>';
	if (strlen($linecolor) > 0) $xml .= '<LineColor value="#'.$linecolor.'"/>';
	if (strlen($textcolor) > 0) $xml .= '<TextColor value="#'.$textcolor.'"/>';
	if (strlen($vlinevisible) > 0) $xml .= '<VLineVisible value="'.$vlinevisible.'"/>';
	if (strlen($hlinevisible) > 0) $xml .= '<HLineVisible value="'.$hlinevisible.'"/>';
	if (strlen($vlinecolor) > 0) $xml .= '<VLineColor value="#'.$vlinecolor.'"/>';
	if (strlen($hlinecolor) > 0) $xml .= '<HLineColor value="#'.$hlinecolor.'"/>';
	if (strlen($edgevisible) > 0) $xml .= '<EdgeVisible value="'.$edgevisible.'"/>';
	if (strlen($edgecolor) > 0) $xml .= '<EdgeColor value="#'.$edgecolor.'"/>';
	if (strlen($swap) > 0) $xml .= '<SwapXY value="'.$swap.'"/>';
	if (strlen($depth) > 0) $xml .= '<Depth value="'.$depth.'"/>';
	if (strlen($perspective) > 0) $xml .= '<Perspective value="'.$perspective.'"/>';
	if (strlen($translucency) > 0) $xml .= '<Transparency value="'.$translucency.'"/>';
	if (strlen($border) > 0) $xml .= '<Border value="'.$border.'"/>';
	if (strlen($leg) > 0) $xml .= '<Legend value="'.$leg.'"/>';
	if (strlen($legx) > 0) $xml .= '<LegendX value="'.$legx.'"/>';
	if (strlen($legy) > 0) $xml .= '<LegendY value="'.$legy.'"/>';	
	if (strlen($disca) > 0) $xml .= '<DiscAbove value="'.$disca.'"/>';
	if (strlen($discb) > 0) $xml .= '<DiscBelow value="'.$discb.'"/>';
	if (strlen($trans) > 0) $xml .= '<Transpose value="'.$trans.'"/>';
	$xml .= '<ChartType value="'.$type.'"/>';
	if (strlen($max) > 0) $xml .= '<MaxRecords value="'.$max.'"/>';
	if (strlen($bkmode) > 0) $xml .= '<BackgroundType value="'.$bkmode.'"/>';
	if (strlen($bkcolor) > 0) $xml .= '<BackgroundColor value="#'.$bkcolor.'"/>';
	if (strlen($bkgrad) > 0) $xml .= '<BackgroundGradient value="'.$bkgrad.'"/>';
	if (strlen($filltype) > 0) $xml .= '<FillType value="'.$filltype.'"/>';
	if (strlen($elementcolor) > 0) $xml .= '<ElementColor value="#'.$elementcolor.'"/>';
	if (strlen($multidepth) > 0) $xml .= '<MultiDepth value="'.$multidepth.'"/>';
	$xml .= '<SortMethod value="'.$sort.'"/>';
	if (strlen($explode) > 0) $xml .= '<ExplodePie value="'.$explode.'"/>';
	if (strlen($sector) > 0) $xml .= '<ExplodeSector value="'.$sector.'"/>';
	if (strlen($distance) > 0) $xml .= '<ExplodeDistance value="'.$distance.'"/>';
	if (strlen($start) > 0) $xml .= '<StartAngle value="'.$start.'"/>';
	$xml .= '</Graph></Graphs></Config>';
	if ($which == "TOP") $query = "UPDATE ".$conf_table." SET charttop='".$xml."' WHERE reportid=".$reportid;
	else $query = "UPDATE ".$conf_table." SET chartbot='".$xml."' WHERE reportid=".$reportid;
	
	if (!$conf_conn->Query($query))
	{	
		throw_reporterror(7);	
		exit;

	}
?>
