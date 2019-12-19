<!--
	Created by Hornbill Systems Limited

	Updates

	code	Bug		date		author					description
	-------------------------------------------------------------------------
	ind01	56700	15/05/2007	Ivan Nicholas Dorosh	Error with filter, displaying when it shouldn't and not displaying when it should

-->
<!--
					<html>
					<head>
					<title>HTML Reports</title>
					</head>
					<body topmargin="0" leftmargin="0" rightmargin="0" bottommargin="0" marginheight="0" marginwidth="0">
					<table width="100%" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td align="right" bgcolor="#dee8fe"><br /><br /><img src="images/html_reports.gif" width="160" height="30" alt="" border="0" hspace="0" vspace="0"></td>
					</tr>
					</table>
					<table width="100%" border="0" cellspacing="0" cellpadding="0">
					  <tr>
					  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
					  </tr>
					  <tr> 
					    <td width="22" bgcolor="#ccd4ee"><img src="images/space.gif" width="22" height="25"></td>
					    <td bgcolor="#ccd4ee" align="left" valign="middle" class="company"><b>Report</b> : <span class="surveyname"><?php echo $report_title?></span></td>
					  </tr>
					  <tr>
					  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
					  </tr>
					</table>
-->
					<br /><br />
					<?php if ($flag_filter) {
					?><table border="0" cellspacing="0" cellpadding="2">
					<?php
					if ($html_columnheads)
					{
						print '<tr>'.$html_columnheads.'</tr>';
					}
					print '<form action="'.$this_template.'?'.$old_query.'" method="post"><tr><td><input type="submit" value="Apply Filter" class="buttonstyle">&nbsp;</td>';
					for ($y = 0 ; $y < $cols ; $y++)
					{
						$name = "filt_".(str_replace(".","!DOT!",$cols_to_extract[$y]['Col']));
						print '<td><input type="text" name="filt_'.(str_replace(".","!DOT!",$cols_to_extract[$y]['Col'])).'" size="15" value="'.$_POST[$name].'" class="selectstyle"></td>';
					}
					
					print '</tr></form>';
					?>
					</table>
					<?php } ?>
					<br /><br />
					<?php echo $error?><br /><br />
<!--
					</body>
					</html>
-->

