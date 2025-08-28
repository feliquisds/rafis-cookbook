import { marked } from "./marked.esm.js"

fetch(`/data/${decodeURI(top.window.location.search.substr(1))}.json`)
    .then(res => res.json())
    .then(json => {
        document.getElementById("title").innerHTML = json.title;
        document.getElementById("description").insertAdjacentHTML("beforeend", json.description.map(entry => {
            return `${marked.parse(entry)}`
        }).join(""));
        document.getElementById("amount").innerHTML = json.amount;
        document.getElementById("time").innerHTML = json.time;

        if (json.difficulty == "easy") {
            document.getElementById("difficulty").innerHTML = `
                        <div>
                            <span class="material">star</span>
                        </div>
                        <p id="difficulty">Fácil</p>
                    `
            document.getElementById("difficulty").classList.add("easy")
        }
        else if (json.difficulty == "medium") {
            document.getElementById("difficulty").innerHTML = `
                        <div>
                            <span class="material">star</span>
                            <span class="material">star</span>
                        </div>
                        <p id="difficulty">Médio</p>
                    `
            document.getElementById("difficulty").classList.add("medium")
        }
        else {
            document.getElementById("difficulty").innerHTML = `
                        <div>
                            <span class="material">star</span>
                            <span class="material">star</span>
                            <span class="material">star</span>
                        </div>
                        <p id="difficulty">Difícil</p>
                    `
            document.getElementById("difficulty").classList.add("hard")
        }

        const ingredients = document.getElementById("ingredients");
        if (json.custom) {
            for (const [key, value] of Object.entries(json.ingredients)) {
                ingredients.insertAdjacentHTML("beforeend",
                    `<div class="section">
                                <h3>${value["title"]}</h3>
                                ${value["items"].map(element => {
                        return `<label><input type="checkbox"><span>${element}</span></label>`
                    }).join("")}
                            </div>`);
            }
        }
        else {
            ingredients.insertAdjacentHTML("beforeend", `<div class="section"></div>`);
            json.ingredients.forEach(element => {
                document.getElementsByClassName("section")[0].insertAdjacentHTML("beforeend",
                    `<label><input type="checkbox"><span>${element}</span></label>`
                )
            })
        }

        if (json.special != "") {
            ingredients.insertAdjacentHTML("beforeend",
                `<div class="section" id="special">
                                        <p><b>Equipamento especial:  </b>${json.special}</p>
                                    </div>`
            )
        }

        let count = 1;
        json.steps.forEach(element => {
            document.getElementById("steps").insertAdjacentHTML("beforeend",
                `<div><h2>${count}.</h2>${marked.parse(element)}</div>`
            )
            count += 1;
        });
    }
    );

new QRCode(document.getElementById("qrcode"), top.window.location.href)