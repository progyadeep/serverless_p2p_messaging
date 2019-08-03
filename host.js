const express = require("express")
const bodyParser = require("body-parser")
const {spawn} = require("child_process")
const opn = require('opn')
const cors = require('cors')

var app = express()
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
app.use(cors())

var user = process.argv[2];
if(user == undefined){
	console.log("Error: No user ID provided.\nRe-run the command as: node incomingServer.js <user ID>")
	process.exit(0)
}

var msgHolder = ""

app.get('/', (req, res)=>{
	res.send('This server does not support GET requests.')
})

app.get('/client', (req, res)=>{
	res.sendFile('client/client.html', {root: __dirname})
})

app.post('/', (req, res)=>{
	if(msgHolder == "")
		msgHolder = req.body.msg
	else
		msgHolder += "\n"+req.body.msg
	res.end('1')
})

app.post('/fetch', (req, res)=>{
	res.end(msgHolder)
	msgHolder = ""
})

var port = 3001
var server = app.listen(port)
console.log('Starting incoming message server...')
console.log(`Incoming message server started @ 'localhost' on port ${port}`)

console.log('Establishing Secure HTTP tunnel...')
var sshTP = spawn('ssh', ['-o', 'ServerAliveInterval=60', '-R', user+':80:localhost:'+port, 'serveo.net'])
sshTP.unref()
var sshTPStarted = false
sshTP.stdout.on('data', function(data){
	if(!sshTPStarted){
		sshTPStarted = true
		console.log('Established HTTP(s) tunnel to incoming message server')
		console.log('\x1b[36m%s\x1b[0m', '\nPress Ctrl+C to end all processes');

		//opening in-browser client
		opn('http://localhost:'+port+'/client')
	}
})

process.on('SIGINT', function(){
	sshTP.kill('SIGINT')
	server.close()
	process.exit(0)
})
