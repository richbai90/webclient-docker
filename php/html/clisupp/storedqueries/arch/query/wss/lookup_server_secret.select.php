<?php
error_reporting(E_ALL);
include 'php5requirements.php';
$aid = $_POST['aid'];

$strXmFilePath = sw_getcfgstring("InstallPath") . "\conf\swserverservice.xml";
$xmlfp = file_get_contents($strXmFilePath);
if ($xmlfp == false) {
    throwProcessErrorWithMsg("Unable to parse " . $strXmFilePath);
} else {
    //-- turn into xmldom
    $_trustedkeyfromconfig = "";
    $xmlDoc = domxml_open_mem(utf8_encode($xmlfp));
    $root = $xmlDoc->document_element();
    $arrItems = $root->get_elements_by_tagname("secretKey");
    if ($arrItems[0]) {
        $_trustedkeyfromconfig = $arrItems[0]->get_attribute("value");
    }

    if ($_trustedkeyfromconfig == "") {
        throwProcessErrorWithMsg("Server is not configured for trusted logon");
    } else {
        $xmlmc = new XmlMethodCall();
        $xmlmc->SetParam("userId", utf8_encode($aid));
        $xmlmc->SetParam("secretKey ", $_trustedkeyfromconfig);

        $loginResult = $xmlmc->Invoke('session', 'analystLogonTrust');
        if (!$loginResult) {
            $result = new DOMDocument();
            $result->loadXML($xmlmc->xmlresult);
            $error = $result->getElementsByTagname('error');
            $error = $error->item(0);
            throwProcessErrorWithMsg($error->textContent);
        } else {

            $result = new DOMDocument();
            $result->loadXML($xmlmc->xmlresult);
            $sessid = $result->getElementsByTagname('SessionID');
			$sessid = $sessid->item(0)->textContent;
			$xmlmc->reset();
            $sessionInfo = $xmlmc->invoke("session", "getSessionInfo2");
            if ($sessionInfo) {
                $result = new DOMDocument();
                $result->loadXML($xmlmc->xmlresult);
				$groupId = $result->getElementsByTagname("contextGroupId")->item(0)->textContent;
				$analystId = $result->getElementsByTagname("analystId")->item(0)->textContent;
				$analystName = $result->getElementsByTagname("analystName")->item(0)->textContent;
                throwProcessSuccessWithResponse(json_encode(["group" => $groupId, "session" => $sessid, "analystId" => $analystId, "analystName" => $analystName]));
            } else {
                $result = new DOMDocument();
                $result->loadXML($xmlmc->xmlresult);
                $error = $result->getElementsByTagname('error');
                $error = $error->item(0);
                throwProcessErrorWithMsg($error->textContent);
            }
            throwProcessSuccessWithResponse($sessid->textContent);
        }
    }
}
