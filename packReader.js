function readPackZip(pack) {
    var new_zip = new JSZip();
    new_zip.loadAsync(pack)
    .then(function(zip) {
        zip.file("pack.mcmeta").async("string").then(function(file) {
            // TODO: make this actually do something
        });
        // TODO: read all other files
    });
}