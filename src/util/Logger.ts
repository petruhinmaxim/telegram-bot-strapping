import { ActorRef } from 'comedy'

export interface Logger {
  debug(...messages: any[]): void;

  info(...messages: any[]): void;

  warn(...messages: any[]): void;

  error(...messages: any[]): void;
}

function formatMessage(
  level: string,
  thread: string,
  ...messages: any[]
) {
  const msg = messages.map(x => x.join('\n    ')).join('\n  ')
  return `${new Date().toISOString()} ${level} ${thread}: ${msg}`
}

export function actorLogger(actor: ActorRef): Logger {
  const thread = `${actor.getName()}(${actor.getId()})`
  return {
    debug: (...messages: any[]): void => {
      if (actor.getLog().isDebug()) {
        console.log(formatMessage('DEBUG', thread, messages))
      }
    },
    info: (...messages: any[]): void =>
      console.log(formatMessage('INFO', thread, messages)),
    warn: (...messages: any[]): void =>
      console.log(formatMessage('WARN', thread, messages)),
    error: (...messages: any[]): void =>
      console.log(formatMessage('ERROR', thread, messages)),
  }
}
