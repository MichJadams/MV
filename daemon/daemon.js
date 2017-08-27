process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();
require('dotenv').config();
const fs = require('fs');
const Moment = require('moment');
const MVDB = new (require('mv_interface'))(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, {maxTransactionRetryTime: 1500});

async function wait(ms){
	return new Promise(function(resolve, reject){
		setTimeout(resolve, ms);
	});
}

// var companies = {
// 	rnr: '913144',
// 	trv: '86312',
// 	aig: '5272',
// 	all: '899051',
// 	pgr: '80661',
// 	cb:  '896159',
// 	hig: '874766',

// 	Y: '775368',
// 	ACGL: '947484',
// 	AHL: '1267395',
// 	AXS: '1214816',
// 	RE: '1095073',
// 	////FFH: '915191',    // Is forign company, submits 6-Ks in place of 10-Ks
// 	GLRE: '1385613',
// 	TPRE: '1576018',
// 	VR: '1348259',

// 	AWH: '1163348',

// 	AFG: '1042046',
// 	AFSI: '1365555',
// 	AGII: '1091748',
// 	'BRK.A': '1067983',
// 	CINF: '20286',
// 	CNA: '21175',
// 	EIG: '1379041',
// 	THG: '944695',
// 	IPCC: '1195933',
// 	IFC: '52617',
// 	KMPR: '860748',
// 	MKL: '1096343',
// 	MCY: '64996',
// 	NAVG: '793547',
// 	ORI: '74260',
// 	PRA: '1127703',
// 	PGR: '80661',
// 	RLI: '84246',
// 	SAFT: '1172052',
// 	SIGI: '230557',
// 	////STFC: '874977', // Has dumb html format
// 	UFCS: '101199',
// 	WTM: '776867',
// 	WRB: '11544',
// 	XL: '875159',

// 	AFL: '4977',
// 	AEL: '1039828',
// 	////ATH: '1527469', // Has dumb html format
// 	CNO: '1224608',
// 	FFG: '1012771',
// 	GNW: '1276520',
// 	//GWO: '',
// 	////IAG: '1203464',    // Is forign company, submits 6-Ks in place of 10-Ks
// 	LNC: '59558',
// 	////MFC: '1086888',	   // Is forign company, submits 6-Ks in place of 10-Ks
// 	MET: '1099219',
// 	PRI: '1475922',
// 	PFG: '1126328',
// 	PRU: '1137774',
// 	// //SLF: '1097362',  // Is forign company, submits 6-Ks in place of 10-Ks
// 	TMK: '320335',
// 	UNM: '5513',
// 	VOYA: '1535929',


// };


// var properties = {
// 	Assets: 'Assets',
// 	Revenues: 'Revenues',
// 	PremiumsEarnedNet: 'PremiumsEarnedNet',
// 	InvestmentIncomeInvestmentExpense: 'InvestmentIncomeInvestmentExpense',
// 	BenefitsLossesAndExpenses: 'BenefitsLossesAndExpenses',
// 	OperatingExpenses: 'OperatingExpenses',
// 	InterestExpense: 'InterestExpense',
// 	NetIncomeLoss: 'NetIncomeLoss',
// 	Investments: 'Investments',
// 	UnearnedPremiums: 'UnearnedPremiums',
// 	DeferredPolicyAcquisitionCosts: 'DeferredPolicyAcquisitionCosts',
// 	LongTermDebt: 'LongTermDebt',
// 	PolicyholderBenefitsAndClaimsIncurredNet: 'PolicyholderBenefitsandClaimsIncurredNet',
// 	PolicyholderBenefitsAndClaimsIncurredGross: 'PolicyholderBenefitsandClaimsIncurredGross',
// 	//LiabilityForUnpaidClaimsAndClaimsAdjustmentExpense: 'LiabilityForUnpaidClaimsAndClaimsAdjustmentExpense',
// 	Liabilities: 'Liabilities',
// 	AccumulatedOtherComprehensiveIncomeLossNetOfTax: 'AccumulatedOtherComprehensiveIncomeLossNetOfTax',
// 	StockholdersEquity: 'StockholdersEquity'
// };

var sources = (function(path){
	var ret = [];
	var files = fs.readdirSync(path);
	for (file of files) {
		var stat = fs.statSync(path+'/'+file);
		if (!stat.isDirectory()) {
			var source = require(path+'/'+file);
			if(typeof source.nodeUpdates != 'function'){
				console.log('Source', path+'/'+file, 'is missing nodeUpdates');
				source.nodeUpdates = async function(node){return {};};
			}
			if(typeof source.nodeChildren != 'function'){
				console.log('Source', path+'/'+file, 'is missing nodeChildren');
				source.nodeChildren = async function(node){return;};
			}
			ret.push(source);
		}
	}
	return ret;
})('./sources');



async function updatePath(path){
	console.log('updatePath');
	if (path.length != 0) {
		var node = await MVDB.Data.get(path);
		for(var source of sources){
			
			var updates = await source.nodeUpdates(node);
			if(typeof updates == 'object' && updates != {}){
				updates.last_updated = Moment().format();
				await MVDB.Data.upsertPath(path, updates);
			}
			var children = await source.nodeChildren(node);
			if(Array.isArray(children)){
				for (var child of children) {
					await MVDB.Data.upsertPath(path.concat([child]), {});
				}
			}
		}
	}
	var children = await MVDB.Data.getChildren(path);
	for(var child of children){
		var child_path = {identifier:child.properties.identifier, type: child.labels[0]};
		await wait(1000);
		await updatePath(path.concat([child_path]));
	}
}












(async function(){
	try{
		await updatePath([]);
	}catch(e){
		console.log(e);
	}finally{
		MVDB.close();
	}
})();
