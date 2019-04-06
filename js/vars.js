//****************************************//
//
//  vars.js created 2018-03-15
//
// contains variables for Controller
// COPYRIGHT - All Rights Reserved
//
//******************************************

//***********************************************
//
//  Handles to the main interface elements to they are accessible (Global)
//
//**********************************************
var hControlWindow;
var hAircraftWindow;
var hACMenu;
var hClearanceWindow;
var hDataboard;
var hVoiceWindow;
var hSeparationWindow;
var hPauseWindow;
var hFinalScoreWindow;
var hReadyWindow;
var UserMsg;
var cvMap;

var hLoadingScreen;
var sFileToWrite;

//***********************************************
//
//  Main program variables
//
//**********************************************
//sounds and volume
var sndWarning;
var sndRequestRelease;
var sndTaxi;
var sndArrival;
var sndSayAgain;
var sndDeparture;
var sndDing;
var MasterVolume = 5;

//Selected Aircraft (when selected)
var CurrentAC;

//Scoring variables
var Score;

//variables to hold working values while clearance panels being updated
var WorkingAltitude;
var WorkingSpeed;
var WorkingHeading;
var CurrentACWorkingHeading;

//Drawing Variables
var bDrawGrid 			= true;
var bDrawApproaches     = true;
var nScrollSpeed        = 0.05;
var bShowAllPTL         = false;
var bShowAllFixNames    = false;
var bShowAllHalo        = false;
var bSectorLoaded       = false;
var bAutoDisplayRoute   = true;
var bShowOverlay1       =false;
var bShowOverlay2       =false;
var bShowOverlay3       =false;
var bShowOverlay4       =false;
var color_HANDOFF;

//Speech variables
var aVoiceList;
var aVoices = new Array();
var voiceSynth;
var Controller;
var Coordinator;


//Interface Variables

var iMapAction = 0;
var iAppStatus = 0;
var bACMainMenuOpen = false;
var bSimRunning         = false;
var nFixSize            = 12;
var nTargetSize         = 16;
var nTagSize            = 13;
var iImageLoadCounter   = 0;
var vMousePosition;
var SelectedAircraft    = 0;
var bAircraftSelected   = false;
var nNumTrailDots       = 20;
var FarBuffer           = 30;
var HandoffBuffer       = 10;
var OffsideBuffer       = 2;
var bColorHandoff       = true;
var PTLDistance         = 2;
const  nTagLineSpace    = 3;

//items to detect and track map clicks for routing changes
var bSelectingRouteFixes = false;
var bSelectingHoldFix   = false;
var aDirectRoutePoints = [];
var bSelectingRBL1 = false;
var bSelectingRBL2 = false;
var tempRBL1;
var ACInHandoff;

//Radar state variables
var ScrnSize = new Vector2d(0,0);
var pCurrentMapCentre = new Polar3d(45,-90);
var nCurrentZoom = 3000;

//Timing variables
var tSimTime; //tMyTime Object to hold Hours, Minutes, Seconds
var timerMapMovement 	    = null;
var timerSimulation         = null;
var timerInterface          = null;
var nRadarSpinTime          = 3000;  //milliseconds
var nInterfaceFlash         = 500;
var nowTime;
var MsgTimer;
var MsgTimeOut = 8000;

//file status
var sFileData;
var fileRequest;
var bFileLoaded;
var sSimFileName;

//Object arrays
var aTP143					= [];
var aTelephony              = [];
var aBoundaries 		    = [];
var aFixes 					= [];
var aAirways                = [];
var aAirports               = [];
var aAircraft 				= [];
var aACIdents               = [];
var aStrips                 = [];
var aImages                 = [];
var aRouteMenuItems         = [];
var aRBL                    = [];
var aOverlay1               = [];
var aOverlay2               = [];
var aOverlay3               = [];
var aOverlay4               = [];
var aSeparationList         = [];
var ACTransponderIndex      = 0; //code to track a/c numbers, increment for every new aircraft created.

//***********************************************
//
//  Interface constants used throughout
//
//**********************************************
const FIX           = 800;
const FIXINROUTE    = 801;
const LATLONG       = 802;

//Separation issues
const TECHNICAL     = 55;
const ACTUAL        = 56;

//Interface Constants
const NOACTION  	= 0;
const ZOOMING 	    = 1;
const UNZOOMING 	= 2;
const SCROLLLEFT 	= 3;
const SCROLLRIGHT   = 4;
const SCROLLUP 	    = 5;
const SCROLLDOWN 	= 6;
const MIN_ZOOM 	    = 1;
const DRAGGINGTAG   = 34;
const MAX_ZOOM  	= 4500;

//Application Action Constants
const LOADING_SECTORFILE 	= 11;
const LOADING_TP143 		= 13;
const LOADING_SIMFILE		= 17;
const LOADING_GENFILE       = 18;
const LOADING_TELEPHONY     = 19;
const POLAR                 = 21;
const VECTOR                = 23;

//Clearance types used to display the appropriate clearance window
const ALTITUDECLX   = 91;
const VECTORCLX     = 92;
const SPEEDCLX      = 93;
const DIRECTCLX     = 94;
const HOLDCLX       = 95;
const APPROACHCLX   = 96;

//Sender constants to determine whether clx activated from panel or menu
const SENDERMENU    = 97;
const SENDERPANEL   = 98;

//Message Types
const MSGINFO       = "#0088dd";
const MSGWARNING    = "#dddd00";
const MSGERROR      = "#ee0000";
const MSGLOW        = "#404040";

//***********************************************
//
//  Colors used throughout the application
//
//**********************************************
const color_BACGKGROUND     = "#0b0b0b";
const color_GRID            = "#222222";
const color_BOUNDARY        = "#777700";
const color_BOUNDARYFILL    = "#11111b";
const color_LINE1           = "#aaaaaa";
const color_LINE2           = "#606020";
const color_LINE3           = "#00aadd";
const color_LINE4           = "#772222";
const color_LINE5           = "#666622";
const color_LINE6           = "#ffffff";
const color_AIRWAY          = "#444444";
const color_RUNWAY          = "#ffffff";
const color_APPROACH        = "#7777bb";
const color_DATATAG         = "#eeeeee";
const color_LEADERLINE      = "#bbbbbb";
const color_EXTERNALDATATAG = "#888888";
const color_HANDOFF1        = "#999999";
const color_HANDOFF2        = "#eeee00";
const color_TRAILDOTS       = "#777777";
const color_PTL             = "#aaffaa";
const color_ROUTE           = "#227722";
const color_SELECTEDAC1     = "#00cc00";
const color_SELECTEDAC2     = "#008800";
const color_FIX_TEXT        = "#888888";
const color_DIRECTROUTE     = "#eeee00";
const color_AC_APPROACH     = "#999900";
const color_RBL             = "#7575ee";
const color_RBLTEXT         = "#aaaacc";
const color_TARGET          = "#dddddd";
const color_SEPLOSS         = "#ff333380";
const color_TECHNICALLOSS   = "#cccc0080";

const color_FLAGBASE        = "#ffffff00";
const color_FLAGBLUE        = "#0088dd";
const color_FLAGYELLOW      = "#eeee00";


//*****************************************************
//
//  Scenario related items
//
//*****************************************************
var ScenarioType;
const SCRIPTED          = 501;
const CUSTOMIZED        = 502;
const ARRIVAL           = 503;
const DEPARTURE         = 504;
const OVERFLIGHT        = 505;
var ACDesc              =[];
var aArrivalRoutes      =[];
var aDepartureRoutes    =[];
var aOverflightRoutes   =[];
var numScenarioMinutes;
var numArrivals;
var numDepartures;
var numOverflights;
var bInternalAirports = false;
// Wind Variables
var LoWind, MidWind, HiWind;

var PilotResponseTime;
const QUICK_RESPONSE    = 10;
const AVG_RESPONSE      = 20;
const SLOW_RESPONSE     = 30;
const AWFUL_RESPONSE    = 60;
//***********************************************
//
//  Aircraft and Airport related constants and variables
//
//**********************************************
//AC Status Variables
const WAITING               = 101;
const TAXIING               = 102;
const REQUESTING_RELEASE    = 103;
const RELEASED              = 104;
const ENROUTE               = 105;
const APPROACH              = 106;
const LANDED                = 107;
const FINISHED              = 108;
//AC Action Variables
const FREQ_CHANGE_INBOUND   = 200;
const CLX_ALTITUDE          = 201;
const UNABLE_ALT            = 203;
const CLIMB_TO              = 204;
const DESCEND_TO            = 205;
const LEVEL_CALL            = 206;
const CLX_DIRECT            = 207;
const PROCEEDING_DIRECT     = 208;
const CLX_HDG_LEFT          = 209;
const CLX_HDG_RIGHT         = 210;
const CLX_HDG_STRAIGHT      = 213;
const TURNING_LEFT_HDG      = 211;
const TURNING_RIGHT_HDG     = 212;
const MNTN_PRESENT_HDG      = 214;
const CHECK_IN_DEPARTURE    = 215;
const EXTERNAL_HANDOFF      = 216;
const ASSIGN_SPD            = 217;
const CANCEL_SPD            = 218;
const RESUME_SPD            = 219;
const UNABLE_SPD            = 220;
const INCREASE2SPEED        = 221;
const DECREASE2SPEED        = 222;
const MAINTAINSPEED         = 223;
const SPEED_ASSIGNED        = 224;
const CLX_APPROACH          = 225;
const COMMENCE_APPROACH     = 226;
const TOWER_HANDOFF         = 228;
const RQST_RTE              = 229;
const RQST_ALT              = 230;
const CANCEL_APPROACH       = 231;
const TWR_CANCEL_APPROACH   = 232;
const MISSED_APPROACH       = 233;
const ENTER_HOLD4HANDOFF    = 234;
const CLX_HOLDHERE          = 235;
const HOLD_HERE             = 236;
const HOLD_FIX              = 237;
const CLX_HOLDFIX           = 238;
const ENTERING_HOLD         = 239;
//constants related to standard approach
const INNER_WEDGE           = 5; //5 degrees each side of centreline
const OUTER_WEDGE           = 23; //23 degrees " " " "
const IF_DISTANCE           = 12;
const IAF_DISTANCE          = 5;
//RBL TYpes
const RBL_AIRCRAFT          = 301;
const RBL_FIX               = 302;
const RBL_AIRPORT           = 303;
const RBL_MAPPOINT          = 304;

















