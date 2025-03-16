export class Pooling {
  private isPollingMap: Map<string, boolean> = new Map();

  async start(
    session: string,
    event: string,
    httpClient: { get: (url: string) => Promise<any> },
    callback: (data: any) => void
  ) {
    const key = `${session}:${event}`;

    if (this.isPollingMap.get(key)) return;

    this.isPollingMap.set(key, true);
    const url = `/api/sessions/${session}/long-poll?event=${event}`;

    const poll = async () => {
      if (!this.isPollingMap.get(key)) return;

      try {
        const data = await httpClient.get(url);

        if (data?.error === "Request timed out") {
          poll();
          return;
        }

        callback(data);
      } catch (error) {
        console.error(error);
        setTimeout(poll, 5000);
      }

      if (this.isPollingMap.get(key)) {
        poll();
      }
    };

    poll();
  }

  stop(session: string, event: string) {
    const key = `${session}:${event}`;
    this.isPollingMap.set(key, false);
  }
}
