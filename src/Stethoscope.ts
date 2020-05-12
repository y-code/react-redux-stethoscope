import { act } from '@testing-library/react'
import { Middleware, AnyAction, Dispatch } from 'redux'
import AsyncLock from 'async-lock'
import logger from './logger'

export class Stethoscope {
  private readonly heartBeat = 50
  private _targets: ListenTarget[] = []
  private _isTriggering: boolean = false;
  private _currentAction: AnyAction|null = null;
  private _lock = new AsyncLock();

  constructor(
    public name?: string
  ) {
  }

  public asMiddleware(): Middleware {
    const middleware: Middleware = store => dispatch => action => {
      (store as any).stethoscope = this
      let result = dispatch(action)
      return result
    }
    (middleware as any).stethoscope = {
      execute: (dispatch: Dispatch, action: AnyAction) => {
        this._currentAction = action
        let result
        logger.info(`starting dispatching Action '${action.type}'`)
        act(() => {
          result = dispatch(action)
        })
        this.runHook(action)
        logger.info(`finished dispatching Action '${action.type}'`)
        return result
      }
    }
    return middleware;
  }

  private runHook(currentAction: AnyAction) {
    if (this._isTriggering) {
      return
    }

    let executedTarget: ListenTarget|null = null
    let i = 0
    for (; i < this._targets.length; i++) {
      let target = this._targets[i];
      if (currentAction.type === target.actionType) {
        executedTarget = target
        if (target.onUpdated) {
          target.onUpdated()
        }
        break
      }
    }
    if (executedTarget) {
      this._targets.splice(i, 1)
    }
  }

  public async listenAsync(info: ListenInfo) {
    await this._lock
      .acquire('listen_lock', async done => {
        let timeout = info.timeout || 3000
        this._targets = [...info.targets]
    
        logger.info(`starting triggering.`)
        this._isTriggering = true
        act(info.act as { (): Promise<void|undefined> })      
        this._isTriggering = false
        if (this._currentAction) {
          this.runHook(this._currentAction)
        }
        logger.info(`finished triggering.`)

        const maxCount = Math.floor(timeout / this.heartBeat)
        let counter = 0
        while (this._targets.length) {
          logger.debug(`waiting... (${counter} / ${maxCount})`)
          if (counter > maxCount) {
            let err = `React-Redux Stethoscope timed out after waiting for all the react-redux updates for ${timeout / 1000}s.`
            logger.error(err)
            throw new Error(err)
          }
          await new Promise(r => setTimeout(r, this.heartBeat))
          counter++
        }
        done()
      })
  }
}

export interface ListenTarget {
  actionType: string
  onUpdated: { (): void|undefined }|{ (): Promise<void|undefined> }
}

export interface ListenInfo {
  act: { (): void|undefined }|{ (): Promise<void|undefined> }
  targets: ListenTarget[]
  timeout?: number
}

export default Stethoscope
