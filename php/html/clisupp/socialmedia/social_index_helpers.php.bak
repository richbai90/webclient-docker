<?php

	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	//include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/helpers/language.php');
	include_once('itsm_default/xmlmc/classtabcontrol.php');			//-- class to control drawing out of tab controls
	include_once('itsm_default/xmlmc/installpath.php');
	//include_once('itsm_default/xmlmc/common.php');

	function showSMTabs($strTabFormName)
	{
		$retForm = new oTabForm;
		$retForm->xmlRoot = open_tabxml($strTabFormName);
		$retForm->controlname=$strTabFormName;
		return $retForm;	
	}

	//--
	//-- open a tab xml def and return root document
	function open_tabxml($strTabFormName)
	{
		//-- open xml file based on tabformname
		$strFileName = $GLOBALS['instance_path']."clisupp\socialmedia\xml\\".$strTabFormName.".xml";
		//$strFileName = "C:\Program Files\Hornbill\Supportworks Server\html\clisupp\oAuth\xml\\".$strTabFormName.".xml";
		//echo $strFileName;
		$xmlfile = load_file($strFileName);
		$xmlDoc = domxml_open_mem($xmlfile);
		$root = $xmlDoc->document_element();
		return $root;
	}

	//-- load file content - takes into account sspi
	function load_file($strPath)
	{
		return file_get_contents($strPath);
	}

	//--
	//-- given a string parse out context
	function parse_context_vars($parseString)
	{
		return eval_contextvars($parseString,"![","]!");

	}

	function eval_contextvars($parseString,$strStartChar,$strEndChar)
	{
		$counter=0;
		while( (strstr($parseString,$strStartChar)) && (strstr($parseString,$strEndChar)) )
		{
			//-- find the first $strStartChar (place holder) and store the string upto that point
			$strBeginning = substr($parseString,0,strpos($parseString,$strStartChar));
			$strPlaceHolder = substr($parseString,strpos($parseString,$strStartChar)+strlen($strStartChar));
			$strPlaceHolder = substr($strPlaceHolder,0,strpos($strPlaceHolder,$strEndChar));

			//-- evaluate
			//echo $strBeginning . ":" . $strPlaceHolder;
			eval("\$varValue = ".$strPlaceHolder.";");
			$parseString = str_replace($strStartChar.$strPlaceHolder.$strEndChar,$varValue,$parseString);
			$counter++;
			if($counter>50)return $parseString;
		}
		return $parseString;
	}

	function getAttribute($name, $att)
	{
		foreach($att as $attkey => $anAttribute)
		{
			if($anAttribute->name()==$name)return $anAttribute->value();
		}
		return "";
	}

	//-- return current document path http://billy/something.com?hello=hello return htpp://billy/
	function docURL()
	{
		return dirname(docFullURL())."/";
	}

	//-- return current document url htpp://billy/something.com?hello=hello
	function docFullURL()
	{
		$s = empty($_SERVER["HTTPS"]) ? ''
		: ($_SERVER["HTTPS"] == "on") ? "s"
		: "";
		$protocol = strleft(strtolower($_SERVER["SERVER_PROTOCOL"]), "/").$s;
		$port = ($_SERVER["SERVER_PORT"] == "80") ? ""
		: (":".$_SERVER["SERVER_PORT"]);
		return $protocol."://".$_SERVER['SERVER_NAME'].$port.$_SERVER['REQUEST_URI'];
	}

	function strleft($s1, $s2)
	{
		return substr($s1, 0, strpos($s1, $s2));
	}

	function analystIsAdmin()
	{
		return $_SESSION['wc_privlevel']==3;
	}

	//-- DJH - Access function to determine whether to show specific tabs
	function showSWTab($tabid)
	{
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');
		if($tabid==1)
		{
			//-- Show tab if analyst is an administrator and we are not in the webclient
			return (analystIsAdmin() && (gv('_webclient')!=1));
		}

		if($tabid==2)
		{
			global $analystid;
					
			$connDB = new CSwDbConnection;
			$connDB->Connect(swdsn(), swuid(), swpwd());
			$strSQL = "select count(*) as analystcount from socmed_analysts where fk_analyst_id='".pfs($analystid)."'";
			$connDB->Query($strSQL);
			if($connDB->Fetch())
			{
				//-- If analyst has access to one or more profiles then show the settings tab
				return $GLOBALS['analystcount']>0;
			}
		}

		if($tabid==3)
		{
			global $analystid;
					
			$connDB = new CSwDbConnection;
			$connDB->Connect(swdsn(), swuid(), swpwd());
			$strSQL = "select count(*) as analystcount from socmed_analysts where fk_analyst_id='".pfs($analystid)."'";
			$connDB->Query($strSQL);
			if($connDB->Fetch())
			{
				//-- If analyst has access to one or more profiles then show the settings tab
				return (($GLOBALS['analystcount']>0) || (analystIsAdmin()));
			}
		}

		if($tabid==4)
		{
			global $analystid;
					
			$connDB = new CSwDbConnection;
			$connDB->Connect(swdsn(), swuid(), swpwd());
			$strSQL = "select count(*) as analystcount from socmed_analysts where fk_analyst_id='".pfs($analystid)."'";
			$connDB->Query($strSQL);
			if($connDB->Fetch())
			{
				//-- If analyst has access to one or more profiles then show the settings tab
				return !(($GLOBALS['analystcount']>0) || (analystIsAdmin()));
			}
		}

		return false;
	}

?>