import { SlidingWindowCounterBase, SlidingWindowCounterOption } from "./SlidingWindowCounterBase.ts"


export interface SlidingWindowStorageOption extends SlidingWindowCounterOption {
    /**
     * Number of element to keep without time limit.
     * Give acess to the last event, even if it had expired.
     */
    keepLast?: number;
}

export class SlidingWindowStorage<T> extends SlidingWindowCounterBase<T> {
    keepLast: number;
    latests = [] as T[];

    constructor(options = {} as SlidingWindowStorageOption) {
        const { keepLast, ...opt } = options;
        super(opt)
        this.keepLast = keepLast || 0;
    }

    public getLatest(): T[] {
        return this.latests;
    }
    private addLatest(elem?: T): void {
        const { keepLast } = this;
        if (keepLast && elem) {
            const arr = this.latests;
            if (arr.length >= keepLast) {
                arr.pop();
            }
            arr.unshift(elem);
        }
    }

    addElm(elem?: T) {
        this.addTSElm(Date.now(), elem);
    }

    /**
     * keep track of the number of element, but do not keep elements
     */
    addTSElm(ts: number, elem?: T) {
        const timeblock = this.timeBlock(ts);
        this.addLatest(elem);
        const histo0 = this.histo[0];
        if (histo0 && histo0.ts === timeblock) {
            histo0.cnt++;
        } else {
            this.histo.unshift({ ts: timeblock, cnt: 1, elms: [] });
        }
    }

    /**
     * keep track of the number of element, and keep elements
     */
    addTSVerb(ts: number, elem: T) {
        const timeblock = this.timeBlock(ts);
        this.addLatest(elem);
        // const len = this.histo.length;
        const histo0 = this.histo[0];
        if (histo0 && histo0.ts === timeblock) {
            if (histo0.elms)
                histo0.elms.push(elem);
            histo0.cnt++;
        } else this.histo.unshift({ ts: timeblock, cnt: 1, elms: [elem] });
    }

    /**
     * get statistics with full Data
     * @param secs
     * @returns
     */
    statsVerb(secs: number[]): Array<T[]> {
        const now = this.timeBlock(Date.now());
        const expire = now - this.opt.TTL;
        const limits = secs.map((sec) => now - sec);
        const array = this.histo;
        const cnts = secs.map(() => [] as T[]);
        for (let i = 0; i < array.length; i++) {
            const elm = array[i];
            // for (let i = 0; i < limits.length; i++) {
            for (let i = limits.length - 1; i >= 0; i--) {
                if (elm.ts > limits[i]) {
                    if (elm.elms)
                        for (const e of elm.elms) {
                            cnts[i].push(e);
                        }
                    break; // add elm only once secs must be in decending order
                }
            }
        }
        this.cleanOldCell(expire);
        return cnts;
    }

}
