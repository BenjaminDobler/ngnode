import {DevServerBuilderOptions, DevServerBuilderOutput} from "@angular-devkit/build-angular";
import {BuilderContext, BuilderOutput, createBuilder, targetFromTargetString} from "@angular-devkit/architect";
import {from, Observable} from "rxjs";
import {workspaces} from '@angular-devkit/core';
import {NodeJsSyncHost} from "@angular-devkit/core/node";
import {runWebpack} from '@angular-devkit/build-webpack';
import {Configuration} from "webpack";
import {mapTo, switchMap, map, concatMap, tap} from 'rxjs/operators';
import {join, resolve} from "path";
import {ChildProcess, fork} from "child_process";


let nodeProcess: ChildProcess;

export const execute = (options: any, context: BuilderContext): Observable<BuilderOutput> => {
  let serverOptions;
  let buildElectronOptions;

  const setup = async (): Promise<workspaces.ProjectDefinition> => {
    return new Promise(async (resolve, reject) => {

      const workspaceHost = workspaces.createWorkspaceHost(new NodeJsSyncHost());
      const {workspace} = await workspaces.readWorkspace(
        context.workspaceRoot,
        workspaceHost
      );

      console.log("Workspace");
      const project: workspaces.ProjectDefinition = workspace.projects.get(context.target.project);

      console.log(workspace.projects.get(context.target.project).sourceRoot);


      resolve(project);
    });


  }



  console.log("Node Builder");

  return from(setup()).pipe(
    map(project => normalizeOptions(options, project, context)),
    map(options => buildConfig(options)),
    switchMap(webpackConfig => runWebpack(webpackConfig, context)),
    tap(x => {
      console.log("Run node app ", join(options.outputPath,x.emittedFiles[0].file));
      startNodeApp(join(options.outputPath,x.emittedFiles[0].file));
    }),
    mapTo({success: true}
    )
  )

}


function startNodeApp(mainFile: string) {
  console.log("Start Node app");
  if (nodeProcess) {
    nodeProcess.kill();
    nodeProcess = null;
  }
  nodeProcess = fork(mainFile);
}


function normalizeOptions(options: any, project: workspaces.ProjectDefinition, context: BuilderContext) {
  options.outputPath = resolve(context.workspaceRoot, options.outputPath);
  options.main = resolve(project.sourceRoot, options.main);
  return options;
}

function buildConfig(options) {
  const webpackConfig: Configuration = {
    entry: options.main,
    mode: 'development',
    target: 'node',
    watch: true,
    output: {
      path: options.outputPath,
      filename: 'main.js'
    },
    resolve: {
      extensions: ['.ts', '.js'],
    }
  };
  return webpackConfig;
}

export default createBuilder<any, DevServerBuilderOutput>(execute);
