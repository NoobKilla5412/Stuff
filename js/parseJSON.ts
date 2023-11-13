class ParseJSON {
  private static isObj(obj: any): boolean {
    return typeof obj === "object" && !Array.isArray(obj);
  }
  private static escapeHTML(html: string) {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  private static parseJSONDataReadable(data: any): string {
    var res = "";
    if (this.isObj(data) && !Array.isArray(data)) {
      res += "<ul>";
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key];
          res += `<li><h1>${key}:</h1><p>${this.parseJSONDataReadable(element)}</p></li>`;
        }
      }
      res += "</ul>";
    } else if (Array.isArray(data)) {
      res += "<li><ol>";
      data.forEach(element => {
        res += `<li>${this.parseJSONDataReadable(element)}</li>`;
      });
      res += "</ol></li>";
    } else if (typeof data == "function") {
      res += `<pre>${this.escapeHTML(data.toString())}</pre>`;
    } /*  else if (["string", "number", "boolean", "symbol", "undefined"].includes(typeof data)) {
    res += data;
  } */ else res += data + "";
    return res;
  }
  public static parseJSON(data: object, format: string = "readable"): string {
    if (format == "readable") return `<ol>${this.parseJSONDataReadable(data)}</ol>`;
    return "";
  }
  public static testIfExists(variable: any): boolean {
    try {
      return eval(variable) ? true : true;
    } catch {
      return false;
    }
  }
}
console.log(ParseJSON.parseJSON({ title: "value" }));
