/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/upload-images/route";
exports.ids = ["app/api/upload-images/route"];
exports.modules = {

/***/ "(ssr)/./node_modules/@supabase/realtime-js/dist/main sync recursive":
/*!************************************************************!*\
  !*** ./node_modules/@supabase/realtime-js/dist/main/ sync ***!
  \************************************************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "(ssr)/./node_modules/@supabase/realtime-js/dist/main sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload-images%2Froute&page=%2Fapi%2Fupload-images%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload-images%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload-images%2Froute&page=%2Fapi%2Fupload-images%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload-images%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_node_polyfill_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/node-polyfill-headers */ \"(rsc)/./node_modules/next/dist/server/node-polyfill-headers.js\");\n/* harmony import */ var next_dist_server_node_polyfill_headers__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_node_polyfill_headers__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var _home_project_app_api_upload_images_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/upload-images/route.ts */ \"(rsc)/./app/api/upload-images/route.ts\");\n\n// @ts-ignore this need to be imported from next/dist to be external\n\n\n// @ts-expect-error - replaced by webpack/turbopack loader\n\nconst AppRouteRouteModule = next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1__.AppRouteRouteModule;\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_2__.RouteKind.APP_ROUTE,\n        page: \"/api/upload-images/route\",\n        pathname: \"/api/upload-images\",\n        filename: \"route\",\n        bundlePath: \"app/api/upload-images/route\"\n    },\n    resolvedPagePath: \"/home/project/app/api/upload-images/route.ts\",\n    nextConfigOutput,\n    userland: _home_project_app_api_upload_images_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/upload-images/route\";\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ1cGxvYWQtaW1hZ2VzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZ1cGxvYWQtaW1hZ2VzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGdXBsb2FkLWltYWdlcyUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGcHJvamVjdCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGaG9tZSUyRnByb2plY3QmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBZ0Q7QUFDaEQ7QUFDMEY7QUFDM0I7QUFDL0Q7QUFDeUU7QUFDekUsNEJBQTRCLGdIQUEwQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNpSjs7QUFFakoiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvPzdhYWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwibmV4dC9kaXN0L3NlcnZlci9ub2RlLXBvbHlmaWxsLWhlYWRlcnNcIjtcbi8vIEB0cy1pZ25vcmUgdGhpcyBuZWVkIHRvIGJlIGltcG9ydGVkIGZyb20gbmV4dC9kaXN0IHRvIGJlIGV4dGVybmFsXG5pbXBvcnQgKiBhcyBtb2R1bGUgZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbi8vIEB0cy1leHBlY3QtZXJyb3IgLSByZXBsYWNlZCBieSB3ZWJwYWNrL3R1cmJvcGFjayBsb2FkZXJcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvaG9tZS9wcm9qZWN0L2FwcC9hcGkvdXBsb2FkLWltYWdlcy9yb3V0ZS50c1wiO1xuY29uc3QgQXBwUm91dGVSb3V0ZU1vZHVsZSA9IG1vZHVsZS5BcHBSb3V0ZVJvdXRlTW9kdWxlO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdXBsb2FkLWltYWdlcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3VwbG9hZC1pbWFnZXNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3VwbG9hZC1pbWFnZXMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9wcm9qZWN0L2FwcC9hcGkvdXBsb2FkLWltYWdlcy9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS91cGxvYWQtaW1hZ2VzL3JvdXRlXCI7XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload-images%2Froute&page=%2Fapi%2Fupload-images%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload-images%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/upload-images/route.ts":
/*!****************************************!*\
  !*** ./app/api/upload-images/route.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/main/index.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(\"https://kqbycaospxztjmverqpz.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYnljYW9zcHh6dGptdmVycXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTE3MDcsImV4cCI6MjA3NzcyNzcwN30.4Ef6trr-RLyeXdtkrQGnzDo-FtHq1H6ZRnQORbN2uFM\");\nasync function POST(request) {\n    try {\n        const formData = await request.formData();\n        const files = formData.getAll(\"files\");\n        if (!files || files.length === 0) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"没有上传文件\"\n            }, {\n                status: 400\n            });\n        }\n        const imageUrls = [];\n        for (const file of files){\n            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;\n            const filePath = `uploads/${fileName}`;\n            const arrayBuffer = await file.arrayBuffer();\n            const buffer = Buffer.from(arrayBuffer);\n            const { data, error } = await supabase.storage.from(\"product-images\").upload(filePath, buffer, {\n                contentType: file.type,\n                upsert: false\n            });\n            if (error) {\n                console.error(`上传文件失败 ${file.name}:`, error);\n                continue;\n            }\n            const { data: urlData } = supabase.storage.from(\"product-images\").getPublicUrl(filePath);\n            imageUrls.push(urlData.publicUrl);\n        }\n        if (imageUrls.length === 0) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"所有文件上传失败\"\n            }, {\n                status: 500\n            });\n        }\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            imageUrls\n        });\n    } catch (error) {\n        console.error(\"上传API错误:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"服务器内部错误\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3VwbG9hZC1pbWFnZXMvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUF3RDtBQUNIO0FBRXJELE1BQU1FLFdBQVdELG1FQUFZQSxDQUMzQkUsMENBQW9DLEVBQ3BDQSxrTkFBeUM7QUFHcEMsZUFBZUksS0FBS0MsT0FBb0I7SUFDN0MsSUFBSTtRQUNGLE1BQU1DLFdBQVcsTUFBTUQsUUFBUUMsUUFBUTtRQUN2QyxNQUFNQyxRQUFRRCxTQUFTRSxNQUFNLENBQUM7UUFFOUIsSUFBSSxDQUFDRCxTQUFTQSxNQUFNRSxNQUFNLEtBQUssR0FBRztZQUNoQyxPQUFPWixrRkFBWUEsQ0FBQ2EsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUFTLEdBQ2xCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxNQUFNQyxZQUFzQixFQUFFO1FBRTlCLEtBQUssTUFBTUMsUUFBUVAsTUFBTztZQUN4QixNQUFNUSxXQUFXLENBQUMsRUFBRUMsS0FBS0MsR0FBRyxHQUFHLENBQUMsRUFBRUMsS0FBS0MsTUFBTSxHQUFHQyxRQUFRLENBQUMsSUFBSUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFUCxLQUFLUSxJQUFJLENBQUMsQ0FBQztZQUN4RixNQUFNQyxXQUFXLENBQUMsUUFBUSxFQUFFUixTQUFTLENBQUM7WUFFdEMsTUFBTVMsY0FBYyxNQUFNVixLQUFLVSxXQUFXO1lBQzFDLE1BQU1DLFNBQVNDLE9BQU9DLElBQUksQ0FBQ0g7WUFFM0IsTUFBTSxFQUFFSSxJQUFJLEVBQUVqQixLQUFLLEVBQUUsR0FBRyxNQUFNWixTQUFTOEIsT0FBTyxDQUMzQ0YsSUFBSSxDQUFDLGtCQUNMRyxNQUFNLENBQUNQLFVBQVVFLFFBQVE7Z0JBQ3hCTSxhQUFhakIsS0FBS2tCLElBQUk7Z0JBQ3RCQyxRQUFRO1lBQ1Y7WUFFRixJQUFJdEIsT0FBTztnQkFDVHVCLFFBQVF2QixLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUVHLEtBQUtRLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRVg7Z0JBQ3RDO1lBQ0Y7WUFFQSxNQUFNLEVBQUVpQixNQUFNTyxPQUFPLEVBQUUsR0FBR3BDLFNBQVM4QixPQUFPLENBQ3ZDRixJQUFJLENBQUMsa0JBQ0xTLFlBQVksQ0FBQ2I7WUFFaEJWLFVBQVV3QixJQUFJLENBQUNGLFFBQVFHLFNBQVM7UUFDbEM7UUFFQSxJQUFJekIsVUFBVUosTUFBTSxLQUFLLEdBQUc7WUFDMUIsT0FBT1osa0ZBQVlBLENBQUNhLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBVyxHQUNwQjtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsT0FBT2Ysa0ZBQVlBLENBQUNhLElBQUksQ0FBQztZQUFFRztRQUFVO0lBQ3ZDLEVBQUUsT0FBT0YsT0FBTztRQUNkdUIsUUFBUXZCLEtBQUssQ0FBQyxZQUFZQTtRQUMxQixPQUFPZCxrRkFBWUEsQ0FBQ2EsSUFBSSxDQUN0QjtZQUFFQyxPQUFPO1FBQVUsR0FDbkI7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvLi9hcHAvYXBpL3VwbG9hZC1pbWFnZXMvcm91dGUudHM/Y2I3NCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL3N1cGFiYXNlLWpzXCI7XG5cbmNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KFxuICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwhLFxuICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSFcbik7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZm9ybURhdGEgPSBhd2FpdCByZXF1ZXN0LmZvcm1EYXRhKCk7XG4gICAgY29uc3QgZmlsZXMgPSBmb3JtRGF0YS5nZXRBbGwoJ2ZpbGVzJykgYXMgRmlsZVtdO1xuXG4gICAgaWYgKCFmaWxlcyB8fCBmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogXCLmsqHmnInkuIrkvKDmlofku7ZcIiB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgaW1hZ2VVcmxzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBjb25zdCBmaWxlTmFtZSA9IGAke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpfS0ke2ZpbGUubmFtZX1gO1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBgdXBsb2Fkcy8ke2ZpbGVOYW1lfWA7XG5cbiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpO1xuICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmZyb20oYXJyYXlCdWZmZXIpO1xuXG4gICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5zdG9yYWdlXG4gICAgICAgIC5mcm9tKCdwcm9kdWN0LWltYWdlcycpXG4gICAgICAgIC51cGxvYWQoZmlsZVBhdGgsIGJ1ZmZlciwge1xuICAgICAgICAgIGNvbnRlbnRUeXBlOiBmaWxlLnR5cGUsXG4gICAgICAgICAgdXBzZXJ0OiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGDkuIrkvKDmlofku7blpLHotKUgJHtmaWxlLm5hbWV9OmAsIGVycm9yKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgZGF0YTogdXJsRGF0YSB9ID0gc3VwYWJhc2Uuc3RvcmFnZVxuICAgICAgICAuZnJvbSgncHJvZHVjdC1pbWFnZXMnKVxuICAgICAgICAuZ2V0UHVibGljVXJsKGZpbGVQYXRoKTtcblxuICAgICAgaW1hZ2VVcmxzLnB1c2godXJsRGF0YS5wdWJsaWNVcmwpO1xuICAgIH1cblxuICAgIGlmIChpbWFnZVVybHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwi5omA5pyJ5paH5Lu25LiK5Lyg5aSx6LSlXCIgfSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGltYWdlVXJscyB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwi5LiK5LygQVBJ6ZSZ6K+vOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogXCLmnI3liqHlmajlhoXpg6jplJnor69cIiB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiUE9TVCIsInJlcXVlc3QiLCJmb3JtRGF0YSIsImZpbGVzIiwiZ2V0QWxsIiwibGVuZ3RoIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiaW1hZ2VVcmxzIiwiZmlsZSIsImZpbGVOYW1lIiwiRGF0ZSIsIm5vdyIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsInN1YnN0cmluZyIsIm5hbWUiLCJmaWxlUGF0aCIsImFycmF5QnVmZmVyIiwiYnVmZmVyIiwiQnVmZmVyIiwiZnJvbSIsImRhdGEiLCJzdG9yYWdlIiwidXBsb2FkIiwiY29udGVudFR5cGUiLCJ0eXBlIiwidXBzZXJ0IiwiY29uc29sZSIsInVybERhdGEiLCJnZXRQdWJsaWNVcmwiLCJwdXNoIiwicHVibGljVXJsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/upload-images/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload-images%2Froute&page=%2Fapi%2Fupload-images%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload-images%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();