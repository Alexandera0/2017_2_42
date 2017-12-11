module.exports = () => {
    return {
        module: {
            rules: [{
                    test: /\.js$/,
                    enforce: 'pre',
                    exclude: [/node_modules/, /Box2D/, '/src/js/sw-test.js'],
                    loader: 'eslint-loader',
                    options: {
                        failOnWarning: true,
                        failOnError: true,
                    },
                },
                {
                    test: /\.ts$/,
                    enforce: 'pre',
                    exclude: [/node_modules/, /Box2D/, '/src/js/sw-test.js'],
                    loader: 'tslint-loader',
                    options: {
                        failOnWarning: true,
                        failOnError: true,
                    },
                },
            ],
        },
    };
};
