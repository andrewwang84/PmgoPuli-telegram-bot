#!/usr/bin/env node
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const moment = require('moment');
const _ = require('lodash');
const errors = require('request-promise/errors');

const args = require('./args.js');
const config = _.assign({
    filteredPokemonIds: null,
    trustedUserId: null,
    minLatitude: 23.9315047837839,
    maxLatitude: 24.0099328416972,
    minLongitude: 120.905570983887,
    maxLongitude: 121.008224487305,
    queryInterval: 1000,
    telegramChatId: null,
    telegramBotToken: null,
    telegramBotEnable: false
}, require(path.resolve(args.config)));
const telegramBot = require('./telegram_bot.js')(config);
const pokemonNames = require('./pokemon_names.js');
const pokemonStickers = require('./stickers.js');
const getReverseGeocode = require('./get_reverse_geocode.js');

var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.send('it is running\n');
}).listen(process.env.PORT || 5000);

const ttl = 15 * 60;
const getQueryString = (obj) => '?' + Object.keys(obj).map((k) => k + '=' + obj[k]).join('&');

let filteredPokemonIds = config.filteredPokemonIds ? config.filteredPokemonIds.sort((a,b) => a-b) : null;
let sentPokemons = [];

const url = 'https://www.pokeradar.io/api/v1/submissions';
const processData = function(body) {
    let entries = JSON.parse(body).data;
    let filtered = _.filter(entries, function(o) {
        if (config.trustedUserId && o.userId != config.trustedUserId) {
            return false;
        }
        if (filteredPokemonIds && _.sortedIndexOf(filteredPokemonIds, o.pokemonId) == -1) {
            return false;
        }
        return true;
    });
    let processed = filtered.map((entry_) => {
        let entry = _.cloneDeep(entry_);
        let secs = entry.created + ttl - moment().unix();
        entry.pokemonName = pokemonNames[entry.pokemonId];
        entry.remainingTime = moment.utc(0).seconds(secs);
        entry.until = moment.utc().add(8, 'h').seconds(secs);
        entry.direction = 'https://www.google.com/maps/dir/Current+Location/' + entry.latitude + ',' + entry.longitude;
        entry.realId = `${entry.pokemonId}-${entry.created}`;
        return entry;
    });
    sentPokemons = _.filter(sentPokemons, (o) => o.expires > moment().unix());
    let promise = Promise.resolve();
    processed.forEach(function(v, k) {
        if (!_.find(sentPokemons, (o) => o.realId == v.realId) && v.remainingTime.diff(moment.utc(0)) > 0) {
            let message = '';
            promise = promise.then(() => getReverseGeocode(v.latitude, v.longitude)).then(function(reverseGeocode) {
            	/*var starttime=moment.utc();
            	var tmptime=moment.utc(starttime).add(8, 'h');
            	var utime=moment.utc(tmptime).add('v.remainingTime');*/
                message = `#${v.pokemonName.zh} (${reverseGeocode.map((x) => '#' + x).join(' ')} #${v.pokemonName.en} #${v.pokemonId})\n`
                    + `導航: ${v.direction}\n`
                    + `剩餘時間: ${v.remainingTime.format('mm:ss')}\n`
                    + `結束於: ${v.until.format('YYYY-MM-DD HH:mm:ss')}`;
                console.log(moment().format(), 'message:', message);
            });
            if (config.telegramBotEnable && telegramBot && config.telegramChatId) {
                promise = promise
                    .then(() => telegramBot.sendSticker(config.telegramChatId, pokemonStickers[v.pokemonId]))
                    .then(() => telegramBot.sendMessage(config.telegramChatId, message))
                    .then(() => telegramBot.sendLocation(config.telegramChatId, v.latitude, v.longitude))
                    .catch(function(err) {
                        console.error(moment().format(), err.message);
                    })
            }
            sentPokemons.push({
                realId: v.realId,
                expires: v.created + ttl
            });
        }
    });
    return promise;
}

request
    .post('https://www.pokeradar.io/api/v1/users')
    .then(function(body) {
        const deviceId = JSON.parse(body).data.deviceId;
        return deviceId;
    })
    .then(function(deviceId) {
        const query = {
            deviceId: deviceId,
            minLatitude: config.minLatitude,
            maxLatitude: config.maxLatitude,
            minLongitude: config.minLongitude,
            maxLongitude: config.maxLongitude,
            pokemonId: 0
        };
        const queryString = getQueryString(query);

        function requestLoop() {
            return request(url + queryString)
                .then(processData)
                .catch(errors.StatusCodeError, function (reason) {
                    console.error(moment().format(), reason.message);
                })
                .catch(errors.RequestError, function (reason) {
                    console.error(moment().format(), reason.message);
                })
                .delay(config.queryInterval)
                .then(requestLoop);
        }
        return requestLoop();
    });
