declare module "js-yaml" {
  interface LoadOptions {
    filename?: string;
    json?: boolean;
    onWarning?: (warning: Error) => void;
    schema?: unknown;
  }

  interface DumpOptions {
    flowLevel?: number;
    forceQuotes?: boolean;
    indent?: number;
    lineWidth?: number;
    noArrayIndent?: boolean;
    noCompatMode?: boolean;
    noRefs?: boolean;
    quotingType?: '"' | "'";
    schema?: unknown;
    skipInvalid?: boolean;
    sortKeys?: boolean | ((a: string, b: string) => number);
    styles?: Record<string, unknown>;
  }

  export function load(yaml: string, options?: LoadOptions): unknown;
  export function dump(value: unknown, options?: DumpOptions): string;
}
