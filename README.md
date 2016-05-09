# Templa

Templa is a module for building static sites from data files and template files.

It can read data from yaml or json files, and also plain text or markdown with yaml/json front matter.

The magic happens in the `.templa.json` file:

```json
{
	"baseDataDir": "./src/data",
	"baseTemplateDir": "./src/templates",
	"templateExtension": "html.nunjucks",
	"outputDir": "./build",
	"globalData": [
		{
			"key": "sporks",
			"dir": "sporks"
		}
	],
	"pages": [
		{
			"url": "/",
			"template": "index"
		},
		{
			"url": "/another-static-page",
			"template": "static-page-template"
		},
		{
			"url": "/spork-path/:slug",
			"template": "spork-page",
			"data": {
				"dir": "sporks",
				"key": "spork"
			}
		}
	]
}
```

Now just run `templa()`.

First, this will read all the files in the `sporks` directory and store them as global data, accessible to all templates.

Next, it generates two static pages - `index.html` and `another-static-page.html` and store them in the `build` directory.

Finally, it will create one new page based on the `spork-page.html.nunjucks` template for every file in the `sporks` directory, and save them in the `build/spork-path` directory.

If you'd prefer to use a single data file rather than one for each page, just replace `"dir": "sporks"` with `"file": "sporks.yaml"`;
