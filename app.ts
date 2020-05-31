import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { stringsReader } from "https://deno.land/std/io/util.ts";
import { TextProtoReader } from 'https://deno.land/std/textproto/mod.ts';

export type MimePart = {
  headers: Record<string, string>;
  content: string;
}

export type MultipartRelated = {
  httpHeaders: Record<string, string>;
  parts: MimePart[];
}

export const parseMultipartRelated = async (rawBody: string) : Promise<MultipartRelated> => {
  
  const reader = new TextProtoReader(new BufReader(stringsReader(rawBody)));
  
  /** A container for the full message including HTTP headers and the headers and content of each MIME part */
  const multipart: MultipartRelated = {
    httpHeaders: {},
    parts: [],
  };
  
  /** A function which adds a blank MIME part to the end of the parts array, and returns it for populating */
  const newPart = () => {
    multipart.parts.push({ headers: {}, content: '' });
    return multipart.parts[multipart.parts.length - 1];
  }
  
  /** A function which writes a source iterable containing MIME headers to a target object as key-value pairs */
  const populateHeaders = (source : IterableIterator<[string, string]>, target: Record<string, string>) => {
    for (let h of source) {
      target[h[0].toLowerCase()] = h[1];
    }
  }
  
  const httpHeaders = await reader.readMIMEHeader() || new Headers();
  populateHeaders(httpHeaders.entries(), multipart.httpHeaders);
  
  const boundary = (() => {
    const BOUNDARY_PARSER = /;\s*boundary=(.*?)\s*(;|$)/i;
    const parsed = BOUNDARY_PARSER.exec(multipart.httpHeaders['content-type']);
    let boundary = (parsed && parsed.length) ? (parsed[1] || parsed[2]) : "";
    return boundary.replace(/\"/g, "");
  })();
  
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

  return multipart;
}
