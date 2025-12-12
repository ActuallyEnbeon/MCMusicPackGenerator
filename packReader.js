// -- Helper functions --
function alertCouldNotRead(packName, problemString) {
    alert("Error while reading \"" + packName + "\": " + problemString);
}

function removeFileExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

function getFormats(packMCMETA) {
    // First, try new style
    let minFormat = packMCMETA["min_format"];
    if (minFormat != undefined) {
        return [minFormat, packMCMETA["max_format"]];
    }
    // Next, try old style with supported_formats
    let supportedFormats = packMCMETA["supported_formats"];
    if (supportedFormats != undefined) {
        // Need to try all possible value types
        // Dictionary
        if (supportedFormats["min_inclusive"] != undefined) {
            return [supportedFormats["min_inclusive"], supportedFormats["max_inclusive"]];
        // Array
        } else if (supportedFormats[0] != undefined) {
            return [supportedFormats[0], supportedFormats[1]];
        // Number
        } else {
            return [supportedFormats, supportedFormats];
        }
    }
    // Finally, try old style with pack_format
    let packFormat = packMCMETA["pack_format"];
    if (packFormat != undefined) {
        return [packFormat, packFormat];
    }
    throw new Error("Pack format could not be read");
}

// -- Main function --
function readPackZip(pack) {
    // First, clear all data
    clearAllData();
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
                // Description
                document.getElementById("desc").value = packMCMETA["description"];
                // Pack formats
                let [minFormat, maxFormat] = getFormats(packMCMETA);
                // Need to check for either int or int-array
                if (minFormat[0] == undefined) {
                    minFormatInput.value = minFormat;
                } else {
                    minFormatInput.value = minFormat[0];
                }
                if (maxFormat[0] == undefined) {
                    maxFormatInput.value = maxFormat;
                } else {
                    maxFormatInput.value = maxFormat[0];
                }
                // And flush to the version selectors
                minFormatInput.onchange();
                maxFormatInput.onchange();
            }).catch(e => {
                console.error(e);
                alertCouldNotRead(pack.name, "pack.mcmeta is not formatted correctly.");
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
                }).catch(e => {
                    console.error(e);
                    alertCouldNotRead(pack.name, "pack.png could not be loaded.");
                });
            }
            // Prepare sounds.json
            zip.file("assets/minecraft/sounds.json").async("string").then(function(data) {
                let soundsJSON = JSON.parse(data);
                // These lines are here to ensure that advanced mode alerts only occur once
                let customWeightHasNotProccedYet = true;
                let customEventHasNotProccedYet = true;
                // Read all sound files
                let soundsFolder = zip.folder("assets").folder("minecraft").folder("sounds");
                soundsFolder.forEach(function (relativePath, fileObj) {
                    // First, get the filename and filepath
                    let splitPath = relativePath.split("/");
                    let filename = splitPath.at(-2) + "/" + splitPath.at(-1);
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
                                if (soundObj["name"] != filepath && soundObj["name"] != "minecraft:" + filepath) continue;
                                // Set the events list
                                let weight = soundObj["weight"];
                                // If weight is nonstandard, switch on advanced mode
                                if (weight && customWeightHasNotProccedYet) {
                                    activateAdvancedMode();
                                    alert("Alert: This pack uses nonstandard weights. Advanced mode has been switched on.");
                                    customWeightHasNotProccedYet = false;
                                }
                                // If the event's name is reserved...
                                if (reservedEventNames.includes(key)) {
                                    let bareSoundEventName = key.split(".").at(-1);
                                    // Use the bare name if it has a corresponding checkbox
                                    if (bareSoundEventName in checkBoxes) {
                                        getEventWeights(filename)[bareSoundEventName] = (weight ? weight : 1);
                                    }
                                // Otherwise, create a custom event
                                } else {
                                    createCustomEvent(key);
                                    getEventWeights(filename)["custom$" + key] = (weight ? weight : 1);
                                    // And switch on advanced mode
                                    if (customEventHasNotProccedYet) {
                                        activateAdvancedMode();
                                        alert("Alert: This pack uses custom sound events. Advanced mode has been switched on.");
                                        customEventHasNotProccedYet = false;
                                    }
                                }
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
                            // Flush imported data to saved data list
                            flushChangesToSavedData();
                            // And update page title
                            updateTitle();
                        });
                    });
                });
            }).catch(e => {
                console.error(e);
                alertCouldNotRead(pack.name, "Failed to read sound files.");
            });
        } catch (e) {
            console.error(e);
            alertCouldNotRead(pack.name, "One or more required files are missing.");
        }
    });
}
