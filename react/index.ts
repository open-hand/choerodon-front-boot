import type { Configuration } from 'webpack';

/** boot启动配置 */
interface Config {
  /** 页面入口 */
  entry?: string
  /** 要运行的子模块, ['.']代表当前模块 */
  modules: string[]
  /** 打包目录 */
  distBasePath?: string
  /** webpack的output */
  output?: string
  /** html模板title */
  titlename?: string
  /** 覆盖webpack配置 */
  webpackConfig?: (config: Configuration) => Configuration
}

export function createConfig(config: Config): Config {
  return config;
}
