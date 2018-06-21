
var neo4j = require('neo4j-driver').v1;
var DBDriver = neo4j.driver(process.env.DB_HOST, neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASS), {maxTransactionRetryTime: 30000});

module.export = {
    account: require('./account')(DBDriver)
};
