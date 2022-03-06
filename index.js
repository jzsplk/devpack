// import {createGraph, bundle} from './src/minipack'
const {createGraph,bundle} = require('./src/minipack')

const graph = createGraph('./example/index.js');

const res = bundle(graph);

console.log('result', res);