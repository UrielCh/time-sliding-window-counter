import { delay } from "https://deno.land/std@0.152.0/async/delay.ts";
import { assertEquals, assertThrows } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { SlidingWindowCounter } from "./SlidingWindowCounter.ts";

Deno.test("counter", async () => {
    const multi = 2;
    const timeResolution = 10 * multi;
    const delayTime = 51 * multi;
    const sum1Time = 100 * multi;
    const sum2Time = 400 * multi;
    const cnt = new SlidingWindowCounter({ TTL: 60 * 60 * 1000, timeResolution });
    assertEquals(cnt.count(sum1Time), [0], 'counter start empty');
    assertEquals(cnt.timeCellCount, 0, 'counter start empty');
    cnt.add(2)
    // await delay(delayTime);
    await delay(delayTime);
    assertEquals(cnt.count(sum1Time), [2], 'counter go to 2');
    assertEquals(cnt.timeCellCount, 1, 'counter should contains a sinle cell');
    cnt.add(3)
    assertEquals(cnt.count(sum1Time), [5], 'counter go up to 5');
    assertEquals(cnt.timeCellCount, 2, 'counter should contains 2 cells');
    await delay(delayTime);
    assertEquals(cnt.count(sum1Time), [3], 'counter go down to 3');
    assertEquals(cnt.count(sum2Time, sum1Time), [5, 3], 'counter 5 still visible with a longer tiome search');
});

Deno.test("bad order", () => {
    const cnt = new SlidingWindowCounter({ TTL: 60 * 60 * 1000, timeResolution: 200 });
    assertThrows(() => {
        cnt.count(1000, 4000);
    }, "must throws if receved an assending ordering zones")
});

