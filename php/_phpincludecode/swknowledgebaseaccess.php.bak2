<?php

define("KB_QUERYTYPE_NATURAL_LANGUAGE",			1);			// Natural Language Query 
define("KB_QUERYTYPE_KEYWORD_ANY",				2);			// Keyword search, any words match
define("KB_QUERYTYPE_KEYWORD_ALL",				3);			// Keyword search, all words must match

define("KB_QUERYTYPE_FLAG_TITLE",				0x00010000);
define("KB_QUERYTYPE_FLAG_KEYWORDS",			0x00020000);
define("KB_QUERYTYPE_FLAG_PROBLEM",				0x00040000);
define("KB_QUERYTYPE_FLAG_SOLUTION",			0x00080000);

define("KBDOC_FLAG_CUSTOMERVISIBLE",			1);			// The customer can access the document

define("KBDOC_STATUS_COMPOSE",					0);			// Composing a new message
define("KBDOC_STATUS_AWAITINGVALIDATION", 		1);			// Awaiting publication approval
define("KBDOC_STATUS_VALIDATED",				2);			// Validated for publishing, now published
define("KBDOC_STATUS_WAITINGINDEX",				3);			// Waiting for the document to be indexed

define("KBDOC_CATALOG_CLOSEDCALLS",				1);			// All Kb documents created from a helpdesk call
define("KBDOC_CATALOG_FAQ",						2);			// All Kb Documents created as am FAQ
define("KBDOC_CATALOG_ONLINEDOCUMENTS",			3);			// All Kb Support-Works related documents
define("KBDOC_CATALOG_USERDOCUMENTS1",			4);			// All external Kb documents added by the user
define("KBDOC_CATALOG_USERDOCUMENTS2",			5);			// All external Kb documents added by the user
define("KBDOC_CATALOG_USERDOCUMENTS3",			6);			// All external Kb documents added by the user
define("KBDOC_CATALOG_USERDOCUMENTS4",			7);			// All external Kb documents added by the user
define("KBDOC_CATALOG_USERDOCUMENTS5",			8);			// All external Kb documents added by the user

define("KBDOC_CATALOG_DELETEDDOCUMENTS",		100000);	// All external Kb documents added by the user
define("KBDOC_CATALOG_CALLSWAITINGPUBLICATION",	100002);	// All calls marked waiting. (kbunpubcalls table)

class CSwKnowldgeBaseAccess extends CSwLocalDbConnection
{
	var $HasRelevence;
	var $con;

	// 27/10/2001 - Hornbill Systems Limited - by Gerry Sweeney
	// This class encapsulates the access to the Support-Works KnowledgeBase database tables

	// 12/11/04 Glen: Modified this method to accept additional true/false valueto cater for Analyst Sessions from the Analyst Portal
	function KbQuery($Query, $QueryType, $Catalog = 0, $MaxResults = 100, $KeywordFlags = 0xFFFF0000, $analyst = false)
	{
		$Columns = "*";

		// No relevance by default
		$this->HasRelevence = FALSE;

		if($QueryType == KB_QUERYTYPE_KEYWORD_ANY || $QueryType == KB_QUERYTYPE_KEYWORD_ALL)
		{
			// We need a list of keywords
			$Keywords = explode(" ", $Query);
		}

		switch($QueryType)
		{
		case KB_QUERYTYPE_NATURAL_LANGUAGE:
			$sql = "SELECT ";
			$sql .= " MATCH (Title,Keywords,Problem,Solution) AGAINST ('";
			$sql .= $Query;
			$sql .= "') AS Relevance";
//DTE Removed these as the query was invalid
//			$sql .= ", ";
//			$sql .= $Columns;
// Hardcoded every column in just in case we need it.
			$sql .= ", docref";
			$sql .= ", docflags";
			$sql .= ", docstatus";
			$sql .= ", catalog";
			$sql .= ", docdate";
			$sql .= ", callref";
			$sql .= ", callprobcode";
			$sql .= ", otherrefs";
			$sql .= ", author";
			$sql .= ", keywords";
			$sql .= ", title";
			$sql .= ", problem";
			$sql .= ", solution";
			$sql .= ", template";
			$sql .= ", sourcepath";
			$sql .= ", sourcedate";
			$sql .= " FROM ";
			$sql .= "kbdocuments";
			$sql .= " WHERE Catalog <> ";
			$sql .= KBDOC_CATALOG_DELETEDDOCUMENTS;
			// 12/11/04 Glen: Modified this connection code to cater for Analyst Sessions from the Analyst Portal
			if (!$analyst)
			{
				$sql .= " AND DocFlags&";
				$sql .= KBDOC_FLAG_CUSTOMERVISIBLE;
			}
			$sql .= " AND ";

			if($Catalog)
				$sql .= " Catalog = " . $Catalog . " AND ";

			$sql .= " MATCH (Title,Keywords,Problem,Solution) AGAINST ('";
			$sql .= $Query;
			$sql .= "') ";

			if($MaxResults)
				$sql .= "LIMIT " . $MaxResults;
			$this->HasRelevence = TRUE;

			break;

		case KB_QUERYTYPE_KEYWORD_ANY:
			$Join = " OR ";
			$this->HasRelevence = FALSE;
			break;

		case KB_QUERYTYPE_KEYWORD_ALL:
			$Join = " AND ";
			$this->HasRelevence = FALSE;
			break;
		}

		if(strlen($Join))
		{
			// Build a keyword search SQL statement
			$sql = "SELECT ";
			$sql .= $Columns;
			$sql .= " FROM ";
			$sql .= "kbdocuments";
			$sql .= " WHERE  Catalog <> ";
			$sql .= KBDOC_CATALOG_DELETEDDOCUMENTS;
			// 12/11/04 Glen: Modified this connection code to cater for Analyst Sessions from the Analyst Portal
			if (!$analyst)
			{
				$sql .= " AND DocFlags&";
				$sql .= KBDOC_FLAG_CUSTOMERVISIBLE;
			}
			$sql .= " AND ";

			if($Catalog)
				$sql .= "Catalog = " . $Catalog . " AND (";

			for($x = 0; $x < sizeof($Keywords); $x++)
			{
				$Keyword = $Keywords[$x];
				if($x > 0)
					$sql .= $Join;
				else
					$sql .= " (";

				$sql .= " (";

				$TmpJoin = "";

				if($KeywordFlags&KB_QUERYTYPE_FLAG_TITLE)
				{
					$sql .= $TmpJoin;
					$sql .= "Title LIKE '%";
					$sql .= $Keyword;
					$sql .= "%'";
					$TmpJoin = " OR ";
				}

				if($KeywordFlags&KB_QUERYTYPE_FLAG_KEYWORDS)
				{
					$sql .= $TmpJoin;
					$sql .= "Keywords LIKE '%";
					$sql .= $Keyword;
					$sql .= "%'";
					$TmpJoin = " OR ";
				}

				if($KeywordFlags&KB_QUERYTYPE_FLAG_PROBLEM)
				{
					$sql .= $TmpJoin;
					$sql .= "Problem LIKE '%";
					$sql .= $Keyword;
					$sql .= "%'";
					$TmpJoin = " OR ";
				}

				if($KeywordFlags&KB_QUERYTYPE_FLAG_SOLUTION)
				{
					$sql .= $TmpJoin;
					$sql .= "Solution LIKE '%";
					$sql .= $Keyword;
					$sql .= "%'";
					$TmpJoin = " OR ";
				}
				$sql .= " ) ";
			}
			$sql .= " ) ";
	
			if($Catalog)
				$sql .= " ) ";

			if($MaxResults)
				$sql .= " LIMIT " . $MaxResults;
		}

		// Issue the SQL Query
		return $this->Query($sql);
	}

	function ListKnowledgeBaseCatalogs($session, &$catalogs)
	{
		// open a connection to the helpdesk server
		// Use the $PHP_USER and $PHP_PASSWORD if appropriate

		// 12/11/04 Glen: Modified this connection code to cater for Analyst Sessions from the Analyst Portal
		if ($session->connector_instance) $con = swhd_wcopen($session->server_name, $session->connector_instance);
		else $con = swhd_opensession($session->server_name,$session->sessionid);

		if($con < 33)
		{
			if(swhd_sendcommand($con, "LIST KNOWLEDGEBASE CATALOGS"))
			{
				$ret = swhd_getlastdata($con);	// Get the response
				$list = explode("\r", $ret);
				for($x = 0; $x < sizeof($list); $x++)
				{
					$item = explode("\t", $list[$x]);
					if(strlen($item[0]) && strlen($item[2]))
						$catalogs[$item[0]] = trim($item[2]);
				}
			}
			swhd_close($con);
		}
	}

	function ConnectApi($session)
	{
		// Use the $PHP_USER and $PHP_PASSWORD if appropriate
		// 12/11/04 Glen: Modified this connection code to cater for Analyst Sessions from the Analyst Portal
		if ($session->connector_instance) $this->con = swhd_wcopen($session->server_name, $session->connector_instance);
		else $this->con = swhd_opensession($session->server_name,$session->sessionid);
		
		if($this->con < 33)
			return TRUE;

		return FALSE;
	}

	function CloseApi()
	{
		swhd_close($this->con);
	}

	function LookupDocumentURL($session, $docref, &$docurl)
	{
		if(swhd_sendcommand($this->con, "GET KNOWLEDGEBSE DOCUMENT URL " . $docref))
		{
			$docurl = trim(substr(swhd_getlastresponse($this->con), 4));

			// Make sure we are looking at the right server and page
			$docurl = str_replace("/clisupp/details/swkbase.php", "/" . $session->connector_instance . "/kbasedetails.php", $docurl);

			// We currently hard-code the instance ID at the moment '/sw'
			$docurl = str_replace("&[app.webroot]", "http://" . _SERVER_NAME . "/sw", $docurl);

			// Get rid of the sessionid, it is not needed in the web connector
			if(strpos($docurl, "sessid="))
				$docurl = substr($docurl, 0, strpos($docurl, "sessid="));
		}
		else print "Can't get URL";
	}
}

?>
