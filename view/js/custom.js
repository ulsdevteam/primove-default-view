// Bootstrapping up to uls.js
function bootstrapToULS() {
	var lc = document.createElement('script');
	lc.type = 'module';
	lc.async = 'false';

	var currentScriptLocation;
		if (document.currentScript) {
		currentScriptLocation = document.currentScript.src;
	} else {
		var scripts = document.getElementsByTagName('script');
		currentScriptLocation = scripts[scripts.length - 1].src;
	}
	var path = currentScriptLocation.substring(0, currentScriptLocation.lastIndexOf('/'));
	console.log("Path to the current script is: "+path);

	lc.src = path + '/uls.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
}

bootstrapToULS();