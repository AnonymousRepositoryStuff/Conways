/*
    The 4 Rules of Conways Game:

    1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
    2. Any live cell with two or three live neighbours lives on to the next generation.
    3. Any live cell with more than three live neighbours dies, as if by overpopulation.
    4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

*/

"use strict"; // I program in TypeScript where I work, so quite liked the errors thrown, kind of like a compiler, as it caught some bugs early.

// I removed the oncontextmenu because in the site, it's very unaesthetic and ugly.
// It only obscured the grid, and provided poor UX.
document.oncontextmenu = function () {
    return false;
}

/*<Summary> In an attempt to logically group the methods, we place all grid manipulation on the Grid object.
 */
const Grid = {

    // The number of columns - same as rows, as we render a square
    columns : 0,
    
    /*<Summary> Clears the grid, and removes all the classes applied, also clears the info, and some other bits to start over fresh.
     */
    ClearGrid: function () {
        if (Conway.simulationRunning) {
            return;
        }
        const grid = document.querySelectorAll('.boxSmall, .boxMedium, .boxLarge, .boxXLarge');
        const info = document.getElementById("information");

        for (let i = 0; i < grid.length; i++) {
            grid[i].classList.remove("population");
        }
        info.innerHTML = "";
        document.getElementById("information").innerHTML = ""; // We dont need to keep warnings on screen for the user, if they're rendering a grid.
    },

    /*<Summary> Actually disposes and deletes the grid; not just clearing the grid.
     */
    DeleteGrid: function () {
        if (Conway.simulationRunning) {
            return;
        }
        const grid = document.querySelectorAll('.boxSmall, .boxMedium, .boxLarge, .boxXLarge, br');
        for (let i = 0; i < grid.length; i++) {
            let elem = grid[i];
            elem.parentNode.removeChild(elem);
        }
    },

    /*<Summary> Responsible for randomly generating obstacles in the grid, ~25% chance that the square will be an obstacle.
     */
    RandomObstacleGeneration: function () {
        if (Conway.simulationRunning) {
            return;
        }
        const grid = document.querySelectorAll('.boxSmall, .boxMedium, .boxLarge, .boxXLarge');
        if (grid.length) { // Just check the grid has been rendered. Or else we will warn the user they need to render a grid first
            for (let i = 0; i < grid.length; i++) {
                let highlight = (Math.round((Math.random()) * 100) / 100) // Generare a random number
                if (highlight > 0.75) {
                    grid[i].classList.add("population")
                } else {
                    // This class removal is just to ensure the user can click randomly generate button multiple times, and "try again" if they're not happy with the generation
                    grid[i].classList.remove("population");
                }
            }
        } else {
            document.getElementById("information").innerHTML = "You must first render a grid before you randomly generate obstacles.";
        }
    },

    /*<Summary> Renders a small, medium or large grid.
     */
    RenderGrid: function () {
        if (Conway.simulationRunning) {
            return;
        }

        let boxSizeClass = "", // CSS class to apply to the cells of the grid (changes if they render a small grid, medium grid or large grid). 
            checkedRadioButton;

        const radioButtons = document.getElementsByName('gridSize');

        Grid.DeleteGrid(); // If there's already a grid, dispose of anything before we draw a new grid.

        for (let i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].checked) {
                checkedRadioButton = radioButtons[i];
            }
        }

        // The number variable is the number of rows and columns we render, and the boxSizeClass is the css styling we apply to each of the cells in the grid.
        switch (checkedRadioButton.value) {
            case 'small':
                this.columns = 15;
                boxSizeClass = "boxSmall";
                break;
            case 'medium':
                this.columns = 25;
                boxSizeClass = "boxMedium";
                break;
            case 'large':
                this.columns = 35;
                boxSizeClass = "boxLarge"
                break;
            case 'xlarge':
                this.columns = 100;
                boxSizeClass = "boxXLarge"
                break;
        }

        for (let x = 1; x <= this.columns; x++) { // This deals with total numbers of rows
            for (let i = 1; i <= this.columns; i++) { // This deals with drawing one row
                
                const div = document.createElement("div");
                div.classList.add(boxSizeClass);

                if (i === 1) {
                    let linebreak = document.createElement("br"); // Push the next row onto a new line
                    document.getElementById("main").appendChild(linebreak);
                }

                document.getElementById("main").appendChild(div);
            }
        }
        Grid.AttachEventListeners(); // Attaches listeners to the parent container of my grid.
    },

    /*<Summary> Attaches event listeners to the main container. Avoids attaching event listeners to every cell, so we can bubble to parent.
     */
    AttachEventListeners: function () {

        const main = document.getElementById('main');
        let drag = "";

        // This was used to have "create drags" and "delete drags"
        // If your first click of the drag, begins on an obstacle grid, your drag will only ever remove obstacles
        // If your first click of the drag, begins on a free cell, you will only ever create obstacles.
        // Or you can individually click a cell to toggle obstacle on/off
        main.onmousedown = function (ev) {
            if (ev.target.classList.contains("population")) {
                drag = "remove";
            } else if (ev.target.className.startsWith('box')) {
                drag = "create";
            } else {
                drag = "";
            }
        }

        main.onmouseup = function (ev) {
            drag = "";
        }

        /*<Summary> Handles drag events, 
         */
        function dragHandler(ev) {
            if (drag === "create" && ev.target.className.startsWith('box')) {
                ev.target.classList.add("population");
            } else if (drag === "remove" && ev.target.className.startsWith('box')) {
                ev.target.classList.remove("population");
            }
        }

        /*<Summary> Handles mousemove event.
         */
        function mouseMoveHandler(ev) {
            if (drag === "create" && ev.target.className.startsWith('box')) {
                ev.target.classList.add("population");

            } else if (drag === "remove" && ev.target.className.startsWith('box')) {
                ev.target.classList.remove("population");
            }
        }

        /*<Summary> Handles mouse down events. We add start and end buttons before we add obstacles.
         */
        function mouseDownHandler(ev) { // handles setting start and end square
            if (ev.target.className.startsWith('box')) {
                ev.target.classList.toggle("population");
                return;
            }
        }

        // We add it to the parent, to avoid attaching eventListeners to every single child.
        // Essentially event bubbling to the parent.    
        main.addEventListener("mousedown", mouseDownHandler);
        main.addEventListener('mousemove', mouseMoveHandler);
        main.addEventListener('drag', dragHandler);
    }
}

/*<Summary> In an attempt to logically group methods, we place all simulation logic on the Conway object.
 */
const Conway = {

    simulationRunning : false,
    generationCount : 0,

    // We can't just immeadiatly highlight all the ones that will come back to life/die, or else we'll throw off subsequent calculations later in the row etc.
    // So push it an array and toggle the population class before next generation
    totalNodes : [],

    Begin : function(){
        if(!this.simulationRunning) {
            // Make the grid radio buttons unclickable whilst the simulation runs
            document.getElementById("GridRender").classList.add("noClick");
            document.getElementById("main").classList.add("noClick");

            // We could just call Tick straightaway, but we need to reset generation etc. if the user renders Conways multiple times
            this.simulationRunning = true;
            this.generationCount = 0;
            Conway.Tick();
        }
    },

    End : function(){

        if (!this.simulationRunning) { // Just check the grid has been rendered. Or else we will warn the user they need to render a grid first
            document.getElementById("information").innerHTML = "You must first start the game before attempting to end it.";
            this.simulationRunning = false;
            return;
        } 

        this.simulationRunning = false;
        this.totalNodes.length = 0;
        document.getElementById("GridRender").classList.remove("noClick");
        document.getElementById("main").classList.remove("noClick");
    },

    Tick: function () {
        // Has the user ended the simulation? Stop drawing
        if (!this.simulationRunning) {
            return;
        } else {

            const grid = document.querySelectorAll('.boxSmall, .boxMedium, .boxLarge, .boxXLarge');
            if (!grid.length) { // Just check the grid has been rendered. Or else we will warn the user they need to render a grid first
                document.getElementById("information").innerHTML = "You must first render a grid before you attempt to run the game.";
                this.simulationRunning = false;
                return;
            } 

            if(this.totalNodes.length){
                for(let i=0; i < this.totalNodes.length; i++){
                    this.totalNodes[i].classList.toggle("population");
                }
            }

            this.totalNodes = [];
            document.getElementById("information").innerText = "Generation " + this.generationCount;
            this.generationCount++;

            for (let i = 0; i < grid.length; i++) {
                // The current population node we're going to explore
                let current = grid[i],
                    up           = grid[i - Grid.columns],
                    down         = grid[i + Grid.columns],
                    left         = grid[i - 1],
                    right        = grid[i + 1],
                    diagTopLeft  = grid[i - Grid.columns - 1],
                    diagTopRight = grid[i - Grid.columns + 1],
                    diagBotLeft  = grid[i + Grid.columns - 1],
                    diagBotRight = grid[i + Grid.columns + 1];

                const neighbours = [up, down, left, right, diagTopLeft, diagTopRight, diagBotLeft, diagBotRight];

                const neighbourCount = Conway.CalculateNeighbours(current, neighbours);

                if (current.classList.contains("population")) {
                    this.LiveCell(current, neighbourCount);
                } else {
                    this.DeadCell(current, neighbourCount);
                }
            }

            setTimeout(() => {
                this.Tick();                                        
            }, 500)
        }
    },

    CalculateNeighbours: function (current, neighbours) {
        let neighbourCount = 0;
        for (let i = 0; i < neighbours.length; i++) {
            if (neighbours[i] && neighbours[i].classList.contains("population")) {
                neighbourCount++;
            }
        }
        return neighbourCount;
    },

    DeadCell: function (current, neighbourCount) {
        if(neighbourCount === 3){
            this.totalNodes.push(current);
        }
    },

    LiveCell: function (current, neighbourCount) {
        if(neighbourCount === 0 || neighbourCount === 1){
            // Dies by underpopulation
            this.totalNodes.push(current);    
        } else if(neighbourCount > 3){
            // Dies by overpopulation
            this.totalNodes.push(current)
        }
    }
}