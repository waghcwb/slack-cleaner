declare class SlackCleaner {
  token?: string
  channel: string
  user?: string
  delay?: number
  nextCursor?: string
  index?: number

  init(): any
  handleMessages(): Promise<void>
  getHistory(): Promise<object>
  deleteMessageList(messages: any): any
  deleteMessage(ts: string): Promise<void>
  findUserMessages(messages: any): any
}

declare module '*.json' {
  const value: any
  export default value
}
