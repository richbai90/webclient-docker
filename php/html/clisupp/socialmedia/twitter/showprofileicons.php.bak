<?php 
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');
	include('../clsSwSocialMedia.php');

$SwSocialMedia = new SwSocialMedia();
$rsUserAccounts = $SwSocialMedia->get_user();
while(!$rsUserAccounts->eof)
{
	if(gv('strFollowAction')=="follow")
	{
		?>
		<a style="text-decoration:none;" href="Javascript:followUser('infopanelstatsfollowoptions','<?php echo $rsUserAccounts->f('sm_acc_id')?>','<?php echo $rsUserAccounts->f('sm_acc_name')?>','<?php echo gv('sessid')?>','<?php echo gv('strFollowUserId')?>','<?php echo gv('strFollowUserName')?>');"><img width="30" border=0 src="<?php echo $rsUserAccounts->f('sm_acc_type_img')?>" alt="<?php echo $rsUserAccounts->f('sm_acc_name')?>">
		<?php 	}
	else if(gv('strFollowAction')=="unfollow")
	{
		?>
		<a style="text-decoration:none;" href="Javascript:unfollowUser('infopanelstatsfollowoptions','<?php echo $rsUserAccounts->f('sm_acc_id')?>','<?php echo $rsUserAccounts->f('sm_acc_name')?>','<?php echo gv('sessid')?>','<?php echo gv('strFollowUserId')?>','<?php echo gv('strFollowUserName')?>');"><img width="30" border=0 src="<?php echo $rsUserAccounts->f('sm_acc_type_img')?>" alt="<?php echo $rsUserAccounts->f('sm_acc_name')?>">
		<?php 	}
	else if(gv('strAction')=="retweet")
	{
		?>
		<!--<a style="text-decoration:none;" href="Javascript:send_retweet('<?php echo gv("msg_id")?>','<?php echo gv("msg_id")?>',<?php echo $rsUserAccounts->f('sm_acc_id')?>,'<?php  echo gv('sessid')?>');document.getElementById('profilepicker').style.display='none';"><img width="30" border=0 src="<?php echo $rsUserAccounts->f('sm_acc_type_img')?>" alt="<?php echo $rsUserAccounts->f('sm_acc_name')?>">-->
		<a style="text-decoration:none;" href="Javascript:send_retweet('<?php echo gv("msg_id")?>','<?php echo gv("msg_id")?>',<?php echo $rsUserAccounts->f('sm_acc_id')?>,'<?php echo gv('sessid')?>','true');"><img width="30" border=0 src="<?php echo $rsUserAccounts->f('sm_acc_type_img')?>" alt="<?php echo $rsUserAccounts->f('sm_acc_name')?>">

		<?php 	}

	$rsUserAccounts->movenext();
}

?>