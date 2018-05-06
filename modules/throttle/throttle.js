

module.exports = function(l){
	var l = limit;
	var queue = [];
	var running = false;
	
	function enqueue(f, ...args){
		f.args = args;
		Error.captureStackTrace(f);
		queue.push(f);
		if(!running){
			running = true;
			processQueue();
		}
	}
	function processQueue(){
		var f = queue.unshift();
		if(f){
			try{
				var cb = f.args[f.args.length-1];
				var args = f.args.slice(-1);
				f(...args, function(err, ...args){
					setTimeout(processQueue, l);
					cb(err, ...args);
				});
			}catch(e){
				var error = 'Error '+e.message+"\n";
				error += e.stack+"\n";
				error += 'In queued by'+"\n";
				error += f.stack+"\n";
				setTimeout(processQueue, l);
				throw error;
			}
		}else{
			running = false;
		}
	}



}