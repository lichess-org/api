// from https://gist.github.com/ornicar/a097406810939cf7be1df8ea30e94f3e

type ProcessLine = (line: any) => void;

export const readStream = (processLine: ProcessLine) => (response: Response) => {
  const stream = response.body!.getReader();
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = '';

  const loop: () => Promise<void> = () =>
    stream.read().then(({ done, value }) => {
      if (done) {
        if (buf.length > 0) return processLine(JSON.parse(buf));
      } else {
        const chunk = decoder.decode(value, {
          stream: true,
        });
        buf += chunk;

        const parts = buf.split(matcher);
        buf = parts.pop() || '';
        for (const i of parts.filter(p => p)) processLine(JSON.parse(i));
        return loop();
      }
    });

  return loop();
};
