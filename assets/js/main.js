const overrides = ['Guia', 'Extra', 'Coquetéis']
function searchableString(str) {
    str = str.toLowerCase();
    if (str.search(/[\xC0-\xFF]/g) > -1) {
        str = str
            .replace(/[\xC0-\xC5]/g, "A")
            .replace(/[\xC6]/g, "AE")
            .replace(/[\xC7]/g, "C")
            .replace(/[\xC8-\xCB]/g, "E")
            .replace(/[\xCC-\xCF]/g, "I")
            .replace(/[\xD0]/g, "D")
            .replace(/[\xD1]/g, "N")
            .replace(/[\xD2-\xD6\xD8]/g, "O")
            .replace(/[\xD9-\xDC]/g, "U")
            .replace(/[\xDD]/g, "Y")
            .replace(/[\xDE]/g, "P")
            .replace(/[\xE0-\xE5]/g, "a")
            .replace(/[\xE6]/g, "ae")
            .replace(/[\xE7]/g, "c")
            .replace(/[\xE8-\xEB]/g, "e")
            .replace(/[\xEC-\xEF]/g, "i")
            .replace(/[\xF1]/g, "n")
            .replace(/[\xF2-\xF6\xF8]/g, "o")
            .replace(/[\xF9-\xFC]/g, "u")
            .replace(/[\xFE]/g, "p")
            .replace(/[\xFD\xFF]/g, "y");
    }
    return str;
}

function findEntries(section_data, keyword, array = []) {
    let result = array
    section_data.forEach(entry => {
        let temp = Object.entries(entry)[0]
        if (typeof entry == "string") {
            if (searchableString(entry).includes(keyword)) {
                result.push(entry)
            }
        }
        else {
            result = findEntries(temp[1], keyword, result)
        }
    })
    return result
}

function search(input) {
    let keyword = searchableString(input.trim());
    let results = document.querySelector('#results')

    if (keyword != '') {
        fetch("assets/routes.json")
            .then(res => res.json())
            .then(islands => {
                let search = findEntries(islands, keyword)
                search.sort();
                search.length = Math.min(search.length, 10)
                if (search.length != 0) {
                    results.innerHTML = `${search.map(entry => {
                        return `<button id="${entry}_search" onclick="openOption(this)" class="search_result">${entry.substr(0, searchableString(entry).indexOf(keyword))
                            }<b>${entry.substr(searchableString(entry).indexOf(keyword), keyword.length)
                            }</b>${entry.substr(searchableString(entry).indexOf(keyword) + keyword.length)
                            }</button>`;
                    }).join("")}`;
                } else {
                    results.innerHTML = "<p>Nenhum resultado</p>";
                }
            });
    } else {
        results.innerHTML = "<p>O que tem em mente?</p>";
    }
}

function sideBarItems(section_data) {
    result = ""
    section_data.forEach(entry => {
        let temp = Object.entries(entry)[0]
        let dropdown_name = temp[0]
        let dropdown_data = temp[1]
        result += typeof entry == "string" ?
            `<button id="${entry}" onclick="openOption(this)" ${currentRecipe.split("/").includes(entry) ? "class=\"selected\"" : ""}>${entry}</button>`
            :
            `<div class="dropdown" id="${dropdown_name}">
                    <label><input type="checkbox" ${currentRecipe.substr(1).split("/").includes(dropdown_name) ? "checked" : ""}>${dropdown_name}<span class="material">arrow_forward_ios</span></label>
                    <div>${sideBarItems(dropdown_data)}</div>
                </div>`
    })
    return result
}

function loadSideBar() {
    fetch("assets/routes.json")
        .then(res => res.json())
        .then(islands => {
            islands.forEach(section => {
                for (const [section_name, section_data] of Object.entries(section)) {
                    document.querySelector("nav").insertAdjacentHTML("beforeend", `<div id="${section_name}_parent">${sideBarItems(section_data)}</div>`)
                }
            })
        })
}

function updatePage() {
    if (currentRecipe == "") {
        document.getElementById("frame").src = "generic.html"
        return
    }

    for (let element of currentRecipe.split("/")) {
        if (overrides.includes(element)) {
            document.getElementById("frame").src = "generic.html"
            return
        }
    }

    document.getElementById("frame").src = "recipe.html";
}

function selectOption(recipe) {
    let divs = recipe
    let goal = divs.pop()
    divs.shift()
    divs.forEach(element => {
        document.getElementById(element).children[0].children[0].checked = true;
    });
    document.getElementById(goal).classList.add("selected");
}

function deselectOption(recipe) {
    if (top.document.getElementById(recipe).classList.contains("selected"))
        top.document.getElementById(recipe).classList.remove("selected");
}

function openOption(element) {
    document.querySelector('#sidebar_toggle > div > input').checked = false
    let find_element = document.getElementById(element.id.split('_')[0])
    let newUrl = `${find_element.id}`
    let tempElement = find_element.parentElement
    while (true) {
        if (tempElement.id.split("_")[1] == "parent") {
            newUrl = `${tempElement.id.split("_")[0]}/${newUrl}`;
            break;
        }
        newUrl = tempElement.id == "" ? newUrl : `${tempElement.id}/${newUrl}`;
        tempElement = tempElement.parentElement
    }

    if (newUrl != currentRecipe) {
        if (currentRecipe != "") deselectOption(currentRecipe.split("/")[currentRecipe.split("/").length - 1]);
        currentRecipe = newUrl;
        selectOption(currentRecipe.split("/"));
        window.history.pushState(null, "", "?" + newUrl);
        updatePage()
    }
}

function backToHome() {
    window.history.pushState(null, "", "/");
    currentRecipe = ""
    updatePage()
    deselectOption(top.document.querySelector(".selected").id)
}

let currentRecipe = decodeURI(window.location.search).substr(1);
loadSideBar();
if (currentRecipe.length > 1) updatePage();

addEventListener("popstate", (event) => {
    if (currentRecipe.split("/")[currentRecipe.split("/").length - 1] != "" && currentRecipe.length > 1)
        deselectOption(currentRecipe.split("/")[currentRecipe.split("/").length - 1]);

    currentRecipe = decodeURI(window.location.search).substr(1);

    if (currentRecipe.split("/")[currentRecipe.split("/").length - 1] != "" && currentRecipe.length > 1) {
        selectOption(currentRecipe.split("/"));
        updatePage()
    }
});