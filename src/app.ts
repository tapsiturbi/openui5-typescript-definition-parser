declare function require(name: string);
import {get} from 'https';
import {NamespaceParser, ClassParser, LibraryParser, MethodParser} from "./parser"
import {TypeUtil, ClassMethod} from './util';
import {IndentedOutputWriter} from './util';
import {readFileSync} from 'fs';


export interface ConfigDef {
    namespaces?: string[];
    outFilePath?: string;
    methodExceptionsFile?: string;
    typeConfigFile?: string;
    excludedNamespaces?: string[],
    excludedClassMethods?: ClassMethod[]
}

export function parseDefinitions(config: ConfigDef) {
    if (!config) {
        config = {};
    }
    if (!config.namespaces) {
        config.namespaces = [
            "sap.m",
            "sap.ui.core",
            "sap.ui.layout",
            "sap.ui.unified"
        ]
    }
    if ( !config.excludedNamespaces ) {
        config.excludedNamespaces = ["sap.ui.test"];
    }
    if ( !config.excludedClassMethods ) {
        config.excludedClassMethods = [
            { className: "sap.ui.core.mvc.XMLView", methodName: "registerPreprocessor" },
            { className: "sap.ui.core.UIArea", methodName: "getBindingContext" },
            { className: "sap.ui.model.odata.v2.ODataTreeBinding", methodName: "sort" },
            { className: "sap.ui.model.analytics.AnalyticalBinding", methodName: "sort" }
        ];
    }
    if (!config.outFilePath) {
        config.outFilePath = pathJoin(["output", "ui5"], "\\") + ".d.ts";
    }

    if (!config.methodExceptionsFile) {
        config.methodExceptionsFile = 'parse-configurations/MethodExceptions.json'
    }

    if (!config.typeConfigFile) {
        config.typeConfigFile = "parse-configurations/TypeConfig.json"
    }

    TypeUtil._config = JSON.parse(readFileSync(config.typeConfigFile, 'utf-8'));
    TypeUtil._excludedClassMethods = config.excludedClassMethods;
    MethodParser._exceptions = JSON.parse(readFileSync(config.methodExceptionsFile, 'utf-8'));

    let libs: ts_gen.api.RootObject[] = [];
    function pathJoin(parts: string[], sep?: string) {
        var separator = sep || '/';
        var replace = new RegExp(separator + '{1,}', 'g');
        return parts.join(separator).replace(replace, separator);
    }

    for (let ns of config.namespaces) {
        let namespaceWithSlashes = ns.replace(/\./g, "/");
        let namespaceNames: string[] = [];



        get("https://openui5.hana.ondemand.com/test-resources/" + namespaceWithSlashes + "/designtime/api.json", (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                console.log("JSON Definition for namespace " + ns + " loaded.");
                let rootObj = JSON.parse(body);
                libs.push(rootObj);
                console.log(libs.length + "   " + config.namespaces.length)
                if (libs.length === config.namespaces.length) {

                    let allSymbols: ts_gen.api.Symbol[] = []
                    console.log("all downloads complete, starting compilation...")
                    for (let lib of libs) {
                        let filteredSymbols: ts_gen.api.Symbol[];
                        // skip classes/namespaces that are under test
                        if ( config.excludedNamespaces && config.excludedNamespaces.length ) {
                            let toSkipSymbols: ts_gen.api.Symbol[] = [];

                            // let filteredSymbols = config.excludedNamespaces.filter( (ns) => { return lib.symbols.filter((sym) => { return sym.name.startsWith(ns); }).length; } ).length
                            filteredSymbols = lib.symbols.filter((sym) => {
                                for(let ns = 0; ns < config.excludedNamespaces.length; ns++) {
                                    if ( sym.name.startsWith(config.excludedNamespaces[ns]) ) {
                                        toSkipSymbols.push(sym);
                                        return false;
                                    }
                                }
                                return true;
                            });
                            if ( toSkipSymbols && toSkipSymbols.length )
                                console.log("-- skipping: " + toSkipSymbols.map((sym) => sym.name).join(", "));

                        } else {
                            filteredSymbols = lib.symbols;
                        }

                        namespaceNames = namespaceNames.concat(filteredSymbols.filter((s) => {
                            return s.kind === "namespace";
                        }).map((symbol) => symbol.name));

                        allSymbols = allSymbols.concat(filteredSymbols);

                    }
                    console.log("Using namespaces: " + namespaceNames)
                    TypeUtil.namespaces = namespaceNames;



                    let namespaces: ts_gen.api.Symbol[] = allSymbols.filter((s) => {
                        return s.kind === "namespace";
                    });

                    for (let symbol of allSymbols) {
                        if (symbol.kind !== "namespace") {
                            let classParser = new ClassParser(null, symbol, null)
                            let matchingNamespaces = namespaces.filter((e) => e.name === classParser.getNestedNamespaceName());
                            if (!matchingNamespaces.length) {
                                let namespace = <ts_gen.api.Symbol>{
                                    kind: "namespace",
                                    name: classParser.getNestedNamespaceName(),
                                    basename: classParser.getNestedNamespaceName().substring(classParser.getNestedNamespaceName().lastIndexOf(".") + 1),
                                    resource: "",
                                    module: classParser.getNestedNamespaceName().substring(0, classParser.getNestedNamespaceName().lastIndexOf(".")),
                                    static: true,
                                    visibility: "public",
                                    description: "",
                                    properties: undefined,
                                    methods: undefined,
                                };
                                namespaces.push(namespace);
                                allSymbols.push(namespace);
                            }
                        }

                    }

                    let symbolsSortedByLength = allSymbols.sort((a, b) => {
                        return a.name.length - b.name.length;
                    });

                    namespaces = namespaces.sort((a, b) => {
                        return a.name.length - b.name.length;
                    });

                    let j = 0;

                    let writer = new IndentedOutputWriter(config.outFilePath)
                    new LibraryParser(writer, symbolsSortedByLength, namespaces).generate()
                }

            });
        });
    }
}