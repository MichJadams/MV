var router = module.exports = require('express').Router({mergeParams: true});


router.get('/', function(req, res){
	res.send('gettting all of the views for '+req.User.display_name);
});

router.post('/', function(req, res){
	req.MV.View.createForUser(req.User.username, req.query.root_id, req.body, function(err, view){
		if (err) {
			res.error(err);
		} else {
			res.json(view);
		}
	});
});

router.get('/:view_id', function(req, res){
	req.MV.View.getForUser(req.User.username, req.params.view_id, function(err, view){
		if (err) {
			res.error(err);
		} else {
			if (view == null) {
				res.error('no such view', 404);
			} else {
				res.json(view);	
			}
		}
	});
});

