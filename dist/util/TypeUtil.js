"use strict";
class TypeUtil {
    static sapUiTypeToTSType(type) {
        let parts;
        if (type.indexOf("|") > 0) {
            return "any";
        }
        else {
            parts = [type];
        }
        return parts.map((part) => {
            if (!this.namespaces.length) {
                throw "no namespaces defined";
            }
            let arrayRegex = new RegExp("^[Aa]rray\\((.*)\\)$");
            if (arrayRegex.exec(part)) {
                return arrayRegex.exec(part)[1] + "[]";
            }
            let isNamespace = this.namespaces.filter((e) => e.trim().toLowerCase().endsWith(part.trim().toLowerCase())).length > 0;
            if (this._config.ignoredTypes.indexOf(part) > -1) {
                return "any";
            }
            if (this._config.ignoredTypes.indexOf(part.replace("[]", "")) > -1) {
                return "any[]";
            }
            // if (isNamespace) {
            //     return "typeof " + part;
            // }
            if (part.indexOf("jQuery") === 0) {
                return "any";
            }
            var matchingTypes = Object.keys(this._config.typeMapping).filter((e) => {
                return e === part;
            });
            if (matchingTypes.length > 1) {
                throw "Found multiple matching types for \"" + part + "\": " + JSON.stringify(matchingTypes);
            }
            if (matchingTypes.length === 1) {
                return this._config.typeMapping[matchingTypes[0]];
            }
            if (isNamespace) {
                return "typeof " + part;
            }
            return part;
        }).reduce((a, b) => {
            return a + "|" + b;
        });
    }
}
exports.TypeUtil = TypeUtil;
//# sourceMappingURL=TypeUtil.js.map