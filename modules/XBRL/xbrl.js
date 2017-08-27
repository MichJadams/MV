const fs = require('fs');
const AdmZip = require('adm-zip');
const Moment = require('moment').utc;

const parseXML = (function(){
	const parseProperties = {
		attrkey: 'attributes',
		charkey: 'value',
		childkey: 'children',

		explicitChildren: true,
		preserveChildrenOrder: true,
		explicitRoot: false
	};
	return function(xml){
		return require('xml2js-parser').parseStringSync(xml, parseProperties);
	}
})();



class XBRL{
	constructor(){
		this.contexts = {};
		this.facts = {};
	}

	set xml(str){
		var that = this;
		var parsed = parseXML(str);
		traverseXML(parsed, function(node){
			if (node.namespace == 'link') {
				return true;
			}
			switch(node.name){
				case 'context':
					var c = Context.fromNode(node);
					that.contexts[c.id] = c;
					return true;
				case 'unit':
					break;
				default:
					if (node.namespace == 'xbrli') {
						return false;
					}
					var namespace = node.namespace;
					var name = node.name;
					var value = node.value;
					var id;
					if (node.attributes) {
						id = node.attributes.id;
					}
					

					var fact = new Fact(namespace, name, id, value);

					if (node.attributes && node.attributes.contextRef) {
						fact.context = that.contexts[node.attributes.contextRef];
					}
					if (node.attributes && node.attributes.decimals) {
						fact.precision = node.attributes.decimals;
					}
					

					if (that.facts[fact.address] == null) {
						that.facts[fact.address] = [];
					}
					that.facts[fact.address].push(fact);
			}
			return false;
		});
	}

	getFacts(address){
		return this.facts[address];
	}



	static fromZip(data){
		if (!Buffer.isBuffer(data)) {
			data = Buffer.alloc(0);
		}
		try{
			var zip = new AdmZip(data);
			var ret = new XBRL();
			var zipEntries = zip.getEntries();
			for (var entry of zipEntries) {
				if (entry.name.match(/.*lab\.xml/)) { ret.lab = entry.getData().toString('utf8'); continue;}
				if (entry.name.match(/.*pre\.xml/)) { ret.pre = entry.getData().toString('utf8'); continue;}
				if (entry.name.match(/.*def\.xml/)) { ret.def = entry.getData().toString('utf8'); continue;}
				if (entry.name.match(/.*cal\.xml/)) { ret.cal = entry.getData().toString('utf8'); continue;}
				if (entry.name.match(/.*\.xsd/)) { ret.xsd = entry.getData().toString('utf8'); continue;}
				if (entry.name.match(/.*\.xml/)) { ret.xml = entry.getData().toString('utf8'); continue;}
			}

		}catch(e){
			throw e;
		}
		return ret;
	}
}
module.exports = XBRL;


class Fact{
	constructor(namespace, name, id, value){
		this.namespace = namespace;
		this.name = name;
		this.id = id;
		this.value = value;
	}

	get address(){
		return this.namespace+':'+this.name;
	}


}

class Context{
	constructor(id, entity, period, scenario){
		this.id = id;
		this.entity = entity;
		this.period = period;
		this.scenario = scenario;
	}

	toString(){
		var ret = 'Context'+"\n";
		ret += 'id: '+this.id+"\n";
		ret += 'Entity: '+this.entity+"\n";
		ret += 'Period: '+this.period+"\n";
		if (this.scenario != null) {
			ret += 'Scenario: '+this.scenario+"\n";
		}
		return ret;
	}


	static fromNode(node){
		var id = node.attributes.id;
		var entity;
		var period;
		var scenario;

		for(var child of node.children){
			nodeNamespacing(child);
			switch(child.name){
				case 'entity':
					entity = Entity.fromNode(child);
					break;
				case 'period':
					period = Period.fromNode(child);
					break;
				case 'scenario':
			}
		}
		return new Context(id, entity, period, scenario);
	}
}




class Entity{

	constructor(type, id, segment){
		this.type = type;
		this.id = id;
		this.segment = segment;
	}

	toString(){
		var ret = 'Entity'+"\n";
		ret += 'Type: '+this.type+"\n";
		ret += 'id: '+this.id+"\n";
		ret += 'Segment: '+JSON.stringify(this.segment)+"\n";
		return ret;
	}

	static fromNode(node){
		var type;
		var id;
		var segment;

		for(var child of node.children){
			nodeNamespacing(child);
			switch(child.name){
				case 'identifier':
					id = child.value;
					type = Entity.TYPES[child.attributes.scheme];
					break;
				case 'segment':
					segment = [];

					for(var seg of child.children){
						nodeNamespacing(seg);
						var segment_element = {};

						segment_element.name = seg.name;
						segment_element.value = seg.value;
						if (seg.attributes != null) {
							segment_element.dimension = seg.attributes.dimension;
						}

						segment.push(segment_element);
					}
					break;
			}
		}

		return new Entity(type, id, segment);
	}
}
Entity.TYPES = {
	'http://www.sec.gov/CIK' : 'CIK'
}

class Period{
	constructor(start, end){
		if (start == null && end == null) {
			this.forever = true;
		}else if (end == null) {
			this.instant = Moment(start);
		}else{
			this.start = Moment(start);
			this.end = Moment(end);
		}
	}

	toString(){
		if (this.forever == true) {
			return 'Forever';
		}
		if (this.instant != null) {
			return 'At: '+this.instant;
		}
		return 'From: '+this.start+' To: '+this.end;
	}

	static fromNode(node){
		if (node.children.length == 1) {
			nodeNamespacing(node.children[0]);
			if (node.children[0].name == 'instant') {
				return new Period(node.children[0].value);
			}else if(node.children[0].name == 'forever'){
				return new Period();
			}
		}else if(node.children.length == 2){
			nodeNamespacing(node.children[0]);
			nodeNamespacing(node.children[1]);
			var start;
			var end;
			for(var child of node.children){
				if (child.name == 'startDate') {
					start = child.value;
				}else if (child.name == 'endDate') {
					end = child.value;
				}
			}
			if (start == null && end == null) {
				return null;
			}else{
				return new Period(start, end);
			}
		}else{
			return null;
		}
	}

	isWithin(start, end){
		if (this.forever){
			return false;
		}else if(this.instant != null){
			if (!this.instant.isBetween(start, end, null, '[]')) {return false;}
		}else{
			if (!this.start.isBetween(start, end, null, '[]')) {return false;}
			if (!this.end.isBetween(start, end, null, '[]')) {return false;}
		}
		return true;
	}

	isWithinCurrentQuarter(){
		var start = Moment().startOf('quarter');
		var end = Moment().endOf('quarter');
		
		return this.isWithin(start, end);
	}

	isWithinLastQuarter(){
		var start = Moment().startOf('quarter').subtract(1, 'Q');
		var end = Moment().endOf('quarter').subtract(1, 'Q');
		
		return this.isWithin(start, end);
	}
}

function traverseXML(node, callback){
	nodeNamespacing(node);
	var skip = callback(node);
	if (!skip && node.children) {
		for (var child of node.children){
			traverseXML(child, callback);
		}
	}
}

function nodeNamespacing(node){
	var [namespace, name] = node['#name'].split(':');
	if (name == null) {
		name = namespace;
		namespace = null;
	}
	node.name = name;
	node.namespace = namespace;
}


var Pretty = function(){
	return this.toString();
}
Pretty.enabled = true;

if(Pretty.enabled){
	Context.prototype.inspect = Pretty;
	Entity.prototype.inspect = Pretty;
	Period.prototype.inspect = Pretty;
}
