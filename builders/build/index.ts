import {DevServerBuilderOptions, DevServerBuilderOutput} from "@angular-devkit/build-angular";
import {BuilderContext, BuilderOutput, createBuilder, targetFromTargetString} from "@angular-devkit/architect";
import {from, Observable} from "rxjs";
import {workspaces} from '@angular-devkit/core';
import {NodeJsSyncHost} from "@angular-devkit/core/node";
import {runWebpack} from '@angular-devkit/build-webpack';
import {Configuration} from "webpack";


export const execute = (options: any, context: BuilderContext): Observable<BuilderOutput> => {
  let serverOptions;
  let buildElectronOptions;

  const setup = async (): Promise<BuilderOutput> => {
    return new Promise(async (resolve, reject) => {

      const workspaceHost = workspaces.createWorkspaceHost(new NodeJsSyncHost());
      const {workspace} = await workspaces.readWorkspace(
        context.workspaceRoot,
        workspaceHost
      );

      console.log("Workspace");
      const project: workspaces.ProjectDefinition = workspace.projects.get(context.target.project);

      console.log(workspace.projects.get(context.target.project).sourceRoot);


      resolve({success: true});
    });


    const webpackConfig: Configuration = {
      entry: options.main,
      mode: 'development',
      target: 'node',
      output: {
        path: options.outputPath,
        filename: 'main.js'
      },
      resolve: {
        extensions: ['.ts', '.js'],
      }
    };


    runWebpack(webpackConfig, context)


  }

  console.log("Node Builder");

  return from(setup())

}

export default createBuilder<any, DevServerBuilderOutput>(execute);
