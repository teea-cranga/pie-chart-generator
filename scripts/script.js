window.onload = function () {
    let pieCanvas = document.getElementById('pieCanvas');
    let pCtx = pieCanvas.getContext("2d");
    let canvDiv = document.getElementById('canvDiv');
    let canvasOptions = document.getElementById('canvasOptions');
    let updateBtn = document.getElementById('updateBtn');

    let width = pieCanvas.width;
    let height = pieCanvas.height;

    elem = document.getElementById("submitFileButton");
    elem.addEventListener("click", () => {
        //validation
        console.log("still works");

        //display canvas and all that
        canvDiv.style.visibility = "visible";    //make the canvas visible
        canvasOptions.style.visibility = "visible";

        let values = [230, 345, 100, 654];       //test variables
        let labels = ["label_1", "label_2", "label_3", "label_4"];
        let angles = drawPie(values, labels);

        // !!!! WIP THIS WILL BE DELETED EVENTUALLY 
        updateBtn.addEventListener("click", () => {
            updatePieColor(angles[2], "white", 2);
        })
    })


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

            pCtx.moveTo(width / 2 - 150, height / 2);      //move to center
            pCtx.arc(width / 2 - 150, height / 2, height / 3, last, last + Math.PI * 2 * (argsArray[i] / total));

            angles.push([last, last + Math.PI * 2 * (argsArray[i] / total)]);
            last += Math.PI * 2 * (argsArray[i] / total);   //add the end of the last angle ^ 
            pCtx.lineWidth = 2;
            pCtx.lineTo(width / 2 - 150, height / 2);      //to make the pie lines

            //rectangle with color for label
            pCtx.rect(width / 2 + 170, 30 * i + 10, 20, 20);
            pCtx.fill();
            pCtx.stroke();

            pCtx.save();                                    //to keep the coordinates as they are above

            //for labels
            pCtx.translate(width / 2 + 150, 30 * (i + 1));    // move the cursor in order for the labels and pie to not overlap
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
}
