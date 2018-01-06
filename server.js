/*********************************************************************************
 *  WEB322 – Assignment 05 
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: _Avinash Singh_ Student ID: _115408163_ Date: 05-DEC-2017
 *
 * Online (Heroku) URL: https://lit-brook-78873.herokuapp.com
 *
 ********************************************************************************/
var express = require("express");
var app = express();
var path = require("path");
var data_service = require("./data-service.js");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

var HTTP_PORT = process.env.PORT || 8080;

app.listen(HTTP_PORT, function onHttpStart() {
    return new Promise((res, req) => {
        data_service.initialize().then(() => {}).catch((err) => {
            console.log(err);
        });
        dataServiceComments.initialize().then(() => {}).catch((err) => {
            console.log(err);
        });
    }).catch(() => {
        console.log("unable to start dataService");
    });
});

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: 'layout',
    helpers: {
        equal: (lvalue, rvalue, options) => {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");



app.get("/", (req, res) => {
    res.render("home");
});


app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/employees", (req, res) => {
    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status).then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees" });
        });
    } else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department).then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees" });
        });
    } else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager).then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees" });
        });
    } else {
        data_service.getAllEmployees().then((data) => {
            res.render("employeeList", { data: data, title: "Employees" });
        }).catch((err) => {
            res.render("employeeList", { data: {}, title: "Employees" });
        });
    }
});

app.get("/employee/:empNum", (req, res) => {

    let viewData = {};
    data_service.getEmployeeByNum(req.params.empNum).then((data) => {
        viewData.data = data;
    }).catch(() => {
        viewData.data = null;
    }).then(data_service.getDepartments).then((data) => {
        viewData.departments = data;
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.data[0].department) {
                viewData.departments[i].selected = true;
            }
        }

        if (viewData.departments[viewData.departments.length - 1].departmentId != viewData.data[0].department) {
            viewData.departments.Selected = false;
        }
    }).catch(() => {
        viewData.departments = [];
        if (viewData.data == null) {
            res.status(404).send("Employee Not Found!!!");
        } else {
            res.render("employee", { viewData: viewData });
        }
    });
});

app.get("/managers", (req, res) => {
    data_service.getManagers().then((data) => {
        res.render("employeeList", { data: data, title: "Employees (Managers)" });
    }).catch((err) => {
        res.render("employeeList", { data: {}, title: "Employees (Managers)" });
    });
});

app.get("/departments", (req, res) => {
    data_service.getDepartments().then((data) => {
        res.render("departmentList", { data: data, title: "Departments" });
    }).catch((err) => {
        res.render("departmentList", { data: {}, title: "Departments" });
    });
});

app.get("/employees/add", (req, res) => {
    data_service.getDepartments().then((data) => {
        res.render("addEmployee", { departments: data });
    }).catch((err) => {
        res.render("addEmployee", { departments: [] });
    });
});

app.get("/departments/add", (req, res) => {
    res.render("addDepartment", { title: "Department" });
});

app.get("/employee/delete/:empNum", (req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/department/:departmentId", (req, res) => {
    data_service.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department", {
            data: data
        });
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

app.post("/employees/add", (req, res) => {
    data_service.addEmployee(req.body).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/employees/update", (req, res) => {
    res.redirect("/employees");
});

app.post("/employee/update", (req, res) => {
    data_service.updateEmployee(req.body).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/departments/add", (req, res) => {
    data_service.addDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch(() => {
        console.log(err);
    });
});

app.post("/department/update", (req, res) => {
    data_service.updateDepartment(req.body).then((data) => {
        res.redirect("/departments");
    });
});

app.post("/about/addComment", (req, res) => {
    dataServiceComments.addComment(req.body).then((data) => {
        res.redirect("/about");
    }).catch(() => {
        res.reject("error to the console");
        res.redirect("/about");
    });
});

app.post("/about/addReply", (req, res) => {
    dataServiceComments.addReply(req.body).then((data) => {
        res.redirect("/about");
    }).catch((err) => {
        reject("error to the console");
        redirect("/about");
    });
});


app.use((req, res) => {
    res.status(404).send("Sorry!!!!!!!>>>Page Not Found! <<<:(");
});