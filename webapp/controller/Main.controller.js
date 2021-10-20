sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment",
	],
	function (Controller, JSONModel, MessageToast, Fragment) {
		"use strict";

		return Controller.extend("myCalendar.controller.Main", {
			onInit: function () {
				this._oCalendarContainer = this.byId("mainContent");

				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date(),
					minDate: new Date(),
					people: [
						{
							pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
							name: "John Miller",
							role: "team member",
							appointments: [
								{
									start: new Date("2021", "9", "21", "09", "00"),
									end: new Date("2021", "9", "23", "11", "00"),
									title: "Team sync",
									info: "Canteen",
									type: "Type07",
									pic: "sap-icon://family-care",
								},
								{
									start: new Date("2021", "9", "22", "09", "0"),
									end: new Date("2021", "9", "22", "11", "0"),
									title: "Morning Sync",
									info: "I call you",
									type: "Type01",
									pic: "sap-icon://call",
								},
							],
						},
						{
							pic: "test-resources/sap/ui/documentation/sdk/images/Donna_Moore.jpg",
							name: "Donna Moore",
							role: "team member",
							appointments: [
								{
									start: new Date("2021", "9", "22", "08", "00"),
									end: new Date("2021", "9", "22", "09", "50"),
									title: "Team sync",
									info: "Canteen",
									type: "Type07",
									pic: "sap-icon://family-care",
								},
								{
									start: new Date("2021", "9", "24", "10", "00"),
									end: new Date("2021", "9", "24", "20", "00"),
									title: "Sync John",
									info: "Online",
									type: "Type03",
								},
							],
						},
						{
							name: "Общий пул задач",
							appointments: [
								{
									start: new Date("2021", "9", "22", "09", "00"),
									end: new Date("2021", "9", "22", "09", "50"),
									title: "Team sync",
									info: "Canteen",
									type: "Type07",
									pic: "sap-icon://family-care",
								},
								{
									start: new Date("2021", "9", "24", "10", "00"),
									end: new Date("2021", "9", "24", "18", "00"),
									title: "Sync John",
									info: "Online",
									type: "Type03",
								},
							],
						},
					],
				});
				this.getView().setModel(oModel);
			},

			test: function (oEvent) {
				console.log(oEvent);
			},

			// Handler of the "Create" button
			newTaskCreate: function (oEvent) {
				var oSource = oEvent.getSource(),
					oView = this._oCalendarContainer;
				if (!this._pCreateTaskPopover) {
					this._pCreateTaskPopover = Fragment.load({
						id: this.getView().getId(),
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

			saveNewTask: function (oEvent) {
				var name = this.getView().byId("TaskName");
				var time = this.getView().byId("TaskTime");
				if ((name.getValue(), time.getValue())) {
					var oModel = this.getView().getModel();
					var freeTasks =
						oModel.oData.people[oModel.oData.people.length - 1].appointments;
					var dateEnd = new Date();
					var timeVal = parseInt(time.getValue());

					dateEnd.setDate(dateEnd.getDate() + Math.trunc(timeVal / 8));
					dateEnd.setUTCHours(dateEnd.getUTCHours() + (timeVal % 8));

					freeTasks.push({
						start: new Date(),
						end: dateEnd,
						title: name.getValue(),
					});

					name.setValue("");
					time.setValue("");

					this._pCreateTaskPopover.then(function (popover) {
						popover.close();
					});

					oModel.refresh(true);
				} else {
					MessageToast.show("Необходимо заполнить оба поля");
				}
			},

			handleAppointmentDragEnter: function (oEvent) {
				if (
					this.isAppointmentOverlap(oEvent, oEvent.getParameter("calendarRow"))
				) {
					oEvent.preventDefault();
				}
			},

			handleAppointmentDrop: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					oCalendarRow = oEvent.getParameter("calendarRow"),
					oModel = this.getView().getModel(),
					oAppBindingContext = oAppointment.getBindingContext(),
					oRowBindingContext = oCalendarRow.getBindingContext();

				var handleAppointmentDropBetweenRows = function () {
					var aPath = oAppBindingContext.getPath().split("/"),
						iIndex = aPath.pop(),
						sRowAppointmentsPath = aPath.join("/");

					oRowBindingContext
						.getObject()
						.appointments.push(
							oModel.getProperty(oAppBindingContext.getPath())
						);

					oModel.getProperty(sRowAppointmentsPath).splice(iIndex, 1);
				};

				oModel.setProperty("start", oStartDate, oAppBindingContext);
				oModel.setProperty("end", oEndDate, oAppBindingContext);

				if (oAppointment.getParent() !== oCalendarRow) {
					handleAppointmentDropBetweenRows();
				}

				oModel.refresh(true);
			},

			handleAppointmentResize: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate");

				if (!this.isAppointmentOverlap(oEvent, oAppointment.getParent())) {
					oAppointment.setStartDate(oStartDate).setEndDate(oEndDate);
				}
			},

			isAppointmentOverlap: function (oEvent, oCalendarRow) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					bAppointmentOverlapped;

				bAppointmentOverlapped = oCalendarRow
					.getAppointments()
					.some(function (oCurrentAppointment) {
						if (oCurrentAppointment === oAppointment) {
							return;
						}

						var oAppStartTime = oCurrentAppointment.getStartDate().getTime(),
							oAppEndTime = oCurrentAppointment.getEndDate().getTime();

						if (
							oAppStartTime <= oStartDate.getTime() &&
							oStartDate.getTime() < oAppEndTime
						) {
							return true;
						}

						if (
							oAppStartTime < oEndDate.getTime() &&
							oEndDate.getTime() <= oAppEndTime
						) {
							return true;
						}

						if (
							oStartDate.getTime() <= oAppStartTime &&
							oAppStartTime < oEndDate.getTime()
						) {
							return true;
						}
					});

				return bAppointmentOverlapped;
			},
		});
	}
);
