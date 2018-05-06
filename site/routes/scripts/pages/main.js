async function render(){
	var tabbar = document.getElementById('tabbar');
	var view_root = document.getElementById('view-root');

	//var views = await API.get(ENV.API_ROOT+'/account/'+MV.username+'/views');
	var views = await MV.View.all();

	if (views.length == 0) {
		view_root.innerHTML = 'You have no views! create one.';
		return;
	}

	for (var i = 0; i < views.length; i++) {
		var tab = await Tab(view_root, views[i]);
		tabbar.appendChild(tab);
		if (i == 0) {
			tab.show();
		}
	}
	
	tabbar.appendChild(await newTabViewButton(view_root));
}


async function Tab(view_root, view){
	var tab = document.createElement('div');
	tab.style.cursor = 'pointer';
	tab.innerHTML = (view.name != '')?view.name:'_';
	tab.view = view;

	tab.onclick = tab.show = function(){
		if (tab.parentNode) {
			if (tab.parentNode.currentTab) {
				tab.parentNode.currentTab.hide();
			}
			tab.parentNode.currentTab = tab;
		}
		tab.style.textDecoration = 'underline';
		tab.render();
	};
	tab.hide = function(){
		tab.style.textDecoration = null;
	};

	tab.reload = async function(){
		var v = await MV.View.fetch(view.id);
		tab.view = v;
		tab.render();
	};
	tab.render = function(){
		while (view_root.firstChild) {
			view_root.removeChild(view_root.firstChild);
		}
		renderView(tab, view_root, [tab.view]);
	}
	tab.remove = function(){
		location.reload();
		//tab.parentNode.removeChild(tab);
	}

	return tab;
}

async function newTabViewButton(view_root){
	var add_view = document.createElement('button');
	add_view.className = 'slim';
	add_view.innerHTML = '+';
	add_view.onclick = async function(){
		var p = await Prompt('Create View', ['Name']);
		if (p == null) {
			return;
		}

		var view = await MV.View.create(p.Name);

		if (add_view.parentNode) {
			var tab = await Tab(view_root, view);
			add_view.parentNode.insertBefore(tab, add_view);

			tab.show();
		}
	};
	return add_view;
}