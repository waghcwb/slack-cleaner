# Slack Cleaner
A tool to delete all messages from your slack account or channel.


## How it works
`Todo: describe how it works`


## Getting started
You need three things to get started
- The channel id
- The username to delete messages from
- The user token 

```bash
node dist/app.bundle.js --channel <channel_id> --user <user_id> --token <token>
```

### How to get the token and channel/user IDs?
1. To get the channel ID, first open dev tools from your browser, then open the network tab and post a message on the required channel (you can do this on private channel too).

2. Then you need to open the request that browser has made to Slack api and open de "preview" tab.
![Network tab](images/network-tab.png)

3. In the "headers" tab, look for "token" property on "Form Data" section.

4. Usually the token starts with this pattern: `xoxs-xxxxxxxxxxxx`


```js
{
  ok: true,
  channel: 'DCK7E0Z45', // this is the channel ID
  ts: '1559841738.000800',
  message: {
    client_msg_id: 'edeba147-2ac2-451e-9c6c-9754f6608e17',
    type: 'message',
    text: 'mensagem de teste',
    user: 'UCJFARVUZ', // this is the user ID
    ts: '1559841738.000800',
  },
}
```

## Development
``` bash
npm install
npm run dev
```


## Todo's
- [ ] Export messages to somewhere
- [ ] Make user not required for deleting messages
- [ ] Improve type system
- [ ] Create unit tests
- [ ] Create npm package
- [ ] Improve readme
- [ ] Add how to contribute section
- [ ] Remove webpack as build tool
- [ ] Remove packages that are not used
- [ ] Separate execution from cli and module
- [ ] Create MakeFile and test if is working
- [ ] Support for multiple channels


## License
MIT © Wagner Souza