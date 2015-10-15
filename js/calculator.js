/*
TurboTax ACA Subsidy Eligibility Calculator
Client: Intuit - TurboTax
By: Column Five Media, Inc.
Author: Benjamin Cordier
*/

/*
Knockout Custom Bindings
*/
	
/*
Knockout Custom Bindings
*/
	
// Comma Number Binding
ko.bindingHandlers.commaNumber  	= {
	init 	: function (element, valueAccessor) {
		var value = numeral(ko.utils.unwrapObservable(valueAccessor())).format('0,0.00');
		console.log(value);
		$(element).text(value);
		return value
	},
	update 	: function (element, valueAccessor) {
		var value = numeral(ko.utils.unwrapObservable(valueAccessor())).format('0,0.00');
		console.log(value);
		$(element).text(value);
		return value
	}
};

// Monetary Number Binding
ko.bindingHandlers.monetaryNumber  	= {
	init 	: function (element, valueAccessor) {
		var value = numeral(ko.utils.unwrapObservable(valueAccessor())).format('$0,0.00');
		$(element).text(value);
		return value
	},
	update 	: function (element, valueAccessor) {
		var value = numeral(ko.utils.unwrapObservable(valueAccessor())).format('$0,0.00');
		$(element).text(value);
		return value
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
		var self = this;
		this.getURL 			= config.getURL,
		this.element 			= config.element,
		this.inputElement 		= config.inputElement,
		this.nameDateElement 	= config.nameDateElement,
		this.nameDateClass 		= config.nameDateClass,
		this.dayElement 		= config.dayElement,
		this.monthElement 		= config.monthElement,
		this.yearElement	 	= config.yearElement,
		this.navigation 		= config.navigation,
		this.navigationValidate = config.navigationValidate,
		this.submitElement 		= config.submitElement,
		this.page 				= config.page,
		this.pageCount 			= config.page.count,
		this.currentPage 		= config.page.start,
		this.numKeys 			= config.numKeys,
		this.zipKeys 			= config.zipKeys,
		this.editKeys 			= config.editKeys,
		this.houseMemberValues 	= config.houseMemberValues,
		this.dayValues 			= config.dayValues,
		this.monthValues 		= config.monthValues,
		this.yearValues 		= config.yearValues,
		this.houseMembers 		= ko.observable(),
		this.nameDatesArray 	= ko.observableArray([]),
		this.nameDates 			= ko.computed(function () {
			self.nameDatesArray([]);
			if (typeof self.houseMembers() === 'undefined') {
				self.nameDatesArray.push({
					element : self.nameDateClass + 0,
					index 	: 0,
					name  	: '',
					day 	: undefined,
					month 	: undefined,
					year 	: undefined
				});
			} else {
				for (var i = 0; i < self.houseMembers(); i++) {
					var nameDate = {
						element : self.nameDateClass + i,
						index 	: i,
						name  	: '',
						day 	: undefined,
						month 	: undefined,
						year 	: undefined
					};
					self.nameDatesArray.push(nameDate);
				}
			}
			return self.nameDatesArray;
		}),
		this.houseIncome 		= ko.observable(undefined),
		this.houseIncomeValue 	= ko.computed(function () {
			return numeral().unformat(self.houseIncome());
		}),
		this.zipcode 			= ko.observable(undefined),
		this.annualSubsidy 		= ko.observable(0),
		this.monthlySubsidy 	= ko.observable(0),
		this.disclosureActive 	= false,
		this.previousPage,
		this.result;
		return this;
	},
	// Render Page Method
	navigateTo				: function (page, validate) {
		var self = this;
		if (validate === true) {
			// Default Navigation
			var l = $(self.page.indexTag + self.currentPage + " " + ".input:invalid").length;
			// console.log($(self.page.indexTag + self.currentPage + " " + ".input:invalid"));
			// console.log(l);
			if (l === undefined) {
				$(self.page.indexTag + self.currentPage).hide();
				$(self.page.indexTag + page).show();
				self.previousPage 	= self.currentPage;
				self.currentPage 	= page;
			} else if (l > 0) {
				return
			} else {
				$(self.page.indexTag + self.currentPage).hide();
				$(self.page.indexTag + page).show();
				self.previousPage 	= self.currentPage;
				self.currentPage 	= page;
			}
		} else {
			if (page === "enterDisclosures") {
				// Enter Disclosures Page
				$(self.page.indexTag + self.currentPage).hide();
				$(self.element + " #disclosures").show();
			} else if (page === "exitDisclosures") {
				// Exit Disclosures Page
				$(self.element + " #disclosures").hide();
				$(self.page.indexTag + self.currentPage).show();
			} else if (page === 1) {
				// Restart
				$(self.page.indexTag + self.currentPage).hide();
				$(self.page.indexTag + page).show();
				self.previousPage 	= self.currentPage;
				self.currentPage 	= page;
				self.houseMembers(undefined);
				self.nameDatesArray([]);
				self.houseIncome(undefined);
				self.zipcode(undefined)
				self.annualSubsidy(0);
				self.monthlySubsidy(0);
			} else {
				$(self.page.indexTag + self.currentPage).hide();
				$(self.page.indexTag + page).show();
				self.previousPage 	= self.currentPage;
				self.currentPage 	= page;
			}
		}
		return this;
	},
	// Query API
	queryAPI 				: function () {
		var self = this,
			obj  = {};
		// Setup Query JSON
		obj["tax_family_size"] 	= self.houseMembers();
		obj["income"] 			= self.houseIncome();
		obj["zip_code"] 		= self.zipcode();
		if (self.houseMembers() < 2) {
			var primary = self.nameDatesArray()[0];
			obj["primary_dob"] 		= primary.month + "-" + primary.day + "-" + primary.year;
		} else if (self.houseMembers() < 3) {
			var primary = self.nameDatesArray()[0],
				spouse 	= self.nameDatesArray()[1];
			obj["primary_dob"] 		= primary.month + "-" + primary.day + "-" + primary.year;
			obj["spouse_dob"] 		= spouse.month + "-" + spouse.day + "-" + spouse.year;
		} else {
			var primary = self.nameDatesArray()[0],
				spouse 	= self.nameDatesArray()[1],
				childs 	= '';
			obj["primary_dob"] 		= primary.month + "-" + primary.day + "-" + primary.year;
			obj["spouse_dob"] 		= spouse.month + "-" + spouse.day + "-" + spouse.year;
			for (var i = 2; i < self.nameDatesArray().length; i++) {
				var child = self.nameDatesArray()[i];
				if (i === self.nameDatesArray().length - 1) {
					childs += child.month + "-" + child.day + "-" + child.year;
				} else {
					childs += child.month + "-" + child.day + "-" + child.year + ",";
				}
			}
			obj["children_dob"] 	= childs;
		}
		// Submit to API
		$.ajax({
			url: self.getURL + JSON.stringify(obj),
			type: "GET",
			contentType: "application/json",
			dataType: "json",
		}).done(function (data) {
			console.log("XHR Status: Response Received.")
			try {
				if (data.response.estimates[0].subsidy.annual) {
					self.annualSubsidy(data.response.estimates[0].subsidy.annual);
				}
				if (data.response.estimates[0].subsidy.monthly) {
					self.monthlySubsidy(data.response.estimates[0].subsidy.monthly);
				}
			} catch (error) {
				for (var i = 0; i < data.error.errors.length; i++) {
					console.log("Error:", data.error.errors[i].message, "-", data.error.errors[i].actual);
				}
			}
		}).fail(function (error) {
			console.log("Error: There was a problem connecting to the API, our apologies! Please try again later.")
		}).always(function () {
			console.log("XHR Status: Request Complete.")
		});
	}
};

/*
Instantiate Calculator
*/

var config 		= {
	element 				: '#calculator-wrapper',
	inputElement 			: '#calculator-wrapper .input',
	navigation 				: '#calculator-wrapper .navigation',
	navigationValidate 		: '#calculator-wrapper .navigation.validate',
	nameDateElement 		: '#calculator-wrapper .name-dob',
	nameDateClass 			: 'name-dob-',
	dayElement 				: '#calculator-wrapper .input.day',
	monthElement 			: '#calculator-wrapper .input.month',
	yearElement 			: '#calculator-wrapper .input.year',
	submitElement 			: '#calculator-wrapper .submit',
	numKeys 				: [44, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57], // An Array Of ASCII Number Key Codes,
	zipKeys 				: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
	editKeys 				: [8, 9, 37, 38, 39, 40, 127], // An Array Of ASCII Edit Key Codes (Arrows, Tabs, Backspace, Delete)
	houseMemberValues 		: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	dayValues 				: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
	monthValues 			: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
	yearValues 				: ['2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000', '1999', '1998', '1997', '1996', '1995', '1994', '1993', '1992', '1991', '1990', '1989', '1988', '1987', '1986', '1985', '1984', '1983', '1982', '1981', '1980', '1979', '1978', '1977', '1976', '1975', '1974', '1973', '1972', '1971', '1970', '1969', '1968', '1967', '1966', '1965', '1964', '1963', '1962', '1961', '1960', '1959', '1958', '1957', '1956', '1955', '1954', '1953', '1952', '1951', '1950', '1949', '1948', '1947', '1946', '1945', '1944', '1943', '1942', '1941', '1940', '1939', '1938', '1937', '1936', '1935', '1934', '1933', '1932', '1931', '1930', '1929', '1928', '1927', '1926', '1925', '1924', '1923', '1922', '1921', '1920', '1919', '1918', '1917', '1916', '1915', '1914', '1913', '1912', '1911', '1910', '1909', '1908', '1907', '1906', '1905', '1904', '1903', '1902', '1901'],
	page 					: {
		indexTag 				: '#page-',
		start 					: 1,
		count 					: 7
	},
	getURL 					: 'api.php/getSubsidy/'
};

var calculator 	= new Calculator(config);

/*
Apply Bindings
*/

ko.applyBindings(calculator, document.getElementById(calculator.element));

/*
Calculator jQuery Event Bindings
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

// Restrict Length of Day Input
$(calculator.dayElement).keypress(function() {
    if (this.value.length >= 2) {
        return false;
    }
});

// Restrict Length of Month Input
$(calculator.monthElement).keypress(function() {
    if (this.value.length >= 2) {
        return false;
    }
});

// Restrict Length of Year Input
$(calculator.yearElement).keypress(function() {
    if (this.value.length >= 4) {
        return false;
    }
});

// Static Navigation Binding
$(calculator.navigation).on("click touchend pointerup", function (e) {
	var page = $(this).data("to");
	calculator.navigateTo(page, false);
});

// Validate Navigation Binding
$(calculator.navigationValidate).on("click touchend pointerup", function (e) {
	var page = $(this).data("to");
	calculator.navigateTo(page, true);
});

// Submit Binding
$(calculator.submitElement).on("click touchend pointerup", function (e) {
	var page = $(this).data("to");
	calculator.navigateTo(page, true);
	calculator.queryAPI();
});