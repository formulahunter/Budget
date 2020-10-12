const mysql = require('mysql2/promise');

module.exports = {
    outputDir: 'app/dist',
    publicPath: '/budget/',
    devServer: {
        before: app => {
            let conn;
            app.get('/data', async (req, res) => {
                try {
                    conn = await mysql.createConnection({
                        host: 'localhost',
                        user: 'root',
                        password: 'mysql',
                        database: 'budget_dev',
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
                    'accounts',
                    'transactions',
                    'categories',
                    'funds',
                    'sources'
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
                            if(key.indexOf('id') > 0) {
                                rec[key] = {'_': rec[key]};
                            }
                        }
                    }
                    data[tables[i]] = results[i];
                }

                res.end(JSON.stringify(data));
            });
        }
    },
    runtimeCompiler: true
}

