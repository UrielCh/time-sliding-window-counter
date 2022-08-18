import { SlidingWindowCounterBase, SlidingWindowCounterOption } from "./SlidingWindowCounterBase.ts"

export class SlidingWindowCounter extends SlidingWindowCounterBase<void> {
  constructor(options = {} as SlidingWindowCounterOption) {
    super(options)
  }

  /**
   * increment the counter on the current timestamp
   * @param n counter increment
   */
  add(n: number) {
    this.addTS(Date.now(), n);
  }

  /**
   * increment the counter using your own exact timestamp
   * @param ts timestamp
   * @param n counter increment
   */
  addTS(ts: number, n: number) {
    const timeblock = this.timeBlock(ts);
    const len = this.histo.length;
    if (len && this.histo[0].ts === timeblock) {
      this.histo[0].cnt += n;
    } else {
      this.histo.unshift({ ts: timeblock, cnt: n });
    }
  }

  /**
   * get counter only
   * @param mss times in millisec
   * @returns
   */
  count(...mss: readonly number[]): Array<number> {
    for (let i = 0; i < mss.length - 1; i++) {
      if (mss[i] < mss[i + 1]) {
        throw Error('Count multiple time interface muist be ordered in dessendend order ex: [15000, 5000, 1000]')
      }
    }
    const now = this.timeBlock(Date.now());
    const expire = now - this.opt.TTL;
    const limits = mss.map((ms) => now - ms);
    const array = this.histo;
    const cnts = mss.map(() => 0);
    for (let i = 0; i < array.length; i++) {
      const elm = array[i];
      for (let i = limits.length - 1; i >= 0; i--) {
        if (elm.ts > limits[i]) {
          cnts[i] += elm.cnt;
          break; // add elm only once secs must be in decending order
        }
      }
    }
    this.cleanOldCell(expire);
    for (let i = cnts.length - 2; i >= 0; i--) {
      cnts[i] += cnts[i + 1]
    }
    return cnts;
  }
}
