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
const consola_1 = __importDefault(require("consola"));
const builders_1 = require("./builders");
require('dotenv').config();
class SlackCleaner {
    constructor() {
        consola_1.default.info({
            badge: true,
            message: 'Starting slack channel cleaner.',
        });
        try {
            const options = this.getParameters();
            const { token, channel, user, delay } = options;
            this.token = token;
            this.channel = channel;
            this.user = user;
            this.delay = delay;
            this.init();
        }
        catch (err) {
            consola_1.default.fatal({
                badge: true,
                message: err.message,
            });
        }
    }
    init() {
        this.handleMessages();
    }
    getParameters() {
        let options = {};
        const requestDelayDefaultValue = 400;
        consola_1.default.debug({
            badge: true,
            message: 'Getting parameters.',
        });
        try {
            const args = new builders_1.ArgumentsBuilder()
                .withVersion('1.0.0')
                .withOption({
                alias: 't',
                command: 'token',
                description: 'Slack token.',
                required: true,
            })
                .withOption({
                alias: 'c',
                command: 'channel',
                description: 'Slack channel ID.',
                required: true,
            })
                .withOption({
                alias: 'd',
                command: 'delay',
                description: 'Delay for the requests.',
                defaultValue: requestDelayDefaultValue,
            })
                .withOption({
                alias: 'u',
                command: 'user',
                description: 'Delete messages for this username',
                required: true,
            })
                .parse(process.argv);
            options = args.getOpts();
        }
        catch (err) {
            const { SLACK_CHANNEL, SLACK_USER, SLACK_TOKEN, SLACK_REQUEST_DELAY = requestDelayDefaultValue, } = process.env;
            if (err.message.startsWith('Missing required parameter:') &&
                (SLACK_CHANNEL && SLACK_USER && SLACK_TOKEN)) {
                options.channel = SLACK_CHANNEL;
                options.user = SLACK_USER;
                options.token = SLACK_TOKEN;
                options.delay = SLACK_REQUEST_DELAY;
            }
            else {
                throw err;
            }
        }
        return options;
    }
    handleMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.index = this.index ? this.index + 1 : 1;
            consola_1.default.info(`Getting chunk number: ${this.index}`);
            try {
                const history = yield this.getHistory();
                if (history && history.ok) {
                    if (history.messages && history.messages.length) {
                        const userMessages = this.findUserMessages(history.messages);
                        if (userMessages.length) {
                            consola_1.default.info('Found user messages.');
                            this.deleteMessageList(userMessages)
                                .then(() => __awaiter(this, void 0, void 0, function* () {
                                consola_1.default.info('Message chunk deleted;');
                                if (history.has_more) {
                                    this.nextCursor = history.response_metadata.next_cursor;
                                    this.handleMessages();
                                }
                                else {
                                    consola_1.default.info('Loop finished;');
                                    this.nextCursor = null;
                                }
                            }))
                                .catch(err => {
                                throw err;
                            });
                        }
                        else {
                            consola_1.default.info('Not found user messages in this chunk.');
                            if (history.has_more) {
                                this.nextCursor = history.response_metadata.next_cursor;
                                this.handleMessages();
                            }
                            else {
                                consola_1.default.info('Loop finished;');
                                this.nextCursor = null;
                            }
                        }
                    }
                    else {
                        consola_1.default.info('Loop finished;');
                        this.nextCursor = null;
                    }
                }
                else {
                    throw new Error('Cannot get history;');
                }
            }
            catch (err) {
                consola_1.default.error(err.message);
            }
        });
    }
    getHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, channel, nextCursor } = this;
            try {
                const req = yield new builders_1.RequestBuilder()
                    .withUrl('conversations.history')
                    .withParams({
                    token,
                    channel,
                    nextCursor,
                    count: 1000,
                })
                    .doRequest();
                return req.data;
            }
            catch (err) {
                consola_1.default.error({
                    badge: true,
                    message: 'Error while getting conversations;',
                });
                consola_1.default.error(err.message);
            }
        });
    }
    deleteMessageList(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(messages.map((message, index) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this.deleteMessage(message.ts)
                            .then(response => {
                            consola_1.default.info('Message deleted;');
                            consola_1.default.info(message.text);
                            resolve(response);
                        })
                            .catch(err => {
                            consola_1.default.error('Error deleting message;');
                            consola_1.default.error(message.text);
                            reject(err);
                        });
                    }, this.delay * index);
                });
            }));
        });
    }
    deleteMessage(ts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, channel } = this;
            const { data } = yield new builders_1.RequestBuilder()
                .withUrl('chat.delete')
                .withParams({
                token,
                channel,
                ts,
            })
                .doRequest();
            if (data.ok) {
                return data;
            }
            else if (data.error === 'ratelimited') {
                this.delay = this.delay + 100;
            }
            else {
                throw new Error('[!] Error while deleting message.');
            }
        });
    }
    findUserMessages(messages) {
        return messages.filter((message) => message.user === this.user);
    }
}
exports.SlackCleaner = SlackCleaner;
if (require.main === module) {
    new SlackCleaner();
}
//# sourceMappingURL=index.js.map