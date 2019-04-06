//Variable List
var aSectorList = [];
var hdlMainContainer, hdlHeaderBox, hdlSectorChoiceBox, hdlScenarioChoiceBox, hdlCustomizeBox, hLoadingScreen;
var sFileData;
var bFileLoaded;
var numSimFilesToLoad, numSimFilesLoaded;
var aSectors = [];
var iChosenSector;
var iChosenScenario;
//variables to hold the customized scenario data
var simHour, simMinute;
var pResp;
var numArrivals, numDepartures, numOverflights, tSimLength;
var nWindBrg, nWindSpd;
var fLoadingFlag;
const LOADINGSECTORS = 401;
const LOADINGSCENARIOS = 402;
var sectorPic;

///********************************************
//CLASSES
function cSector (sName,sFile, sDescription) {
    this.sName = sName;
    this.sFile = sFile;
    this.sDescription = sDescription
    this.aSimList = new Array();
    this.image = new Image();
    this.image.height = 225;
    this.image.width = 450;
    this.image.src = "sectors/" + this.sFile + "/" + this.sFile + ".png";
}
//...............................................
function cSim (sName, sFile, sDescription) {
    this.sName = sName;
    this.sFile = sFile;
    this.sDescription = sDescription;
}
///********************************************
//STARTUP FUNCTIONS
window.onload = function() {
    //get the loading screen handle
    hLoadingScreen = document.getElementById('LoadingDiv');
    hLoadingScreen.style.width = window.innerWidth + "px";
    hLoadingScreen.style.height = window.innerHeight + "px";

    //get handles to the various divs that are needed
    hdlMainContainer = document.getElementById("mainContainer");
    //all the container boxes
    hdlSectorChoiceBox = document.getElementById("sectorChoiceBox");
    hdlScenarioChoiceBox = document.getElementById("scenarioChoiceBox");
    hdlCustomizeBox = document.getElementById("customizeBox");
    sectorPic = document.getElementById("sectorImage");
    hdlScenarioList = document.getElementById("slctScenarioChoice");
    //Get the Customize Scenario information from local storage
    loadLocalStorage();
    //Set the flag and Load the sector list and associated data
    fLoadingFlag = LOADINGSECTORS;
    fLoadFile( "sectors/sectorlist.txt");
}
//.................................................................
function loadLocalStorage() {
    //Load the localStorage items or set the default if unavailable
    //get the saved sector number
    var tSector = localStorage.getItem("nSectorNumber");
    if (tSector) {
        iChosenSector = tSector;
    }
    else {
        iChosenSector = 0;
    }
    var tStart = localStorage.getItem("startTime");
    if (tStart) {
        simHour = Number(tStart.substr(0,2));
        simMinute = Number(tStart.substr(2,2));
    }
    else {
        simHour = 11;
        simMinute = 34;
    }
    //get the pilot response time
    var sRespond = localStorage.getItem("PilotResponse");
    if (sRespond) {pResp = sRespond;}
    else {pResp = "AVERAGE"}

    //get num aircraft and time
    var sBusy = localStorage.getItem("BusyRate");
    if (sBusy) {
        var aData = sBusy.split(" ");
        numArrivals = Number(aData.shift());
        numDepartures = Number(aData.shift());
        numOverflights = Number(aData.shift());
        tSimLength = Number (aData.shift());
    }
    else {
        numArrivals= 7;
        numDepartures = 7;
        numOverflights = 2;
        tSimLength = 20;
    }
    //get the scenario winds from the storage
    var sWind = localStorage.getItem("wWind");
    if (sWind) {
        aData = sWind.split(" ");
        nWindBrg = Number(aData.shift());
        nWindSpd = Number(aData.shift());
    }
    else {
        nWindBrg = 65;
        nWindSpd = 10;
    }
}
//.................................................................
function onSectorFileLoaded() {
    //file is loaded with sFileData...
    var sSectorName, sFileName, sSectorDescription;
    var aLines;
    var aFileChunks = sFileData.split("%");
    while (aFileChunks.length) {
        aLines = aFileChunks.shift().split("\n");
        //get rid of blank lines
        if(aLines[0].length < 2)aLines.shift();
        sSectorName = aLines.shift().substr(11);
        sFileName = aLines.shift().substr(9);
        sSectorDescription = aLines.shift().substr(12);
        aSectors.push(new cSector(sSectorName, sFileName, sSectorDescription));
    }
    
    //set flags for loading the sim files
    numSimFilesLoaded = 0;
    numSimFilesToLoad = aSectors.length;
    //start the loading of the sim files
    fLoadingFlag = LOADINGSCENARIOS;
    var url = "sectors/" + aSectors[0].sFile + "/simlist.txt";
    fLoadFile(url);
}
//.................................................................
function onSimFileLoaded()  {

    var sSimName, sFileName, sSimDescription;
    //Decode the loaded file into the appropriate arrays
    var aLines;
    var aFileChunks = sFileData.split("%");
    var nF = numSimFilesLoaded;
    while (aFileChunks.length) {
        aLines = aFileChunks.shift().split("\n");
        //get rid of blank lines
        if(aLines[0].length < 2)aLines.shift();
        sSimName = aLines.shift().substr(8);
        sFileName = aLines.shift().substr(9);
        sSimDescription = aLines.shift().substr(12);
        aSectors[nF].aSimList.push(new cSim(sSimName, sFileName, sSimDescription));
    }
    //increment the number of files loaded
    numSimFilesLoaded++;
    if (numSimFilesLoaded < numSimFilesToLoad) {
        var url = "sectors/" + aSectors[numSimFilesLoaded].sFile + "/simlist.txt";
        fLoadFile(url);
    }
    else {
        onAllSimFilesLoaded();
    }
}
//.................................................................
function onAllSimFilesLoaded () {
    //clean up interface
    fResetWindows();
    fShowSectorBox(0);
    //listen for events
    window.addEventListener('resize', fResetWindows, false);
    document.addEventListener("mousedown", fMouseDown, false);
    document.addEventListener("mouseup", fMouseUp, false);
    hLoadingScreen.style.display = "none";
}
///********************************************
//EVENTS
//-------------------------------------------------------------
//CLICK handler
function fMouseUp(event) {
    switch (event.target.id) {
        case "btnNextSector":
            iChosenSector++;
            if (iChosenSector > aSectors.length - 1) iChosenSector = 0;
            fShowSectorBox();
            break;
        case "btnPrevSector":
            iChosenSector--;
            if (iChosenSector < 0 ) iChosenSector = aSectors.length - 1;
            fShowSectorBox();
            break;
        case "btnScripted":
            //save the exercise number for later
            localStorage.setItem("nSectorNumber", iChosenSector);
            //Show the dynamic screen
            fShowScriptedBox();
            break;
        case "btnDynamic":
            //save the exercise number for later
            localStorage.setItem("nSectorNumber", iChosenSector);
            //Show the dynamic screen
            fShowCustomizeBox();
            break;
        case "btnScenToSector":
            fShowSectorBox();
            break;
        case "btnCustomToSector":
            fShowSectorBox();
            break;
        case "btnLaunchScripted":
            fLaunch(true);
            break;
        case "btnLaunchCustom":
            fLaunch(false);
            break;
    }
}
//-----------------------------------------------------------------
function fMouseDown(event) {
    if (event.target.className === "ExerciseChoice") {
        //means a different exercise has been selected
        iChosenScenario = Number(event.target.id);
        document.getElementById("descName").innerHTML = aSectors[iChosenSector].aSimList[iChosenScenario].sName;
        document.getElementById("descDescription").innerHTML = aSectors[iChosenSector].aSimList[iChosenScenario].sDescription;
        return;
    }
    switch (event.target.id) {
        case "btnHourUp":
            simHour++;
            if (simHour > 23) simHour = 0;
            document.getElementById("txtHour").innerHTML = needTwo(simHour);
            break;
        case "btnHourDown":
            simHour--;
            if (simHour < 0) simHour = 23;
            document.getElementById("txtHour").innerHTML = needTwo(simHour);
            break;
        case "btnMinuteUp":
            simMinute++;
            if (simMinute > 59) simMinute = 0;
            document.getElementById("txtMinute").innerHTML = needTwo(simMinute);
            break;
        case "btnMinuteDown":
            simMinute--;
            if (simMinute <0) simMinute = 59;
            document.getElementById("txtMinute").innerHTML = needTwo(simMinute);
            break;
        case "btnWindDirUp":
            nWindBrg+=5;
            if (nWindBrg > 360) nWindBrg = 5;
            document.getElementById("txtWindBearing").innerHTML = "BRG " + needThree(nWindBrg);
            break;
        case "btnWindDirDown":
            nWindBrg-=5;
            if (nWindBrg <0) nWindBrg = 355;
            document.getElementById("txtWindBearing").innerHTML = "BRG " + needThree(nWindBrg);
            break;
        case "btnWindSpdUp":
            nWindSpd+=5;
            if (nWindSpd > 45) nWindSpd= 45;
            document.getElementById("txtWindSpeed").innerHTML = needTwo(nWindSpd) + "Kt";
            break;
        case "btnWindSpdDown":
            nWindSpd-=5;
            if (nWindSpd < 0) nWindSpd= 0;
            document.getElementById("txtWindSpeed").innerHTML = needTwo(nWindSpd) + "Kt";
            break;
        case "btnSimLengthUp":
            tSimLength++;
            if (tSimLength > 60) tSimLength = 60;
            document.getElementById("txtSimLength").innerHTML = String(tSimLength)+ " Minutes";
            break;
        case "btnSimLengthDown":
            tSimLength--;
            if (tSimLength <10) tSimLength = 10;
            document.getElementById("txtSimLength").innerHTML = String(tSimLength)+ " Minutes";
            break;
        case "btnArrUp":
            numArrivals++;
            if (numArrivals > 149) numArrivals = 149;
            fUpdateAircraftCount();
            break;
        case "btnArrDown":
            numArrivals--;
            if (numArrivals < 0) numArrivals = 0;
            fUpdateAircraftCount();
            break;
        case "btnDepUp":
            numDepartures++;
            if (numDepartures > 149) numDepartures = 149;
            fUpdateAircraftCount();
            break;
        case "btnDepDown":
            numDepartures--;
            if (numDepartures < 0) numDepartures = 0;
            fUpdateAircraftCount();
            break;
        case "btnOverUp":
            numOverflights++;
            if (numOverflights > 149) numOverflights = 149;
            fUpdateAircraftCount();
            break;
        case "btnOverDown":
            numOverflights--;
            if (numOverflights < 0) numOverflights = 0;
            fUpdateAircraftCount();
            break;
        case "pilotQuick":
            pResp = "QUICK";
            break;
        case "pilotAverage":
            pResp = "AVERAGE";
            break;
        case "pilotSlow":
            pResp = "SLOW";
            break;
        case "pilotAwful":
            pResp = "AWFUL";
            break;
    }
}
//-------------------------------------------------------------------------------
function fUpdateAircraftCount() {
    document.getElementById("txtArr").innerHTML = String(numArrivals) + " Arrivals";
    document.getElementById("txtDep").innerHTML = String(numDepartures) + " Departures";
    document.getElementById("txtOver").innerHTML = String(numOverflights) + " Overflights";
    document.getElementById("txtTotalTraffic").innerHTML = "Handle " +
        String(numArrivals + numDepartures + numOverflights) + " Aircraft over";
}
//-------------------------------------------------------------
//Launcher
function fLaunch(bScenario) {
    var sText;
    //launch knowing iChosenSector and iChosenScenario
    //first verify we have support for this...
    if (typeof(Storage) === "undefined") {
        window.alert("Sorry, your browser does not support web storage, Please Upgrade");
        return;
    }

    //save the sector file
    var tN = aSectors[iChosenSector].sFile;
    var sSector = "sectors/" + tN + "/" + tN + ".sec";
    localStorage.setItem("sectorFile", sSector);

    if (bScenario) {
        localStorage.setItem("SessionType", "Scripted");
        var tS = aSectors[iChosenSector].aSimList[iChosenScenario].sFile;
        var sScenario = "sectors/" + tN + "/" + tS;
        //Store the data in the local session variables...
        localStorage.setItem("scenarioFile", sScenario);
    }

    else {
        localStorage.setItem("SessionType", "Custom");
        //save the feneration file name
        var sGen= "sectors/" + tN + "/" + tN + ".gen";
        localStorage.setItem("generationFile", sGen);
        sText = String(simHour) + " " + String(simMinute);
        localStorage.setItem("startTime", sText);
        sText = String(nWindBrg) + " " + String(nWindSpd);
        localStorage.setItem("wWind", sText);
        sText = String(numArrivals) + " " + String(numDepartures) + " " +
            String(numOverflights) + " " + String(tSimLength);
        localStorage.setItem("BusyRate", sText);
        localStorage.setItem("PilotResponse", pResp);
    }


    window.open("controller.html","_self");
}
///********************************************
//INTERFACE
//-------------------------------------------------------------
function fResetWindows() {
    var iWinWidth, iWinHeight;
    //get size of window
    iWinWidth = window.innerWidth;
    iWinHeight = window.innerHeight;
    //Place the main div at the appropriate location
    hdlMainContainer.style.left = (iWinWidth - 800)/2 + 'px';
    //hdlMainContainer.style.height = iWinHeight + 'px';
}
//-------------------------------------------------------------
//  SHOW?HIDE the various boxes
function fHideAllBoxes() {
    hdlSectorChoiceBox.style.display = "none";
    hdlScenarioChoiceBox.style.display = "none";
    hdlCustomizeBox.style.display = "none";
}
function fShowSectorBox() {
    sectorPic.src = aSectors[iChosenSector].image.src;
    document.getElementById("txtSectorName").innerHTML = aSectors[iChosenSector].sName;
    document.getElementById("txtSectorDescription").innerHTML = aSectors[iChosenSector].sDescription;
    fHideAllBoxes();
    hdlSectorChoiceBox.style.display = "block";
}
function fShowScriptedBox() {
    var nwOption;
     document.getElementById("txtSectorName3").innerHTML = "Sector: " + aSectors[iChosenSector].sName;
    //clean out scenarios in the list
    fc = hdlScenarioList.firstChild;
    while (fc) {
        hdlScenarioList.removeChild(fc);
        fc = hdlScenarioList.firstChild;
    }

    //Add the available scenarios
    for (var i=0; i< aSectors[iChosenSector].aSimList.length; i++) {
        nwOption = document.createElement("option");
        nwOption.className = "ExerciseChoice";
        nwOption.id = String(i);
        nwOption.innerHTML = aSectors[iChosenSector].aSimList[i].sFile;
        hdlScenarioList.appendChild(nwOption);
    }
    //show the first option as the selected item
    iChosenScenario = 0;
    hdlScenarioList.selectedIndex = 0;
    //load the appropriate sector name and description
    document.getElementById("descName").innerHTML = aSectors[iChosenSector].aSimList[iChosenScenario].sName;
    document.getElementById("descDescription").innerHTML = aSectors[iChosenSector].aSimList[iChosenScenario].sDescription;
    fHideAllBoxes();
    hdlScenarioChoiceBox.style.display = "block";
}
function fShowCustomizeBox() {
    fHideAllBoxes();
    document.getElementById("txtSectorName2").innerHTML = "Sector: " + aSectors[iChosenSector].sName;
    document.getElementById("txtHour").innerHTML = needTwo(simHour);
    document.getElementById("txtMinute").innerHTML = needTwo(simMinute);
    document.getElementById("pilotChoice").value = pResp;
    document.getElementById("txtSimLength").innerHTML = String(tSimLength) + " Minutes";
    document.getElementById("txtWindBearing").innerHTML = "BRG " + needThree(nWindBrg);
    document.getElementById("txtWindSpeed").innerHTML = needTwo(nWindSpd) + "Kt";
    document.getElementById("txtArr").innerHTML = String(numArrivals) + " Arrivals";
    document.getElementById("txtDep").innerHTML = String(numDepartures) + " Departures";
    document.getElementById("txtOver").innerHTML = String(numOverflights) + " Overflights";
    document.getElementById("txtTotalTraffic").innerHTML = "Handle " +
        String(numArrivals + numDepartures + numOverflights) + " Aircraft over";
    hdlCustomizeBox.style.display = "block";
}
//******************************************************************
//-
//-     File Loading and processing functions
//-
//******************************************************************
function fLoadFile(url){
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
    if (fileRequest.status === 404) {
        console.log("Missing File");
        bFileLoaded = false;
    }
    if (fLoadingFlag == LOADINGSECTORS) {
    onSectorFileLoaded();
    }
    else if (fLoadingFlag == LOADINGSCENARIOS) {
        onSimFileLoaded();
    }
}
//-------------------------------------------------------------------
function fTransferFailed() {
    //remove event listeners
    fileRequest.removeEventListener("load", fTransferComplete, false);
    fileRequest.removeEventListener("error", fTransferFailed, false);
    //set flag
    bFileLoaded = false;
    console.log("A file failed to load!  Fatal Error.  Terminating.", ERROR_MSG);
}
//******************************************************************
//-
//-     Helpers
//-
//******************************************************************
function needTwo(nNum) {
    var sTest = String(nNum);
    if (sTest.length === 1) sTest = "0" + sTest;
    return sTest;
}
//-------------------------------------------------------------------
function needThree(nNum) {
    var sTest = String(nNum);
    if (sTest.length === 1) sTest = "00" + sTest;
    if (sTest.length === 2) sTest = "0" + sTest;
    return sTest;
}
//-------------------------------------------------------------------
function getPercent(nNum) {
    nNum *= 100;
    nNum = Math.round(nNum);
    return (String(nNum) + "%");
}

