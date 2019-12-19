var SwMyLibrary=new _SwMyLibrary();function _SwMyLibrary(){this.boolVirtualPath=false;this.virtualPath="";this.selectedTreeNode=null;this.treeControl=null;this.contentmenu=null;this.rowSelected=false;}_SwMyLibrary.prototype.refreshTree=function(){var currSelectedPath=this.selectedTreeNode.tree.getNodePath();app.oControlFrameHolder._load_folder_xml(this.selectedTreeNode._virtualpath,this.selectedTreeNode.id);var aNode=this.treeControl.getNodeByPath(currSelectedPath);if(aNode!=null){aNode.tree.s(aNode,true,undefined,true);}};_SwMyLibrary.prototype.contextMenuAction=function(selectedItem){this.swParentObject.hideContextMenu();var menu=this;if(menu.swParentObject[selectedItem.id]){menu.swParentObject[selectedItem.id]();}};_SwMyLibrary.prototype.addnewfolder=function(){var strNewFolder=prompt("Please enter the new folder name:-","");if(strNewFolder==""||strNewFolder==null){return;}var strNewPath=this.virtualPath+"/"+strNewFolder;strNewPath=strNewPath.replace("//","");var xmlmc=new XmlMethodCall();xmlmc.SetParam("folder",strNewPath);if(xmlmc.Invoke("mylibrary","createFolder")){this.treeControl.removeNodesChildren(this.selectedTreeNode);this.refreshTree();}else{alert("Failed to create new folder. Please ensure the folder name provided is valid.");}};_SwMyLibrary.prototype.deleteff=function(){var strName=this.rowSelected.getAttribute("filename");var strType=this.rowSelected.getAttribute("filetype");var strFFPath=this.virtualPath+"/"+strName;strFFPath=strFFPath.replace("//","");var strMessage=(strType=="dir")?"Are you sure you want to delete the folder '"+strName+"' and all its contents?":"Are you sure you want to delete "+strName;if(!confirm(strMessage)){return;}var xmlmc=new XmlMethodCall();if(strType=="dir"){xmlmc.SetParam("folder",strFFPath);xmlmc.SetParam("forceDelete",true);if(xmlmc.Invoke("mylibrary","deleteFolder")){this.treeControl.removeNodesChildren(this.selectedTreeNode);this.refreshTree();}}else{xmlmc.SetParam("file",strFFPath);if(xmlmc.Invoke("mylibrary","deleteFile")){this.refreshTree();}}};_SwMyLibrary.prototype.addnewfile=function(){var strPhpPath=app._root+"service/mylibrary/uploadfile/index.php";app.global._selectFileToUpload(strPhpPath,this.selectedTreeNode._virtualpath,top.SwMyLibrary.onnewfileadded);};_SwMyLibrary.prototype.onnewfileadded=function(strFileName,topWin){if(topWin!=undefined){topWin.close();}this.refreshTree();};_SwMyLibrary.prototype.renameff=function(){if(this.rowSelected==null){return;}var strName=this.rowSelected.getAttribute("filename");var strPath=this.rowSelected.getAttribute("path");var strType=this.rowSelected.getAttribute("filetype");var strNewName=prompt("Rename:-",strName);if(strNewName==""||strNewName==strName){return;}var xmlmc=new XmlMethodCall();xmlmc.SetParam("path",strPath);xmlmc.SetParam("newName",strNewName);if(xmlmc.Invoke("mylibrary","renameItem")){if(strType=="dir"){this.treeControl.removeNodesChildren(this.selectedTreeNode);}this.refreshTree();}};_SwMyLibrary.prototype.openff=function(){this.openResource(this.rowSelected);};_SwMyLibrary.prototype.openwww=function(){var strName=app.pfx(this.rowSelected.getAttribute("filename"));var childNode=this.treeControl.getNodeByName(strName,"_mr");if(childNode!=null){this.treeControl.openTo(childNode,true,true,true);}};_SwMyLibrary.prototype.newwww=function(){app._open_system_form("_sys_mylib_newwww","mylibrary","","",true,function(oForm){if(oForm.document._www_url!=""){var xmlmc=new XmlMethodCall();xmlmc.SetComplexValue("resource","name",oForm.document._www_display_name);xmlmc.SetComplexValue("resource","url",oForm.document._www_url);if(xmlmc.Invoke("mylibrary","addUserLibraryResource")){this.refreshResourceList();}}},null,window);};_SwMyLibrary.prototype.deletewww=function(){if(this.rowSelected!=null){var xmlmc=new XmlMethodCall();xmlmc.SetParam("name",this.rowSelected.getAttribute("filename"));if(xmlmc.Invoke("mylibrary","deleteUserLibraryResource")){this.treeControl.removeNodesChildren(this.selectedTreeNode);this.refreshResourceList();}}};_SwMyLibrary.prototype.refreshResourceList=function(){app.oControlFrameHolder._load_resources_list();var aNode=this.selectedTreeNode.tree.getNodeByID("_mr","-1");if(aNode!=null){aNode.tree.s(aNode);}};_SwMyLibrary.prototype.showContextMenu=function(divHolder,eV){app.stopEvent(eV);app.hide_application_menu_divs();if(this.selectedTreeNode==null){return false;}if(this.popupmenu==null){this.popupmenu=app._new__popupmenu("_mylib_contextmenu",divHolder,this.contextMenuAction);this.popupmenu.swParentObject=this;}this.popupmenu.hide();this.popupmenu.reset();if(this.selectedTreeNode.id=="_mr"){if(this.rowSelected!=null){this.popupmenu.addmenuitem("openwww","Open","",false);}this.popupmenu.addmenuitem("newwww","Add Web Resource","",false);if(this.rowSelected!=null){this.popupmenu.addmenuitem("split","","",false);this.popupmenu.addmenuitem("deletewww","Delete","",false);}}else{var boolVirtualRoot=(this.boolVirtualPath&&this.rowSelected==null||(this.selectedTreeNode.id=="0"));if(boolVirtualRoot){this.hideContextMenu();return false;}if(this.rowSelected!=null){this.popupmenu.addmenuitem("openff","Open","",false);if(!this.boolVirtualPath){this.popupmenu.addmenuitem("split","","",false);this.popupmenu.addmenuitem("addnewfolder","New Folder","",false);this.popupmenu.addmenuitem("split","","",false);this.popupmenu.addmenuitem("addnewfile","Add...","",false);}else{this.popupmenu.addmenuitem("split","","",false);}this.popupmenu.addmenuitem("deleteff","Delete","",false);if(!this.boolVirtualPath){this.popupmenu.addmenuitem("split","","",false);}if(!this.boolVirtualPath){this.popupmenu.addmenuitem("renameff","Rename","",false);}}else{this.popupmenu.addmenuitem("addnewfolder","New Folder","",false);this.popupmenu.addmenuitem("addnewfile","Add...","",false);}}this.popupmenu.show(undefined,undefined,eV);return false;};_SwMyLibrary.prototype.hideContextMenu=function(oEv){if(this.popupmenu!=null){this.popupmenu.hide();}};_SwMyLibrary.prototype.filelistSelected=function(aRow,eV){this.hideContextMenu();app.datatable_hilight(aRow,false);this.rowSelected=aRow;};_SwMyLibrary.prototype.openResource=function(aRow){var strName=aRow.getAttribute("filename");var strType=aRow.getAttribute("filetype");var strPath=aRow.getAttribute("path");if(strType!="dir"){var oF=app.oControlFrameHolder._getFileForm();if(oF!=null){var outlookDoc=app.oControlFrameHolder._getDoc();if(outlookDoc!=null){outlookDoc.getElementById("filename").value=strName;outlookDoc.getElementById("filepath").value=strPath;var strURL=app._root+app._workspacecontrolpath+"_views/library/viewfile.php";oF.setAttribute("action",strURL);oF.submit();}}}else{var childNode=this.treeControl.getSelectedNodeChildByDisplay(strName);if(childNode!=null){this.treeControl.OpenNode(this.selectedTreeNode,true,true);this.treeControl.s(childNode,true,undefined,false);}}};