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

Maybe you need an image with exact dimensions:

```js
svg2png("source.svg", "dest.png", { width: 200, height: 150 }, function (err) {
    // 200x150 pixel sized PNGs for everyone!
});
```

The image will be centered and zoomed to best-fit but not stretched. You can also provide just a single dimension and the other one will be inferred automatically:

```js
svg2png("source.svg", "dest.png", { width: 300 }, function (err) {
    // 300 pixel-wide PNGs for everyone!
});
```

## How the conversion is done

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
