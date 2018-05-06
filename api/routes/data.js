var router = module.exports = require('express').Router(); 

const Utils = require('Utils');

router.use('/:param', function(req, res, next){
	console.log('in regex');
	console.log(req.params);
	var value = req.params.param
	if (req.MV.data_path == null) {
		req.MV.data_path = [];
	}
	req.MV.data_path.push(value);
	console.log('captured value', value);
	next();
});
router.use('/:param', router);

router.use(async function(req, res){
	var data_path = req.MV.data_path;

	var data = await req.MV.Data.get(data_path);
	res.json(data?data:{});
});

module.exports = router;
