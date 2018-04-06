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

            let request = new XMLHttpRequest();
            request.open("POST", "/new/list");
            request.setRequestHeader('Content-Type', 'application/json');
            request.onreadystatechange = () => {
                if(request.readyState == 4 && request.status == 204){
                    updateApp();
                }
            };
            request.send(`{ \"name\": \"${page.querySelector("#new-list-name").value}\", \"board\": \"${currentBoard}\" }`, true);

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

        let request = new XMLHttpRequest();
        request.open("POST", "/new/board");
        request.setRequestHeader('Content-Type', 'application/json');
        request.onreadystatechange = () => {
            if(request.readyState == 4 && request.status == 204){
                updateApp();
            }
        };
        request.send(`{ \"name\": \"${navbar.querySelector("#new-board-name").value}\" }`, true);

        input.blur();
    });
    input.focus();

    componentHandler.upgradeAllRegistered();
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

        list.querySelector("#add-item").addEventListener("click", (e) => {
            document.querySelector(".mdl-dialog").showModal();

            let currentList = e.target.parentElement.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").innerHTML;
            let newList = (e) => {
                let currentBoard = document.querySelector("#board-title").innerHTML;
                let name = document.querySelector("#item-name").value;
                let note = document.querySelector("#item-note").value;

                let request = new XMLHttpRequest();
                request.open("POST", "/new/item");
                request.setRequestHeader('Content-Type', 'application/json');
                request.onreadystatechange = () => {
                    if(request.readyState == 4 && request.status == 204){
                        document.querySelector(".mdl-dialog").close();
                        updateApp();
                    }
                };
                request.send(`{ \"name\": \"${name}\", \"board\": \"${currentBoard}\", \"list\": \"${currentList}\", \"note\": \"${note}\" }`, true);

                document.querySelector("#add-item-button").removeEventListener("click", newList);
            }

            document.querySelector("#add-item-button").addEventListener("click", newList);
        });

        list.querySelector("#delete-list").addEventListener("click", (e) => {
            let currentBoard = document.querySelector("#board-title").innerHTML;

            let request = new XMLHttpRequest();
            request.open("DELETE", "/del/list");
            request.setRequestHeader('Content-Type', 'application/json');
            request.onreadystatechange = () => {
                if(request.readyState == 4 && request.status == 204){
                    updateApp();
                }
            };
            request.send(`{ \"name\": \"${key}\", \"board\": \"${currentBoard}\" }`, true);
        });

        i++;

        let table = list.querySelector("#table-body");
        for(text in lists[key]){
            let row = document.importNode(document.querySelector("#row-template").content, true);
            row.querySelector(".mdl-checkbox").setAttribute("for", "row["+i+"]");
            row.querySelector(".mdl-checkbox__input").setAttribute("id", "row["+i+"]");
            row.querySelector(".mdl-data-table__cell--non-numeric").innerHTML = lists[key][text].name;
            row.querySelector(".mdl-checkbox__input").checked = lists[key][text].checked;

            row.querySelector(".mdl-checkbox__input").addEventListener("click", (e) => {
                let currentBoard = document.querySelector("#board-title").innerHTML;
                let currentItem = e.target.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").innerHTML;
                let currentList = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector(".mdl-data-table__cell--non-numeric").innerHTML;

                let request = new XMLHttpRequest();
                request.open("PATCH", "/upd/check");
                request.setRequestHeader('Content-Type', 'application/json');
                request.onreadystatechange = () => {
                    if(!(request.readyState == 4 && request.status == 204)){
                        updateApp();
                    }
                };
                request.send(`{ \"name\": \"${currentItem}\", \"board\": \"${currentBoard}\", \"list\": \"${currentList}\" }`, true);
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
    document.querySelector(".mdl-dialog").querySelector(".close").addEventListener("click", () => {
        document.querySelector(".mdl-dialog").close();
    });

    let request = new XMLHttpRequest();
    request.open("GET", "/json");
    request.onreadystatechange = () => {
        if(request.readyState == 4 && request.status == 200){
            json = JSON.parse(request.responseText);
            let currentBoard = document.querySelector("#board-title").innerHTML;

            updateBoards();
            if(currentBoard != ""){
                updateListsForBoard(currentBoard);
            }

            console.log(json);
        }
    };
    request.send(true);
}

updateApp();
