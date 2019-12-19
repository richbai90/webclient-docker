<?php
	//-- Trevor Killick Secuirty Function
	//-- Uses /xml/variablechecks.xml to validate Variables

	//-- Array of Variables to Ignor
	$arrIgnor = array("boolUseFormsInActivePageLinks","phpprintmode","httpreqid","_webclient","pageXML","dd");
	
	//Get Core Services Root
	$csinstallpath = sw_getcfgstring("CS\\InstallPath");
	//Get Supportworks Server Root
	$swinstallpath = sw_getcfgstring("InstallPath");

	//--GVP Secure GV Function
	function gvp($var)
	{
		$value = gv($var);
		security_check_variable($var, $value);
		
		return $value;
	}
	//-- Variable Check Function
	function security_check_variable($var, $value)
    {
		global $arrIgnor, $csinstallpath, $swinstallpath, $arrCallClass;
		if (in_array($var,$arrIgnor))
			return true;
		//-- Set XML Path
		if($GLOBALS['swInstallPath'])
		{
			$strFileName = $GLOBALS['swInstallPath']."/html/clisupp/xml/variablechecks.xml";
		}else if($swinstallpath)
		{
			$strFileName = $swinstallpath."\\html\\clisupp\\xml\\variablechecks.xml";
		}else
		{
			$strFileName = $csinstallpath."\\xml\\variablechecks.xml";
		}
		if(!is_file($strFileName))
			return true;
        $boolXML = false;
        $xmlfile = file_get_contents($strFileName);
        $xmlDoc = domxml_open_mem($xmlfile);
        if($xmlDoc)
        {
			//-- Loop Through XML
            $root = $xmlDoc->document_element();
            $arrNodes = $root->get_elements_by_tagname("check");
            $i = 0;
            //-- Build Array of XML Variables
            foreach ($arrNodes as $nodePos => $aNode)
            {
                $arrXmlVars[$i] = $aNode->get_attribute("id");
                $mustnotcontain[$aNode->get_attribute("id")] = $aNode->get_attribute("mustnotcontain");
                $mustcontain[$aNode->get_attribute("id")] = $aNode->get_attribute("mustcontain");
                $content[$aNode->get_attribute("id")] = $aNode->get_content();
                $i++;
            }

            //-- Check if Variable is within the Array
            foreach ($arrXmlVars as $XmlVars)
            {
                if($XmlVars == $var)
                {
                    $boolXML = true;
                }

            }

            //-- if Variable Exisists then check if
            if($boolXML)
            {
                //-- For Each node Check if it matches a passed Varriable
                $varName = $var;
                $strVarValue = $value;

                if(($strVarValue!="variablenotset") && ($strVarValue!="undefined"))
                {
                    //-- check if var has values that it should not contain and has values it must contain
                    $arrMustNotContain = explode("|",$mustnotcontain[$var]);
                    for($x=0; $x < count($arrMustNotContain);$x++)
                    {
                        $strCheckValue = $arrMustNotContain[$x];
                        if($strCheckValue=="")continue;
                        if(strpos($strVarValue,$strCheckValue)===false)
                        {
                            //-- good to go
                        }
                        else
                        {
                            exit_on_bad_var_security_check($varName,$strVarValue);
                        }
                    }

                    $arrMustContain = explode("|",$mustcontain[$var]);
                    for($x=0; $x < count($arrMustContain);$x++)
                    {
                        $strCheckValue = $arrMustContain[$x];
                        if($strCheckValue=="")continue;
                        if(strpos($strVarValue,$strCheckValue)===false)
                        {
                            exit_on_bad_var_security_check($varName,$strVarValue);
                        }
                        else
                        {
                            //-- good to go
                        }
                    }

                    //-- got this far so check if passes check
                    switch(strtolower($content[$var]))
                    {
                        case "alphaonly":
                            if($strVarValue=="")break;
                            if (is_numeric($strVarValue))
                            {
                                //-- error var is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "alphaonlynotblank":
                            if(($strVarValue=="")||(is_numeric($strVarValue)))
                            {
                                //-- error var is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "numericonly":
                            if($strVarValue=="")break;
                            if (!is_numeric($strVarValue))
                            {
                                //-- error var is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "numericonlynotblank":
                            if(($strVarValue=="")||(!is_numeric($strVarValue)))
                            {
                                //-- error var is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "notblank":
                            if($strVarValue=="")
                            {
                                //-- error var is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "validcallclass":
                            if($strVarValue!="")
                            {
 							    $boolValid = false;
							    if (in_array($strVarValue,$arrCallClass))
									$boolValid = true;
								//-- error field is meant to be numeric
                                 if(!$boolValid)
                                {
                                    //-- error var not a valid call class
                                    exit_on_bad_var_security_check($varName,$strVarValue);
                                }
                            }
                            break;
                        case "validkbdocref":
                            if($strVarValue!="")
                            {
                                $boolValid = false;
                                //-- Check for 11 Characters Long AlaphNumeric
                                if(preg_match('/[a-zA-Z0-9]{11}/i', $strVarValue))
                                {
                                  $boolValid = true;
                                }
                                //-- Check for **********-******** Docref
                                if(preg_match('/[a-zA-Z0-9]{10}-[a-zA-Z0-9]{8}/i', $strVarValue))
                                {
                                  $boolValid = true;
                                }
                                if(!$boolValid)
                                {
                                    //-- error var not a valid call class
                                    exit_on_bad_var_security_check($varName,$strVarValue);
                                }
                            }
                            break;
                    }
                }
            }

        }
        return true;

    }
	
	//-- Feild Check Function
	function security_check_variable_field($field, $value)
    {
		global $arrIgnor, $csinstallpath, $swinstallpath, $arrCallClass;
		if (in_array($field,$arrIgnor))
			return true;
		//-- Set XML Path
		if($GLOBALS['swInstallPath'])
		{
			$strFileName = $GLOBALS['swInstallPath']."/html/clisupp/xml/variablechecks.xml";
		}else if($swinstallpath)
		{
			$strFileName = $swinstallpath."\\html\\clisupp\\xml\\variablechecks.xml";
		}else
		{
			$strFileName = $csinstallpath."\\xml\\variablechecks.xml";
		}
		if(!is_file($strFileName))
			return true;
        $boolXML = false;
        $xmlfile = file_get_contents($strFileName);
        $xmlDoc = domxml_open_mem($xmlfile);
        if($xmlDoc)
        {
			//-- Loop Through XML
            $root = $xmlDoc->document_element();
            $arrNodes = $root->get_elements_by_tagname("field");
            $i = 0;
            //-- Build Array of XML Variables
            foreach ($arrNodes as $nodePos => $aNode)
            {
                $arrXmlVars[$i] = $aNode->get_attribute("id");
                $mustnotcontain[$aNode->get_attribute("id")] = $aNode->get_attribute("mustnotcontain");
                $mustcontain[$aNode->get_attribute("id")] = $aNode->get_attribute("mustcontain");
                $content[$aNode->get_attribute("id")] = $aNode->get_content();
                $i++;
            }

            //-- Check if Variable is within the Array
            foreach ($arrXmlVars as $XmlVars)
            {
                if($XmlVars == $field)
                {
                    $boolXML = true;
                }

            }

            //-- if Variable Exisists then check if
            if($boolXML)
            {
                //-- For Each node Check if it matches a passed Varriable
                $varName = $field;
                $strVarValue = $value;

                if(($strVarValue!="variablenotset") && ($strVarValue!="undefined"))
                {
                    //-- check if field has values that it should not contain and has values it must contain
                    $arrMustNotContain = explode("|",$mustnotcontain[$field]);
                    for($x=0; $x < count($arrMustNotContain);$x++)
                    {
                        $strCheckValue = $arrMustNotContain[$x];
                        if($strCheckValue=="")continue;
                        if(strpos($strVarValue,$strCheckValue)===false)
                        {
                            //-- good to go
                        }
                        else
                        {
                            exit_on_bad_var_security_check($varName,$strVarValue);
                        }
                    }

                    $arrMustContain = explode("|",$mustcontain[$field]);
                    for($x=0; $x < count($arrMustContain);$x++)
                    {
                        $strCheckValue = $arrMustContain[$x];
                        if($strCheckValue=="")continue;
                        if(strpos($strVarValue,$strCheckValue)===false)
                        {
                            exit_on_bad_var_security_check($varName,$strVarValue);
                        }
                        else
                        {
                            //-- good to go
                        }
                    }

                    //-- got this far so check if passes check
                    switch(strtolower($content[$field]))
                    {
                        case "alphaonly":
                            if($strVarValue=="")break;
                            if (is_numeric($strVarValue))
                            {
                                //-- error field is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "alphaonlynotblank":
                            if(($strVarValue=="")||(is_numeric($strVarValue)))
                            {
                                //-- error field is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "numericonly":
                            if($strVarValue=="")break;
                            if (!is_numeric($strVarValue))
                            {
                                //-- error field is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "numericonlynotblank":
                            if(($strVarValue=="")||(!is_numeric($strVarValue)))
                            {
                                //-- error field is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "notblank":
                            if($strVarValue=="")
                            {
                                //-- error field is meant to be numeric
                                exit_on_bad_var_security_check($varName,$strVarValue);
                            }
                            break;
                        case "validcallclass":
                            if($strVarValue!="")
                            {
                                $boolValid = false;
							    if (in_array($strVarValue,$arrCallClass))
									$boolValid = true;
								//-- error field is meant to be numeric
                                 if(!$boolValid)
                                {
                                    //-- error var not a valid call class
                                    exit_on_bad_var_security_check($varName,$strVarValue);
                                }
                            }
                            break;
                        case "validkbdocref":
                            if($strVarValue!="")
                            {
                                $boolValid = false;
                                //-- Check for 11 Characters Long AlaphNumeric
								$boolMatch = preg_match('/[a-zA-Z0-9]{11}/i',$strVarValue);
                                if($boolMatch)
                                {
                                  $boolValid = true;
                                }
                                //-- Check for **********-******** Docref
								$boolMatch = preg_match('/[a-zA-Z0-9]{10}-[a-zA-Z0-9]{8}/i',$strVarValue);
                                if($boolMatch)
                                {
                                  $boolValid = true;
                                }
                                if(!$boolValid)
                                {
                                    //-- error var not a valid call class
                                    exit_on_bad_var_security_check($varName,$strVarValue);
                                }
                            }
                            break;
						case "sessionid":
                            if($strVarValue!="")
                            {
                                $boolValid = false;
                                //-- Check for 11 Characters Long AlaphNumeric
                                if((!preg_match("/^[a-zA-Z0-9]{14}-[a-zA-Z0-9]{4,5}-[a-zA-Z0-9]{8}$/",$strVarValue)) && (!preg_match("/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}$/",$strVarValue)))
                                {
                                  $boolValid = true;
                                }
                                if(!$boolValid)
                                {
                                    //-- error var not a valid call class
                                    exit_on_bad_var_security_check($varName,$strVarValue);
                                }
                            }
                            break;
                    }
                }
            }

        }
        return true;

    }
	
	
	//-- Exit Function
	//-- exit application on bad var
	function exit_on_bad_var_security_check($varName,$strVarValue)
	{
		global $script_path;
		//echo $varName . ":" . $strVarValue;
		if(function_exists('log_action'))
		{
			log_action("SQL Parser Failed :- Script: $script_path");
			log_action("SQL Parser Failed :- Variable: $varName Value: $strVarValue");
		}
		echo "</br><center><font color='red'>A submitted variable was not recognised. Please contact your system Administrator.</font></center>";
		exit;
	}
?>