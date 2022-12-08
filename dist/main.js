"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint no-console: 0 */ // --> OFF
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const graphql_sdk_1 = require("./generated/graphql.sdk");
const constants_1 = require("./constants");
const graphql_request_1 = require("graphql-request");
const getdata_1 = require("./getdata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getQueryType(str) {
    switch (str) {
        case 'whoami':
        case 'org_repos':
            return str;
        default:
            return 'org_repos';
    }
}
function getVarsFromAction() {
    if (process.env.NODE_ENV === 'development') {
        return {
            pat: process.env.github_personal_access_token || '',
            orgName: process.env.github_org || '',
            querytype: process.env.query_type,
            maxItems: parseInt(process.env.maxItems, -1) || -1,
            maxPageSize: parseInt(process.env.maxPageSize, constants_1.DEFAULT_PAGE_SIZE) ||
                constants_1.DEFAULT_PAGE_SIZE,
            maxDelayForRateLimit: parseInt(process.env.maxDelayForRateLimit, constants_1.TIME_5_SECONDS) ||
                constants_1.TIME_5_SECONDS,
            save_to_file: process.env.save_to_file || '',
            save_to_file_name: process.env.save_to_file_name || ''
        };
    }
    else {
        const maxItems = parseInt(core.getInput('max_items')) || constants_1.DEFAULT_PAGE_SIZE;
        const maxPageSize = parseInt(core.getInput('max_page_size')) || constants_1.DEFAULT_PAGE_SIZE;
        const rateLimit = parseInt(core.getInput('rate_limit_delay')) || constants_1.TIME_5_SECONDS;
        return {
            pat: core.getInput('github_personal_access_token'),
            orgName: core.getInput('github_org') || constants_1.GITHUB_GRAPHQL,
            querytype: getQueryType(core.getInput('query_type')),
            maxItems,
            maxPageSize,
            maxDelayForRateLimit: rateLimit,
            save_to_file: core.getInput('save_to_file') || 'true',
            save_to_file_name: core.getInput('save_to_file_name') || constants_1.DEFAULT_SAVED_FILE_NAME
        };
    }
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const envVars = getVarsFromAction();
            console.log(envVars);
            if (!envVars.pat) {
                throw new Error('GitHub Personal Access Token is required');
            }
            const sdk = (0, graphql_sdk_1.getSdk)(new graphql_request_1.GraphQLClient(constants_1.GITHUB_GRAPHQL));
            console.log(`Ready to query`);
            let data = undefined;
            switch (envVars.querytype) {
                case 'whoami':
                    data = yield (0, getdata_1.gitHubGraphQLWhoAmI)(sdk, envVars.pat);
                    core.setOutput('data', JSON.stringify(data));
                    break;
                case 'org_repos':
                    if (!envVars.orgName) {
                        throw new Error('Org name is required');
                    }
                    data = yield (0, getdata_1.gitHubGraphQLOrgReposAg)(sdk, envVars.pat, envVars.orgName, envVars.maxItems, envVars.maxPageSize, envVars.maxDelayForRateLimit);
                    // output either data to file or environment
                    if (envVars.save_to_file === 'false') {
                        core.setOutput('data', JSON.stringify(data));
                    }
                    break;
                default:
                    throw new Error("Can't determine query type");
            }
            // save data to file instead of blowing out GitHub Action memory
            if (envVars.save_to_file === 'true' && envVars.save_to_file_name) {
                const dirFile = path_1.default.join(__dirname, '..', envVars.save_to_file_name);
                yield fs_1.promises.writeFile(dirFile, JSON.stringify(data), 'utf8');
                console.log(`Data output file written to ${dirFile}`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
    });
}
run();
