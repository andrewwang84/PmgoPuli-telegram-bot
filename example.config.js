module.exports = {
    /*
     * An array of pokemonId that will be filtered
     * Disable the filter if null is set
     */
    filteredPokemonIds: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        12,
        15,
        18,
        22,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        36,
        37,
        38,
        40,
        42,
        44,
        45,
        47,
        49,
        50,
        51,
        52,
        53,
        55,
        56,
        57,
        58,
        59,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        117,
        119,
        121,
        123,
        124,
        125,
        126,
        127,
        130,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        139,
        140,
        141,
        142,
        143,
        147,
        148,
        149
    ],

    /*
     * PoekRadar userId
     * Receive data from all users if null is set
     */
    trustedUserId: '13661365',

    /*
     * The range of the scanner
     */
    minLatitude: 23.9315047837839,
    maxLatitude: 24.0099328416972,
    minLongitude: 120.905570983887,
    maxLongitude: 121.008224487305,

    /*
     * The interval of querying PokeRadar API (milliseconds)
     */
    queryInterval: 1000,

    /*
     * Telegram bot access token
     */
    telegramBotToken: null

    /*
     * Telegram group chatId
     * This could be obtained from https://api.telegram.org/bot<YourBOTToken>/getUpdates
     */
    telegramChatId: null

    /*
     * Telegram bot switch
     */
    telegramBotEnable: true
};