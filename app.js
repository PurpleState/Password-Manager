console.log("starting password manager");

var crypto = require('crypto-js');
var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
.command('create','Create a new account', function (yargs){
	yargs.options({
		name: {
			demand: true,
			alias: 'n',
			description: 'Account Name(eg: twitter facebook)',
			type: 'string'
		},
		username: {
			demand: true,
			alias: 'u',
			description: 'Account username or email',
			type: 'string'
		},
		password: {
			demand: true,
			alias: 'p',
			description: 'contains password',
			type: 'string'
		},
		masterPassword: {
			demand: true,
			alias: 'm',
			description: 'master password',
			type: 'string'
		}
	}).help('help');

})
.command('get','get an existing account', function(yargs){
	yargs.options({
		name: {
			demand: true,
			alias: 'n',
			description: 'Account Name(eg: twitter facebook)',
			type: 'string'
		},
		masterPassword: {
			demand: true,
			alias: 'm',
			description: 'master password',
			type: 'string'
		}
	})

})
.help('help')
.argv;
var command = argv._[0];

// account.name
//account.username
// account.password

function getAccounts(masterPassword){
	var encryptedAccount = storage.getItemSync('accounts');
	var accounts =[];
	
	if (typeof encryptedAccount !== 'undefined'){
		var bytes = crypto.AES.decrypt(encryptedAccount, masterPassword);
	    accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
	}

	return accounts;
}

function saveAccounts(accounts, masterPassword){
	var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);

	storage.setItemSync('accounts',encryptedAccounts.toString());

	return accounts;

}

function createAccount(account, masterPassword){
	var accounts = getAccounts(masterPassword);
	
	accounts.push(account);
	
	saveAccounts(accounts, masterPassword);

	return account;

}
function getAccount(accountName, masterPassword){
	var accounts = getAccounts(masterPassword)
	var matchedAccount;

	accounts.forEach(function (account){
		if(account.name === accountName){
			matchedAccount = account;
		}
	});
	return matchedAccount;

}

if(command === 'create'){
	try{
		var createdAccount = createAccount({
		name: argv.name,
		username: argv.username,
		password: argv.password
	},argv.masterPassword);
	console.log('Account created');
	console.log(createAccount);
	}catch(e){
		console.log('unable to create account.')
	}
}else if(command === 'get'){
	try{
		var fetchedAccount = getAccount(argv.name,argv.masterPassword);
	    if(typeof fetchedAccount === 'undefined'){
		     console.log('Account not found');
	    }else{
		     console.log('Account created');
	         console.log(fetchedAccount);
       	}
	}catch(e){
		console.log('unable to fetch account');
	}

}