// @ts-check

define(async function (req, exports, module, args) {
  const { Button, ButtonRef } = await req("./js/Button");
  const { createElement, br } = await req("./js/HTMLUtils");
  const { renderToString: renderMath } = await req("./js/MathUtils");
  const { typedef, isType, checkType } = await req("./js/typeUtils");
  const overload = await req("./js/overload");
  // const { open } = await req("./js/Menu");

  const newLine = " $ \\\\ $ ";
  const newLineRegex = / \$ *\\\\ *\$ /g;

  const viewport = createElement("div", true);
  const btns = createElement("div", true);
  br();
  const exportBox = createElement("textarea", true);
  exportBox.wrap = "off";

  /**
   * @typedef Reason
   * @prop {string} name
   * @prop {{ num: number; segment?: string }[]} args
   */
  typedef("Reason", "{name: string; args: { num: number; segment?: string }[]}");

  /**
   * @typedef ProofRow
   * @prop {string[]} stmts
   * @prop {Reason} reason
   */
  typedef("ProofRow", "{stmts: string[]; reason: Reason}");

  /**
   * @typedef Proof
   * @prop {ProofRow[]} data
   * @prop {string} name
   * @prop {string[]} prove
   */
  typedef("Proof", "{data: ProofRow[]; name: string; prove: string[] }");

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
  // proofs.forEach((v) => (v.prove = ["Add a prove statement"]));
  // localStorage.setItem("proofs", JSON.stringify(proofs));
  /** @type {number} */
  let currentProofID = +(localStorage.getItem("currentProof") ?? 0);

  const snippets = {
    "/para{}{}": "/seg{$1}\\parallel/seg{$2}",
    "/cos{}{}": "\\overline{$1}\\cong\\overline{$2}",
    "/coa{}{}": "\\angle $1\\cong\\angle $2",
    "/perp{}{}": "\\overline{$1}\\perp\\overline{$2}",
    "/rt{}": "$\\angle $1$ is a rt $\\angle$",
    "/rtt{}": "$\\triangle $1$ is a rt $\\triangle$",
    "/lin{}{}": "$\\angle $1\\wedge\\angle $2$ form a lin pair",
    "/cot{}{}": "\\triangle $1\\cong\\triangle $2",
    "/seg{}": "\\overline{$1}",
    "(\\d+)/(\\d+)": "\\frac{$1}{$2}",
    "([\\w\\D]+)/([\\w\\D]+)": "\\frac{$1}{$2}",
    "{}/{}": "\\frac{$1}{$2}",
    // "(?<!\\\\)\\bangles\\b": "$\\angle$'",
    "(?<!\\\\)\\bangle\\b": "$\\angle$"
  };

  /**
   * @param {string[]} text
   */
  function replaceSnippets(text) {
    return overload([text], ["string[]"], () => {
      for (const key in snippets) {
        if (Object.hasOwnProperty.call(snippets, key)) {
          const value = snippets[key];
          let replacer = new RegExp(`${key.replace(/\{\}/g, "{(.+?)}")}`, "g");
          text = text.map((v) => v.replace(replacer, value));
        }
      }
      return text;
    });
  }

  /**
   * @param {string} data
   */
  function parseMD(data, name = "") {
    let s = data.split("");
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
    let hasName = name.length != 0;
    while (s.length > 0 && !is_char("|")) {
      if (!hasName) name += s.shift();
      else s.shift();
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
        skip_whitespace();
        if (is_char(stop)) break;
        if (first) first = false;
        else skip_char(separator);
        skip_whitespace();
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
      skip_char(...index.toString(), ".");
      let stmts = read_while(() => !is_char("|"));
      res.stmts = stmts.split(newLineRegex).map((v) => v.trim());
      skip_whitespace();
      skip_char("|");
      skip_whitespace();
      skip_char(...index.toString(), ".");
      res.reason = {};
      res.reason.name = read_while(() => !is_char("(") && !is_char("|")).trim();
      if (is_char("|")) {
        res.reason.args = [];
        s.shift();
      } else if (is_char("(")) {
        res.reason.args = delimited("(", ")", ",", () => {
          let num = "";
          let segment = "";
          while (s.length > 0 && /\d/.test(s[0])) {
            num += s.shift();
          }
          while (s.length > 0 && /\w/.test(s[0])) {
            segment += s.shift();
          }
          return { num: +num, segment };
        });
        skip_whitespace();
        skip_char("|");
      }
      skip_whitespace();
      index++;
      return res;
    }

    let proofData = [];

    while (s.length > 0) {
      proofData.push(parseRow());
    }
    /**
     * @type {Proof}
     */
    let res = { data: proofData, name, prove: proofData[proofData.length - 1].stmts };

    return { name, res };
  }

  function importMD() {
    const data = prompt("Enter markdown table");
    if (data) {
      let { name, res } = parseMD(data);
      if (!name) name = prompt("Enter a name") || "";

      proofs.push(res);
      currentProofID = proofs.length - 1;
      saveProofs();
    }
  }
  function importJSON() {
    let proof = prompt("Enter JSON data");
    if (!proof) return;
    proof = JSON.parse(proof);
    checkType(proof, "Proof");
    proofs.push(/** @type {Proof} */ (/** @type {unknown} */ (proof)));
    currentProofID = proofs.length - 1;
    saveProofs();
  }

  addEventListener("keydown", (e) => {
    try {
      if (e.ctrlKey) {
        if (e.key == "p") {
          e.preventDefault();
          renderCurrent(false);
          btns.innerHTML = "";
          exportBox.style.display = "none";
          print();
        } else if (e.key == "s") {
          e.preventDefault();
          document.body.innerHTML = "";
          writeObj(proofs[currentProofID]);
        } else if (e.key == "e") {
          e.preventDefault();
          let proof = proofs[currentProofID];
          let maxStmtLen = Math.max(...proof.data.map((v) => v.stmts.join(newLine).length));
          let maxReasonLen = Math.max(...proof.data.map((v, i) => joinReason(v.reason, i, false).length));

          let res = `| ${proof.name}${" ".repeat(maxStmtLen + 4 - proof.name.length)}|${" ".repeat(maxReasonLen + 2)}|
| ${"-".repeat(maxStmtLen + 3)} | ${"-".repeat(maxReasonLen)} |\n`;

          for (let i = 0; i < proof.data.length; i++) {
            const row = proof.data[i];
            const stmt = `${i + 1}. ${row.stmts.join(newLine)}`.padEnd(maxStmtLen + 3, " ");
            const reason = joinReason(row.reason, i, false).padEnd(maxReasonLen, " ");
            res += `| ${stmt} | ${reason} |\n`;
          }
          exportBox.value = res;
          exportBox.cols = Math.min(res.split(/\n/)[0].length, 150);
          exportBox.rows = res.split(/\n/).length;
          exportBox.focus();
          exportBox.select();
        } else if (e.key == "i") {
          importJSON();
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  function saveProofs() {
    // checkType(proofs, "Proof[]");

    for (let i = 0; i < proofs.length; i++) {
      const proof = proofs[i];
      for (let j = 0; j < proof.data.length; j++) {
        const row = proof.data[j];
        if (row.stmts.join("").length == 0) {
          deleteRow(proof, j);
          j = 0;
        }
      }
    }

    localStorage.setItem("proofs", JSON.stringify(proofs));
    localStorage.setItem("currentProof", currentProofID.toString());
    renderCurrent();
  }

  if (proofs.length == 0) {
    saveProofs();
  }

  /**
   * @param {string[]} s
   * @param {(char: string) => boolean} cond
   */
  function read_while(s, cond) {
    let res = "";
    while (cond(s[0])) res += s.shift();
    return res;
  }

  /**
   * @param {string} reason
   * @returns {Reason}
   */
  function parseReasons(reason) {
    return overload([reason], ["string"], () => {
      let reasonName = replaceSnippets([reason.slice(0, reason.includes("(") ? reason.lastIndexOf("(") : undefined).trim()]);
      let args = null;
      if (reason.includes("(")) {
        args = reason
          .slice(reason.lastIndexOf("(") + 1, -1)
          .split(/,\s*/)
          .map((v) => {
            let s = v.split("");
            let num = +read_while(s, (char) => /\d/g.test(char));
            if (Number.isNaN(num)) return 0;
            let segment = s.join("");
            return { num, segment };
          });
      }
      args ||= [];
      args = args.filter((v) => v);
      return {
        name: reasonName,
        args
      };
    });
  }

  /**
   * @param {Reason} reason
   * @param {number} i
   */
  function joinReason(reason, i, parse = true, number = true) {
    if (Array.isArray(reason.name)) reason.name = reason.name.join("");
    return overload([reason, i, parse, number], ["Reason", "number", "boolean", "boolean"], () => {
      return `${number ? `${i + 1}. ` : ""}${parse ? parseExpr(reason.name) : reason.name}${
        reason.args.length > 0 ? ` (${reason.args.map((v) => v.num + (v.segment || "")).join(", ")})` : ""
      }`;
    });
  }

  /**
   * @param {Proof} proof
   * @param {number} i
   */
  function deleteRow(proof, i) {
    proof.data.splice(i, 1);
    for (let j = 0; j < proof.data.length; j++) {
      const {
        reason: { args }
      } = proof.data[j];
      if (args.map((v) => v.num).includes(i + 1)) {
        proof.data[j].reason.args = args.filter((v) => v.num != i + 1);
      }
    }
    for (let j = i; j < proof.data.length; j++) {
      const { reason } = proof.data[j];
      reason.args = reason.args.map((v) => {
        if (v.num >= i + 1) {
          return { num: v.num - 1, segment: v.segment };
        } else return v;
      });
    }
    saveProofs();
  }

  /**
   * @param {number} proofID
   * @param {boolean=} interactive
   */
  function render(proofID, interactive = true) {
    const proof = proofs[proofID];
    const elem = document.createElement("div");
    elem.appendChild(
      ButtonRef("h5", parseExpr(proof.name), {
        onclick() {
          const name = prompt("Enter a name", proof.name);
          if (name) proof.name = name;
          saveProofs();
        }
      })
    );
    elem.appendChild(
      ButtonRef("h5", parseExpr(proof.prove.join(newLine)), {
        onclick() {
          /** @type {string | null} */
          let prove = "";
          let i = 0;
          while ((prove = prompt("Enter the prove statement", proof.prove[i]))) {
            if (prove != null) proof.prove[i] = prove;
            i++;
          }
          proof.prove = replaceSnippets(proof.prove);
          saveProofs();
        },
        onrightclick() {
          let id = prompt(`Enter a number to delete\n${proof.prove.map((v, i) => `${i + 1}: ${v}`).join("\n")}`);
          if (id != null && !Number.isNaN(+id) && +id > 0 && +id <= proof.prove.length) proof.prove.splice(+id - 1, 1);
          saveProofs();
        }
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
          ButtonRef("span", `${i + 1}. ${parseExpr(row.stmts.join(newLine))}`, {
            onclick() {
              /** @type {string | null} */
              let stmt = "";
              let i = 0;
              while ((stmt = prompt("Enter the statement", row.stmts[i]))) {
                if (stmt != null) row.stmts[i] = stmt;
                i++;
              }
              row.stmts = replaceSnippets(row.stmts);
              saveProofs();
            },
            onrightclick() {
              let id = prompt(`Enter a number to delete\n${row.stmts.map((v, i) => `${i + 1}: ${v}`).join("\n")}`);
              if (id != null && !Number.isNaN(+id) && +id > 0 && +id <= row.stmts.length) row.stmts.splice(+id - 1, 1);
              saveProofs();
            }
          })
        )
      );
      tr.appendChild(
        createElement(
          "td",
          ButtonRef("span", joinReason(row.reason, i), {
            onclick() {
              let reason = prompt("Enter the reason", joinReason(row.reason, i, false, false));
              if (!reason) return;
              row.reason = parseReasons(reason);
              saveProofs();
            }
          })
        )
      );
      if (interactive) {
        tr.appendChild(
          createElement(
            "td",
            ButtonRef(
              "-",
              {
                onclick() {
                  deleteRow(proof, i);
                }
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
            ButtonRef("=", {
              onclick() {
                const strNum = prompt("Enter a new number to insert above");
                if (strNum == null) return;
                const num = parseInt(strNum) - 1;

                // writeLn(i);
                // writeLn(num);

                const temp = proof.data[i];
                proof.data[i] = proof.data[num];
                proof.data[num] = temp;

                for (let j = 0; j < proof.data.length; j++) {
                  const { reason } = proof.data[j];
                  if (reason.args.map((v) => v.num).includes(i + 1)) {
                    reason.args = reason.args.map((v) => ({ num: v.num == i + 1 ? num + 1 : v.num, segment: v.segment }));
                  } else if (reason.args.map((v) => v.num).includes(num + 1)) {
                    reason.args = reason.args.map((v) => ({ num: v.num == num + 1 ? i + 1 : v.num, segment: v.segment }));
                  }
                }

                if (num < i) {
                  for (let j = num + 1; j < i + 1; j++) {
                    const temp = proof.data[i];
                    proof.data[i] = proof.data[j];
                    proof.data[j] = temp;
                  }
                } else if (num > i) {
                  for (let j = i + 1; j < num; j++) {
                    const temp = proof.data[i];
                    proof.data[i] = proof.data[j];
                    proof.data[j] = temp;
                  }
                }

                // saveProofs();

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
              }
            })
          )
        );
      }
    }

    if (interactive) {
      const tr = body.appendChild(document.createElement("tr"));
      tr.appendChild(
        ButtonRef("Add", {
          onclick() {
            let stmts = [];
            /** @type {string | null} */
            let stmt = "";
            while ((stmt = prompt("Enter the statement"))) stmts.push(stmt);
            let reason = prompt("Enter the reason") || "";
            proof.data.push({
              stmts: replaceSnippets(stmts),
              reason: parseReasons(reason)
            });
            saveProofs();
          }
        })
      );
    }

    return elem;
  }

  function create() {
    let name = prompt("Enter a name");
    if (!name) return;

    proofs.push({
      data: [],
      name,
      prove: ["Enter a prove statement"]
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
    let iStr = prompt(promptText);
    if (iStr == null || Number.isNaN(+iStr)) return; // throw new Error("Invalid number");
    let i = +iStr;
    i = +i - 1;
    if (i < -1 || i >= proofs.length) return null;
    return +i;
  }

  Button(btns, "New", {
    onclick() {
      create();
    }
  });
  Button(btns, "Import", {
    onclick() {
      importJSON();
    }
  });
  Button(btns, "Import MD", {
    onclick() {
      importMD();
    }
  });
  Button(btns, "Load", {
    onclick() {
      let i = selectProof();
      if (i == 0) currentProofID = 0;
      if (i == null) return;
      currentProofID = i;
      saveProofs();
    }
  });
  Button(btns, "Remove", {
    onclick() {
      let i = selectProof("Choose a proof to delete");
      if (i == null) return;
      proofs.splice(i, 1);
      if (currentProofID > proofs.length - 1) currentProofID--;
      saveProofs();
    }
  });

  if (currentProofID != null) {
    renderCurrent();
  }

  // writeLn("");
  // displayObj(() => proofs);
});
