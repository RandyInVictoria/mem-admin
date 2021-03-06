'use strict';
// =========================================================================
//
// Document Model
//
// This has awhole bunch of historical stuff in it that deals with the ETL
// from the old EPIC system.
//
//    ------------------------------------------------------------
//    Short form rules for e-PIC
//    ------------------------------------------------------------
//
//    Folder Type:
//    ------------------------------
//    r= Under Review
//    p= Pre-Application
//    w= Withdrawn
//    t= Terminated
//    a= Certificate Issued
//    k= Amendments
//
//    Folder Name short form:
//    ------------------------------
//    abo = Aboriginal Comments/Submissions
//    amd = Amendment Certificate
//    yaa = Amendment to Certificate Documentation
//    ama = Amendment - Application
//    app = Application and Supporting Studies
//    tor = Application Terms of Reference/Information Requirements
//    cag = Community Advisory Group
//    cpp = Compendium: Public Comments / Proponent Responses
//    crr = Compliance Reports/Reviews
//    cpm = Concurrent Permitting
//    waa = EA Certificate Documentation
//    com = EAO Generated Documents
//    fed = Federal Comments/Submissions
//    gcd = General Consultiation Documents
//    loc = Local Government Comments/Submissions
//    mno = Ministerial Order
//    new = Notices - News Releases
//    ojc = Other Jurisdictions Comments/Submissions
//    xaa = Post Certificate Documentation
//    abc = Pre Application Documents
//    pro = Proponent Comments/Correspondence
//    pga = Provincial Govt Comments/Submissions
//    pub = Public Comments/Submissions
//    ------------------------------
//
//    Example Links:
//    ------------------------------
//    // 1: Root level project page - shows root level folder type options for the project.
// https://a100.gov.bc.ca/appsdata/epic/html/deploy/epic_project_home_362.html
// 362=[projectID]
//
//    // 2: Root level folder lists available Folder Type+Folder Name folders.
//    // The Under Review/Pre-application/Withdrawn/etc. set of folders and their subfolders
// https://a100.gov.bc.ca/appsdata/epic/html/deploy/epic_project_doc_list_362_r_app.html
// 362= [projectID]
//    Folder Type: r= [Under Review]
// Folder Name Short Form: app= [Application and Supporting Studies]
//
//    // 3: FolderName - The title of the folder containing the collection of documents
//    EG: Application Main Report received January 18, 2016
//    // This exists as content in "2: Root level folder lists available..." above
//
//    // 4: Child folder where the collection of documents related to a specific Folder Type+Folder Name
//    // can be found.
//    https://a100.gov.bc.ca/appsdata/epic/html/deploy/epic_document_362_39700.html
//    362= [projectID]
//    39700= EPIC DirectoryID (becomes d39700) Not related to the specific project
//
//
//    Actual Document Link:
//    ------------------------------
//    https://a100.gov.bc.ca/appsdata/epic/documents/p362/d39700/1453141986150_QzJ9WdsMpRJvp1GtL2JJmYjYw0jptTxFgrx6SyVKDJxRgQFvZ9Jq!1143392206!1453141196524.pdf
//    p362= [ProjectID]
//    d39700= [DirectoryID] Not related to the specific project
//    1453141986150= (RANDOM) Probably the uploadID when it was originally placed
//    QzJ9WdsMpRJvp1GtL2JJmYjYw0jptTxFgrx6SyVKDJxRgQFvZ9Jq!1143392206!1453141196524= (RANDOM) Probably the SessionID for a group of uploaded assets (in a folder only?)
//
//
// CC: converted to new schema pre-processor
//
// =========================================================================
var path = require('path');
var genSchema = require (path.resolve('./modules/core/server/controllers/core.schema.controller'));
var config 	= require(path.resolve('./config/config'));
var _ = require ('lodash');

genSchema ('TypesSchema', {
  projectFolderType           : { type:String, default:'' },
  projectFolderSubTypeObjects : []
});

genSchema ('SubTypesSchema', {
  projectFolderSubType : { type:String, default:'' },
  projectFolderNames   : []
});

module.exports = genSchema ('Document', {
  __audit                 : true, // who what when
  __access                : ['publish', 'unPublish'],
  project                 : { type:'ObjectId', ref:'Project', default:null },
  directoryID             : { type:Number, default: 0 },

  displayName             : { type: String, default: ''},
  description             : { type:String, default:'' },

  // For MEM documentDate is the date the document was produced.
  // For MEM inspection category the document date is labelled "Inspection Date"
  documentDate            : { type: Date, default: null },
  documentDateDisplayMnYr : { type:Boolean, default:false },

  dateAdded               : { type: Date, default: Date.now },
  dateUpdated             : { type: Date, default: Date.now },
  dateUploaded            : { type: Date, default: null },
  datePosted 				: { type: Date, default: Date.now },
  dateReceived			: { type: Date, default: Date.now },

  updatedBy               : { type:'ObjectId', ref:'User', default:null },
  projectFolderURL        : { type:String, default:'' }, // The specific DirectoryID instance of a collection of documents
  projectFolderAuthor     : { type:String, default:'' },
  documentEPICId          : { type:Number, default:0, index:true },
  documentEPICProjectId   : { type:Number, default:0, index:true },
  documentFileName        : { type:String, default:'' }, // the name of the file when downloaded
  documentFileURL         : { type:String, default:'' },
  documentFileSize        : { type:String, default:'' }, // Looks like everything is in KB
  documentFileFormat      : { type:String, default:'' },
  documentVersion         : { type:Number, default:0 }, // Used for keeping track of this documents version.
  documentIsLatestVersion : { type:Boolean, default:true }, // We assume we are the latest. Default will be false
  //TODO for MEM all doc source are empty
  documentSource 			: { type:String, default:'' }, // Source = comments or generic or signature file
  // when we hook in the reviewable interface which will
  // decide what is the latest based on approval of such
  // TODO for MEM documentIsInReview can this be removed?
  documentIsInReview      : { type:Boolean, default:false }, // Used to flag if this entry is a reviewable entry.
  documentAuthor          : { type:String, default:'' }, // NB: We should add a document author in addition to the folderAuthor.
  // discontinue use of documentType and change to use documentCategories
  // documentType            : { type:String, default: null },
  documentCategories      : [ { type:String, default: null } ],
  internalURL             : { type:String, default:'' },
  internalOriginalName    : { type:String, default:'' },
  internalName            : { type:String, default:'' },
  internalMime            : { type:String, default:'' },
  internalExt             : { type:String, default:'' },
  internalSize            : { type:Number, default:0 },
  internalEncoding        : { type:String, default:'' },
  //TODO for MEM all old data is empty
  oldData                 : { type:String, default:'' },

  order                   : { type: Number, default: Date.now},
  // TODO for MEM all eaoStatus are empty
  eaoStatus               : { type:String, default:'', enum:['', 'Unvetted', 'Rejected', 'Deferred', 'Accepted', 'Published', 'Spam'] },// for use with Public Comment Attachments...

  // TODO for MEM related docs are empty
  relatedDocuments        : [ { type: 'ObjectId', ref: 'Document' } ],

  collections             : [ { type: 'ObjectId', ref: 'Collection' } ],

  keywords                : [ { type:'String'} ],
  documentId              : { type:'String', default: null }, // will be used as an id into other systems (ex MEM, MMTI, to be entered manually)

  // supporting data for inspection document Types
  // replacing { type: { inspectorInitials: { type:'String', default: null}, followup: { type:'String', default: null} }
  inspectionReport        : {
    type: {
      accompanyingInspectors	: { type:'String', default: null},
      associatedAuthorization	: { type:'String', default: null}, // free text
      inspectionNumber	: { type:'String', default: null}, // mandatory
      inspectorName		: { type:'String', default: null}, // mandatory
      mineManager		: { type:'String', default: null}, // free text
      dateReportIssued	: { type: Date, default: null }, // Inspection Date
      dateResponse	: { type: Date, default: null }, // Inspection Report Response Date
      dateFollowUp	: { type: Date, default: null }, // Follow Up Date
      personsContacted	: { type:'String', default: null} // free text multi line
    },
    default: null
  },

  virtuals__ : [
    {name:'inspectionType', get: inspectionType}
  ]
});

function inspectionType() {
  var categories = this.documentCategories || [];
  // types with shortest length last
  var inspectionReportTypes = config.inspectionReportTypes;// ['Inspection Report Response', 'Inspection Report Follow Up', 'Inspection Report'];
  // see copy of this same code on client: doc-categories.js
  var iType = null;
  for(var i = 0; i < categories.length && !iType; i++) {
    var cat = categories[i];
    for (var k=0; k < inspectionReportTypes.length && !iType; k++) {
      var type = inspectionReportTypes[k];
      if (_.startsWith(cat,type)) {
        iType = type;
      }
    }
  }
  return iType;
}


