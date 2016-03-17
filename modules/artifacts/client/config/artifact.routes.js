'use strict';
// =========================================================================
//
// artifact routes
//
// =========================================================================
angular.module('core').config(['$stateProvider','_', function ($stateProvider, _) {

	var getPrevNextStage = function (stage, stages) {
		var index = _.findIndex (stages, function (s) { return s.name === stage;});
		console.log (index);
		return {
			prev: (stages[index - 1]) ? stages[index - 1].name : '',
			next: (stages[index + 1]) ? stages[index + 1].name : '',
		};
	};
	var properMethod = function (stage) {
		if (stage === 'Edit') return 'edit';
		else if (stage === 'Review') return 'review';
		else if (stage === 'Approval') return 'approve';
		else if (stage === 'Executive Approval') return 'executive';
		else if (stage === 'Publishing') return 'publish';
		else if (stage === 'Notification') return 'notify';
	};



	$stateProvider
	// -------------------------------------------------------------------------
	//
	// the list state for artifacts and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.artifactlist', {
		url: '/artifactlist',
		templateUrl: 'modules/artifacts/client/views/artifact-list.html',
		controller: function ($scope, NgTableParams, artifacts, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: artifacts});
			$scope.project = project;
		}
	})
	.state('p.artifactcreate', {
		url: '/artifactcreate/:code',
		template: '<p></p>',
		controller: function ($scope, $state, project, $stateParams, ArtifactModel) {
			console.log ('c code = ', $stateParams.code);
			console.log ('project = ', project);
			ArtifactModel.newFromType ($stateParams.code, project._id)
			.then (function (a) {
				console.log ('artifact = ', a);
				$state.go ('p.artifact.edit', {artifactId:a._id});
			});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for artifacts.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the artifact itself which will be available to all
	// child states
	//
	// -------------------------------------------------------------------------
	.state('p.artifact', {
		abstract:true,
		url: '/artifact/:artifactId',
		template: '<ui-view></ui-view>',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// console.log ('artifactId = ', $stateParams.artifactId);
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('p.artifact.edit', {
		url: '/edit',
		templateUrl: 'modules/artifacts/client/views/artifact-edit.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			console.log ('project  = ', project);
			var method = properMethod (artifact.stage);
			if (method !== 'edit') $state.go ('p.artifact.'+method);
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.type.stages);
			$scope.artifact = artifact;
			$scope.project = project;
			if (_.isEmpty (artifact.templateData)) artifact.templateData = {};
			$scope.version = artifact.version;
			$scope.saveas = function () {
				ArtifactModel.getNew ().then (function (newartifact) {
					var a = ArtifactModel.getCopy ($scope.artifact);
					a._id = newartifact._id;
					a.version =  $scope.version;
					ArtifactModel.add (a).then (function (m) {
						console.log ('new artifact was saved', m);
						$state.go ('p.detail', {project:project.code});
					})
					.catch (function (err) {
						console.error (err);
						alert (err);
					});
				});
			};
			$scope.save = function () {
				ArtifactModel.save ($scope.artifact)
				.then (function (model) {
					console.log ('artifact was saved',model);
					console.log ('now going to reload state');
					$state.go ('p.detail', {project:project.code});
					// $state.transitionTo('p.detail', {project:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.submit = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
					// $state.transitionTo('p.detail', {project:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a artifact. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.artifact.view', {
		url: '/view',
		templateUrl: 'modules/artifacts/client/views/artifact-view.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
		}
	})
	.state('p.artifact.review', {
		url: '/review',
		templateUrl: 'modules/artifacts/client/views/artifact-review.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.type.stages);
			$scope.reject = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.submit = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	.state('p.artifact.approve', {
		url: '/approve',
		templateUrl: 'modules/artifacts/client/views/artifact-approve.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.type.stages);
			$scope.reject = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.submit = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	.state('p.artifact.executive', {
		url: '/executive',
		templateUrl: 'modules/artifacts/client/views/artifact-executive.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.type.stages);
			$scope.reject = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.submit = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	.state('p.artifact.publish', {
		url: '/publish',
		templateUrl: 'modules/artifacts/client/views/artifact-publish.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.type.stages);
			$scope.reject = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.submit = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	.state('p.artifact.notify', {
		url: '/notify',
		templateUrl: 'modules/artifacts/client/views/artifact-notify.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.type.stages);
			$scope.reject = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.submit = function () {
				ArtifactModel.nextStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.detail', {project:project.code});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})

	;

}]);

