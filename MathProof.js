// @ts-check

define(async function (req, exports, module, args) {
  const { Button, ButtonRef } = await req("./js/Button");
  const { createElement } = await req("./js/HTMLUtils");
  const { renderToString: renderMath } = await req("./js/MathUtils");

  const viewport = createElement("div", true);
  const btns = createElement("div", true);

  /**
   * @typedef Reason
   * @prop {string} name
   * @prop {number[]} args
   */

  /**
   * @typedef ProofRow
   * @prop {string} stmt
   * @prop {Reason} reason
   */

  /**
   * @typedef Proof
   * @prop {ProofRow[]} data
   * @prop {string} name
   */

  /**
   * @param {string} _text
   */
  function parseExpr(_text) {
    let text = _text.split("");
    let res = "";

    while (text.length > 0) {
      let char = text.shift();
      if (char == "$") {
        let chars = "";
        while (text.length > 0 && text[0] != "$") {
          if (text[0] == "\\" && text[1] == "$") {
            chars += text.shift();
          }
          chars += text.shift();
        }
        text.shift();
        res += renderMath(chars);
      } else res += char;
    }
    return res;
  }

  /**
   * @type {Proof[]}
   */
  const proofs = JSON.parse(localStorage.getItem("proofs") || "[]");
  /** @type {number} */
  let currentProofID = localStorage.getItem("currentProof");

  addEventListener("keydown", (e) => {
    if (e.ctrlKey) {
      if (e.key == "p") {
        e.preventDefault();
        renderCurrent(false);
        btns.innerHTML = "";
        print();
      } else if (e.key == "s") {
        e.preventDefault();
        document.body.innerHTML = "";
        writeObj(proofs[currentProofID]);
      } else if (e.key == "o") {
        e.preventDefault();
        const data = prompt("Enter markdown table");
        if (data) {
          let s = data.split("");
          let name = "";
          function skip_whitespace() {
            let res = "";
            while (s.length > 0 && /\s/.test(s[0])) res += s.shift();
            return res;
          }
          /**
           * @param {...string} chs
           */
          function skip_char(...chs) {
            while (chs.length > 0) {
              let ch = chs.shift();
              if (s[0] == ch) s.shift();
              else throw new SyntaxError(`Expected ${ch}, but got ${s[0]}`);
            }
          }
          function is_char(ch) {
            return s[0] == ch;
          }
          function read_while(cond) {
            let res = "";
            while (cond(s[0])) res += s.shift();
            return res;
          }
          skip_char("|");
          skip_whitespace();
          while (s.length > 0 && !is_char("|")) {
            name += s.shift();
          }
          name = name.trim();

          for (let i = 0; i < 3; i++) {
            skip_char("|");
            skip_whitespace();
          }
          for (let i = 0; i < 2; i++) {
            skip_whitespace();
            read_while(() => is_char("-"));
            skip_whitespace();
            skip_char("|");
            skip_whitespace();
          }
          /**
           * @template T
           * @param {string} start
           * @param {string} stop
           * @param {string} separator
           * @param {() => T} parser
           */
          function delimited(start, stop, separator, parser) {
            /** @type {T[]} */
            let a = [];
            let first = true;
            skip_char(start);
            while (s.length > 0) {
              if (is_char(stop)) break;
              if (first) first = false;
              else skip_char(separator);
              if (is_char(stop)) break;
              a.push(parser());
            }
            skip_char(stop);
            skip_whitespace();
            return a;
          }
          let index = 1;
          function parseRow() {
            /** @type {ProofRow} */
            let res = {};
            skip_whitespace();
            skip_char("|");
            skip_whitespace();
            skip_char(index, ".");
            res.stmt = read_while(() => !is_char("|")).trim();
            skip_whitespace();
            skip_char("|");
            skip_whitespace();
            skip_char(index, ".");
            res.reason = {};
            res.reason.name = read_while(() => !is_char("(") && !is_char("|")).trim();
            if (is_char("|")) {
              res.reason.args = [];
              s.shift();
            } else if (is_char("(")) {
              res.reason.args = delimited("(", ")", ",", () => {
                let num = "";
                while (s.length > 0 && /\d/.test(s[0])) {
                  num += s.shift();
                }
                return +num;
              });
              skip_whitespace();
              skip_char("|");
            }
            skip_whitespace();
            index++;
            return res;
          }
          /**
           * @type {Proof}
           */
          let res = { data: [], name };
          while (s.length > 0) {
            res.data.push(parseRow());
          }
          proofs.push(res);
        }
      } else if (e.key == "e") {
        e.preventDefault();
        let proof = proofs[currentProofID];
        let maxStmtLen = Math.max(...proof.data.map((v) => v.stmt.length));
        let maxReasonLen = Math.max(...proof.data.map((v, i) => joinReason(v.reason, i, false).length));

        let res = `| ${proof.name}${" ".repeat(maxStmtLen + 4 - proof.name.length)}|${" ".repeat(maxReasonLen + 2)}|
| ${"-".repeat(maxStmtLen + 3)} | ${"-".repeat(maxReasonLen)} |\n`;

        for (let i = 0; i < proof.data.length; i++) {
          const row = proof.data[i];
          const stmt = `${i + 1}. ${row.stmt}`.padEnd(maxStmtLen + 3, " ");
          const reason = joinReason(row.reason, i, false).padEnd(maxReasonLen, " ");
          res += `| ${stmt} | ${reason} |\n`;
        }
        const elem = createElement("textarea", res, true);
        elem.cols = res.split(/\n/)[0].length;
        elem.rows = res.split(/\n/).length;
        elem.focus();
        elem.select();
      }
    }
  });

  function saveProofs() {
    localStorage.setItem("proofs", JSON.stringify(proofs));
    localStorage.setItem("currentProof", currentProofID);
    renderCurrent();
  }

  if (proofs.length == 0) {
    saveProofs();
  }

  /**
   * @param {string} reason
   * @returns {Reason}
   */
  function parseReasons(reason) {
    let reasonName = reason.slice(0, reason.includes("(") ? reason.lastIndexOf("(") : undefined).trim();
    let args = null;
    if (reason.includes("(")) {
      args = reason
        .slice(reason.lastIndexOf("(") + 1, -1)
        .split(/,\s*/)
        .map((v) => +v);
    }
    return {
      name: reasonName,
      args: args || []
    };
  }

  /**
   * @param {Reason} reason
   * @param {number} i
   */
  function joinReason(reason, i, parse = true) {
    return `${i + 1}. ${parse ? parseExpr(reason.name) : reason.name}${reason.args.length > 0 ? ` (${reason.args.join(", ")})` : ""}`;
  }

  /**
   * @param {number} proofID
   * @param {boolean=} interactive
   */
  function render(proofID, interactive = true) {
    const proof = proofs[proofID];
    const elem = document.createElement("div");
    elem.appendChild(
      ButtonRef("h5", parseExpr(proof.name), () => {
        const name = prompt("Enter a name", proof.name);
        if (name) proof.name = name;
        saveProofs();
      })
    );
    const table = elem.appendChild(document.createElement("table"));
    table.border = "1";
    const body = table.appendChild(document.createElement("tbody"));

    for (let i = 0; i < proof.data.length; i++) {
      const row = proof.data[i];
      const tr = body.appendChild(document.createElement("tr"));
      tr.appendChild(
        createElement(
          "td",
          ButtonRef("span", `${i + 1}. ${parseExpr(row.stmt)}`, () => {
            let stmt = prompt("Enter the statement", row.stmt);
            if (!stmt) return;
            row.stmt = stmt;
            saveProofs();
          })
        )
      );
      tr.appendChild(
        createElement(
          "td",
          ButtonRef("span", joinReason(row.reason, i), () => {
            let reason = prompt("Enter the reason", joinReason(row.reason, i, false));
            if (!reason) return;
            row.reason = parseReasons(reason);
            saveProofs();
          })
        )
      );
      if (interactive) {
        tr.appendChild(
          createElement(
            "td",
            ButtonRef(
              "-",
              () => {
                proof.data.splice(i, 1);
                for (let j = 0; j < proof.data.length; j++) {
                  const {
                    reason: { args }
                  } = proof.data[j];
                  if (args.includes(i + 1)) {
                    proof.data[j].reason.args = args.filter((v) => v != i + 1);
                  }
                }
                for (let j = i; j < proof.data.length; j++) {
                  const { reason } = proof.data[j];
                  reason.args = reason.args.map((v) => {
                    if (v >= i + 1) {
                      return v - 1;
                    } else return v;
                  });
                }
                saveProofs();
              },
              (btn) => {
                btn.style.background = "red";
              }
            )
          )
        );
        tr.appendChild(
          createElement(
            "td",
            ButtonRef("=", () => {
              const strNum = prompt("Enter a new number");
              if (strNum == null) return;
              const num = parseInt(strNum) - 1;

              // writeLn(i);
              // writeLn(num);

              const temp = proof.data[i];
              proof.data[i] = proof.data[num];
              proof.data[num] = temp;

              for (let j = 0; j < proof.data.length; j++) {
                const { reason } = proof.data[j];
                if (reason.args.includes(i + 1)) {
                  // writeObj(reason.args);
                  reason.args = reason.args.map((v) => (v == i + 1 ? num + 1 : v));
                } else if (reason.args.includes(num + 1)) {
                  // writeObj(reason.args);
                  reason.args = reason.args.map((v) => (v == num + 1 ? i + 1 : v));
                }
              }

              saveProofs();

              // if (num < i + 1)
              //   for (let j = num; j < proof.data.length; j++) {
              //     const { reason } = proof.data[j];
              //     reason.args = reason.args.map((v) => (v >= num ? v + 1 : v));
              //   }
              // else
              //   for (let j = num - 1; j >= 0; j--) {
              //     const { reason } = proof.data[j];
              //     reason.args = reason.args.map((v) => (v <= num ? v - 1 : v));
              //   }

              // for (let j = i; j < proof.data.length; j++) {
              //   const { reason } = proof.data[j];
              //   reason.args = reason.args.map((v) => {
              //     if (v >= i + 1) {
              //       return v - 1;
              //     } else return v;
              //   });
              // }
              saveProofs();
            })
          )
        );
      }
    }

    if (interactive) {
      const tr = body.appendChild(document.createElement("tr"));
      tr.appendChild(
        ButtonRef("Add", () => {
          let stmt = prompt("Enter the statement");
          if (!stmt) return;
          let reason = prompt("Enter the reason");
          if (!reason) return;
          proof.data.push({
            stmt,
            reason: parseReasons(reason)
          });
          saveProofs();
        })
      );
    }

    return elem;
  }

  function create() {
    let name = prompt("Enter a name");
    if (!name) throw new Error("No name");

    proofs.push({
      data: [],
      name
    });

    currentProofID = proofs.length - 1;

    saveProofs();
  }

  function renderCurrent(interactive = true) {
    viewport.innerHTML = "";
    if (!proofs[currentProofID]) return;
    viewport.appendChild(render(currentProofID, interactive));
  }

  function selectProof(text = "Choose a proof") {
    let promptText = `${text}:\n`;
    for (let i = 0; i < proofs.length; i++) {
      const proof = proofs[i];
      promptText += `${i + 1}: ${proof.name}${i != proofs.length - 1 ? "\n" : ""}`;
    }
    let i = prompt(promptText);
    if (i == null || Number.isNaN(+i)) throw new Error("Invalid number");
    i = +i - 1;
    if (i < -1 || i >= proofs.length) return null;
    return +i;
  }

  Button(btns, "New", () => {
    create();
  });
  Button(btns, "Load", () => {
    let i = selectProof();
    if (i == 0) currentProofID = null;
    if (i == null) return;
    currentProofID = i;
    saveProofs();
  });
  Button(btns, "Remove", () => {
    let i = selectProof("Choose a proof to delete");
    if (i == null) return;
    proofs.splice(i, 1);
    saveProofs();
  });

  if (currentProofID != null) {
    renderCurrent();
  }

  // writeLn("");
  // displayObj(() => proofs);
});
