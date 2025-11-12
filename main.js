// -- Constants --
const fileInput = document.getElementById("tracks_upload");
const uploadButton = document.getElementById("add_tracks");
const trackList = document.getElementById("track_select");

const collapsibleToggles = document.getElementsByClassName("collapsible_toggle");

const trackOptionsBox = document.getElementById("track_options_box");
const nameInput = document.getElementById("track_name");
const artistInput = document.getElementById("artist");

const checkBoxes = {};
for (const option of trackOptionsBox.children) {
    if (option.getAttribute("type") == "checkbox") { 
        checkBoxes[option.name] = option;
    }
    if (option.getAttribute("class") == "collapsible_content") {
        for (const child of option.children) {
            if (child.getAttribute("type") == "checkbox") { 
                checkBoxes[child.name] = child;
            }
        }
    }
}

// Helper functions
function enableInputs() {
    nameInput.disabled = false;
    artistInput.disabled = false;
    for (const key in checkBoxes) checkBoxes[key].disabled = false;
}

function disableInputs() {
    nameInput.disabled = true;
    artistInput.disabled = true;
    for (const key in checkBoxes) checkBoxes[key].disabled = true;
}

// Clear all input fields when first loaded
nameInput.value = "";
artistInput.value = "";
for (const key in checkBoxes) {
    checkBoxes[key].checked = false;
}
disableInputs();

const tracksWithOptions = {};

// -- Interaction behaviour --
// File uploading
uploadButton.onclick = function() {
    // Add all files to trackList
    for (const file of fileInput.files) {
        var option = document.createElement("option");
        option.name = option.textContent = file.name;
        trackList.appendChild(option);
        tracksWithOptions[option.name] = {};
        clearTrackOptions(option.name);
         // TODO: Try autoloading track info from metadata
    }

    // Clear the file upload field
    fileInput.value = null;
}

// File selection
var currentSelectedTrack;

function getLocationsObject(trackName) {
    return tracksWithOptions[trackName]["locations"];
}

function saveTrackOptions(trackName) {
    tracksWithOptions[trackName]["name"] = nameInput.value;
    tracksWithOptions[trackName]["artist"] = artistInput.value;
    for (const key in checkBoxes) {
        getLocationsObject(trackName)[key] = checkBoxes[key].checked;
    }
}

function loadTrackOptions(trackName) {
    nameInput.value = tracksWithOptions[trackName]["name"];
    artistInput.value = tracksWithOptions[trackName]["artist"];
    for (const key in getLocationsObject(trackName)) {
        checkBoxes[key].checked = getLocationsObject(trackName)[key];
    }
    enableInputs();
}

function clearTrackOptions(trackName) {
    tracksWithOptions[trackName]["name"] = "";
    tracksWithOptions[trackName]["artist"] = "";
    tracksWithOptions[trackName]["locations"] = {};
    for (const key in checkBoxes) {
        getLocationsObject(trackName)[key] = false;
    }
}

trackList.addEventListener('change', function (e) {
    let idx = e.target.selectedIndex;
    let name = trackList[idx].textContent;
    if (currentSelectedTrack != undefined) {
        saveTrackOptions(currentSelectedTrack);
    }
    currentSelectedTrack = name;
    if (name != undefined) {
        loadTrackOptions(name);
    }
});

// Collapsible options
for (const toggle of collapsibleToggles) {
    toggle.onclick = function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
            this.textContent = "Show";
        } else {
            content.style.display = "block";
            this.textContent = "Hide";
        }
    }
}