/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Bank extends Contract {
    

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const accounts = [
            {
                accountNumber: '00001',
                name: 'Rohan',
                type: 'Current',
                balance: 50000
            },
            {
                accountNumber: '00002',
                name: 'Ritik',
                type: 'Savings',
                balance: 40000
            },
            {
                accountNumber: '00003',
                name: 'Ritesh',
                type: 'Current',
                balance: 30000
            },
            {
                accountNumber: '00004',
                name: 'Rohit',
                type: 'Current',
                balance: 35000
            },
            {
                accountNumber: '00005',
                name: 'Vivek',
                type: 'Savings',
                balance: 20000
            },
            
        ];

        for (let i = 0; i < accounts.length; i++) {
            accounts[i].docType = 'account';
            await ctx.stub.putState('Account' + accounts[i].accountNumber, Buffer.from(JSON.stringify(accounts[i])));
            console.info('Added <--> ', accounts[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async accountDetails(ctx, accountNumber) {
        var key = 'Account' + accountNumber;
        const accountAsBytes = await ctx.stub.getState(key); // get the car from chaincode state
        if (!accountAsBytes || accountAsBytes.length === 0) {
            throw new Error(`${accountNumber} does not exist`);
        }
        console.log(accountAsBytes.toString());
        return accountAsBytes.toString();
    }

    async createAccount(ctx, accountNumber, name, type, balance) {
        console.info('============= START : Create Account ===========');
        // var accountNumber = Math.floor(Math.random()*100000);
        balance = Number(balance)

        const account = {
            accountNumber,
            balance,
            docType: 'account',
            name,
            type,
        };

        await ctx.stub.putState('Account' + accountNumber, Buffer.from(JSON.stringify(account)));
        console.info('============= END : Create Account ===========');
    }

    async depositMoney(ctx, accountNumber, amount) {
        console.info('============= START : Deposit Money ===========');
        // var accountNumber = Math.floor(Math.random()*100000);
        var amount = Number(amount);
        var key = 'Account' + accountNumber;
        const accountAsBytes = await ctx.stub.getState(key); 

        if (!accountAsBytes || accountAsBytes.length === 0) {
            throw new Error(`${accountNumber} does not exist`);
        }

        const account = JSON.parse(accountAsBytes.toString());

        account.balance += amount

        await ctx.stub.putState(key, Buffer.from(JSON.stringify(account)));
        console.info('============= END : Deposit Money ===========');
    }

    async withdrawMoney(ctx, accountNumber, amount) {
        console.info('============= START : Withdraw Money ===========');
        // var accountNumber = Math.floor(Math.random()*100000);
        var amount = Number(amount);
        var key = 'Account' + accountNumber;
        const accountAsBytes = await ctx.stub.getState(key); 

        if (!accountAsBytes || accountAsBytes.length === 0) {
            throw new Error(`${accountNumber} does not exist`);
        }

        const account = JSON.parse(accountAsBytes.toString());
        if(account.balance < amount) {
            throw new Error('Insufficient Balance')
        }
        else {
            account.balance -= amount
        }
        
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(account)));
        console.info('============= END : Withdraw Money ===========');
    }



    async queryAllAccounts(ctx) {
        const startKey = 'Account0';
        const endKey = 'Account99999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async transferMoney(ctx, senderAccountNumber, receiverAccountNumber, amount) {
        console.info('============= START : transferMoney ===========');

        var keySender = 'Account' + senderAccountNumber;
        var keyReceiver = 'Account' + receiverAccountNumber;

        const senderAsBytes = await ctx.stub.getState(keySender); 
        const receiverAsBytes = await ctx.stub.getState(keyReceiver);

        if (!senderAsBytes || senderAsBytes.length === 0) {
            throw new Error(`${senderAccountNumber} does not exist`);
        }

        if (!receiverAsBytes || receiverAsBytes.length === 0) {
            throw new Error(`${receiverAccountNumber} does not exist`);
        }

        const sender = JSON.parse(senderAsBytes.toString());
        const receiver = JSON.parse(receiverAsBytes.toString());
        amount = Number(amount)

        if(sender.balance < amount) {
            throw new Error('Insufficient Balance')
        }
        else {
            sender.balance -= amount;
            receiver.balance += amount
        }

        await ctx.stub.putState(keySender, Buffer.from(JSON.stringify(sender)));
        await ctx.stub.putState(keyReceiver, Buffer.from(JSON.stringify(receiver)));
        console.info('============= END : transferMoney ===========');
    }

}

module.exports = Bank;
