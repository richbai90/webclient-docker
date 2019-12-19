//-- temporary variables to hold mouse x-y pos.
var iMousePosX = 0;
var iMousePosY = 0;


var rightclick = false;



//-- handle mouse key down.
function mouseDown(e) 
{
	//-- get event button
	if (!e) var e = window.event; //-- ie
	if (e.which) rightclick = (e.which == 3); //-- mozilla
	else if (e.button) rightclick = (e.button == 2);

	if (rightclick) 
	{
		bMouseRightKeyDown = true;
	} 
	else 
	{
		bMouseLeftKeyDown = true;
	}

	return false;
}

//-- handle mouse key up.
function mouseUp(e) 
{
	if (!e) var e = window.event;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);

	if (rightclick) 
	{
		bMouseRightKeyDown = false;
	} 
	else 
	{
		bMouseLeftKeyDown = false;
	}
	return false;
}

// Process mouse movement.
function getMouseXY(posX, posY) 
{
	iMousePosX = posX;
	iMousePosY = posY;
}

// Mouse movement event handler
function getMouseXYPos(e) 
{
	if (!e) var e = window.event;
	getMouseXY(e.clientX + document.body.scrollLeft,e.clientY + document.body.scrollTop);
	return true;
}


//-- attach new event handlers.
//window.document.onmousedown = mouseDown;
//window.document.onmouseup = mouseUp;
//window.document.onmousemove = getMouseXYPos;
