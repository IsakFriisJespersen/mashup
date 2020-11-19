
const superagent = require('superagent');

const mcache = require('memory-cache');



module.exports = {

    mashup: function (req, res) {
        let mashupData = {"mbid": null, 'description': null, 'albums': null};
        const {mbid} = req.params;
        mashupData['mbid'] = mbid;
        callMusicbrainz(mbid)
            .then(async artistData => {
                const albumData = await Promise.all(artistData.body['release-groups'].map(async function (element) {
                    return await callCoverArtArchive(element.id)
                        .then(coverArt => {
                            let albumData = {
                                'title': element.title,
                                'id': element.id,
                                'image': coverArt.body['images'][0]['image']
                            };
                            return albumData
                        })
                        .catch(err => {
                            let albumData = {
                                'title': element.title,
                                'id': element.id,
                                'image': "Not found"
                            };
                            return albumData
                            //console.log(err.message );
                        })
                }));
                mashupData['albums'] = albumData;
                const wikiFilename = getFilename(artistData.body);
                return callWikidata(wikiFilename)
            })
            .then(result => {
                // Finding the artist name
                const pageKey = Object.keys(result.body['entities']);
                const artistName = result.body['entities'][pageKey]['sitelinks']['enwiki']['title'];
                constencodedArtistName = urlEncode(artistName);
                return callWikipedia(encodedArtistName)
            })
            .then(result => {
                // Finding the description text
                const description = result.body['query']['pages'];
                const pageKey = Object.keys(description);
                const descText = description[pageKey[0]]['extract'];
                mashupData['description'] = descText;
                return mashupData
            })
            .then(mashupData => {
                // Save to cache for 5 min
                mcache.put(mashupData['mbid'], mashupData, 5*60*1000);
                console.log('Data sent successfully');
                res.send(mashupData)
            }).catch(err => {
            console.log(err);
            res.status(422).json({'error': 'No artist found! Try with another mbid '})
        });
    },


    cache: function (req,res,next) {
        const {mbid} = req.params;
        if(mcache.get(mbid)){
            console.log('Data sent from cache');
            res.send(mcache.get(mbid))
        }
        else{next();}
    }
};
//urlEncoder
function urlEncode(str) {
    return encodeURIComponent(str)
}

//filters the data for relevant filename
function getFilename(data) {
    const typeWikidata = data['relations'].filter(key => key.type === "wikidata");
    const wikiUrl = typeWikidata[0]['url']['resource'];
    return filterUrl(wikiUrl);
}

// Retrieving the filename
function filterUrl(url) {
    return url.substring(url.lastIndexOf('/') + 1);
}


function callWikipedia(bandName) {
    const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exi\n" +
        "ntro=true&redirects=true&titles="  +bandName;
    return makeHTTPCall(url)

}

function callWikidata(fileName) {
    const url = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=" + fileName + "&format=json&props=sitelinks";
    return makeHTTPCall(url)
}

function callCoverArtArchive(mbid) {
    const url = "http://coverartarchive.org/release-group/" + mbid;
    return makeHTTPCall(url)
}

function callMusicbrainz(mbid) {
    const url = "http://musicbrainz.org/ws/2/artist/" + mbid + "?&fmt=json&inc=url-rels+release-groups";
    return makeHTTPCall(url)
}

// Using superagent to make a http call
// Identifying the application with User-Agent
async function makeHTTPCall(url) {
    const {body} = await superagent.get(url)
        .set('User-Agent', "Mashup ( isak.friisjespersen@gmail.com)")
        .then((res) => {
            return res
        })
        .catch((err) => {
            //console.log(err);
            return err
        });
    return await {body}
}
