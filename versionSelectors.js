// -- Constants --
const minVersionInput = document.getElementById("min_version");
const maxVersionInput = document.getElementById("max_version");

const minFormatInput = document.getElementById("min_format");
const maxFormatInput = document.getElementById("max_format");

// -- Functions --
function populateVersionInputs() {
    for (const obj of simpleVersionList.toReversed()) {
        // Need to make two separate options, one for each selector
        var minOption = document.createElement("option");
        minOption.name = minOption.textContent = obj["min"];
        minVersionInput.appendChild(minOption);

        var maxOption = document.createElement("option");
        maxOption.name = maxOption.textContent = obj["max"];
        maxVersionInput.appendChild(maxOption);
    }
    minVersionInput.selectedIndex = maxVersionInput.selectedIndex = 0;
    minVersionInput.onchange();
    maxVersionInput.onchange();
}

function areFormatsEqual(format1, format2) {
    return format1 == format2;
    // There used to be more complicated logic here...
}

function getFormatFromVersion(version) {
    let obj = simpleVersionList.find((e) => e["max"] == version || e["min"] == version);
    if (obj == undefined) {
        throw new Error("Could not find pack format for game version " + version);
    }
    return obj["format"];
}

// if getMax is true, gets max version in range -- if false, gets min version in range
function getVersionFromFormat(format, getMax) {
    let obj = simpleVersionList.find((e) => areFormatsEqual(e["format"], format));
    if (obj == undefined) {
        throw new Error("Could not find game versions for pack format " + format);
    }
    return (getMax ? obj["max"] : obj["min"]);
}

// -- Interaction behaviour --
// Make version selectors affect format selectors
minVersionInput.onchange = function () {
    let format = getFormatFromVersion(minVersionInput.value);
    minFormatInput.value = format;
    maxVersionInput.disabled = (format < 15);
    if (format < 15 || maxFormatInput.value < format) {
        maxFormatInput.value = format;
        maxFormatInput.onchange();
    }
}

maxVersionInput.onchange = function () {
    let format = getFormatFromVersion(maxVersionInput.value);
    maxFormatInput.value = format;
    if (format < 15 || minFormatInput.value > format) {
        minFormatInput.value = format;
        minFormatInput.onchange();
    }
}

// Make format selectors affect version selectors
minFormatInput.onchange = function () {
    try {
        minVersionInput.value = getVersionFromFormat(minFormatInput.value, false);
    } catch (e) {
        minVersionInput.value = "";
    }
    maxVersionInput.disabled = (minFormatInput.value < 15);
}

maxFormatInput.onchange = function () {
    try {
        maxVersionInput.value = getVersionFromFormat(maxFormatInput.value, true);
    } catch (e) {
        maxVersionInput.value = "";
    }
    maxVersionInput.disabled = (minFormatInput.value < 15);
}

// -- Version map --
const simpleVersionList = [
    {"format": 1, "min": "1.6.1", "max": "1.8.9"},
    {"format": 2, "min": "1.9", "max": "1.10.2"},
    {"format": 3, "min": "1.11", "max": "1.12.2"},
    {"format": 4, "min": "1.13", "max": "1.14.4"},
    {"format": 5, "min": "1.15", "max": "1.16.1"},
    {"format": 6, "min": "1.16.2", "max": "1.16.5"},
    {"format": 7, "min": "1.17", "max": "1.17.1"},
    {"format": 8, "min": "1.18", "max": "1.18.2"},
    {"format": 9, "min": "1.19", "max": "1.19.2"},
    {"format": 12, "min": "1.19.3", "max": "1.19.3"},
    {"format": 13, "min": "1.19.4", "max": "1.19.4"},
    {"format": 15, "min": "1.20", "max": "1.20.1"},
    {"format": 18, "min": "1.20.2", "max": "1.20.2"},
    {"format": 22, "min": "1.20.3", "max": "1.20.4"},
    {"format": 32, "min": "1.20.5", "max": "1.20.6"},
    {"format": 34, "min": "1.21", "max": "1.21.1"},
    {"format": 42, "min": "1.21.2", "max": "1.21.3"},
    {"format": 46, "min": "1.21.4", "max": "1.21.4"},
    {"format": 55, "min": "1.21.5", "max": "1.21.5"},
    {"format": 63, "min": "1.21.6", "max": "1.21.6"},
    {"format": 64, "min": "1.21.7", "max": "1.21.8"},
    {"format": 69, "min": "1.21.9", "max": "1.21.10"},
];
