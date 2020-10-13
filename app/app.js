const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

//  serve the budget landing page for GET requests to top-level /budget directory
// app.get
//  query mysql database for records
app.get('/data', async (req, res) => {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'node',
            password: '',
            database: 'budget',
            timezone: 'Z',
        });
    }
    catch(er) {
        console.error(`error connecting to the database: ${er.stack}`);
        res.writeHead(500);
        res.end();

        if(conn && conn.end) {
            conn.end();
        }
        return;
    }

    let tables = [
        'RealAccounts',
        'VirtualAccounts',
        'Activities',
        'Categories',
        'Sources'
    ];
    let queries = [];
    let results = [];

    //  query data from tables listed above
    //  set http status code 500 upon caught error
    //  close db connection
    try {
        for(let table of tables) {
            queries.push(conn.query(`SELECT * FROM ${table}`));
        }
        results = await Promise.all(queries);
        results = results.map(res => res[0]);
    }
    catch(er) {
        console.error(`error querying the database: ${er.stack}`);
        res.writeHead(500);
    }
    finally {
        if(conn && conn.end) {
            conn.end();
        }
    }

    let data = {};
    for(let i = 0; i < tables.length; i++) {
        for(let rec of results[i]) {
            for(let key in rec) {
                //  mark reference id's (eg source.categoryid) with an underscore
                //  leave own id's (eg activity.id) unchanged
                if(key.indexOf('id') > 0) {
                    rec[key] = {'_': rec[key]};
                }
            }
        }
        data[tables[i]] = results[i];
    }

    res.end(JSON.stringify(data));
});
app.use(express.static(path.resolve(__dirname, 'dist'), {index: 'index.html'}));


module.exports = app;
