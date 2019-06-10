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
const config_1 = require("@schematics/angular/utility/config");
const core_1 = require("@angular-devkit/core");
const config_2 = require("@schematics/angular/utility/config");
const workspace_models_1 = require("@schematics/angular/utility/workspace-models");
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
        const sourceDir = `${appDir}/src`;
        options.appProjectRoot = sourceDir;
        options.projectDir = appDir;
        return schematics_1.chain([updateAngularConfig(options), addFiles(options)]);
    });
}
exports.default = default_1;
function updateAngularConfig(options) {
    return (tree, _context) => __awaiter(this, void 0, void 0, function* () {
        const workspace = config_1.getWorkspace(tree);
        workspace.projects[options.name] = {
            projectType: workspace_models_1.ProjectType.Application,
            root: "projects/" + options.name,
            sourceRoot: options.appProjectRoot,
            prefix: "app",
            architect: {
                ['build-node']: {
                    builder: "@richapps/ngnode:build",
                    options: {
                        outputPath: "dist/" + options.name,
                        main: "projects/" + options.name + "/main.ts",
                        tsConfig: "projects/" + options.name + "/tsconfig.json"
                    }
                }
            }
        };
        return config_2.updateWorkspace(workspace);
    });
}
function addFiles(options) {
    return schematics_1.mergeWith(schematics_1.apply(schematics_1.url(`./files`), [
        schematics_1.template({
            tmpl: '',
            name: options.name,
            root: options.projectDir
        }),
        schematics_1.move(options.projectDir)
    ]));
}
