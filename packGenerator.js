// -- Functions --
function downloadPackZip() {
    let zip = new JSZip();

    // TODO: account for old pack format params
    // TODO: use parseInt for formats before 69.0
    let packFile = {
        "pack": {
            "min_format": parseFloat(document.getElementById("min_format").value),
            "max_format": parseFloat(document.getElementById("max_format").value),
            "description": document.getElementById("desc").value,
        }
    }
    zip.file("pack.mcmeta", JSON.stringify(packFile));
    // TODO: add pack.png uploading

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
        let locations = tracksWithOptions[key]["locations"];

        // Save .ogg first
        musicFolder.folder(artist).file(name + ".ogg", trackFiles[key]);

        // Next, update soundsFile
        // For each location...
        for (const lockey in locations) {
            // If this track does not play here, skip
            if (!locations[lockey]) { continue; }

            // Get the soundEvent for this location
            let subname = checkBoxes[lockey].parentElement.classList[1]; // TODO: this is jank
            let soundEvent = "music." + (subname == undefined ? "" : subname + ".") + lockey;

            // Create the soundEvent if it doesn't exist
            if (soundsFile[soundEvent] == undefined) {
                soundsFile[soundEvent] = {
                    "sounds": []
                }
            }

            // Add this track to the soundsFile at the soundEvent
            soundsFile[soundEvent]["sounds"].push({
                "name": "minecraft:music/" + artist + "/" + name,
                "stream": true,
                // TODO: volume and other attributes
            })
        }

        // Last, update langFile
        langFile["music." + artist + "." + name] = artist + " - " + name
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