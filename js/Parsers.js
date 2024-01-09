"use strict";
var Parsers;
(function (Parsers) {
  class Markdown {
    static parseValue(str) {
      this.strLength = str.length;
      while (this.pos < this.strLength) {
        if (str[this.pos] == "#") {
          this.parseHead();
        }
      }
      return this.res;
    }
    static parseHead() {}
  }
  Markdown.pos = 0;
  Markdown.strLength = 0;
  Markdown.res = "";
  Parsers.Markdown = Markdown;
  let weatherData;
  (function (weatherData) {
    function parse(to, data) {
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
    weatherData.parse = parse;
  })((weatherData = Parsers.weatherData || (Parsers.weatherData = {})));
})(Parsers || (Parsers = {}));
