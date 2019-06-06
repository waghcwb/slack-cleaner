"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const axios_1 = __importDefault(require("axios"));
class RequestBuilder {
    constructor() {
        this.baseURL = 'https://slack.com/api/';
        this.axios = axios_1.default.create({
            baseURL: this.baseURL,
        });
    }
    withUrl(url) {
        this.url = url;
        return this;
    }
    withParams(params) {
        this.params = params;
        return this;
    }
    withData(data) {
        this.data = data;
        return this;
    }
    withHeaders(headers) {
        this.headers = Object.assign({}, this.headers, headers);
        return this;
    }
    withConfig(config) {
        this.config = Object.assign({}, this.config, config);
        return this;
    }
    isValidRequest() {
        return !!this.url.length;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doRequest();
        });
    }
    post() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doRequest('POST');
        });
    }
    doRequest(method = 'GET') {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isValidRequest()) {
                const { axios, config, data, headers, params, url } = this;
                return axios.request(Object.assign({ url,
                    method,
                    headers,
                    params,
                    data }, config));
            }
            else {
                throw new Error('[!] Not a valid request.');
            }
        });
    }
}
exports.RequestBuilder = RequestBuilder;
class ArgumentsBuilder {
    constructor() {
        this.options = [];
        this.program = new commander_1.Command();
    }
    parse(args) {
        this.program.parse(args);
        this.validateRequiredParams();
        return this;
    }
    validateRequiredParams() {
        const opts = this.getOpts();
        this.getRequiredOpts().forEach(option => {
            if (opts[option] === undefined) {
                throw new Error(`Missing required parameter: ${option}`);
            }
        });
    }
    getRequiredOpts() {
        return this.options
            .filter(option => option.required)
            .map(option => option.command);
    }
    getOpts() {
        return this.program.opts();
    }
    withVersion(version) {
        this.program.version(version);
        return this;
    }
    withOption(option) {
        const space = ' ';
        let payload = `--${option.command}`;
        if (option.alias) {
            payload = `-${option.alias}, --${option.command}`;
        }
        this.program.option(payload.concat(space).concat('<string>'), option.description, option.defaultValue);
        this.options = this.options.concat(option);
        return this;
    }
}
exports.ArgumentsBuilder = ArgumentsBuilder;
//# sourceMappingURL=builders.js.map