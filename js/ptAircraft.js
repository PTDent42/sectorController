//---------------------------------------------
//  AIRCRAFT CLASS
// COPYRIGHT - All Rights Reserved
//
//  Includes items specific to ATC and related to sectorController
//---------------------------------------------

//-----------------------------------------------------
//
//     Helper Classes and Functions
//
//------------------------------------------------------
function cLoc (sIdent, sName, inputType, Input) {
    this.LocIdent = sIdent;
    this.LocName = sName;
    if (inputType === POLAR) {
        this.P = new Polar3d(Input.Lat, Input.Long);
        this.V = this.P.getTriple();
    }
    else if (inputType === VECTOR) {
        this.V = new Vector3d(Input.x, Input.y, Input.z);
        this.P = this.V.getPolar3d();
    }
    this.D = new Vector2d();
}
//---------------------------------------------
function cRBLEnd (pType, pDetails) {
    this.pType = pType;
    this.pDetails=pDetails;
}
//---------------------------------------------
function StructRoutePoint(sType, Details) {
    this.Type = sType;
    this.Item = Details;
}
//---------------------------------------------
function fScale(nBottom, nTop, nValue, nLoVal, nHiVal) {
    nProportion = (nValue-nBottom)/(nTop-nBottom);
    return (nProportion * (nHiVal - nLoVal)) + nLoVal;
}
//---------------------------------------------
function getTASfromIAS(IAS, Altitude) {
    Altitude = Altitude/1000;
    return (IAS * (1 + (.015 * Altitude)));
}
//---------------------------------------------
function getIASfromTAS(TAS, Altitude) {
    Altitude = Altitude/1000;
    return (TAS/(1 + (.015 * Altitude)));
}
//-------------------------------------------------------------------
function IsAltitudeEastBound (FL) {
    //takes an altitude in 100's of feet (FL)
    //and returns true if eastbound
    var nFL=Math.round(FL/10);
    return (nFL % 2) ==1;
}
//-----------------------------------------------------
//
//    Sector Classes and Items
//
//------------------------------------------------------
//singular object to contain sector information
function cSector (sInput) {
    var aInput = sInput.split("\n");
    aInput.shift(); //Controller Sector File
    aInput.shift(); //SETUP
    //process sector name
    this.SectorName = aInput.shift().substr(5);
    //process the default view
    aLineData = aInput.shift().substr(5).split(",");
    this.pDefaultMapCentre = new Polar3d();
    this.pDefaultMapCentre.Lat = Number(aLineData.shift());
    this.pDefaultMapCentre.Long = Number(aLineData.shift());
    this.nDefaultZoom= Number(aLineData.shift());
    //process sector type (Circle or Polygon)
    if (aInput.shift().substr(5,1) === "C") {this.bSectorPoly = false}
    else {this.bSectorPoly = true}
    //process the boundary points and radius as appropriate
    this.aVertices = new Array();
    if (this.bSectorPoly) {
        var numPoints = Number(aInput.shift());
        for (var i=0; i<numPoints; i++) {
            aLineData = aInput.shift().split(",");
            var nLat = aLineData.shift();
            var nLong = aLineData.shift();
            this.aVertices.push (new cLoc("", "", POLAR, (new Polar3d(nLat, nLong))));
        }
    }
    else {
        //process it as a circle
        aLineData = aInput.shift().split(",");
        var nLat = aLineData.shift();
        var nLong = aLineData.shift();
        this.aVertices.push (new cLoc("", "", POLAR, (new Polar3d(nLat, nLong))));
        //console.log(this.aVertices);
        this.nRadius = Number(aLineData.shift());
        this.DisplayRadius = 0;
    }
    //get the required separation for the sector
    this.SeparationStandard = Number(aInput.shift().substr(4));
    //get the radar altitude
    this.RadarAltitude = Number(aInput.shift().substr(9));
    this.SectorCap = Number(aInput.shift().substr(10));
    this.Variation = Number(aInput.shift().substr(10));
}
cSector.prototype = {
    IsPointInSector: function (vDisplayPoint) {
        if (this.bSectorPoly) {
            return isPointInPoly(this.aVertices, vDisplayPoint);
        }
        else {//if the sector is a circle
            if (this.aVertices[0].D.distanceFrom(vDisplayPoint) < this.DisplayRadius) {return true;}
            else {return false;}
        }
    }
};
//----------------------------------------------------------
//boundary object to save boundaries
function cBoundary(sInput) {
    aLines = sInput.split("\n");
    aLines.shift();  //get rid of the blank line
    this.sType = aLines.shift().substr(5,1);
    this.nColor = fGetColor(Number(aLines.shift().substr(6,1)));
    this.aVertices = new Array();
    if (this.sType === "P") { //(type=Polygon)
        //get the number of points (Points=13)
        nPts = Number(aLines.shift().substr(7));
        for (var i=0; i<nPts; i++) {
            aLineData = aLines.shift().split(" ");
            nLat = Number(aLineData[0]) + Number(aLineData[1])/60 + Number(aLineData[2])/3600;
            nLong = Number(aLineData[3]) + Number(aLineData[4])/60 + Number(aLineData[5])/3600;
            nLong *= -1;
            this.aVertices.push(new cLoc("", "", POLAR, (new Polar3d(nLat, nLong))));
        }//end for
    }//end if
    else if (this.sType === "L") {//(type=Line)
        for (var i=0; i<2; i++) {
            aLineData = aLines.shift().split(" ");
            nLat = Number(aLineData[0]) + Number(aLineData[1])/60 + Number(aLineData[2])/3600;
            nLong = Number(aLineData[3]) + Number(aLineData[4])/60 + Number(aLineData[5])/3600;
            nLong *= -1;
            this.aVertices.push(new cLoc("", "", POLAR, (new Polar3d(nLat, nLong))));
        }//end for
    }//end else if
    else if (this.sType === "C") {//(type=Circle )
        aLineData = aLines.shift().split(" ");
        nLat = Number(aLineData[0]) + Number(aLineData[1])/60 + Number(aLineData[2])/3600;
        nLong = Number(aLineData[3]) + Number(aLineData[4])/60 + Number(aLineData[5])/3600;
        nLong *= -1;
        this.aVertices.push(new cLoc("", "", POLAR, (new Polar3d(nLat, nLong))));
        this.aVertices.push(new cLoc(aLineData[6], "", POLAR, new Polar3d()));
    }
}
//----------------------------------------------------------
function fGetColor(iIndex) {
    if (iIndex === 1) {return color_LINE1}
    else if (iIndex === 2) {return color_LINE2;}
    else if (iIndex === 3) {return color_LINE3;}
    else if (iIndex === 4) {return color_LINE4;}
    else if (iIndex === 5) {return color_LINE5;}
    else if (iIndex === 6) {return color_LINE6;}
}
//----------------------------------------------------------
//fix objects and associated <div> and <img>
function cFix(sInput) {

    var aLineData = sInput.split(" ");
    nLat = Number(aLineData[1]) + Number(aLineData[2])/60 + Number(aLineData[3])/3600;
    nLong = Number(aLineData[4]) + Number(aLineData[5])/60 + Number(aLineData[6])/3600;
    nLong *= -1;
    this.FixLoc = new cLoc(aLineData[0], aLineData[7], POLAR, new Polar3d(nLat, nLong));
    var FixType = aLineData[8];
    aLineData = null;
    if (FixType === "N") {this.iImageIndex = 1;}
    else if (FixType === "A") {this.iImageIndex = 0;}
    else if (FixType === "V") {this.iImageIndex = 6;}
    else if (FixType === "W") {this.iImageIndex = 7;}
    else console.log("MISSING" + FixType);
    this.DisplayFixName = false;

}
//----------------------------------------------------------
//airway objects
function cAirway(sInput){
    aLineData = sInput.split(" ");
    this.AirwayIdent = aLineData.shift();
    this.AirwayName = aLineData.shift();
    this.aFixIndex = new Array();
    while (aLineData.length > 0) {
        //get the next fix name from the array
        sLine = aLineData.shift();
        //correlate the name with the appropriate fix
        var tIndex = aFixes.findIndex(x => x.FixLoc.LocIdent === sLine);
        this.aFixIndex.push (tIndex);
    }//end while
}
//----------------------------------------------------------
//External airport objects and associated <div> and <img>
function cAirport(sInput) {
    if (!sInput) return;
    var aLines = sInput.split("\n");
    aLines.shift();
    var AirportIdent = aLines.shift();
    var AirportName = aLines.shift();
    this.DisplayAirportName = false;
    var aLineData = aLines.shift().split(" ");
    nLat = Number(aLineData[0]) + Number(aLineData[1])/60 + Number(aLineData[2])/3600;
    nLong = Number(aLineData[3]) + Number(aLineData[4])/60 + Number(aLineData[5])/3600;
    nLong *= -1;
    this.AirportLoc = new cLoc(AirportIdent, AirportName, POLAR, new Polar3d(nLat, nLong));
    //now determine if outside or inside the sector
    if (aLines.shift() === "Outside") {
        this.bInSector = false;
    }
    else {
        bInternalAirports = true;
        this.bInSector = true;
        //get elevation
        this.nElevation = Number(aLines.shift().substr(5));
        //get SID Altitude
        this.nSIDAltitude = Number(aLines.shift().substr(4));
        //Delete the line that says "Runways"
        aLines.shift();
        var numRunways = Number(aLines.shift());
        this.aRunwayEnds = new Array();
        for (i=0; i<numRunways * 2; i++) {
            var aLineData = aLines.shift().split(" ");
            nLat = Number(aLineData[0]) + Number(aLineData[1])/60 + Number(aLineData[2])/3600;
            nLong = Number(aLineData[3]) + Number(aLineData[4])/60 + Number(aLineData[5])/3600;
            nLong *= -1;
            this.aRunwayEnds.push(new cLoc("", "", POLAR, new Polar3d(nLat, nLong)));
        }
        //now get the Approaches
        //clear line that says "Approaches"
        aLines.shift();
        var numApproaches = Number(aLines.shift());
        this.aApproaches = new Array();
        for (i=0; i<numApproaches; i++) {
            var aRunwayData = [];
            var aStars = [];
            for (var j=0; j<7; j++) aRunwayData.push(aLines.shift());
            var numStars = Number(aLines.shift());
            for (j=0; j<numStars; j++) aStars.push(aLines.shift());
            this.aApproaches.push(new cApproach(aRunwayData, aStars));
        } //end i
    } //end else if

}
cAirport.prototype = {
    DetermineActiveRunway: function (nWindDirection) {
        if (!this.bInSector) return;
        this.ActiveRunway = 0;
        var BearingDifference = Math.abs(nWindDirection - this.aApproaches[0].nBearing);
        if (BearingDifference > 180) BearingDifference = 360 - BearingDifference;
        var BestBearingDifference = Math.abs(BearingDifference);
        //see if other runways are a better match
        if (this.aApproaches.length > 1) {
            for (var i=1; i<this.aApproaches.length; i++) {
                BearingDifference = Math.abs(nWindDirection - this.aApproaches[i].nBearing);
                if (BearingDifference > 180) BearingDifference = 360 - BearingDifference;
                if (Math.abs(BearingDifference) < BestBearingDifference) {
                    BestBearingDifference = Math.abs(BearingDifference);
                    this.ActiveRunway = i;
                }
            }//end for i
        }//end if
        //Now create the drawing points for the approach
        this.aApproachIconPts = new Array();
        //first drawing point is the threshold
        var ThresholdPoint = new Vector3d(this.aApproaches[this.ActiveRunway].tThreshold.x,
            this.aApproaches[this.ActiveRunway].tThreshold.y, this.aApproaches[this.ActiveRunway].tThreshold.z);
        var vVector = this.aApproaches[this.ActiveRunway].tFAF.subtract(this.aApproaches[this.ActiveRunway].tThreshold).getNorm();
        var TenMilesFinal = ThresholdPoint.NewPositionFromVector(vVector, 13);
        //Put the first point into the array
        this.aApproachIconPts.push(ThresholdPoint);
        //this.aApproachIconPts.push(TenMilesFinal);
        //now get the second point which is 1/2 mile perpendicular to the approach
        this.aApproachIconPts.push(TenMilesFinal.NewPositionFromBearing(this.aApproaches[this.ActiveRunway].nBearing + 90, 1.05));
        //third point is 9 miles final
        this.aApproachIconPts.push(ThresholdPoint.NewPositionFromVector(vVector, 12));
        //nextpoint perpendicular the other way
        this.aApproachIconPts.push(TenMilesFinal.NewPositionFromBearing(this.aApproaches[this.ActiveRunway].nBearing - 90, 1.05));
        //and connect back to the start
        this.aApproachIconPts.push(ThresholdPoint);
        //and draw a centre line out to the 9 mile point
        this.aApproachIconPts.push(ThresholdPoint.NewPositionFromVector(vVector, 12));
        //console.log(this.aApproachIconPts);
    }//end function
};//end prototype
//----------------------------------------------------------
//Runways
//---------------------------------------------
function cApproach(aLines, aStar) {
    var testBearing, nLat, nLong;
    this.nRunwayNumber = aLines.shift();
    this.sRunwayName = aLines.shift();
    this.nBearing = Number(aLines.shift().substr(4));
    //this.nBearing = ConvertToMagnetic(this.nBearing);
    this.nLength = Number(aLines.shift().substr(5))/6076.12;
    var sLine = aLines.shift().substr(4);
    aLineData = sLine.split(" ");
    nLat = Number(aLineData[0]) + Number(aLineData[1])/60 + Number(aLineData[2])/3600;
    nLong = Number(aLineData[3]) + Number(aLineData[4])/60 + Number(aLineData[5])/3600;
    nLong *= -1;
    this.tFAF = new Polar3d(nLat, nLong).getTriple();
    this.nFAFAltitude = Number(aLines.shift().substr(7));
    aLineData = aLines.shift().split(" ");
    aLineData.shift(); //get rid of the "THRESHOLD"
    nLat = Number(aLineData[0]) + Number(aLineData[1])/60 + Number(aLineData[2])/3600;
    nLong = Number(aLineData[3]) + Number(aLineData[4])/60 + Number(aLineData[5])/3600;
    nLong *= -1;
    this.tThreshold = new Polar3d(nLat, nLong).getTriple();
    this.nFAFDistance = this.tFAF.distanceFrom(this.tThreshold);
    //Determine the relevant approach points for this runway
    var vVector = this.tFAF.subtract(this.tThreshold).getNorm();
    this.tIF = this.tThreshold.NewPositionFromVector(vVector, IF_DISTANCE);
    testBearing = this.nBearing - 90;
    if (testBearing < 0) testBearing += 360;
    this.tIAF1 = this.tIF.NewPositionFromBearing(testBearing, IAF_DISTANCE);
    testBearing = this.nBearing + 90;
    if (testBearing > 360) testBearing -= 360;
    this.tIAF2 = this.tIF.NewPositionFromBearing(testBearing, IAF_DISTANCE);
    //setup distances for the various segments
    this.distIAFtoIF = IAF_DISTANCE;
    this.distIFtoFAF = this.tIF.distanceFrom(this.tFAF);
    this.distFAFtoThreshold = this.nFAFDistance;

    this.aStars = [];
    //Figure out the Stars
    while (aStar.length) this.aStars.push(new cStar(aStar.shift()));
}
function cStar(sLine) {
    var aLines = sLine.split(" ");
    this.Name = aLines.shift().trim();
    this.StarFixes = [];
    while (aLines.length) {
        this.StarFixes.push(aLines.shift().trim());
    }

}
//-----------------------------------------------------
//
//     Wind Classes and Items
//
//------------------------------------------------------
function cWind (wAltitude, wDirection, wSpeed) {
    this.wSpeed = wSpeed;
    this.wDirection = wDirection;
    this.wAltitude = wAltitude;
}
//---------------------------------------------
function CalculateWindAt(ThisAltitude) {
    var NowWind;
    if (ThisAltitude <= LoWind.wAltitude) {
        NowWind = LoWind;
    }
    else if (ThisAltitude >= HiWind.wAltitude) {
        NowWind = HiWind;
    }
    else if (ThisAltitude === MidWind.wAltitude) {
        NowWind = MidWind;
    }
    else if (ThisAltitude > LoWind.wAltitude && ThisAltitude < MidWind.wAltitude) {
        NowWind = new cWind(0,0,0);
        var AltRange = MidWind.wAltitude - LoWind.wAltitude;
        var Ratio = (ThisAltitude - LoWind.wAltitude)/AltRange;
        var DirRange = MidWind.wDirection - LoWind.wDirection;
        NowWind.wDirection = LoWind.wDirection + (DirRange * Ratio);
        var SpdRange = MidWind.wSpeed - LoWind.wSpeed;
        NowWind.wSpeed = LoWind.wSpeed + (SpdRange * Ratio);
    }
    else if (ThisAltitude > MidWind.wAltitude && ThisAltitude < HiWind.wAltitude) {
        NowWind = new cWind(0,0,0);
        var AltRange = HiWind.wAltitude - MidWind.wAltitude;
        var Ratio = (ThisAltitude - MidWind.wAltitude)/AltRange;
        var DirRange = HiWind.wDirection - MidWind.wDirection;
        NowWind.wDirection = MidWind.wDirection + (DirRange * Ratio);
        var SpdRange = HiWind.wSpeed - MidWind.wSpeed;
        NowWind.wSpeed = MidWind.wSpeed + (SpdRange * Ratio);
    }

    return new tWindComponent(NowWind.wDirection, NowWind.wSpeed);
}
//---------------------------------------------
function tWindComponent(wV, wS) {
    //Note - wind is given where it is coming FROM
    //so adjust to show where it is pointing...
    this.WindVector = wV;
    this.WindSpeed = wS;
}
//-----------------------------------------------------
//
//    Separation Classes and functions
//
//------------------------------------------------------
function SeparationEvent(SepType, iAC1, iAC2) {
    this.SepType = SepType;
    this.iAC1 = iAC1;
    this.iAC2 = iAC2;
    this.bValid = true;
}
//---------------------------------------------
//  TIMING and TIMER CLASSES
//---------------------------------------------
function cMyTime(tH, tM, tS) {
    this.Hour = tH;
    this.Minute = tM;
    this.Second = tS;
}
//-----------------------------------------------------
//
//    Voice related items
//
//------------------------------------------------------
function cPilot (VoiceNum, PitchNum) {
    this.iVoice = VoiceNum;
    this.nPitch = PitchNum;
}
//---------------------------------------------
function cTelephony (nCode, Phrase){
    this.nCode = nCode;
    this.Phrase = Phrase;
}
//---------------------------------------------
function cAction (ActionType, Details, nTimeToAction) {
    this.ActionType = ActionType;
    this.Details = Details;
    this.nTimeToAction = nTimeToAction;

}
//---------------------------------------------
function getTelephony(sInput) {
    var iFound = -1;
    for (var ctr=0; ctr<aTelephony.length; ctr++) {
        if (aTelephony[ctr].nCode === sInput) {
            iFound = ctr;
            break;
        }
    }
    //
    if (iFound === -1) {return "Missing";}
    else {return aTelephony[iFound].Phrase;}
}
//---------------------------------------------
function LatLong2Verbal(Phrase) {
    var sVerbal = Number2Verbal(Phrase.substr(0, 4));
    if (Phrase.substr(4,1) === "N") sVerbal += " North ";
    else sVerbal += " South ";
    sVerbal += Number2Verbal(Phrase.substr(5,4));
    if (Phrase.substr(9,1) === "W") sVerbal += " West";
    else sVerbal += " East";
    return sVerbal;
}
//---------------------------------------------
function Number2Verbal(Msg){
    var ReturnString = "";
    for (i = 0; i < Msg.length; i++)
        ReturnString += getTelephony(Msg.substr(i, 1)) + " ";
    return ReturnString;
}
//---------------------------------------------
function cSpeechQueueItem (ACIndex, MsgVerbal, MsgText) {
    this.MsgVerbal = MsgVerbal;
    this.MsgText = MsgText;
    this.ACIndex = ACIndex;
}
//---------------------------------------------
//Aircraft Type and Performance Functions
//----------------------------------------------
function cACType (sTypeData) {
    aLines = sTypeData.split("\n");
    aLines.shift();
    //break up the first line and load into appropriate sections
    aLineData = aLines.shift().split(",");
    this.ACType = aLineData.shift();
    this.Weight = aLineData.shift();
    this.PrefAlt = Number(aLineData.shift());
    this.MaxAlt = Number(aLineData.shift());
    this.MachSpeed = Number (aLineData.shift());
    this.TurnRate = Number(aLineData.shift());
    this.FTAS = Number(aLineData.shift());
    this.MaxDescent = Number(aLineData.shift());

    this.aCruiseSpeed = [];
    this.aClimbSpeed = [];
    this.aDescentSpeed = [];
    this.aClimbRate = [];
    this.aDescentRate = [];

    while (aLines.length > 1) {
        aLineData = aLines.shift().split(",");
        //dump the first element which just gives the altitude
        aLineData.shift();
        this.aCruiseSpeed.push(Number(aLineData.shift()));
        this.aClimbSpeed.push(Number(aLineData.shift()));
        this.aClimbRate.push(Number(aLineData.shift()));
        this.aDescentSpeed.push(Number(aLineData.shift()));
        this.aDescentRate.push(Number(aLineData.shift()));
    }
}
cACType.prototype = {
    getCruiseSpeed: function (Altitude) {
        Altitude = Math.round(Altitude/100);

        if (Altitude < 30) {
            return fScale(0,30,Altitude,this.aCruiseSpeed[0], this.aCruiseSpeed[1]);
        }
        else if (Altitude < 60) {
            return fScale(30,60,Altitude,this.aCruiseSpeed[1], this.aCruiseSpeed[2]);
        }
        else if (Altitude < 100) {
            return fScale(60,100,Altitude,this.aCruiseSpeed[2], this.aCruiseSpeed[3]);
        }
        else if (Altitude < 200) {
            return fScale(100,200,Altitude,this.aCruiseSpeed[3], this.aCruiseSpeed[4]);
        }
        else if (Altitude < 300) {
            return fScale(200,300,Altitude,this.aCruiseSpeed[4], this.aCruiseSpeed[5]);
        }
        else if (Altitude < 400) {
            return fScale(300,400,Altitude,this.aCruiseSpeed[5], this.aCruiseSpeed[6]);
        }
        else {
            return this.aCruiseSpeed[6];
        }
    },
    getClimbSpeed: function (Altitude) {
        Altitude = Math.round(Altitude/100);
        if (Altitude < 30) {
            return fScale(0,30,Altitude,this.aClimbSpeed[0], this.aClimbSpeed[1]);
        }
        else if (Altitude < 60) {
            return fScale(30,60,Altitude,this.aClimbSpeed[1], this.aClimbSpeed[2]);
        }
        else if (Altitude < 100) {
            return fScale(60,100,Altitude,this.aClimbSpeed[2], this.aClimbSpeed[3]);
        }
        else if (Altitude < 200) {
            return fScale(100,200,Altitude,this.aClimbSpeed[3], this.aClimbSpeed[4]);
        }
        else if (Altitude < 300) {
            return fScale(200,300,Altitude,this.aClimbSpeed[4], this.aClimbSpeed[5]);
        }
        else if (Altitude < 400) {
            return fScale(300,400,Altitude,this.aClimbSpeed[5], this.aClimbSpeed[6]);
        }
        else {
            return this.aClimbSpeed[6];
        }
    },
    getClimbRate: function (Altitude) {
        Altitude = Math.round(Altitude/100);
        if (Altitude < 30) {
            return fScale(0,30,Altitude,this.aClimbRate[0], this.aClimbRate[1]);
        }
        else if (Altitude < 60) {
            return fScale(30,60,Altitude,this.aClimbRate[1], this.aClimbRate[2]);
        }
        else if (Altitude < 100) {
            return fScale(60,100,Altitude,this.aClimbRate[2], this.aClimbRate[3]);
        }
        else if (Altitude < 200) {
            return fScale(100,200,Altitude,this.aClimbRate[3], this.aClimbRate[4]);
        }
        else if (Altitude < 300) {
            return fScale(200,300,Altitude,this.aClimbRate[4], this.aClimbRate[5]);
        }
        else if (Altitude < 400) {
            return fScale(300,400,Altitude,this.aClimbRate[5], this.aClimbRate[6]);
        }
        else {
            return this.aClimbRate[6];
        }
    },
    getDescentSpeed: function (Altitude) {

        Altitude = Math.round(Altitude/100);
        if (Altitude < 30) {
            return fScale(0,30,Altitude,this.aDescentSpeed[0], this.aDescentSpeed[1]);
        }
        else if (Altitude < 60) {
            return fScale(30,60,Altitude,this.aDescentSpeed[1], this.aDescentSpeed[2]);
        }
        else if (Altitude < 100) {
            return fScale(60,100,Altitude,this.aDescentSpeed[2], this.aDescentSpeed[3]);
        }
        else if (Altitude < 200) {
            return fScale(100,200,Altitude,this.aDescentSpeed[3], this.aDescentSpeed[4]);
        }
        else if (Altitude < 300) {
            return fScale(200,300,Altitude,this.aDescentSpeed[4], this.aDescentSpeed[5]);
        }
        else if (Altitude < 400) {
            return fScale(300,400,Altitude,this.aDescentSpeed[5], this.aDescentSpeed[6]);
        }
        else {
            return this.aDescentSpeed[6];
        }
    },
    getDescentRate: function (Altitude) {
        Altitude = Math.round(Altitude/100);
        if (Altitude < 30) {
            return fScale(0,30,Altitude,this.aDescentRate[0], this.aDescentRate[1]);
        }
        else if (Altitude < 60) {
            return fScale(30,60,Altitude,this.aDescentRate[1], this.aDescentRate[2]);
        }
        else if (Altitude < 100) {
            return fScale(60,100,Altitude,this.aDescentRate[2], this.aDescentRate[3]);
        }
        else if (Altitude < 200) {
            return fScale(100,200,Altitude,this.aDescentRate[3], this.aDescentRate[4]);
        }
        else if (Altitude < 300) {
            return fScale(200,300,Altitude,this.aDescentRate[4], this.aDescentRate[5]);
        }
        else if (Altitude < 400) {
            return fScale(300,400,Altitude,this.aDescentRate[5], this.aDescentRate[6]);
        }
        else {
            return this.aDescentRate[6];
        }
    }
};

//-----------------------------------------------------
//
//     Scoring Classes and Functions
//
//------------------------------------------------------
function ScoringStructure() {
    this.TotalScore = 0;
    this.TotalRunTime = 0;
    this.DepExitSector = 0;
    this.OverExitSector = 0;
    this.ArrLand = 0;
    this.MissedApproach = 0;
    this.NoCommTfr = 0;
    this.SepLoss = 0;
    this.TechLoss = 0;
    this.ContinuedSepLoss = 0;
    this.ContinuedTechLoss = 0;
    this.WrongAlt = 0
    this.DepMinDelay = 0;
    this.Transmission = 0;
    this.Pause = 0
    this.ACWorked = 0;
    this.LateHandoff = 0;
    this.MaxSimultaneousAC = 0;
    this.IBHold = 0;
    this.NoApproach = 0;
}
//-----------------------------------------------------
//
//     AIRCRAFT Items
//
//------------------------------------------------------
function cAircraft (ScenarioType, sFlightString, FlightPhase, SimIndex) {
    //Scenario Type - SCRIPTED or CUSTOMIZED
    //SflightString - line of text
    //FlightPhase - ARRIVAL, DEPARTURE, OVERFLIGHT
    //SimIndex - index into the ACDesc array which describes flight requirements for customized scenario

    //console.log(ScenarioType, sFlightString, FlightPhase, SimIndex);
    var i;
    //increment the transponder code index to give a unique id to this aircraft
    ACTransponderIndex++;
    this.TransponderCode = ACTransponderIndex;
    if (sFlightString === "") return;
    var aLineData = sFlightString.split(" ");

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //Break out all the information from sFlightString into temp variables
    //
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    this.EnrouteStatus = aLineData.shift();  //Enroute or Departure
    var tempCJS = aLineData.shift();  //In or Out
    var tempDesignator = aLineData.shift();  //ACA or similar
    var tempFlightNum = aLineData.shift();  // XXX for civil ident or flight number
    var tempType = aLineData.shift(); //aircraft type
    var tempFlyAs = aLineData.shift();  //aircraft fly as type
    var tempAlt1 = Number(aLineData.shift());
    var tempAlt2 = Number(aLineData.shift());

    //set some flags for whether in or out of sector
    //used to determine strip status and to assign points to the score
    this.bExitedSector = false;
    this.bWasInSector = false;

    //get route, but number of points depends on if departure or not.
    var aRoutePoints = [];
    var nT;
    if (this.EnrouteStatus=== "Departure") nT = 1;
    else nT = 2;
    //populate and clean all the route points into an array
    while (aLineData.length > nT) aRoutePoints.push(aLineData.shift());
    for (i = 0; i < aRoutePoints.length; i++) aRoutePoints[i] = aRoutePoints[i].trim();
    //pull last fix for an overflight, since it is a reference, not a route point (applies to dynamic not scripted)
    if (FlightPhase === OVERFLIGHT) var OverflightReferenceFix = aRoutePoints.pop();

    //1 (departures) or 2 (others) elements remaining.
    // for departures it is time to depart.
    // enroute it is minutes from fix followed by the fix number (i.e 10 5 = 10 minutes from fix 5 in the list)
    var tempTimeDepart = Number(aLineData.shift());
    this.MinsToDeparture = tempTimeDepart;
    var tempDistToFix = tempTimeDepart;
    //get next fix
    if (this.EnrouteStatus !== "Departure") {
        var tempNextFix = Number(aLineData.shift());
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //  Construct aircraft piece by piece
    //
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //**********************************************
    //    Aircraft Status
    //**********************************************
    if (this.EnrouteStatus=== "Enroute") {
        this.bDeparture = false;
        this.ACstatus = ENROUTE;

    }
    else {
        this.bDeparture = true;
        this.ACstatus = WAITING;
        this.nGroundSpeed = 0;

    }
    this.bVisible = !this.bDeparture;
    //**********************************************
    //    Aircraft Ident
    //**********************************************
    this.CreateAircraftIdent(tempDesignator, tempFlightNum);

    //**********************************************
    //    Aircraft Type
    //**********************************************
    this.CreateAircraftType(tempType, tempFlyAs);
    //**********************************************
    //    Aircraft Departure, Arrival, and Route Points
    //**********************************************
    var sDepAP = aRoutePoints[0];
    var sArrAP = aRoutePoints[aRoutePoints.length - 1];
    this.numRtePts = aRoutePoints.length;
    //Identify if the aircraft is departing from or arriving to the control sector
    // and identify the indices for the airport array
    //Find the index for the departure airport
    this.iDepAP = -1;
    this.bDepartControlSector = false;
    for (var i=0; i<aAirports.length; i++) {
        if (sDepAP === aAirports[i].AirportLoc.LocIdent) {
            this.iDepAP = i;
            this.bDepartControlSector = true;
            break;
        }
    }
    //find the index for the arrival airport
    this.iArrAP = -1;
    this.bArriveControlSector = false;
    for (i=0; i<aAirports.length; i++) {
        if (sArrAP === aAirports[i].AirportLoc.LocIdent) {
            this.iArrAP = i;
            this.bArriveControlSector = aAirports[i].bInSector;
            break;
        }
    }
    //now get the locations of each route point
    this.aRoute = [];
    //First check for route points that are STARS and insert the appropriate fixes into the array
    //These should ONLY be at the route point before the destination
    if (aRoutePoints.length > 2) {
        var tstFix = aRoutePoints[aRoutePoints.length - 2];
        if (tstFix.substr(0,1) === "*") {
            tstFix = tstFix.substr(1);
            var tempApproach = aAirports[this.iArrAP].aApproaches[aAirports[this.iArrAP].ActiveRunway];
            for (i=0; i< tempApproach.aStars.length; i++) {
                if (tstFix === tempApproach.aStars[i].Name) {
                    var tempStar = i;
                    break;
                }
            }
            //Remove the * item from the array first
            aRoutePoints.splice(-2,1);

            //the array of fixes is at tempApproach.aStars[tempStar].StarFixes[];
            for (i=0; i<tempApproach.aStars[tempStar].StarFixes.length; i++) {
                tstFix = tempApproach.aStars[tempStar].StarFixes[i];
                aRoutePoints.splice(-1,0,tstFix);
            }
        }
    }
    for (i=0; i< aRoutePoints.length; i++) {
        //determine if this is a LAT/LONG which is in the form +4940N9734W, or STAR which starts with *
        if (aRoutePoints[i].substr(0,1) === "+") {
            var Lat = Number(aRoutePoints[i].substr(1,2)) + (Number(aRoutePoints[i].substr(3,2))/60);
            if (aRoutePoints[i].substr(5,1) === "S") Lat *= -1;
            var Long = Number(aRoutePoints[i].substr(6,2))  + (Number(aRoutePoints[i].substr(8,2))/60);
            if (aRoutePoints[i].substr(10,1) === "W") Long *= -1;
            this.aRoute.push(new cLoc(aRoutePoints[i].substr(1), LatLong2Verbal(aRoutePoints[i].substr(1)), POLAR, new Polar3d(Lat, Long)));
        }// end if Lat/Long
        else {
            for (var j=0; j<aFixes.length; j++) {
                if (aRoutePoints[i] === aFixes[j].FixLoc.LocIdent) {
                    this.aRoute.push(new cLoc(aFixes[j].FixLoc.LocIdent, aFixes[j].FixLoc.LocName, POLAR, new Polar3d(aFixes[j].FixLoc.P.Lat, aFixes[j].FixLoc.P.Long)));
                    break;
                }
            }//for j
        }
    }// for i
    //Finally Determine if the route is eastbound or westbound...
    this.bEastbound = false;
    var RouteBearing = FindBearing(this.aRoute[0].P, this.aRoute[this.aRoute.length - 1].P);
    if (!RouteBearing) console.log("Route Bearing Error: " + this.ACIdent, this.aRoute[0].P, this.aRoute[this.aRoute.length - 1].P, RouteBearing);
    if (RouteBearing > 0 && RouteBearing <= 180) this.bEastbound = true;
    this.numRtePts = aRoutePoints.length;
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //  Place aircraft at appropriate location and set the altitudes
    //
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if (this.bDeparture) {
        //if departure, place a/c at the airport location
        this.CurrentPosition = new cLoc("", "", VECTOR, new Vector3d(aAirports[this.iDepAP].AirportLoc.V.x, aAirports[this.iDepAP].AirportLoc.V.y, aAirports[this.iDepAP].AirportLoc.V.z));
        //convert time to depart to seconds:
        //determine proposed departure time
        tempTimeDepart *= 60;

        this.ProposedDepartureTime = fGetFutureTime(tempTimeDepart);
        //set time until taxi, or set status to Taxi if within the window
        if (tempTimeDepart > 300) this.TimeUntilTaxi = tempTimeDepart - 300 + (Math.random() * 20);
        else {
            this.ACstatus = TAXIING;
            if (tempTimeDepart <= 60) {
                this.TimeUntilRequestRelease = 60 + (Math.random() * 20);
            }
            else {
                this.TimeUntilRequestRelease = tempTimeDepart - 30;
            }
        }
        this.NextFix = 1;
        if (ScenarioType === SCRIPTED) this.ALTrequested = tempAlt2;
        else {
            this.ALTrequested = this.ALTpref;
            //Lower altitude if above service cap
            if (this.ALTrequested > ActiveSector.SectorCap) this.ALTrequested = ActiveSector.SectorCap;
            //identify if this is right way
            if (this.bEastbound && !IsAltitudeEastBound(this.ALTrequested)) this.ALTrequested -= 10;
            if (!this.bEastbound && IsAltitudeEastBound(this.ALTrequested)) this.ALTrequested -= 10;
        }
    }
    else {
        var FirstFixPos, NextFixPos, Vector1;
        if (ScenarioType === SCRIPTED) {
            //Handle case of a scripted scenario
            this.DistanceToNextFix = tempDistToFix;
            this.NextFix = tempNextFix - 1;
            this.LastFix = this.NextFix - 1;
            FirstFixPos = this.aRoute[this.LastFix].V;
            NextFixPos = this.aRoute[this.NextFix].V;
            Vector1 = FirstFixPos.subtract(NextFixPos).getNorm();
            this.CurrentPosition = new cLoc("", "", VECTOR, NextFixPos.NewPositionFromVector(Vector1, this.DistanceToNextFix));
            //console.log(this.CurrentPosition);
            this.ActualVector = NextFixPos.subtract(FirstFixPos).getNorm();
            //Get altitudes
            this.ALTcurrent = tempAlt1 * 100;
            this.ALTcleared = tempAlt2 * 100;
        }//end if SCRIPTED
        else {
            //Handle case where we are generating location...
            //First choose an enroute altitude for the aircaft:
            var tempAltitude = ACDesc[SimIndex].OutAltMin;
            var nDif = (ACDesc[SimIndex].OutAltMax - ACDesc[SimIndex].OutAltMin)/10;
            nDif = Math.floor(Math.random() * nDif);
            tempAltitude += nDif * 10;
            if (this.bEastbound) {if (!IsAltitudeEastBound(tempAltitude))tempAltitude -= 10;}
            else {if (IsAltitudeEastBound(tempAltitude)) tempAltitude -= 10;}
            tempAltitude *= 100;
            //Deal with the ARRIVALS
            if (FlightPhase === ARRIVAL) {
                //Build a profile for the aircraft.
                //Determine average descent rate and speed
                var APElev = aAirports[this.iArrAP].nElevation;
                var dRate1 = aTP143[this.typeIndex].getDescentRate(tempAltitude);
                var dRate = (dRate1 + aTP143[this.typeIndex].getDescentRate(APElev))/2;
                var spd1 = aTP143[this.typeIndex].getDescentSpeed(tempAltitude);
                var spd = (spd1+ aTP143[this.typeIndex].getDescentSpeed(APElev))/2;
                var CruiseSpeed = aTP143[this.typeIndex].getCruiseSpeed(tempAltitude);
                //determine how far back from airport they need to start descent
                var nTimeToDescend = (tempAltitude - APElev)/dRate;
                var DescentDistance =spd * nTimeToDescend/60;
                //Determine a number of minutes from start of run for aircraft to hit airport
                var nDistFromAirport = 0;
                var rArrivalMinute = 5 + Math.floor(Math.random() * (numScenarioMinutes - 3));
                //figure the distance from the airport and altitude
                if (rArrivalMinute < nTimeToDescend) {
                    nDistFromAirport = rArrivalMinute/60 * spd;
                    tempAltitude = (rArrivalMinute/nTimeToDescend * tempAltitude);
                    tempAltitude = Math.ceil(tempAltitude/1000) * 1000;
                }
                else {
                    nDistFromAirport = DescentDistance + ((rArrivalMinute - nTimeToDescend)/60 * CruiseSpeed);
                }
                //Now determine which is the "NextFix" and the distance from that fix by backing up...
                //First determine if the next fix is the airport...
                var bDone = false;
                if (this.aRoute.length === 2) {
                    this.DistanceToNextFix = nDistFromAirport;
                    bDone = true;
                }
                else {
                    var AirportLegDistance =
                        aAirports[this.iArrAP].AirportLoc.V.distanceFrom(this.aRoute[this.aRoute.length - 2].V);
                    if (nDistFromAirport < AirportLegDistance) {
                        this.NextFix = this.aRoute.length - 1;
                        this.DistanceToNextFix = nDistFromAirport;
                        bDone = true;
                    }
                }
                if (!bDone) {
                    var whichFix = this.aRoute.length - 2;
                    var remainingDistance = nDistFromAirport - AirportLegDistance;
                    while (whichFix > 1) {
                        var LegDistance = this.aRoute[whichFix].V.distanceFrom(this.aRoute[whichFix - 2].V);
                        if (remainingDistance < LegDistance) {
                            this.NextFix = whichFix;
                            this.DistanceToNextFix = remainingDistance;
                            bDone = true;
                            break;
                        }
                        remainingDistance -= LegDistance;
                        whichFix--;
                    }
                }
                if (!bDone) {
                    this.NextFix = whichFix;
                    this.DistanceToNextFix = remainingDistance;
                }
            }//end if flightphase = arrival
            else if (FlightPhase === OVERFLIGHT) {
                var CruiseSpeed = aTP143[this.typeIndex].getCruiseSpeed(tempAltitude);
                //Determine the time at the reference fix and distance to fly there...
                var rFixMinute = Math.floor(Math.random() * (numScenarioMinutes - 3));
                var remainingDistance = rFixMinute/60 * CruiseSpeed;
                var whichFix = -1;
                //Determine which is the reference fix (i.e. which number)
                for (var i=0; i< this.aRoute.length; i++) {
                    if (this.aRoute[i].LocIdent === OverflightReferenceFix) {
                        whichFix = i;
                        break;
                    }
                }

                bDone = false;
                if (!bDone) {
                    while (whichFix > 0) {
                        var LegDistance = this.aRoute[whichFix].V.distanceFrom(this.aRoute[whichFix - 1].V);
                        if (remainingDistance < LegDistance) {
                            this.NextFix = whichFix;
                            this.DistanceToNextFix = remainingDistance;
                            bDone = true;
                            break;
                        }
                        remainingDistance -= LegDistance;
                        whichFix--;
                    }
                }
                if (!bDone) {
                    this.NextFix = 0;
                    this.DistanceToNextFix = remainingDistance;
                }
            }//end if flight phase = overflight
            NextFixPos = this.aRoute[this.NextFix].V;
            FirstFixPos = this.aRoute[this.NextFix - 1].V
            Vector1 = FirstFixPos.subtract(NextFixPos).getNorm();
            this.CurrentPosition = new cLoc("", "", VECTOR, NextFixPos.NewPositionFromVector(Vector1, this.DistanceToNextFix));
            //console.log(this.CurrentPosition);
            this.ActualVector = NextFixPos.subtract(FirstFixPos).getNorm();
            this.ALTcurrent = tempAltitude;
            this.ALTcleared = tempAltitude;
        }//end if unscripted....
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //  Set control, tag, and frequency status
    //
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if (tempCJS === "In") {
        this.bOurControl = true;
        this.bShowTag = true;
        this.bOnFrequency = true;
    }
    else {
        this.bOurControl = false;
        this.bShowTag = false;
        this.bOnFrequency = false;
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //  Update data for customized scenario - all a/c by default are OUT, so review and update based on location
    //
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if (ScenarioType === CUSTOMIZED) {
        //Determine if the aircraft is IN the sector...
        if (ActiveSector.IsPointInSector(this.CurrentPosition.V.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom))) {
            this.bOurControl = true;
            this.bShowTag = true;
            this.bOnFrequency = true;
        }
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //  Update climbing/descending status
    //
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //identify climbing/descending....
    if (this.ALTcurrent < this.ALTcleared) {
        this.bClimbing = true;
        this.bDescending = false;
    }
    else if (this.ALTcurrent > this.ALTcleared) {
        this.bClimbing = false;
        this.bDescending = true;
    }
    else {
        this.bClimbing = false;
        this.bDescending = false;
    }
    if (this.bDeparture){
        this.bClimbing = false;
        this.bDescending = false;
        if (this.Weight === "L") {this.TAS = 80;}
        else {this.TAS = 130;}
    }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //
    //  Cleanup and add remaining items
    //
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if (!this.ALTrequested) this.ALTrequested = this.ALTcleared/100;
    if (!this.bOurControl) this.iImageIndex = 2;
    this.aTrailDots = [];
    //create the trail dots array
    for (var i=0; i< nNumTrailDots; i++) this.aTrailDots.push(this.CurrentPosition.V.vCopy());
    this.aActionQueue = [];
    this.myIndex = 0;
    this.bShowPTL = false;
    this.bShowHalo = false;
    this.bDisplayRoute = false;
    this.aApproachPoints = new Array();
    this.touchdownAltitude = 0;
    this.NextApproachPoint = 0;
    this.bIBHO = false;
    this.bHolding4Handoff = false;
    this.bHolding4Approach = false;
    this.bAssignedHeading = false;
    this.nAssignedHeading = 0;
    this.bTurnDirectionRight = false;
    this.TAS = 0;
    this.IAS = 0;
    this.bAssignedSpeed = false;
    this.nAssignedSpeed = null;
    this.MinSpeed = aTP143[this.typeIndex].getDescentSpeed(0);
    this.timeUntilOffRunway = 0;
    this.DepartureAccelerationTime = 0;
    this.bHoldingHere = false;
    this.bHoldingFix = false;
    this.cHoldFix = null;
    this.bFar = true;
    this.bShortFinal = false;
    //Determine the aircraft TAS based on status
    if (this.ACstatus === ENROUTE) {
        if (this.ALTcurrent < this.ALTcleared) {
            //aircraft is climbing
            this.TAS = aTP143[this.typeIndex].getClimbSpeed(this.ALTcurrent);
        }
        else if (this.ALTcurrent > this.ALTcleared) {
            //aircraft is descending
            this.TAS = aTP143[this.typeIndex].getDescentSpeed(this.ALTcurrent);
        }
        else {
            //aircraft is level
            this.TAS = aTP143[this.typeIndex].getCruiseSpeed(this.ALTcurrent);
        }
        this.UpdateGroundSpeed();
    }
    //Create the data tag for the aircraft
    this.Tag = new cDataTag();
    //choose the pilot voice characteristics
    this.Pilot = new cPilot(Math.floor(Math.random() * aVoices.length), Math.random() * 0.5 + 0.5);
    //Determine and hold the arrival runway if an arrival in this sector
    //note this.iArrAP is index in aAirports of arrival airport
    if (this.bArriveControlSector) {
        this.iArrRwy = aAirports[this.iArrAP].aApproaches[aAirports[this.iArrAP].ActiveRunway];
    }
}
//-------------------------------------------------------------------
cAircraft.prototype = {
    CreateAircraftIdent: function (Designator, FlightNum) {
        this.sDesignator = Designator;
        if (FlightNum === "XXX") {
            this.bCivilIdent = true;
            this.sFlightNumber = "";
        }
        else {
            this.bCivilIdent = false;
            this.sFlightNumber = FlightNum;
        }
        this.ACIdent = this.sDesignator + this.sFlightNumber;
        //create the radio telephony for the flight ident
        var sPhrase = "";
        var iFound = -1;
        if (!this.bCivilIdent) {//if not civil ident
            //get the airline designator from the list
            sPhrase += getTelephony(this.sDesignator) + " ";
            //break the flight number into sections and add
            for (i = 0; i < this.sFlightNumber.length; i++) {
                sPhrase += getTelephony(this.sFlightNumber.substr(i, 1)) + " ";
            }
        }
        else {//if it is a civil ident
            for (i=0; i<this.sDesignator.length; i++) {sPhrase += getTelephony(this.sDesignator.substr(i, 1)) + " ";}
        }
        this.RadioTelephony = sPhrase;
    },
    //-------------------------------------------------------------------
    CreateAircraftType: function (sType, sFlyAs) {
        this.sType = sType;
        this.sFlyAsType = sFlyAs.trim();
        //Pull the data from aTP143 file for the aircraft type
        var iFound = -1;
        for (var i=0; i<aTP143.length; i++) {
            if (this.sFlyAsType === aTP143[i].ACType) {iFound=i;}
        }
        if (iFound === -1) {
            console.log ("Didn't find an aircraft Type");
            console.log(this.sFlyAsType);
            console.log(this.sFlyAsType.length);
        }
        else {
            this.typeIndex = iFound;
            this.Weight = aTP143[iFound].Weight;
            this.FTAS = aTP143[iFound].FTAS;
            this.ALTpref = aTP143[iFound].PrefAlt;
            this.ALTmax = aTP143[iFound].MaxAlt;
            this.TurnRate = aTP143[iFound].TurnRate;
            this.MachSpeed = aTP143[iFound].MachSpeed;
            this.MaxDescent = aTP143[iFound].MaxDescent;
        }
        //Assign the proper target image based on weight:
        if (this.Weight === "L") {this.iImageIndex = 4;}
        else if (this.Weight === "M") {this.iImageIndex = 5;}
        else if (this.Weight === "H") {this.iImageIndex = 3;}
        else {this.iImageIndex = 2;}
    },
    //-------------------------------------------------------------------
    UpdateAircraft: function (Elapsed) {
        if (this.ACstatus === WAITING) {
            this.TimeUntilTaxi -= Elapsed;
            if (this.TimeUntilTaxi < 0) this.TaxiAircraft();
        }
        else if (this.ACstatus === TAXIING) {
            this.TimeUntilRequestRelease -= Elapsed;
            if (this.TimeUntilRequestRelease < 0) this.RequestRelease();
        }
        else if (this.ACstatus === RELEASED) {
            this.TimeUntilDeparts -= Elapsed;
            if (this.TimeUntilDeparts < 0) this.DepartAircraft();
        }
        else if (this.ACstatus === ENROUTE) {

            if (this.DepartureAccelerationTime) {
                this.DepartureAccelerationTime -= Elapsed;
                if (this.DepartureAccelerationTime < 0) this.DepartureAccelerationTime = 0;
            }
            //Update the Trail Dots
            this.aTrailDots.pop();
            this.aTrailDots.unshift(this.CurrentPosition.V.vCopy());
            //based on the status of aircraft, update
            this.UpdateEnrouteAircraft(Elapsed);
            //Update the aircraft altitude
            this.UpdateAltitude(Elapsed);
            if (this.ALTcurrent < ActiveSector.RadarAltitude) this.bVisible = false;
            else this.bVisible = true;
            if (this.ACstatus === FINISHED) this.bVisible = false;
        }
        else if (this.ACstatus === LANDED) {
            this.timeUntilOffRunway -= Elapsed;
            if (this.timeUntilOffRunway < 0) this.ArriveAircraft();
        }

        else if (this.ACstatus === APPROACH) {
            //Update the Trail Dots
            this.aTrailDots.pop();
            this.aTrailDots.unshift(this.CurrentPosition.V.vCopy());
            this.UpdateAircraftOnApproach(Elapsed);
            if (this.ALTcurrent < ActiveSector.RadarAltitude) this.bVisible = false;
            else this.bVisible = true;
        }

        //Update the Action Queue and take action as required
        for (var i=0; i< this.aActionQueue.length; i++) {
            this.aActionQueue[i].nTimeToAction -= Elapsed;
            if (this.aActionQueue[i].nTimeToAction <= 0) {
                //means it is time to take the action
                this.ImplementAction(i);
            }
        }//end i
        //Now delete the action array items that are complete
        i=this.aActionQueue.length;
        while(i--) {
            if (this.aActionQueue[i].nTimeToAction <= 0) {this.aActionQueue.splice(i,1);}
        }//end while
    },
    //-------------------------------------------------------------------
    UpdateAltitude: function (Elapsed) {
        var feetChanged;
        //PROCESS IF LEVEL...
        if (this.ALTcurrent === this.ALTcleared) {
            if (this.bClimbing || this.bDescending) {
                this.bClimbing = false;
                this.bDescending = false;

                var bMore = false;
                if (this.aActionQueue.length) {
                    for (var i=0; i< this.aActionQueue.length; i++) {
                        if (this.aActionQueue[i].ActionType === CLIMB_TO || this.aActionQueue[i].ActionType === DESCEND_TO) bMore = true;
                    }
                }
                if (this.bOnFrequency  && !bMore) {AddToSpeechQueue(this.myIndex, LEVEL_CALL, this.ALTcleared);}
            }
        }
        else if (this.ALTcurrent < this.ALTcleared) {
            this.bClimbing = true;
            this.bDescending = false;
            var clRate = aTP143[this.typeIndex].getClimbRate(this.ALTcurrent);
            feetChanged = Elapsed * clRate/60;
            this.ALTcurrent += feetChanged;
            if (this.ALTcurrent > this.ALTcleared) {this.ALTcurrent = this.ALTcleared;}
        }
        else if (this.ALTcurrent > this.ALTcleared) {
            this.bDescending = true;
            this.bClimbing = false;
            var deRate = aTP143[this.typeIndex].getDescentRate(this.ALTcurrent);
            feetChanged = Elapsed * deRate/60;
            this.ALTcurrent -= feetChanged;
            if (this.ALTcurrent < this.ALTcleared) {this.ALTcurrent = this.ALTcleared;}
        }
    },
    //-------------------------------------------------------------------
    ImplementAction: function (ActionIndex) {
        var iActionType = this.aActionQueue[ActionIndex].ActionType;
        var sAction = this.aActionQueue[ActionIndex].Details;
        switch (iActionType) {
            case FREQ_CHANGE_INBOUND:
                //Time to check in on the frequency
                this.bOnFrequency = true;
                AddToSpeechQueue(this.myIndex, iActionType, sAction);
                break;
            case MISSED_APPROACH:
                this.bOnFrequency = true;
                AddToSpeechQueue(this.myIndex, iActionType, sAction);
                break;
            case EXTERNAL_HANDOFF:
                AddToSpeechQueue(this.myIndex, iActionType, "");
                break;
            case TOWER_HANDOFF:
                AddToSpeechQueue(this.myIndex, iActionType, "");
                break;
            case CHECK_IN_DEPARTURE:
                //Time to check in on the frequency
                this.bOnFrequency = true;
                AddToSpeechQueue(this.myIndex, iActionType, sAction);
                break;
            case CLX_ALTITUDE:
                if (!this.bOnFrequency) return; //can't respond if not on frequency
                //Altitude clearance to aircraft
                tstAltitude = Number(sAction);
                //Determine if altitude is above Max Altitude or below 1000'
                if (tstAltitude > this.ALTmax || tstAltitude < 10) {
                    AddToSpeechQueue(this.myIndex, UNABLE_ALT, sAction);
                    return; //no further action required
                }
                tstAltitude *= 100;  //convert to feet
                //accept the clearance and put in queue to action
                if (tstAltitude > this.ALTcurrent) {
                    AddToSpeechQueue(this.myIndex, CLIMB_TO, sAction);
                    this.aActionQueue.push(new cAction(CLIMB_TO, tstAltitude, getResponseTime(PilotResponseTime)));
                    //this.ALTcleared = tstAltitude;
                }
                if (tstAltitude < this.ALTcurrent) {
                    AddToSpeechQueue(this.myIndex, DESCEND_TO, sAction);
                    this.aActionQueue.push(new cAction(DESCEND_TO, tstAltitude, getResponseTime(PilotResponseTime)));
                    //this.ALTcleared = tstAltitude;
                }
                break;
            case CLIMB_TO:
                if (this.ACstatus === APPROACH) this.CancelApproach(iActionType);
                this.bClimbing = true;
                this.ALTcleared = tstAltitude;
                break;
            case DESCEND_TO:
                if (this.ACstatus === APPROACH) this.CancelApproach(iActionType);
                this.bDescending = true;
                this.ALTcleared = tstAltitude;
                break;
            case CLX_DIRECT:
                AddToSpeechQueue(this.myIndex, PROCEEDING_DIRECT, sAction);
                this.aActionQueue.push(new cAction(PROCEEDING_DIRECT, sAction, getResponseTime(PilotResponseTime)));
                break;
            case PROCEEDING_DIRECT:
                if (this.ACstatus === APPROACH) this.CancelApproach(iActionType);
                this.bAssignedHeading = false;
                this.bHolding4Approach = false;
                this.bHoldingHere = false;
                this.bHoldingFix = false;
                this.ImplementProposedRoute();
                break;
            case CLX_HDG_RIGHT:
                if (!this.bOnFrequency) return; //can't respond if not on frequency
                AddToSpeechQueue(this.myIndex, CLX_HDG_RIGHT, sAction);
                this.aActionQueue.push(new cAction(TURNING_RIGHT_HDG, sAction, getResponseTime(PilotResponseTime)));
                break;
            case CLX_HDG_LEFT:
                if (!this.bOnFrequency) return; //can't respond if not on frequency
                AddToSpeechQueue(this.myIndex, CLX_HDG_LEFT, sAction);
                this.aActionQueue.push(new cAction(TURNING_LEFT_HDG, sAction, getResponseTime(PilotResponseTime)));
                break;
            case CLX_HDG_STRAIGHT:
                if (!this.bOnFrequency) return; //can't respond if not on frequency
                sAction = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
                AddToSpeechQueue(this.myIndex, CLX_HDG_STRAIGHT, sAction);
                this.aActionQueue.push(new cAction(MNTN_PRESENT_HDG, sAction, getResponseTime(PilotResponseTime)));
                break;
            case TURNING_RIGHT_HDG:
                if (this.ACstatus === APPROACH) this.CancelApproach(iActionType);
                this.bAssignedHeading = true;
                this.bHolding4Approach = false;
                this.bTurnDirectionRight = true;
                this.bHoldingHere = false;
                this.bHoldingFix = false;
                this.nAssignedHeading = sAction;
                break;
            case TURNING_LEFT_HDG:
                if (this.ACstatus === APPROACH) this.CancelApproach(iActionType);
                this.bAssignedHeading = true;
                this.bHolding4Approach = false;
                this.bTurnDirectionRight = false;
                this.bHoldingHere = false;
                this.bHoldingFix = false;
                this.nAssignedHeading = sAction;
                break;
            case MNTN_PRESENT_HDG:
                if (this.ACstatus === APPROACH) this.CancelApproach(iActionType);
                this.bAssignedHeading = true;
                this.bHolding4Approach = false;
                this.bHoldingHere = false;
                this.bHoldingFix = false;
                //get the current heading of aircraft
                this.nAssignedHeading = sAction;
                var MyHeading = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));

                var nRightTurn = this.nAssignedHeading - MyHeading;
                if (nRightTurn < 0) {nRightTurn +=360;}
                var nLeftTurn = MyHeading - this.nAssignedHeading;
                if (nLeftTurn <0) {nLeftTurn += 360;}
                this.bTurnDirectionRight = true;
                if (nLeftTurn < nRightTurn) this.bTurnDirectionRight = false;
                break;
            case ASSIGN_SPD:
                if (!this.bOnFrequency) return; //can't respond if not on frequency
                var tstSpd = Number(sAction);
                if (tstSpd < this.MinSpeed) {
                    AddToSpeechQueue(this.myIndex, UNABLE_SPD, sAction);
                }
                else {
                    if (sAction > this.IAS) {
                        AddToSpeechQueue(this.myIndex, INCREASE2SPEED, sAction);
                    }
                    else if (sAction < this.IAS) {
                        AddToSpeechQueue(this.myIndex, DECREASE2SPEED, sAction);
                    }
                    else {
                        AddToSpeechQueue(this.myIndex, MAINTAINSPEED, sAction);
                    }
                    this.aActionQueue.push(new cAction(SPEED_ASSIGNED, sAction, getResponseTime(PilotResponseTime)));
                }
                break;
            case CANCEL_SPD:
                if (!this.bOnFrequency) return; //can't respond if not on frequency
                AddToSpeechQueue(this.myIndex, CANCEL_SPD, "");
                this.aActionQueue.push(new cAction(RESUME_SPD, "", getResponseTime(PilotResponseTime)));
                break;
            case RESUME_SPD:
                this.bAssignedSpeed = false;
                break;
            case SPEED_ASSIGNED:
                this.bAssignedSpeed = true;
                this.nAssignedSpeed = sAction;
                break;
            case CLX_APPROACH:
                if (!this.bOnFrequency) return; //can't respond if not on frequency
                //readback the clearance
                AddToSpeechQueue(this.myIndex, CLX_APPROACH, "");
                if (this.ACstatus === APPROACH) {
                    this.aActionQueue.push(new cAction(CANCEL_APPROACH, "", getResponseTime(PilotResponseTime)/2));
                }
                else {
                    this.aActionQueue.push(new cAction(COMMENCE_APPROACH, "", getResponseTime(PilotResponseTime)/2));
                }
                break;
            case COMMENCE_APPROACH:
                this.bHolding4Approach = false;
                this.bHoldingHere = false;
                this.bHoldingFix = false;
                this.InitiateApproach();
                break;
            case CANCEL_APPROACH:
                this.CancelApproach(CANCEL_APPROACH);
                break;
            case TWR_CANCEL_APPROACH:
                this.CancelApproach(TWR_CANCEL_APPROACH);
                break;
            case CLX_HOLDHERE:
                AddToSpeechQueue(this.myIndex, CLX_HOLDHERE, "");
                this.aActionQueue.push(new cAction(HOLD_HERE, "", getResponseTime(PilotResponseTime)/2));
                break;
            case HOLD_HERE:
                this.bAssignedHeading = false;
                if (this.ACstatus === APPROACH) {
                    this.ACstatus = ENROUTE;
                    this.ALTcleared = this.ALTcurrent;
                }
                this.bHoldingHere = true;
                break;
            case CLX_HOLDFIX:
                AddToSpeechQueue(this.myIndex, CLX_HOLDFIX, sAction);
                this.aActionQueue.push(new cAction(HOLD_FIX, sAction, getResponseTime(PilotResponseTime)/2));
                break;
            case HOLD_FIX:
                this.bAssignedHeading = false;
                if (this.ACstatus === APPROACH) {
                    this.ACstatus = ENROUTE;
                    this.ALTcleared = this.ALTcurrent;
                }
                this.bHoldingFix = true;
                this.cHoldFix = aFixes[sAction];
                break;
        }
    },
    //-------------------------------------------------------------------
    CancelApproach: function (iActionType) {
        this.bShortFinal = false;
        switch (iActionType) {
            case CLIMB_TO:
                this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
                this.bAssignedHeading = true;
                this.nAssignedHeading = this.CurrentTrack;
                this.ACstatus = ENROUTE;
                AddToSpeechQueue(this.myIndex, RQST_RTE, "");
                break;
            case DESCEND_TO:
                this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
                this.bAssignedHeading = true;
                this.nAssignedHeading = this.CurrentTrack;
                this.ACstatus = ENROUTE;
                AddToSpeechQueue(this.myIndex, RQST_RTE, "");
                break;
            case TURNING_RIGHT_HDG:
                this.ALTcleared = this.ALTcurrent;
                this.bClimbing = false;
                this.bDescending = false;
                this.ACstatus = ENROUTE;
                AddToSpeechQueue(this.myIndex, RQST_ALT, "");
                break;
            case TURNING_LEFT_HDG:
                this.ALTcleared = this.ALTcurrent;
                this.bClimbing = false;
                this.bDescending = false;
                this.ACstatus = ENROUTE;
                AddToSpeechQueue(this.myIndex, RQST_ALT, "");
                break;
            case MNTN_PRESENT_HDG:
                this.ALTcleared = this.ALTcurrent;
                this.bClimbing = false;
                this.bDescending = false;
                this.ACstatus = ENROUTE;
                AddToSpeechQueue(this.myIndex, RQST_ALT, "");
                break;
            case PROCEEDING_DIRECT:
                this.ALTcleared = this.ALTcurrent;
                this.bClimbing = false;
                this.bDescending = false;
                this.ACstatus = ENROUTE;
                AddToSpeechQueue(this.myIndex, RQST_ALT, "");
                break;
            case CANCEL_APPROACH:
                this.ALTcleared = this.ALTcurrent;
                this.bClimbing = false;
                this.bDescending = false;
                this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
                this.bAssignedHeading = true;
                this.nAssignedHeading = this.CurrentTrack;
                this.ACstatus = ENROUTE;
                break;
            case TWR_CANCEL_APPROACH:
                this.ALTcleared = this.ALTcurrent;
                this.bClimbing = false;
                this.bDescending = false;
                this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
                this.bAssignedHeading = true;
                this.nAssignedHeading = this.CurrentTrack;
                this.ACstatus = ENROUTE;
                this.bOnFrequency = true;
                AddToSpeechQueue(this.myIndex, TWR_CANCEL_APPROACH, "");
                break;
        }
    },
    //-------------------------------------------------------------------
    UpdateEnrouteAircraft: function(Elapsed) {
        //Handle the special cases first
        if (this.bAssignedHeading) {
            this.UpdateAircraftOnVectors(Elapsed);
            return;
        }
        else if (this.bHolding4Handoff) {
            this.UpdateHolding4Handoff(Elapsed);
            return;
        }
        else if (this.bHolding4Approach) {
            this.UpdateHolding4Approach(Elapsed);
            return;
        }
        else if (this.bHoldingHere) {
            this.UpdateHoldingHere(Elapsed);
            return;
        }
        else if (this.bHoldingFix) {
            this.UpdateHoldingFix(Elapsed);
            return;
        }
        var TurnLeadDistance, NextPosition, RightTurn, LeftTurn, AmountTurned, TurnDirection;
        //determine the forward distance travelled this sweep
        var DistanceTravelled = this.nGroundSpeed/3600 * Elapsed;
        //Determine the distance to the next Fix
        this.DistanceToNextFix = this.CurrentPosition.V.distanceFrom(this.aRoute[this.NextFix].V);

        //determine if inside turning radius for nextFix + 1
        if (this.NextFix === this.aRoute.length - 1) {
            TurnLeadDistance = 0;
        }
        else {
            TurnLeadDistance = this.getTurnLeadDistance(this.aRoute[this.NextFix].V, this.aRoute[this.NextFix + 1].V);
        }
        if ((this.DistanceToNextFix - TurnLeadDistance - DistanceTravelled) < 0) {
            //means we are past the distance where a turn should have started
            //or we will be past the fix
            //First the special case where we've reached the airport
            if (this.NextFix === this.aRoute.length - 1) { //if we are overhead the destination airport
                if (!this.bArriveControlSector) {//if at airport outside control sector, delete it...
                    this.ACstatus = FINISHED;
                    this.bVisible = false;
                    return;
                }
                else {//if we are overhead airport within control sector (with no approach)
                    this.bHolding4Approach = true;
                    Score.NoApproach++;
                    AddToSpeechQueue(this.myIndex, ENTER_HOLD4HANDOFF, "");
                    return;
                }
            }//end if overhead the airport
            this.NextFix++;
        }
        //Now examine where aircraft is pointed and adjust as necessary
        NextPosition = this.aRoute[this.NextFix].V;
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        var DesiredTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, NextPosition.subtract(this.CurrentPosition.V).getNorm()));
        var TurnAmount = Math.abs(this.CurrentTrack - DesiredTrack);
        //Handle special cases where the track is correct or a tiny turn is required
        //if the aircraft will turn in less than one radar sweep, no next turn required.
        if (TurnAmount < nRadarSpinTime/1000 * this.TurnRate) {
            this.ActualVector = NextPosition.subtract(this.CurrentPosition.V).getNorm();
            //and move the aircraft
            this.Move(DistanceTravelled);
        }
        else {
            //Test for Right versus Left Turn...
            RightTurn = DesiredTrack - this.CurrentTrack;
            if (RightTurn < 0) {RightTurn +=360;}

            LeftTurn = this.CurrentTrack - DesiredTrack;
            if (LeftTurn <0) {LeftTurn += 360;}

            //assume it is a right turn unless and test
            TurnDirection = 1;
            TurnAmount = RightTurn;
            if (LeftTurn <= RightTurn) {
                TurnDirection = -1;
                TurnAmount = LeftTurn;
            }
            AmountTurned = Math.round(this.TurnRate * Elapsed);
            this.CurrentTrack += Math.round(TurnDirection * AmountTurned);
            this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.CurrentTrack);
            this.Move(DistanceTravelled);
        }
        this.UpdateGroundSpeed();
    },
    //-------------------------------------------------------------------
    UpdateAircraftOnApproach: function (Elapsed) {
        var TurnLeadDistance, NextPosition;
        //get distance travelled at current groundspeed
        this.UpdateGroundSpeed();
        var DistanceTravelled = this.nGroundSpeed/3600 * Elapsed;
        //get distance to next fix (meaning distance to next approach point
        this.DistanceToNextFix = this.CurrentPosition.V.distanceFrom(this.aApproachPoints[this.NextApproachPoint]);
        if (this.NextApproachPoint < 3) {
            TurnLeadDistance = this.getTurnLeadDistance(this.aApproachPoints[this.NextApproachPoint],
                this.aApproachPoints[this.NextApproachPoint + 1]);
        }
        else {TurnLeadDistance = 0;}

        if ((this.DistanceToNextFix - TurnLeadDistance - DistanceTravelled) < 0) {
            //means we are past the distance where a turn should have started
            //or we will be past the fix
            //First the special case where we've reached the threshold of the runway....
            if (this.NextApproachPoint === 3) {
                this.UpdateArrivalOverThreshold(Elapsed);
                return;
            }
            this.NextApproachPoint++;
            if (this.NextApproachPoint === 3) {
                this.bShortFinal = true;
                this.bAssignedSpeed = false;
                if (this.bOnFrequency) {
                    //Announce it
                    var sPhrase = ActiveSector.SectorName + ", Tower, not talking to ";
                    sPhrase += this.RadioTelephony ;
                    Speak(Coordinator, sPhrase, PhraseDelivered);
                    //send to comm list
                    var sUnit = aAirports[this.iArrAP].AirportLoc.LocName + " Tower";
                    sPhrase = "Not talking to " + this.ACIdent;
                    fAddCoordVoiceLogEntry(sUnit, sPhrase);
                }
            }
        }
        //Now examine where aircraft is pointed and adjust as necessary
        NextPosition = this.aApproachPoints[this.NextApproachPoint];
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        var DesiredTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, NextPosition.subtract(this.CurrentPosition.V).getNorm()));
        var TurnAmount = Math.abs(this.CurrentTrack - DesiredTrack);

        if (TurnAmount < nRadarSpinTime/1000 * this.TurnRate) {
            this.ActualVector = NextPosition.subtract(this.CurrentPosition.V).getNorm();
            //and move the aircraft
            this.Move(DistanceTravelled);
        }
        else {
            //Test for Right versus Left Turn...
            RightTurn = DesiredTrack - this.CurrentTrack;
            if (RightTurn < 0) {RightTurn +=360;}

            LeftTurn = this.CurrentTrack - DesiredTrack;
            if (LeftTurn <0) {LeftTurn += 360;}

            //assume it is a right turn unless and test
            TurnDirection = 1;
            TurnAmount = RightTurn;
            if (LeftTurn <= RightTurn) {
                TurnDirection = -1;
                TurnAmount = LeftTurn;
            }
            AmountTurned = Math.round(this.TurnRate * Elapsed);
            this.CurrentTrack += Math.round(TurnDirection * AmountTurned);
            this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.CurrentTrack);
            this.Move(DistanceTravelled);
        }
        //determine and update the altitude to get to runway
          //first determine distance to fly to Threshold or FAF
        var DescentDistance, AltitudeToLose;
        if (this.NextApproachPoint === 0) {
            DescentDistance = this.CurrentPosition.V.distanceFrom(this.aApproachPoints[0]) +
                this.iArrRwy.distIAFtoIF + this.iArrRwy.distIFtoFAF;
            AltitudeToLose = this.ALTcurrent - this.iArrRwy.nFAFAltitude;
        }
        else if (this.NextApproachPoint === 1) {
            DescentDistance = this.CurrentPosition.V.distanceFrom(this.aApproachPoints[1]) + this.iArrRwy.distIFtoFAF;
            AltitudeToLose = this.ALTcurrent - this.iArrRwy.nFAFAltitude;
        }
        else if (this.NextApproachPoint === 2) {
            DescentDistance = this.CurrentPosition.V.distanceFrom(this.aApproachPoints[2]);
            AltitudeToLose = this.ALTcurrent - this.iArrRwy.nFAFAltitude;
        }
        else {
            DescentDistance = this.CurrentPosition.V.distanceFrom(this.aApproachPoints[3]);
            AltitudeToLose = this.ALTcurrent - this.touchdownAltitude;
        }
        var TimeToPoint = DescentDistance/this.nGroundSpeed * 60; //in minutes
        var RequiredDescentRate = AltitudeToLose/TimeToPoint;
        //console.log(TimeToRwy, AltitudeToLose);
        if (RequiredDescentRate > this.MaxDescent) {
            //console.log(RequiredDescentRate, this.MaxDescent);
            RequiredDescentRate = this.MaxDescent;
        }
        //getting normal rate for debug purposes
        var NormalDescentRate = aTP143[this.typeIndex].getDescentRate(this.ALTcurrent);
        //Adjust the altitude
        feetChanged = Elapsed * RequiredDescentRate/60;
        this.ALTcurrent -= feetChanged;
        if (this.ALTcurrent < this.touchdownAltitude) this.ALTcurrent = this.touchdownAltitude;

    },
    //-------------------------------------------------------------------
    UpdateArrivalOverThreshold: function(Elapsed) {
        //Check the aircraft is not too high.  If yes, we will initiate a missed approach
        //console.log("Update over threshold " + this.ALTcurrent + " " + this.touchdownAltitude);
        if (this.ALTcurrent - this.touchdownAltitude > 400) {
            this.MissedApproach(Elapsed);
        }
        else if (this.bOnFrequency) {
            this.MissedApproach(Elapsed);
            Score.NoCommTfr++;
        }
        else {
            this.bVisible = false;
            this.ACstatus = LANDED;
            this.timeUntilOffRunway = Math.random() * 20 + 15;
        }
    },
    //-------------------------------------------------------------------
    MissedApproach: function (Elapsed) {
        //console.log("MISSED APPROACH" + this.ACIdent);
        //Initiate Missed Approach
        this.ALTcleared = aAirports[this.iArrAP].nSIDAltitude;
        this.bAssignedHeading = true;
        this.nAssignedHeading = this.CurrentTrack;
        this.bShortFinal = false;
        this.ACstatus = ENROUTE;
        this.UpdateAircraftOnVectors(Elapsed);
        //Update the aircraft altitude
        this.UpdateAltitude(Elapsed);
        //Announce it
        var sPhrase = ActiveSector.SectorName + ", ";
        sPhrase += aAirports[this.iArrAP].AirportLoc.LocName + " Tower, ";
        sPhrase += this.RadioTelephony + " on missed approach";
        Speak(Coordinator, sPhrase, PhraseDelivered);
        //send to comm list
        var sUnit = aAirports[this.iArrAP].AirportLoc.LocName + " Tower";
        sPhrase = this.ACIdent + " Missed Approach";
        fAddCoordVoiceLogEntry(sUnit, sPhrase);
        this.aActionQueue.push(new cAction(MISSED_APPROACH, "", getResponseTime(PilotResponseTime)));
        Score.MissedApproach++;
    },
    //-------------------------------------------------------------------
    ArriveAircraft: function () {
        //aircraft has arrived
        //send to voice comm
        sndArrival.play();
        //send to comm list
        var sUnit = aAirports[this.iArrAP].AirportLoc.LocName + " Tower";
        sPhrase = this.ACIdent + " has landed R";
        sPhrase += aAirports[this.iArrAP].aApproaches[aAirports[this.iArrAP].ActiveRunway].nRunwayNumber;
        fAddCoordVoiceLogEntry(sUnit, sPhrase);
        fSendUserMessage("Landed:  " + this.ACIdent, MSGINFO);
        this.ACstatus = FINISHED;
        Score.ArrLand++;
    },
    //-------------------------------------------------------------------
    UpdateAircraftOnVectors: function (Elapsed) {
        var TurnAmount;
        //get current tradck and distance travelled at current groundspeed
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        if (Math.round(this.CurrentTrack) === 0) this.CurrentTrack = 360;
        var DistanceTravelled = this.nGroundSpeed/3600 * Elapsed;
        //determine if a turn is required
        if (this.bTurnDirectionRight) {
            TurnAmount = this.nAssignedHeading - this.CurrentTrack;
        }
        else {
            TurnAmount = this.CurrentTrack - this.nAssignedHeading;
        }
        if (TurnAmount < 0) TurnAmount += 360;
        if (TurnAmount === 0) {
            //do nothing since pointed the right way
        }
        else if (TurnAmount < nRadarSpinTime/1000 * this.TurnRate) {
            //if we are within the turning radius of one sweep
            this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.nAssignedHeading);
        }
        else {
            AmountTurned = Math.round(this.TurnRate * Elapsed);
            if (this.bTurnDirectionRight) {this.CurrentTrack += AmountTurned;}
            else {this.CurrentTrack -= AmountTurned;}
            if (this.CurrentTrack < 0) {this.CurrentTrack +=360;}
            if (this.CurrentTrack > 359) {this.CurrentTrack -= 360;}
            this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.CurrentTrack);
        }
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        this.UpdateGroundSpeed();
        this.Move(DistanceTravelled);
    },
    //-------------------------------------------------------------------
    UpdateHolding4Handoff: function (Elapsed) {
        var DistanceTravelled = this.nGroundSpeed/3600 * Elapsed;
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        var AmountTurned = Math.round(this.TurnRate * Elapsed);
        this.CurrentTrack -= AmountTurned;
        if (this.CurrentTrack < 0) this.CurrentTrack += 360;
        this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.CurrentTrack);
        this.Move(DistanceTravelled);
        this.UpdateGroundSpeed();
    },
    //-------------------------------------------------------------------
    UpdateHolding4Approach: function (Elapsed) {
        var DistanceTravelled = this.nGroundSpeed/3600 * Elapsed;
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        var AmountTurned = Math.round(this.TurnRate * Elapsed);
        this.CurrentTrack -= AmountTurned;
        if (this.CurrentTrack < 0) this.CurrentTrack += 360;
        this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.CurrentTrack);
        this.Move(DistanceTravelled);
        this.UpdateGroundSpeed();
    },
    //-------------------------------------------------------------------
    UpdateHoldingHere: function (Elapsed) {
        var DistanceTravelled = this.nGroundSpeed/3600 * Elapsed;
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        var AmountTurned = Math.round(this.TurnRate * Elapsed);
        this.CurrentTrack -= AmountTurned;
        if (this.CurrentTrack < 0) this.CurrentTrack += 360;
        this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.CurrentTrack);
        this.Move(DistanceTravelled);
        this.UpdateGroundSpeed();
    },
    //-------------------------------------------------------------------
    UpdateHoldingFix(Elapsed) {
        //turn and travel to the holding fix...
        var DistanceTravelled = this.nGroundSpeed/3600 * Elapsed;

        //if we are really close to fix, then we'll say we are there
        if (DistanceTravelled > this.CurrentPosition.V.distanceFrom(this.cHoldFix.FixLoc.V)) {
            this.bHoldingFix = false;
            this.bHoldingHere = true;
            AddToSpeechQueue(this.myIndex, ENTERING_HOLD, "");
            this.UpdateHoldingHere(Elapsed);
            return;
        }
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        var DesiredTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.cHoldFix.FixLoc.V.subtract(this.CurrentPosition.V).getNorm()));
        var TurnAmount = Math.abs(this.CurrentTrack - DesiredTrack);
        if (TurnAmount < nRadarSpinTime/1000 * this.TurnRate) {
            this.ActualVector = this.cHoldFix.FixLoc.V.subtract(this.CurrentPosition.V).getNorm();
            //and move the aircraft
            this.Move(DistanceTravelled);
        }
        else {
            //Test for Right versus Left Turn...
            RightTurn = DesiredTrack - this.CurrentTrack;
            if (RightTurn < 0) {RightTurn +=360;}

            LeftTurn = this.CurrentTrack - DesiredTrack;
            if (LeftTurn <0) {LeftTurn += 360;}

            //assume it is a right turn unless and test
            TurnDirection = 1;
            TurnAmount = RightTurn;
            if (LeftTurn <= RightTurn) {
                TurnDirection = -1;
                TurnAmount = LeftTurn;
            }
            AmountTurned = Math.round(this.TurnRate * Elapsed);
            this.CurrentTrack += Math.round(TurnDirection * AmountTurned);
            this.ActualVector = this.CurrentPosition.V.VectorFromBearing(this.CurrentTrack);
            this.Move(DistanceTravelled);
        }

        this.UpdateGroundSpeed();

    },
    //-------------------------------------------------------------------
    Move: function (DistanceToMove) {
        //shorthand way to move the curent aircraft "DistanceToMove" in the direction of ActualVector
        this.CurrentPosition.V = this.CurrentPosition.V.NewPositionFromVector(this.ActualVector, DistanceToMove);
        //console.log(this.CurrentPosition);
    },
    //-------------------------------------------------------------------
    UpdateGroundSpeed: function () {
        var TargetSpeed, nNormalSpeed;
        var TimeChunk = nRadarSpinTime/1000; //number of seconds
        var SpeedChange;

        //Set the rate at which aircraft accelerate/decelerate
        if (this.Weight === "L") SpeedChange =  TimeChunk * .8;
        else SpeedChange = TimeChunk * 1.2;

        //determine the normal speed for the aircraft based on altitude and whether level
        if (this.bClimbing) {nNormalSpeed = aTP143[this.typeIndex].getClimbSpeed(this.ALTcurrent);}
        else if (this.bDescending) {nNormalSpeed = aTP143[this.typeIndex].getDescentSpeed(this.ALTcurrent);}
        else {nNormalSpeed = aTP143[this.typeIndex].getCruiseSpeed(this.ALTcurrent);}
        //First case where no speed has been assigned
        if (!this.bAssignedSpeed) {TargetSpeed = nNormalSpeed;}
        //Second the case where an IAS has been assigned
        else {
            TargetSpeed = getTASfromIAS(this.nAssignedSpeed, this.ALTcurrent);

            /*for debugging and figuring out the differences:
            var nDif = Math.abs(TargetSpeed - nNormalSpeed)/nNormalSpeed;
            if (nDif > 0.2){
                //if the assigned speed differs from the normal speed by 20% or more:
                console.log(this.ACIdent + " Target Speed = " + TargetSpeed + ", Normal = " + nNormalSpeed);
            }*/
        }
        //Accelerate or decelerate the aircraft
        if (this.TAS < TargetSpeed) {
            this.TAS += SpeedChange;
            if (this.DepartureAccelerationTime) {
                this.TAS += 20;
            }
            if (this.TAS > TargetSpeed) this.TAS = TargetSpeed;
        }
        else if (this.TAS > TargetSpeed) {
            this.TAS -= SpeedChange;
            if (this.TAS < TargetSpeed) this.TAS = TargetSpeed;
        }
        //compute the IAS and Groundspeed
        this.IAS = getIASfromTAS(this.TAS, this.ALTcurrent);
        this.CurrentTrack = Math.round(Vector2Bearing(this.CurrentPosition.V, this.ActualVector));
        this.nGroundSpeed = this.getGroundSpeed(this.CurrentTrack, this.TAS);
    },
    //-------------------------------------------------------------------
    getGroundSpeed: function (inputTrack, inputTAS) {
        var Winds = CalculateWindAt(this.ALTcurrent);
        var ACVector = Bearing2PlaneVector(inputTrack).multiply(inputTAS);
        var WindVector = Bearing2PlaneVector(Winds.WindVector).multiply(Winds.WindSpeed);
        return ACVector.subtract(WindVector).length();
    },
    //-------------------------------------------------------------------
    UpdateDataTag: function (Context) {
        if (this.ACstatus === FINISHED) return;
        //set to the current height
        Context.font = String(nTagSize) + "px sans-serif";
        this.Tag.sLine1 = this.ACIdent;
        if (this.bArriveControlSector) this.Tag.sLine1 += " *";
        this.Tag.sLine2 = String(Math.round(this.ALTcurrent/100)) + " " + String(Math.round(this.nGroundSpeed/10));
        this.Tag.iHeight = 2 * nTagSize + nTagLineSpace;
        var width1 = Context.measureText(this.Tag.sLine1).width;
        var width2 = Context.measureText(this.Tag.sLine2).width;
        if (width1 > width2) {this.Tag.iWidth = width1;}
        else {this.Tag.iWidth = width2;}
    },
    //-------------------------------------------------------------------
    getTurnLeadDistance: function (Pos1, Pos2) {
        var NextVector;
        //This function examines the upcoming fix, and determines if a
        //turn will be required.  If yes - then it calculates when
        //to start the turn based on the wind, radius of turn, etc.
        //if next route point is the destination, no turn required
        if (this.NextFix > this.numRtePts) {
            // if next fix is the destination then no turn is required.
            return 0;
        }
        //Determine the Current and Projected Track of the Aircraft.
        var Track1 = Math.round(Vector2Bearing(this.CurrentPosition.V, Pos1.subtract(this.CurrentPosition.V)));
        var Track2 = Math.round(Vector2Bearing(Pos1, Pos2.subtract(Pos1)));

        //Test the right turn
        var RightTurn = Track2 - Track1;
        if (RightTurn < 0) {RightTurn +=360;}

        var LeftTurn = Track1  - Track2;
        if (LeftTurn <0) {LeftTurn += 360;}

        //assume it is a right turn unless and test
        this.TurnDirection = 1;
        TurnAmount = RightTurn;
        if (LeftTurn <= RightTurn) {
            this.TurnDirection = -1;
            TurnAmount = LeftTurn;
        }


        //Calculate the groundspeed on the current and the projected track
        //and find the average
        var nSpd1 = this.getGroundSpeed(Track1, this.TAS);
        var nSpd2 = this.getGroundSpeed(Track2, this.TAS);
        var nAvgSpeed = (nSpd2 + nSpd1)/2;

        //Determine the turning radius of the aircraft based on the average speed and Turnrate
        var Timefor360 = (360/this.TurnRate)/3600;  //in hours since TurnRate is degrees per second
        var TurnRadius = (nAvgSpeed * Timefor360)/ (2 * Math.PI);

        //Determine the angle formed between the circle tangents (divide by 2)
        var Theta = DTOR((180 - TurnAmount)/2);
        return TurnRadius/(Math.tan(Theta));
    },
    //-------------------------------------------------------------------
    AcceptHandoff: function () {
        //sent here if we've clicked to accept handoff
        this.bIBHO = false;
        this.bHolding4Handoff = false;
        this.bOurControl = true;
        if (this.Weight === "L") {this.iImageIndex = 4;}
        else if (this.Weight === "M") {this.iImageIndex = 5;}
        else if (this.Weight === "H") {this.iImageIndex = 3;}
        else {this.iImageIndex = 2;}
        //Add frequency check in to the action queue
        this.aActionQueue.push(new cAction(FREQ_CHANGE_INBOUND, "", getResponseTime(PilotResponseTime)));
    },
    //-------------------------------------------------------------------
    TaxiAircraft: function () {
        this.ACstatus = TAXIING;
        sndTaxi.play();
        //send to comm list
        var sUnit = aAirports[this.iDepAP].AirportLoc.LocName + " Tower";
        sPhrase = this.ACIdent + " taxiing Rwy ";
        sPhrase += aAirports[this.iDepAP].aApproaches[aAirports[this.iDepAP].ActiveRunway].nRunwayNumber;
        fAddCoordVoiceLogEntry(sUnit, sPhrase);
        //set timer until release request
        //--------->> adjust this release time (short for debugging)
        this.TimeUntilRequestRelease = 180 + Math.round(Math.random()* 180) - 90;

        fSendUserMessage("Taxi Message " + this.ACIdent, MSGINFO);
        fSetACAlert(this.TransponderCode);
    },
    //-------------------------------------------------------------------
    RequestRelease: function () {
        this.ACstatus = REQUESTING_RELEASE;
        //send to voice comm
        sndRequestRelease.play();
        //send to comm list
        var sUnit = aAirports[this.iDepAP].AirportLoc.LocName + " Tower";
        sPhrase = " Request Release " + this.ACIdent + " Runway ";
        sPhrase += aAirports[this.iDepAP].aApproaches[aAirports[this.iDepAP].ActiveRunway].nRunwayNumber;
        fAddCoordVoiceLogEntry(sUnit, sPhrase);
        this.ReleaseTime = nowTime;
    },
    //-------------------------------------------------------------------
    ReleaseAircraft: function () {
        this.ACstatus = RELEASED;
        //set timer for release time
        this.TimeUntilDeparts = 20 + Math.random() * 40;
        this.ALTcurrent = aAirports[this.iDepAP].nElevation;
        this.ALTcleared = aAirports[this.iDepAP].nSIDAltitude;
    },
    //-------------------------------------------------------------------
    DepartAircraft: function () {
        //Send notification via voice/text
        sndDeparture.play();
        //send to comm list
        var sUnit = aAirports[this.iDepAP].AirportLoc.LocName + " Tower";
        sPhrase = this.ACIdent + " departed runway ";
        sPhrase += aAirports[this.iDepAP].aApproaches[aAirports[this.iDepAP].ActiveRunway].nRunwayNumber;
        fAddCoordVoiceLogEntry(sUnit, sPhrase);
        fSendUserMessage("MSG: Departure " + this.ACIdent, MSGINFO);

        fSetACAlert(this.TransponderCode);
        //set status of aircraft
        this.ACstatus = ENROUTE;
        this.bVisible = false;

        this.NextFix = 1;
        this.ALTcurrent = aAirports[this.iDepAP].nElevation;
        this.ALTcleared = aAirports[this.iDepAP].nSIDAltitude;
        this.TAS = 40;
        this.bAssignedHeading = true;
        this.nAssignedHeading = aAirports[this.iDepAP].aApproaches[aAirports[this.iDepAP].ActiveRunway].nBearing;

        this.CurrentPosition = new cLoc("", "", VECTOR, aAirports[this.iDepAP].aApproaches[aAirports[this.iDepAP].ActiveRunway].tThreshold);
        this.ActualVector = this.CurrentPosition.V.VectorFromBearing(aAirports[this.iDepAP].aApproaches[aAirports[this.iDepAP].ActiveRunway].nBearing);
        //move the aircraft to the end of the runway
        this.Move(2);
        this.UpdateGroundSpeed();
        this.TimeUntilEnroute = 30;
        //Add frequency check in to the action queue
        this.aActionQueue.push(new cAction(CHECK_IN_DEPARTURE, "", getResponseTime(PilotResponseTime) * 2));
        //Add variable to maximize acceleration on takeoff.
        this.DepartureAccelerationTime = 30;
    },
    //-------------------------------------------------------------------
    HandoffExternal: function () {
        this.bOurControl = false;
        this.iImageIndex = 2;
        this.bShowTag = false;
        this.bExitedSector = true;
    },
    //-------------------------------------------------------------------
    EnterHold4Handoff: function () {
        this.bHolding4Handoff = true;
    },
    //-------------------------------------------------------------------
    FixInRoute: function (FixIndex) {
        //Determine if the fix given in the fix index is in the route of the aircraft
        for (var i=this.NextFix; i< this.aRoute.length; i++) {
            if (aFixes[FixIndex].FixLoc.LocIdent === this.aRoute[i].LocIdent) {
                return i;
            }
        }
        return -100;
    },
    //-------------------------------------------------------------------
    ProposedRouteChange: function (aProposedRoute) {
        this.aProposedRoute = aProposedRoute.slice();
    },
    //-------------------------------------------------------------------
    ImplementProposedRoute: function () {
        var oNewRtePt, j, struct;
        //The last point in the aProposedRoute array is an index into aRoute,
        //New points are inserts and index into the aFixes array
        if (this.aProposedRoute.length === 1) {
            //must be cleared direct a fix on current flight plan
            j = this.aProposedRoute.pop().Item;
            this.aRoute.splice(this.NextFix, j - this.NextFix);
        }
        else {
            //means we've inserted points into the route....
            //Delete any fixes between the Next Fix and the point of re-insertion
            struct = this.aProposedRoute.pop();
            if (struct.Type === FIXINROUTE) {
                j = struct.Item;
                this.aRoute.splice(this.NextFix, j - this.NextFix);
            }
            while (this.aProposedRoute.length > 0) {
                //insert the route into the flight plan
                struct = this.aProposedRoute.pop();
                if (struct.Type === FIX) {
                    j = struct.Item;
                    oNewRtePt = new cLoc(aFixes[j].FixLoc.LocIdent, aFixes[j].FixLoc.LocName, POLAR,
                        new Polar3d(aFixes[j].FixLoc.P.Lat, aFixes[j].FixLoc.P.Long));

                }
                else if (struct.Type === LATLONG) {
                    oNewRtePt = struct.Item;
                }
                this.aRoute.splice(this.NextFix, 0, oNewRtePt);
            }
        }
        this.numRtePts = this.aRoute.length;
    },
    //-------------------------------------------------------------------
    InitiateApproach: function () {
        var nTestVal, bInnerWedge, bOuterWedge;

        this.ALTcleared = 0;
        bInnerWedge = false;
        bOuterWedge = false;

        //Establish the bearing from aircraft to airport
        var vVectorToThreshold = this.iArrRwy.tThreshold.subtract(this.CurrentPosition.V).getNorm();
        var nBearingToAirport = Vector2Bearing(this.CurrentPosition.V, vVectorToThreshold);
        this.touchdownAltitude = aAirports[this.iArrAP].nElevation;

        //reset aircraft route
        this.NextFix = this.aRoute.length - 1;
        //Determine if "in the box" i.e. within wedge shaped airspace
        //extending from runway centreline by 10 and 37 degrees
        // console.log(this.iArrRwy.nBearing);
        nTestVal = Math.abs(nBearingToAirport - this.iArrRwy.nBearing);
        if (nTestVal < INNER_WEDGE || nTestVal > (360 - INNER_WEDGE)) {
            bInnerWedge = true;
            bOuterWedge = true;
        }
        else if (nTestVal < OUTER_WEDGE || nTestVal > (360 - OUTER_WEDGE)) {
            bOuterWedge = true;
        }
        //set the approach flag for the aircraft
        this.ACstatus = APPROACH;
        //Now construct the approach points for the approach
        //add them in reverse order...

        this.aApproachPoints.unshift(this.iArrRwy.tThreshold);
        this.aApproachPoints.unshift(this.iArrRwy.tFAF);
        this.aApproachPoints.unshift(this.iArrRwy.tIF);

        var testDist = this.CurrentPosition.V.distanceFrom(this.iArrRwy.tIAF1);
        if (this.CurrentPosition.V.distanceFrom(this.iArrRwy.tIAF2) < testDist) {
            this.aApproachPoints.unshift(this.iArrRwy.tIAF2);
        }
        else {
            this.aApproachPoints.unshift(this.iArrRwy.tIAF1);
        }
        //based on location, and wedge, determine where aircraft is going next
        var distToThreshold = this.CurrentPosition.V.distanceFrom(this.aApproachPoints[3]);

        if (bInnerWedge) {
            if (distToThreshold < this.iArrRwy.nFAFDistance + 2) {this.NextApproachPoint = 3;}
            else if (distToThreshold < IF_DISTANCE + 2) {this.NextApproachPoint = 2;}
            else {this.NextApproachPoint = 1;}
        }
        else if (bOuterWedge) {
            if (distToThreshold > IF_DISTANCE - 1) {this.NextApproachPoint = 1;}
            else {this.NextApproachPoint = 0;}
        }
        else {
            this.NextApproachPoint = 0;
        }
        if (this.NextApproachPoint === 3) this.bAssignedSpeed = false;
    }
};
//-------------------------------------------------------------------
function cDataTag() {
    this.DrawPos = new Vector2d(-20, 50); //note relative to target centre
    this.iWidth = 0;
    this.iHeight = 0;
    this.sLine1 = " ";
    this.sLine2 = " ";
}
//-------------------------------------------------------------------
// Class to store aircraft creator information
function cSimAC (sInput) {
    var aElements;
    var aLines = sInput.split("\n");
    //top line is empty, so delete
    aLines.shift();

    //First Line ACA .25
    aElements = aLines.shift().split(" ");
    this.SimIdent = aElements.shift();
    this.SimPercent = Number(aElements.shift());
    //Second Line 3 A321 A320 .6 A340 A340 .2 B767 B767 .2
    aElements = aLines.shift().split(" ");
    this.aTypes = new Array();
    var numTypes =  Number(aElements.shift());
    for (var i=0; i< numTypes; i++) {
        tempType = aElements.shift();
        tempFlyAs = aElements.shift();
        tempPercent = Number(aElements.shift());
        this.aTypes.push({SimType: tempType, SimFlyAs: tempFlyAs, TypePercent: tempPercent});
    }
    //Third Line 40 70 100 220
    aElements = aLines.shift().split(" ");
    this.OutAltMin = Number(aElements.shift());
    this.OutAltMax = Number(aElements.shift());
    //Fourth Line 0 2 6
    this.ArrivalRouteIndex = new Array();
    aElements = aLines.shift().split(" ");
    while (aElements.length) {
        this.ArrivalRouteIndex.push(Number(aElements.shift()));
    }
    //Fifth line 1 3 5 12
    this.DepartureRouteIndex = new Array();
    aElements = aLines.shift().split(" ");
    while (aElements.length) {
        this.DepartureRouteIndex.push(Number(aElements.shift()));
    }
    //Last and sixth line 1 2 3 4 5
    this.OverflightRouteIndex = new Array();
    aElements = aLines.shift().split(" ");
    while (aElements.length) {
        this.OverflightRouteIndex.push(Number(aElements.shift()));
    }
}
















