const fs = require('fs');
const path = require('path');
const marked = require('marked');
const mkpath = require('mkpath');
const nunjucks = require('nunjucks');
const yaml = require('js-yaml');
const yamlFront = require('yaml-front-matter');


function loadDataFile(filePath) {
	const fileContents = fs.readFileSync(filePath);
	const ext = path.extname(filePath);

	if (ext === '.yaml' || ext === '.yml') {
		return yaml.safeLoad(fileContents);
	} else if (ext === '.json') {
		return JSON.parse(fileContents);
	}

	const data = yamlFront.loadFront(fileContents, 'content');
	if (ext === '.md') {
		data.content = marked(data.content);
	}

	return data;
}

function loadDataDir(dirPath) {
	const dirContents = fs.readdirSync(dirPath);
	const data = [];

	dirContents.forEach((fileName) => {
		const filePath = path.format({ dir: dirPath, base: fileName });
		const fileData = loadDataFile(filePath);
		if (!fileData.slug) {
			fileData.slug = path.parse(fileName).name;
		}
		data.push(fileData);
	});


	// data.slug = data.slug || dataFile.replace(/\..*/, '');
	return data;
}

function loadData(obj, baseDir) {
	return obj.file ?
		loadDataFile(path.format({ dir: baseDir, base: obj.file })) :
		loadDataDir(path.format({ dir: baseDir, base: obj.dir }));
}


function templa(cb) {
	const config = JSON.parse(fs.readFileSync('.templa.json'));
	nunjucks.configure(config.baseTemplateDir);

	// Get global data
	const globalData = {};
	if (config.globalData) {
		config.globalData.forEach((obj) => {
			const data = loadData(obj, config.baseDataDir);
			if (obj.key) {
				globalData[obj.key] = data;
			} else {
				Object.assign(globalData, data);
			}
		});
	}


	// Get page list
	const pages = [];
	config.pages.forEach((pageType) => {
		if (!pageType.data) {
			pages.push(pageType);
		} else {
			const dataItems = loadData(pageType.data, config.baseDataDir, true);
			const { key } = pageType.data;

			dataItems.forEach((data) => {
				const url = pageType.url.replace(/:slug/g, data.slug);

				pages.push(Object.assign({}, pageType, {
					url,
					data: Object.assign({ url }, key ? { [key]: data } : data),
				}));
			});
		}
	});

	// Render pages
	pages.forEach((page) => {
		const fileName = `${page.url.replace(/\/$/, '/index').replace(/^\//, '')}.html`;
		const filePath = path.format({
			dir: config.outputDir,
			base: fileName,
		});
		const output = nunjucks.render(`${page.template}.${config.templateExtension}`, Object.assign(
			{},
			globalData,
			page.data
		));
		mkpath.sync(path.dirname(filePath));
		fs.writeFileSync(filePath, output);
	});

	if (typeof cb === 'function') cb( globalData );
}

module.exports = templa;
