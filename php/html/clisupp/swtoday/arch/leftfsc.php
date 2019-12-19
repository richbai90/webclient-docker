<?php
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Hornbill Change Schedule</title>

<link href="css/structure.css" rel="stylesheet" type="text/css" />

</head>
<body>
	<div id="IE6MinWidth">
		<div id="wrapper">
			<div id="contentWrapper" style="font-size: 76%";>
			<?php
				include('index_data.php');

				echo output_fsc_notifications_overview($connSwdata, true, false, true);
			?>
			</div>
		</div>
	</div>
</body>
</html>