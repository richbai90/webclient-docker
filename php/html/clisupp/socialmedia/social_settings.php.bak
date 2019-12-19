<?php 
	include_once('social_index_helpers.php');

?>

<html>
<head>
<link href="css/structure.css" rel="stylesheet" type="text/css" />
<script src="js/index.js"></script>

<!-- css to support tab set -->
<link href="css/panels.css" rel="stylesheet" type="text/css" />

<!-- system js to support tab set-->
<!--<script src="js/portal.control.js"></script>
<script src="js/xmlhttp.control.js"></script>
<script src="js/tab.control.js"></script>-->


<script>
	var app = top; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "<?php echo docURL();?>";
</script>

</head>
<body>
<?php 	$oTabControl = showSMTabs("socialmediasettings"); 
	echo $oTabControl->draw('100%','');
?>
</body>
</html>