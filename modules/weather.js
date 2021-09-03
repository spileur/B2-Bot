'use strict';

var request = require('request'),
    qs      = require('querystring'),
    xml2JS  = require('xml2js');

// Init the module
module.exports = (function() {

    var xmlParser     = new xml2JS.Parser({charkey: 'C$', attrkey: 'A$', explicitArray: true}),
        defLang       = 'fr-FR',
        defDegreeType = 'C',
        defTimeout    = 10000,
        findUrl       = 'http://weather.service.msn.com/find.aspx';

    var find = function find(options) {

        if(!options || typeof options !== 'object')
            return new Promise((success, error) => error('invalid options'));

        if(!options.search)
            return new Promise((success, error) => error('missing search input'));

        var result     = [],
            lang       = options.lang || defLang,
            degreeType = options.degreeType || defDegreeType,
            timeout    = options.timeout || defTimeout,
            search     = qs.escape(''+options.search),
            reqUrl     = findUrl + '?src=outlook&weadegreetype=' + (''+degreeType) + '&culture=' + (''+lang) + '&weasearchstr=' + search;

        return new Promise((success, error) => {
            request.get({url: reqUrl, timeout: timeout}, function(err, res, body) {

                if(err)                    return error(err);
                if(res.statusCode !== 200) return error('request failed (' + res.statusCode + ')');
                if(!body)                  return error('failed to get body content');
    
                // Check body content
                if(body.indexOf('<') !== 0) {
                    if(body.search(/not found/i) !== -1) {
                        return success(result);
                    }
                    return error('invalid body content');
                }
    
                // Parse body
                xmlParser.parseString(body, function(err, resultJSON) {
                    if(err) return error(err);
    
                    if(!resultJSON || !resultJSON.weatherdata || !resultJSON.weatherdata.weather)
                        return error('failed to parse weather data');
    
                    if(resultJSON.weatherdata.weather['A$'] && resultJSON.weatherdata.weather['A$'].errormessage)
                        return error(resultJSON.weatherdata.weather['A$'].errormessage);
    
                    if(!(resultJSON.weatherdata.weather instanceof Array)) {
                        return error('missing weather info');
                    }
    
                    // Iterate over weather data
                    var weatherLen = resultJSON.weatherdata.weather.length,
                        weatherItem;
                    for(var i = 0; i < weatherLen; i++) {
    
                        if(typeof resultJSON.weatherdata.weather[i]['A$'] !== 'object')
                            continue;
    
                        // Init weather item
                        weatherItem = {
                            location: {
                                name: resultJSON.weatherdata.weather[i]['A$']['weatherlocationname'],
                                zipcode: resultJSON.weatherdata.weather[i]['A$']['zipcode'],
                                lat: resultJSON.weatherdata.weather[i]['A$']['lat'],
                                long: resultJSON.weatherdata.weather[i]['A$']['long'],
                                timezone: resultJSON.weatherdata.weather[i]['A$']['timezone'],
                                alert: resultJSON.weatherdata.weather[i]['A$']['alert'],
                                degreetype: resultJSON.weatherdata.weather[i]['A$']['degreetype'],
                                imagerelativeurl: resultJSON.weatherdata.weather[i]['A$']['imagerelativeurl']
                                //url: resultJSON.weatherdata.weather[i]['A$']['url'],
                                //code: resultJSON.weatherdata.weather[i]['A$']['weatherlocationcode'],
                                //entityid: resultJSON.weatherdata.weather[i]['A$']['entityid'],
                                //encodedlocationname: resultJSON.weatherdata.weather[i]['A$']['encodedlocationname']
                            },
                            current: null,
                            forecast: null
                        };
    
                        if(resultJSON.weatherdata.weather[i]['current'] instanceof Array && resultJSON.weatherdata.weather[i]['current'].length > 0) {
                            if(typeof resultJSON.weatherdata.weather[i]['current'][0]['A$'] === 'object') {
                                weatherItem.current = resultJSON.weatherdata.weather[i]['current'][0]['A$'];
    
                                weatherItem.current.imageUrl = weatherItem.location.imagerelativeurl + 'law/' + weatherItem.current.skycode + '.gif';
                            }
                        }
    
                        if(resultJSON.weatherdata.weather[i]['forecast'] instanceof Array) {
                            weatherItem.forecast = [];
                            for(var k = 0; k < resultJSON.weatherdata.weather[i]['forecast'].length; k++) {
                                if(typeof resultJSON.weatherdata.weather[i]['forecast'][k]['A$'] === 'object')
                                    weatherItem.forecast.push(resultJSON.weatherdata.weather[i]['forecast'][k]['A$']);
                            }
                        }
    
                        // Push weather item into result
                        result.push(weatherItem);
                    }
    
                    return success(result);
                });
            });
        });
    };

    return {
        find: find
    };
})();