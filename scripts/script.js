let fileHandled = undefined; //its here cause the drop handler is not in .onload. pls just let me live i know it looks stupid ;-; 

window.onload = function () {
    //#region Form Flags
    let aggregateRow = document.getElementById("aggregateRow");
    let aggregateColumn = document.getElementById("aggregateColumn");
    let chkDataLabelRows = document.getElementById("chkDataLabelRows");
    let chkDataLabelColumns = document.getElementById("chkDataLabelColumns");
    let sumDataRows = document.getElementById("sumDataRows");
    let sumDataColumns = document.getElementById("sumDataColumns");
    //#endregion

    let pieCanvas = document.getElementById('pieCanvas');
    let pCtx = pieCanvas.getContext("2d");
    let canvDiv = document.getElementById('canvDiv');

    let submitBtn = document.getElementById("submitFileButton");
    let fileInput = document.getElementById("selectFileInput")

    let width = pieCanvas.width;
    let height = pieCanvas.height;
    let labelSelect = document.getElementById('labelSelect');
    let colorSelect = document.getElementById('colorSelect');

    document.getElementById("clearFileButton").addEventListener("click", () => { //clear file button implementation
        fileHandled = undefined;
        document.getElementById("dropFeedback").style.visibility = 'hidden';
        document.getElementById("inputCustomizables").style.display = "none";
        document.getElementById('canvasOptions').style.visibility = "hidden";
        fileInput.value = '';

        //reset canvas
        pCtx.clearRect(0, 0, width, height);
        canvDiv.style.visibility = "hidden";

        //remove options from the label select
        for(let i = 0 ; i < labelSelect.length; i++){
            console.log("I removed option with label: ", labelSelect.options[i].value);
            labelSelect.removeChild(labelSelect.options[i]);
            i--;
        }
    })

    //#region  Flag validation
    chkDataLabelRows.addEventListener("change", () => { //prevent unchecking labeled rows if we're aggregating by rows
        if (!chkDataLabelRows.checked && aggregateRow.checked == true) {
            chkDataLabelRows.checked = true;
        }
    })

    chkDataLabelColumns.addEventListener("change", () => { //same, with the column aggregate case
        if (!chkDataLabelColumns.checked && aggregateColumn.checked == true) {
            chkDataLabelColumns.checked = true;
        }
    })

    aggregateRow.onclick = function () {
        chkDataLabelRows.checked = true;
    }

    aggregateColumn.onclick = function () {
        chkDataLabelRows.checked = false;
        chkDataLabelColumns.checked = true;
        console.log("skjdhgfkjasdhgklasj");
    }

    //#endregion

    submitBtn.addEventListener("click", async () => {
        document.getElementById("dropFeedback").style.visibility = 'hidden';
        document.getElementById("inputCustomizables").style.display = "none";

        //flags again
        if (aggregateRow.checked == false && aggregateColumn.checked == false) {
            alert("We must aggregate by something, you know"); //should never get here
        }
        else {
            if (fileHandled) {

                //to avoid some bug that didn't clear the select of labels and just added other labels
                if(labelSelect.length > 0)
                {
                    for(let i = 0 ; i < labelSelect.length; i++){
                        console.log("I removed option with label: ", labelSelect.options[i].value);
                        labelSelect.removeChild(labelSelect.options[i]);
                        i--;
                    }
                }

                let Arrays = {
                    keys: [],
                    values: []
                };

                Arrays = await parseFile(fileHandled); //should have the labels and the sum of all values per column (if its on multiple lines)

                //console.log("AFTER ASYNC READER FUNCTION")
                //console.log(Arrays.keys);
                //console.log(Arrays.values);

                //#region Canvas stuff
                canvDiv.style.visibility = "visible";    //make the canvas visible
                document.getElementById('canvasOptions').style.visibility = "visible";

                let angles = drawPie(Arrays.values, Arrays.keys);

                for(let i = 0; i < Arrays.keys.length; i++){
                    let option = document.createElement("option");
                    option.value = i+1;
                    option.text = Arrays.keys[i];
                    labelSelect.add(option);
                }       


                //for updating stuff
                document.getElementById('updateBtn').addEventListener('click', ()=>{
                    let inputName = document.getElementById('newLabelInput');
                    console.log(angles[labelSelect.selectedIndex], colorSelect.options[colorSelect.selectedIndex].text, labelSelect.selectedIndex, inputName.value);
                    //wip
                    updatePie(Arrays.keys, angles[labelSelect.selectedIndex], colorSelect.options[colorSelect.selectedIndex].text, labelSelect.selectedIndex, inputName.value);
                });

                //#endregion
            }
            else {
                alert("No selected file!");
            }
        }

    });


    //#region Utils
    function drawPie(argsArray, labelsArray) {              //input: an array of values
        let total = 0;                                      //used to compute the percentages in pie
        let last = 0;                                       //also for percentage
        for (let i = 0; i < argsArray.length; i++) {
            total += argsArray[i];
        }

        let angles = [];                                    //to store the angles

        pCtx.clearRect(0, 0, width, height);

        //"borrowed" from https://stackoverflow.com/questions/6995797/html5-canvas-pie-chart (i promise i kind of understand this code) :(
        for (let i = 0; i < argsArray.length; i++) {

            pCtx.fillStyle = generateRandomColor();
            pCtx.beginPath();

            pCtx.moveTo(width / 2 - 150, height / 2);       //move to center
            pCtx.arc(width / 2 - 150, height / 2, height / 3, last, last + Math.PI * 2 * (argsArray[i] / total));

            angles.push([last, last + Math.PI * 2 * (argsArray[i] / total)]);
            last += Math.PI * 2 * (argsArray[i] / total);   //add the end of the last angle ^ 
            pCtx.lineWidth = 2;
            pCtx.lineTo(width / 2 - 150, height / 2);       //to make the pie lines

            //rectangle with color for label
            pCtx.rect(width / 2 + 170, 30 * i + 10, 20, 20);
            pCtx.fill();
            pCtx.stroke();

            pCtx.save();                                    //to keep the coordinates as they are above

            //for labels
            pCtx.translate(width / 2 + 150, 30 * (i + 1));  // move the cursor in order for the labels and pie to not overlap
            console.log('where does it go?', width/2 + 150, 30 * (i+1));
            pCtx.fillStyle = "black"; //for text
            pCtx.font = 22 + "px Arial";
            pCtx.fillText(labelsArray[i] + ': ' + Math.trunc(argsArray[i] / total * 100) + '%', pCtx.measureText(labelsArray[i]).width / 2, 0);

            pCtx.restore(); //idk how and why, but if i delete this, it destroys the pie... this is literally the coconut png situation
        }

        return angles;
    }

    //  WIP !!!!
    function updatePie(keys, last, newColor, i, newLabel) {

        pCtx.beginPath();
        pCtx.fillStyle = newColor;
        pCtx.lineWidth = 2;
        pCtx.moveTo(width / 2 - 150, height / 2);
        pCtx.arc(width / 2 - 150, height / 2, height / 3, last[0], last[1]);
        pCtx.lineTo(width / 2 - 150, height / 2);
        pCtx.rect(width / 2 + 170, 30 * i + 10, 20, 20);
        pCtx.fill();
        pCtx.stroke();
        pCtx.save();

        pCtx.restore();

        //#region Dead dove do not eat
        // pCtx.clearRect(width / 2 + 200, 30 * keys.length, width, height);
        // for(let i = 0; i < keys.length; i++){
        //     if(keys[i] === labelSelect.options[i])
        //         pCtx.fillText(newLabel + ': ' + Math.trunc( 100 / total * 100) + '%', pCtx.measureText(newLabel).width / 2, 0);

        // }
        //#endregion
    }

    //source https://stackoverflow.com/questions/50528954/give-each-shape-on-html5-canvas-a-random-colour
    function generateRandomColor() {
        var red = Math.floor(Math.random() * 256);
        var green = Math.floor(Math.random() * 256);
        var blue = Math.floor(Math.random() * 256);

        return "rgb(" + red + "," + green + "," + blue + " )";
    }

    //#endregion

    //#region Zona Cursed
    //I am so so sorry for this function
    function readFileAsync(file) {
        let Arrays = {
            keys: [],
            values: []
        };
        return new Promise((resolve, reject) => {

            if (file) {
                let sums = [];
                nrColumns = 0;
                nrRows = 0;
                let lines = [];
                let resultString;
                let reader = new FileReader();
                reader.readAsText(file);
                reader.onload = function (e) {
                    resultString = reader.result;
                    resultString = resultString.split("\r\n"); //split it per lines

                    //#region NrRows,NrCols 

                    //(updated in sums init based on flags)
                    let holder = resultString[0];
                    holder = holder.split(",");
                    for (let x = 0; x < holder.length; x++) {
                        if (holder[x] != '') //in case of empty columns
                            nrColumns++;
                    }

                    let holderRows = resultString;
                    for (let y = 0; y < holderRows.length; y++) {
                        if (holderRows[y] != '') //in case of empty rows
                            nrRows++;
                    }
                    console.log(`Rows and cols before flags: ${nrRows}, ${nrColumns}`);
                    //#endregion

                    //#region Sums initialization
                    if (aggregateColumn.checked == true) {
                        if (chkDataLabelRows.checked == true){ //if i want to aggregate by columns and there are labels at the start of every row, i ignore the first column
                            nrColumns-=1;
                        }
                        if (sumDataRows.checked == true){ //if i want to aggregate by columns and the last column is a sum column, i ignore that last column
                            nrColumns-=1;
                        } 
                        sums = new Array(nrColumns).fill(0); 
                    } 

                    else {
                        if (chkDataLabelColumns.checked == true){ //if i want to aggregate by rows and there are labels at the start of every column, i ignore the first row
                            nrRows-=1;
                        }
                        if (sumDataColumns.checked == true){ //if i want to aggregate by rows and the last row is a sum row, i ignore that last row
                            nrRows-=1;
                        } 
                        sums = new Array(nrRows).fill(0); 
                    }

                    console.log(`Rows: ${nrRows}, Columns: ${nrColumns}`);
                    console.log(sums);

                    //#endregion

                    //#region Matrix building
                    for (let i = 0; i < resultString.length; i++) { //values parsing
                        lines[i] = resultString[i].split(",");
                    }

                    console.log(lines)
                    //#endregion
                    
                    //#region Aggregate by rows case
                    if (aggregateRow.checked == true){
                        let labelsFlag = Number(chkDataLabelColumns.checked == true); //first row has labels for the columns
                        let sumBadFlag = Number(sumDataColumns.checked == true); //last row is a sum row for the columns
                        let sumGoodFlag = Number(sumDataRows.checked == true); //last column is a sum column for the rows

                        console.log(`labelsFlag: ${labelsFlag}, sumBadFlag: ${sumBadFlag}, sumGoodFlag: ${sumGoodFlag}`);
                        //console.log(lines[0]);

                        for (let i =0; i< (nrRows + labelsFlag); i++){
                            Arrays.keys[i] = lines[i][0];
                        }
                        if (labelsFlag) Arrays.keys.shift();
                        // ^ Arrays.keys solved

                        if (sumGoodFlag){
                            for (let i =0; i< (nrRows+labelsFlag); i++){
                                Arrays.values[i] = Number(lines[i][nrColumns-1]); //-1 because we start indexes from 0 everywhere
                            }
                            if (labelsFlag) Arrays.values.shift();
                        }

                        else{
                            for (let i =0+labelsFlag; i< (nrRows+labelsFlag); i++){
                                for (let j =1; j< nrColumns; j++){
                                    sums[i-labelsFlag] += Number(lines[i][j]);
                                }
                            }
                            Arrays.values = sums;
                        }
                    }
                    //#endregion

                    //#region Aggregate by columns case
                    else{
                        let labelsFlag = Number(chkDataLabelRows.checked == true); //first column has labels for the rows
                        let sumBadFlag = Number(sumDataRows.checked == true); //last column is a sum column for the rows
                        let sumGoodFlag = Number(sumDataColumns.checked == true); //last row is a sum row for the columns

                        console.log(`labelsFlag: ${labelsFlag}, sumBadFlag: ${sumBadFlag}, sumGoodFlag: ${sumGoodFlag}`);

                        for (let i =0; i< (nrColumns + labelsFlag); i++){
                            Arrays.keys[i] = lines[0][i];
                        }
                        if (labelsFlag) Arrays.keys.shift();
                        // ^ Arrays.keys solved

                        if (sumGoodFlag){
                            for (let i =0; i< (nrColumns+labelsFlag); i++){
                                Arrays.values[i] = Number(lines[nrRows-1][i]); //-1 because we start indexes from 0 everywhere
                            }
                            if (labelsFlag) Arrays.values.shift();
                        }

                        else{
                            for (let i =1; i< (nrRows); i++){
                                    for (let j =0 + labelsFlag; j< (nrColumns+labelsFlag); j++){
                                        sums[j - labelsFlag] += Number(lines[i][j]);
                                        //console.log(j, lines[i][j], sums[j]);
                                    }                                
                            }
                            Arrays.values = sums;

                        }

                    }
                    //#endregion
                    
                    console.log(Arrays.keys);
                    console.log(Arrays.values);

                    resolve(Arrays);

                }
                reader.onerror = reject;
            }

        });
    }

    async function parseFile(file) {
        let Arrays = {
            keys: [],
            values: []
        };
        try {
            const Arrays = await readFileAsync(file);
            //console.log("File read successfully:", Arrays);
            // Continue execution after onload is done 
            return Arrays;
        }
        catch (error) {
            console.error("Error reading file:", error);
        }
    }

    //#endregion

    fileInput.addEventListener("change", () => {
        fileHandled = fileInput.files[0];
        document.getElementById("inputCustomizables").style.display = "block"
    })


}

//#region Drag and Drop
function dragOverHandler(ev) {
    console.log('File(s) in drop zone');
    ev.preventDefault();
}


function dropHandler(ev) {
    console.log('File(s) dropped');
    document.getElementById("dropFeedback").style.visibility = 'visible';

    ev.preventDefault();

    if (ev.dataTransfer.items) {
        if (ev.dataTransfer.items[0].kind === 'file' && (ev.dataTransfer.items[0].getAsFile().type === 'text/csv' || ev.dataTransfer.items[0].getAsFile().name.endsWith('.csv'))) {
            fileHandled = ev.dataTransfer.items[0].getAsFile(); ///here we get the file from the drag and drop API
        }
    }
    removeDragData(ev)
    document.getElementById("inputCustomizables").style.display = "block"
}

function removeDragData(ev) {
    //console.log('Removing drag data')

    if (ev.dataTransfer.items) {
        ev.dataTransfer.items.clear();
    }
}
//#endregion