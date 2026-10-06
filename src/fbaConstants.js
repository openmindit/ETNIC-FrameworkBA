// ============================================================
// ETNIC Framework BA
// Internal Code : fbaConstants
//
// Rôle :
// Constantes et conventions communes du Framework BA.
//
// Utilisation :
// let fbaConstants = this.fbaConstants();
//
// Exemple :
// fbaConstants.CONTEXT_ANALYSIS_ROOT
// ============================================================

let constants = {

    // ========================================================
    // FRAMEWORK
    // ========================================================

    OUTPUT_TAB:
        "ETNIC_FrameworkBA",

    VERSION:
        "0.1.0",
	
	CHECK_RESULT_VERSION: "1.0",
	
    DIAGRAM_REGISTRY_ELEMENT_TYPE:
        "Artifact",

    DIAGRAM_REGISTRY_STEREOTYPE:
        "FrameworkBA_Diagram_Registry",

    TAG_ARTIFACT_RULES:
        "ETNIC_Framework_BA_Artifact_Rules",

    ARTIFACT_RULE_NONE:
        "NONE",

    TECHNICAL_PACKAGE_PREFIX:
        "_",

    TECHNICAL_NAME_PREFIX:
        "_",
		
	TAG_CHECK_RESULT:
		"ETNIC_Check_Result",

	// -----------------------------------------------------------------
	// CHECK - Etat courant de conformité
	// -----------------------------------------------------------------
	
	TAG_CHECK_STATUS: 
		"ETNIC_Check_Status",
		
	TAG_CHECK_DATE: 
		"ETNIC_Check_Date",
		
	TAG_CHECK_ISSUES: 
		"ETNIC_Check_Issues",
	
	TAG_CHECK_ACTION: 
		"ETNIC_Check_Action",

	// -----------------------------------------------------------------
	// CHECK - Statuts
	// -----------------------------------------------------------------
	
	CHECK_STATUS_COMPLIANT: 
		"CONFORME",
	
	CHECK_STATUS_NON_COMPLIANT: 
		"NON_CONFORME",

	// -----------------------------------------------------------------
	// CHECK - Sévérités
	// -----------------------------------------------------------------
	
	CHECK_SEVERITY_ERROR: 
		"ERROR",
	
	CHECK_SEVERITY_WARNING: 
		"WARNING",

	// -----------------------------------------------------------------
	// CHECK - Actions préconisées
	// -----------------------------------------------------------------
	
	CHECK_ACTION_INIT: 
		"INIT",
		
	CHECK_ACTION_COMPLETE: 
		"COMPLETE",
		
	CHECK_ACTION_REPAIR: 
		"REPAIR",
		
	CHECK_ACTION_MANUAL_COMPLETE:
		"MANUAL_COMPLETE",

	CHECK_ACTION_MANUAL_REMOVE:
		"MANUAL_REMOVE",

	CHECK_ACTION_MANUAL_MOVE:
		"MANUAL_MOVE",

	CHECK_ACTION_MAKE_TECHNICAL:
		"MAKE_TECHNICAL",

	CHECK_ACTION_MANUAL_REVIEW:
		"MANUAL_REVIEW",
		
	CHECK_ACTION_MAKE_BUSINESS:
		"MAKE_BUSINESS",
	
	CHECK_ACTION_ALIGN_WITH_METAMODEL:
		"ALIGN_WITH_METAMODEL",
	// -----------------------------------------------------------------
	// CHECK - Issues de conformité
	// -----------------------------------------------------------------
	
	CHECK_ISSUE_ARTIFACT_NOTE_MISSING: 
		"ARTIFACT_NOTE_MISSING",
	
	CHECK_ISSUE_DIAGRAM_NOTE_MISSING: 
		"DIAGRAM_NOTE_MISSING",

	CHECK_ISSUE_ARTIFACT_NAMING_INVALID: 
		"ARTIFACT_NAMING_INVALID",
	
	CHECK_ISSUE_DIAGRAM_NAMING_INVALID: 
		"DIAGRAM_NAMING_INVALID",

	CHECK_ISSUE_DIAGRAM_TECHNICAL_NAME:
		"DIAGRAM_TECHNICAL_NAME",

	CHECK_ISSUE_DIAGRAM_REGISTRY_MISSING:
		"DIAGRAM_REGISTRY_MISSING",
		
	CHECK_ISSUE_FOREIGN_ARTIFACT: 
		"FOREIGN_ARTIFACT",
	
	CHECK_ISSUE_FOREIGN_DIAGRAM: 
		"FOREIGN_DIAGRAM",

	CHECK_ISSUE_DUPLICATE_ARTIFACT: 
		"DUPLICATE_ARTIFACT",
	
	CHECK_ISSUE_DUPLICATE_DIAGRAM: 
		"DUPLICATE_DIAGRAM",
		
	CHECK_ISSUE_MANDATORY_DIAGRAM_ARTIFACT_MISSING:
		"MANDATORY_DIAGRAM_ARTIFACT_MISSING",
	
	CHECK_ISSUE_FOREIGN_ARTIFACT:
		"FOREIGN_ARTIFACT",

	CHECK_ISSUE_ARTIFACT_PREFIX_MISSING:
		"ARTIFACT_PREFIX_MISSING",

	CHECK_ISSUE_ARTIFACT_PREFIX_INVALID:
		"ARTIFACT_PREFIX_INVALID",

	CHECK_ISSUE_ARTIFACT_NAMING_INVALID:
		"ARTIFACT_NAMING_INVALID",

	CHECK_ISSUE_ARTIFACT_TECHNICAL_NAME:
		"ARTIFACT_TECHNICAL_NAME",
		
	CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME:
		"DUPLICATE_ANALYSIS_PACKAGE_NAME",

	CHECK_ISSUE_DUPLICATE_TECHNICAL_PACKAGE_NAME:
		"DUPLICATE_TECHNICAL_PACKAGE_NAME",

	CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME:
		"DUPLICATE_ARTIFACT_NAME",

	CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME:
		"DUPLICATE_DIAGRAM_NAME",
	// ============================================================
	// NOTE REQUIREMENT
	// ============================================================

	TAG_NOTE_REQUIREMENT:
		"ETNIC_Note_Requirement",

	NOTE_REQUIREMENT_MANDATORY:
		"Obligatoire",

	NOTE_REQUIREMENT_RECOMMENDED:
		"Recommandé",

	NOTE_REQUIREMENT_OPTIONAL:
		"Optionnel",
		
    // ========================================================
    // ANALYSIS STRUCTURE
    // ========================================================

    ANALYSIS_ELEMENTS_GUID:
        "{C334F76B-2C01-47da-93E3-B4F75A590E00}",

    ROLE_ANALYSIS_OBJECT:
        "Analysis_Object",

    ROLE_ANALYSIS_SUBJECT:
        "Analysis_Subject",

    TAG_SOURCE_ANALYSIS_ELEMENT_GUID:
        "ETNIC_Source_Analysis_Element_GUID",

    TAG_CATEGORY:
        "ETNIC_Category",

    TAG_IMPORTANT_LEVEL:
        "ETNIC_Importance_Level",

    TAG_TECHNICAL:
        "ETNIC_Framework_Technical",

    TAG_DIAGRAM_HASH:
        "ETNIC_Diagram_Hash",


    // ========================================================
    // COMMANDES FRAMEWORK BA
    // ========================================================

    COMMAND_INITIALIZE:
        "INITIALIZE",

    COMMAND_COMPLETE:
        "COMPLETE",

    COMMAND_CHECK:
        "CHECK",

    COMMAND_REPAIR:
        "REPAIR",


    // ========================================================
    // ANALYSIS CONTEXT TYPES
    // ========================================================

    CONTEXT_ANALYSIS_ROOT:
        "ANALYSIS_ROOT",

    CONTEXT_ANALYSIS_PACKAGE:
        "ANALYSIS_PACKAGE",

    CONTEXT_ARTIFACT:
        "ARTIFACT",

    CONTEXT_DIAGRAM:
        "DIAGRAM",

    CONTEXT_UNKNOWN:
        "UNKNOWN",


    // ========================================================
    // DIAGRAM CONFIGURATION
    // ========================================================

    ROLE_DIAGRAM_CONFIG:
        "Diagram_Config",

    DIAGRAM_CONFIGS_PACKAGE_NAME:
        "_Diagrammes_configs",

    TAG_GENERATED_DIAGRAM_GUID:
        "ETNIC_Generated_Diagram_GUID",

    TAG_SOURCE_DIAGRAM_GUID:
        "ETNIC_Source_Diagram_GUID",

    TAG_DIAGRAM_CONFIG_DEFAULT:
        "ETNIC_Diagram_Config_Default",

    TAG_DIAGRAM_CONFIG_PRIORITY:
        "ETNIC_Diagram_Config_Priority",

    TAG_DIAGRAM_DEFAULT_NAME:
        "ETNIC_Diagram_Default_Name",

    TAG_DIAGRAM_NAME_PREFIX:
        "ETNIC_Diagram_Name_Prefix",


    // ========================================================
    // MODES FRAMEWORK
    // ========================================================

    MODE_INITIALIZE:
        "INITIALIZE",

    MODE_COMPLETE:
        "COMPLETE",

    MODE_CHECK:
        "CHECK",

    MODE_REPAIR:
        "REPAIR",


    // ========================================================
    // STRUCTURE TECHNIQUE DE L'ANALYSE
    // ========================================================

    LIBRARY_STRUCTURE:
    [
        {
            name: "_Artefacts",
            children: []
        },
        {
            name: "_Légendes",
            children: []
        },
        {
            name: "_Diagrammes_configs",
            children: []
        },
        {
            name: "_Vues",
            children:
            [
                {
                    name: "_Vue décision",
                    children: []
                },
                {
                    name: "_Vue cadrage",
                    children: []
                }
            ]
        },
        {
            name: "_Kanbans",
            children: []
        }
    ],


    // ========================================================
    // ANALYSIS - ARTIFACT GENERATION
    // ========================================================

    ARTIFACT_RELATION_TYPE:
        "Dependency",

    ARTIFACT_RELATION_NAME:
        "Modeled by",

    TAG_ARTIFACT_NAME_PREFIX:
        "ETNIC_Artifact_Name_Prefix",

    TAG_LAST_ARTIFACT_NUMBER_PREFIX:
        "ETNIC_Last_Artifact_Number_",

    TAG_SOURCE_ARTIFACT_DEFINITION_GUID:
        "ETNIC_Source_Artifact_Definition_GUID",


    // ========================================================
    // ANALYSIS - DIAGRAM
    // ========================================================

    TAG_DIAGRAM_TYPE:
        "ETNIC_Diagram_Type",

    DEFAULT_ANALYSIS_DIAGRAM_TYPE:
        "Analysis",


    // ========================================================
    // DOCUMENTATION - HEADER / FOOTER
    // ========================================================

    ROLE_DOCUMENTATION_HEADER_FOOTER:
        "Documentation_HeaderFooter",

    HEADER_FOOTER_ARTIFACT_NAME:
        "_Header Footer",

    HEADER_FOOTER_TEMPLATE_GUID:
        "{BF98E3C2-8D58-4d0d-95BB-FD16E4225E5C}",


    // ========================================================
    // TOKENS PERSISTANTS
    // ========================================================

    TOKEN_INITIATIVE_NAME:
        "INITIATIVE_NAME",

    TOKEN_DOCUMENT_TITLE:
        "DOCUMENT_TITLE",


    // ========================================================
    // MASTER DOCUMENT - METADATA
    // ========================================================

    MASTER_TAG_REPORT_NAME:
        "ReportName",

    MASTER_TAG_REPORT_TITLE:
        "ReportTitle",

    MASTER_TAG_REPORT_AUTHOR:
        "ReportAuthor",

    MASTER_TAG_REPORT_VERSION:
        "ReportVersion",

    MASTER_TAG_REPORT_STATUS:
        "ReportStatus",

    MASTER_TAG_REPORT_ALIAS:
        "ReportAlias",

    MASTER_TAG_REPORT_SUMMARY:
        "ReportSummary",

    MASTER_TAG_REPORT_KEYWORDS:
        "ReportKeywords",


    // ========================================================
    // PROJECT CONSTANTS - DOCUMENT
    // ========================================================

    PROJECT_CONSTANT_INITIATIVE_NAME:
        "ETNIC_InitiativeName",

    PROJECT_CONSTANT_DOCUMENT_TITLE:
        "ETNIC_DocumentTitle",

    PROJECT_CONSTANT_INITIATIVE_DESCRIPTION:
        "ETNIC_InitiativeDescription",

    PROJECT_CONSTANT_DOCUMENT_AUTHORS:
        "ETNIC_DocumentAuthors",

    PROJECT_CONSTANT_GENERATED_DATETIME:
        "ETNIC_GeneratedDateTime",

    PROJECT_CONSTANT_DOCUMENT_VERSION:
        "ETNIC_DocumentVersion",

    PROJECT_CONSTANT_DOCUMENT_STATUS:
        "ETNIC_DocumentStatus",


    // ========================================================
    // DOCUMENT GENERATION
    // ========================================================

    DOCUMENT_TEMPLATE_THEME_HEADER:
        "ETNIC - BA - Vue décision - Theme Header",


    // ========================================================
    // DOCUMENTATION - ARTEFACTS
    // ========================================================

    DOCUMENTATION_ARTIFACT_REQUIRE_NOTES:
        true,

    DOCUMENTATION_OPTION_INCLUDE_ARTIFACTS_WITHOUT_NOTES:
        "Inclure les artefacts sans note",

    DOCUMENTATION_RELATION_REQUIRE_NAME:
        true,

    DOCUMENTATION_RELATION_REQUIRE_NOTES:
        true,

    DOCUMENTATION_INCLUDE_TECHNICAL_RELATIONS:
        false,

    DOCUMENTATION_INCLUDE_RELATIONS_FROM_EXCLUDED_DIAGRAMS:
        false,

    DOCUMENT_TEMPLATE_ARTIFACT_RELATIONS:
        "ETNIC - BA - Vue décision - Artefacts Relations Content",

    DOCUMENTATION_OPTION_INCLUDE_RELATIONS_FROM_EXCLUDED_DIAGRAMS:
        "Inclure les relations des diagrammes exclus",

    DOCUMENTATION_OPTION_INCLUDE_TECHNICAL_RELATIONS:
        "Inclure les relations techniques",

    DOCUMENTATION_OPTION_INCLUDE_RELATIONS_WITHOUT_NAME:
        "Inclure les relations sans nom",

    DOCUMENTATION_OPTION_INCLUDE_RELATIONS_WITHOUT_NOTES:
        "Inclure les relations sans note",


    // ========================================================
    // RELATIONS TECHNIQUES
    // ========================================================

    RELATION_TECHNICAL_PREFIX:
        "_",

    RELATION_TECHNICAL_STEREOTYPES:
    [
        // À compléter avec les stéréotypes réellement
        // considérés comme techniques dans le métamodèle.
    ],


    // ========================================================
    // DOCUMENT TEMPLATES
    // ========================================================

    DOCUMENT_TEMPLATE_SUBJECT_HEADER:
        "ETNIC - BA - Vue décision - Sujet Header",

    DOCUMENT_TEMPLATE_SUBJECT_BODY:
        "ETNIC - BA - Vue décision - Sujet Body",

    DOCUMENT_BREAK_PAGE:
        0,

    DOCUMENT_BREAK_SECTION:
        1,

    DOCUMENT_TEMPLATE_COVER_CONTENT:
        "ETNIC - BA - Cover page",

    DOCUMENT_TABLE_OF_CONTENTS:
        "ETNIC - BA - Table of Contents",

    DOCUMENT_STYLESHEET:
        "ETNIC - BA - Style Sheet",

    DOCUMENT_TEMPLATE:
        "Model Report",

    TAG_DOCUMENT_OUTPUT_PATH:
        "ETNIC_Document_Output_Path",

    DOCUMENT_DEFAULT_OUTPUT_PATH:
        "C:\\Temp\\ETNIC_FrameworkBA",

    DOCUMENT_CREATE_OUTPUT_FOLDER:
        true,

    DOCUMENT_DEFAULT_EXTENSION:
        ".docx",

    DOCUMENT_FILE_PREFIX:
        "",

    UI_SHOW_START_MESSAGE:
        true,

    UI_SHOW_END_MESSAGE:
        true,

    UI_OPEN_LOG_AUTOMATICALLY:
        true,

    DOCUMENT_TEMPLATE_DIAGRAM:
        "ETNIC - BA - Vue décision - Diagramme Content",


    // ========================================================
    // VIEWS / METAMODEL
    // ========================================================

    VIEW_DECISION_NAME:
        "Décision",

    VIEWS:
    {
        "Décision":
        {
            guid:
                "{7DA8425C-65F5-4069-B055-69D2C8B94BCB}",

            themesGuid:
                "{297CE189-9D55-4c37-BF06-A904D9894BA0}",

            subjectsGuid:
                "{6B165661-6BBB-4ea4-AF7B-06C0DE7CB0C7}",

            targetPackageName:
                "_Vue décision",

            documentTemplate:
                "ETNIC - BA - Vue décision - Sujet Content"
        }
    },


    // ========================================================
    // DOCUMENTATION POLICY
    // ========================================================

    TAG_DOCUMENTATION_STATUS:
        "ETNIC_Documentation_Status",

    DOCUMENTATION_STATUS_INCLUDED:
        "Inclu",

    DOCUMENTATION_STATUS_EXCLUDED:
        "Exclu",

    DOCUMENTATION_DIAGRAM_REQUIRE_NOTES:
        true,

    DOCUMENTATION_INCLUDE_TECHNICAL_DIAGRAMS:
        false,

    DIAGRAM_TECHNICAL_PREFIX:
        "_",


    // ========================================================
    // DOCUMENTATION - CHECKLIST CONFIGURATION
    // ========================================================

    DOCUMENTATION_CONFIG_CHECKLIST_STEREOTYPE:
        "EAUML::Checklist",

    ROLE_DOCUMENTATION_CONFIG:
        "Documentation_Config",

    TAG_CHECKLIST:
        "Checklist",

    DOCUMENTATION_OPTION_INCLUDE_TECHNICAL_DIAGRAMS:
        "Inclure les diagrammes techniques",

    DOCUMENTATION_OPTION_INCLUDE_DIAGRAMS_WITHOUT_NOTES:
        "Inclure les diagrammes avec note vide",


    // ========================================================
    // TAGGED VALUES
    // ========================================================

    TAG_STEREOTYPE_DISCRIMINATOR:
        "ETNIC_Stereotype_Discriminator",

    TAG_SCOPE_STATUS:
        "ETNIC_Scope_Status",

    TAG_SCENARIO_TYPE:
        "ETNIC_Scenario_Type",

    TAG_INITIALIZED:
        "ETNIC_Framework_Initialized",

    TAG_FRAMEWORK_ROLE:
        "ETNIC_BA_Framework_Role",

    ROLE_ANALYSIS_ROOT:
        "Analysis_Folder",

    TAG_IMPORTANCE_LEVEL:
        "ETNIC_Importance_Level",

    TAG_VIEW_SUBJECT_ORDER:
        "ETNIC_View_Subject_Order",

    TAG_VIEW_THEME:
        "ETNIC_View_Theme",

    TAG_VIEW_THEME_ORDER:
        "ETNIC_View_Theme_Order",

    TAG_SOURCE_VIEW_SUBJECT_GUID:
        "ETNIC_Source_View_Subject_GUID",

    TAG_SOURCE_ANALYSIS_PACKAGE_GUID:
        "ETNIC_Source_Analysis_Package_GUID",

    ROLE_VIEW_THEME:
        "View_Theme",

    ROLE_VIEW_SUBJECT:
        "View_Subject",

    TAG_RTF_TEMPLATE:
        "RTFTemplate",


    // ========================================================
    // IMPORTANCE CONTEXTUELLE
    // ========================================================

    IMPORTANCE_REQUIRED:
        "Obligatoire",

    IMPORTANCE_RECOMMENDED:
        "Recommandé",

    IMPORTANCE_OPTIONAL:
        "Optionnel",


    // ========================================================
    // ANALYSIS
    // ========================================================

    ANALYSIS_ROOT_NAME_PREFIX:
        "BusAn -",

    LIBRARY_PACKAGE_NAME:
        "_Librairie",

    VIEWS_PACKAGE_NAME:
        "_Vues",

    DECISION_VIEW_PACKAGE_NAME:
        "_Vue décision",

    ALLOW_CURRENT_PACKAGE_FALLBACK:
        false,


    // ========================================================
    // DOCUMENT
    // ========================================================

    DOCUMENT_TEMPLATE_SUBJECT:
        "ETNIC - BA - Vue décision - Sujet Content",

    DOCUMENT_ALLOW_CREATE:
        true,

    MODEL_DOCUMENT_TYPE:
        "Class",

    MODEL_DOCUMENT_STEREOTYPE:
        "EAUML::model document",

    DOCUMENT_DIAGRAM_NAME:
        "",

    MASTER_DOCUMENT_NAME:
        "_Vue décision",

    COMPLIANCE_NOTE_NAME:
        "Rapport de conformité",

    DOCUMENT_LEGEND_GUID:
        "{464A6E47-FAD9-45ee-8B52-D7D5123E4BCA}",


    // ========================================================
    // DOCUMENT DIAGRAM LAYOUT
    // ========================================================

    LAYOUT_MODEL_WIDTH:
        180,

    LAYOUT_MODEL_HEIGHT:
        85,

    LAYOUT_GAP_X:
        10,

    LAYOUT_GAP_Y:
        10,

    LAYOUT_START_LEFT:
        610,

    LAYOUT_START_TOP:
        150,

    LAYOUT_LEGEND_LEFT:
        30,

    LAYOUT_LEGEND_RIGHT:
        330,

    LAYOUT_LEGEND_TOP:
        30,

    LAYOUT_LEGEND_BOTTOM:
        240,

    LAYOUT_COMPLIANCE_LEFT:
        30,

    LAYOUT_COMPLIANCE_RIGHT:
        330,

    LAYOUT_COMPLIANCE_TOP:
        270,

    LAYOUT_COMPLIANCE_BOTTOM:
        530,

    LAYOUT_MASTER_LEFT:
        365,

    LAYOUT_MASTER_RIGHT:
        570,

    LAYOUT_MASTER_TOP:
        150,

    LAYOUT_MASTER_BOTTOM:
        530,


    // ========================================================
    // VIEW THEMES
    // ========================================================

    VIEW_THEME_CONTEXT:
        "Contexte",

    VIEW_THEME_PURPOSE:
        "Finalité",

    VIEW_THEME_SOLUTION:
        "Solution",

    VIEW_THEME_RISK_SCOPE:
        "Risque_Cadrage",

    VIEW_THEME_ARBITRATION:
        "Arbitrage",

    VIEW_THEME_COLUMN_CONTEXT:
        0,

    VIEW_THEME_COLUMN_PURPOSE:
        1,

    VIEW_THEME_COLUMN_SOLUTION:
        2,

    VIEW_THEME_COLUMN_RISK_SCOPE:
        3,

    VIEW_THEME_COLUMN_ARBITRATION:
        4,

    VIEW_THEME_COLUMN_DEFAULT:
        5,


    // ========================================================
    // COMPLIANCE
    // ========================================================

    COMPLIANCE_PASS:
        "PASS",

    COMPLIANCE_WARNING:
        "WARNING",

    COMPLIANCE_FAIL:
        "FAIL",

    COMPLIANCE_INFO:
        "INFO",

    MODE_STRICT:
        "STRICT",

    MODE_STANDARD:
        "STANDARD",

    MODE_FORCE:
        "FORCE"
};

return constants;