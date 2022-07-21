let obsData = {};
let obsSpeciesList = null;


const obsMap = L.map('ObsLocationsMap', {
    center: [-2.5, 34.9],
    zoom: 11
});

const googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(obsMap);

let obsLayer = L.layerGroup();
obsLayer.addTo(obsMap);

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
        Object.keys(obsData.camera_sites).sort().forEach( (camera) => {
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

    obsLayer.clearLayers();
    let max = Math.max(...y);
    for(let i = 0; i < x.length; i++){
        let site = obsData.camera_sites[x[i]];
        let marker = L.circle([site.longitude, site.latitude], {radius: (y[i] / max ) * 1500, color: 'red', weight: 2})
        marker.bindPopup(`Camera Site: ${x[i]}<br/><br/>Image Count: ${y[i]} `, {
            closeButton: true
          });
        obsLayer.addLayer(marker);
    }
}

const obsClearList = () => {
    obsSpeciesList.set(['']);
}

// Quick load helper
const obsQuickLoad = (key) => {
    obsSpeciesList.set(obsData.groups[key]);
}