<?php require "index_data.php"; ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title></title>
    <link href="css/structure.css" rel="stylesheet" type="text/css" />
    <link href="css/fsc.css" rel="stylesheet" type="text/css" />
    <script language="javascript">
        window.onload = function() {
            window.location = "#today";
            window.scrollBy(-110,-110);
        }
    </script>
</head>
<body style="padding: 10px;">
    <div id="contentColumn">    
        <?php echo  output_fsc_calendar($connSwdata) ?>
    </div>
</body>
</html>
