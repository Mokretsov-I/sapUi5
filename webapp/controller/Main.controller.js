sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/Fragment",
		"sap/ui/core/Item",
		"sap/m/MessageToast",
		"model/formatter",
	],
	function (Controller, Fragment, Item, MessageToast, formatter) {
		"use strict";

		return Controller.extend("myCalendar.controller.Main", {
			myformatter: formatter,
			imagePath: "./",

			// Initial setup
			onInit: function () {
				this._oModel = this.getView().getModel("calendar");
				this._oStartDate = this.myformatter.utcToLocalDateTime(new Date());
				this._sSelectedView = this._oModel.getProperty("/viewKey");
				this._sSelectedMember = "Team";
				this._oCalendarContainer = this.byId("mainContent");
				this._mCalendars = {};
				this._sCalendarDisplayed = "";

				// load Calendar
				Fragment.load({
					id: this.getView().getId(),
					name: "myCalendar.view.PlanningCalendar",
					controller: this,
				}).then(
					function (oCalendarVBox) {
						this._displayCalendar("PlanningCalendar", oCalendarVBox);
					}.bind(this)
				);
			},

			// Saves currently selected date
			startDateChangeHandler: function (oEvent) {
				this._oStartDate = new Date(oEvent.getSource().getStartDate());
			},

			// Handler of the "Create" button
			appointmentCreate: function (oEvent) {
				MessageToast.show("Creating new appointment...");
			},

			_displayCalendar: function (sCalendarId, oCalendarVBox) {
				this._oCalendarContainer.addContent(oCalendarVBox);
				this._sCalendarDisplayed = sCalendarId;
				var oCalendar = oCalendarVBox.getItems()[0];
				oCalendar.setStartDate(this._oStartDate);
				oCalendar.setViewKey(this._sSelectedView);
				oCalendar.bindElement({
					path: "/team",
					model: "calendar",
				});
			},
		});
	}
);
