function thirdIron() {
	window.browzine = {
		api: "https://public-api.thirdiron.com/public/v1/libraries/154",
		apiKey: "6d4e92f4-0a30-40fa-8dcb-5834e03197a0",

		journalCoverImagesEnabled: true,

		journalBrowZineWebLinkTextEnabled: true,
		journalBrowZineWebLinkText: "View Journal Contents",

		articleBrowZineWebLinkTextEnabled: true,
		articleBrowZineWebLinkText: "View Issue Contents",

		articlePDFDownloadLinkEnabled: true,
		articlePDFDownloadLinkText: "Download Article PDF",

		articleLinkEnabled: true,
		articleLinkText: "Read Article",

		printRecordsIntegrationEnabled: true,

		unpaywallEmailAddressKey: "uls-systemsdevelopment@pitt.edu",

		articlePDFDownloadViaUnpaywallEnabled: true,
		articlePDFDownloadViaUnpaywallText: "Download PDF (via Unpaywall)",

		articleLinkViaUnpaywallEnabled: true,
		articleLinkViaUnpaywallText: "Read Article (via Unpaywall)",

		articleAcceptedManuscriptPDFViaUnpaywallEnabled: true,
		articleAcceptedManuscriptPDFViaUnpaywallText: "Download PDF (Accepted Manuscript via Unpaywall)",

		articleAcceptedManuscriptArticleLinkViaUnpaywallEnabled: true,
		articleAcceptedManuscriptArticleLinkViaUnpaywallText: "Read Article (Accepted Manuscript via Unpaywall)",
	};

	browzine.script = document.createElement("script");
	browzine.script.src = "https://s3.amazonaws.com/browzine-adapters/primo/browzine-primo-adapter.js";
	document.head.appendChild(browzine.script);
};

export { thirdIron }