# Slack Cleaner
A tool to delete all messages from your slack account or channel.

## How it works
`Todo: describe how it works`

## Getting started
You need three things to get started
- The channel id
- The username to delete messages from
- The user token 

`Todo: insert instruction on how to get those infos.`

```bash
node dist/app.bundle.js --channel <channel_id> --user <user_id> --token <token>
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