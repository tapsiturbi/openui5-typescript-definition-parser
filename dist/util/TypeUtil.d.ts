export interface TypeConfig {
    ignoredTypes: string[];
    typeMapping: {
        [id: string]: string;
    };
}
export interface ClassMethod {
    className: string;
    methodName: string;
}
export declare class TypeUtil {
    static namespaces: string[];
    static _config: TypeConfig;
    static _excludedClassMethods: ClassMethod[];
    static sapUiTypeToTSType(type: string): any;
}
