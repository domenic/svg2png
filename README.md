# SVG-to-PNG Converter Using PhantomJS

[![NPM version](https://img.shields.io/npm/v/svg2png.svg?)](https://www.npmjs.com/package/svg2png)
[![Build Status](https://img.shields.io/travis/domenic/svg2png/master.svg)](https://travis-ci.org/domenic/svg2png)
[![Dependency Status](https://img.shields.io/david/domenic/svg2png.svg)](https://david-dm.org/domenic/svg2png)
[![devDependency Status](https://img.shields.io/david/dev/domenic/svg2png.svg)](https://david-dm.org/domenic/svg2png#info=devDependencies)

You have an SVG file. For whatever reason, you need a PNG one. **svg2png** can help.

```js
svg2png("source.svg", "dest.png", function (err) {
    // PNGs for everyone!
});
```

Maybe you need to scale the image while converting? We can do that too:

```js
svg2png("source.svg", "dest.png", 1.2, function (err) {
    // 1.2×-sized PNGs for everyone!
});
```

The scale factor is relative to the SVG's `viewbox` or `width`/`height` attributes, for the record.

svg2png is built on the latest in [PhantomJS][] technology to render your SVGs using a headless WebKit instance. I have
found this to produce much more accurate renderings than other solutions like GraphicsMagick or Inkscape. Plus, it's
easy to install cross-platform due to the excellent [phantomjs][package] npm package—you don't even need to have
PhantomJS in your `PATH`.

[PhantomJS]: http://phantomjs.org/
[package]: https://npmjs.org/package/phantomjs

## CLI

[@skyzyx][] made [a CLI version][] of this; you should go check it out if you're into using the command line.

[@skyzyx]: https://github.com/skyzyx
[a CLI version]: https://github.com/skyzyx/svg2png-cli
