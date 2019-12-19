<?php
	print "Table To Query: ".$table_to_query."<br />";
	print "Grouping: ".$groupby_column."<br />";
	print "Graphing: ".$statby_column."<br />";
	if ($x)
	{
		print "<u>".$x." Columns Found</u>:-<br />";
		foreach ($cols_to_extract as $col) print "&nbsp;&nbsp;&nbsp;Columns: ".$col['Col']."<br />";
	}
	else print "NO COLUMNS FOUND<br />";
	print "Title: ".$report_title."<br />";
	print "Report Flags: ".$report_flags."<br />";
	print "Where: ".$where_clause."<br />";
	print "Limit: ".$limit_clause."<br />";
	if ($y)
	{
		print "<u>".$y." Joins Found</u>:-<br />";
		foreach ($joins as $join) print "&nbsp;&nbsp;&nbsp;Type: ".$join['Type']." Table: ".$join['Table']." Condition: ".$join['Cond']."<br />";
	}
	else print "NO JOINS FOUND<br />";
	foreach ($orderby_columns as $order) print "Order By: ".$order."<br />";
	if ($z)
	{
		print "<u>".$z." Args Found</u>:-<br />";
		print '<table border="1" cellspacing="0" cellpadding="0">';
		print '<tr><td>&nbsp;&nbsp;&nbsp;</td><td><b>ID&nbsp;</b></td><td><b>Type&nbsp;</b></td><td><b>Label&nbsp;</b></td><td><b>Desc&nbsp;</b></td><td><b>Config&nbsp;</b></td><td><b>Flags&nbsp;</b></td><td><b>OFormat&nbsp;</b></td><td><b>Table&nbsp;</b></td><td><b>Column&nbsp;</b></td></tr>';
		foreach ($args as $arg)
		{
			print '<tr>';
			print '<td>&nbsp;</td><td nowrap>'.$arg['ID'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Type'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['Label'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Desc'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['Config'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Flags'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['OFormat'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Table'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['Column'].'&nbsp;&nbsp;</td>';
			print '<tr>';
		}
		print '</table>';
	}
	else print "NO ARGS FOUND<br />";
	print "<br /><br />";
	print_r($attribs);
	print_r($index);
?>

