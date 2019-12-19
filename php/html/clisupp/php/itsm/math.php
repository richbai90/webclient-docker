<?php 
//-- permorm test - just evaluate it and return it


$string = $in_test;
$str = 'This is a $string with my';
echo $str. "\n";
eval("\$str = (\"$str\")?true:false;");
echo $str. "\n";


$equation = "return $in_test;";
//echo $equation;
$strEval = eval($equation);

//header("Content-Type: text/xml");
?>
<params>
 <mathres><?php echo $strEval?></mathres>
</params>

