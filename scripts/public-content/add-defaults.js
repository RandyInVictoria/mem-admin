'use strict';

var MongoClient = require('mongodb').MongoClient;
var Promise     = require('promise');
var _           = require('lodash');

var defaultConnectionString = 'mongodb://localhost:27017/mem-dev';
var username                = '';
var password                = '';
var host                    = '';
var db                      = '';
var url                     = '';

var args = process.argv.slice(2);
if (args.length !== 4) {
  console.log('Using default localhost connection:', defaultConnectionString);
  url = defaultConnectionString;
} else {
  username = args[0];
  password = args[1];
  host     = args[2];
  db       = args[3];
  url      = 'mongodb://' + username + ':' + password + '@' + host + ':27017/' + db;
}

var find = function(collectionName, query, fields) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {

      var collection = db.collection(collectionName);

      collection.find(query, fields).toArray(function(err, docs) {
        if (err) reject(err);
        db.close();
        resolve(docs);
      });

    });
  });
};

var findOne = function(collectionName, query) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {

      var collection = db.collection(collectionName);

      collection.findOne(query, function(err, docs) {
        if (err) reject(err);
        db.close();
        resolve(docs);
      });

    });
  });
};

var update = function(collectionName, query, doc) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {

      var collection = db.collection(collectionName);

      collection.updateOne(query, { $set: doc } , { }, function(err, result) {
        db.close();
        if (err) {
          reject(err);
        } else {
          console.log('updated document in ' + collectionName);
          resolve(result);
        }
      });

    });
  });
};

var updateAll = function(collectionName, entries) {
  if (_.isEmpty(entries)) {
    return Promise.resolve();
  }
  var updates = _.map(entries, function(entry) {
    return update(collectionName, { _id: entry._id }, entry);
  });
  return Promise.all(updates);
};

var run = function() {
  return new Promise(function (resolve, reject) {
    console.log('start');
    Promise.resolve()
      .then(function() {
        console.log('1 - get project default permissions');
        return findOne('_defaults', { context: 'project', resource: 'project', type: 'default-permissions' });
      })
      .then(function(data) {
        console.log('2 - update project default permissions');
        data.defaults.permissions['editProjectPublicContent']  = ['sysadmin'];
        return update('_defaults', { _id: data._id }, data);
      })
      .then(function() {
        console.log('3 - get projects');
        return find('projects', {}, {});;
      })
      .then(function(data) {
        console.log('  - found ' + _.size(data) + ' project(s)');
        console.log('4 - update project permissions');
        _.each(data, function(project) {
          project.userCan['editProjectPublicContent'] = true;
        });
        return updateAll('projects', data);
      })
      .then(function() {
        console.log('5 - get application default permissions');
        return findOne('_defaults', { context: 'application', resource: 'application', type: 'default-permissions' });
      })
      .then(function(data) {
        console.log('6 - update application default permissions');
        data.defaults.permissions['editPublicContent'] = ['sysadmin'];
        return update('_defaults', { _id: data._id }, data);
      })
      .then(function() {
        console.log('7 - get application role permissions');
        return findOne('_defaults', { context: 'application', resource: 'application', type: 'rolePermissions' });
      })
      .then(function(data) {
        console.log('8 - update application role permissions');
        data.defaults['application:sysadmin'].sysadmin.push('editPublicContent');
        return update('_defaults', { _id: data._id }, data);
      })
      .then(function() {
        console.log('9 - get application');
        return findOne('applications', { _id: 'application'});;
      })
      .then(function(data) {
        console.log('10 - update application permissions');
        data.userCan['editPublicContent']  = false;
        return update('applications', { _id: data._id }, data);
      })
      .then(function(data) {
        console.log('end');
        resolve(':)');
      }, function(err) {
        console.log('ERROR: end');
        console.log('ERROR: end err = ', JSON.stringify(err));
        reject(err);
      });
  });
};


run().then(function(success) {
  console.log('success ', success);
  process.exit();
}).catch(function(error) {
  console.error('error ', error);
  process.exit();
});
