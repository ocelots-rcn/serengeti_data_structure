let obsData = {};
let obsSpeciesList = null;

axios.get('../data/observations.json').then((response) => {
    obsData = response.data;
    // Populate selection list
    let species = document.getElementById('ObsSpecies');
    Object.keys(obsData.species).sort().forEach( (val) => {
        let newOption = new Option(val, val);
        species.add(newOption,undefined);
    });

    obsSpeciesList = new SlimSelect({
        select: '#ObsSpecies'
    });

    // Needs a little delay
    setTimeout(() => {obsSpeciesList.set(obsData.groups['predator'])}, 500);
});

// Update graph when selections changes
const obsPlot = () => {
    let selected = obsSpeciesList.selected();
    let x = [];
    let y = [];

    if(selected.length > 0) {
        selected.forEach( (species) => {
            x.push(species);
            y.push(obsData.species[species].total);
        });
    }
    Plotly.newPlot('ObsSpeciesPlot', [{x: x, y: y, type: 'bar'}], { yaxis: {title: 'Images Camptured'}, xaxis: {title: 'Species'}}, {responsive: true});

    x = [];
    y = [];
    if(selected.length > 0) {
        obsData.camera_sites.forEach( (camera) => {
            x.push(camera);
            let total = 0;
            selected.forEach( (species) => {
                if(obsData.species[species].camera.hasOwnProperty(camera))
                    total += obsData.species[species].camera[camera];
            });
            y.push(total);
        })
    }
    Plotly.newPlot('ObsCameraPlot', [{x: x, y: y, type: 'bar'}], {yaxis: {title: 'Images Camptured'}, xaxis: {title: 'Camera Site'}}, {responsive: true});
}

const obsClearList = () => {
    obsSpeciesList.set(['']);
}

// Quick load helper
const obsQuickLoad = (key) => {
    obsSpeciesList.set(obsData.groups[key]);
}