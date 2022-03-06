import {abs} from './calc';

const sum = (a, b) => {
    return a + abs(b)
}

module.exports.sum = sum;