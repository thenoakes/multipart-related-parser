import { parseMultipartRelated } from './app.ts';
import { readFileStr } from 'https://deno.land/std/fs/mod.ts';
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const { test } = Deno;

test('Placeholder', async () => {
  const testFile = await readFileStr('/Users/matthewnoakes/repos/multipart-related/sample1.http');
  const parsed = await parseMultipartRelated(testFile);
  assertEquals(parsed.parts.length, 3);
});
