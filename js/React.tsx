// class React {
//   static createElement(
//     type: string,
//     props: { [x: string]: any },
//     innerHTML: string
//   ) {
//     let tempElem = document.createElement(type);
//     tempElem.innerHTML = innerHTML;
//     for (const key in props) {
//       if (Object.hasOwnProperty.call(props, key)) {
//         const element = props[key];
//         if (key != "style")
//           tempElem.setAttribute(key, element);
//         else
//           for (const key1 in element) {
//             if (Object.hasOwnProperty.call(element, key1)) {
//               const element1 = element[key1];
//               // @ts-ignore
//               tempElem.style[key1] = element1;
//             }
//           }
//       }
//     }
//     return tempElem;
//   }
// }

document.body.append(
  <div style={{ border: "1px solid black" }}>
    <table>
      <th>hi</th>
    </table>
  </div>
);
