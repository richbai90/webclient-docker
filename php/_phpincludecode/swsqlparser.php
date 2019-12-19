<?php
	//-- Trevor Killick 09/05/2013
	//-- Functions For Parseing SQL Querys and Validating feilds before beign passed to SQL
	//--error_reporting(E_ALL);
	include_once('helpers/swclassparser.php');
	include_once('helpers/stdcheckinclude.php');
	include_once('helpers/variables.php');
		
	//Get Core Services Root
	$csinstallpath = sw_getcfgstring("CS\\InstallPath");
	//Get Supportworks Server Root
	$swinstallpath = sw_getcfgstring("InstallPath");

	//-- Directory From
	$script_path = $_SERVER['SCRIPT_FILENAME'];
	
	//-- log Function for Failed
	function log_action($message)
	{
		global $swinstallpath, $csinstallpath;
		if($swinstallpath)
		{
			$log = fopen($swinstallpath.'\log\SQL_PARSER.log', "a+");
			fwrite($log, "\r\n". date("d.m.y H:i:s") . " - " . $message);
			fclose($log);
		}else
		{
			$log = fopen($csinstallpath.'\SQL_PARSER.log', "a+");
			fwrite($log, "\r\n". date("d.m.y H:i:s") . " - " . $message);
			fclose($log);
		}

	}
	function parse_sql_query($query)
	{
		global $arrIgnore, $script_path, $arrFilesIgnore,$arrInjection;
		$boolCheck = false;
		$between = 0;
		
		foreach($arrFilesIgnore as $varFiles)
		{
			//-- Blanket Allot runReport.php
			if(substr_count(strtolower($script_path), strtolower($varFiles))>0)
			{
				//echo $script_path;
				return true;
			}
		}
		
		foreach($arrInjection as $varInjection)
		{
			//-- Blanket Allot runReport.php
			if(substr_count(strtolower($script_path), strtolower($varInjection))>0)
			{
				//echo $script_path;
				return true;
			}
		}
		
		//-- Check for Between
		foreach ($arrIgnore as $varIgnore)
		{
			$found = substr_count(strtolower($query), strtolower($varIgnore));
			if($found > 0)
				$between++;
		}
		if($between > 0)
				return true;
		//-- Parse Query
		$var = new PHPSQLParser;
		$test = $var->parse($query);
		if(!validSQL($test))
		{
			//-- If Not Valid then Return False
			log_action("SQL Parser Failed :- Script: $script_path");
			log_action("Failed to Parse SQL -: ".$query."");
			echo $script_path;
			echo $query;
			echo "</br><center><font color='red'>A submitted variable was not recognised. Please contact your system Administrator.</font></center>";
			exit;
		}
			
		return true;
	}
	
	//-- Column Checking Function
	function col_check($col, $value, $table)
	{
		//-- TK Check for opencall. for example
		$pos = strpos($col, ".");
		if($pos)
		{
			//--Split on "."
			$arrPos = explode(".",$col);
			//-- Check first part was the table
			$col=$arrPos[1];
			//-- If we found a table, set table to table.column for validaton
			$table = $arrPos[0];
		}
		//echo "Column Found - $tok_value  <br>";
		$last="colref";
		
		$boolCheck = false;
		//-- field Type Check
		if($table)
			$var = field_type($table, $col);
		if ($var == "notype")
		{
			return true;
		}
		//-- If we Have a Type Then do a check on it
		if($var)
		{
			$boolCheck = type_check($var, $value);

		}else
		{
			//-- if no feild check available then return true
			$boolCheck = true;
		}
		//-- Unpad Numeical Feilds from '1' to 1
		if($var == "number")
		{
			//-- Check if a numeric string has been passed and escape it
			$end = substr($value, -1); 
			$start = $value[0];
			if(($start == "'") &&($end =="'"))
			{
				$value= ltrim ($value,"'");
				$value= rtrim ($value,"'");
			}
		}
		security_check_variable_field($col, $value); //-- This will die if fails the check
		//-- If Secuirty Check Fails then it will Exit.
		return $boolCheck;
	}
	
	//-- Get field Type from DTI
	function field_type($table, $col)
	{
		//--Load DTI
		swdti_load('Default');

		//-- Check Column
		if(function_exists('swdti_getdatatype'))
		{
			$type = swdti_getdatatype($table.".".$col);
			if($type == "8")
				$return_type = "text";
			if($type == "18")
				$return_type = "number";
			return $return_type;
		}else
		{
			return "notype";
		}
	}
	
	//-- Type Check
	function type_check($var, $field)
	{
		$boolPass = false;
		if($var == "text")
		{
			if(is_string($field))
				$boolPass = true;
		}
		if($var == "number")
		{
			//-- Check if a numeric string has been passed and escape it
			$end = substr($field, -1); 
			$start = $field[0];
			if(($start == "'") &&($end =="'"))
			{
				$field= ltrim ($field,"'");
				$field= rtrim ($field,"'");
			}
			
			if(is_numeric($field))
				$boolPass = true;
		}
		//-- Check for NUll and return true if null
		if(strtolower($field)=='null' or $field =='')
			$boolPass = true;
		return $boolPass;
	}
	
	//-- Validate SQL Statement KS 10/05/2012
	function validSQL($array, $index=0)
	{
		global $tree;
		global $valcnt;
		global $last;
		global $res;
		global $col;
		global $value;
		global $ignorenext;
		global $possible_danger;
		global $possible_danger_wtf;
		global $colref_cnt;
		global $table;
		global $tok_value_table;
		global $debug;
		global $bypass;
		global $checkforcomma;
		
		if($index==0)
		{
			 $tree=0;
			 $valcnt=0;
			 $last=0;
			 $res=0;
			 $col=0;
			 $value=0;
			 $ignorenext=0;
			 $possible_danger=0;
			 $possible_danger_wtf=0;
			 $colref_cnt=0;
			 $table=0;
			 $tok_value_table=0;
			 $bypass=0;
			 $checkforcomma=0;
		}
		
	
		$res=true;
		if(gettype($array)=="array")
		{
		
			$index++;
			while (list ($token, $tok_value) = each ($array))
			{
				if($tok_value=='CROSS')
				{
					$colref_cnt=0;
					$last='';
				}
				if($tok_value=='JOIN')
				{
					$colref_cnt=0;
					$last='';
				}
				if($token=='base_expr' and ($tok_value=='LOWER' or $tok_value=='UPPER'))
				{
					$bypass=1;
					$colref_cnt=1;
					$last='LWR';
			
				}
				if($token=='base_expr' and ($tok_value=='LEFT' or $tok_value=='RIGHT'))
				{
					$bypass=1;
					$colref_cnt=1;
					$last='LEFT';
			
				}
				if($token=='base_expr' and $checkforcomma==1)
				{
					if($tok_value==',')
					{
						$bypass=1;
					}
					else
					{
						//We got here when we shouldnt have. Something is a foot at the circle K
						return false;
					}
						
				}
				
				
				if($tok_value=='expression' or ($tok_value=='const' and $checkforcomma==1))
				{
					if($bypass==1)
					{
						$ignorenext=1;
						$bypass=0;
						if($checkforcomma==1)
						{
							$last='COL';
						}
						$checkforcomma=0;
					}
					else
					{
						$colref_cnt=0;
						$last='';
						$ignorenext=1;
					}
				}
				else
				{
					//-- TK Grab Table 
					if($token=="table" && $tok_value!="" && gettype($tok_value) != "array")
					{
						if($token==="table" and (!$table))
						{
							$table=$tok_value;
						}
					}
					
					if($token=='expr_type' and $tok_value=="colref" and $last=='')
					{
						if($debug)
							echo "Possible Column Found <br>";
						$last="COL";
						$colref_cnt++;

					}
					if($token=='expr_type' and $tok_value=='in-list')
					{
						$possible_danger_wtf=0;
						$last='';
					}
					if($token=='expr_type' and $tok_value=="colref" and $last=='PVAL')
					{
						if($debug)
							echo "Column found for the Wrong way round statement <br>";
						$possible_danger_wtf=0;
						$colref_cnt++;
						$last="PCOL";

					}
					if($token=='expr_type' and $tok_value=="const" and $last=='')
					{
						if($debug)	
							echo "Possible Column Found but the wrong way round <br>";
						$possible_danger_wtf=0;
						$last="PVAL";
					}
					if($last=='COL' and $token=='alias')
					{
						//Its In The Select so ignore it
						$last='';
					}
					if($tok_value=='operator' or $ignorenext==1)
					{
						if($ignorenext==1)
						{
							$ignorenext=0;
						}
						else
						{
							$ignorenext=1;
						}
					}
					else
					{
						if($token=='base_expr' and $last=='PVAL')
						{
							//its an actual Column use IT
								$value=$tok_value;
					
							//$possible_danger_wtf++;
							if($debug)
								echo "Column Found - $tok_value  <br>";				
							$last="PVAL";

						}
						if($token=='expr_type' and $tok_value=="const" and $last=='PVAL')
						{
							if($possible_danger_wtf==1 )
							{
								$possible_danger_wtf++;
							}
							$last='PVAL';
						}
						if($token=='base_expr' and $last=='PCOL')
						{
							//its an actual Column use IT
							$col = $tok_value;
							if($debug)
								echo "Column Found - $tok_value  <br>";
							$possible_danger_wtf=0;
							$last="pCOL";
						}
						if($token=='expr_type' and $tok_value=="colref" and $last=='PVAL')
						{
							$possible_danger_wtf=0;
							$last='PCOL';
						}
						if($token=='expr_type' and $tok_value=="const" and $last=='COL')
						{
							$last='VAL';
						}
						if($token=='expr_type' and $tok_value=="colref" and $last=='CVAL')
						{
							$last='cVAL';
						}				
						if($token=='expr_type' and $tok_value=="colref" and $last=='PCOL')
						{
							$last='CVAL';
						}
						if($token=='base_expr' and $last=='cVAL')
						{
							//2 Columns together
								$possible_danger=0;
								$possible_danger_wtf=0;
								$colref_cnt=0;
								$last='';

						}
						if($token=='expr_type' and $tok_value=="const" and $last=='')
						{
							if($possible_danger==1)
							{
								if($debug)
									echo "REAL DANGER";
								$res=false;
								return false;
							}
							else
							{
								$possible_danger=1;
							}
						}
						if($token=='base_expr' and $last=='PVAL')
						{
							$value = $tok_value;
						}
						if($token=='expr_type' and $tok_value=="const" and $last=='PVAL')
						{
							if($possible_danger_wtf==2)
							{
								if($debug)
									echo "Injection 1=1 Found";
								$res=false;
								return false;
							}
							else
							{
								$possible_danger_wtf++;
							}
						}
						if($token=='base_expr' and $last=='pCOL')
						{
							
							//its an actual Column use IT
							if($tok_value=='\';')
							{
								//This is to prevent Select * from userdb where keysearch =� x'; Drop table userdb;
								if($debug)
									echo "Injection Syntax Found";
								$res=false;
								return false;
							}
							$possible_danger=0;
							$possible_danger_wtf=0;
							$colref_cnt=0;
							$last="";
							if(col_check($col, $value, $table)==false)
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Failed...<br>";
									$res=false;
									return false;
									
								}
								else
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Passed...<br>";
									$res=true;
								}
						}
						if($token=='base_expr' and $last=='COL' and $colref_cnt==2)
						{
							$possible_danger=0;
							$possible_danger_wtf=0;
							$colref_cnt=0;
							$last='';
						}
						if($token=='base_expr' and $last=='COL')
						{
							//its an actual Column use IT
							$col = $tok_value;
							$colref_cnt++;
							$last="COL";

						}
						if($token=='base_expr' and $last=='LWR')
						{
							//its an actual Column use IT
							//$col = $tok_value;
							//$colref_cnt++;
							$last="COL";

						}
						if($token=='base_expr' and $last=='LEFT' and $checkforcomma==0)
						{
							$col=$tok_value['base_expr'];
							$checkforcomma=1;
							//its an actual Column use IT
							//$col = $tok_value;
							//$colref_cnt++;
							$last="LEFT";

						}
						if($token=='base_expr' and $last=='CVAL')
						{
							$col=$tok_value;
							//its an actual Column use IT
							if($tok_value=='\';')
							{
								//This is to prevent Select * from userdb where keysearch =� x'; Drop table userdb;
								if($debug)
									echo "Injection Syntax Found";
								$res=false;
								return false;
							}
							$possible_danger=0;
							$possible_danger_wtf=0;
							$colref_cnt=0;
							$last="";
							if(col_check($col, $value, $table)==false)
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Failed...<br>";
									$res=false;
									return false;
									
								}
								else
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Passed...<br>";
									$res=true;
								}
						}
						if($token=='base_expr' and $last=='cVAL')
						{
							//its an actual Column use IT
							if($tok_value=='\';')
							{
								//This is to prevent Select * from userdb where keysearch =� x'; Drop table userdb;
								if($debug)
									echo "Injection Syntax Found";
								$res=false;
								return false;
							}
							$possible_danger=0;
							$possible_danger_wtf=0;
								$colref_cnt=0;
							$col=$tok_value;
							$last="";
							if(col_check($col, $value, $table)==false)
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Failed...";
									$res=false;
									return false;
									
								}
								else
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Passed...";
									$res=true;
								}
						}
						if($token=='base_expr' and $last=='VAL')
						{
							//its an actual Column use IT
							if($tok_value=='\';')
							{
								//This is to prevent Select * from userdb where keysearch =� x'; Drop table userdb;
								if($debug)
									echo "Injection Syntax Found";
								$res=false;
								return false;
							}
							$value = $tok_value;
							if($debug)
								echo "Value Found - $tok_value  <br>";
							$possible_danger=0;
							$possible_danger_wtf=0;
							$colref_cnt=0;
							$last="";
							//echo "<b>Checking $col, $value</b>";
							if(col_check($col, $value, $table)==false)
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Failed... <br>";
									$res=false;
									return false;
									
								}
								else
								{
									if($debug)
										echo "Column ($col, $value, $table) Variable Check Passed...<br>";
									$res=true;
								}
						}
					}
				}
				if($res==true)
				{
					validSQL($tok_value, $index);
				}
			}
			
		}
		return $res;
	}
?>