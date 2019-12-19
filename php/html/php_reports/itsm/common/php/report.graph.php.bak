<?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	include_once('phpchartdir.php');
	include('itsm_default/xmlmc/xmlmc.php');
	include('itsm_default/xmlmc/classactivepagesession.php');
	$session = new classActivePageSession($_SESSION['sessid']);

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
	<?php
		exit;
	}
	
	$keys = $_SESSION['graph_ckeys'];
	$vals = $_SESSION['graph_cvals'];
	$opts = $_SESSION['graph_copts'];
	$xmlconf = $_SESSION['graph_xmlconf'];

	$p = xml_parser_create();
	xml_parse_into_struct($p, $xmlconf, $attribs, $index);
	xml_parser_free($p);

	$chart = 0;

			$sizex = $attribs[$index[SIZEX][$chart]][attributes][VALUE];
			$sizey = $attribs[$index[SIZEY][$chart]][attributes][VALUE];
			$plotx = $attribs[$index[PLOTX][$chart]][attributes][VALUE];
			$ploty = $attribs[$index[PLOTY][$chart]][attributes][VALUE];
			$margx = $attribs[$index[MARGINLEFT][$chart]][attributes][VALUE];
			$margy = $attribs[$index[MARGINTOP][$chart]][attributes][VALUE];
			$chartx = $attribs[$index[CHARTOFFSETX][$chart]][attributes][VALUE];
			$charty = $attribs[$index[CHARTOFFSETY][$chart]][attributes][VALUE];
			$radius = $attribs[$index[PIESCALINGFACTOR][$chart]][attributes][VALUE];
			$title = $attribs[$index[TITLE][$chart]][attributes][VALUE];
			$xtitle = $attribs[$index[XTITLE][$chart]][attributes][VALUE];
			$ytitle = $attribs[$index[YTITLE][$chart]][attributes][VALUE];
			$labelangle = $attribs[$index[LABELANGLE][$chart]][attributes][VALUE];
			$linecolor = str_replace("#","",$attribs[$index[LINECOLOR][$chart]][attributes][VALUE]);
			$textcolor = str_replace("#","",$attribs[$index[TEXTCOLOR][$chart]][attributes][VALUE]);
			$vlinevisible = $attribs[$index[VLINEVISIBLE][$chart]][attributes][VALUE];
			$hlinevisible = $attribs[$index[HLINEVISIBLE][$chart]][attributes][VALUE];
			$vlinecolor = str_replace("#","",$attribs[$index[VLINECOLOR][$chart]][attributes][VALUE]);
			$hlinecolor = str_replace("#","",$attribs[$index[HLINECOLOR][$chart]][attributes][VALUE]);
			$edgevisible = $attribs[$index[EDGEVISIBLE][$chart]][attributes][VALUE];
			$edgecolor = str_replace("#","",$attribs[$index[EDGECOLOR][$chart]][attributes][VALUE]);
			$swap = $attribs[$index[SWAPXY][$chart]][attributes][VALUE];
			$depth = $attribs[$index[DEPTH][$chart]][attributes][VALUE];
			$perspective = $attribs[$index[PERSPECTIVE][$chart]][attributes][VALUE];
			$translucency = $attribs[$index[TRANSPARENCY][$chart]][attributes][VALUE];
			$border = $attribs[$index[BORDER][$chart]][attributes][VALUE];
			$leg = $attribs[$index[LEGEND][$chart]][attributes][VALUE];
			$legx = $attribs[$index[LEGENDX][$chart]][attributes][VALUE];
			$legy = $attribs[$index[LEGENDY][$chart]][attributes][VALUE];
			$disca = $attribs[$index[DISCABOVE][$chart]][attributes][VALUE];
			$discb = $attribs[$index[DISCBELOW][$chart]][attributes][VALUE];
			$trans = $attribs[$index[TRANSPOSE][$chart]][attributes][VALUE];
			$type = $attribs[$index[CHARTTYPE][$chart]][attributes][VALUE];
			$max = $attribs[$index[MAXRECORDS][$chart]][attributes][VALUE];
			$bkmode = $attribs[$index[BACKGROUNDTYPE][$chart]][attributes][VALUE];
			$bkcolor = str_replace("#","",$attribs[$index[BACKGROUNDCOLOR][$chart]][attributes][VALUE]);
			$bkgrad = $attribs[$index[BACKGROUNDGRADIENT][$chart]][attributes][VALUE];
			$filltype = $attribs[$index[FILLTYPE][$chart]][attributes][VALUE];
			$elementcolor = str_replace("#","",$attribs[$index[ELEMENTCOLOR][$chart]][attributes][VALUE]);
			$multidepth = $attribs[$index[MULTIDEPTH][$chart]][attributes][VALUE];
			$sort = $attribs[$index[SORTMETHOD][$chart]][attributes][VALUE];
			$explode = $attribs[$index[EXPLODEPIE][$chart]][attributes][VALUE];
			$sector = $attribs[$index[EXPLODESECTOR][$chart]][attributes][VALUE];
			$distance = $attribs[$index[EXPLODEDISTANCE][$chart]][attributes][VALUE];
			$start = $attribs[$index[STARTANGLE][$chart]][attributes][VALUE];

			$showzero = $attribs[$index[SHOWZERODATA][$chart]][attributes][VALUE];

	// Convert the stored radius percentage to an actual pixel radius for the chart.
	$radius = ($sizex > $sizey) ? (INT)((($sizey/100)*$radius)/2) : (INT)((($sizex/100)*$radius)/2);

	$keys = str_replace(':A:',"'",$keys);
	$keys = str_replace("\'","'",$keys);
	$opts = str_replace(':A:',"'",$opts);
	$opts = str_replace("\'","'",$opts);

	$colours = array(0xFF3333,0x33FF33,0x6666FF,0xFFFF00,0xFF66FF,0x99FFFF,0xFFCC33,0xCCCCCC,0xCC9999,0x339966,0x999900,0xCC3300,0x669999,0x663333,0x006600,0x990099);

	# Split the label=value pairs into arrays
	if ($opts){
		if (!$type) $type = "Multi Bar";
		$options = explode(",,,",$keys);
		$labels = explode(",,,",$opts);
		$data = explode("___",$vals);
		$bars = sizeof($data);
		for ($x = 0 ; $x < $bars ; $x++){
			$mdata[$x] = explode(",,,",$data[$x]);
			}
		if ($trans){
			for ($x = 0 ; $x < sizeof($mdata[0]) ; $x++){
				for ($y = 0 ; $y < sizeof($mdata) ; $y++){
					$transdata[$x][$y] = $mdata[$y][$x];
					}
				}
			$transf = $options;
			$options = $labels;
			$labels = $transf;
			$mdata = $transdata;
			$bars = sizeof($mdata);
			}

	// Copy the labels into the $templabs hash with a value representing the index value of each.
	for ($x = 0 ; $x < sizeof($labels) ; $x++){
		$templabs[$labels[$x]] = $x;
		}

	// Sort the temporary hash, by key. This will knock all the index value out of sequence, which is what we want.
		switch ($sort){
			case "Reverse":
				$elements = sizeof($templabs)-1;
				foreach($templabs as $key => $val){
					$lab[$elements] = $key;
					$dat[$elements] = $val;
					$elements--;
					}
				$templabs = array();
				for($x = 0 ; $x < sizeof($lab) ; $x++){
					$templabs[$lab[$x]] = $dat[$x];
					}
				break;
			case "AlphabeticAsc":
				$templabs = alphasort($templabs);
				break;
			case "AlphabeticDesc":
				$templabs = alphasort($templabs);
				$elements = sizeof($templabs)-1;
				foreach($templabs as $key => $val){
					$lab[$elements] = $key;
					$dat[$elements] = $val;
					$elements--;
					}
				$templabs = array();
				for($x = 0 ; $x < sizeof($lab) ; $x++){
					$templabs[$lab[$x]] = $dat[$x];
					}
				break;
			default:
				break;
			}


	// Now we need to sort the data. This is done by sorting it according to the index values in the $templabs hash. This actually
	// does work. Yeah, I know, I was amazed too, especially since it worked first time. Arrays of arrays of arrays, great fun.
	$x = 0;
	foreach($templabs as $key => $val){
		$labels[$x] = $key;
		$x++;
		}
	for ($x = 0 ; $x < sizeof($mdata) ; $x++){
		$temp = array();
		for ($y = 0 ; $y < sizeof($mdata[$x]) ; $y++){
			$temp[$y] = $mdata[$x][$templabs[$labels[$y]]];
			}
		$mdata[$x] = $temp;
		}

		}
	else {
		if (!$type) $type = "Pye";
		$labels = explode(",,,",$keys);
		$data = explode(",,,",$vals);
		$results = sizeof($data);
		$labelnum = sizeof($labels);
		
		for ($x = 0 ; $x < sizeof($labels) ; $x++){
			if (($disca) && ($data[$x] > $disca)) continue;
			if (($discb) && ($data[$x] < $discb)) continue;
			if ((!$data[$x]) && (!$showzero)) continue;
			$hash[$labels[$x]] = $data[$x];
			}

		# Sort $hash (as it is used to generate the graphs) according to the setting specified.
		switch ($sort){
			case "Reverse":
				$elements = sizeof($hash)-1;
				foreach($hash as $key => $val){
					$lab[$elements] = $key;
					$dat[$elements] = $val;
					$elements--;
					}
				$hash = array();
				for($x = 0 ; $x < sizeof($lab) ; $x++){
					$hash[$lab[$x]] = $dat[$x];
					}
				break;
			case "ValueAsc":
				asort($hash);
				break;
			case "ValueDesc":
				arsort($hash);
				break;
			case "AlphabeticAsc":
				$hash = alphasort($hash);
				break;
			case "AlphabeticDesc":
				$hash = alphasort($hash);
				$elements = sizeof($hash)-1;
				foreach($hash as $key => $val){
					$lab[$elements] = $key;
					$dat[$elements] = $val;
					$elements--;
					}
				$hash = array();
				for($x = 0 ; $x < sizeof($lab) ; $x++){
					$hash[$lab[$x]] = $dat[$x];
					}
				break;
			case "Staggered":
				asort($hash);
				$hash = altsort($hash);
				break;
			default:
				break;
			}

		$count = 0;
		$labels = array();
		$data = array();
	#	Handles max values by simply not acknowledgeing them
	#	foreach ($hash as $key => $value){
	#		$labels[$count] = $key;
	#		$data[$count] = $value;
	#		$count++;
	#		if ($count == $max) break;
	#		}
	// Totals all max values up and stores it as "Others"
		if (!$max) $max = sizeof($hash);
		foreach ($hash as $key => $value){
			if ($count < $max-1){
				$labels[$count] = $key;
				$data[$count] = $value;
				$count++;
				}
			else {
				if (!$data[$count]) $data[$count] = 0;
				if ($max < sizeof($hash)) $labels[$count] = "Others";
				else $labels[$count] = $key;
				$data[$count] += $value;
				}
			}
		}


# The altsort function for staggering results high,low,high,low. Useful for certain cluttered pie charts.
function altsort($hash){
	$high = 0; $low = 0;
	foreach($hash as $key => $value){
		$temp_key[$high] = $key;
		$temp_val[$high] = $value;
		$high++;
		}
	$hash = array();
	while ($low < $high){
		$hash[$temp_key[$high-1]] = $temp_val[$high-1];
		$high--;
		if ($low < $high){
			$hash[$temp_key[$low]] = $temp_val[$low];
			$low++;
			}
		}
	return $hash;
	}
# The alphasort function for sorting results alphabetically by label. I'm sure there's an easier way but I can't find it!
function alphasort($hash){
	$x = 0;
	foreach($hash as $key => $value){
		$temp_hash["pf".$x."pf".$value] = $key;
		$x++;
		}
	natcasesort($temp_hash);
	$hash = array();
	foreach($temp_hash as $key => $value){
		$hash[$value] = preg_replace("/pf\d+pf/", "", $key);
		}
	return $hash;
	}
############################################################################################################

# Setup whichever chart type is selected. Each type has it's own routine as many features are chart specific.

if (($bkmode=="Plain Colour") && ($bkcolor)) $bkcolor = ('0x'.$bkcolor)+0;
else $bkcolor = 0xffffff;
$transparentPalette[0] = $bkcolor;

if ($textcolor) $textcolor = ('0x'.$textcolor)+0;
else $textcolor = 0x000000;
#if ($textcolor){
#	$transparentPalette[2] = ('0x'.$textcolor)+0;
#	$defaultPalette[2] = ('0x'.$textcolor)+0;
#	}

if (!$elementcolor) $elementcolor = "FF0000";
if ($translucency){
	$elementcolor = '40'.$elementcolor;
	$tograd = 0x40ffffff;
	}
else $tograd = 0xffffff;

if ($linecolor) $linecolor = ('0x'.$linecolor)+0;
else $linecolor = Transparent;
if ($hlinecolor) $hlinecolor = ('0x'.$hlinecolor)+0;
else $hlinecolor = 0xC0C0C0;
if ($vlinecolor) $vlinecolor = ('0x'.$vlinecolor)+0;
else $vlinecolor = 0xC0C0C0;
if ($edgecolor) $edgecolor = ('0x'.$edgecolor)+0;
else $edgecolor = 0xC0C0C0;

if ($vlinevisible) $vlines = $vlinecolor;
else $vlines = Transparent;
if ($hlinevisible) $hlines = $hlinecolor;
else $hlines = Transparent;
if ($edgevisible) $elines = $edgecolor;
else $elines = Transparent;

switch ($type){
case "Bar":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($swap) $c->swapXY(true);
	if ($filltype=="Plain Colour"){
		$c->addBarLayer($data,'0x'.$elementcolor+0);
		}
	else if ($filltype=="Gradient"){
			if ($swap) $layer = $c->addBarLayer($data, $c->gradientColor($margx,0,$plotx+$margx,0,'0x'.$elementcolor+0,0xffffff));
			else $layer = $c->addBarLayer($data, $c->gradientColor(0,$margy+$ploty,0,$margy,'0x'.$elementcolor+0,0xffffff));
			}
		else {
			$barLayer3Obj = $c->addBarLayer3($data);
			if ($translucency) $c->setColors($transparentPalette);
			}
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	$labelangle = $labelangle ? $labelangle : 0;
	$labelsObj->setFontAngle($labelangle);
	break;
case "3D Bar":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($swap) $c->swapXY(true);
	if ($filltype=="Plain Colour"){
		for ($x = 0 ; $x < sizeof($data) ; $x++) $colors[$x] = '0x'.$elementcolor+0;
		$barLayer3Obj = $c->addBarLayer($data,'0x'.$elementcolor+0);
		}
	else if ($filltype=="Gradient"){
		if ($swap) $barLayer3Obj = $c->addBarLayer($data, $c->gradientColor($margx,0,$plotx+$margx,0,('0x'.$elementcolor)+0,$tograd));
		else $barLayer3Obj = $c->addBarLayer($data, $c->gradientColor(0,$margy+$ploty,0,$margy,('0x'.$elementcolor)+0,$tograd));
		}
		else {
			$barLayer3Obj = $c->addBarLayer3($data);
			if ($translucency) $c->setColors($transparentPalette);
			}
	$barLayer3Obj->set3D($depth);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	$labelangle = $labelangle ? $labelangle : 0;
	$labelsObj->setFontAngle($labelangle);
	break;
case "Line":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	if ($filltype=="Plain Colour"){
		$lineLayerObj = $c->addLineLayer($data,('0x'.$elementcolor)+0);
		}
	else{
		$lineLayerObj = $c->addLineLayer($data);
		if ($translucency) $c->setColors($transparentPalette);
		}
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	if ($swap) $c->swapXY(true);
	$labelangle = $labelangle ? $labelangle : 0;
	$labelsObj->setFontAngle($labelangle);
	break;
case "3D Line":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	if ($filltype=="Plain Colour"){
		$lineLayerObj = $c->addLineLayer($data,('0x'.$elementcolor)+0);
		}
	else{
		$lineLayerObj = $c->addLineLayer($data);
		if ($translucency) $c->setColors($transparentPalette);
		}
	$lineLayerObj->set3D($depth);
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	if ($swap) $c->swapXY(true);
	$labelangle = $labelangle ? $labelangle : 0;
	$labelsObj->setFontAngle($labelangle);
	break;
case "Area":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	// Fill Colour Definition BEGIN
	if ($filltype=="Gradient") $c->addAreaLayer($data, $c->gradientColor(0, $margy+$ploty, 0, $margy, ('0x'.$elementcolor)+0, $tograd));
	else if ($filltype=="Plain Colour") $c->addAreaLayer($data, ('0x'.$elementcolor)+0);
		else {
			$c->addAreaLayer($data);
			if ($translucency) $c->setColors($transparentPalette);
			}
	// Fill Colour Definition END
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	if ($swap) $c->swapXY(true);
	$labelangle = $labelangle ? $labelangle : 0;
	$labelsObj->setFontAngle($labelangle);
	break;
case "3D Area":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	// Fill Colour Definition BEGIN
	if ($filltype=="Gradient") $areaLayerObj = $c->addAreaLayer($data, $c->gradientColor(0, $margy+$ploty, 0, $margy, ('0x'.$elementcolor)+0, $tograd));
	else if ($filltype=="Plain Colour") $areaLayerObj = $c->addAreaLayer($data, ('0x'.$elementcolor)+0);
		else {
			$areaLayerObj = $c->addAreaLayer($data);
			if ($translucency) $c->setColors($transparentPalette);
			}
	// Fill Colour Definition END
	$labelsObj = $c->xAxis->setLabels($labels);
	$areaLayerObj->set3D($depth);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	if ($swap) $c->swapXY(true);
	$labelangle = $labelangle ? $labelangle : 0;
	$labelsObj->setFontAngle($labelangle);
	break;
case "3D Pie":
	$diff = $depth/sizeof($data);
	settype($diff, "integer"); 
	for ($y = 0 ; $y < sizeof($data) ; $y++){
		$depths[$y]=$depth-($y*$diff);
		}
	$c = new PieChart($sizex,$sizey,$bkcolor);
	$cx = (INT)($sizex/2);	// Find the center point for adding the offset
	$cy = (INT)($sizey/2);
	if ($multidepth) $cy += $depth - 20;
	else $cy -= 20;
	$c->setPieSize($cx+$chartx, $cy+$charty, $radius);
	$c->setData($data, $labels);
	if ($leg) $c->setLabelStyle("", 1, 0x8FFFFFF);
	else $c->setLabelStyle("", 8, 0x8000000);

	if ($multidepth) $c->set3D2($depths,$perspective);
	else $c->set3D($depth,$perspective);

	$c->setStartAngle($start);
	$c->setLabelStyle("", 8, $textcolor);
	if ($explode) $c->setExplode($sector, $distance);
	if ($filltype=="Plain Colour"){
		for ($x = 0 ; $x < sizeof($data) ; $x++ ) $colors[$x] = ('0x'.$elementcolor)+0;
		$c->setColors2(DataColor, $colors);
		}
	else {
		if ($translucency) $c->setColors($transparentPalette);
		}
	if ($edgevisible) $c->setLineColor($edgecolor);
	break;
case "Multi Bar":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$plotAreaObj = $c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
#	$plotAreaObj->setBackground(0xffffc0, 0xffffe0);
	$legendObj = $c->addLegend($margx+5, $margy, false, "", 8);
	$legendObj->setBackground(Transparent);
	$c->yAxis->setTopMargin($margy);
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	$labelsObj->setFontAngle($labelangle);
	$layer = $c->addBarLayer2(Side, 0);	// Swap zero for a value makes the chart 3D
	if ($translucency) $c->setColors($transparentPalette);
	for ($x = 0 ; $x < $bars ; $x++){
		$layer->addDataSet($mdata[$x], -1, $options[$x]);
		}
	if ($swap) $c->swapXY(true);
	break;
case "Multi Stack":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	$labelsObj->setFontAngle($labelangle);
	$layer = $c->addBarLayer2(Stack);
	$layer->addDataGroup("2001");
	if ($translucency) $c->setColors($transparentPalette);
	for ($x = 0 ; $x < $bars ; $x++){
		$layer->addDataSet($mdata[$x], -1, $options[$x]);
		}
	$layer->setBarGap(0.2, 0);
#	$layer->setBorderColor(Transparent);
#	$layer->setAggregateLabelStyle("arialbi.ttf", 8);
	$c->yAxis->setAutoScale(0.2);
	if ($swap) $c->swapXY(true);
	break;
case "Multi Area":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	$titleObj = $c->yAxis->setTitle("");
	$titleObj->setFontAngle(0);
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	$labelsObj->setFontAngle($labelangle);
	$layer = $c->addAreaLayer();
	if ($translucency) $c->setColors($transparentPalette);
	for ($x = 0 ; $x < $bars ; $x++){
		$layer->addDataSet($mdata[$x], -1, $options[$x]);
		}
#	$layer->set3D();
	if ($swap) $c->swapXY(true);
	break;
case "Multi Line":
	$c = new XYChart($sizex,$sizey,$bkcolor);
	$c->setPlotArea($margx, $margy, $plotx, $ploty, Transparent, -1, $elines, $hlines, $vlines);
	$legendObj = $c->addLegend($margx+5, $margy, false, "", 8);
	$legendObj->setBackground(Transparent);
	$labelsObj = $c->xAxis->setLabels($labels);
	if ($xtitle) $c->xAxis->setTitle($xtitle);
	if ($ytitle) $c->yAxis->setTitle($ytitle);
	$c->xAxis->setColors($linecolor, $textcolor);
	$c->yAxis->setColors($linecolor, $textcolor);
	$labelsObj->setFontAngle($labelangle);
	$layer = $c->addLineLayer2();
	$layer->setLineWidth(2);
	if ($translucency) $c->setColors($transparentPalette);
	for ($x = 0 ; $x < $bars ; $x++){
		$layer->addDataSet($mdata[$x], -1, $options[$x]);
		}
	if ($swap) $c->swapXY(true);
	break;
default:
	$c = new PieChart($sizex,$sizey,$bkcolor);
	$cx = (INT)($sizex/2);	// Find the center point for adding the offset
	$cy = (INT)($sizey/2);
	$c->setPieSize($cx+$chartx, $cy+$charty, $radius);
	$c->setData($data, $labels);
	if ($leg) $c->setLabelStyle("", 1, 0x8FFFFFF);
	else $c->setLabelStyle("", 8, 0x8000000);
	if ($explode) $c->setExplode($sector, $distance);
	$c->setStartAngle($start);
	$c->setLabelStyle("", 8, $textcolor);
	if ($filltype=="Plain Colour"){
		for ($x = 0 ; $x < sizeof($data) ; $x++ ) $colors[$x] = ('0x'.$elementcolor)+0;
		$c->setColors2(DataColor, $colors);
		}
	else {
		if ($translucency) $c->setColors($transparentPalette);
		}
	if ($edgevisible) $c->setLineColor($edgecolor);
	break;
	}

// Set More Generic Parameters
if ($title) $c->addTitle($title, "", 10);
if ($bkmode=="Transparent") $c->setTransparentColor($bkcolor);

if ($type=="Multi Bar" || $type=="Multi Stack" || $type=="Multi Area" || $type=="Pie" || $type=="3D Pie"){
	if ($leg) {
		$box = $c->addLegend($legx,$legy);
		$box->setBackground(0xffffff,0x000000);
		}
	}

if ($bkmode=="Gradient"){
	if ($bkgrad == 1) $c->setBackground($c->gradientColor($goldGradient), -1, 0);
	else if ($bkgrad == 2) $c->setBackground($c->gradientColor($silverGradient), -1, 0);
	else if ($bkgrad == 3) $c->setBackground($c->gradientColor($redMetalGradient), -1, 0);
	else if ($bkgrad == 4) $c->setBackground($c->gradientColor($greenMetalGradient), -1, 0);
	else if ($bkgrad == 5) $c->setBackground($c->gradientColor($blueMetalGradient), -1, 0);
	else $c->setBackground($c->gradientColor($goldGradient), -1, 0);
	}


header("Content-type: image/gif");
print($c->makeChart2(GIF));

?>