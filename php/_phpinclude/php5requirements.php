<?php
require_once 'itsm_default/xmlmc/installpath.php';
require_once 'class_redefine_for_docker.php';

// redefine all the functions that access the file path
RedefineForDocker::init();

if (version_compare(PHP_VERSION, '5', '>=')) {
    require_once 'domxml-php4-to-php5.php'; //Load the PHP5 converter
    require_once 'swphpdll.php'; //load the php5 converter
}
