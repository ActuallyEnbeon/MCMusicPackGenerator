function readPackZip(pack) {
    // First, clear all fields
    clearAllInputs();
    trackList.value = "";
    disableTrackInputs();
    // Then load the pack file
    var new_zip = new JSZip();
    new_zip.loadAsync(pack)
    .then(function(zip) {
        try {
            // Load pack name
            let filenameSansExtension = pack.name.replace(/\.[^/.]+$/, "");
            document.getElementById("pack_name").value = filenameSansExtension;
            // Load other pack info from .mcmeta file
            zip.file("pack.mcmeta").async("string").then(function(data) {
                let mcmetaData = JSON.parse(data)["pack"];
                document.getElementById("desc").value = mcmetaData["description"];
                document.getElementById("min_format").value = mcmetaData["min_format"];
                document.getElementById("max_format").value = mcmetaData["max_format"];
            });
            // Load pack.png into icon upload element, if it exists
            let packPNG = zip.file("pack.png");
            if (packPNG) {
                packPNG.async("blob").then(function (blob) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(new File([blob], "pack.png"));
                    iconFileUpload.files = dataTransfer.files;
                    iconFileUpload.onchange();
                });
            }
            // TODO: read all other files
        } catch (e) {
            alert("Error: Could not read pack file \"" + pack.name + "\". It may be corrupted or formatted incorrectly.");
        }
    });
}
