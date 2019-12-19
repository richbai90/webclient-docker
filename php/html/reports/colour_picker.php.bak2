<?php
function base($num="",$base=16,$tobase=10){
	if (!$num) return '00';
	else {
		$temp = trim(strtoupper($num));
		$minus = ($temp == ($num = str_replace("-","",$temp))) ? "" : "-";
		}

	$chars = explode(",","0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z");
	$MAXBASE = sizeof($chars);

	if (($base > $MAXBASE) || ($base < 2) || ($tobase > $MAXBASE) || ($tobase < 2)) return 0;

	$numlen = strlen($num);
	$total = 0;
	$pwr = 1;
	for ($x=$numlen-1 ; $x>-1 ; $x--){
		$y=0;
		if ($x<$numlen-1) $pwr=$pwr*$base;
		while ($chars[$y]!=substr($num,$x,1)){
			if ($y == $base-1) return 0;
			$y++;
			}
		$total+=($y*$pwr);
		}

	if ($tobase==10) return $minus.$total;

	$cnt = 0;
	$pwrs[0] = 1;
	while($pwrs[$cnt]*$tobase <= $total) {
		$cnt++;
		$pwrs[$cnt]=$pwrs[$cnt-1]*$tobase;
		}
	$total2 = '';
	while($cnt>0){
		for($x = 0;$x+1<=$total/$pwrs[$cnt];$x++);
		$total2.=$chars[$x];
		$total-=$pwrs[$cnt]*$x;
		$cnt--;
		}
	$ret = $minus.$total2.$chars[$total];
	if (strlen($ret) < 2) $ret = '0'.$ret;
	return $ret;
	}

$default = $_REQUEST['curcol'] ? $_REQUEST['curcol'] : 'FFFFFF';

$r = 0;
$g = 0;
$b = 0;
$step = 64;

$html = '<table border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#cccccc" colspan="5"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td><td colspan="3"><img src="images/blank.gif" width="2" height="2"></td><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td></tr><tr><td bgcolor="#cccccc"><img src="images/blank.gif" width="1" height="1"></td><td><img src="images/blank.gif" width="2" height="1"></td><td>';
$html .= '<table border="0" cellspacing="0" cellpadding="0"><tr><td><table border="0" cellspacing="0" cellpadding="0">';
while ($r < 256) {
	while ($g < 256) {
		$html .= '<tr>';
		while ($b < 256) {
			$col_hex = (base($r,10,16).base($g,10,16).base($b,10,16));
			$html .= '<td bgcolor="#'.$col_hex.'"><a href="javascript:custom(\''.$col_hex.'\',\''.$r.'\',\''.$g.'\',\''.$b.'\');" onmouseover="javascript:bigify(\''.$col_hex.'\',\''.$r.'\',\''.$g.'\',\''.$b.'\');"><img src="images/blank.gif" width="10" height="20" border="0"></a></td>';
			if ($b) $b += $step;
			else $b += $step-1;
			}
		$html .= '</tr>';
		$b = 0;
		if ($g) $g += $step;
		else $g += $step-1;
		}
	$g = 0;
	if ($r) $r += $step;
	else $r += $step-1;
	if ($r < 256) $html .= '</table></td><td><table border="0" cellspacing="0" cellpadding="0">';
	}
$html .= '</table></td></tr></table>';
$html .= '</td><td><img src="images/blank.gif" width="2" height="1"></td><td bgcolor="#cccccc"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td><td colspan="3"><img src="images/blank.gif" width="2" height="2"></td><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td></tr><tr><td bgcolor="#cccccc" colspan="5"><img src="images/blank.gif" width="1" height="1"></td></tr></table>';

$grey_html = '<table border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#cccccc" colspan="21"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td><td colspan="19"><img src="images/blank.gif" width="2" height="2"></td><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td></tr><tr><td bgcolor="#cccccc"><img src="images/blank.gif" width="1" height="1"></td><td><img src="images/blank.gif" width="2" height="1"></td>';
for ($x = 0 ; $x < 256 ; $x+=16){
	if ($x == 16) $x--;
	$col_hex = base($x,10,16);

	if ($x < 176) $width = 15;
	else $width = 14;

	$grey_html .= '<td bgcolor="#'.$col_hex.$col_hex.$col_hex.'"><a href="javascript:custom(\''.$col_hex.$col_hex.$col_hex.'\',\''.$x.'\',\''.$x.'\',\''.$x.'\');" onmouseover="javascript:bigify(\''.$col_hex.$col_hex.$col_hex.'\',\''.$x.'\',\''.$x.'\',\''.$x.'\');"><img src="images/blank.gif" width="'.$width.'" height="20" border="0"></a></td>';
	}
$grey_html .= '<td><img src="images/blank.gif" width="2" height="1"></td><td bgcolor="#cccccc"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td><td colspan="19"><img src="images/blank.gif" width="2" height="2"></td><td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td></tr><tr><td bgcolor="#cccccc" colspan="21"><img src="images/blank.gif" width="1" height="1"></td></tr></table>';
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
<title>Colour Selector</title>
<script language="javascript">
<!--
var selected_colour = '<?php echo $default?>';
function sendback(){
	<?php
	if ($_REQUEST["tobox"]==1) print 'opener.document.update.elementcolor.value = selected_colour;';
	else if ($_REQUEST["tobox"]==2) print 'opener.document.update.bkcolor.value = selected_colour;';
	else if ($_REQUEST["tobox"]==3) print 'opener.document.update.linecolor.value = selected_colour;';
	else if ($_REQUEST["tobox"]==4) print 'opener.document.update.textcolor.value = selected_colour;';
	else if ($_REQUEST["tobox"]==5) print 'opener.document.update.edgecolor.value = selected_colour;';
	else if ($_REQUEST["tobox"]==6) print 'opener.document.update.hlinecolor.value = selected_colour;';
	else if ($_REQUEST["tobox"]==7) print 'opener.document.update.vlinecolor.value = selected_colour;';
	?>

	window.close();
	}
function bigify(col,r,g,b){
	document.getElementById('bigifier').style.backgroundColor = "#" + col;
	document.getElementById('capt').innerHTML = "#" + col;
	}
function custom(col,r,g,b){
	if (!col){
		var r = dec2hex(document.colours.red.value);
		var g = dec2hex(document.colours.grn.value);
		var b = dec2hex(document.colours.blu.value);
		col = r+g+b;
		}
	else {
		bigify(col);
		if (r) document.colours.red.value = r;
		if (g) document.colours.grn.value = g;
		if (b) document.colours.blu.value = b;
		}

	selected_colour = col;
	document.getElementById('current').style.backgroundColor = "#" + col;
	document.getElementById('setcapt').innerHTML = "#" + col;
	}
function dec2hex(total){
	// Hacked about converter
	if (!total) return '00';
	total = parseInt(total);
	var chars = new Array ('0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F');
	var x;
	var cnt = 0;
	var pwrs = new Array(1,16,256);

	var tobase = 16;

	while(pwrs[cnt]*tobase <= total) {
		cnt++;
		pwrs[cnt]=pwrs[cnt-1]*tobase;
		}
	var total2 = '';
	while(cnt>0){
		for(x = 0;x+1<=total/pwrs[cnt];x++);

		total2+=chars[x];
		total-=pwrs[cnt]*x;
		cnt--;
		}
	var ret;
	ret = total2 + chars[total];
	if (ret.length < 2) ret = '0' + ret;

	return ret;
	}
//-->
</script>
<style type="text/css">
<!--
a:hover {color:#FF0000;}
td {font-family: Verdana, Arial; font-size: 11px; color:#000000;}
.caption {font-family: Verdana, Arial; font-size: 9px; color:#666666;}
.select {font-family: Verdana, Arial; font-size: 11px;}
//-->
</style>
</head>
<body bgcolor="White" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">

<table border="0" cellspacing="0" cellpadding="0" align="center">
<tr><td colspan="3"><img src="images/blank.gif" width="1" height="8"></td></tr>
<tr>
	<td>
		<?php echo $html?>
	</td>
	<td rowspan="3"><img src="images/blank.gif" width="2" height="1"></td>
	<td rowspan="3" valign="top">
		<table border="0" cellspacing="0" cellpadding="0">
		<tr><td bgcolor="#cccccc" colspan="5"><img src="images/blank.gif" width="1" height="1"></td></tr>
		<tr>
			<td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td>
			<td colspan="3"><img src="images/blank.gif" width="2" height="2"></td>
			<td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td>
		</tr>
		<tr>
			<td bgcolor="#cccccc"><img src="images/blank.gif" width="1" height="128"></td>
			<td><img src="images/blank.gif" width="2" height="1"></td>
			<td valign="top">
				<table border="0" cellspacing="0" cellpadding="0">
				<form action="" method="post" name="colours">
				<tr>
					<td colspan="6">
						<table width="100%" border="0" cellspacing="0" cellpadding="0">
						<tr>
							<td id="bigifier" width="50%" bgcolor="#<?php echo $default?>"><img src="images/blank.gif" width="66" height="50" border="0"></td>
							<td id="current" width="50%" bgcolor="#<?php echo $default?>"><img src="images/blank.gif" width="66" height="50" border="0"></td>
						</tr>
						<tr>
							<td align="center" class="caption"><div id="capt">#<?php echo $default?></div></td>
							<td align="center" class="caption"><div id="setcapt">#<?php echo $default?></div></td>
						</tr>
						</table>
					</td>
				</tr>
				<tr><td colspan="6"><img src="images/blank.gif" width="1" height="2" border="0"></td></tr>
				<tr><td colspan="6" bgcolor="#cccccc"><img src="images/blank.gif" width="1" height="1" border="0"></td></tr>
				<tr><td colspan="6"><img src="images/blank.gif" width="1" height="6" border="0"></td></tr>
				<tr>
					<td><b>R</b></td>
					<td><input type="text" size="2" maxlength="3" name="red" onchange="javascript:custom();" class="select"></td>
					<td><b>G</b></td>
					<td><input type="text" size="2" maxlength="3" name="grn" onchange="javascript:custom();" class="select"></td>
					<td><b>B</b></td>
					<td><input type="text" size="2" maxlength="3" name="blu" onchange="javascript:custom();" class="select"></td>
				</tr>
				<tr>
					<td><img src="images/blank.gif" width="12" height="2" border="0"></td>
					<td><img src="images/blank.gif" width="32" height="1" border="0"></td>
					<td><img src="images/blank.gif" width="12" height="1" border="0"></td>
					<td><img src="images/blank.gif" width="32" height="1" border="0"></td>
					<td><img src="images/blank.gif" width="12" height="1" border="0"></td>
					<td><img src="images/blank.gif" width="32" height="1" border="0"></td>
				</tr>
				<tr><td colspan="6" align="center" valign="middle"><!--<a href="javascript:custom();">Update</a><br />--><img src="images/blank.gif" width="1" height="10" border="0"><br /><a href="javascript:sendback();">Save Colour</a></td></tr>
				</table>
			</td>
			<td><img src="images/blank.gif" width="2" height="1"></td>
			<td bgcolor="#cccccc"><img src="images/blank.gif" width="1" height="1"></td>
		</tr>
		<tr>
			<td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td>
			<td colspan="3"><img src="images/blank.gif" width="2" height="2"></td>
			<td bgcolor="#cccccc"><img srfc="images/blank.gif" height="1" width="1"></td>
		</tr>
		<tr><td bgcolor="#cccccc" colspan="5"><img src="images/blank.gif" width="1" height="1"></td></tr>
		</table>
	</td>
</tr>
<tr><td><img src="images/blank.gif" width="1" height="2" border="0"></td></tr>
<tr>
	<td>
		<?php echo $grey_html?>
	</td>
</tr>
</table>

</body>
</html>



