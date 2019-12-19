/*--------------------------------------------------|

| dTree 2.05 | www.destroydrop.com/javascript/tree/ |

|---------------------------------------------------|

| Copyright (c) 2002-2003 Geir Landrö               |

|                                                   |

| This script can be used freely as long as all     |

| copyright messages are intact.                    |

|                                                   |

| Updated: 17.04.2003                               |

|--------------------------------------------------*/



// Node object
function Node(id, pid, name, url, title, target, icon, iconOpen, open, boolNodeOnly, targettype, oTree) 
{

	this.id = id;
	this.tree = oTree;
	this.pid = pid;

	this.name = name;

	this.url = url;
	this.onselect = url;
	this.ondblclick = function(){return false;};

	this.title = title;

	this.target = target;


	this.icon = icon;
	this.iconOpen = iconOpen;

	this.targettype = (targettype==undefined)?"js":targettype;
	if(this.targettype=="js")this.url="#";

	this._io = open || false;

	this.nodeonly = (boolNodeOnly==undefined)?false:boolNodeOnly;

	this._is = false;

	this._ls = false;

	this._hc = false;

	this._ai = 0;

	this._p;

};



// Tree object

function newtree(objName,inDoc)
{
	var aTree = new dTree(objName,inDoc);
	return aTree;
}

function dTree(objName,inDoc) {

	this.config = {

		target					: null,

		folderLinks			: true,

		useSelection		: true,

		useCookies			: false,

		useLines				: true,

		useIcons				: true,

		useStatusText		: false,

		closeSameLevel	: false,

		inOrder					: false

	}

	this.IconImageList = ""; //-- class name of image list. if set then icon and icon open will be numered position in image list i.e.
							 //-- imglist-1, imglist-2

	this.imgpath ="";
	this.icon = {

		root				: 'treeimages/base.gif',

		folder			: 'treeimages/folder.gif',

		folderOpen	: 'treeimages/folderopen.gif',

		node				: 'treeimages/page.gif',

		empty				: 'treeimages/empty.gif',

		line				: 'treeimages/line.gif',

		join				: 'treeimages/join.gif',

		joinBottom	: 'treeimages/joinbottom.gif',

		plus				: 'treeimages/plus.gif',

		plusBottom	: 'treeimages/plusbottom.gif',

		minus				: 'treeimages/minus.gif',

		minusBottom	: 'treeimages/minusbottom.gif',

		nlPlus			: 'treeimages/nolines_plus.gif',

		nlMinus			: 'treeimages/nolines_minus.gif',

		suppgroup		: 'treeimages/suppgroup.png'

	};

	this.obj = objName;

	this.doc = inDoc;

	this.aNodes = [];

	this.aIndent = [];

	this.root = new Node(-1);

	this.selectedNode = null;

	this.selectedFound = false;

	this.completed = false;

	this._allowrightclick = false; //-- nwj do we allow right clicks 

};



// Adds a new node to the node array

dTree.prototype.add = function(id, pid, name, url, title, target, icon, iconOpen, open, boolNodeOnly, targettype) {

	this.aNodes[this.aNodes.length] = new Node(id, pid, name, url, title, target, icon, iconOpen, open, boolNodeOnly, targettype, this);
	this.aNodes[this.aNodes.length-1]._nodearraypos = this.aNodes.length-1;
	return this.aNodes[this.aNodes.length-1];
};

//-- return selected node
dTree.prototype.getSelectedNode = function()
{
	return this.aNodes[this.selectedNode];
}

//-- return selected nodes parent node
dTree.prototype.getSelectedNodeParent = function()
{
	var cNode = this.getSelectedNode();
	for (var n=0; n<this.aNodes.length; n++) 
	{
		if (this.aNodes[n].id == cNode.pid) return this.aNodes[n];
	}

	return null;
}

dTree.prototype.getNodeByPos = function(iPos)
{
	iPos--;iPos++;
	return this.aNodes[iPos];
}


dTree.prototype.getNodeByID = function(strID,optParentID)
{
	for (var x=0;x< this.aNodes.length;x++ )
	{
		if(this.aNodes[x].id==strID) 
		{
			if(optParentID==undefined)return this.aNodes[x];

			if(this.aNodes[x].pid==optParentID) return this.aNodes[x];
		}
	}
	return null;
}

dTree.prototype.getNodeByName = function(strName,optParentID)
{
	for (var x=0;x< this.aNodes.length;x++ )
	{
		if(this.aNodes[x].name==strName) 
		{
			if(optParentID==undefined)return this.aNodes[x];

			if(this.aNodes[x].pid==optParentID) return this.aNodes[x];
		}
	}
	return null;
}


dTree.prototype.getSelectedNodeChildByDisplay = function(strDisplay)
{
	
	var currSelectedPathDisplay = this.getNodeTextPath() +"->"+strDisplay;
	var node = this.getNodeByDisplayPath(currSelectedPathDisplay);
	return node;
}


dTree.prototype.getNodePositionByID = function(strID,optParentID)
{
	for (var x=0;x< this.aNodes.length;x++ )
	{
		if(this.aNodes[x].id==strID)
		{
			if(optParentID==undefined)return x;

			if(this.aNodes[x].pid==optParentID) return x;
		}
	}
	return -1;
}

dTree.prototype.getNodePositionByPathIds = function(strID,strDel)
{
	if(strDel==undefined)strDel="-";
	var arrPath = strID.split(strDel);

	//-- get starting pos of first node in path
	var currPos = this.getNodePositionByID(arrPath[0],"ROOT");
	for(var y=1;y<arrPath.length;y++)
	{
		currPos = this.getNodePositionByID(arrPath[y],arrPath[y-1]);
	}
	return currPos;
}

dTree.prototype.getNodePositionByPathNames = function(strNamePath,strDel)
{
	if(strDel==undefined)strDel="->";
	var arrPath = strNamePath.split(strDel);

	//-- get starting pos of first node in path
	var currPos = this.getNodePositionByID(arrPath[0],"ROOT");
	for(var y=1;y<arrPath.length;y++)
	{
		currPos = this.getNodePositionByID(arrPath[y],arrPath[y-1]);
	}
	return currPos;
}

dTree.prototype.getNodeByPath = function(strPath,strDelimiter)
{
	if(strDelimiter==undefined)strDelimiter="-";
	var arrPath = strPath.split(strDelimiter);
	
	var pid = undefined;
	var lastGoodNode = null;
	var aNode= null;
	for(var x=0;x<arrPath.length;x++)
	{
		aNode = this.getNodeByID(arrPath[x],pid);
		if(aNode==null)break;
		lastGoodNode=aNode;
		pid = aNode.id; 
	}

	return lastGoodNode;
}

dTree.prototype.getNodeByDisplayPath = function(strDisplayPath,strDelimiter)
{
	if(strDelimiter==undefined)strDelimiter="->";
	var arrPath = strDisplayPath.split(strDelimiter);
	
	var pid = undefined;
	var lastGoodNode = null;
	var aNode= null;
	for(var x=0;x<arrPath.length;x++)
	{
		aNode = this.getNodeByName(arrPath[x],pid);
		if(aNode==null)break;
		lastGoodNode=aNode;
		pid = aNode.id; 
	}

	return lastGoodNode;
}

//-- return node id path to selected node
dTree.prototype.getNodePath = function(strDelimiter,aNode)
{
	if(strDelimiter==undefined)strDelimiter="-";
	var aNode = (aNode==undefined)?this.getSelectedNode():aNode;
	if(aNode==undefined)return "";

	//-- loop up nodes using pid
	var arrText = new Array();
	while(aNode.pid != this.root.id)
	{
		var strText = aNode.id;
		arrText[arrText.length++] = strText;

		aNode = this.getNodeByID(aNode.pid);
		if(aNode==null)break;
	}

	//-- invert array
	var bLooped = false;
	var strReturnText = "";
	for(var x=arrText.length-1;x>-1;x--)
	{
		if(bLooped)strReturnText += strDelimiter;
		strReturnText += arrText[x];
		bLooped = true;
	}
	return strReturnText;
}

//-- return node name path to selected node
dTree.prototype.getNodeTextPath = function(strDelimiter,aNode)
{
	if(strDelimiter==undefined)strDelimiter="->";
	var aNode = (aNode==undefined)?this.getSelectedNode():aNode;
	if(aNode==undefined)return "";

	//-- loop up nodes using pid
	var arrText = new Array();
	while(aNode.pid!=this.root.id)
	{
		var strText = aNode.name;
		arrText[arrText.length++] = strText;
		aNode = this.getNodeByID(aNode.pid);
		if(aNode==null)break;
	}

	//-- invert array
	var bLooped = false;
	var strReturnText = "";
	for(var x=arrText.length-1;x>-1;x--)
	{
		if(bLooped)strReturnText += strDelimiter;
		strReturnText += arrText[x];
		bLooped = true;
	}
	return strReturnText;
}


// Open/close all nodes

dTree.prototype.openAll = function() {

	this.oAll(true);

};

dTree.prototype.closeAll = function() {

	this.oAll(false);

};



// Outputs the tree to the page

dTree.prototype.toString = function() {

	var str = '<div class="dtree">\n';

	if (this.doc.getElementById) 
	{

		if (this.config.useCookies) this.selectedNode = this.getSelected();

		str += this.addNode(this.root);

	} else str += 'Browser not supported.';

	str += '</div>';

	if (!this.selectedFound) this.selectedNode = null;

	this.completed = true;

	return str;

};

//-- removes child nodes from a given parent node from the tree and re-syncs all nodes _ai
dTree.prototype.removeNodesChildren = function(parentNode,boolRemovingChild) 
{
	if(boolRemovingChild==undefined)boolRemovingChild=false;
	for (var n=0; n<this.aNodes.length; n++) 
	{
		if (this.aNodes[n].pid== parentNode.id) 
		{
			//-- get array of child Nodes
			var arrChildren = this._getChildrenArray(parentNode);

			//-- process children and remove
			for(strID in arrChildren)
			{
				this.removeNode(arrChildren[strID],true)
			}
		}
	}

	if(!boolRemovingChild)
	{
		//-- reset array index
		for (var n = 0; n<this.aNodes.length; n++) 
		{
			this.aNodes[n]._ai = n;
		}
	}
}

dTree.prototype.removeAllNodes = function() 
{
	for (var n=0; n<this.aNodes.length; n++) 
	{
		this.removeNodesChildren(this.aNodes[n]);
		this.removeNode(this.aNodes[n]);
	}
}


//-- removes node from the tree and re-syncs all nodes _ai
dTree.prototype.removeNode = function(deleteNode,boolRemovingChild) 
{
	if(boolRemovingChild==undefined)boolRemovingChild=false;
	for (var n=0; n<this.aNodes.length; n++) 
	{
		if (this.aNodes[n]== deleteNode) 
		{
			//-- get array of child Nodes
			var arrChildren = this._getChildrenArray(deleteNode);

			//-- remove deleteNode from array 
			this.aNodes.splice(n, 1);
		

			//-- process children and remove
			for(strID in arrChildren)
			{
				this.removeNode(arrChildren[strID],true)
			}
		}
	}

	if(!boolRemovingChild)
	{
		//-- reset array index
		for (var n = 0; n<this.aNodes.length; n++) 
		{
			this.aNodes[n]._ai = n;
		}

		//-- remove div element containing node
		var divID = "tn_" + deleteNode.id;
		var nodeDiv = this.doc.getElementById(divID);
		if(nodeDiv!=null)
		{
			nodeDiv.parentNode.removeChild(nodeDiv);
		}
	}
}

// Creates the tree structure
dTree.prototype.addNode = function(pNode) {

	var str = '';

	var n=0;

	if (this.config.inOrder) n = pNode._ai;

	for (n; n<this.aNodes.length; n++) 
	{
		if (this.aNodes[n].pid == pNode.id) 
		{
			var cn = this.aNodes[n];

			cn._p = pNode;

			cn._ai = n;

			this.setCS(cn);

			if (!cn.target && this.config.target) cn.target = this.config.target;

			if (cn._hc && !cn._io && this.config.useCookies) cn._io = this.isOpen(cn.id);

			if (!this.config.folderLinks && cn._hc) cn.url = null;

			if (this.config.useSelection && cn.id == this.selectedNode && !this.selectedFound) 
			{
					cn._is = true;

					this.selectedNode = n;
					this.selectedFound = true;
			}

			str += this.node(cn, n);

			if (cn._ls)
			{
				if(this.aNodes[n+1]  && (this.aNodes[n+1].pid == pNode.id))
				{
					cn._ls = false;
				}
				else
				{
					break;
				}
			}

		}

	}

	return str;

};



// Creates the node icon, url and text
dTree.prototype.node = function(node, nodeId) 
{
	var str = '<div id="tn_' + nodeId + '" class="dTreeNode">' + this.indent(node, nodeId);

	if (this.config.useIcons) 
	{

		if (!node.icon) node.icon = (this.root.id == node.pid) ? this.icon.root : ((node._hc) ? this.icon.folder : this.icon.node);

		if (!node.iconOpen) node.iconOpen = (node._hc) ? this.icon.folderOpen : this.icon.node;

		if (this.root.id == node.pid) {

			if (!node.icon) node.icon = this.icon.root;

			if (!node.iconOpen) node.iconOpen = this.icon.root;

		}
		
		//-- are we using image list
		if(this.IconImageList!="")
		{
			//-- assume icon list imahes are 16 by 16
			var intImagePos = (node._io) ? (node.iconOpen * 16) : (node.icon * 16);
			var stylePos = "style='background-position: " + intImagePos + "px 0px;'";
			str += '<span id="i' + this.obj + nodeId + '" class="'+this.IconImageList+'" '+stylePos+'></span>';
		}
		else
		{
			str += '<img id="i' + this.obj + nodeId + '" src="' + this.imgpath + ((node._io) ? node.iconOpen : node.icon) + '" alt="" />';
		}

	}

	if (node.url) {

		if(node.url=="#")node.url="#";
		var treeid =(this.obj.id)?this.obj.id:this.obj;
		str += '<a id="s' + this.obj + nodeId + '" treeid="'+treeid+'" nodeid="'+node.id+'" class="' + ((this.config.useSelection) ? ((node._is ? 'nodeSel' : 'node')) : 'node') + '" href="' + node.url + '"';

		if (node.title) str += ' title="' + node.title + '"';

		if (node.target) str += ' target="' + node.target + '"';

		//if (this.config.useStatusText) str += ' onmouseover="window.status=\'' + node.name + '\';return true;" onmouseout="window.status=\'\';return true;" ';

		if (this.config.useSelection && ((node._hc && this.config.folderLinks) || !node._hc))

			str += ' oncontextmenu="javascript: return ' + this.obj + '.rc(' + nodeId + ',event);"';

			str += ' onclick="javascript: return ' + this.obj + '.s(' + nodeId + ',true,event);"';

			str += ' ondblclick="javascript: return ' + this.obj + '.dc(' + nodeId + ');"';

		str += '>';

	}

	else if ((!this.config.folderLinks || !node.url) && node._hc && node.pid != this.root.id)

		str += '<a href="#" onclick="javascript:  return ' + this.obj + '.o(' + nodeId + ');" class="node">';

	str += node.name;

	if (node.url || ((!this.config.folderLinks || !node.url) && node._hc)) str += '</a>';

	str += '</div>';

	if (node._hc) 
	{
		
		str += '<div id="d' + this.obj + nodeId + '" class="clip" style="display:' + ((this.root.id == node.pid || node._io) ? 'block' : 'none') + ';">';
		str += this.addNode(node);
		str += '</div>';
	}

	this.aIndent.pop();

	return str;

};



// Adds the empty and line icons
dTree.prototype.indent = function(node, nodeId) {

	var str = '';

	if (this.root.id != node.pid) {

		for (var n=0; n<this.aIndent.length; n++)

			str += '<img src="' + this.imgpath + ( (this.aIndent[n] == 1 && this.config.useLines) ? this.icon.line : this.icon.empty ) + '" alt="" />';

		(node._ls) ? this.aIndent.push(0) : this.aIndent.push(1);

		if (node._hc) {

			str += '<a onclick="javascript: return ' + this.obj + '.o(' + nodeId + ');"><img id="j' + this.obj + nodeId + '" src="';

			if (!this.config.useLines) str += this.imgpath + (node._io) ? this.icon.nlMinus : this.icon.nlPlus;

			else str += this.imgpath + ( (node._io) ? ((node._ls && this.config.useLines) ? this.icon.minusBottom : this.icon.minus) : ((node._ls && this.config.useLines) ? this.icon.plusBottom : this.icon.plus ) );

			str += '" alt="" /></a>';

		} else str += '<img src="' + this.imgpath + ( (this.config.useLines) ? ((node._ls) ? this.icon.joinBottom : this.icon.join ) : this.icon.empty) + '" alt="" />';

	}

	return str;

};



// Checks if a node has any children and if it is the last sibling
dTree.prototype.setCS = function(node) {

	var lastId;

	for (var n=0; n<this.aNodes.length; n++) 
	{

		if (this.aNodes[n].pid == node.id) node._hc = true;

		if (this.aNodes[n].pid == node.pid) lastId = this.aNodes[n].id;

	}
	if (lastId==node.id) node._ls = true;

};


dTree.prototype._hasChildren = function(node) {

	var lastId;
	for (var n=0; n<this.aNodes.length; n++) 
	{
		if (this.aNodes[n].pid == node.id) return true;
	}
	return false;
};

//-- gets immediate array of child nodes for a given node - key by childnode id
dTree.prototype._getChildrenArray = function(node) {

	
	var arrChildren = new Array();
	for (var n=0; n<this.aNodes.length; n++) 
	{
		if (this.aNodes[n].pid == node.id) 
		{
			arrChildren[this.aNodes[n].id] = this.aNodes[n];
		}
	}
	return arrChildren;
};

//-- gets immediate 1st child of node
dTree.prototype._getFirstChild = function(node) 
{

	for (var n=0; n<this.aNodes.length; n++) 
	{
		if (this.aNodes[n].pid == node.id) 
		{
			return this.aNodes[n];
		}
	}
	return null;
};



// Returns the selected node

dTree.prototype.getSelected = function() {

	var sn = this.getCookie('cs' + this.obj);

	return (sn) ? sn : null;

};



dTree.prototype.dc = function(id) 
{
	var cn = this.aNodes[id];	
	
	if (!this.config.useSelection) return false;
	if (cn._hc && !this.config.folderLinks) return false;

	//-- nwj
	//-- execute javascript function
	if(cn.targettype=="js")
	{
		cn.ondblclick(cn, this.controlid);
	}
	else 
	{
		//- -urrl
	}

}

//-- nwj - contextmenu
dTree.prototype.rc = function(id,oEv) 
{
	if(this._allowrightclick)
	{
		app.stopEvent(oEv);
		var cn = this.aNodes[id];	
		this.s(id,true,oEv, true);
		return false;
	}
	return true;
}

// Highlights the selected node
//-- nwj added bTrigger - if true trigger onclick else just highlight
dTree.prototype.s = function(id,bTrigger,oEv,bContextMenu) 
{
	if(bTrigger==undefined)bTrigger=true;
	if(bContextMenu==undefined)bContextMenu=false;

	var cn = (isNaN(id))?id:this.aNodes[id];	
	var id = cn._ai;

	if (!this.config.useSelection) return false;

	if (cn._hc && !this.config.folderLinks) return false;

	if (this.selectedNode != id || bContextMenu) 
	{
		if (this.selectedNode || this.selectedNode==0) 
		{

			var eOld = this.doc.getElementById("s" + this.obj + this.selectedNode);
			if(eOld!=null)eOld.className = "node";
		}

		eNew = this.doc.getElementById("s" + this.obj + id);

		eNew.className = "nodeSel";

		this.selectedNode = id;

		if (this.config.useCookies) this.setCookie('cs' + this.obj, cn.id);

		//-- nwj
		//-- execute javascript function
		if(cn.targettype=="js")
		{
			if(bTrigger)cn.onselect(cn, this.controlid,eNew,oEv,bContextMenu);
		}
		else 
		{
			//-- urrl
		}
	}

	return false;
};


dTree.prototype.hilite = function(node, boolSetAsSelected) 
{
		var eNew = this.doc.getElementById("s" + this.obj + node._ai);
		if(eNew)
		{
			eNew.className = "nodeSel";
			if(boolSetAsSelected)this.selectedNode = node._ai;
		}
}

dTree.prototype.lolite = function(node, boolUnSetSelected) 
{
		var eNew = this.doc.getElementById("s" + this.obj + node._ai);
		if(eNew)
		{
			eNew.className = "node";
			if(boolUnSetSelected)this.selectedNode = -1;
		}
}


// Toggle Open or close

dTree.prototype.o = function(id) {

	var cn = this.aNodes[id];

	//-- nwj
	//-- execute javascript function
	if(cn.openingclosing!=undefined)
	{
		cn.openingclosing(cn, this.controlid);
	}


	this.nodeStatus(!cn._io, id, cn._ls);

	cn._io = !cn._io;

	if (this.config.closeSameLevel) this.closeLevel(cn);

	if (this.config.useCookies) this.updateCookie();

	//-- nwj
	//-- execute javascript function
	if(cn.openedclosed!=undefined)
	{
		cn.openedclosed(cn, this.controlid);
	}
};



// Open or close all nodes

dTree.prototype.oAll = function(status) {

	for (var n=0; n<this.aNodes.length; n++) {

		if (this.aNodes[n]._hc && this.aNodes[n].pid != this.root.id) {

			this.nodeStatus(status, n, this.aNodes[n]._ls)

			this.aNodes[n]._io = status;

		}

	}

	if (this.config.useCookies) this.updateCookie();

};



// Opens the tree to a specific node
//-- nwj - added tigger - if false do no fire onselect - just highlight node
dTree.prototype.openTo = function(nId, bSelect, bFirst,bTrigger, bOpen) 
{
	if(bTrigger==undefined)bTrigger=true;
	if(bOpen==undefined)bOpen=true;

	if(!isNaN(nId))
	{
		if (!bFirst) 
		{
			for (var n=0; n<this.aNodes.length; n++) 
			{
				if (this.aNodes[n].id == nId) 
				{
					nId=n;
					break;
				}
			}
		}

		var cn=this.aNodes[nId];
	}
	else
	{
		//- -user has passed in node
		var cn=nId;
	}

	if (cn.pid==this.root.id || !cn._p) 
	{
		return;
	}

	cn._io = (bOpen)?true:false;

	cn._is = bSelect;

	if (this.completed && cn._hc) 
	{
		this.nodeStatus(bOpen, cn._ai, cn._ls);
	}

	if (this.completed && bSelect) 
	{
		this.s(cn,bTrigger);
	}
	else if (bSelect) 
	{
		this._sn=cn._ai;
	}

	//-- nwj - why was this here?
	if(bOpen)this.openTo(cn._p, false, true,bTrigger);

};


// Closes all nodes on the same level as certain node
dTree.prototype.closeLevel = function(node) {

	for (var n=0; n<this.aNodes.length; n++) {

		if (this.aNodes[n].pid == node.pid && this.aNodes[n].id != node.id && this.aNodes[n]._hc) {

			this.nodeStatus(false, n, this.aNodes[n]._ls);

			this.aNodes[n]._io = false;

			this.closeAllChildren(this.aNodes[n]);

		}

	}
}



// Closes all children of a node
dTree.prototype.closeAllChildren = function(node) {

	for (var n=0; n<this.aNodes.length; n++) {

		if (this.aNodes[n].pid == node.id && this.aNodes[n]._hc) {

			if (this.aNodes[n]._io) this.nodeStatus(false, n, this.aNodes[n]._ls);

			this.aNodes[n]._io = false;

			this.closeAllChildren(this.aNodes[n]);		

		}
	}
}

// open a node
dTree.prototype.OpenNode = function(node,boolIgnoreHC,boolSetIO) {

	if (node._hc || boolIgnoreHC) 
	{

		this.nodeStatus(true, node._ai, node._ls);
		if(boolSetIO!=undefined)node._io=boolSetIO;
	}
}

//-- close a node
dTree.prototype.CollapseNode = function(node) 
{
	var id = node._ai;
	var status = false;
	var bottom = node._ls;

	eDiv	= this.doc.getElementById('d' + this.obj + id);
	eJoin	= this.doc.getElementById('j' + this.obj + id);

	if (this.config.useIcons)
	{
		eIcon	= this.doc.getElementById('i' + this.obj + id);

		//-- are we using image list
		if(this.IconImageList!="")
		{
			//-- assume icon list imahes are 16 by 16
			var intImagePos = (status) ? (node.iconOpen * 16) : (node.icon * 16);
			eIcon.style.backgroundPosition= intImagePos + "px 0px";
		}
		else
		{
			var strSrc = (status==true)? node.iconOpen : node.icon;
			eIcon.src = this.imgpath + strSrc;

		}
	}

	eJoin.src = this.imgpath + (this.config.useLines)?
	((status)?((bottom)?this.icon.minusBottom:this.icon.minus):((bottom)?this.icon.plusBottom:this.icon.plus)):
	((status)?this.icon.nlMinus:this.icon.nlPlus);


	eDiv.style.display = (status) ? 'block': 'none';

}


// Change the status of a node(open or closed)

dTree.prototype.nodeStatus = function(status, id, bottom) {

	eDiv	= this.doc.getElementById('d' + this.obj + id);

	eJoin	= this.doc.getElementById('j' + this.obj + id);

	if (this.config.useIcons) {

		eIcon	= this.doc.getElementById('i' + this.obj + id);

		//-- are we using image list
		if(this.IconImageList!="")
		{
			//-- assume icon list imahes are 16 by 16
			var intImagePos = (status) ? (this.aNodes[id].iconOpen * 16) : (this.aNodes[id].icon * 16);
			eIcon.style.backgroundPosition= intImagePos + "px 0px";
		}
		else
		{
			eIcon.src = this.imgpath + (status) ? this.aNodes[id].iconOpen : this.aNodes[id].icon;
		}
	}

	eJoin.src = this.imgpath + (this.config.useLines)?

	((status)?((bottom)?this.icon.minusBottom:this.icon.minus):((bottom)?this.icon.plusBottom:this.icon.plus)):

	((status)?this.icon.nlMinus:this.icon.nlPlus);

	eDiv.style.display = (status) ? 'block': 'none';

};


// [Cookie] Clears a cookie

dTree.prototype.clearCookie = function() {

	var now = new Date();

	var yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);

	this.setCookie('co'+this.obj, 'cookieValue', yesterday);

	this.setCookie('cs'+this.obj, 'cookieValue', yesterday);

};



// [Cookie] Sets value in a cookie

dTree.prototype.setCookie = function(cookieName, cookieValue, expires, path, domain, secure) {

	this.doc.cookie =

		escape(cookieName) + '=' + escape(cookieValue)

		+ (expires ? '; expires=' + expires.toGMTString() : '')

		+ (path ? '; path=' + path : '')

		+ (domain ? '; domain=' + domain : '')

		+ (secure ? '; secure' : '');

};



// [Cookie] Gets a value from a cookie

dTree.prototype.getCookie = function(cookieName) {

	var cookieValue = '';

	var posName = this.doc.cookie.indexOf(escape(cookieName) + '=');

	if (posName != -1) {

		var posValue = posName + (escape(cookieName) + '=').length;

		var endPos = this.doc.cookie.indexOf(';', posValue);

		if (endPos != -1) cookieValue = unescape(this.doc.cookie.substring(posValue, endPos));

		else cookieValue = unescape(this.doc.cookie.substring(posValue));

	}

	return (cookieValue);

};



// [Cookie] Returns ids of open nodes as a string

dTree.prototype.updateCookie = function() {

	var str = '';

	for (var n=0; n<this.aNodes.length; n++) {

		if (this.aNodes[n]._io && this.aNodes[n].pid != this.root.id) {

			if (str) str += '.';

			str += this.aNodes[n].id;

		}

	}

	this.setCookie('co' + this.obj, str);

};



// [Cookie] Checks if a node id is in a cookie

dTree.prototype.isOpen = function(id) {

	var aOpen = this.getCookie('co' + this.obj).split('.');

	for (var n=0; n<aOpen.length; n++)

		if (aOpen[n] == id) return true;

	return false;

};



// If Push and pop is not implemented by the browser

if (!Array.prototype.push) {

	Array.prototype.push = function array_push() {

		for(var i=0;i<arguments.length;i++)

			this[this.length]=arguments[i];

		return this.length;

	}

};

if (!Array.prototype.pop) {

	Array.prototype.pop = function array_pop() {

		lastElement = this[this.length-1];

		this.length = Math.max(this.length-1,0);

		return lastElement;

	}

};

function removeArrayItem(originalArray, itemToRemove)
{
	var j = 0;
	while (j < originalArray.length) 
	{
		//	alert(originalArray[j]);
		if (originalArray[j] == itemToRemove) 
		{			
			originalArray.splice(j, 1);
		} 
		else 
		{ 
			j++; 
		}
	}
	return originalArray;
}

function removeArrayIndex(originalArray, indexToRemove)
{
	originalArray.splice(indexToRemove, 1);
	return originalArray;
}