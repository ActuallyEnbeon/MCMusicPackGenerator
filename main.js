// Constants
const fileInput = document.getElementById("tracks_upload");
const uploadButton = document.getElementById("add_tracks");
const trackList = document.getElementById("track_select");

const collapsibleToggles = document.getElementsByClassName("collapsible_toggle");

uploadButton.onclick = function() {
    // Add all files to trackList
    for (const file of fileInput.files) {
        var option = document.createElement("option");
        option.textContent = file.name;
        trackList.appendChild(option);        
    }

    // Clear the file upload field
    fileInput.value = null;
}

trackList.addEventListener('change', function (e) {
    alert('changed');
});

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