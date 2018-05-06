process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();
require('dotenv').config();
const fs = require('fs');
const Moment = require('moment');
const MVDB = new (require('mv_models'))(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, {maxTransactionRetryTime: 1500});

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

var sources = (function(path){
	var ret = [];
	var files = fs.readdirSync(path);
	for (file of files) {
		var stat = fs.statSync(path+'/'+file);
		if (!stat.isDirectory()) {
			var source = require(path+'/'+file);
			if(typeof source.nodeUpdates != 'function'){
				console.log('Source', path+'/'+file, 'is missing nodeUpdates');
				source.nodeUpdates = function(node){return {};};
			}
			if(typeof source.nodeChildren != 'function'){
				console.log('Source', path+'/'+file, 'is missing nodeChildren');
				source.nodeChildren = function(node){return;};
			}
			ret.push(source);
		}
	}
	return ret;
})('./sources');

function updateNodeData(node, source, cb){
	source.nodeUpdates(node, function(err, updates){
		if(err){
			cb(err, null);
		}else{
			if(typeof updates == 'object' && updates != {}){
				updates.last_updated = Moment().format();
				MVDB.Data.upsertPath(path, updates);
			}
		}
	});
}

function updateNodeChildren(node, source, cb){
	source.nodeChildren(node, function(err, children){
		var c;
		if(!err){
			if(Array.isArray(children)){
				for (var child of children) {
					MVDB.Data.upsertPath(path.concat([child]), {});
				}
			}
		}
		cb(err, c);
	});
}

function updatePathChildren(path, children, cb){
	for(var child of children){
		var child_path = path.concat({identifier:child.properties.identifier, type: child.labels[0]});
		updatePath(child_path, cb);
	}
};

function updateNode(node, sources, cb){
	for(var source of sources){
		updateNodeData(node, source, function(err, data){
			if(err){
				cb(err);
			}
		});
		updateNodeChildren(node, source, function(err, data){
			if(err){
				cb(err);
			}else{
				updatePathChildren(path, children, cb);
			}
		});
	}
}

async function updatePath(path, cb){
	if (path.length != 0) {
		MVDB.Data.get(path, function(err, node){
			if(err){
				cb(err, null);
			}else{
				updateNode(node, sources, cb);
			}
		});
	}
	MVDB.Data.getChildren(path, function(err, children){
		if(err){
			cb(err, null);
		}else{
			updatePathChildren(path, children);
		}
	});
}

try{
	updatePath([], function(err){
		if(err){
			console.trace(err);
		}
	});
}catch(e){
	console.log('CAUGHT THROWN ERROR!');
	console.log(e);
}finally{
	MVDB.close();
}
