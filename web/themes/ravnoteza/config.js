module.exports = {
  // theme machine name
  theme: 'ravnoteza',
  // configure sass source and destination directories
  sass: {
    enable: true,
    src: 'scss/**/**.scss',
    dest: 'css/',
    // Values: nested, expanded, compact, compressed
    compilerOptions: {
      outputStyle: 'nested'
    }
  },
  // Autoprefixer options
  // to learn more about autoprefixer and possible configuration options please visit: https://github.com/postcss/autoprefixer#options
  autoprefixer: {
    grid: 'autoplace',
  },
  // Broswersync options
  // to learn more about Broswersync and possible configuration options please visit: https://www.browsersync.io/docs/options
  browserSync: {
    open: false,
    serveStatic: ['.'],
    port: 3000,
    proxy: {
      target: 'http://nginx'
    }
  }
};
