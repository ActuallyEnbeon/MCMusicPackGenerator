function removeFileExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

function readPackZip(pack) {
    // First, clear all fields
    clearAllInputs();
    trackList.innerHTML = "";
    disableTrackInputs();
    // Then load the pack file
    var new_zip = new JSZip();
    new_zip.loadAsync(pack)
    .then(function(zip) {
        try {
            // Load pack name
            document.getElementById("pack_name").value = removeFileExtension(pack.name);
            // Load other pack info from .mcmeta file
            zip.file("pack.mcmeta").async("string").then(function(data) {
                let packMCMETA = JSON.parse(data)["pack"];
                document.getElementById("desc").value = packMCMETA["description"];
                // TODO: account for old pack format params
                document.getElementById("min_format").value = packMCMETA["min_format"];
                document.getElementById("max_format").value = packMCMETA["max_format"];
            });
            // Load pack.png into icon upload element, if it exists
            let packPNG = zip.file("pack.png");
            if (packPNG) {
                packPNG.async("blob").then(function (blob) {
                    // We use a dataTransfer object to set the icon upload element's list of files
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(new File([blob], "pack.png"));
                    iconFileUpload.files = dataTransfer.files;
                    iconFileUpload.onchange();
                });
            }
            // Prepare sounds.json
            zip.file("assets/minecraft/sounds.json").async("string").then(function(data) {
                let soundsJSON = JSON.parse(data);
                // Read all sound files
                let soundsFolder = zip.folder("assets").folder("minecraft").folder("sounds");
                soundsFolder.forEach(function (relativePath, fileObj) {
                    // First, get the filename and filepath
                    let filename = relativePath.split("/").at(-1);
                    if (!filename.toLowerCase().endsWith(".ogg")) return; // Skip any files that aren't .OGGs
                    let filepath = removeFileExtension(relativePath);
                    fileObj.async("blob").then((blob) => {
                        // Then add the file to the track list
                        addFileToTrackList(new File([blob], filename));
                        // Next, get its sound events from sounds.json
                        let volume = 1.0;
                        for (const key in soundsJSON) {
                            let thisEventList = soundsJSON[key]["sounds"];
                            for (const soundObj of thisEventList) {
                                if (soundObj["name"] != filepath && soundObj["name"] != "minecraft:" + filepath) return;
                                // Set the locations list
                                let bareSoundEventName = key.split(".").at(-1);
                                getLocationsObject(filename)[bareSoundEventName] = true;
                                // And get the sound's volume if it's not 1
                                let newVolume = soundObj["volume"];
                                if (volume == 1.0 && newVolume != undefined && newVolume != 1.0) {
                                    volume = newVolume;
                                }
                            }
                        }
                        // Set the volume
                        tracksWithOptions[filename]["volume"] = volume;
                        // Finally, get localisation info
                        zip.file("assets/minecraft/lang/en_us.json").async("string").then(function(data) {
                            let enusJSON = JSON.parse(data);
                            let locName = filepath.replaceAll("/", ".");
                            let locData = enusJSON[locName].split(" - ");
                            tracksWithOptions[filename]["artist"] = locData[0];
                            tracksWithOptions[filename]["name"] = locData[1];
                        });
                    });
                });
            });
        } catch (e) {
            console.error(e);
            alert("Error: Could not read pack file \"" + pack.name + "\". It may be formatted incorrectly or corrupted.");
        }
    });
}
