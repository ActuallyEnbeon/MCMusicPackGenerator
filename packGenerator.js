// -- Helper functions --
function getValidatedPackObject() {
    let minFormat = parseInt(minFormatInput.value);
    let minFormatMinor = parseInt(minFormatInputMinor.value);
    let maxFormat = parseInt(maxFormatInput.value);
    let maxFormatMinor = parseInt(maxFormatInputMinor.value);

    if (maxFormat < minFormat || (maxFormat == minFormat && maxFormatMinor < minFormatMinor)) {
        let minVersion = minVersionInput.value;
        let maxVersion = maxVersionInput.value;
        // If minVersion and maxVersion are valid versions, name them
        if (minVersion && maxVersion) {
            alert("Error while exporting: The max version (" + maxVersion + ") should be the same as or later than the min version (" + minVersion +").");
        // Otherwise name the selected pack formats
        } else {
            alert(
                "Error while exporting: The max format (" + maxFormat + "." + maxFormatMinor +") " +
                "should be the same as or greater than the min format (" +  minFormat + "." + minFormatMinor + ")."
            );
        }
        throw new Error("Max format " + maxFormat + "." + maxFormatMinor + " should be greater than or equal to min format " + minFormat + "." + minFormatMinor);
    }

    let packFile = {"pack": {"description": document.getElementById("desc").value}};
    let packFileObj = packFile["pack"];

    // TODO: Minecraft >1.20.2 claims pack is incompatible if minFormat < 15 - how to fix?
    if (minFormat < 65) {
        packFileObj["pack_format"] = minFormat;
        packFileObj["supported_formats"] = {"min_inclusive": minFormat, "max_inclusive": maxFormat};
    }

    if (maxFormat >= 65) {
        packFileObj["min_format"] = [minFormat, minFormatMinor];
        packFileObj["max_format"] = [maxFormat, maxFormatMinor];
    }

    return packFile;
}

function shouldIncludeOldNether(eventkey, minFormat) {
    if (minFormat[0] != undefined) minFormat = minFormat[0];
    return (eventkey == "nether_wastes" && minFormat <= 5);
}

function shouldIncludeOldJungleAndForest(eventkey, minFormat) {
    if (minFormat[0] != undefined) minFormat = minFormat[0];
    return (["forest", "flower_forest", "jungle", "sparse_jungle", "bamboo_jungle"].includes(eventkey) && minFormat < 15);
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

    let minFormat = packFile["pack"]["min_format"];
    if (minFormat == undefined) {
        minFormat = packFile["pack"]["pack_format"];
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
        let events = tracksWithOptions[key]["events"];

        // Format the name and artist safely for use in data files
        let safeName = name.replaceAll(" ", "_").toLowerCase();
        let safeArtist = artist.replaceAll(" ", "_").toLowerCase();

        // Save .ogg first
        musicFolder.folder(safeArtist).file(safeName + ".ogg", trackFiles[key]);

        // Next, update soundsFile
        // For each event...
        for (const eventkey in events) {
            // If this track does not play here, skip
            if (!events[eventkey]) { continue; }

            // Get the soundEvent name for this event
            let subname = checkBoxes[eventkey].parentElement.getAttribute("name");
            let soundEvent = "music." + (subname == undefined ? "" : subname + ".") + eventkey;

            // Create the soundEvent if it doesn't exist
            if (soundsFile[soundEvent] == undefined) {
                soundsFile[soundEvent] = {"sounds": []};
                // Special case for nether before 1.16
                if (shouldIncludeOldNether(eventkey, minFormat)) {
                    soundsFile["music.nether"] = {"sounds": []};
                }
                // Special case for jungle & forest in 1.19.X
                if (shouldIncludeOldJungleAndForest(eventkey, minFormat)) {
                    soundsFile["music.overworld.jungle_and_forest"] = {"sounds": []};
                }
            }

            // Add this track to the soundsFile at the soundEvent
            let soundData = {
                "name": "minecraft:music/" + safeArtist + "/" + safeName,
                "stream": true,
            };
            if (volume != 1) soundData["volume"] = volume;
            // TODO: other attributes

            soundsFile[soundEvent]["sounds"].push(soundData);
            // Special case for nether before 1.16
            if (shouldIncludeOldNether(eventkey, minFormat)) {
                soundsFile["music.nether"]["sounds"].push(soundData);
            }
            // Special case for jungle & forest in 1.19.X
            if (shouldIncludeOldJungleAndForest(eventkey, minFormat)) {
                soundsFile["music.overworld.jungle_and_forest"]["sounds"].push(soundData);
            }
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
