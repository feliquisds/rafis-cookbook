import {marked} from "./marked.esm.js"
const body = document.querySelector('.generic')
const currentPage = decodeURI(top.window.location.search.substr(1))

if (currentPage != "")
fetch(`/data/${currentPage}.md`)
    .then(res => res.text())
    .then(text => body.innerHTML = marked.parse(text))

else
fetch(`/data/Extra/Página principal.md`)
    .then(res => res.text())
    .then(text => body.innerHTML = marked.parse(text))