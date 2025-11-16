// -- Constants --
const packUploadInput = document.getElementById("import_pack");

const advancedModeToggle = document.getElementById("advanced_mode");

const trackFileUpload = document.getElementById("tracks_upload");
const trackList = document.getElementById("track_select");

const trackOptionsBox = document.getElementById("track_options_box");
const nameInput = document.getElementById("track_name");
const artistInput = document.getElementById("artist");
const volumeInput = document.getElementById("volume");

const collapsibleToggles = document.getElementsByClassName("collapsible_toggle");

const checkBoxes = {};
for (const option of trackOptionsBox.children) {
    if (option.getAttribute("type") == "checkbox") { 
        checkBoxes[option.name] = option;
    }
    if (option.classList.contains("collapsible_content")) {
        for (const child of option.children) {
            if (child.getAttribute("type") == "checkbox") { 
                checkBoxes[child.name] = child;
            }
        }
    }
}

const packOptions = document.getElementById("pack_options");
const iconFileUpload = document.getElementById("pack_icon_upload");

const trackFiles = {};
const tracksWithOptions = {};

// -- Helper functions --
function enableTrackInputs() {
    nameInput.disabled = false;
    artistInput.disabled = false;
    volumeInput.disabled = false;
    for (const key in checkBoxes) checkBoxes[key].disabled = false;
}

function disableTrackInputs() {
    nameInput.disabled = true;
    artistInput.disabled = true;
    volumeInput.disabled = true;
    for (const key in checkBoxes) checkBoxes[key].disabled = true;
}

function clearTrackInputs() {
    trackFileUpload.value = "";
    nameInput.value = "";
    artistInput.value = "";
    volumeInput.value = 1.0;
    for (const key in checkBoxes) {
        checkBoxes[key].checked = false;
    }
}

function clearAllInputs() {
    // Track input fields
    clearTrackInputs();
    // Pack input fields
    packUploadInput.value = "";
    for (const key in packOptions.children) {
        let element = packOptions.children[key];
        if (element.nodeName == "INPUT") {
            element.value = "";
        }
    }
    iconFileUpload.onchange();
    // Other input fields
    advancedModeToggle.checked = false;
}

function addFileToTrackList(file) {
    var option = document.createElement("option");
    option.name = option.textContent = file.name;
    trackList.appendChild(option);
    trackFiles[option.name] = file;
    tracksWithOptions[option.name] = {};
    clearTrackOptions(option.name);
}

// -- Interaction behaviour --
// Advanced mode toggle
advancedModeToggle.onchange = function() {
    let checked = advancedModeToggle.checked;
    document.getElementById("format_specifiers_advanced").classList.toggle("hidden");
}

// Track uploading
trackFileUpload.onchange = function() {
    // Add all files to trackList
    for (const file of trackFileUpload.files) {
        if (file.name in trackFiles) {
            alert("Error while uploading tracks: A track named \"" + file.name + "\" is already in the pack.");
            continue;
        }
        addFileToTrackList(file);
         // TODO: Try autoloading track info from metadata
    }

    // Clear the file upload field
    trackFileUpload.value = null;
}

// Track deletion
document.getElementById("delete_track").onclick = function() {
    // Remove the track from the list
    trackList.removeChild(trackList[trackList.selectedIndex]);
    delete trackFiles[currentSelectedTrack];
    delete tracksWithOptions[currentSelectedTrack];
    currentSelectedTrack = undefined;
    // Now as there is no selected track, clear and disable the track inputs
    clearTrackInputs();
    disableTrackInputs();
}

// Pack icon uploading
iconFileUpload.onchange = function() {
    let file = iconFileUpload.files[0];
    if (file) {
        // use FileReader to generate preview image
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("icon_preview").src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById("icon_preview").src = "";
    }
}

// Pack icon clearing
document.getElementById("clear_pack_icon").onclick = function() {
    iconFileUpload.value = "";
    iconFileUpload.onchange();
}

// Pack exporting
document.getElementById("export_pack").onclick = function() {
    downloadPackZip();
}

// Pack importing
packUploadInput.onchange = function() {
    readPackZip(packUploadInput.files[0]);
}

// -- Track selection --
var currentSelectedTrack;

function getLocationsObject(trackName) {
    return tracksWithOptions[trackName]["locations"];
}

function saveTrackOptions(trackName) {
    tracksWithOptions[trackName]["name"] = nameInput.value;
    tracksWithOptions[trackName]["artist"] = artistInput.value;
    tracksWithOptions[trackName]["volume"] = parseFloat(volumeInput.value);
    for (const key in checkBoxes) {
        getLocationsObject(trackName)[key] = checkBoxes[key].checked;
    }
}

function loadTrackOptions(trackName) {
    nameInput.value = tracksWithOptions[trackName]["name"];
    artistInput.value = tracksWithOptions[trackName]["artist"];
    volumeInput.value = tracksWithOptions[trackName]["volume"];
    for (const key in getLocationsObject(trackName)) {
        checkBoxes[key].checked = getLocationsObject(trackName)[key];
    }
    enableTrackInputs();
}

function clearTrackOptions(trackName) {
    tracksWithOptions[trackName]["name"] = "";
    tracksWithOptions[trackName]["artist"] = "";
    tracksWithOptions[trackName]["volume"] = 1.0;
    tracksWithOptions[trackName]["locations"] = {};
    for (const key in checkBoxes) {
        getLocationsObject(trackName)[key] = false;
    }
}

trackList.onchange = function (e) {
    let idx = e.target.selectedIndex;
    let name = trackList[idx].textContent;
    if (currentSelectedTrack != undefined) {
        saveTrackOptions(currentSelectedTrack);
    }
    currentSelectedTrack = name;
    if (name != undefined) {
        loadTrackOptions(name);
    }
};

// -- Collapsible options --
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

// -- Bare code --
// Clear all fields when first loaded
clearAllInputs();
trackList.innerHTML = "";
disableTrackInputs();

// Populate version inputs
populateVersionInputs();
