let currentBoard = -1;
let addButton = document.getElementById("addButton");

function disableMenu() {
    let menu = document.querySelectorAll(".mdl-menu__item");
    for(let i = 0; i < menu.length; i++){
        menu[i].setAttribute("disabled", "");
    }
}

function enableMenu() {
    let menu = document.querySelectorAll(".mdl-menu__item");
    for(let i = 0; i < menu.length; i++){
        menu[i].removeAttribute("disabled");
    }
}

function drawBoard(i) {
    for(let j = 0; j < json.boards[i].lists.length; j++){
        let t = document.querySelector("#listTemplate");
        let title = t.content.querySelector("#title");

        if(title.firstChild){
            title.removeChild(title.firstChild);
        }
        title.appendChild(document.createTextNode(json.boards[i].lists[j].name));

        let list = t.content.querySelector("#list");
        while(list.firstChild){
            list.removeChild(list.firstChild);
        }

        for(let k = 0; k < json.boards[i].lists[j].items.length; k++){
            let row = document.createElement("li");
            row.appendChild(document.createTextNode(json.boards[i].lists[j].items[k].Text));
            row.classList.add("mdl-list__item");

            list.appendChild(row);
        }

        let clone = document.importNode(t.content, true);
        let listsDiv = document.querySelector("#listsDiv");

        let clear = clone.querySelector("#deleteButton");
        clear.addEventListener("click", function() {
            let xhttp = new XMLHttpRequest();
            let urlEncodedData = "";
            let urlEncodedDataPairs = [];

            urlEncodedDataPairs.push(encodeURIComponent("board") + "=" + encodeURIComponent(json.boards[i].name));
            urlEncodedDataPairs.push(encodeURIComponent("name") + "=" + encodeURIComponent(json.boards[i].lists[j].name));
            urlEncodedData = urlEncodedDataPairs.join("&").replace(/%20/g, "+");

            xhttp.open("DELETE", "http://localhost:8000/del/list", true);
            xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhttp.send(urlEncodedData);

            getJSON();
        });

        listsDiv.appendChild(clone);
    }
}

function getJSON() {
    let xhttp = new XMLHttpRequest();
    let navigation = document.getElementById("navbar");

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){
            json = JSON.parse(xhttp.responseText);
            console.log(json);

            while(navigation.firstChild){
                navigation.removeChild(navigation.firstChild);
            }

            for(let i = 0; i < json.boards.length; i++){
                let board = document.createElement("button");
                let boardName = document.createTextNode(json.boards[i].name);

                board.appendChild(boardName);
                board.classList.add("mdl-js-ripple-effect");
                board.classList.add("mdl-button");
                board.classList.add("mdl-js-button");
                board.addEventListener("click", function() {
                    if(i !== currentBoard){
                        let list = document.querySelector("#listsDiv");
                        while(list.firstChild){
                            list.removeChild(list.firstChild);
                        }

                        [].forEach.call(navigation.children, function(child) {
                            child.classList.remove("mdl-button--colored");
                        });

                        board.classList.add("mdl-button--colored");

                        enableMenu();
                        currentBoard = i;

                        drawBoard(i);
                    }
                });

                navigation.appendChild(board);
            }
        }
        if(currentBoard >= 0){
            enableMenu();

            let list = document.querySelector("#listsDiv");
            while(list.firstChild){
                list.removeChild(list.firstChild);
            }

            [].forEach.call(navigation.children, function(child) {
                child.classList.remove("mdl-button--colored");
            });

            let board = navigation.children[currentBoard];
            board.classList.add("mdl-button--colored");

            drawBoard(currentBoard);
        }
    };
    xhttp.open("GET", "http://localhost:8000/json", true);
    xhttp.send();
}

function addButtonToggle() {
    addButton.classList.toggle('rotated');
    let boardButton = document.getElementById("boardButton");
    let listButton = document.getElementById("listButton");
    let itemButton = document.getElementById("itemButton");
    if(boardButton.style.display == "none") {
        boardButton.style.display = "inline-block";
        listButton.style.display = "inline-block";
        itemButton.style.display = "inline-block";
    }
    else{
        boardButton.style.display = "none";
        listButton.style.display = "none";
        itemButton.style.display = "none";
    }
}

getJSON();
addButton.addEventListener("click", addButtonToggle);

{
    let dialog = document.querySelector('#boardDialog');
    let showDialogButton = document.querySelector('#boardButton');
    showDialogButton.addEventListener('click', function() {
        dialog.showModal();
    });
    let close = dialog.querySelectorAll(".close");
    for(let i = 0; i < close.length; i++){
        close[i].addEventListener('click', function() {
            setTimeout(getJSON, 200);
            dialog.close();
        });
    }
}

{
    let dialog = document.querySelector('#listDialog');
    let showDialogButton = document.querySelector('#listButton');
    showDialogButton.addEventListener('click', function() {
        dialog.showModal();
    });
    let close = dialog.querySelectorAll(".close");
    for(let i = 0; i < close.length; i++){
        close[i].addEventListener('click', function() {
            setTimeout(getJSON, 200);
            dialog.close();
        });
    }
}

{
    let dialog = document.querySelector('#itemDialog');
    let showDialogButton = document.querySelector('#itemButton');
    showDialogButton.addEventListener('click', function() {
        dialog.showModal();
    });
    let close = dialog.querySelectorAll(".close");
    for(let i = 0; i < close.length; i++){
        close[i].addEventListener('click', function() {
            setTimeout(getJSON, 200);
            dialog.close();
        });
    }
}

window.addEventListener('click', function(e){
    let boardButton = document.getElementById("boardButton");
    if(!addButton.contains(e.target) && boardButton.style.display != "none"){
        addButtonToggle();
    }
});

let deleteBoardButton = document.querySelector("#deleteBoardButton");
deleteBoardButton.addEventListener("click", function() {
    let xhttp = new XMLHttpRequest();
    let urlEncodedData = "";
    let urlEncodedDataPairs = [];

    urlEncodedDataPairs.push(encodeURIComponent("name") + "=" + encodeURIComponent(json.boards[currentBoard].name));
    urlEncodedData = urlEncodedDataPairs.join("&").replace(/%20/g, "+");

    xhttp.open("DELETE", "http://localhost:8000/del/board", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(urlEncodedData);

    currentBoard = -1;
    disableMenu();
    setTimeout(getJSON, 200);
});
