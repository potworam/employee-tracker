const mysql = require("mysql2");
const inquirer = require("inquirer");
const db = require("../db");

function firstQ() {
    inquirer.prompt([
        {
            type: "list",
            message: "would you like to add, view, or modify information?",
            name: "firstQChoice",
            choices: ["add", "view", "modify"]
               }
            ]).then(function(deptAnswers){
                console.log(deptAnswers.firstQChoice);
                if(deptAnswers.firstQChoice === "add"){
                    addWhat(deptAnswers)
                }else if (deptAnswers.firstQChoice ==="view"){
                    viewWhat(deptAnswers)
                }else{
                    modifyWhat(deptAnswers)
                }
            });
        }

        function addWhat(){
            inquirer.prompt([
                {
                    type: "list",
                    message: "what would you like to add?",
                    name: "addWhatChoice",
                    choices:["new department", "new role", "new employee"]
                }
            ]).then(function(addWhatAnswers){
                if(addWhatAnswers.addWhatChoice === "new department"){
                    addDept()
                }else if (addWhatAnswers.addWhatChoice === "new role"){
                    addRole()
                }else {
                    addEmployee();
                }
            })

        }

        function viewWhat(){
            inquirer.prompt([
                {
                    type: "list",
                    message: "sounds good, what do you want to view?",
                    name: "viewWhatChoice",
                    choices: ["Departments", "Roles", "Employees"]
                }
            ]).then(function(viewWhatAnswers){
                if(viewWhatAnswers.viewWhatChoice === "Departments"){
                    viewDept()
                }else if (viewWhatAnswers.viewWhatChoice === "Roles"){
                    viewRole()
                }else {
                    viewEmployee();
                }
            })
        }
        function modifyWhat(){

        }
        function addDept(){
            inquirer.prompt([
                {
                    type: "input",
                    message: "please enter the department name",
                    name: "addDeptAnswer",
                }
            ]).then(function(newDeptResults){
                db.connection.query(
                    "INSERT INTO department SET ?",
                    {
                        name: newDeptResults.addDeptAnswer,
                    },
                    function(err, res) {
                        if(err) throw err;
                        continueOption();
                    }
                )
            })
        }

        function addRole(){
            db.connection.query("SELECT * FROM department",function(err, res){
                if (err) throw err;
                inquirer.prompt([
                    {
                        type: "input",
                        message: "please enter the name of the job title",
                        name:"addRoleTitle",
                    },
                    {
                        type: "input",
                        message: "what is the salary for this position",
                        name: "addRoleSalary",
                    },
                    {
                        type: "list",
                        message: "which department will thsi role be in?",
                        name: "addRoleDept",
                        choices: function(){
                            const choiceArrayDepts = []
                            for (let i = 0; i<res.length; i++){
                                choiceArrayDepts.push(`${res[i].id} | ${res[i].name}`);
                            }
                            return choiceArrayDepts
                        }
                    },
                ]).then(function(newRoleResults){
                    let query = db.connection.query(
                        "INSERT INTO role SET ?",
                        {
                            title: newRoleResults.addRoleTitle,
                            salary: newRoleResults.addRoleSalary,
                            department_id: parseInt(newRoleResults.addRoleDept.slice(0,3))
                        },
                        function(err,res){
                            if (err) throw err;
                            continueOption();
                        })
                    })
                }
            )}

        function addEmployee(){}

        function getMgr(){}

        function addMgr(manager,employee){

        }

        function viewDept(){
            db.connection.query("SELECT * FROM department",function(err, res){
                if (err) throw err;
                const deptArr = []
                for(var i = 0; i < res.length; i++){
                    deptArr.push(res[i])
                }
                console.table(deptArr);
                continueOption();
            })
        }

        function viewRole(){
            db.connection.query("SELECT * FROM role", function(err, res){
                if(err) throw err;
                const roleArr = []
                for (var i = 0; i < res.length; i++) {
                    roleArr.push(res[i])
                }
                console.table(roleArr);
                continueOption();
            });
        }

        function viewEmployee(){}

        function modifyRoleRoleSel(emp1){

        }

        function modifyMgrEmplSel(){}

        function modifyMgrMgrSel(emp1){
        
        }

        function continueOption(){
            inquirer.prompt([
                {
                    type:"list",
                    message: "Would you like to perform another action?",
                    name: "loopAnswer",
                    choices:["yes", "no"]
                }
            ]).then(function(answer){
                if(answer.loopAnswer === "yes"){
                    firstQ()
                } else{
                    console.log("all done")
                    db.connection.end()
                }
            })
        }

        exports.firstQ = firstQ