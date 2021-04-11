import { parseMultipartRelated } from './app.ts';
import { assertEquals } from "https://deno.land/std@0.92.0/testing/asserts.ts";

const { test, readTextFile } = Deno;

test('Placeholder', async () => {
  const testFile = await readTextFile(new URL('.', import.meta.url).pathname + 'sample1.http');
  const parts = await parseMultipartRelated(testFile, 'BOUNDARY');
  assertEquals(parts.length, 3);
});
