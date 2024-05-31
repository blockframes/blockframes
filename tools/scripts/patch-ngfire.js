const fs = require("fs");
const f = 'node_modules/ngfire/firestore/query.d.ts';
// Updates ngfire/firestore/query.d.ts to work with latest version of firebase
fs.readFile(f, "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(
    "import type { OrderBy, FieldFilter } from '@firebase/firestore/dist/firestore/src/core/target';",
    "import type { OrderBy } from '@firebase/firestore/dist/lite/firestore/src/core/order_by';import type { FieldFilter } from '@firebase/firestore/dist/lite/firestore/src/core/filter';"
  );

  fs.writeFile(f, result, "utf8", function (err) {
    if (err) return console.log(err);
  });
});
