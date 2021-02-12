import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { from, Observable } from "rxjs";
import { workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { runWebpack } from '@angular-devkit/build-webpack';
import { Configuration } from "webpack";
import { map, mapTo, switchMap, tap } from 'rxjs/operators';
import { basename, resolve } from "path";
import { ChildProcess, fork } from "child_process";
const webpackMerge = require('webpack-merge');

let nodeProcess: ChildProcess;

export const execute = (options: any, context: BuilderContext): Observable<BuilderOutput> => {
  const setup = async (): Promise<workspaces.ProjectDefinition> => {
    return new Promise(async (resolve, reject) => {
      const workspaceHost = workspaces.createWorkspaceHost(new NodeJsSyncHost());
      const { workspace } = await workspaces.readWorkspace(
        context.workspaceRoot,
        workspaceHost
      );
      const project: workspaces.ProjectDefinition = workspace.projects.get(context.target.project);
      resolve(project);
    });
  }

  return from(setup()).pipe(
    map(project => normalizeOptions(options, project, context)),
    map(options => buildConfig(options)),
    switchMap(webpackConfig => runWebpack(webpackConfig, context)),
    mapTo({ success: true }
    )
  )
}

// function startNodeApp(mainFile: string) {
//   if (nodeProcess) {
//     nodeProcess.kill();
//     nodeProcess = null;
//   }
//   nodeProcess = fork(mainFile);
// }

function normalizeOptions(options: any, project: workspaces.ProjectDefinition, context: BuilderContext) {
  options.outputPath = resolve(context.workspaceRoot, options.outputPath);
  if (!Array.isArray(options.main)) {
    options.main = [options.main];
  }
  options.main = options.main.map(main => resolve(context.workspaceRoot, main));
  options.tsConfig = resolve(context.workspaceRoot, options.tsConfig);
  return options;
}

function buildConfig(options) {
  const alias = options.fileReplacements.reduce(
    (aliases, replacement) => ({
      ...aliases,
      [resolve(replacement.replace)]: resolve(replacement.with)
    }),
    {}
  );

  const entry = options.main.reduce((entries, main) => {
    const name = basename(main, '.ts');
    entries[name] = main;
    return entries;
  }, {});
  let webpackConfig: Configuration = {
    entry,
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

  if (options.webpackConfigObject) {
    webpackConfig = webpackMerge(webpackConfig, options.webpackConfigObject)
  }
  return webpackConfig;
}

export default createBuilder<any, BuilderOutput>(execute);
