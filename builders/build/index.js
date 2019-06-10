"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const rxjs_1 = require("rxjs");
const core_1 = require("@angular-devkit/core");
const node_1 = require("@angular-devkit/core/node");
const build_webpack_1 = require("@angular-devkit/build-webpack");
const operators_1 = require("rxjs/operators");
const path_1 = require("path");
const child_process_1 = require("child_process");
let nodeProcess;
exports.execute = (options, context) => {
    console.log("Options ", options);
    const setup = () => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const workspaceHost = core_1.workspaces.createWorkspaceHost(new node_1.NodeJsSyncHost());
            const { workspace } = yield core_1.workspaces.readWorkspace(context.workspaceRoot, workspaceHost);
            const project = workspace.projects.get(context.target.project);
            resolve(project);
        }));
    });
    return rxjs_1.from(setup()).pipe(operators_1.map(project => normalizeOptions(options, project, context)), operators_1.map(options => buildConfig(options)), operators_1.switchMap(webpackConfig => build_webpack_1.runWebpack(webpackConfig, context)), operators_1.tap(x => {
        console.log(x);
        startNodeApp(path_1.join(options.outputPath, x.emittedFiles[0].file));
    }), operators_1.mapTo({ success: true }));
};
function startNodeApp(mainFile) {
    if (nodeProcess) {
        nodeProcess.kill();
        nodeProcess = null;
    }
    nodeProcess = child_process_1.fork(mainFile);
}
function normalizeOptions(options, project, context) {
    options.outputPath = path_1.resolve(context.workspaceRoot, options.outputPath);
    options.main = path_1.resolve(context.workspaceRoot, options.main);
    options.tsConfig = path_1.resolve(context.workspaceRoot, options.tsConfig);
    return options;
}
function buildConfig(options) {
    const alias = options.fileReplacements.reduce((aliases, replacement) => (Object.assign({}, aliases, { [path_1.resolve(replacement.replace)]: path_1.resolve(replacement.with) })), {});
    console.log("TS config ", options.tsConfig);
    const extensions = ['.ts', '.js'];
    const webpackConfig = {
        entry: options.main,
        mode: 'production',
        target: 'node',
        watch: true,
        output: {
            path: options.outputPath,
            filename: 'main.js'
        },
        module: {
            rules: [
                {
                    test: /\.(j|t)sx?$/,
                    loader: "ts-loader",
                    options: {
                        configFile: options.tsConfig,
                        transpileOnly: true,
                        // https://github.com/TypeStrong/ts-loader/pull/685
                        experimentalWatchApi: true
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js'],
            alias
        }
    };
    console.log(webpackConfig);
    return webpackConfig;
}
exports.default = architect_1.createBuilder(exports.execute);
