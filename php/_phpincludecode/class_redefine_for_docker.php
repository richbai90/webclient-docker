<?php

if (!defined('_SW_WWW_PATH')) {
    define("_SW_WWW_PATH", "swsupport/");
}

if (!defined('_SWFS_WC_PATH')) {
    define("_SWFS_WC_PATH", "/var/www/html/webclient/");
}

if (!defined('_SWFS_INSTALL_PATH')) {
    define("_SWFS_INSTALL_PATH", "/usr/local/lib/sw/");
}

if (!defined('_SWFS_HTML_PATH')) {
    define("_SWFS_HTML_PATH", "/var/www/html/");
}

if (!defined('_SERVER_NAME')) {
    define("_SERVER_NAME", "host.docker.internal");
}

if (!defined('_SW_DEF_TZ')) {
    define('_SW_DEF_TZ', 'America/Denver');
}

$_SESSION['server_name'] = _SERVER_NAME;
$GLOBALS['portal_path'] = '/usr/lobal/lib/php/ITSM_DEFAULT/xmlmc';
$GLOBALS['instance_path'] = _SWFS_HTML_PATH;

if (!function_exists('generateCustomErrorString')) {
    function generateCustomErrorString($code, $msg)
    {
        $msg = $_POST['espQueryName'] . " : " . $msg;
        if ($_POST['asjson']) {
            $xmls = '{"@status":"fail","state":{"code":"' . $code . '","error":"' . $msg . '"}}';
        } else {
            $xmls = "<?xml version='1.0' encoding='utf-8'?>";
            $xmls .= '<methodCallResult status="fail">';
            $xmls .= '<state>';
            $xmls .= '<code>' . $code . '</code>';
            $xmls .= '<error>' . prepareForXml($msg) . '</error>';
            $xmls .= '</state>';
            $xmls .= '</methodCallResult>';
        }
        return $xmls;
    }

    function generateProcessSuccessString($code = "1", $msg = "", $response = "")
    {
        if ($_POST['asjson']) {
            $xmls = '{"@status":true,"params":{"rowsEffected":"1"},"data":{"metaData":{"code":{"dataType":"integer","tableName":"opencall","columnName":"code","dataSize":"12","displayName":"code"},"message":{"dataType":"varchar","tableName":"opencall","columnName":"message","dataSize":"1024","displayName":"message"},"response":{"dataType":"varchar","tableName":"opencall","columnName":"response","dataSize":"1000000","displayName":"response"}},"rowData":{"row":{"code":"' . $code . '","message":"' . $msg . '","response":"' . $response . '"}}}}';
        } else {
            $xmls = "<?xml version='1.0' encoding='utf-8'?>";
            $xmls .= '<methodCallResult status="ok">';
            $xmls .= '<params>';
            $xmls .= '<rowsEffected>1</rowsEffected>';
            $xmls .= '</params>';
            $xmls .= '<data>';
            $xmls .= '<metaData>';
            $xmls .= '<code>';
            $xmls .= '<dataType>varchar</dataType>';
            $xmls .= '<tableName>opencall</tableName>';
            $xmls .= '<columnName>code</columnName>';
            $xmls .= '<dataSize>12</dataSize>';
            $xmls .= '<displayName>code</displayName>';
            $xmls .= '</code>';
            $xmls .= '<message>';
            $xmls .= '<dataType>varchar</dataType>';
            $xmls .= '<tableName>opencall</tableName>';
            $xmls .= '<columnName>message</columnName>';
            $xmls .= '<dataSize>1024</dataSize>';
            $xmls .= '<displayName>message</displayName>';
            $xmls .= '</message>';
            $xmls .= '<response>';
            $xmls .= '<dataType>varchar</dataType>';
            $xmls .= '<tableName>opencall</tableName>';
            $xmls .= '<columnName>response</columnName>';
            $xmls .= '<dataSize>1000000</dataSize>';
            $xmls .= '<displayName>Message</displayName>';
            $xmls .= '</response>';
            $xmls .= '</metaData>';
            $xmls .= '<rowData>';
            $xmls .= '<row>';
            $xmls .= '<code>' . $code . '</code>';
            $xmls .= '<message>' . $msg . '</message>';
            $xmls .= '<response>' . $response . '</response>';
            $xmls .= '</row>';
            $xmls .= '</rowData>';
            $xmls .= '</data>';
            $xmls .= '</methodCallResult>';
        }
        return $xmls;
    }

    function generateRowCountString($intCount = 0)
    {
        if ($_POST['asjson']) {
            $xmls = '{"@status":true,"params":{"rowsEffected":"1"},"data":{"rowData":{"row":{"count":"' . $intCount . '"}}}}';
        } else {

            $xmls = "<?xml version='1.0' encoding='utf-8'?>";
            $xmls .= '<methodCallResult status="ok">';
            $xmls .= '<params>';
            $xmls .= '<rowsEffected>1</rowsEffected>';
            $xmls .= '</params>';
            $xmls .= '<data>';
            $xmls .= '<rowData>';
            $xmls .= '<row>';
            $xmls .= '<count>' . $intCount . '</count>';
            $xmls .= '</row>';
            $xmls .= '</rowData>';
            $xmls .= '</data>';
            $xmls .= '</methodCallResult>';
        }
        return $xmls;
    }

    function generateSuccessString($rowsAffected = 0)
    {
        if ($_POST['asjson']) {
            $xmls = '{"@status":"true","params":{"rowsEffected":"' . $rowsAffected . '"},"data":{}}';
        } else {
            $xmls = "<?xml version='1.0' encoding='utf-8'?>";
            $xmls .= '<methodCallResult status="ok">';
            $xmls .= '<params>';
            $xmls .= '<rowsEffected>' . $rowsAffected . '</rowsEffected>';
            $xmls .= '</params>';
            $xmls .= '<data>';
            $xmls .= '<rowData>';
            $xmls .= '</rowData>';
            $xmls .= '</data>';
            $xmls .= '</methodCallResult>';
        }
        return $xmls;
    }

}

function _PREP_FILE_PATH($path)
{
    $path = strtolower(preg_replace("/(?<!:)\\/\\//", "/", str_replace('\\', '/', $path)));
    if (defined('_SWFS_HTML_PATH')) {
        if (preg_match("~^/var/www/html/(?!webclient)~", $path)) {
            $path = preg_replace("~^/var/www/html~", _SWFS_HTML_PATH, $path);
        } else if (strpos($path, "Supportworks Server/html/") !== false) {
            $path = _SWFS_HTML_PATH . substr($path, strpos($path, 'html/') + strlen('html/'), strlen($path) - 1);
        } else if (strPos($path, "Supportworks Server/") !== false) {
            $path = _SWFS_INSTALL_PATH . substr($path, strpos($path, 'Supportworks Server/') + strlen('supportworks server/'), strlen($path) - 1);
        } else if (strPos($path, "data/_dd_data") !== false) {
            $path = _SWFS_INSTALL_PATH . "data/_dd_data/" . substr($path, strpos($path, "data/_dd_data/") + strlen("data/_dd_data/"));
        } else if (preg_match("~conf/.+\.xml$~", $path)) {
            $path = preg_replace("~.+(conf/.+xml)$~", _SWFS_INSTALL_PATH . "$1", $path);
        }
    }
    return preg_replace("/(?<!:)\\/\\//", "/", $path);
}

class RedefineForDocker
{
    public static $initialized = false;

    public static function init()
    {
        if (self::$initialized === true) {
            return;
        }
        $newFileGetContentsCode = self::generateNewCode('$filename', '_file_get_contents');
        $newFileExistsCode = self::generateNewCode('$filename', '_file_exists');
        $newFileSizeCode = self::generateNewCode('$filename', '_filesize');
        $newFileTypeCode = self::generateNewCode('$filename', '_filetype');
        $newFopenCode = self::generateNewCode('$filename', '_fopen', ['$mode']);
        $newIsDirCode = self::generateNewCode('$filename', '_is_dir');
        $newIsFileCode = self::generateNewCode('$filename', '_is_file');
        $newReadfileCode = self::generateNewCode('$filename', '_readfile');
        $newOpendirCode = self::generateNewCode('$path', '_opendir');
        $newMkdirCode = self::generateNewCode('$pathname', '_mkdir', ['$mode']);
        $newScandirCode = self::generateNewCode('$directory', '_scandir');
        $newPathinfoCode = self::generateNewCode('$path', '_pathinfo', ['$options']);
        $newRealpathCode = self::generateNewCode('$path', '_realpath');
        $newBasenameCode = self::generateNewCode('$path', '_basename');
        $newDirnameCode = self::generateNewCode('$path', '_dirname');
        $newDirCode = self::generateNewCode('$directory', '_dir');
        $newCopyCode = <<<'php'
$source = _PREP_FILE_PATH($source);
$dest = _PREP_FILE_PATH($dest);
return _copy($source, $dest);
php;

        self::hookFunction('_file_get_contents', ['$filename'], $newFileGetContentsCode);
        self::hookFunction('_file_exists', ['$filename'], $newFileExistsCode);
        self::hookFunction('_filesize', ['$filename'], $newFileSizeCode);
        self::hookFunction('_filetype', ['$filename'], $newFileTypeCode);
        self::hookFunction('_fopen', ['$filename', '$mode'], $newFopenCode);
        self::hookFunction('_is_dir', ['$filename'], $newIsDirCode);
        self::hookFunction('_is_file', ['$filename'], $newIsFileCode);
        self::hookFunction('_readfile', ['$filename'], $newReadfileCode);
        self::hookFunction('_opendir', ['$path'], $newOpendirCode);
        self::hookFunction('_mkdir', ['$pathname', '$mode=0777'], $newMkdirCode);
        self::hookFunction('_scandir', ['$directory'], $newScandirCode);
        self::hookFunction('_pathinfo', ['$path', '$options'], $newPathinfoCode);
        self::hookFunction('_realpath', ['$path'], $newRealpathCode);
        self::hookFunction('_basename', ['$path'], $newBasenameCode);
        self::hookFunction('_copy', ['$source', '$dest'], $newCopyCode);
        self::hookFunction('_dirname', ['$path'], $newDirnameCode);
        self::hookFunction('_dir', ['$directory'], $newDirCode);

        self::$initialized = true;

    }
    public static function generateNewCode($varName, $funcToCall, $addtlVars = [])
    {
        $varString = implode(",", $addtlVars);
        if ($varString != "") {
            $varString = "," . $varString;
        }
        return <<<php
$varName = _PREP_FILE_PATH($varName);
return $funcToCall($varName$varString);
php;
    }

    public static function hookFunction($newFnName, $newFnVars, $newFnCode)
    {
        runkit_function_copy(ltrim($newFnName, '_'), $newFnName);
        runkit_function_redefine(ltrim($newFnName, '_'), implode($newFnVars, ','), $newFnCode);
    }

    public static function standardizeXmlmc()
    {
        runkit_import("class_standardized_xmlmc.php",RUNKIT_IMPORT_FUNCTIONS | RUNKIT_IMPORT_CLASSES | RUNKIT_IMPORT_OVERRIDE);

    }
}
