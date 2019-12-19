//-- CONSTANTS 
var undefined;
var TRUE = true;

//-- pointer
var d = document;

var ISSUE_TYPE_HOT = 1;
var ISSUE_TYPE_KNOWN = 2;

var ISSUE_STATUS_OPEN = 1;
var ISSUE_STATUS_CLOSED = 16;
var ISSUE_STATUS_RESOLVED = 6;

//-- task status
var TASK_STATUS_COMPLETE = 16;
var TASK_STATUS_NOT_STARTED = 2;
var TASK_STATUS_INACTIVE = 1;
var TASK_STATUS_INPROGRESS = 3;
var TASK_STATUS_CANCELLED = 17;

//-- messagebox options
//--btn
var MB_OK =0; 
var MB_OKCANCEL = 1;
var MB_ABORTRETRYIGNORE = 2; 
var MB_YESNOCANCEL = 3;
var MB_YESNO = 4;
var MB_RETRYCANCEL = 5;
var MB_CANCELTRYCONTINUE = 6;
//-- icon
var MB_ICONSTOP = 16 
var MB_ICONQUESTION = 32 
var MB_ICONEXCLAMATION = 48 
var MB_ICONINFORMATION = 64 
//-- def btn
var MB_DEFBUTTON1 = 1
var MB_DEFBUTTON2 = 2
var MB_DEFBUTTON3 = 3
var MB_DEFBUTTON4 = 4
 
//-- btn responses
var IDNO = 0;
var IDYES = 6;
var IDOK = 1;
var IDCANCEL = 2


//-- call status
var _PENDING = 1;
var _UNASSIGNED = 2;
var _UNACCEPTED = 3;
var _ONHOLD = 4;
var _OFFHOLD = 5;
var _RESOLVED = 6;
var _DEFFERED = 7;
var _INCOMING = 8;
var _ESCO = 9;
var _ESCG = 10;
var _ESCA = 11;
var _LOST = 15;
var _CLOSED = 16;
var _CANCELLED = 17;
var _CLOSEDCHARGE = 18;
var CS_PENDING = 1;
var CS_UNASSIGNED = 2;
var CS_UNACCEPTED = 3;
var CS_ONHOLD = 4;
var CS_OFFHOLD = 5;
var CS_RESOLVED = 6;
var CS_DEFFERED = 7;
var CS_INCOMING = 8;
var CS_ESCO = 9;
var CS_ESCG = 10;
var CS_ESCA = 11;
var CS_LOST = 15;
var CS_CLOSED = 16;
var CS_CANCELLED = 17;
var CS_CLOSEDCHARGE = 18;
var CS_CLOSEDCHARGABLE  = 18;

//-- email templates
var TEMPLATE_NONE = 0;
var TEMPLATE_LOGCALL =1;
var TEMPLATE_CLOSECALL =2;
var TEMPLATE_UPDATECALL =4;
var TEMPLATE_HOLDCALL = 8;
var TEMPLATE_ESCALATION =16;
var TEMPLATE_SYSTEMAUTOMAILBOCK =256;
var TEMPLATE_MAILSIGNATURE = 4096;
var TEMPLATE_BULKMAIL = 8192;
var TEMPLATE_DEFAULT = 268435456; // NOT YET USED... 


//-- MAILBOX RIGHTS & MSG
var _EM_RIGHTS_MSG = new Array();
var _EM_CANVIEW = 1; _EM_RIGHTS_MSG[1] = "You do not have permission to view the selected mailbox";
var _EM_CANDELETE = 2; _EM_RIGHTS_MSG[2] = "You do not have permission to delete messages";
var _EM_CANSEND = 4; _EM_RIGHTS_MSG[4] = "You do not have permission to send messages";
var _EM_CANMOVE = 8; _EM_RIGHTS_MSG[8] = "You do not have permission to move messages";

var _EM_FOLDERCREATE = 16; _EM_RIGHTS_MSG[16] = "You do not have permission to create folders";
var _EM_FOLDERDELETE = 32;_EM_RIGHTS_MSG[32] = "You do not have permission to delete folders";
var _EM_FOLDERRENAME = 64;_EM_RIGHTS_MSG[64] = "You do not have permission to rename folders";

var _EM_CANFLAGUNFLAG = 128; _EM_RIGHTS_MSG[128] = "You do not have permission to flag or unflag messages";
var _EM_CANFLAGUNREAD = 256;_EM_RIGHTS_MSG[256] = "You do not have permission to mark massages as unread";
var _EM_CANEDIT = 512;_EM_RIGHTS_MSG[512] = "You do not have permission to edit messages";
var _EM_CANATTACH = 1024;_EM_RIGHTS_MSG[1024] = "You do not have permission to attach files to messages";

var _EM_TEMPLATEADD = 2048;
var _EM_TEMPLATEEDIT = 4096;
var _EM_TEMPLATEDELETE = 8192;
var _EM_TEMPLATEUSE = 131072; _EM_RIGHTS_MSG[131072] = "You do not have permission to use email templates";

var _EM_ABOOKADD = 16384;
var _EM_ABOOKEDIT = 32768;
var _EM_ABOOKVIEW = 262144;
var _EM_ABOOKDELETE = 65536;

var _EM_MANAGEQLOG = 536870912;_EM_RIGHTS_MSG[536870912] = "You do not have permission to manage quick log templates";
var _EM_CANQLOG = 1073741824;_EM_RIGHTS_MSG[1073741824] = "You do not have permission to use quick log templates";



//-- analyst status 
var ANALYST_STATUS_ATLUNCH = 1;
var ANALYST_STATUS_ONTRAINING =2;
var ANALYST_STATUS_ONHOLIDAY =3;
var ANALYST_STATUS_INAMEETING=4;
var ANALYST_STATUS_OUTOFOFFICE=5;
var ANALYST_STATUS_DONOTDISTURB=6;
var ANALYST_STATUS_AVAILABLE =0;

var ANALYST_STATUS_ATLUNCH_MSG = "is at lunch.";
var ANALYST_STATUS_ONTRAINING_MSG ="is on training.";
var ANALYST_STATUS_ONHOLIDAY_MSG ="is on holiday.";
var ANALYST_STATUS_INAMEETING_MSG="is in a meeting.";
var ANALYST_STATUS_OUTOFOFFICE_MSG="is out of the office.";
var ANALYST_STATUS_DONOTDISTURB_MSG="does not want to be disturbed.";
var ANALYST_STATUS_AVAILABLE_MSG ="is available.";

//-- ANALYST DEFAULT SETTINGS
var ANALYST_DEFAULT_UPDATEPRIVATE= 1; 
var ANALYST_DEFAULT_UPDATESENDEMAIL = 2;
var ANALYST_DEFAULT_HOLDPRIVATE = 4;
var ANALYST_DEFAULT_HOLDSENDEMAIL = 8;
var ANALYST_DEFAULT_CLOSEPRIVATE = 16;
var ANALYST_DEFAULT_CLOSESENDEMAIL = 32;
var ANALYST_DEFAULT_CLOSEKNOWLEDGEBASE = 64;
var ANALYST_DEFAULT_CLOSECHARGABLE = 128;
var ANALYST_DEFAULT_FORCEUPDATEWHENACCEPCALL = 1024;
var ANALYST_DEFAULT_FORCEUPDATEWHENACCEPTCALL = 1024;
var ANALYST_DEFAULT_AUTOFILLPROBLEMTEXT = 2048;
var ANALYST_DEFAULT_AUTOFILLRESOLUTIONTEXT = 4096;
var ANALYST_DEFAULT_RESOLVEBYDEFAULT = 8192 ;
var ANALYST_DEFAULT_LOGSENDEMAIL = 16384 ; 
var ANALYST_DEFAULT_INCLUDESUBJECT = 32768 ;
var ANALYST_DEFAULT_DISABLESENDSURVEY = 65536;
var ANALYST_DEFAULT_SETSENDSURVEY = 131072 ;


//-- CLIENT RIGHTS GROUPS
var ANALYST_RIGHT_A_GROUP = 1; 
var ANALYST_RIGHT_B_GROUP = 2; 
var ANALYST_RIGHT_C_GROUP = 3;
var ANALYST_RIGHT_D_GROUP = 4; 
var ANALYST_RIGHT_E_GROUP = 5;
var ANALYST_RIGHT_F_GROUP = 6;
 
//-- CLIENT GROUP RIGHTS
var _CALL_RIGHTS_MSG = new Array();
_CALL_RIGHTS_MSG[1] = new Array();
ANALYST_RIGHT_A_CANASSIGNCALLS = 1 ; _CALL_RIGHTS_MSG[1][1] = "You do not have permission to assign requests";
ANALYST_RIGHT_A_CANCLOSECALLS = 2 ; _CALL_RIGHTS_MSG[1][2] = "You do not have permission to close requests";
ANALYST_RIGHT_A_CANLOGCALLS = 4 ; _CALL_RIGHTS_MSG[1][4] = "You do not have permission to log new requests";
ANALYST_RIGHT_A_CANUPDATECALLS = 8 ; _CALL_RIGHTS_MSG[1][8] = "You do not have permission to update requests";
ANALYST_RIGHT_A_CANMODIFYCALLS = 16 ; _CALL_RIGHTS_MSG[1][16] = "You do not have permission to modify requests";
ANALYST_RIGHT_A_CANSWITCHREP = 32 ; _CALL_RIGHTS_MSG[1][32] = "You do not have permission to switch analyst context";
ANALYST_RIGHT_A_CANSWITCHGROUP= 64 ; _CALL_RIGHTS_MSG[1][64] = "You do not have permission to switch group context";
ANALYST_RIGHT_A_CANCANCELCALLS = 128 ; _CALL_RIGHTS_MSG[1][128] = "You do not have permission to cancel requests";
ANALYST_RIGHT_A_CANDELETEWORKITEMS = 256; _CALL_RIGHTS_MSG[1][256] = "You do not have permission to delete work items";
ANALYST_RIGHT_A_CANPLACECALLONHOLD = 512; _CALL_RIGHTS_MSG[1][512] = "You do not have permission to place requests on hold";
ANALYST_RIGHT_A_CANPLACECALLONHOL = 512; _CALL_RIGHTS_MSG[1][512] = "You do not have permission to place requests on hold";
ANALYST_RIGHT_A_CANTAKECALLOFFHOLD = 1024; _CALL_RIGHTS_MSG[1][1024] = "You do not have permission to take requests off hold";
ANALYST_RIGHT_A_CANCHANGEPRIORITY = 2048; _CALL_RIGHTS_MSG[1][2048] = "You do not have permission to change the priority of requests";
ANALYST_RIGHT_A_CANATTACHFILESTOCALLS = 4096;  _CALL_RIGHTS_MSG[1][4096] = "You do not have permission to attach files";
ANALYST_RIGHT_A_CANREADFILESONCALLS = 8192 ; _CALL_RIGHTS_MSG[1][8192] = "You do not have permission to read file attachments";
ANALYST_RIGHT_A_CANCREATESCHEDCALLS = 262144; _CALL_RIGHTS_MSG[1][262144] = "You do not have permission to create scheduled requests";
ANALYST_RIGHT_A_CANEDITSCHEDCALLS = 524288 ;
ANALYST_RIGHT_A_CANDELETESCHEDCALLS= 1048576 ;
ANALYST_RIGHT_A_CANCREATENEWTASKS = 2097152 ; _CALL_RIGHTS_MSG[1][2097152] = "You do not have permission to create new workflow tasks";
ANALYST_RIGHT_A_CANCHANGETASKOWNERSHIPGRP = 4194304 ; _CALL_RIGHTS_MSG[1][4194304] = "You do not have permission to change workflow group ownership";
ANALYST_RIGHT_A_CANCHANGETASKOWNERSHIP = 8388608 ; _CALL_RIGHTS_MSG[1][8388608] = "You do not have permission to change workflow analyst ownership";
ANALYST_RIGHT_A_MODIFYTASKGRP = 16777216 ; _CALL_RIGHTS_MSG[1][16777216] = "You do not have permission to modify workflow group ownership";
ANALYST_RIGHT_A_MODIFYTASK = 33554432 ; _CALL_RIGHTS_MSG[1][33554432] = "You do not have permission to modify workflow tasks";
ANALYST_RIGHT_A_CANUPDATENONOWNEDCALLS = 67108864 ; _CALL_RIGHTS_MSG[1][67108864] = "You do not have permission to update non-assigned requests";
ANALYST_RIGHT_A_CANRESOLVECALLS = 134217728 ; _CALL_RIGHTS_MSG[1][134217728] = "You do not have permission to resolve requests";
ANALYST_RIGHT_A_CANCHANGECALLPROFILECODE = 268435456 ; _CALL_RIGHTS_MSG[1][268435456] = "You do not have permission to change the profile for requests";
ANALYST_RIGHT_A_CANREACTIVATECALLS = 536870912 ; _CALL_RIGHTS_MSG[1][536870912] = "You do not have permission to reactivate requests";
ANALYST_RIGHT_A_CANUPDATECALLDIARYITEMS = 1073741824 ; _CALL_RIGHTS_MSG[1][1073741824] = "You do not have permission to update request diary enteries";
ANALYST_RIGHT_A_CANDELETEATTACHEDFILES = 2147483648; _CALL_RIGHTS_MSG[1][2147483648] = "You do not have permission to delete file attachments";

_CALL_RIGHTS_MSG[2] = new Array();
ANALYST_RIGHT_B_CANCHANGECALLCLASS = 1 ;_CALL_RIGHTS_MSG[2][1] = "You do not have permission to change the class of a request";
ANALYST_RIGHT_B_CANCHANGECALLCONDITION = 2 ; _CALL_RIGHTS_MSG[2][2] = "You do not have permission to change the condition of a request";
ANALYST_RIGHT_B_CANCREATEISSUES = 4; _CALL_RIGHTS_MSG[2][4] = "You do not have permission to create issues";
ANALYST_RIGHT_B_CANMODIFYISSUES = 8; _CALL_RIGHTS_MSG[2][8] = "You do not have permission to modify issues";
ANALYST_RIGHT_B_CANCLOSEISSUES = 16; _CALL_RIGHTS_MSG[2][16] = "You do not have permission to resolve/close issues";
ANALYST_RIGHT_B_CANRESOLVEISSUES = 16; 
ANALYST_RIGHT_B_CANBACKDATENEWCALLLOGS = 32 ; _CALL_RIGHTS_MSG[2][32] = "You do not have permission to back date new requests";

ANALYST_RIGHT_C_CANMANAGECALLPROFILES = 1 ;
ANALYST_RIGHT_C_CANMANAGESLAS = 2 ;
ANALYST_RIGHT_C_CANMANAGEWORKFLOWTEMPLATES = 4 ;
ANALYST_RIGHT_C_CANMANAGESKILLS = 8 ;
ANALYST_RIGHT_C_CANMANAGECALLCLASSES = 16 ;
ANALYST_RIGHT_C_CANMANAGECUSTOMERWEBACCESS = 32 ;
ANALYST_RIGHT_C_CANADDSLA = 64 ;
ANALYST_RIGHT_C_CANADDGENERICCODES = 128 ;
ANALYST_RIGHT_C_CANADDCODES = 256 ;
ANALYST_RIGHT_C_CANMANAGEANALYSTWEBACCESS  = 512 ;
ANALYST_RIGHT_C_CANMANAGECALLSCRIPTS  = 1024 ;
ANALYST_RIGHT_C_CANMANAGEDATAMERGES  = 2048 ;
ANALYST_RIGHT_C_CANMODIFYSLA  = 32768 ;
ANALYST_RIGHT_C_CANMODIFYGENERICCODES  = 65536 ;
ANALYST_RIGHT_C_CANMODIFYCODES  = 131072 ;
ANALYST_RIGHT_C_CANADDTOGAL  = 262144 ;
ANALYST_RIGHT_C_CANEDITGAL  = 524288 ;
ANALYST_RIGHT_C_CANDELETEFROMGAL  = 1048576 ;
ANALYST_RIGHT_C_CANDELETESLA  = 16777216 ;
ANALYST_RIGHT_C_CANDELETEGENERICCODES  = 33554432 ;
ANALYST_RIGHT_C_CANDELETECODES  = 67108864 ;
ANALYST_RIGHT_C_CANADDTOKNOWLEDGEBASE  = 134217728 ;

_CALL_RIGHTS_MSG[4] = new Array();
ANALYST_RIGHT_D_CANVIEWREPORTS  = 1 ;
ANALYST_RIGHT_D_CANEDITFOLDERS  = 2 ;
ANALYST_RIGHT_D_CANCREATEEDITREPORTS  =  4 ;
ANALYST_RIGHT_D_CANDELETEREPORTS  = 8 ;
ANALYST_RIGHT_D_IMPORTEMPORTREPORTS = 16 ;
ANALYST_RIGHT_D_CANSCHEDULEREPORTS  = 32 ;
ANALYST_RIGHT_D_CANCREATECUSTOMSEARCHES  = 512; 
ANALYST_RIGHT_D_CANRUNCUSTOMSEARCHES  = 1048 ;
ANALYST_RIGHT_D_CANDELETECUSTOMSEARCHES = 2048 ;
ANALYST_RIGHT_D_CANCHANGEPERSONELSTATUS  = 8192; 
ANALYST_RIGHT_D_CANSENDPOPUPMESSAGES  = 16384 ;
ANALYST_RIGHT_D_CANUSEPERSONALMULTIPASTE  = 32768 ;
ANALYST_RIGHT_D_CANUSEGROUPMULTIPASTE  = 65536 ;
ANALYST_RIGHT_D_CANEDITPERSONALMULTIPASTE  = 131072 ;
ANALYST_RIGHT_D_CANEDITGROUPMULTIPASTE  = 262144 ;
ANALYST_RIGHT_D_CANEDITKEYBOARDSHORTCUTS  = 524288 ;
ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS  = 1048576;  _CALL_RIGHTS_MSG[4][1048576] = "You do not have permission to search the KnowledgeBase";
ANALYST_RIGHT_D_CANADDKBDOCUMENTS  = 4194304; _CALL_RIGHTS_MSG[4][4194304] = "You do not have permission to add articles to the KnowledgeBase";
ANALYST_RIGHT_D_CANADDEXTKBDOCUMENTS = 8388608 ; _CALL_RIGHTS_MSG[4][8388608] = "You do not have permission to add external documents to the KnowledgeBase";
ANALYST_RIGHT_D_CANEDITKBDOCUMENTS  = 16777216 ; _CALL_RIGHTS_MSG[4][16777216] = "You do not have permission to modify KnowledgeBase articles";
ANALYST_RIGHT_D_CANDELKBDOCUMENTS  = 33554432 ;
ANALYST_RIGHT_D_CANMANAGEKBCATALOGS  = 67108864 ;
ANALYST_RIGHT_D_CANMANAGECUSTOMTOOLS  = 134217728 ;

ANALYST_RIGHT_E_CANRUNSQLSELECT  = 1 ;
ANALYST_RIGHT_E_CANRUNSQLINSERT  = 2 ;
ANALYST_RIGHT_E_CANRUNSQLUPDATE  = 4 ;
ANALYST_RIGHT_E_CANRUNSQLDELETE  = 8 ;
ANALYST_RIGHT_E_CANRUNSQLDROPINDEX = 16 ;
ANALYST_RIGHT_E_CANRUNSQLDROPTABLE  = 32 ;
ANALYST_RIGHT_E_CANRUNSQLALTER  = 64 ;
ANALYST_RIGHT_E_CANRUNSQLTRUNCATE = 128 ;
ANALYST_RIGHT_E_CANRUNSQLDESCRIBE  = 512 ;
ANALYST_RIGHT_E_CANRUNSQLTRANSACT  = 1024 ;
ANALYST_RIGHT_E_CANRUNSQLGRANTREVOKE = 2048 ;
ANALYST_RIGHT_E_CANRUNSQLCREATEINDEX  = 4096 ;
ANALYST_RIGHT_E_CANRUNSQLCREATETABLE  = 8192 ;

_CALL_RIGHTS_MSG[6] = new Array();
ANALYST_RIGHT_F_CANCREATEDATADICTIONARIES  = 1 ;
ANALYST_RIGHT_F_CANEDITDATADICTIONARY  = 2 ;
ANALYST_RIGHT_F_CANSWITCHDATADICTIONARIES  = 4 ; _CALL_RIGHTS_MSG[6][4] = "You do not have permission to switch applications.";
ANALYST_RIGHT_F_CANDELETEDATADICTIONARIES  = 8 ;



//-- email permissions

//-- form element types
var  FE_LINE = 1 ;
var FE_ELLIPSE = 2; 
var FE_RECTANGLE = 3; 
var FE_TEXT = 4 ; //-- label
var FE_FIELD = 5;
var FE_IMAGE =6;
var FE_PUSHBUTTON =7;
var FE_FIELDNAME =8; // Field bound Label 
var FE_TABCONTROL =9;
var FE_CHECKBUTTON =10 ;
var FE_RADIOBUTTON = 11; 
var FE_FORMULAFIELD = 12; 
var FE_DUALFIELD = 20;

//-- table rights
var _CAN_BROWSE_TABLEREC = 1;
var _CAN_VIEW_TABLEREC = 2;
var _CAN_ADDNEW_TABLEREC = 4;
var _CAN_UPDATE_TABLEREC = 8;
var _CAN_DELETE_TABLEREC = 16;

var _element_numeric_types = new Array(); 
_element_numeric_types["Line"] = FE_LINE;
_element_numeric_types["Rectange"] = FE_RECTANGLE;
_element_numeric_types["Text"] = FE_TEXT;
_element_numeric_types["Field"] = FE_FIELD;
_element_numeric_types["Image"] = FE_IMAGE;
_element_numeric_types["EventButton"] = FE_PUSHBUTTON;
_element_numeric_types["MenuButton"] = FE_PUSHBUTTON;
_element_numeric_types["FieldName"] = FE_FIELDNAME;
_element_numeric_types["TabControl"] = FE_TABCONTROL;
_element_numeric_types["Form Flags"] = FE_CHECKBUTTON;
_element_numeric_types["FormulaField"] = FE_FORMULAFIELD;
_element_numeric_types["DualSearchField"] = FE_DUALFIELD;


//-- FORM RETURN STATES - defect 87565 - VALIDATE_DEFAULT was set to true
var VALIDATE_OK = 1;
var VALIDATE_FAIL = 0;
var VALIDATE_DEFAULT = 2;


function _get_table_right_desc(iCheckRight)
{
	iCheckRight--;iCheckRight++;
	switch(iCheckRight)
	{
		case 1:
			return "BROWSE";
			break;
		case 2:
			return "VIEW";
			break;
		case 4:
			return "ADD NEW";
			break;
		case 8:
			return "UPDATE";
			break;
		case 16:
			return "DELETE";
			break;
	}
	return "undefined"
}
