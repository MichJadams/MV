const Request = require('request');
const Moment = require('moment');
const XBRL = require('xbrl');
const Throttle = require('throttle');

var throttleQueue = Throttle(1000);

function fetchFilings(cik, cb){
	var url = 'https://www.sec.gov/Archives/edgar/data/'+cik+'/index.json';
	throttleQueue.enqueue(Request, url, function(err, request, body){
		var data = null
		if(!err){
			data = JSON.parse(body.toString('utf8')).directory.item;
		}
		cb(err, data);
	});
}

function fetchFilings(cik, ascession, cb){
	var url = 'https://www.sec.gov/Archives/edgar/data/'+cik+'/'+accession+'/index.json';
	throttleQueue.enqueue(Request, url, function(err, request, body){
		var data = null
		if(!err){
			data = JSON.parse(body.toString('utf8'));
		}
		cb(err, data);
	});
}

function fetchXBRL(cik, accession, cb){
	fetchFiling(cik, function(err, filing){
		if(err){
			cb(err, null);
		}else{
			for(var item of filing){
				var file_url = 'https://www.sec.gov/Archives/edgar/data/'+cik+'/'+accession+'/'+item.name;
				if (item.name.match(/.*xbrl\.zip/)) {
					request(file_url, {encoding: null}, function(err, data){
						if(err){
							cb(err, null);
						}else{
							cb(null, XBRL.fromZip(data));
						}
					});
				}
			}
		}
	});
}

// async function fetchFilings(cik){
// 	return (await MVHttp.getJSON('https://www.sec.gov/Archives/edgar/data/'+cik+'/index.json')).directory.item;
// };

// async function fetchFiling(cik, accession){
// 	return MVHttp.getJSON('https://www.sec.gov/Archives/edgar/data/'+cik+'/'+accession+'/index.json');
// };

// async function fetchXBRL(cik, accession){
// 	var filing = (await MVHttp.getJSON('https://www.sec.gov/Archives/edgar/data/'+cik+'/'+accession+'/index.json')).directory.item;
// 	for(var item of filing){
// 		var file_url = 'https://www.sec.gov/Archives/edgar/data/'+cik+'/'+accession+'/'+item.name;
// 		//console.log('Searching', file_url);
// 		if (item.name.match(/.*xbrl\.zip/)) {
// 			//console.log('Matched!!! downloading!');
// 			var zip = await MVHttp.getUrl(file_url);
// 			return XBRL.fromZip(zip);
// 		}
// 	}
// };

var EDGAR = {
	fetchFilings: fetchFilings,
	fetchFiling: fetchFiling,
	fetchXBRL: fetchXBRL
};
module.exports = EDGAR;

EDGAR.report_properties = {
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

EDGAR.nodeUpdates = function(node, cb){
	return;
}

EDGAR.nodeChildren = function(node, cb){
	var children = [];
	if (node.properties.cik != null) {
		var last_updated = Moment(node.properties.last_updated);
		var updated_quarter = Moment(last_updated).startOf('quarter');
		var current_quarter = Moment().startOf('quarter');
		if (!last_updated.isSame(current_quarter)) {
			children = [{identifier: current_quarter.format('YYYY[Q]Q'), type:'Quarter'}];
		}
	}
	cb(null, children);
}

// EDGAR.updateNode = async function(MVDB, path, node){
// 	var cik = node.properties.cik;
// 	var filings = await EDGAR.fetchFilings(cik);

// 	for (var filing of filings) {
// 		var accession = filing.name
// 		var report = await EDGAR.fetchXBRL(cik, accession);
// 		if(report){
// 			var data = {};
			
// 			var report_type = report.getFacts('dei:DocumentType')[0];
			
// 			for(var property in EDGAR.report_properties){
// 				var facts = report.getFacts('us-gaap:'+property);
// 				if (!facts) {
// 					console.log('Skipping', 'us-gaap:'+property);
// 					continue;
// 				}
// 				for (var i = 0; i < facts.length; i++) {
// 					if (facts[i].context.entity.segment != null) {
// 						continue;
// 					}
// 					if (facts[i].context.period.isWithin(report_type.context.period.start, report_type.context.period.end) ) {
// 						continue;
// 					}

// 					data[EDGAR.report_properties[property]] = facts[i].value;
// 				}
// 				if (data[EDGAR.report_properties[property]] == null) {
// 					console.log('Failed', 'us-gaap:'+property);
// 				}
// 			}
			
// 			var year = report.getFacts('dei:DocumentFiscalYearFocus')[0].value;
// 			var quarter = report.getFacts('dei:DocumentFiscalPeriodFocus')[0].value;

// 			var child_path = path.concat([
// 				{identifier: year+quarter, type: 'Quarter'},
// 				{identifier: 'FinancialReport', type: 'FinancialReport'}
// 			]);

// 			console.log('PATH:', child_path);
// 			console.log('DATA:', data);

// 			await MVDB.Data.upsertPath(child_path, data);

// 			//process.exit();
// 		}
// 	}
// }



