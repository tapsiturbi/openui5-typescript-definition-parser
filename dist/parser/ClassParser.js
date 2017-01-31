"use strict";
const util_1 = require("../util");
const PropertyParser_1 = require("./PropertyParser");
const MethodParser_1 = require("./MethodParser");
const InterfaceParser_1 = require("./InterfaceParser");
class ClassParser {
    constructor(writer, classSymbol, namespacePrefix) {
        this.writer = writer;
        this.classSymbol = classSymbol;
        this.namespacePrefix = namespacePrefix;
    }
    getNestedNamespaceName() {
        let nestedNamespaceName = this.classSymbol.name.substring(0, this.classSymbol.name.length - this.classSymbol.basename.length - 1);
        return nestedNamespaceName;
    }
    generate() {
        let nestedNamespaceName = null;
        if (this.getNestedNamespaceName() !== this.namespacePrefix && this.classSymbol.name !== this.namespacePrefix) {
            nestedNamespaceName = this.classSymbol.name.substring(this.namespacePrefix.length + 1);
            nestedNamespaceName = nestedNamespaceName.substring(0, nestedNamespaceName.length - this.classSymbol.basename.length - 1);
            this.writer.writeLine("declare namespace " + nestedNamespaceName + "{");
            this.writer.increaseIndent();
        }
        // declare the mSettings interface to use for this class' constructor
        let hasSettingsInterface = false;
        if (this.classSymbol.hasOwnProperty("ui5-metadata") && this.classSymbol.constructor && this.classSymbol.constructor.parameters) {
            let oUI5Meta = this.classSymbol["ui5-metadata"];
            if (oUI5Meta.properties && oUI5Meta.properties.length) {
                let oProps = oUI5Meta.properties;
                for (let p = 0; p < oProps.length; p++) {
                    oProps[p].visibility = "";
                }
                let oInterface = new InterfaceParser_1.InterfaceParser(this.writer, {
                    kind: "interface",
                    name: this.classSymbol.name + "_mSettings",
                    basename: this.classSymbol.basename + "_mSettings",
                    static: true,
                    visibility: "public",
                    description: "The UI5 metadata interface of the class " + this.classSymbol.name + ".",
                    properties: oProps
                }, this.namespacePrefix);
                oInterface.generate();
                hasSettingsInterface = true;
            }
        }
        this.writer.openBlockComment();
        this.writer.writeTsDocComment(this.classSymbol.description);
        this.writer.writeTsDocComment("@resource " + this.classSymbol.resource);
        this.writer.closeBlockComment();
        let extendsModifier = "";
        if (this.classSymbol.extends) {
            let e = this.classSymbol.extends;
            if (e === "sap.ui.core.Toolbar") {
                e = "sap.m.Toolbar";
            }
            extendsModifier = " extends " + e;
        }
        let abstractModifier = "";
        if (this.classSymbol.abstract || this.classSymbol.basename === "MultiComboBox") {
            abstractModifier = "abstract ";
        }
        this.writer.writeLine("export " + abstractModifier + "class " + this.classSymbol.basename + extendsModifier + " {");
        this.writer.increaseIndent();
        if (this.classSymbol.properties) {
            for (let property of this.classSymbol.properties) {
                let propertyParser = new PropertyParser_1.PropertyParser(this.writer, property, this.classSymbol);
                propertyParser.generate();
            }
        }
        this.writer.newLine();
        this.writer.newLine();
        if (this.classSymbol.constructor && this.classSymbol.constructor.visibility === "public") {
            if (this.classSymbol.constructor.description) {
                this.writer.openBlockComment();
                this.writer.writeTsDocComment(this.classSymbol.constructor.description);
                if (this.classSymbol.constructor.parameters) {
                    for (let constructorParam of this.classSymbol.constructor.parameters) {
                        this.writer.writeTsDocComment("@param " + constructorParam.name + " " + constructorParam.description);
                    }
                }
                this.writer.closeBlockComment();
            }
            if (hasSettingsInterface) {
                // change the mSettings parameter type to the interface that we created
                let mSettingsParam = this.classSymbol.constructor.parameters.filter((param) => { return param.name == "mSettings"; })[0];
                if (mSettingsParam)
                    mSettingsParam.type = this.classSymbol.basename + "_mSettings";
                this.writer.writeLine("constructor(" + util_1.ParamParser.parseParams(this.classSymbol.constructor.parameters) + ");");
            }
            else {
                this.writer.writeLine("constructor(" + util_1.ParamParser.parseParams(this.classSymbol.constructor.parameters) + ");");
            }
        }
        this.writer.newLine();
        this.writer.newLine();
        if (this.classSymbol.methods) {
            for (let method of this.classSymbol.methods) {
                // TypeUtil._excludedClassMethods
                if (util_1.TypeUtil._excludedClassMethods && util_1.TypeUtil._excludedClassMethods.filter((cm) => { return cm.className == this.classSymbol.name && cm.methodName == method.name; }).length) {
                    console.log("-- skipping class method: " + this.classSymbol.name + " -> " + method.name);
                }
                else {
                    let methodParser = new MethodParser_1.MethodParser(this.writer, method, this.classSymbol);
                    methodParser.generate();
                }
            }
        }
        this.writer.decreaseIndent();
        this.writer.writeLine("}");
        if (nestedNamespaceName) {
            this.writer.decreaseIndent();
            this.writer.writeLine("}");
        }
    }
}
exports.ClassParser = ClassParser;
//# sourceMappingURL=ClassParser.js.map