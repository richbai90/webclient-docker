<?php 	if(!file_exists("classRightAnswers.php"))
	{
		?>
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html>
		<head>
		<title>RightAnswers Knowledgebase</title>
		</head>
		<body>
				<br><br>
				<center>
					<span class="error">
						The functionality to integrate with RightAnswers is not available<br>
						For further information please contact your account manager.
					</span>
				</center>
			</body>
		</html>
		<?php 		exit;
	}
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Knowledgebase Search</title>
		<link href="css/swra.css" rel="stylesheet" type="text/css" />
		<link rel="stylesheet" href="css/jquery.dataTables.css" />
		<link rel="stylesheet" href="css/redmond/jquery-ui-1.8.21.custom.css" />
		<link rel="stylesheet" href="css/structure.css" />
		<link rel="stylesheet" href="css/swra.css" />
		<script src="js/jquery-1.7.1.min.js"></script>
		<script src="js/jquery-ui-1.8.21.custom.min.js"></script>
		<script type="text/javascript" language="javascript" src="js/jquery.printElement.min.js"></script>
		<script type="text/javascript" language="javascript" src="js/jquery.dataTables.min.js"></script>
		<script type="text/javascript" src="js/swkb.js"></script>
	</head>
	<body>
		<div id="contentColumn">
			<div id="header">
				<h1>Knowledgebase Search</h1>
			</div>
			<div id="searchentry">
				<label for="searchquerytxt">Enter Your Question:</label><br/>
				<input type="text" name="searchquery" id="searchquerytxt" value="<?php echo $_GET['searchtxt'];?>" class="input" />
				<a href="#" id="searchButton">Search</a>
			</div>
			<div id="articlecontent" class="tablecontent">
				<table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
					<thead>
						<tr>
							<th width="20%">ID</th>
							<th width="20%">Relevance</th>
							<th width="60%">Title</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colspan="5" class="dataTables_empty">Searching...</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th width="20%"></th>
							<th width="20%"></th>
							<th width="60%"></th>
						</tr>
					</tfoot>
				</table>
			</div>

			<div id="selectedcontent" class="tablecontent">
				<h3>Selected Articles</h3>
				<table cellpadding="0" cellspacing="0" border="0" class="display" id="selectedresults">
					<thead>
						<tr>
							<th width="20%">ID</th>
							<th width="80%">Title</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colspan="5" class="dataTables_empty">Searching...</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th width="20%"></th>
							<th width="80%"></th>
						</tr>
					</tfoot>
				</table>
			</div>

			<div id="divPopup" title=""></div>
		
		</div><!-- /page -->
	
		<input type="hidden" id="callref" value="<?php echo $_GET['callref'];?>">
		<input type="hidden" id="bShowSelectionLink" value="<?php echo $_GET['bShowSelectionLink'];?>">
		<input type="hidden" id="strSelectedArticles" value="<?php echo $_GET['strSelectedArticles'];?>">
		<input type="hidden" id="callkbidentifier" value="<?php echo $_GET['callkbidentifier'];?>">
		
		
				
		<script type="text/javascript">
			
			$(document).ready(function() {

				$('#searchButton').bind({
				click : function() {
						search();
					}
				});

				initiatePage();
			});

		</script>
	</body>
</html>