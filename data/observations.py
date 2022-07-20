import json
import pyproj

data = {'species': {}, 'camera_sites': {}, 'groups': {'predator': [], 'prey': [], 'other': []}}

f = open('Serengeti-data-20220713.csv', 'r')
header = f.readline()[:-1].replace('.', ' ').split(',')

transformer = pyproj.Transformer.from_crs(21036, 4326)

while True:
    line = f.readline()
    if not line:
        break
    # remove new line
    line = line[:-1]
    parts = line.split(',')
    key = parts[header.index('Species')]
    if key not in data['species']:
        data['species'][key] = {'total': 0, 'camera': {}}
        data['groups'][parts[header.index('Predator')]].append(key)
    camera = parts[header.index('Camera Site')]
    if camera not in data['camera_sites']:
        coor = transformer.transform(int(parts[header.index('Longitude  m ')]), int(parts[header.index('Latitude  m ')]))
        # Making asumption that site ids are unique and coordinates are accurate and the same throughout the data
        data['camera_sites'][camera] = {'latitude': coor[1], 'longitude': coor[0]}
    if camera not in data['species'][key]['camera']:
        data['species'][key]['camera'][camera] = 0
    data['species'][key]['total'] += 1
    data['species'][key]['camera'][camera] += 1

data['groups']['predator'].sort()
data['groups']['prey'].sort()
data['groups']['other'].sort()

f.close()
f = open('observations.json', 'w')
json.dump(data, f)
f.close()
