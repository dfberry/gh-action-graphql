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
const graphql_sdk_1 = require("./generated/graphql.sdk");
const constants_1 = require("./constants");
const graphql_request_1 = require("graphql-request");
const getdata_1 = require("./getdata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getVarsFromAction() {
    const variables = {
        pat: core.getInput('github_personal_access_token'),
        orgName: core.getInput('github_org') || constants_1.GITHUB_GRAPHQL,
        querytype: core.getInput('query_type') || 'whoami'
    };
    console.log(variables);
    return variables;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { pat, orgName, querytype } = getVarsFromAction();
            if (!pat) {
                throw new Error('GitHub Personal Access Token is required');
            }
            const sdk = (0, graphql_sdk_1.getSdk)(new graphql_request_1.GraphQLClient(constants_1.GITHUB_GRAPHQL));
            console.log(`Ready to query`);
            let data = undefined;
            switch (querytype) {
                case 'whoami':
                    data = yield (0, getdata_1.gitHubGraphQLWhoAmI)(sdk, pat);
                    core.setOutput('data', JSON.stringify(data));
                    return;
                case 'org_repos':
                    if (!orgName) {
                        throw new Error('Org name is required');
                    }
                    data = yield (0, getdata_1.gitHubGraphQLOrgReposAg)(sdk, pat, orgName);
                    core.setOutput('data', JSON.stringify(data));
                    return;
                default:
                    throw new Error("Can't determine query type");
            }
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
    });
}
run();
