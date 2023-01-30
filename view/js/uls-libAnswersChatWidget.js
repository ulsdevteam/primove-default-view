/* libanswers chat widget 
 * from https://developers.exlibrisgroup.com/blog/embedding-springshare-libchat-widget-into-the-primo-nu/
 */
function chatWidget() {
	var lc = document.createElement('script');
	lc.type = 'text/javascript';
	lc.async = 'true';
	if (document.location.protocol == 'https:') {
		var protocol = 'https://';
	}
	else {
		protocol='http://';
	}
	lc.src = protocol + 'pitt.libanswers.com/load_chat.php?hash=682f0a4cbcf434ef0a11eeab9cddf016';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
}

export { chatWidget }
