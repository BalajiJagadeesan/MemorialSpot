module.exports = {
    'extends': 'airbnb-base',
    'parser': 'babel-eslint',
    'plugins': [
        'mocha',
        'chai-expect',
    ],
    'env':{
        'mocha':true,
    },
    'parserOptions': {
        'sourceType': 'module',
        'allowImportExportEverywhere': true,
        'codeFrame': false
    },
    'rules': {
        'chai-expect/missing-assertion': 2,
        'chai-expect/terminating-properties': 1,
        'mocha/no-exclusive-tests': 'error',
        'indent': ['error', 4],
        'linebreak-style': 0,
        'object-curly-bracing': "never",
        'no-unused-vars' : 0,
        'no-underscore-dangle': ["error", {"allow": ["_id"]}],
    }
};
