// .eleventy.js — schlank, ohne sharp/@11ty/eleventy-img

const fs = require("fs");
const crypto = require("crypto");

module.exports = function (eleventyConfig) {
  // Statische Assets durchreichen & beobachten
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addWatchTarget("assets");

  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addWatchTarget("images");

  eleventyConfig.addPassthroughCopy("downloads");
  eleventyConfig.addWatchTarget("downloads");

  // Simpler IMG-Shortcode (kein sharp, kein Resizing)
  function imgShortcode(src, alt = "", cls = "", width = "", height = "") {
    // kleines Escape nur fürs Alt-Attribut
    const safeAlt = String(alt).replace(/"/g, "&quot;");
    const w = width ? ` width="${width}"` : "";
    const h = height ? ` height="${height}"` : "";
    const c = cls ? ` class="${cls}"` : "";
    return `<img src="${src}" alt="${safeAlt}" loading="lazy" decoding="async"${c}${w}${h}>`;
  }

  // In Nunjucks, Liquid und JS verfügbar machen
  eleventyConfig.addNunjucksShortcode("img", imgShortcode);
  eleventyConfig.addLiquidShortcode("img", imgShortcode);
  eleventyConfig.addJavaScriptFunction("img", imgShortcode);

  // Figure-Shortcode (wie gehabt)
  eleventyConfig.addPairedShortcode("Figure", (content, caption = "") => {
    return `<figure class="figure">
      ${content}
      ${caption ? `<figcaption class="figure__cap">${caption}</figcaption>` : ""}
    </figure>`;
  });

  // Cachebuster-Filter: usage -> {{ '/assets/style.css' | hash }}
  eleventyConfig.addFilter("hash", (path) => {
    try {
      const file = fs.readFileSync("." + path);
      const h = crypto.createHash("md5").update(file).digest("hex").slice(0,10);
      return `${path}?v=${h}`;
    } catch (e) {
      // Fallback, falls Datei (noch) nicht existiert
      return `${path}?v=${Date.now()}`;
    }
  });

  // Nunjucks für Markdown aktiv lassen
  return {
    markdownTemplateEngine: "njk",
    dir: { input: ".", output: "_site" }
  };
};
