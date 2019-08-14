#!/usr/bin/node

const fs = require('fs')
const { parse } = require('js-html-parser');



function get_attr(attrs){
	if (!attrs){
		return '{}';
	}
	var res = [];
	var text_attr =attrs.match(/(\w*)=("[:/_A-Za-z0-9_А-Яа-я .-]*")/g);
	if (text_attr) {
		var arr = text_attr
				.filter(attr => !/class/g.test(attr))
				.map(attr => attr.replace('=', ':'));
		Array.prototype.push.apply(res, arr);
	}
	var js_attr =attrs.match(/([@\:A-Za-z0-9_-]*)=([^"]\w*)/g);
	if (js_attr) {
		var arr = js_attr
			.filter(attr => /js:([\w]*)=([^"]\w*)/g.test(attr))
			.map(attr => attr.replace('js:', ''))
			.map(attr => attr.replace('=', ':'));
		Array.prototype.push.apply(res, arr);
	}	
	return '{'+res.join(', ') +'}';

}

function get_bind(attrs){
	if (!attrs){
		return void 0;
	}
	var bind = /vd-bind=([^"]\w*)/g.exec(attrs);
	if (!bind){
		return void 0;
	}
	return bind[1];

}
function html_to_vnode(html){
	var tree_html = get_tree(html);
	if (!tree_html){
		return '';
	}
	var tree = '';
	var deep = 1;
	function html_to_vnode_recursive(html){
		html.childNodes.forEach(tag =>{
			if (tag.nodeType == 3){
				if (/^[\t\r\n]+$/.test(tag.rawText)){
					return;
				}
				tree +="	".repeat(deep) + '.text(`'+tag.rawText+'`)\n';
			}
			if (!tag.tagName){
				return;
			}

			tree +="	".repeat(deep) + ".child('"+tag.tagName+"',"  +get_attr(tag.rawAttrs)+")";
			
			if (tag.classNames.length > 0){
				tree +=".set_class('"+tag.classNames.join(' ')+"')";
			}
			var bind = get_bind(tag.rawAttrs);
			if (bind){
				tree +=".bind("+bind+")";
			}
			tree += '\n'
			deep = deep +1;
			html_to_vnode_recursive(tag);
			deep = deep -1;
			tree +="	".repeat(deep) + '.up()\n';
		});
	}
	function get_first_nonText_child(html){
		var root = html.childNodes.filter(tag => tag.nodeType !=3);

		return root[0];
	}

	function get_scripts(html){
		var res = '';

		var root = html.childNodes.filter(tag => tag.tagName&& tag.tagName == 'script');
		root.forEach(script => script.childNodes.forEach(child => res +=child.toString()));
		// root.forEach(e => console.log(e));
		return res;
	}
	var root =get_first_nonText_child(tree_html);
	var res= " \n'use strict'; \n"
	res += "const {VirtualDom}= require('virtual-dom.js');\n"
	res += "module.exports.Ctor = function Ctor(rm, node){ \n";
	res +=get_scripts(html);
	res += ' \n';
	res += "this.tree = new VirtualDom('"+root.tagName+"',"  +get_attr(root.rawAttrs)+"); \n";
	res += "this.tree.root()\n";
	if (root.classNames.length > 0){
		res +=".set_class('"+root.classNames.join(' ')+"')";
	}
	var bind = get_bind(root.rawAttrs);
	if (bind){
		tree +=".bind("+bind+")";
	}	
	html_to_vnode_recursive(root);
	res+=tree;
	res += "}"
	return res;
}

function result_to_file(content){
	fs.writeFile('result.js', content, (err) => {
	  if (err) {
	    console.error(err)
	    return
	  }
	})
}
function get_tree(html){
	var tree = html.childNodes.filter (el =>  el.tagName && el.tagName == "tree");
	if (tree.length > 0){
		return tree[0];
	}
	return void 0;
}

function compile1(data){
	var opt = 	{
		script: true
	}

	var html = data.toString().trim();
	const root = parse(html, opt);
	var res = html_to_vnode(root);
	result_to_file(res);

}

function compile(html, file, callback){
	const root = parse(html);
	var res = html_to_vnode(root);
	callback(void 0, res);
	//result_to_file({result: res});
}
module.exports.compile = compile;

// fs.readFile('test.html', (err, data) => {
//   if (err) throw err;
//   compile(data);
// });

