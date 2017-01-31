# OpenUI5 Typescript definition parser
Tool to generate typescript definitions for OpenUI5 from the SAP documentation:
  - https://openui5.hana.ondemand.com/test-resources/sap/m/designtime/api.json
  - https://openui5.hana.ondemand.com/test-resources/sap/ui/core/designtime/api.json
  - https://openui5.hana.ondemand.com/test-resources/sap/ui/layout/designtime/api.json
  - https://openui5.hana.ondemand.com/test-resources/sap/ui/unified/designtime/api.json


# Changes from original repo
Fixed some bugs and added interface to the mSettings parameters of controls/classes. Also added a test.js file that
you can use to execute on Visual Studio Code for much easier debugging.


# Usage via gulp (original)
## Install with NPM
```
npm install --save https://github.com/tapsiturbi/openui5-typescript-definition-parser.git
```
## gulp
```
var tsDefParser = require("ts-def-parser");

gulp.task("generate-ts-defs", function () {
    tsDefParser.parseDefinitions({
        outFilePath: "WebContent\\ui5.d.ts"
    });
});
```

# Usage via node
## compile Typescript code (optional)
```
tsc -p .
```

## execute via node
```
node dist/test.js
```
