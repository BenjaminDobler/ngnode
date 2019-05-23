import {Schema} from "./schema";
import {getWorkspace, updateWorkspace} from "@schematics/angular/utility/config";
import {addPackageJsonDependency, NodeDependency, NodeDependencyType} from "@schematics/angular/utility/dependencies";
import {NodePackageInstallTask} from "@angular-devkit/schematics/tasks";
import * as path from "path";
import {getProject} from "@schematics/angular/utility/project";

import {chain, Rule, SchematicContext, Tree} from "@angular-devkit/schematics";
import {readFileSync} from "fs";

export default function (options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([])(tree, _context);
  };
}

