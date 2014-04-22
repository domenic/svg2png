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

We can also convert animation to multiple images:

```js
svg2pngs("source.svg", "dest.png", 3, 2, function (err) {
    // take 3 images in 2 seconds
});
```

The first image is always the first frame, and the last one is always the last frame after the given time.
An incrementing number will be added to output images name.

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
