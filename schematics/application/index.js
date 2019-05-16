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
const schematics_1 = require("@angular-devkit/schematics");
const validation_1 = require("@schematics/angular/utility/validation");
const workspace_1 = require("@schematics/angular/utility/workspace");
const core_1 = require("@angular-devkit/core");
function default_1(options) {
    return (host, context) => __awaiter(this, void 0, void 0, function* () {
        if (!options.name) {
            throw new schematics_1.SchematicsException(`Invalid options, "name" is required.`);
        }
        validation_1.validateProjectName(options.name);
        options.prefix = options.prefix || 'app';
        const workspace = yield workspace_1.getWorkspace(host);
        const newProjectRoot = workspace.extensions.newProjectRoot || '';
        const isRootApp = options.projectRoot !== undefined;
        const appDir = isRootApp
            ? options.projectRoot
            : core_1.join(core_1.normalize(newProjectRoot), options.name);
        const sourceDir = `${appDir}/src/app`;
        console.log("Add Node app! ", sourceDir);
        return schematics_1.chain([]);
    });
}
exports.default = default_1;
//# sourceMappingURL=index.js.map