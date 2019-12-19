/**
 * $Id: Graph.js,v 1.47 2012-12-11 15:51:11 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph instance. Note that the constructor does not take a
 * container because the graph instance is needed for creating the UI, which
 * in turn will create the container for the graph. Hence, the container is
 * assigned later in EditorUi.
 */
Graph = function(container, model, renderHint, stylesheet)
{
	mxGraph.call(this, container, model, renderHint, stylesheet);

	this.getSelectionModel().setSingleSelection(false);
	this.setCellsMovable(true);
	this.setPanning(true);
	this.setTooltips(false);
	this.setHtmlLabels(false);

	//-- so user cant start changing connections (edges)
	this.setConnectable(false)
	this.setCellsEditable(false);
    this.setAllowDanglingEdges(false);
    this.setAllowLoops(false);
    this.setCellsDeletable(false);
    this.setCellsCloneable(false);
    this.setCellsDisconnectable(false);
    this.setDropEnabled(false);
    this.setSplitEnabled(false);
    this.setCellsBendable(true);

	this.centerZoom = false;
	this.allowAutoPanning = true;
	
	// Enables cloning of connection sources
	this.connectionHandler.setCreateTarget(false);
	
	// Disables built-in connection starts
	this.connectionHandler.isValidSource = function()
	{
		return mxConnectionHandler.prototype.isValidSource.apply(this, arguments) && urlParams['connect'] != '2';
	};

	// Sets the style to be used when an elbow edge is double clicked
	this.alternateEdgeStyle = 'orthogonalEdgeStyle';

	if (stylesheet == null)
	{
		this.loadStylesheet();
	}

	//-- nwj - set default edge style
	var style = new Object();
	style[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ELBOW; //mxConstants.EDGESTYLE_TOPTOBOTTOM; //mxConstants.EDGESTYLE_SEGMENT;//mxConstants.EDGESTYLE_ELBOW; //mxConstants.EDGESTYLE_ORTHOGONAL;
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
	style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_STROKECOLOR] = '#000000';
	style[mxConstants.STYLE_STROKEWIDTH] = 2;
	style[mxConstants.STYLE_ROUNDED] = true;
	this.getStylesheet().putDefaultEdgeStyle(style);
	
   
    // Shows hand cursor while panning
	this.panningHandler.addListener(mxEvent.PAN_START, mxUtils.bind(this, function()
	{
		this.container.style.cursor = 'pointer';
	}));
			
	this.panningHandler.addListener(mxEvent.PAN_END, mxUtils.bind(this, function()
	{
		this.container.style.cursor = 'default';
	}));

	//-- run edit option for the selected cell
	this.addListener(mxEvent.DOUBLE_CLICK, mxUtils.bind(this, function()
	{
		var aCell = this.getSelectionCell();
		var strAct = "";
		if(aCell)
		{
			var c = "";
			switch(aCell.htl.type)
			{
				case "start":
					strAct = 'editworkflow';
					break;
				case "stage":
					strAct = 'editstage';
					break;
				case "auth":
					strAct = 'editauth';
					break;
				case "startcond":
					strAct = 'editstagestartcond';
					break;
				case "statuscond":
					strAct = 'editstagestatuscond';
					break;
				case "link":
					//-- check if a condition link
					if(aCell.htl.condid!="")
					{
						strAct ='editcond'
					}
					break;
				default:
					return;
			}
			if(strAct!="" && ESP.editorUi.actions!="")ESP.editorUi.actions.get(strAct).funct();
		}
	}));

    // Adds support for HTML labels via style. Note: Currently, only the Java
    // backend supports HTML labels but CSS support is limited to the following:
    // http://docs.oracle.com/javase/6/docs/api/index.html?javax/swing/text/html/CSS.html
	this.isHtmlLabel = function(cell)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
		
		return style['html'] == '1';
	};
	
	// Unlocks all cells
	this.isCellLocked = function(cell)
	{
		return false;
	};

};

// Graph inherits from mxGraph
mxUtils.extend(Graph, mxGraph);

/**
 * Allows to all values in fit.
 */
Graph.prototype.minFitScale = null;

/**
 * Allows to all values in fit.
 */
Graph.prototype.maxFitScale = null;

/**
 * Loads the stylesheet for this graph.
 */
Graph.prototype.loadStylesheet = function()
{
    var node = mxUtils.load(STYLE_PATH + '/default.xml').getDocumentElement();
	var dec = new mxCodec(node.ownerDocument);
	dec.decode(node, this.getStylesheet());
};


Graph.prototype.isCellConnectable = function(cell)
{
	
	//-- if cell is a condition then allow them to drag a new stage (?in the future)
	return false;
}
/**
 * Customized graph for touch devices.
 */
Graph.prototype.initTouch = function()
{
};

/**
 * Implements touch devices.
 */
(function()
{
	// Touch-specific static overrides
	if (touchStyle)
	{
	}
	else
	{

	}
})();
