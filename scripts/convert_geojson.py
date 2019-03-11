import shapefile
import csv,json

# read the shapefile
def import_tracts(fname):
    reader = shapefile.Reader(fname)
    fields = reader.fields[1:]
    field_names = [field[0] for field in fields]
    geojson = []
    for sr in reader.shapeRecords():
        atr = dict(zip(field_names, sr.record))
        geom = sr.shape.__geo_interface__
        geojson.append(dict(type="Feature", \
            geometry=geom, properties=atr)) 
    return geojson

def update_tracts( tracts, fname ):
    reader = csv.DictReader( open(fname) )
    
    tract_rasp = {}      
    for r in reader:
        tract_rasp.setdefault( r["geoid"], [] )
        tract_rasp[r["geoid"]].append(r)

    for t in tracts:
        geoid = t["properties"]["AFFGEOID"]
        if geoid in tract_rasp:
            t["properties"]["rasp"] = tract_rasp[geoid]

def output_geojson(    geojson, fname ):
    geojson_f = open(fname, "w")
    geojson_f.write(
        json.dumps({
            "type": "FeatureCollection", 
            "features": geojson
        }, indent=2))
    geojson_f.close()

if __name__=="__main__":
    tracts = import_tracts("data/cb_2017_06_tract_500k.shp")
    update_tracts(tracts,"rasp_tracts_sd.csv")
    output_geojson( tracts, "tracts.json" )

