sap.ui.define([], function () {
	"use strict";

	return {
		utcToLocalDateTime: function (sDateTimeUTC) {
			if (!sDateTimeUTC) return null;
			return new Date(sDateTimeUTC);
		},

		fixImagePath: function (sImage) {
			if (sImage && sImage.substr(0, 11) !== "sap-icon://")
				sImage = this.imagePath + sImage;
			return sImage;
		},
	};
});
