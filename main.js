// -- Constants --
const fileInput = document.getElementById("tracks_upload");
const uploadButton = document.getElementById("add_tracks");
const trackList = document.getElementById("track_select");

const collapsibleToggles = document.getElementsByClassName("collapsible_toggle");

const optionsBox = document.getElementById("options_box");

const checkBoxes = {};
for (const option of Array.from(optionsBox.children, (child) => child)) {
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
for (const key in checkBoxes) {
    // Clear all checkboxes when first loaded
    checkBoxes[key].checked = false;
}

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
    }

    // Clear the file upload field
    fileInput.value = null;
}

// File selection
var currentSelectedTrack;

function saveTrackOptions(trackName) {
    for (const key in checkBoxes) {
        tracksWithOptions[trackName][key] = checkBoxes[key].checked;
    }
}

function loadTrackOptions(trackName) {
    for (const key in tracksWithOptions[trackName]) {
        checkBoxes[key].checked = tracksWithOptions[trackName][key];
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