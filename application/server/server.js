'use strict';
// require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const queryAllAccounts = require('./queryAllAccounts.js')
const createAccount = require('./createAccount.js')
const accountDetails = require('./accountDetails.js')
const transferMoney = require('./transferMoney.js')
const withdrawMoney = require('./withdrawMoney.js')
const depositMoney = require('./depositMoney.js')

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/createAccount", function(req, res){
    res.render('createNewAccount')
})

app.post("/createAccount", function(req, res){
    const accountNumber = req.body.accountNumber;
    const name = req.body.name;
    const type = req.body.type;
    const balance = req.body.balance;
    createAccount.createAccount(accountNumber, name, type, balance).then(
        function(result){
            console.log("Account Created Successfully");
            res.render('success',{msg:"Bank Account Created Successfully"})
        }
    )
    .catch(error => {
        console.log(error);
      })
})

app.get("/checkAccountDetails", function(req, res){
    res.render('checkAccountDetails')
})

app.post("/checkAccountDetails", function(req, res){
    const accountNumber = req.body.accountNumber;
    accountDetails.getAccountDetails(accountNumber).then(
        function(result){
            result = JSON.parse(result);
            // console.log(result)
            res.render('displayAccountDetails',{result: result})
        }
    )
    .catch(error => {
        console.log(error);
      })
})

app.get("/transferMoney", function(req, res){
    res.render('transferMoney')
})

app.post("/transferMoney", function(req, res){
    const senderAccountNumber = req.body.senderAccountNumber;
    const receiverAccountNumber = req.body.receiverAccountNumber;
    const amount = req.body.amount;
    console.log(typeof(senderAccountNumber))
    transferMoney.transferMoney(senderAccountNumber, receiverAccountNumber, amount).then(
        function(result){
            console.log("Amount Transfered Successfully");
            res.render('success',{msg:"Money Transferred Successfully"})
        }
    )
    .catch(error => {
        console.log(error);
      })
})

app.get("/viewAllAccounts", function(req,res){
    queryAllAccounts.queryAllAccounts().then(
        function(result){
            result = JSON.parse(result)
            res.render('viewAllAccounts', {result: result})
        }
    )
    .catch(error => {
        console.log(error);
      })
})

app.get("/withdrawMoney", function(req, res){
    res.render('withdrawMoney')
})

app.post("/withdrawMoney", function(req, res){
    const accountNumber = req.body.accountNumber
    const amount = req.body.amount
    withdrawMoney.withdrawMoney(accountNumber, amount).then(
        function(result){
            console.log("Amount Withdrawn Successfully")
            res.render("success",{msg:"Money Withdrawn Successfully"})
        }
    )
})

app.get("/depositMoney", function(req, res){
    res.render('depositMoney')
})

app.post("/depositMoney", function(req, res){
    const accountNumber = req.body.accountNumber
    const amount = req.body.amount
    depositMoney.depositMoney(accountNumber, amount).then(
        function(result){
            console.log("Amount Deposited Successfully")
            res.render("success",{msg:"Money Deposited Successfully"})
        }
    )
})

app.get("/", function (req, res) {
    res.render('index')
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
