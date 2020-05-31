import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { stringsReader } from "https://deno.land/std/io/util.ts";
import { TextProtoReader } from 'https://deno.land/std/textproto/mod.ts';

export type MimePart = {
  headers: Record<string, string>;
  content: string;
}

export const parseMultipartRelated = async (rawBody: string, boundary: string) : Promise<MimePart[]> => {
  
  const reader = new TextProtoReader(new BufReader(stringsReader(rawBody)));
  
   const parts: MimePart[] = [];
  
  /** A function which adds a blank MIME part to the end of the parts array, and returns it for populating */
  const newPart = () => {
    parts.push({ headers: {}, content: '' });
    return parts[parts.length - 1];
  }
  
  /** A function which writes a source iterable containing MIME headers to a target object as key-value pairs */
  const populateHeaders = (source : IterableIterator<[string, string]>, target: Record<string, string>) => {
    for (let h of source) {
      target[h[0].toLowerCase()] = h[1];
    }
  }
  
  const separator = `--${boundary}`;
  const terminator = `--${boundary}--`;

  let line;
  let currentPart = null;
  while ((line = await reader.readLine()) != terminator) {
    if (line === separator) {
      currentPart = newPart();
      const mimeHeaders = await reader.readMIMEHeader() || new Headers();
      populateHeaders(mimeHeaders.entries(), currentPart.headers);
    }
    else if (currentPart) {
      currentPart.content += line + '\r\n';
    }
  } 

  return parts;
}
