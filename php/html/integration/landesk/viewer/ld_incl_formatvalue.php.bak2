<?php 
function windateparse($timestamp, $fmt = "")
{
	// This validation code is specific to use withing the integrator and will need adjusting to use the function elsewhere
	if (!strlen($fmt))
	{
		if (($GLOBALS[fmt]) && (!strpos($GLOBALS[fmt], "dtfmt"))) $fmt = $GLOBALS[fmt];
		else $fmt = "yyyy/MM/dd HH:mm:ss";
	}
	// End of validation

	$len = strlen($fmt);
	for ($x = 0 ; $x < $len ; $x++) $string[$x] = substr($fmt,$x,1);
	$char = 0;
	$fmt = '';
	while ($char < $len)
	{
		switch($string[$char])
		{
			case 'H':
				if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "H";
					$char++;
				}
				else $fmt .= "G";
			break;
			case 'h':
				if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "h";
					$char++;
				}
				else $fmt .= "g";
			break;
			case 'm':
				if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "i";
					$char++;
				}
				else
				{
					$tmp = (INT)date("i",$timestamp);
					$fmt .= $tmp;
				}
			break;
			case 's':
				if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "s";
					$char++;
				}
				else
				{
					$tmp = (INT)date("s",$timestamp);
					$fmt .= $tmp;
				}
			break;
			case 't':
				if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "A";
					$char++;
				}
				else
				{
					$tmp = substr(date("A",$timestamp),0,1);
					if ($tmp == 'A') $fmt .= "\\A";
					else $fmt .= 'P';
				}
			break;
			case 'd':
				if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "d";
					$char++;
				}
				else $fmt .= "j";
			break;
			case 'M':
				if (($string[$char] == $string[($char+1)]) && ($string[$char] == $string[($char+2)]) && ($string[$char] == $string[($char+3)]))
				{
					$fmt .= "F";
					$char+=3;
				}
				else if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "m";
					$char++;
				}
				else $fmt .= "n";
			break;
			case 'y':
				if (($string[$char] == $string[($char+1)]) && ($string[$char] == $string[($char+2)]) && ($string[$char] == $string[($char+3)]))
				{
					$fmt .= "Y";
					$char+=3;
				}
				else if ($string[$char] == $string[($char+1)])
				{
					$fmt .= "y";
					$char++;
				}
			break;
			default:
				$fmt .= $string[$char];
			break;
		}
		$char++;
	}
	return date($fmt,$timestamp);
}

function commarise($str, $splitter = ",", $every = 3)
{
	$str = trim($str);

	$decimal = strpos($str, ".");
	if ($decimal)
	{
		$decimal = substr($str,$decimal);
		$str = str_replace($decimal, "", $str);
	}
	else if ($decimal === 0) return $str;

	$x = strlen($str)-1;
	if ($x > $every-1)
	{
		$tstr = '';
		$str = strrev($str);
		while ($x >= 0)
		{
			if ((($x+1)%$every) || (!$tstr)) $tstr .= substr($str,$x,1);
			else $tstr .= $splitter.substr($str,$x,1);
			$x--;
		}
	}
	else return $str.$decimal;
	return $tstr.$decimal;
}

function ipfmt($ip)
{
	$temp = explode(".",$ip);
	return (INT)($temp[0]).".".(INT)($temp[1]).".".(INT)($temp[2]).".".(INT)($temp[3]);
}

function yesno($value)
{
	$value = trim($value);
	if (($value == "Yes") || ($value == "True")) return '<img src="images/symbol_yes.gif" height="11" width="13">';
	else if (($value == "No") || ($value == "False")) return '<img src="images/symbol_no.gif" height="11" width="13">';
		else return $value;
}

function lookup($table, $column, $value="")
{
	switch ($table)
	{
// BIOS
		case "bios":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"BiosDate"			=> "Date",
								"SystemModel"		=> "System Model",
								"IDBytes"			=> "ID Bytes",
								"Copyright"			=> "Copyright String",
								"AssetTag"			=> "Asset Tag",
								"ServiceTag"		=> "Service Tag",
								"MonitorModel"		=> "Monitor Model",
								"MonManufacturer"	=> "Monitor Manufacturer",
								"RomVersion"		=> "ROM Version"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "biosstrings":
			if (strlen($value))
			{
				if ($column == "ScanDate") return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				return $value;
			}
			else
			{
				$hash = array(	"StrSize"	=> "Size",
								"ScanDate"	=> "Scan Date"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "manufacturer":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"ManufactVal"	=> "Value",
								"Copyright1"	=> "Copyright Notice1",
								"Copyright2"	=> "Copyright Notice2"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Bus
		case "bus":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array("BusType"	=> "Type");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// ODBC
		case "odbcdriver":
			if (strlen($value))
			{
				if ($column == "DriverDate") return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				return $value;
			}
			else
			{
				$hash = array(	"ODBCVersion" 	=> "ODBC Version",
								"DriverDate"	=> "Date"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "odbcsystemdsn":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array("DatabaseName" => "Name");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Keyboard
		case "keyboard":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"SubType"		=> "Sub Type",
								"CodePage"		=> "Code Page",
								"NumFunctKeys"	=> "Number of Function keys"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// LANDesk Management
		case "commonagent":
			if (strlen($value))
			{
				if (strpos(" Secure,Installed",$column)) return yesno($value);
				return $value;
			}
			else
			{
				return $column;
			}
		break;
		case "commonagent8":
			if (strlen($value))
			{
				if (strpos(" Installed",$column)) return yesno($value);
				return $value;
			}
			else
			{
				return $column;
			}
		break;
		case "trustedcerts":
			if (strlen($value))
			{
				if ($column == "Created") return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				return $value;
			}
			else
			{
				$hash = array(	"Organization"	=> "Organisation",
								"CertKey"		=> "Key"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "wuseragent":
			if (strlen($value))
			{
				if (strpos(" AllowReboot,AllowFileTransfer,AllowChat,AllowRemExec,AllowDosDiag,AllowWinDiag,AudibleSignal,PermissionReq,AllowRemControl,Installed,Secure,DispMsgs",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"AllowReboot"		=> "Allow Reboot",
								"AllowFileTransfer"	=> "Allow File Transfer",
								"AllowChat"			=> "Allow Chat",
								"AllowRemExec"		=> "Allow Remote Execute",
								"AllowDosDiag"		=> "Allow DOS Diagnostics",
								"AllowWinDiag"		=> "Allow Windows Diagnostics",
								"VisibleSignal"		=> "Visible Signal",
								"AudibleSignal"		=> "Audible Signal",
								"PermissionReq"		=> "Permission Required",
								"AllowRemControl"	=> "Allow Remote Control",
								"SecurityType"		=> "Security Type",
								"SysVisSig"			=> "System Tray Visible Signal",
								"PermitView"		=> "Permitted Viewers",
								"CmdLn"				=> "Command Line",
								"DispMsgs"			=> "Display Messages"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Mass Storage
		case "cdromdrives":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"DriveNo" 		=> "Number",
								"DriveLetter" 	=> "Drive Letter",
								"MediaType"		=> "Media Type"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "fixeddrives":
			if (strlen($value))
			{
				if (strpos(" StorageTotal",$column)) return sprintf("%s MB",commarise(sprintf("%.1f",($value/10))));
				if (strpos(" Cylinders",$column)) return commarise($value);
				return $value;
			}
			else
			{
				$hash = array(	"DriveNo" 		=> "Number",
								"StorageTotal" 	=> "Total Storage",
								"BytesPerSect"	=> "Bytes Per Sector"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "floppydrives":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"DriveNo" 		=> "Number",
								"DriveType" 	=> "Type"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "logicaldrives":
			if (strlen($value))
			{
				if (strpos(" StorageTotal,StorageAvail",$column)) return sprintf("%s MB",commarise(sprintf("%.1f",($value/10))));
				if (strpos(" Removable",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"SerialNumber" 	=> "Serial Number",
								"FileSystem" 	=> "File System",
								"DriveLetter" 	=> "Drive Letter",
								"StorageTotal"	=> "Total Storage",
								"StorageAvail"	=> "Available Storage"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Mass Storage
		case "memory":
			if (strlen($value))
			{
				if (strpos(" BytesTotal,BytesAvail,PageMaxSize,PageAvail2",$column)) return sprintf("%s KB",commarise($value));
				return $value;
			}
			else
			{
				$hash = array(	"BytesTotal" 	=> "Bytes Total",
								"BytesAvail" 	=> "Bytes Available",
								"PageMaxSize" 	=> "Pagefile Max Size",
								"PageAvail2"	=> "Pagefile Available",
								"NumSlots"		=> "Number of Slots"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "memoryslot":
			if (strlen($value))
			{
				if (strpos(" CurrentSpeed",$column)) return sprintf("%s ns",commarise($value));
				if (strpos(" InstalledSize",$column)) return sprintf("%s MB",commarise($value));
				return $value;
			}
			else
			{
				$hash = array(	"SlotNo" 			=> "Number",
								"ErrDetMeth" 		=> "Error Detecting Method",
								"SocketDesignation" => "Socket Designation",
								"CurrentSpeed" 		=> "Current Speed",
								"CurrentType" 		=> "Current Type",
								"InstalledSize" 	=> "Installed Size"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Modems
		case "modem":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"ModemNo" 			=> "Number",
								"BaudRate" 			=> "Baud Rate",
								"CharacterBits" 	=> "Character Bits",
								"StopBits" 			=> "Stop Bits",
								"FlowControl" 		=> "Flow Control"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Motherboard
		case "motherboard":
			if (strlen($value))
			{
				if (strpos(" MaxCPU,BusSpeed",$column)) return sprintf("%s MHz",commarise($value));
				return $value;
			}
			else
			{
				$hash = array(	"MaxCPU"	=> "Max CPU Supported",
								"BusSpeed"	=> "Bus Speed"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "mbcache":
			if (strlen($value))
			{
				if (strpos(" CacheSize",$column)) return sprintf("%s KB",commarise($value));
				return $value;
			}
			else
			{
				$hash = array(	"CacheNo"			=> "Number",
								"CacheSize"			=> "Cache Size",
								"WritePolicy"		=> "Write Policy",
								"CLevel"			=> "Level",
								"ErrorCorrection"	=> "Error Correction"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "mbslot":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array("SlotNo" => "Number");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Mouse
		case "pointingdevices":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"DriverName"	=> "Driver Name",
								"DriverVersion"	=> "Driver Version",
								"NumButtons"	=> "Buttons",
								"ConnectorType"	=> "Connection Type"
				);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Multimedia Files & Computer
		case "computer":
			if (strlen($value))
			{
				if (strpos(" MultiMedSize",$column)) return sprintf("%s MB",commarise(sprintf("%.1f",($value/10))));
				if (strpos(" HWLastScanDate,SWLastScanDate,LastUpdInvSvr",$column)) return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				if (strpos(" NumMultiMedFiles,SWNumFiles",$column)) return commarise($value);
				return $value;
			}
			else
			{
				$hash = array(	"MultiMedExt"		=> "Scanned Extensions",
								"NumMultiMedFiles"	=> "Number of Media Files",
								"MultiMedSize"		=> "Total Size",
								"DeviceId"			=> "Device ID",
								"DeviceName"		=> "Device Name",
								"LoginName"			=> "Login Name",
								"FullName"			=> "Full Name",
								"DisplayName"		=> "Display Name",
								"SWNumFiles"		=> "Number of Files",
								"HWLastScanDate"	=> "Last Hardware Scan Date",
								"SWLastScanDate"	=> "Last Software Scan Date",
								"InventoryServer"	=> "Inventory Server",
								"PrimaryOwner"		=> "Primary Owner",
								"LastUpdInvSvr"		=> "Last Updated by Inventory Server",
								"ScanType"			=> "Scan Type",
								"DomainName"		=> "Domain Name",
								"FlpyDrvCnt"		=> "Floppy Drive Count"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Network
		case "networksoftware":
			if (strlen($value))
			{
				if (strpos(" NicAddress",$column)) return commarise($value,"-",2);
				if (strpos(" NetBiosExists",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"NicAddress"		=> "NIC Address",
								"NetBiosExists"		=> "NetBIOS Exists"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "ipx":
			if (strlen($value))
			{
				if (strpos(" NodeAddr",$column)) return commarise($value,"-",2);
				return $value;
			}
			else
			{
				$hash = array(	"NetworkNumber"		=> "Network Number",
								"NodeAddr"			=> "Node Address"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "tcp":
			if (strlen($value))
			{
				if (strpos(" NetbiosRes,WINSProxyEnabled,IPRouting",$column)) return yesno($value);
				if (strpos(" DefGtwyAddr,SubnetMask,SubnetBroadcastAddr,Address",$column)) return ipfmt($value);
				return $value;
			}
			else
			{
				$hash = array(	"HostName"				=> "Host Name",
								"IPRouting"				=> "IP Routing",
								"WINSProxyEnabled"		=> "WINS Proxy Enabled",
								"NetbiosRes"			=> "NetBIOS Resolution uses DNS",
								"SubnetMask"			=> "Subnet Mask",
								"DefGtwyAddr"			=> "Default Gateway Address",
								"SubnetBroadcastAddr"	=> "Subnet Broadcast Address"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "boundadapter":
			if (strlen($value))
			{
				if (strpos(" LeaseObtained,LeaseExpires",$column)) return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				if (strpos(" PhysAddress",$column)) return commarise($value,"-",2);
				if (strpos(" IPAddress,SubnetMask,DefaultGateway,DHCPServer,PrimaryWINS,PrimaryDNS",$column)) return ipfmt($value);
				if (strpos(" DHCPEnabled,Hidden",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"AdapterNo"			=> "Number",
								"PhysAddress"		=> "Physical Address",
								"IPAddress"			=> "IP Address",
								"SubnetMask"		=> "Subnet Mask",
								"DefaultGateway"	=> "Default Gateway",
								"DHCPServer"		=> "DHCP Server",
								"PrimaryWINS"		=> "Primary WINS Server",
								"LeaseObtained"		=> "Lease Obtained",
								"LeaseExpires"		=> "Lease Expires",
								"DHCPEnabled"		=> "DHCP Enabled",
								"PrimaryDNS"		=> "Primary DNS Server"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "networkadapter":
			if (strlen($value))
			{
				if (strpos(" Active",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array("AdapterNo" => "Number");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// OS
		case "operating_system":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array("OSType" => "Name");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "osnt":
			if (strlen($value))
			{
				if (strpos(" InstallDate",$column)) return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 3, 2),substr($value, 0, 2),substr($value, 6, 4)));
				if (strpos(" Server",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"CurrentBuild"		=> "Current Build",
								"CurrentType"		=> "Current Type",
								"CurrentVersion"	=> "Current Version",
								"SystemRoot"		=> "System Root",
								"RegOrg"			=> "Registered Organisation",
								"RegisteredOwner"	=> "Registered Owner",
								"InstallDate"		=> "Install Date",
								"ServicePack"		=> "Service Pack"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// PDA
		case "palmos":
			if (strlen($value))
			{
				if (strpos(" USBSupported",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"USBSupported"	=> "USB Supported",
								"ModemPort"		=> "Modem Port",
								"SerialPort"	=> "Serial Port",
								"LastSync"		=> "Last Sync",
								"SyncPath"		=> "Sync Path",
								"SyncVersion"	=> "Sync Version"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "windowsce":
			if (strlen($value))
			{
				if (strpos(" USBSupported",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"DeviceOEMInfo"		=> "Device OEM Info",
								"DeviceProcessor"	=> "Device Processor",
								"DeviceType"		=> "Device Type",
								"SyncPath"			=> "Sync Path",
								"SyncVersion"		=> "Sync Version"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Ports
		case "scsicontrol":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"ControlNum" 	=> "Number",
								"ModelName" 	=> "Model Name",
								"VendorName"	=> "Vendor Name"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "scsidevice":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"DeviceNum" 	=> "Number",
								"ModelName" 	=> "Model Name",
								"VendorName"	=> "Vendor Name"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "usbcontrol":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array("ControlNum" => "Number");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "usbdevice":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array("DeviceNum" => "Number");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Printers
		case "printer":
			if (strlen($value))
			{
				if (strpos(" FileDate",$column)) return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				if (strpos(" FileSize",$column)) return sprintf("%s KB",commarise($value));
				return $value;
			}
			else
			{
				$hash = array(	"PrinterNo"		=> "Number",
								"FileName"		=> "File Name",
								"FileSize"		=> "File Size",
								"FileDate"		=> "File Date"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Processor
		case "processor":
			if (strlen($value))
			{
				if (strpos(" MhzSpeed",$column))
				{
					if ($value > 999) return sprintf("%.1f GHz",($value/1000));
					else return sprintf("%d MHz",$value);
				}
				if (strpos(" MMX,CondMoveInstr,MachineCheckArch,PageGlobalEnable,MemoryTypeRangeReg,VirtModeExt,HyperThreading,PageSizeExt,TimeStampCnt,ModelRegisters,PhysAddrExt,MachChkExcept,CMPXCHG8BInstSppt,APIC",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"MhzSpeed"				=> "Speed",
								"ProcCount"				=> "Processor Count",
								"SLSignature"			=> "SL Signature",
								"ProcSerialNum"			=> "Processor Serial Number",
								"VirtModeExt"			=> "Virtual Mode Extensions",
								"PageSizeExt"			=> "Page Size Extensions",
								"TimeStampCnt"			=> "Timestamp Counter",
								"ModelRegisters"		=> "Model Specific Counters",
								"PhysAddrExt"			=> "Physical Address Extensions",
								"MachChkExcept"			=> "Machine Check Exceptions",
								"CMPXCHG8BInstSppt"		=> "CMPXCHG8B Instruction Support",
								"APIC"					=> "On-chip",
								"MemoryTypeRangeReg"	=> "Memory Type Range Registers",
								"PageGlobalEnable"		=> "Page Global Enable",
								"MachineCheckArch"		=> "Machine Check Architecture",
								"CondMoveInstr"			=> "Conditional Move Instruction",
								"MMX"					=> "MMX&trade; Technology",
								"HyperThreading"		=> "Hyper-Threading Technology"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Software
		case "appsoftwaresuites":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"SuiteName"		=> "Name",
								"ProductID"		=> "Product ID",
								"RegCompany"	=> "Registered Company",
								"RegOwner"		=> "Registered Owner"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "softwarepackages":
			if (strlen($value))
			{
				if (strpos(" SCM_DateDiscovered,SCM_LastSessionStart,FileDate",$column)) return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				if (strpos(" AttRead,AttHidden,AttSystem",$column)) return yesno($value);
				return $value;
			}
			else
			{
				$hash = array(	"FileName"				=> "File Name",
								"FileSize"				=> "File Size",
								"Title"					=> "Name",
								"ScanMethod"			=> "Scan Method",
								"UserEdit"				=> "User Edit",
								"FileDate"				=> "File Date",
								"AttRead"				=> "Attribute Read Only",
								"AttSystem"				=> "Attribute System",
								"AttHidden"				=> "Attribute Hidden",
								"SCM_TotalSessionTime"	=> "Duration",
								"SCM_SessionCount"		=> "Times Run",
								"SCM_SessionsDenied"	=> "Times Denied",
								"SCM_LastUser"			=> "Current User",
								"SCM_LastSessionStart"	=> "Last Started",
								"SCM_LastSessionTime"	=> "Last Duration",
								"SCM_DateDiscovered"	=> "Date Discovered"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// System
		case "compsystem":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array("SerialNum" => "Serial Number");

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
// Video
		case "video":
			if (strlen($value))
			{
				if (strpos(" DriverDate",$column)) return windateparse(mktime(substr($value, 11, 2),substr($value, 14, 2),substr($value, 17, 2),substr($value, 5, 2),substr($value, 8, 2),substr($value, 0, 4)));
				return $value;
			}
			else
			{
				$hash = array(	"RefreshFrequency"	=> "Refresh Frequency",
								"DriverName"		=> "Driver Name",
								"DriverVersion"		=> "Driver Version",
								"DriverDate"		=> "Driver Date"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
		case "videoadapter":
			if (strlen($value))
			{
				return $value;
			}
			else
			{
				$hash = array(	"VideoNo"		=> "Number",
								"AdapterString"	=> "Adapter String",
								"ChipType"		=> "Chip Type",
								"DACType"		=> "DAC Type"
								);

				if ($hash[$column]) return str_replace(" ","&nbsp;",$hash[$column]);
				else return $column;
			}
		break;
	}
	return strlen($value) ? $value : $column;
}
?>
