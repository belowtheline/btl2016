exports.config = {
    files: {
        javascripts: {
            joinTo: "belowtheline.js"
        }
    },

    plugins: {
        babel: {
            presets: ['es2015', 'react'],
            plugins: ["syntax-class-properties", "transform-class-properties"]
        }
    },

    modules: {
        autoRequire: {
            "belowtheline.js": ["app"]
        }
    },

    npm: {
        enabled: true
    }
};
