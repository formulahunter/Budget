const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

async function getDBConnection() {
    let conn;
    try {
        conn = mysql.createConnection({
            host: 'localhost',
            user: 'node',
            password: '',
            database: 'budget',
            timezone: 'Z',
        });
        return conn;
    }
    catch(er) {
        console.error(`error connecting to the database: ${er.stack}`);
        return 500;
    }
    finally {
        if(conn && conn.end) {
            conn.end();
        }
    }
}

//  serve the budget landing page for GET requests to top-level /budget directory
// app.get
//  query mysql database for records
app.get('/data', async (req, res) => {

    const conn = await getDBConnection();
    if(typeof conn === 'number') {
        res.writeHead(conn);
        res.end();
        return;
    }

    //  query data from tables listed above
    //  set http status code 500 upon caught error
    //  close db connection
    let data;
    try {
        //  initiate database queries for all types
        //  note that accounts are procured as complete records
        data = {
            accounts: conn.query('SELECT * FROM funds JOIN accounts USING (id)'),
            funds: conn.query('SELECT * FROM funds WHERE (id) NOT IN (SELECT (id) FROM accounts)'),
            reserves: conn.query('SELECT * FROM reserves'),
            activities: conn.query('SELECT * FROM activities'),
            categories: conn.query('SELECT * FROM categories'),
            categoryGroups: conn.query('SELECT * FROM category_groups'),
            sources: conn.query('SELECT * FROM sources'),
        };

        //  map resolved promises back to their corresponding keys on 'data'
        const entries = Object.entries(data);
        (await Promise.all(entries.map(ent => ent[1])))
            .map(res => res[0])     //  conn.query() returns an array of [results, fields]
            .forEach((res, ind) => {data[entries[ind][0]] = res});
    }
    catch(er) {
        console.error(`error querying the database: ${er.message}`);
        console.trace();
        res.writeHead(500);
    }
    finally {
        if(conn && conn.end) {
            conn.end();
        }
    }

    res.end(JSON.stringify(data));
});
app.use(express.json());
app.post('/upload', async (req, res) => {

    const conn = await getDBConnection();
    if(typeof conn === 'number') {
        res.writeHead(conn);
        res.end();
        return;
    }

    //  insert all posted records into corresponding tables
    const tables = {
        'activities': {
            name: 'activities',
            columns: ['id', 'title', 'time', 'notes']
        },
        'accounts': {
            name: 'accounts',
            columns: ['id', 'balance', 'type', 'interestRate', 'interestPeriod']
        },
        'categories': {
            name: 'categories',
            columns: ['id', 'name', 'group', 'notes']
        },
        'categoryGroups': {
            name: 'category_groups',
            columns: ['id', 'name', 'notes']
        },
        'funds': {
            name: 'funds',
            columns: ['id', 'name', 'opendate', 'closedate', 'notes']
        },
        'reserves': {
            name: 'reserves',
            columns: ['id', 'accountid', 'fundid', 'amount', 'opendate', 'closedate', 'notes']
        },
        'sources': {
            name: 'sources',
            columns: ['id', 'activityid', 'fundid', 'time', 'categoryid', 'amount', 'notes']
        }
    };
    const results = {};
    const assignedIds = {};

    // console.log(JSON.stringify(req.body));
    try {
        for(let [type, container] of Object.entries(req.body.types)) {
            // console.log(JSON.stringify(type) + '\n');
            // console.log(JSON.stringify(container) + '\n');
            const values = container.map(inst => tables[type].columns.map(col => inst[col]));
            // console.log(JSON.stringify(values));
            if(values.length) {
                const sql = mysql.format(
                    `INSERT INTO ${tables[type].name} (??) VALUES ?`,
                    [tables[type].columns, values]
                );
                // console.log(sql + '\n');
                results[type] = conn.query(sql);
            }
        }
        const entries = Object.entries(results);
        (await Promise.all(entries.map(ent => ent[1])))
            .map(res => res[0])    //  conn.query() returns an array of [results, fields]
            .forEach((res, ind) => {
                results[entries[ind][0]] = res
            });
        for(let [type, result] of Object.entries(results)) {
            // console.log(`${type} insert result:`);
            // console.log(JSON.stringify(result) + '\n');
            assignedIds[type] = [];
            for(let i = 0; i < req.body.types[type].length; i++) {
                assignedIds[type].push({
                    tempId: req.body.types[type][i].tempId,
                    assignedId: result.insertId + i
                });
            }
            // console.log(JSON.stringify(assignedIds) + '\n\n\n');
        }
    }
    catch(er) {
        console.error(`error inserting records into the database: ${er.message}`);
        console.trace();

        res.status(500);
        res.send(`error inserting records into the database: ${er.message}`);
        res.end();
        return;
    }
    finally {
        if(conn && conn.end) {
            conn.end();
        }
    }

    res.status(200);
    res.json(assignedIds);
    res.end();
})
app.use(express.static(path.resolve(__dirname, 'dist'), {index: 'index.html'}));


module.exports = app;
