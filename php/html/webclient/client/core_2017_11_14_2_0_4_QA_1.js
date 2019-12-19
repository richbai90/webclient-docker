;;;;var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
		
		
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Internet Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Trident",
			identity: "Internet Explorer",
			versionSearch: "rv"
		},
			{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();
;;;;//-- this function is called to encrypt xmlhttp params. You can change encyrpt method to whatever  so long as you have a function called _swed.
function _swed(strVar)
{
	if(_swsessionid=="" || strVar=="")return strVar;

	var strSwed = "";
	var strParamAndValue = "";
	var strParamName = "";
	var strParamValue ="";
	var eqIndex = -1;
	var arrParams = strVar.split("&");
	for(var x=0;x<arrParams.length;x++)
	{
		strParamAndValue = arrParams[x];
		eqIndex = strParamAndValue.indexOf("=");
		if(eqIndex>-1)
		{
			strParamName=strParamAndValue.substring(0,eqIndex);
			strParamValue=strParamAndValue.substring(eqIndex+1);
			if(strSwed!="")strSwed+="[&]";
			strSwed+= strParamName + "[=]" + strParamValue;
		}
	}

	var strReturn = "swed=" + stringToHex(Aes.Ctr.encrypt(strSwed, _swsessionid, 256));
	return strReturn;
}



/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  AES implementation in JavaScript (c) Chris Veness 2005-2011                                   */
/*   - see http://csrc.nist.gov/publications/PubsFIPS.html#197                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Aes = {};  // Aes namespace

/**
 * AES Cipher function: encrypt 'input' state with Rijndael algorithm
 *   applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage
 *
 * @param {Number[]} input 16-byte (128-bit) input state array
 * @param {Number[][]} w   Key schedule as 2D byte-array (Nr+1 x Nb bytes)
 * @returns {Number[]}     Encrypted output state array
 */
Aes.cipher = function(input, w) {    // main Cipher function [§5.1]
  var Nb = 4;               // block size (in words): no of columns in state (fixed at 4 for AES)
  var Nr = w.length/Nb - 1; // no of rounds: 10/12/14 for 128/192/256-bit keys

  var state = [[],[],[],[]];  // initialise 4xNb byte-array 'state' with input [§3.4]
  for (var i=0; i<4*Nb; i++) state[i%4][Math.floor(i/4)] = input[i];

  state = Aes.addRoundKey(state, w, 0, Nb);

  for (var round=1; round<Nr; round++) {
    state = Aes.subBytes(state, Nb);
    state = Aes.shiftRows(state, Nb);
    state = Aes.mixColumns(state, Nb);
    state = Aes.addRoundKey(state, w, round, Nb);
  }

  state = Aes.subBytes(state, Nb);
  state = Aes.shiftRows(state, Nb);
  state = Aes.addRoundKey(state, w, Nr, Nb);

  var output = new Array(4*Nb);  // convert state to 1-d array before returning [§3.4]
  for (var i=0; i<4*Nb; i++) output[i] = state[i%4][Math.floor(i/4)];
  return output;
}

/**
 * Perform Key Expansion to generate a Key Schedule
 *
 * @param {Number[]} key Key as 16/24/32-byte array
 * @returns {Number[][]} Expanded key schedule as 2D byte-array (Nr+1 x Nb bytes)
 */
Aes.keyExpansion = function(key) {  // generate Key Schedule (byte-array Nr+1 x Nb) from Key [§5.2]
  var Nb = 4;            // block size (in words): no of columns in state (fixed at 4 for AES)
  var Nk = key.length/4  // key length (in words): 4/6/8 for 128/192/256-bit keys
  var Nr = Nk + 6;       // no of rounds: 10/12/14 for 128/192/256-bit keys

  var w = new Array(Nb*(Nr+1));
  var temp = new Array(4);

  for (var i=0; i<Nk; i++) {
    var r = [key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]];
    w[i] = r;
  }

  for (var i=Nk; i<(Nb*(Nr+1)); i++) {
    w[i] = new Array(4);
    for (var t=0; t<4; t++) temp[t] = w[i-1][t];
    if (i % Nk == 0) {
      temp = Aes.subWord(Aes.rotWord(temp));
      for (var t=0; t<4; t++) temp[t] ^= Aes.rCon[i/Nk][t];
    } else if (Nk > 6 && i%Nk == 4) {
      temp = Aes.subWord(temp);
    }
    for (var t=0; t<4; t++) w[i][t] = w[i-Nk][t] ^ temp[t];
  }

  return w;
}

/*
 * ---- remaining routines are private, not called externally ----
 */
 
Aes.subBytes = function(s, Nb) {    // apply SBox to state S [§5.1.1]
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) s[r][c] = Aes.sBox[s[r][c]];
  }
  return s;
}

Aes.shiftRows = function(s, Nb) {    // shift row r of state S left by r bytes [§5.1.2]
  var t = new Array(4);
  for (var r=1; r<4; r++) {
    for (var c=0; c<4; c++) t[c] = s[r][(c+r)%Nb];  // shift into temp copy
    for (var c=0; c<4; c++) s[r][c] = t[c];         // and copy back
  }          // note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
  return s;  // see asmaes.sourceforge.net/rijndael/rijndaelImplementation.pdf
}

Aes.mixColumns = function(s, Nb) {   // combine bytes of each col of state S [§5.1.3]
  for (var c=0; c<4; c++) {
    var a = new Array(4);  // 'a' is a copy of the current column from 's'
    var b = new Array(4);  // 'b' is a{02} in GF(2^8)
    for (var i=0; i<4; i++) {
      a[i] = s[i][c];
      b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;

    }
    // a[n] ^ b[n] is a{03} in GF(2^8)
    s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; // 2*a0 + 3*a1 + a2 + a3
    s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; // a0 * 2*a1 + 3*a2 + a3
    s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; // a0 + a1 + 2*a2 + 3*a3
    s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; // 3*a0 + a1 + a2 + 2*a3
  }
  return s;
}

Aes.addRoundKey = function(state, w, rnd, Nb) {  // xor Round Key into state S [§5.1.4]
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
  }
  return state;
}

Aes.subWord = function(w) {    // apply SBox to 4-byte word w
  for (var i=0; i<4; i++) w[i] = Aes.sBox[w[i]];
  return w;
}

Aes.rotWord = function(w) {    // rotate 4-byte word w left by one byte
  var tmp = w[0];
  for (var i=0; i<3; i++) w[i] = w[i+1];
  w[3] = tmp;
  return w;
}

// sBox is pre-computed multiplicative inverse in GF(2^8) used in subBytes and keyExpansion [§5.1.1]
Aes.sBox =  [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
             0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
             0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
             0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
             0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
             0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
             0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
             0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
             0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
             0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
             0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
             0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
             0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
             0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
             0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
             0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];

// rCon is Round Constant used for the Key Expansion [1st col is 2^(r-1) in GF(2^8)] [§5.2]
Aes.rCon = [ [0x00, 0x00, 0x00, 0x00],
             [0x01, 0x00, 0x00, 0x00],
             [0x02, 0x00, 0x00, 0x00],
             [0x04, 0x00, 0x00, 0x00],
             [0x08, 0x00, 0x00, 0x00],
             [0x10, 0x00, 0x00, 0x00],
             [0x20, 0x00, 0x00, 0x00],
             [0x40, 0x00, 0x00, 0x00],
             [0x80, 0x00, 0x00, 0x00],
             [0x1b, 0x00, 0x00, 0x00],
             [0x36, 0x00, 0x00, 0x00] ]; 


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  AES Counter-mode implementation in JavaScript (c) Chris Veness 2005-2011                      */
/*   - see http://csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

Aes.Ctr = {};  // Aes.Ctr namespace: a subclass or extension of Aes

/** 
 * Encrypt a text using AES encryption in Counter mode of operation
 *
 * Unicode multi-byte character safe
 *
 * @param {String} plaintext Source text to be encrypted
 * @param {String} password  The password to use to generate a key
 * @param {Number} nBits     Number of bits to be used in the key (128, 192, or 256)
 * @returns {string}         Encrypted text
 */
Aes.Ctr.encrypt = function(plaintext, password, nBits) {
  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
  plaintext = Utf8.encode(plaintext);
  password = Utf8.encode(password);
  //var t = new Date();  // timer
	
  // use AES itself to encrypt password to get cipher key (using plain password as source for key 
  // expansion) - gives us well encrypted key (though hashed key might be preferred for prod'n use)
  var nBytes = nBits/8;  // no bytes in key (16/24/32)
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {  // use 1st 16/24/32 chars of password for key
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));  // gives us 16-byte key
  key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

  // initialise 1st 8 bytes of counter block with nonce (NIST SP800-38A §B.2): [0-1] = millisec, 
  // [2-3] = random, [4-7] = seconds, together giving full sub-millisec uniqueness up to Feb 2106
  var counterBlock = new Array(blockSize);
  
  var nonce = (new Date()).getTime();  // timestamp: milliseconds since 1-Jan-1970
  var nonceMs = nonce%1000;
  var nonceSec = Math.floor(nonce/1000);
  var nonceRnd = Math.floor(Math.random()*0xffff);
  
  for (var i=0; i<2; i++) counterBlock[i]   = (nonceMs  >>> i*8) & 0xff;
  for (var i=0; i<2; i++) counterBlock[i+2] = (nonceRnd >>> i*8) & 0xff;
  for (var i=0; i<4; i++) counterBlock[i+4] = (nonceSec >>> i*8) & 0xff;
  
  // and convert it to a string to go on the front of the ciphertext
  var ctrTxt = '';
  for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

  // generate key schedule - an expansion of the key into distinct Key Rounds for each round
  var keySchedule = Aes.keyExpansion(key);
  
  var blockCount = Math.ceil(plaintext.length/blockSize);
  var ciphertxt = new Array(blockCount);  // ciphertext as array of strings
  
  for (var b=0; b<blockCount; b++) {
    // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
    // done in two stages for 32-bit ops: using two words allows us to go past 2^32 blocks (68GB)
    for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8)

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // -- encrypt counter block --
    
    // block size is reduced on final block
    var blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
    var cipherChar = new Array(blockLength);
    
    for (var i=0; i<blockLength; i++) {  // -- xor plaintext with ciphered counter char-by-char --
      cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b*blockSize+i);
      cipherChar[i] = String.fromCharCode(cipherChar[i]);
    }
    ciphertxt[b] = cipherChar.join(''); 
  }

  // Array.join is more efficient than repeated string concatenation in IE
  var ciphertext = ctrTxt + ciphertxt.join('');
  ciphertext = Base64.encode(ciphertext);  // encode in base64
  
  //alert((new Date()) - t);
  return ciphertext;
}

/** 
 * Decrypt a text encrypted by AES in counter mode of operation
 *
 * @param {String} ciphertext Source text to be encrypted
 * @param {String} password   The password to use to generate a key
 * @param {Number} nBits      Number of bits to be used in the key (128, 192, or 256)
 * @returns {String}          Decrypted text
 */
Aes.Ctr.decrypt = function(ciphertext, password, nBits) {
  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
  ciphertext = Base64.decode(ciphertext);
  password = Utf8.encode(password);
  //var t = new Date();  // timer
  
  // use AES to encrypt password (mirroring encrypt routine)
  var nBytes = nBits/8;  // no bytes in key
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
  key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

  // recover nonce from 1st 8 bytes of ciphertext
  var counterBlock = new Array(8);
  ctrTxt = ciphertext.slice(0, 8);
  for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);
  
  // generate key schedule
  var keySchedule = Aes.keyExpansion(key);

  // separate ciphertext into blocks (skipping past initial 8 bytes)
  var nBlocks = Math.ceil((ciphertext.length-8) / blockSize);
  var ct = new Array(nBlocks);
  for (var b=0; b<nBlocks; b++) ct[b] = ciphertext.slice(8+b*blockSize, 8+b*blockSize+blockSize);
  ciphertext = ct;  // ciphertext is now array of block-length strings

  // plaintext will get generated block-by-block into array of block-length strings
  var plaintxt = new Array(ciphertext.length);

  for (var b=0; b<nBlocks; b++) {
    // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
    for (var c=0; c<4; c++) counterBlock[15-c] = ((b) >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (((b+1)/0x100000000-1) >>> c*8) & 0xff;

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // encrypt counter block

    var plaintxtByte = new Array(ciphertext[b].length);
    for (var i=0; i<ciphertext[b].length; i++) {
      // -- xor plaintxt with ciphered counter byte-by-byte --
      plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
      plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
    }
    plaintxt[b] = plaintxtByte.join('');
  }

  // join array of blocks into single plaintext string
  var plaintext = plaintxt.join('');
  plaintext = Utf8.decode(plaintext);  // decode from UTF8 back to Unicode multi-byte chars
  
  //alert((new Date()) - t);
  return plaintext;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2011                          */
/*    note: depends on Utf8 class                                                                 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Base64 = {};  // Base64 namespace

Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Encode string into Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, no newlines are added.
 *
 * @param {String} str The string to be encoded as base-64
 * @param {Boolean} [utf8encode=false] Flag to indicate whether str is Unicode string to be encoded 
 *   to UTF8 before conversion to base64; otherwise string is assumed to be 8-bit characters
 * @returns {String} Base64-encoded string
 */ 
Base64.encode = function(str, utf8encode) {  // http://tools.ietf.org/html/rfc4648
  utf8encode =  (typeof utf8encode == 'undefined') ? false : utf8encode;
  var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c, plain, coded;
  var b64 = Base64.code;
   
  plain = utf8encode ? str.encodeUTF8() : str;
  
  c = plain.length % 3;  // pad string to length of multiple of 3
  if (c > 0) { while (c++ < 3) { pad += '='; plain += '\0'; } }
  // note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars
   
  for (c=0; c<plain.length; c+=3) {  // pack three octets into four hexets
    o1 = plain.charCodeAt(c);
    o2 = plain.charCodeAt(c+1);
    o3 = plain.charCodeAt(c+2);
      
    bits = o1<<16 | o2<<8 | o3;
      
    h1 = bits>>18 & 0x3f;
    h2 = bits>>12 & 0x3f;
    h3 = bits>>6 & 0x3f;
    h4 = bits & 0x3f;

    // use hextets to index into code string
    e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  }
  coded = e.join('');  // join() is far faster than repeated string concatenation in IE
  
  // replace 'A's from padded nulls with '='s
  coded = coded.slice(0, coded.length-pad.length) + pad;
   
  return coded;
}

/**
 * Decode string from Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, newlines are not catered for.
 *
 * @param {String} str The string to be decoded from base-64
 * @param {Boolean} [utf8decode=false] Flag to indicate whether str is Unicode string to be decoded 
 *   from UTF8 after conversion from base64
 * @returns {String} decoded string
 */ 
Base64.decode = function(str, utf8decode) {
  utf8decode =  (typeof utf8decode == 'undefined') ? false : utf8decode;
  var o1, o2, o3, h1, h2, h3, h4, bits, d=[], plain, coded;
  var b64 = Base64.code;

  coded = utf8decode ? str.decodeUTF8() : str;
  
  
  for (var c=0; c<coded.length; c+=4) {  // unpack four hexets into three octets
    h1 = b64.indexOf(coded.charAt(c));
    h2 = b64.indexOf(coded.charAt(c+1));
    h3 = b64.indexOf(coded.charAt(c+2));
    h4 = b64.indexOf(coded.charAt(c+3));
      
    bits = h1<<18 | h2<<12 | h3<<6 | h4;
      
    o1 = bits>>>16 & 0xff;
    o2 = bits>>>8 & 0xff;
    o3 = bits & 0xff;
    
    d[c/4] = String.fromCharCode(o1, o2, o3);
    // check for padding
    if (h4 == 0x40) d[c/4] = String.fromCharCode(o1, o2);
    if (h3 == 0x40) d[c/4] = String.fromCharCode(o1);
  }
  plain = d.join('');  // join() is far faster than repeated string concatenation in IE
   
  return utf8decode ? plain.decodeUTF8() : plain; 
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2011                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function(strUni) {
  // use regular expressions & String.replace callback function for better efficiency 
  // than procedural approaches
  var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
  strUtf = strUtf.replace(
      /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0); 
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
  return strUtf;
}

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function(strUtf) {
  // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
  var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
        return String.fromCharCode(cc); }
    );
  strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
        return String.fromCharCode(cc); }
    );
  return strUni;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
function stringToHex (s) {
  var r = "0x";
  var hexes = new Array ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
  for (var i=0; i<s.length; i++) {r += hexes [s.charCodeAt(i) >> 4] + hexes [s.charCodeAt(i) & 0xf];}
  return r;
}

function hexToString (h) {
  var r = "";
  for (var i= (h.substr(0, 2)=="0x")?2:0; i<h.length; i+=2) {r += String.fromCharCode (parseInt (h.substr (i, 2), 16));}
  return r;
}

;;;;//-- prototype that allows us to create popup menus for use with toolbars or context menus
//--

function _new__popupmenu(strUniqueID, eleOwner,actionFunction)
{
	return new _popupmenu(strUniqueID, eleOwner,actionFunction);
}
function _popupmenu(strUniqueID, eleOwner,actionFunction)
{
	this.id = strUniqueID;
	this.popobject = (eleOwner!=undefined)?eleOwner:null; //-- the object which triggered the popup i.e. toolbar button - if left as null assume mouse co-ords


	this.actionfunction = (actionFunction!=undefined)?actionFunction:null; //-- pointer to javascript fiunction to call when menu item is clicked
	this.arr_items = new Array(); //-- items to display (can be action or anoher popup i.e. child menu

	this.highlightcolor = "navy";
	this.highlighttextcolor = "#ffffff";

	this.htmldocument = (eleOwner!=undefined)?app.getEleDoc(eleOwner):null;
	this.htmlholder = null;
	this.created = false;

	this.parentmenu = null;
	this.currentitem = null; //-- pointer to current child menu being shown
}

//-- kill htmlobjects , kill child menu objects etc
_popupmenu.prototype.reset = function()
{
	if(this.htmlholder==null)return;
	var parent = this.htmlholder.parentNode;
	parent.removeChild(this.htmlholder);
	this.htmlholder = null;

	//-- remove items
	for(var x=0;x<this.arr_items.length;x++)
	{
		this.arr_items[x].reset();
	}
	this.arr_items = new Array();
}

//-- draw out
_popupmenu.prototype.show = function(intLeft, intTop, ev)
{
	//-- if not creaed created
	if(this.htmlholder==null)
	{
		if(!this.create())return false;
	}

	if(intLeft==undefined && intTop==undefined)
	{
		//-- top and left not passed in so work out where to popup using parent owner using popobject or ev
		if(ev!=undefined)
		{
			var i = app.findMousePos(ev);
			intTop = i[1];
			intLeft = i[0];
		}
		else
		{
			//-- 
			intTop= this.popobject.offsetTop + this.popobject.offsetHeight - 1;
			intLeft = this.popobject.offsetLeft;
		}
	}
	this.htmlholder.style.position="absolute";
	this.htmlholder.style.top = intTop;
	this.htmlholder.style.left = intLeft;
	this.htmlholder.style.zIndex=99999999;
	this.htmlholder.style.display='block';
}

//-- 
_popupmenu.prototype.hide= function()
{
	if(this.htmlholder!=null)
	{
		this.hide_children();
		this.htmlholder.style.display='none';
		//-- hide any of its children
	}
}

//-- create html div holder and items
_popupmenu.prototype.create= function()
{
	//-- loop through items and create menu html (and any child menus)
	var strHTML = "<div id='" + this.id + "' onclick='this.popupmenu.select(event);' onmouseover='this.popupmenu.highlight(event);' onmouseout='this.popupmenu.lowlight(event);' class='menu-holder'>";
	var strTable = "<table cellspacing='0' cellpadding='0' border='0'>";
	for(var x=0; x<this.arr_items.length;x++)
	{
		strTable += this.arr_items[x]._create_html();
	}
	strTable += "</table>";
	strHTML += strTable + "</div>";

	//-- get div pointer
	app.insertBeforeEnd(this.htmldocument.body,strHTML);
	this.htmlholder = this.htmldocument.getElementById(this.id);
	this.created = true;
	this.htmlholder.popupmenu = this;
	return true;
}

//-- show child menu
_popupmenu.prototype.show_child= function(eventSourceElement)
{
	//-- if item has child menu then show it
	var menuItem = 	this.arr_items[eventSourceElement.rowIndex];
	if(menuItem!=undefined && menuItem.childmenu!=null)
	{
		//-- need to hide current child menu as not the same
		if(this.currentitem!=null && this.currentitem!=menuItem)
		{
			this.currentitem.childmenu.hide();
		}
		menuItem.childmenu.show(this.htmlholder.offsetLeft + this.htmlholder.offsetWidth - 1, this.htmlholder.offsetTop + eventSourceElement.offsetTop + 2);
		this.currentitem = menuItem;
		menuItem.childmenu.parentmenu = this;
	}
}


//-- show child menu
_popupmenu.prototype.hide_children= function(eventSourceElement)
{
	//-- if item has child menu then show it
	for(strPos in this.arr_items)
	{
		var menuItem = 	this.arr_items[strPos];
		if(menuItem!=undefined && menuItem.childmenu!=null)
		{
			//-- need to hide current child menu as not the same
			if(this.currentitem!=null)
			{
				this.currentitem.childmenu.hide();
			}
		}
	}
}


//-- show child menu
_popupmenu.prototype.show_item= function(strID)
{
	for(var x=0; x<this.arr_items.length;x++)
	{
		if(this.arr_items[x].id==strID)
		{
			this.htmlholder.childNodes[0].rows[x].style.display="inline";
			break;
		}
	}
}

//-- hide child menu
_popupmenu.prototype.hide_item= function(strID)
{
	for(var x=0; x<this.arr_items.length;x++)
	{
		if(this.arr_items[x].id==strID)
		{
			//-- get row
			this.htmlholder.childNodes[0].rows[x].style.display="none";
			break;
		}
	}
}


//-- 
_popupmenu.prototype.highlight= function(ev)
{
	//-- get source and get parent row - get rowIndex and this will give us pos in this.arr_items
	var eventSourceElement = ev_source(ev);
	while(eventSourceElement.tagName!="TR")
	{
		eventSourceElement = eventSourceElement.parentNode;
		if(eventSourceElement==null)return false;
	}

	if(eventSourceElement.id=="split") return false;

	eventSourceElement.className="mnu-highlighter";
	this.show_child(eventSourceElement);
}

//-- 
_popupmenu.prototype.lowlight= function(ev)
{

	//-- get source and get parent row - get rowIndex and this will give us pos in this.arr_items
	var eventSourceElement = ev_source(ev);
	while(eventSourceElement.tagName!="TR")
	{
		eventSourceElement = eventSourceElement.parentNode;
		if(eventSourceElement==null)return false;
	}

	eventSourceElement.className="";
}

//-- 
_popupmenu.prototype.select= function(ev)
{
	//-- hide menus
	if(this.popobject!=null)
	{
		var iEnhanced = this.popobject.getAttribute("enhanced");
		if(iEnhanced=="1")
		{
			this.popobject.setAttribute("mnudown","0");
			this.popobject.setAttribute("checked","0");
			this.popobject.className ="toolbar-item";
			toolbar_enhanced_hilo(this.popobject,false);

		}
	}
	this.hide();

	var pMenu =this.parentmenu;
	while (pMenu!=null)
	{
		pMenu.hide();
		pMenu =pMenu.parentmenu;
	}
	
	//-- get source and get parent row - get rowIndex and this will give us pos in this.arr_items
	var eventSourceElement = ev_source(ev);
	while(eventSourceElement.tagName!="TR")
	{
		eventSourceElement = eventSourceElement.parentNode;
		if(eventSourceElement==null)return false;
	}

	var rowIndex = eventSourceElement.rowIndex;
	var selectedItem = this.arr_items[rowIndex];
	if(selectedItem!=undefined)
	{
		//-- call action function
		if(this.actionfunction)this.actionfunction(selectedItem);
	}

}

//-- add child item (not this does not draw it)
_popupmenu.prototype.addmenuitem= function(strID, strLabel, strImage, boolAChildMenu)
{
	this.arr_items[this.arr_items.length++] = new _popupmenuitem(strID, strLabel, strImage, boolAChildMenu, this);
	return this.arr_items[this.arr_items.length-1];
}

function _popupmenuitem(strID, strLabel, strImage, boolAChildMenu, parentMenu)
{
	this.id = strID;
	this.label = strLabel;
	this.img = strImage;
	this.bMenu = boolAChildMenu;
	this.childmenu =  null;

	this.popupmenu = parentMenu; //-- menu on which item is displayed

	this.htmlrow = null;

}

_popupmenuitem.prototype.reset= function()
{
	if(this.bMenu && this.popupmenu!=null)
	{
		this.popupmenu.reset();
	}
	this.popupmenu = null;
	this.htmlrow = null;
}


_popupmenuitem.prototype._create_html= function()
{
	var strImgHtml = "";
	var strLabelHtml = this.label;
	var strChildClass = (this.bMenu)?"mnu-child":"mnu-nochild";

	if(this.id=="split")
	{
		var strHTML = "<tr id='split'><td><div class='mnu-icon'></div></td><td colspan='3' align='middle'><div class='mnu-splitter'></div></td></tr>";
	}
	else
	{
		var strHTML = "<tr><td><div class='mnu-icon'>"+strImgHtml+"</div></td><td valign='middle'><div class='mnu-text'>"+strLabelHtml+"</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='"+strChildClass+"'></div></td></tr>";
	}
	return strHTML;
};;;;//-- functions to help handle special webclient toolbar actions i.e. getting quicklog call list, email signatures etc
//--


//--
//-- get quicklog call list and draw menu options out below target button
function _apptoolbar__get_quicklog_list(eToolBaritem,left,top,e)
{

	if(eToolBaritem.popupmenu==undefined)
	{
		eToolBaritem.popupmenu = new _popupmenu('_ql_menu',eToolBaritem,app._apptoolbar__open_quicklog_item);
	}

	//-- clear down existing items
	eToolBaritem.popupmenu.reset();


	//-- call xmlmc to get folder list of quick log calls for users session
	var boolChildren = false;
	var boolNoRight = false;


	//-- get qlc for users shared mailboxes - have to loop each one
	var arrProcessedNames = new Array();
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		var xmlMb =_arr_xml_mailbox_list[x];

		var strMailboxName = xmlNodeTextByTag(xmlMb,"name")

		if(arrProcessedNames[strMailboxName])continue;
		arrProcessedNames[strMailboxName] = true;


		var strMailboxDisplay = xmlNodeTextByTag(xmlMb,"displayName")
		var intType = xmlNodeTextByTag(xmlMb,"type")
		if(intType==1)strMailboxDisplay="My Quick-Log Calls";
		
		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam('mailbox',strMailboxName);
		if(xmlmc.Invoke("helpdesk","quicklogCallGetList"))
		{
			var arrQLI = xmlmc.xmlDOM.getElementsByTagName("quicklogCall");
			if(arrQLI.length>0)
			{
				boolChildren = true;
				//-- parent
				var menuItem = eToolBaritem.popupmenu.addmenuitem(strMailboxName,strMailboxDisplay, "", true);

				//-- create child menu and then add child items to it
				menuItem.childmenu = new _popupmenu(menuItem.id +"_" + menuItem.popupmenu.id, eToolBaritem, app._apptoolbar__open_quicklog_item);
				for (var y=0;y<arrQLI.length;y++)
				{
					menuItem.childmenu.addmenuitem(xmlNodeTextByTag(arrQLI[y],"quicklogCallName"), xmlNodeTextByTag(arrQLI[y],"quicklogCallName"), "", false);
				}
			}
		}
	}

	if(!boolChildren)
	{
		eToolBaritem.popupmenu.addmenuitem("na","There are no quicklog calls defined", "", false);
	}
	eToolBaritem.popupmenu.show(left,top);
	if(e)app.stopEvent(e);
	return false;
}


function _apptoolbar__open_quicklog_item(aMenuItem)
{
	if(aMenuItem.popupmenu.id=="_ql_menu") return false;

	//-- get quicklog call info for xmlmc
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("name",aMenuItem.label);
	xmlmc.SetParam("mailbox",aMenuItem.popupmenu.parentmenu.currentitem.id);
	if(!xmlmc.Invoke("helpdesk","quicklogCallGet"))
	{
		alert("xmlmc helpdesk:quicklogCallGet Failed:\n\n" + xmlmc.GetLastError());
		return false;
	}

	//-- open log call form of the desired type
	var strForm = xmlmc.GetParam("formName");
	var strClass = xmlmc.GetParam("callClass");

	//- if we are calling from a lfc document then process qlc within in that document
	var _qlc_xmldocument = aMenuItem.popupmenu.htmldocument;
	if(_qlc_xmldocument!=null && _qlc_xmldocument.opencall!=undefined && _qlc_xmldocument._callclass==strClass)
	{
		//-- load data into existing document
		_qlc_xmldocument._process_qlc_data(xmlmc.xmlDOM);
	}
	else
	{
		//-- open new log call form
		var arrParams = new Array();
		arrParams["_qlc_data"] = xmlmc.xmlDOM;
		global.LogNewCall(strForm,null,window,arrParams);
	}
};;;;
var __cached_forms = new Array();
var __windowcount = 1;
var __open_windows = new Array();
var __modal_windows = new Array();
var __window_pointers = new Array();


function _save_cache(aObject, strName)
{
	__cached_forms[strName] = new Array()
	
	//__cached_forms[strName]["formxml"] = aObject.formxml; - 01.09.2011 - now using json forms
	__cached_forms[strName]["formjsonstring"] = aObject.formjsonstring;

	//-- doc level js
	__cached_forms[strName]["arr_document_vars"] = new Array();
	for(var x=0; x<aObject.arr_document_vars.length;x++)
	{
		//-- if exists in top then add document pointer
		__cached_forms[strName]["arr_document_vars"][__cached_forms[strName]["arr_document_vars"].length++]=aObject.arr_document_vars[x];
	}

	//-- mainform js
	__cached_forms[strName]["mainform_func_names"] = new Array();
	for(strID in aObject.mainform_func_names)
	{
		//-- if exists in top then add document pointer
		__cached_forms[strName]["mainform_func_names"][strID]=strID;
	}

	//--extform js
	__cached_forms[strName]["extform_func_names"] = new Array();
	for(strID in aObject.extform_func_names)
	{
		//-- if exists in top then add document pointer
		__cached_forms[strName]["extform_func_names"][strID]=strID;
	}

	__cached_forms[strName]["mainformjs"] = aObject.mainformjs;
	__cached_forms[strName]["extformjs"] = aObject.extformjs;
	__cached_forms[strName]["documentjs"]= aObject.documentjs;

	__cached_forms[strName]["mainformhtml"]= aObject.mainformhtml;
	__cached_forms[strName]["extformhtml"]= aObject.extformhtml;

	//-- store size
	__cached_forms[strName]["width"]= 0;
	__cached_forms[strName]["height"]= 0;
}


function _open_application_form(strFormName, strType, varRecordKey, strParams,boolModal, strMode, fCallback,srcEle,openedFromWin,arrSpecialVars)
{
	//-- check if special form i.e. treebrowser
	if(strFormName.indexOf(".")>0)
	{
		var arrFormName = strFormName.split(".");
		if(arrFormName[0].toLowerCase()=="treebrowserform")
		{
			strFormName = "_wc_treebrowserform";
			varRecordKey = arrFormName[1];
			strMode ="add";
			boolModal = true;

			return _open_system_form(strFormName, "treebrowserform", varRecordKey, strParams, boolModal, fCallback,srcEle,openedFromWin,undefined,undefined,arrSpecialVars);
		}
		else if(arrFormName[0].toLowerCase()=="form")
		{
			strFormName = arrFormName[1];
		}
	}

	//-- check for overrides - this way apps dev can handle things like the cmdb popup ci form
	if(strType.toLowerCase()=="stf")
	{
		var strFunctionName = "WebClientOverride_OpenForm";
		if(strMode.toLowerCase()=="edit")
		{
			strFunctionName +="ForEdit";
		}
		else if(strMode.toLowerCase()=="add")
		{
			strFunctionName +="ForAdd";
		}

		//-- allow app dev to override in clisupp/js/dd/app.js
		var overridefunc = app[strFunctionName]; 
		if(overridefunc != undefined)
		{
			var res = overridefunc(strFormName,varRecordKey,strParams,boolModal,openedFromWin,fCallback);
			if(res!=false)return res;
		}
	}

	var info = new Object();
	info.__app = top;
	info.__formname = strFormName;
	info.__formmode = strMode; //-- edit , add , browse
	info.__formtype = strType; //-- stf , cdf , lcf
	info.__recordkey = varRecordKey;

	info.__params = strParams;
	info.__openedfromwin = openedFromWin;
	info.__modal = boolModal;
	info.__callback = fCallback;
	info.__targetele =	srcEle;
	info.__openedfromwin = openedFromWin;
	info.__callclass = strFormName;

	if(arrSpecialVars!=undefined)
	{
		info.__form = new Array();
		for(strItem in arrSpecialVars)
		{
			info.__form[strItem] = arrSpecialVars[strItem];
		}
	}


	var strWindowName = strFormName +"_"+ (__windowcount++);
	strWindowName = app.string_replace(strWindowName, " ","_",true);
	strWindowName = app.string_replace(strWindowName, ".","_",true);
	__open_windows[strWindowName] = info;

	//-- get form processing path
	var strURL = _root + "client/forms/xmlForm.php";

	return _open_window(strURL, strWindowName, boolModal, 400, 400,info,openedFromWin,strFormName);
}


function _open_system_form(strFormName, strType, varRecordKey, strParams, boolModal, fCallback,srcEle,openedFromWin,iWidth,iHeight,arrSpecialVars)
{

	var info = new Object();
	info.__app = top;
	info.__formname = strFormName;
	info.__formmode = (varRecordKey!="")?"edit":"add";
	info.__formtype = "_system/" + strType; //-- calendar, knowledgebase,mail,picklist,profile etc
	info.__recordkey = varRecordKey;
	info.__params = strParams;
	info.__openedfromwin = openedFromWin;
	info.__modal = boolModal;
	info.__callback = fCallback;
	info.__targetele =	srcEle;
	info.__openedfromwin = openedFromWin;
	info.__callclass = strFormName;

	if(arrSpecialVars!=undefined)
	{
		info.__form = new Array();
		for(strItem in arrSpecialVars)
		{
			info.__form[strItem] = arrSpecialVars[strItem];
		}
	}

	var strWindowName = strFormName +"_"+ (__windowcount++);
	strWindowName = app.string_replace(strWindowName, " ","_",true);
	strWindowName =  app.string_replace(strWindowName, ".","_",true);
	
	
	__open_windows[strWindowName] = info;

	//-- get form processing path
	if(strFormName.indexOf(".php")!=-1)
	{
		var strURL = _root + "client/forms/_system/" + strType +"/" + strFormName;
		if(strParams!="")strURL += "?" + strParams;
		strWindowName = app.string_replace(strWindowName, ".php","_php",true);
	}
	else
	{
		var strURL = _root + "client/forms/xmlForm.php";//?swsessionid=" + _swsessionid + "&sessid="+ _swsessionid;
	}

	if(iWidth==undefined)iWidth=400;
	if(iHeight==undefined)iHeight=400;		
	return _open_window(strURL, strWindowName, boolModal, iWidth, iHeight,info,openedFromWin, strFormName);
}


//--
//-- supportwors uses modal windows to need way to mimic this. ie is ok as it has a modal window, mozilla and opera do not
function _open_window(strURL, strName, boolModal, iWidth, iHeight,info,openedFromWin,strSwFormName) 
{

	//-- 14.09.2010
	//-- check session is valid before opening any windows
	var xmlmc = new XmlMethodCall();
	if(!xmlmc.Invoke("session", "isSessionValid"))
	{
		//-- log out
		app.logout("m3");
		return false;
	}
	
	//-- hide any menu divs
	app.hide_application_menu_divs();
	
	//-- use window where this would have been triggered from
	if(_CURRENT_JS_WINDOW!=null)
	{
		if(_CURRENT_JS_WINDOW.closed)
		{
			_CURRENT_JS_WINDOW = null;
			openedFromWin=(openedFromWin)?openedFromWin:window;
		}
		else
		{
			openedFromWin=_CURRENT_JS_WINDOW;
		}
	}
	else
	{
		openedFromWin=(openedFromWin)?openedFromWin:window;
	}

	
	info.__parentwindow = openedFromWin;
	var _systemform =false;

	//-- check if we have cache info
	var strCacheFormName = info.__formtype +"_"+ strSwFormName;
	if(__cached_forms[strCacheFormName]!=undefined)
	{
		info.__cachedata = __cached_forms[strCacheFormName];
		iWidth = __cached_forms[strCacheFormName].width;
		iHeight = __cached_forms[strCacheFormName].height;
	}
	else if(strSwFormName.indexOf(".php")==-1)
	{
		//-- get xml form back as json - this will also check access permission
		var strPassUpParams = (info.__params!=undefined && info.__params!="")?"&"+info.__params:"";
		var strParams = "formtype=" + info.__formtype  + "&formname=" + info.__formname + "&formmode=" + info.__formmode + "&formkey=" + info.__recordkey + strPassUpParams;
		var strFormJSONURL = app._root  + "service/form/getform/index.php";
		var __formjson =  app.get_http(strFormJSONURL, strParams, true,false, null);
		if(__formjson!="")
		{
			if(__formjson.indexOf("formaccessdenied:")==0)
			{
				openedFromWin.alert(__formjson.replace("formaccessdenied:",""));
				return null;						
			}
			else if(__formjson.indexOf("invalid session")>-1)
			{
				app.logout("m3");
				return null;						
			}

			try
			{
				var jsonformdata = eval("(" + __formjson + ");");	
				
			}
			catch (e)
			{
				openedFromWin.alert("The form json structure for " + info.__formname + " is corrupt . Please contact your Administrator.");
				return null;
			}
		}

		//-- check json structure
		try
		{
			if(jsonformdata.espForm==undefined)
			{
				openedFromWin.alert("The form meta data for " + info.__formname + " is corrupt . Please contact your Administrator.");
				return null;
			}		
		}
		catch (e)
		{
			openedFromWin.alert("The form meta data for " + info.__formname + " is corrupt . Please contact your Administrator.");
			return null;
		}

		info.__formjsonstring = __formjson;
		__formjson = "";

		//-- get form default height and width from main form
		if(jsonformdata.espForm.layout==undefined)
		{
			//-- for lcf and cdf
			var iWidth = jsonformdata.espForm.layouts.layout[0].appearance.width;
			var iHeight = jsonformdata.espForm.layouts.layout[0].appearance.height;
		}
		else
		{
			//-- for stf form
			var iWidth = jsonformdata.espForm.layout.appearance.width;
			var iHeight = jsonformdata.espForm.layout.appearance.height;
		}

		iWidth--;
		iWidth = iWidth + 5;
		iHeight--;
		iHeight = iHeight + 32;
		if(info.__formtype=="cdf" || info.__formtype=="lcf") iHeight = iHeight + 48; //-- tab items
	}

	strName = strName + global.GetCurrentEpocTime(); //-- make unique so can open many
	__open_windows[strName] = info;

	//-- open and store pointer to the window
	var strModal = (boolModal)?"yes":"no";
	var aWin = window.open(strURL,strName,'toolbar=no,directories=no,status=yes,menubar=no,scrollbars=no,resizable=yes,height='+iHeight+',width='+iWidth+',modal='+strModal);
	if(aWin)
	{
		$(info.__parentwindow.document).find("*").off("focus.modals")
		//-- put a shimer over open from window
		if(boolModal)
		{
			var shimmer = info.__parentwindow.document.getElementById("windowModalDiv");
			if(shimmer==null)
			{
				var strHTML = "<div id='windowModalDiv' style='z-index:9999999;width:100%;height:100%;position:absolute;top:0px;left:0px;display:block;'></div>";
				app.insertBeforeEnd(info.__parentwindow.document.body,strHTML);
			}
			else
			{
				//-- already exists so just show shimmer
				shimmer.style.display="block";
			}
			$(info.__parentwindow).on("focus.modals",function(e)
			{
				aWin.focus();
				e.preventDefault();
				
				$(info.__parentwindow.document).find("*").off("focus.modals").on("focus.modals",function(e)
				{
					aWin.focus();
					e.preventDefault();
				});
			
			})
		}
		
		aWin.__app = top.app;
		__window_pointers[strName] = aWin;
		setTimeout("_focus_new_window('"+strName+"')",500);
		return aWin;
	}
	else
	{
		openedFromWin.alert("There was a problem opening the requested window. Please check for any popup blocker messages.");
		return null;
	}


	return null;
} 

function _on_window_closed(strName)
{
	var f = function()
	{
		if(__open_windows[strName])
		{
			try{
				var shimmer = __open_windows[strName].__parentwindow.document.getElementById("windowModalDiv");
				if(shimmer)shimmer.style.display="none";
			}catch(e){}
						
			if(__open_windows[strName].__callback && __open_windows[strName].returnInfo!=undefined)
			{
				//-- can cause issues in ie11??
				try{
					if(__open_windows[strName].__parentwindow) {_CURRENT_JS_WINDOW = __open_windows[strName].__parentwindow;}
				}catch(e){}
				
				__open_windows[strName].__callback(__open_windows[strName].returnInfo);
				
			}
		}
		__open_windows[strName] = null;
	};
	
	//-- used to have a timeout calling f() but removed for IE11 fix 92201	
	f();
}

function _focus_new_window(strName)
{
	try
	{
		__window_pointers[strName].focus();		
	}
	catch (e)
	{
	}

}

function _regexreplace(strValue,strFind,strReplace)
{
	  var re = new RegExp(strFind, "g");
	  strValue = strValue.replace(re, strReplace);
	  return strValue;
}
;;;;//-- mimic swc hsl:editrecord etc

function _hslaction(strAction,strParams,aLinkElement)
{
	if(strParams==undefined)strParams="";
	
	
	var arrRecParams = new Array();
	var arrParams = strParams.split("&");
	for(var x=0;x<arrParams.length;x++)
	{
		var arrPI = arrParams[x].split("=");
		arrRecParams[arrPI[0].toLowerCase()] = arrPI[1];
	}
	
	switch(strAction.toLowerCase())
	{
		case "mail":
			_hslaction_gotomailbox(arrRecParams,aLinkElement)
			break;

		case "callpanelfunction":
			_hslaction_callpanelfunction(arrRecParams,aLinkElement)
			break;

		case "swjscallback":
			_hslaction_swjscallback(arrRecParams,aLinkElement);
			break;
		case "mycalls":
			//-- switch to servicedesk view
			_hslaction_mycalls(arrRecParams,aLinkElement)
			break;
		case "mygroupcalls":
			_hslaction_mygroupcalls(arrRecParams,aLinkElement)
			break;
		case "editrecord":
			_hslaction_editrecord(arrRecParams,aLinkElement)
			break;

		case "calldetails":
			_hslaction_calldetails(arrRecParams,aLinkElement)
			break;
		case "logcall":
			_hslaction_logcall(strParams,aLinkElement)
			break;

		case "updatecall":
			_hslaction_updatecall(arrRecParams,aLinkElement)
			break;
		case "cancelcall":
			_hslaction_cancelcall(arrRecParams,aLinkElement)
			break;
		case "transfercall":
			_hslaction_transfercall(arrRecParams,aLinkElement)
			break;
		case "acceptcall":
			_hslaction_acceptcall(arrRecParams,aLinkElement)
			break;
		case "closecall":
			_hslaction_closecall(arrRecParams,aLinkElement)
			break;
		case "holdcall":
			_hslaction_holdcall(arrRecParams,aLinkElement)
			break;
		case "kbsearch":
			_hslaction_kbsearch(arrRecParams,aLinkElement)
			break;
		case "printme":
			_hslaction_printme(arrRecParams,aLinkElement)
			break;
		case "sqlsearch":
			_hslaction_sqlsearch(strParams,aLinkElement)
			break;
		case "reactivatecall":
			_hslaction_reactivatecall(strParams,aLinkElement)
			break;

		default:

			alert("_hslaction : " + strAction + ".\n\nThis action is not currently supported in the webclient");
			break;
	}
}

//-- 07.08.2013 - cr 88502 - support for switchign to a mailbox
function _hslaction_gotomailbox(arrRecParams,aLinkElement)
{
	app.setWcVar("selectmailboxname",arrRecParams["mailbox"]);
	global.SwitchSupportworksViewByType("mail");
}

function _hslaction_callpanelfunction(arrRecParams,aLinkElement)
{

	var targetPanel = arrRecParams["panel"];
	var targetFunctionName = arrRecParams["function"];

	//-- get iframe and function
	var iframe = (targetPanel=="left")?oControlFrameHolder:oWorkspaceFrameHolder;
	var funcPointer = iframe[targetFunctionName];

	if(funcPointer!=undefined && typeof funcPointer == 'function') 
	{
		var arrPassThru = [];
		for(var strParam in arrRecParams)
		{
			if(strParam!="panel" && strParam!="function")
			{
				arrPassThru.push(arrRecParams[strParam]);
			}
		}

		switch(arrPassThru.length)
		{
			case 0:
				funcPointer();
				break
			case 1:
				funcPointer(arrPassThru[0]);
				break
			case 2:
				funcPointer(arrPassThru[0],arrPassThru[1]);
				break
			case 3:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2]);
				break
			case 4:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3]);
				break
			case 5:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4]);
				break
			case 6:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5]);
				break
			case 7:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6]);
				break
			case 8:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6],arrPassThru[7]);
				break
			case 9:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6],arrPassThru[7],arrPassThru[8]);
				break
			case 10:
				funcPointer(arrPassThru[0],arrPassThru[1],arrPassThru[2],arrPassThru[3],arrPassThru[4],arrPassThru[5],arrPassThru[6],arrPassThru[7],arrPassThru[8],arrPassThru[9]);
				break

		}
	}	
	else
	{
		alert("_hslaction : callpanelfunction - The specified function ["+targetFunctionName+"] was not found in the "+targetPanel+" view frame");
	}
}

function _hslaction_reactivatecall(strParams,aLinkElement)
{
	var arrParams = app._explodeparams(strParams);
	if(arrParams['callref'])
	{
		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam("callref",arrParams['callref']);
		xmlmc.SetParam("restoreWorkflow",true);
		if(xmlmc.Invoke("helpdesk","reactivateCalls"))
		{
			app.getEleDoc(aLinkElement).location.reload(false);
		}
	}
}

function _hslaction_sqlsearch(strParams,aLinkElement)
{
	//alert(strParams)
	_open_system_form("_wc_sqlsearchform", "sqlsearch", "", strParams, false, undefined,undefined,undefined,800,600);
}

function _hslaction_swjscallback(arrRecParams,aLinkElement)
{
	var strFunction = arrRecParams['function'];
	if(app[strFunction])
	{
		var strParam = "";
		for(strID in arrRecParams)
		{
			 if( strParam != "")strParam += ",";
			  strParam += strID+"="+arrRecParams[strID];
		}
		app[strFunction](strParam);
	}
	else
	{
		alert("_hslaction : swjscallback - The specified function ["+strFunction+"] was not found at the application level");
	}

}

function _hslaction_kbsearch(arrRecParams,aLinkElement)
{
	var strSearchString = arrRecParams["search"];
	app.kbase.open_search(strSearchString);

}

function _hslaction_printme(arrRecParams,aLinkElement)
{
	aLinkElement.frameholder.print();
}

function _hslaction_mycalls(arrRecParams,aLinkElement)
{
	//-- switch view
	app.hslaction_servicedesk_view("mycalls", arrRecParams);
}

function _hslaction_mygroupcalls(arrRecParams,aLinkElement)
{
	app.hslaction_servicedesk_view("mygroupcalls", arrRecParams);
}

function _hslaction_editrecord(arrRecParams,aLinkElement)
{
	//-- get form for table (ddf info)
	if(arrRecParams["formmode"]==undefined)
	{
		arrRecParams["formmode"] = (arrRecParams["key"]==undefined)?"add":"edit";
	}

	if(arrRecParams["formmode"].toLowerCase()=="edit")
	{
		var strFormName = app.dd.tables[arrRecParams["table"]].editform;
		app.OpenFormForEdit(strFormName,arrRecParams["key"],"",true);
	}
	else
	{
		var strFormName = app.dd.tables[arrRecParams["table"]].addform;
		app.OpenFormForAdd(strFormName,arrRecParams["key"],"",true);
	}
}


//-- call based links
function _hslaction_calldetails(arrRecParams,aLinkElement)
{
	_open_call_detail(arrRecParams['callref']);
}

function _hslaction_logcall(strRecParams,aLinkElement,openedFromWin)
{
	_open_logcall_form(undefined, strRecParams, openedFromWin);
}


function _hslaction_cancelcall(arrRecParams,aLinkElement)
{
	_cancelcallform(arrRecParams['callref'], window);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_acceptcall(arrRecParams,aLinkElement)
{
	_acceptcallform(arrRecParams['callref'],window);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_transfercall(arrRecParams,aLinkElement)
{
	_assigncall(arrRecParams['callref']);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_updatecall(arrRecParams,aLinkElement)
{
	_updatecallform(arrRecParams['callref'],null,[],function()
	{
		app.getEleDoc(aLinkElement).location.reload(false);
	});
}

function _hslaction_closecall(arrRecParams,aLinkElement)
{
	_resolveclosecallform(arrRecParams['callref']);
	app.getEleDoc(aLinkElement).location.reload(false);
}

function _hslaction_holdcall(arrRecParams,aLinkElement)
{
	_holdcallform(arrRecParams['callref']);
	app.getEleDoc(aLinkElement).location.reload(false);
};;;;//-- 22.10.2009
//-- common functions that are used across applications - These should not be customised
var sys = new Object();



//--
//-- run an action of some type from a menu click (typically application menu items like file->manage customer->add new or logcall->incident)

//-- defined actions
var __LCF = "lcf"; //-- open log new call
var __FRMADD = "frmadd"; //-- open form for add
var __FRMEDIT = "frmedit"; //-- open form for edit
var __FRMBROWSE = "frmbrowse"; //-- open form for browse
var __KBASE = "kbase"; //-- kbase action
var __SETTING = "settings"; //-- setting action
var __HELP = "hlp"; //-- setting action
var __TOOLS = "tools"; //-- setting action

//-- function
sys.mnu_run_action = function (strMenuItem)
{

	var arrInfo = strMenuItem.split("--");
	var strAction = arrInfo[0];
	var strParams = arrInfo[1];

	//-- run action based on type
	switch(strAction)
	{
		case __TOOLS:
			sys.run_tool(strParams);
			break;

		case __HELP:
			sys.run_help(strParams);
			break;

		case __TESTING:
			sys.run_test(strParams);
			break;
		case __SETTING:
			sys.process_setting(strParams);
			break;
		case __LCF:
			sys.lcf(strParams)
			break;
			break;
		case __FRMADD:
			app.OpenFormForAdd(strParams,"",false);
			break;
		case __FRMBROWSE:
			app.OpenForm(strParams,"",false);
			break;
		case __KBASE:
			kbase.run_action(strParams);
			break;
		default:
			alert("System Menu Action : The defined action is not supported. Please contact your Administrator.",true);
			break;
	}
}


//-- tools menu
sys.run_tool = function(strParams)
{
	if(strParams=="lockcalls")
	{
		//-- popup system lock calls form
		_open_system_form("_wc_manage_lockedcalls", "managelockcalls", "", "", false, null);
	}
	else if(strParams=="changepassword")
	{
		_open_system_form("_wc_resetpassword", "password", "", "", false, null);
	}
	else if(strParams=="sessions")
	{
		//-- popup system sessions form if an admin
		if(session.role==3)
		{
			_open_system_form("_wc_manage_sessions", "managesessions", "", "", false, null);
		}
		else
		{
			alert("This option is only accessible to Administrators.",true);
		}
	}
	else if(strParams=="multiclip")
	{
		app._open_system_form("_wc_multiclip_editor", "multiclip", "", "", false, null, null,window);
	}
	else if(strParams=="qlc")
	{
		app._open_system_form("_sys_qlc_manage", "qlc", "", "", false, null, null,window);
	}
	else if(strParams=="switch")
	{
		if(session.HaveRight(ANALYST_RIGHT_F_GROUP,ANALYST_RIGHT_F_CANSWITCHDATADICTIONARIES,true))
		{
			app._open_system_form("_wc_switchddf", "switchddf", "", "", true,function(popupForm)
			{
				if(popupForm._swdoc._selected_app!="")
				{
					var strURL = app.get_service_url("session/switchddf","");
					var strRes = app.get_http(strURL, "_switchddf=" + popupForm._swdoc._selected_app + "&swsessionid=" + app._swsessionid, true,false, null);
					if(strRes=="ok")
					{
						__refreshing = true;
						window.location.reload(true);
					}
					else
					{
						alert("Failed to switch application. Please contact your Administrator",true);
					}
				}
			
			});	
		}
	}

}

//-- help menu item
sys.run_help = function(strParams)
{
	if(strParams=="about")
	{
		app._open_system_form("about.php","help","","",true,null,null,window,400,200);
	}
	if(strParams=="feedback")
	{
		var xmlmc = new XmlMethodCall()
		if(xmlmc.Invoke("system","getSystemInfo"))
		{		
			if(xmlmc.GetReturnValue("disableFeedback")=="1")
			{
				alert("Please contact your Supportworks administrator to provide feedback");

			}
			else
			{
				app._open_system_form("feedback.php","feedback","","",true,null,null,window,600,385);
				
			}
			return;
		}
		else
		{
			alert(xmlmc.GetLastError())
		}
	}
	else if(strParams=="debugon")
	{
		app._bDebugMode = true;
	}
	else if(strParams=="debugoff")
	{
		app._bDebugMode = false;
		app._arrLog = new Array();
	}
	else if(strParams=="debugshow")
	{
		show_debug();
	}
	else if(strParams.indexOf("url::")==0)
	{
		//-- open url - parse it
		var strUrlInfo = strParams.split("::");
		var strURL = app._swc_parse_variablestring(strUrlInfo[1],document);
		window.open(strURL);
	}
}

sys.run_test = function(strParams)
{
	var arrParam = strParams.split("-");
	if(arrParam[0]=="hd")
	{
		run_helpdesk_test(arrParam[1])
	}
}



//-- log off analyst - call http to kill session then goto login page.
sys.logoff = function()
{
	app.close_portal();
	document.location.href = app._root;
}

//-- re-load client with new application.
sys.switchapplication= function(strApplication)
{

}

//-- open log new call
sys.lcf = function(strCallClass)
{
	global.LogNewCall(strCallClass)
}




//-- process an client setting (like switching activex on and off)
sys.process_setting = function (strParams)
{
	var arrParam = strParams.split("-");
	if(arrParam[0]=="activex")
	{
		app.boolActivex = (arrParam[1]=="true");
	}
	else if(arrParam[0]=="debug")
	{
		show_debug();
	}
	else if(arrParam[0]=="profile")
	{
		_profilecodeselector(arrParam[1],"","", app._profilecodeselected);
	}
	else if(arrParam[0]=="analyst")
	{
		_analystpicker("Assign/Transfer Request","", "", app._analystselected);
	}

}



var __NEWISSUE = "newissue"; //-- setting action
var __LOGOUT = "logout"; //-- setting action
var __REFRESH = "refresh"; //-- setting action
var __TESTING = "testing"; //-- setting action
var __EMAIL = "new_email"; //-- setting action
function application_toolbar_action(strParams)
{
	var arrInfo = strParams.split("--");
	var strAction = arrInfo[0];
	var strParams = arrInfo[1];

	//-- run action based on type
	switch(strAction)
	{
		case __EMAIL:
			app._newEmail();
			break;

		case __NEWISSUE:
			app._issueform("","",false, window);
			//_servicedesk_refresh_issues(); //-- refresh issues list if it is available
			break;

		case __LOGOUT:
			app.logout("");
			break;
		case __REFRESH:
			__refreshing = true;
			window.location.reload(true);
			break;
		case __SETTING:
			sys.process_setting(strParams);
			break;
	}
}
;;;;//-- things to do with worknig with call(s) record
function _swchd_update_call(strCallrefs)
{

}

//-- return t/f if call is watched or unwatched (-1 if mixed i.e. more than one call passed in)
function _swchd_iscallwatched(strCallrefs, strAid)
{
	var strArgs = "_callrefs="+strCallrefs+"&_aid=" + app.pfs(strAid);
	var strURL = app.get_service_url("call/callwatched","");
	var xmlData = app.get_http(strURL,strArgs, true, true);				
	if(xmlData)
	{
		strCallrefs +="";
		var arrCallrefs = strCallrefs.split(",");
		var arrRecs = xmlData.getElementsByTagName("rec");
		if(arrRecs.length==0)
		{
			//-- not watched
			return false;
		}
		else if(arrRecs.length==arrCallrefs.length)
		{
			//-- all are watched
			return true;
		}
		else
		{
			return -1; //-- mixed
		}
	}

	return false;
}


function _swchd_assign_call(strCallrefs, strGroupID, strAnalystID, thirdPartyContract,fromWindow,callback)
{
	var bAssignedToThirdParty = false;
	var analChosenAnalyst = null;
	var strAssignTo = "";
	strCallrefs+="";
	var arrCallrefs = strCallrefs.split(",");
	var numCalls = (strCallrefs.indexOf(",")>-1)?arrCallrefs.length:1;

	
	if(callback===undefined)
	{
		callback = function(assignResult)
		{
			if(assignResult)
			{
				//-- if in helpdesk view refresh view
			}
		}
	}
	
	//-- function to handle assigning after using pickers
	var assignedToFunctionHandler = function(strGroupID, strAnalystID, thirdPartyContract)
	{
		// check if a group id and analyst id have been chosen, and if the group is Third Party.
		if(strGroupID=="") return false;
		if(strGroupID == "_THIRDPARTY")	bAssignedToThirdParty = true;	

		
		function secondLevelProcessingSigh()
		{
			if(app.OnAssignCall!=undefined)
			{
				var res = app.OnAssignCall(strCallrefs, strGroupID, strAnalystID);
				if(res==undefined || res==false) return;
			}

			
			// check if a group id and analyst id have been chosen, and if the group is Third Party.
			var strAnalystName = strAnalystID;
			if(strGroupID.length)
			{
				strAssignTo = "#";
				strAssignTo += strGroupID;
				if(strAnalystID.length)
				{
					strAssignTo += ":";
					strAssignTo += strAnalystID;

					//-- get analyst name
					var rs = new SqlQuery();
					rs.WebclientStoredQuery("system/getAnalystName","aid="+strAnalystID);
					if(rs.Fetch())
					{
						strAnalystName = rs.GetValueAsString("name");
					}
				}
				
				//-- nwj 12.05.2009 - applied cbs fix from default to here
				//-- F0070476 - CB - we add the 3rd party contract if any
				if(thirdPartyContract.length)
				{
					strAssignTo += ":";
					strAssignTo += thirdPartyContract;
				}
			}

			// ensure that there is no reason not to assign this call to this analyst
			if(strAnalystID.length)	// Only check if we have chosen an analyst
			{
				if(!bAssignedToThirdParty)
				{
					var analystObj = session.GetAnalystStatus(strAnalystID);
					if(!analystObj)
					{
						alert("Unable to determine analyst status. Please contact your Administrator");
						if(callback)callback(false);
						return;
					}
				}
				
				// if the logged-in analyst does not have "Can Change Call Status" permissions, then
				// he/she can only assign unaccepted calls to an analyst, or unassigned calls to a group.
				// nothing else is permitted.
				if (!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS))
				{

					if (document.nUnassigned == arrCallRefs.length)
					{
						//can assign to a group  only 
						alert("You do not have permission to assign this request to an Analyst. However you are allowed to assign it to a group.");
						if(callback)callback(false);
						return false;
					} 
				}
				
				
				//-- if the analyst is blocked from call assignment, do not allow assignment
				if((!bAssignedToThirdParty)&&(analystObj.bAssignBlocked))
				{
					alert("Assigning calls to this analyst has been disallowed by the system administrator.");
					if(callback)callback(false);
					return false;
				}

				// if analyst has an unavailable status, display away message and confirm assignment
				if(!bAssignedToThirdParty)
				{
					var strMsg = "";
					switch(analystObj.nStatus)
					{
						case ANALYST_STATUS_ATLUNCH:
							strMsg = ANALYST_STATUS_ATLUNCH_MSG;
							break;
						case ANALYST_STATUS_ONTRAINING:
							strMsg = ANALYST_STATUS_ONTRAINING_MSG;
							break;
						case ANALYST_STATUS_ONHOLIDAY:
							strMsg = ANALYST_STATUS_ONHOLIDAY_MSG;
							break;
						case ANALYST_STATUS_INAMEETING:
							strMsg = ANALYST_STATUS_INAMEETING_MSG;
							break;
						case ANALYST_STATUS_OUTOFOFFICE:
							strMsg = ANALYST_STATUS_OUTOFOFFICE_MSG;
							break;
						case ANALYST_STATUS_DONOTDISTURB:
							strMsg = ANALYST_STATUS_DONOTDISTURB_MSG;
							break;
						case ANALYST_STATUS_AVAILABLE:
						default:
							break;
					}
					if(strMsg!="")
					{
						if(!confirm(strAnalystName + " " + strMsg + "\n\n" + analystObj.strMessage + "\n\n" + "Do you still want to assign the request?"))	
						{
							if(callback)callback(false);
							return;
						}
					}
				}
				
				//-- If this analyst has a maximum number of calls set, make sure that this number has not been exceeded
				if((!bAssignedToThirdParty)&&(analystObj.nMaxAssignedCalls > 0) )
				{	
					var SqlRecordSetObj = new SqlQuery();
					SqlRecordSetObj.WebclientStoredQuery("system/getAnalystActiveCallCount","aid="+strAnalystID);
					if(SqlRecordSetObj.Fetch())
					{
						var nCount = SqlRecordSetObj.GetValueAsNumber(0) + numCalls;
						if(nCount > analystObj.nMaxAssignedCalls)
						{
							if(numCalls>1)
							{
								alert("Assigning these requests to this analyst will exceed the maximum number allowed ("+analystObj.nMaxAssignedCalls+"). Assignment of these requests is not possible.");
							}
							else
							{
								alert("Assigning this request to this analyst will exceed the maximum number allowed ("+analystObj.nMaxAssignedCalls+"). Assignment of this request is not possible.");
							}
							SqlRecordSetObj.Reset();
							if(callback)callback(false);
							return;
						}
					}
					SqlRecordSetObj.Reset();
				}

			}
			else
			{
				//-- being assigned to group
				if (!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS))
				{
					if (document.nUnaccepted == document.arrCallRefs.length)
					{
						//can assign to an analyst  only 
						alert("You do not have permission to assign this request to a group.");
						if(callback)callback(false);
						return;
					}
				}
			}

			var boolProcess=true;
			if(bAssignedToThirdParty)
			{
				//--
				//-- assign to 3rd party - popup assignment form if needed
				//-- get ddf setting to see if need to enter desc
				var strUseForm = app.dd.GetGlobalParamAsString("Third Party SLAs/DisplayHoldOption");
				if(strUseForm.toLowerCase()=="true")
				{
					//-- popup system form and get users
					app._open_system_form("_wc_assignthirdparty", "assignthirdparty", "", "", true,function (oForm)
					{
						if(oForm && oForm._swdoc._3p_assignment_desc!="")
						{
							if(thirdPartyContract!="")
							{
								boolProcess=false;
								var xmlmc = new XmlMethodCall();
								var arrCallrefs = strCallrefs.split(",");
								for(var x=0;x<arrCallrefs.length;x++)
								{
									xmlmc.SetParam("callref",arrCallrefs[x]);
								}

								if(oForm._swdoc._3p_assignment_hold==1)
								{
									xmlmc.SetParam("assignThirdPartySupplier",strAnalystID);
									xmlmc.SetParam("assignThirdPartyContract",thirdPartyContract);
									xmlmc.SetParam("holdUntil",oForm._swdoc._3p_assignment_date);
									xmlmc.SetParam("updateMessage",oForm._swdoc._3p_assignment_desc);

									//-- assign and hold
									var res = xmlmc.Invoke("helpdesk","assignAndHoldCallsto3rdParty");
									if(res)
									{
										var strMessage = app.xmlNodeTextByTag(xmlmc.xmlDOM,"message");
										if(strMessage!="")
										{
											//-- if it failed alert error to user and let them decide if to force assign
											if(confirm(strMessage +"\n\nWould you like to continue?"))
											{
												xmlmc.SetParam("forceAssignment",true);
												//-- assign and hold
												var res = xmlmc.Invoke("helpdesk","assignAndHoldCallsto3rdParty");
											}
										}
									}
								}
								else
								{
									xmlmc.SetParam("timeSpent",1);
									xmlmc.SetParam("description",oForm._swdoc._3p_assignment_desc);
									xmlmc.SetParam("publicUpdate",true);
									xmlmc.SetParam("assignThirdPartySupplier",strAnalystID);
									xmlmc.SetParam("assignThirdPartyContract",thirdPartyContract);
									var res = xmlmc.Invoke("helpdesk","updateAndAssignCallTo3rdParty");
									if(res)
									{
										var strMessage = app.xmlNodeTextByTag(xmlmc.xmlDOM,"message");
										if(strMessage!="")
										{
											//-- if it failed alert error to user and let them decide if to force assign
											if(confirm(strMessage +"\n\nWould you like to continue?"))
											{
												xmlmc.SetParam("forceAssignment",true);
												//-- assign and hold
												var res = xmlmc.Invoke("helpdesk","updateAndAssignCallTo3rdParty");
											}
										}
									}
								}
								if(!res)
								{
									alert(xmlmc.GetLastError());
								}
								if(callback)callback(res);
								return res;
							}
						}
						
						if(boolProcess)
						{
							//-- normal call assignment - use helpdesk session
							var swHD = new HelpdeskSession();
							var res =  swHD.AssignCall(strCallrefs,strGroupID, strAnalystID, thirdPartyContract);
							if(callback)callback(res)
							return res;
						}
					});// app._open_system_form("_wc_assignthirdparty"
				}
				else if(boolProcess)
				{
					//-- normal call assignment - use helpdesk session
					var swHD = new HelpdeskSession();
					var res = swHD.AssignCall(strCallrefs,strGroupID, strAnalystID, thirdPartyContract);
					if(callback)callback(res)
					return res;
					
				}
			}
			else if(boolProcess)
			{
				//-- normal call assignment - use helpdesk session
				var swHD = new HelpdeskSession();
				var res = swHD.AssignCall(strCallrefs,strGroupID, strAnalystID, thirdPartyContract);
				if(callback)callback(res)
				return res;
				
			}
			
		}//-- secondLevelProcessingSigh
		
		
		if(bAssignedToThirdParty && thirdPartyContract=="")
		{
			//-- check if there is more than one contract for the thirdparty
			var strContractNames = "";
			var SqlRecordSetObj = new SqlQuery();
			SqlRecordSetObj.WebclientStoredQuery("system/getThirdPartyContractNames","company="+strAnalystID);
			while(SqlRecordSetObj.Fetch())
			{
				if(strContractNames!="")strContractNames+="|";
				strContractNames += SqlRecordSetObj.GetValueAsString(0);
			}

			if(strContractNames=="")
			{
				alert("You cannot assign to a Third Party without a contract");
				if(callback)callback(false)
				return false;
			}
			else if(strContractNames.indexOf("|")==-1)
			{
				//-- else default to the only one
				thirdPartyContract = strContractNames;
			}
			else
			{
				//-- show popup form so user can select 3rd party
				var strParam = "_company=" + strAnalystID;
				app._open_system_form("_wc_contractselector", "assignthirdparty", "",strParam, true,function(oForm)
				{
					if(oForm && oForm._swdoc._3p_assignment_contract!="")
					{
						thirdPartyContract = oForm._swdoc._3p_assignment_contract
						secondLevelProcessingSigh();
					}
					else
					{
						if(callback)callback(false)
						return false;
					}
				});
			}
			secondLevelProcessingSigh();
		}
		else
		{
			secondLevelProcessingSigh();
		}
	}//-- eof assignedToFunctionHandler
	
	
	if(strGroupID==undefined||strGroupID=="")
	{
		//-- popup analyst picker
		var picker = new PickAnalystDialog();
		var aRes = picker.Open("Assign Request To:",true,function()
		{		
			strGroupID = picker.groupid; 
			strAnalystID = picker.analystid; 
			thirdPartyContract = picker.tpcontract;
			assignedToFunctionHandler(strGroupID, strAnalystID, thirdPartyContract);
		});
	}
	else
	{
		assignedToFunctionHandler(strGroupID, strAnalystID, thirdPartyContract);
	}
}


function _swchd_accept_call(strCallrefs,openfromWin,arrSpecial,callback)
{
	//-- check if we want to show ddf accept call form or system basic accept call
	return _acceptcallform(strCallrefs,openfromWin,arrSpecial,callback);
}


function _swchd_hold_call(strCallrefs)
{
	return _holdcallform(strCallrefs,openfromWin,arrSpecial);
}

function _swchd_reactivate_call(strCallrefs)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANREACTIVATECALLS))return false;

	var swHD = new HelpdeskSession();
	return swHD.ReactivateCall(strCallrefs);

}

function _swchd_offhold_call(strCallrefs)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANTAKECALLOFFHOLD))return false;
	
	var oHD = new HelpdeskSession();
	oHD.TakeCallOffHold(strCallrefs);
	return true;
}


function _swchd_close_call(strCallrefs)
{

}


function _swchd_cancel_call(strCallrefs)
{

}


;;;;//-- 22.10.2009
//-- common kbase functions that are used across applications - These should not be customised
var kbase = new Object();
kbase._searchstring = "";

//--
//-- run an action of some type from a menu click (typically application menu items like file->manage customer->add new or logcall->incident)
//-- defined actions
var __KB_SEARCH = "search"; //-- search kbase
var __KB_COMPOSE = "compose"; //-- compose new kbase document
var __KB_SUBMIT = "submit"; //-- submit ext document
var __KB_MANAGE = "manage"; //-- manage catalogs
//-- function
kbase.run_action = function (strAction)
{
	switch(strAction)
	{
		case "search":
			kbase.open_search();
			break;
		case "compose":
			kbase.open_compose();
			break;
		case "submit":
			kbase.open_external();
			break;
		case "manage":
			kbase.open_catalogs();
			break;

	}
}

kbase.get_catalog_list_for_lb = function(oListbox)
{
	var strList= "";
	var xmlmc = new XmlMethodCall();
	if(xmlmc.Invoke("knowledgebase", "catalogList"))
	{
		var arrListXml = xmlmc.xmlDOM.getElementsByTagName("folder");
		for(var x=0;x<arrListXml.length;x++)
		{
			var strID  = app.xmlNodeTextByTag(arrListXml[x],"catalogId");
			var strName = app.xmlNodeTextByTag(arrListXml[x],"name");

			if(strList!="")strList+="|";
			strList += strName +"^" + strID;
		}
	}
	oListbox.pickList = strList;
}


//-- search
kbase.open_search = function (strSearchString)
{
	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS,true))return false;
	
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/search/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		if(strSearchString==undefined)strSearchString="";
		this._searchstring = strSearchString;

		//--switch to kbase search view
		app.application_navbar.activatebar("knowledgebase_view");
	}
}

//-- compose document
kbase.open_compose = function (strParams,modal, modalCallbackFunction)
{

	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANADDKBDOCUMENTS,true))return false;
				
	//-- check if we have overiding sw-app function
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/new kb doc/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		if(strParams==undefined)strParams="";
		var strFormName = "_sys_kb_article";
		_open_system_form(strFormName, "knowledgebase", "", strParams, true, function(returnFormInfo)
		{
			if(modalCallbackFunction)
			{
				var result = (returnFormInfo && returnFormInfo._swdoc && returnFormInfo._swdoc.boolSavedOk!=undefined) ?returnFormInfo._swdoc.boolSavedOk:false;
				modalCallbackFunction(result);
			}
		},null,window);
	}
}

//-- compose ext document
kbase.open_external = function (modalCallbackFunction)
{
	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANADDEXTKBDOCUMENTS,true))return false;

	//-- check if we have overiding sw-app function
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/submit ext doc/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		var strFormName = "_sys_kb_external";
		_open_system_form(strFormName, "knowledgebase", "", "", false, null,null,window)
	}
}

//-- manage catalogs
kbase.open_catalogs = function ()
{
	//-- check if we have overiding sw-app function
	var res = true;
	var strAction = app.dd.GetGlobalParamAsString("knowledgebase menu items/manage catalogues/action");
	if(strAction!="" && app[strAction])
	{
		res =app[strAction]();
	}

	if(res)
	{
		var strFormName = "_sw_kb_manage";
		_open_system_form(strFormName, "knowledgebase", "", "", false, null,null,window)
	}
}

kbase.open_document = function (strDoc)
{
	
	if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANEDITKBDOCUMENTS,true))return false;

	var res = true;
	if(app.OnOpenKBArticleProperties!=undefined)
	{
		res = app.OnOpenKBArticleProperties(strDoc);
	}

	if(res)
	{
		//-- open kbase record - open different form based on type
		var xmlmc = new XmlMethodCall();
		xmlmc.SetValue("docRef",strDoc);
		if(xmlmc.Invoke("knowledgebase","documentGetType"))
		{
			//alert(xmlmc.GetParamValue("type").toLowerCase())
			if(xmlmc.GetParamValue("type").toLowerCase()=="internal")
			{
				var strFormName = "_sys_kb_article";
			}
			else
			{
				var strFormName = "_sys_kb_external";
			}

			_open_system_form(strFormName, "knowledgebase", strDoc, "", false, null,null,window);		
		}
		else
		{
			alert("Failed to fetch article type. Please contact your Administrator");
		}
	}
}

//-- call service to perform search and return table rows
kbase.get_search_results = function(strSearchText,strSearchMethod, bitSearchFlag, strSearchInCatalog,intRows,intSortCol, boolSortAsc, targetTableHolder)
{

	if(intSortCol==undefined)intSortCol=0;
	if(boolSortAsc==undefined)boolSortAsc="true";

	//-- use xml api to get matched document
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("queryString",strSearchText)

	//-- set catalog id
	if(strSearchInCatalog=="")strSearchInCatalog=0;
	xmlmc.SetParam("catalogId",strSearchInCatalog)

	var strAction = "queryNatural"
	if(strSearchMethod!="1")
	{
		//-- doing a word search
		strAction = "queryKeyword"
		var strType = (strSearchMethod=="2")?"all":"any";
		xmlmc.SetParam("queryType",strType)

		//-- search on
		if(bitSearchFlag & 2) 		xmlmc.SetParam("searchTitle","true");
		if(bitSearchFlag & 1) 		xmlmc.SetParam("searchKeywords","true");
		if(bitSearchFlag & 4) 		xmlmc.SetParam("searchProblem","true");
		if(bitSearchFlag & 8) 		xmlmc.SetParam("searchSolution","true");
		//	searchCallProbCode xs:boolean optional Set to 'true' to search the call problem code profile 
	}

	xmlmc.SetParam("maxResults",intRows); //-- max rows to return
	xmlmc.SetParam("sortResultsBy",intSortCol);
	xmlmc.SetParam("sortResultsAsc",boolSortAsc); 

	if(xmlmc.Invoke("knowledgebase",strAction))
	{
		//-- create table html
		var max_score = 0;		
		var strRows = "";
		var arrDocs = xmlmc.xmlDOM.getElementsByTagName("document");

		//-- need to find max relevance
		for (var x=0;x<arrDocs.length;x++)
		{
			//-- get values
			var relevance = xmlNodeTextByTag(arrDocs[x],"relevance");
			if(relevance=="")break;
			relevance++;relevance--;
			if(relevance  > max_score)max_score = relevance ;
		}

		for (var x=0;x<arrDocs.length;x++)
		{
			//-- get values
			var relevance = xmlNodeTextByTag(arrDocs[x],"relevance");
			var docref = xmlNodeTextByTag(arrDocs[x],"docref");
			var docdate = xmlNodeTextByTag(arrDocs[x],"date");
			var title = xmlNodeTextByTag(arrDocs[x],"title");

			//-- determine relevance % if we have some
			if(relevance!="")
			{
				var perc = app.number_format((relevance/max_score)*100,0);			
				relevance = "<div style='width:"+perc+"%;background-color:#6EB4C8;color:#000000;'>"+perc+"%</div>";
			}
			else
			{
				relevance = "N/A";
			}

			//-- create row html
			var strDataRow = "";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + relevance + "</div></td>";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + docref + "</div></td>";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + docdate + "</div></td>";
			strDataRow += "<td dbvalue='sat' noWrap><div>" + title + "</div></td>";
			strRows += "<tr type='sys' keycolumn='docref' keyvalue='"+ docref + "' onclick='app.kbase_select_row(this,event);' ondblclick='app.kbase_open_row(this,event);'>" + strDataRow + "</tr>";
		}

		if(targetTableHolder!=undefined)
		{
			var intRowCount = app.datatable_draw_data(targetTableHolder, strRows,true);
			return intRowCount;
		}
		else
		{
			return strData;
		}
	}	
	else
	{
		alert(xmlmc.GetLastError())
	}
	return false; 
	/*
	//-- 
	//-- xmlmc failed so use php
	var strParams = "searchtext=" + app.pfu(strSearchText) + "&searchmethod=" + app.pfu(strSearchMethod) + "&searchflag=" + bitSearchFlag + "&searchcatalog=" + app.pfu(strSearchInCatalog) + "&sqlrowlimit=" + intRows;
	var strURL = app.get_service_url("kbase/search","");
	var strData = app.get_http(strURL,strParams, true, false);
	if(targetTableHolder!=undefined)
	{
		var intRowCount = app.datatable_draw_data(targetTableHolder, strData,true);
		return intRowCount;
	}
	else
	{
		return strData;
	}
	*/
}
;;;;//-- CONSTANTS 
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
;;;;var _arr_tablenames_by_pos = new Array();

//-- hold xml dom for mailbox list
var _arr_xml_mailbox_list = new Array();

//-- hold calendars the user has access to
var _arr_xml_calendar_list = new Array();

//-- hold cdf form names
var _arr_cdf_forms = new Array();

//-- hold helpdesk xml
var _helpdesk_view_tree_reload = false;
var _xml_helpdesk_view_tree = null;
var _xml_helpdesk_view_3p_tree = null;
var _xml_helpdesk_assign_tree = null;
var _xml_helpdesk_3p_assign_tree = null;

//-- hold multiclip tree xml
var _xml_multiclip_tree = null;

var _xml_defaultslainfo = null;

var _xml_logcallconfirmation = null;

//-- 26.10.2009 - mimic full client session functions and vars
var session = new Object();

//-- variables
session.AnalystId = "";
session.analystId = "";
session.analystID = "";
session.analystid = "";
session.analystname = "";
session.groupId = "";
session.currentAnalystId = "";
session.currentGroupId = "";
session.contextMode = "";
session.dataDictionary = "";
session.httpPort = 80;
session.isAdmin = false;
session.maxBackdatePeriod = 0;
session.port = 0;
session.role = 0;
session.server = "";
session.serverBuild = "";
session.sessionId = "";
session.timezone = "";
session.timezoneOffset = "";
session.wsIpAddress = "";
session.rightsjson = null;
session.dataset = "";
session.currentddDataset = "";
session.datasetFilterList = "";
session.currentddDatasetFilterList = "";

function _initialise_appdot_variables()
{
	//-- 91819 so usable in customhelpmenu.xml
	app.sessionid = session.sessionId;
	app.sessionId = session.sessionId;
	app.currentdd = session.dataDictionary
	app.instance = "SW";

	//-- use setting from ddf (getsessioninfo2 should also return these)
	app.dataset = app.dd.GetGlobalParamAsString("Application Settings/Dataset");	
	app.datasetfilterlist = app.dd.GetGlobalParamAsString("Application Settings/DatasetFilterList");	
	
	//-- copy to session var ? why do we have some many holding the same thing?
	session.dataset = app.dataset;
	session.currentddDataset = app.dataset
	session.datasetFilterList = app.datasetfilterlist;
	session.currentddDatasetFilterList = app.datasetfilterlist;
}

//-- methods
function _initialise_analyst_session_variables()
{	
	//-- show create issue icon
	var strIssuesVisible = app.dd.GetGlobalParamAsString("Views/helpdesk view/bottom/issues view/visible");	
	var bShowNewIssue = (strIssuesVisible.toLowerCase()=="yes")?true:false;
	app.toolbarmenu_item_sorh("newissue" , bShowNewIssue, document);

	session.AnalystId = _analyst_id;
	session.analystId = _analyst_id;
	session.analystid = _analyst_id;
	session.analystID = _analyst_id;
	session.analystname = _analyst_name;

	session.groupId = _analyst_supportgroup;
	session.groupid = _analyst_supportgroup;
	session.currentAnalystId = _analyst_id;
	session.currentGroupId = _analyst_supportgroup;
	session.userdefaults = _analyst_userdefaults;
	session.contextMode = "";
	session.dataDictionary = _application;
	session.isAdmin = _analyst_admin;
	session.maxBackdatePeriod = _analyst_maxbackdateperiod;
	session.role = _analyst_privlevel;
	session.serverBuild = "";
	session.sessionId = _swsessionid;
	session.timezone = _analyst_timezone;
	session.timeZone = _analyst_timezone;
	session.timezoneOffset = _analyst_timezoneoffset;
	session.timezoneOffset--;session.timezoneOffset++;
	session.timeZoneOffset = session.timezoneOffset;

	//-- 26.04.2012- 88089 - so appdev urls point to correct location
	session.server = document.location.host;
	session.httpPort = httpport;

	session.wsComputerName = "N/A";
	session.wsIpAddress = "N/A";

	session.CloseSession=function(strSessionID)
	{
		var strURL = app.get_service_url("session/disconnect/closesession.php","");
		return app.get_http(strURL, "closesessionid=" + strSessionID, true,false, null);
	}

	_initialise_appdot_variables()

	_load_cdf_formnames();

	_load_session_rights();

	//-- are we connected to mail server? call twice to get over xmlmc problem where first call to mail always fails
	var boolMB = global.IsConnectedToMailServer();

	//-- get mailbox rights (sys.email.js) - will populate global array _current_mailbox_permissions
	_email_getmailbox_permissions()

	//-- then get mailbox info for each one that user has rights to
	_arr_xml_mailbox_list = new Array();
	
	for(strMailBoxName in _current_mailbox_permissions)
	{
		//-- get mailbox associated address
		var arr_addresses = new Array();
		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam("mailbox",strMailBoxName); 
		xmlmc.SetParam("getAddresses",true); 
		if(xmlmc.Invoke("mail", "getMailboxList"))
		{
			//-- address for this mailbox
			arr_addresses = xmlmc.xmlDOM.getElementsByTagName("mailbox");
		
			//-- now just get normal mailbox info - this getMailboxList method is kak - should return all is data in one hit
			var arr_mb = new Array();
			var xmlmc = new XmlMethodCall();
			xmlmc.SetParam("mailbox",strMailBoxName); 
			if(xmlmc.Invoke("mail", "getMailboxList"))
			{
				arr_mb = xmlmc.xmlDOM.getElementsByTagName("mailbox");
			}

			//-- merge mailbox info
			for(var x=0;x<arr_mb.length;x++)
			{
				_arr_xml_mailbox_list[_arr_xml_mailbox_list.length++] = arr_mb[x];
			}

			for(var x=0;x<arr_addresses.length;x++)
			{
				var checkMailboxName = xmlNodeTextByTag(arr_addresses[x],"name");
				var checkMailboxAddress = xmlNodeTextByTag(arr_addresses[x],"address");

				//-- need to check if this associated address is the default one i.e. check if it is in arr_mb
				var boolSkip = false;
				for(var y=0;y<arr_mb.length;y++)
				{
					var masterMailboxName = xmlNodeTextByTag(arr_mb[y],"name");
					var masterMailboxAddress = xmlNodeTextByTag(arr_mb[y],"address");
					var masterMailboxType = xmlNodeTextByTag(arr_mb[y],"type");
					if(masterMailboxType==1 || (checkMailboxName==masterMailboxName && checkMailboxAddress==masterMailboxAddress))
					{
						//-- already defined in master mailboxes so skip
						boolSkip = true;
						break;
					}
				}

				if(!boolSkip)_arr_xml_mailbox_list[_arr_xml_mailbox_list.length++] = arr_addresses[x];
			}
		}
	} //-- eof for loop permitted mailboxes
	
	if(_arr_xml_mailbox_list.length==0)
	{
		//-- hide main toolbar mail icon - user has no permissions
		global._mailserverrunning=false; 
		boolMB=false;
	}

	//-- doesnt exist anymore - need to hide drop down menu item
	//-- hide compose email icon if no mbs
	//app.toolbar_item_dore("app-toolbar", "new_email" , boolMB, document);
	

	//-- get calendar xml
	var xmlmc = app._new_xmlmethodcall();
	if(xmlmc.Invoke("calendar", "getCalendars"))
	{
		_arr_xml_calendar_list = xmlmc.xmlDOM.getElementsByTagName("calendar");
	}

	
	//-- load helpdesk tree xml
	if(!global.RefreshHelpdeskAnalystsTree())
	{
		app.logout("");
		return;
	}

	//-- get call confirmation settings from xml
	var lcfxmlurl = dd.GetGlobalParamAsString("global call settings/logcallconfirmmsg");
	if(lcfxmlurl!="")
	{
		app.get_http(_swc_parse_variablestring(lcfxmlurl), "", false,true,function(res){_xml_logcallconfirmation=res;});
	}

	//--
	//-- start monitoring call updates so we can refresh helpdesk view and popup notification
	setTimeout("app._on_updatedcalls_notification_received('')",5000);
}

function _get_webclient_cookie(strCookieID)
{
	strCookieID = app.pfu(_application +":"+strCookieID);
	var strURL = app.get_service_url("session/getcookie","");
	return app.get_http(strURL, "analystid=" + session.analystId + "&settingid=" + strCookieID, true,false, null);
}

function _set_webclient_cookie(strCookieID, varValue)
{
	strCookieID = app.pfu(_application +":"+strCookieID);
	var strURL = app.get_service_url("session/setcookie","");
	var res = app.get_http(strURL, "analystid=" + session.analystId + "&cookievalue=" + app.pfu(varValue) + "&settingid=" + strCookieID, true,false, null);
	return (res=="OK");
}

function _load_cdf_formnames()
{
	//-- check the form name for this callclass
	_arr_cdf_forms = new Array();
	var tmpQ = new SqlQuery();
	if(tmpQ.WebclientStoredQuery("system/getCallDetailFormNames",""))
	{
		while(tmpQ.Fetch())
		{
			_arr_cdf_forms[tmpQ.GetValueAsString("formname")] = tmpQ.GetValueAsString("callclass");
		}
	}
}

function _load_session_rights()
{
	if(session.rightsjson!=null)return;
	//-- get rights xml
	var strURL = app.get_service_url("session/getrights","");
	try
	{
		session.rightsjson = eval("(" + app.get_http(strURL, "", true,false, null) +")");		
	}
	catch (e)
	{
		alert("Analyst session rights could not be loaded. Please contact your Administrator");
		sys.logoff();
	}
}


function _on_updatedcalls_notification_received(strRes)
{
	//-- poll for next set of data
	var intPollSec = dd.GetGlobalParamAsNumber("views/helpdesk view/webclient settings/refreshpolling");
	if(isNaN(intPollSec) || intPollSec<1)return; //-- do not do any polling

	var iTimeoutPeriod = (intPollSec*1000);

	//-- if not in helpdesk view (or view not ready) then do not refresh - but still call timeout to check again later
	if(_CurrentOutlookType!="helpdesk" || _servicedesk_tree==null || _refresh_servicedesk_againstdata==undefined || _ServiceDeskDocumentElement==null)
	{
		setTimeout("app._on_updatedcalls_notification_received('')",iTimeoutPeriod);		
		return;
	}

	if(strRes != "")
	{
		//-- service desk is visible so process
		if(_refresh_servicedesk_againstdata!=undefined && _ServiceDeskDocumentElement.body.offsetWidth>0)
		{
			//-- call function to update call row in helpdesk view - set timeout of 100th second
			_refresh_servicedesk_againstdata(strRes);
		}

		setTimeout("app._on_updatedcalls_notification_received('')",iTimeoutPeriod);
		return;
	}

	//-- go get updated service desk view data
	//-- get list of distinct columns to select (so we dont have to do a select * from opencall
	var strSelectColumns =_servicedesk_get_distinct_columns();
	var strURL = app.get_service_url("call/getupdatedcallslist","");
	var strArgs = "_selectcols="+strSelectColumns+"&_last_lastactdatex=" + _LAST_HELPDESKVIEW_LASTACTDATEX;
	//-- will callback this function
	app.get_http(strURL,strArgs, false, false,app._on_updatedcalls_notification_received);
}


//-- switch analyst context
session.SwitchContext = function (strRepID, strGroupID)
{
	//-- if select groupid is not one of analysts groups then exit
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANSWITCHGROUP))
	{
		if(_analyst_in_supportgroups.indexOf(strGroupID)==-1 || strGroupID=="") 
		{
			alert("You do not have rights to change your service desk context to another group.");
			return false;
		}
	}

	//-- if select aid is not analyst and does not have right then exit
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANSWITCHREP))
	{
		if(strRepID!="" && strRepID != this.analystid)
		{
			alert("You do not have rights to change your service desk context to that of another analyst.");
			return false;
		}
	}


	//-- 14.0.9.2010 - use new xmlmc method call
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("groupId",strGroupID); 
	xmlmc.SetParam("analystId",strRepID); //-- send even if blank
	if(xmlmc.Invoke("session", "switchAnalystContext"))
	{
		session.currentAnalystId = strRepID;
		session.currentGroupId = strGroupID;
	}
	else
	{
		alert(xmlmc.GetLastError());
		return false;
	}

	//-- 14.0.9.2010 - replaced with new xmlmc api above
	/*var strURL = app.get_service_url("session/switchcontext","");
	var res = app.get_http(strURL, "analystid=" + app.pfu(strRepID) + "&groupid=" + app.pfu(strGroupID), true,false, null);
	if(res)
	{
		session.currentAnalystId = strRepID;
		session.currentGroupId = strGroupID;
	}
	*/
	return true;
}

//-- t/f can back date call actions
session.CanBackdateCallActions= function ()
{
	return (this.maxBackdatePeriod>0);
}

//-- get analyst status
session.GetAnalystStatus= function (strAnalystID)
{
	var strURL = app.get_service_url("session/getanalyststatus","");
	var strJS = app.get_http(strURL, "analystid=" + strAnalystID + "&swsessionid=" + app._swsessionid, true,false, null);
	if(strJS=="")return false;

	eval(strJS);
	return tmpObject;
}

//-- get # res profile levels required
session.GetCloseProfileLevelRequired= function ()
{
	var div = Math.round(_analyst_rightsh / 65536);
	if(div>0)
	{
		//-- we have problem profiles
		var sub = div * 65536;
		var resNum = _analyst_rightsh - sub;
	}
	else
	{
		var resNum = _analyst_rightsh;
	}
	return resNum;
}


//-- get # prob profile levels required
session.GetProbProfileLevelRequired= function ()
{
	var div = Math.round(_analyst_rightsh / 65536);
	return div;
}


session.IsMemberOfSupportGroup=function(strGroup)
{
	var arrGroup = _analyst_in_supportgroups.split(",");
	for(var x=0; x<arrGroup.length;x++)
	{
		if(arrGroup[x].toLowerCase()==strGroup.toLowerCase())return true;
	}
	return false;
}

//-- get max backdate period
session.GetMaxBackdatePeriodAllowed= function ()
{
	return session.maxBackdatePeriod;
}

//-- t/f has application right
session.HaveAppRight= function (nGroupID, nRightID, strApplication)
{
	if(strApplication==undefined || strApplication=="")strApplication = app._application;

	if(this.rightsjson==null)_load_session_rights();
	if(this.rightsjson==null) 
	{
		return false;
	}
	//-- session expired most likely
	if(this.rightsjson["@status"]==false)
	{
		//-- bail out with error
		app.logout(this.rightsjson.state.error);
		return false;
	}


	var arrAppRights = jA(this.rightsjson.params.appRight);
	var xmlRights = arrAppRights[0];
	if(xmlRights==undefined)
	{
		alert("The application rights data could not be loaded. Please contact your administrator.");
		return false;
	}
	else
	{
		var strMatchApp = strApplication.toLowerCase();
		var arrRightTypes = ["A","B","C","D","E","F","G","H"];
		for(var x=0; x<arrAppRights.length;x++)
		{
			if(arrAppRights[x].appName.toLowerCase()==strMatchApp)
			{
				if(isNaN(nGroupID))
				{
					var jRight = arrAppRights[x]["right" + nGroupID.toUpperCase()];
				}
				else
				{
					var jRight = arrAppRights[x]["right" + arrRightTypes[nGroupID-1]];
				}

				if(jRight==undefined)
				{
					alert("The requested application rights data could not be found. Please contact your administrator.");
					return false;
				}
				else
				{
					//-- need to convert rightid to actual bit value (i.e. rightid 3 = bit value 4)
					var intFlag = jRight-0;
					intFlag++;intFlag--;
					return (this.flags(nRightID) & intFlag);
				}
			}
		}
	}
	return false;
}

session.flags = function(flagPos)
{
	if(this.bitflags!=undefined)return this.bitflags[flagPos];


	this.bitflags = new Array();
	var y=1;
	for(var x=1;x<65;x++)
	{
		this.bitflags[x] = y;
		y=y*2;
	}
	return this.bitflags[flagPos];
}

//--
//-- given a sql statement will tell you if user has table rights
session._checkedtablerights = new Array();
session.CheckTableRight = function (strTable,iCheckRight,boolMessage)
{

	//-- 23.07.2012 - 88896
	//-- if this table and right has been checked already then use array to get result quickly (don't have to traverse xml)
	if(session._checkedtablerights[strTable]==undefined)session._checkedtablerights[strTable]=new Array();
	if(session._checkedtablerights[strTable][iCheckRight]!=undefined)
	{
		if(session._checkedtablerights[strTable][iCheckRight]!="" && boolMessage)
		{		
			alert(session._checkedtablerights[strTable][iCheckRight]);
		}
		return session._checkedtablerights[strTable][iCheckRight];
	}

	var strMessage="";
	if(boolMessage==undefined)boolMessage=true;

	if(this.rightsjson==null)_load_session_rights();
	if(this.rightsjson==null) 
	{
		return false;
	}

	//-- session expired most likely
	if(this.rightsjson["@status"]==false)
	{
		//-- bail out with error
		app.logout(this.rightsjson.state.error);
		return false;
	}

	var arrTableRights = this.rightsjson.params.databaseRight;
	if(arrTableRights==undefined)
	{
		strMessage= "The table rights data could not be loaded. Please contact your administrator.";
	}
	else
	{	
		var jRights = arrTableRights[0];
		if(iCheckRight!=undefined)
		{
			//-- loop db rights and find table name
			var tableRights = jRights.tableRight;
			var matchTable = strTable.toLowerCase();
			for(var x=0;x<tableRights.length;x++)
			{
				//-- do we have matching table
				if(tableRights[x].tableName.toLowerCase() == matchTable)
				{
					var intFlag = tableRights[x].right-0;
					var res = ((iCheckRight & intFlag)>0)?true:false;
					if(res)
					{
						//-- table ok to use
						session._checkedtablerights[strTable][iCheckRight] = "";
						return "";
					}
					break;
				}
			}
			strMessage = "You do not have permission to ["+_get_table_right_desc(iCheckRight) +"] on the database table:-\n\n" + strTable+ ".\n\nThe table permissions are granted by your Administrator.";
		}
	}

	session._checkedtablerights[strTable][iCheckRight] = strMessage;
	if(boolMessage && strMessage!="")alert(strMessage);
	return strMessage;
}

session.HaveRight = function (nGroupID, nRightID, boolMessage)
{
	if(boolMessage==undefined)boolMessage=false;
	var arrClientRights = this.rightsjson.params;
	if(arrClientRights==undefined)
	{
		alert("The client rights data could not be loaded. Please contact your administrator.");
		return false;
	}
	else
	{
		var arrRightTypes = ["a","b","c","d","e","f","g","h"];
		if(isNaN(nGroupID))
		{
			nGroupID= nGroupID.toLowerCase();
			for(var x=0;x<arrRightTypes.length;x++)
			{
				if(nGroupID==arrRightTypes[x])
				{
					nGroupID=x+1;
					break;
				}
			}
		}

		var jRight = arrClientRights["sl" + arrRightTypes[nGroupID-1]];	
		if(jRight==undefined)
		{
			alert("The requested rights data could not be found. Please contact your administrator.");
			return false;
		}
		else
		{
			var intFlag = jRight-0; //-- cast
			var res = ((nRightID & intFlag)!=0)?true:false;
			if(!res && boolMessage)
			{
				try
				{
					var strMessage = _CALL_RIGHTS_MSG[nGroupID][nRightID];
					alert(strMessage)
				}
				catch (e)
				{
				}

			}
			return res;
		}
	}
}

//-- t/f is esp option default
session.IsDefaultOption= function (nOption)
{
	return ((nOption & this.userdefaults)>0)?true:false;
}


//-- refresh a call details form (should it send npa?)
session.RefreshCallDetails= function (nCallRef)
{
}


//-- load application toolbar defs
var __arr_application_toolbar_html = new Array();
function _toolbars_loaded(strRes)
{
	var arrTBS = strRes.split("_sw2split_");
	for(var x=0;x<arrTBS.length;x++)
	{
		var arrTB = arrTBS[x].split("_swsplit_");
		__arr_application_toolbar_html[arrTB[0]]= arrTB[1];
	}
	_swcore.bToolbarsLoaded = true;
}


//-- load application picklists
function _load_application_picklists(strPickListXmlString)
{
	app._xmlPickLists = create_xml_dom(strPickListXmlString);
	if(typeof app._xmlPickLists!="object")
	{
		alert("The application pick list definitions could not be loaded. Please contact your Administrator");
		app._xmlPickLists = null;

		//-- major error so log out
		sys.logoff();
		return false;
	}
	_swcore.bPicklistsLoaded = true;

}


//--
//-- load mes xml defs
function _load_application_dbentityviews(dbevXmlString)
{
	app._xmlManagedEntitySearches = create_xml_dom(dbevXmlString);
	if(typeof app._xmlManagedEntitySearches!="object")
	{
		app._xmlManagedEntitySearches = null;
	}
}

function _load_application_schema(strSchemaJson)
{
	app._jsonSchemaString = strSchemaJson;
	try
	{
		app._jsonSchema = eval("("+_jsonSchemaString+")");
		if(typeof app._jsonSchema!="object")
		{
			alert("The application schema definition could not be loaded. Please contact your Administrsator");
			sys.logoff();
			return false;
		}
	}
	catch (e)
	{
		alert("The application schema definition could not be loaded. Please contact your Administrsator");
		sys.logoff();
		return false;
	}
}


function _load_system_schema(strSysSchemaXml)
{
	app._xmlSystemSchema = create_xml_dom(strSysSchemaXml);
	if(typeof app._xmlSystemSchema!="object")
	{
		alert("The system database schema definition could not be loaded. Please contact your Administrsator");
		sys.logoff();
		return false;
	}
	_swcore.bSchemasLoaded = true;
}

//--
//-- load global parameters
function _load_application_globalparams(globalParamsXmlString)
{
	app._xmlGlobalParameters = create_xml_dom(globalParamsXmlString);
	if(app._xmlGlobalParameters && app._xmlGlobalParameters.childNodes && app._xmlGlobalParameters.childNodes.length>0)
	{
		//-- ok
		_swcore.bGlobalParamsLoaded = true;
	}
	else
	{
		alert("The application global parameters could not be loaded. Please contact your Administrator");
		sys.logoff();
		return false;
	}
}

//-- load application tree browser forms
function _load_application_treebrowserforms(strTreeBrosersXmlString)
{
	app._xmlSearchForms = create_xml_dom(strTreeBrosersXmlString);
	if(typeof app._xmlSearchForms!="object")
	{
		alert("The application tree browser form definitions could not be loaded. Please contact your Administrator");
		app._xmlSearchForms = null;
		//-- major error so log out
		sys.logoff();
		return false;
	}
	_swcore.bTreeBrowsersLoaded = true;

}


function _initialise_schema_and_global_parameters(OnProcessedCallback)
{
	//-- check for when everything has loaded and then do callback processing
	/*
	var checkCoreResourcesLoaded = function()
	{
		if(_swcore.bToolbarsLoaded && _swcore.bPicklistsLoaded && _swcore.bTreeBrowsersLoaded && _swcore.bGlobalParamsLoaded && _swcore.bSchemasLoaded)
		{
		}
		else
		{
			setTimeout(checkCoreResourcesLoaded,200);
		}
	}
	setTimeout(checkCoreResourcesLoaded,200);
	*/
	
	
	//-- get all the resources needed for startup
	var strCustomURL = "service/session/fetchstartupresources/index.php";
	app.get_http(strCustomURL, "", false,false,function(strHttpResult,targetEle,ohttp)
	{
		var resources =  JSON.parse(strHttpResult);
		
		_toolbars_loaded(resources.systemtoolbars);
		_load_application_picklists(resources.picklistforms);
		_load_application_treebrowserforms(resources.treebrowserforms);
		_load_application_globalparams(resources.globalparameters);
		_load_application_dbentityviews(resources.dbentityviews);
		_load_application_schema(resources.swdataschema);
		_load_system_schema(resources.systemschema);

		//-- store so accessible in dot notation i.e. active pages.
		var intStartNode = (app.isIE && !app.isIE11Above)?1:0;
		_store_global_params_as_array(app._xmlGlobalParameters.childNodes[intStartNode]);
		
		//-- set dd object for application schema
		app.dd = new swdd();
		app.dd.tables['updatedb'].PrimaryKey = 'udid'; //-- as not specifically set in db
		app.dd.tables['updatedb'].primarykey = 'udid'

		//-- store labels
		for(var x=0;x<app.dd.tables.length;x++)
		{
			for(var y=0; y < app.dd.tables[x].columns.length;y++)
			{
				_application_labels[app.dd.tables[x].columns[y].binding] = app.dd.tables[x].columns[y].DisplayName;
			}
		}

		//-- inti session vars for logged in analyst (rights etc)
		_initialise_analyst_session_variables(); //--session.js - this takes a while??

		OnProcessedCallback();
	
	});

	return true;
}




//-- wrapper for dd.
function swdd()
{
	if(app._jsonSchema)
	{
		this.Name = session.dataDictionary;
		this.LastModifiedBy = "N/A";
		this.LastModifiedDate = "N/A";
		this.Version = "N/A";
		this.Application = this.Name;

		this.tables = new Array();
		this._init_appxmlschema(app._jsonSchema);
		this._init_xmlschema(app._xmlSystemSchema);
	}
}

//-- open xml and get params i.e. tables etc
swdd.prototype.GetSqlTreeBrowsersFormParameters = function(strSearchFormName)
{
	var xmlForm = null;
	var arrSearchForms = app._xmlSearchForms.getElementsByTagName('sqlTbForm');
	for(var x=0;x < arrSearchForms.length;x++)
	{
		var strName = app.xmlNodeTextByTag(arrSearchForms[x],"name");
		if(strName==strSearchFormName)
		{
			xmlForm = arrSearchForms[x];
			break;
		}
	}
	if(xmlForm==null)
	{
		alert("GetSqlTreeBrowsersFormParameters : The tree browser form [" + strSearchFormName + "] was not found. Please contact your Administrator.");
		return false;
	}
	
	var retArray = new Array();
	retArray[0] = new Object();
	retArray[0].table = app.xmlNodeTextByTag(xmlForm,"table");
	retArray[0].title = app.xmlNodeTextByTag(xmlForm,"title");
	retArray[0].resultColumn = app.xmlNodeTextByTag(xmlForm,"resultColumn");
	retArray[1] = app.xmlNodeTextByTag(xmlForm,"title");
	retArray[2] = app.xmlNodeTextByTag(xmlForm,"resultColumn");
	return retArray;
}


swdd.prototype._init_appxmlschema = function (jsonDbSchema)
{
	var arrTables = jA(jsonDbSchema.espDatabaseSchema.database.tables.table);
	for(var x=0;x<arrTables.length;x++)
	{
		var tPos = this.tables.length;
		var aTable = arrTables[x];
		if(aTable)
		{
			var strName = aTable['@name'].toLowerCase();
			app._arr_tablenames_by_pos[strName] = x;
			this.tables[tPos] = new Object();

			this.tables[tPos].namedcolumns = new Array();
			this.tables[tPos].columns = new Array();
			this.tables[tPos].Name = strName;
			this.tables[tPos].name = strName;
			this.tables[tPos].DisplayName = jVal(aTable['displayName']);
			this.tables[tPos].PrimaryKey = jVal(aTable['@primaryKey']).toLowerCase();
			this.tables[tPos].editform = jVal(aTable['editREcordForm']);
			this.tables[tPos].addform = jVal(aTable['addRecordForm']);
			this.tables[tPos].NewRecordForm = this.tables[tPos].addform;
			this.tables[tPos].RecordPropertiesForm = this.tables[tPos].editform;
			this.tables[tPos].Description = "N/A";
			this.tables[tPos].Dsn = "swdata";
			this.tables[tPos].canRead = session.CheckTableRight(strName,_CAN_BROWSE_TABLEREC,false);
			this.tables[tPos].canAdd = session.CheckTableRight(strName,_CAN_ADDNEW_TABLEREC,false);	
			this.tables[tPos].canUpdate = session.CheckTableRight(strName,_CAN_UPDATE_TABLEREC,false);
			this.tables[tPos].canDelete = session.CheckTableRight(strName,_CAN_DELETE_TABLEREC,false);
			//-- table methods
			this.tables[tPos].IsColumnDefined = function (strColName)
											{
													for (var x=0;x<this.columns.length;x++)
													{
														if(this.columns[x].Name.toLowerCase()==strColName.toLowerCase())
														{
															return true;
														}
													}
													return false;
											}

			//--
			//-- loop columns - 
			var arrColumns = jA(aTable.columns.column);
			var strTextInputType = "";
			this.tables[tPos].ColumnCount = arrColumns.length;
			for(var y=0;y<arrColumns.length;y++)
			{
				//-- set column attributes
				var aCol = arrColumns[y];
				var strColName = aCol['@name'].toLowerCase()
				var strBinding = strName + "." + strColName;
				this.tables[tPos].columns[y] = new Object();
				this.tables[tPos].columns[y].binding = strBinding;
				this.tables[tPos].columns[y].table = strName;
				this.tables[tPos].columns[y].name = strColName;
				this.tables[tPos].columns[y].Name = strColName;
				this.tables[tPos].columns[y].DisplayName = jVal(aCol['displayName']);

				//-- 06.10.2011 - 
				//-- get control type - to help with formatting as textInputFormat does not get exported properly.
				var aControl = aCol.control;
				if(aControl)
				{
					this.tables[tPos].columns[y].controlType = jVal(aControl['@type']).toLowerCase();
					this.tables[tPos].columns[y].inputMask = jVal(aControl['inputMask']);
					this.tables[tPos].columns[y].textInputFormat =  jVal(aControl['textInputFormat']);

					this.tables[tPos].columns[y].pickOptions = jVal(aControl['pickOptions']);
					this.tables[tPos].columns[y].defaultValue = jVal(aControl['defaultValue']);
				}
				else
				{							
					this.tables[tPos].columns[y].pickOptions = jVal(aCol.pickOptions);
					this.tables[tPos].columns[y].defaultValue = jVal(aCol.defaultValue);
				}

				this.tables[tPos].columns[y].type = jVal(aCol['@sqlType']).toLowerCase();
				this.tables[tPos].columns[y].DataType = this.tables[tPos].columns[y].type;
				this.tables[tPos].columns[y].SqlDataType = jVal(aCol['@sqlType']);

				this.tables[tPos].columns[y].unsigned = "no";
				this.tables[tPos].columns[y].size = jVal(aCol['@size']);
				this.tables[tPos].columns[y].MaxDataSize = jVal(aCol['@size']);
				this.tables[tPos].columns[y].primarykey = jVal(aCol['@primaryKey']);
			
				this.tables[tPos].columns[y].autoinc = jVal(aCol['@autoIncrement']);
				if(this.tables[tPos].columns[y].autoinc == null)this.tables[tPos].columns[y].autoinc ="no";

				this.tables[tPos].columns[y]._bIsNumeric = _is_numeric_type(this.tables[tPos].columns[y].type);
				this.tables[tPos].columns[y]._startupvalue = (this.tables[tPos].columns[y]._bIsNumeric)?0:"";
				this.tables[tPos].columns[y].IsNumeric = function()
																{
																	return this._bIsNumeric;
																}

				this.tables[tPos].columns[y].SqlTypeName = function()
																{
																	return this.SqlDataType;
																}

				this.tables[tPos].columns[y].FormatValue = function(strValue)
																{
																	if(this.controlType)
																	{
																		if(this.controlType=="date/time control")
																		{
																			//-- should be epoch value
																			if(this._bIsNumeric && !isNaN(strValue))
																			{
																				if(strValue==0) return "";

																				//-- format date value using input mask
																				if(this.inputMask!="")
																				{
																					return get_displayvalueforfield_fromepochvalue(strValue,this.inputMask,true);
																				}
																				else
																				{
																					//-- format using textInputFormat (currently does not work as textInputFormat does nto export properly for date controls)
																					//-- format using analysts date/time
																					if(this.textInputFormat=="text")
																					{
																						this.textInputFormat ="datetime";
																					}
																					else if(this.textInputFormat.indexOf("/")>-1)
																					{
																						this.textInputFormat = this.textInputFormat.replace("/","");
																					}
																					return get_displayvalueforfield_fromepochvalue(strValue,this.textInputFormat,true);
																				}
																			}
																		}
																		else if(this.controlType=="text edit")
																		{
																			if(this.textInputFormat=="text") return strValue;
																		}
																		else if(this.controlType.indexOf("pick list")==0)
																		{
																			//-- get value from pick list values
																			if(this.pickOptions.indexOf("^")>0)
																			{
																				//-- treat as numeric picklist
																				var arrItem = new Array();
																				var arrOptions = this.pickOptions.split("|");
																				for(var xy=0;xy<arrOptions.length;xy++)
																				{
																					if(arrOptions[xy]==strValue) return strValue;
																					arrItem = arrOptions[xy].split("^");
																					if(arrItem[1]==strValue) return arrItem[0];
																				}
																			}
																			else
																			{
																				//-- text picklist so just return value
																				return strValue;
																			}
																		}
																	}
																		
																	//-- process other fields
																	//-- if we have an input mask utilise it
																	if(this.inputMask!="")
																	{
																		if(this._bIsNumeric)
																		{
																			var origValue = strValue +"";
																			if(this.inputMask.indexOf("#")>-1)
																			{
																				//-- something like F######
																				var intValueLen = origValue.length;
																				var intMaskLen = this.inputMask.length;
																				var iCut = intMaskLen - intValueLen;
																				var newMask = this.inputMask.substring(0,iCut);
																				newMask = app.string_replace(newMask,"#","0",true);
																				return newMask + origValue;
																			}
																			else
																			{
																				return this.inputMask + origValue;
																			}
																		}
																	}
																	else
																	{
																		var strURL = app.get_service_url("ddf/formatvalue","");
																		var strBinding = this.table +"." + this.name;
																		var strParams = "formatbinding=" + strBinding + "&formatvalue=" + strValue;
																		return app.get_http(strURL, strParams, true, false, null);
																	}
																}


				//-- store columns in array by name as well - exclude special any names like length
				if(strColName=="length")
				{
					//--
				}
				else
				{
					this.tables[tPos].columns[strColName] = this.tables[tPos].columns[y];
					this.tables[tPos].namedcolumns[strColName] = this.tables[tPos].columns[y];
				}
			}

			//-- store table in array by position as well
			this.tables[strName] = this.tables[tPos];
		}
	}
}


swdd.prototype._init_xmlschema = function (xmlSchema)
{
	var tPos = this.tables.length;
	var arrTables = xmlSchema.getElementsByTagName("Table");
	for(var x=0;x<arrTables.length;x++)
	{
		var strName = arrTables[x].getAttribute("name").toLowerCase();
		this.tables[tPos] = new Object();
		this.tables[tPos].Name = strName;
		this.tables[tPos].name = strName;
		this.tables[tPos].DisplayName = "";
		this.tables[tPos].PrimaryKey = "";
		this.tables[tPos].editform = "";//_esptable_form(strName,true,false);
		this.tables[tPos].addform = "";//_esptable_form(strName,false,false);
			
		this.tables[tPos].namedcolumns = new Array();
		this.tables[tPos].columns = new Array();
		var arrColumns = arrTables[x].getElementsByTagName("Column");
		this.tables[tPos].ColumnCount = arrColumns.length;

		for(var y=0;y<arrColumns.length;y++)
		{
			//-- set column attributes
			var aCol = arrColumns[y];
			var strBinding = this.tables[tPos].Name + "." + aCol.getAttribute("name").toLowerCase();
			this.tables[tPos].columns[y] = new Object();
			this.tables[tPos].columns[y].binding = strBinding;
			this.tables[tPos].columns[y].table = this.tables[tPos].Name;
			this.tables[tPos].columns[y].name = aCol.getAttribute("name").toLowerCase();
			this.tables[tPos].columns[y].Name = aCol.getAttribute("name").toLowerCase();
			this.tables[tPos].columns[y].DisplayName = _application_labels[strBinding];

			//-- ddf defaults
			this.tables[tPos].columns[y].pickOptions = "";
			this.tables[tPos].columns[y].defaultValue = "";

			
			this.tables[tPos].columns[y].type = aCol.getAttribute("sqltype").toLowerCase();
			this.tables[tPos].columns[y].unsigned = aCol.getAttribute("unsigned");
			this.tables[tPos].columns[y].size = aCol.getAttribute("size");
			this.tables[tPos].columns[y].primarykey = aCol.getAttribute("primarykey");
			this.tables[tPos].columns[y].autoinc = aCol.getAttribute("auto_increment");
			if(this.tables[tPos].columns[y].autoinc ==null)this.tables[tPos].columns[y].autoinc ="no";


			this.tables[tPos].columns[y]._bIsNumeric = _is_numeric_type(this.tables[tPos].columns[y].type);
				this.tables[tPos].columns[y]._startupvalue = (this.tables[tPos].columns[y]._bIsNumeric)?0:"";
			this.tables[tPos].columns[y].IsNumeric = function()
																{
																	return this._bIsNumeric;
																}


			this.tables[tPos].columns[y].FormatValue = function(strValue)
														{
															//return strValue;
															//alert("need more ddf info");
															var strURL = app.get_service_url("ddf/formatvalue","");
															var strBinding = this.table +"." + this.name;
															var strParams = "formatbinding=" + strBinding + "&formatvalue=" + strValue;
															return app.get_http(strURL, strParams, true, false, null);
														}


			//-- if primary key then set table pkname
			if(aCol.getAttribute("primarykey")=="yes")
			{
				this.tables[tPos].PrimaryKey = aCol.getAttribute("name").toLowerCase();
			}

			//-- store columns in array by name as well
			this.tables[tPos].columns[aCol.getAttribute("name").toLowerCase()] = this.tables[tPos].columns[y];
			this.tables[tPos].namedcolumns[aCol.getAttribute("name").toLowerCase()] = this.tables[tPos].columns[y];
		}//-- eof columns

		//-- table methods
		this.tables[tPos].IsColumnDefined = function (strColName)
										{
												for (var x=0;x<this.columns.length;x++)
												{
													if(this.columns[x].Name.toLowerCase()==strColName.toLowerCase())
													{
														return true;
													}
												}
												return false;
										}




		//-- if pk not set then try indexes
		if(this.tables[tPos].PrimaryKey=="")
		{
			var arrIndexes = arrTables[x].getElementsByTagName("Index");
			for(var y=0;y<arrIndexes.length;y++)
			{
				//-- set column attributes
				var aIDX = arrIndexes[y];
				if(aIDX.getAttribute("unique")=="yes")
				{
					this.tables[tPos].PrimaryKey=aIDX.getAttribute("cols");
					//alert(this.tables[x].PrimaryKey + " :" + this.tables[x].Name)
					break;
				}
			}
		}

		//-- store table in array by position as well
		this.tables[strName] = this.tables[tPos];
	}

}

swdd.prototype.GetGlobalParamAsString = function (strPath)
{
	return __get_global_param(strPath,false);
}

swdd.prototype.GetGlobalParam = function (strPath)
{
	return __get_global_param(strPath,false);
}


swdd.prototype.GetGlobalParamAsNumber = function (strPath)
{
	return __get_global_param(strPath,true);
}

function _esptable_form(strTable, boolEdit,bMsg)
{
	if(bMsg==undefined)bMsg=true;
	var oTable = app.dd.tables[strTable];
	if(oTable==undefined)
	{
		if(bMsg)alert("_esptable_form : Table ["+strTable+"] information not defined.\n\nPlease contact your Administrator");
		return "";
	}

	if(boolEdit)
	{
		return oTable.addform;
	}
	else
	{
		return oTable.editform;
	}
}


var __arr_global_params = new Array();
function _store_global_params_as_array(xmlStartNode, arrTarget)
{
	if(xmlStartNode!=null)
	{
		if(arrTarget==undefined)arrTarget = __arr_global_params;
		
		var arrXML = xmlStartNode.childNodes;
		for(var x=0;x<arrXML.length;x++)
		{
			var currNode = arrXML[x];
		
			if(currNode.tagName!="name" && currNode.tagName!="folder" && currNode.tagName!="params") continue;

			//alert(currNode.tagName)
			if (currNode.tagName=="folder")
			{
				var strFolderName = app.xmlText(currNode.getElementsByTagName("name")[0]).toLowerCase();
				strFolderName = app.string_replace(strFolderName," ","_",true);
				arrTarget[strFolderName] = new Array();
				//alert(arrTarget[strFolderName] + ":" + strFolderName)
				//- -store its children folders
				_store_global_params_as_array(currNode, arrTarget[strFolderName]);
		
			
				//-- store params for this folder
				var xmlParams = currNode.getElementsByTagName("param");
				for(var y = 0; y < xmlParams.length;y++)
				{
					var currParam = xmlParams[y];
					var strParamName = app.xmlText(currParam.getElementsByTagName("name")[0]).toLowerCase();
					strParamName = app.string_replace(strParamName," ","_",true);
					var strParamValue = app.xmlText(currParam.getElementsByTagName("value")[0]);
					arrTarget[strFolderName][strParamName] = strParamValue;
				}
			}
		}
	}
}



function __get_global_param(strPath,boolNumeric)
{
	if(app._xmlGlobalParameters!=null)
	{
		var arrParams = __arr_global_params;
		var rValue = "";
		//-- remove any spaces - 
		strPath = app.string_replace(strPath," ","_",true);
		strPath = strPath.toLowerCase();
		var arrPath = strPath.split("/");
		var lastPath = arrPath[arrPath.length-1];
		for(var x=0;x<arrPath.length;x++)
		{
			var strCurrPathPart = arrPath[x];
			if(arrParams[strCurrPathPart]!=undefined)
			{
				rValue = arrParams[strCurrPathPart];
				arrParams = arrParams[strCurrPathPart]
				//-- exists
			}
			else
			{
				//-- does not exist
				//alert("Global parameter not defined. Please contact your Administrator.\n\n" + strPath + ":" + strCurrPathPart)
				return (boolNumeric)?0:"";
				break;
			}
		}

		if(boolNumeric)
		{
			rValue--;
			rValue++;
			if(isNaN(rValue)) return 0;
		}
		return rValue;
	}
	return (boolNumeric)?0:"";
}


//-- return t or f is type is numeric
function _is_numeric_type(strType)
{
	switch(strType)
	{
		case "integer":
		case "double":
		case "tinyint":
		case "bigint":
		case "smallint":
		case "decimal":
		case "float":
			return true;
		default:
			break;
			
	}
	return false;
};;;;//-- 22.10.2009
//-- mimic full client app. functions
//-- as we have app. already just define functions

//-- set and get vars for webclient
var __protected= new Array();
function setWcVar(strName,varValue)
{
	app.__protected[strName] = varValue;
}
function getWcVar(strName)
{
	return app.__protected[strName];
}


var _CURRENT_JS_WINDOW = null;
var _UseHtmlEmailFormat = "1"; //-- by default use html format
function _newEmail(_arrSpecial)
{
	if(global.CanSendMail())
	{
		if(_arrSpecial==undefined)_arrSpecial=new Array();
		var strParams  = "_emailaction=NEW:&addnew=1";
		app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, null,null,window,undefined,undefined,_arrSpecial);
	}
	else
	{
		alert(_EM_RIGHTS_MSG[4]);
	}
}

//-- for itsm 3.0.1
function hide_popups()
{
}

function in_array(arr,val){
	for(var i=0,l=arr.length;i<l;i++){
		if(arr[i]===val)
			return true;
	}
	return false;
}


function open_vcm()
{
	alert("open_vcm : This method is not supported in the webclient.");
	return false;
}

function OpenWebClientForm(strFormName,varRecordKey,strParams,boolModal,strFormType,openfromWin,fCallback,_specialParams)
{
	_open_system_form(strFormName, strFormType, varRecordKey, strParams, boolModal, fCallback,undefined,openfromWin,undefined,undefined,_specialParams);
}

//-- open a form for edit
function OpenFormForEdit(strFormName,varRecordKey,strParams,boolModal,fCallback,openfromWin)
{
	//-- open default sla edit form
	 _open_application_form(strFormName, "stf", varRecordKey, strParams, boolModal, "edit" ,fCallback,undefined,openfromWin);		
}

//-- open a form for add
function OpenFormForAdd(strFormName,varInitialRecordKey,strParams,boolModal,fCallback,openfromWin)
{
	 _open_application_form(strFormName, "stf", varInitialRecordKey, strParams, boolModal, "add", fCallback,undefined,openfromWin);
}

//-- open a form
function OpenForm(strFormName,strParams,boolModal,fCallback,openfromWin)
{
	  _open_application_form(strFormName, "stf", "", strParams, boolModal, "add", fCallback,undefined,openfromWin);
}

function OpenUpdateCallForm(strCallrefs,strUpdateText,callback)
{
	var arrSpecial = [];
	if(strUpdateText)arrSpecial["updatetext"]=strUpdateText;
	_updatecallform(strCallrefs,null,arrSpecial,function(form)
	{
		if(callback)callback((form)?true:false);
	});

}

function OpenAcceptCallForm(strCallrefs,strUpdateText,callback)
{
	var arrSpecial = [];
	if(strUpdateText)arrSpecial["updatetext"]=strUpdateText;
	_acceptcallform(strCallrefs,null,arrSpecial,function(form)
	{
		if(callback)callback((form)?true:false);
	});
} 

function OpenCallHoldForm(strCallrefs,strUpdateText,callback)
{
	var arrSpecial = [];
	if(strUpdateText)arrSpecial["updatetext"]=strUpdateText;
	_holdcallform(strCallrefs,null,arrSpecial,function(form)
	{
		if(callback)callback((form)?true:false);
	});
} 

function OpenCallResolveCloseForm(strCallrefs, strResolveText,callback, strCloseUpdateText, strFixCode, strIssueRef)
{
	var arrSpecial = new Array();
	arrSpecial['issueref'] = strIssueRef;
	arrSpecial['updatetxt'] = strResolveText;

	_resolveclosecallform(strCallrefs,undefined,arrSpecial,callback);
}

//-- open log cal form
function _open_logcall_form(strCallClass, strParams, openedFromWin, _specialParams,callback)
{
	//-- check right
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANLOGCALLS,true))return;

	//-- check if we have more than one form per callclass - if so make use choose which one to use
	if(strCallClass==undefined || strCallClass=="")
	{
		//-- popup callclass selector
		_open_system_form("_wc_lognewcallclass", "lcfpicker", "", strParams, true, callback,undefined,openedFromWin,_specialParams);
		return;
	}

	var strCallClassForm = strCallClass;
	_open_application_form(strCallClassForm, "lcf", "", strParams, false, "add", callback,undefined,openedFromWin,_specialParams);	
}

function _select_callcondition(openedFromWin,callback)
{
	var strParams = ""; 
	_open_system_form("_wc_callcondition", "conditionpicker", "", strParams, true, function(oForm)
	{
		if(callback)callback(oForm._swdoc._selected_condition);
		
	},undefined,openedFromWin);
	

}

function _select_callclass(openedFromWin,callback)
{
	var strParams = "_selectcallclass=yes"; 
	var oform = _open_system_form("_wc_lognewcallclass", "lcfpicker", "", strParams, true, function(oForm)
	{
		if(oForm && callback) callback(oForm._swdoc._selected_callclass);
	},undefined,openedFromWin);
	
	
}

//--
//-- open call detail form for given callref
function _open_call_detail(nCallref,callback)
{
	//-- get call class
	_open_call_form("cdf",nCallref,false,window,callback);
}

//--
//-- open call form , check permissions
function _open_call_form(strType,intCallref,boolModal,openfromWin,callback)
{

	if(isNaN(intCallref))
	{
		//-- may have been passed an F
		intCallref = intCallref.replace(/[^\d]/g,"");
		intCallref++;intCallref--;
	}

	//-- get call record from sysdb first
	var boolGoodCall = true;
	var oRec = new SqlRecord();
	if(oRec.GetCacheRecord("opencall",intCallref)==0)
	{
		if(oRec.GetRecord("opencall",intCallref)==0)
		{
			boolGoodCall = false;
		}
	}
	
	if(!boolGoodCall)
	{
		alert("The record " + dd.tables["opencall"].columns["callref"].FormatValue(intCallref) + " was not found on the system. Please contact your Administrator");
		return false;
	}

	//-- check that user has right to opencall 
	var boolCanViewOtherRepCalls = session.HaveRight(ANALYST_RIGHT_A_GROUP, ANALYST_RIGHT_A_CANSWITCHREP);
	if((boolCanViewOtherRepCalls==false) && (oRec.owner!=session.analystid) && (oRec.owner!=""))
	{
		alert("You do not have permission to view records that are assigned to other analysts.");
		oRec=null;
		return false;
	}	

	//-- if can view groups then
	var boolCanViewOtherGroupCalls = session.HaveRight(ANALYST_RIGHT_A_GROUP, ANALYST_RIGHT_A_CANSWITCHGROUP);
	if((boolCanViewOtherGroupCalls==false) && (session.IsMemberOfSupportGroup(oRec.suppgroup)==false))
	{
		alert("You do not have permission to view records that are assigned to support groups that you are not a member of.");
		oRec=null;
		return false;
	}

	var strCallClass = oRec.callclass;
	var intCallref = oRec.callref;
	var intStatus = oRec.status;
	
	//-- incomming so log new call
	if(intStatus==8)
	{
		var strParams = "";
		for(strID in oRec)
		{
			if(strParams != "")strParams += "&";
			strParams += "incoming." + strID + "="+ app.pfu(oRec[strID]);
		}
		oRec=null;
		global.LogNewCall("",callback,window,null,strParams);
		return;
	}
	else
	{
		var strUseFormName = "";
		oRec=null;
		

		

		//-- check what form to load for callclass
		for(strFormName in app._arr_cdf_forms)
		{
			if(app._arr_cdf_forms[strFormName]==strCallClass)
			{	
				if(strUseFormName!="")strUseFormName+=",";
				strUseFormName += strFormName;
			}
		}

		//-- more than one form to use - so let user select a cdf form
		if(strUseFormName.indexOf(",")!=-1)
		{
			var strParams = "_incallclass="+strCallClass;
			_open_system_form("_wc_selectcdf", "cdf", "", strParams, true, function(oForm)
			{
				if(oForm._swdoc._selected_cdf=="") return;
				
				strUseFormName = oForm._swdoc._selected_cdf
				_open_application_form(strUseFormName, "cdf", intCallref, "", boolModal, "edit", callback,undefined,openfromWin);								
				
			}, null, openfromWin);
		}
		else
		{
			_open_application_form(strUseFormName, "cdf", intCallref, "", boolModal, "edit", callback,undefined,openfromWin);	
		}
	}//-- eof incoming
}

function _explodeparams(strParams)
{
	var targetArray=new Array();
	if(strParams==undefined)strParams="";
	strParams = strParams + "";
	var arrParams = strParams.split("&");
	for(var x=0;x<arrParams.length;x++)
	{
		//-- store param and decode value as may have url encoded (esp if it has &amp)
		var iPos = arrParams[x].indexOf("=");
		var paramName = app.trim(arrParams[x].substring(0,iPos));
		var paramValue = arrParams[x].substring(iPos+1);

		try
		{
			targetArray[paramName.toLowerCase()] = decodeURIComponent(paramValue); 
		}
		catch(e)
		{
			targetArray[paramName.toLowerCase()] = paramValue; 
		}
	}
	return targetArray;
}

//-- popup operatorscript
function _operatorscript(intScriptID, fromWin,callback)
{
	var strParams = "scriptid="+intScriptID;
	_open_system_form("operatorscript.php", "opscript", "", strParams, true, callback, null, fromWin,600,300);
}

//-- popup analyst tree
function _analystpicker(strTitle, bShowThirdParty, callback, fromWin)
{
	if(strTitle==undefined)strTitle = "Assign";
	if(bShowThirdParty==undefined)bShowThirdParty = true;
	var strParams = "showthirdparty="+bShowThirdParty+"&formtitle="+app.pfu(strTitle);
	return _open_system_form("analystpicker.php", "assigntree", "", strParams, true, callback, null, fromWin);
}
function _analystselected(strGroupID, strAnalystID, strGroupName, strAnalystName, srcEle)
{
	alert(strGroupID + ":"+ strAnalystID)
}

//-- popup profile code selector
function _profilecodeselector(strType,strFilter, strInitialCode, fCallback, srcEle, fromWin)
{
	if(strType=="lcf")
	{
		 _lfc_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin);
	}
	else if(strType=="cdf")
	{
		 _cdf_profilechanger(strFilter,strInitialCode,fCallback,srcEle,fromWin);
	}
	else if(strType=="fix")
	{
		 _res_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin);
	}
}

function _lfc_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin)
{
	var strParams = "filter=" + app.pfu(strFilter) + "&initcode=" + strInitialCode;
	_open_system_form("problemprofilepicker.php", "profilecode", strInitialCode, strParams, true, fCallback, srcEle, fromWin,600,500);
}

function _cdf_profilechanger(strFilter,strInitialCode,fCallback,srcEle,fromWin)
{
	var strParams = "filter=" + app.pfu(strFilter) + "&initcode=" + strInitialCode;
	_open_system_form("problemprofilechanger.php", "profilecode", strInitialCode, strParams, true,  fCallback, srcEle, fromWin,400,500);
}

function _res_profilepicker(strFilter,strInitialCode,fCallback,srcEle,fromWin)
{
	var strParams = "filter=" + app.pfu(strFilter) + "&initcode=" + strInitialCode;
	_open_system_form("resolutionprofilepicker.php", "profilecode", strInitialCode, strParams, true, fCallback, srcEle, fromWin,600,500);
}


function select_profile_code_for_element (srcEle, bRightHandAreaClick,bShowDesc, oE, fromWin)
{
	if(fromWin==undefined)fromWin=window;

	//-- check if clicked righthand selector box
	if( (bRightHandAreaClick) && (!app._clicked_ele_trigger(srcEle,oE)) )
	{
		//-- do nto show
		return true;
	}

	if(app.boolMouseRightClick(oE))
	{
		app.setEleValue(srcEle,"",null,"");
		app.stopEvent(oE);
		app.fireEvent(srcEle,"blur");
		return false;

	}
	else
	{
		var strInitialCode = (srcEle.getAttribute("dbvalue")!=null)?srcEle.getAttribute("dbvalue"):"";
		app._profilecodeselector("cdf","", strInitialCode, function(returnFormObject)
		{
			if(returnFormObject.selected)
			{
				//-- set value
				var desc = (bShowDesc==true)?returnFormObject.codeDescription:returnFormObject.code;
				app.setEleValue(srcEle,returnFormObject.code,null,desc);
				app.stopEvent(oE);
				app.fireEvent(srcEle,"blur");
				return false;
			}	
		}, null, window);
	}	
}



//--
//-- OPEN CALL ACTION FORMS
//--


function _open_hdtask_detail(intKeyValue, intCallref, intStatus)
{
	var strParams = "callref=" + intCallref;

	//-- determine form to open
	var strForm =(intStatus==16)?"_sys_calltask_completed":"_sys_calltask";

	app.OpenWebClientForm(strForm,intKeyValue,strParams,true,"workflow",window,undefined);
}

function _completetaskform(strTaskID, strCallref,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANUPDATECALLS,true))return false;

	//-- make sure task can be completed by this analysts.
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("callref",strCallref); 
	xmlmc.SetParam("workItemId",strTaskID); 
	if(xmlmc.Invoke("helpdesk", "getCallWorkItem"))
	{
		//-- address for this mailbox
		var intActionBy = new Number(xmlNodeTextByTag(xmlmc.xmlDOM,"actionBy"));
		if(intActionBy<2)
		{
			if(intActionBy==0)
			{
				var strAID = xmlNodeTextByTag(xmlmc.xmlDOM,"assignToAnalyst");
				if(strAID!=session.currentAnalystId && strAID!=session.analystid)
				{
					alert("The selected work item can only be completed by " + strAID);
					return false;
				}
			}
			else
			{
				//-- to be completed by group
				var strGroup = xmlNodeTextByTag(xmlmc.xmlDOM,"assignToGroup");
				if(strGroup!=session.currentGroupId && strGroup!=session.groupId)
				{
					alert("The selected work item can only be completed by someone in the " + strAID + " group");
					return false;
				}
			}
		}

		var strFormName = app.dd.GetGlobalParam("Call Action Forms/CompleteWorkItemForm");
		if(strFormName=="")strFormName = "EfCompleteWorkItemForm"; 
		_process_call_actionform(strFormName,strCallref,openfromWin,strTaskID,arrSpecial,callback);
	}

}

function _updatecallform(strCallrefs,openfromWin,arrSpecial,callback)
{

	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANUPDATECALLS,true))return false;

	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/UpdateCallForm");
	if(strFormName=="")strFormName = "efUpdateCallForm"; 
	_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);
}

function _holdcallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANPLACECALLONHOLD,true))return false;


	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/HoldCallForm");
	if(strFormName=="")strFormName = "EfUpdateCallForm"; 
	_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);

}

function _acceptcallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS,true))
	{
		return false;
	}

	//-- use form or basic popup?
	if(session.IsDefaultOption(ANALYST_DEFAULT_FORCEUPDATEWHENACCEPTCALL)==false)
	{
		//-- basic popup
		var strParams = "_callrefs=" + strCallrefs;
		app._open_system_form("_wc_acceptcall", "acceptcall", "", strParams, true,callback,null);
	}
	else
	{
		//-- check global params for form name
		var strFormName = app.dd.GetGlobalParam("Call Action Forms/AcceptCallForm");
		if(strFormName=="")strFormName = "EfAcceptCallForm"; 

		//-- set call accepted by default text
		if(arrSpecial==undefined)arrSpecial = new Array();
		arrSpecial["updatetext"] = "Call accepted by ";
		arrSpecial["updatetext"] +=(session.currentAnalystId!="")?session.currentAnalystId:session.analystid;

		_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);
	}
}

function _resolveclosecallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	//-- get call status's so we can check permissions
	var bHaveResolvedCalls = false;
	var bOtherCallStatus = false;
	var SqlRecordSetObj = new SqlQuery();

	var strParams = "dsn=sw_systemdb&callrefs=" + strCallrefs; 
	SqlRecordSetObj.WebclientStoredQuery("system/getCallListStatus",strParams);
	while(SqlRecordSetObj.Fetch())
	{
		if(SqlRecordSetObj.GetValueAsNumber(0)==6)
		{
			bHaveResolvedCalls=true;
		}
		else
		{
			bOtherCallStatus=true;
			if(bHaveResolvedCalls)break;
		}
	}

	//-- check permissions
	if(bOtherCallStatus && !session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANRESOLVECALLS,true))return false;
	if(bHaveResolvedCalls && !session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCLOSECALLS,true))return false;
	
	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/ResolveCloseCallForm");
	if(strFormName=="")strFormName = "EfResolveCloseCallForm"; 
	_process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);

}

function _logresolveclosecallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/LogResolveCloseCallForm");
	if(strFormName=="")strFormName = "EfLogResolveCloseCallForm"; 
	 _process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial);
}


function _cancelcallform(strCallrefs,openfromWin,arrSpecial,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCANCELCALLS,true))return false;

	//-- check global params for form name
	var strFormName = app.dd.GetGlobalParam("Call Action Forms/CancelCallForm");
	if(strFormName=="")strFormName = "EfCancelCallForm"; 
	 _process_call_actionform(strFormName,strCallrefs,openfromWin,"",arrSpecial,callback);

}


function _issueform(strIssueRef,strCallrefs,bModal, openfromWin,arrSpecial,callback)
{
	if(bModal==undefined)bModal=false;
	if(strCallrefs==undefined)strCallrefs="";
	//-- check global params for form name

	if(arrSpecial==undefined)arrSpecial= new Array();
	arrSpecial['callrefs'] = strCallrefs;

	var strFormName = app.dd.GetGlobalParam("Call Action Forms/IssueForm");
	if(strFormName=="")strFormName = "EfNewIssueForm"; 

	var strMode = (strIssueRef=="")?"add":"edit";

	return _open_application_form(strFormName, "stf", strIssueRef, "", bModal, strMode, callback,undefined,openfromWin,arrSpecial);	


	//return _process_call_actionform(strFormName,strIssueRef,openfromWin,"",arrSpecial);

}

function _process_call_actionform(strFormName,strCallref,openfromWin,strTaskIDs,arrSpecial,callback)
{
	var strParams = "";
	if(arrSpecial==undefined)arrSpecial = new Array();
	arrSpecial['callrefs'] = strCallref +"";;
	if(strTaskIDs!=undefined)arrSpecial['taskid'] = strTaskIDs +"";
	arrSpecial['callactionform'] = true;

	_open_application_form(strFormName, "stf", strCallref+"", strParams, true, "add", callback,undefined,openfromWin,arrSpecial);	
}


//-- take a call off hold
function _offholdcall(strCallrefs)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANTAKECALLOFFHOLD,true))return false;

	return _swchd_offhold_call(strCallrefs);
}

//-- reactivate
function _callreactivate(strCallrefs)
{
	
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANREACTIVATECALLS,true))return false;
	app._swchd_reactivate_call(strCallrefs);
}


function _assigncall(strCallrefs,strAnalystID,strGroupID,thirdPartyContract, openfromWin,callback)
{
	if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANASSIGNCALLS,true))return false;

	return app._swchd_assign_call(strCallrefs, strGroupID, strAnalystID, thirdPartyContract, openfromWin,callback);
}

//-- given callrefs get profile code filter from the callclass form
//-- uses info from the biggest callref
function _get_callclass_form_profilefilter(_CurrentSelectedServiceDeskCallrefs)
{
	if(global._array_cdf_profile_filters==undefined)global._array_cdf_profile_filters = new Array();

	//-- get largest callref
	var intCallref = 0;
	var arrCallrefs = _CurrentSelectedServiceDeskCallrefs.split(",");
	for(var x=0;x<arrCallrefs.length;x++)
	{
		var testnum = arrCallrefs[x] - 0;
		if(testnum>intCallref)intCallref=testnum;
	}

	//-- get call records
	var oRec = new SqlRecord();
	if(oRec.GetCacheRecord("opencall",intCallref)==0)
	{
		if(oRec.GetRecord("opencall",intCallref)==0)
		{
			//-- call not found
			return "";
		}
	}

	//-- get form for the callclass
	var strUseForm = "";
	for(var strFormName in app._arr_cdf_forms)
	{
		if(app._arr_cdf_forms[strFormName]==oRec.callclass)
		{
			strUseForm = strFormName;
			break;
		}
	}

	if(strUseForm=="") return "";

	//-- if cached use it
	if(global._array_cdf_profile_filters[strUseForm]!=undefined) return global._array_cdf_profile_filters[strUseForm];


	var strFilter = "";
	var jsForm = _get_form_json(strUseForm, "cdf");	
	if(jsForm)
	{
		//-- get profile code
		try
		{
			var strFilter = jsForm.espForm.configuration.settings.profileFilter;	
			if(strFilter==undefined)strFilter="";
		}
		catch (e)
		{
			strFilter="";
		}
	}
	//-- cache filter
	global._array_cdf_profile_filters[strUseForm] = strFilter;
	return strFilter;
}

//-- return a form definition - uses php to get form content (secure)
function _get_form_json(strFormName, strFormType)
{
	//-- go fetch json form content
	var strParams = "formtype=" + strFormType + "&formname="+ strFormName;
	var strURL = app.get_service_url("form/getform","");
	var __formjson =  app.get_http(strURL, strParams, true,false, null);
	if(__formjson!="")
	{
		try
		{
			var jsonformdata = eval("(" + __formjson + ");");			
		}
		catch (e)
		{
			alert("The form json structure for " + info.__formname + " is corrupt . Please contact your Administrator.");
			return null;
		}
	}

	//-- check json structure
	if(jsonformdata.espForm==undefined)
	{
		alert("The form meta data for " + info.__formname + " is corrupt . Please contact your Administrator.");
		return null;
	}

	return jsonformdata;
	
}

function pfs(strValue)
{
	return app.PrepareForSql(strValue);
}


//-- function returns array of sql parts
//-- select, tables, where
function _split_sqlquery(strSQL)
{
	//-- find table name and action
	strSQL = app.trim(strSQL.toLowerCase());
	var arrSQL = strSQL.split(" ");

	//-- determine action
	var strAction = arrSQL[0];
	var strTable = "";
	var strCols = "";
	var ifrompos = -1;
	var iwherepos = -1;
	var igrouppos = -1;
	var iorderpos = -1;
	var bPastInTo = false;
	for(var x=1;x<arrSQL.length;x++)
	{
		if(strAction=="update" && strTable=="")
		{
			if(arrSQL[x]!="")
			{
				strTable=arrSQL[x];
				break;
			}
		}
		else if(strAction=="insert" && strTable=="")
		{
			if(bPastInTo && arrSQL[x]!="")
			{
				strTable=arrSQL[x];
				break;
			}
			if(arrSQL[x]=="into")bPastInTo = true;
		}
		else 
		{
			if(arrSQL[x]=="from" && ifrompos==-1) ifrompos = x;
			if(arrSQL[x]=="where" && iwherepos==-1) iwherepos = x;
			if(arrSQL[x]=="order" && iorderpos==-1) iorderpos = x;
			if(arrSQL[x]=="group" && igrouppos==-1) igrouppos = x;
		}
	}

	//-- get select cols
	var arrCol = strSQL.split("from");
	var iSpacePos = arrCol[0].indexOf(" "); 
	var strCols = arrCol[0].substring(iSpacePos);

	if(strAction=="delete" || strAction=="select")
	{
		var ilastPos = arrSQL.length;
		if(iwherepos!=-1)
		{
			ilastPos =iwherepos;
		}
		else if (igrouppos!=-1)
		{
			ilastPos =igrouppos;
		}
		else if (iorderpos!=-1)
		{
			ilastPos =iorderpos;
		}
		
		var strAllTables = ""
		for(var x=ifrompos+1;x<ilastPos;x++)
		{
			strAllTables += arrSQL[x]
		}
		strTable = strAllTables;
	}
	
	var arrSQL = new Array();
	arrSQL["action"] = strAction;
	arrSQL["table"] = strTable;
	arrSQL["columns"] = strCols;
	return arrSQL;

}


function _replaceIllegalFileCharacters(strFileName)
{
//-- This function is used to replace characters in the passed in string that 
	//-- are not suitable for use in filenames and return the modified string 
	if(strFileName==undefined)return "";
	strOutput = strFileName;
	strReplacement = "_";
	var i = 0;
	
	while(i < strOutput.length)
	{
		strOutput = strOutput.replace('/', strReplacement);
		strOutput = strOutput.replace(':', strReplacement);
		strOutput = strOutput.replace('*', strReplacement);
		strOutput = strOutput.replace('?', strReplacement);
		strOutput = strOutput.replace('"', strReplacement);
		strOutput = strOutput.replace('\'', strReplacement);
		strOutput = strOutput.replace('<', strReplacement);
		strOutput = strOutput.replace('>', strReplacement);
		
		i++;
	}
	
	return strOutput;
};;;;//-- 26.10.2009 - mimic full client global functions

var global = new Object();

//-- sla ON form openers - should call app.js functions
function _OnOpenEditSlaForm(strSlaNameOrCompanyID, b3rdParty)
{
	var res = true;
	if(OnOpenEditSlaForm)
	{
		res = OnOpenEditSlaForm(strSlaNameOrCompanyID, b3rdParty);
	}

	if (res)
	{
		//-- open default sla edit form
	}
}

function _OnOpenManageSlasForm()
{
	var res = true;
	if(OnOpenManageSlasForm)
	{
		res = OnOpenManageSlasForm();
	}

	if (res)
	{
		//-- open default sla edit form
	}
}

function _OnOpenNewSlaForm(strSlaNameOrCompanyID, bThirdParty)
{
	var res = true;
	if(OnOpenNewSlaForm)
	{
		res = OnOpenNewSlaForm(strSlaNameOrCompanyID, bThirdParty);
	}

	if (res)
	{
		//-- open default sla new form
	}
}
//-- eof ON sla openers


//-- 28.05.2012 - cr 88448 - switch to a view
global.SwitchSupportworksView = function(strView)
{
	//-- strView is view icontitle or view folder name
	var boolFound = false;
	var arrViews = dd.GetGlobalParam("views");
	for(var strViewName in arrViews)
	{
		if(strViewName==strView)
		{
			boolFound = true;
			break;
		}
		else
		{
			var strIconTitle = arrViews[strViewName].icontitle;
			if(strIconTitle==strView)
			{
				boolFound=true;
				break;
			}
		}
	}

	if(boolFound)
	{
		//-- get element with same view name and trigger click event
		var eTriggerItem = app.get_parent_child_by_id(app.application_navbar.shortcutholder,strViewName);
		if(eTriggerItem && eTriggerItem.className!="sbar-item-hide")
		{
			//-- show and select mini item
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"IMG");
		}
		else
		{
			//-- item is in main outlookbar
			eTriggerItem = app.get_parent_child_by_id(app.application_navbar.baritemholder,strViewName);
			if(eTriggerItem==null) return;
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"TD");
		}
		if(eTriggerItem==null) return;
		app.fireEvent(eTriggerItem,"click");
	}
}

//-- 07.08.2013 - cr 88502 - switch to a view by type - finds view of first type and switches
global.SwitchSupportworksViewByType = function(strViewType)
{
	//-- strView is view icontitle or view folder name
	var boolFound = false;
	var arrViews = dd.GetGlobalParam("views");
	for(var strViewName in arrViews)
	{
		var strType = arrViews[strViewName].type;
		if(strType==strViewType)
		{
			boolFound=true;
			break;
		}

	}

	if(boolFound)
	{
		//-- get element with same view name and trigger click event
		var eTriggerItem = app.get_parent_child_by_id(app.application_navbar.shortcutholder,strViewName);
		if(eTriggerItem && eTriggerItem.className!="sbar-item-hide")
		{
			//-- show and select mini item
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"IMG");
		}
		else
		{
			//-- item is in main outlookbar
			eTriggerItem = app.get_parent_child_by_id(app.application_navbar.baritemholder,strViewName);
			if(eTriggerItem==null) return;
			eTriggerItem = app.get_parent_child_by_tag(eTriggerItem,"TD");
		}
		if(eTriggerItem==null) return;
		app.fireEvent(eTriggerItem,"click");
	}
}

global.isRFC822ValidEmail = function(sEmail) 
{
	var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
	var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
	var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
	var sQuotedPair = '\\x5c[\\x00-\\x7f]';
	var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
	var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
	var sDomain_ref = sAtom;
	var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
	var sWord = '(' + sAtom + '|' + sQuotedString + ')';
	var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
	var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
	var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
	var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
	  
	var reValidEmail = new RegExp(sValidEmail);  
	if (reValidEmail.test(sEmail)) 
	{
		return true;
	}
    return false;
}


global.CreateSla = function (strSlaName, strTimeZone, intRespTime, intFixTime, callback)
{
	if(_xml_defaultslainfo==null)
	{
		var strURL = app.get_service_url("session/getdefaultslasettings","");
		_xml_defaultslainfo = app.get_http(strURL, "", true, true);
	}

	if(_xml_defaultslainfo)
	{
		//-- sunday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Sunday");
		var intSunS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intSunE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- monday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Monday");
		var intMonS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intMonE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- tueday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Tuesday");
		var intTueS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intTueE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- wednesday
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Wednesday");
		var intWedS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intWedE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- thu
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Thursday");
		var intThuS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intThuE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- fri
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Friday");
		var intFriS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intFriE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		//-- sat
		var xmlDay = _xml_defaultslainfo.getElementsByTagName("Saturday");
		var intSatS = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("start"));
		var intSatE = _convert_hhmm_to_epoch(xmlDay[0].getAttribute("end"));

		var xmlmc = new XmlMethodCall();


		xmlmc.SetParam("name",strSlaName);
		xmlmc.SetParam("type",1);
		xmlmc.SetParam("resptime",intRespTime);
		xmlmc.SetParam("fixtime",intFixTime);
		xmlmc.SetParam("mode",0);
		xmlmc.SetParam("dd","");
		xmlmc.SetParam("timeZone",strTimeZone);

		xmlmc.SetParam("sunStart",intSunS)
		xmlmc.SetParam("sunEnd",intSunE)
		xmlmc.SetParam("monStart",intMonS)
		xmlmc.SetParam("monEnd",intMonE)
		xmlmc.SetParam("tueStart",intTueS)
		xmlmc.SetParam("tueEnd",intTueE)
		xmlmc.SetParam("wedStart",intWedS)
		xmlmc.SetParam("wedEnd",intWedE)
		xmlmc.SetParam("thuStart",intThuS)
		xmlmc.SetParam("thuEnd",intThuE)
		xmlmc.SetParam("friStart",intFriS)
		xmlmc.SetParam("friEnd",intFriE)
		xmlmc.SetParam("satStart",intSatS)
		xmlmc.SetParam("satEnd",intSatE)

		if(xmlmc.Invoke("sla", "addSystemSLA"))
		{
			if(callback)(callback(xmlmc.GetParam("slaid")))
			return xmlmc.GetParam("slaid");
		}
		else
		{
			alert("Error : sla.addSystemSLA failed.\n\n" + xmlmc.GetLastError())
		}
	}
	else
	{
		alert("The default working hours could not be loaded. Please contact your administrator.");
	}
	
	if(callback)(callback(0))	
	return 0;
}

global.DeleteSla = function (intSlaID)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("slaName",intSlaID)
	return xmlmc.Invoke("sla", "deleteSLA");
}

//-- this creates an analysts
global.Create3rdPartySupplier=function(strCompanyID, strSupplierName, strTel, strEmail, strNotes) 
{
	//-- create swanalyst of type 3 and under group _THIRDPARTY
	var rs = new SqlQuery();
	var strParams = "analystid=" + strCompanyID + "&name="+strSupplierName + "&tel="+strTel+"&email="+strEmail;
	if(rs.WebclientStoredQuery("system/createThirdPartySupplier",strParams))
	{	
		return true;
	}
	else
	{
		return false;
	}
}

global.Delete3rdPartySupplier=function(strCompanyID)
{
	//-- delete contracts from sla table & supplier from swanalysts table
	var rs = new SqlQuery();
	var strParams = "analystid=" + strCompanyID;
	if(rs.WebclientStoredQuery("system/deleteThirdPartySupplier",strParams))
	{	
		return true;
	}
	else
	{
		return false;
	}
}

global.SetSla3rdPartyInfo=function(nSlaID, strCompanyID, strContact, strEmail, strTel, strNotes, nValidFromEpoch, nExpiresEndEpoch, nContractOptions)
{
	var rs = new SqlQuery();
	var strParams = "company=" + strCompanyID;
	    strParams+= "&name=" + strContact;
	    strParams+= "&tel=" + strTel;
	    strParams+= "&email=" + strEmail;
	    strParams+= "&notes=" + strNotes;
	    strParams+= "&validfrom=" + nValidFromEpoch;
	    strParams+= "&validto=" + nExpiresEndEpoch;
	    strParams+= "&options=" + nContractOptions;
	    strParams+= "&slaid=" + nSlaID;

	return  rs.WebclientStoredQuery("system/setSla3rdPartyInfo",strParams);
}

//-- check for opening off default sla form or bespoke form defined in app.js
global.InvokeSlaEditDialog = function (nSlaID, b3rdParty, strAgreementTitle)
{
	alert("InvokeSlaEditDialog : This method is not supported in the webclient.");
	return false;
}

global.InvokeAddNewSlaDialog = function (nSlaID, b3rdParty, strAgreementTitle)
{
	alert("InvokeAddNewSlaDialog : This method is not supported in the webclient.");
	return false;
}

global.GetCallRefValue=function(strCallref)
{
	var val = parseInt(strCallref.match(/[0-9]+/)[0], 10);
	return val;
}


global.RefreshHelpdeskAnalystsTree = function()
{
	//-- 15.09.2010
	//-- helpdesk view tree xml
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("recursive","true");
	if(xmlmc.Invoke("helpdesk", "getAnalystTeamTree"))
	{
		_xml_helpdesk_view_tree = xmlmc.xmlDOM;
	}
	else
	{
		//-- should never happen
		alert(xmlmc.GetLastError());
		return false
	}

	//-- get 3p tree if enabled
	if(dd.GetGlobalParamAsString("third party slas/enable").toLowerCase()=="true")
	{
		var xmlmc = new XmlMethodCall();
		if(xmlmc.Invoke("helpdesk", "getThirdPartyTeamTree"))
		{
			_xml_helpdesk_view_3p_tree = xmlmc.xmlDOM;
		}
		else
		{
			//-- should never happen
			alert(xmlmc.GetLastError());
			return false;
		}
	}

	//--
	//-- assign tree xml
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("recursive",true);
	if(xmlmc.Invoke("helpdesk", "getAnalystAssignmentTree"))
	{
		_xml_helpdesk_assign_tree = xmlmc.xmlDOM;
	}
	else
	{
		//-- should never happen
		alert(xmlmc.GetLastError());
		return false
	}

	var xmlmc = new XmlMethodCall();
	if(xmlmc.Invoke("helpdesk", "getThirdPartyAssignmentTree"))
	{
		_xml_helpdesk_3p_assign_tree = xmlmc.xmlDOM;
	}
	else
	{
		//-- should never happen
		alert(xmlmc.GetLastError());
		return false
	}

	if(app.oCurrentOutlookControl!=null && oCurrentOutlookControl.contentWindow._reload_helpdesk_tree)
	{
		oCurrentOutlookControl.contentWindow._reload_helpdesk_tree();
	}
	else
	{
		_helpdesk_view_tree_reload = true;
	}

	return true;
}
//-- eof sla forms openers



global.TAPIDial = function(strNumber)
{
	alert("TAPIDial : This method is not supported in the webclient.");
	return false;
}

//-- add resultion to kbase
global.AddResolutionToKnowledgeBase= function (strProbText, strProbCode, strSolution, strFixCode, strCallRefList, modalCallbackFunction)
{
	strCallRefList=strCallRefList+"";
	
	var arrCalls = strCallRefList.split(",");
	if(arrCalls.length>1)
	{
		//-- more than one call so add to unpub table and exit
		var xmlmc = new XmlMethodCall();
		for(var x=0;x<arrCalls.length;x++)
		{
			xmlmc.SetParam("callRef",arrCalls[x])
		}
		return xmlmc.Invoke("knowledgebase", "unpublishedCallAdd");
	}
	else
	{
		//-- create title and keywords based on passed in info
		var strTitle = "Call " + app.dd.tables['opencall'].columns['callref'].FormatValue(strCallRefList) + " resolved and added to the KnowledgeBase";

		var strKeywords= "";
		var arrCode = strFixCode.split("-");
		for(var x=0;x<arrCode.length;x++)
		{
			if(strKeywords!= "")strKeywords+= ", ";
			strKeywords+= arrCode[x];
		}

		var oRes = global.GetResolutionProfileDescription(strFixCode);
		if(oRes.strCodeDesc!="")
		{
			var arrCode = oRes.strCodeDesc.split("->");
			for(var x=0;x<arrCode.length;x++)
			{
				if(strKeywords!= "")strKeywords+= ", ";
				strKeywords+= arrCode[x];
			}
		}


		var res = true;
		if(app.OnNewKBDocument!=undefined)
		{
			_CURRENT_JS_WINDOW = window;
			res = app.OnNewKBDocument(app.session.analystId,strProbCode,strCallRefList,strProbText,strSolution,strKeywords,strTitle)
		}
	
		if(res==true)
		{
	

			var strParams = "in_callref=" +strCallRefList;
				strParams += "&in_problem=" +strProbText
				strParams += "&in_solution=" +strSolution
				strParams += "&in_probcode=" +strProbCode
				strParams += "&in_fixcode=" +strFixCode
				strParams += "&in_title=" +strTitle
				strParams += "&in_keywords=" +strKeywords
				strParams += "&in_author=" + app._analyst_name + " [" + session.analystId + "]"

				app.kbase.open_compose(strParams,modalCallbackFunction);
		}
	}
}

//-- used as part of xmlmethod to uplaod files
global.LoadFileInBase64 = function(strFileName)
{
	return "";
}

//-- add info to log file - not currently supported in webclient
global.LogInfo = function(strFormOrEntityName, strFunctionName, strMessage, nLogType)
{
	return "";
}

function OpenSqlTreeBrowserForm(strConfigName, bPage1PickMode, bPage2PickMode, strTreeFilter)
{
	var strParams = "treefilter="+strTreeFilter;
	if(bPage1PickMode || bPage1PickMode==undefined)strParams += "&resolvemode=1";
	if(bPage2PickMode)strParams += "&resolvetreemode=1";

	var useWin = (app._CURRENT_JS_WINDOW && app._CURRENT_JS_WINDOW.open && !app._CURRENT_JS_WINDOW.closed)?app._CURRENT_JS_WINDOW:window;
	var oForm = app._open_application_form("treebrowserform."+strConfigName, "stf", "", strParams, true, "add", null, null,useWin);
	if(oForm)
	{
		try
		{
			return oForm._swdoc._selected_treeformkey;
		}
		catch (e)
		{
			return "";			
		}
	}
	return false;
}
global.OpenSqlTreeBrowserForm = OpenSqlTreeBrowserForm;

//-- open a html window in special sw mode
function OpenHtmlWindow(strName,strType,strURL,strTitle,bResizable,iWidth,iHeight)
{
	//-- 02.12.2011
	//-- parse out url
	strURL = _swc_parse_variablestring(strURL);

	//-- get window we want to pass into modal window
	var useWin = (app._CURRENT_JS_WINDOW && app._CURRENT_JS_WINDOW.open && !app._CURRENT_JS_WINDOW.closed)?app._CURRENT_JS_WINDOW:window;
	var strResize = (bResizable)?"yes":"no";
	var strProperties = 'height='+iHeight+',width='+iWidth+',toolbar=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=' + strResize;
	if(strType.toLowerCase=="frame")
	{
		useWin.open(strURL,strName,strProperties);
	}
	else if(strType.toLowerCase=="modal")
	{
		useWin.showModalDialog(strURL,useWin,"resizable:"+strResize+";scroll:no;dialogWidth:"+iWidth+"px;dialogHeight:"+iHeight+"px");
	}
	else
	{
		//-- modal less window i.e. modal but does not wait.
		if(app.isIE)
		{
			useWin.showModelessDialog(strURL, useWin, "resizable:"+strResize+";scroll:no;dialogWidth:"+iWidth+"px;dialogHeight:"+iHeight+"px"); 
		}
		else
		{
			useWin.open(strURL,strName,strProperties + ",modal=yes");
		}
	}
}
global.OpenHtmlWindow = OpenHtmlWindow;

//-- alert
global.alert= function (strMessage, nOptionButtons)
{
	alert(strMessage);
}

function GetAsISO8601TimeString(epValue) 
{
    var d = new Date((epValue*1000));

    function pad(n) {return n<10 ? '0'+n : n}

    return d.getUTCFullYear()+'-'
         + pad(d.getUTCMonth()+1)+'-'
         + pad(d.getUTCDate())+' '
         + pad(d.getUTCHours())+':'
         + pad(d.getUTCMinutes())+':'
         + pad(d.getUTCSeconds());
}
global.GetAsISO8601TimeString = GetAsISO8601TimeString;


//-- attach email to call
global.AttachMessageToCall= function (strMailboxName, strMessageID, strFileName, strCallReference, strCallUdIndex, strMailActionType, bIncludeAttachments, strMoveMessageToFolder)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("mailbox",strMailboxName)
	xmlmc.SetParam("messageId",strMessageID)
	xmlmc.SetParam("fileName",strFileName)
	xmlmc.SetParam("callRef",strCallReference)
	xmlmc.SetParam("udIndex",strCallUdIndex)
	xmlmc.SetParam("attachType",strMailActionType)
	xmlmc.SetParam("includeAttachments",bIncludeAttachments)
	if(strMoveMessageToFolder!=undefined && strMoveMessageToFolder!="")	
	{
		//-- get folder id
		var xmlmctwo = new XmlMethodCall();
		xmlmctwo.SetParam("mailbox",strMailboxName);
		xmlmctwo.SetParam("folderPath",strMoveMessageToFolder);
		if(xmlmctwo.Invoke("mail", "getFolderFromPath"))
		{
			xmlmc.SetParam("moveMessageToFolderId",xmlmctwo.GetParam("folderId"))
		}
	}
	xmlmc.Invoke("helpdesk", "attachMessageToCall");
	return true;
}

//-- return call status string
global.CallStatusString= function (nStatus)
{
	return app.dd.tables["opencall"].columns["status"].FormatValue(nStatus);
}

//-- t/f can send email = function (server is running)
global.CanSendMail= function ()
{
	_email_getmailbox_permissions();
	return _email_checkright(_EM_CANSEND, "%");

}

//-- close email window
global.CloseMailMessageWindow= function (strMessageID)
{

}

//-- compose update email for pass in calls - 87198 - added 8th param so can filter out email templates
global.ComposeCallUpdateEmail= function (arrCallInfo, intUdIndex, strMessageText, flFileAttachments, nTimeSpent, strTemplateName, nTemplateType, modalCallbackFunction, strWebclientCallclass)
{
	//-- determine param types i.e. arrCallInfo may be a comma string
	var boolCommaSepCallrefs = (typeof arrCallInfo =="string")?true:false;
	var boolFetchMessageTextFromUdIndex = false;
	if(strWebclientCallclass==undefined)strWebclientCallclass="";

	//-- if arrCallInfo is a string then we expect 7 parameters
	intUdIndex +="";
	if (boolCommaSepCallrefs)
	{
		if(nTemplateType==undefined)
		{
			alert("global.ComposeCallUpdateEmail (old) : Expects 7 parameters to be passed in but only 6 are present.\n\n Please contact your administrator.");
			return false;
		}

		//-- passed in update index is not correct - problem with hold call form match
		if(intUdIndex.indexOf("\n"))
		{
			intUdIndex = intUdIndex.split("\n")[0];
		}
	}
	else
	{
		//-- we are expecting 6 parameters
		//if(nTemplateType!=undefined)
		//{
		//	alert("global.ComposeCallUpdateEmail (new) : Expects 6 parameters to be passed in but 7 are present.\n\n Please contact your administrator.");
		//	return false;
		//}

		//-- regig vars
		if($.isFunction(nTemplateType))
		{
			modalCallbackFunction = nTemplateType
		}
		
		nTemplateType = strTemplateName;
		strTemplateName = nTimeSpent;
		nTimeSpent = flFileAttachments;
		flFileAttachments = strMessageText;
		strMessageText = intUdIndex;
		
	}


	//-- should we get message string from udindex?
	if(strMessageText=="" && !isNaN(intUdIndex))boolFetchMessageTextFromUdIndex=true;
	

	//-- 1. get template to use
	var strCallClass = "";
	var xmlTemplateNode = null;

	//-- template name
	if(strTemplateName == "UpdateCallMailTemplate")strTemplateName = "Update Call";
	else if(strTemplateName == "CloseCallMailTemplate")strTemplateName = "Close Call";
	else if(strTemplateName == "HoldCallMailTemplate")strTemplateName = "Hold Call";
	else if(strTemplateName == "LogCallMailTemplate")strTemplateName = "Log Call";

	//-- template number if user has not passed in all 7 params
	if(nTemplateType==undefined)
	{
		//-- need to workout nTemplateType
		nTemplateType = 0;
		if(strTemplateName == "UpdateCallMailTemplate")nTemplateType = TEMPLATE_UPDATECALL;
		else if(strTemplateName == "CloseCallMailTemplate")nTemplateType = TEMPLATE_CLOSECALL;
		else if(strTemplateName == "HoldCallMailTemplate")nTemplateType = TEMPLATE_HOLDCALL;
		else if(strTemplateName == "LogCallMailTemplate")nTemplateType = TEMPLATE_LOGCALL;
	}

	//-- work out first callref
	//-- user passed in callrefs as a string rather than associative array
	var intFirstCallref = 0;	
	var intUpdateIndex = intUdIndex;
	if(boolCommaSepCallrefs)
	{
		var arrCallrefs = arrCallInfo.split(",");
		for(var x=0;x<arrCallrefs.length;x++)
		{
			if(intFirstCallref==0)intFirstCallref = arrCallrefs[x]; 
		}
	}
	else
	{
		//-- arrCallInfo is an array of ["udindex","udindex","udindex"] and each item key is callref
		for(intCallref in arrCallInfo)
		{
			if(intFirstCallref==0)
			{
				intFirstCallref = intCallref;
				if(isNaN(intUdIndex))intUpdateIndex = arrCallInfo[intCallref];
			}
		}
	}

	//-- if we need to get callclass of first call
	if(strWebclientCallclass=="")
	{
		var strParams = "callref=" + intFirstCallref + "&udindex=" + intUpdateIndex;
		var rs = new SqlQuery()
		rs.WebclientStoredQuery("system/getCallClassAndLastUpdateText",strParams);
		if(rs.Fetch())
		{	
			if(boolFetchMessageTextFromUdIndex) strMessageText = rs.GetValueAsString("updatetxt");
			strCallClass = rs.GetValueAsString("callclass");
		}
	}
	else
	{
		strCallClass=strWebclientCallclass;
	}
	
	//-- for each mailbox that user has user template rights to compile list of usable templates
	var _array_selectable_templates = new Array();
	for(strMailboxID in _current_mailbox_permissions)
	{
		if(_email_checkright(_EM_TEMPLATEUSE, strMailboxID))
		{
			var strDisplayName = global.GetSharedMailboxDisplayName(strMailboxID);

			//-- get templates
			var xmlmc = new XmlMethodCall();
			xmlmc.SetParam("mailbox",strMailboxID); 
			xmlmc.SetParam("templateType",nTemplateType);
			xmlmc.SetParam("returnMime",false);
			if(xmlmc.Invoke("mail", "getMailTemplateList"))
			{
				//-- store each template that we can use
				var arrTemplates = xmlmc.xmlDOM.getElementsByTagName("mailTemplate");
				for(var x=0;x<arrTemplates.length;x++)
				{
					var oTemplate = new Object();
					oTemplate.name = app.xmlNodeTextByTag(arrTemplates[x],"templateName")
					oTemplate.mailbox = strMailboxID;
					oTemplate.mailboxname = strDisplayName;
					oTemplate.callclass = app.xmlNodeTextByTag(arrTemplates[x],"callClass");

					//-- 87198 - only store templates for the callclass we are interested in
					if(oTemplate.callclass == strCallClass || oTemplate.callclass=="" || oTemplate.callclass=="All Classes")
					{
						_array_selectable_templates[_array_selectable_templates.length++] = oTemplate;
					}
				}
			}
		}
	}

	//-- no templates to use
	var intUseFirstAddress = 0;
	var intUseTemplate = 0;
	var intUseHTMLTemplate = 1;
	if(_array_selectable_templates.length==0)
	{
		alert("There are no templates defined that you can use for sending emails. Please contact your Administrator");
		app.debug("No email templates available for " + strTemplateName,"global.ComposeCallUpdateEmail","Get Templates");
		return false;
	}
	else if (_array_selectable_templates.length>1)
	{
		//-- more than one possible template - so show picklist
		var _specialParams = new Array();
		_specialParams['_emailtemplates'] = _array_selectable_templates;
		_specialParams['_defaultclass'] = strCallClass;
		var aForm = _open_system_form("_sys_email_templatepicker", "mail", "", "", true, null,undefined,undefined,undefined,undefined,_specialParams);
		if(aForm.document.selectedindex==-1)return false; //-- did not select a template

		//-- selected template so get template info
		intUseTemplate = aForm.document.selectedindex;
		strCallClass = aForm.document.selectedcallclass;
		intUseFirstAddress = aForm.document.flg_userfirstaddress;
		intUseHTMLTemplate = aForm.document.flg_userhtmltemplate;
	}

	//-- we should have template to use
	var useTemplate = _array_selectable_templates[intUseTemplate];


	//-- 2. store merged data info and pass to email form (which will call xmlmc to get stuff - this means user can refresh form and won't lose mime atts)
	var xmlmc = new XmlMethodCall('abcdef');
	xmlmc.SetParam("mailbox",useTemplate.mailbox); //-- how do we determine mailbox to use?
	xmlmc.SetParam("templateMailbox",useTemplate.mailbox); //-- how do we determine mailbox to use?
	xmlmc.SetParam("templateName",useTemplate.name);
	xmlmc.SetParam("templateType",nTemplateType);
	xmlmc.SetParam("callClass",strCallClass);

	//-- work out first callref
	//-- user passed in callrefs as a string rather than associative array
	var arrProperCallrefs = new Array();
	if(boolCommaSepCallrefs)
	{
		var arrCallInfo = arrCallInfo.split(",");
		for(var x=0;x<arrCallrefs.length;x++)
		{
			xmlmc.SetParam("callRef",arrCallrefs[x]);
			arrProperCallrefs[arrProperCallrefs.length++]=arrCallrefs[x];
		}
	}
	else
	{
		//-- arrCallInfo is an array of ["udindex","udindex","udindex"] and each item key is callref
		for(intCallref in arrCallInfo)
		{
			xmlmc.SetParam("callRef",intCallref);
			arrProperCallrefs[arrProperCallrefs.length++]=intCallref;
		}
	}

	//-- webclient email form fetches attachment info using 1st callref and intUpdateIndex
	flFileAttachments = intFirstCallref +"."+intUpdateIndex;

	//-- set lastUpdate Param
	xmlmc.SetParam("lastUpdate",strMessageText);
	xmlmc.SetParam("timeSpent",(nTimeSpent)); //-- nTimeSpent in seconds
	xmlmc.SetParam("dataDictionary",session.dataDictionary); //-- nTimeSpent is minutes

	//-- 3. open compose email and show arrows to move between calls - need to copy attachments
	//-- pass thru vars
	var _arrSpecial = new Array();
	_arrSpecial['_arrMailmergeCallrefs'] = arrProperCallrefs;
	_arrSpecial['_mailbox'] = useTemplate.mailbox;
	_arrSpecial['_templatename'] = useTemplate.name;
	_arrSpecial['_templatetype'] = nTemplateType;
	_arrSpecial['_firstadd'] = intUseFirstAddress;
	_arrSpecial['_usehtml'] = intUseHTMLTemplate;
	_arrSpecial['_timespent'] = nTimeSpent;
	_arrSpecial['_lastupdate'] = strMessageText;
	_arrSpecial['_lastupdateCallInfo'] = flFileAttachments; //-- so email for can use xmlmc to copy call file attachments 
	_arrSpecial['_mergeMessageXmlmc'] = xmlmc;	//-- PASS xmlmc object ot form so form can Invoke and still work when form is refreshed.

	var strParams  = "addnew=1&_emailaction=CALLMERGE:&_mailbox=" +useTemplate.mailbox;
	
	//-- in case user has passed back a function
	var systemCallbackFunction = null;
	if(modalCallbackFunction)
	{
		systemCallbackFunction = function()
		{
			modalCallbackFunction({});
		}
	}
	
	app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, systemCallbackFunction,null,window,undefined,undefined,_arrSpecial);
}


global.GetSharedMailboxDisplayName=function(strMailbox)
{
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
		{
			return app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"displayName");
		}
	}
	return "";
}

global.IsSharedMailbox=function(strMailbox)
{
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
		{
			return (app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"type")=="2");
		}
	}
	return "";
}


global.GetMailboxNameByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"name");
}

global.GetMailboxDisplayByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"displayName");
}


global.GetSharedMailboxXmlNode=function(strMailbox)
{
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
		{
			return _arr_xml_mailbox_list[x];
		}
	}
	return null;
}



global.GetMailboxEmailAddressByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	alert(_arr_xml_mailbox_list[nPos].xml)
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"address");
}
global.GetMailboxEmailNameByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	return app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"name");
}
global.GetMailboxEmailDisplayNameByPos=function(nPos)
{
	if(nPos>999)nPos = nPos-1000;
	var strRet = app.xmlNodeTextByTag(_arr_xml_mailbox_list[nPos],"displayName");
	if(strRet=="") strRet = this.GetMailboxEmailNameByPos(nPos);

	return strRet;
}

global.GetEmailForm_DefaultAddressValue = function(strMailbox, intUseFirstAdd)
{
	var arr_unique_mailbox_names = new Array();
	var strLocalMailBox = "";
	if(strMailbox==undefined)strMailbox==""

	var strPickList = "";
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		var y=x;
		var strDisplay = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"displayName");
		var strName = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name");
			
		if(!app._email_checkright(app._EM_CANSEND,strName))continue;


		if(arr_unique_mailbox_names[strName]==undefined)
		{
			arr_unique_mailbox_names[strName] = 1;
			y = x + 1000;
		}

		if(strMailbox!="")
		{
			if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
			{
				if(intUseFirstAdd!=undefined && intUseFirstAdd==1) y = x;
				return y;
			}
		}
		else
		{
			if(intUseFirstAdd!=undefined && intUseFirstAdd==1) y = x;
			return y;
		}
	}

	return 0;

}

global.GetEmailForm_AddressPickList = function(strMailbox)
{
	var arr_unique_mailbox_names = new Array();
	var strLocalMailBox = "";

	var strPickList = "";
	for(var x=0;x<_arr_xml_mailbox_list.length;x++)
	{
		var strDisplay = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"displayName");
		var strName = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name");
		var strAddress = app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"address");

		if(!app._email_checkright(app._EM_CANSEND,strName))continue;

		//-- add (local) mailbox option
		if(arr_unique_mailbox_names[strName]==undefined)
		{
			arr_unique_mailbox_names[strName] = 1;
			if(strLocalMailBox != "" )strLocalMailBox += "|";
			strLocalMailBox += strDisplay + " (local)" + "^" + (x + 1000);
		}

		//-- an associated address
		if(strAddress.indexOf("@")!=-1)
		{
			if(strMailbox!="")
			{
				if(app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"name").toLowerCase()== strMailbox.toLowerCase())
				{
					if(strPickList != "" )strPickList += "|";
					strPickList += strDisplay + " ("  + app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"address") + ")" + "^" + x;
				}
			}
			else
			{
				if(strPickList != "" )strPickList += "|";
				strPickList += strDisplay + " ("  + app.xmlNodeTextByTag(_arr_xml_mailbox_list[x],"address") + ")" + "^" + x;
			}
		}
	}

	if(strPickList!="")
	{
		strPickList = strLocalMailBox + "|" + strPickList;
	}
	else
	{
		strPickList = strLocalMailBox;
	}

	return strPickList;
}

//-- t/f confirm message
global.confirm= function (strMessage)
{
	return confirm(strMessage);
}


//-- print to debugger
global.DebugPrint= function (strMessage)
{

}

//-- epoch time from date string
global.EpocTimeFromString= function (strTime)
{
	var jsDate = _parseDate(strTime);
	if(jsDate)
	{
		var intEpoch = parseInt(Date.UTC(jsDate.getFullYear(),jsDate.getMonth(),jsDate.getDate(),jsDate.getHours(),jsDate.getMinutes(),jsDate.getSeconds()) / 1000);
		return intEpoch;
	}
	else
	{
		return 0;
	}
}

//-- epoch time from gmt date string
global.EpocTimeFromStringGmt= function (strTime)
{
	var jsDate = _parseDate(strTime);
	if(jsDate)
	{
		return _date_to_utc_epoch(jsDate);
	}
	else
	{
		return 0;
	}
}


global.GetCacheRecordCount= function (strTable, strWhere)
{
	var strSQLWhere =(strWhere=="")?"":strWhere;
	var strParams = "dsn=sw_systemdb&table=" + strTable + "&filter=" + strWhere;
	var rs = new SqlQuery()
	rs.RemoteWebclientQuery("system/getCallClassAndLastUpdateText",strParams);
	if(rs.Fetch())
	{	
		return rs.GetValueAsNumber("counter");
	}
	else
	{
		return -1;
	}
}

global.GetCallStatusInfo= function (sCallref, bSwdata)
{
	if(bSwdata==undefined)bSwdata=false;
	
	var o = new Object();
	o.nStatus = 0;
	o.strCallClass = "";
	o.strPriority = "";

	var strDB = (bSwdata)?"swdata":"syscache";
	var rs = new SqlQuery()

	var strParams = "dsn="+strDB+"&callref=" + sCallref; 
	rs.WebclientStoredQuery("system/getCallStatusInfo",strParams);
	if(rs.Fetch())
	{	
		o.nStatus = rs.GetValueAsNumber("status");
		o.strCallClass = rs.GetValueAsString("callclass");
		o.strPriority = rs.GetValueAsString("priority");
	}
	else
	{
		if(!bSwdata)
		{
			//-- was not found in cache so check swdata
			return this.GetCallStatusInfo(sCallref,true);
		}
	}
	return o;
}

//-- this works ok
global.GetCurrentEpocTime= function ()
{
	var t = new Date();
	var intEpoch = app._date_to_epoch(t);
	return intEpoch;
}

global.GetProblemProfileDescription= function (strCode)
{
	var oRes = new Object();
	var oRS = new SqlQuery();
	var strParams = "code=" + strCode; 
	oRS.WebclientStoredQuery("system/getProblemProfileDescription",strParams);
	if(oRS.Fetch())
	{
		oRes.strCodeDesc = oRS.GetValueAsString("codedesc");
		oRes.strDescription = oRS.GetValueAsString("codetext");
	}
	else
	{
		oRes.strCodeDesc = "";
		oRes.strDescription = "";
	}

	return oRes;
}


global.GetResolutionProfileDescription= function (strCode)
{
	var oRes = new Object();
	var oRS = new SqlQuery();
	var strParams = "code=" + strCode; 
	oRS.WebclientStoredQuery("system/getResolutionProfileDescription",strParams);
	if(oRS.Fetch())
	{
		oRes.strCodeDesc = oRS.GetValueAsString("codedesc");
		oRes.strDescription = oRS.GetValueAsString("codetext");
	}
	else
	{
		oRes.strCodeDesc = "";
		oRes.strDescription = "";
	}

	return oRes;
}

global.GuiFlush= function ()
{
	return true;
}

//-- run php
global.HttpGet= function (strGetUrl, bAppendSessionInfo)
{
	//-- 28.10.2011 - HTL fix 86389 
	if(bAppendSessionInfo) 
	{
	    //-- 91968 - if has ? already then append with &
		var strPrefix = (strGetUrl.indexOf("?")>-1)?"&":"?";
		strGetUrl += strPrefix + "sessid=" + app._swsessionid;
	}

	var strParams = "_geturl=" + app.pfu(strGetUrl);
	var strURL = app.get_service_url("swclass/httpget","");
	return app.get_http(strURL, strParams, true, false);
}

global._mailserverrunning = undefined;
global.IsConnectedToMailServer= function ()
{
	//-- 15.05.2012
	//-- already set var so jsut return that
	if(this._mailserverrunning!=undefined) return this._mailserverrunning;

	var strParams = "";
	var strURL = app.get_service_url("email/isservicerunning","");
	var res = app.get_http(strURL, strParams, true, false);
	
	//-- set var so we only need to call once
	this._mailserverrunning = (res=="true");
	return this._mailserverrunning;
}

global.IsCallInKnowledgeBase=function(varCallref)
{
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("callref",varCallref)
	if(xmlmc.Invoke("knowledgebase", "isCallInKnowledgeBase"))
	{
		return (xmlmc.GetParam("included")=="false")?false:true;
	}
	return false;

}

global.IsObjectDefined= function (strObjectName)
{
	try{
		var tmp = eval(strObjectName);
	}
	catch(e){return false;}
	return true;

}

//-- get survey lic info
global._wc_boolSurveyModuleEnabled = -1;
global.IsSurveyModuleEnabled= function ()
{
	if(this._wc_boolSurveyModuleEnabled==-1)
	{
		this._wc_boolSurveyModuleEnabled = false;
		var strURL = app.get_service_url("session/getlicinfo","");
		var xmlLicInfo = app.get_http(strURL, "", true, true);
		if(xmlLicInfo)
		{
			var arrLic = xmlLicInfo.getElementsByTagName("features");
			if(arrLic[0])
			{
				var strSurvey = xmlNodeTextByTag(arrLic[0],"survey");
				if(strSurvey=="true")this._wc_boolSurveyModuleEnabled=true;
			}
		}
	}
	return this._wc_boolSurveyModuleEnabled;
}



global.LockCalls= function (strCallRefs, strReason, bDisplayMessage)
{
	if(strReason==undefined)strReason = "UPDATE";
	if(bDisplayMessage==undefined)bDisplayMessage = false;
	strCallRefs +="";

	var arrCalls = strCallRefs.split(",");

	var xmlmc = new XmlMethodCall();
	for(var x=0;x<arrCalls.length;x++)
	{
		xmlmc.SetParam("callref",arrCalls[x])
	}

	xmlmc.SetParam("reason",strReason)
	if(xmlmc.Invoke("helpdesk", "lockCalls"))
	{
		var arrMessage = xmlmc.xmlDOM.getElementsByTagName("message");
		if(arrMessage[0])
		{
			//-- if message is locked and the locked by user is session analyst then ignore 
			//-- i.e. i should be able to update locked calls that i have already locked
			var msg = app.xmlText(arrMessage[0]);
			var test = "locked by " + app.session.analystid.toLowerCase();
			if(msg.toLowerCase().indexOf(test)==-1) 
			{
				alert(msg);
				return false;
			}
		}
		return true;
	}
	else
	{
		//-- check if locked by current analyst if so allow them to continue.
		if(bDisplayMessage)	alert(xmlmc.GetLastError())
	}

	return false;
}

global.LogNewCall= function (strFormName,callback,aWin,_specialParams, strPassOnParams)
{
	//if(aWin==undefined)
	//{
	//	aWin = window;
	//}
	if(strPassOnParams==undefined)strPassOnParams="";
	app._open_logcall_form(strFormName,strPassOnParams,aWin,_specialParams,callback);
}

global.MessageBeep= function (nSoundType)
{
}

global.MessageBox= function (strMessage, nOptions, callback, aWin)
{
	return MessageBox(strMessage, nOptions,callback, aWin);
}

global.OpenCallDetailsView= function (nCallRef,callback)
{

	app._open_call_detail(nCallRef,callback);

}

global.ShellExecute = function(strCommand)
{
	ShellExecute(strCommand);
}

global.OpenDatabaseSearchView= function (strSql,nLimit)
{
	var strParams = "query=" + strSql;
	if(nLimit!=undefined && !isNaN(nLimit)) strParams +"&limit=" + nLimit;
	_hslaction("sqlsearch",strParams);
}

global.OpenEmbeddedURL= function (strUrl,loadIntoCurrentView,loadIntoLeftView)
{
	if(loadIntoCurrentView==undefined) loadIntoCurrentView = false;
	if(loadIntoLeftView==undefined) loadIntoLeftView = false;

	if(strUrl.toLowerCase().indexOf("hsl:")>-1)
	{
		var arrInf = strUrl.split("?");
		var arrAction = arrInf[0].split(":");
		_hslaction(arrAction[1],arrInf[1],null);
	}
	else
	{
		//--switch to swtoday view and then load url into left hand view
		if(!loadIntoCurrentView)
		{
			app.application_navbar.activatebar("supportworks_today");
		}

		var targetFrame = (loadIntoLeftView)?app.oCurrentOutlookControl:app.oCurrentOutlookWorkSpace;
		strUrl = _swc_parse_variablestring(strUrl)
		targetFrame.setAttribute("externalUrl",true);
		targetFrame.src = strUrl;
	
	}
}

global.OpenVCM= function (strConfigItemKey, strConfigFile, nShowType, nShowLevel, nObjInGroup, nZoom)
{
	alert("OpenVCM : Is not currently suported by the webclient");
}

global.PrepareForXML =function (strValue)
{
	return pfx(strValue);
} 

function pfx(strValue)
{
	strValue+=""; //-- cast	
	
	//-- prepare already prepared instances (i.e. data value is actually &lt;)
	strValue= strValue.replace(/\&/g,'&amp;');
	//strValue= strValue.replace(/\&gt;/g,'&amp;gt;');
	//strValue= strValue.replace(/\&qout;/g,'&amp;qout;');
	//strValue= strValue.replace(/\&apos;/g,'&amp;apos;');

	//-- replace instances of & with &amp; so long as not already &amp;
/*
	var outp = ""; 
	var ch = "";
	for (i = 0; i <= strValue.length; i++) 
	{ 
		ch = strValue.charAt(i);
		if(ch=="&")
		{
			alert(":"+strValue.substring(i,i+5)+":")
			if(strValue.substring(i,i+5)!="&amp;")
			{
			  outp += "&amp;";
			}
			else
			{
				outp += ch;
			}
		}
		else
		{
			outp += ch; 
		}
	} 
	
	strValue = outp;
*/
	strValue= strValue.replace(/</g,'&lt;');
	strValue= strValue.replace(/>/g,'&gt;');
	strValue= strValue.replace(/\"/g,'&quot;');
	strValue= strValue.replace(/\'/g,'&apos;');
	return strValue;
}

function unpfx(strValue)
{
	strValue+=""; //-- cast
	strValue= strValue.replace(/\&lt;/g,'<');
	strValue= strValue.replace(/\&gt;/g,'>');
	strValue= strValue.replace(/\&quot;/g,'"');
	strValue= strValue.replace(/\&apos;/g,"'");
	strValue= strValue.replace(/\&amp;/g,'&');

	return strValue
}

global.PrepareForSQL = function (strValue)
{
	return pfs(strValue);
}

//-- check for pfs value
function pfs(strValue)
{
	//-- prepare and check for sql injection ?? api call ?? or do exactly what full client does
	strValue+=""; //-- cast
	if(app._dbtype=="swsql")
	{
		strValue = app.string_replace(strValue,"'","''",true);
	}
	else
	{
		strValue = app.string_replace(strValue,"'","''",true);
	}
	return strValue;		
}


global.prompt= function (strMessage, strValue)
{
	return prompt(strMessage,strValue);
}

global.RunHIB= function (strURL, strCompVarName, strCompIDValue)
{
	var strParams = "_url=" + strURL + "&_assetvar=" + strCompVarName + "&_assetid=" + strCompIDValue;
	var aForm = _open_system_form("interface.php", "hib", "", strParams, false,null,null,null,1000,800);
}

global.ScheduleCallback= function (nCallRef)
{
	//-- get analyst to assign call back to
	/*
	var picker = new PickAnalystDialog();
	picker.Open("Assign Callback To:",false);			
	if(picker.analystid=="") return false;
	picker.analystid; 
	*/
	
	//-- we do no have any mehod to create a call back
	
	alert("ScheduleCallback : Is not currently suported by the webclient");

}

global.RunProgram = function ()
{
	return true;
}

global.Sleep= function (nMilliseconds)
{
}

global.StoredQueryExecute=function(queryName,queryParams, optBoolSqlCount)
{
	var tmpQ = new SqlQuery();
	var res = tmpQ.StoredQuery("execute/"+queryName, queryParams);
	if(!res)return -1;

	//-- if the command is a select count 
	if(optBoolSqlCount)
	{
		if(tmpQ.Fetch())
		{
			return tmpQ.GetValueAsNumber(0);
		}
		else
		{
			return -1;
		}
	}
	else
	{
		return tmpQ._recordset.params.rowsEffected;
	}
}

global.SqlExecute= function (strDatabase, strSQL)
{
	var tmpQ = new SqlQuery();
	if(tmpQ.Query(strSQL, strDatabase))
	{
		//-- if doing a count(*) then return count result
		if(strSQL.toLowerCase().indexOf("select count(*) from")==0)
		{
			if(tmpQ.Fetch())
			{
				return tmpQ.GetValueAsNumber(0);
			}
			else
			{
				return -1;
			}
		}
		else if(strSQL.toLowerCase().indexOf("select")==0)
		{
			return tmpQ.GetRowCount();
		}
		else
		{
			//-- is something like an update or a delete - so just return 1 i.e. true
			return 1;
		}
	}
	else
	{
		return -1;
	}
}

global.UnlockCalls= function (strCallRefs)
{

	strCallRefs +="";
	var arrCalls = strCallRefs.split(",");

	var xmlmc = new XmlMethodCall();
	for(var x=0;x<arrCalls.length;x++)
	{
		xmlmc.SetParam("callref",arrCalls[x])
	}
	if(xmlmc.Invoke("helpdesk", "unlockCalls"))
	{
		var arrMessage = xmlmc.xmlDOM.getElementsByTagName("message");
		if(arrMessage[0])
		{
			//alert(app.xmlText(arrMessage[0]))
			return false;
		}
		return true;
	}
	return false;
}

global.ValidateSLAName= function (strSLAName)
{
	var rs = new SqlQuery();
	var strParams = "sla=" + strSLAName; 
	rs.WebclientStoredQuery("system/getProblemProfileDescription",strParams);
	if(rs.GetRowCount()>0) return true;

	return false;
}

global.xpathGetXml = function (xpath)
{
	return "";
}


//-- run ql
global._runQuickLogCall = function(strName,strFolder)
{
	//-- get quicklog call info for xmlmc
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("name",strName);
	xmlmc.SetParam("mailbox",strFolder);
	if(!xmlmc.Invoke("helpdesk","quicklogCallGet"))
	{
		alert("xmlmc helpdesk:quicklogCallGet Failed:\n\n" + xmlmc.GetLastError());
		return false;
	}
	
	//-- open log call form of the desired type
	var strForm = xmlmc.GetParam("formName");
	var strClass = xmlmc.GetParam("callClass");

	//-- open new log call form
	var arrParams = new Array();
	arrParams["_qlc_data"] = xmlmc.xmlDOM;
	global.LogNewCall(strForm,null,window,arrParams);

	return true;
}

//-- delete ql
global._deleteQuickLogCall=function(strName,strFolder)
{
	//-- get quicklog call info for xmlmc
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("name",strName);
	xmlmc.SetParam("mailbox",strFolder);
	if(!xmlmc.Invoke("helpdesk","quicklogCallDelete"))
	{
		alert("xmlmc helpdesk:quicklogCallDelete Failed:\n\n" + xmlmc.GetLastError());
		return false;
	}
	return true;
}

//-- nwj - 16.03.2011 - function to upload a generic file to server - using form_iframeloader on portal.php
global._selectFileToUpload=function(strUploadPhpSrc, strGenFieldOneValue, funcCallback)
{
	global._fileUploadPhpSrc = strUploadPhpSrc;
	global._genFieldOneValue = strGenFieldOneValue;

	var oForm = document.getElementById("form_fileuploader");
	if(oForm==null)return;
	//-- have to show popup file selector for mozilla and safari and chrome
	if( (!app.isIE) || (app.isIE8 || app.isIE6 ))
	{
		//-- popup form
		var arrField = new Array();
		arrField['_uniqueformid'] = -1;
		arrField['_callback'] = funcCallback;
		arrField['_genfieldvalue'] = strGenFieldOneValue;
		arrField['_top'] = top;
		var popupForm = app._open_system_form("fileupload.php", "fileupload", "", "", true, null,null,window,400,20,arrField);
			
		//-- no file selected
		if(popupForm._uploadfilenode==null || app.isSafari) return;
		//-- we have a file input node - need to put it into our form

		if(app.isIE6)
		{
			res = oForm.insertAdjacentElement('beforeEnd', popupForm._uploadfilenode);
		}
		else
		{
			var res = oForm.appendChild(popupForm._uploadfilenode);
		}

		global._webclientUploadFile();
		return;
	}

	//-- IE is great as it allows us to trigger click event (whats teh security risj in that...none)
	var eFile = app.getEleDoc(oForm).getElementById("swfileupload");
	if(eFile==null)
	{
		eFile = app.getEleDoc(oForm).createElement("input");
		eFile.setAttribute('type', 'file');
		eFile.setAttribute('name', 'swfileupload');
		eFile.setAttribute('id', 'swfileupload');
		app.addEvent(eFile,"change",global._webclientUploadFile);

		if(app.isIE6)
		{
			oForm.insertAdjacentElement('beforeEnd', eFile);
		}
		else
		{
			oForm.appendChild(eFile);
		}
	}

	if(app.isChrome || app.isIE6)	oForm.style.display='block';

	eFile.click(); //-- trigger file click
}

global._webclientUploadFile=function()
{
	var oForm = document.getElementById("form_fileuploader");
	if(oForm==null)return;

	oForm.setAttribute("action",global._fileUploadPhpSrc);

	//-- set gen 1 field value
	if(global._genFieldOneValue==undefined)	global._genFieldOneValue="";
	var eGenField = app.getEleDoc(oForm).getElementById("frm_genfieldone");

	if(eGenField!=null)
	{
		eGenField.value = global._genFieldOneValue;
	}

	//-- create iframe to take upload if not created yet
	var oIF = app.getEleDoc(oForm).getElementById('iframe_webclient_fileuploader');
	if(oIF==null)
	{
		var strIframeHTML = "<iframe id='iframe_webclient_fileuploader' name='iframe_webclient_fileuploader' style='position:absolute;top:0;left:0;display:none;'></iframe>";
		app.insertBeforeEnd(app.getEleDoc(oForm).body,strIframeHTML);
		oIF = app.getEleDoc(oForm).getElementById('iframe_webclient_fileuploader');
	}

	oForm.submit();

	//-- hide submit form
	if(app.isChrome)setTimeout("global._webclientUploadFileHideForm()",1000);
}

global._webclientUploadFileHideForm=function()
{
	var oForm = document.getElementById("form_fileuploader");
	if(oForm==null)return;

	oForm.style.display='none';
}


global._cached_getTimeZoneOffset = null;
global._getTimeZoneOffset=function(strTimeZone)
{
	if(global._cached_getTimeZoneOffset!=null) return global._cached_getTimeZoneOffset;
	
	var res = 0;
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("timeZone",strTimeZone);
	if(xmlmc.Invoke("system","getTimezoneOffset"))
	{
		res = xmlmc.GetParam("offset");
		res++;res--;
		global._cached_getTimeZoneOffset = res;
	}
	return res;
}

//-- NOV-2014 - replace date strings in text with analysts formatted date/time
global.ConvertDateTimeInText=function(strBlock)
{
	var Iso8601InBracketsUtc = new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\]-UTC","g"); //yyyy-MM-dd HH:mm:ss
	var UkStyleInBracketsUtc = new RegExp("\\[\\d{1,2}\\/\\d{1,2}\\/\\d{4} \\d{1,2}:\\d{1,2}:\\d{1,2}\\]-UTC","g"); //dd/MM/yyyy HH:mm:ss
	var Iso8601Z = new RegExp("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}Z","g"); // yyyy-MM-dd HH:mm:ssZ
	
	var fUtc = function($0,$1,$2,$3,$4,$5,$6)
		{
			var strDate =  $0.replace("[","").replace("]","").replace("-UTC","").replace("Z","");
			var arrParts =  strDate.split(" ");
			var arrDateParts = arrParts[0].split("-");
			var arrTimeParts = arrParts[1].split(":");
			
			return format_dateparts(app._analyst_datetimeformat,app._analyst_timezoneoffset, arrDateParts[0],arrDateParts[1],arrDateParts[2],arrTimeParts[0],arrTimeParts[1],arrTimeParts[2]);
		}

	var fUK = function($0,$1,$2,$3,$4,$5,$6)
		{
			var strDate =  $0.replace("[","").replace("]","").replace("-UTC","").replace("Z","");
			var arrParts =  strDate.split(" ");
			var arrDateParts = arrParts[0].split("/");
			var arrTimeParts = arrParts[1].split(":");

			return format_dateparts(app._analyst_datetimeformat,app._analyst_timezoneoffset, arrDateParts[2],arrDateParts[1],arrDateParts[0],arrTimeParts[0],arrTimeParts[1],arrTimeParts[2]);
		}
		
	return strBlock.replace(Iso8601InBracketsUtc,fUtc).replace(Iso8601Z,fUtc).replace(UkStyleInBracketsUtc,fUK);
	
};;;;//--
//-- functions to help with all date stuff


//--
//-- date stuff
var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

var month=new Array(7);
month[0]="January";
month[1]="Feburary";
month[2]="March";
month[3]="April";
month[4]="May";
month[5]="June";
month[6]="July";
month[7]="August";
month[8]="September";
month[9]="October";
month[10]="November";
month[11]="December";


//-- 04.04.2004
//-- HELPER FUNCTIONS

function _getyear(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysyear = todaysdate.getFullYear();
	return todaysyear;
}

function _getmonth(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysmonth = todaysdate.getMonth();
	return todaysmonth;
}

function _getweek(in_date)
{
	dayof = in_date.getDate();
	in_date.setDate(1);

	//-- so we have the first day of that month
	//-- lets find the day of week, then loop until increasing day of week
	week=1;
	for (x=1; x < dayof; x++)
	{
		in_date.setDate(x);
		y = _getdayofweek(in_date);
		if (y == 0 ) week++;
	}
	return week;
}

function _getdayofweek(in_date)
{
	var todaysdate = in_date;
	if (todaysdate == undefined) todaysdate = new Date();
	var todaysday = todaysdate.getDay();
	return todaysday;
}


//-- get start of month
function fd_get_som_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);


	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var currmonth = aDate.getMonth();
	var imonth = aDate.getMonth()-1;
	if(imonth==-1)imonth=11;
	while(imonth != currmonth)
	{
		aDate.setDate(aDate.getDate()-1);
		currmonth = aDate.getMonth();
	}
	//-- gone back one month so go back to start
	aDate.setDate(aDate.getDate()+1);
	return aDate;
}

//-- get eom of month
function fd_get_eom_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);


	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var origmonth = aDate.getMonth();
	var imonth = -1;
	var intDay = aDate.getDay();
	while(imonth != origmonth)
	{
		aDate.setDate(aDate.getDate()+1);
		imonth = aDate.getMonth();
	}
	//-- gone back one month so go back to start
	aDate.setDate(aDate.getDate()+1);
	return aDate;
}


//-- get start of week date object (from monday)
function fd_get_sow_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);

	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var intDay = aDate.getDay();
	while(intDay!=1)
	{
		aDate.setDate(aDate.getDate()-1);
		intDay = aDate.getDay();
	}

	return aDate;
}

//-- get end of week date object (from monday)
function fd_get_eow_from_yyyymmdd(strYYYYMMDD)
{
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);


	var aDate = new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);

	//-- go back until at monday
	var intDay = aDate.getDay();
	while(intDay!=0)
	{
		aDate.setDate(aDate.getDate()+1);
		intDay = aDate.getDay();
	}

	return aDate;
}


function fd_dd_month(aDate, strSep)
{
	if(strSep==undefined)strSep=" ";
	return aDate.getDate() + strSep + month[aDate.getMonth()];
}



function fd_to_yyyymmdd(aDate)
{
	var intMonth = aDate.getMonth() + 1;
	var intDay = aDate.getDate();
	var strMonth = (intMonth<10)?"0" + intMonth:intMonth + "";
	var strDay = (intDay<10)?"0" + intDay:intDay + "";
	return aDate.getFullYear() + strMonth + strDay;
}

function fd_to_month(aDate)
{
	return month[aDate.getMonth()];
}

function fd_yyyymmdd_to_dd_month(strYYYYMMDD, strSep)
{
	if(strSep==undefined)strSep=" ";
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);
	
	return strDay + strSep + month[strMonth-1]
}

function format_dateparts(strFormat,intOffset, strYear,strMonth,strDay,strHH,strMM,strSS)
{
	var aDate= new Date();
	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);
	aDate.setHours(strHH);
	aDate.setMinutes(strMM);
	aDate.setSeconds(strSS);


	var intEpoch = _date_to_epoch(aDate);
	var aDate = _date_from_epoch(intEpoch,intOffset);
	return _formatDate(aDate,strFormat);
}

function fd_yyyymmdd_to_d(strYYYYMMDD)
{
	var aDate= new Date();
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);

	aDate.setYear(strYear);
	aDate.setMonth(strMonth-1);
	aDate.setDate(strDay);
	return aDate;
}

function fd_yyyymmdd_to_dd_month_year(strYYYYMMDD, strSep)
{
	if(strSep==undefined)strSep=" ";
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);

	return strDay + strSep + month[strMonth-1] + strSep + strYear;
}

//-- given "hh:mm" return number of seconds since midnight - used for sla timing
function _convert_hhmm_to_epoch(strTime)
{
	var arrTime = strTime.split(":");
	var intHours = arrTime[0]-1+1;
	var intMins = arrTime[1]-1+1;

	var intTotalSeconds = (intHours * 3600) + (intMins * 60);
	return intTotalSeconds;
}

function df_yyyymmdd_to_yyyy_mm_dd(strYYYYMMDD, strSep)
{
	if(strSep==undefined)strSep=" ";
	var strYear = strYYYYMMDD.substring(0,4);
	var strMonth = strYYYYMMDD.substring(strYYYYMMDD.length-4,strYYYYMMDD.length-2);
	var strDay = strYYYYMMDD.substring(strYYYYMMDD.length-2);
	
	var data = strYear + strSep + strMonth + strSep + strDay;
	return data;
}

function _date_to_utc_timestamp(aDate)
{
	var strYear = aDate.getUTCFullYear();
	var strMonth =aDate.getUTCMonth() + 1;
	if(strMonth<10)strMonth = "0" + strMonth;

	var strDay =aDate.getUTCDate() 
	if(strDay<10)strDay = "0" + strDay;

	var strHours =aDate.getUTCHours()
	if(strHours<10)strHours = "0" + strHours;
	var strMinutes =aDate.getUTCMinutes()
	if(strMinutes<10)strMinutes = "0" + strMinutes;
	var strSecs =aDate.getUTCSeconds()
	if(strSecs<10)strSecs = "0" + strSecs;

	
	var strDate = strYear +"-" + strMonth + "-" + strDay + " " + strHours +":"+strMinutes + ":"+strSecs;
	return strDate;
}

function _date_to_timestamp(aDate)
{
	var strYear = aDate.getFullYear();
	var strMonth =aDate.getMonth() + 1;
	if(strMonth<10)strMonth = "0" + strMonth;

	var strDay =aDate.getDate() 
	if(strDay<10)strDay = "0" + strDay;

	var strHours =aDate.getHours()
	if(strHours<10)strHours = "0" + strHours;
	var strMinutes =aDate.getMinutes()
	if(strMinutes<10)strMinutes = "0" + strMinutes;
	var strSecs =aDate.getSeconds()
	if(strSecs<10)strSecs = "0" + strSecs;

	
	var strDate = strYear +"-" + strMonth + "-" + strDay + " " + strHours +":"+strMinutes + ":"+strSecs;
	return strDate;
}


function fd_to_yyyy_mm_dd(aDate,strSep)
{
	var strYYYYMMDD = fd_to_yyyymmdd(aDate);
	return df_yyyymmdd_to_yyyy_mm_dd(strYYYYMMDD, strSep);

}


function _date_from_epoch(intEpoch,intOffset, intTime)
{
	if(intTime==undefined)intTime=0;
	//if(intOffset==undefined)intTime=0;

	var dDate = new Date();

	var mEpoch = parseInt(intEpoch);

	if(mEpoch<10000000000) mEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
	dDate.setTime(mEpoch)

	//-- now add offset
	if(intOffset!=undefined)
	{
		var intUTCEpoch = _date_to_epoch(dDate);
		intOffset++;intOffset--;
		intUTCEpoch = intUTCEpoch + intOffset;

		if(intUTCEpoch<10000000000) intUTCEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
		dDate.setTime(intUTCEpoch)
	}

	
	return dDate;
}

//-- get utc date time from epoch regardless of os date settings
function _utcdate_from_epoch(intEpoch,intOffset, intTime)
{
	if(intTime==undefined)intTime=0;

	var dDate = new Date();

	var mEpoch = parseInt(intEpoch);

	if(mEpoch<10000000000) mEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
	dDate.setTime(mEpoch)
	
	//-- convert date to utc
	dDate = _date_to_utc_date(dDate);

	//-- now add offset
	if(intOffset!=undefined)
	{
		var intUTCEpoch = _date_to_epoch(dDate);
		intOffset++;intOffset--;
		intUTCEpoch = intUTCEpoch + intOffset;

		if(intUTCEpoch<10000000000) intUTCEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
		dDate.setTime(intUTCEpoch)
	}


	//-- check if we need to set time of day
	if(intTime==1)
	{
		dDate = _set_date_sod(dDate);
	}
	else if(intTime==2)
	{
		dDate = _set_date_eod(dDate);
	}
  
	return dDate;
}

//-- get os date/time given an epoch value - intTime [0=as is,1=00:00:00, 2 = 23:59.59]
function _osdate_from_epoch(intEpoch, intTime)
{
	if(intTime==undefined)intTime=0;

	var dDate = new Date();
	if(intEpoch!=undefined)
	{
		var mEpoch = parseInt(intEpoch); 
		if(mEpoch<10000000000) mEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
		dDate.setTime(mEpoch)
	}

	//-- check if we need to set time of day
	if(intTime==1)
	{
		dDate = _set_date_sod(dDate);
	}
	else if(intTime==2)
	{
		dDate = _set_date_eod(dDate);
	}
  
	return dDate;
}

//-- set date to be start of day
function _set_date_sod(dDate)
{
	dDate.setHours(0);
	dDate.setMinutes(0);
	dDate.setSeconds(0);
	return dDate;
}
//-- set date to be end of day
function _set_date_eod(dDate)
{
	dDate.setHours(23);
	dDate.setMinutes(59);
	dDate.setSeconds(59);
	return dDate;
}

function _date_to_epoch(dDate)
{
	if(dDate==null)return 0;

	//var intOsOffsetMilliseconds = dDate.getTimezoneOffset() * 60000;
	return parseInt(dDate.getTime()-dDate.getMilliseconds())/1000;
}

//-- convert a date to utc date and time
function _date_to_utc_date(aDate)
{
	if(aDate==undefined) aDate=new Date();

	var intOsOffsetMilliseconds = aDate.getTimezoneOffset() * 60000;
	var intDateMilliseconds = aDate.getTime();
	intDateMilliseconds = intDateMilliseconds + intOsOffsetMilliseconds;

	aDate.setTime(intDateMilliseconds);

	return aDate;
}

//-- return gmt epoch
function _gmt_epoch(aDate)
{
	if(aDate==undefined)aDate = new Date();
	return parseInt(Date.UTC(aDate.getUTCFullYear(),aDate.getUTCMonth(),aDate.getUTCDate(),aDate.getUTCHours(),aDate.getUTCMinutes(),aDate.getUTCSeconds(),aDate.getUTCMilliseconds())/1000);
}

function _epoch_to_timestamp(intEpoch,boolUTC)
{
	if(boolUTC)
	{
		var aDate = _utcdate_from_epoch(intEpoch);
	}
	else
	{
		var aDate = _date_from_epoch(intEpoch);
	}
	return _date_to_timestamp(aDate);
}

function _date_to_utc_epoch(aDate)
{

	if(aDate==undefined) aDate=new Date();

	var intOsOffsetMilliseconds = aDate.getTimezoneOffset() * 60000;
	var intDateMilliseconds = aDate.getTime();
	intDateMilliseconds = intDateMilliseconds + intOsOffsetMilliseconds;
	return parseInt(intDateMilliseconds / 1000);
}

function _date_apply_offset(aDate,intOffsetSeconds)
{
	var intEpoch = _date_to_epoch(aDate);
	return _date_from_epoch(intEpoch,intOffsetSeconds);

}

function _date_to_utc_date(aDate)
{
	if(aDate==undefined)aDate = new Date();

	aDate.setFullYear(aDate.getUTCFullYear())
	aDate.setMonth(aDate.getUTCMonth())
	aDate.setDate(aDate.getUTCDate())
	aDate.setHours(aDate.getUTCHours())
	aDate.setMinutes(aDate.getUTCMinutes())
    return aDate;
}


//-- form date control changed
function onformdate_control_change(targetEle,intTime)
{
	if(targetEle.swfc!=undefined)
	{
		//-- a form control
		targetEle.swfc._oncalchange(intTime);
		return;
	}

	//-- some other type of date control i.e. call search
	var strFormatType = targetEle.getAttribute("formattype");
	if((strFormatType=="date")||(strFormatType==null))
	{
		return ondatechange_element(targetEle);
	}
	else if(strFormatType=="time")
	{
		return ontimechange_element(targetEle);
	}
	else
	{
	
		return ondatetimechange_element(targetEle);
	}

}

//-- given utc epoch set the display value optionally adjust for analyst offset
function set_datebox_epoch_displayvalue(oEle,strEpochValue,boolAnalystOffset)
{
	var intOffset = (boolAnalystOffset)?_analyst_timezoneoffset:0;
	var numEpochValue = new Number(strEpochValue);
	var intEpoch = numEpochValue + intOffset;

	//-- format settings
	var strFormat = oEle.getAttribute("format");
	if((strFormat==null)||(strFormat==""))
	{
		var strFormatType = oEle.getAttribute("formattype");
		if(strFormatType=="date")
		{
			var strFormat=app._analyst_dateformat;
		}
		else if(strFormatType=="time")
		{
			var strFormat=app._analyst_timeformat;
		}
		else
		{
			var strFormat=app._analyst_datetimeformat;
		}
	}

	//-- set element att and value
	var jsDate = _osdate_from_epoch(intEpoch);
	oEle.setAttribute("dbvalue",strEpochValue);
	oEle.value = _formatDate(jsDate,strFormat);
}


function get_displayvalueforfield_fromepochvalue(strEpochValue,strFormat,boolAnalystOffset)
{
	var intOffset = (boolAnalystOffset)?new Number(_analyst_timezoneoffset):0;
	var numEpochValue = new Number(strEpochValue);
	var intEpoch = numEpochValue + intOffset;

	//-- format settings
	strFormat = strFormat.toLowerCase();
	if(strFormat=="date")
	{
		strFormat=app._analyst_dateformat;
	}
	else if(strFormat=="time")
	{
		strFormat=app._analyst_timeformat;
	}
	else if(strFormat=="datetime")
	{
		strFormat=app._analyst_datetimeformat;
	}

	//-- set element att and value
	var jsDate = _osdate_from_epoch(intEpoch);
	if(boolAnalystOffset)jsDate=_date_to_utc_date(jsDate);

	return _formatDate(jsDate,strFormat);
}


function format_datestring(strDateString,strFormat)
{

	var jsDate = _parseDate(strDateString,strFormat);
	if(jsDate)
	{
		return _formatDate(jsDate,strFormat);
	}
	return strDateString;

}


//-- given string date set the display value optionally adjust for analyst offset
function set_datebox_string_displayvalue(oEle,strDateValue,boolAnalystOffset)
{
	//-- format settings
	var strFormat = oEle.getAttribute("format");
	if((strFormat==null)||(strFormat==""))
	{
		var strFormatType = oEle.getAttribute("formattype");
		if(strFormatType=="date")
		{
			var strFormat=app._analyst_dateformat;
		}
		else if(strFormatType=="time")
		{
			var strFormat=app._analyst_timeformat;
		}
		else
		{
			var strFormat=app._analyst_datetimeformat;
		}
	}

	if(strDateValue==undefined)strDateValue="";
	if(strDateValue=="")
	{
		var jsDate = new Date();
	}
	else
	{
		var jsDate = _parseDate(strDateValue,strFormat);
	}
	if(jsDate)
	{
		oEle.value = _formatDate(jsDate,strFormat);
		oEle.setAttribute("dbvalue",oEle.value);
	}
	else
	{
			alert("The provided date string was not recognised. Please contact your Administrator.");
	}
}


//--
//-- format value after user types it in
function ondatechange_element(targetEle,intTime)
{
	var strFormat = targetEle.getAttribute("format");
	if(strFormat==null||strFormat=="")strFormat=app._analyst_dateformat;

	var jsDate = _parseDate(targetEle.value,strFormat);
	if(jsDate)
	{
		//-- check if we need to sod or eod date
		//-- staore epoch value in dbvalue
		if(intTime==1)jsDate=_set_date_sod(jsDate);
		if(intTime==2)jsDate=_set_date_eod(jsDate);
		var intEpochValue = _date_to_utc_epoch(jsDate); //-- get epoch value

		targetEle.setAttribute("dbvalue",intEpochValue);
		targetEle.value = _formatDate(jsDate,strFormat);
	}
	else
	{
		if(targetEle.value=="")
		{
			targetEle.setAttribute("dbvalue","");
		}
		else
		{
			alert("The entered date format was not recognised. Please use the format [" + strFormat + "]");
			targetEle.value="";
		}
	}
	return jsDate;
}

//-- 
//-- format value after user types it in
function ondatetimechange_element(targetEle,intTime)
{
	var strFormat = targetEle.getAttribute("format");
	if(strFormat==null||strFormat=="")strFormat=app._analyst_datetimeformat;

	var jsDate = _parseDate(targetEle.value,strFormat);
	if(jsDate)
	{

		//-- check if we need to sod or eod date
		//-- staore epoch value in dbvalue
		if(intTime==1)jsDate=_set_date_sod(jsDate);
		if(intTime==2)jsDate=_set_date_eod(jsDate);
		var intEpochValue = _date_to_utc_epoch(jsDate); //-- get epoch value
		targetEle.setAttribute("dbvalue",intEpochValue);
		targetEle.value = _formatDate(jsDate,strFormat);
	}
	else
	{
		if(targetEle.value=="")
		{
			targetEle.setAttribute("dbvalue","");
		}
		else
		{
			alert("The entered date format was not recognised. Please use the format [" + strFormat + "]");
			targetEle.value="";
		}
	}
	return jsDate;
}


//-- given an element show date selector and then populate date element
//-- also format date to element date format setting - if not element date format use analysts format
function select_element_date(targetEle, epochDate)
{
	set_datebox_epoch_displayvalue(targetEle,epochDate,true);
	return;
}

function select_element_datetime(targetEle)
{
	set_datebox_epoch_displayvalue(targetEle,epochDate,true);
	return;
}

function popup_date_selected(targetEle,epochDate)
{
	set_datebox_epoch_displayvalue(targetEle,epochDate,true);
	return;
}



function todaysdatetime()
{
	var strFormat=app._analyst_datetimeformat;
	var jsDate = new Date();
	return _formatDate(jsDate,strFormat);
}

function todaysdate()
{
	var strFormat=app._analyst_dateformat;
	var jsDate = new Date();
	return _formatDate(jsDate,strFormat);
}

function format_analyst_datetime(aDate)
{
	var strFormat=app._analyst_datetimeformat;
	return _formatDate(aDate,strFormat);
}

function format_analyst_date(aDate)
{
	var strFormat=app._analyst_dateformat;
	return _formatDate(aDate,strFormat);
}

//-- DATE FORMATTING FUNCTION


// ===================================================================
// Author: Matt Kruse <matt@mattkruse.com>
// WWW: http://www.mattkruse.com/
//
// NOTICE: You may use this code for any purpose, commercial or
// private, without any further permission from the author. You may
// remove this notice from your final code if you wish, however it is
// appreciated by the author if at least my web site address is kept.
//
// You may *NOT* re-distribute this code in any way except through its
// use. That means, you can include it in your product, or your web
// site, or any other form where the code is actually being used. You
// may not put the plain javascript up on your site for download or
// include it in your javascript libraries for download. 
// If you wish to share this code with others, please just point them
// to the URL instead.
// Please DO NOT link directly to my .js files from your site. Copy
// the files to your server and use them there. Thank you.
// ===================================================================

// HISTORY
// ------------------------------------------------------------------
// May 17, 2003: Fixed bug in _parseDate() for dates <1970
// March 11, 2003: Added _parseDate() function
// March 11, 2003: Added "NNN" formatting option. Doesn't match up
//                 perfectly with SimpleDateFormat formats, but 
//                 backwards-compatability was required.

// ------------------------------------------------------------------
// These functions use the same 'format' strings as the 
// java.text.SimpleDateFormat class, with minor exceptions.
// The format string consists of the following abbreviations:
// 
// Field        | Full Form          | Short Form
// -------------+--------------------+-----------------------
// Year         | yyyy (4 digits)    | yy (2 digits), y (2 or 4 digits)
// Month        | MMM (name or abbr.)| MM (2 digits), M (1 or 2 digits)
//              | NNN (abbr.)        |
// Day of Month | dd (2 digits)      | d (1 or 2 digits)
// Day of Week  | EE (name)          | E (abbr)
// Hour (1-12)  | hh (2 digits)      | h (1 or 2 digits)
// Hour (0-23)  | HH (2 digits)      | H (1 or 2 digits)
// Hour (0-11)  | KK (2 digits)      | K (1 or 2 digits)
// Hour (1-24)  | kk (2 digits)      | k (1 or 2 digits)
// Minute       | mm (2 digits)      | m (1 or 2 digits)
// Second       | ss (2 digits)      | s (1 or 2 digits)
// AM/PM        | a                  |
//
// NOTE THE DIFFERENCE BETWEEN MM and mm! Month=MM, not mm!
// Examples:
//  "MMM d, y" matches: January 01, 2000
//                      Dec 1, 1900
//                      Nov 20, 00
//  "M/d/yy"   matches: 01/20/00
//                      9/2/00
//  "MMM dd, yyyy hh:mm:ssa" matches: "January 01, 2000 12:30:45AM"
// ------------------------------------------------------------------

var MONTH_NAMES=new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');
function LZ(x) {return(x<0||x>9?"":"0")+x}

// ------------------------------------------------------------------
// isDate ( date_string, format_string )
// Returns true if date string matches format of format string and
// is a valid date. Else returns false.
// It is recommended that you trim whitespace around the value before
// passing it to this function, as whitespace is NOT ignored!
// ------------------------------------------------------------------
function isDate(val,format) {
	var date=_getDateFromFormat(val,format);
	if (date==0) { return false; }
	return true;
	}

// -------------------------------------------------------------------
// compareDates(date1,date1format,date2,date2format)
//   Compare two date strings to see which is greater.
//   Returns:
//   1 if date1 is greater than date2
//   0 if date2 is greater than date1 of if they are the same
//  -1 if either of the dates is in an invalid format
// -------------------------------------------------------------------
function compareDates(date1,dateformat1,date2,dateformat2) {
	var d1=_getDateFromFormat(date1,dateformat1);
	var d2=_getDateFromFormat(date2,dateformat2);
	if (d1==0 || d2==0) {
		return -1;
		}
	else if (d1 > d2) {
		return 1;
		}
	return 0;
	}

// ------------------------------------------------------------------
// _formatDate (date_object, format)
// Returns a date in the output format specified.
// The format string uses the same abbreviations as in _getDateFromFormat()
// ------------------------------------------------------------------
function _formatDate(date,format) {
	format=format+"";
	var result="";
	var i_format=0;
	var c="";
	var token="";
	var y=date.getYear()+"";
	var M=date.getMonth()+1;
	var d=date.getDate();
	var E=date.getDay();
	var H=date.getHours();
	var m=date.getUTCMinutes();
	var s=date.getUTCSeconds();
	var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
	// Convert real date parts into formatted versions
	var value=new Object();
	if (y.length < 4) {y=""+(y-0+1900);}
	value["y"]=""+y;
	value["yyyy"]=y;
	value["yy"]=y.substring(2,4);
	value["M"]=M;
	value["MM"]=LZ(M);
	value["MMM"]=MONTH_NAMES[M-1];
	value["NNN"]=MONTH_NAMES[M+11];
	value["d"]=d;
	value["dd"]=LZ(d);
	value["E"]=DAY_NAMES[E+7];
	value["EE"]=DAY_NAMES[E];
	value["H"]=H;
	value["HH"]=LZ(H);
	if (H==0){value["h"]=12;}
	else if (H>12){value["h"]=H-12;}
	else {value["h"]=H;}
	value["hh"]=LZ(value["h"]);

	if (H>11){value["K"]=H-12;} else {value["K"]=H;}
	value["k"]=H+1;
	value["KK"]=LZ(value["K"]);
	value["kk"]=LZ(value["k"]);

	if (H > 11) 
	{ value["a"]="PM"; value["tt"]="PM"; }
	else { value["a"]="AM"; value["tt"]="AM";}
	value["m"]=m;
	value["mm"]=LZ(m);
	value["s"]=s;
	value["ss"]=LZ(s);

	while (i_format < format.length) 
	{
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length))
		{
			token += format.charAt(i_format++);
		}
		
		if (value[token] != null) 
		{ 
			result=result + value[token]; 
		}
		else 
		{ 
			result=result + token; 
		}
	}
	return result;
}
	
// ------------------------------------------------------------------
// Utility functions for parsing in _getDateFromFormat()
// ------------------------------------------------------------------
function _isInteger(val) {
	var digits="1234567890";
	for (var i=0; i < val.length; i++) {
		if (digits.indexOf(val.charAt(i))==-1) { return false; }
		}
	return true;
	}
function _getInt(str,i,minlength,maxlength) {
	for (var x=maxlength; x>=minlength; x--) {
		var token=str.substring(i,i+x);
		if (token.length < minlength) { return null; }
		if (_isInteger(token)) { return token; }
		}
	return null;
	}
	

function _getDateFromFormat(val,format) 
{
	val=val+"";
	format=format+"";
	var i_val=0;
	var i_format=0;
	var c="";
	var token="";
	var token2="";
	var x,y;
	var now=new Date();
	var year=now.getYear();
	var month=now.getMonth()+1;
	var date=1;
	var hh=now.getHours();
	var mm=now.getMinutes();
	var ss=now.getSeconds();
	var ampm="";


	while (i_format < format.length) {
		// Get next token from format string
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length)) 
		{
			token += format.charAt(i_format++);
		}

		// Extract contents of value based on format token
		if (token=="yyyy" || token=="yy" || token=="y") {
			if (token=="yyyy") { x=4;y=4; }
			if (token=="yy")   { x=2;y=2; }
			if (token=="y")    { x=2;y=4; }
			year=_getInt(val,i_val,x,y);

			if (year==null) { return 0; }
			i_val += year.length;
			if (year.length==2) {
				if (year > 70) { year=1900+(year-0); }
				else { year=2000+(year-0); }
				}
			}
		else if (token=="MMM"||token=="NNN"){
			month=0;
			for (var i=0; i<MONTH_NAMES.length; i++) {
				var month_name=MONTH_NAMES[i];
				if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
					if (token=="MMM"||(token=="NNN"&&i>11)) {
						month=i+1;
						if (month>12) { month -= 12; }
						i_val += month_name.length;
						break;
						}
					}
				}
			if ((month < 1)||(month>12)){return 0;}
			}
		else if (token=="EE"||token=="E"){
			for (var i=0; i<DAY_NAMES.length; i++) {
				var day_name=DAY_NAMES[i];
				if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
					i_val += day_name.length;
					break;
					}
				}
			}
		else if (token=="MM"||token=="M") {
			month=_getInt(val,i_val,token.length,2);
			if(month==null||(month<1)||(month>12)){return 0;}
			i_val+=month.length;}
		else if (token=="dd"||token=="d") {
			date=_getInt(val,i_val,token.length,2);
			if(date==null||(date<1)||(date>31)){return 0;}
			i_val+=date.length;}
		else if (token=="hh"||token=="h") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>12)){return 0;}
			i_val+=hh.length;}
		else if (token=="HH"||token=="H") 
		{
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>23)){return 0;}
			i_val+=hh.length;
		}
		else if (token=="KK"||token=="K") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>11)){return 0;}
			i_val+=hh.length;}
		else if (token=="kk"||token=="k") {
			hh=_getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>24)){return 0;}
			i_val+=hh.length;hh--;}
		else if (token=="mm"||token=="m") 
		{
			mm=_getInt(val,i_val,token.length,2);

			if(mm==null||(mm<0)||(mm>59)){return 0;}
			i_val+=mm.length;
		}
		else if (token=="ss"||token=="s") {
			ss=_getInt(val,i_val,token.length,2);
			if(ss==null||(ss<0)||(ss>59)){return 0;}
			i_val+=ss.length;}
		else if (token=="a" || token=="tt") {
			if (val.substring(i_val,i_val+2).toLowerCase()=="am") {ampm="AM";}
			else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {ampm="PM";}
			else {return 0;}
			i_val+=2;}
		else {
			if (val.substring(i_val,i_val+token.length)!=token) {return 0;}
			else {i_val+=token.length;}
			}
		}

	// If there are any trailing characters left in the value, it doesn't match
	if (i_val != val.length) { return 0; }
	// Is date valid for month?
	if (month==2) {
		// Check for leap year
		if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
			if (date > 29){ return 0; }
			}
		else { if (date > 28) { return 0; } }
		}
	if ((month==4)||(month==6)||(month==9)||(month==11)) {
		if (date > 30) { return 0; }
		}

	// Correct hours value
	if (hh<12 && ampm=="PM") 
	{ hh=hh-0+12; 
	}
	else if (hh>11 && ampm=="AM") 
	{ 
		hh-=12; 
	}
	

	var newdate=new Date(year,month-1,date,hh,mm,ss);

	return newdate.getTime();
	}

// ------------------------------------------------------------------
// _parseDate( date_string [, prefer_euro_format] )
//
// This function takes a date string and tries to match it to a
// number of possible date formats to get the value. It will try to
// match against the following international formats, in this order:
// y-M-d   MMM d, y   MMM d,y   y-MMM-d   d-MMM-y  MMM d
// M/d/y   M-d-y      M.d.y     MMM-d     M/d      M-d
// d/M/y   d-M-y      d.M.y     d-MMM     d/M      d-M
// A second argument may be passed to instruct the method to search
// for formats like d/M/y (european format) before M/d/y (American).
// Returns a Date object or null if no patterns match.
// ------------------------------------------------------------------
function _parseDate(val, strDateFormat) {
	
	var preferEuro=(arguments.length==2)?arguments[1]:false;
	generalFormats=new Array('d-M-y','d/M/y','y/M/d','y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','d-M-Y HH:mm','d/M/y HH:mm','y/M/d HH:mm','y-M-d HH:mm','MMM d, y HH:mm','MMM d,y HH:mm','y-MMM-d HH:mm','d-MMM-y HH:mm','MMM d HH:mm','d-M-y','d/M/y','y/M/d','y-M-d','MMM d, yyyy','MMM d,yyyy','yyyy-MMM-d','d-MMM-yyyy','MMM d','yyyy-M-d HH:mm:ss','d-M-YYYY HH:mm','d/M/yyyy HH:mm','yyyy/M/d HH:mm','yyyy-M-d HH:mm','MMM d, yyyy HH:mm','MMM d,yyyy HH:mm','yyyy-MMM-d HH:mm','d-MMM-yyyy HH:mm','d-M-YYYY HH:mm:ss','d/M/yyyy HH:mm:ss','MMM d, yyyy HH:mm:ss','MMM d,yyyy HH:mm:ss','yyyy-MMM-d HH:mm:ss','d-MMM-yyyy HH:mm:ss','d-MM-yyyy HH:mm:ss','dd-MM-yyyy HH:mm:ss','yyyy-MM-dd HH:mm:ss','yyyy-MM-dd HH:mm','yyyy-MM-dd','dd-MM-yyyy hh:mm:ss','dd-MM-yy hh:mm:ss','dd-MM-yy hh:mm','dd-MM-yy','M/d/yyyy H:mm tt','M/d/yyyy H:mm:ss tt','M/d/yyyy HH:mm:ss tt','M-d-yyyy H:mm tt','M-d-yyyy H:mm:ss tt','M-d-yyyy HH:mm:ss tt','MM/d/yyyy H:mm tt','MM/d/yyyy H:mm:ss tt','MM/d/yyyy HH:mm:ss tt','MM-d-yyyy H:mm tt','MM-d-yyyy H:mm:ss tt','MM-d-yyyy HH:mm:ss tt','MM/dd/yyyy H:mm tt','MM/dd/yyyy H:mm:ss tt','MM/dd/yyyy HH:mm:ss tt','MM-dd-yyyy H:mm tt','MM-dd-yyyy H:mm:ss tt','MM-dd-yyyy HH:mm:ss tt','M/dd/yyyy H:mm tt','M/dd/yyyy H:mm:ss tt','M/dd/yyyy HH:mm:ss tt','M-dd-yyyy H:mm tt','M-dd-yyyy H:mm:ss tt','M-dd-yyyy HH:mm:ss tt','dd/MM/yyyy H:mm tt','dd/MM/yyyy H:mm:ss tt','dd/MM/yyyy HH:mm tt','dd/MM/yyyy HH:mm:ss tt','dd-MM-yyyy H:mm tt','dd-MM-yyyy H:mm:ss tt','dd-MM-yyyy HH:mm tt','dd-MM-yyyy HH:mm:ss tt','dd-MM-yy HH:mm:ss tt','dd-MM-yy HH:mm tt','dd/MM/yy HH:mm:ss tt','dd/MM/yy HH:mm tt');
	monthFirst=new Array('M/d/y','M-d-y','M.d.y','MMM-d','M/d','M-d','M/d/y HH:mm','M-d-y HH:mm','M.d.y HH:mm','MMM-d HH:mm','M/d HH:mm','M-d HH:mm','M/d/yyyy','M-d-yyyy','M.d.yyyy','M/d/yyyy HH:mm','M/d/yyyy HH:mm','M/d/yyyy h:mm:ss tt','M-d-yyyy h:mm:ss tt','M.d.yyyy HH:mm');
	dateFirst =new Array('d/M/y','d-M-y','d.M.y','d-MMM','d/M','d-M','d-M-y','d/M/y HH:mm','d-M-y HH:mm','d.M.y HH:mm','d-MMM HH:mm','d/M HH:mm','d-M HH:mm','d-M-y HH:mm','d/M/yyyy','d-M-yyyy','d.M.yyyy','d-MMM','d/M','d-M','d-M-yyyy','d/M/yyyy HH:mm','d-M-yyyy HH:mm','d.M.yyyy HH:mm','d-MMM HH:mm','d/M HH:mm','d-M HH:mm','d-M-yyyy HH:mm','d/M/yyyy HH:mm:ss','d-M-yyyy HH:mm:ss','d.M.yyyy HH:mm:ss','d-MMM HH:mm:ss','d/M HH:mm:ss','d-M HH:mm:ss','d-M-yyyy HH:mm:ss');

	var checkList=new Array('generalFormats',preferEuro?'dateFirst':'monthFirst',preferEuro?'monthFirst':'dateFirst');
	var d=null;
	//var strDateFormat = undefined;
	if(strDateFormat!=undefined)
	{
				d=_getDateFromFormat(val,strDateFormat);
				if (d!=0) { return new Date(d); }
	}
	else
	{
		for (var i=0; i<checkList.length; i++) {
			var l=window[checkList[i]];
			for (var j=0; j<l.length; j++) {
				d=_getDateFromFormat(val,l[j]);
				if (d!=0) { return new Date(d); }
				}
			}
	}
	return null;
	
}




function clicked_datebox_trigger(oEle,e)
{
	return app._clicked_ele_trigger(oEle,e);
}
//-- create date picker
function trigger_datebox_dropdown(oEle,e, oJsDate)
{
	if(clicked_datebox_trigger(oEle,e))
	{
		var undefined;
		hide_form_element_date_picker(oEle,undefined,oJsDate);
		return app.stopEvent(e);
	}
	
}

//-- form date selected - get parent holder and element then set date of element
function _datecontrol_selectdate()
{
	var oDoc = app.getEleDoc(this);
	if(oDoc)
	{
		//oDoc['_datecontrol_clicked'] = true;

		var oHolder = oDoc.getElementById("__sw_element_date_picker");
		if(oHolder!=null)
		{
			var aDate= new Date();
			aDate.setYear(oHolder.getAttribute("showyear"));
			aDate.setMonth(oHolder.getAttribute("showmonth"));
			aDate.setDate(app.getElementText(this));
			var epochDate = app._date_to_epoch(aDate);

			if(oHolder.targetelement.swfc!=undefined)
			{
				oHolder.targetelement.swfc._value(epochDate,"",false,true);
			}
			else
			{
				var eDate = app.select_element_date(oHolder.targetelement, epochDate);

				if(oHolder.targetelement.onchangefunction)
				{

					oHolder.targetelement.onchangefunction(oHolder.targetelement,eDate,false);
				}
				else
				{

					process_form_date_control_changed(oHolder.targetelement,eDate);
				}
			}
			hide_form_element_date_picker(oHolder.targetelement,true);
		}
	}
}


function process_form_date_control_changed(oEle,newDate,tWindow)
{
	var oDoc = app.getEleDoc(oEle);

	//-- get date from value
	if(newDate==undefined)
	{
		newDate = app.onformdate_control_change(oEle);
		if(newDate==false)return false;
	}

	//-- check if want to set to start or end of day
	var intTime=oEle.getAttribute("settime");
	if(intTime==1)
	{
		newDate.setHours(0);
		newDate.setMinutes(0);
		newDate.setSeconds(0);
	}
	else if(intTime==2)
	{
		newDate.setHours(23);
		newDate.setMinutes(59);
		newDate.setSeconds(59);
	}

	//- set element date and epoch attribs so other funcs written by dev can use then if need be
	oEle.date = newDate;
	oEle.epoch = app._date_to_epoch(newDate);
	oEle.setAttribute("dbvalue",app._date_to_epoch(newDate));

	//-- if element has binding then set it
	var strBinding = oEle.getAttribute("binding");
	if((strBinding!="")&&(strBinding!=null))
	{
		var arrI = strBinding.split(".");
		if (oDoc[arrI[0]]!=undefined)
		{
			//-- call document level 
			oDoc[arrI[0]][arrI[1]]=epochDate;
			oDoc[arrI[0]].__changedvalues[arrI[1]] = epochDate;
			oDoc[arrI[0]].__modified = true;
		}
	}

}



//-- function to show or hide form date picker for an element
function hide_form_element_date_picker(oEle,boolHide,oJsDate)
{
	var undefined;
	var doc = app.getEleDoc(oEle);
	if(doc==null) return;
	if(boolHide==undefined)
	{
		var boolHidden = oEle.getAttribute("datehidden");
		if(boolHidden==null)boolHidden="true";
		if(boolHidden=="true")
		{
			boolHide=false;
			oEle.setAttribute("datehidden","false");
		}
		else
		{
			boolHide=true;
			oEle.setAttribute("datehidden","true");
		}
	}

	//-- check if we have date picker already
	var formDP = doc.getElementById("__sw_element_date_picker");
	var aShimmer = doc.getElementById("__sw_element_date_picker_shimmer");
	
	//-- 88552 - always run through create date picker function as it sets default values for month etc based on oJsDate
	//if(formDP==null)
	//{
		//-- need to create new date picker for form
		formDP = create_form_datepicker(doc,undefined,undefined,oJsDate);
		aShimmer = doc.getElementById("__sw_element_date_picker_shimmer");
	//}
	
	if(!boolHide)
	{
		var calOne = doc.getElementById("__sw_element_date_picker_1");
		if(calOne!=null)
		{
			if(oJsDate==null)
			{
				oJsDate = new Date();
			}
			_set_calendar_monthyear(calOne,oJsDate.getMonth(),oJsDate.getFullYear(),doc,oJsDate.getDate());
		}
	}

	//-- show hide datepicker
	formDP.style.display =(boolHide==true)?"none":"block";
	//-- have to use shimmer for IE6
	if(app.isIE6)aShimmer.style.display = formDP.style.display;

	if(!boolHide)
	{
		formDP.style.left = app.eleLeft(oEle);

		//-- if left and width is great than body
		var iRight = app.eleLeft(oEle) + formDP.offsetWidth;
		if(iRight > doc.body.offsetWidth)
		{
			var eRight = app.eleLeft(oEle) + oEle.offsetWidth;
			var iAdjust = iRight - eRight;
			formDP.style.left =  formDP.offsetLeft - iAdjust;
		}

		//-- if drop down will go off bottom of screen
		var iDropHeight = formDP.offsetHeight;
		var iDropBottom = iDropHeight + (oEle.offsetTop + oEle.offsetHeight);
		var iFormBottom = (app.isFirefox)?doc.body.clientHeight:doc.body.offsetHeight; //- (oEle.offsetTop + oEle.offsetHeight);
		if(iFormBottom<iDropBottom)
		{
			//-- show above
			formDP.style.top = app.eleTop(oEle) - iDropHeight - 1;
		}
		else
		{
			//-- show below
			formDP.style.top = app.eleTop(oEle) + oEle.offsetHeight + 1;
		}

		if(app.isIE6)
		{
			aShimmer.style.position='absolute';
			aShimmer.style.zIndex=999998;
			formDP.style.zIndex=999999;
			aShimmer.style.left=formDP.style.left;
			aShimmer.style.top=formDP.style.top;
			aShimmer.style.width=formDP.offsetWidth;
			aShimmer.style.height=formDP.offsetHeight;
		}

		formDP.targetelement = oEle;
	}
}

function create_form_datepicker(aDoc,monthtodo,yeartodo,oJsDate)
{
	//-- create cal holder if does not exist
	var boolFirstTime = false;
	var oHolder = aDoc.getElementById("__sw_element_date_picker");
	var	aDiv = aDoc.getElementById("__sw_element_date_picker_1");
	if(oHolder==null)
	{
		boolFirstTime = true;
		var strDivHolder = "<div id='__sw_element_date_picker' class='form_date_picker'><div id='__sw_element_date_picker_1'  class='date-calendar'  style='background-color:#ffffff;'></div></div><iframe id='__sw_element_date_picker_shimmer' src='' style='display:none;'></iframe>";
		app.insertBeforeEnd(aDoc.body,strDivHolder);
		oHolder = aDoc.getElementById("__sw_element_date_picker");
		aDiv = aDoc.getElementById("__sw_element_date_picker_1");	
	}

	if(oJsDate!=null)
	{
		oHolder.setAttribute("showyear",oJsDate.getFullYear());
		oHolder.setAttribute("showmonth",oJsDate.getMonth());
	}
	else
	{
		oHolder.setAttribute("showyear",app._getyear());
		oHolder.setAttribute("showmonth",app._getmonth());
	}


	//-- create header and body info
	if(boolFirstTime)
	{
		_create_datepicker_header(aDiv,true,aDoc);
		_create_datepicker_body(aDiv,aDoc);
	}
	//-- if want same month and year that is already set then do not process days
	var currmonthtodo = new Number(oHolder.getAttribute("showmonth"));
	var curryeartodo = new Number(oHolder.getAttribute("showyear"));
	//-- if not passed in month and year then use current.

	if(monthtodo==undefined)monthtodo=currmonthtodo;
	if(yeartodo==undefined)yeartodo=curryeartodo;

	if((!boolFirstTime)&&(currmonthtodo==monthtodo)&&(curryeartodo==yeartodo)) return oHolder;
	if (monthtodo > 12)
	{
		monthtodo = monthtodo - 12;
		yeartodo++;
	}

	oHolder.setAttribute("showyear",yeartodo);
	oHolder.setAttribute("showmonth",monthtodo);

	//_set_calendar_monthyear(aDiv,monthtodo,yeartodo,aDoc);

	return oHolder;
}

function _set_calendar_monthyear(oHolder,setmonth,setyear,aDoc, inthighlightDay)
{
	//var s = new Date().getTime();

	//-- set calendar header
	var oHeader = aDoc.getElementById(oHolder.parentNode.id + "_monthyeartext");
	app.setElementText(oHeader, app.month[setmonth] + " " + setyear);

	//-- set date month and year
	var usedate = new Date();
	usedate.setYear(setyear);
	usedate.setMonth(setmonth);
	usedate.setDate(1);

	var currmonth = usedate.getMonth();
	var checkmonth = usedate.getMonth();

	var lastweek=1;
	var x=2;

	//-- find out if we need to highlight day
	var tmpDate = new Date();
	var highlightday = false;
	var thisyear = tmpDate.getFullYear();
	if ((setmonth == tmpDate.getMonth())&&(setyear == thisyear)){highlightday=true;}

	//-- clear down calendar cells
	var oTable = aDoc.getElementById(oHolder.parentNode.id + '_tbl_days');
	for(var z=0;z<oTable.rows.length;z++)
	{
		for(var zz=0;zz<oTable.rows[z].cells.length;zz++)
		{
			var oCell = oTable.rows[z].cells[zz];
			if(oCell)
			{
				app.removeEvent(oCell,"click",_datecontrol_selectdate);
				//-- clear cell display properties
				app.setElementText(oCell,"");
				oCell.style.background = "#ffffff";
			}
		}
	}



	var currday = usedate.getDay();
	var currweek = app._getweek(usedate);
	_set_calendarday(currweek-1, currday-1, 1,oHolder,highlightday,setmonth,setyear,aDoc,inthighlightDay);
					
	while(checkmonth == currmonth)
	{
		usedate.setDate(x);
		//--check which week we are on
		var currweek = app._getweek(usedate);

		//-- we have moved onto an new month
		if (lastweek > currweek) break;
		lastweek = currweek;

		//--put x in this table cell, for current week
		currday = usedate.getDay();
		_set_calendarday(currweek-1, currday, x,oHolder,highlightday,setmonth,setyear,aDoc,inthighlightDay);
		checkmonth = usedate.getMonth();
		x++;
	}
			
	//var e = new Date().getTime();
	//app.debug((e-s) + " ms","set_calendar_monthyear","COMPLETED");


}

function _set_calendarday(in_week, in_daypos, in_day,in_oHolder,hilighttoday,in_month,in_year,aDoc, inthighlightDay)
{
	var undefined;
	//var s = new Date().getTime();

	if (in_daypos == -1) 
	{
		in_daypos = 6;
	}


	var oTable = aDoc.getElementById(in_oHolder.parentNode.id + '_tbl_days');
	var oCell = oTable.rows[in_week].cells[in_daypos];
		//app.get_parent_child_by_id(in_oHolder,'tbl_days').rows[in_week].cells[in_daypos];

	//-- cell methods (bespoke)
	app.addEvent(oCell,"click",_datecontrol_selectdate);

	//-- cell display properties
	app.setElementText(oCell,in_day);
	oCell.style.color	= "#000000";
	oCell.style.background = "#ffffff";
	if (hilighttoday) 
	{
		//-- if todays date then highlight
		var tmpdate = new Date();
		var today = tmpdate.getDate();
		if (today == in_day)
		{
			oCell.style.color	= "#ffffff";
			oCell.style.background = "navy";
		}
	}

	if(inthighlightDay!=undefined && oCell.style.background!="navy")
	{
		//-- 27.04.2011
		//-- if we have a highlighted day already then select it
		if (inthighlightDay == in_day)
		{
			oCell.style.color	= "#ffffff";
			oCell.style.background = "#8CB1E5";
		}
	}
		
	//var e = new Date().getTime();
	//app.debug((e-s) + " ms","set_calendar_day","COMPLETED");

}


function _create_datepicker_body(objDivholder)
{
	var strHTML = "";		
	//--- table holding the days headers 
	strHTML += '<table id="'+objDivholder.parentNode.id+'_daysheader" width="150px" border="0" cellspacing="0" cellpadding="0" class="daysheader" align=center >';
	strHTML += '<tr height="15px" >';
		strHTML += '<td class="daycell" valign="bottom" align="right">M</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">T</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">W</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">T</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">F</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">S</td>';
		strHTML += '<td class="daycell" valign="bottom" align="right">S</td>';
	strHTML += '</tr>';
	strHTML += '</table>';

	//--- table holding the actual days  (160px)
	strHTML += '<table id="'+objDivholder.parentNode.id +'_tbl_days" width="150px" border="0" cellspacing="0" cellpadding="0" class="daysholder"  align="center">';

	for (var x = 0 ; x < 6; x++)
	{
		strHTML += '<tr>';
			strHTML += '<td class="daycell" valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
			strHTML += '<td class="daycell"  valign="middle" align="right" ></td>';
		strHTML += '</tr>';
	}
	strHTML += '</table>';

	//-- write html to div
	app.insertBeforeEnd(objDivholder,strHTML);
}


function _create_datepicker_header(objDivholder , control_arrows)
{
	var strHTML = "";
	strHTML += '<table id="monthyear" width="150px" border="0" cellspacing="0" cellpadding="0" class="monthyear">';
	strHTML += '	<tr height="16px">';
	if (control_arrows) strHTML += '		<td class="calendar-leftarrow" onclick="app._datecontrol_previous_month(this);">&nbsp;&nbsp;&nbsp;&nbsp;</td>';
	strHTML += '		<td valign="middle"  align="middle" width="100%" id="'+objDivholder.parentNode.id+'_monthyeartext" class="monthyeartext"></td>';
	if (control_arrows) strHTML += '		<td class="calendar-rightarrow" onclick="app._datecontrol_next_month(this);">&nbsp;&nbsp;&nbsp;&nbsp;</td>';
	strHTML += '	</tr>';
	strHTML += '</table>';
	//-- write html to div
	app.insertBeforeEnd(objDivholder,strHTML);

}

function _datecontrol_previous_month(oTD)
{
	var aDoc = app.getEleDoc(oTD);
	aDoc['_datecontrol_clicked'] = true;

	var oHolder = aDoc.getElementById("__sw_element_date_picker");
	var aDiv = aDoc.getElementById("__sw_element_date_picker_1");


	var yeartodo = oHolder.getAttribute("showyear");
	var monthtodo = oHolder.getAttribute("showmonth");
	monthtodo--;
	if (monthtodo < 0)
	{
		monthtodo = 11;
		yeartodo--;
	}
	_set_calendar_monthyear(aDiv,monthtodo,yeartodo,aDoc);

	oHolder.setAttribute("showyear",yeartodo);
	oHolder.setAttribute("showmonth",monthtodo);
}

function _datecontrol_next_month(oTD)
{
	var aDoc = app.getEleDoc(oTD);
	aDoc['_datecontrol_clicked'] = true;

	var oHolder = aDoc.getElementById("__sw_element_date_picker");
	var aDiv = aDoc.getElementById("__sw_element_date_picker_1");


	var yeartodo = oHolder.getAttribute("showyear");
	var monthtodo = oHolder.getAttribute("showmonth");
	monthtodo++;
	if (monthtodo > 11)
	{
		monthtodo = 0;
		yeartodo++;
	}
	_set_calendar_monthyear(aDiv,monthtodo,yeartodo,aDoc);

	oHolder.setAttribute("showyear",yeartodo);
	oHolder.setAttribute("showmonth",monthtodo);
};;;;var undefined;
var _XML_TEXT_NODE = 3;
var isIE  = (window.ActiveXObject);

var TEXTBOX		= "textbox";
var DATEBOX		= "datebox";
var COMBOBOX	= "combobox";
var BUTTON		= "button";
var MNUBUTTON	= "mnubutton";
var RADIOBOX	= "radiobox";
var FORMFLAG	= "formflag";
var TEXTAREA	= "textarea";
var LABEL		= "label";
var IMAGE		= "image";
var DIVFRAME	= "divframe";
var TABCONTROL	= "tabcontrol";
var SQLLIST 	= "sqllist";
var FILELIST 	= "filelist";
var SQLLISTCOL 	= "sqllistcol";
var FILELISTCOL = "filelistcol";
var FILEUP		= "fileupload";

function jqueryify(element,docLevel)
{
	if(docLevel)return $(element,docLevel);
	else return $(element);
	
}

function get_style(element,strStyleName)
{
	//-- convert to readable style
	var strStyleName = top.toStyleCase(strStyleName);
	var value = element.style[strStyleName];

	if(!value)
	{
		if(document.defaultView)
		{
			value = document.defaultView.getComputedStyle(element, "").getPropertyValue(strStyleName);
		}
		else if(element.currentStyle)
		{
			value = element.currentStyle[strStyleName];
		}
	}

	var retValue = new String(value);
	if (retValue.indexOf("px")!=-1) retValue = top.strreplace(retValue,"px","",true);

	//-- return style value (remove any px from value)
	return retValue;
}


function hasClass(element,strClass) {
    return element.className.match(new RegExp('(\\s|^)'+strClass+'(\\s|$)'));
}

function addClass(element,strClass) {
    if (!hasClass(element,strClass)) element.className += " "+strClass;
}

function removeClass(element,cls) {
    if (hasClass(element,strClass)) {
        var reg = new RegExp('(\\s|^)'+strClass+'(\\s|$)');
        element.className=element.className.replace(reg,' ');
    }
}


function gn(oParent,strName)
{
	var arrChildren = new Array();
	for (var x=0;x< oParent.children.length;x++)
	{
		aChild = oParent.children[x];
		if (aChild.name == strName) arrChildren[arrChildren.length++] = aChild;
	}
	return arrChildren;
}

//-- Converts string input to a camel cased version of itself.
//-- For example:	toStyleCase("z-index"); returns "zIndex"
//--				toStyleCase("border-bottom-style"); returns "borderBottomStyle"
function toStyleCase(s) 
{
	for(var exp = toStyleCase.exp; exp.test(s); s = s.replace(exp, RegExp.$1.toUpperCase()) );
	return s;
}
toStyleCase.exp = /-([a-z])/;

function _print_url(strURL)
{
	var aWin = null;
	if(app._CURRENT_JS_WINDOW!=null)
	{
		aWin = app._CURRENT_JS_WINDOW.open(strURL,"","width=800,height=600,top=5,left=5,location=0,status=0,resizable=1,scrollbars=1,menubar=0");
	}
	else
	{
		aWin = window.open(strURL,"","width=800,height=600,top=5,left=5,location=0,status=0,resizable=1,scrollbars=1,menubar=0");
	}
}

//--
//-- given a string parse out any js variables
var VAR_START = "@@";
var VAR_END = "@@";
function parsejsstr(strParse)
{

	if(strParse==undefined)return "";
	var startPos = strParse.indexOf(VAR_START);
	
	while (startPos != -1)
	{
		cutString = strParse.substring(startPos,strParse.length);
		endPos = cutString.indexOf(VAR_END,2);
	
		strFullVariable = cutString.substring(0,endPos+2);
		strValVariable = cutString.substring(2,endPos);
		strActualValue = eval(strValVariable);
		strParse = string_replace(strParse, strFullVariable,strActualValue,true);
		
		startPos = strParse.indexOf(VAR_START);
	}
	return strParse;
}

//-- string replace
function string_replace(strText,strFind,strReplace,boolGlobalreplace)
{
	if (strText==undefined) return "";
	if (!isNaN(strText)) return strText;

	if(strFind==".")
	{
		if(boolGlobalreplace)
			var useregex =/[.\s]+/g;
		else
			var useregex =/[.\s]+/;
			
		return strText.replace(useregex, strReplace);
	}
	//-- replace all occs of strFind and ignore case (gi)
	var flags = (boolGlobalreplace)?"gi":"i";
	try
	{
		//-- IE 6 issue with smart quotes
		var rExp = new RegExp(strFind,flags);
		return strText.replace(rExp, strReplace);
	}
	catch(e)
	{
		return strText;
	}
}
//--

//-- return an elements document
function getEleDoc(ele)
{
	var aDoc = ele.document;
	if((aDoc!=undefined)) return aDoc;

    while (ele && ele.nodeType!= 9) ele= ele.parentNode;
    return ele;
}

//-- get document element return object or null
function ge(strID, aDoc)
{
	if(aDoc==undefined)aDoc=document;
	return document.getElementById(strID);
}

//-- set innert text and textContent (mozilla etc)
function setElementText(oEle,strText)
{
	if(oEle==null)return;
	oEle.innerText = oEle.textContent = strText;
}

function getElementText(oEle)
{
	if(oEle==null)return;
	if(oEle.textContent)return oEle.textContent; //-- mozilla etc
	if(oEle.innerText)return oEle.innerText;
}



function toggleDisabled (el, boolDisable) 
{
	if(boolDisable==undefined)boolDisable=true;
	try 
	{
		el.disabled = boolDisable;                
		//el.setAttribute("wcdisabled",boolDisable);
	}
	catch(e){}


	//if (el.childNodes && el.childNodes.length > 0) 
	//{
	//	for (var x = 0; x < el.childNodes.length; x++) 
	//	{
	//		toggleDisabled(el.childNodes[x],boolDisable);                    
	//	}
	//}

}



function toggleReadOnly(el, boolDisable) 
{
	if(boolDisable==undefined)boolDisable=true;
	try 
	{
		el.readOnly = boolDisable;                
	}
	catch(e){}
	if (el.childNodes && el.childNodes.length > 0) 
	{
		for (var x = 0; x < el.childNodes.length; x++) 
		{
			toggleReadOnly(el.childNodes[x],boolDisable);                    
		}
	}
}


//-- return frame
function getFrame(strFrameName, aDoc)
{
	if(aDoc==undefined)aDoc = document;
	f = aDoc.frames ? aDoc.frames[strFrameName] : aDoc.getElementById(strFrameName).contentWindow;
	return f;
}

//-- return frame document so can call function in it
function getFrameDoc(strFrameName, aDoc)
{
	var f = getFrame(strFrameName, aDoc);
	var d = f.document || f.contentWindow.document;
	return d;
}

//-- return frame document so can call function in it
function getoFrameDoc(f)
{
	var d = f.document || f.contentWindow.document;
	return d;
}


function has_scrollbar(oEle) 
{ 
   return (oEle.clientHeight < oEle.scrollHeight);
} 


//--
//-- return page size with or without scroll taking into consideration
function getPageSize(boolWithScroll,oDoc)
{     
	if(oDoc==undefined)oDoc = document;

	var win = window;

	var intWidth = 0;
	var intHeight = 0;

	if(boolWithScroll==undefined)boolWithScroll=false;
	if (win.innerHeight && win.scrollMaxY) 
	{
		//-- Firefox         
		var intScrollY = (boolWithScroll)?win.scrollMaxY:0;
		var intScrollX = (boolWithScroll)?win.scrollMaxX:0;
		intHeight = win.innerHeight + intScrollY;
		intWidth = win.innerWidth + intScrollX;     
	} 
    if (oDoc.body.scrollHeight > oDoc.body.offsetHeight)
	{ 
		//-- all but Explorer Mac         
		if(boolWithScroll)
		{
			intHeight = oDoc.body.scrollHeight;         
			intWidth = oDoc.body.scrollWidth;     
		}
		else
		{
			intHeight = oDoc.body.offsetHeight;         
			intWidth = oDoc.body.offsetWidth;       
		}
	} 
	else 
	{ 
		//-- works in Explorer 6 Strict, Mozilla (not FF) and Safari         
		intHeight = oDoc.body.offsetHeight;         
		intWidth = oDoc.body.offsetWidth;       
	}     
	
	var info = new Object();
	info.width = intWidth;
	info.height = intHeight;
	return info;
} 

function addEvent( obj, type, fn ) 
{
	if ( obj.attachEvent ) 
	{
		obj['e'+type+fn] = fn;
	    obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
		obj.attachEvent( 'on'+type, obj[type+fn] );
	}
	else
	{
		obj.addEventListener( type, fn, false );
	}
}
function removeEvent( obj, type, fn ) {
	try
	{
	  if ( obj.detachEvent ) {
		obj.detachEvent( 'on'+type, obj[type+fn] );
		obj[type+fn] = null;
	  } else
		obj.removeEventListener( type, fn, false );
		
	}
	catch (e)
	{
	}
}

function getEvent(anE,aWin)
{
	if(aWin==undefined)aWin=window;
	if((anE==null)||(anE==undefined))anE = aWin.event;
	return anE;
}


function fireEvent(element,event,aDoc)
{
	if(aDoc==undefined)aDoc=document;
    if (aDoc.createEventObject)
	{
        // dispatch for IE
        var evt = aDoc.createEventObject();
        return element.fireEvent('on'+event,evt)
    }
    else
	{
        // dispatch for firefox + others
        var evt = aDoc.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}


//-- get elemen that mouse vent came from
function getMouseFromElement(e) 
{
	if (!e) var e = window.event;
	var relTarg = e.relatedTarget || e.fromElement;
	return relTarg;
}

//-- get element that mouse event is going to
function getMouseToElement(e) 
{
	if (!e) var e = window.event;
	var relTarg = e.relatedTarget || e.toElement;
	return relTarg;
}

//--
//-- get event source element
function getEventSourceElement(anE)
{
	if((anE==null)||(anE==undefined))anE = window.event;
	if (anE.target) 
	{
		return anE.target;     //-- moz
	}
	else if (anE.srcElement) 
	{
		return anE.srcElement; //-- ie
	}
	return null;
}

//-- get event key press
function getKeyChar(intKeyCode) 
{
	return String.fromCharCode(intKeyCode);
}

//-- get event key press
function getKeyCode(anE) 
{
	if (anE.keyCode) 
	{
		var key = anE.keyCode;
	} 
	else 
	{
		var key = anE.charCode; //-- moz
	}
	
	return key;
}


//--
//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by tag (TABLE / TR / DIV / BODY etc)
function get_parent_owner_by_tag(oEle, strTag)
{
	if (oEle.parentNode)
	{
		if (oEle.parentNode.tagName==strTag) return oEle.parentNode;
		return get_parent_owner_by_tag(oEle.parentNode, strTag);
	}
	return null;
}

//- -get parent by class
function get_parent_owner_by_class(oEle, strClass)
{
	if (oEle.parentNode)
	{
		if (oEle.parentNode.className==strClass) return oEle.parentNode;
		return get_parent_owner_by_class(oEle.parentNode, strClass);
	}
	return null;
}


//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by att 
function get_parent_owner_by_att(oEle, strAtt)
{
	if(oEle.getAttribute==undefined)return null;

	if (oEle.getAttribute(strAtt)!=null) return oEle;

	if (oEle.parentNode)
	{
		return get_parent_owner_by_att(oEle.parentNode, strAtt);
	}
	return null;
}

//-- 16.02.2006 - NWJ
//-- return parent owner of an element identified by id
function get_parent_owner_by_id(oEle, strID)
{
	if (oEle.id==strID) return oEle;

	if (oEle.parentNode)
	{
		return get_parent_owner_by_id(oEle.parentNode, strID);
	}
	return null;
}

//-- 16.02.2006 - NWJ
//-- return child of parent by id
function get_parent_child_by_id(oEle, strID)
{
	if (oEle==null) return null;
	if (oEle.id==strID) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].id==strID)return oEle.childNodes[x];
		var testEle = get_parent_child_by_id(oEle.childNodes[x], strID);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}

//-- 16.02.2006 - NWJ
//-- return child of parent by name
function get_parent_child_by_name(oEle, strID)
{
	if (oEle==null) return null;
	if (oEle.id==strID) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].name==strID)return oEle.childNodes[x];
		var testEle = get_parent_child_by_name(oEle.childNodes[x], strID);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}



//-- 16.02.2006 - NWJ
//-- return child of parent by class
function get_parent_child_by_class(oEle, strID)
{
	if (oEle==null) return null;
	if (oEle.className==strID) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].className==strID)return oEle.childNodes[x];
		var testEle = get_parent_child_by_class(oEle.childNodes[x], strID);
		if(testEle!=null)
		{
			return testEle;
		}

	}
	return null;
}


//-- 16.02.2006 - NWJ
//-- return child of an element identified by tag (TABLE / TR / DIV / BODY etc)
function get_parent_child_by_tag(oEle, strTag)
{
	if (oEle.tagName==strTag) return oEle;

	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].tagName==strTag)return oEle.childNodes[x];
		var testEle = get_parent_child_by_tag(oEle.childNodes[x], strTag);
		if(testEle!=null)
		{
			return testEle;
		}

	}

	return null;
}


//-- 28.04.2009 - NWJ
//-- return array children of parent by class
var g_children_by_att = new Array();
function get_children_by_att(oEle, strAtt, boolToplevelOnly)
{
	g_children_by_att = new Array();
	process_get_children_by_att(oEle, strAtt,boolToplevelOnly);
	return g_children_by_att;
}

function process_get_children_by_att(oEle, strAtt,boolToplevelOnly)
{
	if(boolToplevelOnly==undefined)boolToplevel=false;
	if (oEle==null) return null;
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].getAttribute==undefined)continue;

		try
		{
			var strAttVal = oEle.childNodes[x].getAttribute(strAtt);
			if (strAttVal!=null) g_children_by_att[g_children_by_att.length++] = oEle.childNodes[x];
		}catch(e){}

		//-- if we want all children then process
		if(!boolToplevelOnly)process_get_children_by_att(oEle.childNodes[x],strAtt);

	}
}


//-- 28.04.2009 - NWJ
//-- return array children of parent by class
var g_children_by_att = new Array();
function get_children_by_att_value(oEle, strAtt, strValue,boolToplevelOnly)
{
	g_children_by_att = new Array();
	strValue=strValue+"";
	process_get_children_by_att_value(oEle, strAtt, strValue.toLowerCase(),boolToplevelOnly);
	return g_children_by_att;
}

function process_get_children_by_att_value(oEle, strAtt, strValue,boolToplevelOnly)
{
	if (oEle==null) return null;
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		if(oEle.childNodes[x].getAttribute==undefined)continue;
		try
		{
			if (oEle.childNodes[x].getAttribute(strAtt)==strValue)
			{
				g_children_by_att[g_children_by_att.length++] = oEle.childNodes[x];
			}
		}catch(e){}

		//-- if we want all children then process
		if(!boolToplevelOnly)
		{
			process_get_children_by_att_value(oEle.childNodes[x],strAtt, strValue,boolToplevelOnly);
		}
	}

}

//-- 28.04.2009 - NWJ
//-- return array children of parent by tagname
var g_children_by_tag = new Array();
function get_children_by_tag(oEle, strTag,boolToplevelOnly)
{
	g_children_by_tag = new Array();
	process_get_children_by_tag(oEle, strTag,boolToplevelOnly);
	return g_children_by_tag;
}

function process_get_children_by_tag(oEle, strTag,boolToplevelOnly)
{
	if (oEle==null) return null;
	for(var x=0;x<oEle.childNodes.length;x++)
	{
		try
		{
			if (oEle.childNodes[x].tagName==strTag)
			{
				g_children_by_tag[g_children_by_tag.length++] = oEle.childNodes[x];
			}
		}catch(e){}

		//-- if we want all children then process
		if(!boolToplevelOnly)
		{
			process_get_children_by_tag(oEle.childNodes[x],strTag,boolToplevelOnly);
		}
	}

}

function removeChildNodes(ctrl)
{  
	while (ctrl.childNodes[0])  
	{    
		ctrl.removeChild(ctrl.childNodes[0]);  
	}
}


//-- Creates and returns element from html chunk
function toElement(d,html)
{
	var div = d.createElement('div');
	div.innerHTML = html;
	var el = div.childNodes[0];
	div.removeChild(el);
	return el;
}


//-- 04.06.2004 - NWJ - given node and html insert that html into the node (used for creating elements)
function insertBeforeEnd(node,html)
{

	if(node.insertAdjacentHTML)
	{
		node.insertAdjacentHTML('beforeEnd', html);		
	}
	else
	{
		//--
		//-- netscape way of inserting html ()
		var r = node.ownerDocument.createRange();
		r.setStartBefore(node);
		var parsedHTML = r.createContextualFragment(html);
		node.appendChild(parsedHTML);
	}

	return node.lastChild;
}


//--
//-- get element true position regardless of positioning type
function getRealPosition(obj) 
{
	var origObj = obj;
	var curleft = curtop = 0;
	if (obj.offsetParent) 
	{
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) 
		{
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	origObj.realLeft = curleft;
	origObj.realTop = curtop;
	return origObj;
}

//-- Determines if the passed element is overflowing its bounds, 
function isOverflowing(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var bOverflowing = el.offsetWidth < el.scrollWidth || el.offsetHeight < el.scrollHeight; 
   el.style.overflow = curOverflow; 
 
   return bOverflowing; 
} 

//-- 
function isWidthOverflowing(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var bOverflowing = el.offsetWidth < el.scrollWidth; 
  // alert(el.offsetWidth +" < "+ el.scrollWidth )
   el.style.overflow = curOverflow; 
    return bOverflowing; 
} 

//-- 
function isHeightOverflowing(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var bOverflowing = el.offsetHeight < el.scrollHeight; 
   el.style.overflow = curOverflow; 
   return bOverflowing; 
} 

function getOverflowWH(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var intWidth = (el.offsetWidth - el.scrollWidth); 
   var intHeight = (el.offsetHeight - el.scrollHeight); 

   el.style.overflow = curOverflow; 
   var a = new Object();
   a.width= intWidth;
   a.height = intHeight;
   return a;

}

function getOverflowWidth(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var intWidth = (el.scrollWidth-el.offsetWidth); 

   el.style.overflow = curOverflow; 
   return intWidth;
} 

function getOverflowHeight(el) 
{ 
   var curOverflow = el.style.overflow; 
   if ( !curOverflow || curOverflow === "visible" )el.style.overflow = "hidden"; 
   var intHeight = (el.scrollHeight-el.offsetHeight); 

   el.style.overflow = curOverflow; 
   return intHeight;
} 

function eleTop(obj) 
{
	var curtop = 0;
	if (obj.offsetParent) 
	{
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) 
		{
			curtop += obj.offsetTop;
		}
	}
	curtop--;curtop++;
	return  curtop;
}


function eleHeight(obj)
{
	if(obj.clientHeight)return obj.clientHeight;
	return obj.offsetHeight;
}

function eleLeft(obj) 
{
	var curleft = 0;
	if (obj.offsetParent) 
	{
		curleft = obj.offsetLeft
		while (obj = obj.offsetParent) 
		{
			curleft += obj.offsetLeft
		}
	}
	curleft--;curleft++;
	return  curleft;
}


function boolMouseRightClick(e)
{
	if(e==undefined)return false;
	var rightclick = 0;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	return rightclick;
}

function boolMouseLeftClick(e)
{
	if(e==undefined)return false;
	var leftclick = 0;
	if (e.which) leftclick = (e.which == 0);
	else if (e.button) leftclick = (e.button == 1);
	return leftclick;
}


function findMousePos(oEv)
{
	if (!oEv) var oEv = window.event; //-- ie
	if(oEv==null)return[0,0];
	var posx = 0;
	var posy = 0;
	if (oEv.pageX || oEv.pageY) 	
	{
		var intLeft = oEv.pageX;
		var intTop = oEv.pageY;
	}
	else if (oEv.clientX || oEv.clientY) 	
	{
		var intLeft = oEv.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		var intTop = oEv.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return [intLeft,intTop];
}

function disableSelection(target, boolChildren)
{
	if(target==null)return;
	if (typeof target.onselectstart!="undefined") //IE route
	{
		try{
		target.onselectstart=function(){return false}
		}catch(e){}
	}
	else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
	{
		target.style.MozUserSelect="none";
	}
	else //All other route (ie: Opera)
	{
		target.onmousedown=function(){return false}
	}
	//target.style.cursor = "default"
	if(boolChildren==undefined)boolChildren=false;
	if(boolChildren)
	{
		if (target.childNodes && target.childNodes.length > 0) 
		{
			for (var x = 0; x < target.childNodes.length; x++) 
			{
				disableSelection(target.childNodes[x],boolChildren);                    
			}
		}
	}
}

function _rf()
{
	return false;
}

function ev_target(e)
{
	if (!e) var e = window.event;
	var relTarg = e.relatedTarget || e.toElement;
	return relTarg;
}

function ev_source(e)
{
	var targ;
	if (!e) var e = window.event;
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;

	return targ;
}

function ev_coords(e)
{
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	
	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	
	{
		posx = e.clientX + document.body.scrollLeft	+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
	return [posx,posy];
}

//-- find element pos
function findPos(obj) 
{
	var curleft = curtop = 0;
	if (obj.offsetParent) 
	{
		do 
		{
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

//-- find element pos
function getParentByTag(obj,strTag) 
{
	if (obj.offsetParent) 
	{
		do 
		{
			if ((obj.offsetParent)&&(obj.offsetParent.tagName == strTag))return obj.offsetParent;
		} while (obj = obj.offsetParent);
	}
	return null;
}


//-- call function to prepare data for url
function pfu(strVal)
{
	return encodeURIComponent(replaceSQ(strVal));
}

//-- defect 80069 - replace smart quotes
function replaceSQ(strValue)
{
	strValue = string_replace(strValue,"",'"',true);
	strValue = string_replace(strValue,"",'"',true);
	strValue = string_replace(strValue,"","'",true);
	strValue = string_replace(strValue,"","'",true);
	return strValue;
}

function getEleVisualValue(oEle)
{
	return getEleValue(oEle,true)
}
//-- setting and getting element values
function getEleValue(oEle,boolVisualOnly)
{
	if(boolVisualOnly==undefined)boolVisualOnly=false;
	var strTag = oEle.tagName;


	if(oEle.getAttribute("hint")==oEle.value)return "";

	var strFormType = oEle.getAttribute("formtype");
	switch (strTag)
	{
		case "INPUT":
			var strType = oEle.type;
			var strDBVal = (boolVisualOnly)?null:oEle.getAttribute("dbvalue");
			if(oEle.getAttribute("donotusedbvalue")=="true") strDBVal=null;

			switch (strType.toLowerCase())
			{
				case "hidden":
				case "input":
				case "text":
				case "password":

					return (strDBVal==null)?oEle.value:strDBVal;
				case "radio":
				case "checkbox":
					
					if (oEle.checked)
					{
						return (strDBVal==null)?oEle.value:strDBVal;
					}
					else
					{
						return "";
					}
					break;
			}			
			break;
		case "SELECT":
			if(oEle.selectedIndex<0)return "";
			//-- check if multiple
			if(oEle.getAttribute('multiple')==true)
			{
				var strRet = "";
				for(var x=0;x<oEle.options.length;x++)
				{
					if(oEle.options[x].selected)
					{
						if(strRet !="")strRet +=",";
						if(boolVisualOnly)
						{
							strRet += oEle.options[x].text;
						}
						else
						{
							strRet += oEle.options[x].value;
						}
					}
				}
				return strRet;
			}
			else
			{
				if(boolVisualOnly)
				{
					return oEle.options[oEle.selectedIndex].text;
				}
				else
				{
					return oEle.options[oEle.selectedIndex].value;
				}
			}
			break;
		case "TEXTAREA":
			return oEle.value;
			break;
		case "SPAN":
		case "DIV":
		case "P":
			if(oEle.getAttribute("formtype")==FORMFLAG)
			{
				var strDBVal = oEle.getAttribute("dbvalue");
				if(strDBVal!=null && strDBVal!="")return strDBVal; //-- form flags
				return 0;
			}
			return getElementText(oEle);
			break;
	}
	debug("app.dhtml.js : getEleValue - cannot get element value for tag " + strTag);
}


function isDecimal(value,min,max) 
{   //Accepts number with decimal but it must have at least the min and at most the max places after the decimal  

	if(min==undefined)min = 1;
	if(max==undefined)max = 2;

	var re = new RegExp("^-?\\d+\\.\\d{" + min + "," + max + "}?$");  
	return re.test(value);
}


var _application_labels = new Array();
function setEleValue(oEle,strValue,parseFilterDocument,elementVisualValue)
{
	var stime = new Date().getTime();
	app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype"),"setEleValue","START");

	var strTag = oEle.tagName;
	var strFormType = oEle.getAttribute("formtype");

	//-- set datebox display value
	if(strFormType=="datebox" && elementVisualValue==undefined)
	{
		if(strValue=="<multiple calls>")
		{
			oEle.setAttribute("dbvalue",0);
			oEle.value= strValue;
			var etime = new Date().getTime();
			var ms = etime-stime;
			app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype"),"setEleValue","COMPLETED");

			return;
		}
		else
		{
			var tmpV = strValue;
			tmpV--;tmpV++;
			if(isNaN(tmpV))
			{
				if(strValue!="")set_datebox_string_displayvalue(oEle,strValue,true);
			}
			else
			{
				if(strValue!="")set_datebox_epoch_displayvalue(oEle,strValue,true);
			}
			var etime = new Date().getTime();
			var ms = etime-stime;
			app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype"),"setEleValue","COMPLETED");
			 return;
		}
	}


	//-- means we need to store dbvalue and show visual value (ie. probcode fields)
	if(elementVisualValue!=undefined)
	{
		oEle.setAttribute("dbvalue",strValue);
		strValue = elementVisualValue;
	}
	else
	{
		//-- apply formatting
		if(oEle.swformat)
		{
			var res = oEle.swformat(oEle,strValue);
			if(res=="")
			{
				return;
			}
		}
	}

	//-- check if we have hint text if value is blank
	if(strValue=="")
	{
		var strHint = oEle.getAttribute("hint");
		if(strHint!=null && strHint!="")
		{
			strValue = strHint;
			var strColor=oEle.getAttribute("origcolor");
			if(strColor==null || strColor=="")
			{
				oEle.setAttribute("origcolor",oEle.style.color);
			}
			//-- change color so they know its hint
			oEle.style.color = "#808080";
		}
	}
	else
	{
		//-- reset color
		var strHint = oEle.getAttribute("hint");
		if(strHint!=null && strHint!="")
		{			
			var strColor=oEle.getAttribute("origcolor");
			if(strColor!=null)oEle.style.color = strColor;
		}
	}

	switch (strTag)
	{
		case "INPUT":
			var strType = oEle.type;
			switch (strType.toLowerCase())
			{
				case "hidden":
				case "input":
				case "text":
				case "password":
				case "radio":
					oEle.value=strValue;
					break;
				case "checkbox":
					var intFormFlag = oEle.getAttribute("flagvalue");
					if(intFormFlag!=null)
					{
						oEle.checked = (intFormFlag & strValue);
					}
					else
					{
						oEle.checked = strValue;
					}
					break;
			}			
			break;
		case "SELECT":
			break;
		case "TEXTAREA":
			oEle.value = strValue;
			break;
		case "SPAN":
		case "DIV":
		case "P":
			if(oEle.getAttribute("formtype")=='sqllistcol')
			{
				if(oEle.getAttribute("swautolabel")=="true")
				{
					//-- set label
					var strBinding = oEle.getAttribute("binding");
					if((strBinding!="") &&(strBinding!=null))
					{
						var strValue = get_label_from_binding(strBinding);
						setElementText(oEle,strValue);

						var etime = new Date().getTime();
						var ms = etime-stime;
						app.debug(oEle.id + ":" + oEle.tagName + " (autolabel) :" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");

						return;
					}
				}
				else
				{
					return;
				}

			}
			else if((oEle.getAttribute("formtype")==FORMFLAG))
			{
				app.set_form_flag_value(oEle, strValue)

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");


				return;
			}
			else
			{
				setElementText(oEle,strValue);

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");


				return;
			}
		case "LABEL":
			//-- if has binding get label value for binding
			var strBinding = oEle.getAttribute("binding");
			if((strBinding!="") &&(strBinding!=null))
			{
				var bParseValue = oEle.getAttribute("parsevalue")
				if(bParseValue=="true")
				{
					if(strBinding.indexOf("&[")==-1)strBinding = "&[" + strBinding + "]";
					var strValue = parseFilterDocument.parse_filter(strBinding,false,"");
				}
				else
				{
					var strValue = get_label_from_binding(strBinding);
				}

		
				setElementText(oEle,strValue);

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + " (parsed):" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");
			
				return;
			}
			else
			{

				 setElementText(oEle,strValue);

				var etime = new Date().getTime();
				var ms = etime-stime;
				app.debug(oEle.id + ":" + oEle.tagName + " (unparsed) :" + oEle.getAttribute("formtype") + ":" + ms + "ms","setEleValue","COMPLETED");

				return;
			}
			break;
	
	}

	var etime = new Date().getTime();
	var ms = etime-stime;
	app.debug(oEle.id + ":" + oEle.tagName + ":" + oEle.getAttribute("formtype") + ":" + strValue + ":" + ms + "ms","setEleValue","COMPLETED");
}


function select_selectbox_value(oEle,strValue)
{
	//-- set by value
	for(var x=0;x<oEle.options.length;x++)
	{
		if(oEle.options[x].value == strValue || oEle.options[x].text == strValue)
		{
			oEle.selectedIndex=x;
			return true;
		}
	}
	return false;
}

function get_label_from_binding(strBinding)
{
	if(_application_labels[strBinding]!=undefined)
	{
		return _application_labels[strBinding];
	}
	else
	{
		//-- call xmlhttp to get label - and store in array so dont have to call again
		var strURL = app.get_service_url("ddf/getlabel","");
		var strParams = "binding=" + strBinding;
		var strLabelValue = app.get_http(strURL, strParams, true, false, null);
		_application_labels[strBinding] = strLabelValue;
		return strLabelValue;
	}
}

function stopEvent(e)
{
	if (!e) var e = window.event;
	if(e==undefined) return false;
	try
	{
		e.cancelBubble = true;
	}catch(e){}

	if (e.preventDefault) e.preventDefault();
	if (e.stopPropagation) e.stopPropagation();
	return false;
}

//--
//-- append session to a url
function _append_swsession(strURL)
{
	var strPrefix = (strURL.indexOf("&")>-1)?"&":"?";
	strURL += strPrefix + "sessid=" + app._swsessionid;
	return strURL;
}

//-- parse string
var __do_not_pfs_systemvars = new Array(); //-- items not to pfs
__do_not_pfs_systemvars['app._exclude_log_forms'] = true;
function _swc_parse_variablestring(strToParse,aDoc,boolPFS,boolFormat)
{
	if(strToParse==undefined) return strToParse;
	if(boolPFS==undefined)boolPFS=false;
	if(boolFormat==undefined)boolFormat=false;

	//-- cast
	strToParse = strToParse + "";

	var strPartOne = "";
	var strPartTwo = "";
	var strParseVar = "";
	var iStart = strToParse.indexOf("&[");
	var counter=0;
	while(iStart>-1)
	{
		counter++;
		if(counter>100)
		{
			alert("_swc_parse_variablestring : possible loop error. Please contact your Supportworks administrator")
			return strToParse;
		}
		strPartOne = strToParse.substring(iStart+2,strToParse.length);
		iEnd = strPartOne.indexOf("]");
		if(iEnd>-1)
		{
			strParseVar = strPartOne.substring(0,iEnd);

			var tempPFS = boolPFS;
			if(__do_not_pfs_systemvars[strParseVar]) tempPFS = false;

			var parsed = _get_context_var(strPartOne.substring(0,iEnd),aDoc, tempPFS,boolFormat)
			strToParse = strToParse.replace("&["+strParseVar+"]",parsed);
		}
		else{break;}

		iStart = strToParse.indexOf("&[");
	}

	return strToParse;
}

function _get_context_var(strVar,oDoc,boolPFS,boolFormat)
{
	if(boolPFS==undefined)boolPFS=false;
	if(boolFormat==undefined)boolFormat=false;
	var bDoc=true;
	if(oDoc==undefined)
	{
		bDoc=false;
		oDoc = top;
	}
	var arrVar = strVar.split(".");

	if( (oDoc[arrVar[0]]==undefined) || (oDoc[arrVar[0]][arrVar[1]]==undefined) )
	{
		if(bDoc)
		{
			if(top[arrVar[0]]==undefined)
			{
				return strValue;
			}
			else
			{
				var strValue = top[arrVar[0]][arrVar[1]];
			}
		}
	}
	else
	{
			var strValue = oDoc[arrVar[0]][arrVar[1]];
	}

	//-- if something like opencall.callref or opencall.status
	if(boolFormat)
	{
		//-- if coming from a form doc see if we have formatted data to hand
		if(oDoc && oDoc._tables && oDoc._tables[arrVar[0]] && oDoc._tables[arrVar[0]]._columns &&  oDoc._tables[arrVar[0]]._columns[arrVar[1]])
		{
			return oDoc._tables[arrVar[0]]._columns[arrVar[1]].displayvalue;
		}
		else if(app.dd.tables[arrVar[0]] && app.dd.tables[arrVar[0]].columns[arrVar[1]])
		{
			strValue = app.dd.tables[arrVar[0]].columns[arrVar[1]].FormatValue(strValue);
		}
	}

	if(boolPFS) strValue = PrepareForSql(strValue);
	return strValue;
}

//-- return html element text
function eleText(obj)
{
	var strRet = (obj.innerText) ? obj.innerText : (obj.textContent) ? obj.textContent : ""; 
	return app.trim(strRet);
}


//-- XML BASED FUNCTIONS

//-- return text from xml node
function xmlText(oNode)
{
	if(oNode==null)return "";

	if(oNode.text)return oNode.text;
    if(typeof(oNode.textContent) != "undefined") return oNode.textContent;  
	if(oNode.nodeValue && oNode.nodeValue!="") return oNode.nodeValue;
	if(oNode.firstChild) 
	{
		return oNode.firstChild.nodeValue;
	}
	
	return "";
}


function getXmlNodeById(oXML, strID)
{
	return getXmlNodeByAtt(oXML, "id", strID);
}

function getXmlNodeByAtt(oXML, strAtt, strValue)
{
	if(oXML==null) return null;
	for (var i=0;i<oXML.childNodes.length;i++)
	{
		if(oXML.childNodes[i].nodeType!=_XML_TEXT_NODE)		
		{
			var strAttValue = oXML.childNodes[i].getAttribute(strAtt);
			//-- alert(strAtt + " : " + strAttValue)
			if(strAttValue==strValue)
			{
				return oXML.childNodes[i];
			}
			else
			{
				var oNode = getXmlNodeByAtt(oXML.childNodes[i], strAtt, strValue);
				if(oNode!=null)return oNode;
			}
		}
		else
		{
			var oNode = getXmlNodeByAtt(oXML.childNodes[i], strAtt, strValue);
			if(oNode!=null)return oNode;
		}
	}	

	return null;
}


function xmlNodeTextByTag(oXMLNode,strTag, intPos)
{
	if(typeof oXMLNode!="object")return "";
	if(oXMLNode==null)return ""
	if(intPos==undefined)intPos=0;

	var arrNodes =oXMLNode.getElementsByTagName(strTag);
	if(arrNodes.length==0)return "";
	return xmlText(arrNodes[intPos].childNodes[0]);
}

function xmlNodeByTag(oXMLNode,strTag, intPos)
{
	if(typeof oXMLNode!="object")return "";
	if(oXMLNode==null)return ""
	if(intPos==undefined)intPos=0;

	var arrNodes =oXMLNode.getElementsByTagName(strTag);
	if(arrNodes.length==0)return "";
	return arrNodes[intPos];
}


function xmlNodeTextByID(oXMLNode,strID)
{
	var aNode = getXmlNodeById(oXMLNode,strID)
	if(aNode!=null)
	{
		return aNode.childNodes[0].nodeValue;
	}
	return "";
}




function load_form(strURL, strKey , strFrameName)
{
	var strFullURL = _applicationpath + _forms + strURL;
	if((strFrameName==undefined)||(strFrameName==""))
	{
		//-- popup window
		window.open(strFullURL,"","location=no,menubar=no,resizable=yes,scrollbars=no,toolbar=no");
	}
	else
	{
		//-- load frame
		document.frames[strFrameName].location.href = strFullURL;
	}
}




function noPx(strPX)
{
	if((strPX==undefined)||(strPX=="")) return 0;
	return new Number(string_replace(strPX+"", "px","",false));
}

function trim(stringToTrim) 
{
	stringToTrim +="";
	var tmpString = string_replace(stringToTrim," ","",true);
	if(tmpString=="") return tmpString;

	return stringToTrim.replace(/^\s+|\s+$/g,"");
}
function ltrim(stringToTrim) 
{
	stringToTrim +="";

	var tmpString = string_replace(stringToTrim," ","",true);
	if(tmpString=="") return tmpString;

	return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) 
{
	stringToTrim +="";

	var tmpString = string_replace(stringToTrim," ","",true);
	if(tmpString=="") return tmpString;

	return stringToTrim.replace(/\s+$/,"");
}



//-- load an inline form in workspace
function load_iform(strURL, targetDoc)
{
	//-- add session id 
	if(strURL.indexOf("?")>0)
	{
		strURL +="&sessid=" + _swsessionid+"&swsessionid=" + _swsessionid;
	}
	else
	{
		strURL +="?sessid=" + _swsessionid+"&swsessionid=" + _swsessionid;
	}

	if(strURL.toLowerCase().indexOf("http")>-1)
	{
		//-- leave as is
	}
	else
	{
		strURL = _root + strURL;
	}

	var sForm = app.create_submit_form(strURL, "_self", targetDoc, "POST");
	sForm.submit();
}



//-- create form
function create_submit_form(strURL, strTarget, oDoc, strMethod)
{
	if(oDoc==undefined) oDoc=document;
	if(strMethod==undefined) strMethod="POST";
	var submitForm = oDoc.createElement("FORM");
	oDoc.body.appendChild(submitForm);
	submitForm.method = strMethod;


	var arrURL  = strURL.split("?");
	var strURL  = arrURL[0];
	if(arrURL.length>1)
	{
		var arrVars = arrURL[1].split("&");
		for(var x = 0; x < arrVars.length;x++)
		{
			var arrParam = arrVars[x].split("=");
			create_form_element(submitForm, arrParam[0], arrParam[1]);
		}
	}

	//-- add token
	create_form_element(submitForm, "sessiontoken", app.httpNextToken);

	submitForm.action= strURL;
	submitForm.target= strTarget;
	return submitForm;
}

//-- function to add elements to a form
function create_form_element(oForm, elementName, elementValue)
{
	var newElement = insertBeforeEnd(oForm,"<input name='" + elementName + "' type='hidden' value='" + elementValue + "'>");
	return newElement;
}

function destroy_submit_form(oForm)
{
	oForm.parentNode.removeChild(oForm);
}


function _addSelectOption(oEle,strValue,strText)
{
	var elOptNew = app.getEleDoc(oEle).createElement('option');
	elOptNew.text = strText
	elOptNew.value = strValue
	

  try {
    oEle.add(elOptNew, null); // standards compliant; doesn't work in IE
  }
  catch(ex) {
    oEle.add(elOptNew); // IE only
  }

}

function _selectOptionExists(oEle,strValue)
{
	for(var x=0; x< oEle.options.length;x++)
	{
		if(oEle.options[x].value==strValue)return true;
	}
	return false;
}


function _params_from_array(arrValues, strPrefix)
{
	if(strPrefix==undefined)strPrefix="";

	var strParams = "";
	for(strParam in arrValues)
	{
		if(strParams != "")strParams += "&";
		strParams += strPrefix + strParam + "=" + pfu(arrValues[strParam]);
	}
	return strParams;
}

//-- get random color
function randcolor()
{
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function expand_collapse(oImg, elementID, strColour)
{

	var aDoc = app.getEleDoc(oImg)
	var oEle = aDoc.getElementById(elementID);
	if(oEle!=null)
	{
		if(oEle.getAttribute("expanded")=="1")
		{
			oEle.setAttribute("expanded","0");
			oEle.style.display="none";
			oImg.src="img/icons/" + strColour + "_expand.gif"
		}
		else
		{
			oEle.setAttribute("expanded","1");
			oEle.style.display="inline";
			oImg.src="img/icons/" + strColour + "_contract.gif"
		}
	}
}

//-- check mandatroy fields
function check_mandatory_fields(aDoc)
{

	for(strEleID in aDoc.__ELEMENTS)
	{
		var oE = aDoc.__ELEMENTS[strEleID];

		if((oE.getAttribute("formtype")!=null)&&(oE.getAttribute("swmandatory")=="1"))
		{
			var varValue = app.getEleValue(oE);
			if(varValue=="")
			{
				var strAlert = "A mandatory field on the form has not been populated. Please check the mandatory fields and try again.";
				var strBinding = oE.getAttribute("binding");
				if(strBinding!=null && strBinding!="" && strBinding.indexOf("_xmlmc.")==-1)
				{
					var strLabelValue = get_label_from_binding(strBinding);
					if(strLabelValue!=strBinding)
					{
						strAlert = "The field [" + strLabelValue + "] is mandatory but has not been populated. Please check the field and try again.";
					}
				}
				return strAlert;
			}
		}
	}
	return true;
}


//-- prepare a value for sql on the client side.
function PrepareForSQL(strValue)
{
	return PrepareForSql(strValue)
}
function PrepareForSql(strValue)
{
	
	//if(app._dbtype!='swsql')
	//{
	//	strValue = string_replace(strValue,"'","\\'",true);
	//}
	//else
	//{
		strValue = string_replace(strValue,"'","''",true);
	//}
	return strValue;
}


function set_form_flag_value(oDiv, intFlagValue)
{
	var oTable = app.get_parent_child_by_tag(oDiv,"TABLE");

	var test = intFlagValue - 1;
	if(isNaN(test))
	{
		//-- trying to set text so assume flag is only one flag and set the label
		for(var x=0;x<oTable.rows.length;x++)
		{
			var oTD = app.get_parent_child_by_class(oTable.rows[x],"fftd");
			if(oTD!=null)
			{
				app.setElementText(oTD,intFlagValue);
			}
		}

	}
	else
	{
		var intValue = 0;
		//-- add up all ticked values
		for(var x=0;x<oTable.rows.length;x++)
		{
			var oCB = app.get_parent_child_by_tag(oTable.rows[x],"INPUT");
			if(oCB!=null)
			{
				if(oCB.value & intFlagValue)
				{
					oCB.checked=true;
				}
				else
				{
					oCB.checked=false;
				}
			}
		}

		//-- set div value
		oDiv.setAttribute("dbvalue",intFlagValue+"");
		oDiv.setAttribute("value",intFlagValue+"");

		//-- get div holder and set binding value
		var strBinding = oDiv.getAttribute("binding");
		if((strBinding!=null)&&(strBinding!="") && (strBinding.indexOf("_xmlmc.")==-1))
		{
			var arrI = strBinding.split(".");
			oDiv.swdoc[arrI[0]][arrI[1]] = intFlagValue;
		}
	}
}


//-- same as php number format
function number_format(number, decimals, dec_point, thousands_sep)
{
	var n = !isFinite(+number) ? 0 : +number, 
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
	return s.join(dec);
}

//-- return byte size in kb, mb etc
function getByteSize(intByteSize)
{
	var size = intByteSize / 1024; 
    if(intByteSize < 1024) 
    { 
		size = intByteSize;
		size += ' bytes'; 
    }  
    else  
    { 
	    if(size < 1024) 
		{ 
			size = number_format(size, 2); 
			size += ' Kb'; 
		}
		else if(size / 1024 < 1024)  
		{ 
			size = number_format(size / 1024, 2); 
            size += ' Mb'; 
        }  
        else if (size / 1024 / 1024 < 1024)   
        { 
            size = number_format(size / 1024 / 1024, 2); 
            size += ' Gb'; 
        }  
	} 
    return size; 
}
//--
//-- return text for type i.e doc = Microsoft Word Document
function getFileTypeInformation(strType)
{
	var strText = strType;
	switch(strType.toLowerCase())
	{
		case "doc":
			strText = "Microsoft Word Document";
			break;
		case "txt":
			strText = "Text Document";
			break;
		case "png":
			strText = "Image - Portable Network Graphic";
			break;
		case "gif":
			strText = "Image - GIF";
			break;
		case "bmp":
			strText = "Image - Bit Map Picture";
			break;
		case "jpg":
			strText = "Image - JPG";
			break;
		case "jpeg":
			strText = "Image - JPEG";
			break;
		case "pdf":
			strText = "Printable Document Format";
			break;
		case "ddf":
			strText = "Supportworks Data Dictionary";
			break;
		case "php":
			strText = "Server-side Processing File";
			break;
		case "js":
			strText = "Client-side Javascript File";
			break;
		case "xls":
			strText = "Microsoft Excel Spreadsheet";
			break;
		case "sql":
			strText = "Database SQL File";
			break;
		case "xml":
			strText = "Extensible Markup Language File";
			break;
		case "html":
			strText = "Hype-Text Markup Language File";
			break;
		case "htm":
			strText = "Hype-Text Markup File";
			break;
	}

	return strText;
}




//-- drag and drop
var DragHandler = {
 
 
	// private property.
	_oElem : null,
	_oDoc : null,
 
	// public method. Attach drag handler to an element.
	attach : function(oDoc, oElem) {
		oDoc.onmousedown = DragHandler._dragBegin;
		DragHandler._oDoc = oDoc;
		DragHandler._oElem = oElem;
 
		// callbacks
		oDoc.dragBegin = new Function();
		oDoc.drag = new Function();
		oDoc.dragEnd = new Function();
 
		return oElem;
	},
 
 
	// private method. Begin drag process.
	_dragBegin : function(e) {
		var oElem = DragHandler._oElem;// = this;
 
		if (isNaN(parseInt(oElem.style.left))) { oElem.style.left = '0px'; }
		if (isNaN(parseInt(oElem.style.top))) { oElem.style.top = '0px'; }
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
		oElem.mouseX = e.clientX - 10;
		oElem.mouseY = e.clientY - 10;
 
		DragHandler._oDoc.dragBegin(oElem, x, y);
 
		DragHandler._oDoc.onmousemove = DragHandler._drag;
		DragHandler._oDoc.onmouseup = DragHandler._dragEnd;
		return false;
	},
 
 
	// private method. Drag (move) element.
	_drag : function(e) {
		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
//		oElem.style.left = x + (e.clientX - oElem.mouseX) + 'px';
//		oElem.style.top = y + (e.clientY - oElem.mouseY) + 'px';

		oElem.style.left = e.clientX + 10 + 'px';
		oElem.style.top = e.clientY + 10 + 'px';


		window.status = oElem.style.left +":" + oElem.style.top;
		oElem.mouseX = e.clientX - 10;
		oElem.mouseY = e.clientY - 10;
 
		DragHandler._oDoc.drag(oElem, x, y);
 
		return false;
	},
 
 
	// private method. Stop drag process.
	_dragEnd : function() {
		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		DragHandler._oDoc.dragEnd(DragHandler._oDoc, oElem, x, y);
 
		DragHandler._oDoc.onmousemove = null;
		DragHandler._oDoc.onmouseup = null;
		//DragHandler._oElem = null;
	}
 
}


//--
//-- inserting text at cursor pos
function getCaretPosition (ctrl) 
{
	var CaretPos = 0;	// IE Support
	if (document.selection) 
	{
		ctrl.focus();
		var Sel = ctrl.document.selection.createRange();
		Sel.moveStart ('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (ctrl.selectionStart || ctrl.selectionStart == '0')
	{
		CaretPos = ctrl.selectionStart;
	}
	return (CaretPos);
}


function insertAtCursor(myField, myValue) 
{
	//-- IE support
	if (document.selection) 
	{
		myField.focus();
		//-- ie10 ownerDocument check
		var useDoc = (myField.ownerDocument)?myField.ownerDocument:myField.document;
		sel = useDoc.selection.createRange();
		sel.text = myValue;
	}
	else if (myField.selectionStart || myField.selectionStart == '0') 
	{
		//-- MOZILLA/NETSCAPE support
		var startPos = myField.selectionStart;
	    var endPos = myField.selectionEnd;
		myField.value = myField.value.substring(0, startPos)
                  + myValue
                  + myField.value.substring(endPos, myField.value.length);
	} 
	else 
	{
		myField.value += myValue;
	}
}


//-- check if clicked element in right hand corder box (for dates and profile selectors etc
function _clicked_ele_trigger(oEle,e)
{
	if(isNaN(e))
	{
		var mLeft = app.findMousePos(e)[0];
	}
	else
	{
		var mLeft = e;
	}

	var eleMaxRight = oEle.offsetWidth + app.eleLeft(oEle);
	var eleMinRight = eleMaxRight - 16;

	if((mLeft>eleMinRight)&&(mLeft<eleMaxRight))
	{
		return true;
	}
	return false;
}

function jA(jsonObject)
{
	var isArray = (jsonObject instanceof Array);
	if(!isArray)
	{
		return new Array(jsonObject);
	}
	return jsonObject;
}

function jVal(jPointer)
{
	if(jPointer==undefined)return "";
	return jPointer;
}

function getSelectedRadio(buttonGroup) {
    // returns the array number of the selected radio button or -1 if no button is selected
    if (buttonGroup[0]) { // if the button group is an array (one button is not an array)
       for (var i=0; i<buttonGroup.length; i++) {
          if (buttonGroup[i].checked) {
             return i
          }
       }
    } else {
       if (buttonGroup.checked) { return 0; } // if the one button is checked, return zero
    }
    // if we get to this point, no radio button is selected
    return -1;
 } // Ends the "getSelectedRadio" function
 
function getSelectedRadioValue(buttonGroup) {
    // returns the value of the selected radio button or "" if no button is selected
    var i = getSelectedRadio(buttonGroup);
    if (i == -1) {
       return "";
    } else {
       if (buttonGroup[i]) { // Make sure the button group is an array (not just one button)
          return buttonGroup[i].value;
       } else { // The button group is just the one button, and it is checked
          return buttonGroup.value;
       }
    }
 } // Ends the "getSelectedRadioValue" function
 
 function deselectSelectedRadio(buttonGroup) {
    // returns the array number of the selected radio button or -1 if no button is selected
    if (buttonGroup[0]) 
	{ // if the button group is an array (one button is not an array)
		for (var i=0; i<buttonGroup.length; i++) 
		{
			if (buttonGroup[i].checked) buttonGroup[i].checked=false;
       }
    }
	else
	{
       if (buttonGroup.checked)buttonGroup.checked=false;
    }

 };;;;//-- NWJ
//-- 25.01.2006
//-- control http requests. Allows us to attach functions and process ids to a request so 
//-- when data is returned we can trigger that function and pass in the data
var __SESSIONERROR = "SESSIONERROR";
var app = top;
var isIE = (window.ActiveXObject) ?true:false; 
var boolForceLoggingOut = false;
	
//-- create xml http request object
function create_httprequest()
{
	//-- code for Mozilla, etc.
	var xmlhttp=false;
	try
	{
		// Try the Mozilla way -- also now supported in IE7+
		xmlhttp = new XMLHttpRequest();
	} 
	catch(e)
	{
		//-- If we can not do the above, we need to see if we can get the IE activeX version loaded
		var MSXML_XMLHTTP_PROGIDS = new Array(
				'MSXML2.XMLHTTP.5.0',
				'MSXML2.XMLHTTP.4.0',
				'MSXML2.XMLHTTP.3.0',
				'MSXML2.XMLHTTP',
				'Microsoft.XMLHTTP');

		var success = false;
		for(var i=0;i < MSXML_XMLHTTP_PROGIDS.length && !success; i++) 
		{
			try 
			{
				xmlhttp = new ActiveXObject(MSXML_XMLHTTP_PROGIDS[i]);
				success = true;
			}
			catch(e)
			{
				success = false;
			}

			if(success)
				break;
		}
		if(!success)
		{
			alert('Can\'t create XMLHttpRequest ('+MSXML_XMLHTTP_PROGIDS[i]+') - not supported on your browser');
		}
	}
	return xmlhttp;
}


	//-- create xml dom object given an xml string
	function create_xml_dom(strXML)
	{

		if(strXML.indexOf(__SESSIONERROR)>-1)
		{
			var strMsg = strXML.split(":");
			if(opener && opener.logout)
			{
				opener.logout(strMsg[1]);
				self.close();
			}
			else
			{
				top.logout(strMsg[1]);
				return false;
			}
		}
		 
		if (window.ActiveXObject) 
		{
			var oXML=new ActiveXObject("Microsoft.XMLDOM");
			if(oXML!=null)
			{
				oXML.async="false";
				if(!oXML.loadXML(strXML))
				{	
					debug("create_xml_dom : Error loading XML into DOM");
				}
			}

		}
        else 
		{
			//-- mozilla - need to clean white space due to mozilla treating white space as XML nodes (??? how crap is that)
            oXML = (new DOMParser).parseFromString(strXML, "text/xml");
			cleanWhitespace(oXML.documentElement);
        }

		if (!oXML.documentElement)
		{		
			alert("The returned xml does not have a valid document root.\n\n" + strXML);
		}
		return oXML;
	}


	//-- remove white space from xml
	var notWhitespace = /\S/;
	function cleanWhitespace(node) 
	{
		for (var x = 0; x < node.childNodes.length; x++) 
		{
		    var childNode = node.childNodes[x];
			if ((childNode.nodeType == 3)&&(!notWhitespace.test(childNode.nodeValue))) 
			{
				//-- that is, if it's a whitespace text node
				node.removeChild(node.childNodes[x]);
				x--;
			}
			if (childNode.nodeType == 1) 
			{
				//-- elements can have text child nodes of their own
		       cleanWhitespace(childNode);
			}
		}
	}
	//--
	//--


//-- 2012.05.09 - CallStoredQuery Script
function CallStoredQuery (strQueryName, strScriptParams, bAsJson)
{
	if(bAsJson==undefined)bAsJson=true;

	//--
	//-- get service to form data records as xml
	var strParams = "espQueryName="+strQueryName+"&incmetadata=1&asjson=" + bAsJson+ "&sessid="+session.sessionId;
	if(strScriptParams!="")strParams +="&" + strScriptParams;

	//-- make the call - expecting xml to be returned back
	//var strURL = _webserver + "clisupp/storedqueries/index.php";
	//var res = app.get_http(strURL, strParams, true, !bAsJson);

	//-- make the call - expecting xml to be returned back
	var strURL =  "service/storedquery/clisupp.php";
	var res = app.get_http(strURL, strParams, true, !bAsJson);


	return res;
}

//-- 2012.05.09 - CallWebclientStoredQuery Script
function CallWebclientStoredQuery (strQueryName, strScriptParams, bAsJson)
{
	if(bAsJson==undefined)bAsJson=true;
	//--
	//-- get service to form data records as xml
	var strParams = "espQueryName="+strQueryName+"&asjson=true&sessid="+session.sessionId;
	if(strScriptParams!="")strParams +="&" + strScriptParams;

	//-- make the call - expecting xml to be returned back
	var strURL =  "service/storedquery/index.php";
	var res = app.get_http(strURL, strParams, true, !bAsJson);

	return res;
}

function get_http(strURL, strParams, boolWait, boolXML, callBackFunction, targetEle, intTotalRecall, strControlName, boolDoNotSwed,parseBackData)
{
	var undefined;
	if(intTotalRecall==undefined)intTotalRecall=0;
	if(strControlName==undefined)strControlName="";
	if(boolXML==undefined)boolXML=false;
	if(callBackFunction==undefined)callBackFunction=false;
	if(targetEle==undefined)	targetEle=null;
	if(parseBackData==undefined)parseBackData = null;
	
	var ohttp = create_httprequest();
	ohttp._swwc_data = parseBackData;
	var startHttpRequestDateTime = new Date();

	//-- in memory function to handle http requests
	handle_http_response = function ()
						  {

								if (ohttp.readyState==4)
								{
									//-- page not found
									if(ohttp.status!=200) 
									{
										//-- server connection issues - repeat call
										switch(ohttp.status)
										{
											case 12029:
											case 12030:
											case 12031:
											case 12152:
											case 12159:
												alert("xmlhttp request error " + ohttp.status + " : " + strURL + ".\n The server closed the http connection. Please contact your Administrator.");
												break;
											default:
												alert("xmlhttp request error " + ohttp.status + " : " + strURL + ".\n Please contact your Administrator.");
												break;
										}

										//-- clear loading
										if(_swcore.ohttp_currenturl == strURL)	window.status = "";

										strHttpResult = false;
										return false;
									}
									
									//-- clear loading status
									if(_swcore.ohttp_currenturl == strURL)	window.status = "";

									strHttpResult = app.trim(ohttp.responseText);

									if(strHttpResult.indexOf("_SWWEBCLIENT_PHPTIMER[")!=-1)
									{
										var arrResp = strHttpResult.split("_SWWEBCLIENT_PHPTIMER[");
										strHttpResult = app.trim(arrResp[0]);
										arrResp = arrResp[1].split(".");

										//-- check role has not changed
										if(session.role!=0 && session.role != arrResp[1])
										{
											boolForceLoggingOut = true;
											strHttpResult = "";
											var strMsg = "m5";
											if(opener && opener.logout)
											{
												opener.logout(strMsg);
												self.close();
											}
											else
											{
												top.logout(strMsg);
											}
											return "";
										}

										if(_bRecordPerformanceTimers)
										{
											var newTime = new Number(arrResp[0]);
											if(newTime<0)newTime=50;
											_performancePHPtimer = _performancePHPtimer + newTime;
										}
									}

									if(strHttpResult.indexOf("PARAMERROR:")!=-1)
									{
										var strMsg = strHttpResult.split("PARAMERROR:")[1];
										alert(strMsg);
									}
									else if(strHttpResult.indexOf(__SESSIONERROR)>-1)
									{
										//-- check session error
										if(boolForceLoggingOut!=undefined && !boolForceLoggingOut)
										{
											boolForceLoggingOut = true;
											var strMsg = strHttpResult.split(":")[1];
											if(opener && opener.logout)
											{
												opener.logout(strMsg);
												self.close();
											}
											else
											{
												top.logout(strMsg);
											}
										}
									}
									else
									{
										if(boolXML)
										{
											//-- convert text to XMLDOM
											strHttpResult = create_xml_dom(strHttpResult);
										}

										if(_bRecordPerformanceTimers)	_performanceNetworktimer = _performanceNetworktimer + ((new Date()) - startHttpRequestDateTime);

										 //-- if there is a call back function call it
										 if (callBackFunction)
										 {
											 try
											 {
												callBackFunction(strHttpResult,targetEle,ohttp);
											 }
											catch(e){}
										 }
									}										
								}
						  }




	
	//-- rfc 86526 - if requesting .xml file make sure we request it via service.
	//-- this means user has to have a valid session and we can then switch off http access to xml files in webclient path
	if(strURL.indexOf(".xml")>-1 || strURL.indexOf(".json")>-1)
	{
		var arrURL = new Array();
		var strPathType = "";
		//-- we only control xml resource fetching in the webclient path
		var boolFetchResourceViaPHP=true;
		if(strURL.toLowerCase().indexOf("http")==0)
		{
			if(strURL.indexOf("/clisupp/")>-1)
			{
				arrURL = strURL.split("/clisupp/");
				strPathType = "/clisupp/";
			}
			else if(strURL.indexOf("/webclient/")>-1)
			{
				arrURL = strURL.split("/webclient/");
				strPathType = "";
			}
			else
			{
				//-- fetch using http as resource is out of supportworks client domain
				boolFetchResourceViaPHP=false;
			}
		}
		else
		{
			//-- relative path
			arrURL[0] = strURL;
		}

		if(boolFetchResourceViaPHP)
		{
			var resourcePath = (arrURL[1]==undefined)?arrURL[0]:arrURL[1];

			//-- change url to resourcefetch service url
			if (strParams != "") strParams+="&";
			strParams+="fetchresourcepath=" + resourcePath;
			strParams+="&pathtype=" + strPathType;
			strURL =  "service/session/fetchresource/index.php";
		}
	}


	var strHttpResult = "";
	if (strParams != "") strParams+="&";
	strParams+="isie=" + isIE + "&_appid=" + app._application;


	//--
	//-- add unique val to request so browser does not cache
	var stamp = new Date().getTime() +"";
	var unique = "r=" + stamp + (session.role+"");
	strParams += "&" + unique;

	if(boolDoNotSwed==undefined)
	{
		//-- if url is not in webclient path then do not swed
		boolDoNotSwed=(strURL.indexOf("/webclient/")==-1 && strURL.indexOf("service/")==-1);
	}
	//-- encrypt params
	if(!boolDoNotSwed)
	{
		strParams = _swed(strParams);
	}
	
	//-- if using proxy pass that into server
	if(app._proxypassname && app._proxypassname!="_PROXYPASSNAME")strParams +="&proxyurl"+ app._root;

	var boolAsync = (boolWait==false)?true:false;

	if(boolWait && (isChrome && isSafari))
	{
		//-- do not assign onload function
	}
	else
	{
		if (window.XMLHttpRequest)
		{
			if(!isIE || isIE10Above)
			{
				ohttp.onload = handle_http_response;
			}
			else
			{
				ohttp.onreadystatechange = handle_http_response;
			}
		}
		else
		{
			ohttp.onreadystatechange = handle_http_response;
		}
	}	
	//-- show loading status (for those browsers that support it)
	_swcore.ohttp_currenturl = strURL;
	window.status = "loading webclient data...";

	//-- Send the proper header information along with the POSTrequest
	ohttp.open("POST",strURL,boolAsync);

	//-- 14.05.2012 send valid session token with the request
	ohttp.setRequestHeader("Webclient-token", app.httpNextToken);
	ohttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	if(!isChrome)ohttp.setRequestHeader("Content-length", strParams.length);

	//-- send close conn for ie6 and  non IE browers
	if((!app.isIE && !isChrome) || app.isIE6)ohttp.setRequestHeader("Connection", "close");

	ohttp.send(strParams);

	//-- 11.07.2012 - 88827 - chrome v20+ does not call onload or onreadystatechage event if request is synchronous and coming from modal form
	//-- so only call events if doing async calls
	if(boolWait && (isChrome || isSafari))handle_http_response();

	return strHttpResult;

}

//--
//-- load outlook xml def file for control
function load_control_xmldom(strControlType, strItemID)
{
	//-- check custom path first
	var strURL = _customapplicationpath + "outlook/" + strControlType + "/" + strItemID + ".xml";
	var oXML = app.get_http(strURL, "", true,true,null);				
	if(oXML) return oXML;

	//-- get out of box xml
	var strURL = _applicationpath + "outlook/" +  strControlType + "/" + strItemID + ".xml";
	var oXML = app.get_http(strURL, "", true,true,null);				

	return oXML;
}


//-- call a service
function call_service(strPath, strArgs, boolWait,boolXML, pFunction)
{
	if(pFunction==undefined)pFunction = null;
	if(boolXML==undefined)boolXML = true;
	if(boolWait==undefined)boolWait = true;
	if(strArgs==undefined)strArgs = "";
	var strURL =  "service/" + strPath + "/index.php"
	var oXML = app.get_http(strURL, strArgs, boolWait,boolXML,pFunction);				
	return service_result(oXML);
}

function get_service_url(strService,strArgs)
{
	if(strArgs!="")strArgs = "?" + strArgs;
	if(strService.toLowerCase().indexOf(".php")!=-1)
	{
		return "service/" + strService + "" + strArgs;
	}
	else
	{
		return "service/" + strService + "/index.php" + strArgs;
	}
}

//-- create service result object
function service_result(oServiceXML)
{
	var oReturn = new Object();
	if(typeof(oServiceXML)!="object")
	{
		oReturn.result  = false;
		oReturn.message = "Service xml is invalid. Please contact your Administrator."
		oReturn.data = "";
		oReturn.oxml = null;
	}
	else
	{
		oReturn.result  = (xmlText(oServiceXML.getElementsByTagName("result")[0])=="true");
		oReturn.message = xmlText(oServiceXML.getElementsByTagName("message")[0]);
		oReturn.data = xmlText(oServiceXML.getElementsByTagName("data")[0]);
		oReturn.oxml = oServiceXML;
	}
	return oReturn;
}

//-- debug stuff
var _performanceLog = new Array();
var _performanceLogPositions = new Array();
var _dwin = null;
var _performancePHPtimer = 0;
var _performanceNetworktimer = 0;
var _bRecordPerformanceTimers = false;
function debugclear()
{
	_bRecordPerformanceTimers=false;
	_performancePHPtimer = 0;
	_performanceNetworktimer=0;
	_performanceLog = new Array();
	_performanceLogPositions = new Array();
}

function debugstart(strMsg,strType,strSubType, bForceLog)
{
	if(app.dd && app.dd.GetGlobalParamAsNumber("webclient settings/showformloadtime")!=1) bForceLog = false;

	if(bForceLog==undefined)bForceLog=false;
	if(app._bDebugMode==false && !bForceLog)return false;

	_bRecordPerformanceTimers=true;

	if(strSubType==undefined || strSubType=="")strSubType="performance monitor";

	var strKey = strType+":"+strMsg;
	var oPerf = new Object();
	oPerf.msg = strMsg;
	oPerf.type = strType;
	oPerf.subtype = strSubType;
	oPerf.phptimer = _performancePHPtimer;
	oPerf.networktimer = _performanceNetworktimer;
	oPerf.startdate = new Date();
	try
	{
		_performanceLog[strKey] =oPerf;
		_performanceLogPositions[_performanceLogPositions.length++] = strKey;
		
	}
	catch (e)
	{
		_performanceLog = new Array();
		_performanceLogPositions = new Array();
		_performanceLog[strKey] =oPerf;
		_performanceLogPositions[_performanceLogPositions.length++] = strKey;
	}
}

function debugend(strMsg,strType,strSubType,bForceLog)
{

	if(app.dd && app.dd.GetGlobalParamAsNumber("webclient settings/showformloadtime")!=1) bForceLog = false;

	if(bForceLog==undefined)bForceLog=false;
	if(app._bDebugMode==false && !bForceLog)return false;

	var strKey = strType+":"+strMsg;
	if(_performanceLog[strKey])
	{
		_performanceLog[strKey].enddate = new Date();
		_performanceLog[strKey].time = _performanceLog[strKey].enddate - _performanceLog[strKey].startdate;
		if(_performanceLog[strKey].time==undefined)_performanceLog[strKey].time = "<1";

		//-- store amount of time spent doing php and network traffic
		_performanceLog[strKey].phptimer = _performancePHPtimer - _performanceLog[strKey].phptimer;
		_performanceLog[strKey].networktimer = (_performanceNetworktimer -_performanceLog[strKey].networktimer) - _performanceLog[strKey].phptimer;
		_performanceLog[strKey].browsertimer = _performanceLog[strKey].time - _performanceLog[strKey].networktimer - _performanceLog[strKey].phptimer;


		_performanceLogPositions[_performanceLogPositions.length++] = strKey;

		return _performanceLog[strKey];
	}
}

function debug(strMsg , strType, strSubType, levelone)
{

}

function show_debug()
{
	if(_dwin!=null && _dwin.open)
	{
		_dwin.focus();
	}
	else
	{
		_dwin = window.open("client/debug.htm");
	}
}

function close_debug()
{
	if(_dwin!=null && _dwin.close)
	{
		_dwin.close();
	}
}


//-- used in index.php
function _btn_signin_onclick()
{
	if(bProcessing)return;
	bProcessing= true;

	document.getElementById("td_errormsg").style.color="#000000";
	setElementText(document.getElementById("td_errormsg"),"..processing login request..please wait..");
	

	//-- login using connect service
	var strUserID = document.getElementById("tb_userid").value;
	var strPassword = document.getElementById("tb_password").value;
	var strURL = get_service_url("session/connect","");
	var strReturnState = get_http(strURL, "_p1=" + B64.encode(strUserID) + "&_p2=" + B64.encode(strPassword), false,false, _onloginreturn);
}

function _onloginreturn(strReturnState,n,ohttp)
{
	bProcessing= false;

	//--
	//-- get the return state object (easy js access object)
	if(strReturnState.indexOf("OK:")!=0)
	{
		document.getElementById("td_errormsg").style.color="red";
		setElementText(document.getElementById("td_errormsg"),strReturnState);
	}
	else
	{
		document.getElementById("sessiontoken").value =ohttp.getResponseHeader('webclient-token');
		frm_portal.submit();
	}
}

function _check_signin_enter(tb,e)
{
	var iKey = e.keyCode;
	if(iKey==13)_btn_signin_onclick();
}

//--
//-- base64
var B64 = new _Base64();
function _Base64()
{
    //-- private property
    this._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
     this.encode = function (input) 
	 {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = this._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    }

    //-- public method for decoding
    this.decode = function (input){
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = this._utf8_decode(output);

        return output;

    }

    // private method for UTF-8 encoding
    this._utf8_encode = function (string)
	{
		string = string + "";
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;


    }

    //-- private method for UTF-8 decoding
    this._utf8_decode = function (utftext){
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

};;;;//--
//-- ALL APPLICATIONS
//-- Gadget functions that are needed for all applications

//-- load a fusion chart into a given div
function load_chart(strDivID, strType, strDataUrl)
{
	//-- get body with and height
	var oDiv = oControlFrameHolder.document.getElementById(strDivID);
	if(oDiv!=null)
	{
		var myChart = new FusionCharts(_root + "fusioncharts/"+strType+".swf", "myChartId",  oDiv.offsetWidth+10, oDiv.offsetHeight);
		myChart.setDataURL(_root + strDataUrl + "?swsessionid="+_swsessionid);
		myChart.render(oDiv);
	}
}

//-- run gadget action function - oele will have attributes of gtype and gaction from which we can determine what to do
function run_gadget_action(oEle)
{
	var strGadgetType = oEle.getAttribute("gtype");
	var strActionType = oEle.getAttribute("gactiontype");
	var strAction = oEle.getAttribute("gaction");

	//alert("run gadget action " + strActionType + " : " + strAction);

	switch (strActionType)
	{
		case "menulink":
			var arrActionInfo = strAction.split("|");
			activate_menu_item("mi_" + arrActionInfo[0], arrActionInfo[1]);
			break;
		case "popup":
			var arrActionInfo = strAction.split("|");
			//alert(arrActionInfo[0]);
			app.openWin(arrActionInfo[0],arrActionInfo[1],arrActionInfo[2]);
			break;
		case "js":
			var arrActionInfo = strAction.split("|");
			eval(arrActionInfo[0] + "("+ arrActionInfo[1] + ",oEle);");

		default:
			break;	
	}

	return false;
}

function rf()
{
	return false;
}

function expandcollapse_gadget(aDiv)
{

	var oParent = get_parent_owner_by_id(aDiv,"gadgetcontainer");
	if(!oParent)return;
	var oHolder = get_parent_child_by_id(oParent,"gadgetholder");
	if(oHolder==null)return;

	var strClass = aDiv.className;
	if(strClass=="div-expand")
	{
		aDiv.className = "div-collapse";
		//-- expand gadget holder (gadgetholder)
		oHolder.style.display="";
	}
	else
	{
		aDiv.className = "div-expand";
		//-- expand gadget holder
		oHolder.style.display="none";
	}
}

;;;;
//--
//-- tab control helpers
function hilite_tabitem(oItem, oEv)
{
	if(oItem.className!="tabitem-selected")	oItem.className = "tabitem-hover";
}

function lolite_tabitem(oItem, oEv)
{
	if(oItem.className!="tabitem-selected")	oItem.className = "tabitem";
}

function _ti_get_tabspace(oItem)
{
	var oSpace =null;
	var spaceid = "tispace_" + oItem.id;
	var oTable = app.get_parent_owner_by_tag(oItem, "TABLE");
	if(oTable!=null)
	{
		oSpace = app.get_parent_child_by_id(oTable,spaceid);
	}
	return oSpace;
}

function _ti_hide_space(oItem)
{
	var space = _ti_get_tabspace(oItem);
	if(space!=null)
	{
		space.className="tab-item-workspace";
	}
}

function _ti_show_space(oItem)
{
	var space = _ti_get_tabspace(oItem);
	if(space!=null)
	{
		var oTable = app.get_parent_owner_by_tag(oItem, "TABLE");
		var intNewHeight = oTable.offsetHeight;
		space.className="tab-item-workspace-selected";
		if(oTable)
		{
			app.oWorkspaceFrameHolder.sizeup_workspace_areas();//
		}
	}
}

function select_tabitem(oItem, oEv)
{
	var tiHolder = app.get_parent_owner_by_id(oItem,"itemholder");
	var selectedItem = 	app.get_parent_child_by_class(tiHolder,"tabitem-selected");	
	if(selectedItem!=null)
	{
		_ti_hide_space(selectedItem)
		selectedItem.className = "tabitem";
	}

	//--
	//-- hide any context menu items
	if(app.oWorkspaceFrameHolder!=null && app.oWorkspaceFrameHolder.cancel_context_menus) app.oWorkspaceFrameHolder.cancel_context_menus();


	oItem.className = "tabitem-selected";
	_ti_show_space(oItem);

	//-- get control info
	var arrControlInfo = oItem.getAttribute("control").split(":");
	var strType = arrControlInfo[0];
	var strID = arrControlInfo[1];

	//-- check if control has been loaded
	var boolLoaded = oItem.getAttribute("controlloaded");
	if((boolLoaded==null)||(boolLoaded==false))
	{
		//-- refresh the control data source if it has any
		oItem.setAttribute("controlloaded",true);
	}
	else
	{
		//-- should we fresh content?
	}

	//-- activate datatable
	if(strType=="datatable")
	{
		var eDataTableHolder = app.oWorkspaceFrameHolder.document.getElementById(strID);
		//-- resize for all browsers swref 91963
		//if(!app.isIE || app.isIE10Above)
		//{
			if(eDataTableHolder.getAttribute("initialResize")!="loaded")
			{
				eDataTableHolder.setAttribute("initialResize","loaded");
				var oHeaderHolder = app.get_parent_child_by_id(eDataTableHolder,'table_columns');
				datatable_resize_datacolumns(null,oHeaderHolder)
			}
		//}
		app._select_sevicedesk_table(eDataTableHolder.childNodes[2]);
	}
}

function hide_tab_item(oItem, oEv)
{

}

function show_tab_item(oItem, oEv)
{

};;;;	//-- functions to support data table
	var ROW_HILITE_COLOR = '#FFC663'; //-- orange (bluegray is '#E7EBEF')
	var ROW_HILITEBLUR_COLOR = '#E7EBEF'; //-- orange (bluegray is '#E7EBEF')

	var boolDataTableColResize = false;
	var strResizeColBarId = "datatable-colresizer";
	var oVbar = null;
	var currTableDoc = null;
	var currTableResizeTD = null;
	var _current_table_contextmenu_item = null;

	var KeyUP = 38;
	var KeyDOWN = 40;
	



	function datatable_keyup(dataDiv,e)
	{
		var e = app.getEvent(e);
		//-- if down key then stop scroll event
		var tableData = app.get_parent_child_by_tag(dataDiv,"TABLE");
		if(tableData && tableData.rows.length>0)
		{
			var curr_row_indexes = tableData.getAttribute("curr_row");
			if(curr_row_indexes==null)return;
			var arr_indexes = curr_row_indexes.split(",");
			if(arr_indexes.length==1)
			{
				var row_index = arr_indexes[arr_indexes.length-1];
				var currRow = tableData.rows[row_index];
				dataDiv.scrollTop = currRow.offsetTop;
			}
		}
	}

	function datatable_keydown(dataDiv,e)
	{
		var e = app.getEvent(e);
		//-- if down key then stop scroll event
		var tableData = app.get_parent_child_by_tag(dataDiv,"TABLE");
		if(tableData && tableData.rows.length>0)
		{
			var curr_row_indexes = tableData.getAttribute("curr_row");
			if(curr_row_indexes==null)return;
			var arr_indexes = curr_row_indexes.split(",");
			var row_index = arr_indexes[arr_indexes.length-1];
			var currRow = tableData.rows[row_index];
			
			if(e.keyCode==KeyUP)
			{
				//-- move up a row
				row_index--;
			
			}
			else if(e.keyCode==KeyDOWN)
			{
				//-- move down a row
				row_index++;
			}
			else
			{
				return;
			}

			//-- get row to select
			var newRow = tableData.rows[row_index];
			if(newRow==undefined)newRow = currRow;
			if(newRow==currRow)return;

			if(newRow.onclick)
			{
				newRow.setAttribute('shiftKey',e.shiftKey)
				app.fireEvent(newRow,"click");
				newRow.setAttribute('shiftKey',null)
			}
			else
			{
				app.mes_datarow_selected(newRow,e.shiftKey);
			}

		}
	}


	var _datatable_lastmousedown = 0;
	var _datatable_doubleclick = false;

	function datatable_contextmenu(dataDiv,e)
	{
		var e = app.getEvent(e);
		var bCTRL = (e!=null)?e.ctrlKey:false;

		var divHolder = app.get_parent_owner_by_tag(dataDiv,"DIV");
		var oDoc = app.getEleDoc(divHolder);
		var divContext = null;

		app.hide_application_menu_divs();

		//-- left click
		if(!app.boolMouseRightClick(e))
		{
			var ifShimmer = oDoc.getElementById("app-context-menu");
			if(ifShimmer!=null)
			{
				ifShimmer.innerHTML = "";
				ifShimmer.style.display="none";
			}

			if(bCTRL) 
			{
				return true;
			}

			//-- check if table holder in which case select table
			if( (divHolder.className == "dhtml_table_holder") || (divHolder.getAttribute("draganddrop")=="1") )
			{
				//-- start drag and drop (??)
				var targetEle = oDoc.elementFromPoint(oDoc.iMouseLeft,oDoc.iMouseTop);
				if(targetEle!=null)
				{
					if(targetEle.tagName=="DIV" && targetEle.parentNode!=null && targetEle.parentNode.tagName=="TD")targetEle = targetEle.parentNode;
					if(targetEle.tagName=="B" && targetEle.parentNode!=null && targetEle.parentNode.parentNode.tagName=="TD")targetEle = targetEle.parentNode.parentNode;

					if(targetEle.tagName=="TD" && targetEle.parentNode.tagName=="TR")
					{
						top.__CURRENT_SELECTED_TABLE_ROW = targetEle.parentNode;
						_start_drag_drop(targetEle.parentNode);
						return false;
					}
				}
				if(divHolder.className == "dhtml_table_holder")app._select_sevicedesk_table(divHolder.childNodes[2])
				return false;
			}
			return false;
		}

		//-- check if have a toolbar in same view as this table
		var divToolbarArea = oDoc.getElementById("td_workspace_0");
		if(divToolbarArea!=null)
		{
			var firstControl = divToolbarArea.childNodes[0];
			if(firstControl!=null)
			{
				//-- check if toolbar
				if(firstControl.className == "toolbar")
				{
					//-- check if have associated context menu
					divContext = oDoc.getElementById("contextmnu_" + firstControl.getAttribute("controlid"));
				}
			}
		}

		if(divContext==null)return false;
		
		//-- a service desk
		if(divHolder.className == "dhtml_table_holder")	
		{
			//-- as per full client if user right clicks on a row select it
			var bSelectTable = true;
			var targetEle = oDoc.elementFromPoint(oDoc.iMouseLeft,oDoc.iMouseTop);
			if(targetEle!=null)
			{
				if(targetEle.tagName=="DIV" && targetEle.parentNode!=null && targetEle.parentNode.tagName=="TD")targetEle = targetEle.parentNode;
				if(targetEle.tagName=="TD" && targetEle.parentNode.tagName=="TR")
				{
					//-- if not already selected then select
					if(targetEle.parentNode.style.backgroundColor.toLowerCase()!=ROW_HILITE_COLOR.toLowerCase())
					{
						bSelectTable=false;
						targetEle.parentNode.setAttribute('shiftKey',bCTRL);
						top.__CURRENT_SELECTED_TABLE_ROW = targetEle.parentNode;
						app.fireEvent(targetEle.parentNode,"click");
					}
				}
			}
		}

		//-- if we have context menu check mouse right click and show mouse position
		if(divContext!=null)
		{
			var fDraw = divContext.getAttribute("ondraw");
			if(fDraw!=null && fDraw!="")
			{
				fDraw = eval(fDraw);
				if(fDraw(divContext)==false)
				{
					return false;
				}
			}

			var iAdjustTop = app.eleTop(divHolder);
			var iAdjustLeft = app.eleLeft(divHolder);

			var ifShimmer = oDoc.getElementById("app-context-menu");
			if(ifShimmer!=null)
			{
				ifShimmer.innerHTML = divContext.innerHTML;
				ifShimmer.style.display="block";
				
				//-- if top + height exceeds page then adjust
				var iBottom = (oDoc.iMouseTop -1) + (ifShimmer.offsetHeight -1) + 2; //-- cast
				if(iBottom > oDoc.body.offsetHeight)
				{
					ifShimmer.style.top = oDoc.iMouseTop - (iBottom - oDoc.body.offsetHeight);
				}
				else
				{
					ifShimmer.style.top = oDoc.iMouseTop;// - iAdjustTop;
				}

				//-- if left exceeds page then adjust
				var iRight = (oDoc.iMouseLeft-1) + (ifShimmer.offsetWidth -1) + 2;
				if(iRight > oDoc.body.offsetWidth)
				{
					ifShimmer.style.left = oDoc.iMouseLeft - (iRight - oDoc.body.offsetWidth);
				}
				else
				{
					ifShimmer.style.left = oDoc.iMouseLeft;
				}
			}
			_current_table_contextmenu_item = ifShimmer;
			return false;
		}
	}


	//-- data table scroll
	function datatable_scroll(dataDiv)
	{
		var currScrollLeft = dataDiv.getAttribute("currScrollLeft");
		if(dataDiv.scrollLeft==currScrollLeft) return;

		//-- get parent then get header div
		var divHolder = app.get_parent_owner_by_tag(dataDiv,"DIV");
		var divHeader = app.get_parent_child_by_id(divHolder, "table_columns");
		if(divHeader!=null)
		{
			divHeader.scrollLeft = dataDiv.scrollLeft;
			dataDiv.setAttribute("currScrollLeft", dataDiv.scrollLeft);
		}
	}

	//-- if mouse if is over data table and within cell end show resize
	function datatable_set_cusor(e, aDoc)
	{
		if(!boolDataTableColResize)
		{
			currTableResizeTD = app.ev_source(e);
			var oDataHolder = app.get_parent_owner_by_tag(currTableResizeTD,'DIV');
			var iAdjust =oDataHolder.scrollLeft;
			//alert(currTableResizeTD.tagName)
			if( (currTableResizeTD.tagName=="TD") && ((currTableResizeTD.offsetLeft + - iAdjust + currTableResizeTD.offsetWidth - 3) < aDoc.iMouseLeft) )
			{
				aDoc.body.style.cursor="e-resize";
			}
			else
			{
				aDoc.body.style.cursor="default";
			}
		}
	}

	//-- data table track cursor
	function datatable_track_cursor()
	{
		if(boolDataTableColResize)
		{
			if(oVbar!=null) 
			{
				oVbar.style.left = currTableDoc.iMouseLeft;
			}
		}
	}


	//-- called when mouse is down after starting header resize
	function datatable_start_resize_header(e,aDoc)
	{

		//-- position the td resizer
		var ResizeTD = app.ev_source(e);
		if(ResizeTD.tagName=="TD")
		{
			//-- check that event took place to the right of td - within 3px
			var iLeft = new Number(app.eleLeft(ResizeTD));
			var iWidth = new Number(ResizeTD.offsetWidth);
			var oDataHolder = app.get_parent_owner_by_tag(ResizeTD,'DIV');
			var iAdjust =oDataHolder.scrollLeft;

			var iRight = iLeft + iWidth - iAdjust;
			if(aDoc.iMouseLeft > iRight-5)
			{
				currTableResizeTD = ResizeTD;
				boolDataTableColResize = true;
				oVbar = aDoc.getElementById(strResizeColBarId);
				if(oVbar!=null)
				{
					currTableDoc = aDoc;
					oVbar.style.display="block";
					//-- 			
					var iAdjust = (ResizeTD.getAttribute('type')=="mes")?16:13;
					oVbar.style.top = app.eleTop(ResizeTD) + ResizeTD.offsetHeight - iAdjust;
					oVbar.style.height="15px";
					oVbar.style.left = aDoc.iMouseLeft;
				}
			}
		}
	}

	//-- order column
	function datatable_mouseup_header(e,aDoc)
	{

		var orderTD = app.ev_source(e);
		if(orderTD.tagName=="DIV")
		{
			orderTD = orderTD.parentNode;
		}

		if(orderTD.tagName=="TD")
		{
			var oDivHeader = app.get_parent_owner_by_tag(orderTD,"DIV");
			var oDivHolder = app.get_parent_owner_by_tag(oDivHeader,"DIV");
			if(oDivHolder!=null)
			{
				var strCol = orderTD.getAttribute("dbname");
				var strDir = oDivHolder.getAttribute("orderdir");
				if(strDir==null || strDir=="")
				{
					strDir="DESC";
				}
				else
				{
					strDir=(strDir=="DESC")?"ASC":"DESC";
				}

				oDivHolder.setAttribute("orderby", strCol);
				oDivHolder.setAttribute("orderdir", strDir);

				//-- call function to filter
				if(oDivHolder.className=="dhtml_mes_table_holder")
				{
					if(app.oControlFrameHolder.refresh_data)app.oControlFrameHolder.refresh_data(oDivHolder);
				}
				else
				{
					oDivHolder.process_active_filter(oDivHolder);
				}

				//-- show arrow
				if(oDivHolder.orderTD)oDivHolder.orderTD.className="";
				oDivHolder.orderTD = orderTD;
				orderTD.className = "headertd-" + strDir;
			}
		}
	}

	//-- called when mouse is up after starting header resize
	function datatable_finish_resize_header()
	{
		//-- hide resizer
		currTableDoc.body.style.cursor="default";
		if(oVbar!=null)oVbar.style.display="none";

		//-- set new cell size
		var oDataHolder = app.get_parent_owner_by_tag(currTableResizeTD,'DIV');
		var iAdjust = oDataHolder.scrollLeft;

		var intNewTDWidth = currTableDoc.iMouseLeft - currTableResizeTD.offsetLeft + iAdjust;
		if(intNewTDWidth>5)
		{

			//alert(intNewTDWidth + " : " + currTableResizeTD.offsetWidth)
			if(app.isIE)
			{
				currTableResizeTD.style.width = intNewTDWidth;
			}
			else
			{
				currTableResizeTD.style.width = intNewTDWidth -15;
			}
			//alert(currTableResizeTD.style.width + " : " + currTableResizeTD.offsetWidth)
		
			//-- resize data
			datatable_resize_datacolumns(currTableResizeTD);
		}		

		//-- kill vars
		boolDataTableColResize = false;
		currTableResizeTD = null;
		currTableDoc=null;
	}

	//-- resize data cols to match headers
	function datatable_resize_datacolumns(oResizeTD,oHeaderHolder)
	{
		//-- get header div and table holder
		if(!oHeaderHolder) oHeaderHolder = app.get_parent_owner_by_id(oResizeTD,'table_columns');
		var oTableHolder = app.get_parent_owner_by_tag(oHeaderHolder,'DIV');

		var headerTable = app.get_parent_child_by_tag(oHeaderHolder, "TABLE");
		var aRow = headerTable.rows[0];
		var lastCell = aRow.cells[aRow.cells.length-1];
		lastCell.style.display='none';

		//-- get data table actual table holder ad col group
		var eDataTable = app.get_parent_child_by_id(oTableHolder,'datatable_datatable');
		if(eDataTable==null) return;

		var oDataHolder = app.get_parent_owner_by_tag(eDataTable,'DIV');

		var colGroup = app.get_parent_child_by_tag(eDataTable, "COLGROUP");
		if(colGroup==null) return;
	
		//-- get header col widths and then set data col widths
		var tblHeader = app.get_parent_child_by_tag(oHeaderHolder,"TABLE");
		eDataTable.style.width = tblHeader.offsetWidth;
		var rowHeader = app.get_parent_child_by_tag(tblHeader,"TR");
		var intcount = 0;
		
		for(var x=0; x < colGroup.childNodes.length; x++)
		{
			if(colGroup.childNodes[x].getAttribute("width")!=null)
			{
				var cellWidth = rowHeader.childNodes[x].offsetWidth;
				//if(colGroup.childNodes[x].getAttribute("width") != cellWidth)	
				//{
					//alert(cellWidth + " : " + colGroup.childNodes[x].getAttribute("width") + " : " + dataRowOne.childNodes[x].offsetWidth)
					colGroup.childNodes[x].setAttribute("width",cellWidth);				
				//}
			}
		}

		//-- if we have scrollbars make last header col bigger (to compensate for scrollbar 
		if(oDataHolder.clientWidth < oHeaderHolder.clientWidth)
		{
			//alert(oDataHolder.clientWidth +":"+ oTableHolder.offsetWidth)
			//alert(oHeaderHolder.clientWidth - oDataHolder.clientWidth)
			lastCell.style.display='';
			lastCell.style.width= oHeaderHolder.clientWidth - oDataHolder.clientWidth;
		}
	}

	//-- interactive filter has been selected
	function datatable_interactivefilter(eSelect,oE,boolProcess)
	{
		if(boolProcess==undefined)boolProcess=true;
		var oFiltersHolder = app.get_parent_owner_by_tag(eSelect,'DIV');		
		var oDivHolder = app.get_parent_owner_by_tag(oFiltersHolder,'DIV');
		
		oDivHolder.setAttribute("selectedfilter",eSelect.selectedIndex);
		oDivHolder.setAttribute("selectedsqlfilter",eSelect.options[eSelect.selectedIndex].value);

		//-- refresh data table
		if(oDivHolder.process_active_filter && boolProcess)
		{
			oDivHolder.process_active_filter(oDivHolder);
		}
	}

	function datatable_clearforloading(oTableHolder)
	{
		var oDataHolder = app.get_parent_child_by_id(oTableHolder,'div_data');
		oDataHolder.innerHTML = "<br><center>...loading data...please wait...</center>";
	}

	function datatable_paging(oDivContainer,totalRows,rowsPerPage,currentPage)
	{
		var filterDiv = app.get_parent_child_by_id(oDivContainer,'table_filters');
		if(filterDiv)
		{
			var filterTable = app.get_parent_child_by_tag(filterDiv, "TABLE");
			if(filterTable && filterTable.rows[0] && filterTable.rows[0].cells[1])
			{
				var strDisplay = (totalRows>rowsPerPage)?"block":"none";
				filterTable.rows[0].cells[0].style.display = strDisplay;

				var intPageCount = Math.ceil(totalRows / rowsPerPage);
				var textNode = app.get_parent_child_by_class(filterTable.rows[0],"paging_text");
				if(textNode)
				{
					textNode.innerText = "Page " + currentPage + " of " + intPageCount;
					filterDiv.setAttribute("pagenumber",currentPage);
					filterDiv.setAttribute("lastpagenumber",intPageCount);
				}
			}
		}
	}

	//-- output data table rows and align
	function datatable_draw_data(oTableHolder, strData , boolSelect)
	{

		top.debugstart("DATATABLE:datatable_draw_data","WORKSPACECONTROL");

		if(boolSelect==undefined)boolSelect=false;
		//-- get header div
		var oHeaderHolder = app.get_parent_child_by_id(oTableHolder,'table_columns');
		//-- disable user selection of column headers
		app.disableSelection(oHeaderHolder );

		var headerTable = app.get_parent_child_by_tag(oHeaderHolder, "TABLE");
		var aRow = headerTable.rows[0];
		var lastCell = aRow.cells[aRow.cells.length-1];
		lastCell.style.display='none';

		//-- get data holders
		var oDataHolder = app.get_parent_child_by_id(oTableHolder,'div_data');

		//-- disable user selection of column headers
		app.disableSelection(oDataHolder);

		//-- clear data
		$(oDataHolder).children().remove();

		//-- get colgroup widths
		var intTotalColWidth = 0;
		var strColGrouping = "<colgroup>";
		var tblHeader = get_parent_child_by_tag(oHeaderHolder,"TABLE");
		var rowHeader = get_parent_child_by_tag(tblHeader,"TR");
		for(var x=0; x < rowHeader.childNodes.length-1; x++)
		{
			var cellWidth = new Number(rowHeader.childNodes[x].offsetWidth);
			var cellAlign = rowHeader.childNodes[x].getAttribute("align");
			var cellName = rowHeader.childNodes[x].getAttribute("dbname");

			intTotalColWidth +=cellWidth;
			strColGrouping +='<col width="'+cellWidth+'" align="'+cellAlign+'" dbname="' + cellName + '"/>';
		}
		strColGrouping +='</colgroup>';

		//-- output data

		var intFilters = oTableHolder.getAttribute("hasfilters");
		var oFiltersHolder = app.get_parent_child_by_id(oTableHolder,'table_filters');
		var iFilterHeight = (oFiltersHolder!=null)?oFiltersHolder.offsetHeight:0;

		if(oTableHolder.offsetHeight>0)		
		{
			oDataHolder.style.height = oTableHolder.offsetHeight - oHeaderHolder.offsetHeight - iFilterHeight;
		}

		

		var mozWidthFix = (!app.isIE || app.isIE10Above)?"width:"+tblHeader.offsetWidth+";":"";
		oDataHolder.innerHTML = "<table border='0' id='datatable_datatable' class='dhtml_table_data' style='"+mozWidthFix+"' cellspacing='0'>" + strColGrouping + strData +"</table>";
		strData = null;

		//-- if we have scrollbars make last header col bigger (to compensate for scrollbar 
		if(oDataHolder.clientWidth < oHeaderHolder.clientWidth)
		{
			//alert(oDataHolder.clientWidth +":"+ oTableHolder.offsetWidth)
			//alert(oHeaderHolder.clientWidth - oDataHolder.clientWidth)
			lastCell.style.display='';
			lastCell.style.width= oHeaderHolder.clientWidth - oDataHolder.clientWidth;
		}
		//-- scroll back to where we were horiz
		oDataHolder.scrollLeft = oHeaderHolder.scrollLeft;

		//-- perform any afterdataloaded function
		var strFuncOnDataLoaded = oTableHolder.getAttribute("ondataloaded");
		if(strFuncOnDataLoaded!="")
		{
			eval(strFuncOnDataLoaded + "(oTableHolder,oDataHolder.childNodes[0].rows.length);");
		}

		//-- select 1st row
		if(boolSelect)
		{
			if(oDataHolder.childNodes[0].rows.length>0)	
			{
				app.mes_datarow_selected(oDataHolder.childNodes[0].rows[0]);
				oDataHolder.focus();
			}

		}

		top.debugend("DATATABLE:datatable_draw_data","WORKSPACECONTROL");

		return oDataHolder.childNodes[0].rows.length;
	}


	//--
	//-- highlight a datatable row
	function datatable_hilight(aRow, boolKeepSelection)
	{
		if(boolKeepSelection==undefined)boolKeepSelection=false;
		var oRowTable = get_row_datatable(aRow);//app.get_parent_owner_by_tag(aRow,'TABLE');		
		var currRowIndex = oRowTable.getAttribute("curr_row");
		if(currRowIndex!=null)
		{
			var arrIndexes = currRowIndex.split(",");
			//-- unselect previous selected row
			if(!boolKeepSelection)	
			{
					if(arrIndexes.length>0)
				{
					for(var x=0;x<arrIndexes.length;x++)
					{
						try
						{
							oRowTable.rows[arrIndexes[x]].style.backgroundColor = '#FFFFFF';							
						}
						catch (e)
						{
							oRowTable.rows[0].style.backgroundColor = '#FFFFFF';							
						}
					}
				}
				currRowIndex = "";
			}
		}
		else
		{
			currRowIndex = "";
		}

		if(aRow.style.background.toLowerCase() == app.ROW_HILITE_COLOR.toLowerCase())
		{
				aRow.style.background = '#FFFFFF';
				//-- remove index for selected group
				var strSaveIndex = "";
				var arrIndexes = currRowIndex.split(",");
				for(var x=0;x<arrIndexes.length;x++)
				{
					if(arrIndexes[x]!=aRow.rowIndex)
					{
						if(strSaveIndex!="")strSaveIndex+=",";
						strSaveIndex += oRowTable.rows[arrIndexes[x]].rowIndex+"";
					}
				}
		}
		else
		{

			aRow.style.background = app.ROW_HILITE_COLOR;
	
			//-- new index
			var strSaveIndex = currRowIndex;
			var arrIndexes = currRowIndex.split(",");
			var bSet = true;
			for(var x=0;x<arrIndexes.length;x++)
			{
				if(arrIndexes[x]!=false && arrIndexes[x]==aRow.rowIndex)
				{
					bSet=false;
					break;
				}
			}

			if(bSet)
			{
				if(strSaveIndex!="")strSaveIndex+=",";
				strSaveIndex += aRow.rowIndex+"";
			}

		}
		oRowTable.setAttribute("curr_row",strSaveIndex);
	}

	//--
	//-- highlight a datatable row
	function datatable_hilight_blurred_rows(aTable)
	{
		var currRowIndex = aTable.getAttribute("curr_row");
		if(currRowIndex!=null)
		{
			var arrIndexes = currRowIndex.split(",");
			if(arrIndexes.length>0)
			{
				for(var x=0;x<arrIndexes.length;x++)
				{
					try
					{
						//- -table may have been destroyed
						aTable.rows[arrIndexes[x]].style.background = ROW_HILITEBLUR_COLOR;
					}
					catch(e)
					{
					}
				}
			}

		}
	}


	//--
	//-- highlight a datatable row
	function datatable_hilight_selected_rows(aTable)
	{
		var currRowIndex = aTable.getAttribute("curr_row");
		if(currRowIndex!=null && currRowIndex!="")
		{
			var arrIndexes = currRowIndex.split(",");
			if(arrIndexes.length>0)
			{
				for(var x=0;x<arrIndexes.length;x++)
				{
					aTable.rows[arrIndexes[x]].style.background = ROW_HILITE_COLOR;
				}
			}

		}
	}


	//--
	//-- find tab item holder for data table and set a counter in it
	function datatable_set_tabholder_counter(eTableHolder, intRowCount)
	{
		var tabSpace = app.get_parent_owner_by_tag(eTableHolder,"DIV");
		if(tabSpace!=null)
		{
			//-- get parent owner
			var eTabControl = app.get_parent_owner_by_class(eTableHolder,"tabcontrol");
			if(eTabControl!=null)
			{
				var tiHolder = app.get_parent_child_by_id(eTabControl,tabSpace.getAttribute("tiname"));
				var strLabel = tiHolder.getAttribute("label");
				if(strLabel==null)
				{	
					strLabel = getElementText(tiHolder);
					tiHolder.setAttribute("label", strLabel);
				}

				setElementText(tiHolder, strLabel + " (" + intRowCount + ")");
			}
		}
	}

	//-- get column value for a given row
	function datatable_get_colvalue(aRow, strColName, boolFormatted)
	{
		if(boolFormatted==undefined) boolFormatted=false;

		//-- get data table holder ad col group
		var oDataHolder = app.get_parent_owner_by_id(aRow,'div_data');
		if(oDataHolder==null) return undefined;
		var colGroup = app.get_parent_child_by_tag(oDataHolder, "COLGROUP");
		if(colGroup==null) return undefined;

		//-- get col position for the one we want
		var intcount = -1;
		for(var x=0; x < colGroup.childNodes.length; x++)
		{
			if(colGroup.childNodes[x].getAttribute("dbname") != null)
			{
				intcount++;
				if(colGroup.childNodes[x].getAttribute("dbname") == strColName)	
				{
					if(boolFormatted)
					{
						var strValue = aRow.childNodes[intcount].getAttribute("dbvalue");
						if(strValue=="sat")strValue = app.getElementText(aRow.childNodes[intcount]);
					}
					else
					{
						var strValue = app.getElementText(aRow.childNodes[intcount]);
					}
					return strValue;
				}
			}
		}
		return undefined;
	}


	function get_row_datatable(aRow)
	{
		if(aRow)
		{
			while(aRow.parentNode.tagName!="TABLE")
			{
				aRow = aRow.parentNode;
			}
			return aRow.parentNode
		}
		return null;
	}

	function get_row_headertable(aRow)
	{
		var dataTable = app.get_row_datatable(aRow);
		if(dataTable!=null)
		{
			var oTableHolder = app.get_parent_owner_by_tag(dataTable,'DIV');
			if(oTableHolder!=null)return app.get_parent_child_by_id(oTableHolder,'table_columns');	
		}
		return null;
	}

	function get_row_tableholder(aRow)
	{
		while(aRow.parentNode.tagName!="DIV")
		{
			aRow = aRow.parentNode;
		}
		return aRow.parentNode


		//var dataTable = app.get_row_datatable(aRow);
		//if(dataTable!=null)
		//{
		//	return app.get_parent_owner_by_tag(dataTable,'DIV');
		//}
		//return null;
	}

	function get_row_datatable_selectedindexes(aRow)
	{
		if(aRow==undefined || aRow==null) return "-1";
		var dataTable = app.get_row_datatable(aRow);
		if(dataTable!=null)
		{
			//alert(dataTable.getAttribute("curr_row"))
			var strIndx = dataTable.getAttribute("curr_row");
			if(strIndx==null)strIndx="-1";
			return strIndx;
		}
		return "-1";
	}

		;;;;//-- functions to help control the behaviour of toolbars
var __array_toolbar_groups = new Array();
var __array_toolbar_lastitem = new Array();
var __array_menu_lastitem = new Array();
var __array_open_menus = new Array();
var __o_last_toolbar_item = null;
var __bCancelDocumentMouseUpHideEvent = false;

//-- hilite - makes it look active
function toolbar_mouseover(eToolBarItem, e)
{
	
	if(eToolBarItem.getAttribute("mo")=="1") 
	{
		return;
	}
	eToolBarItem.setAttribute("mo","1");


	//-- is it checked
	if(eToolBarItem.getAttribute("checked")=="1") 
	{
		eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button-select":"toolbar-item-select";
		return;
	}

	if(eToolBarItem.className == "toolbar-item-disable") return;
	if(eToolBarItem.className == "toolbar-item-select") return;
	if(eToolBarItem.className == "toolbar-button-select") return;
	

	eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button-high":"toolbar-item-high";

	//-- if last button has menu down then this one should as well
	var lastMenuDropped=false;
	var lastBTN = __array_toolbar_lastitem[eToolBarItem.getAttribute("pid")]
	if(lastBTN!=undefined)
	{
		try{
			var lastMenuDropped = lastBTN.getAttribute("mnudown");
		}
		catch(e){lastMenuDropped=false;}
	}


	if(lastBTN!=eToolBarItem)
	{
		hide_all_menu_divs();	

		//-- if last button was a enhanced menu then hide its children
		try
		{
			
			if(lastBTN!=undefined && lastBTN.getAttribute('displayenhanced') == "1")
			{
				lastBTN.popupmenu.hide();			
			}

		}	
		catch (e)
		{
		}	
	}


	//-- if lastmenu was drop the show this ones menu
	if(lastMenuDropped=="1")
	{
		eToolBarItem.setAttribute("mnudown",0);
	}
	else
	{
		eToolBarItem.setAttribute("mnudown",1);
	}
	toolbar_check_btn_type(eToolBarItem);

}


function toolbar_enhanced_hilo(aToolbarBtn, boolHi)
{
	//-- if enhanced we need to set last td border
	var iEnhanced = aToolbarBtn.getAttribute("enhanced");
	if(iEnhanced=="1")
	{
		var aTR = aToolbarBtn.childNodes[0].rows[0];
		if(aTR!=undefined)
		{
			var useCell = aTR.cells.length -1;
			var aDiv = aTR.cells[2].childNodes[0];
			if(aDiv!=undefined)
			{
				if(boolHi)
				{
					aDiv.style.borderLeft = '1px #000000 solid';
				}
				else
				{
					aToolbarBtn.className = "toolbar-item";
					aDiv.style.borderLeft = '';
				}
			}
		}
	}

}

//-- lolite - makes it look in active
function toolbar_mouseout(eToolBarItem, e)
{
	
	try
	{
		//-- is it checked
		if(eToolBarItem.getAttribute("checked")=="1") 
		{
			eToolBarItem.className = "toolbar-item-select";
			eToolBarItem.setAttribute("mo","0");
			return;
		}

		if(eToolBarItem.className == "toolbar-item-disable") 
		{
			eToolBarItem.setAttribute("mo","0");
			return;
		}
	}
	catch(e)
	{
		return;
	}

	if(eToolBarItem.getAttribute("mnudown")=="1") 
	{
		return;
	}

	eToolBarItem.setAttribute("mo","0");
	var iEnhanced = eToolBarItem.getAttribute("enhanced");
	if(iEnhanced=="1")
	{
		toolbar_enhanced_hilo(eToolBarItem, false);
	}
	else
	{
		eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button":"toolbar-item";
	}
}

//-- used to show enhanced menu options
function _toolbar_enhanced_mousedown(eToolBaritem,e)
{
	

	//-- 87222 - forfox not showing menu properly
	if(app.isFirefox)
	{
		if(eToolBaritem.getAttribute("mnudown")=="1")
		{
			//-- hide items
			eToolBaritem.setAttribute("mnudown","0");
			eToolBaritem.className = "toolbar-item-high";
		}
		else
		{
			eToolBaritem.setAttribute("mnudown","1");
			eToolBaritem.className = "toolbar-item-select";
		}
	}

	var strJsFunctionLoadMenuItems = eToolBaritem.getAttribute("enhancedmenuloader");
	var jsFunc = app[strJsFunctionLoadMenuItems];
	if(jsFunc!=undefined)
	{
		var iTop = app.eleTop(eToolBaritem) + eToolBaritem.offsetHeight;
		var iLeft = app.eleLeft(eToolBaritem.parentNode);
		jsFunc(eToolBaritem,iLeft,iTop,e);

	}
}

function toolbar_mouseup(eToolBarItem,e)
{
	if(eToolBarItem.className == "toolbar-item-disable") return;
	//__bCancelDocumentMouseUpHideEvent = true;
	
	return false;
}

//-- select - makes it look selected
function toolbar_mousedown(eToolBarItem, e)
{
	
	
	if(eToolBarItem.className == "toolbar-item-select") return;
	if(eToolBarItem.className == ("toolbar-button-select")) return;
	if(eToolBarItem.className == "toolbar-item-disable") return;

	hide_application_menu_divs()

	var eS = app.getEventSourceElement(e);
	if(eS!=null && eS.getAttribute("enhancedmenu")=="1")
	{
		eToolBarItem.setAttribute('displayenhanced',"1");
		_toolbar_enhanced_mousedown(eToolBarItem,e);
		return true;
	}
	eToolBarItem.setAttribute('displayenhanced',"0");

	//-- is this a sticky (once pressed stay depressed until another one in its group is pressed)
	if(eToolBarItem.getAttribute("stick")=="1") 
	{
		//-- check if another member of its group is checked if so uncheck it
		var strGroup = eToolBarItem.getAttribute("checkgrp");
		if(__array_toolbar_groups[strGroup])
		{
			__array_toolbar_groups[strGroup].className = "toolbar-item";
			__array_toolbar_groups[strGroup].setAttribute("checked","0");
		}
		eToolBarItem.setAttribute("checked","1");
		__array_toolbar_groups[strGroup] = eToolBarItem;
	}

	eToolBarItem.className = (eToolBarItem.getAttribute("btn")=="1")?"toolbar-button-select":"toolbar-item-select";
	return true;
}

function toolbar_item_check(strToolBarID, strToolBarItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var eDiv = document.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		toolbar_mousedown(eDiv);
	}
	return;


}

//--
//-- context menu item enable / disable 
function toolbarmenu_item_disable(strItemID , boolDisable,aDoc)
{
	strItemID = "mnu_" + strItemID;
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		oE.className =(boolDisable)?"mnu-disabled":"";
		app.toggleDisabled(oE,boolDisable);
	}
}

function toolbarmenu_item_sorh(strItemID , boolShow,aDoc)
{
	strItemID = "mnu_" + strItemID;
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		oE.style.display =(!boolShow)?"none":"";
	}
}


//--
//-- context menu item enable / disable 
function contextmenu_item_dore(eContextMenu, strItemID , boolEnable,aDoc)
{
	strItemID = "contextmnu_" + strItemID;
	if(boolEnable)
	{
		contextmenu_item_enable(eContextMenu, strItemID , aDoc);
	}
	else
	{
		//alert(strItemID)
		contextmenu_item_disable(eContextMenu, strItemID , aDoc);
	}
}

//-- diaable menu item - 
function contextmenu_item_disable(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		app.toggleDisabled(oE,true);
		oE.className="mnu-disabled";
		//-- get text element and reset color style
		oE.childNodes[1].childNodes[0].style.color="#808080";

		if(oE.getAttribute('disimg')!="" && oE.getAttribute('disimg')!=null)
		{
			//-- change image to disabled
			var oImg = oE.childNodes[0].childNodes[0].childNodes[0];
			if(oImg!=undefined && oImg.tagName=="IMG")
			{
				if(oImg.getAttribute('origimg')==null)oImg.setAttribute('origimg',oImg.src);
				oImg.src = oE.getAttribute('disimg');
			}
		}
	}
}

//-- enable menu item - 
function contextmenu_item_enable(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		app.toggleDisabled(oE,false);
		
		oE.className="";
		//-- get text element and reset color style
		oE.childNodes[1].childNodes[0].style.color="#000000";


		if(oE.getAttribute('disimg')!="" && oE.getAttribute('disimg')!=null)
		{
			//-- change image
			//-- change image to disabled
			var oImg = oE.childNodes[0].childNodes[0].childNodes[0];
			if(oImg!=undefined && oImg.tagName=="IMG")
			{
				if(oImg.getAttribute('origimg')!=null)oImg.src = oImg.getAttribute('origimg');
			}
		}
	}
}

//--
//-- context menu item hide / show
//--
function contextmenu_item_hors(eContextMenu, strItemID , boolShow,aDoc)
{
	//alert(strItemID)
	strItemID = "contextmnu_" + strItemID;
	if(boolShow)
	{
		contextmenu_item_show(eContextMenu, strItemID , aDoc);
	}
	else
	{
		//alert(strItemID)
		contextmenu_item_hide(eContextMenu, strItemID , aDoc);
	}
}

//-- hide menu item - 
function contextmenu_item_hide(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		oE.style.display="none";
	}
}

//-- show menu item - 
function contextmenu_item_show(eContextMenu, strItemID , aDoc)
{
	if(aDoc==undefined)aDoc=document;

	var oE = aDoc.getElementById(strItemID);
	if(oE!=null)
	{
		if(app.isIE)
		{
			oE.style.display="inline";
		}
		else
		{
			oE.style.display="table-row";
		}
	}
}


//-- set toolbar item label
function toolbar_item_setlabel(strToolBarID, strToolBarItemID , strLabel, aDoc)
{
	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		var pos = eDiv.childNodes[0].rows[0].childNodes.length-1;
		app.setElementText(eDiv.childNodes[0].rows[0].childNodes[pos]," "+strLabel);
	}
}

//--
//-- toolbar item enable disable etc
function toolbar_item_dore(strToolBarID, strToolBarItemID , boolEnable,aDoc)
{
	if(boolEnable)
	{
		//toolbar_item_enable(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			if(eDiv.getAttribute("checked")=="1")
			{
				toolbar_item_check(strToolBarID, strToolBarItemID , aDoc);
			}
			else
			{
				eDiv.className = "toolbar-item";
			}
			app.toggleDisabled(eDiv,false);

			if(eDiv.getAttribute('disimg')!="" && eDiv.getAttribute('disimg')!=null)
			{
				//-- change image
				//-- change image to disabled
				var oImg = eDiv.childNodes[0].rows[0].childNodes[0].childNodes[0];
				if(oImg!=undefined && oImg.tagName=="IMG")
				{
					if(oImg.getAttribute('origimg')!=null)oImg.src = oImg.getAttribute('origimg');
				}
			}
		}

	}
	else
	{
		//toolbar_item_disable(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			if(eDiv.getAttribute("checked")=="1")
			{
				toolbar_item_check(strToolBarID, strToolBarItemID , aDoc);
			}
			else
			{
				eDiv.className = "toolbar-item-disable";
			}
			app.toggleDisabled(eDiv,true);
			if(eDiv.getAttribute('disimg')!="" && eDiv.getAttribute('disimg')!=null)
			{
				//-- change image to disabled
				var oImg = eDiv.childNodes[0].rows[0].childNodes[0].childNodes[0];
				if(oImg!=undefined && oImg.tagName=="IMG")
				{
					if(oImg.getAttribute('origimg')==null)oImg.setAttribute('origimg',oImg.src);
					oImg.src = eDiv.getAttribute('disimg');
				}

			}
		}

	}
}

//-- diaable toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_disable(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;

	if(aDoc==undefined)aDoc=document;

	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.className = "toolbar-item-disable";
		app.toggleDisabled(eDiv,true);
	}


}

//-- enable toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_enable(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;

	if(aDoc==undefined)aDoc=document;

	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.className = "toolbar-item";
		app.toggleDisabled(eDiv,false);
	}
}

function toolbar_item_isvisible(strToolBarID, strToolBarItemID,aDoc)
{
	var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		return (eDiv.style.display != "none")?true:false;
	}
	return false;
}
//-- show or hide
function toolbar_item_sorh(strToolBarID, strToolBarItemID , boolEnable,aDoc)
{
	if(boolEnable)
	{
		//toolbar_item_show(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			eDiv.style.display = "block";		
		}

	}
	else
	{
		//toolbar_item_hide(strToolBarID, strToolBarItemID , aDoc);
		var eDiv = aDoc.getElementById("tbi_" + strToolBarItemID);
		if(eDiv!=null)
		{
			eDiv.style.display = "none";
		}

	}
}


//-- hide toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_hide(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;

	if(aDoc==undefined)aDoc=document;

	var eDiv = document.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.style.display = "none";
	}
	return;

}

//-- show toolbar item - if more than one toolbar with same name it will apply to both
function toolbar_item_show(strToolBarID, strToolBarItemID , aDoc)
{
	strToolBarID = "toolbar_" + strToolBarID;
	if(aDoc==undefined)aDoc=document;

	var eDiv = document.getElementById("tbi_" + strToolBarItemID);
	if(eDiv!=null)
	{
		eDiv.style.display = "block";
	}


	return;

}


//-- called when clicked
//-- check btn type - if menu then display appropiriate menu
function toolbar_check_btn_type(aBtn)
{
	//-- store this item as last clicked
	__array_toolbar_lastitem[aBtn.getAttribute("pid")] = aBtn;
	
	if(aBtn.getAttribute('displayenhanced') == "1") 
	{
		if(aBtn.popupmenu)aBtn.popupmenu.hide();
		if(aBtn.getAttribute("mnudown")=="1")
		{
			aBtn.setAttribute("mnudown","0");
			aBtn.className = "toolbar-item-high";
		}
		else
		{
			aBtn.setAttribute("mnudown","1");
			aBtn.className = "toolbar-item-select";
			if(aBtn.popupmenu)
			{
				aBtn.popupmenu.show();
			}
		}
	}
	else
	{
		var strType = aBtn.getAttribute("btntype");
		if(strType=="menu")
		{
			if(aBtn.getAttribute("mnudown")=="1")
			{
				hide_all_menu_divs();
				aBtn.setAttribute("mnudown","0");
				aBtn.className = (aBtn.getAttribute("btn")=="1")?"toolbar-button-high":"toolbar-item-high";			
			}
			else
			{
				showBtnMenu(aBtn,false);
			}

		}
		else
		{
			aBtn.setAttribute("mnudown","0");
			aBtn.className = (aBtn.getAttribute("btn")=="1")?"toolbar-button-high":"toolbar-item-high";
		}
	}
	__o_last_toolbar_item = aBtn;
}

function showBtnMenu(aBtn, boolForceHide)
{
		try
		{
			var aDoc = app.getEleDoc(aBtn);	
		}
		catch (e)
		{
			return;
		}
		

		var menuDiv	= aDoc.getElementById("mnu_"+ aBtn.id);		
		if(menuDiv==null)return;

		//-- is it already checked? if so hide menu
		if(boolForceHide==undefined)boolForceHide=false;
		var boolShow=true;
		try{

			if((aBtn.getAttribute("mnudown")=="1")||(boolForceHide))
			{
				boolShow=false;
				var btnoritem = (aBtn.getAttribute("btn")=="1")?"button":"item";
				aBtn.className = (!boolForceHide)?"toolbar-"+btnoritem+"-high":"toolbar-"+btnoritem;
				aBtn.setAttribute("mnudown","0");
			}
			else
			{
				//-- keep menu item depressed
				aBtn.setAttribute("mnudown","1");
				if(aBtn.className.indexOf("toolbar-button")==-1) aBtn.className = "toolbar-item-select";
				var btnoritem = (aBtn.getAttribute("btn")=="1")?"button":"item";
				aBtn.className = "toolbar-"+btnoritem+"-select";

			}

			//-- get menu for btn
			if(menuDiv!=null)
			{
				//-- just hiding so return
				if(!boolShow)
				{
					//menuDiv.style.visibility="hidden";
					menuDiv.style.display="none";
					var oIF = _get_menu_shimmer(menuDiv);
					oIF.style.display="none";
					return;
				}
				else
				{
					if(menuDiv.style.display=="block") return; // already visible
					menuDiv.style.display="block";
				}

				var iTop = app.eleTop(aBtn) + aBtn.offsetHeight - 1;
				menuDiv.style.top = iTop;
				//-- for safari have to resize table
				if((app.isIE || app.isSafari || app.isChrome ) && menuDiv.getAttribute("resized")!="1") 
				{
					var tbl = aDoc.getElementById("mnu_tbl_" + aBtn.id);

					if(tbl!=null)
					{
						var iWidth = 0;
						for(var x=0;x<tbl.rows.length;x++)
						{
							var oDiv = tbl.rows[x].cells[1].childNodes[0];
							if(oDiv.className!="mnu-splitter")
							{
								if(iWidth<oDiv.offsetWidth)	
								{
									iWidth = oDiv.offsetWidth;
								}
							}
						}

						for(var x=0;x<tbl.rows.length;x++)
						{
							tbl.rows[x].cells[1].style.width= iWidth;
						}

					}
					menuDiv.setAttribute("resized","1")	;	
				}

				//- -check if need to repos as may be going off to righ of form
				var iLeft = app.eleLeft(aBtn)-0;
				var iWidth = menuDiv.offsetWidth-0;
				var iRight = iWidth + iLeft
				var eleDoc = app.getEleDoc(aBtn);
				if(iRight>eleDoc.body.offsetWidth)
				{
					iLeft = iLeft - (iWidth-aBtn.offsetWidth);

				}
				menuDiv.style.left = iLeft;

				var oIF = _get_menu_shimmer(menuDiv);
				oIF.style.top = iTop;
				oIF.style.left = iLeft;

				oIF.style.display="none";
				if(boolShow)
				{
					oIF.style.width=menuDiv.offsetWidth;
					oIF.style.height=menuDiv.offsetHeight;
				}
			}
		}
		catch(e){}
}

//-- menu item clicked so action and hide options div
function menu_item_clicked(anItem,e)
{
	var strType = anItem.getAttribute("mnutype");
	var strContextMenu = anItem.getAttribute("context");
	if(strContextMenu=="1")
	{
		hide_all_menu_divs();
		return true;
	}

	if(strType!="menu")	
	{
		hide_all_menu_divs();

		//-- get parent div and see if its parent is a toolbar btn if so hide
		var pEle = app.get_parent_owner_by_tag(anItem,"DIV");
		if(pEle!=null)
		{
			var aDoc = app.getEleDoc(anItem);
			var ppItem = aDoc.getElementById(pEle.getAttribute("pid"));
			if(ppItem!=null)
			{
				if(ppItem.id.indexOf("tbi")==0)
				{
					//-- deactivate toolbar item
					showBtnMenu(ppItem, true);
				}
			}		
		}
		if(__o_last_toolbar_item!=null)	showBtnMenu(__o_last_toolbar_item, true);
		return true;
	}

	return false;

}

function contextmenu_item_mousedown(anItem,e)
{
	//-- hide menu
	var pEle = app.get_parent_owner_by_tag(anItem,"DIV");
	if(pEle!=null)
	{
		pEle.style.display="none";
	}

	if(anItem.className=="mnu-disabled") return false;
	return true;
}


//-- check menu item
function menu_check_item(anItem,e)
{
	

	//-- get parent item and make
	var aDoc = app.getEleDoc(anItem);
	var pItem = aDoc.getElementById(anItem.getAttribute("pid"));
	var lastItem = __array_menu_lastitem[anItem.getAttribute("pid")];
	if(lastItem!=undefined)
	{
		if(pItem!=lastItem && anItem!=lastItem)
		{
			//-- if last item has a menu down then hide it
			try
			{
				if(lastItem.getAttribute("mnudown")=="1")
				{
					if(lastItem.className!="")lastItem.className="";
					showMenuMenu(lastItem,true)
					lastItem.setAttribute("mnudown","0");

					for(var strMenuID in __array_open_menus)
					{
						if(__array_open_menus[strMenuID]!=null)
						{
							if(pItem.id!=strMenuID)	__array_open_menus[strMenuID].style.display="none";
						}
					}
				}
			}catch(e){}
		}
	}

	//-- parent is also a menu item so keep hihglighted
	if(pItem.id.indexOf("mnu")==0)
	{
		pItem.className="mnu-highlighter";
	}

	//-- if has children then show its menu
	var strType = anItem.getAttribute("mnutype");
	if(strType=="menu")
	{
		showMenuMenu(anItem);
		anItem.setAttribute("mnudown","1");
	}

	return false;
}

function showMenuMenu(anItem,boolHide)
{
	//-- get menu for btn
	if(boolHide==undefined)boolHide=false;
	var aDoc = app.getEleDoc(anItem);
	if(aDoc==null)return;

	//var arrmnu	= app.get_children_by_att_value(aDoc.body, "pid", anItem.id,false);
	var menuDiv = aDoc.getElementById("mnu_" + anItem.id);
	if(menuDiv!=null && anItem!=menuDiv)
	{
		var iTop = app.eleTop(anItem) + anItem.offsetHeight - 18;
		var iLeft = app.eleLeft(anItem) + anItem.offsetWidth-15;

		//--
		//-- this menu items suyb menu is loaded using a js function
		var strJsFunctionLoadMenuItems = anItem.getAttribute("itemloader");
		var jsFunc = app[strJsFunctionLoadMenuItems];
		if(jsFunc!=undefined)
		{
			if(!boolHide)
			{
				jsFunc(anItem,iLeft,iTop,window.event);
			}
			else
			{	
				anItem.popupmenu.hide();
			}
			return;
		}

		//-- items have been loaded by php so just show or hide containing div
		var oIF = _get_menu_shimmer(menuDiv);
		if(boolHide)
		{
			menuDiv.style.display="none";
			oIF.style.display="none";
			__array_open_menus[anItem.id] = null;
		}
		else
		{
			__array_open_menus[anItem.id] = menuDiv;
			menuDiv.style.top = iTop
			menuDiv.style.left = iLeft
			menuDiv.style.display="inline";

			//-- for safari have to resize table
			if((app.isSafari || app.isChrome) && menuDiv.getAttribute("resized")!="1")
			{
				var tbl = menuDiv.childNodes[0];
				if(tbl!=null)
				{
					var iWidth = 0;
					for(var x=0;x<tbl.rows.length;x++)
					{
						var oDiv = tbl.rows[x].cells[1].childNodes[0];
						if(iWidth<oDiv.offsetWidth)	iWidth = oDiv.offsetWidth;
					}

					for(var x=0;x<tbl.rows.length;x++)
					{
						tbl.rows[x].cells[1].style.width= iWidth;
					}

				}
				menuDiv.setAttribute("resized","1")	;	
			}

			//-- move shimmer
			oIF.style.top = iTop;
			oIF.style.left = iLeft;
			oIF.style.display="inline";
			oIF.style.width=menuDiv.offsetWidth;
			oIF.style.height=menuDiv.offsetHeight;
		}
	}
}

//-- create iframe to place under menu div
function _get_menu_shimmer(menuDiv)
{
	var aDoc = app.getEleDoc(menuDiv);

	if(aDoc==null)return;

	var strIframeID = menuDiv.id + "_if";
	var oIframe = aDoc.getElementById(strIframeID);
	if(oIframe==null)
	{
		//-- create it
		var strHTML = "<iframe id='"+strIframeID+"' class='iframe-shimmer' frameborder='0'></iframe>";
		app.insertBeforeEnd(aDoc.body,strHTML);

		//-- get pointer
		oIframe = aDoc.getElementById(strIframeID);
		oIframe.style.zIndex = menuDiv.style.zIndex-1;
	}
	return oIframe;
}

function menu_item_hover(aRow,e)
{
	
	
	if(aRow.className=="mnu-disabled") 
	{
		return false;
	}

	//-- highlight menu if not done already
	if(aRow.className=="mnu-highlighter") return false;
	aRow.className="mnu-highlighter";
	menu_check_item(aRow,e)

	__array_menu_lastitem[aRow.getAttribute("pid")] = aRow;
	//aRow.style.backgroundColor = "#B6BD02";
	//aRow.style.color = "#ffffff";
}

function menu_item_out(aRow,e)
{
	

	if(aRow.className=="mnu-disabled") return false;	

	//-- reset item style
	if(aRow.className=="") return false;
	aRow.className="";
}


//-- hide menu divs when moving from toolbar item to toolbar item
function hide_all_menu_divs(excludeItems)
{
	if(app._swcore.bHidingMenus) return;
	if(excludeItems==undefined)excludeItems=[];
	var anItem;
	var aDoc;
	var pItem;
	app._swcore.bHidingMenus = true;
	for(strPID in __array_menu_lastitem)
	{
		anItem = __array_menu_lastitem[strPID];
		try
		{
			anItem.className="";			
			showMenuMenu(anItem,true);
			anItem.setAttribute("mnudown","0");
		}
		catch (e)
		{
			continue;
		}

	}

	if(__o_last_toolbar_item!=null)	
	{
		showBtnMenu(__o_last_toolbar_item, true);
	}

	__array_menu_lastitem= new Array();
	
	app._swcore.bHidingMenus = false;
}

function hide_application_menu_divs(e)
{
	if(e && app.get_parent_owner_by_class(e.srcElement,"menu-holder"))
	{
		
		return false;
	}
	hide_all_menu_divs()
}
;;;;//-- 07.10.2009
//-- functions for managing servicedesk view - i.e. selecting calls, setting context menu and toolbar options etc

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

//-- will always tore the last biggest helpdesk last update x for the current service desk view
var _LAST_HELPDESKVIEW_LASTACTDATEX = global.GetCurrentEpocTime();

//-- called when service desk tree has loaded - we then poll for workspace document loaded and once done we get call lists
var _servicedesk_tree = null;
function servicedesk_tree_loaded(aTree)
{
	//-- open to logged in analyst
	_servicedesk_tree = aTree;
	setTimeout("on_service_desk_workspace_loaded()",10);
}

function on_service_desk_workspace_loaded()
{
	if(app.oWorkspaceFrameHolder.iamready!=undefined && app.oWorkspaceFrameHolder.iamready)
	{
		_ServiceDeskDocumentElement = app.oWorkspaceFrameHolder.document;
		//-- view as been initialise by call href="hsl:mycalls" or similar
		if(boolHSLACTION)
		{
			boolHSLACTION = false;
			_process_hsl_servicedesk_action();
		}
		else
		{
			//-- open to current context
			var pos = _servicedesk_tree.getNodePositionByID(session.currentAnalystId,"grp_" + session.currentGroupId);
			_servicedesk_tree.openTo(pos,true,true,true);
		}
	}
	else
	{
		setTimeout("on_service_desk_workspace_loaded()",10);
	}
}

//-- load service desk view, select tab item and a filter
var boolHSLACTION = false;
var strHSLACTION_action = "";
var strHSLACTION_tfilter = "";
var strHSLACTION_lfilter = "";
var strHSLACTION_ttabitem = "";
var strHSLACTION_ltabitem = "";
function hslaction_servicedesk_view(strAction, arrInfo)
{
		//-- load or switch to view
	strHSLACTION_action =strAction;
	boolHSLACTION = true;
	strHSLACTION_tfilter = "";
	strHSLACTION_ttabitem = "";
	strHSLACTION_lfilter = "";
	strHSLACTION_ltabitem = "";


	//--
	//-- var arrInfo = strParams.split("&");
	for(var strParam in arrInfo)
	{
		var strValue = arrInfo[strParam];

		if(strParam=="tab")
		{
			strHSLACTION_ttabitem = strValue;
		}
		else if(strParam=="filter")
		{
			strHSLACTION_tfilter = strValue;
		}
		else if(strParam=="lfilter")
		{
			strHSLACTION_lfilter = strValue;
		}
		else if(strParam=="ltab")
		{
			strHSLACTION_ltabitem = strValue;
		}
	}

	//-- active bar
	application_navbar.activatebar("helpdesk_view");

	//-- if already loaded
	if(app.oWorkspaceFrameHolder.iamready!=undefined && app.oWorkspaceFrameHolder.iamready)
	{
		_process_hsl_servicedesk_action();
	}
}

function _process_hsl_servicedesk_action()
{
	//-- ok to switch to tab item and filter
	if(strHSLACTION_ttabitem!="")
	{
		//--
		//-- get top tab control and select tabitem by index and set filter if provided
		var arrTabControls = app.oWorkspaceFrameHolder.get_workspace_controls_by_type("tabcontrol-holder");
		if(arrTabControls.length>0)
		{
			var tabControl = arrTabControls[0];
			var tabItemsHolder = app.get_parent_child_by_id(tabControl,"itemholder");
			if(tabItemsHolder!=null)
			{
				strHSLACTION_ttabitem++;strHSLACTION_ttabitem--;
				var tabItem = tabItemsHolder.childNodes[strHSLACTION_ttabitem];
				if(tabItem)
				{
					tabItem.click();
					if(strHSLACTION_tfilter!="")
					{
						var tabItemSpaceHolder = app.get_parent_child_by_id(tabControl,"tabspace");
						var tabSpace = app.get_parent_child_by_id(tabItemSpaceHolder,"tispace_" + tabItem.id);
						if(tabSpace!=null)
						{
							var selectboxFilter = app.get_parent_child_by_id(tabSpace,"dtable_select_filter");
							if(selectboxFilter!=null)
							{
								if(app.select_selectbox_value(selectboxFilter,strHSLACTION_tfilter))
								{
									app.datatable_interactivefilter(selectboxFilter,null,true);
								}
							}
						}
					}
				}
			}
		}
	}

	//--
	//-- get bottom tab control and select tabitem by index and set filter if provided
	if(strHSLACTION_ltabitem!="")
	{
		var arrTabControls = app.oWorkspaceFrameHolder.get_workspace_controls_by_type("tabcontrol-holder");
		if(arrTabControls.length>0)
		{
			var tabControl = arrTabControls[1];
			var tabItemsHolder = app.get_parent_child_by_id(tabControl,"itemholder");
			if(tabItemsHolder!=null)
			{
				strHSLACTION_ltabitem++;strHSLACTION_ltabitem--;
				var tabItem = tabItemsHolder.childNodes[strHSLACTION_ltabitem];
				if(tabItem)
				{
					tabItem.click();
					if(strHSLACTION_lfilter!="")
					{
						var tabItemSpaceHolder = app.get_parent_child_by_id(tabControl,"tabspace");
						var tabSpace = app.get_parent_child_by_id(tabItemSpaceHolder,"tispace_" + tabItem.id);
						if(tabSpace!=null)
						{
							var selectboxFilter = app.get_parent_child_by_id(tabSpace,"dtable_select_filter");
							if(selectboxFilter!=null)
							{
								if(app.select_selectbox_value(selectboxFilter,strHSLACTION_lfilter))
								{
									app.datatable_interactivefilter(selectboxFilter,null,true);
								}
							}
						}
					}
				}
			}
		}
	}

	//-- set to tree pos which will process refresh
	if(strHSLACTION_action=="mycalls")
	{
		var pos = _servicedesk_tree.getNodePositionByID(app._analyst_id,"grp_"+ app._analyst_supportgroup);
		_servicedesk_tree.openTo(pos,true,true,true);
	}
	else if(strHSLACTION_action=="mygroupcalls")
	{
		var pos = _servicedesk_tree.getNodePositionByID("grp_"+app._analyst_supportgroup);
		_servicedesk_tree.openTo(pos,true,true,true);
	}

}


//-- called when an element is dropped ono service desk
function _servicedesk_drop_assignment(aNode, eleDropped)
{
	app._current_draganddrop_ele = null;
	if(eleDropped!=null && eleDropped.tagName=="TR")
	{
		var tableConrolDivHolder = eleDropped.parentNode.parentNode.parentNode.parentNode;
		if(tableConrolDivHolder!=null && tableConrolDivHolder.tagName=="DIV")
		{
			if(tableConrolDivHolder.getAttribute("dbtablename")=="opencall") // || tableConrolDivHolder.getAttribute("dbtablename")=="calltasks")
			{
				//-- ok to assign
				var strOwnerName = "";
				var strGroupName = "";
				var strOwner = ""; 
				var strSuppgroup = "";
				var str3P="";

				var topNode = null;
				var pNode= aNode.tree.getNodeByID(aNode.pid);
				while(pNode!=null)
				{
					if(pNode.pid==-1)
					{
						topNode = pNode;
						break;
					}
					pNode= aNode.tree.getNodeByID(pNode.pid);
					if(pNode!=null) topNode = pNode;
				}


				var str3P="";
				//-- get owner and suppgroup
				if(aNode.nodeonly)
				{
					var strOwnerName = aNode.title;
					var strGroupName = pNode.title;
					var strOwner = aNode.id; 
					var strSuppgroup = aNode._suppgroup;

					//-- if we are using 3p then will need to set context
					if(topNode.id=="_THIRDPARTY")
					{
						var pNode= aNode.tree.getNodeByID(aNode.pid);
						str3P = aNode.name;
						strOwner = pNode.id;
						strSuppgroup = "_THIRDPARTY";
					}
				}
				else
				{
					var strOwner = ""; 
					var strSuppgroup = aNode._suppgroup;
					var strOwnerName = aNode.title;
					var strGroupName = aNode.title;

					//-- if we are using 3p then will need to set context
					if(aNode.id=="_THIRDPARTY")
					{
						strOwner = "";
						strSuppgroup = "_THIRDPARTY";
					}
					else if(aNode.pid=="_THIRDPARTY")
					{
						strOwner = aNode.id;
						strSuppgroup = "_THIRDPARTY";
					}
				}

				if(strSuppgroup!="")
				{
						//-- assign call(s)
						_assigncall(_CurrentSelectedServiceDeskCallrefs,strOwner,strSuppgroup,str3P,window);
						//-- refresh rows
						var strIndexes = app.get_row_datatable_selectedindexes(eleDropped);
						var arrRowIndexes = strIndexes.split(",");
						for (var x=arrRowIndexes.length;x>=0;x--)
						{
							_refresh_servicedesk_row(_CurrentServiceDeskTable.rows[arrRowIndexes[x]]);
						}
				}
			}
		}
	}
}



//--
//-- function that will refresh service desk view based on selected node or folder from service desk tree
var _last_servicedesk_node = null;
var __sd_OwnerName = "";
var __sd_GroupName = "";
var __sd_OwnerID = "";
var __sd_GroupID = "";

function _servicedesk_tree_selection(aNode, strControlID)
{
	if(__SERVICEDESK_CONTEXT_MENU!=null)
	{
		__SERVICEDESK_CONTEXT_MENU.style.display="none";
		__SERVICEDESK_CONTEXT_MENU.innerHTML = "";
		_disable_servicedesk_toolbar(app.getEleDoc(__SERVICEDESK_CONTEXT_MENU));
	}

	var topNode = null;
	var pNode= aNode.tree.getNodeByID(aNode.pid);
	while(pNode!=null)
	{
		if(pNode.pid==-1)
		{
			topNode = pNode;
			break;
		}
		pNode= aNode.tree.getNodeByID(pNode.pid);
		if(pNode!=null) topNode = pNode;
	}

	var str3P="";
	//-- get owner and suppgroup
	if(aNode.nodeonly)
	{
		var strOwnerName = aNode.name;
		var strGroupName = pNode.title;
		var strOwner = aNode.id; 
		var strSuppgroup = aNode._suppgroup;

		//-- if we are using 3p then will need to set context
		if(topNode.id=="_THIRDPARTY")
		{
			var pNode= aNode.tree.getNodeByID(aNode.pid);
			str3P = aNode.name;
			strOwner = pNode.id;
			strSuppgroup = "_THIRDPARTY";
		}

		//-- switch context
		if(!session.SwitchContext(strOwner,strSuppgroup))
		{
			//-- reset rree
			aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
			return;
		}
	}
	else
	{
		var strOwner = ""; 
		var strSuppgroup = aNode._suppgroup;
		var strOwnerName = aNode.title;
		var strGroupName = aNode.title;


		//-- if we are using 3p then will need to set context
		if(aNode.id=="_THIRDPARTY")
		{
			strOwner = "%";
			strSuppgroup = "_THIRDPARTY";
			if(!session.SwitchContext("",strSuppgroup))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;
			}
		}
		else if(aNode.pid=="_THIRDPARTY")
		{
			strOwner = aNode.id;
			strSuppgroup = "_THIRDPARTY";
			if(!session.SwitchContext(strOwner,strSuppgroup))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;

			}
		}
		else if(aNode.id == "swhd")
		{
			strOwner = "%";
			strSuppgroup = "%";

			//-- switch context
			if(!session.SwitchContext("",""))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;
			}
		}
		else
		{
			//-- switch context
			if(!session.SwitchContext("",strSuppgroup))
			{
				//-- reset rree
				aNode.tree.s(_last_servicedesk_node._nodearraypos,false);
				return;
			}
		}
	}

	//-- store doc wide var
	__sd_OwnerName = strOwnerName;
	__sd_GroupName = strGroupName;
	__sd_OwnerID = strOwner;
	__sd_GroupID = strSuppgroup;



	top.debugstart("Load Servicedesk Data:"+aNode.title,"SERVICEDESK");

	app.set_right_title("Service Desk : " + aNode.title)
	_last_servicedesk_node = aNode;

	var strSQLParams = "&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);

	//-- get data tables in service desk view
	var d = app.oWorkspaceFrameHolder.document;
	var strAttName = (app.isIE && !app.isIE10Above)?"className":"class";
	var arrDataTables =	app.get_children_by_att_value(d.body, strAttName, "dhtml_div_data",false);
	for(var x=0; x < arrDataTables.length;x++)
	{
		if(arrDataTables[x].getAttribute("outlookid").toLowerCase() == strControlID.toLowerCase())
		{
			var oDivTableHolder = d.getElementById(arrDataTables[x].getAttribute("parentholderid"));

			//-- store atts for when we change table interactive filters
			arrDataTables[x].parentNode.process_active_filter = _servicedesk_apply_tablefilter; //- -assign function to tables filter apply

			arrDataTables[x].parentNode.setAttribute("thirdparty",str3P);
			arrDataTables[x].parentNode.setAttribute("analystid",strOwner);
			arrDataTables[x].parentNode.setAttribute("groupid",strSuppgroup);
			var iCurrFilter = arrDataTables[x].parentNode.getAttribute("selectedfilter");
			if(iCurrFilter==null)iCurrFilter="";

			//-- refresh this data control
			var strArgs = "tablepos="+oDivTableHolder.getAttribute("tablepos")+"&outlookid="+strControlID+"&datatableid=" + arrDataTables[x].parentNode.id;
			strArgs += strSQLParams + "&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&tablefiltername=&tablefilterindex=" + iCurrFilter; //- -apply initial filter
	
			var tableParentNode = arrDataTables[x].parentNode;

			datatable_clearforloading(tableParentNode);
			_servicedesk_settable_tablabel(oDivTableHolder, "...");
			var strURL = app.get_service_url("call/getservicedeskcalls","");
			app.get_http(strURL,strArgs, false, false,function(strData,drawToTableContainer,ohttp)
			{
				var arrData = strData.split("[swhdrc]");
				var totalRowCount = arrData[0]-0;
				var pageNumber = arrData[1]-0;
				//-- do we need to show paging toolbar
				app.datatable_paging(drawToTableContainer.parentNode, totalRowCount,100,pageNumber);
				_servicedesk_settable_tablabel(drawToTableContainer, totalRowCount);
				app.datatable_draw_data(drawToTableContainer, arrData[2]);


			},tableParentNode);
		}
	}		

	top.debugend("Load Servicedesk Data:"+aNode.title,"SERVICEDESK");

	return false;
}

function _servicedesk_settable_tablabel(eTableHolder, intRowCount)
{
	var d = app.oWorkspaceFrameHolder.document;

	if(intRowCount==undefined)
	{
			var oDataHolder = app.get_parent_child_by_id(eTableHolder,'div_data');
			if(oDataHolder!=null)
			{
				var tblData = app.get_parent_child_by_tag(oDataHolder,"TABLE");
				intRowCount = tblData.rows.length;
			}
	}
	//-- set tab labels - get table parent
	var strTabItemID = "ti_" + eTableHolder.id;
	var eTab = d.getElementById(strTabItemID);
	if(eTab!=null)
	{		
		//-- build global params path to view
		var strViewPath = "views/helpdesk view/" + eTab.getAttribute("gparam");
		var strTabText= app.dd.GetGlobalParamAsString(strViewPath +"/TabName");
		if(strViewPath.indexOf("My Tasks View")>-1)
		{
			var strMyTab = "TabNameMyTasks";
			var strOtherTab = "TabNameTasks";
		}
		else
		{
			var strMyTab = "TabNameMyCalls";
			var strOtherTab = "TabNameCalls";
		}
		
		//-- check if we need to replace any %1 , %2 etc
		if(__sd_OwnerID!="%" && __sd_OwnerID!="")
		{
			if(__sd_OwnerID==session.analystid)
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/" + strMyTab);
			}
			else
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/"+ strOtherTab);
			}
		}
		else if(__sd_GroupID!="%")
		{
			if(__sd_GroupID==session.groupid)
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/TabNameMyGroup");
			}
			else
			{
				strTabText = app.dd.GetGlobalParamAsString(strViewPath +"/TabNameGroup");

			}
		}
		if(strTabText=="")strTabText =app.dd.GetGlobalParamAsString(strViewPath +"/TabName");


		//-- replace any %
		strTabText = app.string_replace(strTabText,"%1",__sd_OwnerName,true);
		strTabText = app.string_replace(strTabText,"%2",__sd_GroupName,true);
		strTabText = app.string_replace(strTabText,"%3",__sd_OwnerID,true);
		strTabText = app.string_replace(strTabText,"%4",__sd_GroupID,true);
		strTabText = app.string_replace(strTabText,"%5",intRowCount,true);

		app.setElementText(eTab,strTabText)
	}
}

//-- called when service desk data table is filtered using active filter
function _servicedesk_apply_tablefilter(oDivTableHolder, boolForPaging)
{
	//-- store atts for when we change table interactive filters
	if(oDivTableHolder==undefined)oDivTableHolder=this;
	var oDataTable = app.get_parent_child_by_id(oDivTableHolder,"div_data");
	if(oDataTable!=null)
	{
			var str3P =	oDivTableHolder.getAttribute("thirdparty");
			var strOwner = oDivTableHolder.getAttribute("analystid");
			var strSuppgroup = oDivTableHolder.getAttribute("groupid");

			var strOrderCol = oDivTableHolder.getAttribute("orderby");
			var strOrderDir = oDivTableHolder.getAttribute("orderdir");
			if(strOrderCol==null)strOrderCol="";
			if(strOrderDir==null)strOrderDir="";


			var iCurrFilter =oDivTableHolder.getAttribute("selectedfilter");
			if(iCurrFilter==null)iCurrFilter="";


			var intGetPage = (boolForPaging)?oDivTableHolder.getAttribute("page"):1;
			if(intGetPage==null || intGetPage==undefined) intGetPage=1;

			//-- 12.12.12 - nwj - 90128 - removed use of staticfilter clientside
			var strSQLParams = "&orderby="+strOrderCol+"&orderdir="+strOrderDir+"&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);
			var strArgs = "tablepos="+oDivTableHolder.getAttribute("tablepos")+"&_pagenumber="+ intGetPage +"&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&outlookid="+oDataTable.getAttribute('outlookid')+"&datatableid=" + oDivTableHolder.id + "&tablefiltername=&tablefilterindex=" + iCurrFilter;
			strArgs += strSQLParams;
	
			datatable_clearforloading(oDivTableHolder);
			_servicedesk_settable_tablabel(oDivTableHolder, "...");
			var strURL = app.get_service_url("call/getservicedeskcalls","");
			app.get_http(strURL,strArgs, false, false,function(strData,drawToTableContainer,ohttp)
			{
				var arrData = strData.split("[swhdrc]");
				var totalRowCount = arrData[0]-0;
				var pageNumber = arrData[1]-0;
				//-- do we need to show paging toolbar
				app.datatable_paging(drawToTableContainer.parentNode, totalRowCount,100,pageNumber);
				_servicedesk_settable_tablabel(drawToTableContainer, totalRowCount);
				app.datatable_draw_data(drawToTableContainer, arrData[2]);


			},oDivTableHolder);

	}
}


//-- given list of calls return those calls that are watched
function _servicedesk_setup_call_watched_state(strCallrefs,aDoc)
{
	strCallrefs+=""; //-- cast

	_hd_bCanWatch = true;
	_hd_bCanUnwatch = false;

	
	var watchedRowCount = 0;
	var arrWatchedCalls = new Array();
	var oTableHolder = aDoc.getElementById("tispace_ti_Watched_Calls_View");
	if(oTableHolder)
	{
		var oDataHolder = app.get_parent_child_by_id(oTableHolder,'div_data');
		if(oDataHolder)
		{
			var oTable = app.get_parent_child_by_tag(oDataHolder, "TABLE");
			if(oTable)
			{
				watchedRowCount = oTable.rows.length;
				for(var x=0;x<oTable.rows.length;x++)
				{
					var row = $(oTable.rows[x]);
					arrWatchedCalls["c"+row.attr("keyvalue")] = true;
				}
			}
		}
	}	

	
	var arrSelectedCallrefs = strCallrefs.split(",");
	if(watchedRowCount==0)
	{
		_hd_bCanWatch = true;
		_hd_bCanUnwatch = false;
	}
	else
	{
		//-- 91959 watch menu not behaving correctly.
		//-- if any selected are already in watch list set can watch to false but can unwatch to true
		_hd_bCanWatch = true;
		_hd_bCanUnwatch = false;

		for(var x=0;x<arrSelectedCallrefs.length;x++)
		{
			if(arrWatchedCalls["c" + arrSelectedCallrefs[x]])
			{
				_hd_bCanWatch = false;
				_hd_bCanUnwatch = true;
				break;
			}
		}
	}
}


//-- call to refresh issues
function _servicedesk_refresh_issues()
{
	//-- get data tables in service desk view
	try
	{
		var d = app.oWorkspaceFrameHolder.document;		
	}
	catch (e)
	{
		return;
	}

	var strAttName = (app.isIE && !app.isIE10Above)?"className":"class";
	var arrDataTables =	app.get_children_by_att_value(d.body, strAttName, "dhtml_div_data",false);
	for(var x=0; x < arrDataTables.length;x++)
	{
		var oDivTableHolder = d.getElementById(arrDataTables[x].getAttribute("parentholderid"));
		if(oDivTableHolder!=null && oDivTableHolder.getAttribute("dbtablename")=="swissues")
		{
			//-- store current row issue ref
			_servicedesk_apply_tablefilter(oDivTableHolder)
			//-- re-select current row issue ref
		}
	}
}


//-- call to refresh watched calls after watching or unwaching a call
function _servicedesk_refresh_watched_calls()
{
	//-- get data tables in service desk view
	var d = app.oWorkspaceFrameHolder.document;
	var strAttName = (app.isIE && !app.isIE10Above)?"className":"class";
	var arrDataTables =	app.get_children_by_att_value(d.body, strAttName, "dhtml_div_data",false);
	for(var x=0; x < arrDataTables.length;x++)
	{
		var oDivTableHolder = d.getElementById(arrDataTables[x].getAttribute("parentholderid"));
		if(oDivTableHolder!=null && oDivTableHolder.getAttribute("dbtablename")=="watchcalls")
		{
			_servicedesk_apply_tablefilter(oDivTableHolder)
			_disable_servicedesk_toolbar(d);
		}
	}
}

//-- get record xml string for passed in callrefs for table
function _servicedesk_get_updatedcalldata(oDivTableHolder, strCallrefs)
{
	//-- store atts for when we change table interactive filters

	if(oDivTableHolder==undefined)oDivTableHolder=this;

	var oDataTable = app.get_parent_child_by_id(oDivTableHolder,"div_data");
	if(oDataTable!=null)
	{
			var str3P =	oDivTableHolder.getAttribute("thirdparty");
			var strOwner = oDivTableHolder.getAttribute("analystid");
			var strSuppgroup = oDivTableHolder.getAttribute("groupid");

			var strOrderCol = oDivTableHolder.getAttribute("orderby");
			var strOrderDir = oDivTableHolder.getAttribute("orderdir");
			if(strOrderCol==null)strOrderCol="";
			if(strOrderDir==null)strOrderDir="";


			var iCurrFilter =oDivTableHolder.getAttribute("selectedfilter");
			if(iCurrFilter==null)iCurrFilter="";

		
			var strSQLParams = "&orderby="+strOrderCol+"&orderdir="+strOrderDir+"&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);
			var strArgs = "_callrefs="+strCallrefs+"&tablepos="+oDivTableHolder.getAttribute("tablepos")+"&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&outlookid="+oDataTable.getAttribute('outlookid')+"&datatableid=" + oDivTableHolder.id + "&tablefiltername=&tablefilterindex=" + iCurrFilter;
			strArgs += strSQLParams;
		
			var strURL = app.get_service_url("call/getupdatedcallvalues","");
			try
			{
				//-- sometimes hangs here -- not sure why
				var strData = app.get_http(strURL,strArgs, true, false);				
				return strData;
			}
			catch (e)
			{
			}

	}
	return "";
}

//--
//-- called when a row is selected from one of the service desk views
var _ServiceDeskDocumentElement = null;
var _CurrentServiceDeskTableHolder = null;
var _CurrentServiceDeskTable = null;
var _CurrentServiceDeskRowIndex = -1;
var _CurrentServiceDeskRowKey = -1;
var _CurrentServiceDeskRow = null;

var _CurrentSelectedServiceDeskCallrefs = "";
function _servicedesk_select_row(aRow,e)
{
	if(aRow==null)
	{
		aRow = this;
		var tRow = app.getEventSourceElement(aRow);
		if(tRow!=null)
		{
			e=aRow;
			aRow = tRow;
		}
	}

	//-- get event
	if(!e)e = window.event;
	app.stopEvent(e);

	var intKeyValue = aRow.getAttribute('keyvalue');
	var intKeyCol = aRow.getAttribute('keycolumn');
	var intStatus = aRow.getAttribute('callstatus');

	//--
	//-- highlight row - keep last selected if CTRL key is selected
	var bCTRL = (e!=null)?e.ctrlKey:false;
	if(!bCTRL)bCTRL = (aRow.getAttribute('shiftKey')=="true")?true:false;

	app.datatable_hilight(aRow,bCTRL); //e.ctrlKey - for now only allow single selec
	_CurrentServiceDeskRowIndex = aRow.rowIndex;
	_CurrentServiceDeskRowKey =intKeyValue;
	_CurrentServiceDeskRow = aRow;
	top.__CURRENT_SELECTED_TABLE_ROW = aRow;

	//-- manage servicedesk toolbar options based on selected call (s) status
	_manage_servicedesk_toolbar(aRow);
}

//
//-- called when a row is dbl clicked from one of the service desk views
function _servicedesk_open_row(aRow,e)
{
	if(aRow==null)aRow = this;

	var tRow = app.getEventSourceElement(aRow);
	if(tRow!=null)
	{
		e=aRow;
		aRow = tRow;
	}

	//-- get event object
	if(!e)e = window.event;

	app.stopEvent(e);

	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');

	//-- process calltask
	if(strKeyCol=="taskid")
	{
		var intCallref = aRow.getAttribute('callref');
		var intStatus = aRow.getAttribute('taskstatus');
		var strParams = "callref=" + intCallref;

		//-- determine form to open
		var strForm =(intStatus==16)?"_sys_calltask_completed":"_sys_calltask";

		app.OpenWebClientForm(strForm,intKeyValue,strParams,true,"workflow",window,undefined);
	}
	else if(strKeyCol=="opencall.callref")
	{
		//-- process opencall
		global.OpenCallDetailsView(intKeyValue)
	}
	else if(strKeyCol=="issueref")
	{
		//-- process opencall
		//_issueform(intKeyValue,"", true,window);
		servicedesk_toolbar_action("issueupdate");
	}
}

//- -task vars
var _SelectedTaskCallref = 0;
var _SelectedTaskStatus = 0;
var _SelectedTaskID = 0;
var _ShowCompletedTasks = 0;
var _ShowInactiveTasks = 0;

//-- handle application menu bar actions 
function servicedesk_toolbar_action(strToolBarItemID)
{
	if(_CurrentServiceDeskTableHolder==null) return;
	var aDoc = app.getEleDoc(_CurrentServiceDeskTableHolder)

	//-- nwj - 30.03.2011 - allow app dev to trap toolbar event and override default functionality
	//--					this allows them to cancel things like change class and condition
	if(app["_wc_helpdesk_contextmenu_action"])
	{
		var res = app["_wc_helpdesk_contextmenu_action"](strToolBarItemID,_CurrentSelectedServiceDeskCallrefs,_SelectedTaskCallref, _CurrentServiceDeskTableHolder.id);
		if(res==false)return;
	}

	//--
	//-- get list of selected calls so we can pass into form
	var boolTask = false;
	
	var runHandler = true;
	var afterActionHandler = function()
	{
		if(_CurrentServiceDeskTableHolder==null) return;

		if(_bWatchCall)
		{
			_servicedesk_refresh_watched_calls();
		}
		else
		{
			setTimeout("_after_callview_action("+boolTask+","+_bIssue+")",500);
		}
	}
	
	switch(strToolBarItemID)
	{
		case "wf_update":
			boolTask = true;
			var strParams = "callref=" + _SelectedTaskCallref;
			var strForm = (_SelectedTaskStatus==16)?"_sys_calltask_completed":"_sys_calltask";
			app.OpenWebClientForm(strForm,_SelectedTaskID,strParams,true,"workflow",window,function()
			{
				afterActionHandler();
			});
			runHandler=false;
			break;
		case "wf_complete":
			boolTask = true;
			app._completetaskform(_SelectedTaskID, _SelectedTaskCallref,window);
			break;
		case "wf_showcomplete":
			boolTask = true;
			//-- set filter flag for task list to indicate to show completed tasks
			_ShowCompletedTasks =(_ShowCompletedTasks==0)?1:0;
			var strLabel = (_ShowCompletedTasks==1)?"Hide Completed":"Show Completed";
			app.toolbar_item_setlabel(_CurrentOutlookID,"wf_showcomplete",strLabel,aDoc);
			break;
		case "wf_showinactive":
			boolTask = true;
			//-- set filter flag for task list to indicate to show inactive tasks
			_ShowInactiveTasks = (_ShowInactiveTasks==0)?1:0;
			var strLabel = (_ShowInactiveTasks==1)?"Hide Inactive":"Show Inactive";
			app.toolbar_item_setlabel(_CurrentOutlookID,"wf_showinactive",strLabel,aDoc);
			break;
		case "wf_viewcall":		
			boolTask = true;
			var intKeyValue = _CurrentServiceDeskRow.getAttribute('callref');
			if(intKeyValue==null)
			{
				boolTask = false;			
				var intKeyValue = _CurrentServiceDeskRow.getAttribute('keyvalue');
			}
			global.OpenCallDetailsView(intKeyValue);
			runHandler=false;
			break;
		case "callupdate":
			runHandler = false;
			_updatecallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callaccept":
			runHandler = false;
			_acceptcallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callassign":
			runHandler = false;
			_assigncall(_CurrentSelectedServiceDeskCallrefs,"","","",window,afterActionHandler);
			break;
		case "callcancel":
			runHandler = false;
			_cancelcallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callhold":
			runHandler = false;
			_holdcallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;
		case "callresolve":
		case "callclose":
			runHandler = false;
			_resolveclosecallform(_CurrentSelectedServiceDeskCallrefs,window,[],afterActionHandler);
			break;

		case "calloffhold":
			if(_offholdcall(_CurrentSelectedServiceDeskCallrefs))
			{
			}
			break;

		case "callclass":
		
			if(!session.HaveRight(ANALYST_RIGHT_B_GROUP,ANALYST_RIGHT_B_CANCHANGECALLCLASS,true)) return;
			runHandler = false;
			//-- change call class
			var strCallClass = _select_callclass(window,function(strCallClass)
			{
				if(strCallClass!="")
				{
					var hd = new HelpdeskSession();
					if(hd.ChangeCallClass(_CurrentSelectedServiceDeskCallrefs,strCallClass))
					{
						//-- need to refresh view
						_servicedesk_tree_selection(_last_servicedesk_node, _CurrentServiceDeskTableHolder.getAttribute("outlookid"));
						//-- disable toolbar
						_disable_servicedesk_toolbar(_CurrentServiceDeskTableHolder.document);
						return;
					}
				}
			});
			break;

		case "callcondition":
			if(!session.HaveRight(ANALYST_RIGHT_B_GROUP,ANALYST_RIGHT_B_CANCHANGECALLCONDITION,true)) return;

			//-- change call condition
			runHandler = false;
			var strCallCondition = _select_callcondition(window,function(strCallCondition)
			{
				if(strCallCondition!="")
				{	
					var hd = new HelpdeskSession();
					hd.ChangeCallCondition(_CurrentSelectedServiceDeskCallrefs,strCallCondition);
				}
			});
			break;

		case "callprofile":

			if(!session.HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCHANGECALLPROFILECODE,true)) return;

			runHandler = false;
			//--
			//-- if we have one call class then load cdf form and get the profile filter
			var strFilter = app._get_callclass_form_profilefilter(_CurrentSelectedServiceDeskCallrefs);

			//-- change call probcode
			
			app._cdf_profilechanger(strFilter,"",function(oForm)
			{
				if(oForm.code!="")
				{
					var hd = new HelpdeskSession();
					var res = hd.SetProfileCode(_CurrentSelectedServiceDeskCallrefs,oForm.code);
					if(res==false)
					{
						alert("Failed to update the profile code for this request. Please contact your Administrator.");
					}
					else
					{
						afterActionHandler()
					}
				}

			},null,window);
			break;


		case "callwatch":
			var oHD = new HelpdeskSession();
			if(oHD.WatchCall(_CurrentSelectedServiceDeskCallrefs, session.analystId))
			{
				if(!_bWatchCall)_servicedesk_refresh_watched_calls();
			}

			break;

		case "callunwatch":
			var oHD = new HelpdeskSession();
			if(oHD.UnwatchCall(_CurrentSelectedServiceDeskCallrefs, session.analystId))
			{
				if(!_bWatchCall)_servicedesk_refresh_watched_calls();
			}
			break;
		case "watchoptions":
			//-- open watch call options form
			var strParams = "_callrefs=" + _CurrentSelectedServiceDeskCallrefs;
			app._open_system_form("_wc_watchcall_options","watchoptions", "", strParams, true, null,null);
			return;
			break;
		case "callreact":
			if(_callreactivate(_CurrentSelectedServiceDeskCallrefs))
			{
			}
			break;
		
		case "issueupdate":
			_issueform(_SelectedIssueID,"",false,window);
			break;
		case "issueclose":
			_servicedesk_close_issue(_CurrentServiceDeskRow)
			break;
		case "lognew":
			return;
			break;

		default:
			alert("Service Desk Toolbar Action Not Recognised " + strToolBarItemID)
			break;
	}

	if(runHandler)afterActionHandler();
}

function _after_callview_action(boolTask,_bIssue)
{
	_CurrentServiceDeskTable = _CurrentServiceDeskTableHolder.childNodes[2].childNodes[0];

	if(!boolTask && !_bIssue)
	{
		var strIndexes = app.get_row_datatable_selectedindexes(_CurrentServiceDeskTable.rows[_CurrentServiceDeskRowIndex]);
		var arrRowIndexes = strIndexes.split(",");
		for (var x=arrRowIndexes.length-1;x>=0;x--)
		{
			_refresh_servicedesk_row(_CurrentServiceDeskTable.rows[arrRowIndexes[x]]);
		}
	}
	else
	{
		//-- refresh view
		if(_CurrentServiceDeskTable==undefined)return;

		var tableHolder = _CurrentServiceDeskTable.parentNode.parentNode;
		_servicedesk_apply_tablefilter(tableHolder)

		_CurrentServiceDeskTable = tableHolder.childNodes[2].childNodes[0];

		//-- see if row is still there if so select it
		var aRow = _CurrentServiceDeskTable.rows[_CurrentServiceDeskRowIndex];
		if(aRow!=undefined)
		{
			if(_CurrentServiceDeskRowKey == aRow.getAttribute('keyvalue'))
			{
				_servicedesk_select_row(aRow);
			}
		}
		else
		{
			_CurrentServiceDeskRow = null;
			_CurrentServiceDeskRowIndex = -1;
			//-- manage toolbar - i.e. disable it or something
			_manage_servicedesk_toolbar(null,_CurrentServiceDeskTable);
		}
	}

}

function _servicedesk_close_issue(aRow)
{
	//-- close issue
	var strIssueRef = aRow.getAttribute('keyvalue');

	//-- query the database o see that issue is still valid
	var conCache = new SqlQuery();	
	var strParams = "ir=" + strIssueRef; 
	conCache.WebclientStoredQuery("system/getActiveIssueRecord",strParams);
	
	//Check if "swissues" is still in the cache
	if(!conCache.Fetch())
	{
		//-- This call must be closed - remove row
		aRow.parentNode.deleteRow(aRow.rowIndex); 
		if(_CurrentServiceDeskTable!=null)
		{
			app.fireEvent(_CurrentServiceDeskTable,"mousedown",document);
		}
		return false;
	}

	//-- get any attached calls 
	var strCallrefs = "";
	var boolCalls = false;
	var strParams = "ir=" + strIssueRef; 
	var conCache = new SqlQuery();	
	conCache.WebclientStoredQuery("system/getIssuesCalls",strParams);

	while(conCache.Fetch())	
	{
		var intCallStatus = conCache.GetValueAsNumber('status');
		var intCallRef = conCache.GetValueAsNumber('callref');

		if((intCallStatus == 6) || (intCallStatus > 15 )) continue;
		
		boolCalls = true;
		if(strCallrefs!="")strCallrefs+=",";
		strCallrefs += intCallRef;

		var swHDSession = new HelpdeskSession();
		swHDSession.AcceptCall(intCallRef);
		swHDSession.Close();		
	}		

	if(boolCalls)
	{
		//-- Set the text to be used in the resolve/close form
		var strCloseUpdateText = "Call closed as part of issue " + strIssueRef;
			
		//-- Open the resolve/close form with the text set above (strCloseUpdateText) and the Issue Ref to be closed	
		app.OpenCallResolveCloseForm(strCallrefs, strCloseUpdateText,null, strCloseUpdateText, "", strIssueRef);

	}
	else //-- No calls associated to this Issue so we simply set Issue Status to "Closed" and save change
	{	
		var myHDSession = new HelpdeskSession();
		if (myHDSession.Connect())
		{
			myHDSession.BeginUpdateIssue(strIssueRef);
			myHDSession.SendNumber("status", 16);
			myHDSession.Commit();
		}
	}		

}



//--
//-- get xml recordset of calls updated or created for each service view table - uses current filter settings etc for each table
function _get_servicedesk_newcall_data(strCallrefs)
{
	//-- get data tables in service desk view
	var d = app.oWorkspaceFrameHolder.document;
	var arrDataTableHolders =	app.get_children_by_att_value(d.body, "controltype", "datatable-holder",false);
	for(var x=0; x < arrDataTableHolders.length;x++)
	{
		//-- get params
		var strControlID = arrDataTableHolders[x].getAttribute("outlookid");
		var oDivTableHolder = arrDataTableHolders[x];

		var str3P =	oDivTableHolder.getAttribute("thirdparty");
		var strOwner = oDivTableHolder.getAttribute("analystid");
		var strSuppgroup = oDivTableHolder.getAttribute("groupid");

		var strOrderCol = oDivTableHolder.getAttribute("orderby");
		var strOrderDir = oDivTableHolder.getAttribute("orderdir");
		if(strOrderCol==null)strOrderCol="";
		if(strOrderDir==null)strOrderDir="";

		var iCurrFilter =oDivTableHolder.getAttribute("selectedfilter");
		if(iCurrFilter==null)iCurrFilter="";

		//-- 12.12.12 - nwj - 90128 - removed use of staticfilter clientside
		var strSQLParams = "&_callrefs=" + strCallrefs + "&orderby="+strOrderCol+"&orderdir="+strOrderDir+"&owner=" + app.pfu(strOwner) + "&thirpartycontract="+app.pfu(str3P)+"&suppgroup=" + app.pfu(strSuppgroup);
		var strArgs = "tablepos="+oDivTableHolder.getAttribute("tablepos")+"&_showcompletedtasks="+_ShowCompletedTasks+"&_showinactivetasks="+_ShowInactiveTasks+"&outlookid="+strControlID+"&datatableid=" + oDivTableHolder.id + "&tablefiltername=&tablefilterindex=" + iCurrFilter;
		strArgs += strSQLParams;

		//-- go get data and call function to process once returned
		var strURL = app.get_service_url("call/getupdatedcallslist/newcalls.php","");
		app.get_http(strURL,strArgs, false, false,_create_new_servicedesk_calls);
	}
}


function _servicedesk_get_distinct_columns()
{
	var arrCols = new Array();
	var strCols = "";
	var d = app.oWorkspaceFrameHolder.document;
	var arrDataTableHolders =	app.get_children_by_att_value(d.body, "dbtablename", "opencall",false);
	for(var x=0; x < arrDataTableHolders.length;x++)
	{
		var divHeaderTableRow =arrDataTableHolders[x].childNodes[1].childNodes[0].rows[0];
		for(var y=0;y<divHeaderTableRow.cells.length;y++)
		{
			var strColName = divHeaderTableRow.cells[y].getAttribute("dbname");

			if(arrCols[strColName] || strColName==null)
			{
			}
			else
			{
				arrCols[strColName] = true;
				if(strCols != "")strCols += ","
				strCols += strColName;
			}
		}
	}

	if(strCols == "") strCols = "*";
	return strCols;
}

function _refresh_servicedesk_againstdata(strData)
{
	if(_servicedesk_tree==null) return;

	//-- make RS out of xml
	app.debugstart("_refresh_servicedesk_againstdata","POLLING")

	var oDataXML = app.create_xml_dom(strData)
	if(oDataXML.childNodes[0].childNodes.length==0)
	{
		app.debugend("_refresh_servicedesk_againstdata","POLLING")
		return; //-- no updates
	}



	//-- get table id
	var strCallrefs= "";
	var oRS = new XmlSqlQuery();
	oRS._recordset = oDataXML;
	while(oRS.Fetch())
	{
		//-- if row should not be in the helpdesk due to status remove
		var intCallref = oRS.GetValueAsNumber('callref');
		var intStatus = oRS.GetValueAsNumber('status');
		var bRemoveRow = (intStatus>14)?true:false;
		if(bRemoveRow)
		{
			_service_desk_remove_row_by_callref(intCallref);
		}
		else
		{
			//-- update row by callref
			var intC = _service_desk_update_row_by_callref(intCallref, oRS);
			if(intC>0)
			{
				if(strCallrefs!="")strCallrefs += ",";
				strCallrefs += intC;
			}
		}
	}

	oRS = null;
	oDataXML = null;

	if(_CurrentServiceDeskRow!=null)
	{
		_manage_servicedesk_toolbar(_CurrentServiceDeskRow);
	}

	
	//-- now go get new calls
	if(strCallrefs!="")
	{
		_get_servicedesk_newcall_data(strCallrefs);
	}

	app.debugend("_refresh_servicedesk_againstdata","POLLING")
}

function _service_desk_remove_row_by_callref(intCallref)
{
	var arrRows = _service_desk_get_rows_by_callref(intCallref);
	for(var x=0;x<arrRows.length;x++)
	{
		if(arrRows[x]==_CurrentServiceDeskRow)
		{
			_disable_servicedesk_toolbar(app.getEleDoc(arrRows[x]))
			_CurrentServiceDeskRow=null;
		}

		var oDivData = arrRows[x].parentNode.parentNode.parentNode.parentNode;
		arrRows[x].parentNode.deleteRow(arrRows[x].rowIndex);

		//-- update call count
		_servicedesk_settable_tablabel(oDivData);

	}
}

function _service_desk_update_row_by_callref(intCallref, oRecordSet)
{
	//-- get owner and suppgroup - check if needs to be removed from current view
	var strOwner = oRecordSet.GetValueAsString("owner");
	var strGroup = oRecordSet.GetValueAsString("suppgroup");
	var intStatus = oRecordSet.GetValueAsNumber("status");
	var intLastActDatex = oRecordSet.GetValueAsNumber("swlastactdatex");
	if(intLastActDatex > _LAST_HELPDESKVIEW_LASTACTDATEX)_LAST_HELPDESKVIEW_LASTACTDATEX=intLastActDatex; //-- for next update list

	//-- if not same group and status not escalated all remove
	if(strGroup!=session.currentGroupId && intStatus!=CS_ESCA)
	{
		_service_desk_remove_row_by_callref(intCallref);
	}
	else if (strOwner!="" && strOwner!=session.currentAnalystId && (intStatus!=CS_ESCG && intStatus!=CS_OFFHOLD))
	{
		//-- same group but not the owner and call is not escalated to group and has not jsut come off hold
		_service_desk_remove_row_by_callref(intCallref);
	}
	else
	{
		//-- update row data - or create new 
		var arrRows = _service_desk_get_rows_by_callref(intCallref);
		if(arrRows.length==0)
		{
			//-- need to create a new row - get new call data
			return intCallref;
		}
		else
		{
			for(var z=0;z<arrRows.length;z++)
			{
				var aRow = arrRows[z];
				//-- check last actdatex
				if(aRow.getAttribute("lastactdatex")>=intLastActDatex) continue;
				aRow.setAttribute("lastactdatex",intLastActDatex);
				aRow.setAttribute("callstatus",intStatus);

				var oDivHolder = aRow.parentNode.parentNode.parentNode.parentNode;
				var oHeaderHolder = app.get_parent_child_by_id(oDivHolder,'table_columns');
				var tblHeader = app.get_parent_child_by_tag(oHeaderHolder,"TABLE");
				var rowHeader = app.get_parent_child_by_tag(tblHeader,"TR");
				for(var x=0; x < rowHeader.childNodes.length-1; x++)
				{
					var cellName = rowHeader.childNodes[x].getAttribute("dbname");
					//-- Get current values
					var targetCell = aRow.childNodes[x];
					currDisplayValue = targetCell.childNodes[0].innerHTML;
					var newDisplayValue = oRecordSet.GetValueAsString(cellName,true);
					if(newDisplayValue!=currDisplayValue)
					{
						if(cellName.toLowerCase()=="escalation")
						{
							targetCell.childNodes[0].innerHTML = newDisplayValue;
						}
						else if(cellName.toLowerCase()=="callref")
						{
							//-- do not change callref
						}
						else
						{
							app.setElementText(targetCell.childNodes[0],newDisplayValue);
						}
					}
				} //-- for x

				//-- set row style based on status
				switch(intStatus)
				{
					case 5:
					case 9:
					case 10:
					case 11:
						//-- escalated or off hold
						aRow.style.color="#800000";
						aRow.style.fontStyle="normal";
						break;
					case 4:
						//-- onhold
						aRow.style.color="green";
						aRow.style.fontStyle="italic";
						break;
					case 2:
					case 3:
						//-- unaccepted or unassigned
						aRow.style.color="navy";
						aRow.style.fontStyle="normal";
						break;
					default:
						aRow.style.color="#000000";
						aRow.style.fontStyle="normal";
				}



			}//-- for z
		}//-- no rows
	}
	return 0;
}




//-- function when given new call data will create rows
function _create_new_servicedesk_calls(strData)
{
	if(_servicedesk_tree==null) return;

	//-- make RS out of xml
	var oDataXML = app.create_xml_dom(strData)

	//var arrRows = oDataXML.getElementsByTagName("row");
	//if(arrRows.length==0) return; //-- no updates
	if(oDataXML.childNodes[0].childNodes.length==0) return; //-- no updates

	//-- get table id
	var strTableHolderID = oDataXML.childNodes[0].getAttribute("tableid");
	var oRS = new XmlSqlQuery();
	oRS._recordset = oDataXML;
	while(oRS.Fetch())
	{
		//-- get tableholder for data 
		var oDivHolder = _ServiceDeskDocumentElement.getElementById(strTableHolderID);
		if(oDivHolder!=null)
		{
			var recType = oDivHolder.getAttribute("dbtablename");
			if(recType=="swissues")
			{
				continue;
			}

			var oHeaderHolder = app.get_parent_child_by_id(oDivHolder,'table_columns');
			var oDataHolder = app.get_parent_child_by_id(oDivHolder,'div_data');
			if(oHeaderHolder!=null && oDataHolder!=null)
			{

				var tblHeader = app.get_parent_child_by_tag(oHeaderHolder,"TABLE");
				var tblData = app.get_parent_child_by_tag(oDataHolder,"TABLE");
				var rowHeader = app.get_parent_child_by_tag(tblHeader,"TR");

				var intCallref = oRS.GetValueAsString('tpk');
				var intLastActDatex = oRS.GetValueAsNumber("swlastactdatex");

				//-- create new row and add ats and cells
				var aRow = tblData.insertRow(tblData.rows.length);

				//-- generate row id
				var strKeyID = oRS.GetValueAsString('tpk');
				var strStatusID = oRS.GetValueAsString('tpkstatus');
				var strTaskID = oRS.GetValueAsString('taskid');
				var strTextStyle="";
				if(strTaskID!="")
				{
					aRow.setAttribute("keycolumn","taskid");
					var tStatus = oRS.GetValueAsString('taskstatus');
					if(tStatus==16 || tStatus==1) strTextStyle= "text-strike-" + tStatus;
					var strName = "sdtrow_" + strTaskID;
				}
				else
				{
					aRow.setAttribute("keycolumn","opencall.callref");
					var strName = "sdcrow_" + oRS.GetValueAsString("callref");
					
					//-- set row style based on status
					var intStatus = strStatusID++;
					intStatus--;
					switch(intStatus)
					{
						case 5:
						case 9:
						case 10:
						case 11:
							//-- escalated or off hold
							aRow.style.color="#800000";
							aRow.style.fontStyle="normal";
							break;
						case 4:
							//-- onhold
							aRow.style.color="green";
							aRow.style.fontStyle="italic";
							break;
						case 2:
						case 3:
							//-- unaccepted or unassigned
							aRow.style.color="navy";
							aRow.style.fontStyle="normal";
							break;
						default:
							aRow.style.color="#000000";
							aRow.style.fontStyle="normal";
					}

				}
				aRow.setAttribute("id",strName);
				aRow.setAttribute("name",strName);
				aRow.setAttribute("keyvalue",strKeyID);
				aRow.setAttribute("callstatus",strStatusID);
				aRow.setAttribute("lastactdatex",intLastActDatex);

				//-- create cells
				for(var y=0;y<rowHeader.childNodes.length-1; y++) 
				{
					var cellName = rowHeader.childNodes[y].getAttribute("dbname");

					//-- new cell
					var targetCell = aRow.insertCell(y);
					insertBeforeEnd(targetCell,"<div class='"+strTextStyle+"'></div>");
					

					var newDisplayValue = oRS.GetValueAsString(cellName,true);
					if(newDisplayValue=="undefined")newDisplayValue=newValue;

					if(cellName.toLowerCase()=="escalation" || cellName.toLowerCase()=="h_condition")
					{
						targetCell.childNodes[0].innerHTML = newDisplayValue;
					}
					else if(cellName.toLowerCase()=="callref" || cellName.toLowerCase()=="h_formattedcallref")
					{
						//-- do not change callref
						targetCell.childNodes[0].innerHTML = "<a href='#' onclick='app._open_call_detail("+strKeyID+")'>" + newDisplayValue + "</a>";
					}
					else if(cellName.toLowerCase()=="taskid")
					{
						targetCell.childNodes[0].innerHTML = "<a href='#' onclick='app._open_hdtask_detail("+strKeyID +","+ oRS.GetValueAsString('callref') +","+ tStatus+")'>" + newDisplayValue + "</a>";
					}
					else
					{
						app.setElementText(targetCell.childNodes[0],newDisplayValue);
					}
				}

				//-- add events

				app.addEvent(aRow,"click",function(){_servicedesk_select_row(aRow,this);} );
				app.addEvent(aRow,"dblclick",function(){_servicedesk_open_row(aRow,this);});

			}//-- oHeaderHolder!null

			//-- update call count
			_servicedesk_settable_tablabel(oDivHolder);

		}//-- divholder != null
	}//-- while rs
}

function _service_desk_get_rows_by_callref(intCallref)
{
	var aRows = new Array();
	if(_ServiceDeskDocumentElement!=null)
	{
		aRows = _ServiceDeskDocumentElement.getElementsByName("sdcrow_" + intCallref);
	}
	return aRows;
}


//-- get updated row data from systemdb - apply to row cells and then re-select row - this means we do not have to refresh whole table
function _refresh_servicedesk_row(aRow)
{
	if(aRow!=undefined)
	{
		var bRemoveRow = false;
		var oDivHolder = aRow.parentNode.parentNode.parentNode.parentNode;
		var oDivData = aRow.parentNode.parentNode.parentNode.parentNode;

		var strXML = _servicedesk_get_updatedcalldata(oDivHolder,aRow.getAttribute('keyvalue'));
		var oXML = app.create_xml_dom(strXML);
		strXML = null;


		//-- make RS out of xml
		var oRS = new XmlSqlQuery();
		oRS._recordset = oXML;
		if(oRS.Fetch())
		{
			//-- if row should not be in the helpdesk due to status remove
			var intStatus = oRS.GetValueAsNumber('status');
			aRow.setAttribute('callstatus',intStatus);
			if(intStatus<15)
			{

				//-- if not in root and not currently inside watch call list
				if(session.currentGroupId!="")
				{
					var strG = oRS.GetValueAsString('suppgroup');
					var strO = oRS.GetValueAsString('owner');

					//-- call is no longer in the same group
					if(strG!=session.currentGroupId )
					{
						//-- if not escalated to all remove
						if(intStatus!=_ESCA)
						{
							bRemoveRow = true;
						}
					}
					else
					{
						//-- in same group but not assigned to current analyst
						if(strO!="" && strO != session.currentAnalystId)
						{
							//-- if not escalated to all, group or off hold then remove as analyst show not see it.
							if(intStatus!=_ESCA && intStatus!=_ESCG && intStatus!=_OFFHOLD && intStatus!=_UNASSIGNED)
							{
								bRemoveRow = true;
							}
						}
					}
				}
			}
			else
			{
				bRemoveRow = true;
			}

		}
		else
		{
			//-- row should no be in table anymore as most likely closed
			bRemoveRow = true;
		}

		//-- remove the row from the table
		if(bRemoveRow)
		{
			//-- disable buttons on toolbar
			var aDoc = app.getEleDoc(aRow);
			app.toolbar_item_dore(_CurrentOutlookID, "callupdate" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callassign" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callaccept" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callhold" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "calloffhold" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callresolve" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callcancel" , false, aDoc);
			app.toolbar_item_dore(_CurrentOutlookID, "callreact" , false, aDoc);

			if(aRow.parentNode.deleteRow)
			{
				aRow.parentNode.deleteRow(aRow.rowIndex);
				//-- update call count
				_servicedesk_settable_tablabel(oDivData);

			}
			_CurrentServiceDeskRowKey=0;
			_CurrentServiceDeskRowIndex=0;
		}
		else
		{
			var oHeaderHolder = app.get_parent_child_by_id(oDivHolder,'table_columns');
			var tblHeader = get_parent_child_by_tag(oHeaderHolder,"TABLE");
			var rowHeader = get_parent_child_by_tag(tblHeader,"TR");
			for(var x=0; x < rowHeader.childNodes.length-1; x++)
			{
				var cellName = rowHeader.childNodes[x].getAttribute("dbname");
				//-- Get current values
				var targetCell = aRow.childNodes[x];
				var currValue = targetCell.childNodes[0].innerHTML;
				var newDisplayValue = oRS.GetValueAsString(cellName,true);
				if(newDisplayValue!=currValue)
				{
					if(cellName.toLowerCase()=="escalation" || cellName.toLowerCase()=="h_condition")
					{
						targetCell.childNodes[0].innerHTML = newDisplayValue;
					}
					else if(cellName.toLowerCase()=="callref")
					{
						//-- callref will never change
					}
					else
					{
						app.setElementText(targetCell.childNodes[0],newDisplayValue);
					}
				}
			}

			//-- redo toolbar
			_manage_servicedesk_toolbar(aRow);
		}
		oRS = null;
		oXML = null;
	}

}


//-- user has selected a row in a table - make that table active
function _select_sevicedesk_table(oDataDivHolder)
{
	var eDataTable = oDataDivHolder.childNodes[0];
	if(eDataTable==undefined)return false;
	if(eDataTable.tagName!="TABLE") return false;

	if(_CurrentServiceDeskTable!=null && eDataTable!=_CurrentServiceDeskTable)
	{	
		//datatable_hilight_blurred_rows(_CurrentServiceDeskTable);
		//datatable_hilight_selected_rows(eDataTable);
	}

	//_CurrentServiceDeskTable = eDataTable; //-- store globally
	_CurrentSelectedServiceDeskCallrefs = "";
	_CurrentServiceDeskTableHolder = eDataTable.parentNode.parentNode;

	var strCurrIndexes = eDataTable.getAttribute("curr_row");
	if(strCurrIndexes==null)strCurrIndexes="";

	var aRow=null;
	if(eDataTable.rows.length>0)
	{
		var arrIndexes = strCurrIndexes.split(",");
		aRow = eDataTable.rows[arrIndexes[0]];
		if(aRow==undefined)	
		{
			aRow = eDataTable.rows[0];
			if(aRow!=undefined)
			{
				eDataTable.setAttribute("curr_row","0");
			}
		}
	}
	top.__CURRENT_SELECTED_TABLE_ROW = aRow;
	_manage_servicedesk_toolbar(aRow,eDataTable);
}

//--
//-- enable disable toolbar based on selected calls
var _hd_bCanAccept = false;
var _hd_bCanAssign = false;
var _hd_bCanUpdate = false;
var _hd_bCanHold = false;
var _hd_bCanTakeOffHold = false;
var _hd_bCanResolve = false;
var _hd_bCanClose = false;
var _hd_bCanCancel = false;
var _hd_bCanReactivate = false;
var _hd_bCanChangeClass = true;
var _hd_bCanChangeCondition = true;
var _hd_bCanWatch = false;
var _hd_bCanUnwatch = false;
var _bTasks = false;
var _bIssue = false;
var _bWatchCall = false;
var _SelectedIssueID = "";
var _bCompletedTask=false;
var _bInactiveTask=false;

function _disable_servicedesk_toolbar(aDoc)
{

	_bTasks = false;
	_bIssue = false;
	_bWatchCall = false;

	_hd_bCanAccept = false;
	_hd_bCanAssign = false;
	_hd_bCanUpdate = false;
	_hd_bCanHold = false;
	_hd_bCanTakeOffHold = false;
	_hd_bCanResolve = false;
	_hd_bCanClose = false;
	_hd_bCanCancel = false;
	_hd_bCanReactivate = false;
	_hd_bCanWatch = false;
	_hd_bCanUnwatch = false;
	_hd_bCanChangeClass = false;
	_hd_bCanChangeCondition = false;


	//-- enable buttons on toolbar
	app.toolbar_item_dore(_CurrentOutlookID, "callupdate" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callassign" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callaccept" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callhold" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "calloffhold" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callresolve" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcancel" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callreact" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callclass" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcondition" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callprofile" , false, aDoc);

	//-- tasks buttons
	app.toolbar_item_dore(_CurrentOutlookID, "wf_complete" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_update" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_viewcall" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showcomplete" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showinactive" , false, aDoc);
	//-- issue buttons
	app.toolbar_item_dore(_CurrentOutlookID, "issueupdate" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "issueclose" , false, aDoc);


	//-- disable buttons on context 
	if(__SERVICEDESK_CONTEXT_MENU!=null)
	{
		__SERVICEDESK_CONTEXT_MENU.style.display="none";
	}
}

function _manage_servicedesk_toolbar(aRow,rowDataTable)
{

	_bTasks = false;
	_bIssue = false;
	_bWatchCall = false;

	_hd_bCanAccept = false;
	_hd_bCanAssign = false;
	_hd_bCanUpdate = false;
	_hd_bCanHold = false;
	_hd_bCanTakeOffHold = false;
	_hd_bCanResolve = false;
	_hd_bCanClose = false;
	_hd_bCanCancel = false;
	_hd_bCanReactivate = false;
	_hd_bCanWatch = false;
	_hd_bCanUnwatch = false;
	_hd_bCanChangeClass = false;
	_hd_bCanChangeCondition = false;
	

	var aDoc = (rowDataTable==undefined)?app.getEleDoc(aRow):app.getEleDoc(rowDataTable);
	//--
	//-- get all selected rows for the call row table - we only want to enable options based on majority i.e. mass call update
	var eDataTable = (rowDataTable==undefined)?app.get_row_datatable(aRow):rowDataTable;
	_CurrentServiceDeskTableHolder = eDataTable.parentNode.parentNode;

	if(_CurrentServiceDeskTable!=null && eDataTable!=_CurrentServiceDeskTable)
	{
		datatable_hilight_blurred_rows(_CurrentServiceDeskTable);
	}
	
	if(eDataTable!=_CurrentServiceDeskTable)
	{
		datatable_hilight_selected_rows(eDataTable);
	}

	_CurrentServiceDeskTable = eDataTable; //-- store globally
	_CurrentSelectedServiceDeskCallrefs = "";

	var recType = _CurrentServiceDeskTable.parentNode.parentNode.getAttribute("dbtablename");
	if(recType=="swissues")
	{
		_hd_bCanChangeClass = false;
		_hd_bCanChangeCondition = false;

		if(aRow!=null)
		{
			_SelectedIssueID = aRow.getAttribute('keyvalue');
		}
		else
		{
			_SelectedIssueID = "";
		}
		_bIssue=true;

	}
	else if(recType=="calltasks")
	{
		_hd_bCanChangeClass = false;
		_hd_bCanChangeCondition = false;
		if(aRow!=null)
		{
			_SelectedTaskID = aRow.getAttribute('keyvalue');
			_SelectedTaskStatus= aRow.getAttribute('taskstatus');
			_SelectedTaskCallref = aRow.getAttribute('callref');
			//-- maybe show different options?
			_bCompletedTask = (_SelectedTaskStatus=="16");
			_bInactiveTask= (_SelectedTaskStatus=="1");
		}
		else
		{
			_SelectedTaskID = 0;
			_SelectedTaskStatus= 0;
			_SelectedTaskCallref = 0;
			_bCompletedTask=true;
			_bInactiveTask=true;
		}
		_bTasks=true;

	}
	else if(recType=="opencall" || recType=="watchcalls")
	{
		_bWatchCall = (recType=="watchcalls");
		var strCurrIndexes = app.get_row_datatable_selectedindexes(aRow);
		var arrIndexes = strCurrIndexes.split(",");
		var bHaveRows = (strCurrIndexes!="-1");

		_hd_bCanAccept = bHaveRows;
		_hd_bCanAssign = bHaveRows;
		_hd_bCanUpdate = bHaveRows;
		_hd_bCanHold = bHaveRows;
		_hd_bCanTakeOffHold = bHaveRows;
		_hd_bCanResolve = bHaveRows;
		_hd_bCanClose = bHaveRows;
		_hd_bCanCancel = bHaveRows;
		_hd_bCanReactivate = bHaveRows;
		_hd_bCanChangeClass = bHaveRows;
		_hd_bCanChangeCondition = bHaveRows;

		for(var x=0; (x<arrIndexes.length) && (bHaveRows);x++)
		{
			//-- for each selected row see what we can do with it

			var aRow = eDataTable.rows[arrIndexes[x]];
			if(aRow==undefined)
			{
				_hd_bCanAccept = false;
				_hd_bCanAssign = false;
				_hd_bCanUpdate = false;
				_hd_bCanHold = false;
				_hd_bCanTakeOffHold = false;
				_hd_bCanResolve = false;
				_hd_bCanClose = false;
				_hd_bCanCancel = false;
				_hd_bCanReactivate = false;
				_hd_bCanChangeClass = false;
				_hd_bCanChangeCondition = false;

				break;
			}
			var intStatus = aRow.getAttribute('callstatus');// app.datatable_get_colvalue(aRow, "status", true);
			intStatus++;intStatus--;//-- cast it

			//-- get callref and append to selected callrefs
			if(_CurrentSelectedServiceDeskCallrefs!="")_CurrentSelectedServiceDeskCallrefs+=",";
			_CurrentSelectedServiceDeskCallrefs += aRow.getAttribute('keyvalue');

			switch(intStatus)
			{
				case _INCOMING:
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=false;
					_hd_bCanChangeClass = false;
					_hd_bCanChangeCondition = false;
					break;
				case _RESOLVED:
					_hd_bCanClose = true;
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=true;
					break;
				case _CLOSED:
				case _CLOSEDCHARGE:
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					_hd_bCanUpdate = false;
					_hd_bCanCancel = false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=true;
					_hd_bCanChangeClass = false;
					_hd_bCanChangeCondition = false;

					break;
				case _UNACCEPTED:
					_hd_bCanReactivate=false;
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanClose = false
					_hd_bCanResolve = false				
					break;
				case _UNASSIGNED:
					_hd_bCanHold = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanReactivate=false;
					break;
				case _PENDING:
					_hd_bCanTakeOffHold=false
					_hd_bCanAccept= false;
					_hd_bCanReactivate=false;
					break;
				case _ONHOLD:
					_hd_bCanHold = false;
					_hd_bCanReactivate=false;
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					break;
				case _OFFHOLD:
					_hd_bCanTakeOffHold=false
					_hd_bCanReactivate=false;
					_hd_bCanClose = false
					_hd_bCanResolve = false
					break;
				case _CANCELLED:
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanAccept = false;
					_hd_bCanAssign = false;
					_hd_bCanUpdate = false;
					_hd_bCanCancel = false;
					_hd_bCanTakeOffHold=false
					_hd_bCanHold = false;
					_hd_bCanReactivate=true;
					break;
				case _ESCO:
				case _ESCG:
				case _ESCA:
					_hd_bCanTakeOffHold=false
					_hd_bCanHold = false;
					_hd_bCanReactivate=false;
					_hd_bCanClose = false
					_hd_bCanResolve = false
					_hd_bCanReactivate=false;
					break;
				default:
					alert("Service Desk Status Not Recognised : "  + intStatus);
					break;
			}
		}
	}

	if(_CurrentSelectedServiceDeskCallrefs!="")
	{
		_servicedesk_setup_call_watched_state(_CurrentSelectedServiceDeskCallrefs,aDoc);
	}

	//-- show hide buttons
	app.toolbar_item_sorh(_CurrentOutlookID, "callupdate" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callassign" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callaccept" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callhold" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "calloffhold" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callresolve" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callcancel" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callreact" , (!_bTasks && !_bIssue), aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callclass" , false, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callcondition" , false, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "callprofile" , false, aDoc);

	//-- tasks buttons
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_complete" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_update" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_showcomplete" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_showinactive" , _bTasks, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "wf_viewcall" ,_bTasks, aDoc);

	//-- issue buttons
	app.toolbar_item_sorh(_CurrentOutlookID, "issueupdate" ,_bIssue, aDoc);
	app.toolbar_item_sorh(_CurrentOutlookID, "issueclose" ,_bIssue, aDoc);


	//-- enable buttons on toolbar
	app.toolbar_item_dore(_CurrentOutlookID, "callupdate" , _hd_bCanUpdate, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callassign" , _hd_bCanAssign, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callaccept" , _hd_bCanAccept, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callhold" , _hd_bCanHold, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "calloffhold" , _hd_bCanTakeOffHold, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callresolve" , (_hd_bCanResolve || _hd_bCanClose), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcancel" , _hd_bCanCancel, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callreact" , _hd_bCanReactivate, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callclass" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callcondition" , false, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "callprofile" , false, aDoc);

	//-- tasks buttons
	app.toolbar_item_dore(_CurrentOutlookID, "wf_complete" , (!_bCompletedTask && !_bInactiveTask), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_update" , !_bCompletedTask, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_viewcall" , (_SelectedTaskCallref>0), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showcomplete" , true, aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "wf_showinactive" , true, aDoc);

	//-- issue buttons
	app.toolbar_item_dore(_CurrentOutlookID, "issueupdate" , (_SelectedIssueID!=""), aDoc);
	app.toolbar_item_dore(_CurrentOutlookID, "issueclose" , (_SelectedIssueID!=""), aDoc);

	if(__SERVICEDESK_CONTEXT_MENU!=null)
	{
		__SERVICEDESK_CONTEXT_MENU.style.display="none";
		__SERVICEDESK_CONTEXT_MENU.innerHTML = "";
	}

}

function servicedesk_showhide_contextmenuitem_override(strMenuItemID,boolDefaultShow,oContextMenu,aDoc)
{
	app.contextmenu_item_hors(oContextMenu, strMenuItemID , boolDefaultShow, aDoc);
	return false;
}

//-- context menu draw
var __SERVICEDESK_CONTEXT_MENU = null;
function servicedesk_draw_contextmenu(oContextMenu,ev)
{
	var aDoc = app.getEleDoc(oContextMenu);

	var overRideFunc = servicedesk_showhide_contextmenuitem_override
	if(app["_wc_helpdesk_contextmenuitem_showhide"])overRideFunc = app["_wc_helpdesk_contextmenuitem_showhide"];

	__SERVICEDESK_CONTEXT_MENU = aDoc.getElementById("app-context-menu");

	//-- show hide buttons
	if(overRideFunc("callupdate",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callupdate" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callassign",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callassign" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callaccept",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callaccept" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callhold",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callhold" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("calloffhold",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "calloffhold" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callresolve",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callresolve" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callcancel",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callcancel" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callreact",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callreact" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callclass",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callclass" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callcondition",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callcondition" , (!_bTasks && !_bIssue), aDoc);
	if(overRideFunc("callprofile",(!_bTasks && !_bIssue),oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "callprofile" , (!_bTasks && !_bIssue), aDoc);

	//-- tasks buttons
	if(overRideFunc("wf_complete",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_complete" , _bTasks, aDoc);
	if(overRideFunc("wf_update",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_update" , _bTasks, aDoc);
	if(overRideFunc("wf_showcomplete",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_showcomplete" , _bTasks, aDoc);
	if(overRideFunc("wf_showinactive",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "wf_showinactive" , _bTasks, aDoc);
	if(overRideFunc("wf_viewcall",_bTasks,oContextMenu,aDoc)!=false)app.contextmenu_item_dore(oContextMenu, "wf_viewcall" , true, aDoc);

	//-- enable buttons on context
	app.contextmenu_item_dore(oContextMenu, "callupdate" , _hd_bCanUpdate, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callassign" , _hd_bCanAssign, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callaccept" , _hd_bCanAccept, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callhold" , _hd_bCanHold, aDoc);
	app.contextmenu_item_dore(oContextMenu, "calloffhold" , _hd_bCanTakeOffHold, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callresolve" , (_hd_bCanResolve || _hd_bCanClose), aDoc);
	app.contextmenu_item_dore(oContextMenu, "callcancel" , _hd_bCanCancel, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callreact" , _hd_bCanReactivate, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callclass" , _hd_bCanUpdate && _hd_bCanChangeClass, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callcondition" , _hd_bCanUpdate && _hd_bCanChangeCondition, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callprofile" , _hd_bCanUpdate, aDoc);

	//-- watch
	app.contextmenu_item_dore(oContextMenu, "callwatch" , _hd_bCanWatch && !_bIssue, aDoc);
	app.contextmenu_item_dore(oContextMenu, "callunwatch" , _hd_bCanUnwatch && !_bIssue, aDoc);
	app.contextmenu_item_dore(oContextMenu, "watchoptions" , _hd_bCanUnwatch && !_bIssue, aDoc);


	//-- tasks buttons
	app.contextmenu_item_dore(oContextMenu, "wf_complete" , (!_bCompletedTask && !_bInactiveTask), aDoc);
	app.contextmenu_item_dore(oContextMenu, "wf_update" , !_bCompletedTask, aDoc);
	app.contextmenu_item_dore(oContextMenu, "wf_viewcall" , (_SelectedTaskCallref>0 || _CurrentSelectedServiceDeskCallrefs!="") && !_bIssue, aDoc);


	//-- issues
	if(overRideFunc("issueclose",_bIssue,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "issueclose" , _bIssue, aDoc);
	if(overRideFunc("issueupdate",_bIssue,oContextMenu,aDoc)!=false)app.contextmenu_item_hors(oContextMenu, "issueupdate" , _bIssue, aDoc);
	app.contextmenu_item_dore(oContextMenu, "issueupdate" ,  (_SelectedIssueID!=""), aDoc);
	app.contextmenu_item_dore(oContextMenu, "issueclose" ,  (_SelectedIssueID!=""), aDoc);

	//-- nwj - 30.03.2011 - allow app dev to trap context menu popup event and they can then hide options if need be
	//if(app["_wc_helpdesk_contextmenu_action"])
	//{
	//	var res = app["_wc_helpdesk_contextmenu_action"](strToolBarItemID,_CurrentSelectedServiceDeskCallrefs,_SelectedTaskCallref);
	//	if(res==false)return;
	//}

	return true;
}

function _helpdesk_page_start(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
	oDivTableHolder.setAttribute("page", 1);

	_servicedesk_apply_tablefilter(oDivTableHolder,true)
	

}
function _helpdesk_page_prev(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var currPage = filterDiv.getAttribute("pagenumber")-0;
	if(currPage>1)
	{
		var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
		oDivTableHolder.setAttribute("page", currPage-1);
		_servicedesk_apply_tablefilter(oDivTableHolder,true)
	}

}
function _helpdesk_page_next(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var currPage = filterDiv.getAttribute("pagenumber")-0;
	var lastPage = filterDiv.getAttribute("lastpagenumber")-0;
	if(currPage<lastPage)
	{
		var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
		oDivTableHolder.setAttribute("page", currPage+1);
		_servicedesk_apply_tablefilter(oDivTableHolder,true)
	}
}

function _helpdesk_page_end(btn)
{
	var filterDiv = app.get_parent_owner_by_id(btn,'table_filters');
	var lastPage = filterDiv.getAttribute("lastpagenumber")-0;
	var oDivTableHolder = app.get_parent_owner_by_class(filterDiv,"dhtml_table_holder");
	oDivTableHolder.setAttribute("page", lastPage);
	_servicedesk_apply_tablefilter(oDivTableHolder,true)
};;;;//-- 12.10.2009
//-- system functions to support the email view in AP

//-- flag status constants
_EMAIL_READ = 0;
_EMAIL_NOTREAD = 1;
_EMAIL_FLAGGEDANDREAD = 4096;
_EMAIL_FLAGGEDANDNOTREAD = 4097;

var _current_mailbox_name = "";
var _current_mailbox_prefix = "";
var _current_mailbox = "";
var _current_mailbox_folder = 0;
var _current_mailbox_foldername = "";
var _currentSelectedEmailRecordDeleted = false;

//-- handkle email drag and drop
function _mailview_dragdrop(droppedOnNode,eleDropped)
{
	if(eleDropped!=null && eleDropped.tagName=="TR")
	{

		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam("mailbox", app._current_mailbox);
		xmlmc.SetParam("messageId", eleDropped.getAttribute('keyvalue'));
		xmlmc.SetParam("targetFolderId", droppedOnNode.id);
		if(xmlmc.Invoke("mail", "moveMessage"))
		{
			//-- refresh mail view
			if(oControlFrameHolder._refresh_selected_mailbox)oControlFrameHolder._refresh_selected_mailbox(false);
		}
		else
		{
			alert(xmlmc.GetLastError());
		}
	}
}

//-- handle email row select
var _currentSelectedEmailRow = null;
var _currentSelectedEmailRecord = 0;
var _currentSelectedEmailXml = null;
var _current_email_customerid = "";
var _current_email_callref = 0;
function emaillist_select_row(aRow,e)
{
	//-- get event
	if(!e)e = window.event;

	if(aRow==undefined)aRow=this;
	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');

	//-- clicked same row
	if(_currentSelectedEmailRecord==intKeyValue)
	{
		//-- re-check toolbar incase state has changed
		_manage_emailview_toolbar(aRow);
		return;
	}

	top.debugstart("Email Selected","EMAIL");


	_currentSelectedEmailXml = null;
	_current_email_callref=0;
	_current_email_customerid = "";
	_currentSelectedEmailRecord=intKeyValue;
	_currentSelectedEmailRow = aRow;
	top.__CURRENT_SELECTED_TABLE_ROW = aRow;

	//--
	//-- highlight row - keep last selected if CTRL key is selected
	app.datatable_hilight(aRow, e.ctrlKey);

	_email_check_from_and_subject(aRow); //-- this must come before load preview as it will store mime atts in temp location

	//-- load preview of email
	_load_email_preview(intKeyValue)

	//-- manage servicedesk toolbar options based on selected call (s) status
	_manage_emailview_toolbar(aRow);

	top.debugend("Email Selected","EMAIL");

}

//-- check selected email for callref and from value for customer record
function _email_check_from_and_subject(aRow)
{
	var strLabelCustomer = "";
	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("mailbox", app._current_mailbox);
	xmlmc.SetParam("messageId", _currentSelectedEmailRecord);
	xmlmc.SetWebclientParam("_excludeFileAttachments", "1");
	if(xmlmc.Invoke("mail", "getMessage"))
	{
		//-- get from address
		_currentSelectedEmailXml = xmlmc.xmlDOM;
		xmlmc.xmlDOM = null;

		if(app._current_mailbox_prefix.indexOf("user_")==0)
		{
			_current_email_callref = 0;
			_current_email_customerid="";
		}
		else
		{
			//-- get from address
			var strFromAddress = "";
			var arrRecipients = _currentSelectedEmailXml.getElementsByTagName("mailRecipient");
			for(var x=0;x<arrRecipients.length;x++)
			{
				var strType = app.xmlNodeTextByTag(arrRecipients[x],"class");
				if(strType=="from")
				{
					strFromAddress = app.xmlNodeTextByTag(arrRecipients[x],"address");
					break;
				}
			}

			//-- see if we have a matching customer id
			var strLabelCustomer ="";
			if(strFromAddress!="")
			{
				_current_email_customerid = _get_email_customerid(strFromAddress);
				if(_current_email_customerid!="")
				{
					strLabelCustomer = "Customer (" + _current_email_customerid + ") found matching from address";
				}
			}

			_current_email_callref =_get_email_callref(app.xmlNodeTextByTag(_currentSelectedEmailXml,"subject"));
		}
	}
	else
	{
		alert(xmlmc._lasterror);
	}

	//--
	//-- 
	var aDoc = app.getEleDoc(aRow);
	_email_setup_callactions(_current_email_callref,aDoc);


	//-- set customer name and id in toolbar
	app.toolbar_item_dore("emailview_toolbar", "viewcustomer" , (strLabelCustomer!=""), aDoc);
	app.toolbar_item_setlabel("emailview_toolbar", "viewcustomer",strLabelCustomer,aDoc);
}

function _email_setup_callactions(intCallref, aDoc)
{
	var iStatus = -1;
	var bHaveCallref = (intCallref>0);
	//-- get call status info and set toolbar options accordingly
	if(bHaveCallref)
	{
		iStatus = global.GetCallStatusInfo(intCallref).nStatus;
	}
	

	if(app._current_mailbox_prefix.indexOf("user_")==0)
	{
		//-- hide call related options
		app.toolbar_item_sorh("emailview_toolbar", "lognewcall" , false, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "viewcall" , false, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "callupdate" , false, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "callhold" , false, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "calloffhold" , false, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "callresolve" , false, aDoc);

		app.contextmenu_item_hors(_email_contextmenu, "lognewcall" , false, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "viewcall" , false, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "callupdate" , false, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "callhold" ,false, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "calloffhold" ,false, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "callresolve" ,false, aDoc);
	}
	else
	{
		app.toolbar_item_sorh("emailview_toolbar", "lognewcall" , true, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "viewcall" , true, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "callupdate" , true, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "callhold" , true, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "calloffhold" , true, aDoc);
		app.toolbar_item_sorh("emailview_toolbar", "callresolve" , true, aDoc);

		app.toolbar_item_dore("emailview_toolbar", "lognewcall" , true, aDoc);
		app.toolbar_item_dore("emailview_toolbar", "viewcall" , bHaveCallref, aDoc);
		app.toolbar_item_dore("emailview_toolbar", "callupdate" , (iStatus>0 && iStatus < 15), aDoc);
		app.toolbar_item_dore("emailview_toolbar", "callhold" , (iStatus==1), aDoc);
		app.toolbar_item_dore("emailview_toolbar", "calloffhold" , (iStatus==4), aDoc);
		app.toolbar_item_dore("emailview_toolbar", "callresolve" , (iStatus==1 || iStatus==6), aDoc);

		app.toolbar_item_dore("emailview_toolbar", "callupdate" ,  (iStatus>0 && iStatus < 15), aDoc);
		app.toolbar_item_dore("emailview_toolbar", "callhold" , (iStatus==1), aDoc);
		app.toolbar_item_dore("emailview_toolbar", "calloffhold" , (iStatus==4), aDoc);
		app.toolbar_item_dore("emailview_toolbar", "callresolve" , (iStatus==1 || iStatus==6), aDoc);

		app.contextmenu_item_hors(_email_contextmenu, "lognewcall" , true, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "viewcall" , true, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "callupdate" , true, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "callhold" ,true, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "calloffhold" ,true, aDoc);
		app.contextmenu_item_hors(_email_contextmenu, "callresolve" ,true, aDoc);


		//-- can only reply or forward if one email selected
		app.contextmenu_item_dore(_email_contextmenu, "lognewcall" , true, aDoc);
		app.contextmenu_item_dore(_email_contextmenu, "viewcall" , bHaveCallref, aDoc);
		app.contextmenu_item_dore(_email_contextmenu, "callupdate" , (iStatus>0 && iStatus < 15), aDoc);
		app.contextmenu_item_dore(_email_contextmenu, "callhold" , (iStatus==1), aDoc);
		app.contextmenu_item_dore(_email_contextmenu, "calloffhold" ,(iStatus==4), aDoc);
		app.contextmenu_item_dore(_email_contextmenu, "callresolve" ,(iStatus==1  || iStatus==6), aDoc);

	}
}

//-- get callref from email subject
function _get_email_callref(strSubject)
{
	//-- find any words that begin with F or f 
	var arrMatches = strSubject.match(/\b[Ff]\S*/g);
	if(arrMatches==null)
	{
		return 0;
	}

	for(var x=0;x<arrMatches.length;x++)
	{
		var strCallref = arrMatches[x].substring(1);
		strCallref= strCallref.replace(/[^\d]/g, ""); //-- remove any characters
		strCallref++;strCallref--;
		if(!isNaN(strCallref))
		{
			return strCallref;
		}

	}

	return 0;

}

//-- get customer id from email add
function _get_email_customerid(strEmail)
{
	var mbXML = global.GetSharedMailboxXmlNode(app._current_mailbox);
	if(mbXML==undefined || mbXML==null) return "";

	var strTable = app.xmlNodeTextByTag(mbXML,"contactTable");
	if(strTable!="")
	{
		//-- use mb settings to get address
		var strKeyCol = app.xmlNodeTextByTag(mbXML,"contactId");
		var strEmailCol = app.xmlNodeTextByTag(mbXML,"contactEmail");
	}
	else
	{
		//-- we do not use default - QA23
		return "";
	}

	var strCustID = "";
	var strParams = "keycol="+ strKeyCol + "&table=" + strTable +"&emailcol=" + strEmailCol + "&emailaddress=" + strEmail;
	var aRS = new SqlQuery();
	aRS.WebclientStoredQuery("system/getCustomerIdFromEmail",strParams);
	while (aRS.Fetch())
	{
		strCustID = aRS.GetValueAsString(strKeyCol.toLowerCase());
	}
	return strCustID
}

function _email_open_attachment(aLink)
{
	if(confirm("You are opening a file attachment that is stored on the server. Large attachments can take some time to download depending on your network speed.\n\nDo you wish to continue?"))
	{
		app.oControlFrameHolder.open_attachment(aLink);
	}
}

//-- open email 
function emaillist_open_row(aRow,e)
{
	//-- get event object
	if(!e)e = window.event;

	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');

	//-- mark as read
	_mark_email_read(_currentSelectedEmailRecord,app._current_mailbox);
	_manage_emailview_toolbar(_currentSelectedEmailRow);

	var strParams  = "addnew=0&msgid="+intKeyValue;
	var strParams  = "addnew=0&_emailaction=RE:&_emailid="+_currentSelectedEmailRecord + "&_mailbox=" +app._current_mailbox;
	app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, null,null,window);
}

function _emailview_closed()
{
}

//-- load preview of email
function _load_email_preview(intKeyValue)
{
	//alert(app._current_mailbox_prefix)
	var strParams = "emailid=" + app.pfu(intKeyValue) + "&mailbox=" + app.pfu(app._current_mailbox);
	var strURL = app._workspacecontrolpath + "_views/mail/mailpreview.php?" + strParams;
	var targetDocument = app.getFrameDoc("iform_mail_" + app._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
	if(targetDocument!=undefined)app.load_iform(strURL, targetDocument);
}

//-- process email toolbar item
function _emailview_toolbar_action(strToolBarItemID)
{
	//if(_currentSelectedEmailRow==null || _currentSelectedEmailRow==undefined) return;

	var aDoc = app.oWorkspaceFrameHolder.document;
	var bRefreshCallButtons = false;
	var _arrSpecial = new Array();

	switch(strToolBarItemID)
	{
		case "emailnew":
			if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true))return;
			var strParams  = "addnew=0&_emailid=0";
			app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, null,null,window,undefined,undefined,_arrSpecial);
			break;
		case "emailview":
			var strParams  = "addnew=0&_emailid="+ _currentSelectedEmailRecord + "&_mailbox=" +app._current_mailbox;
			app._open_system_form("_sys_email_formview", "mail", "", strParams, false, null,null,window,undefined,undefined,_arrSpecial);
			break;
		case "emailreply":
			if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true))return;
			var strParams  = "addnew=0&_emailaction=RE:&_emailid="+_currentSelectedEmailRecord + "&_mailbox=" +app._current_mailbox;
			app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, null,null,window,undefined,undefined,_arrSpecial);
			break;
		case "emailreplyall":
			if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true))return;
			var strParams  = "addnew=0&_emailaction=REA:&_emailid="+_currentSelectedEmailRecord + "&_mailbox=" +app._current_mailbox;
			app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, null,null,window,undefined,undefined,_arrSpecial);
			break;
		case "emailforward":
			if(!_email_checkright(_EM_CANSEND,app._current_mailbox,true))return;
			var strParams  = "addnew=0&_emailaction=FW:&_emailid="+_currentSelectedEmailRecord + "&_mailbox=" +app._current_mailbox;
			app._open_system_form("_sys_email_formcompose", "mail", "", strParams, false, null,null,window,undefined,undefined,_arrSpecial);
			break;
		case "emailmarkasunread":
			_mark_email_unread(_currentSelectedEmailRecord,app._current_mailbox);
			break;
		case "emailmarkasread":
			_mark_email_read(_currentSelectedEmailRecord,app._current_mailbox);
			break;
		case "emailflag":
			_flag_email(_currentSelectedEmailRecord,app._current_mailbox,true);
			break;
		case "emailunflag":
			_flag_email(_currentSelectedEmailRecord,app._current_mailbox,false);
			break;
		case "emaildelete":
			if(_delete_email(_currentSelectedEmailRecord,app._current_mailbox))
			{
				//-- refresh view
				if(oControlFrameHolder._refresh_selected_mailbox)
				{
					_currentSelectedEmailRecordDeleted=true;
					oControlFrameHolder._refresh_selected_mailbox(false);
				}

				/*
				var oTable = _currentSelectedEmailRow.parentNode;
				oTable.deleteRow(_currentSelectedEmailRow.rowIndex);
				_disable_emailview_toolbar(oTable);
				if(oTable.rows[0])app.fireEvent(oTable.rows[0],"click");
				*/
				//_currentSelectedEmailRecordDeleted = false;
			}
			break;
		case "lognewcall":
			_open_system_form("_wc_lognewcallclass", "lcfpicker", "", "", true, function()
			{
				_manage_emailview_toolbar(_currentSelectedEmailRow);
				_email_setup_callactions(_current_email_callref,aDoc);			
			},undefined,window,undefined,undefined,_email_prepare_form_params(true));
			break;
		case "viewcustomer":
			_email_viewcustomer_record(_current_email_customerid);
			break;
		case "viewcall":
			_open_call_detail(_current_email_callref +"");
			break;
		case "callupdate":
			_updatecallform(_current_email_callref+"",window,_email_prepare_form_params(),function()
			{
				_manage_emailview_toolbar(_currentSelectedEmailRow);
				_email_setup_callactions(_current_email_callref,aDoc);
			});
			
			break;
		case "callhold":
			_holdcallform(_current_email_callref+"",window,_email_prepare_form_params(),function()
			{
				_manage_emailview_toolbar(_currentSelectedEmailRow);
				_email_setup_callactions(_current_email_callref,aDoc);
			});
			
			break;
		case "calloffhold":
			_offholdcall(_current_email_callref+"");
			_email_setup_callactions(_current_email_callref,aDoc);
			break;
		case "callresolve":
			_resolveclosecallform(_current_email_callref+"",window,_email_prepare_form_params(),function()
			{
				_manage_emailview_toolbar(_currentSelectedEmailRow);
				_email_setup_callactions(_current_email_callref,aDoc);
			});
			
			break;
		default:
			alert("Email View Toolbar Action " + strToolBarItemID)
			break;
	}

	_manage_emailview_toolbar(_currentSelectedEmailRow);
}


//-- getemail info to pass into call forms
function _email_prepare_form_params(bLogNew)
{
	if(bLogNew==undefined)bLogNew=false;

	var _EmailParams = new Array();
	if(_currentSelectedEmailXml!= null)
	{
		_EmailParams["_source_email"] = true;
		_EmailParams["PreloadType"] = 1; //-- email
		_EmailParams["messagesource"] = app._current_mailbox +"\\"+ _currentSelectedEmailRecord;
		_EmailParams["mailbox"] = app._current_mailbox;
		_EmailParams["emailid"] = _currentSelectedEmailRecord;
		_EmailParams["subject"] = app.xmlNodeTextByTag(_currentSelectedEmailXml,"subject");
		_EmailParams["emailsubject"] = _EmailParams["subject"]
		//_EmailParams["_"] = _EmailParams["subject"]

		//-- create to / form body text for update txt
		var strTimeReceived = app.string_replace(app.xmlNodeTextByTag(_currentSelectedEmailXml,"timeReceived"),"Z","");
		var epochDateReceived = app._date_to_epoch(app._parseDate(strTimeReceived,"yyyy-MM-dd HH:mm:ss"));
		_EmailParams["emaildatetimex"] = epochDateReceived;

		var dateReceived = app._date_from_epoch(epochDateReceived,app._analyst_timezoneoffset);
		strTimeReceived = app._formatDate(dateReceived,"yyyy-MM-dd HH:mm:ss"); 
		

		var strTopTitle = "Logged From Inbound Email (Mailbox: " + app._current_mailbox_name + ", Received at: " + strTimeReceived + ")";
		var strFrom = "";
		var strTo = "";
		var strCc = "";
		var strBcc = "";
		var arrRecipients = _currentSelectedEmailXml.getElementsByTagName("mailRecipient");
		for(var x=0;x<arrRecipients.length;x++)
		{
			var strType = app.xmlNodeTextByTag(arrRecipients[x],"class");
			if(strType=="from")
			{
				var strName = app.xmlNodeTextByTag(arrRecipients[x],"name");
				var strAdd = app.xmlNodeTextByTag(arrRecipients[x],"address");
				if(strName=="")strName = strAdd;
				if(strName==strAdd)
				{
					strFrom +=  app.xmlNodeTextByTag(arrRecipients[x],"name") +"; ";
				}
				else
				{
					strFrom +=  app.xmlNodeTextByTag(arrRecipients[x],"name") + " (" + app.xmlNodeTextByTag(arrRecipients[x],"address") + "); ";
				}
			}

			if(strType=="to")
			{
				var strName = app.xmlNodeTextByTag(arrRecipients[x],"name");
				var strAdd = app.xmlNodeTextByTag(arrRecipients[x],"address");
				if(strName=="")strName = strAdd;
				if(strName==strAdd)
				{
					strTo +=  app.xmlNodeTextByTag(arrRecipients[x],"name") +"; ";
				}
				else
				{
					strTo +=  app.xmlNodeTextByTag(arrRecipients[x],"name") + " (" + app.xmlNodeTextByTag(arrRecipients[x],"address") + "); ";
				}
			}

			if(strType=="cc")
			{
				var strName = app.xmlNodeTextByTag(arrRecipients[x],"name");
				var strAdd = app.xmlNodeTextByTag(arrRecipients[x],"address");
				if(strName=="")strName = strAdd;
				if(strName==strAdd)
				{
					strCc +=  app.xmlNodeTextByTag(arrRecipients[x],"name") +"; ";
				}
				else
				{
					strCc +=  app.xmlNodeTextByTag(arrRecipients[x],"name") + " (" + app.xmlNodeTextByTag(arrRecipients[x],"address") + "); ";
				}
			}

		}

		//-- concat stuff
		var strEmailUpdateText = ""

		//-- if log new and include headers option is set
		if(bLogNew && app.session.IsDefaultOption(ANALYST_DEFAULT_INCLUDESUBJECT))
		{
			//-- header for log new form
			strEmailUpdateText += strTopTitle;
			strEmailUpdateText += "\nFrom: " + strFrom;
			strEmailUpdateText += "\nTo: " + strTo;
			if(strCc!="") strEmailUpdateText += "\nCc: " + strCc;
			strEmailUpdateText += "\nSubject: " + _EmailParams["subject"];
			strEmailUpdateText += "\n\n" ;
		}

		strEmailUpdateText += app.xmlNodeTextByTag(_currentSelectedEmailXml,"body");
		_EmailParams["updatetext"] = strEmailUpdateText;
	}

	return _EmailParams;
}

function _email_viewcustomer_record(strCustomerID)
{
	//-- get editform for userdb table
	var strFormName = app.dd.tables["userdb"].editform;
	if(strFormName!="")
	{
		app.OpenFormForEdit(strFormName,strCustomerID,"",false,null,window);
	}
	else
	{
		alert("There is no customer form defined against the customer table. Please contact your Administrator");
	}
}

function _delete_email(intMessageID,strMailbox)
{
	if(!_email_checkright(_EM_CANDELETE,strMailbox,true))return;

	var bPurge = (top._current_mailbox_folder==4)?true:false;
	if(bPurge) //-- deleted items folder
	{
		if(!confirm("Message will be permantly deleted. Continue?")) return;
	}

	var xmlmc = new XmlMethodCall;
	xmlmc.SetParam("mailbox", strMailbox);

	//-- delete each selected email
	var eDataTable = app.get_row_datatable(_currentSelectedEmailRow);
	var strCurrIndexes = app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);
	var arrIndexes = strCurrIndexes.split(",");
	if(strCurrIndexes=="")arrIndexes = new Array();
	for(var x=0;x<arrIndexes.length;x++)
	{
		//-- get status so we can modify the flagged bit value
		var currRow =  eDataTable.rows[arrIndexes[x]];
		var intMessageID = currRow.getAttribute('keyvalue');
		xmlmc.SetParam("messageId", intMessageID);
	}

	xmlmc.SetParam("purge", bPurge);
	if(xmlmc.Invoke("mail", "deleteMessage"))
	{
		return true;
	}
	return false;
}


function _flag_email(intMessageID,strMailbox,boolFlag)
{
	if(!_email_checkright(_EM_CANFLAGUNFLAG,strMailbox,true))return;

	var xmlmc = new XmlMethodCall;
	xmlmc.SetParam("mailbox", strMailbox);
	xmlmc.SetParam("messageId", intMessageID);
	xmlmc.SetParam("flagged", ""+boolFlag);
	if(xmlmc.Invoke("mail", "setMessageFlagged"))
	{
		var eDataTable = app.get_row_datatable(_currentSelectedEmailRow);
		var strCurrIndexes = app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);
		var arrIndexes = strCurrIndexes.split(",");
		if(strCurrIndexes=="")arrIndexes = new Array();
		for(var x=0;x<arrIndexes.length;x++)
		{
			//-- get status so we can modify the flagged bit value
			var currRow =  eDataTable.rows[arrIndexes[x]];
			var intStatusValue = currRow.getAttribute('emailstatus');
			intStatusValue++;intStatusValue--;

			if(boolFlag)
			{
				intStatusValue = intStatusValue + 4096;
			}
			else
			{
				intStatusValue = intStatusValue - 4096;
			}
			currRow.setAttribute('emailstatus',intStatusValue);
			_conversion_email_status_icon(currRow, intStatusValue);
		}



		return true;
	}
	return false;
}


function _mark_email_unread(intMessageID,strMailbox)
{

	if(!_email_checkright(_EM_CANFLAGUNREAD,strMailbox,true))return;

	var xmlmc = new XmlMethodCall;
	xmlmc.SetParam("mailbox", strMailbox);
	xmlmc.SetParam("messageId", intMessageID);
	if(xmlmc.Invoke("mail", "markMessageUnread"))
	{
		var eDataTable = app.get_row_datatable(_currentSelectedEmailRow);
		var strCurrIndexes = app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);
		var arrIndexes = strCurrIndexes.split(",");
		if(strCurrIndexes=="")arrIndexes = new Array();
		for(var x=0;x<arrIndexes.length;x++)
		{
			var currRow =  eDataTable.rows[arrIndexes[x]];

			//-- loop cell divs and set font-weight to bold
			for(var y=0;y<currRow.cells.length;y++)
			{
				if(currRow.cells[y].childNodes[0])currRow.cells[y].childNodes[0].style.fontWeight="bold";
			}

			//-- get status so we can remove the unread bit
			var intStatusValue = currRow.getAttribute('emailstatus');
			intStatusValue++;intStatusValue--;
			intStatusValue++; //-- add the unread bit (1)
			currRow.setAttribute('emailstatus',intStatusValue);
			_conversion_email_status_icon(currRow, intStatusValue);

		}

		return true;
	}
	return false;
}

function _mark_email_read(intMessageID,strMailbox)
{
	var xmlmc = new XmlMethodCall;
	xmlmc.SetParam("mailbox", strMailbox);
	xmlmc.SetParam("messageId", intMessageID);
	if(xmlmc.Invoke("mail", "markMessageRead"))
	{
		var eDataTable = app.get_row_datatable(_currentSelectedEmailRow);
		var strCurrIndexes = app.get_row_datatable_selectedindexes(_currentSelectedEmailRow);
		var arrIndexes = strCurrIndexes.split(",");
		if(strCurrIndexes=="")arrIndexes = new Array();
		//-- need to change row so it is not bold
		for(var x=0;x<arrIndexes.length;x++)
		{
			var currRow =  eDataTable.rows[arrIndexes[x]];

			//-- loop cell divs and set font-weight to normal
			for(var y=0;y<currRow.cells.length;y++)
			{
				if(currRow.cells[y].childNodes[0])currRow.cells[y].childNodes[0].style.fontWeight="normal";
			}

			//-- get status so we can remove the unread bit
			var intStatusValue = currRow.getAttribute('emailstatus');
			intStatusValue++;intStatusValue--;
			intStatusValue--; //-- remove the unread bit (1)
			currRow.setAttribute('emailstatus',intStatusValue);

			_conversion_email_status_icon(currRow, intStatusValue);
		}
		
		return true;
	}
	return false;
}

function _conversion_email_status_icon(aRow, intStatus)
{
	var strImgCellHTML = "";
	switch(intStatus)
	{
		case 0:
			strImgCellHTML = "<img src='_controls/datatable/tableimages/email-read.png'>";
			break;
		case 1:
			strImgCellHTML = "<img src='_controls/datatable/tableimages/email-unread.png'>";
			break;
		case 4096:
			strImgCellHTML = "<img src='_controls/datatable/tableimages/email-flagread.png'>";
			break;
		case 4097:
			strImgCellHTML = "<img src='_controls/datatable/tableimages/email-flagunread.png'>";
			break;
	}

	aRow.cells[1].childNodes[0].innerHTML = strImgCellHTML;
}


function _disable_emailview_toolbar(aTable)
{
	if(aTable==null ||aTable==undefined)return;
	var aDoc = app.getEleDoc(aTable);

	_currentSelectedEmailXml=null;
	//_currentSelectedEmailRecord=0;

	//-- can always mark as unread or read based
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasread" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasunread" , false, aDoc);

	//-- can always flag or unflag emails
	app.toolbar_item_dore("emailview_toolbar", "emailflag" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailunflag" , false, aDoc);

	//-- can always delete email (s)
	app.toolbar_item_dore("emailview_toolbar", "emaildelete" , false, aDoc);

	//-- can only reply or forward if one email selected
	app.toolbar_item_dore("emailview_toolbar", "emailview" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreply" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreplyall" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailforward" , false, aDoc);

	app.contextmenu_item_dore(_email_contextmenu, "emailmarkasread" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "emailmarkasunread" , false, aDoc);

	app.toolbar_item_dore("emailview_toolbar", "lognewcall" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "callupdate" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "callhold" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "calloffhold" , false, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "callresolve" , false, aDoc);

	//-- can always flag or unflag emails
	_email_NumRowsSelected = 0;
	app.contextmenu_item_dore(_email_contextmenu, "emailflag" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "emailunflag" , false, aDoc);

	//-- can always delete email (s)
	app.contextmenu_item_dore(_email_contextmenu, "emaildelete" , false, aDoc);

	//-- can only reply or forward if one email selected
	app.contextmenu_item_dore(_email_contextmenu, "emailview" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "emailreply" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "emailreplyall" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "emailforward" ,false, aDoc);

	//-- can only reply or forward if one email selected
	app.contextmenu_item_dore(_email_contextmenu, "lognewcall" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "callupdate" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "callhold" , false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "calloffhold" ,false, aDoc);
	app.contextmenu_item_dore(_email_contextmenu, "callresolve" ,false, aDoc);

	var ifShimmer = aDoc.getElementById("app-context-menu");
	if(ifShimmer!=null)
	{
		ifShimmer.innerHTML ="";
		ifShimmer.style.display="none";
	}

}

var _email_contextmenu = null;
function _manage_emailview_contextmenu(oContextMenu)
{
	if(_currentSelectedEmailRecord==0)
	{
		return;
	}

	//-- enable buttons on toolbar
	var aDoc = app.getEleDoc(oContextMenu);


	//-- can always mark as unread or read based
	app.contextmenu_item_dore(oContextMenu, "emailmarkasread" , (_email_NumRowsSelected>0) && _email_bNotRead , aDoc);
	app.contextmenu_item_dore(oContextMenu, "emailmarkasunread" , (_email_NumRowsSelected>0)&& _email_bRead && _email_checkright(_EM_CANFLAGUNREAD,app._current_mailbox), aDoc);

	//-- can always flag or unflag emails
	app.contextmenu_item_dore(oContextMenu, "emailflag" , (_email_NumRowsSelected>0) && !_email_bFlaggedRead && _email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox), aDoc);
	app.contextmenu_item_dore(oContextMenu, "emailunflag" , (_email_NumRowsSelected>0) && _email_bFlaggedRead && _email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox), aDoc);

	//-- can always delete email (s)
	app.contextmenu_item_dore(oContextMenu, "emaildelete" , (_email_NumRowsSelected>0) && _email_checkright(_EM_CANDELETE,app._current_mailbox), aDoc);

	//-- can only reply or forward if one email selected
	app.contextmenu_item_dore(oContextMenu, "emailview" , (_email_NumRowsSelected==1) , aDoc);
	app.contextmenu_item_dore(oContextMenu, "emailreply" , (_email_NumRowsSelected==1) && _email_checkright(_EM_CANSEND,app._current_mailbox), aDoc);
	app.contextmenu_item_dore(oContextMenu, "emailreplyall" , (_email_NumRowsSelected==1)&& _email_checkright(_EM_CANSEND,app._current_mailbox), aDoc);
	app.contextmenu_item_dore(oContextMenu, "emailforward" , (_email_NumRowsSelected==1)&& _email_checkright(_EM_CANSEND,app._current_mailbox), aDoc);
}

//-- enable / disable the email toolbar
var _email_bRead = false;
var _email_bNotRead = false;
var _email_bFlaggedRead = false;
var _email_bFlaggedNotRead = false;
var _email_NumRowsSelected = 0;

function _manage_emailview_toolbar(aRow)
{
	 _email_bRead = false;
	 _email_bNotRead = false;
	 _email_bFlaggedRead = false;
	 _email_bFlaggedNotRead = false;

	
	//--
	//--	get all selected rows for the email row table - we only want to enable toolbar options based on majority
	var arrIndexes = [];
	if(aRow)
	{
		var eDataTable = app.get_row_datatable(aRow);
		var strCurrIndexes = app.get_row_datatable_selectedindexes(aRow);
		var arrIndexes = strCurrIndexes.split(",");
		if(strCurrIndexes=="")arrIndexes = new Array();

		for(var x=0;x<arrIndexes.length;x++)
		{
			var intStatusValue = eDataTable.rows[arrIndexes[x]].getAttribute('emailstatus');
			intStatusValue++;intStatusValue--;

			switch (intStatusValue)
			{
				case _EMAIL_READ:
					_email_bRead=true;
					break;
				case _EMAIL_NOTREAD:
					_email_bNotRead=true;
					break;
				case _EMAIL_FLAGGEDANDREAD:
					_email_bRead=true;
					_email_bFlaggedRead=true;
					break;
				case _EMAIL_FLAGGEDANDNOTREAD:
					_email_bFlaggedRead=true;
					_email_bNotRead=true;
					break;			
			}
		}
	}	

	//-- enable buttons on toolbar
	var aDoc = (aRow)?app.getEleDoc(aRow):document;
	if(!aDoc)aDoc=document;
	
	//-- can always mark as unread or read based
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasread" , _email_bNotRead, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasunread" , _email_bRead && _email_checkright(_EM_CANFLAGUNREAD,app._current_mailbox), aDoc);

	//-- can always flag or unflag emails
	app.toolbar_item_dore("emailview_toolbar", "emailflag" , !_email_bFlaggedRead && _email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailunflag" , _email_bFlaggedRead  && _email_checkright(_EM_CANFLAGUNFLAG,app._current_mailbox), aDoc);

	//-- can always delete email (s)
	app.toolbar_item_dore("emailview_toolbar", "emaildelete" , _email_checkright(_EM_CANDELETE,app._current_mailbox) , aDoc);

	_email_NumRowsSelected = arrIndexes.length;

	//-- can only reply or forward if one email selected
	app.toolbar_item_dore("emailview_toolbar", "emailview" , (arrIndexes.length==1), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreply" , (arrIndexes.length==1)&& _email_checkright(_EM_CANSEND,app._current_mailbox), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreplyall" , (arrIndexes.length==1)&& _email_checkright(_EM_CANSEND,app._current_mailbox), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailforward" , (arrIndexes.length==1)&& _email_checkright(_EM_CANSEND,app._current_mailbox), aDoc);
}


//-- copy email attachments for use by a particular form i.e. lcf, call action form or email formwarding
function _copy_emailattachments_for_form(intEmailID,strMailbox,strFormID, oEmailXML)
{
	if(oEmailXML==undefined)
	{
		//-- we need to get email xml object to get file att info
		var xmlmc = new XmlMethodCall;
		xmlmc.SetParam("mailbox", strMailbox);
		xmlmc.SetParam("messageId", intEmailID);
		if(xmlmc.Invoke("mail", "getMessage"))
		{
			oEmailXML = xmlmc.xmlDOM;
			xmlmc = null;
		}
		else
		{
			alert("_copy_emailattachments_for_form : Email file attachments could not be copied for us by the form");
			return false;
		}
	}

	//-- get fileatt array
	var strFiles = "";
	var arrFiles = oEmailXML.getElementsByTagName("fileAttachment");
	for(var x=0;x<arrFiles.length;x++)
	{
		if(strFiles!="")strFiles+=",";
		strFiles+= app.xmlNodeTextByTag(arrFiles[x],"swFileId");
	}

	if(strFiles!="")
	{
		//-- call php to copy files to forms temp file location - do not wait for response (if it fails it fails nothing we can do about it)
		var strURL = app.get_service_url("email/getemailattachmentsforform","");
		var strParams = "_mailbox="+strMailbox+"&_fileids=" + strFiles + "&_uniqueformid=" + strFormID;
		app.get_http(strURL,strParams, false, false);
	}
	//-- so can add info to filetable
	return arrFiles;
}


//--
//-- poll server for updated info
var _email_serverpoll_timeout = -1;
function _email_poll_mailboxrefresh()
{
	//-- get polling info
	if(_email_serverpoll_timeout==-1)
	{
		var intRefreshValue = app.dd.GetGlobalParamAsNumber("views/E-Mail/webclient settings/refreshpolling");
		if(intRefreshValue!="" && intRefreshValue>0)
		{
			_email_serverpoll_timeout = intRefreshValue;
		}
		else
		{
			if(intRefreshValue<0) 
			{
				return; //-- do not do any polling
			}
			
			//-- set default to 5 minutes (300 seconds)
			_email_serverpoll_timeout = 300; //-- 5 minutes
		}
	}

	setTimeout("_email_action_mailboxrefresh()",(_email_serverpoll_timeout*1000));
}

function _email_action_mailboxrefresh()
{
	if(oControlFrameHolder._refresh_selected_mailbox)
	{
		app.debugstart("_email_action_mailboxrefresh","POLLING")
		oControlFrameHolder._refresh_selected_mailbox(true);
		setTimeout("_email_action_mailboxrefresh()",(_email_serverpoll_timeout*1000));
		app.debugend("_email_action_mailboxrefresh","POLLING")
	}
}


//-- store rights for each mailbox
var _bool__current_mailbox_permissions_fetched = false;
var _current_mailbox_permissions = new Array();
function _email_getmailbox_permissions()
{
	if(_bool__current_mailbox_permissions_fetched) return true;
	_bool__current_mailbox_permissions_fetched = true;
	//-- reset
	_current_mailbox_permissions = new Array();

	//-- xmlmc to get rights
	var xmlmc = new XmlMethodCall;
	xmlmc.SetParam("analystId", session.analystid);
	if(xmlmc.Invoke("mail", "getAnalystMailboxRights"))
	{
		var arrMailBox = xmlmc.xmlDOM.getElementsByTagName("mailbox");
		for (var x=0;x<arrMailBox.length;x++)
		{
			var strName = app.xmlNodeTextByTag(arrMailBox[x],"name").toLowerCase();
			var intRights = parseInt(app.xmlNodeTextByTag(arrMailBox[x],"rights"));
			if(intRights>0)	_current_mailbox_permissions[strName] = intRights;
		}
		return true;
	}
	return false;
}

function _email_checkright(intRightToCheck, strMailboxName, bShowMessage)
{
	if(bShowMessage==undefined)bShowMessage=false;

	if(strMailboxName=="%")
	{
		//-- check any mailbox to see if has right
		for(strMailboxID in _current_mailbox_permissions)
		{
			if(_email_checkright(intRightToCheck, strMailboxID)) return true;
		}
		return false;
	}
	else if(_current_mailbox_permissions[strMailboxName.toLowerCase()]==undefined) return false;

	//-- return /f
	var intMailboxRights = _current_mailbox_permissions[strMailboxName.toLowerCase()];
	var res =  (intRightToCheck & intMailboxRights);

	if(bShowMessage && !res)
	{
		if(_EM_RIGHTS_MSG[intRightToCheck]!=undefined)alert(_EM_RIGHTS_MSG[intRightToCheck]);
	}

	return res;
}


//-- paging control
function _email_page_left(oTD)
{
	//-- get parent table holder
	var divFilterHolder = app.get_parent_owner_by_tag(oTD, "DIV");
	if(divFilterHolder!=null)
	{
		var divHolder = app.get_parent_owner_by_tag(divFilterHolder, "DIV");
	}
	var intPage =  divHolder.getAttribute("page");
	intPage--;
	if(intPage==0)return;
	divHolder.setAttribute("page",intPage);

	oControlFrameHolder.refresh_data(divHolder);
}
function _email_page_start(oTD)
{
	//-- get parent table holder
	var divFilterHolder = app.get_parent_owner_by_tag(oTD, "DIV");
	if(divFilterHolder!=null)
	{
		var divHolder = app.get_parent_owner_by_tag(divFilterHolder, "DIV");
	}
	
	divHolder.setAttribute("page","1");
	oControlFrameHolder.refresh_data(divHolder);
}
function _email_page_right(oTD)
{
	
	//-- get parent table holder
	var divFilterHolder = app.get_parent_owner_by_tag(oTD, "DIV");
	if(divFilterHolder!=null)
	{
		var divHolder = app.get_parent_owner_by_tag(divFilterHolder, "DIV");
	}

	var maxPage =	divHolder.getAttribute("totalpages");
	var intPage =  divHolder.getAttribute("page");
	intPage++;
	
	if(intPage > maxPage)return;

	divHolder.setAttribute("page",intPage);
	oControlFrameHolder.refresh_data(divHolder);
}

function _email_page_end(oTD)
{
	//-- get parent table holder
	var divFilterHolder = app.get_parent_owner_by_tag(oTD, "DIV");
	if(divFilterHolder!=null)
	{
		var divHolder = app.get_parent_owner_by_tag(divFilterHolder, "DIV");
	}
	
	var intPage =  divHolder.getAttribute("page");
	var maxPage =	divHolder.getAttribute("totalpages");
	divHolder.setAttribute("page",maxPage);

	oControlFrameHolder.refresh_data(divHolder);
};;;;//-- 19.10.2009
//-- functions for managing calendar view - i.e. 


//-- handle menu bar actions 
var _current_calendar_view = 1;
function calendar_toolbar_action(strToolBarItemID)
{
	switch(strToolBarItemID)
	{
		case "appnew":
			_add_new_appointment();
			break;
		case "cal1":
		case "cal5":
		case "cal7":
		case "cal31":
			//-- change calendar view
			var targetDocument = app.getFrame("iform_calendar_" + app._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
			if(targetDocument==undefined)
			{
				alert("calendar_toolbar_action : The calendar workspace iframe was not found.\n\nPlease contact your Administrator.")
				return false;
			}
			targetDocument.change_view(strToolBarItemID);
			break;
		default:
			alert(strToolBarItemID);
	}
}

//--
//-- enable disable toolbar based on selected appointment
function manage_calendar_toolbar(aDiv)
{
	//-- enable buttons on toolbar
	var aDoc = app.getEleDoc(aDiv);
	app.toolbar_item_dore("calendar_toolbar", "appnew" , true, aDoc);
	app.toolbar_item_dore("calendar_toolbar", "appview" , true, aDoc);
	app.toolbar_item_dore("calendar_toolbar", "appdelete" , true, aDoc);
}


function _add_new_appointment(intCalID)
{
	if(intCalID==undefined)intCalID = app.oControlFrameHolder.intDefaultCalendarID;


	var arrCals = app.oControlFrameHolder._strSelectedCalendars.split("|");
	if(arrCals.length==0) 
	{
		alert("Please select a calendar and then create a new appointment.");
		return;
	}
	else if(arrCals.length>1) 
	{
		alert("You can only create a calendar ")
		return;
	}
	else
	{
		intCalID = arrCals[0].split("^")[0];
		strCalName = arrCals[0].split("^")[1];
	}


	//-- open appointment record
	var jsDate= new Date();
	var startTime = app._formatDate(jsDate,"yyyy-MM-dd HH:mm:ss");
	jsDate.setHours(jsDate.getHours()+1);
	var endTime = app._formatDate(jsDate,"yyyy-MM-dd HH:mm:ss");

	var strParams  = "addnew=1&startdate="+startTime+"&enddate="+endTime+"&calname="+strCalName+"&calid="+intCalID;
	app._open_system_form("_sys_calendar_appointment", "calendar", "", strParams, true, function()
	{
		//-- refresh calendar
		_refresh_calendar_view();
	},null,window);

}


function _edit_appointment(intCalID,intAppID)
{
	//-- open appointment record
	var strParams  = "addnew=0&calid="+intCalID+"&appid=" + intAppID;
	var strKey = intCalID +"::"+intAppID;
	app._open_system_form("_sys_calendar_appointment", "calendar", strKey, strParams, true, function()
	{
		//-- refresh calendar
		setTimeout("_refresh_calendar_view()",100);
	},null,window);

}

//--
//-- open appointment
function open_appointment(aDiv)
{
	var aDoc = app.getEleDoc(aDiv);
	var intAppID = aDiv.getAttribute("appid");
	var intCalID = aDiv.getAttribute("calid");
	return _edit_appointment(intCalID,intAppID);
}

function _refresh_calendar_view()
{
	//-- reload current view
	app.oControlFrameHolder.load_calendars();
}


function switch_calendar_view_btn(strView)
{
	switch(strView)
	{
		case 1:
			strBtnID= "cal1";
			break;
		case 7:
			strBtnID= "cal7";
			break;
		case 3:
			strBtnID= "cal31";
			break;
	}

	//-- store
	_current_calendar_view= strView;

	//var targetDocument = app.getFrame("iform_calendar_calendar", app.oWorkspaceFrameHolder.document);
	app.toolbar_item_check("calendar_toolbar",strBtnID,app.oWorkspaceFrameHolder.document)
}
;;;;//-- 12.10.2009
//-- system functions to support the kbase view in AP

//-- flag status constants

//-- handle kbase search row select
var _kbase_current_selected_document = "";
var _kbase_selecting_row = null;
function kbase_select_row(aRow,e)
{
	if(_kbase_selecting_row==aRow) 
	{
		return false;
	}
	_kbase_selecting_row=aRow;

	//-- get event
	if(!e)e = window.event;

	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');
	var iExt = 0;

	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("docRef",intKeyValue);
	if(xmlmc.Invoke("knowledgebase","documentGetType"))
	{
		if(xmlmc.GetParam("type")=="External") iExt=1;
	}
	
	//--
	//-- highlight row - keep last selected if CTRL key is selected
	app.datatable_hilight(aRow, e.ctrlKey);

	//-- manage servicedesk toolbar options based on selected call (s) status
	manage_kbase_toolbar(aRow);

	//-- load preview of email - if not already selected
	if(_kbase_current_selected_document!=intKeyValue)
	{
		_kbase_current_selected_document=intKeyValue;
		load_kbase_preview(intKeyValue,iExt);
	}
}

//-- open kbase article
function kbase_open_row(aRow,e)
{
	//alert("Managing knowledgebase articles is not supported by the webclient.");
	//return;

	//-- get event object
	if(!e)e = window.event;

	var intKeyValue = aRow.getAttribute('keyvalue');
	var strKeyCol = aRow.getAttribute('keycolumn');

	app.kbase.open_document(intKeyValue);

}

function _kbase_form_closed()
{
	//alert("form closed : refresh?")
}

//-- load preview of kbase article
function load_kbase_preview(intKeyValue,intExt)
{
	var strParams = "docref=" + app.pfu(intKeyValue);

	if(intExt==1)
	{
		var strURL = app._workspacecontrolpath + "_views/knowledgebase/kbasepreview.php?" + strParams;
	}
	else
	{
		var strURL = app.webroot + "/clisupp/details/swkbase.php?"+ strParams;
	}

	var targetDocument = app.getFrameDoc("iform_knowledgebase_" + top._CurrentOutlookID, app.oWorkspaceFrameHolder.document);
	if(targetDocument!=undefined)app.load_iform(strURL, targetDocument);
}

//-- process email toolbar item
function kbase_toolbar_action(strToolBarItemID)
{
	alert(strToolBarItemID)
}

//-- enable / disable the email toolbar
function manage_kbase_toolbar(aRow)
{

	var bRead = false;
	var bNotRead = false;
	var bFlaggedRead = false;
	var bFlaggedNotRead = false;
	//--
	//-- get all selected rows for the email row table - we only want to enable toolbar options based on majority
	var eDataTable = app.get_row_datatable(aRow);
	var strCurrIndexes = app.get_row_datatable_selectedindexes(aRow);
	var arrIndexes = strCurrIndexes.split(",");
	
	for(var x=0;x<arrIndexes.length;x++)
	{
		var intStatusValue = eDataTable.rows[x].getAttribute('emailstatus');
		intStatusValue++;intStatusValue--;
		switch (intStatusValue)
		{
			case _EMAIL_READ:
				bRead=true;
				break;
			case _EMAIL_NOTREAD:
				bNotRead=true;
				break;
			case _EMAIL_FLAGGEDANDREAD:
				bRead=true;
				bFlaggedRead=true;
				break;
			case _EMAIL_FLAGGEDANDNOTREAD:
				bFlaggedRead=true;
				bNotRead=true;
				break;			
		}
	}
	

	//-- enable buttons on toolbar
	var aDoc = app.getEleDoc(aRow);

	//-- can always mark as unread or read based
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasread" , bNotRead, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailmarkasunread" , bRead, aDoc);

	//-- can always flag or unflag emails
	app.toolbar_item_dore("emailview_toolbar", "emailflag" , !bFlaggedRead, aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailunflag" , bFlaggedRead, aDoc);

	//-- can always delete email (s)
	app.toolbar_item_dore("emailview_toolbar", "emaildelete" , true, aDoc);

	//-- can only reply or forward if one email selected
	app.toolbar_item_dore("emailview_toolbar", "emailview" , (arrIndexes.length==1), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreply" , (arrIndexes.length==1), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailreplyall" , (arrIndexes.length==1), aDoc);
	app.toolbar_item_dore("emailview_toolbar", "emailforward" , (arrIndexes.length==1), aDoc);

};;;;var SwMyLibrary = new _SwMyLibrary();
function _SwMyLibrary()
{
	this.boolVirtualPath = false;
	this.virtualPath = "";
	this.selectedTreeNode = null;
	this.treeControl = null;
	this.contentmenu = null;
	this.rowSelected = false;
}

_SwMyLibrary.prototype.refreshTree = function()
{
	var currSelectedPath = this.selectedTreeNode.tree.getNodePath();

	//-- refresh tree
	app.oControlFrameHolder._load_folder_xml(this.selectedTreeNode._virtualpath,this.selectedTreeNode.id);

	//-- reload the file view
	var aNode = this.treeControl.getNodeByPath(currSelectedPath);
	if(aNode!=null)aNode.tree.s(aNode,true, undefined,true);
}

_SwMyLibrary.prototype.contextMenuAction = function(selectedItem)
{
	//-- call object method of same name as action
	this.swParentObject.hideContextMenu();
	var menu = this;
	if(menu.swParentObject[selectedItem.id])menu.swParentObject[selectedItem.id]();
}

_SwMyLibrary.prototype.addnewfolder = function()
{
	var strNewFolder = prompt("Please enter the new folder name:-","");
	if(strNewFolder=="" || strNewFolder==null)return;

	
	var strNewPath =this.virtualPath + "/" + strNewFolder;
	strNewPath = strNewPath.replace("//","");


	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("folder", strNewPath);
	if(xmlmc.Invoke("mylibrary", "createFolder"))
	{
		//-- refresh view
		this.treeControl.removeNodesChildren(this.selectedTreeNode);
		this.refreshTree();
	}
	else
	{
		alert("Failed to create new folder. Please ensure the folder name provided is valid.");

	}
}

_SwMyLibrary.prototype.deleteff = function()
{
	var strName = this.rowSelected.getAttribute("filename");
	var strType = this.rowSelected.getAttribute("filetype");
	var strFFPath = this.virtualPath+"/" + strName;
	strFFPath = strFFPath.replace("//","");


	var strMessage = (strType=="dir")?"Are you sure you want to delete the folder '"+strName+"' and all its contents?":"Are you sure you want to delete "+ strName;
	if(!confirm(strMessage)) return;

	var xmlmc = new XmlMethodCall();
	if(strType=="dir")
	{
		xmlmc.SetParam("folder", strFFPath);
		xmlmc.SetParam("forceDelete", true);
		if(xmlmc.Invoke("mylibrary", "deleteFolder"))
		{
			//-- refresh folder view
			this.treeControl.removeNodesChildren(this.selectedTreeNode);
			this.refreshTree();
		}
	}
	else
	{
		xmlmc.SetParam("file", strFFPath);
		if(xmlmc.Invoke("mylibrary", "deleteFile"))
		{
			//-- refresh view
			this.refreshTree();
		}
	}
}

_SwMyLibrary.prototype.addnewfile = function()
{
	var strPhpPath = app._root +"service/mylibrary/uploadfile/index.php";
	app.global._selectFileToUpload(strPhpPath,this.selectedTreeNode._virtualpath,top.SwMyLibrary.onnewfileadded);
}

_SwMyLibrary.prototype.onnewfileadded = function(strFileName,topWin)
{
	if(topWin!=undefined)topWin.close();
	this.refreshTree();
}



_SwMyLibrary.prototype.renameff = function()
{
	if(this.rowSelected==null)return;


	var strName = this.rowSelected.getAttribute("filename");
	var strPath = this.rowSelected.getAttribute("path");
	var strType = this.rowSelected.getAttribute("filetype");

	var strNewName = prompt("Rename:-",strName);
	if(strNewName=="" || strNewName==strName)return;

	var xmlmc = new XmlMethodCall();
	xmlmc.SetParam("path", strPath);
	xmlmc.SetParam("newName", strNewName);
	if(xmlmc.Invoke("mylibrary", "renameItem"))
	{
		//-- if a dir then remove it from tree so new named node is created
		if(strType=="dir")
		{
			this.treeControl.removeNodesChildren(this.selectedTreeNode);
		}

		//-- refresh view
		this.refreshTree();
	}
}

_SwMyLibrary.prototype.openff = function()
{
	this.openResource(this.rowSelected);
}


_SwMyLibrary.prototype.openwww = function()
{
	var strName = app.pfx(this.rowSelected.getAttribute("filename"));
	var childNode = this.treeControl.getNodeByName(strName,"_mr");
	if(childNode!=null)
	{
		this.treeControl.openTo(childNode,true,true,true);
	}
}

_SwMyLibrary.prototype.newwww = function()
{
	//-- open system form
	app._open_system_form("_sys_mylib_newwww", "mylibrary", "", "", true, function(oForm)
	{
		if(oForm.document._www_url !="")
		{
			var xmlmc = new XmlMethodCall();
			xmlmc.SetComplexValue("resource","name", oForm.document._www_display_name);
			xmlmc.SetComplexValue("resource","url", oForm.document._www_url);
			if(xmlmc.Invoke("mylibrary", "addUserLibraryResource"))
			{
				//-- add item to tree then select
				this.refreshResourceList();
			}
		}
	},null,window);
}

_SwMyLibrary.prototype.deletewww = function()
{
	//-- delete selected url
	if(this.rowSelected!=null)
	{
		var xmlmc = new XmlMethodCall();
		xmlmc.SetParam("name", this.rowSelected.getAttribute("filename"));
		if(xmlmc.Invoke("mylibrary", "deleteUserLibraryResource"))
		{
			//-- remove node
			this.treeControl.removeNodesChildren(this.selectedTreeNode);
			this.refreshResourceList();
		}
	}
}


_SwMyLibrary.prototype.refreshResourceList = function()
{
	//-- refresh tree
	app.oControlFrameHolder._load_resources_list();

	//-- reload the file view
	var aNode = this.selectedTreeNode.tree.getNodeByID("_mr","-1");
	if(aNode!=null)
	{
		aNode.tree.s(aNode);
	}

}


_SwMyLibrary.prototype.showContextMenu = function(divHolder,eV)
{
	app.stopEvent(eV);
	app.hide_application_menu_divs();
	if(this.selectedTreeNode==null)return false;

	if(this.popupmenu==null)
	{
		this.popupmenu = app._new__popupmenu('_mylib_contextmenu',divHolder,this.contextMenuAction);
		this.popupmenu.swParentObject = this;
	}

	//-- clear down existing items
	this.popupmenu.hide();
	this.popupmenu.reset();

	//- -show url type context

	if(this.selectedTreeNode.id=="_mr")
	{
		if(this.rowSelected!=null)
		{
			this.popupmenu.addmenuitem("openwww", "Open", "", false);
		
		}
		
		this.popupmenu.addmenuitem("newwww", "Add Web Resource", "", false);

		if(this.rowSelected!=null)
		{
			this.popupmenu.addmenuitem("split", "", "", false);
			this.popupmenu.addmenuitem("deletewww", "Delete", "", false);
		}
	}
	else
	{
		//-- file based item
		var boolVirtualRoot = (this.boolVirtualPath && this.rowSelected==null || (this.selectedTreeNode.id=="0"))
		if(boolVirtualRoot)
		{
			this.hideContextMenu();
			return false;
		}


		//-- if no row selected
		if(this.rowSelected!=null)
		{
			this.popupmenu.addmenuitem("openff", "Open", "", false);
			if(!this.boolVirtualPath)
			{
				this.popupmenu.addmenuitem("split", "", "", false);
				this.popupmenu.addmenuitem("addnewfolder", "New Folder", "", false);
				this.popupmenu.addmenuitem("split", "", "", false);
				this.popupmenu.addmenuitem("addnewfile", "Add...", "", false);
			}
			else
			{
				this.popupmenu.addmenuitem("split", "", "", false);
			}
			this.popupmenu.addmenuitem("deleteff", "Delete", "", false);
			
			if(!this.boolVirtualPath)this.popupmenu.addmenuitem("split", "", "", false);
			if(!this.boolVirtualPath)this.popupmenu.addmenuitem("renameff", "Rename", "", false);
		}
		else
		{
			this.popupmenu.addmenuitem("addnewfolder", "New Folder", "", false);
			this.popupmenu.addmenuitem("addnewfile", "Add...", "", false);
		}
	}

	this.popupmenu.show(undefined,undefined,eV);

	return false;
}


_SwMyLibrary.prototype.hideContextMenu = function (oEv)
{
	if(this.popupmenu!=null)
	{
		this.popupmenu.hide();
	}
}

_SwMyLibrary.prototype.filelistSelected = function (aRow,eV)
{
	this.hideContextMenu();
	app.datatable_hilight(aRow,false);
	this.rowSelected = aRow;
}

_SwMyLibrary.prototype.openResource = function(aRow)
{
	var strName = aRow.getAttribute("filename")
	var strType = aRow.getAttribute("filetype")
	var strPath = aRow.getAttribute("path")
	if(strType!="dir")
	{
		var oF =  app.oControlFrameHolder._getFileForm();
		if(oF!=null)
		{
			//-- set form values
			var outlookDoc = app.oControlFrameHolder._getDoc();
			if(outlookDoc!=null)
			{
				outlookDoc.getElementById("filename").value = strName;
				outlookDoc.getElementById("filepath").value = strPath;
				//-- set url
				var strURL = app._root  + app._workspacecontrolpath + "_views/library/viewfile.php";
				oF.setAttribute("action",strURL);
				//-- submit
				oF.submit();
			}
		}
	}
	else
	{
		//-- select tree node
		var childNode = this.treeControl.getSelectedNodeChildByDisplay(strName);
		if(childNode!=null)	
		{
			//alert(this.selectedTreeNode)
			this.treeControl.OpenNode(this.selectedTreeNode,true,true);
			this.treeControl.s(childNode,true,undefined,false);
		}
	}
};;;;//--
//-- ms office outlook styled navigation bar
var application_navbar = null;

//-- 18.01.2013 - nwj - check view permissions
function has_view_permissions(strPermission)
{

	var arrPermissions = strPermission.replace(" ","").split(",");
	for(var x=0;x<arrPermissions.length;x++)
	{
		var arrP = arrPermissions[x].split(".");
		if(arrP[0]=="app")
		{
			if(!session.HaveAppRight(arrP[1],arrP[2]))return false;
		}
		else if(arrP[0]=="sys")
		{
			if(!session.HaveRight(arrP[1],arrP[2]))return false;
		}
	}
	return true;
}


//--
//-- load application nav bar
function load_application_navbar(tEle)
{
	//-- use global params to get view info

	var strXML = "";
	var strMenuItems = ""

	var altStartView = "";
	var strStartView = dd.GetGlobalParam("views/startupview");

	//-- get outlook bar state cookie
	var expandedItems = _get_webclient_cookie("_wc_outlookbar_items");
	var arrItems = expandedItems.split(",");
	var intExpandItemLength = arrItems.length;
	if(expandedItems=="")intExpandItemLength=0;
	
	//-- store by name
	var arrExpandedItems = new Array();
	for(var x=0;x<arrItems.length;x++)
	{
		if(arrItems[x]=="")continue;
		arrExpandedItems[arrItems[x]] = true;
	}


	var iMin=0;
	var iCounter=0;
	var arrViews = dd.GetGlobalParam("views");
	for(strViewName in arrViews)
	{
		if(arrViews[strViewName].type!=undefined)
		{
			//-- 18.01.2013 - nwj - check view permissions
			var vr = arrViews[strViewName].visibilityrights;
			if(vr!=undefined && vr!="")
			{
				//-- check if user has right to view
				if (!has_view_permissions(vr.toLowerCase()))continue;
			}


			//-- we do not support lib, dbsearch or reports
			switch(arrViews[strViewName].type)
			{
				case "calendar": //-- check if has any calendars
					if(_arr_xml_calendar_list.length<1)continue;
					break;

				case "mail": //-- check service
					if(!global.IsConnectedToMailServer())continue;
					break;
				//case "library":
				case "dbsearch":
					continue;
					break;
				case "reports":
					if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANVIEWREPORTS))continue;
					break;
				case "knowledgebase":
					if(!session.HaveRight(ANALYST_RIGHT_D_GROUP,ANALYST_RIGHT_D_CANSEARCHKBDOCUMENTS))continue;
					break;
			}

			//-- goto next if not visible
			if(arrViews[strViewName].visible.toLowerCase()!="yes") continue;

			if(arrViews[strViewName].type=="autodbev")
			{
				//-- create searches of mes - which arent stored - so get them from config
				if(app._xmlManagedEntitySearches==null)
				{
					alert("Managed entity search functionality is switched on, however there are no definitions setup. Please contact your Administrator.");
				}
				else
				{
					//-- get outlook xml as string
					var xmlOutlook = app._xmlManagedEntitySearches.getElementsByTagName("dbev");// childNodes[0].childNodes; //;getElementsByTagName("outlook")[0];
					
					for(var x=0;x< xmlOutlook.length;x++)
					{
						var xmlMES = xmlOutlook[x];
						var strName = app.xmlNodeTextByTag(xmlMES,"name");
						if(strName!="")
						{
							if(iCounter==0)altStartView = strViewName;
							if(iCounter==4)iMin=1;
							iCounter++;

							//-- outlook top left title
							var strLeftTitle= app.xmlNodeTextByTag(xmlMES,"searchTitle");
							if(strLeftTitle=="")strLeftTitle = strName;
							var strIcon = app.xmlNodeTextByTag(xmlMES,"icon");
							if(strIcon=="")strIcon=0;
							
							//-- is this an expanded item
							if(arrExpandedItems[strName])
							{
								iMin = 0;
							}
							else if(intExpandItemLength>0)
							{
								iMin = 1;
							}

							var cImage = app.xmlNodeTextByTag(xmlMES,"customicon");
							if(cImage!="")cImage=_swc_parse_variablestring(cImage);


							strMenuItems+='<link type="mes"	min="'+ iMin +'" lefttitle="' + strLeftTitle + '" oid="'+strName+'" customimg="'+cImage+'" imgid="'+strIcon+'">'+ strName +'</link>';
						}
					}
				}
			}
			else
			{
				
				if(iCounter==0)altStartView = strViewName;
				if(iCounter==4)iMin=1;
				iCounter++;

				//-- is this an expanded item
				if(arrExpandedItems[strViewName])
				{
					iMin = 0;
				}
				else if(intExpandItemLength>0)
				{
					iMin = 1;
				}
				
				//-- nwj - 14.01.2013 - add support for a customimage
				var cImage = "";
				if(arrViews[strViewName].customicon && arrViews[strViewName].customicon!="")cImage=_swc_parse_variablestring(arrViews[strViewName].customicon);

				//-- outlook top left title
				var strLeftTitle=(arrViews[strViewName].viewtitle==undefined)?arrViews[strViewName].icontitle:arrViews[strViewName].viewtitle;
				strMenuItems+='<link type="'+arrViews[strViewName].type+'"	lefttitle="' + strLeftTitle + '" min="'+ iMin +'" oid="'+strViewName+'" customimg="'+cImage+'" imgid="'+arrViews[strViewName].icon+'">'+arrViews[strViewName].icontitle+'</link>';
			}
		}
	}

	//-- xml for navbar
	strXML = "<navbar>";
	strXML += strMenuItems;
	strXML += "</navbar>";
	

	var oXML = create_xml_dom(strXML);
	if(!oXML)
	{
		alert("outlooks.js : load_application_navbar\n\nCould not load outlook xml string. Please contact your Administrator");
		return false;
	}

	//-- add event to show / hide navbar
	app.addEvent(document.getElementById("nav-inout"),"click",showhide_navbar);			

	application_navbar = new_navbar(oXML);
	application_navbar.draw(tEle);

	//-- init bar
	var strStartBar = (strStartView=="")?altStartView:strStartView;
	strStartBar = top.string_replace(strStartBar," ","_");
	if(strStartBar!="")application_navbar.activatebar(strStartBar.toLowerCase());

	//-- check if scrolling is needed
	setTimeout("check_navbar_scrolling()",100);
}


function forcehide_navbar()
{
	app.eAppOutlook.style.display = "none";
	var ele = document.getElementById("nav-inout");
	setElementText(document.getElementById("nav-inout")," ");

	_current_bar_item.setAttribute("leftpanesetting","hide");
	app._resize_browser_layout();  
}

//-- show or hide the nav bar - when hidden nav bar will 
function showhide_navbar(e,bByCode)
{
	var ele = document.getElementById("nav-inout");

	//-- if user had clicked to open view and that left pane is set to hide then exit
	if(bByCode==undefined && _current_bar_item.getAttribute("leftpanesetting") == "hide") return false;

	var exp = ele.getAttribute("expanded");
	var strDisplay = "none";
	var strText = ">>";
	if(exp=="1")
	{
		//-- collapse
		exp="0";
	}
	else
	{
		//-- expand
		exp="1";
		strDisplay = "block";
		strText = "<<";
	}

	//-- resize window table dimensions
	app.eAppOutlook.style.display = strDisplay;
	setElementText(ele,strText);

	ele.setAttribute("expanded",exp);
	_current_bar_item.setAttribute("leftpanesetting",exp);

	app._resize_browser_layout();
}

function get_navbar_xml()
{
	//-- get navbar xml - check for custom
	var strURL = app._customapplicationpath + app._navbarxmlname;
	var oXML = app.get_http(strURL, "", true,true,null);				
	if(oXML) return oXML;

	//-- load default applciation outllook
	var strURL = app._applicationpath + app._navbarxmlname;
	var oXML = app.get_http(strURL, "", true, true, null);				
	if(oXML) return oXML;

	return false;
}

//--
//-- given xml object defining a navbar - create it in the given workspace object (a div)
function new_navbar(oXml)
{
	var aLink;
	var tmpBar = new oNavbar();

	var arrLinks = oXml.getElementsByTagName("link");
	for(var x=0;x < arrLinks.length;x++)
	{
		aLink = arrLinks[x];
		tmpBar.add_bar(aLink.getAttribute("oid"), aLink.getAttribute("type"),aLink.getAttribute("min") ,app.xmlText(aLink),aLink.getAttribute("imgid"),aLink.getAttribute("lefttitle"),aLink.getAttribute("customimg"))
	}
	
	return tmpBar;
}

function oNavbar()
{
	this.holder = null;
	this.array_bars = new Array();
	this.navitemshtml = new Array();
	this.activewidget = null;
}

//--
//-- add a bar to the nav bar
oNavbar.prototype.add_bar = function (strID, strType ,intMin, strText,intIcon,strLeftTitle,strCustomImage)
{
	if(intMin==null || intMin=="")intMin=1;
	if(strCustomImage==null || strCustomImage==undefined)strCustomImage="";
	this.array_bars[strID] = new Object();
	this.array_bars[strID].id = strID;
	this.array_bars[strID].type = strType;
	this.array_bars[strID].min = intMin;
	this.array_bars[strID].text = strText;
	this.array_bars[strID].imgid = intIcon;
	this.array_bars[strID].lefttitle = strLeftTitle;
	this.array_bars[strID].customimg = strCustomImage;
}

//-- activate a navbar item by id
oNavbar.prototype.activatebar = function (strID)
{
	var eBar = app.get_parent_child_by_id(this.baritemholder,strID);
	if(eBar==null) return;
	if(eBar.style.display=="none")
	{
		//-- is hidden so use min bar
		var eBar = app.get_parent_child_by_id(this.shortcutholder,strID);
		if(eBar==null) return;
	}

	var eleSrc= app.get_parent_child_by_tag(eBar,"TR");
	activate_navbar(this.baritemholder,eleSrc)
	
}

//-- draw navigation bar
oNavbar.prototype.draw = function (eleTarget)
{
	if(eleTarget)
	{
		//-- assign pointer and clear html
		this.holder = eleTarget;

		this.widgetholder = app.get_parent_child_by_id(this.holder, "widget-holder");
		this.baritemholder = document.getElementById("nav-items"); //app.get_parent_child_by_id(this.holder, "baritems-holder");

		//--loop through bars and draw
		var oBar;
		for(strID in this.array_bars)
		{
			this.draw_bar(strID)
		}

		this.baritemholder.innerHTML = this.navitemshtml.join("");
		this.holder.navbar = this;
		this.widgetholder.navbar = this;
		this.baritemholder.navbar = this;
	}
}

//-- draw a bar item
oNavbar.prototype.draw_bar = function (strID)
{
	var oBar = this.array_bars[strID];
	var strMainDisplay = "bar-item";
	var strMinDisplay = "sbar-item-hide";
	if(oBar.min==1)
	{
		strMinDisplay="sbar-item";
		strMainDisplay = "bar-item-hide";
	}

	var stdImage = "client/outlook/images/bar/"+ oBar.imgid+".png";
	var useImage = (oBar.customimg!="")?oBar.customimg:stdImage;
	this.navitemshtml.push("<div id='" + oBar.id + "' btype='" + oBar.type + "' class='sbar-item' leftitle='"+oBar.lefttitle+"' title='"+oBar.text+"'><table cellspacing='0' cellpadding='0' border='0' width='100%' height='100%'><tr><td valign='middle' align='middle'><img src='"+useImage+"'></img></td></tr></table></div>");
}


//-- show bar item
oNavbar.prototype.show_bar = function (strID)
{
}

//-- hide bar item - like email if email service goes down
oNavbar.prototype.hide_bar = function (strID)
{

}



//--
//-- nav bar event helpers


//-- hi-lo lite bar items
function hilite_navbar(oItemHolder, oE)
{
	//-- get srcElement for the event
	var eleSrc = app.getEventSourceElement(oE);
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
	
	//alert(eleSrc.id)
	var strUseClass = (oItemHolder.currentbaritem == eleSrc)? "bar-item-selected-hilite":"bar-item-hilite";
	eleSrc.className = strUseClass;
}

function lolite_navbar(oItemHolder,oE)
{
	var eleSrc = app.getEventSourceElement(oE);
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
	var strUseClass = (oItemHolder.currentbaritem == eleSrc)? "bar-item-selected":"bar-item";
	eleSrc.className = strUseClass;
}


function minimise_bar_item(oDiv,oE)
{

	app.hide_application_menu_divs();

	var rightclick = false;
	if (oE.which) rightclick = (oE.which == 3);
	else if (oE.button) rightclick = (oE.button == 2);

	if(rightclick)
	{
		app.stopEvent(oE);

		var eleSrc = app.getEventSourceElement(oE);
		eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
		var pDiv = app.get_parent_owner_by_tag(eleSrc, "DIV");

		//-- get minbar icon
		var minBarItem = app.get_parent_child_by_id(application_navbar.shortcutholder,pDiv.id);
		if(minBarItem!=null)
		{
			//-- minimise selected bar
			if(eleSrc.className=='bar-item-selected')
			{
				minBarItem.className='sbar-item-selected';
				application_navbar.shortcutholder.currentbaritem = minBarItem;
				_current_minbar_item = minBarItem;
			}
			else
			{
				minBarItem.className='sbar-item';
			}
			

			application_navbar.array_bars[minBarItem.id].min = 1;
		}

		pDiv.style.display="none";

		//-- save state of outllokbar to cookie
		outlookbar_save_state();

		return false;
	}
}

function outlookbar_save_state()
{
	var strExpandedItems = "";
	for(strID in application_navbar.array_bars)
	{
		if(application_navbar.array_bars[strID].min==0)
		{
			if(strExpandedItems!="")strExpandedItems+=",";
			strExpandedItems += strID;
		}
	}
	_set_webclient_cookie("_wc_outlookbar_items",strExpandedItems);
}

function maximise_bar_item(oDiv,oE)
{
	app.hide_application_menu_divs();

	var rightclick = false;
	if (oE.which) rightclick = (oE.which == 3);
	else if (oE.button) rightclick = (oE.button == 2);

	if(rightclick)
	{
		app.stopEvent(oE);

		var eleSrc = app.getEventSourceElement(oE);
		if(eleSrc.id=="shortcuts-holder")return false;
		eleSrc = app.get_parent_owner_by_tag(eleSrc, "DIV");
		if(eleSrc.id=="shortcuts-holder")return false;

		//-- get fullbar and show
		var mainBarItem = app.get_parent_child_by_id(application_navbar.baritemholder,eleSrc.id);
		if(mainBarItem!=null)
		{
			var mRow = app.get_parent_child_by_tag(mainBarItem, "TR");

			//-- maximise the current selected item
			if(eleSrc.className=='sbar-item-selected')
			{
				mRow.className='bar-item-selected';
				application_navbar.baritemholder.currentbaritem = mRow;
				_current_bar_item = mRow;
				mainBarItem.style.display="block";
			}
			else
			{
				mRow.className='bar-item';
				mainBarItem.style.display="block";
			}

			application_navbar.array_bars[mainBarItem.id].min = 0;
		}
		eleSrc.className='sbar-item-hide';

		//-- save state of outlookbar to cookie
		outlookbar_save_state();

		return false;
	}
}

//-- min nav bar item clicked
var _current_minbar_item = null;
var _current_bar_item = null;
function click_minnavbar(oItemHolderTD,oE)
{
	app.hide_application_menu_divs();

	var eleSrc = app.getEventSourceElement(oE);
	if(eleSrc.id=="shortcuts-holder")return false;
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "DIV");
	if(eleSrc.id=="shortcuts-holder")return false;

	//-- set selected style
	if((oItemHolderTD.currentbaritem) && (oItemHolderTD.currentbaritem.className != "sbar-item-hide"))oItemHolderTD.currentbaritem.className = "sbar-item";
	oItemHolderTD.currentbaritem = eleSrc;
	eleSrc.className = "sbar-item-selected";
	_current_minbar_item = eleSrc;

	//-- deselect mainbar
	if((_current_bar_item!=null) && (_current_bar_item.className != "bar-item-hide"))_current_bar_item.className = "bar-item";

	//-- set title
	var strText = eleSrc.getAttribute("title");
	set_outlook_title(strText);
	set_right_title(strText);

	//-- set right right title detault to date
	var strDate = app._formatDate(new Date(),"EE dd, MMM yyyy");
	app.set_right_right_title(strDate);


	//-- get parent div	and load control space
	load_outlook_control(eleSrc.getAttribute('btype'), eleSrc.getAttribute('id'), "");

	//-- initialise anything for the outlookcontrol
	if(oControlFrameHolder.initialise)oControlFrameHolder.initialise();
}



//-- nav bar item clicked
function click_navbar(oItemHolder,oE)
{
	var eleSrc = app.getEventSourceElement(oE);
	eleSrc = app.get_parent_owner_by_tag(eleSrc, "TR");
	activate_navbar(oItemHolder,eleSrc);

}

function canAccessWorkspace()
{
	try{
	return (oWorkspaceFrameHolder!=null && oWorkspaceFrameHolder.getAttribute && oWorkspaceFrameHolder.getAttribute("externalUrl")!=true);
	}catch(e)
	{
		return false;
	}
}

function canAccessoutlookSpace()
{
	try{
	return (oControlFrameHolder!=null && oControlFrameHolder.getAttribute && oControlFrameHolder.getAttribute("externalUrl")!=true);
	}catch(e)
	{
		return false;
	}	
}


function activate_navbar(oItemHolder, eleSrc)
{
	app.hide_application_menu_divs();

	//-- 14.0.9.2010
	//-- check session is still valid - if not then exit
	//var xmlmc = new XmlMethodCall();
	//if(!xmlmc.Invoke("session", "isSessionValid"))
	//{
		//-- in process of logging out
	//	if(app.boolForceLoggingOut)return false;

		//-- log out
	//	app.logout("m3");
	//	return false;
	//}
	

	//-- hide current workspace context menu items
	if(canAccessWorkspace() &&  oWorkspaceFrameHolder.cancel_context_menus)oWorkspaceFrameHolder.cancel_context_menus();

	var eDiv = app.get_parent_owner_by_tag(eleSrc, "DIV");
	if(eDiv==null || eDiv.getAttribute('btype')==null)
	{
		//-- user has clicked on the edge of bar items
		return false;
	}

	//-- set selected style
	if((oItemHolder.currentbaritem) &&(oItemHolder.currentbaritem.className != "bar-item-hide"))oItemHolder.currentbaritem.className = "sbar-item";
	
	eDiv.className = "sbar-item-selected";
	oItemHolder.currentbaritem = eDiv;
	_current_bar_item=eleSrc;

	//-- deselect minbar
	//if((_current_minbar_item!=null) && (_current_minbar_item.className != "sbar-item-hide"))_current_minbar_item.className = "sbar-item";

	//-- set title
	//var oTD = get_parent_child_by_id(eleSrc,"bar-text");
	//var strText = getElementText(oTD);
	strText = eDiv.getAttribute("title");
	set_outlook_title(strText);
	set_right_title(strText);

	//-- set right right title detault to date
	var strDate = app._formatDate(new Date(),"EE dd, MMM yyyy");
	app.set_right_right_title(strDate);

	load_outlook_control(eDiv.getAttribute('btype'), eDiv.getAttribute('id'), "")

	var ele = document.getElementById("nav-inout");
	var lpsetting = _current_bar_item.getAttribute("leftpanesetting");
	if(lpsetting=="1")
	{
		//-- left pane should be expanded
		ele.setAttribute("expanded","0");
		showhide_navbar(null,true);
	}
	else if (lpsetting=="0")
	{
		//-- left pane should be collapsed
		ele.setAttribute("expanded","1");
		showhide_navbar(null,true);
	}
	else if (lpsetting=="hide")
	{
		//-- left pane should be invisible and not accessible
		ele.setAttribute("expanded","2");
		forcehide_navbar();
	}
	else
	{
		//-- loading for first time so always show
		ele.setAttribute("expanded","0");
		showhide_navbar(null,true);
	}


	//-- initialise anything for the outlookcontrol
	if(oControlFrameHolder.initialise)oControlFrameHolder.initialise();

}

//-- set the title of the xp outlook bar
function set_outlook_title(strTitle)
{
	var oTitleDiv = document.getElementById("title-holder");
	app.setElementText(oTitleDiv, strTitle);
}

function get_outlook_left_title()
{
	var oTitleDiv = document.getElementById("title-holder");
	return getElementText(oTitleDiv);
}

//-- set the title of the workspace
function set_right_title(strText)
{
	if(eAppTitleRight!=null)
	{
		app.setElementText(eAppTitleRight, strText);	
	}
}
//- -set the right title of workspace
function set_right_right_title(strText)
{
	if(eAppTitleRightRight!=null)
	{
		app.setElementText(eAppTitleRightRight, strText + "   ");	
	}
}

//-- hold current active outlook control
var oCurrentOutlookControl = null;
var oCurrentOutlookWorkSpace = null;
var oWorkspaceFrameHolder = null;
var oControlFrameHolder = null;
var _CurrentOutlookID = "";
var _CurrentOutlookType = "";
//-- load into the outlook navigation bar a control such as worklist, dbsearch, email, calendar
function load_outlook_control(strControlType, strControlID, strControlParams)
{
	//-- parse any js vars
	strControlType = app.parsejsstr(strControlType);
	strControlID = app.parsejsstr(strControlID);
	strControlParams = app.parsejsstr(strControlParams);

	_CurrentOutlookID = strControlID;
	_CurrentOutlookType = strControlType;

	//--
	//-- check if already created iframe to store control interface
	//-- get frame and space area
	var oControlArea = document.getElementById("widget-holder");
	var oWorkspaceArea = app.eAppWorkspace;

	var strControlFrameID = "ol_" + strControlType + "_" + strControlID;
	var strWorkSpaceFrameID = "ws_" + strControlType + "_" + strControlID;
	//-- get element to work with
	var oControlFrame = document.getElementById(strControlFrameID);
	var oWorkspaceFrame = document.getElementById(strWorkSpaceFrameID);

	if(strControlType.toLowerCase()=="system")
	{
		//-- a system view like email, calender, kbase
		var strControlDefinitionPath = _systempath + strControlType + "/" + strControlID + ".xml";
		var strOutlookProcessingPath = _outlookcontrolpath + strControlType + "/" + strControlID + "/";
		var strWorkspaceProcessingPath = _workspacecontrolpath;

	}
	else
	{
		//-- an application view
		var strControlDefinitionPath = _applicationpath + "outlook/" + strControlType + "/" + strControlID + ".xml";
		var strOutlookProcessingPath = _outlookcontrolpath + strControlType + "/";
		var strWorkspaceProcessingPath = _workspacecontrolpath;
	}


	//-- see if div exists - if show just show it and re-init the control in it
	if(oControlFrame!=null)
	{
		//-- if not current frame hide and show
		if(oControlFrame!=oCurrentOutlookControl)
		{
			//-- do we need to reload helpdesk view (i.e. someone called the global.RefreshHelpdeskAnalystsTree() method
			if(strControlType=="helpdesk" && app._helpdesk_view_tree_reload)
			{
				oControlFrame.contentWindow._reload_helpdesk_tree();
			}

			//-- hide current div areas
			oCurrentOutlookControl.style.display = "none";
			oCurrentOutlookWorkSpace.style.display = "none";	
		
			//-- show new ones
			oControlFrame.style.display = "";
			oWorkspaceFrame.style.display = "";


			var tmpWorkspaceFrameHolder = app.getFrame(strWorkSpaceFrameID,document);
			var tmpOutlookFrameHolder = app.getFrame(strControlFrameID,document);

			//-- resize - as may have adjusted while hidden
			if(canAccessWorkspace() && tmpWorkspaceFrameHolder.sizeup_workspace_areas)tmpWorkspaceFrameHolder.sizeup_workspace_areas();
			if(canAccessoutlookSpace() && tmpOutlookFrameHolder.sizeup_outlook_area)tmpOutlookFrameHolder.sizeup_outlook_area();

			//-- call onshowevent for frames if they exists
			if(canAccessWorkspace() && tmpWorkspaceFrameHolder._onshow)tmpWorkspaceFrameHolder._onshow();
			if(canAccessoutlookSpace() && tmpOutlookFrameHolder._onshow)tmpOutlookFrameHolder._onshow();
		}
	}
	else
	{
		//-- create new one
		//-- hide current top frame
		if(oCurrentOutlookControl!=null)
		{
			oCurrentOutlookControl.style.display="none";
			oCurrentOutlookWorkSpace.style.display="none";
		}
	
		//-- create divs for outlook area and workspace area
		var strFrameHTML = '<iframe id="' + strControlFrameID + '" onload="try{top._swc_check_document_hrefs(this);}catch(e){}" onreadstatechange="try{top._swc_check_document_hrefs(this);}catch(e){}" name="'+ strControlFrameID +'"  style="height:100%;width:100%;" frameborder="0"></iframe>';
		var strWorkSpaceHTML = '<iframe id="' + strWorkSpaceFrameID + '" name="'+ strWorkSpaceFrameID +'" onload="try{top._swc_check_document_hrefs(this);}catch(e){}" onreadstatechange="try{top._swc_check_document_hrefs(this);}catch(e){}" style="height:100%;width:100%;" frameborder="0"></iframe>';

		//-- append html
		app.insertBeforeEnd(oControlArea,strFrameHTML)
		app.insertBeforeEnd(oWorkspaceArea,strWorkSpaceHTML)

		//-- get new elements
		oControlFrame = document.getElementById(strControlFrameID);
		oWorkspaceFrame = document.getElementById(strWorkSpaceFrameID);


		oControlFrame.setAttribute("swcontroltype",strControlType);
		oWorkspaceFrame.setAttribute("swcontroltype",strControlType);

		//-- a webpage so jsut load url and pass in sessid
		if(strControlType=="webpage")
		{
			//oControlFrame.style.border = "1px solid #000000";
			oWorkspaceFrame.style.border = "1px solid #D5D4DF";
			oWorkspaceFrame.style.borderTop = "0px solid #D5D4DF";
		

			var strWebpageUrl = _swc_parse_variablestring(app.dd.GetGlobalParam("views/" + strControlID + "/url"));
			var strWebpageLeftUrl = _swc_parse_variablestring(app.dd.GetGlobalParam("views/" + strControlID + "/lefturl"));

			//--
			//-- load frame documents using post - so hidden from history
			var frm  = document.getElementById("form_iframeloader");
			frm.setAttribute("target",strControlFrameID);
			frm.setAttribute("action",strWebpageLeftUrl);

			document.getElementById("frm_swsessionid").value =_swsessionid;
			document.getElementById("frm_swsessid").value =_swsessionid;
			document.getElementById("frm_analystid").value = top.session.analystid.toUpperCase();
			document.getElementById("frm_webclient").value ="1";
			document.getElementById("frm_appid").value ="";
			document.getElementById("frm_controlid").value = "";
			document.getElementById("frm_xmlfile").value = "";
			document.getElementById("frm_viewid").value = "";
			document.getElementById("frm_controltype").value = "";
			if(strWebpageLeftUrl!="")
			{
				try{
				frm.submit();
				}catch(e)
				{
					alert("Failed to open Active Page. Please check your browser for any https warnings. The active page url may be running as http when the webclient is running as https.");
				}
			}
			else
			{
				//-- hide the pane
				forcehide_navbar();
			}
			
			//-- load worspace frame - using js
			frm.setAttribute("target",strWorkSpaceFrameID);
			frm.setAttribute("action",strWebpageUrl);
			document.getElementById("frm_swsessionid").value =_swsessionid;
			document.getElementById("frm_swsessid").value =_swsessionid;
			document.getElementById("frm_webclient").value ="1";
			document.getElementById("frm_appid").value ="";
			document.getElementById("frm_controlid").value = "";
			document.getElementById("frm_xmlfile").value = "";
			document.getElementById("frm_viewid").value = "";
			document.getElementById("frm_controltype").value = "";
			if(strWebpageUrl!="")
			{
				try{
				frm.submit();
				}catch(e)
				{
					alert("Failed to open Active Page. Please check your browser for any https warnings. The active page url may be running as http when the webclient is running as https.");
				}
			}
		}
		else
		{
			//--
			//-- load frame documents using post - so hidden from history
			var frm  = document.getElementById("form_iframeloader");
			frm.setAttribute("target",strControlFrameID);
			frm.setAttribute("action",strOutlookProcessingPath + 'outlook.php');

			document.getElementById("frm_swsessionid").value =_swsessionid;
			document.getElementById("frm_webclient").value ="1";
			document.getElementById("frm_appid").value =_application;
			document.getElementById("frm_controlid").value = strControlID;
			document.getElementById("frm_xmlfile").value = strControlDefinitionPath;
			document.getElementById("frm_viewid").value = strControlID;
			document.getElementById("frm_controltype").value = strControlType;
			frm.submit();
			
			//-- load worspace frame - using js
			frm.setAttribute("target",strWorkSpaceFrameID);
			frm.setAttribute("action",strWorkspaceProcessingPath + 'workspace.php');
			frm.submit();
		}
	}

	//-- store current displayed outlook and workspace areas
	oCurrentOutlookControl = oControlFrame;
	oCurrentOutlookWorkSpace = oWorkspaceFrame;

	oControlFrameHolder = app.getFrame(strControlFrameID,document);
	oWorkspaceFrameHolder = app.getFrame(strWorkSpaceFrameID,document);

}


//-- checks loaded documents for a hrefs and specifically for link to hsl:
//-- if has hsl: added onmousedown event to trap, handle and cancel bubble
function _swc_check_document_hrefs(aFrame,bIsDoc)
{
	if(bIsDoc==undefined)bIsDoc=false;
	if(!bIsDoc)
	{
		if(aFrame!=undefined)
		{
			try
			{
				var aDoc = aFrame.contentWindow.document;
			}
			catch (e)
			{
				return;
			}
		}
	}
	else
	{
		var aDoc = aFrame; //-- developer passed in document element
	}

	if(aDoc.readyState=="complete")
	{
		//-- set var app = this; in frame document (fixes issue with wssm tab controls / tables used in active pages i.e. ITSM 3)
		//-- only apply to fullclient webpages
		if(!bIsDoc)
		{
			if(aFrame.getAttribute("swcontroltype")=="webpage" || aFrame.contentWindow.document.location.href.indexOf("php_reports")>0)
			{
				eval("aFrame.contentWindow.app = aFrame.contentWindow;");


				//-- add event to iframe document that if mousedown then hide any toplevel divs
				try
				{
					aDoc.body.onmousedown = function(){}; //-- create any mouse down events that active page may have - should not have any
					app.addEvent(aDoc,"mousedown",app.hide_application_menu_divs);			
				}
				catch (e)
				{

				}
			}
			else
			{
				//-- do not allow default context menu of wc system pages
				app.addEvent(aDoc,"contextmenu",app.stopEvent);			
			}
		}

		_scan_hsl_anchors(aDoc,aFrame.contentWindow);
	}
}

function _scan_hsl_anchors(aDoc, contentWindow)
{
	var array_hrefs = aDoc.getElementsByTagName("A");
	for(var x=0;x<array_hrefs.length;x++)
	{
		_prepare_hsl_anchor(array_hrefs[x],contentWindow)
	}
}

function _prepare_hsl_anchor(anAnchor,contentWindow)
{
	var strHREF = anAnchor.href;
	if(strHREF==null || strHREF==undefined) return;
	if(strHREF.indexOf("hsl:")==0)	
	{
		if(contentWindow!=undefined)anAnchor.frameholder = contentWindow;

		anAnchor.setAttribute("hslaction",strHREF);
		anAnchor.href = "#";
		app.removeEvent(anAnchor,"click",_trap_hsl_href);
		app.addEvent(anAnchor,"click",_trap_hsl_href);
	}
}



function _trap_hsl_href(e,b,c)
{
	var hrefAction = this.getAttribute("href");
	if(hrefAction.indexOf("hsl:")==0)
	{
		var arrInfo = hrefAction.split("hsl:");
		var arrInfo = arrInfo[1].split("?");

		//-- convert to hsl link
		_prepare_hsl_anchor(this)

	}
	else
	{
		var hslAction = this.getAttribute("hslaction");
		var arrInfo = hslAction.split("hsl:");
		var arrInfo = arrInfo[1].split("?");
	}

	var strAction = arrInfo[0];
	var strParams = arrInfo[1];
	_hslaction(strAction,strParams,this)

	return false;
}


function navbar_scrollup(e)
{
	stopEvent(e);
	eNavBar.scrollTop = eNavBar.scrollTop-5;
	eNavBar.setAttribute("scroll","1");
	navbar_scroll(false);
}

function navbar_scrolldown(e)
{
	stopEvent(e);
	eNavBar.setAttribute("scroll","2");
	navbar_scroll(true);
}

function navbar_scroll()
{
	if(eNavBar.getAttribute("scroll")=="0") return;

	var dir = eNavBar.getAttribute("scroll");

	if(dir=="2")
	{
		eNavBar.scrollTop = eNavBar.scrollTop+1;
	}
	else if(eNavBar.scrollTop>0)
	{
		eNavBar.scrollTop = eNavBar.scrollTop-1;
	}

	setTimeout("navbar_scroll()",2);

}

function stopscrolling(e)
{
	eNavBar.setAttribute("scroll","0");
};;;;var _LISTBOX = "select";
var _DATERANGE = "daterange";
var _DATE = "date";
var _PROFILECODE = "profilecode";
var _TEXTBOX = "input";
var _RADIO = "radio";
var _CHECK = "check";


function create_new_mes(oXML, strID, strMesType,oDoc)
{

	return new oSearch(oXML, strID,strMesType, oDoc);
}

//--
//-- javascript search object
function oSearch(oXML, strID, strMesType, oDoc)
{
	if( (strMesType==undefined) || (strMesType=="")) strMesType="mes";

	this.id = strID;
	this.mestype = strMesType;
	this.xmldom = oXML;
	this.doc = oDoc;
	this.rowcount=-1;

	var nodeTable= this.xmldom.getElementsByTagName("table")[0];
	var strTable = app.xmlText(nodeTable);
	this.table = strTable;

	if(this.table=="")
	{
			alert("Managed entity search : Database table not defined.\n\nPlease contact your Administrator.");
	}
	else
	{

		this.keycolumn = app.dd.tables[this.table].PrimaryKey;
		this.addNewForm = app.dd.tables[this.table].NewRecordForm;
		if(this.addNewForm=="")
		{
			//-- use form defined against mes
			var nodeForm= this.xmldom.getElementsByTagName("formName")[0];
			var strForm = app.xmlText(nodeForm);
			this.addNewForm = strForm;
		}
	}
}

//-- process add new
oSearch.prototype.addNew = function ()
{
	//-- get add new form for this table
	if(this.addNewForm!="")
	{

		app.OpenFormForAdd(this.addNewForm,"","",false);
	}
}

//--
//-- process search
oSearch.prototype.search = function ()
{
	//-- run 
	top.debugstart("Run Data Search For " + this.table,"SEARCH");
	var strArgs = "mesid=" + this.id + "&mestype=" + this.mestype +"&_keycolumn=" + this.keycolumn;
	var addCriteria = this.get_search_criteria();
	if(addCriteria==false)return;

	strArgs += addCriteria;

	var strURL = get_service_url("managedentitysearch","");
	var strData = app.get_http(strURL,strArgs, true, false);

	//-- LOAD RESULTS
	var start = new Date();
	this.load_result_datatable(strData);
	top.debugend("Run Data Search For " + this.table,"SEARCH");
}	

//-- get search criteria parameters to pass in
oSearch.prototype.get_search_criteria = function ()
{
	var intCallrefOnly = -1;
	var strParams = "";
	var oFieldHolder = this.doc.getElementById("search-fields");
	if(oFieldHolder!=null)
	{
		var arrEle = app.get_children_by_att(oFieldHolder, "target");
		for(var x=0;x< arrEle.length;x++)
		{
			strOp = arrEle[x].getAttribute("op");
			strTarget = arrEle[x].getAttribute("target");
			strValue = app.getEleValue(arrEle[x]);
	
			if(strValue!="")
			{
				//-- a number
				if(strOp=="in")
				{
					var strValue = string_replace(strValue, " ","",true);
					strValue = strValue.replace(/[^0-9 ,]+/g,''); //-- remove all chars except ,
					var testVal = string_replace(strValue, ",","",true);

					//-- check input
					if(isNaN(testVal) || testVal=="")
					{
						var strLabel = app.get_label_from_binding(strTarget);
						alert("The [" + strLabel + "] field requires numeric input.\n\nPlease validate your criteria and try again.");
						return false;
					}
				}

				if(strTarget=="opencall.callref")
				{
					intCallrefOnly = 1;
				}
				else
				{
					intCallrefOnly = -1;
				}
				strParams += "&"+ pfu(strTarget) + "=" + pfu(strValue);
				strParams += "&_op_"+ pfu(strTarget) + "=" + pfu(strOp);

			}
		}
	}


	//-- pass in sql operator and limit
	var iRowLimit = this.doc.getElementById('search_limit').value;
	if(isNaN(iRowLimit) || iRowLimit<0)
	{
		iRowLimit=100;
		this.doc.getElementById('search_limit').value = 100;
	}


	strParams += "&_callrefonly="+intCallrefOnly+"&sqloperator=" + this.doc.getElementById('search_operator').value;
	strParams += "&sqlrowlimit=" + pfu(iRowLimit);

	//-- order by info
	var oDivHolder = app.oWorkspaceFrameHolder.getElement(this.id);
	if(oDivHolder!=null)
	{
		strParams += "&orderby=" + oDivHolder.getAttribute("orderby");
		strParams += "&orderdir=" + oDivHolder.getAttribute("orderdir");
	}

	if(this.mestype=="sfc") strParams += this.get_sfc_search_criteria();
	return strParams;
}

//-- get search criteria parameters to pass in for additional search for call options
oSearch.prototype.get_sfc_search_criteria = function ()
{
	var strParams = "";
	var oFieldHolder = this.doc.getElementById("search-calloptions");
	if(oFieldHolder!=null)
	{
		var arrEle = app.get_children_by_att(oFieldHolder, "target");
		for(var x=0;x< arrEle.length;x++)
		{
			strOp = arrEle[x].getAttribute("op");
			strTarget = arrEle[x].getAttribute("target");
			strValue = app.getEleValue(arrEle[x],false);

			if(strValue!="")
			{
				//-- a number
				if(strOp=="in")
				{
					var strValue = string_replace(strValue, " ","",true);
					var testVal = string_replace(strValue, ",","",true);
					//-- check input
					if(isNaN(testVal))
					{
						var strLabel = app.get_label_from_binding(strTarget);
						alert("The [" + strLabel + "] field requires numeric input.\n\nPlease validate your criteria and try again.");
						return false;
					}
				}
				strParams += "&"+ pfu(strTarget) + "=" + pfu(strValue);
				strParams += "&_op_"+ pfu(strTarget) + "=" + pfu(strOp);
			}
		}
	}
	return strParams;
}


//-- out put data to data table
oSearch.prototype.load_result_datatable= function (strData)
{
	var oDivHolder = app.oWorkspaceFrameHolder.getElement(this.id);
	if(oDivHolder==null)
	{
		alert("Managed entity search : The search results data table could not be found.\n\nPlease contact your Administrator");
		return;
	}

	var intRowCount = app.datatable_draw_data(oDivHolder, strData);
	this.rowcount = intRowCount;
	this.set_right_title_count();
	mes_select_firstrow(oDivHolder);
	strData = null;
}

oSearch.prototype.set_right_title_count= function ()
{
	var strLeftTitle = app.get_outlook_left_title();
	var strMatch = (this.rowcount != 1)?"Matches":"Match";
	app.set_right_title(strLeftTitle + " (" + this.rowcount + " " + strMatch + ")");
}


//--
//-- clear form
oSearch.prototype.reset= function ()
{
	var oFieldHolder = this.doc.getElementById("search-fields");
	if(oFieldHolder!=null)
	{
		this.write_html_fields(oFieldHolder);
	}
	var oFieldHolder = this.doc.getElementById("search-calloptions");
	if(oFieldHolder!=null)this.write_sfc_html_fields(oFieldHolder);
	this.setup_search_options();

}

oSearch.prototype.reset_sfc_options=function()
{

}

oSearch.prototype.setup_search_options=function()
{
	//-- pass in sql operator and limit
	var eRowLimit = this.doc.getElementById('search_limit');
	var iRowLimit= app.xmlNodeTextByTag(this.xmldom,"maxSearchResults");
	if(isNaN(iRowLimit))iRowLimit=100;
	eRowLimit.value = iRowLimit;

	//-- search type
	var eSearchType = this.doc.getElementById('search_operator');
	var iSearchOption= app.xmlNodeTextByTag(this.xmldom,"searchOptions");
	if(isNaN(iSearchOption))
	{
		iSearchOption = (iSearchOption=="Any search fields match")?0:1;
	}
	eSearchType.selectedIndex=iSearchOption;

	//-- fedex 21.02.20013 - do we have a new form - if so show add new button
	if(this.addNewForm!="")
	{
		this.doc.getElementById("btn_addnew").style.display="inline";
	}


	this.resize_height();
}

oSearch.prototype.resize_height=function()
{
	var divFields = this.doc.getElementById("search-fields");
	var divOptionsTitle = this.doc.getElementById("search-title-options");
	var divOptions = this.doc.getElementById("search-action");
	var divSearchOptions = this.doc.getElementById("search-calloptions");
	var iSFCH = (divSearchOptions==null)?0:divSearchOptions.offsetHeight;
	var iHeight = this.doc.body.offsetHeight;
	var iAdjust = new Number(divOptionsTitle.offsetHeight) + new Number(divOptions.offsetHeight) + new Number(iSFCH);
	

	var iSearchHeight = iHeight - iAdjust;
	if(iSearchHeight<1)iSearchHeight=1;
	try
	{
		divFields.style.height = iSearchHeight - 5;	
	}
	catch (e)
	{
	}
	
	//alert(iHeight + ":" + iAdjust)
}


oSearch.prototype.write_html_fields = function (oFieldHolder)
{
	top.debugstart("Draw Search Fields For " + this.table,"SEARCH");

	if(this.table=="")
	{
		return "";
	}

	var nodeField= this.xmldom.getElementsByTagName("searchColumns")[0];
	if(nodeField!=undefined)
	{
		var strInsertHTML = "<table border='0' width='100%'>";
		var arrFields = app.xmlText(nodeField).split(",");
		for(var x=0; x < arrFields.length;x++)
		{		
			strInsertHTML += "<tr><td noWrap>";
			
			var strFieldName = app.trim(arrFields[x]);
			var strBinding = this.table + "." + strFieldName;
			if(app.dd.tables[this.table].columns[strFieldName]==undefined) continue;
			var boolNumeric = app.dd.tables[this.table].columns[strFieldName].IsNumeric();

			var oField = this.new_field("","",strBinding,boolNumeric)

			strInsertHTML += create_input_box(oField,this.id);

			strInsertHTML += "</td></tr>";
		}
		strInsertHTML += "</table>";

		if(oFieldHolder!=undefined && oFieldHolder!=null)
		{
			oFieldHolder.innerHTML = strInsertHTML;
		}
		else
		{
			this.doc.write(strInsertHTML);
		}
	}

	top.debugend("Draw Search Fields For " + this.table,"SEARCH");

}

oSearch.prototype.new_field = function (strType,strLabel,strBinding,boolNumeric)
{
	var oField = new Object();
	oField.type = strType;
	oField.targetcol = strBinding;
	oField.operator = (boolNumeric)?"in":"like";
	oField.label = strLabel;
	return oField;
}


//--
//-- draw out the input fields - enhanced for search for calls
oSearch.prototype.write_sfc_html_fields = function (oFieldHolder)
{
	var strInsertHTML = "";
	var arrFields = this.xmlsearchoptions.getElementsByTagName("field");
	if(arrFields)
	{
		var strInsertHTML = "<table border='0' width='100%'>";

		for(var x=0; x < arrFields.length;x++)
		{		
			strInsertHTML += "<tr><td noWrap>";

			var oField = arrFields[x];
			var strType = oField.getAttribute("type");
			switch (strType)
			{
				case _DATERANGE:
					strInsertHTML += create_daterange_box(oField);
					break;

				case _PROFILECODE:
					strInsertHTML += create_profilecode_box(oField);
					break;

				case _LISTBOX:
					strInsertHTML += create_select_box(oField);
					break;
				case _TEXTBOX:
					strInsertHTML += create_input_box(oField);
					break;
				case _RADIO:
					strInsertHTML += create_radio_box(oField);
					break;				
				case _CHECK:
					strInsertHTML += create_check_box(oField);
					break;				
			}		

			strInsertHTML += "</td></tr>";
		}
		strInsertHTML += "</table>";

		if(oFieldHolder!=undefined && oFieldHolder!=null)
		{
			oFieldHolder.innerHTML = strInsertHTML;
		}
		else
		{
			this.doc.write(strInsertHTML);
		}
	}
}


//-- helpers to create fields
//-- select drop down box
function create_select_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}

	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";

	//-- get default value
	var strDefault = "";
	var arrDefaults = oField.getElementsByTagName("default");
	if(arrDefaults)strDefault = app.xmlText(arrDefaults[0]);

	//-- get option items
	var strOptions = "";
	var arrItems = oField.getElementsByTagName("item");
	if(arrItems)
	{
		for(var x=0;x< arrItems.length;x++)
		{
			var strKey = app.xmlText(arrItems[x].childNodes[0]);
			var strText = app.xmlText(arrItems[x].childNodes[1]);
	
			var strSelected = (strDefault==strKey)?" selected ":"";
			strOptions += "<option value='" + strKey + "' " + strSelected + ">" + strText + "</option>";
		}
	}


	var strHTML = strLabel + "<select style='width:100%;' target='" + eleName + "'  op='" + strOp + "' ><option value=''></option>" + strOptions + "</select>";
	return strHTML;
}

//-- input textbox
function create_input_box(oField, strControlID)
{
	var eleName = oField.targetcol;
	var strOp = oField.operator;
	if(strOp==null)strOp="like";

	//alert(eleName + ":" + strOp);
	//-- set the input label
	var strLabel = oField.label;

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";
	
	var strHTML = strLabel + "<input onkeyup='app._check_search_keypress(this,event,\""+strControlID+"\");' type='text' style='width:100%;' op='" + strOp + "' target='" + eleName + "'>";
	return strHTML;
}

function _check_search_keypress(oEle,oEv,strControlID)
{
	if(oEv==undefined)oEv = this;
	var intKC = app.getKeyCode(oEv);
	if(intKC==13)
	{
		//-- search
		app._mes[strControlID].search();
	}

}


//-- check box
function create_check_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}

	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel = "<label for='cb_" + eleName + "'>" + strLabel + "</label>";

	//-- get default value
	var strChecked = "";
	var arrDefaults = oField.getElementsByTagName("default");
	if(arrDefaults)strChecked = (app.xmlText(arrDefaults[0])=="1")?"checked":"";


	//-- check checkbox on and off value
	var strOnValue = "";
	var arrOV = oField.getElementsByTagName("on");
	if(arrOV)strOnValue =  app.xmlText(arrOV[0]);

	var strOffValue = "";
	var arrOV = oField.getElementsByTagName("off");
	if(arrOV)strOffValue =  app.xmlText(arrOV[0]);


	var strHTML = "<input id='cb_" + eleName + "'  op='" + strOp + "' type='checkbox' value='" + strOnValue + "' offvalue='" + strOffValue + "' " + strChecked + " target='" + eleName + "' style='width:25px;'>" + strLabel;
	return strHTML;
}

//-- radio box
function create_radio_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}

	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";




	//-- get default value
	var strDefault = "";
	var arrDefaults = oField.getElementsByTagName("default");
	if(arrDefaults)strDefault = app.xmlText(arrDefaults[0]);

	//-- get radion items
	var strItems = "";
	var arrItems = oField.getElementsByTagName("item");
	if(arrItems)
	{
		for(var x=0;x< arrItems.length;x++)
		{
			var strKey = app.xmlText(arrItems[x].childNodes[0]);
			var strText = app.xmlText(arrItems[x].childNodes[1]);
	
			var strChecked = (strDefault==strKey)?" checked ":"";
			var rdoID = "rdo_" + eleName + "_" + x;
			strText = "<label for='" + rdoID + "'>" + strText + "</label><br/>";

			strItems += "<input op='" + strOp + "' style='width:25px;' id='" + rdoID + "' name='rdo_" + eleName +"' " + strChecked + " type='radio' target='" + eleName + "' value='" + strKey + "'>" + strText;
		}
	}
	var strHTML = strLabel + strItems;
	return strHTML;
}


function create_daterange_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}
	
	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";
	
	var strHTML = strLabel + "<input class='datebox' formattype='date' settime='1' onchange='app.ondatechange_element(this,1);' onclick='return app.trigger_datebox_dropdown(this,event);' type='text' style='width:48%;' op='" + strOp + "' target='" + eleName + "___1'>&nbsp;&nbsp;<input  class='datebox' onchange='app.ondatechange_element(this,2);' onclick='app.trigger_datebox_dropdown(this,event);' formattype='date' settime='2' type='text' style='width:48%;' op='" + strOp + "' target='" + eleName + "___2'>";
	return strHTML;
}

function create_profilecode_box(oField)
{
	var eleName = oField.getAttribute("targetcol");
	var strOp = oField.getAttribute("operator");
	if(strOp==null)
	{
		var arrI = eleName.split(".");
		var boolNumeric = app.dd.tables[arrI[0]].columns[arrI[1]].IsNumeric();
		strOp = (boolNumeric)?"in":"like";				
	}
	
	//-- set the input label
	var strLabel = "";
	var arrLabels = oField.getElementsByTagName("label");
	if(arrLabels)strLabel = app.xmlText(arrLabels[0]);

	//-- if no label use binding
	if(strLabel=="")strLabel = app.get_label_from_binding(eleName);
	strLabel += "<br/>";
	
	var strHTML = strLabel + "<input id='_sfc_pc' class='profilecode' type='text' oncontextmenu='if(app._clicked_ele_trigger(this,event))return app.stopEvent(event);' onmousedown='return app.select_profile_code_for_element(this,true,false,event);' style='width:100%;' op='" + strOp + "' target='" + eleName + "'>";
	return strHTML;

}

//--
//-- called when a mes data row is selected
function mes_datarow_selected(aRow)
{
	var strTable = aRow.getAttribute('keytable');
	var strKeyCol = aRow.getAttribute('keycolumn');
	var varKeyValue = B64.decode(aRow.getAttribute('keyvalue'));

	//-- load data into mes form - so access workspace area
	app.datatable_hilight(aRow);

	if(aRow.getAttribute("type")=="sys")
	{
		
		app.fireEvent(aRow,"click");
		//aRow.click(aRow);
	}
	else
	{
		load_mes_url(strTable,strKeyCol, varKeyValue);
	}
}


//--
//-- called when a mes data row is selected
function mes_datarow_dblclick(aRow)
{
	var strTable = aRow.getAttribute('keytable');
	var strKeyCol = aRow.getAttribute('keycolumn');
	var varKeyValue = B64.decode(aRow.getAttribute('keyvalue'));

	if(strTable.toLowerCase()=="opencall")
	{
		//-- open call detail in modal
		app._open_call_form("cdf",varKeyValue,true,window)
		app.fireEvent(aRow,"click");

	}
	else
	{
		var editform = app.dd.tables[strTable].editform;
		if(editform!="")
		{
			_mes_current_table = "";
			app.OpenFormForEdit(editform,varKeyValue,"",true,function(formReturnInfo)
			{
				load_mes_url(strTable,strKeyCol, varKeyValue); //-- redload acive page in case user changed record
			});
		}
	}
}


//-- select first row after getting data
function mes_select_firstrow(mesResultDiv)
{
	var oDataHolder = app.get_parent_child_by_id(mesResultDiv,'div_data');
	if(oDataHolder!=null)
	{
		var aTable = oDataHolder.childNodes[0];
		if(aTable.rows.length>0)
		{
			mes_datarow_selected(aTable.rows[0]);
		}
		else
		{
			//-- clear data form
			load_mes_url("", "");
		}
	}
}

//-- functions used by forms loaded into the work space
var _mes_current_table = "";
var _mes_current_key = "";
function load_mes_url(strTable, strKeyCol, varKeyValue)
{
	//-- do not load url when already loaded
	if(_mes_current_table!="")
	{
		//if(_mes_current_table==strTable && _mes_current_key==varKeyValue) return;
	}
	_mes_current_table=strTable;
	_mes_current_key=varKeyValue;

	//-- how do we find out which form to load
	var iframeData = app.oWorkspaceFrameHolder.document.getElementsByTagName("IFRAME");
	if(iframeData[0])
	{
		//var fDoc = app.getFrameDoc(iframeData[0].name,document);
		//var strPath = fDoc.location.href.split("?");
		var strBinding = strTable+"."+strKeyCol;
		var strURL = app.trim(app.dd.GetGlobalParam("Active Folder Pages/"+strBinding));
		//alert(strBinding)
		if(strURL!="")
		{	
			strURL = app._swc_parse_variablestring(strURL);

			strURL += "?ColourScheme=4&sessid=" + app.pfu(app._swsessionid) + "&swsessionid=" + app.pfu(app._swsessionid) + "&"+strKeyCol+"=" + app.pfu(varKeyValue);
			iframeData[0].contentWindow.document.location.href = strURL;

			_swc_check_document_hrefs(iframeData[0]);
		}
		else
		{
			if(strKeyCol!="")alert("There is no active folder page definition for this database entity search. Please contact your Administrstor.");
			iframeData[0].contentWindow.document.body.innerHTML = "";
		}
	}


}
;;;;/*--------------------------------------------------|

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