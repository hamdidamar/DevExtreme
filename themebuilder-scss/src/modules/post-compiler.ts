import CleanCSS, { Options } from 'clean-css';
import AutoPrefix from 'autoprefixer';
import PostCss from 'postcss';
import commonOptions from '../data/clean-css-options.json';
// eslint-disable-next-line import/extensions
import { browsersList } from '../data/metadata/dx-theme-builder-metadata';

export default class PostCompiler {
  static addBasePath(css: string | Buffer, basePath: string): string {
    const normalizedPath = `${basePath.replace(/[/\\]$/, '')}/`;
    return css.toString().replace(/(url\()("|')?(icons|fonts)/g, `$1$2${normalizedPath}$3`);
  }

  static addInfoHeader(css: string | Buffer, version: string, isDartCompiler: boolean): string {
    const generatedBy = '* Generated by the DevExpress ThemeBuilder';
    const dartPostfix = isDartCompiler ? ' (dart)' : '';
    const versionString = `* Version: ${version}`;
    const link = '* http://js.devexpress.com/ThemeBuilder/';

    const header = `/*${generatedBy}${dartPostfix}\n${versionString}\n${link}\n*/\n\n`;
    const source = css.toString();
    const encoding = '@charset "UTF-8";';

    if (source.startsWith(encoding)) {
      return `${encoding}\n${header}${source.replace(`${encoding}\n`, '')}`;
    }
    return header + css;
  }

  static async cleanCss(css: string): Promise<string> {
    const promiseOptions: Options = { returnPromise: true };
    const options: Options = { ...(commonOptions as Options), ...promiseOptions };
    const cleaner = new CleanCSS(options);
    return (await cleaner.minify(css)).styles;
  }

  static async autoPrefix(css: string): Promise<string> {
    return (await PostCss(AutoPrefix({
      overrideBrowserslist: browsersList,
    })).process(css, {
      from: undefined,
    })).css;
  }

  static fixSwatchCss(css: string | Buffer, swatchClass: string, colorScheme: string): string {
    let result = css.toString();

    const escapedSelector = swatchClass.replace('.', '\\.');

    const swatchOrderRegex = new RegExp(`([ \\t]*)([\\w\\.#:\\*][\\w\\.#:\\*\\->()\\s]*)(${escapedSelector}\\s)([^,{+~]*)`, 'gm');
    const changeTypographyRulesOrderRegex = /(\.dx-swatch-.*?)\s(\.dx-theme-.*?-typography)(.*?)(\s{|,)/g;
    const themeMarkerRegex = /(\.dx-theme-marker\s*{\s*font-family:\s*['"]dx\..*?\.)(.*)(['"])/g;

    result = result
      .replace(swatchOrderRegex, '$1$3$2$4')
      .replace(changeTypographyRulesOrderRegex, '$2 $1$3,$2$1$3$4')
      .replace(themeMarkerRegex, `$1${colorScheme}$3`);

    return result;
  }

  static removeExternalResources(css: string): string {
    const fontRegex = /^\s*@import\surl\(.*googleapis.*\);[\n\r]{0,2}/gmi;
    return css.replace(fontRegex, '');
  }
}