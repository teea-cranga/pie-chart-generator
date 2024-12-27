let fileHandled = undefined; //its here cause the drop handler is not in .onload. pls just let me live i know it looks stupid ;-; 

window.onload = function () {
    let pieCanvas = document.getElementById('pieCanvas');
    let pCtx = pieCanvas.getContext("2d");
    let canvDiv = document.getElementById('canvDiv');
    let canvasOptions = document.getElementById('canvasOptions');
    let updateBtn = document.getElementById('updateBtn');
    let submitBtn = document.getElementById("submitFileButton");
    let fileInput = document.getElementById("selectFileInput")

    let width = pieCanvas.width;
    let height = pieCanvas.height;
    let defaultColors = ["red", "orange", "green", "yellow", "blue", "white", "purple", "cyan", "magenta"];

    submitBtn.addEventListener("click", async () => {
        //validation
        //console.log(fileHandled, typeof(fileHandled));

        if (fileHandled === undefined) fileHandled = fileInput.files[0] //could switch this to a listener da ma simt taranca srry
        if (fileHandled){  
        
        let Arrays = {
            keys: [],
            values: [] 
        };

        Arrays = await parseFile(fileHandled); //should have the labels and the sum of all values per column (if its on multiple lines)

        console.log("AFTER ASYNC READER FUNCTION")
        console.log(Arrays.keys);
        console.log(Arrays.values);

        //display canvas and all that
        canvDiv.style.visibility = "visible";    //make the canvas visible
        canvasOptions.style.visibility = "visible";
        
       // let angles = drawPie(valuesArray, labelsArray);

        // !!!! WIP THIS WILL BE DELETED EVENTUALLY 
        updateBtn.addEventListener("click", () => {
            updatePieColor(angles[2], "white", 2);
        });

    }
    else {
        alert("No selected file!");
    }

    });


    //!!!!!UTILS
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
            pCtx.fillStyle = "black"; //for text
            pCtx.font = height / 3 / 10 + "px Arial";
            pCtx.fillText(labelsArray[i] + ': ' + Math.trunc(argsArray[i] / total * 100) + '%', pCtx.measureText(labelsArray[i]).width / 2, 0);

            pCtx.restore(); //idk how and why, but if i delete this, it destroys the pie... this is literally the coconut png situation
        }

        return angles;
    }

    //  WIP !!!!
    function updatePieColor(last, newColor, i) {

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
    }

    //source https://stackoverflow.com/questions/50528954/give-each-shape-on-html5-canvas-a-random-colour
    function generateRandomColor() {
        var red = Math.floor(Math.random() * 256);
        var green = Math.floor(Math.random() * 256);
        var blue = Math.floor(Math.random() * 256);

        return "rgb(" + red + "," + green + "," + blue + " )";
    }

    function readFileAsync(file) { 
        let Arrays = {
            keys: [],
            values: [] 
        };
        return new Promise((resolve, reject) => { 
            
        let sums=[];
        nrColumns = 0;
        if (file) {
            let line;
            let resultString;
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(e){
                resultString = reader.result;
                resultString = resultString.split("\r\n"); //split it per lines

                line = resultString[0].split(","); //label parsing

                    for (let j =0; j<line.length; j++){
                        Arrays.keys[j] = line[j];
                        nrColumns++;
                    }

                    sums=new Array(nrColumns).fill(0); //initialize the sums array

                for (let i=1; i<resultString.length; i++){ //values parsing
                    line = resultString[i].split(","); 

                    for (let j =0; j<line.length; j++){
                        sums[j] += Number(line[j]);
                    }

                }
                Arrays.values = sums;

                //console.log(resultString); 
                //console.log(Arrays.keys);
                //console.log(Arrays.values);

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
            console.log("File read successfully:", Arrays); 
            // Continue execution after onload is done 
            return Arrays;
        } 
        catch (error) { 
            console.error("Error reading file:", error); 
        } 
    }

}


function dragOverHandler(ev) {
    console.log('File(s) in drop zone');
    ev.preventDefault();
  }


function dropHandler(ev) {
    console.log('File(s) dropped');

    ev.preventDefault();

    if (ev.dataTransfer.items) {
        if (ev.dataTransfer.items[0].kind === 'file' && (ev.dataTransfer.items[0].getAsFile().type === 'text/csv' || ev.dataTransfer.items[0].getAsFile().name.endsWith('.csv'))){
            fileHandled = ev.dataTransfer.items[0].getAsFile(); ///here we get the file from the drag and drop API
        }
    }
    removeDragData(ev)
}

function removeDragData(ev) {
    //console.log('Removing drag data')

    if (ev.dataTransfer.items) {
        ev.dataTransfer.items.clear();
    }
}