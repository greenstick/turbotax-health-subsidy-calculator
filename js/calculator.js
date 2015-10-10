/*
TurboTax ACA Subsidy Eligibility Calculator
Client: Intuit - TurboTax
By: Column Five Media, Inc.
Author: Benjamin Cordier
*/

/*
Knockout Custom Bindings
*/
	
// Comma Number Binding
ko.bindingHandlers.commaNum = {
	init: function (element, valueAccessor) {
		value = ko.utils.unwrapObservable(valueAccessor());
		$(element).text(numeral(value).format('0,0'))
	},
	update: function (element, valueAccessor) {
		value = ko.utils.unwrapObservable(valueAccessor());
		$(element).text(numeral(value).format('0,0'))
	}
};

/*
Calculator Prototype
*/

var Calculator 			= function (config) {
	return this.__init__(config);
};

Calculator.prototype 	= {
	// Constructor Function
	__init__ 				: function (config) {
		this.postURL 			= config.postURL,
		this.element 			= config.element,
		this.inputElement 		= config.inputElement,
		this.navigation 		= config.navigation,
		this.page 				= config.page,
		this.pageCount 			= config.page.count,
		this.currentPage 		= config.page.start,
		this.disclosureActive 	= false,
		this.numKeys 			= [44, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57], // An Array Of ASCII Number Key Codes
		this.zipKeys 			= [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
		this.editKeys 			= [8, 9, 37, 38, 39, 40, 127], // An Array Of ASCII Edit Key Codes (Arrows, Tabs, Backspace, Delete)
		this.houseMembers 		= ko.observable(1),
		this.nameDates 			= ko.observableArray([]),
		this.houseIncome 		= ko.observable(0),
		this.zipcode 			= ko.observable(''),
		this.annualSubsidy 		= ko.observable(0),
		this.monthlySubsidy 	= ko.observable(0),
		this.previousPage,
		this.result;
		return this;
	},
	// Render Page Method
	navigateTo				: function (page) {
		var self = this;
		if (page === "enterDisclosures") {
			$(self.page.indexTag + self.currentPage).hide();
			$(self.element + " #disclosures").show();
		} else if (page === "exitDisclosures") {
			$(self.element + " #disclosures").hide();
			$(self.page.indexTag + self.currentPage).show();
		} else {
			$(self.page.indexTag + self.currentPage).hide();
			$(self.page.indexTag + page).show();
			self.previousPage 	= self.currentPage;
			self.currentPage 	= page;
		}
		return this;
	},
	// Query API
	queryAPI 				: function (args) {
		var self = this;
	}
};

/*
Instantiate Calculator & Apply Bindings
*/

var config 		= {
	element 				: '#calculator-wrapper',
	inputElement 			: '#calculator-wrapper .input',
	navigation 				: '#calculator-wrapper .navigation',
	page 					: {
		indexTag 				: '#page-',
		start 					: 1,
		count 					: 7
	},
	postURL 					: ''
};

var calculator 	= new Calculator(config);
ko.applyBindings(calculator, document.getElementById(calculator.element));

/*
Calculator Event Bindings
*/

// Zipcode Content Editable Input
$(calculator.element + " .input.zipcode").on("keydown", function (e) {
	var allowInput = false;
	// Is The Focused Element An Input?
	if (($(e.target).hasClass('input') === true)) {
		// Was A Number Key Pressed And Has The Input Limit Not Been Met?
		for (var i = 0; i < calculator.zipKeys.length; i++) {
			if (e.which === calculator.zipKeys[i] && e.target.innerHTML.length < 5) allowInput = true;
		}
		// Was An Edit Key Pressed
		for (var i = 0; i < calculator.editKeys.length; i++) {
			if (e.which === calculator.editKeys[i]) allowInput = true;
		}
		// If Above Conditions Are NOT Met, Prevent Key Input
		if (allowInput === false) return e.preventDefault();
	}
});

// Numeric Content Editable Input
$(calculator.element + " .input.number").on("keydown", function (e) {
	var allowInput = false;
	// Is The Focused Element An Input?
	if (($(e.target).hasClass('input') === true)) {
		// Was A Number Key Pressed And Has The Input Limit Not Been Met?
		for (var i = 0; i < calculator.numKeys.length; i++) {
			if (e.which === calculator.numKeys[i] && e.target.innerHTML.length < 10) allowInput = true;
		}
		// Was An Edit Key Pressed
		for (var i = 0; i < calculator.editKeys.length; i++) {
			if (e.which === calculator.editKeys[i]) allowInput = true;
		}
		// If Above Conditions Are NOT Met, Prevent Key Input
		if (allowInput === false) return e.preventDefault();
		if ($(e.target).text() == 0) $(e.target).text('');
	}
});

$(calculator.navigation).on("click touchend", function (e) {
	var page = $(this).data("to");
	calculator.navigateTo(page);
});