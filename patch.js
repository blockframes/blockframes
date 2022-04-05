/**
 * TODO #7273
 * Temporary fix to prevent errors like :
 * 
 * Module not found: Error: Can't resolve 'blockframes/node_modules/@babel/runtime/helpers/esm/slicedToArray' in 'blockframes/node_modules/@firebase/functions-compat/node_modules/@firebase/component/dist/esm'
 * Did you mean 'slicedToArray.js'?
 * BREAKING CHANGE: The request 'blockframes/node_modules/@babel/runtime/helpers/esm/slicedToArray' failed to resolve only because it was resolved as fully specified
 * (probably because the origin is a '*.mjs' file or a '*.js' file where the package.json contains '"type": "module"').
 * The extension in the request is mandatory for it to be fully specified.
 * Add the extension to the request.
 * 
 * Once solved, remove this patch from "postinstall" in package.json
 * 
 * @see https://github.com/graphql/graphql-js/issues/2721#issuecomment-723008284
 * @see https://github.com/buu700/angular-cli/commit/eb02e7be68e55fef5f4341812f733677f8d3f8bb
 */

const fs = require('fs');
const f = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/common.js';

fs.readFile(f, 'utf8', function (err, data) {
  if (err) return console.log(err);

  const result = data.replace(/test: \/\\.\[cm\]\?js\$\|\\.tsx\?\$\/,\n/g, 'test: /\\.[cm]?js$|\\.tsx?$/,resolve: { fullySpecified: false },\n');
  
  fs.writeFile(f, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
