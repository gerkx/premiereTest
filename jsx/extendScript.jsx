function createOverlays(str) {
    var seq = app.project.activeSequence;
    var markers = markersToArray(seq.markers);
    var relMarkers = relativeMarkers(seq, markers);

    var filterString = "";
    if (Folder.fs === 'Windows'){
        filterString = "Motion Graphics Templates:*.mogrt";
    }

    var mogrtToImport = File.openDialog (
        "Choose a template file", // title
        filterString,  // filter available files
        false
    );	
            
    for (var i = 0; i < relMarkers.length; i++) {
        if (mogrtToImport) {
            
            var shot = str + padZero((1+i)*10, 4);
            var targetTime = relMarkers[i].start;
            var vidTrackOffset = 4;
            var audTrackOffset = 0;
            var newTrackItem = seq.importMGT(	
                mogrtToImport.fsName, 
                targetTime.ticks, 
                vidTrackOffset,
                audTrackOffset
            );
            if (newTrackItem){
                (i == relMarkers.length - 1) 
                    ? newTrackItem.end = seq.getOutPointAsTime()
                    : newTrackItem.end = relMarkers[i + 1].start;
                var shotDur = Math.round(
                    (newTrackItem.end.seconds - newTrackItem.start.seconds) * 25
                );
                var moComp = newTrackItem.getMGTComponent();
                var params = moComp.properties;
                if (moComp) { 
                    var srcTextParam = params.getParamForDisplayName("txt");
                    var srcDurParam = params.getParamForDisplayName("dur");
                    if (srcTextParam) srcTextParam.setValue(shot);                    
                    if (srcDurParam) srcDurParam.setValue(shotDur);
                }
            }
        }
    }
}


function markersToArray(markerObject) {
    var markerArr = [];
    var currMarker;
    for(var i=0; i<markerObject.numMarkers; i++){        
        if(i==0){
            currMarker = markerObject.getFirstMarker();
            markerArr.push(currMarker);
        }else{
            currMarker = markerObject.getNextMarker(currMarker);
            markerArr.push(currMarker);
        }
    }
    return markerArr;
}

function padZero(num, zeros) {
    num = num.toString();
    while(num.length< zeros){
      num = "0" + num;
    }
    return num
  }

function relativeMarkers(seq, markers) {
    var inPoint = seq.getInPoint();
    var outPoint = seq.getOutPoint();

    var beforeIn = [];
    var afterOut = [];

    for (var i = 0; i < markers.length; i ++) {
        if (markers[i].start.seconds < inPoint) beforeIn.unshift(i);
        if (markers[i].start.seconds > outPoint) afterOut.push(i);
    }

    var sliceStart;
    var sliceEnd;
    (beforeIn.length < 1) ? sliceStart = 0 : sliceStart = beforeIn[0] + 1;
    (afterOut.length < 1) ? sliceEnd = markers.length - 1 : sliceEnd = afterOut[0];


    var relevantMarkers = markers.slice(sliceStart, sliceEnd);

    return relevantMarkers
  }