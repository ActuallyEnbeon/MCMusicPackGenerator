// -- Helper functions --
function getValidatedPackObject() {
    let minFormat = parseInt(minFormatInput.value);
    let maxFormat = parseInt(maxFormatInput.value);

    if (maxFormat < minFormat) { // || (maxFormat == minFormat && maxFormatMinor < minFormatMinor)) {
        let minVersion = minVersionInput.value;
        let maxVersion = maxVersionInput.value;
        // If minVersion and maxVersion are valid versions, name them
        if (minVersion && maxVersion) {
            alert("Error while exporting: The min version (" + minVersion + ") should be the same as or earlier than the max version (" + maxVersion +").");
        // Otherwise name the selected pack formats
        } else {
            alert(
                "Error while exporting: The min format (" + minFormat +") should be the same as or less than the max format (" +  maxFormat + ")."
            );
        }
        throw new Error("Min format " + minFormat + " should be greater than or equal to max format " + maxFormat);
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

function shouldIncludeOldNether(eventkey, minFormat) {
    if (minFormat[0] != undefined) minFormat = minFormat[0];
    return (eventkey == "nether_wastes" && minFormat <= 5);
}

const jungleAndForestEvents = ["forest", "flower_forest", "jungle", "sparse_jungle", "bamboo_jungle"];

function shouldIncludeOldJungleAndForest(eventkey, minFormat) {
    if (minFormat[0] != undefined) minFormat = minFormat[0];
    return (jungleAndForestEvents.includes(eventkey) && minFormat < 15 && minFormat >= 9);
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

    // Abort if there are no tracks
    if (Object.keys(tracksWithOptions).length <= 0) {
        alert("Error while exporting: Pack has no tracks.");
        return;
    }

    let seenTrackPaths = [];

    for (const key in tracksWithOptions) {
        // First, get track info
        let name = tracksWithOptions[key]["name"];
        let artist = tracksWithOptions[key]["artist"];
        let volume = tracksWithOptions[key]["volume"];
        let weights = tracksWithOptions[key]["weights"];

        if (!name) {
            alert("Error while exporting: Track \"" + key + "\" does not have a name.");
            return;
        }
        if (!artist) {
            alert("Error while exporting: Track \"" + key + "\" does not have an artist.");
            return;
        }

        // Format the name and artist safely for use in data files
        let safeName = name.trim().replaceAll(" ", "_").toLowerCase();
        let safeArtist = artist.trim().replaceAll(" ", "_").toLowerCase();

        // Abort if this track has the same name and artist as another track
        if (seenTrackPaths.includes(safeArtist + "/" + safeName)) {
            alert("Error while exporting: Track \"" + key + "\" has the same name and artist as another track.");
            return;
        }
        seenTrackPaths.push(safeArtist + "/" + safeName);

        // Save .ogg first
        musicFolder.folder(safeArtist).file(safeName + ".ogg", trackFiles[key]);

        // Next, update soundsFile
        // For each event...
        for (const eventkey in weights) {
            // If this track does not play here, skip
            if (!weights[eventkey]) { continue; }

            // Get the soundEvent name for this event
            let soundEvent = getEventNameFromShortName(eventkey);

            // Create the soundEvent if it doesn't exist
            if (soundsFile[soundEvent] == undefined) {
                soundsFile[soundEvent] = {"sounds": []};
                // Special case for nether before 1.16
                if (shouldIncludeOldNether(eventkey, minFormat)) {
                    soundsFile["music.nether"] = {"sounds": []};
                }
                // Special case for jungle & forest in 1.19.X (plus don't reset if this case is already present)
                if (shouldIncludeOldJungleAndForest(eventkey, minFormat) && !soundsFile["music.overworld.jungle_and_forest"]) {
                    soundsFile["music.overworld.jungle_and_forest"] = {"sounds": []};
                }
            }

            // Add this track to the soundsFile at the soundEvent
            let soundData = {
                "name": "minecraft:music/" + safeArtist + "/" + safeName,
                "stream": true,
            };
            if (volume != 1) soundData["volume"] = volume;
            if (weights[eventkey] != 1) soundData["weight"] = weights[eventkey];

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
            let packName = document.getElementById("pack_name").value;
            saveAs(blob, (packName ? packName : "pack") + ".zip");
            // Flush changes to saved data list
            flushChangesToSavedData();
            // And update page title
            updateTitle();
        });
}
