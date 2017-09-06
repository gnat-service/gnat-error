const Loader = require('../lib');
const meta = require('./error.meta.json');
const Errors = [
    require('./snacks-lack-error.json'),
    require('./coffeinism-error.json'),
    require('./lose-my-mind-error.json')
];

/* eslint no-console: off */
const print = err => console.log(JSON.stringify(err));

const {size: defaultSize, bindStack: defaultBindStack} = meta;

const map = {};

// Initialization
try {
    Errors.forEach(({offset, name, size = defaultSize, messages, bindStack = defaultBindStack}) => {
        name = `${name}Error`;
        map[name] = Loader(offset, size, name, bindStack);
        map[name].load(messages);
    });
} catch (e) {
    /* eslint no-console: off */
    console.error(e);
}

/* eslint no-console: off */
console.log('lose-my-mind-error.json is not loaded:', !map.LoseMyMindError);

// Usage
print(map.SnacksLackError.create(1));
print(map.SnacksLackError.create(1000001));
print(map.SnacksLackError.create('NeedChips'));
print(map.SnacksLackError.create('NeedChips', 'Hmmm... the last one piece of chips.'));
print(map.SnacksLackError.create('NeedChips', 'I want more chips', {details: {expect: 'KFC chips'}}));
print(map.SnacksLackError.create(1000000, {details: {os: 'Maybe I am too fat.'}}));
print(map.CoffeinismError.create(999, {msgParams: {doSth: 'drink my coffee'}}));
print(map.CoffeinismError.create('CannotWorkWithoutCoffee', {msgParams: ['shoot my plane']}));

// results
// {"name":"true.NeedCola","errorCode":1000001,"message":"Cola is not found."}
// {"name":"true.NeedCola","errorCode":1000001,"message":"Cola is not found."}
// {"name":"true.NeedChips","errorCode":1000000,"message":"I need some chips for coding."}
// {"name":"true.NeedChips","errorCode":1000000,"message":"Hmmm... the last one piece of chips."}
// {"name":"true.NeedChips","errorCode":1000000,"message":"I want more chips","details":{"expect":"KFC chips"}}
/* eslint max-len: off */
// {"name":"true.NeedChips","errorCode":1000000,"message":"I need some chips for coding.","details":{"os":"Maybe I am too fat."}}
// {"name":"true.CannotWorkWithoutCoffee","errorCode":1001999,"message":"Let me go to cafe, so I can drink my coffee!"}
// {"name":"true.CannotWorkWithoutCoffee","errorCode":1001999,"message":"Let me go to cafe, so I can shoot my plane!"}
