// -- Constants --
const minVersionInput = document.getElementById("min_version");
const maxVersionInput = document.getElementById("max_version");

const minFormatInput = document.getElementById("min_format");
const maxFormatInput = document.getElementById("max_format");

// -- Functions --
function populateVersionInputs() {
    for (const obj of simpleVersionList.toReversed()) {
        for (const ver of obj["versions"].toReversed()) {
            // Need to make two separate options, one for each selector
            var minOption = document.createElement("option");
            minOption.required = true;
            minOption.name = minOption.textContent = ver;
            minVersionInput.appendChild(minOption);
            
            var maxOption = document.createElement("option");
            maxOption.required = true;
            maxOption.name = maxOption.textContent = ver;
            maxVersionInput.appendChild(maxOption);
        }
    }
    minVersionInput.selectedIndex = maxVersionInput.selectedIndex = 0;
    minVersionInput.onchange();
    maxVersionInput.onchange();
}

function getFormatFromVersion(version) {
    let obj = simpleVersionList.find((e) => e["versions"].includes(version));
    if (obj == undefined) {
        throw new Error("Could not find pack format for game version " + version);
    }
    return obj["format"];
}

// if getMax is true, gets max version in range -- if false, gets min version in range
function getVersionFromFormat(format, getMax) {
    let obj = simpleVersionList.find((e) => e["format"] == format);
    if (obj == undefined) {
        throw new Error("Could not find game versions for pack format " + format);
    }
    return obj["versions"].at(getMax ? -1 : 0);
}

// -- Interaction behaviour --
minVersionInput.onchange = function () {
    minFormatInput.value = getFormatFromVersion(minVersionInput.value);
}

maxVersionInput.onchange = function () {
    maxFormatInput.value = getFormatFromVersion(maxVersionInput.value);
}

minFormatInput.onchange = function () {
    try {
        minVersionInput.value = getVersionFromFormat(minFormatInput.value);
    } catch (e) {
        minVersionInput.value = "";
    }
}

maxFormatInput.onchange = function () {
    try {
        maxVersionInput.value = getVersionFromFormat(maxFormatInput.value, true);
    } catch (e) {
        maxVersionInput.value = "";
    }
}

// -- Version map --
const simpleVersionList = [
    {"format": 2, "versions": ["1.9", "1.9.1", "1.9.2", "1.9.3", "1.9.4", "1.10", "1.10.1", "1.10.2"]},
    {"format": 3, "versions": ["1.11", "1.11.1", "1.11.2", "1.12", "1.12.1", "1.12.2"]},
    {"format": 4, "versions": ["1.13", "1.13.1", "1.13.2", "1.14", "1.14.1", "1.14.2", "1.14.3", "1.14.4"]},
    {"format": 5, "versions": ["1.15", "1.15.1", "1.15.2", "1.16", "1.16.1"]},
    {"format": 6, "versions": ["1.16.2", "1.16.3", "1.16.4", "1.16.5"]},
    {"format": 7, "versions": ["1.17", "1.17.1"]},
    {"format": 8, "versions": ["1.18", "1.18.1", "1.18.2"]},
    {"format": 9, "versions": ["1.19", "1.19.1", "1.19.2"]},
    {"format": 12, "versions": ["1.19.3"]},
    {"format": 13, "versions": ["1.19.4"]},
    {"format": 15, "versions": ["1.20", "1.20.1"]},
    {"format": 18, "versions": ["1.20.2"]},
    {"format": 22, "versions": ["1.20.3", "1.20.4"]},
    {"format": 32, "versions": ["1.20.5", "1.20.6"]},
    {"format": 34, "versions": ["1.21", "1.21.1"]},
    {"format": 42, "versions": ["1.21.2", "1.21.3"]},
    {"format": 46, "versions": ["1.21.4"]},
    {"format": 55, "versions": ["1.21.5"]},
    {"format": 63, "versions": ["1.21.6"]},
    {"format": 64, "versions": ["1.21.7", "1.21.8"]},
    {"format": 69.0, "versions": ["1.21.9", "1.21.10"]},
];