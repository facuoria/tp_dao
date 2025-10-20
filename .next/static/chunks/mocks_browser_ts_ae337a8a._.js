(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/mocks/browser.ts [app-client] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_0d807bea._.js",
  "static/chunks/mocks_24227a7d._.js",
  "static/chunks/mocks_browser_ts_b17ab83e._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/mocks/browser.ts [app-client] (ecmascript)");
    });
});
}),
]);