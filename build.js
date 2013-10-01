/** This is not used by the gruntfile.  It complains about missing backbone/backbone.js file in mobile-main.js */
({
    appDir: './',
    baseUrl: './javascripts',
    dir: './dist',
    modules: [
        {
            name: 'mobile-main',
        }
    ],
    fileExclusionRegExp: /^(r|build)\.js$/,
    optimizeCss: 'standard',
    removeCombined: true,
//    keepBuildDir:false,
    paths: {
        jquery: 'lib/jquery',
        underscore: 'lib/underscore',
        backbone: 'lib/backbone/backbone',
        backboneLocalStorage: 'lib/backbone/backbone.localStorage',
        text: 'lib/require/text'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
          },
          backboneLocalStorage: {
              deps: ['backbone'],
              exports: 'Store'
          }
    }
    
})