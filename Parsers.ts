namespace Parsers {
  export class Markdown {
    private static pos = 0;
    private static strLength = 0;
    private static res = "";
    public static parseValue(str: string): string {
      this.strLength = str.length;
      while (this.pos < this.strLength) {
        if (str[this.pos] == "#") {
          this.parseHead();
        }
      }
      return this.res;
    }

    private static parseHead(): void {}
  }

  export namespace weatherData {
    export type weatherDataData = {
      date: Date;
      location: Location;
      temperature: number;
      pressure: number;
      humidity: number;
      windSpeed: number;
      windDirection: string;
      visiblitity: number;
      preciptiation: number;
      cloudCover: number;
      cloudType: string[];
    }[];

    export function parse<T extends HTMLElement>(to: T, data: weatherDataData): void {
      let html = `<table border="1px">
      <thead>
        <tr>
          <th>Date</th>
          <th>Location</th>
          <th>Temp</th>
          <th>Pressure</th>
          <th>Humidity</th>
          <th>Wind Speed</th>
          <th>Wind Direction</th>
          <th>Visiblitity</th>
          <th>Preciptiation</th>
          <th>Cloud Cover</th>
          <th>Cloud Type</th>
        </tr>
      </thead>
      <tbody>`;
      data.forEach((element) => {
        html += `<tr>
          <td>${element.date.toDateString() + " " + element.date.toLocaleTimeString()}</td>
          <td>${element.location.toString()}</td>
          <td>${element.temperature}&deg;F</td>
          <td>${element.pressure}in&nbsp;Hg</td>
          <td>${element.humidity}%</td>
          <td>${element.windSpeed}mph</td>
          <td>${element.windDirection}</td>
          <td>${element.visiblitity}mi</td>
          <td>${element.preciptiation}in</td>
          <td>${element.cloudCover}%</td>
          <td>${element.cloudType.join(", ")}</td>
        </tr>`;
      });
      html += "</tbody></table>";
      to.innerHTML = html;
    }
  }
}
