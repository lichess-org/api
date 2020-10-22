/* read an ndjson stream and call onEvent with each received object */
const ndjson = (onEvent: ((line: any) => void)) => (response: Response) => {
  const stream = response.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  const handle = (str: string) => {
    if (str) onEvent(JSON.parse(str));
  }

  const loop = (): Promise<void> => stream.read().then(({ done, value }) => {

    if (done) return handle(buf);

    buf += decoder.decode(value, { stream: true });

    const parts = buf.split(/\r?\n/);
    buf = parts.pop() || '';
    parts.forEach(handle);

    return loop();
  });

  return loop().then(() => console.log('the stream has completed'));
}

export default ndjson;
