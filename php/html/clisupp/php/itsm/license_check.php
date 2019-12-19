<?php


/*
JPG - Carefull changing the order of the includes. Result approver_license_file may be affected
*/

include_once( "./approver_license_file.swp" );

$licenses = get_approver_licenses( );
header( "Content-type: text/xml" );
$licenses_in_use = $licenses;// + 100;


// ODBC DETAILS

include_once('stdinclude.php');
include_once('swdatabaseaccess.php');
include_once('swhelpdeskcall.php');

//Getting the path of the supportworks server
$swinstallpath = sw_getcfgstring("InstallPath");
//Getting the path of the odbc's details executable
$odbc_details = $swinstallpath."\bin\SwCredSupp.exe";
//Getting the details from the ODBC connection
exec($odbc_details,$out);
//Extractig ODBC details
$decoded = base64_decode($out[0]);
$splited = explode("\t",$decoded);
//Storaring APP User
$swuid = $splited[3];
//Storaring APP Password
$swpwd = $splited[4];


//$con = mysql_connect( "localhost:5002", 'root', '' );
$con = mysql_connect( "localhost:5002", $swuid, $swpwd );


if ( mysql_select_db( "sw_systemdb", $con ) )
{
    $res = mysql_query( "SELECT COUNT(*) AS cnt FROM licensed_approvers", $con );

    if ( $row = mysql_fetch_array( $res ) )
    {
        $licenses_in_use = (int)$row['cnt'];
    }
}

$mdCheck = "";
if ( $licenses_in_use <= $licenses && isset( $_POST['e'], $_POST['n'], $_POST['c'] ) )
{
    $time_to_check = (int)$_POST['e'];
    $t = time( );
    if ( abs( $t - $time_to_check ) < 3700 )
    {
        $res = mysql_query( "SELECT COUNT(*) AS cnt FROM licensed_approvers WHERE id = '".str_replace( "'", "''", $_POST['n'] )."'", $con );
        if ( ( $row = mysql_fetch_array( $res ) ) && 1 == $row['cnt'] )
        {
            $mdCheck = "<md_check>".md5( $_POST['e']."LiCeNsEd".$_POST['c']."ApPr0v3r".$_POST['n'] )."</md_check>";
        }
    }
}
echo "<params>";
echo $mdCheck;
echo "<licensed>".$licenses."</licensed>";
echo "<licenses_in_use>".$licenses_in_use."</licenses_in_use>";
echo "</params>";
exit( );
?>
