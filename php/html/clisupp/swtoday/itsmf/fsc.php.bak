<?php 

	include_once('itsmf/xmlmc/classactivepagesession.php');
	include_once('itsmf/xmlmc/common.php');

require "index_data.php"; ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title></title>
    <link href="css/structure.css" rel="stylesheet" type="text/css" />
    <link href="css/fsc.css" rel="stylesheet" type="text/css" />
    <script language="javascript">

		function eleTop(obj) 
		{
			var curtop = 0;
			if (obj.offsetParent) 
			{
				curtop = obj.offsetTop
				while (obj = obj.offsetParent) 
				{
					curtop += obj.offsetTop
				}
			}
			return  curtop;
		}

        function scroll_to_today() 
		{
            var eToday = document.getElementById('today');
			if(eToday!=null)
			{
				eToday.scrollIntoView(true);	
	          
			}
        }
    </script>
</head>
<body style="padding: 10px;" onload='scroll_to_today();'>
    <div id="contentColumn">    
        <?php echo  output_fsc_calendar($connSwdata) ?>
    </div>
</body>
</html>
