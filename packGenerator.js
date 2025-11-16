// -- Helper functions --
function getValidatedPackObject() {
    let minFormat = parseFloat(minFormatInput.value);
    let maxFormat = parseFloat(maxFormatInput.value);

    if (maxFormat < minFormat) {
        let minVersion = minVersionInput.value;
        let maxVersion = maxVersionInput.value;
        alert("Error while exporting: The max version (" + maxVersion + ") should be the same as or later than the min version (" + minVersion +").");
        throw new Error("Max format " + maxFormat + " should be greater than or equal to min format " + minFormat);
    }

    let packFile = {"pack": {"description": document.getElementById("desc").value}};
    let packFileObj = packFile["pack"];

    if (minFormat < 65) {
        packFileObj["pack_format"] = minFormat;
        packFileObj["supported_formats"] = {"min_inclusive": minFormat, "max_inclusive": maxFormat};
    }

    if (maxFormat >= 65) {
        packFileObj["min_format"] = minFormat;
        packFileObj["max_format"] = maxFormat;
    }

    return packFile;
}

// -- Main function --
function downloadPackZip() {
    let zip = new JSZip();

    let packFile;
    try {
        packFile = getValidatedPackObject();
    } catch (e) {
        return;
    }

    zip.file("pack.mcmeta", JSON.stringify(packFile));

    let packIcon = iconFileUpload.files[0];
    if (packIcon) {
        zip.file("pack.png", packIcon);
    }

    let assetsFolder = zip.folder("assets").folder("minecraft");
    let musicFolder = assetsFolder.folder("sounds").folder("music");

    // Ensure selected track is saved before export
    if (currentSelectedTrack != undefined) {
        saveTrackOptions(currentSelectedTrack);
    }

    // Set up data files
    let soundsFile = {};
    let langFile = {};

    for (const key in tracksWithOptions) {
        // First, get track info
        let name = tracksWithOptions[key]["name"];
        let artist = tracksWithOptions[key]["artist"];
        let volume = tracksWithOptions[key]["volume"];
        let locations = tracksWithOptions[key]["locations"];

        // Format the name and artist safely for use in data files
        let safeName = name.replaceAll(" ", "_").toLowerCase();
        let safeArtist = artist.replaceAll(" ", "_").toLowerCase();

        // Save .ogg first
        musicFolder.folder(safeArtist).file(safeName + ".ogg", trackFiles[key]);

        // Next, update soundsFile
        // For each location...
        for (const lockey in locations) {
            // If this track does not play here, skip
            if (!locations[lockey]) { continue; }

            // Get the soundEvent for this location
            let subname = checkBoxes[lockey].parentElement.getAttribute("name");
            let soundEvent = "music." + (subname == undefined ? "" : subname + ".") + lockey;

            // Create the soundEvent if it doesn't exist
            if (soundsFile[soundEvent] == undefined) {
                soundsFile[soundEvent] = {
                    "sounds": []
                }
            }

            // Add this track to the soundsFile at the soundEvent
            let soundData = {
                "name": "minecraft:music/" + safeArtist + "/" + safeName,
                "stream": true,
            };
            if (volume != 1) soundData["volume"] = volume;
            // TODO: other attributes

            soundsFile[soundEvent]["sounds"].push(soundData)
        }

        // Last, update langFile
        langFile["music." + safeArtist + "." + safeName] = artist + " - " + name;
    }
    // Next, add soundsFile and langFile to the zip
    assetsFolder.file("sounds.json", JSON.stringify(soundsFile));
    assetsFolder.folder("lang").file("en_us.json", JSON.stringify(langFile));

    // Finally, download the created zip
    zip.generateAsync({type:"blob"})
        .then(function (blob) {
            saveAs(blob, document.getElementById("pack_name").value + ".zip");
        });
}
