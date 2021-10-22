sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment",
		"sap/ui/core/library",
		"model/formatter",
	],
	function (
		Controller,
		JSONModel,
		MessageToast,
		Fragment,
		coreLibrary,
		formatter
	) {
		"use strict";

		var ValueState = coreLibrary.ValueState;

		return Controller.extend("myCalendar.controller.Main", {
			myformatter: formatter,

			onInit: function () {
				this._oCalendarContainer = this.byId("mainContent");

				// create model
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date(),
					people: [
						{
							name: "Общий пул задач",
							appointments: [
								{
									start: new Date("2021", "9", "22", "09", "00"),
									end: new Date("2021", "9", "22", "09", "50"),
									title: "Team sync",
								},
								{
									start: new Date("2021", "9", "24", "10", "00"),
									end: new Date("2021", "9", "24", "18", "00"),
									title: "Sync John",
								},
							],
						},
						{
							pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
							name: "John Miller",
							role: "team member",
							appointments: [
								{
									start: new Date("2021", "9", "21", "09", "00"),
									end: new Date("2021", "9", "23", "11", "00"),
									title: "Team sync",
								},
								{
									start: new Date("2021", "9", "22", "09", "0"),
									end: new Date("2021", "9", "22", "11", "0"),
									title: "Morning Sync",
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
								},
								{
									start: new Date("2021", "9", "24", "10", "00"),
									end: new Date("2021", "9", "24", "20", "00"),
									title: "Sync John",
								},
							],
						},
					],
				});
				this.getView().setModel(oModel);
			},

			// handler select appointment for edit task
			selectAppointment: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment");
				var oView = this.getView();

				if (!oAppointment.getSelected() && this._pDetailsPopover) {
					this._pDetailsPopover.then(function (oDetailsPopover) {
						oDetailsPopover.close();
					});
					return;
				}

				if (!this._pDetailsPopover) {
					this._pDetailsPopover = Fragment.load({
						id: oView.getId(),
						name: "myCalendar.view.ShowTask",
						controller: this,
					}).then(function (oDetailsPopover) {
						oView.addDependent(oDetailsPopover);
						return oDetailsPopover;
					});
				}

				this._pDetailsPopover.then(
					function (oDetailsPopover) {
						oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
						oDetailsPopover.openBy(oAppointment);
					}.bind(this)
				);
			},

			// get path for change data
			_appointmentOwnerChange: function (oNewAppointmentDialog) {
				var iSpathPersonId =
						this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
					iSelectedPerson = this.byId("selectPerson").getSelectedIndex(),
					sTempPath = this.sPath,
					iLastElementIndex = oNewAppointmentDialog
						.getModel()
						.getProperty(
							"/people/" + iSelectedPerson.toString() + "/appointments/"
						)
						.length.toString();

				if (iSpathPersonId !== iSelectedPerson.toString()) {
					sTempPath = "".concat(
						"/people/",
						iSelectedPerson.toString(),
						"/appointments/",
						iLastElementIndex.toString()
					);
				}

				return sTempPath;
			},

			// handler DragAndDrop functions
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

			// change task date by Resize
			handleAppointmentResize: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate");

				oAppointment.setStartDate(oStartDate).setEndDate(oEndDate);
			},

			// check condition for appointment
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

			// ############################ BUTTONS ####################################

			// handler edit-button in showTask form. Show ShowTask fragment with data
			handleEditButton: function () {
				var oDetailsPopover = this.byId("detailsTaskPopover");
				this.sPath = oDetailsPopover.getBindingContext().getPath();
				var oView = this.getView();
				oDetailsPopover.close();

				if (!this._pEditAppointmentDialog) {
					this._pEditAppointmentDialog = Fragment.load({
						id: this.getView().getId(),
						name: "myCalendar.view.EditTask",
						controller: this,
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}

				this._pEditAppointmentDialog.then(
					function (oDialog) {
						var oAppointment = oDialog.getModel().getProperty(this.sPath),
							oSelectedIntervalStart = oAppointment.start,
							oSelectedIntervalEnd = oAppointment.end,
							oDateTimePickerStart = this.byId("startDate"),
							oDateTimePickerEnd = this.byId("endDate"),
							iSelectedPersonId =
								this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
							sSelectedTitle = oAppointment.title,
							oPersonSelected = this.byId("selectPerson"),
							oStartDate = this.byId("startDate"),
							oEndDate = this.byId("endDate"),
							oTitleInput = this.byId("inputTitle"),
							sTempTitle = "Редактирование Задачи";

						oPersonSelected.setSelectedIndex(iSelectedPersonId);
						oStartDate.setDateValue(oSelectedIntervalStart);
						oEndDate.setDateValue(oSelectedIntervalEnd);
						oTitleInput.setValue(sSelectedTitle);

						oDateTimePickerStart.setValueState(ValueState.None);
						oDateTimePickerEnd.setValueState(ValueState.None);

						var oStartDate = this.byId("startDate"),
							oEndDate = this.byId("endDate"),
							bEnabled =
								oStartDate.getValueState() !== ValueState.Error &&
								oStartDate.getValue() !== "" &&
								oEndDate.getValue() !== "" &&
								oEndDate.getValueState() !== ValueState.Error;

						oDialog.getBeginButton().setEnabled(bEnabled);

						oDialog.setTitle(sTempTitle);
						oDialog.open();
					}.bind(this)
				);
			},

			// handler close-button in showTask fragment
			editTaskCancelButton: function () {
				this._pEditAppointmentDialog.then(function (popover) {
					popover.close();
				});
			},

			// save task with new data
			handleDialogSaveButton: function () {
				var oStartDate = this.byId("startDate"),
					oEndDate = this.byId("endDate"),
					sInputTitle = this.byId("inputTitle").getValue(),
					oNewAppointmentDialog = this.byId("editTaskDialog");

				var sAppointmentPath = this._appointmentOwnerChange(
						oNewAppointmentDialog
					),
					oModel = this.getView().getModel();

				oModel.setProperty(sAppointmentPath + "/title", sInputTitle);
				oModel.setProperty(
					sAppointmentPath + "/start",
					oStartDate.getDateValue()
				);
				oModel.setProperty(sAppointmentPath + "/end", oEndDate.getDateValue());

				oNewAppointmentDialog.close();
			},

			// Handler of the "Create Task" button
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
				var name = this.getView().byId("taskName");
				var time = this.getView().byId("taskTime");

				if (!(name.getValue() && time.getValue())) {
					MessageToast.show("Необходимо заполнить оба поля");
					return;
				}

				var oModel = this.getView().getModel();
				var freeTasks = oModel.oData.people[0].appointments;
				var dateEnd = new Date();
				var timeVal = parseInt(parseFloat(time.getValue()) * 8);

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
			},

			// Handler of the "Create Person" button
			newPersonCreate: function (oEvent) {
				var oSource = oEvent.getSource(),
					oView = this._oCalendarContainer;
				if (!this._pCreatePersonPopover) {
					this._pCreatePersonPopover = Fragment.load({
						id: this.getView().getId(),
						name: "myCalendar.view.CreatePerson",
						controller: this,
					}).then(function (oCreatePersonPopover) {
						oView.addDependent(oCreatePersonPopover);
						return oCreatePersonPopover;
					});
				}
				this._pCreatePersonPopover.then(function (oCreatePersonPopover) {
					if (oCreatePersonPopover.isOpen()) {
						oCreatePersonPopover.close();
					} else {
						oCreatePersonPopover.openBy(oSource);
					}
				});
			},

			saveNewPerson: function (oEvent) {
				var name = this.getView().byId("personName");

				if (!name.getValue()) {
					MessageToast.show("Необходимо заполнить Имя пользователя");
					return;
				}

				var position = this.getView().byId("personPosition");

				this.getView().getModel().getProperty("/people").push({
					name: name.getValue(),
					role: position.getValue(),
					appointments: Array(),
				});

				this._pCreatePersonPopover.then(function (popover) {
					popover.close();
				});

				name.setValue("");
				position.setValue("");

				oModel.refresh(true);
			},

			// handler for delete button in ShowTask fragment
			handleDeleteAppointment: function () {
				var oDetailsPopover = this.byId("detailsTaskPopover"),
					oBindingContext = oDetailsPopover.getBindingContext(),
					oAppointment = oBindingContext.getObject(),
					iPersonIdStartIndex =
						oBindingContext.getPath().indexOf("/people/") + "/people/".length,
					iPersonId = oBindingContext.getPath()[iPersonIdStartIndex];

				if (iPersonId == 0) {
					var oModel = this.getView().getModel(),
						sTempPath = "/people/" + iPersonId + "/appointments",
						aPersonAppointments = oModel.getProperty(sTempPath),
						iIndexForRemoval = aPersonAppointments.indexOf(oAppointment);

					if (iIndexForRemoval !== -1) {
						aPersonAppointments.splice(iIndexForRemoval, 1);
					}

					oModel.setProperty(sTempPath, aPersonAppointments);

					oDetailsPopover.close();
				} else {
					MessageToast.show("Удалять задачи можно только из общего пула");
				}
			},
		});
	}
);
