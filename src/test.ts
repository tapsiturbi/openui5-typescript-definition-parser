import * as app from './app';

app.parseDefinitions({
    outFilePath: "output/ui5.d.ts",
    // excludedNamespaces: ["sap.ui.test"]
    // namespaces?: string[];
    // outFilePath?: string;
    // methodExceptionsFile?: string;
    // typeConfigFile?: string;
});

