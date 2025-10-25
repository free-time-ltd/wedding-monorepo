export default class UrlFactory {
  constructor(
    private readonly domain: string,
    private readonly isSecure: boolean = true
  ) {}

  private get baseUrl() {
    const protocol = this.isSecure ? "https" : "http";
    return `${protocol}://${this.domain}`;
  }

  create(path: string, params?: Record<string, string | number | boolean>) {
    const url = new URL(path, this.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, String(value));
      }
    }

    return url;
  }

  toString(path: string, params?: Record<string, string | number | boolean>) {
    return this.create(path, params).toString();
  }
}
