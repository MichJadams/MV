const fs = require('fs');
const Moment = require('moment').utc;
const parseXML = async function(string){
	var parser = require('xml2js').parseString;
	return new Promise(function(resolve, reject){
		parser(string, function(err, data){
			if (err) {
				reject(err);
			}else{
				resolve(data);
			}
		});
	});
};


module.exports = async function(str){
	//console.log(xml);
	var xml = await parseXML(str);
	var obj = xml['xbrli:xbrl'];
	is_inline = true;
	if (obj == null) {
		
		fs.writeFileSync('xbrl2.json', JSON.stringify(xml));
		is_inline = false;
		obj = xml['xbrl'];

		//console.log(obj);
	}


	var contexts = {};

	for(var c of obj[is_inline?'xbrli:context':'context']){
		//contexts[context.$.id] = Context(context['xbrli:entity'], context['xbrli:period'], context['xbrli:scenario']);
		var context = Context(c, is_inline);
		contexts[context.id] = context;
		
		//console.log(context);
		//console.log(contexts[context.$.id]);
	}
	
	var document_focus_context = contexts[obj['dei:DocumentFiscalPeriodFocus'][0].$.contextRef];
	var document_type = obj['dei:DocumentType'][0]._;

	if (document_type != '10-Q') {
		return {error: 'Not 10-Q'};
	}

	var ret = {quarter: document_focus_context.period.end.format('YYYY[Q]Q'), type:document_type};

	var entryNames = {
		Assets: 'Assets',
		Revenues: 'Revenues',
		PremiumsEarnedNet: 'PremiumsEarnedNet',
		InvestmentIncomeInvestmentExpense: 'InvestmentIncomeInvestmentExpense',
		BenefitsLossesAndExpenses: 'BenefitsLossesAndExpenses',
		OperatingExpenses: 'OperatingExpenses',
		InterestExpense: 'InterestExpense',
		NetIncomeLoss: 'NetIncomeLoss',
		Investments: 'Investments',
		UnearnedPremiums: 'UnearnedPremiums',
		DeferredPolicyAcquisitionCosts: 'DeferredPolicyAcquisitionCosts',
		LongTermDebt: 'LongTermDebt',
		PolicyholderBenefitsAndClaimsIncurredNet: 'PolicyholderBenefitsandClaimsIncurredNet',
		PolicyholderBenefitsAndClaimsIncurredGross: 'PolicyholderBenefitsandClaimsIncurredGross',
		//LiabilityForUnpaidClaimsAndClaimsAdjustmentExpense: 'LiabilityForUnpaidClaimsAndClaimsAdjustmentExpense',
		Liabilities: 'Liabilities',
		AccumulatedOtherComprehensiveIncomeLossNetOfTax: 'AccumulatedOtherComprehensiveIncomeLossNetOfTax',
		StockholdersEquity: 'StockholdersEquity'
	};

	for(var entry in entryNames){
		ret[entryNames[entry]] = getEntryForCurrentQuarter(obj, contexts, 'us-gaap:'+entry);
	}
	

	return ret;
};








function getEntryForCurrentQuarter(doc, contexts, entryName){
	var document_focus_context = contexts[doc['dei:DocumentFiscalPeriodFocus'][0].$.contextRef];
	var entries = doc[entryName];
	if (entries == null) {
		console.log('Entry not found', entryName);
		return null;
	}
	
	for(var entry of entries){
		var context = contexts[entry.$.contextRef];
		if (context == null) {
			// console.log('Context not found', line.$.contextRef);
			continue;
		}

		if (context.period.endsInQuarter(document_focus_context.period.end.format('YYYY-Q'))) {
			//console.log(context.entity.segment);
			if (context.entity.segment == null) {
				//console.log('null segment value', line._);
				return entry._;
			}
		}
	}
	return null;
}






function Context(node, is_inline = true){
	//console.log(node);

	var e = node[is_inline?'xbrli:entity':'entity'][0];
	var p = node[is_inline?'xbrli:period':'period'][0];
	var s = null;
	var id = node.$.id;

	var seg = e[is_inline?'xbrli:segment':'segment'];
	var entity = {id: e[is_inline?'xbrli:identifier':'identifier'][0]._, segment: seg};


	var period = p;
	if (period[is_inline?'xbrli:instant':'instant']) {
		//console.log('Instant', period['xbrli:instant'][0]);
		period = Period(period[is_inline?'xbrli:instant':'instant'][0]);
	}else if(period[is_inline?'xbrli:startDate':'startDate']){
		//console.log('Range', period['xbrli:startDate'][0], period['xbrli:endDate'][0]);
		period = Period(period[is_inline?'xbrli:startDate':'startDate'][0], period[is_inline?'xbrli:endDate':'endDate'][0]);
	}


	var scenario = s;


	var ret = {id: id, entity: entity, period: period, scenario: scenario};

	//console.log(ret);
	return ret;
}





var Period = function(start, end){
	var s = Moment(start, 'YYYY-MM-DD');
	var e = Moment(end, 'YYYY-MM-DD');
	
	
	var ret = Object.create(Period.prototype);

	ret.start = s.isValid()?s:null;
	ret.end = e.isValid()?e:null;

	return ret;
}
Period.prototype = {
	isCurrentQuarter: function(){
		var start = Moment().startOf('quarter');
		var end = Moment().endOf('quarter');

		if (this.start && !this.start.isBetween(start, end, null, '[]')) {return false;}
		if (this.end && !this.end.isBetween(start, end, null, '[]')) {return false;}
		return true;
	},
	isLastQuarter: function(){
		var start = Moment().startOf('quarter').subtract(1, 'Q');
		var end = Moment().endOf('quarter').subtract(1, 'Q');

		console.log(Moment().startOf('quarter'));
		console.log(start);
		console.log(start.subtract(1, 'Q'));

		if (this.start && !this.start.isBetween(start, end, null, '[]')) {return false;}
		if (this.end && !this.end.isBetween(start, end, null, '[]')) {return false;}
		return true;
	},
	isInQuarter: function(quarter){
		var date = Moment(quarter, 'YYYY-Q');
		var start = date.clone();
		var end = date.clone().add(1, 'Q');

		if (this.start && !this.start.isBetween(start, end, null, '[)')) {return false;}
		if (this.end && !this.end.isBetween(start, end, null, '[)')) {return false;}
		return true;	
	},
	endsInQuarter: function(quarter){
		var date = Moment(quarter, 'YYYY-Q');
		var start = date.clone();
		var end = date.clone().add(1, 'Q');

	//	if (this.start && !this.start.isBetween(start, end, null, '[)')) {return false;}
		if (this.end && !this.end.isBetween(start, end, null, '[)')) {return false;}
		return true;	
	}
};

