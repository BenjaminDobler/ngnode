import {
  apply,
  chain,
  mergeWith, move,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree, url
} from "@angular-devkit/schematics";
import {validateProjectName} from "@schematics/angular/utility/validation";
import {getWorkspace} from "@schematics/angular/utility/workspace";
import {getWorkspace as getWorkspace2} from "@schematics/angular/utility/config";

import {join, normalize} from "@angular-devkit/core";
import {updateWorkspace} from "@schematics/angular/utility/config";
import {ProjectType} from "@schematics/angular/utility/workspace-models";


export default function (options: any): Rule {
  return async (host: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }
    validateProjectName(options.name);
    options.prefix = options.prefix || 'app';
    const workspace = await getWorkspace(host);
    const newProjectRoot = workspace.extensions.newProjectRoot as (string | undefined) || '';
    const isRootApp = options.projectRoot !== undefined;
    const appDir = isRootApp
      ? options.projectRoot as string
      : join(normalize(newProjectRoot), options.name);
    const sourceDir = `${appDir}/src`
    options.appProjectRoot = sourceDir;
    return chain([updateAngularConfig(options), addFiles(options)]);

  }
}

function updateAngularConfig(options): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = getWorkspace2(tree);
    workspace.projects[options.name] = {
      projectType: ProjectType.Application,
      root: "projects/node1",
      sourceRoot: options.appProjectRoot,
      prefix: "app",
      architect: {
         ['build-node']: {
          builder: "@richapps/ngnode:build",
          options: {
            outputPath: "dist/" + options.name,
            main: "main.ts"
          }
        }
      }
    }
    return updateWorkspace(workspace);
  }
}


function addFiles(options) {
  return mergeWith(
    apply(url(`./files/src`), [
      template({
        tmpl: '',
        name: options.name,
        root: options.appProjectRoot
      }),
      move(options.appProjectRoot)
    ]));
}



