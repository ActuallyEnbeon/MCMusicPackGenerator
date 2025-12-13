// -- Constants --
const packUploadInput = document.getElementById("import_pack");

const advancedModeToggle = document.getElementById("advanced_mode");
const darkModeToggle = document.getElementById("dark_mode_toggle")

const trackFileUpload = document.getElementById("tracks_upload");
const trackList = document.getElementById("track_select");

const trackOptionsBox = document.getElementById("track_options_box");
const nameInput = document.getElementById("track_name");
const artistInput = document.getElementById("artist");
const volumeInput = document.getElementById("volume");
const deleteTrackButton = document.getElementById("delete_track");

const customEventInput = document.getElementById("custom_event_input");

const collapsibleToggles = document.getElementsByClassName("collapsible_toggle");

const checkBoxes = {};
const weightInputs = {};
for (const option of trackOptionsBox.children) {
    if (option.getAttribute("type") == "checkbox") { 
        checkBoxes[option.name] = option;
        createWeightInput(option);
    }
    if (option.classList.contains("collapsible_content")) {
        for (const child of option.children) {
            if (child.getAttribute("type") == "checkbox") { 
                checkBoxes[child.name] = child;
                createWeightInput(child);
            }
        }
    }
}

const packOptions = document.getElementById("pack_options");
const iconFileUpload = document.getElementById("pack_icon_upload");

const trackFiles = {};
const tracksWithOptions = {};

const savedData = {
    "pack_options": convertedPackOptions(),
    "tracks_with_options": {},
}

// -- Setup functions --
function createWeightInput(box) {
    // Create the input element and set the necessary attributes
    input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("value", 1);
    input.setAttribute("min", 1);
    input.setAttribute("step", 1);
    // Style the input correctly, and hide and disable it by default
    input.classList.add("weights");
    input.classList.add("advanced");
    input.classList.add("hidden");
    input.disabled = true;
    // Insert the element into the document
    box.insertAdjacentElement('afterend', input);
    // Keep track of the element for interactions
    weightInputs[box.name] = input;
    // Make the box enable and disable the weight input correctly
    box.onchange = () => {
        weightInputs[box.name].disabled = !box.checked;
    }
    // Enforce integer values for the weight input
    input.onchange = () => {
        weightInputs[box.name].value = parseInt(weightInputs[box.name].value);
    }
    return input;
}

// -- Helper functions --
function enableTrackInputs() {
    nameInput.disabled = false;
    artistInput.disabled = false;
    volumeInput.disabled = false;
    for (const key in checkBoxes) {
        checkBoxes[key].disabled = false;
        // Weight inputs should only be enabled conditionally
        checkBoxes[key].onchange();
    }
    deleteTrackButton.disabled = false;
}

function disableTrackInputs() {
    nameInput.disabled = true;
    artistInput.disabled = true;
    volumeInput.disabled = true;
    for (const key in checkBoxes) checkBoxes[key].disabled = true;
    for (const key in weightInputs) weightInputs[key].disabled = true;
    deleteTrackButton.disabled = true;
}

function clearTrackInputs() {
    trackFileUpload.value = "";
    nameInput.value = "";
    artistInput.value = "";
    volumeInput.value = 100;
    for (const key in checkBoxes) {
        checkBoxes[key].checked = false;
    }
    for (const key in weightInputs) {
        weightInputs[key].value = 1;
        weightInputs[key].disabled = true;
    }
}

function clearAllData() {
    // Track input fields
    clearTrackInputs();
    customEventInput.value = "";
    for (const button of document.getElementsByClassName("delete_event")) {
        button.onclick();
    }
    // Pack input fields
    for (const key in packOptions.children) {
        let element = packOptions.children[key];
        if (element.nodeName == "INPUT") {
            element.value = "";
        }
    }
    iconFileUpload.onchange();
    // Other input fields
    deactivateAdvancedMode();
    // Saved pack data
    currentSelectedTrack = undefined;
    for (key in tracksWithOptions) {
        delete tracksWithOptions[key];
    }
    flushChangesToSavedData();
}

function addFileToTrackList(file) {
    var option = document.createElement("option");
    option.name = option.textContent = file.name;
    trackList.appendChild(option);
    trackFiles[option.name] = file;
    tracksWithOptions[option.name] = {};
    clearTrackOptions(option.name);
}

function activateAdvancedMode() {
    advancedModeToggle.checked = true;
    advancedModeToggle.onchange();
}

function deactivateAdvancedMode() {
    advancedModeToggle.checked = false;
    advancedModeToggle.onchange();
}

function hasNotSaved() {
    return (!deepEqual(savedData["tracks_with_options"], prunedTracksWithOptions())
            || !deepEqual(savedData["pack_options"], convertedPackOptions()));
}

function flushChangesToSavedData() {
    savedData["tracks_with_options"] = prunedTracksWithOptions();
    savedData["pack_options"] = convertedPackOptions();
}

// Copies tracksWithOptions and gets rid of all zero-weight events
function prunedTracksWithOptions() {
    let obj = {};
    for (const track in tracksWithOptions) {
        trackObj = tracksWithOptions[track];
        obj[track] = {
            "name": trackObj["name"],
            "artist": trackObj["artist"],
            "volume": trackObj["volume"],
            "weights": []
        }
        for (const event in trackObj["weights"]) {
            if (trackObj["weights"][event]) {
                obj[track]["weights"][event] = trackObj["weights"][event];
            }
        }
    }
    return obj;
}

// Converts packOptions into a readable object
function convertedPackOptions() {
    let obj = {};
    for (const key in packOptions.children) {
        let element = packOptions.children[key];
        if (element.nodeName == "INPUT") {
            obj[element.id] = element.value;
        }
    }
    obj["icon_hash"] = generateHash(document.getElementById("icon_preview").src);
    return obj;
}

// Allows comparing objects
function deepEqual(x, y) {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
        ok(x).length === ok(y).length &&
        ok(x).every(key => deepEqual(x[key], y[key]))
    ) : (x === y);
}

// Allows hashing data for more efficient comparisons
function generateHash(string) {
    let hash = 0;
    for (const char of string) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0; // Constrain to 32bit integer
    }
    return hash;
};

// -- Interaction behaviour --
// Advanced mode toggle
advancedModeToggle.onchange = function() {
    for (const element of document.getElementsByClassName("advanced")) {
        if (advancedModeToggle.checked) {
            element.classList.remove("hidden");
        } else {
            element.classList.add("hidden");
        }
    }
}

// Dark mode toggle
darkModeToggle.onclick = function() {
    if (document.body.classList.contains("dark_mode")) {
        document.body.classList.remove("dark_mode");
        darkModeToggle.innerHTML = "Dark mode";
    } else {
        document.body.classList.add("dark_mode");
        darkModeToggle.innerHTML = "Light mode";
    }
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
         // Autoload track info from metadata
        musicmetadata(file, function (err, result) {
            if (err) throw err;
            tracksWithOptions[file.name]["name"] = result["title"];
            tracksWithOptions[file.name]["artist"] = result["artist"];
        });
    }

    // Clear the file upload field
    trackFileUpload.value = null;
}

// Track deletion
deleteTrackButton.onclick = function() {
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
function updatePreviewIcon(shouldFlushAfterLoad) {
    let file = iconFileUpload.files[0];
    if (file) {
        // use FileReader to generate preview image
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("icon_preview").src = e.target.result;
            if (shouldFlushAfterLoad) flushChangesToSavedData();
            updateTitle();
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById("icon_preview").src = "";
    }
}

iconFileUpload.onchange = function() {
    updatePreviewIcon();
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

// Unsaved changes warning
window.addEventListener("beforeunload", (e) => {
    // If the tracksWithOptions or the packOptions have changed,
    if (hasNotSaved()) {
            // Warn the user of unsaved changes
            e.preventDefault();
            e.returnValue = ""; // Legacy browser support
    }
});

// Updating page title
function updateTitle() {
    if (currentSelectedTrack) saveTrackOptions(currentSelectedTrack);
    let packName = document.getElementById("pack_name").value;
    let title = (packName ? packName : "Unnamed");
    if (hasNotSaved()) title += " *";
    title += " - MC Music Pack Generator";
    document.title = title;
};

document.addEventListener("input", updateTitle);
document.addEventListener("change", updateTitle);

// -- Track selection --
var currentSelectedTrack;

function getEventWeights(trackName) {
    return tracksWithOptions[trackName]["weights"];
}

function saveTrackOptions(trackName) {
    tracksWithOptions[trackName]["name"] = nameInput.value;
    tracksWithOptions[trackName]["artist"] = artistInput.value;
    tracksWithOptions[trackName]["volume"] = parseFloat(volumeInput.value) / 100;
    for (const key in checkBoxes) {
        if (checkBoxes[key].checked) {
            getEventWeights(trackName)[key] = parseInt(weightInputs[key].value);
        } else {
            getEventWeights(trackName)[key] = 0;
        }
    }
}

function loadTrackOptions(trackName) {
    nameInput.value = tracksWithOptions[trackName]["name"];
    artistInput.value = tracksWithOptions[trackName]["artist"];
    volumeInput.value = tracksWithOptions[trackName]["volume"] * 100;
    for (const key in getEventWeights(trackName)) {
        let weight = getEventWeights(trackName)[key];
        if (weight > 0) {
            checkBoxes[key].checked = true;
            weightInputs[key].value = weight;
        } else {
            checkBoxes[key].checked = false;
            weightInputs[key].value = 1;
        }
    }
    enableTrackInputs();
}

function clearTrackOptions(trackName) {
    tracksWithOptions[trackName]["name"] = "";
    tracksWithOptions[trackName]["artist"] = "";
    tracksWithOptions[trackName]["volume"] = 1.0;
    tracksWithOptions[trackName]["weights"] = {};
    for (const key in checkBoxes) {
        getEventWeights(trackName)[key] = 0;
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
// Clear all data when first loaded
clearAllData();
packUploadInput.value = "";
trackList.innerHTML = "";
disableTrackInputs();

// Populate version inputs
populateVersionInputs();
