// Constants
const fileInput = document.getElementById("tracks_upload");
const uploadButton = document.getElementById("add_tracks")
const trackList = document.getElementById("track_select");

//Defining a listener for our button, specifically, an onclick handler
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
