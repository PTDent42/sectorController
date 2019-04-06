//****************************************//
//
//  program.js created 2018-03-15
//
// contains main for Controller
// COPYRIGHT - All Rights Reserved
//
//*****************************************
//********************************************************************************************************************
//-
//-     START UP functions
//-
//******************************************************************
window.onload = function() {
    //hide any scroll bars
    document.body.style.overflow = "hidden";
    //get the loading screen handle
    hLoadingScreen = document.getElementById('LoadingDiv');
    hLoadingScreen.style.width = window.innerWidth + "px";
    hLoadingScreen.style.height = window.innerHeight + "px";
    AudioLoad();
    //start by loading images from the list
    var aTemp = ["images/airport.png", "images/ndb.png", "images/rTarget.png","images/targetHeavy.png",
        "images/targetLight.png","images/targetMedium.png", "images/vor.png", "images/waypoint.png"]
    nImages = aTemp.length;
    for (var i=0; i< aTemp.length; i++) {
        aImages[i] = new Image();
        aImages[i].onload = function () { onImageLoad();}
        aImages[i].src = aTemp[i];
    }
};
//-------------------------------------------------------------------
function AudioLoad() {
    sndSayAgain = new Audio('images/sayagain.mp3');
    sndArrival = new Audio('images/arrival.mp3');
    sndDeparture = new Audio('images/departure.mp3');
    sndRequestRelease = new Audio('images/reqstrelease.mp3');
    sndTaxi = new Audio('images/taxi.mp3');
    sndTaxi.volume = 0.3;
    sndWarning = new Audio('images/warning.mp3');
    sndDing = new Audio('images/ding.mp3');
}
//-------------------------------------------------------------------
function onImageLoad () {
    //checks to see how many images have been loaded.
    //When all have been loaded, then can start...
    iImageLoadCounter++;
    if (iImageLoadCounter < nImages) return;

    //setup to load the voices
    voiceSynth = window.speechSynthesis;
    //console.log(voiceSynth);
    fLoadVoicesWhenAvailable();
}
//-------------------------------------------------------------------
function fLoadVoicesWhenAvailable() {
    aVoiceList = voiceSynth.getVoices();
    if (aVoiceList.length !==0) {onVoicesLoad();}
    else { setTimeout(function () { fLoadVoicesWhenAvailable(); }, 10)}
}
//-------------------------------------------------------------------
function onVoicesLoad() {
    var i, testLang;

    //voices loaded - get only English and local voices
    for (i=0; i< aVoiceList.length; i++) {
        //console.log( aVoiceList[i]);
        testLang = aVoiceList[i].lang.substr(0,2);
        //console.log(testLang);
        //____________________________________________
        //Normal Use:
        /*
        if (testLang.substr(0,2) === "en" && aVoiceList[i].localService === true) {
            aVoices.push(aVoiceList[i]);
            //console.log( aVoiceList[i]);
        }
        */
        //------------------------------------------
        if (testLang === "en" || testLang === "fr" || testLang === "de") {
            aVoices.push(aVoiceList[i]);
            //console.log( aVoiceList[i]);
        }
    }
    fSetupInterface();
}
//-------------------------------------------------------------------
function fSetupInterface() {
    //get the window width and height for later set up
    ScrnSize.x = window.innerWidth;
    ScrnSize.y = window.innerHeight;
    //Set up the main map
    cvMap = document.createElement('canvas');
    cvMap.className = "MainMap";
    cvMap.id = "canvasMap";
    var body = document.getElementById("MainBody");
    body.appendChild(cvMap);
    ctxMap 	= cvMap.getContext("2d");
    cvMap.style.position = "absolute";
    cvMap.style.left = 0 + 'px';
    cvMap.style.top = 0 + 'px';
    //***************************************************
    //Create the interface elements required
    //*****************************************************
    fCreateControlWindow();
    fCreateAircraftWindow();
    fCreateACMenus();
    fCreateClearanceWindow();
    fCreateDataboard();
    fCreateVoicePanel();
    fCreateSeparationWindow();
    fCreatePauseWindow();
    fCreateFinalScoreWindow();
    fCreateReadyWindow();
    //create the Message Panel
    UserMsg = new MessageWindow("UserMsg");
    UserMsg.Resize(800,20);
    UserMsg.MoveTo(200, hControlWindow.Location.H + 10);
    UserMsg.Hide();
    //Add event listeners to capture interface activity
    window.addEventListener('scroll', noscroll);
    //Window resize event
    window.addEventListener('resize', fResetWindows, false);
    //listen for mouse down/mouse up events
    document.addEventListener("mousedown", fMouseDown, false);
    document.addEventListener("mouseup", fMouseUp, false);
    document.addEventListener("wheel", fMouseWheel, true);
    document.addEventListener("touchstart", touch2Mouse, true);
    document.addEventListener("touchmove", touch2Mouse, true);
    document.addEventListener("touchend", touch2Mouse, true);
    //Perform any startups
    //Create the time object
    tSimTime = new cMyTime(15, 35, 22);
    //redraw all the interface to start
    fResetWindows();
    //load the airliner identifiers from file
    fLoadTelephony();
}
//-------------------------------------------------------------------
function fCreateControlWindow() {
    hControlWindow = new Window("ControlWindow", "topwindow");
    with (hControlWindow) {
        Locate(190,0,726, 94);
        //Add the Sector Information Pane
        AddPane("SectorInfo", "standardpane");
        LocatePane("SectorInfo", 0,0,160,94);
        AddLabel("SectorInfo", "lblSector", "Sector Name Here", "sectorinfo", 0,4, 160,16);
        AddLabel("SectorInfo", "lblClock", "--:--z", "clock", 0,26, 160,30);
        AddLabel("SectorInfo", "lblWind", "Wind: 050/15", "wind", 0,74, 160,15);

        //Add the Map Tools Pane
        AddPane("MapTools", "standardpane");
        LocatePane("MapTools", 160, 0, 210,94);
        AddLabel("MapTools", "lblMapControls", "Map Controls", "lbl14WhiteCenter", 0,2,210,14);
        AddButton("MapTools", "btnScrollLeft", true, "images/moveleft.png", "stdbutton", 2, 24, 32,68);
        AddButton("MapTools", "btnScrollUp", true, "images/moveup.png", "stdbutton", 36, 24, 64,32);
        AddButton("MapTools", "btnScrollRight", true, "images/moveright.png", "stdbutton", 102, 24, 32,64);
        AddButton("MapTools", "btnScrollDown", true, "images/movedown.png", "stdbutton", 36, 58, 64,32);
        AddButton("MapTools", "btnZoomIn", true, "images/zoomin.png", "stdbutton", 138, 24, 32,32);
        AddButton("MapTools", "btnZoomOut", true, "images/zoomout.png", "stdbutton", 138, 56, 32,32);
        AddButton("MapTools", "btnReset", true, "images/refresh.png", "stdbutton", 174, 24, 32,32);
        AddButton("MapTools", "btnGrid", true, "images/grid.png", "stdbutton", 174, 56, 32,32);

        //Add the show/hide overlays pane
        AddPane("MapOverlays", "standardpane");
        LocatePane("MapOverlays", 370, 0, 138, 94);
        AddLabel("MapOverlays", "lblOverlays", "Show/Hide", "lbl14WhiteCenter", 0,2,138,14);
        AddButton("MapOverlays", "btnOverlay1", false, "1", "stdbutton",2, 24, 32, 32);
        AddButton("MapOverlays", "btnOverlay2", false, "2", "stdbutton", 2, 56, 32, 32);
        AddButton("MapOverlays", "btnOverlay3", false, "3", "stdbutton",  38, 24, 32, 32);
        AddButton("MapOverlays", "btnOverlay4", false, "4", "stdbutton",  38, 56, 32, 32);
        AddButton("MapOverlays", "btnFixName", false, "FIX", "stdbutton",  72,24, 64, 32);
        AddButton("MapOverlays", "btnHalo", false, "HALO", "stdbutton",  72,56, 64, 32);

        //Add the target tools pane
        AddPane("TargetTools", "standardpane");
        LocatePane("TargetTools", 508, 0, 138, 94);
        AddLabel("TargetTools", "lblTrgtTool", "Target Tools", "lbl14WhiteCenter", 0,2,138,14);
        AddButton("TargetTools", "btnPTL", false, "PTL", "stdbutton",2, 24, 64, 32);
        AddButton("TargetTools", "btnPTLUp", false, "+", "stdbutton",68, 24, 32, 32);
        AddButton("TargetTools", "btnPTLDown", false, "-", "stdbutton",102, 24, 32, 32);
        AddButton("TargetTools", "btnRBL", false, "RBL", "stdbutton",2, 56, 64, 32);
        AddButton("TargetTools", "btnRBLClear", false, "Clear", "stdbutton",68, 56, 66, 32);

        //Add the options buttons pane
        AddPane("ControlOptions", "darkpane");
        LocatePane("ControlOptions", 646,0, 80, 94);
        AddButton("ControlOptions", "btnInterface", true, "images/settings.png", "selectionbutton", 6, 4, 68,41);
        AddButton("ControlOptions", "btnSimControl", true, "images/headset.png", "selectionbutton", 6, 49, 68,41);

        //Add the Interface Pane
        AddPane("Interface", "standardpane");
        LocatePane("Interface", 726, 0, 400,94);
        AddLabel("Interface", "lblInterface", "Interface Tools", "lbl14WhiteCenter", 2,35,60,14);
        AddButton("Interface", "btnTagUp", true, "images/moveup.png", "stdbutton",80, 24, 28, 32);
        AddButton("Interface", "btnTagDown", true, "images/movedown.png", "stdbutton",80, 56, 28, 32);
        AddLabel("Interface", "lblTagSize", "Tag", "lbl12White", 82,8,60,14);
        AddButton("Interface", "btnTargetUp", true, "images/moveup.png", "stdbutton",120, 24, 28, 32);
        AddButton("Interface", "btnTargetDown", true, "images/movedown.png", "stdbutton",120, 56, 28, 32);
        AddLabel("Interface", "lblTargetSize", "Target", "lbl12White", 115,8,60,14);
        AddButton("Interface", "btnFixUp", true, "images/moveup.png", "stdbutton",160, 24, 28, 32);
        AddButton("Interface", "btnFixDown", true, "images/movedown.png", "stdbutton",160, 56, 28, 32);
        AddLabel("Interface", "lblFixSize", "Fix", "lbl12White", 164,8,60,14);
        AddButton("Interface", "btnDotsUp", true, "images/moveup.png", "stdbutton",200, 24, 28, 32);
        AddButton("Interface", "btnDotsDown", true, "images/movedown.png", "stdbutton",200, 56, 28, 32);
        AddLabel("Interface", "lblDotsSize", "Trail", "lbl12White", 200,8,60,14);
        AddButton("Interface", "btnVolumeUp", true, "images/moveup.png", "stdbutton",240, 24, 28, 32);
        AddButton("Interface", "btnVolumeDown", true, "images/movedown.png", "stdbutton",240, 56, 28, 32);
        AddLabel("Interface", "lblVolume", "Vol.", "lbl12White", 238,8,60,14);
        AddButton("Interface", "btnCloseInterface", false, "X", "stdbutton", 370, 0, 30,30);
        AddCheckbox("Interface", "chkRoute", 280, 62, 16,16);
        AddLabel("Interface", "lblChkRoute", "Auto-Display Route", "lbl12White", 310, 62, 100, 16);
        AddButton("Interface", "btnResetSound", false, "Snd Reset", "stdbutton", 280, 24, 80, 32);

        //Add the Sim Control Pane
        AddPane("SimControl", "standardpane");
        LocatePane("SimControl", 726, 0, 300,94);
        AddLabel("SimControl", "lblSimControl", "Simulation Controls", "lbl14WhiteCenter", 0,2,300,14);
        AddLabel("SimControl", "lblScore", "Score (so far)", "lbl12White", 35, 22, 40, 14);
        AddLabel("SimControl", "lScoreDisplay", "10500", "wind", 0,50,110,14);
        SetLabelTextSize("lScoreDisplay", 36);
        AddButton("SimControl", "btnSimStop", false, "PAUSE (penalty)", "stdbutton",130, 24, 120, 32);
        AddButton("SimControl", "btnEndSim2", false, "End Simulation", "stdbutton",130, 60, 120, 32);
        AddButton("SimControl", "btnCloseSimControl", false, "X", "stdbutton", 270, 0, 30,30);
        //Close the unused panes
        ClosePane( "SimControl", "Interface");
        //Set the Initial volume
        UpdateLabel("lblVolume", "Vol. " + String(MasterVolume));

    }
}
//-------------------------------------------------------------------
function fCreateAircraftWindow() {
    hAircraftWindow = new Window("AircraftWindow", "topwindow");
    with (hAircraftWindow) {
        Locate((ScrnSize.x - 800)/2,ScrnSize.y - 94,800, 94);
        //Add the options buttons pane
        AddPane("TrgtTool", "darkpane");
        LocatePane("TrgtTool", 0,0, 54, 94);
        AddButton("TrgtTool", "abtnPTL", false, "PTL", "stdbutton", 3, 2, 48,28);
        AddButton("TrgtTool", "abtnRTE", false, "RTE", "stdbutton", 3, 33, 48,28);
        AddButton("TrgtTool", "abtnHALO", false , "HALO", "stdbutton", 3, 64, 48,28);

        //Add the route pane
        AddPane("ACRoute", "stripactive");
        LocatePane("ACRoute", 54, 64, 354, 30);
        AddLabel("ACRoute", "lRoute", "Route", "striptextactive", 4,0,350,30);
        SetLabelTextSize("lRoute", 13);

        //add the AC Estimate box
        AddPane("ACEstimate", "stripactive");
        LocatePane("ACEstimate", 54, 0, 70, 63);
        AddLabel("ACEstimate", "lFix", "CURAN", "striptextactive", 2,6,66,24);
        SetLabelTextSize("lFix", 16)
        AddLabel("ACEstimate", "lEstimate", "14:30", "striptextactive", 2, 32, 66, 30);
        SetLabelTextSize("lEstimate", 24);

        //Add the flight type block
        AddPane("ACFlightType", "stripactive");
        LocatePane("ACFlightType", 124, 0, 34, 63);
        AddLabel("ACFlightType", "lFltType", "D", "striptextactive", 3,14,34,64);
        SetLabelTextSize("lFltType", 36);

        //Add the altitude block
        AddPane("ACAltitude", "stripactive");
        LocatePane("ACAltitude", 158, 0, 70, 63);
        AddLabel("ACAltitude", "lALTcleared", "370", "striptextactive", 8,2,66,40);
        SetLabelTextSize("lALTcleared", 28);
        AddLabel("ACAltitude", "lALTcurrent", "CUR: 217", "striptextactive", 2, 42, 66, 20);
        SetLabelTextSize("lALTcurrent", 13);

        //add the info block
        AddPane("ACInformation", "stripactive");
        LocatePane("ACInformation", 228, 0, 100, 63);
        AddLabel("ACInformation", "lInfo1", "HDG: 225", "striptextactive", 2, 2, 100, 20);
        SetLabelTextSize("lInfo1", 13);
        AddLabel("ACInformation", "lInfo2", "INFO Line 2", "striptextactive", 2, 23, 100, 20);
        SetLabelTextSize("lInfo2", 13);
        AddLabel("ACInformation", "lInfo3", "Info Line 3", "striptextactive", 2, 42, 100, 20);
        SetLabelTextSize("lInfo3", 13);

        //Add the ident block
        AddPane("ACIdentBlock", "stripactive");
        LocatePane("ACIdentBlock", 328, 0, 80, 63);
        AddLabel("ACIdentBlock", "lIdent", "ACA999", "striptextactive", 2,4,80,21);
        SetLabelTextSize("lIdent", 17);
        AddLabel("ACIdentBlock", "lType", "M/A321", "striptextactive", 2,24,80,21);
        SetLabelTextSize("lType", 14);
        AddLabel("ACIdentBlock", "lSpd", "459", "striptextactive", 2,40,80,21);
        SetLabelTextSize("lSpd", 14);

        //NOW add the various button windows based on status
        //Panel with just request release
        AddPane("AC-RQST", "darkpane");
        LocatePane("AC-RQST", 410, 0, 90, 94);
        AddButton("AC-RQST", "btnRelease", false, "RELEASE", "actionbutton", 5,25, 80, 45);
        AssignButtonCommand("btnRelease", "ReleaseAircraft");

        //Panel with just Accept HO
        AddPane("AC-ACCEPT", "darkpane");
        LocatePane("AC-ACCEPT", 410, 0, 90, 94);
        AddButton("AC-ACCEPT", "btnAccept", false, "ACCEPT", "actionbutton", 5,25, 80, 45);
        AssignButtonCommand("btnAccept", "AcceptHandoff");

        //Pane for overflights our control
        AddPane("AC-OVER", "darkpane");
        LocatePane("AC-OVER", 410, 0, 192, 94);
        AddButton("AC-OVER", "btnAltitude1", false, "Altitude...", "stdbutton", 4,3, 60, 42);
        AssignButtonCommand("btnAltitude1", "ActivateALTPanel");
        AddButton("AC-OVER", "btnVector1", false, "Vector...", "stdbutton", 4,48, 60, 42);
        AssignButtonCommand("btnVector1", "ActivateHDGPanel");
        AddButton("AC-OVER", "btnSpeed1", false, "Speed...", "stdbutton", 66,3, 60, 42);
        AssignButtonCommand("btnSpeed1", "ActivateSPDPanel");
        AddButton("AC-OVER", "btnDirect1", false, "Direct...", "stdbutton", 66,48, 60, 42);
        AssignButtonCommand("btnDirect1", "ActivateDCTPanel");
        AddButton("AC-OVER", "btnHold1", false, "Hold...", "stdbutton", 128,3, 60, 42);
        AssignButtonCommand("btnHold1", "ActivateHOLDPanel");
        AddButton("AC-OVER", "btnHandoff", false, "Handoff", "stdbutton", 128,48, 60, 42);
        AssignButtonCommand("btnHandoff", "HandoffExternal");

        //Pane for arrivals our control
        AddPane("AC-ARR", "darkpane");
        LocatePane("AC-ARR", 410, 0, 192, 94);
        AddButton("AC-ARR", "btnAltitude2", false, "Altitude...", "stdbutton", 4,3, 60, 42);
        AssignButtonCommand("btnAltitude2", "ActivateALTPanel");
        AddButton("AC-ARR", "btnVector2", false, "Vector...", "stdbutton", 4,48, 60, 42);
        AssignButtonCommand("btnVector2", "ActivateHDGPanel");
        AddButton("AC-ARR", "btnSpeed2", false, "Speed...", "stdbutton", 66,3, 60, 42);
        AssignButtonCommand("btnSpeed2", "ActivateSPDPanel");
        AddButton("AC-ARR", "btnDirect2", false, "Direct...", "stdbutton", 66,48, 60, 42);
        AssignButtonCommand("btnDirect2", "ActivateDCTPanel");
        AddButton("AC-ARR", "btnHold2", false, "Hold...", "stdbutton", 128,3, 60, 42);
        AssignButtonCommand("btnHold2", "ActivateHOLDPanel");
        AddButton("AC-ARR", "btnApproach", false, "Approach...", "stdbutton", 128,48, 60, 42);
        AssignButtonCommand("btnApproach", "ActivateAPPPanel");

        //Panel with just Cancel Approach
        AddPane("AC-APPOFF", "darkpane");
        LocatePane("AC-APPOFF", 410, 0, 90, 94);
        AddButton("AC-APPOFF", "btnCancel1", false, "CANCEL APPROACH", "stdbutton", 5,25, 80, 45);
        AssignButtonCommand("btnCancel1", "CancelApproach");

        //Panel for AC on approach
        AddPane("AC-APPON", "darkpane");
        LocatePane("AC-APPON", 410, 0, 192, 94);

        AddButton("AC-APPON", "btnAltitude3", false, "Altitude...", "stdbutton", 4,3, 60, 42);
        AssignButtonCommand("btnAltitude3", "ActivateALTPanel");
        AddButton("AC-APPON", "btnVector3", false, "Vector...", "stdbutton", 4,48, 60, 42);
        AssignButtonCommand("btnVector3", "ActivateHDGPanel");
        AddButton("AC-APPON", "btnSpeed3", false, "Speed...", "stdbutton", 66,3, 60, 42);
        AssignButtonCommand("btnSpeed3", "ActivateSPDPanel");
        AddButton("AC-APPON", "btnDirect3", false, "Direct...", "stdbutton", 66,48, 60, 42);
        AssignButtonCommand("btnDirect3", "ActivateDCTPanel");
        AddButton("AC-APPON", "btnHold3", false, "Hold...", "stdbutton", 128,3, 60, 42);
        AssignButtonCommand("btnHold3", "ActivateHOLDPanel");
        AddButton("AC-APPON", "btnTfr", false, "Comm Transfer", "stdbutton", 128,48, 60, 42);
        AssignButtonCommand("btnTfr", "CommToTower");
        //Hide the window to start since no a/c yet selected
        Hide();
    }
}
//-------------------------------------------------------------------
function fCreateACMenus() {
    hACMenu = new Window("MenuWindow", "darktopwindow");
    with (hACMenu) {
        Locate(200,200,120,200);
        //Create and add the top level menu items
        AddPane("MainMenu", "clearpane");
        LocatePane("MainMenu", 0,0,120,200);
        AddButton("MainMenu", "mnuAltitude", false, "Altitude...", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuVector", false, "Vector...", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuSpeed", false, "Speed...", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuApproach", false, "Approach...", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuDirect", false, "Direct...", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuHandoff", false, "Handoff", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuTransfer", false, "Tfr to Tower", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuHold", false, "Hold...", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuPTL", false, "PTL Toggle", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuRTE", false, "RTE Toggle", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuHALO", false, "HALO Toggle", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuCancel", false, "Cancel Approach", "menubutton", 0,0,120,20);
        AddButton("MainMenu", "mnuAccept", false, "Accept Handoff", "menubutton", 0,0,120,20);
        Hide();
    }
}
//-------------------------------------------------------------------
function fCreateClearanceWindow() {
    hClearanceWindow = new Window("ClearanceWindow", "topwindow");
    with (hClearanceWindow) {
        Locate(200,200,300,300);
        //Create and add the top level menu items

        //----------APPROACH CLEARANCE
        AddPane("ApproachClx", "clearancepane");
        LocatePane("ApproachClx", 0,0,140,94);
        AddLabel("ApproachClx", "lAppch", "Approach", "lbl14WhiteCenter", 0,2,140,16);
        AddLabel("ApproachClx", "lArprt", "CYYZ Rwy 33", "lbl14WhiteCenter", 2, 25, 140, 18);
        SetLabelTextSize("lArprt", 12);
        AddButton("ApproachClx", "btnApproachClx", false, "ISSUE APPROACH", "stdbutton", 10, 50, 120, 40);

        //----------ALTITUDE CLEARANCE
        AddPane("AltitudeClx", "clearancepane");
        LocatePane("AltitudeClx", 0,0,120,154);
        AddLabel("AltitudeClx", "lAlt", "Cleared Altitude", "lbl14WhiteCenter", 0,2,120,16);
        AddLabel("AltitudeClx", "lblALTReadout", "370", "lbl14WhiteCenter", 0, 16, 120, 32);
        SetLabelTextSize("lblALTReadout", 32);
        AddButton("AltitudeClx", "bAltUp10000", true, "images/altup.png", "stdbutton", 6, 50, 32,32);
        AddButton("AltitudeClx", "bAltUp1000", true, "images/altup.png", "stdbutton", 44, 50, 32,32);
        AddButton("AltitudeClx", "bAltUp100", true, "images/altup.png", "stdbutton", 82, 50, 32,32);
        AddButton("AltitudeClx", "bAltDown10000", true, "images/altdown.png", "stdbutton", 6, 84, 32,32);
        AddButton("AltitudeClx", "bAltDown1000", true, "images/altdown.png", "stdbutton", 44, 84, 32,32);
        AddButton("AltitudeClx", "bAltDown100", true, "images/altdown.png", "stdbutton", 82, 84, 32,32);
        AddButton("AltitudeClx", "btnAltSubmit", false, "Submit", "stdbutton", 6, 116, 108, 32);

        //----------SPEED ASSIGNMENT
        AddPane("SpeedClx", "clearancepane");
        LocatePane("SpeedClx", 0,0,158,130);
        AddLabel("SpeedClx", "lSpd", "Assign Speed IAS", "lbl14WhiteCenter", 0,2,158,16);
        AddButton("SpeedClx", "btnSpdDown", false, "-", "stdbutton", 6,30,32,32);
        AddLabel("SpeedClx", "lSpdReadout", "180", "lbl14WhiteCenter", 50, 25, 58, 36);
        SetLabelTextSize("lSpdReadout", 36);
        AddButton("SpeedClx", "btnSpdUp", false, "+", "stdbutton", 120,30,32,32);
        AddButton("SpeedClx", "btnSpdSubmit", false, "Submit", "stdbutton", 6,65,146,30);
        AddButton("SpeedClx", "btnResumeSpd", false, "Resume Own Speed", "stdbutton", 6,97,146,30);


        //----------VECTOR CLEARANCE
        AddPane("VectorClx", "clearancepane");
        LocatePane("VectorClx", 0,0,150,258);
        AddLabel("VectorClx", "lVector", "Assign Vector", "lbl14WhiteCenter", 0,2,150,16);
        AddLabel("VectorClx", "lblHDGReadout", "090", "lbl14WhiteCenter", 0, 20, 150, 32);
        SetLabelTextSize("lblHDGReadout", 32);
        AddRadioButton("VectorClx", "rdoTL", 10,55,18,18);
        AddLabel("VectorClx", "lblTL", "Left", "lbl12White", 38, 60, 50,16);
        AddRadioButton("VectorClx", "rdoTR", 76,55,18,18);
        AddLabel("VectorClx", "lblTR", "Right", "lbl12White", 104, 60, 30,16);
        AddButton("VectorClx", "bHdgDown5", true, "images/tl5.png", "stdbutton", 15, 82, 55, 32);
        AddButton("VectorClx", "bHdgUp5", true, "images/tr5.png", "stdbutton", 80, 82, 55, 32);
        AddButton("VectorClx", "bHdgDown10", true, "images/tl10.png", "stdbutton", 15, 118, 55, 32);
        AddButton("VectorClx", "bHdgUp10", true, "images/tr10.png", "stdbutton", 80, 118, 55, 32);
        AddButton("VectorClx", "bHdgDown100", true, "images/tl100.png", "stdbutton", 15, 154, 55, 32);
        AddButton("VectorClx", "bHdgUp100", true, "images/tr100.png", "stdbutton", 80, 154, 55, 32);
        AddButton("VectorClx", "btnHdgSubmit", false, "Submit", "stdbutton", 5,190,140,30);
        AddButton("VectorClx", "btnPresentHdg", false, "Fly Present Heading", "stdbutton", 5,224,140,30);

        //---------------HOLD CLEARANCE
        AddPane("HoldClx", "clearancepane");
        LocatePane("HoldClx", 0,0,158,94);
        AddLabel("HoldClx", "lHld", "Assign Hold", "lbl14WhiteCenter", 0,2,158,16);
        AddButton("HoldClx", "btnHoldHere", false, "Hold Present Position", "stdbutton", 6,30,146,30);
        AddButton("HoldClx", "btnHoldFix", false, "Hold at Fix (Click Fix)", "stdbutton", 6,62,146,30);

        //---------------DIRECT CLEARANCE
        AddPane("DirectClx", "clearancepane");
        LocatePane("DirectClx", 0,0,120,260);
        AddLabel("DirectClx", "lDct", "Routing", "lbl14WhiteCenter", 0,2,120,16);
        AddLabel("DirectClx", "lDctInst", "Select from List or Click Fixes", "lbl14WhiteCenter", 2, 20, 116, 24);
        SetLabelTextSize("lDctInst", 13);
        AddButton("DirectClx", "mnuDct0", false, "Fix 1", "menubutton", 0,50,120,20);
        AddButton("DirectClx", "mnuDct1", false, "Fix 1", "menubutton", 0,70,120,20);
        AddButton("DirectClx", "mnuDct2", false, "Fix 1", "menubutton", 0,90,120,20);
        AddButton("DirectClx", "mnuDct3", false, "Fix 1", "menubutton", 0,110,120,20);
        AddButton("DirectClx", "mnuDct4", false, "Fix 1", "menubutton", 0,130,120,20);
        AddButton("DirectClx", "mnuDct5", false, "Fix 1", "menubutton", 0,150,120,20);
        AddButton("DirectClx", "mnuDct6", false, "Fix 1", "menubutton", 0,170,120,20);
        AddButton("DirectClx", "mnuDct7", false, "Fix 1", "menubutton", 0,190,120,20);
        AddButton("DirectClx", "mnuDct8", false, "Fix 1", "menubutton", 0,210,120,20);
        AddButton("DirectClx", "mnuDct9", false, "Fix 1", "menubutton", 0,230,120,20);
        AddButton("DirectClx", "bCxDirect", false, "CANCEL", "stdbutton", 0,90,120, 32);

        //Hide the clearance window (until activated)
        Hide();

    }
}
//-------------------------------------------------------------------
function fCreateDataboard() {
    hDataboard = new Window("Databoard", "topwindow");
    with (hDataboard) {
        Locate(0, 0, 180, 900);
        //add the panes
        AddPane("panePendingDeparture", "stripbay");
        LocatePane("panePendingDeparture", 0, 0, 180, 100);
        AddLabel("panePendingDeparture", "ldep", "Pending Departure","stripheader", 0, 0, 180, 18);

        AddPane("panePendingEnroute", "stripbay");
        LocatePane("panePendingEnroute", 0, 100, 180, 100);
        AddLabel("panePendingEnroute", "lenroute", "Pending","stripheader", 0, 0, 180, 18);

        AddPane("paneActive", "stripbay");
        LocatePane("paneActive", 0, 200, 180, 100);
        AddLabel("paneActive", "lactive", "Active","stripheader", 0, 0, 180, 18);

        AddPane("paneInactive", "stripbay");
        LocatePane("paneInactive", 0, 450, 180, 100);
        AddLabel("paneInactive", "linactive", "Inactive","stripheader", 0, 0, 180, 18);
    }
}
//-------------------------------------------------------------------
function fCreateVoicePanel() {
    hVoiceWindow = new Window("VoiceWindow", "darktopwindow");
    with (hVoiceWindow){
        Locate(728, 0, 300, 141);
        AddPane("voicewindowHeader", "standardpane");
        LocatePane("voicewindowHeader", 0,0,298, 40);
        AddLabel("voicewindowHeader", "lVoice", "Voice Tracker", "lbl14WhiteCenter", 2,12,100, 13);
        AddButton("voicewindowHeader", "bVoiceClear", false, "Clear", "stdbutton", 140, 4, 56, 32);
        AddButton("voicewindowHeader", "bVoiceMore", false, "+", "stdbutton", 200, 4, 32, 32);
        AddButton("voicewindowHeader", "bVoiceLess", false, "-", "stdbutton", 236, 4, 32, 32);
        //add the CommLog Pane
        AddPane("CommLog", "scrollpane");
        LocatePane("CommLog", 0, 40, 300, 100);
    }
}
//-------------------------------------------------------------------
function fCreateSeparationWindow() {
    hSeparationWindow = new Window("SeparationWindow", "darktopwindow");
    with (hSeparationWindow) {
        Locate(100, 100, 150, 100);
        AddPane("SeparationWindowHeader", 'clearpane');
        LocatePane("SeparationWindowHeader", 0,0,150,22);
        AddLabel("SeparationWindowHeader", "lSep", "Separation Violations", "lbl14WhiteCenter", 1, 2, 148, 14);
        AddPane("SepList", "scrollpane");
        LocatePane("SepList", 0, 22, 150, 77);
        Hide();
    }
}
//-------------------------------------------------------------------
function fCreatePauseWindow() {
    hPauseWindow = new Window("PauseWindow", "opaquetopwindow");
    with (hPauseWindow) {
        Locate (0,0,726, 40);
        SetZ(3);
        AddPane("PausePane", "clearpane");
        LocatePane("PausePane", 0,0,726,40);
        AddLabel("PausePane", "lPse", "PAUSED", "lbl14WhiteCenter", 204, 2, 80,16);
        SetLabelTextSize("lPse", 18);
        AddLabel("PausePane", "lpsewrng", "Penalty Applies", "lbl12White", 208, 21, 100, 14);
        AddButton("PausePane", "btnRestartSim", false, "Continue", "selectionbutton", 320, 4, 160, 32);
        AddButton("PausePane", "btnEndSim", false, "End Simulation", "selectionbutton", 500, 4, 160, 32);
        AddButton("PausePane", "btnDebugTick", false, "TICK (Debug)", "actionbutton", 1, 4, 100, 32);
        Hide();
    }
}
//-------------------------------------------------------------------
function fCreateFinalScoreWindow() {
    hFinalScoreWindow = new Window("FinalScoreWindow", "dialogtopwindow");
    with (hFinalScoreWindow) {
        Locate(400, 300, 510, 440);

        AddPane("TotalScorePane", "insetpane");
        LocatePane("TotalScorePane", 10, 20, 490, 50);
        AddLabel("TotalScorePane", "lTotScore", "Final Score:", "lbl12White", 110, 6, 200, 30);
        SetLabelTextSize("lTotScore", 32);
        AddLabel("TotalScorePane", "txtTotalScore", "18500", "wind", 240, 6, 200, 30);
        SetLabelTextSize("txtTotalScore", 32);

        //Handled aircraft section
        AddPane("HandledPane", "insetpane");
        LocatePane("HandledPane", 10, 100, 160, 110);
        AddLabel("HandledPane", "lHandled", "Handled Aircraft", "lblheader", 4,4,152,16);
        AddLabel("HandledPane", "lArrivals", "Arrivals", "lbllabel", 44, 30, 80, 14);
        AddLabel("HandledPane", "lDepart", "Departures", "lbllabel", 24, 55, 80, 14);
        AddLabel("HandledPane", "lOver", "Overflights", "lbllabel", 24, 80, 80, 14);
        AddLabel("HandledPane", "txtArrivals", "36", "txtlabel", 110, 30, 60, 14);
        AddLabel("HandledPane", "txtDepartures", "24", "txtlabel", 110, 55, 60, 14);
        AddLabel("HandledPane", "txtOverflights", "9", "txtlabel", 110, 80, 60, 14);


        AddPane("SepPane", "insetpane");
        LocatePane("SepPane", 200, 100, 300, 110);
        AddLabel("SepPane", "lSep", "Separation", "lblheader", 4, 4, 292, 16);
        AddLabel("SepPane", "lSepLoss", "Minima Violations", "lbllabel", 10, 30, 120, 14);
        AddLabel("SepPane", "lTechLoss", "Technical Losses", "lbllabel", 10, 55, 120, 14);
        AddLabel("SepPane", "txtSepLoss", " 2 - duration 64 secs.", "txtlabel", 140, 30, 170, 16);
        AddLabel("SepPane", "txtTechLoss", " 0 - duration 0 secs.", "txtlabel", 140, 55, 170, 16);

        AddPane("ModPane", "insetpane");
        LocatePane("ModPane", 10, 230, 490, 120);
        AddLabel("ModPane", "lMod", "Modifiers", "lblheader", 4,4,482, 16);
        AddLabel("ModPane", "lMA", "Missed Approach", "lbllabel", 10, 30, 120, 14);
        AddLabel("ModPane", "lNocomm", "Late Comm Tfr", "lbllabel", 25, 55, 120, 14);
        AddLabel("ModPane", "lWrongalt", "Wrong Altitude", "lbllabel", 25, 80, 120, 14);
        AddLabel("ModPane", "lDepdelay", "Departure Delays", "lbllabel", 180, 30, 120, 14);
        AddLabel("ModPane", "lLateHO", "Late Handoff", "lbllabel", 208, 55, 120, 14);
        AddLabel("ModPane", "lIB Hold", "Boundary Hold", "lbllabel", 193, 80, 120, 14);

        AddLabel("ModPane", "lpause", "Sim Paused", "lbllabel", 360, 30, 120, 14);
        AddLabel("ModPane", "lblWrkd", "A/C Worked", "lbllabel", 360, 55, 120, 14);
        AddLabel("ModPane", "lblWkld", "Workload Mod", "lbllabel", 360, 80, 120, 14);


        AddLabel("ModPane", "txtMA", "4", "txtlabel", 140, 30, 25, 14);
        AddLabel("ModPane", "txtLateComm", "12", "txtlabel", 140, 55, 25, 14);
        AddLabel("ModPane", "txtWrongAlt", "4", "txtlabel", 140, 80, 25, 14);
        AddLabel("ModPane", "txtDepDelay", "5.4", "txtlabel", 310, 30, 120, 14);
        AddLabel("ModPane", "txtLateHO", "11", "txtlabel", 310, 55, 25, 14);
        AddLabel("ModPane", "txtIBHold", "4", "txtlabel", 310, 80, 25, 14);
        AddLabel("ModPane", "txtPause", "3", "txtlabel", 460, 30, 25, 14);
        AddLabel("ModPane", "txtACWorked", "67", "txtlabel", 460, 55, 25, 14);
        AddLabel("ModPane", "txtWorkload", "1.3", "txtlabel", 460, 80, 25, 14);

        AddPane("btnPane", "clearpane");
        LocatePane("btnPane", 10,370, 490, 55);
        AddButton("btnPane", "btnEndItAll", false, "Return to Selection Window", "stdbutton", 140, 10, 200, 40);
        Hide();
    }
}
//-------------------------------------------------------------------
function fCreateReadyWindow() {
    hReadyWindow = new Window("ReadyWindow", "dialogtopwindow");
    with (hReadyWindow) {
        Locate((ScrnSize.x - 400)/2, (ScrnSize.y - 200)/2, 400,200);
        SetZ(3);
        AddPane("ReadyPane", "clearpane");
        LocatePane("ReadyPane", 1,1,398,198);
        AddLabel("ReadyPane", "lReady", "Scenario Loaded", "lbl14WhiteCenter", 0, 50, 398, 20);
        SetLabelTextSize("lReady", 30);
        AddButton("ReadyPane", "btnStartup", false, "Start Simulation", "selectionbutton", 109, 120, 180, 40);
    }
}
//-------------------------------------------------------------------
function fLoadSectorFile() {
    //get the sector file from local storage
    var url = localStorage.getItem("sectorFile");
    iAppStatus = LOADING_SECTORFILE;
    fLoadFile(url);
}
//-------------------------------------------------------------------
function fLoadScenario() {
    var aData;
    //Sector is loaded
    // determine whether we are running a scripted scenario
    // or a customized session based on reading the local session
    //storage...
    if (localStorage.getItem("SessionType") === "Scripted") {
        ScenarioType = SCRIPTED;
        //get the scenario file from the session storage
        sSimFileName = localStorage.getItem("scenarioFile");
        //assemble sim file name and load the simfile
        PilotResponseTime = QUICK_RESPONSE;
        iAppStatus = LOADING_SIMFILE;
        fLoadFile(sSimFileName);
    }
    else if (localStorage.getItem("SessionType") === "Custom") {
        ScenarioType = CUSTOMIZED;
        //get the sim start time 4 digits and create tSimtime
        var sTime = localStorage.getItem("startTime");
        var nHour = Number(sTime.substr(0,2));
        var nMinute = Number(sTime.substr(2,2));
        var nSecond = 0;
        tSimTime = new cMyTime(nHour, nMinute, nSecond);

        //get the scenario winds from the storage
        var sWind = localStorage.getItem("wWind");
        if (sWind) {
            aData = sWind.split(" ");
            var nBrg = Number(aData.shift());
            var nSpd = Number(aData.shift());

        }
        else {
            var nBrg = 90;
            var nSpd = 5;
        }

        LoWind = new cWind(5000, nBrg, nSpd);

        nBrg += Math.round(Math.random() * 90);
        if (nBrg > 360) nBrg -= 360;
        nSpd *= (1+Math.random() * 3);
        MidWind = new cWind(20000, nBrg, nSpd);

        nBrg += Math.round(Math.random() * 90);
        if (nBrg > 360) nBrg -= 360;
        nSpd *= (1+Math.random() * 2);
        HiWind = new cWind(40000, nBrg, nSpd);

        //get the session busyness, length, etc.
        var sBusy = localStorage.getItem("BusyRate");
        aData = sBusy.split(" ");
        numArrivals = Number(aData.shift());
        numDepartures = Number(aData.shift());
        numOverflights = Number(aData.shift());
        numScenarioMinutes = Number (aData.shift());

        //get the pilot response time
        var sRespond = localStorage.getItem("PilotResponse");
        if (sRespond === "AWFUL") {
            PilotResponseTime = AWFUL_RESPONSE;
        }
        else if (sRespond === "SLOW"){
            PilotResponseTime = SLOW_RESPONSE;
        }
        else if (sRespond === "AVG") {
            PilotResponseTime = AVG_RESPONSE;
        }
        else {
            PilotResponseTime = QUICK_RESPONSE;
        }

        //set the flag and load the sector file
        var sFilePath = localStorage.getItem("generationFile");
        iAppStatus = LOADING_GENFILE;
        fLoadFile(sFilePath);
    }
}
//-------------------------------------------------------------------
function fReadyToStartSim() {
    //Display surface winds and sector name in the info bar
    hControlWindow.UpdateLabel("lblWind", "Wind: " + getThree(LoWind.wDirection) + "/" + String(LoWind.wSpeed));
    hControlWindow.UpdateLabel("lblSector", ActiveSector.SectorName);
    //update PTL button to show PTL length
    hControlWindow.UpdateButton("btnPTL", "PTL " + String(PTLDistance));
    hControlWindow.Resize(hControlWindow.GetPaneExtent("ControlOptions"), hControlWindow.Location.H);
    //create aircraft data tags and flight strips
    for (var i=0; i<aAircraft.length; i++ ) {
        aAircraft[i].UpdateDataTag(ctxMap);
        aAircraft[i].myIndex = i;
        hDataboard.CreateStrip(i);
    }
    //Final updates and set flag to start
    Score = new ScoringStructure();
    fUpdateAllAircraft(0);
    fUpdateAircraftDisplayPositions();
    fUpdateDisplay(true);
    fUpdateDataboard();
    fSetupScoring();
    fUpdateScore();
    //open sim control window to show score and controls
    hControlWindow.OpenPane("SimControl");
    hControlWindow.Resize(hControlWindow.GetPaneExtent("SimControl"), hControlWindow.Location.H);
    fAdjustControlWindow();
    //for now select the voice as is:
    Controller = new cPilot(0,1);
    Coordinator = new cPilot(1,1);
    //hide the loading screen
    hLoadingScreen.style.display = "none";
    hControlWindow.Hide();
    hVoiceWindow.Hide();
}
//-------------------------------------------------------------------
function StartSim() {
    hReadyWindow.Hide();
    hControlWindow.Show();
    hVoiceWindow.Show();
    bSimRunning = true;
    fClockStart();
}
//-------------------------------------------------------------------
function fSetupScoring() {
    //figure out how many a/c on board to start
    for (i=0; i<aAircraft.length; i++) {
        if (aAircraft[i].ACstatus === ENROUTE) {
            if (aAircraft[i].bOurControl) Score.ACWorked++
        }
    }
}
//********************************************************************************************************************
//-
//-     INTERFACE functions
//-
//******************************************************************
function fResetWindows() {
    //Set the new screensize
    ScrnSize.x = window.innerWidth;
    ScrnSize.y = window.innerHeight;
    //The underlying map
    cvMap.width = ScrnSize.x;
    cvMap.height = ScrnSize.y;;
    cvMap.top = 0;
    cvMap.left = 0;
    //Windows
    fAdjustControlWindow();
    fAdjustVoiceWindow();
    fAdjustAircraftWindow();
    fUpdateDisplay(true);
    UserMsg.MoveTo((ScrnSize.x - UserMsg.Location.W)/2, UserMsg.Location.y);
}
//-------------------------------------------------------------------
function fAdjustVoiceWindow() {
    hVoiceWindow.MoveTo(ScrnSize.x - hVoiceWindow.Location.W, ScrnSize.y - hVoiceWindow.Location.H);
}
//-------------------------------------------------------------------
function fAdjustControlWindow() {
    var nX = (ScrnSize.x - hControlWindow.Location.W)/2;
    if (nX < (hDataboard.Location.W + 10)) nX = hDataboard.Location.W + 10;
    hControlWindow.MoveTo(nX, 0);
    //Separation 'window
    if ((ScrnSize.x - (hControlWindow.Location.x + hControlWindow.Location.W)) < 200)
        hSeparationWindow.MoveTo(ScrnSize.x - 150, hControlWindow.Location.H + 5)
    else hSeparationWindow.MoveTo(ScrnSize.x - 150, 0);

    //Pause Window
    hPauseWindow.MoveTo(hControlWindow.Location.x, hControlWindow.Location.H + 1);
}
//-------------------------------------------------------------------
function fAdjustAircraftWindow() {
    hAircraftWindow.MoveTo((ScrnSize.x - hAircraftWindow.Location.W)/2, ScrnSize.y - hAircraftWindow.Location.H);
}
//-------------------------------------------------------------------
function fUpdateScore() {
    fUpdateBaseScore();
    Score.TotalScore = Math.round(Score.TotalScore);
    hControlWindow.UpdateLabel("lScoreDisplay", String(Score.TotalScore));
}
//-------------------------------------------------------------------
function fUpdateBaseScore() {
    Score.TotalScore = (Score.DepExitSector * 750) + (Score.OverExitSector * 500) + (Score.ArrLand * 1000);
    Score.TotalScore -= Score.MissedApproach * 200;
    Score.TotalScore -= Score.NoCommTfr * 200;
    //Separation
    Score.TotalScore -= (2000 * Score.TechLoss);
    Score.TotalScore -= (4000 * Score.SepLoss);
    Score.TotalScore -= (Score.ContinuedTechLoss/60 * 500);
    Score.TotalScore -= (Score.ContinuedSepLoss/60 * 1000);
    Score.TotalScore -= Score.WrongAlt * 250;
    Score.TotalScore -= Score.DepMinDelay * 500;
    Score.TotalScore -= Score.Transmission * 20;
    Score.TotalScore -= Score.Pause * 1000;
    Score.TotalScore -= Score.LateHandoff * 250;
    Score.TotalScore -= Score.IBHold * 100;
}
//-------------------------------------------------------------------
function fEndSimulation() {
    var sText;
    fClockStop();
    fUpdateBaseScore();
    //populate the final score window

    with (hFinalScoreWindow) {
        //Handled
        UpdateLabel("txtArrivals", Score.ArrLand);
        UpdateLabel("txtDepartures", Score.DepExitSector);
        UpdateLabel("txtOverflights", Score.OverExitSector);

        //Separation
        sText = String(Score.SepLoss) + " - duration ";
        sText += Math.round(Score.ContinuedSepLoss) + " secs.";
        UpdateLabel("txtSepLoss", sText);
        sText = String(Score.TechLoss) + " - duration ";
        sText += Math.round(Score.ContinuedTechLoss) + " secs.";
        UpdateLabel ("txtTechLoss", sText);
        //Mods
        UpdateLabel("txtMA", Score.MissedApproach);
        UpdateLabel("txtLateComm", Score.NoCommTfr);
        UpdateLabel("txtWrongAlt", Score.WrongAlt);
        UpdateLabel("txtDepDelay", Math.round(Score.DepMinDelay * 6)/10);
        UpdateLabel("txtLateHO", Score.LateHandoff);
        UpdateLabel("txtIBHold", Score.IBHold);
        UpdateLabel("txtPause", Score.Pause);

        console.log("Base Score = " + Score.TotalScore);

        Score.TotalScore += Score.MaxSimultaneousAC * 100;
        UpdateLabel("txtACWorked", Score.ACWorked);

        console.log("Score with AC Count = " + Score.TotalScore);

        if (Score.TotalRunTime > 10) {
            var TfcMod = Score.ACWorked/(Score.TotalRunTime - 5);
            Score.TotalScore *= TfcMod;
            TfcMod = Math.round(TfcMod * 10)/10;
        }
        else {
            TfcMod = 1.0;
        }
        UpdateLabel("txtWorkload", TfcMod);
        UpdateLabel("txtTotalScore", Math.round(Score.TotalScore));
    }

    //hide the other windows
    hControlWindow.Hide();
    hAircraftWindow.Hide();
    hDataboard.Hide();
    hVoiceWindow.Hide();


    //Place the window
    hFinalScoreWindow.MoveTo((ScrnSize.x - hFinalScoreWindow.Location.x)/2, (ScrnSize.y - hFinalScoreWindow.Location.y)/2);
    hFinalScoreWindow.Show();
}
//********************************************************************************************************************
//-
//-     EVENT CAPTURE FUNCTIONS
//-
//******************************************************************
function touch2Mouse(e) {
    var theTouch = e.changedTouches[0];
    var mouseEv;
    switch(e.type)
    {
        case "touchstart": mouseEv="mousedown"; break;
        case "touchend":   mouseEv="mouseup"; break;
        case "touchmove":  mouseEv="mousemove"; break;
        default: return;
    }
    var mouseEvent = document.createEvent("MouseEvent");
    mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);
    theTouch.target.dispatchEvent(mouseEvent);
    e.preventDefault();
}
//-------------------------------------------------------------------
function fMouseDown(event) {
    //console.log("class= " + event.target.className, "||", "id= " + event.target.id, "||", "Owner= ", event.target.Owner);
    if (!event.target.Owner) {
        fNonOwnerEvent(event);
        return;
    }
    var bName = event.target.Owner.Name;
    if (bName.substr(0, 5) === "Strip"){
        fStripClicked(event.target.Owner.Name.substr(5));
        return;
    }
    switch (bName) {
        case "MapTools":
            fProcessMapControlsEvent(event);
            break;
        case "MapOverlays":
            fProcessMapOverlayEvent(event);
            break;
        case "TargetTools":
            fProcessTargetToolEvent(event);
            break;
        case "ControlOptions":
            fProcessOptionsEvent(event);
            break;
        case "SimControl":
            fProcessSimControlEvent(event);
            break;
        case "Interface":
            fProcessInterfaceEvent(event);
            break;
        case "Scoring":
            fProcessScoringEvent(event);
            break;
        case "TrgtTool":
        case "MainMenu":
            fProcessMenuClick(event);
            break;
        case "AC-RQST":
        case "AC-ACCEPT":
        case "AC-OVER":
        case "AC-ARR":
        case "AC-APPON":
        case "AC-APPOFF":
            fProcessACWindowAction(event);
            break;
        case "ApproachClx":
        case "AltitudeClx":
        case "SpeedClx":
        case "VectorClx":
        case "HoldClx":
            fProcessClearanceCommand(event);
            break;
        case "DirectClx":
            fProcessDirectClearance(event);
            break;
        case "voicewindowHeader":
            fVoiceButtonEvent(event);
            break;
        case "PausePane":
            fPausePaneEvent(event);
            break;
        case "btnPane":
            FinalQuit();
            break;
        case "ReadyPane":
            fReadyPaneClick(event);
            break;
    }
}
//-------------------------------------------------------------------
function fMouseWheel(event) {
    if (event.deltaY < 0) {
        nCurrentZoom *= 0.95;
        if (nCurrentZoom < MIN_ZOOM) nCurrentZoom = MIN_ZOOM;
    }
    else {
        nCurrentZoom *=1.05;
        if (nCurrentZoom > MAX_ZOOM) nCurrentZoom = MAX_ZOOM;
    }
    fUpdateDisplay(true);
}
//-------------------------------------------------------------------
function fNonOwnerEvent(event){
    switch(event.target.className) {
        case "MainMap":
            if (!bSimRunning) return;
            if (!bSelectingRouteFixes)fCloseOpenDialogs();
            fMapMouseDown(event);
            break;
    }
}
//-------------------------------------------------------------------
function fProcessMapControlsEvent(event) {
    CloseAndClean();
    switch(event.target.id) {
        case "btnZoomIn":
            iMapAction = ZOOMING;
            break;
        case "btnZoomOut":
            iMapAction = UNZOOMING;
            break;
        case "btnScrollUp":
            iMapAction = SCROLLUP;
            break;
        case "btnScrollDown":
            iMapAction = SCROLLDOWN;
            break;
        case "btnScrollLeft":
            iMapAction = SCROLLLEFT;
            break;
        case "btnScrollRight":
            iMapAction = SCROLLRIGHT;
            break;
        case "btnGrid":
            bDrawGrid = !bDrawGrid;
            fUpdateDisplay(false);
            break;
        case "btnReset":
            pCurrentMapCentre.Lat = ActiveSector.pDefaultMapCentre.Lat;
            pCurrentMapCentre.Long = ActiveSector.pDefaultMapCentre.Long;
            nCurrentZoom = ActiveSector.nDefaultZoom;
            fUpdateDisplay(true);
            break;
    }
    if (iMapAction) fInitiateMapMove();

}
//-------------------------------------------------------------------
function fProcessMapOverlayEvent(event) {
    CloseAndClean();
    switch(event.target.id) {
        case "btnOverlay1":
            bShowOverlay1 = !bShowOverlay1;
            event.target.hID.Toggle();
            fUpdateDisplay(false);
            break;
        case "btnOverlay2":
            bShowOverlay2 = !bShowOverlay2;
            event.target.hID.Toggle();
            fUpdateDisplay(false);
            break;
        case "btnOverlay3":
            bShowOverlay3 = !bShowOverlay3;
            event.target.hID.Toggle();
            fUpdateDisplay(false);
            break;
        case "btnOverlay4":
            bShowOverlay4 = !bShowOverlay4;
            event.target.hID.Toggle();
            fUpdateDisplay(false);
            break;
        case "btnFixName":
            bShowAllFixNames = !bShowAllFixNames;
            event.target.hID.Toggle();
            fUpdateDisplay(true);
            break;
        case "btnHalo":
            bShowAllHalo = !bShowAllHalo;
            event.target.hID.Toggle();
            fUpdateDisplay(true);
            break;
    }
}
//-------------------------------------------------------------------
function fProcessTargetToolEvent(event) {
    CloseAndClean();
    switch (event.target.id) {
        case "btnPTL":
            bShowAllPTL = !bShowAllPTL;
            event.target.hID.Toggle();
            fUpdateDisplay(false);
            break;
        case "btnPTLUp":
            PTLDistance += 1;
            if (PTLDistance > 20) PTLDistance = 20;
            hControlWindow.UpdateButton("btnPTL", "PTL " + String(PTLDistance));
            fUpdateDisplay(false);
            break;
        case "btnPTLDown":

            PTLDistance -= 1;
            if (PTLDistance < 1) PTLDistance = 1;
            hControlWindow.UpdateButton("btnPTL", "PTL " + String(PTLDistance));
            fUpdateDisplay(false);
            break;
        case "btnRBL":
            bSelectingRBL1 = true;
            break;
        case "btnRBLClear":

            while (aRBL.length > 0) aRBL.shift();
            fUpdateDisplay(false);
            break;
    }
}
//-------------------------------------------------------------------
function fProcessOptionsEvent(event) {
    CloseAndClean();
    hControlWindow.ClosePane("SimControl", "Interface");
    switch (event.target.id) {
        case "btnSimControl":
            hControlWindow.OpenPane("SimControl");
            hControlWindow.Resize(hControlWindow.GetPaneExtent("SimControl"), hControlWindow.Location.H);
            fAdjustControlWindow();
            break;
        case "btnInterface":
            hControlWindow.OpenPane("Interface");
            hControlWindow.Resize(hControlWindow.GetPaneExtent("Interface"), hControlWindow.Location.H);
            fAdjustControlWindow();
            break;
    }
    fAdjustVoiceWindow();

}
//-------------------------------------------------------------------
function fProcessSimControlEvent(event) {
    switch(event.target.id) {
        case "btnSimStop":
            if (bSimRunning) {
                fClockStop();
                bSimRunning = false;
                Score.Pause++;
                hPauseWindow.Show();
            }
            break;
        case "btnCloseSimControl":
            hControlWindow.ClosePane("SimControl");
            hControlWindow.Resize(hControlWindow.GetPaneExtent("ControlOptions"), hControlWindow.Location.H);
            fAdjustControlWindow();
            break;
        case "btnEndSim2":
            fEndSimulation();
            break;
    }
}
//-------------------------------------------------------------------
function fProcessInterfaceEvent(event) {
    CloseAndClean();
    switch(event.target.id) {
        case "btnVolumeUp":
            fVolumeChanged(true);
            break;
        case "btnVolumeDown":
            fVolumeChanged(false);
            break;
        case "btnTagUp":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            nTagSize++;
            if (nTagSize > 28) nTagSize = 28;
            fUpdateDisplay(false);
            break;
        case "btnTagDown":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            nTagSize--;
            if (nTagSize < 9) nTagSize = 9;
            fUpdateDisplay(false);
            break;
        case "btnTargetUp":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            nTargetSize++;
            if (nTargetSize > 28) nTargetSize = 28;
            fUpdateDisplay(false);
            break;
        case "btnTargetDown":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            nTargetSize--;
            if (nTargetSize < 9) nTargetSize = 9;
            fUpdateDisplay(false);
            break;
        case "btnFixUp":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            nFixSize++;
            if (nFixSize > 28) nFixSize = 28;
            fUpdateDisplay(false);
            break;
        case "btnFixDown":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            nFixSize--;
            if (nFixSize < 9) nFixSize = 9;
            fUpdateDisplay(false);
            break;
        case "btnDotsUp":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            if (nNumTrailDots < 40) {
                nNumTrailDots++;
                for (var i = 0; i < aAircraft.length; i++) {aAircraft[i].aTrailDots.push(aAircraft[i].CurrentPosition.V.vCopy());}
            }
            break;
        case "btnDotsDown":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            if (nNumTrailDots > 1) {
                nNumTrailDots--;
                for (var i = 0; i < aAircraft.length; i++) {aAircraft[i].aTrailDots.pop();}
            }
            break;
        case "btnCloseInterface":
            hControlWindow.ClosePane("Interface");
            hControlWindow.Resize(hControlWindow.GetPaneExtent("ControlOptions"), hControlWindow.Location.H);
            fAdjustControlWindow();
            break;
        case "chkRoute":
            bAutoDisplayRoute =  !document.getElementById("chkRoute").checked;
            fUpdateDisplay(false);
            break;
        case "btnResetSound":
            console.log("Sound Reset");
            voiceSynth = null;
            //setup to load the voices
            voiceSynth = window.speechSynthesis;
            break;
    }
}
//-------------------------------------------------------------------
function fProcessMenuClick(event) {
    if (!CurrentAC)return;
    sActions = event.target.id;
    switch (sActions) {
        case "mnuPTL":
        case "abtnPTL":
            CurrentAC.bShowPTL = !CurrentAC.bShowPTL;
            fUpdateDisplay(false);
            fHideACMenu();
            break;
        case "mnuHALO":
        case "abtnHALO":
            CurrentAC.bShowHalo = !CurrentAC.bShowHalo;
            fUpdateDisplay(false);
            fHideACMenu();
            break;
        case "mnuRTE":
        case "abtnRTE":
            CurrentAC.bDisplayRoute = !CurrentAC.bDisplayRoute;
            fUpdateDisplay(false);
            fHideACMenu();
            break;
        case "mnuAccept":
            CurrentAC.AcceptHandoff();
            Score.ACWorked++;
            fUpdateDisplay(false);
            fShowAircraftWindow();
            fHideACMenu();
            break;
        case "mnuHandoff":
           fCloseOpenDialogs();
            fHandoffAircraftExternal();
            break;
        case "mnuTransfer":
            fCloseOpenDialogs();
            fTransferCommToTower();
            break;
        case "mnuCancel":
            fCancelApproachClearance();
            break;
        case "mnuApproach":
            fShowClearanceWindow(SENDERMENU, APPROACHCLX);
            break;
        case "mnuAltitude":
            fShowClearanceWindow(SENDERMENU, ALTITUDECLX);
            break;
        case "mnuSpeed":
            fShowClearanceWindow(SENDERMENU, SPEEDCLX);
            break;
        case "mnuVector":
            fShowClearanceWindow(SENDERMENU, VECTORCLX);
            break;
        case "mnuHold":
            fShowClearanceWindow(SENDERMENU, HOLDCLX);
            break;
        case "mnuDirect":
            fShowClearanceWindow(SENDERMENU, DIRECTCLX);
            break;
    }
}
//-------------------------------------------------------------------
function fProcessACWindowAction(event) {
    CloseAndClean();
    sActions = event.target.hID.Command;
    switch (sActions) {
        case "ReleaseAircraft":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            //Departure has been released
            CurrentAC.ReleaseAircraft();
            Score.ACWorked++;
            //determine departure delay
            Score.DepMinDelay += (nowTime - CurrentAC.ReleaseTime)/60000;
            //add to speech and text queue
            var sPhrase = CurrentAC.RadioTelephony + " Released";
            Speak(Controller, sPhrase, PhraseDelivered);
            sPhrase = CurrentAC.ACIdent + " Released";
            fAddControllerVoiceLogEntry(sPhrase);
            fShowAircraftWindow();
            fUpdateDataboard();
            break;
        case "AcceptHandoff":
            CurrentAC.AcceptHandoff();
            Score.ACWorked++;
            fUpdateDisplay(false);
            fShowAircraftWindow();
            break;
        case "HandoffExternal":
            fHandoffAircraftExternal();
            break;
        case "CommToTower":
            fTransferCommToTower();
            break;
        case "ActivateAPPPanel":
            fShowClearanceWindow(SENDERPANEL, APPROACHCLX);
            break;
        case "CancelApproach":
            fCancelApproachClearance();
            break;
        case "ActivateALTPanel":
            fShowClearanceWindow(SENDERPANEL, ALTITUDECLX);
            break;
        case "ActivateSPDPanel":
            fShowClearanceWindow(SENDERPANEL, SPEEDCLX);
            break;
        case "ActivateHDGPanel":
            fShowClearanceWindow(SENDERPANEL, VECTORCLX);
            break;
        case "ActivateHOLDPanel":
            fShowClearanceWindow(SENDERPANEL, HOLDCLX);
            break;
        case "ActivateDCTPanel":
            fShowClearanceWindow(SENDERPANEL, DIRECTCLX);

    }
}
//-------------------------------------------------------------------
function fProcessClearanceCommand(event) {
    switch(event.target.id) {
        case "btnApproachClx":
            CloseAndClean();
            fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_APPROACH, "");
            break;
        case "bAltUp10000":
            fAltClxChanged(100);
            break;
        case "bAltUp1000":
            fAltClxChanged(10);
            break;
        case "bAltUp100":
            fAltClxChanged(1);
            break;
        case "bAltDown10000":
            fAltClxChanged(-100);
            break;
        case "bAltDown1000":
            fAltClxChanged(-10);
            break;
        case "bAltDown100":
            fAltClxChanged(-1);
            break;
        case "btnAltSubmit":
            fCloseOpenDialogs();
            fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_ALTITUDE,  WorkingAltitude);
            break;
        case "btnSpdUp":
            fSpdClxChanged(10);
            break;
        case "btnSpdDown":
            fSpdClxChanged(-10);
            break;
        case "btnSpdSubmit":
            fCloseOpenDialogs();
            fIssueClearance(fGetAircraftIndex(SelectedAircraft), ASSIGN_SPD, WorkingSpeed);
            break;
        case "btnResumeSpd":
            fCloseOpenDialogs();
            if (CurrentAC.bAssignedSpeed) fIssueClearance(fGetAircraftIndex(SelectedAircraft), CANCEL_SPD, "");
            break;
        case "bHdgUp100":
            fHdgClxChanged (100);
            break;
        case "bHdgUp10":
            fHdgClxChanged (10);
            break;
        case "bHdgUp5":
            fHdgClxChanged (5);
            break;
        case "bHdgDown100":
            fHdgClxChanged (-100);
            break;
        case "bHdgDown10":
            fHdgClxChanged (-10);
            break;
        case "bHdgDown5":
            fHdgClxChanged (-5);
            break;
        case "btnHdgSubmit":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            if (hClearanceWindow.IsRadioChecked("rdoTR")) {
                fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_HDG_RIGHT,  WorkingHeading);
            }
            else if (hClearanceWindow.IsRadioChecked("rdoTL")) {
                fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_HDG_LEFT,  WorkingHeading);
            }
            break;
        case "btnPresentHdg":
            fCloseOpenDialogs();
            fClearRoutingChanges();
            fClearHoldingChanges();
            fClearRBLChanges();
            fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_HDG_STRAIGHT,  WorkingHeading);
            break;
        case "btnHoldHere":
            CloseAndClean();
            fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_HOLDHERE, "");
            break;
        case "btnHoldFix":
            bSelectingHoldFix = true;
            break;
    }
}
//-------------------------------------------------------------------
function fProcessDirectClearance(event) {
    var FixIndex;
    //figure which fix was clicked...
    var sFixName = event.target.hID.ButtonText;

    if (sFixName === "CANCEL") {
        CloseAndClean();
        fUpdateDisplay(false);
        return;
    };
    //get the index from the aircraft route array
    for (var i=0; i<CurrentAC.aRoute.length; i++) {
        if (CurrentAC.aRoute[i].LocIdent === sFixName) {
            FixIndex = i;
            break;
        }
    }
    aDirectRoutePoints.push(new StructRoutePoint(FIXINROUTE, FixIndex));
    fProcessRouteAssignment();
    CloseAndClean();
}
//-------------------------------------------------------------------
function fVoiceButtonEvent(event) {
    CloseAndClean();
    sActions = event.target.id;
    switch (sActions) {
        //control panel buttons
        case "bVoiceClear":
            hVoiceWindow.ClearPaneText("CommLog");
            break;
        case "bVoiceMore":
            fResizeVoicePanel(true);
            break;
        case "bVoiceLess":;
            fClearRBLChanges();
            fResizeVoicePanel(false);
            break;
    }
}
//-------------------------------------------------------------------
function fPausePaneEvent(event){
    switch (event.target.id) {
        case "btnRestartSim":
            if (!bSimRunning) {
                fClockStart();
                bSimRunning = true;
                hPauseWindow.Hide();
            }
            break;
        case "btnEndSim":
            fEndSimulation();
            break;
        case "btnDebugTick":
            bSimRunning = true;
            fDebugClockMove(nRadarSpinTime/1000);
            break;
    }
}
//-------------------------------------------------------------------
function fResizeVoicePanel (bMore) {
    var nChange;
    if (bMore) nChange = 50;
    else nChange = -50;

    nHeight = hVoiceWindow.GetPaneHeight("CommLog");
    nHeight += nChange;

    if (nHeight < 0) nHeight = 0;
    if (nHeight > 500) nHeight = 500;
    hVoiceWindow.Resize(hVoiceWindow.Location.W, 41 + nHeight);
    hVoiceWindow.ResizePane("CommLog", hVoiceWindow.Location.W, nHeight);
    hVoiceWindow.MoveTo(ScrnSize.x - hVoiceWindow.Location.W, ScrnSize.y - hVoiceWindow.Location.H);

}
//-------------------------------------------------------------------
function fStripClicked (iAC){
    if (!hDataboard.aStrips[iAC].FlagAcknowledged){
        hDataboard.AcknowledgeToggle(iAC);
        fUpdateDataboard();
    }
    CloseAndClean();
    fSelectAircraft(iAC);
}
//-------------------------------------------------------------------
function fMapMouseDown (event)  {
    var DisplayMenuPosition;
    //get location of click
    var clickPosition = new Vector2d(event.clientX, event.clientY);
    //------------------------------------------------------------------
    //Identify if a DATATAG has been clicked
    //------------------------------------------------------------------
    for (i=0; i<aAircraft.length; i++ ) {
        if (!aAircraft[i].bVisible) continue;
        var xLeft = aAircraft[i].CurrentPosition.D.x + aAircraft[i].Tag.DrawPos.x;
        var xRight = xLeft + aAircraft[i].Tag.iWidth;
        var yTop = aAircraft[i].CurrentPosition.D.y + aAircraft[i].Tag.DrawPos.y;
        var yBottom = yTop + aAircraft[i].Tag.iHeight;
        if (clickPosition.x >= xLeft && clickPosition.x <= xRight
            && clickPosition.y >= yTop && clickPosition.y <= yBottom) {
            if (!bSimRunning) return;
            //Means we've clicked in this datatag
            //hide direct route panel if open
            fClearRoutingChanges();
            fClearHoldingChanges();
            //Determine if RMB or LMB
            if (event.button === 0) { //LMB
                fSelectAircraft(i);
                if (aAircraft[i].bIBHO) {
                    //if an aircraft is flashing for a handoff, take handoff
                    aAircraft[i].AcceptHandoff();
                    Score.ACWorked++;
                }
                //Determine if part of a RBL click.
                if (bSelectingRBL1) {
                    tempRBL1 = new cRBLEnd(RBL_AIRCRAFT, i);
                    bSelectingRBL1 = false;
                    bSelectingRBL2 = true;

                }
                else if (bSelectingRBL2) {
                    aRBL.push(new cRBLEnd(tempRBL1.pType, tempRBL1.pDetails));
                    aRBL.push(new cRBLEnd(RBL_AIRCRAFT, i));
                    fClearRBLChanges();
                    fUpdateDisplay(false);
                }
                //Left Mouse Button - drag the tag
                iMapAction = DRAGGINGTAG;
                vMousePosition = clickPosition;
                bAircraftSelected = true;
                SelectedAircraft = aAircraft[i].TransponderCode;
                document.addEventListener("mousemove", fMouseMove, false);
                fUpdateDisplay(false);
                fShowAircraftWindow();
                return;
            }
            else if (event.button === 2) { //RMB
                fClearRBLChanges();
                bAircraftSelected = true;
                SelectedAircraft = aAircraft[i].TransponderCode;
                //show the context sensitive menu for the aircraft
                fSelectAircraft(i);
                DisplayMenuPosition = new Vector2d(aAircraft[i].CurrentPosition.D.x +aAircraft[i].Tag.DrawPos.x +
                    aAircraft[i].Tag.iWidth + 10, aAircraft[i].CurrentPosition.D.y + aAircraft[i].Tag.DrawPos.y -3);
                fShowACMenu(DisplayMenuPosition);
                fUpdateDisplay(false);
                fShowAircraftWindow();
                return;
            }
        }
    }
    //------------------------------------------------------------------
    //Identify if a AC TARGET has been clicked
    //------------------------------------------------------------------
    for (i=0; i<aAircraft.length; i++ ) {
        if (!aAircraft[i].bVisible) continue;
        if (fClickedInTargetZone(clickPosition, aAircraft[i].CurrentPosition.D, nTargetSize)) {
            if (!bSimRunning) return;
            //remove routing panel if visible
            fCloseOpenDialogs();
            fSelectAircraft(i);
            //we've clicked an aircraft
            if (event.button === 0) { //LMB
                bAircraftSelected = true;
                SelectedAircraft = aAircraft[i].TransponderCode;
                //Determine if part of a RBL click.
                if (bSelectingRBL1) {
                    tempRBL1 = new cRBLEnd(RBL_AIRCRAFT, i);
                    bSelectingRBL1 = false;
                    bSelectingRBL2 = true;
                }
                else if (bSelectingRBL2) {
                    aRBL.push(new cRBLEnd(tempRBL1.pType, tempRBL1.pDetails));
                    aRBL.push(new cRBLEnd(RBL_AIRCRAFT, i));
                    fClearRBLChanges();
                    fUpdateDisplay(false);
                }
                //if it is a left click, we'll (for now) just show that it was clicked in message bar
                if (aAircraft[i].bIBHO) {
                    //if an aircraft is flashing for a handoff, take handoff
                    aAircraft[i].AcceptHandoff();
                    Score.ACWorked++;
                }
                //hide or show the tag for an aircraft not our control
                if (!aAircraft[i].bOurControl) {
                    aAircraft[i].bShowTag = !aAircraft[i].bShowTag;
                }
                fUpdateDisplay(false);
                fShowAircraftWindow();
            }
            else if (event.button === 2) { //RMB'
                fClearRBLChanges();
                //show the context sensitive menu for the aircraft
                bAircraftSelected = true;
                SelectedAircraft = aAircraft[i].TransponderCode;
                DisplayMenuPosition = new Vector2d(aAircraft[i].CurrentPosition.D.x +aAircraft[i].Tag.DrawPos.x +
                    aAircraft[i].Tag.iWidth + 10, aAircraft[i].CurrentPosition.D.y + aAircraft[i].Tag.DrawPos.y -3);
                fShowACMenu(DisplayMenuPosition);
                fUpdateDisplay(false);
                fShowAircraftWindow();
            }
            return;
        }
    }
    //------------------------------------------------------------------
    //Identify if a FIX has been clicked
    //------------------------------------------------------------------
    for (i=0; i<aFixes.length; i++) {
        if (fClickedInTargetZone(clickPosition, aFixes[i].FixLoc.D, nFixSize)) {
            //Determine if we've clicked in the fix and are going direct, or just clicked
            //Determine if part of a RBL click.
            if (bSelectingRBL1) {
                tempRBL1 = new cRBLEnd(RBL_FIX, i);
                bSelectingRBL1 = false;
                bSelectingRBL2 = true;
            }
            else if (bSelectingRBL2) {
                aRBL.push(new cRBLEnd(tempRBL1.pType, tempRBL1.pDetails));
                aRBL.push(new cRBLEnd(RBL_FIX, i));
                fClearRBLChanges();
                fUpdateDisplay(false);
            }
            else if (bSelectingRouteFixes) {
                if (event.button === 2) {
                    CloseAndClean();
                    fUpdateDisplay(false);
                    return;
                }
                var nF = aAircraft[fGetAircraftIndex(SelectedAircraft)].FixInRoute(i);
                if (nF !== -100) {
                    aDirectRoutePoints.push(new StructRoutePoint(FIXINROUTE, nF));
                    fProcessRouteAssignment();
                    CloseAndClean();
                }
                else {
                    aDirectRoutePoints.push(new StructRoutePoint(FIX, i));
                    fUpdateDisplay(false);
                }
            }
            else if(bSelectingHoldFix) {
                //clicked a fix to hold at:
                fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_HOLDFIX, i);
                fClearHoldingChanges();
            }
            else {
                aFixes[i].DisplayFixName = !aFixes[i].DisplayFixName;
                fDeselectAircraft();
            }
            return;
        }
    }


    //------------------------------------------------------------------
    //Map clicked, so show Lat/Long
    //------------------------------------------------------------------
    var clickPolar = Display2Polar(event.clientX, event.clientY, ScrnSize.x, ScrnSize.y,
        nCurrentZoom, pCurrentMapCentre);
    var dLat = convertDDToDM(clickPolar.Lat);
    var dLong = convertDDToDM(clickPolar.Long);
    if (dLat.deg < 0) var sN = "S";
    else sN = "N";
    if (dLong.deg < 0) var sW = "E";
    else sW = "W";

    var s1 = String(dLat.deg);
    if (s1.length < 2) s1 = "0" + s1;
    var s2 = String(dLat.min);
    if (s2.length < 2) s2 = "0" + s2;
    var s3 = String(dLong.deg);
    if (s3.length < 2) s3 = "0" + s3;
    var s4 = String(dLong.min);
    if (s4.length < 2) s4 = "0" + s4;
    var sMsg = s1 + s2 + sN + s3 + s4 + sW;
    fSendUserMessage(sMsg, MSGLOW);
    //process a map click as part of assigning a route
    if (bSelectingRouteFixes) {
        if (event.button === 2) {
            CloseAndClean();
            fUpdateDisplay(false);
            return;
        }
        var clickLoc = new cLoc(sMsg, LatLong2Verbal(sMsg), POLAR, clickPolar);
        aDirectRoutePoints.push(new StructRoutePoint(LATLONG, clickLoc));
        fUpdateDisplay(false);
        return;
    }
    if (bSelectingRBL1) {
        tempRBL1 = new cRBLEnd(RBL_MAPPOINT, clickPolar.getTriple());
        bSelectingRBL1 = false;
        bSelectingRBL2 = true;
        return;
    }
    else if (bSelectingRBL2) {
        aRBL.push(new cRBLEnd(tempRBL1.pType, tempRBL1.pDetails));
        aRBL.push(new cRBLEnd(RBL_MAPPOINT, clickPolar.getTriple()));
        fClearRBLChanges();
        fUpdateDisplay(false);
        return;
    }
    //If no click in anything above, then we've just clicked a location on the map
    fClearRoutingChanges();
    fClearHoldingChanges();
    fDeselectAircraft();
}
//-------------------------------------------------------------------
function fMouseUp(event){
    if (iMapAction === DRAGGINGTAG) {
        document.removeEventListener("mousemove", fMouseMove);
        iMapAction = NOACTION;
        return;
    }
    if (iMapAction) fEndMapMove();
}
//-------------------------------------------------------------------
function fMouseMove(event) {
    var clickPosition = new Vector2d(event.clientX, event.clientY);
    var thisAircraft = fGetAircraftIndex(SelectedAircraft);

    aAircraft[thisAircraft].Tag.DrawPos.x += (clickPosition.x - vMousePosition.x);
    aAircraft[thisAircraft].Tag.DrawPos.y += (clickPosition.y - vMousePosition.y);

    //ADD Code here for if mouse leaves the window

    fUpdateDisplay(false);
    vMousePosition = clickPosition;
}
//-------------------------------------------------------------------
function noscroll() {
    window.scrollTo(0,0);
}
//-------------------------------------------------------------------
function FinalQuit() {
    window.location.href = 'selector.html';

}
//-------------------------------------------------------------------
function fReadyPaneClick(event) {
    if (event.target.id === "btnStartup") StartSim();
}

//*********************************************************************************************************************
//-
//-     DRAWING FUNCTIONS
//-
//******************************************************************
function fUpdateDisplay(bMapMoved) {

    if (!bSectorLoaded) {return;}
    if (bMapMoved) {
        fUpdateMapDisplayPositions()
    }
    fDrawSector();
    fUpdateAircraftDisplayPositions();
    fDrawAircraft();
    fDrawSepIssues();
}
//-------------------------------------------------------------------
function fUpdateMapDisplayPositions() {
    //Update the main sector boundary
    for (var i=0; i<ActiveSector.aVertices.length; i++) {
        ActiveSector.aVertices[i].D = ActiveSector.aVertices[i].P.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
    }
    if(!ActiveSector.bSectorPoly) ActiveSector.DisplayRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, ActiveSector.nRadius);

    //Update other boundaries
    for (var i=0; i< aBoundaries.length; i++) {
        for (var j=0; j< aBoundaries[i].aVertices.length; j++) {
            aBoundaries[i].aVertices[j].D = aBoundaries[i].aVertices[j].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        }
    }
    //update the overlays
    for (var i=0; i< aOverlay1.length; i++) {
        for (var j=0; j< aOverlay1[i].aVertices.length; j++) {
            aOverlay1[i].aVertices[j].D = aOverlay1[i].aVertices[j].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        }
    }
    for (var i=0; i< aOverlay2.length; i++) {
        for (var j=0; j< aOverlay2[i].aVertices.length; j++) {
            aOverlay2[i].aVertices[j].D = aOverlay2[i].aVertices[j].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        }
    }
    for (var i=0; i< aOverlay3.length; i++) {
        for (var j=0; j< aOverlay3[i].aVertices.length; j++) {
            aOverlay3[i].aVertices[j].D = aOverlay3[i].aVertices[j].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        }
    }
    for (var i=0; i< aOverlay4.length; i++) {
        for (var j=0; j< aOverlay4[i].aVertices.length; j++) {
            aOverlay4[i].aVertices[j].D = aOverlay4[i].aVertices[j].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        }
    }


    //Update the fixes
    for (var i=0; i<aFixes.length; i++) {
        aFixes[i].FixLoc.D = aFixes[i].FixLoc.V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
    }//end for
    //update the airports
    for (var i=0; i<aAirports.length; i++) {
        aAirports[i].AirportLoc.D = aAirports[i].AirportLoc.V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        if (!aAirports[i].bInSector)continue;
        for (var j=0; j<aAirports[i].aRunwayEnds.length; j++) {
            aAirports[i].aRunwayEnds[j].D = aAirports[i].aRunwayEnds[j].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        }
    }
}
//-------------------------------------------------------------------
function fUpdateAircraftDisplayPositions () {
    for (var i=0; i<aAircraft.length; i++) {
        if (aAircraft[i].ACstatus === FINISHED) continue;
        aAircraft[i].CurrentPosition.D = aAircraft[i].CurrentPosition.V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
    }
}
//-------------------------------------------------------------------
function fDrawSector() {
    var DrawPos, nRadius, i;
    //This function draws the map based on the settings
    //First, clear the map
    ctxMap.clearRect(0,0,ScrnSize.x, ScrnSize.y);
    //Paint the map background
    ctxMap.fillStyle = color_BACGKGROUND;
    ctxMap.fillRect(0,0,ScrnSize.x, ScrnSize.y);
    //Draw the grid if selected
    if (bDrawGrid)fDrawGrid();
    //this function draws the sector to the map screen.
    //Draw the sector boundary
    ctxMap.lineWidth = 1;
    ctxMap.strokeStyle = color_BOUNDARY;
    ctxMap.fillStyle = color_BOUNDARYFILL;
    if (ActiveSector.bSectorPoly) {
        DrawPos = ActiveSector.aVertices[0].D;
        ctxMap.beginPath();
        ctxMap.moveTo(DrawPos.x, DrawPos.y);
        for (i=1; i< ActiveSector.aVertices.length; i++) {
            DrawPos = ActiveSector.aVertices[i].D;
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
        }
        DrawPos = ActiveSector.aVertices[0].D;
        ctxMap.lineTo(DrawPos.x, DrawPos.y);
        ctxMap.stroke();
        ctxMap.fill();
    }
    else {
        //the boundary is a circle
        DrawPos = ActiveSector.aVertices[0].D;
        ctxMap.beginPath();
        ctxMap.arc(DrawPos.x, DrawPos.y, ActiveSector.DisplayRadius, 0, 6.283);
        ctxMap.stroke();
        ctxMap.fill();
    }

    //Draw the airways on the canvas
    for (i=0; i<aAirways.length; i++) {
        ctxMap.lineWidth = 1;
        ctxMap.strokeStyle = color_AIRWAY;
        DrawPos = aFixes[aAirways[i].aFixIndex[0]].FixLoc.D;
        ctxMap.beginPath();
        ctxMap.moveTo(DrawPos.x, DrawPos.y);
        for (var j=1; j<aAirways[i].aFixIndex.length; j++) {
            DrawPos = aFixes[aAirways[i].aFixIndex[j]].FixLoc.D;
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
            ctxMap.stroke();
        }//end for j
    }//end for i

    //Draw the Boundaries on the canvas
    for (var i=0; i< aBoundaries.length; i++) {
        ctxMap.lineWidth = 1;
        ctxMap.strokeStyle = aBoundaries[i].nColor;
        if (aBoundaries[i].sType === "C") {
            DrawPos = aBoundaries[i].aVertices[0].D;
            nRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, Number(aBoundaries[i].aVertices[1].LocIdent));
            ctxMap.beginPath();
            ctxMap.arc(DrawPos.x, DrawPos.y, nRadius, 0, 6.283);
            ctxMap.stroke();
        }//end if
        else {
            DrawPos = aBoundaries[i].aVertices[0].D;
            ctxMap.beginPath();
            ctxMap.moveTo(DrawPos.x, DrawPos.y);
            for (var j=1; j<aBoundaries[i].aVertices.length; j++) {
                DrawPos = aBoundaries[i].aVertices[j].D;
                ctxMap.lineTo(DrawPos.x, DrawPos.y);
                ctxMap.stroke();
            }//end for j
        }//end else if
    }//end for i

    //Draw the overlays
    if (bShowOverlay1) {
        for (var i=0; i< aOverlay1.length; i++) {
            ctxMap.lineWidth = 1;
            ctxMap.strokeStyle = aOverlay1[i].nColor;
            if (aOverlay1[i].sType === "C") {
                DrawPos = aOverlay1[i].aVertices[0].D;
                nRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, Number(aOverlay1[i].aVertices[1].LocIdent));
                ctxMap.beginPath();
                ctxMap.arc(DrawPos.x, DrawPos.y, nRadius, 0, 6.283);
                ctxMap.stroke();
            }//end if
            else {
                DrawPos = aOverlay1[i].aVertices[0].D;
                ctxMap.beginPath();
                ctxMap.moveTo(DrawPos.x, DrawPos.y);
                for (var j=1; j<aOverlay1[i].aVertices.length; j++) {
                    DrawPos = aOverlay1[i].aVertices[j].D;
                    ctxMap.lineTo(DrawPos.x, DrawPos.y);
                    ctxMap.stroke();
                }//end for j
            }//end else if
        }//end for i
    }

    if (bShowOverlay2) {
        for (var i=0; i< aOverlay2.length; i++) {
            ctxMap.lineWidth = 1;
            ctxMap.strokeStyle = aOverlay2[i].nColor;
            if (aOverlay2[i].sType === "C") {
                DrawPos = aOverlay2[i].aVertices[0].D;
                nRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, Number(aOverlay2[i].aVertices[1].LocIdent));
                ctxMap.beginPath();
                ctxMap.arc(DrawPos.x, DrawPos.y, nRadius, 0, 6.283);
                ctxMap.stroke();
            }//end if
            else {
                DrawPos = aOverlay2[i].aVertices[0].D;
                ctxMap.beginPath();
                ctxMap.moveTo(DrawPos.x, DrawPos.y);
                for (var j=1; j<aOverlay2[i].aVertices.length; j++) {
                    DrawPos = aOverlay2[i].aVertices[j].D;
                    ctxMap.lineTo(DrawPos.x, DrawPos.y);
                    ctxMap.stroke();
                }//end for j
            }//end else if
        }//end for i
    }

    if (bShowOverlay3) {
        for (var i=0; i< aOverlay3.length; i++) {
            ctxMap.lineWidth = 1;
            ctxMap.strokeStyle = aOverlay3[i].nColor;
            if (aOverlay3[i].sType === "C") {
                DrawPos = aOverlay3[i].aVertices[0].D;
                nRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, Number(aOverlay3[i].aVertices[1].LocIdent));
                ctxMap.beginPath();
                ctxMap.arc(DrawPos.x, DrawPos.y, nRadius, 0, 6.283);
                ctxMap.stroke();
            }//end if
            else {
                DrawPos = aOverlay3[i].aVertices[0].D;
                ctxMap.beginPath();
                ctxMap.moveTo(DrawPos.x, DrawPos.y);
                for (var j=1; j<aOverlay3[i].aVertices.length; j++) {
                    DrawPos = aOverlay3[i].aVertices[j].D;
                    ctxMap.lineTo(DrawPos.x, DrawPos.y);
                    ctxMap.stroke();
                }//end for j
            }//end else if
        }//end for i

        if (bShowOverlay4) {
            for (var i=0; i< aOverlay4.length; i++) {
                ctxMap.lineWidth = 1;
                ctxMap.strokeStyle = aOverlay4[i].nColor;
                if (aOverlay4[i].sType === "C") {
                    DrawPos = aOverlay4[i].aVertices[0].D;
                    nRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, Number(aOverlay4[i].aVertices[1].LocIdent));
                    ctxMap.beginPath();
                    ctxMap.arc(DrawPos.x, DrawPos.y, nRadius, 0, 6.283);
                    ctxMap.stroke();
                }//end if
                else {
                    DrawPos = aOverlay4[i].aVertices[0].D;
                    ctxMap.beginPath();
                    ctxMap.moveTo(DrawPos.x, DrawPos.y);
                    for (var j=1; j<aOverlay4[i].aVertices.length; j++) {
                        DrawPos = aOverlay4[i].aVertices[j].D;
                        ctxMap.lineTo(DrawPos.x, DrawPos.y);
                        ctxMap.stroke();
                    }//end for j
                }//end else if
            }//end for i
        }
    }
    //Draw the approaches for the in-sector airports
    if (bDrawApproaches) {
        for (var i=0; i<aAirports.length; i++) {
            if (!aAirports[i].bInSector) continue;
            ctxMap.lineWidth = 2;
            ctxMap.strokeStyle = color_APPROACH;
            DrawPos = aAirports[i].aApproachIconPts[0].getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.beginPath();
            ctxMap.moveTo(DrawPos.x, DrawPos.y);
            var iCnt = aAirports[i].aApproachIconPts.length -1
            for (var j=0; j< iCnt ; j++ ) {
                DrawPos = aAirports[i].aApproachIconPts[j].getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
                ctxMap.lineTo(DrawPos.x, DrawPos.y);
                ctxMap.stroke();
            }//end j
            ctxMap.lineWidth = 2;
            ctxMap.strokeStyle = color_APPROACH;
            ctxMap.beginPath();
            DrawPos = aAirports[i].aApproachIconPts[iCnt - 1].getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.moveTo(DrawPos.x, DrawPos.y);
            DrawPos = aAirports[i].aApproachIconPts[iCnt].getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
            ctxMap.stroke();
        }//end i
    }//end if

    //Place the fixes
    for (var i=0; i<aFixes.length; i++) {
        ctxMap.drawImage(aImages[aFixes[i].iImageIndex], aFixes[i].FixLoc.D.x - nFixSize/2,
            aFixes[i].FixLoc.D.y - nFixSize/2, nFixSize, nFixSize);
        if (aFixes[i].DisplayFixName || bShowAllFixNames) {
            ctxMap.font = String(nFixSize - 3) + "pt sans-serif";
            ctxMap.fillStyle = color_FIX_TEXT;
            ctxMap.textAlign = "center";
            ctxMap.textBaseline = "top";
            ctxMap.fillText(aFixes[i].FixLoc.LocIdent, aFixes[i].FixLoc.D.x - 2, aFixes[i].FixLoc.D.y + 7);
        }
    }//end for
    //Place the Runways
    for (var i=0; i<aAirports.length; i++) {
        //and draw the runways where appropriate
        if (aAirports[i].bInSector) {
            for (j=0; j<aAirports[i].aRunwayEnds.length; j+=2) {
                ctxMap.lineWidth = 2;
                ctxMap.strokeStyle = color_RUNWAY;
                DrawPos = aAirports[i].aRunwayEnds[j].D;
                ctxMap.beginPath();
                ctxMap.moveTo(DrawPos.x, DrawPos.y);
                DrawPos = aAirports[i].aRunwayEnds[j+1].D;
                ctxMap.lineTo(DrawPos.x, DrawPos.y);
                ctxMap.stroke();
            }//end j
        }//end if bInSector
    }//end for
}
//-------------------------------------------------------------------
function fDrawGrid () {
    ////this function draws the lat/long grid to the map screen.
    if (!bDrawGrid) return;
    //declare variables that will be used locally
    var pThisPolar = new Polar3d(0,0);
    var i,j;
    //set the drawing style
    ctxMap.lineWidth = 1;
    ctxMap.strokeStyle = color_GRID;
    for (i=-18; i<19; i++) {
        pThisPolar.Long = i*10;
        pThisPolar.Lat = -90;
        var DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        ctxMap.beginPath();
        ctxMap.moveTo(DrawPos.x, DrawPos.y);
        for (j=-9; j<10; j++) {
            pThisPolar.Lat = j*10;
            DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            //SendMessage ("DrawPos = " + DrawPos.x + ", " + DrawPos.y);
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
            ctxMap.stroke();
        }
    }
    for (j=-9; j<10; j++) {
        pThisPolar.Lat = j*10;
        pThisPolar.Long = -180;
        DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
        ctxMap.beginPath();
        ctxMap.moveTo(DrawPos.x, DrawPos.y);
        for (i=-18; i<19; i++) {
            pThisPolar.Lat = j*10;
            pThisPolar.Long = i*10;
            DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
            ctxMap.stroke();
        }
    }
}
//-------------------------------------------------------------------
function fDrawAircraft() {
    var TagColor, TagSize;
    var i,j, DrawPos;
    for (i=0; i<aAircraft.length; i++) {
        if (aAircraft[i].ACstatus === FINISHED) continue;
        var SelectedAircraftIndex = fGetAircraftIndex(SelectedAircraft);

        //Draw the route if needed
        if (aAircraft[i].bDisplayRoute || (bAutoDisplayRoute && bAircraftSelected && i===fGetAircraftIndex(SelectedAircraft))) {
            ctxMap.lineWidth = 1;
            ctxMap.strokeStyle = color_ROUTE;
            ctxMap.beginPath();
            ctxMap.moveTo(aAircraft[i].CurrentPosition.D.x, aAircraft[i].CurrentPosition.D.y);
            if(!aAircraft[i].bVisible && aAircraft[i].ACstatus === ENROUTE) {
                DrawPos = aAircraft[i].aRoute[0].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
                ctxMap.moveTo(DrawPos.x, DrawPos.y);
            }
            if (aAircraft[i].ACstatus !== APPROACH) {
                for (j=aAircraft[i].NextFix; j<aAircraft[i].aRoute.length; j++) {
                    DrawPos = aAircraft[i].aRoute[j].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
                    ctxMap.lineTo(DrawPos.x, DrawPos.y);
                    ctxMap.stroke();
                }
            }
            else {
                DrawPos = aAircraft[i].aRoute[aAircraft[i].aRoute.length - 1].V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
                ctxMap.lineTo(DrawPos.x, DrawPos.y);
                ctxMap.stroke();
            }
        }
        //If selecting a route for an aircraft, draw that selected route
        if (bSelectingRouteFixes && i===SelectedAircraftIndex) {
            ctxMap.lineWidth = 1;
            ctxMap.strokeStyle = color_DIRECTROUTE;
            ctxMap.beginPath();
            ctxMap.moveTo(aAircraft[i].CurrentPosition.D.x, aAircraft[i].CurrentPosition.D.y);
            for (j=0; j<aDirectRoutePoints.length; j++) {
                if (aDirectRoutePoints[j].Type === FIX) {
                    DrawPos = aFixes[aDirectRoutePoints[j].Item].FixLoc.V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
                }
                else if (aDirectRoutePoints[j].Type === LATLONG) {
                    DrawPos = aDirectRoutePoints[j].Item.V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
                }
                ctxMap.lineTo(DrawPos.x, DrawPos.y);
                ctxMap.stroke();
            }

        }
        //Display approach for the selected aircraft
        if (aAircraft[i].ACstatus === APPROACH && i===SelectedAircraftIndex && bAircraftSelected) {
            ctxMap.lineWidth = 2;
            ctxMap.strokeStyle = color_AC_APPROACH;
            ctxMap.beginPath();
            DrawPos = aAircraft[SelectedAircraftIndex].iArrRwy.tThreshold.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.moveTo(DrawPos.x, DrawPos.y);
            DrawPos = aAircraft[SelectedAircraftIndex].iArrRwy.tIF.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
            DrawPos = aAircraft[SelectedAircraftIndex].iArrRwy.tIAF1.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.moveTo(DrawPos.x, DrawPos.y);
            DrawPos = aAircraft[SelectedAircraftIndex].iArrRwy.tIAF2.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
            ctxMap.stroke();
        }

        //Don't display if not visible
        if (!aAircraft[i].bVisible) continue;
        //Write the DataTag
        if (aAircraft[i].bOurControl) {
            TagColor = color_DATATAG;
            TagSize = nTagSize;
        }
        else if (aAircraft[i].bIBHO || aAircraft[i].bHolding4Handoff) {
            TagColor = color_HANDOFF;
            TagSize = nTagSize -1;
            aAircraft[i].bShowTag = true;
        }
        else {
            TagColor = color_EXTERNALDATATAG;
            TagSize = nTagSize - 1;
        }

        if (bAircraftSelected && i===SelectedAircraftIndex && aAircraft[i].bOurControl) {
            TagColor = color_SELECTEDAC1;
        }
        else if (bAircraftSelected && i===SelectedAircraftIndex && !aAircraft[i].bOurControl){
            TagColor = color_SELECTEDAC2;
            if (aAircraft[i].bIBHO || aAircraft[i].bHolding4Handoff) {
                TagColor = color_HANDOFF;
                TagSize = nTagSize -1;
                aAircraft[i].bShowTag = true;
            }
        }

        //Draw the tag
        if (aAircraft[i].bShowTag) {
            //Draw the data tag
            ctxMap.font = String(TagSize) + "px sans-serif";
            ctxMap.fillStyle = TagColor;
            ctxMap.textAlign = "left";
            ctxMap.textBaseline = "top";
            var tagX = aAircraft[i].CurrentPosition.D.x + aAircraft[i].Tag.DrawPos.x;
            var tagY = aAircraft[i].CurrentPosition.D.y + aAircraft[i].Tag.DrawPos.y;
            //write datatag line
            ctxMap.fillText(aAircraft[i].Tag.sLine1, tagX, tagY);
            ctxMap.fillText(aAircraft[i].Tag.sLine2, tagX, tagY + nTagSize + nTagLineSpace);

            //Draw the leader line
            var lineX, lineY;
            if (tagX > aAircraft[i].CurrentPosition.D.x + nTargetSize/2) {
                lineX = tagX - 2;
                lineY = tagY + aAircraft[i].Tag.iHeight/2;
            }
            else if (tagX + aAircraft[i].Tag.iWidth < aAircraft[i].CurrentPosition.D.x + nTargetSize/2) {
                lineX = tagX + aAircraft[i].Tag.iWidth + 2;
                lineY = tagY + aAircraft[i].Tag.iHeight/2;
            }
            else if(tagY + aAircraft[i].Tag.iHeight < aAircraft[i].CurrentPosition.D.y) {
                lineX = tagX + aAircraft[i].Tag.iWidth/2;
                lineY = tagY + aAircraft[i].Tag.iHeight + 2;
            }
            else if(tagY > aAircraft[i].CurrentPosition.D.y + nTargetSize/2) {
                lineX = tagX + aAircraft[i].Tag.iWidth/2;
                lineY = tagY - 2;
            }
            else {
                lineX = aAircraft[i].CurrentPosition.D.x;
                lineY = aAircraft[i].CurrentPosition.D.y;
            }

            ctxMap.lineWidth = 1;
            ctxMap.strokeStyle = color_LEADERLINE;
            ctxMap.beginPath();
            ctxMap.moveTo(lineX, lineY);
            ctxMap.lineTo(aAircraft[i].CurrentPosition.D.x, aAircraft[i].CurrentPosition.D.y);
            ctxMap.stroke();
        }
        //paste the glyph
        ctxMap.drawImage(aImages[aAircraft[i].iImageIndex], aAircraft[i].CurrentPosition.D.x - nTargetSize / 2,
            aAircraft[i].CurrentPosition.D.y - nTargetSize / 2, nTargetSize, nTargetSize);
        //Draw the trail dots
        ctxMap.lineWidth = 1;
        ctxMap.fillStyle = color_TRAILDOTS;
        for (j=0; j<aAircraft[i].aTrailDots.length; j++) {
            DrawPos = aAircraft[i].aTrailDots[j].getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.fillRect(DrawPos.x - 1, DrawPos.y - 1, 2,2);
        }
        if (aAircraft[i].bShowHalo || bShowAllHalo) {
            var nHaloRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, ActiveSector.SeparationStandard);
            ctxMap.lineWidth = 1;
            ctxMap.fillStyle = color_TRAILDOTS;
            ctxMap.beginPath();
            ctxMap.arc(aAircraft[i].CurrentPosition.D.x, aAircraft[i].CurrentPosition.D.y, nHaloRadius, 0, 6.283);
            ctxMap.stroke();
        }


        //Draw the PTL if needed
        if (aAircraft[i].bShowPTL || bShowAllPTL) {
            Distance = PTLDistance/60 * aAircraft[i].nGroundSpeed;
            DrawPos = aAircraft[i].CurrentPosition.V.NewPositionFromVector
                (aAircraft[i].ActualVector, Distance).getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.lineWidth = 2;
            ctxMap.strokeStyle = color_PTL;
            ctxMap.beginPath();
            ctxMap.moveTo(aAircraft[i].CurrentPosition.D.x, aAircraft[i].CurrentPosition.D.y);
            ctxMap.lineTo(DrawPos.x, DrawPos.y);
            ctxMap.stroke();

        }
    }//end for

    //Draw the RBL's
    var DrawPos1, DrawPos2, Pos1, Pos2;
    ctxMap.lineWidth = 1;
    ctxMap.strokeStyle = color_RBL;
    var numRBL = aRBL.length/2;
    for (i=0; i<aRBL.length; i+=2) {
        //move to first drawing position
        if (aRBL[i].pType === RBL_AIRCRAFT) {
            DrawPos1 = aAircraft[aRBL[i].pDetails].CurrentPosition.D;
            Pos1 = aAircraft[aRBL[i].pDetails].CurrentPosition.V;
        }
        else if (aRBL[i].pType === RBL_FIX) {
            DrawPos1 = aFixes[aRBL[i].pDetails].FixLoc.D;
            Pos1 = aFixes[aRBL[i].pDetails].FixLoc.V;
        }
        else if (aRBL[i].pType === RBL_AIRPORT) {
            DrawPos1 = aAirports[aRBL[i].pDetails].AirportLoc.D;
            Pos1 = aAirports[aRBL[i].pDetails].AirportLoc.V;
        }
        else {
            DrawPos1 = aRBL[i].pDetails.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            Pos1 = aRBL[i].pDetails;
        }
        ctxMap.beginPath();
        ctxMap.moveTo(DrawPos1.x, DrawPos1.y);
        if (aRBL[i+1].pType === RBL_AIRCRAFT) {
            DrawPos2 = aAircraft[aRBL[i+1].pDetails].CurrentPosition.D;
            Pos2 = aAircraft[aRBL[i+1].pDetails].CurrentPosition.V;
        }
        else if (aRBL[i+1].pType === RBL_FIX) {
            DrawPos2 = aFixes[aRBL[i+1].pDetails].FixLoc.D;
            Pos2 = aFixes[aRBL[i+1].pDetails].FixLoc.V;
        }
        else if (aRBL[i+1].pType === RBL_AIRPORT) {
            DrawPos2 = aAirports[aRBL[i+1].pDetails].AirportLoc.D;
            Pos2 = aAirports[aRBL[i+1].pDetails].AirportLoc.V;
        }
        else {
            DrawPos2 = aRBL[i+1].pDetails.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            Pos2 = aRBL[i+1].pDetails;
        }
        ctxMap.lineTo(DrawPos2.x, DrawPos2.y);
        ctxMap.stroke();

        //Detrmine bearing and Distance
        nBrg = String(Math.round(Vector2Bearing(Pos1, Pos2.subtract(Pos1))));
        if (nBrg.length === 1) nBrg = "00" + nBrg;
        if (nBrg.length === 2) nBrg = "0" + nBrg;
        nDist = String(Math.round(Pos1.distanceFrom(Pos2) * 100)/100);
        var nWriteString = nBrg + "  " + nDist + "nm";

        //Now write the text
        ctxMap.font = "10px sans-serif";
        ctxMap.fillStyle = color_RBLTEXT;
        ctxMap.textAlign = "left";
        ctxMap.textBaseline = "top";
        DrawPos.x = (DrawPos2.x + DrawPos1.x)/2;
        DrawPos.y = (DrawPos2.y + DrawPos1.y)/2;
        ctxMap.fillText(nWriteString,DrawPos.x, DrawPos.y);
        ctxMap.stroke();
    }
}
//-------------------------------------------------------------------
function fDrawSepIssues() {
    for (var i=0; i<aSeparationList.length; i++) {
        var AC1 = aAircraft[aSeparationList[i].iAC1];
        var AC2 = aAircraft[aSeparationList[i].iAC2];

        //choose linewidth and color
        ctxMap.lineWidth = 2;
        if (aSeparationList[i].SepType === TECHNICAL) {
            ctxMap.strokeStyle = color_TARGET;
            ctxMap.fillStyle = color_TECHNICALLOSS;
        }
        else {
            ctxMap.strokeStyle = color_TARGET;
            ctxMap.fillStyle = color_SEPLOSS;
        }
        ctxMap.beginPath();
        ctxMap.arc(AC1.CurrentPosition.D.x, AC1.CurrentPosition.D.y, nTargetSize/2 , 0, 2 * Math.PI);
        ctxMap.stroke();
        ctxMap.fill();
        ctxMap.beginPath();
        ctxMap.arc(AC2.CurrentPosition.D.x, AC2.CurrentPosition.D.y, nTargetSize/2 , 0, 2 * Math.PI);
        ctxMap.stroke();
        ctxMap.fill();

        ctxMap.beginPath();
        ctxMap.lineWidth = 1;
        ctxMap.strokeStyle = "#ffffff";
        ctxMap.moveTo(AC2.CurrentPosition.D.x, AC2.CurrentPosition.D.y);
        ctxMap.lineTo(AC1.CurrentPosition.D.x, AC1.CurrentPosition.D.y);
        ctxMap.stroke();

    }
}
//******************************************************************
//-
//-     Mapping functions
//-
//******************************************************************
function fInitiateMapMove() {
    //User has clicked a button to adjust/move the map (zoom in, scroll, etc.)
    //the type of movement is contained in the variable iMapAction
    //Set the map movement timer:
    timerMapMovement = setInterval (fMapMoveTick, 20);
    //SendMessage ("MapMovement initiated");
}
//.................................................................
function fEndMapMove() {
    //something has happened to trigger end of mapmovement
    //null the map movement timer
    window.clearInterval(timerMapMovement);
    timerMapMovement = null;
    //set the map action flag
    iMapAction = NOACTION;
    //send debug message
    //SendMessage("Position is: " + pCurrentMapCentre.Lat + ", " + pCurrentMapCentre.Long + " Zoom= " + nCurrentZoom);
}
//-------------------------------------------------------------------
function fMapMoveTick() {
    //timer has ticked for map movement
    //take action depending upon the type of movement
    switch (iMapAction) {
        case ZOOMING :
            nCurrentZoom *= 0.95;
            if (nCurrentZoom < MIN_ZOOM) nCurrentZoom = MIN_ZOOM;
            break;
        case UNZOOMING :
            nCurrentZoom *=1.05;
            if (nCurrentZoom > MAX_ZOOM) nCurrentZoom = MAX_ZOOM;
            break;
        case SCROLLLEFT:
            pCurrentMapCentre.Long -= nScrollSpeed * (nCurrentZoom/ActiveSector.nDefaultZoom);
            //SendMessage(pCurrentMapCentre.Long);
            if (pCurrentMapCentre.Long < -179.9) pCurrentMapCentre.Long = -179.9;
            break;
        case SCROLLRIGHT:
            pCurrentMapCentre.Long += nScrollSpeed * (nCurrentZoom/ActiveSector.nDefaultZoom);
            if (pCurrentMapCentre.Long > 179.9) pCurrentMapCentre.Long = 179.9;
            break;
        case SCROLLUP:
            pCurrentMapCentre.Lat += nScrollSpeed * (nCurrentZoom/ActiveSector.nDefaultZoom);
            if (pCurrentMapCentre.Lat > 89.9) pCurrentMapCentre.Lat = 89.9;
            break;
        case SCROLLDOWN:
            pCurrentMapCentre.Lat -= nScrollSpeed * (nCurrentZoom/ActiveSector.nDefaultZoom);
            if (pCurrentMapCentre.Lat < -89.9) pCurrentMapCentre.Lat = -89.9;
            break;
    }
    fUpdateDisplay(true);
}
//********************************************************************************************************************
//-
//-     Timer and Timing Functions
//-
//******************************************************************
function fUpdateTimeDisplay () {
    sH = String(tSimTime.Hour);
    if (tSimTime.Hour < 10) sH = " " + sH;
    sM = String(tSimTime.Minute);
    if (tSimTime.Minute < 10) sM = "0" + sM;
    hControlWindow.UpdateLabel("lblClock", sH + ":" + sM + "z");
}
//-------------------------------------------------------------------
function fClockStart() {
    nowTime = new Date().getTime();
    timerSimulation = setInterval (fSimTimerTick, nRadarSpinTime);
    timerInterface = setInterval (fInterfaceTimerTick, nInterfaceFlash);
}
//-------------------------------------------------------------------
function fSimTimerTick () {
    var newTime = new Date().getTime();
    var Elapsed = newTime - nowTime;
    Elapsed = Elapsed/1000;
    Score.TotalRunTime += Elapsed/60;
    //Take action based on elapsed time
    fUpdateClock(Elapsed);
    fUpdateAllAircraft(Elapsed);
    CheckSeparation(Elapsed);
    UpdateSeparationList();
    //Redraw as necessary
    fUpdateDisplay(false);
    fUpdateDataboard();
    if(bAircraftSelected) fShowAircraftWindow();
    //Update the scoreboard
    fUpdateScore();
    //reset nowTime
    nowTime = newTime;
}
//-------------------------------------------------------------------
function fInterfaceTimerTick() {
    if (ACInHandoff) {
        bColorHandoff = !bColorHandoff;
        if (bColorHandoff) color_HANDOFF = color_HANDOFF1;
        else color_HANDOFF = color_HANDOFF2;
        fUpdateDisplay(false);
    }
    hDataboard.ToggleStripAlerts();
}
//-------------------------------------------------------------------
function fDebugClockMove (TimeSegment) {

    //TimeSegment is the time to advance in seconds
    fUpdateClock(TimeSegment);

    //Update all aircraft
    for (var i=0; i<aAircraft.length; i++) {
        aAircraft[i].UpdateAircraft(TimeSegment);
        aAircraft[i].UpdateDataTag(ctxMap);

        //Determine if inbound aircraft is ready for a handoff
        if (!aAircraft[i].bOurControl && !aAircraft[i].bIBHO && !aAircraft[i].bHolding4Handoff) {

            var HandoffFeeler = aAircraft[i].CurrentPosition.V.NewPositionFromVector(
                aAircraft[i].ActualVector, HandoffBuffer);
            if (ActiveSector.IsPointInSector(HandoffFeeler.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom))) {
                aAircraft[i].bIBHO = true;
                aAircraft[i].bShowTag = true;

            }
        }
    }
    //Redraw as necessary
    fUpdateDisplay(false);

}
//-------------------------------------------------------------------
function fClockStop() {
    window.clearInterval(timerSimulation);
    timerSimulation = null;
    window.clearInterval(timerInterface);
    timerInterface = null;
}
//-------------------------------------------------------------------
function fUpdateClock(tElapsed) {
    var numSeconds = tElapsed;
    tSimTime.Second += numSeconds;
    if (tSimTime.Second >= 60) {
        tSimTime.Minute += 1;
        tSimTime.Second -= 60;
    }
    if (tSimTime.Minute === 60) {
        tSimTime.Hour += 1;
        tSimTime.Minute -= 60;
    }
    if (tSimTime.Hour === 24) {
        tSimTime.Hour = 0;
    }
    fUpdateTimeDisplay();

}
//-------------------------------------------------------------------
function fGetFutureTime(inputSecond) {

    var futureTime = tSimTime.Second + tSimTime.Minute * 60 + tSimTime.Hour * 3600;
    futureTime += inputSecond;

    futureTime = futureTime/60;  //convert to minutes
    nHours = Math.floor(futureTime/60);
    nMinutes = Math.round(futureTime % 60);
    return String(nHours) + ":" + String(nMinutes);

}
//*******************************************************************************************************************
//-
//-    Separation Functions
//-
//******************************************************************
function CheckSeparation(Elapsed) {
    var i,j, AC1, AC2, Lo1, Lo2, Hi1, Hi2;
    //Set the flags in the separation list
    for (i=0; i< aSeparationList.length; i++) aSeparationList[i].bValid = false;

    //Check for separation between aircraft pairs
    for (i=0; i<aAircraft.length - 1; i++) {
        AC1 = aAircraft[i];
        //don't look at aircraft in the wrong states
        if (AC1.ACstatus === WAITING || AC1.ACstatus === TAXIING || AC1.ACstatus === REQUESTING_RELEASE) continue;
        if (AC1.ACstatus === LANDED || AC1.ACstatus === FINISHED || !AC1.bOurControl) continue;
        if (AC1.bShortFinal) continue;
        for (j=i; j< aAircraft.length; j++) {
            AC2 = aAircraft[j];
            if (AC2.ACstatus === WAITING || AC2.ACstatus === TAXIING || AC2.ACstatus === REQUESTING_RELEASE) continue;
            if (AC2.ACstatus === LANDED || AC2.ACstatus === FINISHED || j===i || !AC2.bOurControl) continue;
            if (AC2.bShortFinal) continue;
            //Create the ranges of altitudes for checking...
            if (AC1.ALTcurrent < AC1.ALTcleared) {
                Lo1 = AC1.ALTcurrent;
                Hi1 = AC1.ALTcleared;
            }
            else {
                Hi1 = AC1.ALTcurrent;
                Lo1 = AC1.ALTcleared;
            }
            if (AC2.ALTcurrent < AC2.ALTcleared) {
                Lo2 = AC2.ALTcurrent;
                Hi2 = AC2.ALTcleared;
            }
            else {
                Hi2 = AC2.ALTcurrent;
                Lo2= AC2.ALTcleared;
            }

            //console.log(Lo1, Hi1, "<-> ",Lo2, Hi2);
            if (!((Hi1 + 800) < Lo2 || Lo1 > (Hi2 + 800))) {
                //into technical sep loss area since there is an overlap
                //Check if they are within the sep standard.
                var nDist = AC1.CurrentPosition.V.distanceFrom(AC2.CurrentPosition.V);
                if (nDist < ActiveSector.SeparationStandard) {
                    if (Math.abs(AC1.ALTcurrent - AC2.ALTcurrent) < 1000) {
                        //actual sep loss
                        ProcessSeparationIssue(ACTUAL, i, j, Elapsed);
                    }
                    else { //technical sep loss
                        ProcessSeparationIssue(TECHNICAL, i, j, Elapsed);
                    }//end if/else
                }
            }
            //console.log(AC1.ACIdent, AC2.ACIdent);
        }// end j
    }//end i
}
//-------------------------------------------------------------------
function ProcessSeparationIssue(SepType, Index1, Index2, Elapsed) {
    //First find out if this separation is ongoing...
    for (var i=0; i< aSeparationList.length; i++) {
        if (Index1 === aSeparationList[i].iAC1 && Index2 === aSeparationList[i].iAC2){
            aSeparationList[i].bValid = true;

            if (aSeparationList[i].SepType !== SepType) {
                //means it has gone from technical to actual or vice versa
                if (SepType === TECHNICAL) {
                    //sep was actual, now technical
                    aSeparationList[i].SepType = SepType;
                }
                else {
                    //now an actual loss
                    fSendUserMessage("WARNING:  Separation Violation " + aAircraft[Index1].ACIdent + " & " + aAircraft[Index2].ACIdent, MSGERROR);
                    Score.SepLoss++;
                    sndWarning.play();
                    aSeparationList[i].SepType = SepType;
                }
            }
            if (aSeparationList[i].SepType === TECHNICAL) Score.ContinuedTechLoss += Elapsed;
            else Score.ContinuedSepLoss += Elapsed;
            return;
        }
    }
    //Only get here if this is a new sep loss
    if (SepType === ACTUAL) {
        fSendUserMessage("WARNING:  Separation Violation " + aAircraft[Index1].ACIdent + " & " + aAircraft[Index2].ACIdent, MSGERROR);
        Score.SepLoss++;
        sndWarning.play();

    }
    else if (SepType === TECHNICAL) {
        fSendUserMessage("WARNING:  Technical Violation " + aAircraft[Index1].ACIdent + " & " + aAircraft[Index2].ACIdent, MSGWARNING);
        Score.TechLoss++;
        sndWarning.play();
    }
    aSeparationList.push(new SeparationEvent(SepType, Index1, Index2));
}
//-------------------------------------------------------------------
function UpdateSeparationList() {
    //Update the separation list and then display as necessary
    for (var i=aSeparationList.length - 1; i >= 0; i--) {
        if (!aSeparationList[i].bValid)aSeparationList.splice(i,1);
    }
    //Now should have the separation list with only active elements.
    //Clear the display pane:
    hSeparationWindow.ClearPaneText("SepList");
    if (aSeparationList.length === 0) {
        hSeparationWindow.Hide();
        return;
    }
    for (i=0; i<aSeparationList.length; i++) {
        var sString;
        if (aSeparationList[i].SepType === TECHNICAL) {
            //verify here it hasn't turned into an actual loss
            sString = "<p class='technicalloss' >";
        }
        else {
            sString = "<p class='actualloss' >";
        }
        sString += aAircraft[aSeparationList[i].iAC1].ACIdent + " & " +aAircraft[aSeparationList[i].iAC2].ACIdent;
        sString += "</p>";
        hSeparationWindow.AddPaneText("SepList", sString);
    }
    hSeparationWindow.Show();
}
//*******************************************************************************************************************
//-
//-    Messaging Functions
//-
//******************************************************************
function fSendUserMessage(Msg, MsgStyle) {
    if (MsgTimer) clearTimeout(MsgTimer);
    UserMsg.Send(Msg, MsgStyle);
    MsgTimer = setTimeout(fEndUserMessage, MsgTimeOut);
}
function fEndUserMessage() {
    UserMsg.Hide();
}
//*******************************************************************************************************************
//-
//-    Cleanup Dialogs
//-
//******************************************************************
function CloseAndClean() {
    fCloseOpenDialogs();
    fClearRoutingChanges();
    fClearHoldingChanges();
    fClearRBLChanges();
}
//-------------------------------------------------------------------
function fCloseOpenDialogs() {
    if (hACMenu.visible) fHideACMenu();
    if (hClearanceWindow.visible) {
        fHideClearanceWindow();
        if (bAircraftSelected) fShowAircraftWindow();
    }
}
//********************************************************************************************************************
//-
//-     Aircraft (full flight strip) Window and actions
//-
//******************************************************************
function fHideAircraftWindow() {
    hAircraftWindow.Hide();
}
//-------------------------------------------------------------------
function fShowAircraftWindow() {
    var nTxt, sRoute, sRwy;
    var nDistance, nEstimate, nTime, nMins, nHours, sMins, sHours;
    var sM = "";
    //Clear out all text and hide unused panes
    fClearAircraftWindowText();
    fHideAllCommandPanes();
    //get index of the selected aircraft
    index = fGetAircraftIndex(SelectedAircraft);
    //Update the panel based on the phase/status of flight
    if (aAircraft[index].ALTrequested) {
        sRoute = String(aAircraft[index].ALTrequested) + " ";
    }
    else {
        sRoute = "";
    }
    for (var i=0; i< aAircraft[index].aRoute.length; i++) {
        sRoute += aAircraft[index].aRoute[i].LocIdent;
        sRoute += " ";
    }
    hAircraftWindow.UpdateLabel("lRoute", sRoute);
    hAircraftWindow.UpdateLabel("lIdent", aAircraft[index].ACIdent);
    hAircraftWindow.UpdateLabel("lType", aAircraft[index].Weight + "/" + aAircraft[index].sType);
    hAircraftWindow.UpdateLabel("lSpd", aAircraft[index].FTAS);

    switch(aAircraft[index].ACstatus) {
        case WAITING:
            fSetAircraftWindowState(false);
            hAircraftWindow.UpdateLabel("lFltType", "D");
            hAircraftWindow.UpdateLabel("lFix", " ETD");
            hAircraftWindow.UpdateLabel("lEstimate", aAircraft[index].ProposedDepartureTime);
            hAircraftWindow.UpdateLabel("lInfo1", "  At Gate");
            hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("ACIdentBlock"), hAircraftWindow.Location.H);
            break;
        case TAXIING:
            fSetAircraftWindowState(false);
            hAircraftWindow.UpdateLabel("lFltType", "D");
            hAircraftWindow.UpdateLabel("lFix", "RWY");
            hAircraftWindow.UpdateLabel("lEstimate", String(aAirports[aAircraft[index].iDepAP].aApproaches[aAirports[aAircraft[index].iDepAP].ActiveRunway].nRunwayNumber));
            hAircraftWindow.UpdateLabel("lInfo1", "TAXIING");
            hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("ACIdentBlock"), hAircraftWindow.Location.H);
            break;
        case REQUESTING_RELEASE:
            fSetAircraftWindowState(false);
            hAircraftWindow.UpdateLabel("lFltType", "D");
            hAircraftWindow.UpdateLabel("lFix", "RWY");
            hAircraftWindow.UpdateLabel("lEstimate", String(aAirports[aAircraft[index].iDepAP].aApproaches[aAirports[aAircraft[index].iDepAP].ActiveRunway].nRunwayNumber));
            hAircraftWindow.UpdateLabel("lInfo1", "REQUEST");
            hAircraftWindow.UpdateLabel("lInfo2", "RELEASE");
            hAircraftWindow.OpenPane("AC-RQST");
            hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("AC-RQST"), hAircraftWindow.Location.H);
            break;
        case RELEASED:
            fSetAircraftWindowState(true);
            hAircraftWindow.UpdateLabel("lFltType", "D");
            hAircraftWindow.UpdateLabel("lFix", aAirports[aAircraft[index].iDepAP].AirportLoc.LocIdent);
            hAircraftWindow.UpdateLabel("lEstimate", String(aAirports[aAircraft[index].iDepAP].aApproaches[aAirports[aAircraft[index].iDepAP].ActiveRunway].nRunwayNumber));
            hAircraftWindow.UpdateLabel("lALTcleared", String(Math.round(aAircraft[index].ALTcleared / 100)));
            hAircraftWindow.UpdateLabel("lInfo3", "RELEASED");
            hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("ACIdentBlock"), hAircraftWindow.Location.H);
            break;
        case ENROUTE:
            nTxt = aAircraft[index].aRoute[aAircraft[index].NextFix].LocIdent;
            nDistance = aAircraft[index].CurrentPosition.V.distanceFrom(aAircraft[index].aRoute[aAircraft[index].NextFix].V);
            nTime = Math.round((nDistance / aAircraft[index].nGroundSpeed) * 60);  //time in minutes
            nMins = tSimTime.Minute + nTime;
            nHours = tSimTime.Hour;
            while (nMins > 59) {
                nMins -= 60;
                nHours++;
            }
            if (nHours > 23) nHours -= 24;
            sMins = String(nMins);
            sHours = String(nHours);
            if (sMins.length === 1) sMins = "0" + sMins;
            if (sHours.length === 1) sHours = "0" + sHours;
            hAircraftWindow.UpdateLabel("lFix", nTxt);
            hAircraftWindow.UpdateLabel("lEstimate", sHours + ":" + sMins);
            hAircraftWindow.UpdateLabel("lALTcleared", String(Math.round(aAircraft[index].ALTcleared / 100)));
            hAircraftWindow.UpdateLabel("lALTcurrent", "CUR: " + String(Math.round(aAircraft[index].ALTcurrent / 100)));
            //Differencew with aircraft Arriving or overflight
            if (aAircraft[index].bArriveControlSector) hAircraftWindow.UpdateLabel("lFltType", "A");
            else hAircraftWindow.UpdateLabel("lFltType", "-");

            //differences between aircraft OUR CONTROL or NOT
            if (aAircraft[index].bOurControl) {
                fSetAircraftWindowState(true);
                //Assigned SPEED
                if (aAircraft[index].bAssignedSpeed) {
                    hAircraftWindow.UpdateLabel("lSpd", "A" + String(Math.round(aAircraft[index].nAssignedSpeed)));
                }
                //Assigned HEADING
                if (aAircraft[index].bAssignedHeading) {
                    var sAHdg = String(aAircraft[index].nAssignedHeading);
                    if (sAHdg.length === 1) sAHdg = "00" + sAHdg;
                    if (sAHdg.length === 2) sAHdg = "0" + sAHdg;
                    hAircraftWindow.UpdateLabel("lInfo1", "HDG: " + sAHdg);
                }
                //HOLDING
                if (aAircraft[index].bHoldingFix) {
                    hAircraftWindow.UpdateLabel("lInfo3", "HOLD: " + aAircraft[index].cHoldFix.FixLoc.LocIdent);
                }
                if (aAircraft[index].bHoldingHere) {
                    hAircraftWindow.UpdateLabel("lInfo3", "HOLDING");
                }
                if (aAircraft[index].bArriveControlSector) {
                    hAircraftWindow.OpenPane("AC-ARR");
                    hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("AC-ARR"), hAircraftWindow.Location.H);
                }
                else {
                    hAircraftWindow.OpenPane("AC-OVER");
                    hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("AC-OVER"), hAircraftWindow.Location.H);
                }
            }
            //ELSE if NOT OUR CONTROL
            else {
                fSetAircraftWindowState(false);
                if (aAircraft[index].bHolding4Handoff) hAircraftWindow.UpdateLabel("lInfo3", "HOLDING");
                if (aAircraft[index].bIBHO) {
                    hAircraftWindow.OpenPane("AC-ACCEPT");
                    hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("AC-ACCEPT"), hAircraftWindow.Location.H);
                }
                else {
                    hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("ACIdentBlock"), hAircraftWindow.Location.H);
                }
            }
            break;
        case APPROACH:
            fSetAircraftWindowState(true);
            hAircraftWindow.UpdateLabel("lALTcleared", " A ");
            hAircraftWindow.UpdateLabel("lFix", aAirports[aAircraft[index].iArrAP].AirportLoc.LocIdent);
            hAircraftWindow.UpdateLabel("lEstimate", String(aAirports[aAircraft[index].iArrAP].aApproaches[aAirports[aAircraft[index].iArrAP].ActiveRunway].nRunwayNumber));
            hAircraftWindow.UpdateLabel("lALTcurrent", "CUR: " + String(Math.round(aAircraft[index].ALTcurrent / 100)));
            //Assigned SPEED
            if (aAircraft[index].bAssignedSpeed) {
                hAircraftWindow.UpdateLabel("lSpd", "A" + String(Math.round(aAircraft[index].nAssignedSpeed)));
            }
            //show the approach pane based on if on frequency or not.
            if (aAircraft[index].bOnFrequency) {
                hAircraftWindow.OpenPane("AC-APPON");
                hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("AC-APPON"), hAircraftWindow.Location.H);
            }
            else {
                hAircraftWindow.OpenPane("AC-APPOFF");
                hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("AC-APPOFF"), hAircraftWindow.Location.H);
            }
            break;
    }
    //Center and Ensure the window is showing
    if (hClearanceWindow.visible) {
        fHideAllCommandPanes();
        hAircraftWindow.Resize(hAircraftWindow.GetPaneExtent("ACIdentBlock"), hAircraftWindow.Location.H);
    }
    hAircraftWindow.MoveTo((ScrnSize.x - hAircraftWindow.Location.W)/2, ScrnSize.y - hAircraftWindow.Location.H);
    hAircraftWindow.Show();
}
//-------------------------------------------------------------------
function fSetAircraftWindowState(bActive) {
    //set the styling of the a/c strip on the AircraftWindow
    var sStyle = "stripinactive";
    var textStyle = "striptextinactive";
    if (bActive) {
        sStyle = "stripactive";
        textStyle = "striptextactive";
    }
    with (hAircraftWindow) {
        UpdatePaneStyle("ACEstimate", sStyle);
        UpdatePaneStyle("ACFlightType", sStyle);
        UpdatePaneStyle("ACAltitude", sStyle);
        UpdatePaneStyle("ACInformation", sStyle);
        UpdatePaneStyle("ACIdentBlock", sStyle);
        UpdatePaneStyle("ACRoute", sStyle);
        UpdateAllLabelStyles(textStyle);
    }
}
//-------------------------------------------------------------------
function fClearAircraftWindowText() {
    hAircraftWindow.ClearAllLabelsText();
}
//-------------------------------------------------------------------
function fHideAllCommandPanes() {
    hAircraftWindow.ClosePane("AC-RQST", "AC-ACCEPT", "AC-OVER", "AC-ARR", "AC-APPON", "AC-APPOFF");
}
//*******************************************************************************************************************
//-
//-     AC Menu Functions
//-
//******************************************************************
function fShowACMenu(DisplayPosition) {
    if (!bAircraftSelected) return;
    var i = fGetAircraftIndex(SelectedAircraft);
    //clear the menu items
    fClearACMenuItems();
    //construct the AC Main Menu based on aircraft state
    switch(aAircraft[i].ACstatus) {
        case ENROUTE:
            if (aAircraft[i].bOurControl) {
                hACMenu.ShowMenuButton("mnuAltitude", 0);
                hACMenu.ShowMenuButton("mnuVector", 1);
                hACMenu.ShowMenuButton("mnuSpeed", 2);
                if (aAircraft[i].bArriveControlSector) hACMenu.ShowMenuButton("mnuApproach", 3);
                else hACMenu.ShowMenuButton("mnuHandoff", 3);
                hACMenu.ShowMenuButton("mnuDirect", 4);
                hACMenu.ShowMenuButton("mnuHold", 5);
                hACMenu.ShowMenuButton("mnuPTL", 6);
                hACMenu.ShowMenuButton("mnuRTE", 7);
                hACMenu.ShowMenuButton("mnuHALO", 8);
                hACMenu.ResizePane("MainMenu", 120, 9*20);
                hACMenu.Resize(120, 9*20);

            }
            else {
                //show accept handoff, PTL, RTE, HALO
                hACMenu.ShowMenuButton("mnuPTL", 0);
                hACMenu.ShowMenuButton("mnuRTE", 1);
                hACMenu.ShowMenuButton("mnuHALO", 2);
                hACMenu.ResizePane("MainMenu", 120, 3*20);
                hACMenu.Resize(120, 3*20);
                if (aAircraft[i].bIBHO) {
                    hACMenu.ShowMenuButton("mnuAccept", 3);
                    hACMenu.ResizePane("MainMenu", 120, 4*20);
                    hACMenu.Resize(120, 4*20);
                }
            }//end if
            break;
        case APPROACH:
            if (aAircraft[i].bOnFrequency) {
                hACMenu.ShowMenuButton("mnuSpeed", 0);
                hACMenu.ShowMenuButton("mnuCancel", 1);
                hACMenu.ShowMenuButton("mnuTransfer", 2);
                hACMenu.ShowMenuButton("mnuPTL", 3);
                hACMenu.ShowMenuButton("mnuHALO", 4);
                hACMenu.ResizePane("MainMenu", 120, 5*20);
                hACMenu.Resize(120, 5*20);
            }
            else {
                hACMenu.ShowMenuButton("mnuCancel", 0);
                hACMenu.ShowMenuButton("mnuPTL", 1);
                hACMenu.ShowMenuButton("mnuHALO", 2);
                hACMenu.ResizePane("MainMenu", 120, 3*20);
                hACMenu.Resize(120, 3*20);

            }
    }
    hACMenu.MoveTo(DisplayPosition.x, DisplayPosition.y);
    hACMenu.Show();
    bACMainMenuOpen = true;
}
//-------------------------------------------------------------------
function fHideACMenu() {
    hACMenu.Hide();
    bACMainMenuOpen = false;
}
//-------------------------------------------------------------------
function fClearACMenuItems() {
    hACMenu.HideButtons("mnuAltitude", "mnuVector", "mnuSpeed", "mnuApproach", "mnuDirect", "mnuHandoff");
    hACMenu.HideButtons("mnuTransfer", "mnuHold", "mnuPTL", "mnuRTE", "mnuHALO", "mnuCancel", "mnuAccept");
}
//********************************************************************************************************************
//-
//-     Clearance Window Functions
//-
//******************************************************************
function fHideClearanceWindow() {
    hClearanceWindow.Hide();
}
//-------------------------------------------------------------------
function fShowClearanceWindow(Sender, ClearanceType) {
    //close open panes in the clearance window
    fHideAllClearancePanes();
    //From the clearance type, we'll set up the Clearance Window
    switch (ClearanceType) {
        case APPROACHCLX:
            //Enter the appropriate approach information
            hClearanceWindow.UpdateLabel("lArprt", aAirports[CurrentAC.iArrAP].AirportLoc.LocIdent + " Rwy " + CurrentAC.iArrRwy.nRunwayNumber);
            //add the approach clearance pane to the clearance window
            hClearanceWindow.OpenPane("ApproachClx");
            //resize the clearance window to be the same size as the approach clearance pane
            hClearanceWindow.ResizeToPane("ApproachClx");
            break;
        case ALTITUDECLX:
            hClearanceWindow.OpenPane("AltitudeClx");
            hClearanceWindow.ResizeToPane("AltitudeClx");
            WorkingAltitude = CurrentAC.ALTcleared/100;
            fUpdateAltitudeDialogAltitude();
            break;
        case SPEEDCLX:
            hClearanceWindow.OpenPane("SpeedClx");
            hClearanceWindow.ResizeToPane("SpeedClx");
            if (CurrentAC.bAssignedSpeed) {
                WorkingSpeed = CurrentAC.nAssignedSpeed;
                hClearanceWindow.RestyleButton("btnResumeSpd", "stdbutton");
            }
            else {
                WorkingSpeed = Math.round(CurrentAC.IAS/10) * 10;
                hClearanceWindow.RestyleButton("btnResumeSpd", "stdbuttondisabled");
            }
            fUpdateSpeedDialogSpeed();
            break;
        case VECTORCLX:
            hClearanceWindow.OpenPane("VectorClx");
            hClearanceWindow.ResizeToPane("VectorClx");
            if (CurrentAC.bAssignedHeading) {
                WorkingHeading = CurrentAC.nAssignedHeading;
            }
            else {
                WorkingHeading = Math.round(Vector2Bearing(CurrentAC.CurrentPosition.V, CurrentAC.ActualVector));
            }
            CurrentACWorkingHeading = WorkingHeading;
            fUpdateHeadingDialogHeading();
            break;
        case HOLDCLX:
            hClearanceWindow.OpenPane("HoldClx");
            hClearanceWindow.ResizeToPane("HoldClx");
            break;
        case DIRECTCLX:
            fUpdateDirectDialog();
            hClearanceWindow.OpenPane("DirectClx");
            hClearanceWindow.ResizeToPane("DirectClx");
            bSelectingRouteFixes = true;
            aDirectRoutePoints = [];
            break;
    }
    //From the Sender type, we'll determine where to show the pane
    switch (Sender) {
        case SENDERMENU:
            //need to hide the main menu and show the panel at same location
            hClearanceWindow.MoveTo(hACMenu.Location.x, hACMenu.Location.y);
            fHideACMenu();
            break;
        case SENDERPANEL:
            //need to replace the button area on the Aircraft Window
            var nX= (ScrnSize.x - hAircraftWindow.GetPaneExtent("ACIdentBlock"))/2 + hAircraftWindow.GetPaneExtent("ACIdentBlock");
            hClearanceWindow.MoveTo(nX, ScrnSize.y - hClearanceWindow.Location.H);
            break;
    }
    //Finally show the window
    hClearanceWindow.Show();
    fShowAircraftWindow();
}
//-------------------------------------------------------------------
function fHideAllClearancePanes() {
    hClearanceWindow.ClosePane("ApproachClx", "AltitudeClx", "SpeedClx", "VectorClx", "HoldClx", "DirectClx");
}
//-------------------------------------------------------------------
function fUpdateAltitudeDialogAltitude () {
    var sStringAlt = String(WorkingAltitude);
    if (sStringAlt.length === 1)sStringAlt = "00" + sStringAlt;
    if (sStringAlt.length === 2)sStringAlt = "0" + sStringAlt;
    hClearanceWindow.UpdateLabel("lblALTReadout", sStringAlt);
}
//-------------------------------------------------------------------
function fUpdateSpeedDialogSpeed () {
    var sStringSpd = String(Math.round(WorkingSpeed));
    if (sStringSpd.length === 1) sStringSpd = "00" + sStringSpd;
    if (sStringSpd.length === 2) sStringSpd = "0" + sStringSpd;
    hClearanceWindow.UpdateLabel("lSpdReadout", sStringSpd);
}
//-------------------------------------------------------------------
function fUpdateHeadingDialogHeading () {
    var sStringHdg = String(WorkingHeading);
    if (sStringHdg.length === 1)sStringHdg = "00" + sStringHdg;
    if (sStringHdg.length === 2)sStringHdg = "0" + sStringHdg;
    hClearanceWindow.UpdateLabel("lblHDGReadout", sStringHdg);
}
//-------------------------------------------------------------------
function fUpdateDirectDialog() {
    //populate menu with fixes in route
    var iNextFix = CurrentAC.NextFix;
    var ctr = 0;
    var btnName;
    for (i = iNextFix; i < CurrentAC.numRtePts; i++) {
        if (ctr > 9) break;
        btnName = "mnuDct" + String(ctr);
        hClearanceWindow.UpdateButton(btnName, CurrentAC.aRoute[i].LocIdent);
        hClearanceWindow.ShowButton(btnName);
        ctr++;
    }//end i
    nSize = ctr*20;
    if (ctr<9) {
        for (i = ctr; i<10; i++) {
            btnName = "mnuDct" + String(i);
            hClearanceWindow.HideButtons(btnName);
        }//end i
    }//end if

    //add the cancel button
    hClearanceWindow.MoveButton("bCxDirect", 0, 50 + nSize);
    hClearanceWindow.ResizePane("DirectClx", 120,  50 + nSize + 32);

}
//-------------------------------------------------------------------
function fAltClxChanged(nAmount) {
    WorkingAltitude += nAmount;
    if (WorkingAltitude < 0) WorkingAltitude=0;
    fUpdateAltitudeDialogAltitude();
}
//-------------------------------------------------------------------
function fSpdClxChanged(nAmount) {
    WorkingSpeed += nAmount;
    if (WorkingSpeed < 80) WorkingSpeed = 80;
    if (WorkingSpeed > 300) WorkingSpeed= 300;
    fUpdateSpeedDialogSpeed();
}
//-------------------------------------------------------------------
function fHdgClxChanged(nAmount) {
    WorkingHeading += nAmount;
    WorkingHeading = round5(WorkingHeading);
    if (WorkingHeading <= 0) WorkingHeading += 360;
    if (WorkingHeading > 360) WorkingHeading -= 360;

    //determine if a left or right turn and update radio buttons
    RightTurn = WorkingHeading - CurrentACWorkingHeading;
    if (RightTurn < 0) {RightTurn +=360;}

    LeftTurn = CurrentACWorkingHeading- WorkingHeading;
    if (LeftTurn <0) {LeftTurn += 360;}

    var TurnDirection = 1;
    hClearanceWindow.CheckButton("rdoTR");
    if (LeftTurn <= RightTurn) {
        TurnDirection = -1;
        hClearanceWindow.CheckButton("rdoTL");
    }
    fUpdateHeadingDialogHeading();
}
//********************************************************************************************************************
//-
//-     Databoard and flight strip functions
//-
//******************************************************************
function fUpdateDataboard() {
    var bMod1, bMod2;
    hDataboard.ClearStrips();
    //update each strip based on aircraft status
    for (var i=0; i<aAircraft.length; i++) {
        hDataboard.UpdateStrip(i, aAircraft[i]);
    }//end i

    //Update databoard sizes
    hDataboard.SizeBays();

    //show selected aircraft
    if (bAircraftSelected) hDataboard.SelectAC(fGetAircraftIndex(SelectedAircraft));
}
//-------------------------------------------------------------------
function fSetACAlert(TxCode) {
    var index = fGetAircraftIndex(TxCode);
    hDataboard.aStrips[index].setFlagStatus(true, true, "flagblue");
    hDataboard.AcknowledgeToggle(index);
}
//*******************************************************************************************************************
//-
//-      Radio and communication functions
//-
//******************************************************************
function fIssueClearance (iAC, ClxType, Details) {
    var sClearancePhrase, sClearanceText;
    //first identify if the frequency is in use.
    //if yes, then cannot issue the clearance
    //console.log(iAC);
    if (speechSynthesis.speaking) {
        sndSayAgain.play();
        return;
    }
    Score.Transmission++;
    //Add ident to verbal clearance
    sClearancePhrase = aAircraft[iAC].RadioTelephony + ", ";
    //Add ident to the clearance message list
    sClearanceText = aAircraft[iAC].ACIdent + " ";

    //get a response time for the readback
    var nTimeToRespond = getResponseTime(PilotResponseTime);
    //Formulate the clearance based on clearance type
    switch (ClxType) {
        case CLX_ALTITUDE:
            var newAlt = Details * 100;
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, ";
                sClearanceText += "Appch Cancelled, "
            }
            if (newAlt < aAircraft[iAC].ALTcurrent) {
                sClearancePhrase += "Descend ";
                sClearanceText += "Descend ";
            }
            else {
                sClearancePhrase += "Climb ";
                sClearanceText += "Climb ";
            }
            sClearancePhrase += Altitude2Verbal(newAlt);
            sClearanceText += Altitude2Text(newAlt);
            break;
        case CLX_DIRECT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, ";
                sClearanceText += "Appch Cancelled, "
            }
            //Handle the special case where there is only one route point given....
            if (Details.length === 1) {
                sClearancePhrase += "Cleared Direct " + aAircraft[iAC].aRoute[Details[0].Item].LocName;
                sClearanceText += "Cleared Direct " + aAircraft[iAC].aRoute[Details[0].Item].LocIdent;
                if (!(aAircraft[iAC].aRoute[Details[0].Item].LocIdent === aAircraft[iAC].aRoute[aAircraft[iAC].aRoute.length - 1].LocIdent)){
                    sClearancePhrase += ", Remainder of route unchanged";
                    sClearanceText += " F/P route";
                }
            }
            //but if there are additional fixes...
            else {
                sClearancePhrase += "Cleared Direct ";
                sClearanceText += "Cleared Direct ";
                for (var i=0; i< Details.length - 1; i++) {
                    if (Details[i].Type === FIX) {
                        sClearancePhrase += aFixes[Details[i].Item].FixLoc.LocName;
                        sClearanceText += aFixes[Details[i].Item].FixLoc.LocIdent;
                        sClearancePhrase += ", Direct ";
                        sClearanceText += " Direct ";
                    }
                    else if(Details[i].Type === LATLONG) {
                        sClearancePhrase += Details[i].Item.LocName;
                        sClearanceText += Details[i].Item.LocIdent;
                        sClearancePhrase += ", Direct ";
                        sClearanceText += " Direct ";
                    }
                }
                sClearancePhrase += aAircraft[iAC].aRoute[Details[Details.length - 1].Item].LocName;
                sClearanceText += aAircraft[iAC].aRoute[Details[Details.length - 1].Item].LocIdent;
                if (!(aAircraft[iAC].aRoute[Details[Details.length - 1].Item].LocIdent === aAircraft[iAC].aRoute[aAircraft[iAC].aRoute.length - 1].LocIdent)){
                    sClearancePhrase += ", Remainder of route unchanged";
                    sClearanceText += " F/P route";
                }
            }
            break;
        case CLX_HDG_LEFT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, ";
                sClearanceText += "Appch Cancelled, "
            }
            sClearancePhrase += "Turn Left, Heading ";
            sClearanceText += "Turn Left Heading ";
            sClearancePhrase += Heading2Verbal(Details);
            sClearanceText += Heading2Text(Details);
            break;
        case CLX_HDG_RIGHT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, ";
                sClearanceText += "Appch Cancelled, "
            }
            sClearancePhrase += "Turn Right, Heading ";
            sClearanceText += "Turn Right Heading ";
            sClearancePhrase += Heading2Verbal(Details);
            sClearanceText += Heading2Text(Details);
            break;
        case CLX_HDG_STRAIGHT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, ";
                sClearanceText += "Appch Cancelled, "
            }
            sClearancePhrase += "Fly Present Heading";
            sClearanceText += "Fly Present Heading";
            break;
        case ASSIGN_SPD:
            sClearancePhrase += "Maintain Speed, ";
            sClearanceText += "Maintain Speed ";
            sClearancePhrase += Speed2Verbal(Details);
            sClearanceText += Speed2Text(Details);
            sClearancePhrase += " knots";
            sClearanceText += " Kts.";
            break;
        case CANCEL_SPD:
            sClearancePhrase += "Rezoom Normal Speed";
            sClearanceText += "Resume Normal Speed";
            break;
        case EXTERNAL_HANDOFF:
            sClearancePhrase += "Contact Next Sector Now";
            sClearanceText += "Contact Next Sector";
            break;
        case TOWER_HANDOFF:
            sClearancePhrase += "Contact Tower Now";
            sClearanceText += "Contact Tower";
            break;
        case CLX_APPROACH:
            if (!aAircraft[iAC].bArriveControlSector) return;
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, Maintain Heading and Altitude";
                sClearanceText += "Appch Cancelled, Mntn HDG and ALT";
            }
            else {
                sClearancePhrase += "Cleared to the ";
                sClearanceText += "Cleared ";
                sClearancePhrase += aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocName + " for a ";
                sClearanceText += aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocIdent + " RWY ";
                sClearancePhrase += aAircraft[iAC].iArrRwy.sRunwayName + " Approach";
                sClearanceText += String(aAircraft[iAC].iArrRwy.nRunwayNumber) + " Appch.";
            }
            nTimeToRespond = 4;
            break;
        case CLX_HOLDHERE:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, ";
                sClearanceText += "Appch Cancelled, "
            }
            sClearancePhrase += "Hold at Present Position";
            sClearanceText += "Hold Present Position";
            break;
        case CLX_HOLDFIX:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sClearancePhrase += "Approach Clearance Cancelled, ";
                sClearanceText += "Appch Cancelled, "
            }
            sClearancePhrase += "Hold at ";
            sClearanceText += "Hold at ";
            sClearancePhrase += aFixes[Details].FixLoc.LocName;
            sClearanceText += aFixes[Details].FixLoc.LocIdent;
            break;
    }
    //Add to the voice display panel and speak the clearance
    Speak(Controller, sClearancePhrase, PhraseDelivered);
    fAddControllerVoiceLogEntry(sClearanceText);

    //Add the clearance to the aircraft action queue...
    aAircraft[iAC].aActionQueue.push(new cAction(ClxType, Details, nTimeToRespond));
}
//-------------------------------------------------------------------
function AddToSpeechQueue(iAC, iAction, sDetails) {
    var sVerbal = ActiveSector.SectorName + ", " + aAircraft[iAC].RadioTelephony + " ";
    var sText = ActiveSector.SectorName + ", " + aAircraft[iAC].ACIdent + " ";
    switch (iAction) {
        case FREQ_CHANGE_INBOUND:
            if (aAircraft[iAC].ALTcurrent === aAircraft[iAC].ALTcleared) {
                sVerbal += "is with you at ";
                sText += "checking in ";
                sVerbal += Altitude2Verbal(aAircraft[iAC].ALTcurrent);
                sText += Altitude2Text(aAircraft[iAC].ALTcurrent);
            }
            else if (aAircraft[iAC].ALTcurrent < aAircraft[iAC].ALTcleared) {
                sVerbal += " with you ,climbing to ";
                sText += " with you ,climbing to ";
                sVerbal += Altitude2Verbal(aAircraft[iAC].ALTcleared);
                sText += Altitude2Text(aAircraft[iAC].ALTcleared);
            }
            else if (aAircraft[iAC].ALTcurrent > aAircraft[iAC].ALTcleared) {
                sVerbal += " with you, descending to ";
                sText += " with you, descending to ";
                sVerbal += Altitude2Verbal(aAircraft[iAC].ALTcleared);
                sText += Altitude2Text(aAircraft[iAC].ALTcleared);
            }
            break;
        case MISSED_APPROACH:
            sVerbal += "is with you runway heading to";
            sText += "runway heading to";
            sVerbal += Altitude2Verbal(aAircraft[iAC].ALTcleared);
            sText += Altitude2Text(aAircraft[iAC].ALTcleared);
            break;
        case EXTERNAL_HANDOFF:
            sVerbal += "switching";
            sText += "switching to next sector";
            break;
        case TOWER_HANDOFF:
            sVerbal += "switching";
            sText += "switching to Tower";
            break;
        case CHECK_IN_DEPARTURE:
            sVerbal += "is with you runway heading to";
            sText += "runway heading to";
            sVerbal += Altitude2Verbal(aAircraft[iAC].ALTcleared);
            sText += Altitude2Text(aAircraft[iAC].ALTcleared);
            break;
        case UNABLE_ALT:
            sVerbal += "is unable ";
            sVerbal += Altitude2Verbal(sDetails * 100);
            sText = ActiveSector.SectorName + ", ";
            sText += aAircraft[iAC].ACIdent + " ";
            sText += "unable ";
            sText += Altitude2Text(sDetails * 100);
            break;
        case CLIMB_TO:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled, ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Climbing to ";
            sVerbal += Altitude2Verbal(sDetails * 100);
            sText += "Climbing to ";
            sText += Altitude2Text(sDetails * 100);
            break;
        case DESCEND_TO:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled, ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Descending to ";
            sVerbal += Altitude2Verbal(sDetails * 100);
            sText += "Descending to ";
            sText += Altitude2Text(sDetails * 100);
            break;
        case LEVEL_CALL:
            sVerbal += "is level at ";
            sVerbal += Altitude2Verbal(sDetails);
            sText += "Level ";
            sText += Altitude2Text(sDetails);
            break;
        case CANCEL_SPD:
            sVerbal += " Roger, resuming normal speed";
            sText += " Resuming normal speed";
            break;
        case UNABLE_SPD:
            sVerbal += " is unable ";
            sText += " unable ";
            sVerbal += Speed2Verbal(Number(sDetails)) + " knots";
            sText += Speed2Text(Number(sDetails)) + " Kts.";
            break;
        case INCREASE2SPEED:
            sVerbal += " roger, increasing to ";
            sText += " increasing to ";
            sVerbal += Speed2Verbal(Number(sDetails)) + " knots";
            sText += Speed2Text(Number(sDetails)) + " Kts.";
            break;
        case DECREASE2SPEED:
            sVerbal += " roger, decreasing to ";
            sText += " decreasing to ";
            sVerbal += Speed2Verbal(Number(sDetails)) + " knots";
            sText += Speed2Text(Number(sDetails)) + " Kts.";
            break;
        case MAINTAINSPEED:
            sVerbal += " roger, maintaining ";
            sText += " maintaining";
            sVerbal += Speed2Verbal(Number(sDetails)) + " knots";
            sText += Speed2Text(Number(sDetails)) + " Kts.";
            break;
        case PROCEEDING_DIRECT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled, ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Proceeding Direct ";
            sText += "Proceeding Direct ";
            //Handle special case where only one fix change on route
            var nRouteLength = aAircraft[iAC].aProposedRoute.length;
            if (nRouteLength === 1) {
                sVerbal+= aAircraft[iAC].aRoute[aAircraft[iAC].aProposedRoute[0].Item].LocName;
                sText += aAircraft[iAC].aRoute[aAircraft[iAC].aProposedRoute[0].Item].LocIdent;
                if (!(aAircraft[iAC].aRoute[aAircraft[iAC].aProposedRoute[0].Item].LocIdent === aAircraft[iAC].aRoute[aAircraft[iAC].aRoute.length - 1].LocIdent)){
                    sVerbal += ", Balance of flight planned route.";
                    sText += " F/P route";
                }


            }
            else {
                for (var i=0; i< aAircraft[iAC].aProposedRoute.length - 1; i++) {
                    if (aAircraft[iAC].aProposedRoute[i].Type === FIX) {
                        sVerbal+= aFixes[aAircraft[iAC].aProposedRoute[i].Item].FixLoc.LocName;
                        sText += aFixes[aAircraft[iAC].aProposedRoute[i].Item].FixLoc.LocIdent;
                        sVerbal += ", Direct ";
                        sText += " Direct ";
                    }
                    else if(aAircraft[iAC].aProposedRoute[i].Type === LATLONG) {
                        sVerbal += aAircraft[iAC].aProposedRoute[i].Item.LocName;
                        sText += aAircraft[iAC].aProposedRoute[i].Item.LocIdent;
                        sVerbal += ", Direct ";
                        sText += " Direct ";
                    }
                }
                sVerbal+= aAircraft[iAC].aRoute[aAircraft[iAC].aProposedRoute[nRouteLength - 1].Item].LocName;
                sText += aAircraft[iAC].aRoute[aAircraft[iAC].aProposedRoute[nRouteLength - 1].Item].LocIdent;
                if (!(aAircraft[iAC].aRoute[aAircraft[iAC].aProposedRoute[nRouteLength - 1].Item].LocIdent === aAircraft[iAC].aRoute[aAircraft[iAC].aRoute.length - 1].LocIdent)){
                    sVerbal += ", Balance of flight planned route.";
                    sText += " F/P route";
                }


            }
            break;
        case CLX_HDG_LEFT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Turning Left, Heading ";
            sText += "Turning Left Heading ";
            sVerbal += Heading2Verbal(sDetails);
            sText += Heading2Text(sDetails);
            break;
        case CLX_HDG_RIGHT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Turning Right, Heading ";
            sText += "Turning Right Heading ";
            sVerbal += Heading2Verbal(sDetails);
            sText += Heading2Text(sDetails);
            break;
        case CLX_HDG_STRAIGHT:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Maintaining Heading ";
            sText += "Maintaining Heading ";
            sVerbal += Heading2Verbal(sDetails);
            sText += Heading2Text(sDetails);
            break;
        case CLX_APPROACH:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += " Roger, Approach Cancelled, Maintaining Heading and Altitude";
                sText += "Appch Cancelled, Maintaining Heading and Altitude";
            }
            else {
                sVerbal += " Roger, Cleared ";
                sText += "Cleared to ";
                sVerbal += aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocName + " for ";
                sText += aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocIdent + " R";
                sVerbal += aAircraft[iAC].iArrRwy.sRunwayName + " Approach";
                sText += String(aAircraft[iAC].iArrRwy.nRunwayNumber) + " Appch";
            }

            break;
        case RQST_RTE:
            sVerbal += " Maintaining Heading, Request Instructions";
            sText += " Maintaining Heading, Request Instructions";
            break;
        case RQST_ALT:
            sVerbal += " Maintaining Altitude, Request Instructions";
            sText += " Maintaining Altitude, Request Instructions";
            break;
        case TWR_CANCEL_APPROACH:
            sVerbal += " back with you maintaining current heading and altitude, request instructions";
            sText += " with you requesting maintaing HDG and ALT, request instructions"
            break;
        case ENTER_HOLD4HANDOFF:
            sVerbal += "Overhead the airport, holding, requesting approach!";
            sText += "Overhead airport, RQST approach";
            break;
        case CLX_HOLDHERE:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled, ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Entering Hold";
            sText += "Entering Hold";
            break;
        case CLX_HOLDFIX:
            if (aAircraft[iAC].ACstatus === APPROACH) {
                sVerbal += "Roger, Approach Cancelled, ";
                sText += "Appch Cancelled, ";
            }
            else {sVerbal += "Roger, ";}
            sVerbal += "Direct " + aFixes[sDetails].FixLoc.LocName + " and hold";
            sText += "-> " + aFixes[sDetails].FixLoc.LocIdent + " and hold";
            break;
        case ENTERING_HOLD:
            sVerbal += "Entering Hold";
            sText += "Entering Hold";
            break;
    }
    if (aAircraft[iAC].bOnFrequency) {
        Speak(aAircraft[iAC].Pilot, sVerbal, PhraseDelivered);
        fAddPilotVoiceLogEntry(iAC, sText);
    }
    //handle special case where a/c just switchted to next frequency
    if (iAction === EXTERNAL_HANDOFF || iAction === TOWER_HANDOFF) aAircraft[iAC].bOnFrequency = false;
}
//-------------------------------------------------------------------
function Speak(Speaker, text, callback) {
    var FrequencyMessage = new SpeechSynthesisUtterance();
    FrequencyMessage.addEventListener("onend", PhraseDelivered, true);
    FrequencyMessage.onend = function () {
        if (callback) {
            callback();
        }
    };
    FrequencyMessage.onerror = function (e) {
        console.log("Error, Speak() Frequency Message OnError");
        if (callback) {
            callback(e);
        }
    };
    FrequencyMessage.pitch = Speaker.nPitch;
    FrequencyMessage.voice = aVoices[Speaker.iVoice];
    FrequencyMessage.text = text;
    FrequencyMessage.rate = 1.13;
    FrequencyMessage.volume = MasterVolume/10;
    //console.log(FrequencyMessage);
    voiceSynth.speak(FrequencyMessage);
}
//-------------------------------------------------------------------
function PhraseDelivered () {
    //console.log("End Message")
}
//-------------------------------------------------------------------
function fAddControllerVoiceLogEntry(Phrase) {
    var sString = "<p class='ControllerComm' >";
    sString += "<b>Controller:  </b>"
    sString += Phrase;
    sString += "</p>";
    hVoiceWindow.AddPaneText("CommLog", sString);
}
//-------------------------------------------------------------------
function fAddPilotVoiceLogEntry(iAC, Phrase) {
    var sString = "<p class='PilotComm' >";
    sString += "<b> " + aAircraft[iAC].ACIdent + ": </b>"
    sString += Phrase;
    sString += "</p>";
    hVoiceWindow.AddPaneText("CommLog", sString);
}
//-------------------------------------------------------------------
function fAddCoordVoiceLogEntry(Unit, Phrase) {
    var sString = "<p class='CoordinationComm' >";
    sString +=  Unit  + ":  ";
    sString += Phrase;
    sString += "</p>";
    hVoiceWindow.AddPaneText("CommLog", sString);
}
//-------------------------------------------------------------------
function fVolumeChanged(vUp) {
    if (vUp) {
        MasterVolume += 1;
        if (MasterVolume > 10) MasterVolume = 10;
    }
    else {
        MasterVolume -= 1;
        if (MasterVolume <0) MasterVolume = 0;
    }
    hControlWindow.UpdateLabel("lblVolume", "Vol. " + String(MasterVolume));
}
//-------------------------------------------------------------------

//********************************************************************************************************************
//-
//-     Various Aircraft related functions
//-
//******************************************************************
function fUpdateAllAircraft(Elapsed) {
    var CurrentNumberAC = 0;
    ACInHandoff = false;
    //Update all aircraft
    for (var i=0; i<aAircraft.length; i++) {
        aAircraft[i].UpdateAircraft(Elapsed);
        aAircraft[i].UpdateDataTag(ctxMap);
        //Determine if inbound aircraft is ready for a handoff
        if (!aAircraft[i].bOurControl && !aAircraft[i].bIBHO && !aAircraft[i].bHolding4Handoff) {
            var HandoffFeeler = aAircraft[i].CurrentPosition.V.NewPositionFromVector(aAircraft[i].ActualVector, HandoffBuffer);
            if (ActiveSector.IsPointInSector(HandoffFeeler.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom))) {
                aAircraft[i].bIBHO = true;
                aAircraft[i].bShowTag = true;
            }
            //Check if still far and set the flag either way (for the type of strip to show)
            if (aAircraft[i].bFar) {
                var FarFeeler = aAircraft[i].CurrentPosition.V.NewPositionFromVector(aAircraft[i].ActualVector, FarBuffer);
                if (ActiveSector.IsPointInSector(FarFeeler.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom))) {
                    aAircraft[i].bFar = false;
                }
            }
        }
        //and handle the case where handoff not accepted and aircraft too close to boundary and will hold
        else if (!aAircraft[i].bOurControl && aAircraft[i].bIBHO && !aAircraft[i].bHolding4Handoff) {
            var OffsideFeeler = aAircraft[i].CurrentPosition.V.NewPositionFromVector(
                aAircraft[i].ActualVector, OffsideBuffer);
            if (ActiveSector.IsPointInSector(OffsideFeeler.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom))) {
                fStartHold4Handoff(i);
                Score.IBHold++;
            }
        }
        //identify the need to update the map if aircraft in handoff mode (i.e. so it can flash)
        if (aAircraft[i].bIBHO) ACInHandoff = true;


        //Count if we're working for simultatenous a/c count
        if (aAircraft[i].ACstatus === ENROUTE && aAircraft[i].bOurControl) CurrentNumberAC++;
        if (aAircraft[i].ACstatus === APPROACH) CurrentNumberAC++;

        if (!(Elapsed) || !(aAircraft[i].ACstatus === ENROUTE)) continue;
        //console.log(aAircraft[i].ACIdent, IsAircraftInSector(aAircraft[i]));
        var bNowInSector = IsAircraftInSector(aAircraft[i]);
        if (!(bNowInSector) && aAircraft[i].bWasInSector) ProcessAircraftExiting(aAircraft[i]);
        aAircraft[i].bWasInSector = bNowInSector;
    }
    if (CurrentNumberAC > Score.MaxSimultaneousAC) Score.MaxSimultaneousAC = CurrentNumberAC;
}
//---------------------------------------------
function fDeselectAircraft() {
    bAircraftSelected = false;
    CurrentAC = null;
    fUpdateDisplay(false);
    fHideAircraftWindow();
    fUpdateDataboard();
}
//---------------------------------------------
function fSelectAircraft(iAC){
    bAircraftSelected = true;
    CurrentAC = aAircraft[iAC];
    SelectedAircraft = aAircraft[iAC].TransponderCode;
    fUpdateDisplay(false);
    fShowAircraftWindow();
    fUpdateDataboard();
}
//-------------------------------------------------------------------
function fGetAircraftIndex(nCode) {
    //cycle through aircraft array and return aircraft with the right code
    returnIndex = 0;
    for (var i=0; i<aAircraft.length; i++) {
        if (nCode === aAircraft[i].TransponderCode) {
            returnIndex = i;
            break;
        }
    }//end i
    return returnIndex;
}
//---------------------------------------------
function fStartHold4Handoff(iAC) {
    var sVerbal = ActiveSector.SectorName + ", Centre, Holding " + aAircraft[iAC].RadioTelephony;
    var sText = "Holding " + aAircraft[iAC].ACIdent;
    Speak(Coordinator, sVerbal);
    fAddCoordVoiceLogEntry("Centre", sText);
    aAircraft[iAC].EnterHold4Handoff();
}
//---------------------------------------------
function fClearRoutingChanges () {
    bSelectingRouteFixes = false;
    while (aDirectRoutePoints.length > 0) aDirectRoutePoints.shift();
}
//---------------------------------------------
function fClearHoldingChanges() {
    bSelectingHoldFix = false;
}
//---------------------------------------------
function fClearRBLChanges() {
    bSelectingRBL1 = false;
    bSelectingRBL2 = false;
    tempRBL1 = null;
}
//---------------------------------------------
function fProcessRouteAssignment() {
    //Direct route issued with the points in the route
    //identified in the aDirectRoutePoints array
    //Last fix in the array is an index into current route
    fIssueClearance(fGetAircraftIndex(SelectedAircraft), CLX_DIRECT, aDirectRoutePoints);
    //create the proposed route and attach to aircraft
    aAircraft[fGetAircraftIndex(SelectedAircraft)].ProposedRouteChange(aDirectRoutePoints);
    fClearRoutingChanges();
    fUpdateDisplay(false);
}
//---------------------------------------------
function fHandoffAircraftExternal() {

    if (speechSynthesis.speaking) {
        sndSayAgain.play();
        return;
    }
    var index = fGetAircraftIndex(SelectedAircraft);
    var HandoffFeeler = aAircraft[index].CurrentPosition.V.NewPositionFromVector(aAircraft[index].ActualVector, HandoffBuffer);
    if (!ActiveSector.IsPointInSector(HandoffFeeler.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom))) {
        aAircraft[index].HandoffExternal();
        fIssueClearance(index, EXTERNAL_HANDOFF, "");
        fUpdateDisplay(false);
    }
    else {
        Speak(Controller, "Out of Range", PhraseDelivered);
    }
}
//---------------------------------------------
function fTransferCommToTower() {
    if (speechSynthesis.speaking) {
        sndSayAgain.play();
        return;
    }
    var index = fGetAircraftIndex(SelectedAircraft);
    fIssueClearance(index, TOWER_HANDOFF, "");
}
//---------------------------------------------
function fCancelApproachClearance() {
    var sPhrase, sUnit;
    fCloseOpenDialogs();
    fClearRoutingChanges();
    fClearHoldingChanges();
    fClearRBLChanges();
    var iAC = fGetAircraftIndex(SelectedAircraft);
    if (aAircraft[iAC].bOnFrequency) {
        sPhrase = ActiveSector.SectorName + ", ";
        sPhrase += aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocName + " Tower, ";
        sPhrase += " not talking to " + aAircraft[iAC].RadioTelephony;
        Speak(Coordinator, sPhrase, PhraseDelivered);
        //send to comm list
        sUnit = aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocName + " Tower";
        sPhrase = "not talking to " + aAircraft[iAC].ACIdent;
        fAddCoordVoiceLogEntry(sUnit, sPhrase);
    }
    else {
        sPhrase = ActiveSector.SectorName + ", ";
        sPhrase += aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocName + " Tower, ";
        sPhrase += aAircraft[iAC].RadioTelephony + " coming to you";
        Speak(Coordinator, sPhrase, PhraseDelivered);
        //send to comm list
        sUnit = aAirports[aAircraft[iAC].iArrAP].AirportLoc.LocName + " Tower";
        sPhrase = aAircraft[iAC].ACIdent + " back over to you";
        fAddCoordVoiceLogEntry(sUnit, sPhrase);
        //Add the clearance to the aircraft action queue...
        aAircraft[iAC].aActionQueue.push(new cAction(TWR_CANCEL_APPROACH, "", 6));
    }

}
//---------------------------------------------
function IsAircraftInSector(AC) {
    return ActiveSector.IsPointInSector(AC.CurrentPosition.D);
}
//---------------------------------------------
function ProcessAircraftExiting(AC) {
    if (AC.bDeparture) Score.DepExitSector++;
    else Score.OverExitSector++;
    if (AC.ALTcleared !== AC.ALTrequested * 100) Score.WrongAlt++;
    if (AC.bOurControl){
        Score.LateHandoff++;
        fSendUserMessage(AC.ACIdent + " not handed off", MSGWARNING);
        sndDing.play();
    }
}
//********************************************************************************************************************
//-
//-     Miscellaneous and Helper functions
//-
//******************************************************************
function fClickedInTargetZone (ClickLoc, TargetLoc, nSize) {
    var xLeft = TargetLoc.x - nSize/2;
    var xRight = TargetLoc.x + nSize/2;
    var yTop = TargetLoc.y - nSize/2;
    var yBottom = TargetLoc.y + nSize/2;

    if (ClickLoc.x >= xLeft && ClickLoc.x <= xRight && ClickLoc.y >= yTop && ClickLoc.y <= yBottom) {return true;}
    else {return false;}
}
//-------------------------------------------------------------------
function Altitude2Verbal (thisAltitude) {
    //Takes an altitude in thousands of feet and returns a string that can be spoken
    var ReturnString;
    //input is an altitude in number format in thousands
    thisAltitude = Math.round(thisAltitude/100); //convert to flight level
    sAlt = String(thisAltitude);//convert to string
    if (thisAltitude > 179) {//if above FL180, then convert that way
        ReturnString = "Flight Level ";
        for (i = 0; i < this.sAlt.length; i++) {ReturnString += getTelephony(this.sAlt.substr(i, 1)) + " ";}
    }//end if altitude above FL180
    else {//if altitude is lower than FL180
        if (sAlt.length === 1) {
            ReturnString = getTelephony(sAlt) + " hundred";
        }
        else if (sAlt.length === 2) {
            ReturnString = getTelephony(sAlt.substr(0,1)) + " thousand";
            if (sAlt.substr(1,1) !== "0") ReturnString += " " + getTelephony(sAlt.substr(1,1)) + " hundred";
        }
        else if (sAlt.length ===3) {
            ReturnString = getTelephony(sAlt.substr(0,1)) +" " + getTelephony(sAlt.substr(1,1))+  " thousand";
            if (sAlt.substr(2,1) !== "0") ReturnString += " " + getTelephony(sAlt.substr(2,1)) + " hundred";
        }
    }
    //console.log(ReturnString);
    return ReturnString;
}
//-------------------------------------------------------------------
function Altitude2Text (thisAltitude) {
    //takes an altitude in thousands of feet and returns a string to display in the clearance box
    var ReturnString = String(Math.round(thisAltitude/100));
    if (thisAltitude/100 > 179) {ReturnString = "FL" + ReturnString;}
    return ReturnString;
}
//-------------------------------------------------------------------
function Heading2Verbal(thisHeading) {
    sHdg= String(thisHeading);
    if (sHdg.length === 1)sHdg = "00" + sHdg;
    if (sHdg.length === 2)sHdg = "0" + sHdg;
    var ReturnString = getTelephony(sHdg.substr(0,1)) + " " + getTelephony(sHdg.substr(1,1))+ " " + getTelephony(sHdg.substr(2,1));
    return ReturnString;
}
//-------------------------------------------------------------------
function Heading2Text (thisHeading) {
    sStringHdg= String(thisHeading);
    if (sStringHdg.length === 1)sStringHdg = "00" + sStringHdg;
    if (sStringHdg.length === 2)sStringHdg = "0" + sStringHdg;
    return sStringHdg;
}
//-------------------------------------------------------------------
function Speed2Verbal (thisSpeed) {
    var ReturnString;
    var sSpd = String(thisSpeed);
    if (sSpd.length === 2) {
        ReturnString = getTelephony(sSpd.substr(0,1)) + " " + getTelephony(sSpd.substr(1,1));
    }
    else if (sSpd.length === 3) {
        ReturnString = getTelephony(sSpd.substr(0,1)) + " " + getTelephony(sSpd.substr(1,1))+ " " + getTelephony(sSpd.substr(2,1));
    }
    else {
        ReturnString = " Problem - speed issue in Speed2Verbal";
    }
    return ReturnString;
}
//-------------------------------------------------------------------
function Speed2Text (thisSpeed) {
    return String(thisSpeed);
}
//---------------------------------------------
function getResponseTime(nScale) {
    return Math.random() * nScale + 4;
}
//---------------------------------------------
function getThree(nNumber) {
    var nString = String(nNumber);
    if (nString.length === 1) nString = "00" + nString;
    if (nString.length === 2) nString = "0" + nString;
    return nString;

}
//********************************************************************************************************************
//-
//-     File Loading and processing functions
//-
//******************************************************************
function fLoadFile(url){
    //set the flag
    bFileLoaded = false;
    //empty the string
    sFileData = null;
    //get the file and load
    fileRequest = new XMLHttpRequest();
    fileRequest.addEventListener("load", fTransferComplete, false);
    fileRequest.addEventListener("error", fTransferFailed, false);
    fileRequest.open("GET", url, true);
    fileRequest.send();
}
//-------------------------------------------------------------------
function fTransferComplete() {
    //remove event listeners
    fileRequest.removeEventListener("load", fTransferComplete, false);
    fileRequest.removeEventListener("error", fTransferFailed, false);
    //the transfer is showing complete....
    bFileLoaded = true;
    //put the response into the string
    sFileData = fileRequest.responseText;
    //console.log(fileRequest.status);
    //will show "complete" even if no file, so make sure that is covered....
    if (fileRequest.status === 404) {bFileLoaded = false;}

    if (iAppStatus === LOADING_SECTORFILE) fSectorFileLoaded();
    else if (iAppStatus === LOADING_SIMFILE) fSimFileLoaded();
    else if (iAppStatus === LOADING_TP143) fTP143Loaded();
    else if (iAppStatus === LOADING_TELEPHONY) fTelephonyLoaded();
    else if (iAppStatus === LOADING_GENFILE) fBuildGenerationFiles();
    else console.log("PROBLEM - in fLoadFileComplete");
}
//-------------------------------------------------------------------
function fTransferFailed() {
    //remove event listeners
    fileRequest.removeEventListener("load", fTransferComplete, false);
    fileRequest.removeEventListener("error", fTransferFailed, false);
    //set flag
    bFileLoaded = false;
    console.log("A file failed to load!  Fatal Error.  Terminating.");
}
//-------------------------------------------------------------------
function fLoadTelephony() {
    iAppStatus = LOADING_TELEPHONY;
    var sFilePath = "data/telephony.txt";
    fLoadFile(sFilePath);
}
//-------------------------------------------------------------------
function fLoadTP143() {
    //console.log ("fLoadTP143 entry...")
    iAppStatus = LOADING_TP143;
    var sFilePath = "data/acperf.txt";
    fLoadFile(sFilePath);
}
//-------------------------------------------------------------------
function fTelephonyLoaded() {
    var aLineData;
    var aData;
    var oObject;
    //reset the flag
    iAppStatus = NOACTION;
    //check it loaded!
    if (!bFileLoaded) console.log ("Airliners failed to load!");
    aData = sFileData.split("\n");
    while (aData.length > 0) {
        aLineData = aData.shift().split(" ");
        aTelephony.push(new cTelephony(aLineData.shift(), aLineData.shift()));
    }//end while
    //console.log(aTelephony);
    fLoadTP143();
}
//-------------------------------------------------------------------
function fTP143Loaded() {
    iAppStatus = NOACTION;
    //check it loaded!
    if (!bFileLoaded) console.log ("TP143 failed to load!");
    aTPData = sFileData.split("*");
    //get rid of top chunk which give the file explanation
    aTPData.shift();
    //process the file...
    while (aTPData.length > 0){
        aTP143.push(new cACType(aTPData.shift()));
    }
    //Now Load the sector file....
    fLoadSectorFile();
}
//-------------------------------------------------------------------
function fSimFileLoaded() {
    //sim file loaded successfully, reset the flag
    iAppStatus = NOACTION;
    //Break into chunks**************************************
    var aChunks = sFileData.split("**************************************");
    aSimFileData = aChunks.shift().split("\n");
    //Toss the first element since it is just the file header
    //should really check it says "Controller Sim File", but later...
    aSimFileData.shift();
    //Get the start time of the sim
    var sLine = aSimFileData.shift().substr(5);
    var nHour = Number(sLine.substr(0,2));
    var nMinute = Number(sLine.substr(3,2));
    var nSecond = Number(sLine.substr(6,2));
    tSimTime = new cMyTime(nHour, nMinute, nSecond);

    //get rid of second chunk which is just explanatory information
    aChunks.shift();

    //Chunk 3 is the wind
    var aSimFileData = aChunks.shift().split("\n");
    //get rid of blank line and line that just says "Wind"
    aSimFileData.shift();
    aSimFileData.shift();
    //get the High Wind
    sLine = aSimFileData.shift();
    aData = sLine.split(" ");
    HiWind = new cWind(Number(aData[0]), Number(aData[1]), Number(aData[2]));
    //get the Mid Level Wind
    sLine = aSimFileData.shift();
    aData = sLine.split(" ");
    MidWind = new cWind(Number(aData[0]), Number(aData[1]), Number(aData[2]));
    //get the Low wind
    //get the High Wind
    sLine = aSimFileData.shift();
    aData = sLine.split(" ");
    LoWind = new cWind(Number(aData[0]), Number(aData[1]), Number(aData[2]));
    //Based on the wind, determine the active runways
    for (var i=0; i< aAirports.length; i++ ) {
        aAirports[i].DetermineActiveRunway(LoWind.wDirection);
    }

    //chunk 4 is the aircraft list
    aSimFileData = aChunks.shift().split("\n");
    //First line is blank
    aSimFileData.shift();
    while (aSimFileData.length > 0) {aAircraft.push(new cAircraft(SCRIPTED, aSimFileData.shift(), 0, 0));}
    fReadyToStartSim();
}
//-------------------------------------------------------------------
function fSectorFileLoaded() {
    //sector file loaded successfully, set the flag
    iAppStatus = NOACTION;
    var aFileChunks = sFileData.split("**************************************");

    //Deal with Chunk 1 - Sector Information
    ActiveSector = new cSector(aFileChunks.shift());

    //Chunk 2 - Boundary Information
    var aSmallerChunks = aFileChunks.shift().split("++++++++++++++++++++++");
    while (aSmallerChunks.length > 0) aBoundaries.push(new cBoundary(aSmallerChunks.shift()));

    //Chunks 3,4,5,6 are overlays 1-4
    //Overlay 1
    var aSmallerChunks = aFileChunks.shift().split("++++++++++++++++++++++");
    //Check with the first smaller chunk if there is data
    var aLines = aSmallerChunks.shift().split("\n");
    if (aLines[2] === "DATA") {
        while (aSmallerChunks.length > 0) aOverlay1.push(new cBoundary(aSmallerChunks.shift()));
    }

    //Overlay 2
    var aSmallerChunks = aFileChunks.shift().split("++++++++++++++++++++++");
    //Check with the first smaller chunk if there is data
    var aLines = aSmallerChunks.shift().split("\n");
    if (aLines[2] === "DATA") {
        while (aSmallerChunks.length > 0) aOverlay2.push(new cBoundary(aSmallerChunks.shift()));
    }

    //Overlay 3
    var aSmallerChunks = aFileChunks.shift().split("++++++++++++++++++++++");
    //Check with the first smaller chunk if there is data
    var aLines = aSmallerChunks.shift().split("\n");
    if (aLines[2] === "DATA") {
        while (aSmallerChunks.length > 0) aOverlay3.push(new cBoundary(aSmallerChunks.shift()));
    }

    //Overlay 4
    var aSmallerChunks = aFileChunks.shift().split("++++++++++++++++++++++");
    //Check with the first smaller chunk if there is data
    var aLines = aSmallerChunks.shift().split("\n");
    if (aLines[2] === "DATA") {
        while (aSmallerChunks.length > 0) aOverlay4.push(new cBoundary(aSmallerChunks.shift()));
    }

    //Chunk 7 - Fixes
    var aLines = aFileChunks.shift().split("\n");
    aLines.shift();
    aLines.pop();
    while (aLines.length > 0) aFixes.push(new cFix(aLines.shift()));

    //Chunk 8 - Airways
    var aLines = aFileChunks.shift().split("\n");
    aLines.shift();
    aLines.pop();
    while (aLines.length > 0) aAirways.push(new cAirway(aLines.shift()));

    //Chunk 9 - Airports
    var aSmallerChunks = aFileChunks.shift().split("++++++++++++++++++++++");
    if (aSmallerChunks[0] === "\n")aSmallerChunks.shift();
    while (aSmallerChunks.length > 0) aAirports.push(new cAirport(aSmallerChunks.shift()));

    //set fake winds for now until scenario loaded or generated
    for (var i=0; i< aAirports.length; i++ ) {
        aAirports[i].DetermineActiveRunway(0);
    }

    //set the current parameters
    pCurrentMapCentre.Lat = ActiveSector.pDefaultMapCentre.Lat;
    pCurrentMapCentre.Long = ActiveSector.pDefaultMapCentre.Long;
    nCurrentZoom = ActiveSector.nDefaultZoom;
    bSectorLoaded = true;
    //update map positions
    fUpdateMapDisplayPositions();
    //now load or generate the scenario based on requested action
    fLoadScenario();
}
//-------------------------------------------------------------------
function fSectorFileLoadError () {
    console.log("ERROR - Error Loading Sector File!");
    //-------> Error handling code goes here.
    //unload the current sector file and sim file
    //return to the loading screen
}
//********************************************************************************************************************
//-
//-     Functions for randomly generated scenarios
//-
//******************************************************************
function fBuildGenerationFiles() {
    var aRouteLines;
    var aData = sFileData.split("++++++++++++++++++++++");
    //Delete the first chunk which is just the instructions
    aData.shift();
    //Break next chunk into each aircraft ident piece
    var aIdentChunks = aData.shift().split("-----");
    //with each of these pieces, create the cSimAC instance
    while (aIdentChunks.length) {
        ACDesc.push(new cSimAC(aIdentChunks.shift()));
    }


    //Create the three route arrays
    //First:  Arrivals
    aRouteLines = aData.shift().split("\n");
    aRouteLines.shift();
    aRouteLines.pop();
    while (aRouteLines.length) {
        aArrivalRoutes.push(aRouteLines.shift());
    }
    //Second: Departures
    aRouteLines = aData.shift().split("\n");
    aRouteLines.shift();
    aRouteLines.pop();
    while (aRouteLines.length) {
        aDepartureRoutes.push(aRouteLines.shift());
    }
    //third: overflights
    aRouteLines = aData.shift().split("\n");
    aRouteLines.shift();
    while (aRouteLines.length) {
        aOverflightRoutes.push(aRouteLines.shift());
    }
    fBuildSim();
}
//-------------------------------------------------------------------
function fBuildSim (){
    var SimIndex, sAircraftString, myRandom, nCode, i;

    for (var i=0; i< aAirports.length; i++ ) {
        aAirports[i].DetermineActiveRunway(LoWind.wDirection);
    }

    //Create all the aircraft
    //----ARRIVALS
    for (i=0; i<numArrivals; i++) {
        if (!bInternalAirports) break;
        sAircraftString = "Enroute Out ";
        nCode =  fGetRandomAircraft();

        sAircraftString += nCode[0] + " 50 50 ";
        SimIndex = Number(nCode[1]);
        myRandom = Math.floor(Math.random() * ACDesc[SimIndex].ArrivalRouteIndex.length);
        sAircraftString += aArrivalRoutes[ACDesc[SimIndex].ArrivalRouteIndex[myRandom]] + " 10 2";
        aAircraft.push(new cAircraft(CUSTOMIZED, sAircraftString, ARRIVAL, SimIndex));
    }
    //
    //----DEPARTURES
    //want these in time sequence so first create the times...
    var iDepTimes = new Array();
    for (var i=0; i<numDepartures; i++) {
        iDepTimes.push (Math.floor(1+ Math.random() * (numScenarioMinutes - 5)));
    }
    //sort the array appropriately
    iDepTimes.sort(function(a, b){return a-b});
    for (i=0; i<numDepartures; i++) {
        if (!bInternalAirports) break;
        sAircraftString = "Departure In ";
        nCode =  fGetRandomAircraft();
        sAircraftString += nCode[0] + " 0 0 ";
        SimIndex = Number(nCode[1]);
        myRandom = Math.floor(Math.random() * ACDesc[SimIndex].DepartureRouteIndex.length);
        sAircraftString += aDepartureRoutes[ACDesc[SimIndex].DepartureRouteIndex[myRandom]] + " " + Number(iDepTimes[i]);
        aAircraft.push(new cAircraft(CUSTOMIZED, sAircraftString, DEPARTURE, SimIndex));
    }
    //
    //----OVEDRFLIGHTS
    for (i=0; i<numOverflights; i++) {
        sAircraftString = "Enroute Out ";
        nCode =  fGetRandomAircraft();
        sAircraftString += nCode[0] + " 50 50 ";
        SimIndex = Number(nCode[1]);
        myRandom = Math.floor(Math.random() * ACDesc[SimIndex].OverflightRouteIndex.length);
        sAircraftString += aOverflightRoutes[ACDesc[SimIndex].OverflightRouteIndex[myRandom]] + " 10 2";
        aAircraft.push(new cAircraft(CUSTOMIZED, sAircraftString, OVERFLIGHT, SimIndex));
        //console.log(sAircraftString);
    }

    fStoreRandomFile();
    fReadyToStartSim();
}
//-------------------------------------------------------------------
function fStoreRandomFile() {
    //To store the last randomly created sim as a file so it can be reproduced
    sFileToWrite = "Controller Sim File" + "\n";
    var sTempString;
    var bOut;
    //Will create the file piece by piece
    var tempHour = String(tSimTime.Hour);
    if (tempHour.length < 2) tempHour = "0" + tempHour;
    var tempMinute = String(tSimTime.Minute);
    if (tempMinute.length < 2) tempMinute = "0" + tempMinute;

    sTempString = "time=" + tempHour + " " + tempMinute+ " 00 ;hh mm ss" + "\n";
    sFileToWrite += sTempString + "**************************************" + "\n";
    sFileToWrite += "This file has been generated by the application" + "\n";
    sFileToWrite += "It contains the last randomly generated sim run" + "\n";
    sFileToWrite += "**************************************" + "\n";
    //write the wind elements
    sFileToWrite += "Wind" + "\n";
    sFileToWrite += HiWind.wAltitude + " " + HiWind.wDirection + " " + Math.round(HiWind.wSpeed) + "\n";
    sFileToWrite += MidWind.wAltitude + " " + MidWind.wDirection + " " + Math.round(MidWind.wSpeed) + "\n";
    sFileToWrite += LoWind.wAltitude + " " + LoWind.wDirection + " " + Math.round(LoWind.wSpeed) + "\n";
    sFileToWrite += "**************************************" + "\n";
    //Now get the aircraft and write to the file:
    for (var i=0; i< aAircraft.length; i++) {
        sTempString = aAircraft[i].EnrouteStatus;
        if (sTempString == "Departure") {
            bOut = false;
        }
        else {
            if (aAircraft[i].bOurControl) {bOut = false;}
            else {bOut = true;}
        }
        //CJS status - i.e. in or out of the sector
        if (bOut) sTempString += " Out"
        else sTempString += " In";

        //Aircraft Ident
        if (aAircraft[i].bCivilIdent){ sTempString += " " + aAircraft[i].sDesignator + " XXX";}
        else {sTempString += " " + aAircraft[i].sDesignator + " " + aAircraft[i].sFlightNumber;}

        //Aircraft type
        sTempString += " " + aAircraft[i].sType + " " + aAircraft[i].sFlyAsType;

        //Altitudes
        if (aAircraft[i].EnrouteStatus == "Enroute") {
            sTempString += " " + Math.round(aAircraft[i].ALTcurrent / 100) + " " + Math.round(aAircraft[i].ALTcleared / 100);
        }
        else {
            sTempString += " 0 " + aAircraft[i].ALTrequested;
        }

        //Aircraft Route
        for (var j=0; j< aAircraft[i].aRoute.length; j++) {
            sTempString += " " + aAircraft[i].aRoute[j].LocIdent;
        }

        //Distance from next fix OR time until departure
        if (aAircraft[i].EnrouteStatus == "Enroute") {
            sTempString += " " + Math.round(aAircraft[i].DistanceToNextFix);
            sTempString += " " + String(aAircraft[i].NextFix + 1);
        }
        else {
            sTempString += " " + aAircraft[i].MinsToDeparture;
        }

        sFileToWrite += sTempString + "\n";
    }
    console.log("fStoreRandomFile contains sFileToWrite");


}
//-------------------------------------------------------------------
function fGetRandomAircraft () {
    var mySum, i;
    //note iType 0 - ARR, 1 - DEP 2 - OVER
    var myRandom = Math.random();

    mySum = 0;
    var iAC = 0;
    for (i=0; i< ACDesc.length; i++) {
        mySum += ACDesc[i].SimPercent;
        if (myRandom < mySum) {
            iAC = i;
            break;
        }
    }
    //Now figure the aircraft type
    myRandom = Math.random();
    mySum = 0;
    var TypeIndex = 0;
    for (i=0; i< ACDesc[iAC].aTypes.length; i++) {
        mySum += ACDesc[iAC].aTypes[i].TypePercent;
        if (myRandom < mySum) {
            TypeIndex = i;
            break;
        }
    }
    sReturnString = "";
    //Now generate the Ident from the above.....
    if (ACDesc[iAC].SimIdent === "CIVIL-L" || ACDesc[iAC].SimIdent === "CIVIL-M") {
        myRandom = Math.random();
        if (myRandom < .45) {
            sReturnString += "G" + fGetRandomLetter(3) + " XXX";
        }
        else if (myRandom < .9) {
            sReturnString += "F" + fGetRandomLetter(3) + " XXX";
        }
        else {
            sReturnString += "N" + fGetRandomFlightNum(4) + " XXX"
        }
    }
    else {
        if (Math.random() < 0.85) {
            sReturnString += ACDesc[iAC].SimIdent + " " + fGetRandomFlightNum(3);
        }
        else {
            sReturnString += ACDesc[iAC].SimIdent + " " + fGetRandomFlightNum(4);
        }
    }
    //add the aircraft type and Fly As...
    sReturnString += " " + ACDesc[iAC].aTypes[TypeIndex].SimType + " " + ACDesc[iAC].aTypes[TypeIndex].SimFlyAs;
    return [sReturnString, iAC];
}
//-------------------------------------------------------------------
function fGetRandomLetter(numLetters) {
    var sLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var sReturnString = "";
    for (var i=0; i<numLetters; i++) {
        var nRand = Math.floor(Math.random()* 26);
        sReturnString += sLetters.substr(nRand, 1);
    }
    return sReturnString;
}
//-------------------------------------------------------------------
function fGetRandomFlightNum(numDigits) {
    var sLetters = "0123456789";
    var sReturnString = "";
    for (var i=0; i<numDigits; i++) {
        var nRand = Math.floor(Math.random()* 10);
        sReturnString += sLetters.substr(nRand, 1);
    }
    return sReturnString;
}


