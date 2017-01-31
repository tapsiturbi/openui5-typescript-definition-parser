import { ClassMethod } from './util';
export interface ConfigDef {
    namespaces?: string[];
    outFilePath?: string;
    methodExceptionsFile?: string;
    typeConfigFile?: string;
    excludedNamespaces?: string[];
    excludedClassMethods?: ClassMethod[];
}
export declare function parseDefinitions(config: ConfigDef): void;
