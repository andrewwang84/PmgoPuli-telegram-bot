const _ = require('lodash');
const qs = require('qs');
const request = require('request-promise');
const moment = require('moment');
const Provider = require('./provider.js');
const pokemonNames = require('../pokemon_names.js');

class GoRadar extends Provider {
    constructor(config) {
        super(config);
        this._url = 'https://stop_fucking_with_us.goradar.io/raw_data'
        this._filteredPokemonIds = config.filteredPokemonIds ? config.filteredPokemonIds.sort((a,b) => a-b) : null;
    }

    init() {
        return Promise.resolve();
    }

    getPokemons() {
        const query = {
            swLat: this._config.minLatitude,
            swLng: this._config.minLongitude,
            neLat: this._config.maxLatitude,
            neLng: this._config.maxLongitude,
            pokemon: true,
            pokestops: false,
            gym: false
        };
        const queryString = '?' + qs.stringify(query);

        return request(this._url + queryString).then(this._processData.bind(this));
    }

    _processData(body) {
        let pokemons = [];
        let entries = JSON.parse(body).pokemons;
        let filtered = _.filter(entries, (o) => {
            if (this._filteredPokemonIds && _.sortedIndexOf(this._filteredPokemonIds, o.pokemon_id) == -1) {
                return false;
            }
            return true;
        });
        let processed = filtered.map((entry) => {
            return {
                pokemonId: entry.pokemon_id,
                latitude: entry.latitude,
                longitude: entry.longitude,
                pokemonName: pokemonNames[entry.pokemon_id],
                remainingTime: moment.utc(moment(entry.disappear_time).diff(moment())),
                until: moment.utc(entry.disappear_time).add(8,'h'),
                direction: 'https://www.google.com/maps/dir/Current+Location/' + entry.latitude + ',' + entry.longitude,
                uniqueId: `${entry.pokemon_id}-${entry.disappear_time}`,
            };
        });
        return processed;
    }
}

module.exports = GoRadar;
