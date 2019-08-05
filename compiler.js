#!/bin/node

const fs = require('fs')
const { parse } = require('js-html-parser');


function get_tree(html){
	var tree = html.childNodes.filter (el =>  el.tagName && el.tagName == "tree");
	if (tree.length > 0){
		return tree[0];
	}
	return void 0;
}
var deep = 1;
var tree = "";
function get_attr(attrs){
	if (!attrs){
		return {};
	}
	var res = {};
	attrs.split('" ')
		.map(attr=> attr.split('='))
		.map(arr =>({key: arr[0], value: arr[1]}))
		.filter(el => el.key!='class')		
		.map(el => {
			if (!el.value){
				return {key: el.key, value: 'undef'};
			}
			var value = el.value;
			if(value.startsWith('"')){
				value = value.substring(1);
			}			

			if(value.endsWith('"')){
				var l = value.length;
				value = value.substring(0, l -1);
			}
			return {key: el.key, value: value};
		})
		.forEach(el => res[el.key] =el.value);
	return res;

}
function html_to_vnode_recursive(html){	
	html.childNodes.forEach(tag =>{
		if (tag.nodeType == 3){
			if (/^[\t\r\n]+$/.test(tag.rawText)){
				return;
			}
			tree +="	".repeat(deep) + '.text("'+tag.rawText+'")\n';
			

		}
		if (!tag.tagName){
			return;
		}

		tree +="	".repeat(deep) + ".child('"+tag.tagName+"',"  +JSON.stringify(get_attr(tag.rawAttrs))+")";
		
		if (tag.classNames.length > 0){
			tree +=".set_class('"+tag.classNames.join(' ')+"')";
		}
		tree += '\n'
		deep = deep +1;
		html_to_vnode_recursive(tag);
		deep = deep -1;
		tree +="	".repeat(deep) + '.up()\n';
	});
}

function html_to_vnode(html){
	if (!html){
		return '';
	}
	var res = "this.tree = new VirtualDom('div'); \n";
	res += "this.tree.root()\n";
	html_to_vnode_recursive(html);
	return res + tree;
}

function result_to_file(content){
	fs.writeFile('result.js', content, (err) => {
	  if (err) {
	    console.error(err)
	    return
	  }
	})
}

function compile(data){
	var html = data.toString().trim();
	const root = parse(html);
	var tree = get_tree(root);
	var res = html_to_vnode(tree);
	result_to_file(res);

}


fs.readFile('test.html', (err, data) => {
  if (err) throw err;
  compile(data);
});

