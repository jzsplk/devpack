// import {createGraph, bundle} from './src/minipack'
const {createGraph,bundle} = require('./src/minipack')
const fs = require('fs');

const graph = createGraph('./example/index.js');

const res = bundle(graph);

fs.mkdirSync('./dist');
fs.writeFile('./dist/bundle.js', res, (res) => {
    console.log('write bundle file res', res)
})

console.log('result', res);