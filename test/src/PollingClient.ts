import { Store } from "redux";
import { thunkCreators } from "./store";

class PollingClient {
  constructor(
    private store: Store,
    private interval: number = 1000
  ) {

  }

  start(): void {
    setTimeout(() => {
      this.start()
      this.poll()
    }, this.interval)
  }

  poll(): void {
    this.store.dispatch(thunkCreators.polling.requestPolling() as any)
  }
}

export default PollingClient
