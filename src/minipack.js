const path = require("path");
const fs = require("fs");
const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const { transformFromAst } = require("babel-core");
const resolve = require('resolve/sync')

let ID = 0;

function createAsset(filename) {
  const content = fs.readFileSync(filename, "utf-8");
//   console.log('resolve',filename ,resolve(filename, {
//     basedir: __filename
//   }));

  const ast = babylon.parse(content, {
    sourceType: "module",
  });
  const dependencies = [];

  const id = ID++;

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
    //   console.log("import", node);
      dependencies.push(node.source.value);
    },
  });

  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });

  console.log("deps", dependencies);

  return {
    code,
    filename: path.resolve(filename),
    id,
    dependencies,
  };
}

function createGraph(entry) {
    const mainAsset = createAsset(entry);

    const queue = [mainAsset];

    for (const asset of queue) {
        asset.mapping = {};

        const dirname = path.dirname(asset.filename);
        console.log('dirname', dirname);
        asset.dependencies.forEach(relativePath => {
            // const absolutPath = path.join(dirname, relativePath);
            const absolutPath = resolve(relativePath, {
                basedir: dirname
            });
            // console.log('abs', absolutPath, dirname, relativePath);
            
            const child = createAsset(absolutPath);

            asset.mapping[relativePath] = child.id;

            queue.push(child);
        })
    }
    return queue;
}

function bundle(graph) {
    let modules = '';
    
    graph.forEach(mod => {
        modules += `${mod.id}: [
           function(require, module, exports) {
               ${mod.code}
           },
           ${JSON.stringify(mod.mapping)}
        ],`
    })

    const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];

        function localRequire(name) {
          return require(mapping[name]);
        }

        const module = { exports : {} };

        fn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({${modules}})
  `;

  return result;
}

module.exports.createGraph = createGraph;
module.exports.bundle = bundle;


