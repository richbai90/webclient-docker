<?php

//-- scan apps and determine what un-supported sw classes and controls are used.
//--

class oClass
{
		var $name = "";
		var $impact = "";
		var $type = "";
		var $description = "";
		var $unsupportedmethods = "";

	function oClass($name, $impact, $type = "class", $description = "", $strUnsupportedMethods = "")
	{
		$this->name = $name;
		$this->impact = $impact; //-- low , medium , high
		$this->type = $type;
		$this->description = $description;
		$this->unsupportedmethods = $strUnsupportedMethods;
	}
}

//--
//-- array of classes and controls that are not supported 
//--

//-- high
$arrUnsupportedObjects = Array();
$arrUnsupportedObjects['new DatabaseConnection'] = new oClass("DatabaseConnection","high", "class","Opens local client ODBC database connection. Alerts not supported message.","CreateDocument");
$arrUnsupportedObjects['new WordDocument'] = new oClass("WordDocument","high", "class","Accesses local ms word installation.  Alerts not supported message.");

//-- medium
$arrUnsupportedObjects['OpenVCM'] = new oClass("OpenVCM","medium", "class","Opens hornbill vcm application. Callable but does nothing.");
$arrUnsupportedObjects['new XmlFile'] = new oClass("XmlFile","medium", "class","Partly Supported. Some methods access local file system.","Unsupported Methods are :- setXpathValue,setModified,isModified,xpathGetXml,xpathSetXml");
$arrUnsupportedObjects['InvokeSlaEditDialog('] = new oClass("InvokeSlaEditDialog","medium", "class","Alerts not supported message");
$arrUnsupportedObjects['InvokeAddNewSlaDialog('] = new oClass("InvokeAddNewSlaDialog","medium", "class","Alerts not supported message");

//-- low
$arrUnsupportedObjects['new PickFileDialog'] = new oClass("PickFileDialog","low", "class","Accesses local file system.  Alerts not supported message.");
$arrUnsupportedObjects['new Issue('] = new oClass("Issue","low", "class","Redundant issue handling class. Callable but does nothing.");
$arrUnsupportedObjects['PCA_ShowDetails('] = new oClass("PCA_ShowDetails","low", "class","Class to launch local executable to view PCA details. Alerts not supported message.");
$arrUnsupportedObjects['TAPIDial('] = new oClass("TAPIDial","low", "class","Runs local TAPI interface. Alerts not supported message.");
$arrUnsupportedObjects['RunProgram('] = new oClass("RunProgram","low", "class","Executes a local executable file.  Alerts not supported message.");
$arrUnsupportedObjects['ShellExecute('] = new oClass("ShellExecute","low", "class","Executes a local shell command.  Supports http command otherwise alerts not supported message.");

$arrUnsupportedObjects['LoadFileInBase64('] = new oClass("LoadFileInBase64","low", "class","Loads local file and base64 encodes it. Callable but does nothing");

$arrUnsupportedObjects['RegGetDword('] = new oClass("RegGetDword","low", "class","Accesses local registry. Callable but does nothing");
$arrUnsupportedObjects['RegGetString('] = new oClass("RegGetString","low", "class","Access localregistry. Callable but does nothing");

//-- now supported with vpme script
//$arrUnsupportedObjects['IsSurveyModuleEnabled('] = new oClass("IsSurveyModuleEnabled","low", "class","Callable but always returns false.");

$arrUnsupportedObjects['ScheduleCallback('] = new oClass("ScheduleCallback","low", "class","Alerts not supported message");

//-- no functional impact - so do not bother reporting
//$arrUnsupportedObjects['Sleep('] = new oClass("Sleep","no", "class","Callable but does nothing");
//$arrUnsupportedObjects['CloseMailMessageWindow('] = new oClass("CloseMailMessageWindow","no", "class","Callable but does nothing");
//$arrUnsupportedObjects['GuiFlush('] = new oClass("GuiFlush","no", "class","Callable but does nothing");
//$arrUnsupportedObjects['LogInfo('] = new oClass("LogInfo","no", "class","Callable but does nothing");
//$arrUnsupportedObjects['MessageBeep('] = new oClass("MessageBeep","no", "class","Callable but does nothing");


//-- form controls
$arrUnsupportedObjects['SingleSetChart'] = new oClass("SingleSetChart","low", "control","Not Supported. Form will draw out chart container with a 'not supported message'");
//$arrUnsupportedObjects['FormulaField'] = new oClass("FormulaField","low", "control","Draws out readonly form field");


//-- loop each app in "apps" folder and get the original forms xml and check for instances of unsupported objects in each forms
//-- 

function read_folder_directory($dir = "") 
{ 
        $listDir = array(); 
        if($handler = @opendir($dir)) { 
            while (($sub = readdir($handler)) !== FALSE) { 
                if ($sub != "." && $sub != ".." && $sub != "Thumb.db" && $sub != "Thumbs.db") {
                     if(is_file($dir."/".$sub)) { 
                        $listDir[] = $sub; 
                    }elseif(is_dir($dir."/".$sub)){ 
                        $listDir[$sub] = read_folder_directory($dir."/".$sub); 
                    } 
                } 
            } 
            closedir($handler); 
        } 
        return $listDir; 
} 

function check_app_forms($strApp, $strType)
{
	global $arrUnsupportedObjects;
	$retXML = "";
	$files = read_folder_directory(getcwd()."/apps/".$strApp."/_xml/original/". $strType); 
    foreach ($files  as $name => $file) 
    { 
		$fileContent = file_get_contents(getcwd()."/apps/".$strApp."/_xml/original/". $strType ."/".$file);
		//-- now check for matches from unsupported array
		$file = substr($file,0,-4);
		$file = str_replace(" " ,"_",$file);

		$strOutput = "";
		$intCount = 0;
		$intClassCount = 0;
		$bFound = false;
		foreach ($arrUnsupportedObjects as $objectName => $aClass)
		{
			$intOccs = substr_count ( $fileContent, $objectName );
			if($intOccs > 0)
			{
				$intClassCount++;
				$intCount = $intCount + $intOccs;
				$bFound = true;
				$strOutput .= "<".trim($aClass->name).">";
					$strOutput .= "<occurences>".$intOccs."</occurences>";
					$strOutput .= "<impact>".$aClass->impact."</impact>";
					$strOutput .= "<description>".$aClass->description."</description>";
					if($aClass->unsupportedmethods!="")
					{
						$strOutput .= "<unSupportedMethods>".$aClass->unsupportedmethods."</unSupportedMethods>";
					}
				$strOutput .= "</".trim($aClass->name).">";
			}
		}

		$strOutput = "<".$file." numclasses='".$intClassCount."' affectedcount='".$intCount."'>".$strOutput ."</".$file.">";
		if($bFound)$retXML .= $strOutput;
    } 
	return $retXML;
}

$files = read_folder_directory(getcwd()."/apps/"); 
if ($files) 
{ 
	 $strOutput = '<?xml version="1.0"?><diagnostics>';
     foreach ($files  as $name => $file) 
     { 
		 $strOutput .= "<application name='".trim($name)."'>";
		 $strOutput .= "<standardForms>".check_app_forms($name, "stf")."</standardForms>";
		 $strOutput .= "<logCallForms>".check_app_forms($name, "lcf")."</logCallForms>";
		 $strOutput .= "<callDetailForms>".check_app_forms($name, "cdf")."</callDetailForms>";
		 $strOutput .="</application>";
     } 
	 $strOutput .= "</diagnostics>";
	
 

	if (!$dom = domxml_open_mem($strOutput)) 
	{
	  echo "Error while parsing the document\n";
	  exit;
	}

	$strHTML = "";
	$root = $dom->document_element();
	$arrApps = $root->get_elements_by_tagname("application");
    foreach ($arrApps  as $i => $xmlApp) 
    { 

		$strApplicationName = $xmlApp->get_attribute('name');
		$xmlSTF = $xmlApp->get_elements_by_tagname("standardForms");
		$xmlLCF = $xmlApp->get_elements_by_tagname("logCallForms");
		$xmlCDF = $xmlApp->get_elements_by_tagname("callDetailForms");
		$intUniqueClassCount = 0;

		//-- standard forms html output
		$arrClassNames = Array();
		$strSTFHTML = "";
		foreach($xmlSTF[0]->child_nodes() as $x =>$xmlForm)
		{
			$strMethodsHTML = "";
			$strFormName = $xmlForm->tagName();
			$intClassesFoundInForm = $xmlForm->get_attribute("numclasses");
			$intNumberOfTimesClassesFoundInForm = $xmlForm->get_attribute("affectedcount");
			foreach($xmlForm->child_nodes() as $x => $xmlClass)
			{
				$strClassName = $xmlClass->tagName();

				//--
				$xmlOccs = $xmlClass->get_elements_by_tagname("occurences");
				$intOccs = $xmlOccs[0]->get_content();
				$strS=($intOccs>1)?"s":"";
				$xmlDesc = $xmlClass->get_elements_by_tagname("description");
				$strDesc = $xmlDesc[0]->get_content();
				$xmlImp = $xmlClass->get_elements_by_tagname("impact");
				$strImp = $xmlImp[0]->get_content();

				$xmlMethods = $xmlClass->get_elements_by_tagname("unSupportedMethods");
				$strMethods = "";
				if($xmlMethods[0])	$strMethods = " - ".$xmlMethods[0]->get_content();
				$strMethodsHTML .= "<div class='affected-method'>".$strClassName." - ".$intOccs." occurence".$strS." - Typicall Functionality Impact ".$strImp." - ".$strDesc.$strMethods."</div>";


				if(!$arrClassNames[$strClassName])
				{
					$arrClassNames[$strClassName] = "Impact [".$strImp."]. ".$strDesc.$strMethods;
					$intUniqueClassCount++;
				}

			}

			$strSTFHTML .= "<div class='affected-form' onclick='expandcollapse(this.nextSibling);'>".$strFormName." (".$intClassesFoundInForm." unsupported swjs class found in ".$intNumberOfTimesClassesFoundInForm." places)</div><div class='displaynone'>".$strMethodsHTML."</div>";
		}

		//-- log call output
		$strLCFHTML = "";
		foreach($xmlLCF[0]->child_nodes() as $x =>$xmlForm)
		{
			$strMethodsHTML = "";
			$strFormName = $xmlForm->tagName();
			$intClassesFoundInForm = $xmlForm->get_attribute("numclasses");
			$intNumberOfTimesClassesFoundInForm = $xmlForm->get_attribute("affectedcount");
			foreach($xmlForm->child_nodes() as $x => $xmlClass)
			{
				$strClassName = $xmlClass->tagName();

				//--
				$xmlOccs = $xmlClass->get_elements_by_tagname("occurences");
				$intOccs = $xmlOccs[0]->get_content();
				$strS=($intOccs>1)?"s":"";
				$xmlDesc = $xmlClass->get_elements_by_tagname("description");
				$strDesc = $xmlDesc[0]->get_content();
				$xmlImp = $xmlClass->get_elements_by_tagname("impact");
				$strImp = $xmlImp[0]->get_content();

				$xmlMethods = $xmlClass->get_elements_by_tagname("unSupportedMethods");
				$strMethods = "";
				if($xmlMethods[0])	$strMethods = " - ".$xmlMethods[0]->get_content();
				$strMethodsHTML .= "<div class='affected-method'>".$strClassName." - ".$intOccs." occurence".$strS." - Typicall Functionality Impact ".$strImp." - ".$strDesc.$strMethods."</div>";


				if(!$arrClassNames[$strClassName])
				{
					$arrClassNames[$strClassName] = "Impact [".$strImp."]. ".$strDesc.$strMethods;
					$intUniqueClassCount++;
				}

			}
			$strFormName = str_replace("_" ," ",$strFormName);
			$strLCFHTML .= "<div class='affected-form' onclick='expandcollapse(this.nextSibling);'>".$strFormName." (".$intClassesFoundInForm." unsupported swjs class found in ".$intNumberOfTimesClassesFoundInForm." places)</div><div class='displaynone'>".$strMethodsHTML."</div>";
		}
		
		//-- call detail output
		$strCDFHTML = "";
		foreach($xmlCDF[0]->child_nodes() as $x =>$xmlForm)
		{
			$strMethodsHTML = "";
			$strFormName = $xmlForm->tagName();
			$intClassesFoundInForm = $xmlForm->get_attribute("numclasses");
			$intNumberOfTimesClassesFoundInForm = $xmlForm->get_attribute("affectedcount");
			foreach($xmlForm->child_nodes() as $x => $xmlClass)
			{
				$strClassName = $xmlClass->tagName();

				//--
				$xmlOccs = $xmlClass->get_elements_by_tagname("occurences");
				$intOccs = $xmlOccs[0]->get_content();
				$strS=($intOccs>1)?"s":"";
				$xmlDesc = $xmlClass->get_elements_by_tagname("description");
				$strDesc = $xmlDesc[0]->get_content();
				$xmlImp = $xmlClass->get_elements_by_tagname("impact");
				$strImp = $xmlImp[0]->get_content();

				$xmlMethods = $xmlClass->get_elements_by_tagname("unSupportedMethods");
				$strMethods = "";
				if($xmlMethods[0])	$strMethods = " - ".$xmlMethods[0]->get_content();
				$strMethodsHTML .= "<div class='affected-method'>".$strClassName." - ".$intOccs." occurence".$strS." - Typicall Functionality Impact ".$strImp." - ".$strDesc.$strMethods."</div>";


				if(!$arrClassNames[$strClassName])
				{
					$arrClassNames[$strClassName] = "Impact [".$strImp."]. ".$strDesc.$strMethods;
					$intUniqueClassCount++;
				}

			}
			$strFormName = str_replace("_" ," ",$strFormName);
			$strCDFHTML .= "<div class='affected-form' onclick='expandcollapse(this.nextSibling);'>".$strFormName." (".$intClassesFoundInForm." unsupported swjs class found in ".$intNumberOfTimesClassesFoundInForm." places)</div><div class='displaynone'>".$strMethodsHTML."</div>";
		}


		$intTotalFormCount = count($xmlSTF[0]->child_nodes()) + count($xmlLCF[0]->child_nodes()) + count($xmlCDF[0]->child_nodes());
		$strHTML .= "<div class='application-header'><b>".$strApplicationName." : </b> [".$intTotalFormCount." Affected forms] [".$intUniqueClassCount." types of unsupported swjs class found]</div>";

		$strHTML .="<div style='font-size:12px;'>The following unsupported classes were found in this application:-</br></br>";
		foreach($arrClassNames as $strMethodName => $strDesc)
		{
			if(strpos($strDesc,"[medium]")!==false)$strColor = "orange"; 
			else if(strpos($strDesc,"[high]")!==false)$strColor = "red";
			else$strColor = "black";
			$strHTML .= "<div class='affected-method' style='color:".$strColor.";'>".$strMethodName ." - " . $strDesc."</div>";
		}
		$strHTML .= "</br>Click on a form type to drill down for more information</br></br></div>";

		//-- log call forms
		$strHTML .= "<div><div class='lcf-header' onclick='expandcollapse(this.nextSibling);'>Affected Log Call Forms (".count($xmlLCF[0]->child_nodes()).")</div><div class='displaynone'>".$strLCFHTML."</div>";

		//-- call detail forms
		$strHTML .= "<div class='cdf-header' onclick='expandcollapse(this.nextSibling);'>Affected Call Detail Forms (".count($xmlCDF[0]->child_nodes()).")</div><div class='displaynone'>".$strCDFHTML."</div>";

		//-- standard forms
		$strHTML .= "<div class='stf-header' onclick='expandcollapse(this.nextSibling);'>Affected Standard Forms (".count($xmlSTF[0]->child_nodes()).")</div><div class='displaynone'>".$strSTFHTML."</div></div>";

	}
	//echo $xmlDomDoc->dump_mem(true, 'UTF-8' );
	//print $strOutput;
	//exit(0);
} 
?>
<html>
<style>
	*{
		font-family:Arial,Helvetica,sans-serif;
	}


	.application-header
	{
		background-color:silver;
		font-size:14px;
		border:1px solid gray;
		padding:5px;
		margin-bottom:10px;
		margin-top:10px;
	}

	.stf-header, .lcf-header, .cdf-header
	{
		background-color:#FFFFD4;
		font-size:13px;
		border:1px solid gray;
		padding:3px;
		margin-bottom:5px;
		margin-left:20px;
	}

	.affected-form
	{
		background-color:#D8E7FC;
		font-size:12px;
		border:1px solid gray;
		padding:2px;
		margin-bottom:5px;
		margin-left:40px;
		cursor:pointer;
	}
	.affected-method
	{
		font-weight:bold;
		font-size:11px;
		padding:2px;
		margin-bottom:5px;
		margin-left:60px;
	}

	.displaynone
	{
		display:none;
	}
</style>
<script>
	function expandcollapse(oDiv)
	{
		if(oDiv.style.display=="none" || oDiv.style.display=="")
		{
			oDiv.style.display="block";
		}
		else
		{
			oDiv.style.display="none";
		}
	}
</script>
<body>
<h3>Webclient Application Compatibility Diagnostic</h3>
<?php echo $strHTML;?>
</body>
</html>

