<?php 
	include('_wcconfig.php');
	include('swanalystsessionmanager.php');

	$session = new CSwAnalystSessionManager("web_client", _SERVER_NAME);
	if($session->OpenSession($SwAnalystWebSession) != SW_SESSION_OK)
	{
		echo "-ERR Bad Session id";
		exit;
	}

	echo "+OK ";
	echo "SessionID=" . $session->sessionid . "&";
	echo "AnalystName=" . $config_analystname . "&";
	echo "AnalystID=" . $config_analystid . "&";
	echo "GroupID=" . $config_groupid . "&";
	echo "DataDictionary=" . $config_dd . "&";
	echo "DateTimeFormat=" . $config_datetimefmt . "&";
	echo "DateFormat=" . $config_datefmt . "&";
	echo "TimeFormat=" . $config_timefmt . "&";
	echo "CurrencySymbol=" . $config_currencysymbol . "&";
	echo "TimeZone=" . $config_timezone . "&";
	//	<FN dt=16-Oct-2006> $GLOBALS['config_tz'] is completely irrelevant when displaying timestamps from the past!
	//	The Ax ctrl must use only TimeZone
	//echo "TimeZoneOffset=" . $config_tz . "&";
	//	</FN>
	echo "PrivLevel=" . $config_privlevel . "&";
	echo "HttpPort=" . $session->server_port . "&";
	echo "sla=" . $config_sla . "&";
	echo "slb=" . $config_slb . "&";
	echo "slc=" . $config_slc . "&";
	echo "sld=" . $config_sld . "&";
	echo "sle=" . $config_sle . "&";
	echo "slf=" . $config_slf . "&";
	echo "slg=" . $config_slg . "&";
	echo "slh=" . $config_slh . "&";
	echo "maxbackdate=" . $config_maxbackdateperiod. "&";
	echo "userdefaults=" . $config_userdefaults. "&";
	echo "oracleinuse=" . $config_oracleinuse;
?>