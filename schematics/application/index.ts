import {chain, Rule, SchematicContext, SchematicsException, Tree} from "@angular-devkit/schematics";
import {validateProjectName} from "@schematics/angular/utility/validation";
import {getWorkspace} from "@schematics/angular/utility/workspace";
import {join, normalize} from "@angular-devkit/core";


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
    const sourceDir = `${appDir}/src/app`


    console.log("Add Node app! ", sourceDir);

    return chain([]);

  }
}
