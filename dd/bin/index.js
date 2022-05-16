const webpack = require('webpack');
const minimist = require('minimist');
const path = require('path');

const buildInWebpackConfig = require('../dd/webpack.config');
const args = minimist(process.argv.slice(2));

// 用户根目录下的配置文件名称
const fname = 'dd.config.js';

// 存储命令，包括用户自定义的命令
const __commands = {};

// 用户自定义插件api
const api = {
  // 自定义命令
  registerCommands(name, impl) {
    const command = __commands[name];
    if (!command) {
      __commands[name] = impl;
    }
  },
  chainWebpack() {}
}

// 打包
const runWebpackBuild = () => {
  webpack(buildInWebpackConfig, (err, stats) => {
    if (err || Stats.hasErrors()) {
      return console.log('build error');
    }

    console.log('build success!');
  })
}

// 读取用户配置文件
const readLocalOption = () => new Promise((resolve) => {
  const config = require(path.join(process.pwd(), fname));
  const { plugins: { commands = [] } = {} } = config;
  if (commands.length) {
    commands.forEach(command => {
      command(api);
    });
  }
  resolve(__commands);
})

readLocalOption().then(() => {
  const command = args._[0];
  if (commands[command]) {
    commands[command]();
  } else {
    runWebpackBuild();
  }
});
