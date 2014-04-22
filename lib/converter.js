"use strict";
/* global phantom: false */

var webpage = require("webpage");

if (phantom.args.length !== 3 && phantom.args.length !== 5) {
	console.error("Usage: converter.js source dest scale, given: "
			+ phantom.args);
	phantom.exit();
} else if (phantom.args.length == 5) {
	convertAnim(phantom.args[0], phantom.args[1], Number(phantom.args[2]),
			Number(phantom.args[3]), Number(phantom.args[4]));
} else {
	convert(phantom.args[0], phantom.args[1], Number(phantom.args[2]));
}

function convert(source, dest, scale) {
	var page = webpage.create();

	page.open(source, function(status) {
		if (status !== "success") {
			console.error("Unable to load the source file.");
			phantom.exit();
			return;
		}

		var dimensions = getSvgDimensions(page);
		page.viewportSize = {
			width : Math.round(dimensions.width * scale),
			height : Math.round(dimensions.height * scale)
		};
		if (!dimensions.usesViewBox) {
			page.zoomFactor = scale;
		}

		// This delay is I guess necessary for the resizing to happen?
		setTimeout(function() {
			page.render(dest);
			phantom.exit();
		}, 0);
	});
}

function convertAnim(source, dest, scale, number, duration) {
	dest = dest.split(".png")[0];
	var page = webpage.create();

	page.open(source, function(status) {
		if (status !== "success") {
			console.error("Unable to load the source file.");
			phantom.exit();
			return;
		}

		var dimensions = getSvgDimensions(page);
		page.viewportSize = {
			width : Math.round(dimensions.width * scale),
			height : Math.round(dimensions.height * scale)
		};
		if (!dimensions.usesViewBox) {
			page.zoomFactor = scale;
		}

		var current = 0;

		// This delay is I guess necessary for the resizing to happen?
		// first frame
		setTimeout(function() {
			page.render(dest + current + ".png");
			if (number == 1) {
				phantom.exit();
			}
		}, 0);

		// This delay is I guess necessary for the resizing to happen?
		if (number > 1)
			var interval = setInterval(function() {
				page.render(dest + current + ".png");
				if (++current >= number) {
					clearInterval(interval);
					phantom.exit();
				}
			}, (duration / (number - 1)) * 1000);
	});
}

function getSvgDimensions(page) {
	return page.evaluate(function() {
		/* global document: false */

		var el = document.documentElement;
		var bbox = el.getBBox();

		var width = parseFloat(el.getAttribute("width"));
		var height = parseFloat(el.getAttribute("height"));
		var viewBoxWidth = el.viewBox.animVal.width;
		var viewBoxHeight = el.viewBox.animVal.height;
		var usesViewBox = viewBoxWidth && viewBoxHeight;

		if (usesViewBox) {
			if (width && !height) {
				height = width * viewBoxHeight / viewBoxWidth;
			}
			if (height && !width) {
				width = height * viewBoxWidth / viewBoxHeight;
			}
			if (!width && !height) {
				width = viewBoxWidth;
				height = viewBoxHeight;
			}
		}

		if (!width) {
			width = bbox.width + bbox.x;
		}
		if (!height) {
			height = bbox.height + bbox.y;
		}

		return {
			width : width,
			height : height,
			usesViewBox : usesViewBox
		};
	});
}
