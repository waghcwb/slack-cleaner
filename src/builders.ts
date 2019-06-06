import commander, { Command, CommandOptions } from 'commander'
import axios, { AxiosInstance, AxiosPromise, Method } from 'axios'
import { ArgumentBuilderOption } from './models'

export class RequestBuilder {
  axios: AxiosInstance
  url: string
  params: object
  data: any
  headers: object
  config: object
  baseURL?: string

  constructor() {
    this.baseURL = 'https://slack.com/api/'

    this.axios = axios.create({
      baseURL: this.baseURL,
    })
  }

  withUrl(url: string) {
    this.url = url
    return this
  }

  withParams(params: object) {
    this.params = params
    return this
  }

  withData(data: any) {
    this.data = data
    return this
  }

  withHeaders(headers: object) {
    this.headers = {
      ...this.headers,
      ...headers,
    }
    return this
  }

  withConfig(config: object) {
    this.config = {
      ...this.config,
      ...config,
    }
    return this
  }

  isValidRequest(): boolean {
    return !!this.url.length
  }

  async get(): Promise<any> {
    return this.doRequest()
  }

  async post(): Promise<any> {
    return this.doRequest('POST')
  }

  async doRequest(method: Method = 'GET'): Promise<any> {
    if (this.isValidRequest()) {
      const { axios, config, data, headers, params, url } = this

      return axios.request({
        url,
        method,
        headers,
        params,
        data,
        ...config,
      })
    } else {
      throw new Error('[!] Not a valid request.')
    }
  }
}

export class ArgumentsBuilder {
  program?: Command
  options: Array<ArgumentBuilderOption> = []

  constructor() {
    this.program = new Command()
  }

  parse(args: string[]) {
    this.program.parse(args)
    this.validateRequiredParams()
    return this
  }

  validateRequiredParams() {
    const opts = this.getOpts()

    this.getRequiredOpts().forEach(option => {
      if (opts[option] === undefined) {
        throw new Error(`Missing required parameter: ${option}`)
      }
    })
  }

  getRequiredOpts(): Array<string> {
    return this.options
      .filter(option => option.required)
      .map(option => option.command)
  }

  getOpts(): any {
    return this.program.opts()
  }

  withVersion(version: string) {
    this.program.version(version)
    return this
  }

  withOption(option: ArgumentBuilderOption) {
    const space = ' '

    let payload = `--${option.command}`

    if (option.alias) {
      payload = `-${option.alias}, --${option.command}`
    }

    this.program.option(
      payload.concat(space).concat('<string>'),
      option.description,
      option.defaultValue
    )
    this.options = this.options.concat(option)

    return this
  }
}
