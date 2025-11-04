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
exports.id = "app/api/cleanup/route";
exports.ids = ["app/api/cleanup/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcleanup%2Froute&page=%2Fapi%2Fcleanup%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcleanup%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcleanup%2Froute&page=%2Fapi%2Fcleanup%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcleanup%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_node_polyfill_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/node-polyfill-headers */ \"(rsc)/./node_modules/next/dist/server/node-polyfill-headers.js\");\n/* harmony import */ var next_dist_server_node_polyfill_headers__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_node_polyfill_headers__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var _home_project_app_api_cleanup_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/cleanup/route.ts */ \"(rsc)/./app/api/cleanup/route.ts\");\n\n// @ts-ignore this need to be imported from next/dist to be external\n\n\n// @ts-expect-error - replaced by webpack/turbopack loader\n\nconst AppRouteRouteModule = next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_1__.AppRouteRouteModule;\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_2__.RouteKind.APP_ROUTE,\n        page: \"/api/cleanup/route\",\n        pathname: \"/api/cleanup\",\n        filename: \"route\",\n        bundlePath: \"app/api/cleanup/route\"\n    },\n    resolvedPagePath: \"/home/project/app/api/cleanup/route.ts\",\n    nextConfigOutput,\n    userland: _home_project_app_api_cleanup_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/cleanup/route\";\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZjbGVhbnVwJTJGcm91dGUmcGFnZT0lMkZhcGklMkZjbGVhbnVwJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGY2xlYW51cCUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGcHJvamVjdCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGaG9tZSUyRnByb2plY3QmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBZ0Q7QUFDaEQ7QUFDMEY7QUFDM0I7QUFDL0Q7QUFDbUU7QUFDbkUsNEJBQTRCLGdIQUEwQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNpSjs7QUFFakoiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvPzBjNGMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwibmV4dC9kaXN0L3NlcnZlci9ub2RlLXBvbHlmaWxsLWhlYWRlcnNcIjtcbi8vIEB0cy1pZ25vcmUgdGhpcyBuZWVkIHRvIGJlIGltcG9ydGVkIGZyb20gbmV4dC9kaXN0IHRvIGJlIGV4dGVybmFsXG5pbXBvcnQgKiBhcyBtb2R1bGUgZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbi8vIEB0cy1leHBlY3QtZXJyb3IgLSByZXBsYWNlZCBieSB3ZWJwYWNrL3R1cmJvcGFjayBsb2FkZXJcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvaG9tZS9wcm9qZWN0L2FwcC9hcGkvY2xlYW51cC9yb3V0ZS50c1wiO1xuY29uc3QgQXBwUm91dGVSb3V0ZU1vZHVsZSA9IG1vZHVsZS5BcHBSb3V0ZVJvdXRlTW9kdWxlO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvY2xlYW51cC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NsZWFudXBcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2NsZWFudXAvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9wcm9qZWN0L2FwcC9hcGkvY2xlYW51cC9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9jbGVhbnVwL3JvdXRlXCI7XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcleanup%2Froute&page=%2Fapi%2Fcleanup%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcleanup%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/cleanup/route.ts":
/*!**********************************!*\
  !*** ./app/api/cleanup/route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/main/index.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(\"https://kqbycaospxztjmverqpz.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYnljYW9zcHh6dGptdmVycXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTE3MDcsImV4cCI6MjA3NzcyNzcwN30.4Ef6trr-RLyeXdtkrQGnzDo-FtHq1H6ZRnQORbN2uFM\");\nasync function POST(request) {\n    try {\n        const { days, deleteAll = false } = await request.json();\n        let query = supabase.from(\"image_records\").select(\"id, storage_path\");\n        if (!deleteAll && days) {\n            const cutoffDate = new Date();\n            cutoffDate.setDate(cutoffDate.getDate() - days);\n            query = query.lt(\"created_at\", cutoffDate.toISOString());\n        }\n        const { data: oldImages, error: fetchError } = await query;\n        if (fetchError) {\n            throw fetchError;\n        }\n        if (!oldImages || oldImages.length === 0) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                success: true,\n                message: deleteAll ? \"没有找到图片数据\" : `没有找到 ${days} 天前的图片`,\n                deleted: 0\n            });\n        }\n        const imageIds = oldImages.map((img)=>img.id);\n        await supabase.from(\"human_reviews\").delete().in(\"image_record_id\", imageIds);\n        await supabase.from(\"regeneration_attempts\").delete().in(\"image_record_id\", imageIds);\n        const { error: deleteError } = await supabase.from(\"image_records\").delete().in(\"id\", imageIds);\n        if (deleteError) {\n            throw deleteError;\n        }\n        const storageDeletePromises = oldImages.filter((img)=>img.storage_path).map(async (img)=>{\n            try {\n                await supabase.storage.from(\"product-images\").remove([\n                    img.storage_path\n                ]);\n            } catch (err) {\n                console.error(`删除存储文件失败: ${img.storage_path}`, err);\n            }\n        });\n        await Promise.allSettled(storageDeletePromises);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            success: true,\n            message: deleteAll ? `成功删除所有 ${imageIds.length} 张图片` : `成功删除 ${imageIds.length} 张旧图片`,\n            deleted: imageIds.length,\n            days: deleteAll ? undefined : days\n        });\n    } catch (error) {\n        console.error(\"清理数据失败:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            success: false,\n            error: \"清理数据失败\",\n            details: error instanceof Error ? error.message : \"未知错误\"\n        }, {\n            status: 500\n        });\n    }\n}\nasync function GET() {\n    try {\n        const { count: total, error: totalError } = await supabase.from(\"image_records\").select(\"*\", {\n            count: \"exact\",\n            head: true\n        });\n        if (totalError) throw totalError;\n        const thirtyDaysAgo = new Date();\n        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);\n        const { count: old, error: oldError } = await supabase.from(\"image_records\").select(\"*\", {\n            count: \"exact\",\n            head: true\n        }).lt(\"created_at\", thirtyDaysAgo.toISOString());\n        if (oldError) throw oldError;\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            total: total || 0,\n            oldImages: old || 0\n        });\n    } catch (error) {\n        console.error(\"获取统计信息失败:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"获取统计信息失败\",\n            details: error instanceof Error ? error.message : \"未知错误\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEdBQUcsTUFBTWxELFNBQy9DVyxJQUFJLENBQUMsaUJBQ0xDLE1BQU0sQ0FBQyxLQUFLO1lBQUVvQyxPQUFPO1lBQVNHLE1BQU07UUFBSztRQUU1QyxJQUFJRCxZQUFZLE1BQU1BO1FBRXRCLE1BQU1FLGdCQUFnQixJQUFJdEM7UUFDMUJzQyxjQUFjckMsT0FBTyxDQUFDcUMsY0FBY3BDLE9BQU8sS0FBSztRQUVoRCxNQUFNLEVBQUVnQyxPQUFPSyxHQUFHLEVBQUVoQyxPQUFPaUMsUUFBUSxFQUFFLEdBQUcsTUFBTXRELFNBQzNDVyxJQUFJLENBQUMsaUJBQ0xDLE1BQU0sQ0FBQyxLQUFLO1lBQUVvQyxPQUFPO1lBQVNHLE1BQU07UUFBSyxHQUN6Q2xDLEVBQUUsQ0FBQyxjQUFjbUMsY0FBY2xDLFdBQVc7UUFFN0MsSUFBSW9DLFVBQVUsTUFBTUE7UUFFcEIsT0FBT3hELGtGQUFZQSxDQUFDVyxJQUFJLENBQUM7WUFDdkJ3QyxPQUFPQSxTQUFTO1lBQ2hCN0IsV0FBV2lDLE9BQU87UUFDcEI7SUFDRixFQUFFLE9BQU9oQyxPQUFPO1FBQ2RtQixRQUFRbkIsS0FBSyxDQUFDLGFBQWFBO1FBQzNCLE9BQU92QixrRkFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtZQUNFWSxPQUFPO1lBQ1B1QixTQUFTdkIsaUJBQWlCd0IsUUFBUXhCLE1BQU1JLE9BQU8sR0FBRztRQUNwRCxHQUNBO1lBQUVxQixRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy8uL2FwcC9hcGkvY2xlYW51cC9yb3V0ZS50cz83NmY1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuXG5jb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChcbiAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMISxcbiAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhXG4pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgZGF5cywgZGVsZXRlQWxsID0gZmFsc2UgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuXG4gICAgbGV0IHF1ZXJ5ID0gc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdpbWFnZV9yZWNvcmRzJylcbiAgICAgIC5zZWxlY3QoJ2lkLCBzdG9yYWdlX3BhdGgnKTtcblxuICAgIGlmICghZGVsZXRlQWxsICYmIGRheXMpIHtcbiAgICAgIGNvbnN0IGN1dG9mZkRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgY3V0b2ZmRGF0ZS5zZXREYXRlKGN1dG9mZkRhdGUuZ2V0RGF0ZSgpIC0gZGF5cyk7XG4gICAgICBxdWVyeSA9IHF1ZXJ5Lmx0KCdjcmVhdGVkX2F0JywgY3V0b2ZmRGF0ZS50b0lTT1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGRhdGE6IG9sZEltYWdlcywgZXJyb3I6IGZldGNoRXJyb3IgfSA9IGF3YWl0IHF1ZXJ5O1xuXG4gICAgaWYgKGZldGNoRXJyb3IpIHtcbiAgICAgIHRocm93IGZldGNoRXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKCFvbGRJbWFnZXMgfHwgb2xkSW1hZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZTogZGVsZXRlQWxsID8gJ+ayoeacieaJvuWIsOWbvueJh+aVsOaNricgOiBg5rKh5pyJ5om+5YiwICR7ZGF5c30g5aSp5YmN55qE5Zu+54mHYCxcbiAgICAgICAgZGVsZXRlZDogMCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGltYWdlSWRzID0gb2xkSW1hZ2VzLm1hcCgoaW1nKSA9PiBpbWcuaWQpO1xuXG4gICAgYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdodW1hbl9yZXZpZXdzJylcbiAgICAgIC5kZWxldGUoKVxuICAgICAgLmluKCdpbWFnZV9yZWNvcmRfaWQnLCBpbWFnZUlkcyk7XG5cbiAgICBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ3JlZ2VuZXJhdGlvbl9hdHRlbXB0cycpXG4gICAgICAuZGVsZXRlKClcbiAgICAgIC5pbignaW1hZ2VfcmVjb3JkX2lkJywgaW1hZ2VJZHMpO1xuXG4gICAgY29uc3QgeyBlcnJvcjogZGVsZXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgnaW1hZ2VfcmVjb3JkcycpXG4gICAgICAuZGVsZXRlKClcbiAgICAgIC5pbignaWQnLCBpbWFnZUlkcyk7XG5cbiAgICBpZiAoZGVsZXRlRXJyb3IpIHtcbiAgICAgIHRocm93IGRlbGV0ZUVycm9yO1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3JhZ2VEZWxldGVQcm9taXNlcyA9IG9sZEltYWdlc1xuICAgICAgLmZpbHRlcigoaW1nKSA9PiBpbWcuc3RvcmFnZV9wYXRoKVxuICAgICAgLm1hcChhc3luYyAoaW1nKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgc3VwYWJhc2Uuc3RvcmFnZS5mcm9tKCdwcm9kdWN0LWltYWdlcycpLnJlbW92ZShbaW1nLnN0b3JhZ2VfcGF0aF0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGDliKDpmaTlrZjlgqjmlofku7blpLHotKU6ICR7aW1nLnN0b3JhZ2VfcGF0aH1gLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChzdG9yYWdlRGVsZXRlUHJvbWlzZXMpO1xuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBtZXNzYWdlOiBkZWxldGVBbGxcbiAgICAgICAgPyBg5oiQ5Yqf5Yig6Zmk5omA5pyJICR7aW1hZ2VJZHMubGVuZ3RofSDlvKDlm77niYdgXG4gICAgICAgIDogYOaIkOWKn+WIoOmZpCAke2ltYWdlSWRzLmxlbmd0aH0g5byg5pen5Zu+54mHYCxcbiAgICAgIGRlbGV0ZWQ6IGltYWdlSWRzLmxlbmd0aCxcbiAgICAgIGRheXM6IGRlbGV0ZUFsbCA/IHVuZGVmaW5lZCA6IGRheXMsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign5riF55CG5pWw5o2u5aSx6LSlOicsIGVycm9yKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ+a4heeQhuaVsOaNruWksei0pScsXG4gICAgICAgIGRldGFpbHM6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ+acquefpemUmeivrycsXG4gICAgICB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgY291bnQ6IHRvdGFsLCBlcnJvcjogdG90YWxFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdpbWFnZV9yZWNvcmRzJylcbiAgICAgIC5zZWxlY3QoJyonLCB7IGNvdW50OiAnZXhhY3QnLCBoZWFkOiB0cnVlIH0pO1xuXG4gICAgaWYgKHRvdGFsRXJyb3IpIHRocm93IHRvdGFsRXJyb3I7XG5cbiAgICBjb25zdCB0aGlydHlEYXlzQWdvID0gbmV3IERhdGUoKTtcbiAgICB0aGlydHlEYXlzQWdvLnNldERhdGUodGhpcnR5RGF5c0Fnby5nZXREYXRlKCkgLSAzMCk7XG5cbiAgICBjb25zdCB7IGNvdW50OiBvbGQsIGVycm9yOiBvbGRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdpbWFnZV9yZWNvcmRzJylcbiAgICAgIC5zZWxlY3QoJyonLCB7IGNvdW50OiAnZXhhY3QnLCBoZWFkOiB0cnVlIH0pXG4gICAgICAubHQoJ2NyZWF0ZWRfYXQnLCB0aGlydHlEYXlzQWdvLnRvSVNPU3RyaW5nKCkpO1xuXG4gICAgaWYgKG9sZEVycm9yKSB0aHJvdyBvbGRFcnJvcjtcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICB0b3RhbDogdG90YWwgfHwgMCxcbiAgICAgIG9sZEltYWdlczogb2xkIHx8IDAsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign6I635Y+W57uf6K6h5L+h5oGv5aSx6LSlOicsIGVycm9yKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7XG4gICAgICAgIGVycm9yOiAn6I635Y+W57uf6K6h5L+h5oGv5aSx6LSlJyxcbiAgICAgICAgZGV0YWlsczogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAn5pyq55+l6ZSZ6K+vJyxcbiAgICAgIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApO1xuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY3JlYXRlQ2xpZW50Iiwic3VwYWJhc2UiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJQT1NUIiwicmVxdWVzdCIsImRheXMiLCJkZWxldGVBbGwiLCJqc29uIiwicXVlcnkiLCJmcm9tIiwic2VsZWN0IiwiY3V0b2ZmRGF0ZSIsIkRhdGUiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsImx0IiwidG9JU09TdHJpbmciLCJkYXRhIiwib2xkSW1hZ2VzIiwiZXJyb3IiLCJmZXRjaEVycm9yIiwibGVuZ3RoIiwic3VjY2VzcyIsIm1lc3NhZ2UiLCJkZWxldGVkIiwiaW1hZ2VJZHMiLCJtYXAiLCJpbWciLCJpZCIsImRlbGV0ZSIsImluIiwiZGVsZXRlRXJyb3IiLCJzdG9yYWdlRGVsZXRlUHJvbWlzZXMiLCJmaWx0ZXIiLCJzdG9yYWdlX3BhdGgiLCJzdG9yYWdlIiwicmVtb3ZlIiwiZXJyIiwiY29uc29sZSIsIlByb21pc2UiLCJhbGxTZXR0bGVkIiwidW5kZWZpbmVkIiwiZGV0YWlscyIsIkVycm9yIiwic3RhdHVzIiwiR0VUIiwiY291bnQiLCJ0b3RhbCIsInRvdGFsRXJyb3IiLCJoZWFkIiwidGhpcnR5RGF5c0FnbyIsIm9sZCIsIm9sZEVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/cleanup/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcleanup%2Froute&page=%2Fapi%2Fcleanup%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcleanup%2Froute.ts&appDir=%2Fhome%2Fproject%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();