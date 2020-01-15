let width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;
let height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;
const WIDTH = width
const HEIGHT = height
let data = '';
let sql = '';
$('container').style.height = HEIGHT + 'px'
$('open').style.marginTop = HEIGHT/2 - 120 + 'px';
$('json-editor').style.marginLeft =  WIDTH/2 - 200 + 'px';
move('#open').add('margin-left', WIDTH/2 - 200).end()
$('json-a').addEventListener('click', () => {
    $('json-editor').style.display = 'block';
    move('#open').sub('margin-top', 350).set('opacity', 0).end();
    move('#json-editor').set('opacity', 1).end();
    
})
$('json-finish-a').addEventListener('click', () => {
    let json = $('json-textarea').value
    try
    {
        JSON.parse(json)
        data = json
    } catch (e) {
        alert('json格式不对 / invalid json format')
        return
    }
    $('end').style.display = 'block';
    move('#json-editor').sub('margin-left', 400).set('opacity', 0).set('height', 0).end();
    move('#end').set('opacity', 1).end();
    post('build', {
        in  : 'json',
        out : 'sql',
        data: data,
    }, (rs) => {
        sql = rs.data.replace(/(?:\r\n|\r|\n)/g, '<br>');
    })
})
$('get-sql-a').addEventListener('click', () =>{
    if(!sql)
    {
        alert('数据处理中 / data handling')
        return
    }
    let tab = window.open('about:blank', '_blank')
    tab.document.write(sql)
    tab.document.close()
})
$('get-bean-a').addEventListener('click', () =>{

    let package = prompt('输入bean的包名 / input package name of bean')
    if(!package)
        return
    let form = document.createElement('form')
    let inInput = document.createElement('input')
    let outInput = document.createElement('input')
    let dataInput = document.createElement('input')
    let packageInput = document.createElement('input')
    form.style.display = 'none'
    form.method = 'POST'
    form.action = 'build'
    inInput.name = 'in'
    outInput.name = 'out'
    dataInput.name = 'data'
    packageInput.name = 'package'
    inInput.value = 'json'
    outInput.value = 'bean'
    dataInput.value = data
    packageInput.value = package
    form.appendChild(inInput)
    form.appendChild(outInput)
    form.appendChild(dataInput)
    form.appendChild(packageInput)
    document.body.appendChild(form)
    form.submit()
})



function $(id)
{
    return document.querySelector('#' + id)
}
function post(url, postData, callback)
{
	var request = new XMLHttpRequest()
	request.open("POST", url)
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
	if(typeof(postData) == 'object')
	{
		let str = ''
		for(let key in postData)
			if(postData.hasOwnProperty(key))
				str += '&' + key + '=' + postData[key]
		str = str.substr(1, str.length)
		postData = str
	}
	request.onreadystatechange = function()
	{
		if(request.readyState === 4)
			callback(JSON.parse(request.responseText))
	}
	request.send(postData)
}