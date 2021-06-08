import xml2js from 'xml2js';

var parseString = xml2js.parseString;

function parseXml(xml) {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export async function testXmlParse(xml) {
    try {
        let result = await parseXml(xml);
        // Now that you have the result you can do further processing, write to file etc.
        // processResult(result);
        // console.log(result);
        return(result)
    } catch (err) {
        console.error("parseXml failed: ", err);
    }
}