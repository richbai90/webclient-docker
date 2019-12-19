<?php 
$period = 1800;	// 30 Minutes

$nf = $HTTP_GET_VARS['nf'] ? $HTTP_GET_VARS['nf'] : 1;
if ((!file_exists("story1.xml")) || (filemtime("story1.xml") < time()-$period)){
	$dat = file_get_contents("http://tickers.bbc.co.uk/tickerdata/story2.dat");
	if (!$dat){
		print 'Could not retrieve DAT file';
		readfile("story".$nf.".xml");
		exit;
		}
	$dat_array = explode("\n",$dat);

	$story = 1;
	$item = 0;
	for($x = 0 ; $x < sizeof($dat_array) ; $x++){
		if (substr($dat_array[$x],0,9) == 'HEADLINE ') $parseflag = true;
		if (!$parseflag) continue;
		if (substr($dat_array[$x],10,10) == 'ast update'){
			$item--;
			continue;
			}
		if (strpos($dat_array[$x],"TORY ".($story+1))){
			$story++;
			$item = 0;
			}
		else if (substr($dat_array[$x],0,9) == 'HEADLINE ') $headlines[$story][$item] = str_replace("HEADLINE ","",$dat_array[$x]);
			else if (substr($dat_array[$x],0,4) == 'URL '){
				$urls[$story][$item] = str_replace("URL ","",$dat_array[$x]);
				$item++;
				}
		}

	for ($y = 1 ; $y < sizeof($headlines)+1 ; $y++){
		$xml_out[$y-1] = '<ticker name="'.$headlines[$y][0].'" expires="'.(time()+$period).'">'."\n";
		for ($x = 1 ; $x < sizeof($headlines[$y]) ; $x++){
			$xml_out[$y-1] .= "\t".'<item text="'.$headlines[$y][$x].'" url="'.$urls[$y][$x].'" SepColor="#FF0000" SepStyle="2"/>'."\n";
			}
		$xml_out[$y-1] .= '</ticker>'."\n";
		}

	$story = 1;
	foreach($xml_out as $xml){
		$file = fopen ("story".$story.".xml", "w");
		fwrite ($file, $xml);
		fclose ($file);
		$story++;
		}
	}
readfile("story".$nf.".xml");
?>

