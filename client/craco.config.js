const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    webpack: {
        configure: (config, { paths }) => {
            // Remove the ModuleScopePlugin which throws when we try
            // to import something outside of src/.
            config.resolve.plugins.pop();

            // Resolve the path aliases.
            config.resolve.plugins.push(new TsconfigPathsPlugin());

            // Let Babel compile outside of src/.
            config.module.rules[1].oneOf.forEach(rule => {
                rule.include = [
                    paths.appPath,
                    path.resolve(paths.appPath, '../common')
                ];
            })

            return config;
        }
    }
}