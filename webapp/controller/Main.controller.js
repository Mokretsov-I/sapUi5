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
			newTaskCreate: function (oEvent) {
				var oSource = oEvent.getSource();
				var oView = this._oCalendarContainer;
				console.log(oSource);
				if (!this._pCreateTaskPopover) {
					this._pCreateTaskPopover = Fragment.load({
						id: oView.getId(),
						name: "myCalendar.view.CreateTask",
						controller: this,
					}).then(function (oCreateTaskPopover) {
						oView.addDependent(oCreateTaskPopover);
						return oCreateTaskPopover;
					});
				}
				this._pCreateTaskPopover.then(function (oCreateTaskPopover) {
					if (oCreateTaskPopover.isOpen()) {
						oCreateTaskPopover.close();
					} else {
						oCreateTaskPopover.openBy(oSource);
					}
				});
			},

			appointmentDrop: function (oControlEvent) {
				var oAppointment = oControlEvent.getParameters("appointment");
				// oAppointment.mProperties.startDate =
				// 	oControlEvent.getParameters("startDate");
				// oAppointment.mProperties.endDate =
				// 	oControlEvent.getParameters("endDate");

				var oAppBindingContext = oAppointment;
				console.log(oAppBindingContext);
				//this._oModel.refresh(true);
			},

			appointmentResize: function (oEvent) {
				console.log("appointmentResize", oEvent);
			},

			_displayCalendar: function (sCalendarId, oCalendarVBox) {
				this._oCalendarContainer.addContent(oCalendarVBox);
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
