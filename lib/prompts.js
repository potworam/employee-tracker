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
            inquirer.prompt ([
                {
                    type: "list",
                    message: "sounds good, what would you like to do?",
                    name: "modifyWhatChoice",
                    choices: ["change an employees manager", "change an employees role"]
                }
            ]).then(function(modifyWhatAnswers){
                if(modifyWhatAnswers.modifyWhatChoice === "change an employees manager"){
                    modifyMgrEmplSel()
                }else {
                    modifyRoleEmplSel()
                }
            })

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
                        message: "which department will this role be in?",
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

        function addEmployee(){
            db.connection.query("SELECT * FROM role", function(err, res){
                if(err) throw err;
                inquirer.prompt([
                    {
                        type: "input",
                        message: "please enter the employees first name",
                        name: "addEmployeeNameF"
                    },
                    {
                        type: "input",
                        message: "please enter the employees last name",
                        name: "addEmployeeNamel"
                    },
                    {
                        type: "list",
                        message: "Which team will they be joining?",
                        name: "addEmployeeRole",
                        choices: function(){
                            const choiceArrayRoles = []
                            for (let i = 0; i<res.length; i++){
                                choiceArrayRoles.push(`${res[i].id} | ${res[i].title}`);
                            }
                            return choiceArrayRoles
                        }
                    },
                    {
                        type: "confirm",
                        message: "will this person be a manager?",
                        name: "addEmployeeIsMgr",
                    },
                    {
                        type: "confirm",
                        message: "will this employee report to a manager?",
                        name: "addEmployeeHasMgr",
                    },
                ]).then(function(newEmployeeResults){
                    let query = db.connection.query(
                        "INSERT INTO employee SET ?",
                        {
                        first_name: newEmployeeResults.addEmployeeNameF,
                        last_name: newEmployeeResults.addEmployeeNameL,
                        role_id: parseInt(newEmployeeResults.addEmployeeRole.slice(0,5)),
                        is_manager: newEmployeeResults.addEmployeeIsMgr,
                        },
                        function(err, res){
                            if (err) throw err;
                            console.log(res.affectedRows + " employee inserted!\n");
                            if (newEmployeeResults.addEmployeeHasMgr === true) {
                                getMgr()
                            }else {
                                continueOption();
                            }
                        }
                    )
                })
            })
        }

        function getMgr(){
            db.connection.query("SELECT * FROM employee WHERE is_manager=1", function(err,res){
                if(err) throw err;
                inquirer.prompt([
                    {
                        type: "list",
                        message: "who will their leader be",
                        name: "addEmployeeMgr",
                        choices: function(){
                            const choiceArrayMgrs = []
                            for (let i = 0; i<res.length; i++) {
                                choiceArrayMgrs.push(`${res[i].id} | ${res[i].first_name} ${res[i].last_name}`);
                            }
                            return choiceArrayMgrs
                        }
                    }
                ]).then(function(mgrQ){
                    const idArr  = []
                    db.connection.query("SELECT id from employee", function(err,ans){
                        for(let i = 0; i < ans.length; i++){
                            idArr.push(ans[i].id)
                        }
                        const newest = idArr[idArr.length-1];
                        const mgr = parseInt(mgrQ.addEmployeeMgr.slice(0, 5));
                        addMgr(newest,mgr)
                    });
                })
            })
        }

        function addMgr(manager,employee){
            db.connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [employee, manager],function(err, res){
                if(err){
                    console.log(err)
                } else {
                    console.log("done!")
                    continueOption();
                }
            })

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

        function modifyRoleEmplSel(){
            db.connection.query("SELECT id, first_name, last_name FROM employee", function(err, res){
                if(err) throw err;
                inquirer.prompt([
                    {
                        type: "list",
                        message: "which employee are you changing?",
                        name: "modifyRolechanged",
                        choices: function(){
                            const choiceArrayEmpl = []
                            for (let i = 0; i<res.length; i++) {
                                choiceArrayEmpl.push(`${res[i].id} | ${res[i].first_name} ${res[i].last_name}`);
                            }
                            return choiceArrayEmpl
                        }
                    },
                ]).then(function(emp1){
                    const changingEmp1 = parseInt(emp1.modifyRoleChangedE.slice(0,5));
                    console.log(`changingEmp1 before passing to next function: ${changingEmp1}`)
                    modifyRoleRoleSel(changingEmp1)
                })
            })
        }
        function modifyRoleRoleSel(emp1){
            const employee =emp1
            console.log(`employee: ${employee}`)
            db.connection.query("SELECT id, title FROM role", function (err, res){
                inquirer.prompt([
                    {
                        type:"list",
                        message: "and what will their new role be?",
                        name: "modifyRoleChangedR",
                        choices: function(){
                            const choiceArrayRole = []
                            for(let i = 0; i<res.length; i++){
                                choiceArrayRole.push(`${res[i].id} | ${res[i].title}`);
                            }
                            return choiceArrayRole
                        }
                    },
                ]).then(function(role){
                    const newRole = parseInt(role.modifyRoleChangedR.slice(0,5));
                    const changingEmp1 = role.employee
                    console.log
                })
            })
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