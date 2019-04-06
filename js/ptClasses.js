//****************************************//
//
//  ptClasses.js created 2018-03-15
//
// contains classes, objects and helper functions
// COPYRIGHT - All Rights Reserved
//
//******************************************

//Strip Styling Constants
//-----------------------------------------------------
//Widget Package - created 2019-FEB-09
//
// Package for windows, panes, and controls for the interface
//------------------------------------------------------
const PENDINGDEPS       = 110;
const PENDINGENROUTE    = 111;
const ACTIVEAC          = 112;
const INACTIVEAC        = 113;


//*****************************************************************************************************
//
//     Support classes used by Windows/Panes
//
//------------------------------------------------------
function cLocSize(x, y, W, H) {
    this.x = x !== undefined ? x : 0;
    this.y = y !== undefined ? y : 0;
    this.W = W !== undefined ? W : 0;
    this.H = H !== undefined ? H : 0;
}
//*****************************************************************************************************
//
//     Windows and Panes Classes
//
//------------------------------------------------------
function Window(sName, sStyle) {
    //Window is a container for panes, and allows for the adding and moving/opening/closing of the panes that
    //contain the various controls and display items
    this.Name = sName;
    this.Location = new cLocSize(1,1,1,1);
    //create the div and add to the document
    this.Element = document.createElement("div");
    this.Element.className = sStyle;
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "2";
    this.Element.Owner = this;
    this.visible = true;
    document.body.appendChild(this.Element);
    //create an array to hold the Panes
    this.aPanes         = [];
    this.aLabels        = [];
    this.aButtons       = [];
    this.aCheckboxes    = [];
    this.aRadioButtons  = [];
    this.aMenuItems     = [];
    this.aStrips        = [];
    //some counters to count striptypes
    this.ctrDep = 0;
    this.ctrEnr = 0;
    this.ctrAct = 0;
    this.ctrIna = 0;
}
Window.prototype = {
    Locate: function (x,y,W,H) {
        this.MoveTo(x,y);
        this.Resize(W,H);
    },
    MoveTo: function (x,y) {
        this.Location.x = x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W,H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
    Hide: function() {
        this.Element.style.display = "none";
        this.visible = false;
    },
    Show: function() {
        this.Element.style.display = "block";
        this.visible = true;
    },
    ResizeToPane: function(whichPane) {
        //makes the main window same size as a single pane
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.LocatePane()");
            return;
        }
        this.Resize(this.aPanes[iPane].Location.W, this.aPanes[iPane].Location.H);

    },
    SetZ: function (Index){
        this.Element.style.zIndex = String(Index);
    },
    SetScrollY: function() {
        this.Element.style.overflowY = "scroll";
        this.Element.style.overflowX = "hidden";
    },
    //---------------PANE Functions--------------------------------
    AddPane: function(sName, sStyle) {
        var tSub = new Pane(sName, sStyle);
        this.Element.appendChild(tSub.Element);
        this.aPanes.push(tSub);
    },
    GetPane: function (whichPane) {
        for (var i=0; i< this.aPanes.length; i++) {
            if (this.aPanes[i].Name === whichPane) return i;
        }
        return -1;
    },
    LocatePane: function (whichPane, x,y,W,H) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.LocatePane()");
            return;
        }
        this.aPanes[iPane].Locate(x,y,W,H);
    },
    ResizePane: function (whichPane, W, H) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.ResizePane()");
            return;
        }
        this.aPanes[iPane].Resize(W,H);
    },
    MovePane: function (whichPane, x,y) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.MovePane()");
            return;
        }
        this.aPanes[iPane].MoveTo(x,y);
    },
    ClosePane: function () {
        var iPane;
        for (var i = 0; i < arguments.length; i++) {
            iPane = this.GetPane(arguments[i]);
            if (iPane === -1) {
                console.log("error - Pane not located: Window.LocatePane()");
                return;
            }
            this.aPanes[iPane].Hide();
        }
    },
    OpenPane: function() {
        var iPane;
        for (var i = 0; i < arguments.length; i++) {
            iPane = this.GetPane(arguments[i]);
            if (iPane === -1) {
                console.log("error - Pane not located: Window.LocatePane()");
                return;
            }
            this.aPanes[iPane].Show();
        }
    },
    AddPaneImage: function (whichPane, url, x, y, W, H) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.LocatePane()");
            return;
        }
        this.aPanes[iPane].AddBackgroundImage(url, x,y,W,H);
    },
    UpdatePaneStyle: function (whichPane, sStyle) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.LocatePane()");
            return;
        }
        this.aPanes[iPane].ChangeStyle(sStyle);
    },
    GetPaneExtent: function (whichPane) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.MovePane()");
            return;
        }
        return this.aPanes[iPane].Location.x + this.aPanes[iPane].Location.W;
    },
    GetPaneHeight: function (whichPane) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.MovePane()");
            return;
        }
        return this.aPanes[iPane].Location.H;
    },
    AddPaneText: function(whichPane, sText) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.AddPaneText()");
            return;
        }
        this.aPanes[iPane].Element.innerHTML += sText;
        this.aPanes[iPane].Element.scrollTop = this.aPanes[iPane].Element.scrollHeight;
    },
    ClearPaneText: function(whichPane) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.AddPaneText()");
            return;
        }
        this.aPanes[iPane].Element.innerHTML ="";
    },
    //---------------IMAGES Functions--------------------------------
    AddImage:function (whichPane, url, x,y,W,H) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.LocatePane()");
            return;
        }
        var img = document.createElement("img");
        img.src = url;
        img.style.width = W;
        img.style.height = H;
        img.style.position = "absolute";
        img.style.top = y;
        img.style.left = x;
        this.aPanes[iPane].Element.appendChild(img);

    },
    //---------------LABEL Functions--------------------------------
    AddLabel: function(whichPane, LabelName, LabelText, LabelStyle, x,y,W,H){
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.AddLabel()");
            return;
        }
        var tLabel = new Label(this.aLabels[iPane], LabelName, LabelText, LabelStyle, x,y,W,H);
        this.aLabels.push(tLabel);
        this.aPanes[iPane].Element.appendChild(tLabel.Element);

    },
    GetLabel: function(whichLabel) {
        for (var i=0; i< this.aLabels.length; i++) {
            if (this.aLabels[i].Name === whichLabel) return i;
        }
        return -1;
    },
    UpdateLabel: function (LabelName, Msg) {
        var iLabel = this.GetLabel(LabelName);
        if (iLabel === -1) {
            console.log("error - Label not located:  Window.UpdateLabel()");
            return;
        }
        this.aLabels[iLabel].UpdateMsg(Msg);
    },
    UpdateLabelStyle: function(LabelName, sStyle) {
        var iLabel = this.GetLabel(LabelName);
        if (iLabel === -1) {
            console.log("error - Label not located:  Window.UpdateLabel()");
            return;
        }
        this.aLabels[iLabel].ChangeStyle(sStyle);
    },
    UpdateAllLabelStyles: function (sStyle) {
        for (var i=0; i< this.aLabels.length; i++) {
            this.aLabels[i].ChangeStyle(sStyle);
        }
    },
    ClearAllLabelsText: function () {
        for (var i=0; i< this.aLabels.length; i++) {
            this.aLabels[i].UpdateMsg("");
        }
    },
    SetLabelTextSize: function (LabelName, nSize) {
        var iLabel = this.GetLabel(LabelName);
        if (iLabel === -1) {
            console.log("error - Label not located:  Window.UpdateLabel()");
            return;
        }
        this.aLabels[iLabel].ChangeTextSize(nSize);
    },
    //---------------BUTTON Functions--------------------------------
    AddButton: function(whichPane, ButtonName, bImage, ButtonText, ButtonStyle, x,y,W,H) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.AddLabel()");
            return;
        }
        var tButton = new Button(this.aPanes[iPane], ButtonName, bImage, ButtonText, ButtonStyle, x,y,W,H);
        this.aButtons.push(tButton);
        this.aPanes[iPane].Element.appendChild(tButton.Element);
    },
    GetButton: function (whichButton) {
        for (var i=0; i< this.aButtons.length; i++) {
            if (this.aButtons[i].Name === whichButton) return i;
        }
        return -1;
    },
    UpdateButton: function (ButtonName, Msg) {
        var iButton = this.GetButton(ButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.UpdateButton()");
            return;
        }
        this.aButtons[iButton].UpdateMsg(Msg);
    },
    AssignButtonCommand: function (ButtonName, Cmd) {
        var iButton = this.GetButton(ButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.UpdateButton()");
            return;
        }
        this.aButtons[iButton].AssignCommand(Cmd);
    },
    HideButtons: function() {
        var iButton;
        for (var i = 0; i < arguments.length; i++) {
            iButton = this.GetButton(arguments[i]);
            if (iButton === -1) {
                console.log("error - Button not located: Window.HideButtons()");
                return;
            }
            this.aButtons[iButton].Hide();
        }
    },
    ShowButton: function (ButtonName) {
        var iButton = this.GetButton(ButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.ShowMenuButton()");
            return;
        }
        this.aButtons[iButton].Show();
    },
    ShowMenuButton: function(ButtonName, iPlace) {
        var iButton = this.GetButton(ButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.ShowMenuButton()");
            return;
        }
        this.aButtons[iButton].MoveTo(0, iPlace * this.aButtons[iButton].Location.H);
        this.aButtons[iButton].Show();
    },
    RestyleButton: function(ButtonName, sStyle) {
        var iButton = this.GetButton(ButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.UpdateButton()");
            return;
        }
        this.aButtons[iButton].Restyle(sStyle);
    },
    MoveButton: function(ButtonName, x,y) {
        var iButton = this.GetButton(ButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.UpdateButton()");
            return;
        }
        this.aButtons[iButton].MoveTo(x,y);
    },
    //---------------MENU BUTTONS Functions--------------------------------
    AddMenuButton: function(whichPane, ButtonName, ButtonText, MenuLevel, MenuLink) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.AddLabel()");
            return;
        }
        var mnuStyle = "menulevel" + String(MenuLevel);

        var tButton = new Button(this.aPanes[iPane], ButtonName, false, ButtonText, mnuStyle, 0,this.aMenuItems.length * 20,180,20);
        tButton.Element.MenuLink = MenuLink;
        this.aMenuItems.push(tButton);
        this.aPanes[iPane].Element.appendChild(tButton.Element);
    },
    //---------------CHECKBOX Functions--------------------------------
    AddCheckbox: function(whichPane, CheckboxName, x,y,W,H) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.AddLabel()");
            return;
        }
        var tChk = new CheckBox(this.aPanes[iPane], CheckboxName, x,y,W,H);
        this.aCheckboxes.push(tChk);
        this.aPanes[iPane].Element.appendChild(tChk.Element);
    },
    //---------------RADIOBUTTON Functions-----------------------------
    AddRadioButton: function(whichPane, RadioButtonName, x,y,W,H) {
        var iPane = this.GetPane(whichPane);
        if (iPane === -1) {
            console.log("error - Pane not located: Window.AddLabel()");
            return;
        }
        var tRdo = new RadioButton(this.aPanes[iPane], RadioButtonName, x,y,W,H);
        this.aRadioButtons.push(tRdo);
        this.aPanes[iPane].Element.appendChild(tRdo.Element);
    },
    GetRadio: function (whichButton) {
        for (var i=0; i< this.aRadioButtons.length; i++) {
            if (this.aRadioButtons[i].Name === whichButton) return i;
        }
        return -1;
    },
    IsRadioChecked: function (RadioButtonName) {
        var iButton = this.GetRadio(RadioButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.UpdateButton()");
            return;
        }
        return this.aRadioButtons[iButton].Element.checked;
    },
    CheckButton: function (RadioButtonName) {
        var iButton = this.GetRadio(RadioButtonName);
        if (iButton === -1) {
            console.log("error - Button not located:  Window.UpdateButton()");
            return;
        }
        this.aRadioButtons[iButton].Element.checked = true;
    },
    //---------------STRIP  Functions-----------------------------
    CreateStrip: function(ACIndex){
        var tStrip = new Strip(ACIndex);
        this.aStrips.push(tStrip);
    },
    ClearStrips: function() {
        for (var i=0; i<this.aStrips.length; i++) {
            if (this.aStrips[i].Owner) {
                this.aStrips[i].Owner.Element.removeChild(this.aStrips[i].Element);
                this.aStrips[i].Owner = null;
            }
        }
        this.ctrDep = 0;
        this.ctrEnr = 0;
        this.ctrAct = 0;
        this.ctrIna = 0;
    },
    UpdateStrip: function (index, AC){
        var sLine1, sLine2, whichPane;
        var stripHeaderHeight = 19;
        //Update the strip based on state of the AC
        switch(AC.ACstatus) {
            case WAITING:
                this.aStrips[index].Fullsize(false);
                this.aStrips[index].Active(false);
                this.aStrips[index].setSig2("D");
                sLine1 = AC.ACIdent + " ";
                sLine1 += AC.aRoute[0].LocIdent + " ";
                sLine1 += AC.aRoute[AC.aRoute.length - 1].LocIdent + " ";
                sLine1 += AC.ProposedDepartureTime;
                this.aStrips[index].setLine1(sLine1);
                //set the flag
                this.aStrips[index].setFlagStatus(false, false, 0);
                //set the strip in the pane
                this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrIna * 20);
                //add the ctr and add strip to the pane
                this.ctrIna++;
                whichPane = this.GetPane("paneInactive");
                this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                this.aStrips[index].Owner = this.aPanes[whichPane];
                break;
            case TAXIING:
            case REQUESTING_RELEASE:
                this.aStrips[index].Fullsize(false);
                this.aStrips[index].Active(false);
                this.aStrips[index].setSig2("D");
                sLine1 = AC.ACIdent + " ";
                sLine1 += AC.aRoute[0].LocIdent + " ";
                sLine1 += AC.aRoute[AC.aRoute.length - 1].LocIdent + " ";
                sLine1 += "R" + String(aAirports[AC.iDepAP].aApproaches[aAirports[AC.iDepAP].ActiveRunway].nRunwayNumber);
                this.aStrips[index].setLine1(sLine1);
                //set the flag status
                if (AC.ACstatus === TAXIING) {
                    if (this.aStrips[index].FlagAcknowledged){
                        this.aStrips[index].setFlagStatus(false, false, 0);
                    }
                    else {
                        this.aStrips[index].setFlagStatus(true, true, "flagblue");
                    }
                }
                else {
                    this.aStrips[index].setFlagStatus(true, true, "flagyellow");
                }
                //set the strip in the pane
                this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrDep * 20);
                //add the ctr and add strip to the pane
                this.ctrDep++;
                whichPane = this.GetPane("panePendingDeparture");
                this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                this.aStrips[index].Owner = this.aPanes[whichPane];
                break;
            case RELEASED:
                this.aStrips[index].Fullsize(true);
                this.aStrips[index].Active(true);
                this.aStrips[index].setSig1("D");
                sLine1 = AC.ACIdent + " ";
                sLine1 += AC.sType + " ";
                sLine1 += AC.FTAS;
                this.aStrips[index].setLine1(sLine1);
                sLine2 = AC.aRoute[0].LocIdent + " ";
                sLine2 += "Rwy" + String(aAirports[AC.iDepAP].aApproaches[aAirports[AC.iDepAP].ActiveRunway].nRunwayNumber) + " ";
                sLine2 += AC.aRoute[AC.aRoute.length - 1].LocIdent + " ";
                sLine2 += String(AC.ALTcleared/100);
                this.aStrips[index].setLine2(sLine2);
                //set the flag status
                this.aStrips[index].setFlagStatus(false, false, 0);
                //set the strip in the pane
                this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrAct * 32);
                //add the ctr and add strip to the pane
                this.ctrAct++;
                whichPane = this.GetPane("paneActive");
                this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                this.aStrips[index].Owner = this.aPanes[whichPane];
                break;
            case ENROUTE:
                if (AC.bOurControl) {
                    this.aStrips[index].Fullsize(true);
                    this.aStrips[index].Active(true);
                    if (AC.bArriveControlSector) this.aStrips[index].setSig1("A");
                    else this.aStrips[index].setSig1("--");
                    sLine1 = AC.ACIdent + " ";
                    sLine1 += AC.sType + " ";
                    sLine1 += AC.FTAS;
                    this.aStrips[index].setLine1(sLine1);
                    sLine2 = AC.aRoute[0].LocIdent + " ";
                    sLine2 += AC.aRoute[AC.aRoute.length - 1].LocIdent + "  ";
                    sLine2 += String(AC.ALTcleared/100);
                    this.aStrips[index].setLine2(sLine2);
                    //set the strip in the pane
                    this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrAct * 32);
                    //add the ctr and add strip to the pane
                    this.ctrAct++;
                    whichPane = this.GetPane("paneActive");
                    this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                    this.aStrips[index].Owner = this.aPanes[whichPane];
                    if (this.aStrips[index].FlagAcknowledged){
                        this.aStrips[index].setFlagStatus(false, false, 0);
                    }
                    else {
                        this.aStrips[index].setFlagStatus(true, true, "flagblue");
                    }
                }
                else {
                    if (AC.bExitedSector) break;
                    this.aStrips[index].Fullsize(false);
                    this.aStrips[index].Active(false);
                    this.aStrips[index].setSig2("D");
                    sLine1 = AC.ACIdent + " ";
                    sLine1 += AC.aRoute[0].LocIdent + " ";
                    sLine1 += AC.aRoute[AC.aRoute.length - 1].LocIdent + " ";
                    this.aStrips[index].setLine1(sLine1);
                    if (AC.bArriveControlSector) this.aStrips[index].setSig2("A");
                    else this.aStrips[index].setSig2("--");
                    //Break down which pane it goes in by how far away
                    if (AC.bFar) {
                        this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrIna * 20);
                        //add the ctr and add strip to the pane
                        this.ctrIna++;
                        whichPane = this.GetPane("paneInactive");
                        this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                        this.aStrips[index].Owner = this.aPanes[whichPane];
                        this.aStrips[index].setFlagStatus(false, false, 0);
                    }
                    else {
                        this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrEnr * 20);
                        //add the ctr and add strip to the pane
                        this.ctrEnr++;
                        whichPane = this.GetPane("panePendingEnroute");
                        this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                        this.aStrips[index].Owner = this.aPanes[whichPane];
                        if (AC.bIBHO) {
                            this.aStrips[index].setFlagStatus(true, true, "flagyellow");
                        }
                        else this.aStrips[index].setFlagStatus(false, false, 0);
                    }
                }
                break;
            case APPROACH:
                this.aStrips[index].Fullsize(true);
                this.aStrips[index].Active(true);
                sLine1 = AC.ACIdent + " ";
                sLine1 += AC.sType + " ";
                sLine1 += AC.FTAS;
                this.aStrips[index].setLine1(sLine1);
                sLine2 = AC.aRoute[AC.aRoute.length - 1].LocIdent + " ";
                sLine2 += "APP RWY" + String(aAirports[AC.iArrAP].aApproaches[aAirports[AC.iArrAP].ActiveRunway].nRunwayNumber);
                this.aStrips[index].setLine2(sLine2);
                this.aStrips[index].setSig1("A");
                //set the strip in the pane
                this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrAct * 32);
                //add the ctr and add strip to the pane
                this.ctrAct++;
                whichPane = this.GetPane("paneActive");
                this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                this.aStrips[index].Owner = this.aPanes[whichPane];
                this.aStrips[index].setFlagStatus(false, false, 0);
                break;
            case LANDED:
                this.aStrips[index].Fullsize(true);
                this.aStrips[index].Active(true);
                sLine1 = AC.ACIdent + " ";
                sLine1 += AC.sType + " ";
                sLine1 += AC.FTAS;
                this.aStrips[index].setLine1(sLine1);
                sLine2 = "LANDING R" + String(aAirports[AC.iArrAP].aApproaches[aAirports[AC.iArrAP].ActiveRunway].nRunwayNumber);
                this.aStrips[index].setLine2(sLine2);
                this.aStrips[index].setSig1("A");
                //set the strip in the pane
                this.aStrips[index].MoveTo(0, stripHeaderHeight + this.ctrAct * 32);
                //add the ctr and add strip to the pane
                this.ctrAct++;
                whichPane = this.GetPane("paneActive");
                this.aPanes[whichPane].Element.appendChild(this.aStrips[index].Element);
                this.aStrips[index].Owner = this.aPanes[whichPane];
                this.aStrips[index].setFlagStatus(true, false, "flagblue");
                break;
        }//end switch
    },
    SizeBays: function() {
        var totalHeight = 0;
        var tempHeight;
        var stripHeaderHeight = 19;

        whichPane = this.GetPane("panePendingDeparture");
        tempHeight = stripHeaderHeight + this.ctrDep* 20;
        this.aPanes[whichPane].Resize(180, tempHeight);
        this.aPanes[whichPane].MoveTo(0, totalHeight);
        totalHeight += tempHeight ;

        whichPane = this.GetPane("panePendingEnroute");
        tempHeight = stripHeaderHeight + this.ctrEnr* 20;
        this.aPanes[whichPane].Resize(180, tempHeight);
        this.aPanes[whichPane].MoveTo(0, totalHeight);
        totalHeight += tempHeight ;

        whichPane = this.GetPane("paneActive");
        tempHeight = stripHeaderHeight + this.ctrAct* 32
        this.aPanes[whichPane].Resize(180, tempHeight);
        this.aPanes[whichPane].MoveTo(0, totalHeight );
        totalHeight += tempHeight ;

        whichPane = this.GetPane("paneInactive");
        tempHeight = stripHeaderHeight + this.ctrIna * 20;
        this.aPanes[whichPane].Resize(180, tempHeight);
        this.aPanes[whichPane].MoveTo(0, totalHeight );
        totalHeight += tempHeight ;

        this.Resize(this.Location.W, totalHeight);

    },
    SelectAC: function(index) {
        this.aStrips[index].Button.className = "selectedbuttonoverlay";
    },
    ToggleStripAlerts: function() {
        for (var i=0; i<this.aStrips.length; i++) {
            if (this.aStrips[i].bFlash) this.aStrips[i].ToggleFlag();
        }
    },
    AcknowledgeToggle: function(index) {
        this.aStrips[index].FlagAcknowledged = !this.aStrips[index].FlagAcknowledged;
    }


}; //end Window prototype
//.............PANES...........................//
//.............PANES..................................................................................//
function Pane(sName, sStyle) {
    //Window is a container for panes, and allows for the adding and moving/opening/closing of the panes that
    //contain the various controls and display items
    this.Name = sName;
    this.Location = new cLocSize(1,1,1,1);
    //create the div and add to the document
    this.Element = document.createElement("div");
    this.Element.className = sStyle;
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "2";
    this.Element.Owner = this;
    this.visible = true;

}
Pane.prototype = {
    Locate: function (x,y,W,H) {
        this.MoveTo(x,y);
        this.Resize(W,H);
    },
    MoveTo: function (x,y) {
        this.Location.x = x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W,H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
    Hide: function() {
        this.Element.style.display = "none";
        this.visible = false;
    },
    Show: function() {
        this.Element.style.display = "block";
        this.visible = true;
    },
    ChangeStyle:function(sStyle) {
        this.Element.className = sStyle;
    },
    AddBackgroundImage(url, x,y,W,H) {
        this.Element.style.backgroundImage = 'url(' + url + ')';
        this.Element.style.backgroundSize = String(W) + "px " + String(H) + "px";
    },
}; //end Window prototype
//.............LABELS...........................//
function Label (Owner, LabelName, LabelText, LabelStyle, x,y,W,H) {
    //Assign the name to be able to access
    this.Name = LabelName;
    //Create the variable to store location and size
    this.Location = new cLocSize();
    //create the element
    this.Element = document.createElement("p");
    this.Element.className = LabelStyle;
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "3";
    this.Element.Owner= Owner;
    this.Element.appendChild(document.createTextNode(LabelText));
    this.MoveTo(x,y);
    this.Resize(W,H);
}
Label.prototype = {
    MoveTo: function (x, y) {
        this.Location.x= x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W, H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
    UpdateMsg: function (msg) {
        this.Element.innerHTML = msg;
    },
    ChangeStyle:function(sStyle) {
        this.Element.className = sStyle;
    },
    ChangeTextSize:function(nSize) {
        this.Element.style.fontSize = nSize + "px";
    }
};
//.............BUTTONS...............................................................................//
function Button (Owner, ButtonName, bImage, ButtonText, ButtonStyle, x,y,W,H) {
    this.Name = ButtonName;
    //Create the variable to store location and size
    this.Location = new cLocSize(x,y,W,H);
    //set button state 0=off 1=on
    this.bOn= false;
    this.Element = document.createElement("Button");
    this.Element.id = this.Name;
    this.Element.className = ButtonStyle;
    this.styleOFF = ButtonStyle;
    this.styleON = ButtonStyle + "toggle";
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "2";
    this.Element.Owner= Owner;
    this.Element.hID = this;
    this.Command = null;
    this.ButtonText = ButtonText;
    if (bImage) {
        this.Element.style.backgroundImage = "url(" + ButtonText + ")";
        this.Element.style.backgroundRepeat = "no-repeat";
        this.Element.style.backgroundPosition = "center";
    }
    else {
        this.Element.innerHTML = ButtonText;
    }
    this.MoveTo(x,y);
    this.Resize(W,H);
}
Button.prototype = {
    MoveTo: function (x, y) {
        this.Location.x= x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W, H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
    Toggle: function () {
        if (this.bOn) {
            this.bOn = false;
            this.Element.className = this.styleOFF;
        }
        else {
            this.bOn = true;
            this.Element.className = this.styleON;
        }
    },
    Hide: function (){
        this.Element.style.display = "none";
    },
    Show: function() {
        this.Element.style.display = "block";
    },
    UpdateMsg: function (msg) {
        this.Element.innerHTML = msg;
        this.ButtonText = msg;
    },
    AssignCommand: function(Cmd) {
        this.Command = Cmd;
    },
    Restyle: function (sStyle) {
        this.Element.className = sStyle;
    }

};
//.............CHECKBOXES............................................................................//
function CheckBox (Owner, CheckboxName, x,y,W,H) {
    //Assign the name to be able to access
    this.Name = CheckboxName;
    //Create the variable to store location and size
    this.Location = new cLocSize();
    //create the element
    this.Element = document.createElement("input");
    this.Element.type = "checkbox";
    this.Element.checked = true;
    this.Element.id = this.Name;
    this.Element.className = "chkbox";
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "3";
    this.Element.Owner= Owner;
    this.Element.hID = this;
    this.MoveTo(x,y);
    this.Resize(W,H);
}
CheckBox.prototype = {
    MoveTo: function (x, y) {
        this.Location.x= x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W, H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
};
//.............RADIOBUTTONS..........................................................................//
function RadioButton (Owner, RadioButtonName, x,y,W,H) {
    this.Name = RadioButtonName;
    this.Location = new cLocSize();
    this.Element = document.createElement("input");
    this.Element.type = "radio";
    this.Element.name = "radioGrp";
    this.Element.value = this.Name;
    this.Element.id = RadioButtonName;
    this.Element.className = "rdobutton";
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "3";
    this.Element.Owner= Owner;
    this.Element.hID = this;
    this.MoveTo(x,y);
    this.Resize(W,H);
}
RadioButton.prototype = {
    MoveTo: function (x, y) {
        this.Location.x= x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W, H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
};
//.............STRIPS................................................................................//
function Strip(ACIndex) {
    this.Name = "Strip" + String(ACIndex);
    this.Location = new cLocSize(0,0,180,40);
    this.Element = document.createElement("div");
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "5";
    this.Element.id = this.Name;
    this.visible = true;
    this.Owner = null;

    this.bAlert = false;
    this.bFlash = false;
    this.bFlashOn = false;
    this.FlagAcknowledged = true;
    //correlate the strip to the aircraft status
    this.ACIndex = ACIndex;

    //add the elements of the strip - two lines of text overlaid by a button
    this.Line1 = document.createElement("p");
    this.Line1.style.position = "absolute";
    this.Line1.style.height = 14 + "px";
    this.Line1.appendChild(document.createTextNode("Strip Line 1"));

    this.Line2 = document.createElement("p");
    this.Line2.style.position = "absolute";
    this.Line2.style.left = 20 + "px";
    this.Line2.style.width = 140 + "px";
    this.Line2.style.height = 20 + "px";
    this.Line2.appendChild(document.createTextNode("Strip Line 2"));

    this.Sig1 = document.createElement("p");
    this.Sig1.style.position = "absolute";
    this.Sig1.style.top = 0 + "px";
    this.Sig1.style.left = 0 + "px";
    this.Sig1.style.width = 40 + "px";
    this.Sig1.style.height = 40 + "px";
    this.Sig1.appendChild(document.createTextNode("A"));

    this.Sig2 = document.createElement("p");
    this.Sig2.style.position = "absolute";
    this.Sig2.style.top = 0 + "px";
    this.Sig2.style.left = 0 + "px";
    this.Sig2.style.width = 12 + "px";
    this.Sig2.style.height = 16 + "px";
    this.Sig2.appendChild(document.createTextNode("A"));

    this.Button = document.createElement("button");
    this.Button.style.position = "absolute";
    this.Button.className = "genericbuttonoverlay";
    this.Button.style.left = 0 + "px";
    this.Button.style.top = 0 + "px";
    this.Button.style.width = 180 + "px";
    this.Button.style.zIndex = "10";
    this.Button.Owner = this;

    this.Flag = document.createElement("div");
    this.Flag.style.position = "absolute";
    this.Flag.style.top = 0 + "px";
    this.Flag.style.left = 170 + "px";
    this.Flag.style.width = 10 + "px";
    this.Flag.style.height = 10 + "px";

    this.Element.appendChild(this.Line1);
    this.Element.appendChild(this.Line2);
    this.Element.appendChild(this.Button);
    this.Element.appendChild(this.Sig1);
    this.Element.appendChild(this.Sig2);
    this.Element.appendChild(this.Flag);
}
Strip.prototype = {
    MoveTo: function (x,y) {
        this.Location.x = x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W,H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
    Fullsize: function (bFull) {
        if (bFull) {
            //this is a fullsize strip...
            this.Element.style.height = 32 + "px";

            this.Line1.style.left = 25 + "px";
            this.Line1.style.top = 0 + "px";
            this.Line1.style.width = 149 + "px";
            this.Line1.style.height = 10 + "px";

            this.Line2.style.display = "block";
            this.Line2.style.left = 25 + "px";
            this.Line2.style.top = 14 + "px";
            this.Line2.style.width = 149 + "px";
            this.Line2.style.height = 12 + "px";

            this.Sig1.style.display = "block";
            this.Sig1.style.left = 0 + "px";
            this.Sig1.style.top = 0 + "px";
            this.Sig1.style.width = 16 + "px";
            this.Sig1.style.height = 24 + "px";

            this.Sig2.style.display = "none";
            this.Button.style.height = 32 + "px";
            this.Flag.style.height = 32 + "px";
        }
        else {
            //half size strip
            this.Element.style.height = 20 + "px";
            this.Line1.style.left = 14 + "px";
            this.Line1.style.width = 160 + "px";
            this.Line2.style.display = "none";
            this.Sig1.style.display = "none";
            this.Sig2.style.display = "block";
            this.Button.style.height = 20 + "px";
            this.Flag.style.height = 20 + "px";
        }// end if/else
    },
    Active: function (bActive) {
        if (bActive) {
            this.Line1.className = "activestriptext";
            this.Line2.className = "activestriptext";
            this.Sig1.className = "activesignal1";
            this.Sig2.className = "activesignal2";
            this.Button.className = "activebuttonoverlay";
        }
        else {
            this.Line1.className = "inactivestriptext";
            this.Line2.className = "inactivestriptext";
            this.Sig1.className = "inactivesignal1";
            this.Sig2.className = "inactivesignal2";
            this.Button.className = "inactivebuttonoverlay";
        }
    },
    setSig1: function(msg) {
        this.Sig1.innerHTML = msg;
    },
    setSig2: function(msg) {
        this.Sig2.innerHTML = msg;
    },
    setLine1: function(msg) {
        this.Line1.innerHTML = msg;
    },
    setLine2: function(msg) {
        this.Line2.innerHTML = msg;
    },
    setFlagStatus: function (bAlert, bFlash, sStyle) {
        this.AlertStyle = sStyle;
        this.bAlert = bAlert;
        this.bFlash = bFlash;
        //if Alerted, set color
        if (this.bAlert) {
            this.Flag.className = this.AlertStyle;
        }
        else this.Flag.className = "flagoff";;
        //if flashing, set the flag
        if (this.bFlash) this.bFlashOn = true;

    },
    ToggleFlag: function() {
        if (this.bFlashOn) {
            this.bFlashOn = false;
            this.Flag.className = "flagoff";
        }
        else {
            this.bFlashOn = true;
            this.Flag.className = this.AlertStyle;
        }
    },
};
//*****************************************************************************************************
//
//     Messaging Class
//
//------------------------------------------------------
function MessageWindow(sName) {
    this.Name = sName;
    this.Location = new cLocSize(1,1,1,1);
    //create the div and add to the document
    this.Element = document.createElement("div");
    this.Element.style.position = "absolute";
    this.Element.style.zIndex = "2";
    this.Element.Owner = this;
    this.Element.style.fontSize = 18 + "px";
    this.Element.style.textAlign = "center";
    this.Element.style.padding = 0 + "px";
    this.Element.style.margin = 0 + "px";
    document.body.appendChild(this.Element);
}
MessageWindow.prototype = {
    Locate: function (x,y,W,H) {
        this.MoveTo(x,y);
        this.Resize(W,H);
    },
    MoveTo: function (x,y) {
        this.Location.x = x;
        this.Location.y = y;
        this.Element.style.top = String(this.Location.y) + "px";
        this.Element.style.left = String(this.Location.x) + "px";
    },
    Resize: function (W,H) {
        this.Location.W= W;
        this.Location.H = H;
        this.Element.style.width = String(this.Location.W) + "px";
        this.Element.style.height = String(this.Location.H) + "px";
    },
    Hide: function() {
        this.Element.style.display = "none";
    },
    Show: function() {
        this.Element.style.display = "block";
    },
    Send: function(Msg, MsgStyle) {
        this.Element.style.color = MsgStyle;
        this.Element.innerHTML = Msg;
        this.Show();
    },
};






























