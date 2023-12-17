//multi game functions (splatoon 3 stuff)
const gameSetting = document.getElementById("game-setting");

if (localStorage.getItem("game") != null){
    gameSetting.value = localStorage.getItem("game");
} else {
    gameSetting.value = "splat3";
    localStorage.setItem("game", "splat3");
}

gameSetting.onchange = function(){
    localStorage.setItem("game", gameSetting.value);
    const gameChangeButton = document.getElementById("game-change-reload");
    gameChangeButton.style.display = "flex";
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("3") != null){
    gameSetting.value = "splat3";
} else if (urlParams.get("pool") != null) {
    gameSetting.value = "splat2";
}

if (gameSetting.value != "splat2"){
    document.getElementsByClassName("splat-2-warn")[0].remove();
}

//connect buttons to open modals
const stageButtons = document.getElementsByClassName("map-picker button");
const modalContainer = document.getElementById("modal-container");

for (var i = 0; i < stageButtons.length; i++){

    const id = stageButtons[i].id;
    const modalContent = document.getElementById(`${id}-modal`);
    const modalClose = document.getElementById(`${id}-close`);

    stageButtons[i].onclick = function(){
        modalContainer.style.display = "flex";
        modalContent.style.display = "flex";
        modalContainer.classList.add("green");
        gsap.fromTo(modalContent, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
        gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});
    }

    modalClose.onclick = function(){
        closeModal(modalContent);
    }
}

window.addEventListener("click", function(event){
    if (event.target == modalContainer){
        closeModal();
    }
});


const mapVisualButton = document.getElementById("map-visual-button");
const mapVisualModal = document.getElementById("map-visual-modal");

mapVisualButton.onclick = function(){
    modalContainer.style.display = "flex";
    modalContainer.classList.add("green");
    mapVisualModal.style.display = "flex";
    gsap.fromTo(mapVisualModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});

    createMapVisual();
}

const mapVisualClose = document.getElementById("map-visual-close");
mapVisualClose.onclick = function(){
    closeModal(mapVisualModal);
}

function createMapVisual(){
    const table = document.getElementById("map-visual-table");
    table.innerHTML = "";
    table.style.fontSize = "1em";
    
    const baseModes = ["tw", "sz", "tc", "rm", "cb"];
    var modes = [];
    for (var i = 0; i < baseModes.length; i++){
        if (modeHasMaps(baseModes[i])){
            modes.push(baseModes[i]);
        }
    }

    var tr = document.createElement("tr");
    const mapLabel = document.createElement("th");
    mapLabel.innerText = "Map";
    tr.appendChild(mapLabel);

    for (var i = 0; i < modes.length; i++){
        var td = document.createElement("th");
        td.innerHTML = modes[i].toUpperCase();
        tr.appendChild(td);
    }

    table.appendChild(tr);

    var mapsSort = allMaps;
    if (localStorage.getItem("sorting-order") == "alpha"){
        mapsSort = allMapsAlpha;
    }

    for (var i = 0; i < mapsSort.length; i++){
        var sussyAmongusFortniteMinecrafter = false;

        const tr = document.createElement("tr");

        const mapName = document.createElement("td");
        mapName.innerHTML = mapsSort[i];
        tr.appendChild(mapName);

        for (var j = 0; j < modes.length; j++){
            const td = document.createElement("td");
            if (document.getElementById(`${modes[j]}-${mapsSort[i]}-map-selector`).checked){
                const circle = document.createElement("div");
                circle.classList.add("circle");
                td.appendChild(circle);
                sussyAmongusFortniteMinecrafter = true;
            }
            tr.appendChild(td);
        }

        if (sussyAmongusFortniteMinecrafter){
            table.appendChild(tr);
        }
    }
    
    const mapVisualZoomIn = document.getElementById("map-visual-zoomin");
    const mapVisualZoomOut = document.getElementById("map-visual-zoomout");
    const zoomMin = .5;
    const zoomMax = 3;

    mapVisualZoomIn.onclick = function(){
        table.style.fontSize = Math.min(parseFloat(table.style.fontSize) + 0.1, zoomMax) + "em";
    }
    mapVisualZoomOut.onclick = function(){
        table.style.fontSize = Math.max(parseFloat(table.style.fontSize) - 0.1, zoomMin) + "em";
    }

    if (table.childNodes.length <= 1){
        table.innerHTML = "No maps selected.";
        table.style.borderSpacing = "0";
        mapVisualZoomIn.style.display = "none";
        mapVisualZoomOut.style.display = "none";
    } else {
        table.style.borderSpacing = ".5em";
        mapVisualZoomIn.style.display = "flex";
        mapVisualZoomOut.style.display = "flex";
    }
}


const statsOptionsButton = document.getElementById("stats-button-options");
statsOptionsButton.onclick = function(){
    statsHideAll();
    const statsOptions = document.getElementById("stats-options");
    statsOptions.style.display = "block";
    statsOptionsButton.classList.add("active");
}

const mapStatsButton = document.getElementById("stats-button");
const mapStatsClose = document.getElementById("stats-close");
const mapStatsModal = document.getElementById("stats-modal");

mapStatsButton.onclick = function(){
    const statOptions = document.getElementById("stats-options");
    statOptions.innerHTML = "";

    for (var i = 0; i < currentRounds.length; i++){
        const label = document.createElement("label");
        label.classList.add("stats-option");
        
        const name = document.createElement("div");
        name.classList.add("stats-option-name");
        name.innerHTML = currentRounds[i].name;
        label.appendChild(name);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `stats-option-${i}`;
        checkbox.checked = true;
        checkbox.addEventListener("change", function(){
            getStats();
        });
        label.appendChild(checkbox);
        
        statOptions.appendChild(label);
    }

    const statsNav = document.getElementById("stats-nav");
    for (var i = 1; i < statsNav.children.length; i++){
        statsNav.children[i].style.display = "none";
    }

    modalContainer.style.display = "flex";
    mapStatsModal.style.display = "flex";
    modalContainer.classList.add("red");
    gsap.fromTo(mapStatsModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});

    getStats();

    statsOptionsButton.click();
}

mapStatsClose.onclick = function(){
    closeModal(mapStatsModal);
}

function statsHideAll(){
    const statsOptions = document.getElementById("stats-options");
    statsOptions.style.display = "none";

    const statsContainer = document.getElementById("stats-container");
    for (var i = 0; i < statsContainer.children.length; i++){
        statsContainer.children[i].style.display = "none";
    }

    const statsNav = document.getElementById("stats-nav");
    for (var i = 0; i < statsNav.children.length; i++){
        statsNav.children[i].classList.remove("active");
    }
}

const exportButtonDiscord = document.getElementById("export-button-discord");
const exportDiscordClose = document.getElementById("discord-export-close");
const exportDiscordModal = document.getElementById("discord-export-modal");
const exportDiscordCopy = document.getElementById("discord-export-copy");

exportButtonDiscord.onclick = function(){
    exportToDiscord();
    modalContainer.style.display = "flex";
    exportDiscordModal.style.display = "flex";
    modalContainer.classList.add("red");

    gsap.fromTo(exportDiscordModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});
}

exportDiscordClose.onclick = function(){
    closeModal(exportDiscordModal);
}

exportDiscordCopy.onclick = function(){
    const text = document.getElementById("discord-export-textarea");
    navigator.clipboard.writeText(text.value).then(function() {
        createToast("Copied text");
      }, function(err) {
        console.error('Async: Could not copy text: ', err);
      });
}

const exportButtonURL = document.getElementById("export-button-url");
const exportURLClose = document.getElementById("url-export-close");
const exportURLModal = document.getElementById("url-export-modal");
const exportURLCopy = document.getElementById("url-export-copy");

exportButtonURL.onclick = function(){
    modalContainer.style.display = "flex";
    exportURLModal.style.display = "flex";
    modalContainer.classList.add("red");

    const text = document.getElementById("url-export-textarea");

    const url = window.location.href.split("?")[0];
    const spl3Marker = gameSetting.value == "splat3" ? "?3&" : "?";
    text.value = url + spl3Marker + "pool=" + encodeMapPool() + "&rounds=" + encodeRounds();

    gsap.fromTo(exportURLModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});
}

exportURLClose.onclick = function(){
    closeModal(exportURLModal);
}

exportURLCopy.onclick = function(){
    const text = document.getElementById("url-export-textarea");
    navigator.clipboard.writeText(text.value).then(function() {
        createToast("Copied text");
      }, function(err) {
        console.error('Async: Could not copy text: ', err);
      });
}


const aboutButton = document.getElementById("about-button");
const aboutModal = document.getElementById("about-modal");
const aboutClose = document.getElementById("about-close");

aboutButton.onclick = function(){
    modalContainer.style.display = "flex";
    aboutModal.style.display = "flex";
    modalContainer.classList.add("green");

    gsap.fromTo(aboutModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});
}

aboutClose.onclick = function(){
    closeModal(aboutModal);
}


const preferencesButton = document.getElementById("preferences-button");
const preferencesModal = document.getElementById("preferences-modal");
const preferencesClose = document.getElementById("preferences-close");

preferencesButton.onclick = function(){
    modalContainer.style.display = "flex";
    preferencesModal.style.display = "flex";
    modalContainer.classList.add("green");

    gsap.fromTo(preferencesModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});
}

preferencesClose.onclick = function(){
    closeModal(preferencesModal);
}

const useInSendouButton = document.getElementById("export-to-sendouink-button");

if (gameSetting.value == "splat3"){
    useInSendouButton.onclick = function(){
        const url = "https://sendou.ink/maps?pool=";
        const params = encodeMapPool().replaceAll(":", "%3A").replaceAll(";", "%3B");
    
        window.open(url + params, '_blank');
    }
} else {
    useInSendouButton.style.display = "none";
}



//load map options into page
var allMaps = gameSetting.value == "splat3" ? splat3Maps : splat2Maps;
var allMapsAlpha = [...allMaps].sort((a,b) => a.localeCompare(b));

for (var i = 0; i < allMaps.length; i++){
    const modes = ["tw","sz","tc","rm","cb"];

    for (var j = 0; j < modes.length; j++){
        const mapInputId = `${modes[j]}-${allMaps[i]}-map-selector`;

        const mapLabel = document.createElement("label");
        mapLabel.setAttribute("for", mapInputId);
        mapLabel.innerHTML = `<div class="map-name">${allMaps[i]}</div>`;
        mapLabel.setAttribute("data-release", i);
        mapLabel.setAttribute("data-alpha", allMapsAlpha.indexOf(allMaps[i]));

        const mapInput = document.createElement("input");
        mapInput.type = "checkbox";
        mapInput.id = mapInputId;
        mapInput.setAttribute("class", "map-selector");

        mapInput.setAttribute("onclick", `adjustSelectedCount("${modes[j]}")`);

        mapLabel.appendChild(mapInput);

        document.getElementById(`${modes[j]}-picker-wrapper`).appendChild(mapLabel);


        //make "select all" & "deselect all" buttons work for each mode
        document.getElementById(`${modes[j]}-select-all`).setAttribute("onclick", `massSelect("${modes[j]}", true)`);
        document.getElementById(`${modes[j]}-deselect-all`).setAttribute("onclick", `massSelect("${modes[j]}", false)`);
    }
}

function adjustSelectedCount(mode){
    var count = 0;
    for (var i = 0; i < allMaps.length; i++){
        const checkBox = document.getElementById(`${mode}-${allMaps[i]}-map-selector`);
        if (checkBox.checked){
            count++;
        }
    }
    const plural = count == 1 ? "" : "s";
    document.getElementById(`${mode}-picker-detail`).innerHTML = `${count} Map${plural} selected <i class="right-bias fa-solid fa-circle-chevron-right">`;

    updateGenerateButtonStatus();
}

function massSelect(mode, isEnabling){
    const tl = gsap.timeline();

    const mapsSort = localStorage.getItem("sorting-order") == "alpha" ? allMapsAlpha : allMaps;

    for (var i = 0; i < mapsSort.length; i++){
        const checkBox = document.getElementById(`${mode}-${mapsSort[i]}-map-selector`);
        tl.fromTo(checkBox, {scale: 1}, {scale: 1.3, duration: .2, ease: "Power2.in", onComplete: function(){
            checkBox.checked = isEnabling;
            gsap.to(checkBox, {scale: 1, duration: .4, ease: "bounce.out"});
            adjustSelectedCount(mode);
        }}, i == 0 ? "-=.1" : "-=.17");
    }
}


//attach round adder stuff
const addRoundButton = document.getElementById("add-round-button");
const roundNameInput = document.getElementById("round-name");
const roundGamesInput = document.getElementById("round-games-input");
const roundIsCounterpick = document.getElementById("round-counterpick-check");
const roundError = document.getElementById("round-error-message");
const roundEditor = document.getElementById("round-editor");

addRoundButton.addEventListener("click", function(){
    if (roundNameInput.value == ""){
        changeRoundError("Please enter a name for the round.");
        return;
    }
    if (roundGamesInput.value == ""){
        changeRoundError("Please enter the number of games in the round.");
        return;
    }
    //if roundnameinput isn't alphanumeric, return
    if (!/^[\w\-\s]+$/.test(roundNameInput.value)){
        changeRoundError("Please enter an alphanumeric round name.");
        return;
    }
    if (parseInt(roundGamesInput.value) >= 100){
        changeRoundError("That might be a bad idea.");
    } else {
        changeRoundError();
    }

    addRound(roundNameInput.value, roundGamesInput.value, roundIsCounterpick.checked);
    

    //attempt to increment last character in name
    const lastChar = roundNameInput.value.split(' ').at(-1);
    if (!isNaN(lastChar)){
        const newName = roundNameInput.value.substring(0, roundNameInput.value.lastIndexOf(' ')) + " " + (parseInt(lastChar) + 1);
        roundNameInput.value = newName;
    }
    else {
        roundNameInput.value = "";
        roundNameInput.focus();
    }
});


function addRound(name, games, isCounterpick){
    const addedRound = document.createElement("div");
    addedRound.setAttribute("class", "added-round");

    const roundTitle = document.createElement("div");
    roundTitle.setAttribute("class", "title");
    roundTitle.id = "round-title";
    roundTitle.innerText = name;
    addedRound.appendChild(roundTitle);
    
    const roundGames = document.createElement("div");
    roundGames.setAttribute("class", "games");
    roundGames.id = "round-games";
    roundGames.innerText = games + " game" + (games == 1 ? "" : "s");
    addedRound.appendChild(roundGames);

    if (isCounterpick){
        const roundCounterpick = document.createElement("div");
        roundCounterpick.setAttribute("class", "counterpick");
        roundCounterpick.id = "round-counterpick";
        roundCounterpick.innerText = "Counterpick";
        addedRound.appendChild(roundCounterpick);
    }

    const upButton = document.createElement("button");
    upButton.setAttribute("class", "button first");
    upButton.innerHTML = '<i class="fa-solid fa-angle-up"></i>';
    upButton.addEventListener("click", function(){
        const parent = this.parentElement;
        if(parent.previousElementSibling){
            const prevElement = parent.previousElementSibling;
            const pt1 = gsap.timeline({onComplete: function(){
                parent.parentNode.insertBefore(parent, parent.previousElementSibling);
                const pt2 = gsap.timeline();
                pt2.fromTo(parent, {bottom: -22, opacity: 0}, {bottom: 0, opacity: 1, duration: .15, ease: Power4.easeOut});
                pt2.fromTo(prevElement, {bottom: 22, opacity: 0}, {bottom: 0, opacity: 1, duration: .15, ease: Power4.easeOut}, "<");
            }});
            pt1.to(parent, {bottom: 22, opacity: 0, duration: .15, ease: Power4.easeIn});
            pt1.to(prevElement, {bottom: -22, opacity: 0, duration: .15, ease: Power4.easeIn}, "<");
        }
    });
    addedRound.appendChild(upButton);

    const downButton = document.createElement("button");
    downButton.setAttribute("class", "button");
    downButton.innerHTML = '<i class="fa-solid fa-angle-down"></i>';
    downButton.addEventListener("click", function(){
        const parent = this.parentElement;
        if(parent.nextElementSibling){
            const nextElement = parent.nextElementSibling;
            const pt1 = gsap.timeline({onComplete: function(){
                parent.parentNode.insertBefore(parent.nextElementSibling, parent);
                const pt2 = gsap.timeline();
                pt2.fromTo(parent, {bottom: 22, opacity: 0}, {bottom: 0, opacity: 1, duration: .15, ease: Power4.easeOut});
                pt2.fromTo(nextElement, {bottom: -22, opacity: 0}, {bottom: 0, opacity: 1, duration: .15, ease: Power4.easeOut}, "<");
            }});
            pt1.to(parent, {bottom: -22, opacity: 0, duration: .1, ease: Power4.easeIn});
            pt1.to(nextElement, {bottom: 22, opacity: 0, duration: .1, ease: Power4.easeIn}, "<");
        }
    });
    addedRound.appendChild(downButton);

    const removeButton = document.createElement("button");
    removeButton.setAttribute("class", "remove button");
    removeButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    removeButton.addEventListener("click", function(){
        const roundElement = removeButton.parentElement;

        const tl = gsap.timeline({onComplete: function() {
            roundElement.remove();
            updateGenerateButtonStatus();
        }});
        tl.to(roundElement, {opacity: 0, duration: .10});
        tl.to(roundElement, {height: 0, padding: 0, margin: 0, duration: .20, ease: Power3.easeInOut});
    });
    addedRound.appendChild(removeButton);

    roundEditor.appendChild(addedRound);

    const tl = gsap.timeline();
    tl.fromTo(addedRound, {opacity: 0, height: 0}, {opacity: 0, height: "auto", duration: .25, ease:Power2.easeOut});
    tl.fromTo(addedRound, {opacity: 0, left: 50}, {opacity: 1, left: 0, duration: .25})

    updateGenerateButtonStatus();
}

const modeHasMaps = function(mode){
    for (var i = 0; i < allMaps.length; i++){
        const checkBox = document.getElementById(`${mode}-${allMaps[i]}-map-selector`);
        if (checkBox.checked){
            return true;
        }
    }
    return false;
}

function changeRoundError(message){
    if (message == undefined)
        message = "";

    if (message == roundError.innerText){
        const tl = gsap.timeline();
        tl.to(roundError, {y: 10, duration: .15, ease: Power2.easeOut});
        tl.to(roundError, {y: 0, duration: .45, ease:"bounce.out"});
        return;
    }

    const tl = gsap.timeline();
    if (roundError.style.display == "block"){
        if (message == ""){
            tl.fromTo(roundError, {opacity: 1}, {opacity: 0, duration: .25});
            tl.to(roundError, {height: 0, duration: .25, display: "none"});
        } else {
            tl.to(roundError, {opacity: 0, duration: .1, ease: Power4.easeOut, onComplete: function(){ roundError.innerText = message; }});
            tl.to(roundError, {opacity: 1, duration: .1, ease: Power4.easeIn});
        }
    } else {
        if (message == "") return;
        roundError.innerText = message;
        tl.fromTo(roundError, {height: 0, display: "block"}, {height: "auto",  duration: .25, ease:Power2.easeOut});
        tl.fromTo(roundError, {opacity: 0}, {opacity: 1, duration: .25});
    }
}

roundNameInput.addEventListener("change", function(){
    //check if round name exists
    const roundName = roundNameInput.value;
    const rounds = document.getElementsByClassName("added-round");
    for (var i = 0; i < rounds.length; i++){
        if (rounds[i].querySelector("#round-title").innerText == roundName){
            changeRoundError("It's recommended to use a unique name for each round.");
            return;
        }
    }
});

//make generate buttons respond to status
updateGenerateButtonStatus();
function updateGenerateButtonStatus(){    
    var mapsOk = false;
    var roundsOk = false;

    const modes = ["tw","sz","tc","rm","cb"];
    for (var i = 0; i < modes.length; i++){
        if (modeHasMaps(modes[i])){
            mapsOk = true;
            break;
        }
    }

    const rounds = document.getElementsByClassName("added-round");
    roundsOk = rounds.length > 0;

    const allOk = mapsOk && roundsOk;

    const generateButtons = document.getElementsByClassName("generate");
    for (var i = 0; i < generateButtons.length; i++){
        generateButtons[i].disabled = !allOk;
    }

    const errorMessage = document.getElementById("generate-error-message");
    if (!allOk){
        if (!mapsOk && !roundsOk){
            errorMessage.innerText = "You must select maps and add at least one round.";
        }
        else if (!roundsOk){
            errorMessage.innerText = "You must add at least one round.";
        }
        else if (!mapsOk){
            errorMessage.innerText = "You must select maps.";
        }

        errorMessage.removeAttribute("style");
        errorMessage.style.display = "block";
    }
    else {
        const tl = gsap.timeline();
        tl.fromTo(errorMessage,{opacity: 1}, {opacity: 0, duration: .25});
        tl.to(errorMessage, {height: 0, margin: 0, padding: 0, duration: .25, display: "none"});
    }
}



//make save and load buttons function
const saveModal = document.getElementById("save-modal");
const saveModalClose = document.getElementById("save-close");
saveModalClose.addEventListener("click", function(){
    closeModal(saveModal);
});

const loadModal = document.getElementById("load-modal");
const loadModalClose = document.getElementById("load-close");
loadModalClose.addEventListener("click", function(){
    closeModal(loadModal);
});

function saveOnClick(){
    saveModal.style.display = "flex";
    modalContainer.style.display = "flex";
    modalContainer.classList.add("green");

    const saveUrl = document.getElementById("save-url");
    const url = window.location.href.split("?")[0];
    const spl3Marker = gameSetting.value == "splat3" ? "?3&" : "?";
    saveUrl.value = url + spl3Marker + "pool=" + encodeMapPool();

    gsap.fromTo(saveModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});
}

function saveDialogOnClick(){
    const saveName = document.getElementById("save-name").value;
    if (saveName == ""){
        createToast("Enter a name to save.");
        return;
    }

    const mapSelectors = document.getElementsByClassName("map-selector");
    const maps = [];
    for (var i = 0; i < mapSelectors.length; i++){
        if (mapSelectors[i].checked){
            maps.push(mapSelectors[i].id);
        }
    }

    const loadName = gameSetting.value == "splat3" ? "maps.iplabs.ink:s3-" : "maps.iplabs.ink-";
    localStorage.setItem(`${loadName}${saveName}`, JSON.stringify(maps));

    closeModal(saveModal);

    createToast("Map pool saved as " + saveName);

    document.getElementById("save-name").value = "";
}

function loadOnClick(){
    loadModal.style.display = "flex";
    modalContainer.style.display = "flex";
    modalContainer.classList.add("green");

    const storage = Object.keys(localStorage);
    const loadContainer = document.getElementById("load-container");
    loadContainer.innerHTML = "";

    if (storage.length == 0){
        const noSaves = document.createElement("div");
        noSaves.innerText = "No saves found.";
        loadContainer.appendChild(noSaves);
        return;
    }

    const checkFor = gameSetting.value == "splat3" ? "maps.iplabs.ink:s3-" : "maps.iplabs.ink-";
    const checkAgainst = gameSetting.value != "splat3" ? "maps.iplabs.ink:s3-" : "maps.iplabs.ink-";
    var otherGameCount = 0;

    for (var i = 0; i < storage.length; i++){

        if (storage[i].startsWith(checkFor)){
            const loadWrapper = document.createElement("div");
            loadWrapper.setAttribute("class", "load-wrapper");

            if (i == storage.length - 1){
                loadWrapper.style.border = "none";
            }

            const loadName = document.createElement("div");
            loadName.setAttribute("class", "load-name");
            loadName.innerText = storage[i].slice(checkFor.length);

            const loadButton = document.createElement("button");
            loadButton.setAttribute("class", "button load-button");
            loadButton.innerHTML = '<i class="left-bias fa-solid fa-floppy-disk"></i>Load';

            loadButton.setAttribute("attached-to", storage[i]);
            loadButton.addEventListener("click", function(){
                const mapSelectors = document.getElementsByClassName("map-selector");
                for (var i = 0; i < mapSelectors.length; i++){
                    mapSelectors[i].checked = false;
                }

                const maps = JSON.parse(localStorage.getItem(this.getAttribute("attached-to")));
                for (var j = 0; j < maps.length; j++){
                    const checkBox = document.getElementById(maps[j]);
                    checkBox.checked = true;
                }

                const modes = ["tw","sz","tc","rm","cb"];
                for (var j = 0; j < modes.length; j++){
                    adjustSelectedCount(modes[j]);
                }

                closeModal(loadModal);
                createToast("Map pool loaded");
            });

            const loadDeleteButton = document.createElement("button");
            loadDeleteButton.setAttribute("class", "button load-delete");
            loadDeleteButton.setAttribute("attached-to", storage[i]);
            loadDeleteButton.innerHTML = '<i class="left-bias fa-solid fa-trash-alt"></i>Delete';
            loadDeleteButton.addEventListener("click", function(){
                localStorage.removeItem(this.getAttribute("attached-to"));
                loadContainer.removeChild(loadWrapper);
            });

            loadWrapper.appendChild(loadName);
            loadWrapper.appendChild(loadButton);
            loadWrapper.appendChild(loadDeleteButton);
            loadContainer.appendChild(loadWrapper);
        }
        else if (storage[i].startsWith(checkAgainst)){
            otherGameCount++;
        }
    }

    if(otherGameCount > 0){
        const otherGameNotice = document.createElement("div");
        otherGameNotice.classList.add("load-alt-game-counter");
        otherGameNotice.innerText = `${otherGameCount} map list${otherGameCount == 1 ? "" : "s"} for ${gameSetting.value == "splat3" ? "Splatoon 2" : "Splatoon 3"}.
            Change game in the preferences menu.`;
        
        loadContainer.appendChild(otherGameNotice);
    }

    gsap.fromTo(loadModal, {scale: .85}, {scale:1, duration: .25, ease: Power2.easeOut});
    gsap.fromTo(modalContainer, {opacity: 0}, {opacity: 1, duration: .25, ease: Power2.easeOut});
}


function encodeMapPool(){
    const modes = ["tw", "sz", "tc", "rm", "cb"];
    var pools = [];
    for (var i = 0; i < modes.length; i++){
        const thisPool = {
            m: modes[i],
            p: "1"
        };

        var hasMaps = false;

        for (var j = 0; j < allMaps.length; j++){
            //if map is checked
            const checked = document.getElementById(modes[i] + "-" + allMaps[j] + "-map-selector").checked;
            thisPool.p += checked ? "1" : "0";
            hasMaps = checked ? checked : hasMaps;    
        }

        if (!hasMaps){
            continue
        }

        /*
        thisPool.p = thisPool.p.match(/.{4}/g).reduce(function(acc, i) {
            return acc + parseInt(i, 2).toString(16);
        }, '');
        */

        thisPool.p = parseInt(thisPool.p, 2).toString(16);

        pools.push(thisPool);
    }

    var stringBuilder = "";
    for (var i = 0; i < pools.length; i++){
        if (pools[i].p == ""){
            continue;
        }
        stringBuilder += pools[i].m + ":" + pools[i].p;
        if (i != pools.length - 1){
            stringBuilder += ";";
        }
    }

    return stringBuilder;
}

function encodeRounds(){
    var encodedRounds = [];
    for (var i = 0; i < currentRounds.length; i++){
        var encodedRound = {
            name:currentRounds[i].name,
            maps:""
        };
        for (var j = 0; j < currentRounds[i].maps.length; j++){
            var encodedMode = currentRounds[i].maps[j].mode;
            switch (encodedMode){
                case "Turf War": encodedMode = "0"; break;
                case "Splat Zones": encodedMode = "1"; break;
                case "Tower Control": encodedMode = "2"; break;
                case "Rainmaker": encodedMode = "3"; break;
                case "Clam Blitz": encodedMode = "4"; break;
                case "Unknown Mode": encodedMode = "5"; break;
            }

            const mapIndex = allMaps.indexOf(currentRounds[i].maps[j].map);
            if (mapIndex == -1){
                encodedRound.maps += encodedMode + "-" + "un";
            }
            else{
                encodedRound.maps += encodedMode + "-" + mapIndex;
            }
            
            if (j != currentRounds[i].maps.length - 1){
                encodedRound.maps += ",";
            }
        }
        encodedRounds.push(encodedRound);
    }
    
    var stringBuilder = "";
    for (var i = 0; i < encodedRounds.length; i++){
        stringBuilder += encodedRounds[i].name.replaceAll(" ", "_") + ":" + encodedRounds[i].maps;
        if (i != encodedRounds.length - 1){
            stringBuilder += ";";
        }
    }

    return stringBuilder;
}


function decodeMapPool(pools){ 
    pools = pools.split(";");

    for (var i = 0; i < pools.length; i++){
        var thisPool = pools[i].split(":");

        const decodedHex = thisPool[1].split('').reduce(function(acc, i) {
            return acc + ('000' + parseInt(i, 16).toString(2)).substr(-4, 4);
        }, '')


        var offset = decodedHex.length - allMaps.length - 1;
        var atOne = false;
        for (var j = offset; j < decodedHex.length; j++){
            if (atOne){
               document.getElementById(thisPool[0] + "-" + allMaps[j-offset] + "-map-selector").checked = decodedHex[j] == "1";
            } else {
                if (decodedHex[j] == "1"){
                    atOne = true;
                }
                offset++;
            }
        }

        console.log(decodedHex, offset);
        adjustSelectedCount(thisPool[0]);
    }
}


function decodeRounds(rounds){
    var rounds = rounds.split(";");
    for (var i = 0; i < rounds.length; i++){
        const roundSplit = rounds[i].split(":");
        var round = {
            name:roundSplit[0].replaceAll("_", " "),
            maps:[]
        };
        const mapModes = roundSplit[1].split(",");
        for (var j = 0; j < mapModes.length; j++){

            const split = mapModes[j].split("-");
            var mode = split[0];

            switch(mode){
                case "0": mode = "Turf War"; break;
                case "1": mode = "Splat Zones"; break;
                case "2": mode = "Tower Control"; break;
                case "3": mode = "Rainmaker"; break;
                case "4": mode = "Clam Blitz"; break;
                case "5": mode = "Unknown Mode"; break;
            }

            if (split[1] == "un"){
                round.maps.push({
                    map: "Unknown Map",
                    mode: mode
                });
            } else {
                const map = allMaps[parseInt(split[1])];
                round.maps.push({
                    map:map,
                    mode:mode
                });
            }

        }
        currentRounds.push(round);

        //if all but the first map is unknown mode, then its true
        var isUnknown = true;
        for (var j = 1; j < round.maps.length; j++){
            if (round.maps[j].mode != "Unknown Mode"){
                isUnknown = false;
            }
        }

        addRound(round.name, round.maps.length, isUnknown);
    }

    prepGeneration(addMapElements);
}

const settingsTab = document.getElementById("settings-tab");
const mapListTab = document.getElementById("maplist-tab");
const optionsPanel = document.getElementsByClassName("options-panel")[0];
const mapsPanel = document.getElementsByClassName("maps-panel")[0];

settingsTab.onclick = function(){
    if (!settingsTab.classList.contains("active")){
        settingsTab.classList.add("active");
        mapListTab.classList.remove("active");
        const tl = gsap.timeline();
        tl.to(mapsPanel, {x: 100, opacity: 0, ease: "power3.in", duration: .15, onComplete: function(){
            mapsPanel.classList.add("mobile-hidden");
            optionsPanel.classList.remove("mobile-hidden");
        }});
        tl.fromTo(optionsPanel, {x: -100, opacity: 0}, {x: 0, opacity: 1, ease: "power3.out", duration: .15});
        tl.to(mapsPanel, {x: 0, opacity: 1, duration: 0});
    }
};
mapListTab.onclick = function(){
    if (!mapListTab.classList.contains("active")){
        settingsTab.classList.remove("active");
        mapListTab.classList.add("active");
        const tl = gsap.timeline();
        tl.to(optionsPanel, {x: -100, opacity: 0, ease: "power3.in", duration: .15, onComplete: function(){
            mapsPanel.classList.remove("mobile-hidden");
            optionsPanel.classList.add("mobile-hidden");
        }});
        tl.fromTo(mapsPanel, {x: 100, opacity: 0}, {x: 0, opacity: 1, ease: "power3.out", duration: .15}); 
        tl.to(optionsPanel, {x: 0, opacity: 1, duration: 0});
    }
};



const header = document.getElementsByClassName("header")[0];
const columnContainer = document.getElementsByClassName("column-container")[0];
const footer = document.getElementsByClassName("footer")[0];
const startPage = document.getElementById("start-page-wrapper");

const visited = localStorage.getItem('visited');

function showUi() {
    document.body.style.opacity = 1; 
    if (visited != 1 && !(urlParams.get("pool") != null || urlParams.get("rounds") != null)){
        const tl = gsap.timeline();

        startPage.style.display = "flex";
        tl.fromTo(startPage, {opacity: 0}, {opacity: 1, duration: 1});
        tl.fromTo(".sp-textin", {opacity: 0, y: 120}, {opacity: 1, y: 0, ease: "power3.out", duration: 1, stagger: .25});
        
        const startPageButton = document.getElementById("start-page-button");
        startPageButton.setAttribute("onclick", 'startButtonClick()');

        header.style.display = "none";
        columnContainer.style.display = "none";
        footer.style.display = "none";
    } else {
        gsap.fromTo(header, {y: -60, opacity: 0}, {display: "flex", y: 0, opacity: 1, duration: 1, ease: "power3.out"});
        gsap.fromTo(footer, {y: 60, opacity: 0}, {display: "block", y: 0, opacity: 1, duration: 1, ease: "power3.out"});
        if (uiIsMobile()){
            gsap.fromTo([optionsPanel, mapsPanel], {scale: .85, opacity: 0}, {scale: 1, opacity: 1, duration: 1, ease: "power3.out"});
        } else {
            gsap.fromTo(optionsPanel, {x: -90, opacity: 0}, {x: 0, opacity: 1, duration: 1, ease: "power3.out"});
            gsap.fromTo(mapsPanel, {x: 90, opacity: 0}, {x: 0, opacity: 1, duration: 1, ease: "power3.out"});
        }
    }
}


function startButtonClick(){
    localStorage.setItem("visited", 1);

    const tl = gsap.timeline();
    tl.fromTo(".sp-textin", {opacity: 1, y: 0}, {opacity: 0, y: -80, ease: "power3.out", duration: .5, stagger: {each: .10, from: "end"}});
    tl.fromTo(startPage, {opacity: 1}, {opacity: 0, duration: 1.25, display: "none"}, ">");
    tl.to(columnContainer, {display: "flex", duration: 0}, ">");
    tl.fromTo(header, {y: -60, opacity: 0}, {display: "flex", y: 0, opacity: 1, duration: 1.5, ease: "power3.out"}, "<");
    tl.fromTo(footer, {y: 60, opacity: 0}, {display: "block", y: 0, opacity: 1, duration: 1.5, ease: "power3.out"}, "<");
    if (uiIsMobile()){
        tl.fromTo([optionsPanel, mapsPanel], {scale: .85, opacity: 0}, {scale: 1, opacity: 1, duration: 1.5, ease: "power3.out"}, "<");
    } else {
        tl.fromTo(optionsPanel, {x: -90, opacity: 0}, {x: 0, opacity: 1, duration: 1.5, ease: "power3.out"}, "<");
        tl.fromTo(mapsPanel, {x: 90, opacity: 0}, {x: 0, opacity: 1, duration: 1.5, ease: "power3.out"}, "<");
    }
}


const preferredSortSetting = document.getElementById("preferred-sort-setting");
var sortingMethod = localStorage.getItem("sorting-order");
if (sortingMethod == null){
    localStorage.setItem("sorting-order", preferredSortSetting.value);
} else {
    preferredSortSetting.value = sortingMethod;
    if (sortingMethod == "alpha"){
        changeToAlphaSort();
    }
}

//on sorting method change
preferredSortSetting.onchange = function(){
    localStorage.setItem("sorting-order", preferredSortSetting.value);
    if (preferredSortSetting.value == "alpha"){
        changeToAlphaSort();
    } else {
        changeToReleaseSort();
    }
}

function changeToReleaseSort(){
    const stageSelModals = [
        document.getElementById("tw-picker-wrapper"),
        document.getElementById("sz-picker-wrapper"),
        document.getElementById("tc-picker-wrapper"),
        document.getElementById("rm-picker-wrapper"),
        document.getElementById("cb-picker-wrapper")
    ];

    for (var i = 0; i < stageSelModals.length; i++){
        const childLabels = stageSelModals[i].children;
        const indexesArray = Array.from(childLabels);
        const sortedByRel = indexesArray.sort(function(a,b){
            const ai = parseInt(a.dataset.release);
            const bi = parseInt(b.dataset.release);
            if (ai < bi){
                return -1;
            } else if (ai > bi){
                return 1;
            }
            return 0;
        });
        sortedByRel.forEach(e =>
            document.querySelector("#" + stageSelModals[i].id).appendChild(e));
    }

    const mapDropMenu = document.getElementsByClassName("map-drop-menu");
    for (var i = 0; i < mapDropMenu.length; i++){
        mapDropMenu[i].dispatchEvent(new Event("change"));
    }
}

function changeToAlphaSort(){
    const stageSelModals = [
        document.getElementById("tw-picker-wrapper"),
        document.getElementById("sz-picker-wrapper"),
        document.getElementById("tc-picker-wrapper"),
        document.getElementById("rm-picker-wrapper"),
        document.getElementById("cb-picker-wrapper")
    ];

    for (var i = 0; i < stageSelModals.length; i++){
        const childLabels = stageSelModals[i].children;
        const indexesArray = Array.from(childLabels);
        const sortedByAlpha = indexesArray.sort(function(a,b){
            const ai = parseInt(a.dataset.alpha);
            const bi = parseInt(b.dataset.alpha);
            if (ai < bi){
                return -1;
            } else if (ai > bi){
                return 1;
            }
            return 0;
        });
        sortedByAlpha.forEach(e =>
            document.querySelector("#" + stageSelModals[i].id).appendChild(e));
    }

    const mapDropMenu = document.getElementsByClassName("map-drop-menu");
    for (var i = 0; i < mapDropMenu.length; i++){
        mapDropMenu[i].dispatchEvent(new Event("change"));
    }
}

const contrastToggle = document.getElementById("contrast-toggle");

contrastToggle.addEventListener("change", function(){
    if (contrastToggle.checked){
        document.documentElement.style.filter = "contrast(1.6) saturate(.8)";
        localStorage.setItem("high-contrast", 1);
    } else {
        document.documentElement.style.filter = "none";
        localStorage.setItem("high-contrast", 0);
    }
});

if (localStorage.getItem("high-contrast") == 1){
    contrastToggle.checked = true;
    contrastToggle.dispatchEvent(new Event("change"));
}

const fontSizeToggle = document.getElementById("font-size-toggle");

fontSizeToggle.addEventListener("change", function(){
    if (fontSizeToggle.checked){
        document.documentElement.style.fontSize = "1.3em";
        localStorage.setItem("consistent-font", 1);
    } else {
        document.documentElement.style.removeProperty("font-size");
        localStorage.setItem("consistent-font", 0);
    }
});

if (localStorage.getItem("consistent-font") == 1){
    fontSizeToggle.checked = true;
    fontSizeToggle.dispatchEvent(new Event("change"));
}


function createToast(innerHTML){
    const existingToasts = document.getElementsByClassName("toast");
    for (var i = 0; i < existingToasts.length; i++){
        const offset = (existingToasts.length - i + 1) * 92;
        gsap.to(existingToasts[i], {y: offset, duration: .5, ease: Power2.easeOut});
    }

    const toast = document.createElement("div");
    toast.classList.add("toast");
    const id = `toast-${Date.now()}`;
    toast.id = id;

    const toastClose = document.createElement("div");
    toastClose.classList.add("toast-close");
    toastClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    const toastContent = document.createElement("div");
    toastContent.innerHTML = innerHTML;

    toast.appendChild(toastClose);
    toast.appendChild(toastContent);

    document.body.appendChild(toast);

    toastClose.addEventListener("click", function(){
        gsap.to(toast, {opacity: 0, scale: .9, duration: .2, onComplete: function(){ toast.remove(); }});
    });

    const tl = gsap.timeline();
    tl.fromTo(toast, {y: 60, opacity: 0, scale: .9}, {y: 0, opacity: 1, scale: 1, duration: .5, ease: Power2.easeOut});
    tl.to(toast, {opacity: 0, scale: .9, onComplete: function(){toast.remove();}}, "+=4");
}


document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
    if (event.key === "Enter"){
        const active = document.activeElement;
        if (active == roundNameInput || active == roundGamesInput){
            addRoundButton.click();
        }
    }
});

function closeModal(modalContent){
    gsap.to(modalContainer, {opacity: 0, duration: .18, display: "none", ease: Power1.easeIn, onComplete: function(){
        modalContainer.classList.remove("green");
        modalContainer.classList.remove("red");
    }});

    if (modalContent != undefined){
        gsap.to(modalContent, {scale: .85, duration: .18, display: "none", ease: Power1.easeIn});
    } else {
        const modals = document.getElementsByClassName("modal-content");

        for (var i = 0; i < modals.length; i++){
            if (modals[i].style.display == "flex"){
                gsap.to(modals[i], {scale: .85, duration: .18, display: "none", ease: Power1.easeIn});
            }
        }
    }
}

function uiIsMobile(){
    return getComputedStyle(document.documentElement).getPropertyValue('--is-mobile') === ' 1 ';
}

function gameChangeOnClick(){
    gsap.to("body", {opacity: 0, duration: .35, onComplete: function(){
        window.location.href = window.location.href.split('?')[0];
    }})
}



//thank you for checking out the code. Here is your reward.
function doABarrelRoll(){
    const body = document.getElementsByTagName("body")[0];
    body.style.transitionDuration = "2s";
    body.style.overflow = "hidden";
    body.style.transform = "rotate(360deg)";
    setTimeout(function(){
        body.style.transitionDuration = "0s";
        body.style.transform = "rotate(0deg)";
    }, 2000);
}