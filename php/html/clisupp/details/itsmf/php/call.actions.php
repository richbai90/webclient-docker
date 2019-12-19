<?php 

	//-- if viewing in customer portal
	if($_SESSION['portalmode']=="CUSTOMER")
	{
		echo '<a href="#">Update Call</a>';
		exit;
	}


	if ($callstatus > 15)
	{
			?><a href="hsl:reactivatecall?callref=<?php  echo $callref; ?>"><img src="img/icons/call_react.gif" width="16" height="16" alt="" border="0" />Reactivate This Call</a><?php 
	}
	else
	{
		//-- always allow call update
		?>
			<a href="hsl:updatecall?callref=<?php  echo $callref; ?>"><img src="img/icons/call_update.gif" width="16" height="16" alt="" border="0" />Update Call</a>
		<?php 
		//-- Check call status
		switch ($callstatus)
		{
			case 1:
				//--Pending
				echo '<a href="hsl:transfercall?callref='.$callref.'"><img src="img/icons/call_assign.gif" width="16" height="16" alt="" border="0" />Transfer Call </a>';
				echo '<a href="hsl:holdcall?callref='.$callref.'"><img src="img/icons/call_hold.gif" width="16" height="16" alt="" border="0" />Place Call on Hold</a>';
				echo '<a href="hsl:closecall?callref='.$callref.'"><img src="img/icons/call_resolve.gif" width="16" height="16" alt="" border="0" />Resolve/Close Call</a>';
				break;
			case 2:
				//--Unassigned
				echo '<a href="hsl:acceptcall?callref='.$callref.'"><img src="img/icons/call_accept.gif" width="16" height="16" alt="" border="0" />Accept Call</a>';
				echo '<a href="hsl:transfercall?callref='.$callref.'"><img src="img/icons/call_assign.gif" width="16" height="16" alt="" border="0" />Transfer Call </a>';
				break;
			case 3:
				//--Unaccepted
				echo '<a href="hsl:acceptcall?callref='.$callref.'"><img src="img/icons/call_accept.gif" width="16" height="16" alt="" border="0" />Accept Call</a>';
				echo '<a href="hsl:transfercall?callref='.$callref.'"><img src="img/icons/call_assign.gif" width="16" height="16" alt="" border="0" />Transfer Call </a>';
				break;
			case 4:
				//-- onhold
				echo '<a href="hsl:holdcall?callref='.$callref.'"><img src="img/icons/call_offhold.gif" width="16" height="16" alt="" border="0" />Take Call Off Hold</a>';
				break;
			case 5:
				//-- Off Hold
				echo '<a href="hsl:acceptcall?callref='.$callref.'"><img src="img/icons/call_accept.gif" width="16" height="16" alt="" border="0" />Accept Call</a>';
				echo '<a href="hsl:transfercall?callref='.$callref.'"><img src="img/icons/call_assign.gif" width="16" height="16" alt="" border="0" />Transfer Call </a>';
				break;
			case 6:
				//-- Resolved
				echo '<a href="hsl:reactivatecall?callref='.$callref.'">Reactivate This Call</a>';
				echo '<a href="hsl:transfercall?callref='.$callref.'"><img src="img/icons/call_assign.gif" width="16" height="16" alt="" border="0" />Transfer Call </a>';
				echo '<a href="hsl:closecall?callref='.$callref.'"><img src="img/icons/call_resolve.gif" width="16" height="16" alt="" border="0" />Resolve/Close Call</a>';
				break;
			case 7:
				//--Deferred
				echo '<a href="hsl:acceptcall?callref='.$callref.'"><img src="img/icons/call_accept.gif" width="16" height="16" alt="" border="0" />Accept Call</a>';
				echo '<a href="hsl:transfercall?callref='.$callref.'"><img src="img/icons/call_assign.gif" width="16" height="16" alt="" border="0" />Transfer Call </a>';
				break;
			case 8:
				break;
			case 9:
				//-- Escalated Owner
				echo '<a href="hsl:acceptcall?callref='.$callref.'"><img src="img/icons/call_accept.gif" width="16" height="16" alt="" border="0" />Accept Call</a>';
				break;
			case 10:
				//-- Escalated Group
				echo '<a href="hsl:acceptcall?callref='.$callref.'"><img src="img/icons/call_accept.gif" width="16" height="16" alt="" border="0" />Accept Call</a>';
				break;
			case 11:
				//-- Escalated All
				echo '<a href="hsl:acceptcall?callref='.$callref.'"><img src="img/icons/call_accept.gif" width="16" height="16" alt="" border="0" />Accept Call</a>';
				break;
			default:
				echo '<a href="hsl:transfercall?callref='.$callref.'"><img src="img/icons/call_assign.gif" width="16" height="16" alt="" border="0" />Transfer Call</a>';
				echo '<a href="hsl:holdcall?callref='.$callref.'"><img src="img/icons/call_hold.gif" width="16" height="16" alt="" border="0" />Place Call on Hold</a>';
				break;		
		}//end switch
	
		//-- always allow cancel
		echo '<a href="hsl:cancelcall?callref='.$callref.'"><img src="img/icons/call_cancel.gif"  alt="" border="0" />Cancel Call</a>';
	}//end if $status > 15
?>

<!-- Can always -->
<br/><br/>
<a href="hsl:calldetails?callref=<?php echo $callref?>"><img src="img/icons/call_detail.gif" width="16" height="16" alt="" border="0" />Open Details</a>
<a href="hsl:printme"><img src="img/icons/call_print.gif" width="16" height="16" alt="" border="0" />Print This Page</a>
