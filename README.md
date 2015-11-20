# SVG-to-PNG Converter Using PhantomJS

You have a SVG file. For whatever reason, you need a PNG. **svg2png** can help.

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

Do you want to render many SVGs in one go? Totally possible!

```js
// Render to two specific targets
svg2png([ 'source1.svg', 'source2.svg' ], [ 'source1.png', 'source2.png' ], 2, function(err) {
  // Both files got rendered and scaled 2x
});

// Render to a directory
svg2png([ 'my.svg', 'other.svg' ], 'images/', function(err) {
  // We now have images/my.png and images/other.png
});
```

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
