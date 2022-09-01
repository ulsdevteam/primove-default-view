function loadScript(url, isModule, isAsync) {
			var lc = document.createElement('script');

			if(isModule) {
				lc.type = "module";
			} else {
				lc.type = 'text/javascript';
			}

			if(isAsync) {
				lc.async = 'true';
			} else {
				lc.async = 'false';
			}

			
			lc.src = 'https://www.googletagmanager.com/gtag/js?id=UA-129368242-1';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
}

export { loadScript }