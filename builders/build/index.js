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
exports.execute = (options, context) => {
    let serverOptions;
    let buildElectronOptions;
    const setup = () => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const workspaceHost = core_1.workspaces.createWorkspaceHost(new node_1.NodeJsSyncHost());
            const { workspace } = yield core_1.workspaces.readWorkspace(context.workspaceRoot, workspaceHost);
            console.log("Workspacve");
            console.log(workspace.projects.get(context.target.project).sourceRoot);
            resolve({ success: true });
        }));
    });
    console.log("Node Builder");
    return rxjs_1.from(setup());
};
exports.default = architect_1.createBuilder(exports.execute);
//# sourceMappingURL=index.js.map