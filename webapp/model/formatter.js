sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
	"use strict";

	return {
		formatDate: function (oDate) {
			if (oDate) {
				var iHours = oDate.getHours(),
					iMinutes = oDate.getMinutes(),
					iSeconds = oDate.getSeconds();

				if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
					return DateFormat.getDateTimeInstance({ style: "medium" }).format(
						oDate
					);
				} else {
					return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
				}
			}
		},
	};
});
