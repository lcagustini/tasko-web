function once(fn){
    let returnValue;
    let canRun = true;
    return function runOnce(){
        if(canRun) {
            returnValue = fn.apply(this, arguments);
            canRun = false;
        }
        return returnValue;
    }
}

function throttle(fn, interval) {
    let lastTime;
    return function throttled() {
        let timeSinceLastExecution = Date.now() - lastTime;
        if(!lastTime || (timeSinceLastExecution >= interval)) {
            fn.apply(this, arguments);
            lastTime = Date.now();
        }
    };
}

function getBrightness(hexCode) {
    hexCode = hexCode.replace('#', '');

    var c_r = parseInt(hexCode.substr(0, 2),16);
    var c_g = parseInt(hexCode.substr(2, 2),16);
    var c_b = parseInt(hexCode.substr(4, 2),16);

    return 1 - ( 0.299 * c_r + 0.587 * c_g + 0.114 * c_b)/255;
}

function requestJSON(method, url, data, callback){
    console.log("Request --\nMethod:"+method+"\tUrl:"+url+"\nData:\n"+data);

    let request = new XMLHttpRequest();
    request.open(method, url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = () => {
        if(request.readyState == 4 && (request.status == 204 || request.status == 200)){
            callback(request);
        }
    };
    if(data){
        request.send(data, true);
    }
    else{
        request.send(true);
    }
}

function newList(){
    let currentBoard = document.querySelector("#board-title").innerHTML;

    if(currentBoard != ""){
        let add = document.querySelector("#list-add");
        let page = document.querySelector(".page-content");
        let textField = document.importNode(document.querySelector("#list-input-template").content, true);

        page.replaceChild(textField, add);

        let input = page.children[page.children.length-1].querySelector("#new-list-name");
        input.addEventListener("focusout", () => {
            page.replaceChild(add, page.querySelector("#new-list-form"));
        });
        page.querySelector("#new-list-form").addEventListener("submit", (e) => {
            e.preventDefault();

            requestJSON("POST",
                "/new/list",
                `{ \"name\": \"${page.querySelector("#new-list-name").value}\", \"board\": \"${currentBoard}\" }`,
                updateApp
            );

            input.blur();
        });
        input.focus();

        componentHandler.upgradeAllRegistered();
    }
}

function newBoard(){
    let add = document.querySelector("#board-add");
    let navbar = document.querySelector("#navbar");
    let textField = document.importNode(document.querySelector("#board-input-template").content, true);

    navbar.replaceChild(textField, add);

    let input = navbar.children[navbar.children.length-1].querySelector("#new-board-name");
    input.addEventListener("focusout", () => {
        navbar.replaceChild(add, navbar.querySelector("#new-board-form"));
    });
    navbar.querySelector("#new-board-form").addEventListener("submit", (e) => {
        e.preventDefault();

        requestJSON("POST",
            "/new/board",
            `{ \"name\": \"${navbar.querySelector("#new-board-name").value}\" }`,
            updateApp
        );

        input.blur();
    });
    input.focus();

    componentHandler.upgradeAllRegistered();
}

function newItem(e){
    document.querySelector(".mdl-dialog").showModal();

    let currentList = e.target.parentElement.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").innerHTML;
    let item = (e) => {
        let currentBoard = document.querySelector("#board-title").innerHTML;
        let name = document.querySelector("#item-name").value;
        let note = document.querySelector("#item-note").value;

        requestJSON("POST",
            "/new/item",
            `{ \"name\": \"${name}\", \"board\": \"${currentBoard}\", \"list\": \"${currentList}\", \"note\": \"${note}\" }`,
            () => { document.querySelector(".mdl-dialog").close(); updateApp(); }
        );

        document.querySelector("#add-item-button").removeEventListener("click", item);
    }

    document.querySelector("#add-item-button").addEventListener("click", item);
}

function delBoard(){
    let currentBoard = document.querySelector("#board-title").innerHTML;

    requestJSON("DELETE",
        "/del/board",
        `{ \"name\": \"${currentBoard}\" }`,
        (e) => {updateApp(e); updateListsForBoard("");}
    );
}

function updateListsForBoard(name){
    let lists = json[name];
    let i = 0;

    let page = document.querySelector(".page-content");
    while(page.children.length > 1){
        page.removeChild(page.firstChild);
    }

    for(key in lists){
        let list = document.importNode(document.querySelector("#list-template").content, true);
        list.querySelector(".mdl-data-table__cell--non-numeric").innerHTML = key;
        list.querySelector(".mdl-menu").setAttribute("for", "header["+i+"]");
        list.querySelector(".mdl-button").setAttribute("id", "header["+i+"]");

        list.querySelector("#add-item").addEventListener("click", newItem);

        list.querySelector("#delete-list").addEventListener("click", (e) => {
            let currentBoard = document.querySelector("#board-title").innerHTML;
            let currentList = e.target.parentElement.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").innerHTML;

            requestJSON("DELETE",
                "/del/list",
                `{ \"name\": \"${currentList}\", \"board\": \"${currentBoard}\" }`,
                updateApp
            );
        });

        list.querySelector("#delete-item").addEventListener("click", (e) => {
            let currentBoard = document.querySelector("#board-title").innerHTML;
            let currentList = e.target.parentElement.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").innerHTML;

            for(item in json[currentBoard][currentList]){
                if(json[currentBoard][currentList][item].checked){
                    requestJSON("DELETE",
                        "/del/item",
                        `{ \"name\": \"${item}\", \"board\": \"${currentBoard}\", \"list\": \"${currentList}\" }`,
                        updateApp
                    );
                }
            }
        });

        i++;

        let table = list.querySelector("#table-body");
        for(text in lists[key]){
            let row = document.importNode(document.querySelector("#row-template").content, true);
            row.querySelector(".mdl-checkbox").setAttribute("for", "row["+i+"]");
            row.querySelector(".mdl-checkbox__input").setAttribute("id", "row["+i+"]");
            row.querySelector(".mdl-data-table__cell--non-numeric").prepend(lists[key][text].name);
            for(let i = 0; i < lists[key][text].labels.length; i++){
                let label = document.importNode(document.querySelector("#label-template").content, true);
                label.children[0].innerHTML = lists[key][text].labels[i].name;
                label.children[0].style.backgroundColor = "#"+(lists[key][text].labels[i].color.toString(16)).padStart(6, "0");
                label.children[0].classList.add("mdl-color-text--"+
                    (getBrightness(lists[key][text].labels[i].color.toString(16)) < 0.5 ? "black" : "white")
                );

                row.querySelector(".mdl-data-table__cell--non-numeric").appendChild(label);
            }
            row.querySelector(".mdl-data-table__cell--non-numeric").addEventListener("click", (e) => {
                sidebarShow(e);
            });

            row.querySelector(".mdl-checkbox__input").checked = lists[key][text].checked;
            row.querySelector(".mdl-checkbox__input").addEventListener("click", (e) => {
                let currentBoard = document.querySelector("#board-title").innerHTML;
                let currentItem = e.target.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").firstChild.textContent;
                let currentList = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").innerHTML;

                requestJSON("PATCH",
                    "/upd/check",
                    `{ \"name\": \"${currentItem}\", \"board\": \"${currentBoard}\", \"list\": \"${currentList}\" }`,
                    updateApp
                );
            });

            table.appendChild(row);
            i++;
        }

        page.prepend(list);
    }

    document.querySelector("#board-title").innerHTML = name;

    componentHandler.upgradeAllRegistered();
}

function updateBoards(){
    let navbar = document.querySelector("#navbar");

    while(navbar.children.length > 1){
        navbar.removeChild(navbar.firstChild);
    }

    for(key in json){
        let board = document.importNode(document.querySelector("#board-template").content, true);
        board.children[0].innerHTML = key;
        board.children[0].addEventListener("click", (e) => {
            updateListsForBoard(e.target.innerHTML);
        });

        navbar.prepend(board);
    }
}

function updateApp(){
    setup();

    requestJSON("GET",
        "/json",
        null,
        (request) => {
            json = JSON.parse(request.responseText);
            let currentBoard = document.querySelector("#board-title").innerHTML;

            updateBoards();
            if(currentBoard != ""){
                updateListsForBoard(currentBoard);
            }

            console.log(json);
        }
    );
}

let sidebarShow = (e) => {
    e.stopPropagation();
    document.querySelector("#item-sidebar").classList.toggle("open-sidebar");
    document.querySelector("#item-sidebar").classList.toggle("closed-sidebar");

    let hiddenEvent = (e) => {
        if(document.querySelector("#item-sidebar").classList.contains("open-sidebar")){
            if(!document.querySelector("#item-sidebar").contains(e.target)){
                document.querySelector("#item-sidebar").classList.toggle("open-sidebar");
                document.querySelector("#item-sidebar").classList.toggle("closed-sidebar");

                window.removeEventListener("click", hiddenEvent);
            }
        }
    }
    window.addEventListener("click", hiddenEvent);
};

let setup = once(() => {
    document.querySelector(".mdl-dialog").querySelector(".close").addEventListener("click", () => {
        document.querySelector(".mdl-dialog").close();
    });

    let toggleFAB = (e) => {
        document.querySelector("#delete-board-button").classList.toggle("delete-board-up");
        document.querySelector("#delete-board-button").classList.toggle("delete-board-down");

        document.querySelector("#settings-button").classList.toggle("settings-up");
        document.querySelector("#settings-button").classList.toggle("settings-down");
    }

    window.addEventListener("click", (e) => {
        if(document.querySelector("#dashboard-button").contains(e.target)){
            toggleFAB(e);
        }
        else{
            if(document.querySelector("#delete-board-button").classList.contains("delete-board-up")){
                toggleFAB(e);
            };
        }
    });
});

updateApp();
