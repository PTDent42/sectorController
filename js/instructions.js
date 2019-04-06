//****************************************//
//
//  instructions.js created 2019-02-24
//
// contains code for instructions.html to provide helpfiles for sectorController
// COPYRIGHT - All Rights Reserved
//
//*****************************************
//********************************************************************************************************************
//-
//-     Global variables that are needed
//-
//******************************************************************
var hLoadingScreen;
var hMenuWindow;
var hHeaderWindow;
var hMainWindow;
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
    fSetupInterface();
};
//-------------------------------------------------------------------
function fSetupInterface() {

    //***************************************************
    //Create the interface elements required
    //*****************************************************
    CreateMenuWindow();
    CreateHeaderWindow();
    CreateMainWindow();
    //Window resize event
    window.addEventListener('resize', fResetWindows, false);
    //listen for mouse down/mouse up events
    document.addEventListener("mousedown", fMouseDown, false);
    document.addEventListener("touchstart", touch2Mouse, true);
    document.addEventListener("touchmove", touch2Mouse, true);
    document.addEventListener("touchend", touch2Mouse, true);
    fStartup();
}
//-------------------------------------------------------------------
function fStartup() {
    fResetWindows();
    ///hide the loading screen
    hLoadingScreen.style.display = "none";
}
//********************************************************************************************************************
//-
//-     INTERFACE functions
//-
//******************************************************************
function fResetWindows() {
    var offsetX = (window.innerWidth - (hMenuWindow.Location.W + hHeaderWindow.Location.W + 10))/2;
    hMenuWindow.MoveTo(offsetX, 10);
    hHeaderWindow.MoveTo (offsetX + 10 + hMenuWindow.Location.W, 10);
    hMainWindow.MoveTo(offsetX + 10 + hMenuWindow.Location.W, 95);
}
//-------------------------------------------------------------------
function CreateMenuWindow() {
    hMenuWindow = new Window("MenuWindow", "topwindow");
    with (hMenuWindow) {
        SetScrollY();
        Locate(0, 10, 200, 610);
        AddPane("MenuPane", "clearpane");
        LocatePane("MenuPane", 0,0,190, 100);
        AddMenuButton("MenuPane", "Back", "HOME", 1, "BACK");
        AddMenuButton("MenuPane", "navigation", "NAVIGATION", 1, "navigation");

    }
}
//-------------------------------------------------------------------
function CreateHeaderWindow() {
    hHeaderWindow = new Window("HeaderWindow", "topwindow");
    with (hHeaderWindow) {
        Locate(210, 10, 840, 75);
        AddPane("LogoPane", "clearpane");
        LocatePane("LogoPane", 0,0,200,75);
        AddPaneImage("LogoPane", "images/title.png", 0,0, 200, 75);
        AddPane("TitlePane", "clearpane");
        LocatePane("TitlePane", 200, 6, 500, 48);
        AddLabel("TitlePane", "lInstrTitle", "Instructions", "lblTitle", 0, 0, 500, 48);

    }
}
//-------------------------------------------------------------------
function CreateMainWindow() {
    hMainWindow = new Window("MainWindow", "topwindow");
    with (hMainWindow) {
        Locate(210, 95, 840, 525);

        AddPane("navPane", "clearpane");
        LocatePane("navPane", 0,0,840, 525);
        AddImage("navPane", "images/bigheadset.png", 200, 10, 200,200);
        AddLabel("navPane", "lLbl1", "Welcome to the instructions for sectorController.  Navigate this help app by clicking the buttons down the left hand side. Clicking HOME will bring you back to the sectorController main screen, and clicking NAVIGATION will bring you back to this screen.  Note the instruction section is under construction and not yet complete!", "pText", 150,30, 650, 40);
        AddLabel("navPane", "lLbl2", "GOALS -  provides an overview of what you are trying to accomplish and how it is scored", "pText", 20, 300, 800, 20);
        AddLabel("navPane", "lLbl3", "INTERFACE -  provides an overview of the funcationality available as well as an overview of the Main Map", "pText", 20, 350, 800, 20);
        AddLabel("navPane", "lLbl4", "CONTROLLING - gives some of the requirements for managing the movement of the aircraft, and delves into the specifics of the clearances and instructions you can provide", "pText", 20, 430, 800, 20);
    }
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
    console.log("class= " + event.target.className, "||", "id= " + event.target.id, "||", "Owner= ", event.target.Owner);
    console.log(event.target.MenuLink);

    if (event.target.id === "Back") {
        window.history.back();
        return;
    }



}