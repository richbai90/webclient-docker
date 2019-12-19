<?php

//-- include helpers file if there is one
@include('helpers/custom.tabcontrol.functions.php');

class oTabForm
{
    var $controlname="";
    var $xmlRoot = null;

    function get_title()
    {
        $xmlTitle = $this->xmlRoot->get_elements_by_tagname("title");
        return parse_context_vars($xmlTitle[0]->get_content());
    }

    function get_desc()
    {
        $xmlDesc = $this->xmlRoot->get_elements_by_tagname("description");
        return parse_context_vars($xmlDesc[0]->get_content());
    }

    function draw($height,$width,$strTabId = "")
    {
        $overflow = "";
        if($height>0)
        {
            $overflow = "overflow-y:hidden;overflow-x:hidden;";
        }
        $strTabHtml='<div id="tab_holder">';
        $strTabHtml.='	<div class="tab_wrapper">';
        $strTabHtml.='		<div id="tab_items" class="tabs" >';
        $strTabHtml.=			$this->create_tabs();
        $strTabHtml.='		</div>';
        $strTabHtml.='	</div>';
        $strTabHtml.='	<div class="panel_wrapper" id="tab_contentholder" style="height:'.$height.';width:'.$width.';'.$overflow.'">';
        $strTabHtml.=		$this->get_firstab_content($strTabId);
        $strTabHtml.='	</div>';
        $strTabHtml.='</div><!--tab_holder-->';
        return $strTabHtml;
    }

    function create_tabs()
    {
        /**
         * @var classcustomersession
         */
        GLOBAL $customer_session;
        $counter=1;
        $strHTML = "<ul id='tabdata_tabs'>";

        $xmlTabItems = $this->xmlRoot->get_elements_by_tagname("tabitem");
        foreach($xmlTabItems as $tabKey => $anItem)
        {
            /* @var $anItem DomElement */
            if($anItem->has_attributes())
            {
                $visible = TRUE;
                if($anItem->get_attribute('webflag'))
                {
                    // Evil :( But i dont know enougth about the system
                    //         at the moment to suggest a fully backwards
                    //         compatible solution. -- wb.
                    //         * Is it always a php constant? -- wb.
                    eval("\$strWebFlag = ".$anItem->get_attribute('webflag').";");
                    if(!$customer_session->IsOption($strWebFlag))
                    {
                        $visible = FALSE;
                    }                       
                }
                //-- do we have an additional access function
                if($anItem->get_attribute('accessfunction'))
                {
                    // Evil :( But i dont know enougth about the system
                    //         at the moment to suggest a fully backwards
                    //         compatible solution. -- wb.
                    //         * Maybe use is_callable()? -- wb.
                    eval("\$visible = ".parse_context_vars($anItem->get_attribute('accessfunction')).';');
                }
                if(!$visible)
                {
                    continue;
                }

				$strDisplay = "";
				$boolHidden = $anItem->get_attribute('hidden');
				if($boolHidden==true)
				{
					$strDisplay = 'class="itemDisplayNone"';
				}
				$strOnClick = "";
				$strOnClick = $anItem->get_attribute('onload');

                $strHTML.= '<li'
                        // . ($counter++ == 1 ? ' class="current" ' : '')
                         . ' id="' . $anItem->get_attribute('id') . '"'  
                         . ' tabcontrol="'.$this->controlname. '"'
                         . ' vars="' . parse_context_vars($anItem->get_attribute('vars')) . '"'  
                         . ' url="' . parse_context_vars($anItem->get_attribute('url')) . '"'  
                         . ' contenttype="' . $anItem->get_attribute('contenttype') . '"'  
                         . ' phpcontent="' . parse_context_vars($anItem->get_attribute('phpcontent')) . '"'  
                         . ' addpath="' . parse_context_vars($anItem->get_attribute('addpath')) . '"'
						 . $strDisplay
                         . ' onClick="if(app.selecttab){app.selecttab(this,\'\',document);}else{selecttab(this,\'\',document);};'.$strOnClick.'">'
                         . '<span>'
                         . '<a href="#">'
                         . htmlentities(parse_context_vars($anItem->get_attribute('display')), ENT_QUOTES,'UTF-8')
                         . '</a>'
                         . '</span>'
                         .'</li>'
                         ;
            }
        }
        $strHTML .=	"</ul>";
        return $strHTML;
    }

    function get_firstab_content($strTabId)
    {
		$strOnLoadJS = $this->xmlRoot->get_attribute("onload");
		$strFirstVisible = "";
        $xmlTabItems = $this->xmlRoot->get_elements_by_tagname("tabitem");
        
        if(!isset($strScript)) $strScript="";

        foreach($xmlTabItems as $tabKey => $anItem)
        {
            $visible = TRUE;
            if($anItem->has_attributes())
            {
				//-- do we have an additional access function
                if($anItem->get_attribute('accessfunction'))
                {
                    // Evil :( But i dont know enougth about the system
                    //         at the moment to suggest a fully backwards
                    //         compatible solution. -- wb.
                    //         * Maybe use is_callable()? -- wb.
                    eval("\$visible = ".parse_context_vars($anItem->get_attribute('accessfunction')).';');
                }

				if(!$visible)
                {
                    continue;
                }
                //-- create html
                $strID = getAttribute("id", $anItem->attributes());
				if($strFirstVisible=="")
					$strFirstVisible = $strID;
				if($strTabId!="")
				{
					if($strTabId!=$strID)
						continue;
				}

				$strScript .= "<script autoload>\r\n";
				if($strOnLoadJS!="")
				{
					$strScript .= $strOnLoadJS;
				}
				$strScript .="var tItem = document.getElementById('".$strID."');\r\n";
				$strScript .="if(tItem==null){tItem=aDoc.getElementById('".$strID."')};\r\n";
				$strScript .="if(tItem){
						if(app.fireevent)
						{
							app.fireevent(tItem,'click');
						}
						else
						{
							fireevent(tItem,'click');
						}
					};\r\n";
                
				$strScript .="</script>\r\n";
                   return $strScript;
				
            }
        }
		if($strFirstVisible!="")
		{
				$strScript .= "<script autoload>\r\n";
				$strScript .="var tItem = document.getElementById('".$strFirstVisible."');\r\n";
				$strScript .="if(tItem==null){tItem=aDoc.getElementById('".$strFirstVisible."')};\r\n";
				$strScript .="if(tItem){
						if(app.fireevent)
						{
							app.fireevent(tItem,'click');
						}
						else
						{
							fireevent(tItem,'click');
						}
					};\r\n";
                
				$strScript .="</script>\r\n";
                   return $strScript;
		}
        return "";
    }

    function get_tabnode($strTabID)
    {
        $anItem = xml_element_by_id($this->xmlRoot,$strTabID);
        return $anItem;
        $xmlTabItems = $this->xmlRoot->get_elements_by_tagname("tabitem");
        foreach($xmlTabItems as $tabKey => $anItem)
        {
            if($anItem->has_attributes())
            {
                $strID = getAttribute("id", $anItem->attributes());
                if($strID==$strTabID) return $anItem;
            }
        }
        return false;
    }

    function get_tabnode_type($strID)
    {
        $xmlTabItem = $this->get_tabnode($strID);
        if($xmlTabItem)
        {
            return $xmlTabItem->get_attribute("contenttype");
        }
        else
        {
            return false;
        }
    }
}

?>