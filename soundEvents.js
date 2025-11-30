// -- Helper functions --
function getEventNameFromShortName(shortName) {
    if (shortName.startsWith("custom$")) {
        return shortName.substring("custom$".length);
    }
    let subname = checkBoxes[shortName].parentElement.getAttribute("name");
    return "music." + (subname == undefined ? "" : subname + ".") + shortName;
}

// -- Calculating reserved event names --
const reservedEventNames = [
    // Special case event names need to be defined manually
    // Pre-1.9 event names
    "music.game.creative", "minecraft:music.game.creative",
    "music.game.end", "minecraft:music.game.end",
    "music.game.end.dragon", "minecraft:music.game.end.dragon",
    "music.game.end.credits", "minecraft:music.game.end.credits",
    "music.game.nether", "minecraft:music.game.nether",
    // Pre-1.16 Nether
    "music.nether", "minecraft:music.nether",
    // 1.19.X Jungle & Forest
    "music.overworld.jungle_and_forest", "minecraft:music.overworld.jungle_and_forest",
]

for (const key in checkBoxes) {
    let soundEvent = getEventNameFromShortName(key);
    reservedEventNames.push(soundEvent);
    reservedEventNames.push("minecraft:" + soundEvent);
}

const invalidCharsRegex = /[^a-z0-9_.:\-\/]/;

// -- Interaction for adding custom sound events --
function createCustomEvent(eventkey) {
    // Input sanitisation
    let prefixedEvent = "custom$" + eventkey;
    if (!eventkey) {
        alert("Error while adding custom event: Custom event key cannot be empty.");
        return false;
    } else if (invalidCharsRegex.test(eventkey)) {
        alert("Error while adding custom event: Event key \"" + eventkey + "\" contains one or more invalid characters.");
        return false;
    } else if (reservedEventNames.includes(eventkey)) {
        alert("Error while adding custom event: The event \"" + eventkey +"\" is a vanilla Minecraft event already used by this tool.");
        return false;
    } else if (prefixedEvent in checkBoxes) {
        alert("Error while adding custom event: An event \"" + eventkey + "\" already exists in this pack.");
        return false;
    }
    // Checkbox
    let checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("name", prefixedEvent);
    checkBox.classList.add(prefixedEvent); 
    if (!currentSelectedTrack) {
        checkBox.disabled = true;
    }
    document.getElementById("custom_event_label").insertAdjacentElement('beforebegin', checkBox);
    checkBoxes[prefixedEvent] = checkBox;
    // Weights input
    let weights = createWeightInput(checkBox);
    weights.classList.remove("advanced");
    weights.classList.remove("hidden");
    // Label
    let label = document.createElement("label");
    label.setAttribute("for", prefixedEvent);
    label.innerHTML = " " + eventkey;
    weights.insertAdjacentElement('afterend', label);
    // Delete button and break
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete event";
    deleteButton.classList.add("delete_event");
    label.insertAdjacentElement('afterend', deleteButton);
    let br = document.createElement("br");
    deleteButton.insertAdjacentElement('afterend', br);
    deleteButton.onclick = function() {
        delete checkBoxes[prefixedEvent];
        checkBox.remove();
        delete weightInputs[prefixedEvent];
        weights.remove();
        label.remove();
        deleteButton.remove();
        br.remove();
    }
    return true;
}

document.getElementById("add_custom_event").onclick = function() {
    let success = createCustomEvent(customEventInput.value.toLowerCase());
    if (success) customEventInput.value = "";
}