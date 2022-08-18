interface TsStatsEntry<T> {
    ts: number;
    cnt: number;
    elms?: T[];
}

export interface SlidingWindowCounterOption {
    /**
     * Time to live in millisec, data older than this linmit will be sischarged
     */
    TTL?: number;
    /**
     * time resolution is the durration of a single time block
     * default if 1000ms, memory consumtion will increase if you decrease this value.
     * if you wan to monitor events on week retention, you may want to choose 5 minutes.
     */
    timeResolution?: number;
}


/**
 * store counter per sec droping data after 1 hours
 */
export class SlidingWindowCounterBase<T> {
    protected opt: Required<SlidingWindowCounterOption>;

    constructor(options = {} as SlidingWindowCounterOption) {
        this.opt = {
            TTL: options.TTL || 60 * 60 * 1000,
            timeResolution: options.timeResolution || 1000,
        };
    }

    histo = [] as Array<TsStatsEntry<T>>;

    /**
     * drop all time cell older then expiration
     */
    protected cleanOldCell(expire: number) {
        let array = this.histo;
        let last = array.length - 1;
        let drop = 0;
        while (last >= 0) {
            if (array[last].ts > expire) {
                break;
            }
            last--;
            drop++;
        }
        if (drop) {
            array = array.slice(0, -drop);
            this.histo = array;
        }
    }

    protected timeBlock(ts: number) {
        return ((ts / this.opt.timeResolution) | 0) *
            this.opt.timeResolution;
    }

    get timeCellCount(): number {
        return this.histo.length;
    }
}


