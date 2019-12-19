<div style="overflow-y:auto;overflow-x:hidden;width:100%;height:100%;">
<table class="form-dataTable" style="width:48%">
	<thead>
		<tr>
			<th colspan="2" align="left" >Workflow Information</th>
		</tr>
	</thead>
	<tfoot>
		<tr>
			<td >&nbsp;</td>
			<td >&nbsp;</td>
		</tr>	
	</tfoot>
	<tbody>
		<tr>
			<td class="dataLabel" style="width:100px;">Workflow</td>
			<td class="dataValue"><?php echo $rsCall->xf('bpm_workflow_id')?></td>
		</tr>
		<tr>
			<td class="dataLabel">Stage</td>
			<td class="dataValue"><?php echo $rsCall->xf('bpm_stage_title')?></td>
			
		</tr>
		<tr>
			<td class="dataLabel">BPM Status</td>
			<td class="dataValue"><?php echo $rsCall->xf('bpm_status_id')?></td>
			
		</tr>
	</tbody>
</table>
<?php 
$intExtDataHeight = 260;
if(isset($rsProgress))
{
	$intExtDataHeight=160;
    $progress     = 0;
    $progressFail = $rsCall->xf('bpm_progress_fail') > 0;
    $progressId   = $rsCall->xf('bpm_progress');
    if($progressId > 0)
    {
		$progress = $rsCall->xf('bpm_progress_perc');
    }
?>
<table class="form-dataTable" style="width:100%;">
    <thead>
        <tr>
            <th >
                Workflow Progress <?php echo  htmlentities($progress.'%', ENT_QUOTES,'UTF-8'); ?>
                <table width="100%" style="border-spacing: 1px; border-collapse: separate;margin: 0;"><tr>
                <?php                 if($progressId > 0)
                {
                    $bg = '#00CC00';
                }
                else
                {
					//-- F0089908 first progress stage not in progress
                    $bg = '#CCCC00';
                }
				$intCurrentProgress = 0;
                foreach($rsProgress->recorddata as $row)
                {
                    if($progressFail)
                    {
                        if($progressId == $row['pk_progid']->value)
                        {
                            $bg = '#CC0000';
                        }
                        elseif($bg == '#CC0000')
                        {
                            $bg = '#DDDDDD';
                        }
                    }
                    ?>
                    <th style="width: <?php echo  $row['percentage']->value -$intCurrentProgress; ?>%; background: <?php echo  $bg ?>; font-size:1px; padding: 2px 0;" title="<?php echo  htmlentities($row['title']->value, ENT_QUOTES,'UTF-8') ?>">&nbsp;</th>
                    <?php 					$intCurrentProgress = $row['percentage']->value;
                    if(!$progressFail)
                    {
                        if($progressId == $row['pk_progid']->value)
                        {
                            $bg = '#CCCC00';
                        }
                        elseif($bg == '#CCCC00')
                        {
                            $bg = '#DDDDDD';
                        }
                    }
                }
                ?>
                </tr></table>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr><td>
        <?php         $completeDescription = '';
        $workingDescription  = '';
        $failureDescription  = '';
        if($progressId > 0)
        {
            $bg  = '#00CC00';
            $src = 'img/icons/24/Coins Check.png';
        }
        else
        {
			//-- F0089908 first progress stage not in progress
            $bg  = '#CCCC00';
            $src = 'img/icons/24/Coins Totals.png';            
        }
        $i = 0;
        foreach($rsProgress->recorddata as $row)
        {
            if($progressFail)
            {
                if($progressId == $row['pk_progid']->value)
                {
                    $bg  = '#CC0000';
                    $src = 'img/icons/24/Coins Error.png';
                    $completeDescription = '';
                    $workingDescription  = '';
                    $failureDescription  = $row['message_failure']->value;
                }
                elseif($bg == '#CC0000')
                {
                    $bg  = '#DDDDDD';
                    $src = 'img/icons/24/Coins.png';
                }
            }
            if($i > 0)
            {
            ?>
            <div style="float: left; margin: 22px 2px 2px -1px; padding: 0; white-space: nowrap; height: 3.4em;">
                <span style="display: block; color: <?php echo  $bg ?>;font-weight: bold;font-size: 200%; line-height: 150%;">&rarr;</span>
            </div>
            <?php             }
            $i++;
            ?>
            <div style="float: left; border: 1px solid <?php echo  $bg ?>; margin: 22px 0 2px 0; padding: 3px; white-space: nowrap; position:relative; text-align: center;">
                <img style="display: block; position:relative; width: 24px; height: 24px; margin: -20px 0 -4px 0;" src="<?php echo  $src; ?>" />
                <span style="display: block; padding: 2px 5px 2px 5px;"><?php print nl2br(htmlentities(str_multiline($row['title']->value, $didWrap), ENT_QUOTES,'UTF-8'));  if(!$didWrap){ ?><br>&nbsp;<?php } ?></span>
            </div>
            <?php             if(!$progressFail)
            {
                if($progressId == $row['pk_progid']->value)
                {
                    $bg  = '#CCCC00';
                    $src = 'img/icons/24/Coins Totals.png';
                    $completeDescription = $row['message_complete']->value;
                }
                elseif($bg == '#CCCC00')
                {
                    $bg  = '#DDDDDD';
                    $src = 'img/icons/24/Coins.png';
                    $workingDescription = $row['message_working']->value;
                }
            }
        }
        ?>
        <div style="clear:both; padding: 10px 0;"/>
            <?php if($completeDescription){ 
				$intExtDataHeight=130;
			?>
            <p style="margin: 10px 0;padding: 0 0 0 20px;clear: both;position: relative;">
                <span style="position: absolute;color: #00CC00; font-weight: bold; top: 0; left: -15px;">&bull;</span>
                <?php echo  nl2br(htmlentities($completeDescription, ENT_QUOTES,'UTF-8')); ?>
            </p>
            <?php } ?>
            <?php if($workingDescription){ 
				$intExtDataHeight=90;
			?>
            <p style="margin: 10px 0;padding: 0 0 0 20px;clear: both;position: relative;">
                <span style="position: absolute;color: #CCCC00; font-weight: bold; top: 0; left: -15px;">&bull;</span>
                <?php echo  nl2br(htmlentities($workingDescription, ENT_QUOTES,'UTF-8')); ?>
            </p>
            <?php } ?>
            <?php if($failureDescription){ 
				$intExtDataHeight=90;
			?>
            <p style="margin: 10px 0;padding: 0 0 0 20px;clear: both;position: relative;">
                <span style="position: absolute;color: #CC0000; font-weight: bold; top: 0; left: -15px;">&bull;</span>
                <?php echo  nl2br(htmlentities($failureDescription, ENT_QUOTES,'UTF-8')); ?>
            </p>
            <?php } ?>
        </div>
        </td></tr>
    </tbody>
</table>
<?php }
?>
</div>
