<?php
	class classPicklist
	{
		var $xmlRoot = null;
		var $tablename = "";
		var $keycolname = "";
		var $valid = true;

		function classPicklist($strDefinitionName)
		{
			$xmlRoot = $this->_load_xml($strDefinitionName);
			if(is_object($xmlRoot))
			{
				$this->xmlRoot = $xmlRoot;
				$this->_initialise();
			}
			else
			{
				$this->valid=false;
			}
		}
		
		//--
		//-- draw out the picklist - html table from which a selection can be made
		function draw_picklist($strColName, $strColValue)
		{
			$strHTML = "<table width='100%' height='100%' class='picklist' border='0' cellspacing='0' cellspadding='0'>";
			$strHTML .=	 $this->_draw_header();
			$strHTML .=	 $this->_draw_data($strColName,$strColValue);
			$strHTML .=	 $this->_draw_footer();
			$strHTML .= "</table>";

			return $strHTML;
		}

		//--
		//-- private functions

		//-- load xml def
		function _load_xml($strXmlDef)
		{
			$xmlfile = file_get_contents($GLOBALS['instance_path']."xml/picklists/".$strXmlDef.".xml");
			if($xmlfile)
			{
				//-- create dom instance of the xml file
				$xmlDoc = domxml_open_mem($xmlfile);
				$root = $xmlDoc->document_element();
				return $root;		
			}
			else
			{
				return null;
			}
		}

		function _initialise()
		{
			//-- store columns
			$this->table = $this->xmlRoot->get_elements_by_tagname('table');
			$this->table = $this->table[0];
			$this->columns = $this->xmlRoot->get_elements_by_tagname('column');

			$this->tablename = $this->table->get_content();
			$this->keycolname = get_node_att($this->table,"returnkey");

		}

		//--draw out header html
		function _draw_header()
		{
			$strHeader = "	<thead>";
			$strHeader .= "		<tr>";
			//-- get columns
			foreach($this->columns as $aPos => $aColumn)
			{
				$strName = get_node_att($aColumn,"dbname");
				$strHidden = (get_node_att($aColumn,"hidden")=="1")?" style='display:none;' ":"";
				$strText = $aColumn->get_content();
				$strHeader .= "			<th colname='". $strText . "' $strHidden align='left'>".$strText."</th>";
			}
			$strHeader .= "		</tr>";
			$strHeader .= "	</thead>";
			return 	$strHeader;
		}

		//--draw out the data
		function _draw_data($filterCol, $filterValue)
		{
			$strHTML="";
			//-- connect to db
			$strDSN = get_node_att($this->table,"dsn");
			$strUID = get_node_att($this->table,"uid");
			$strPWD = get_node_att($this->table,"pwd");
			$strTable = $this->table->get_content();

			$tableODBC = database_connect($strDSN, $strUID, $strPWD);
			if($tableODBC==false)
			{
				$strHTML = "Could not connect to the DSN [".$strDSN."]. Please contact your Supportworks administrator.";
			}
			else
			{
				//-- construct select and filter and order
				$strSQL = "select * from $strTable";
				if($filterCol!="")
				{	
					$strFilter = $filterCol ." like '" . $filterValue . "%'";
					$strSQL .= " where " .parse_context_vars($strFilter)  ;
				}
				$recSet = $tableODBC->Query($strSQL,true);
				if(!$recSet)
				{
					//$strHTML = "Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator<br><br>" . $strSQL . "";


					//-- nwj 28.11.2008 - remove message that shows sql query as may be security risk.
					$strHTML = "<center>Could not run SQL query required for this picklist. Please contact your Supportworks administrator<br></center>";
					//$strHTML = "<center>Could not run SQL query on DSN [".$strDSN."]. Please contact your Supportworks administrator<br><br>" . $strSQL . "</center>";
					if(isset($_SESSION['_DISPLAY_ERROR'])&&$_SESSION['_DISPLAY_ERROR']==true)
					{
						$strHTML .="<br><br><center>DSN : [".$strDSN."] <br> SQL : " . $strSQL . "</center>";
					}

				}
				else
				{
					//-- loop through and create data (check fields for conversion)
					$strHTML = "<tbody id='tbl_picklist'>";
					while (!$recSet->eof) 
					{
						$strHTML .= "<tr onClick='onclick_picklist_row(this)' onDblClick='ondoubleclick_picklist_row(this)' >";
						//-- for each column we want to display
						foreach($this->columns as $aPos => $aColumn)
						{
							$strName = get_node_att($aColumn,"dbname");
							$strHidden = (get_node_att($aColumn,"hidden")=="1")?" style='display:none;' ":"";
							$strValue = $recSet->f($strName);
							$strHTML .= "<td $strHidden' dbname='".$strName."' dbvalue='".$strValue."'>";
							$strHTML .= $strValue;
							$strHTML .= "</td>";
						}
						$strHTML .= "</tr>";

						$recSet->movenext();
					}
					$strHTML .= "</tbody>";
				}
			}
			return $strHTML;

		}

		//--draw out the footer
		function _draw_footer()
		{
			$strFooter = "	<tfoot>";
			$strFooter .= "		<tr>";
			$strFooter .= "			<td colspan='%' height='100%'></td>";
			$strFooter .= "		</tr>";
			$strFooter .= "	</tfoot>";
			return 	$strFooter;

		}
	}
?>