'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var policy       = require ('../policies/activity.policy');
var Activitybase = require ('../controllers/activitybase.controller');
var Activity     = require ('../controllers/activity.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'activitybase', Activitybase, policy);
	helpers.setCRUDRoutes (app, 'activity', Activity, policy);
	//
	// start an activity
	//
	app.route ('/api/start/activity/:activity')
		.all (policy.isAllowed)
		.put (function (req, res) {
			var p = new Activity (req.user);
			p.startActivity (req.Activity, req.body)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// complete an activity
	//
	app.route ('/api/complete/activity/:activity')
		.all (policy.isAllowed)
		.put (function (req, res) {
			var p = new Activity (req.user);
			p.completeActivity (req.Activity, req.body)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// all activities for a milestone
	//
	app.route ('/api/activity/for/milestone/:milestone')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Activity (req.user);
			p.activitiesForMilestone (req.Milestone._id)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// activity base
	//
	app.route ('/api/activitybase/:activitybase/add/task/:taskbase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Activitybase (req.user);
			p.addTaskToActivity (req.ActivityBase, req.TaskBase)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// add a task form a base to a real activity
	//
	app.route ('/api/activity/:activity/add/task/:taskbase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Activity (req.user);
			p.addTaskFromBase (req.Activity, req.TaskBase)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// all activities for this project that the user can read
	//
	app.route ('/api/activity/in/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Activity (req.user);
			p.userActivities (req.Project.code, 'read')
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// all activities for this project that the user can write
	//
	app.route ('/api/write/activity/in/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Activity (req.user);
			p.userActivities (req.Project.code, 'write')
			.then (helpers.success(res), helpers.failure(res));
		});
};

