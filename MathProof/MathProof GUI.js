// @ts-check

define(async function (req, exports, module, args) {
  const { Button, ButtonRef } = await req("../js/Button");
  const { createElement } = await req("../js/HTMLUtils");
  const { renderToString: renderMath } = await req("../js/MathUtils");
  const { typedef, isType, checkType } = await req("../js/typeUtils");
  const { openGUI, prompt, menu } = await req("../js/GUI");
  const overload = await req("../js/overload");

  // localStorage.clear();
  const newLine = " $ \\\\ $ ";
  const newLineRegex = / \$ *\\\\ *\$ /g;

  const viewport = createElement("div", true);
  const btns = createElement("div", true);

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
    "/paral{}{}": "/line{$1}\\parallel/line{$2}",
    "/supp{}{}": "$\\angle $1\\wedge\\angle $2$ are supp",
    "/cos{}{}": "\\overline{$1}\\cong\\overline{$2}",
    "/coa{}{}": "\\angle $1\\cong\\angle $2",
    "/eqa{}{}": "m\\angle $1 = m\\angle $2",
    "/perp{}{}": "\\overline{$1}\\perp\\overline{$2}",
    "/rt{}": "$\\angle $1$ is a rt $\\angle$",
    "/rtt{}": "$\\triangle $1$ is a rt $\\triangle$",
    "/lin{}{}": "$\\angle $1\\wedge\\angle $2$ form a lin pair",
    "/cot{}{}": "\\triangle $1\\cong\\triangle $2",
    "/seg{}": "\\overline{$1}",
    "/line{}": "\\overleftrightarrow{$1}",
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
      if (text.length == 1 && text[0] == "/prove") return [...proofs[currentProofID].prove];
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
      let stmts = "";
      while (!is_char("|") && s.length > 0) {
        console.log(stmts);
        if (is_char("\\") && s[1] == "|") {
          s.shift();
        }
        stmts += s.shift();
      }
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

  async function importMD() {
    const data = await prompt("Enter markdown table");
    if (data) {
      let { name, res } = parseMD(data);
      if (!name) name = (await prompt("Enter a name")) || "";

      proofs.push(res);
      currentProofID = proofs.length - 1;
      saveProofs();
    }
  }
  async function importJSON() {
    let proof = await prompt("Enter JSON data");
    if (!proof) return;
    proof = JSON.parse(proof);
    checkType(proof, "Proof");
    proofs.push(/** @type {Proof} */ (/** @type {unknown} */ (proof)));
    currentProofID = proofs.length - 1;
    saveProofs();
  }

  /**
   * @template T
   * @param {T} obj
   * @returns {T}
   */
  function clone(obj) {
    if (typeof obj == "object" && obj != null) {
      if (Array.isArray(obj)) {
        let arr = [];
        for (let i = 0; i < obj.length; i++) {
          const element = obj[i];
          arr.push(clone(element));
        }
        return /** @type {T} */ (arr);
      } else {
        /** @type {Record<string, any>} */
        let object = {};
        for (const key in obj) {
          if (Object.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            object[key] = clone(element);
          }
        }
        return /** @type {T} */ (object);
      }
    } else return obj;
  }

  const paragraphStarters = ["Hence", "Thus", "Therefore"];

  function joinArray(arr) {
    let res = "";
    if (arr.length == 2) {
      return arr[0] + " and " + arr[1];
    }
    for (let i = 0; i < arr.length; i++) {
      res += arr[i];
      if (i != arr.length - 2 && i != arr.length - 1) res += ", ";
      else if (i != arr.length - 1) res += ", and ";
    }
    return res;
  }

  async function exportProof() {
    let type = await menu([
      {
        innerHTML: "Export markdown",
        value: "md"
      },
      {
        innerHTML: "Export paragraph",
        value: "para"
      }
    ]);
    await sleep(90);
    switch (type) {
      case "md": {
        let proof = clone(proofs[currentProofID]);
        proof.data.forEach((v) => {
          v.stmts = v.stmts.map((v) => v.replace(/\|/g, "\\|"));
          v.reason.name = v.reason.name.replace(/\|/g, "\\|");
        });
        if (proof.data.length <= 0) return;
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
        const gui = await openGUI();
        const exportBox = gui.addElement(createElement("textarea"));
        exportBox.style.fontFamily = "monospace";
        exportBox.wrap = "off";
        exportBox.value = res;
        exportBox.cols = Math.min(res.split(/\n/)[0].length, 150);
        exportBox.rows = res.split(/\n/).length;
        exportBox.focus();
        exportBox.select();
        gui.addElement(createElement("br"));
        gui.addCancel("Close");
        break;
      }
      case "para": {
        let res = "";
        for (let i = 0; i < proofs[currentProofID].data.length; i++) {
          const row = proofs[currentProofID].data[i];
          if (row.reason.name == "Given") res += `We know ${joinArray(row.stmts)}. `;
          else {
            let paragraphStarter = paragraphStarters[i % paragraphStarters.length];
            for (let j = 0; j < row.reason.args.length; j++) {
              const arg = row.reason.args[j];
              if (i + 1 - arg.num >= 10) {
                let segment = arg.segment?.toUpperCase() || "A";
                paragraphStarter = `Recall that ${proofs[currentProofID].data[arg.num - 1].stmts[segment.charCodeAt(0) - 65]}, so`;
              }
            }
            res += `${paragraphStarter} ${joinArray(row.stmts)} by ${row.reason.name}. `;
          }
        }
        const gui = await openGUI();
        const div = gui.addElement(createElement("div"));
        div.innerHTML = parseExpr(res);
        const view = gui.addElement(createElement("textarea"));
        view.wrap = "off";
        view.value = res;
        gui.addElement(createElement("br"));
        gui.addCancel("Close");
        break;
      }
    }
  }

  addEventListener("keydown", async (e) => {
    try {
      if (e.ctrlKey) {
        if (e.key == "p") {
          e.preventDefault();
          renderCurrent(false);
          btns.innerHTML = "";
          print();
        } else if (e.key == "s") {
          e.preventDefault();
          const gui = await openGUI();
          const textarea = gui.addElement(createElement("textarea"));
          textarea.wrap = false;
          textarea.value = JSON.stringify(proofs[currentProofID]);
          gui.br();
          gui.addCancel("Close");
        } else if (e.key == "e") {
          e.preventDefault();
          await exportProof();
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
      ButtonRef("h5", parseExpr(proof.name) || "Enter a name", {
        async onclick() {
          proof.name = await prompt("Enter a name", proof.name);
          saveProofs();
        }
      })
    );
    elem.appendChild(
      ButtonRef("h5", parseExpr(proof.prove.join(newLine)) || "Enter a prove statement", {
        async onclick() {
          const gui = await openGUI();
          gui.addElement(createElement("h2", "Enter the prove statements"));
          const statementsDisp = gui.addElement(createElement("div"));
          let inputs = [];
          function update() {
            statementsDisp.innerHTML = "";
            inputs.length = 0;
            for (let i = 0; i < proof.prove.length; i++) {
              const prove = proof.prove[i];
              const input = statementsDisp.appendChild(createElement("input"));
              inputs.push(input);
              const remove = statementsDisp.appendChild(
                ButtonRef("button", "-", {
                  onclick() {
                    proof.prove.splice(i, 1);
                    update();
                    saveProofs();
                  }
                })
              );
              input.value = prove;
              statementsDisp.appendChild(createElement("br"));
            }
          }
          update();
          gui.addElement(
            ButtonRef("button", "Add", {
              onclick() {
                proof.prove = inputs.map((v) => v.value).filter((v) => v);
                proof.prove.push("");
                update();
                saveProofs();
              }
            })
          );
          gui.addConfirm(
            ButtonRef("button", "Save", {
              onclick() {
                proof.prove = inputs.map((v) => replaceSnippets([v.value])[0]).filter((v) => v);
                saveProofs();
                gui.close();
              }
            })
          );
          // /** @type {string | null} */
          // let prove = "";
          // let i = 0;
          // while ((prove = await prompt("Enter the prove statement", proof.prove[i]))) {
          //   if (prove != null) proof.prove[i] = prove;
          //   i++;
          // }
          // proof.prove = replaceSnippets(proof.prove);
          // saveProofs();
        }
      })
    );
    const table = elem.appendChild(document.createElement("table"));
    table.border = "1";
    const body = table.appendChild(document.createElement("tbody"));

    let steps = checkSteps();

    for (let i = 0; i < proof.data.length; i++) {
      const row = proof.data[i];
      const tr = body.appendChild(document.createElement("tr"));
      async function change() {
        const gui = await openGUI();
        gui.addElement(createElement("h2", "Enter the statements"));
        const statementsDisp = gui.addElement(createElement("div"));
        let inputs = [];
        let stmts = row.stmts;
        function update() {
          statementsDisp.innerHTML = "";
          inputs.length = 0;
          for (let i = 0; i < stmts.length; i++) {
            const input = statementsDisp.appendChild(createElement("input"));
            inputs.push(input);
            const remove = statementsDisp.appendChild(
              ButtonRef("button", "-", {
                onclick() {
                  stmts.splice(i, 1);
                  update();
                }
              })
            );
            input.value = stmts[i];
            statementsDisp.appendChild(createElement("br"));
          }
        }
        update();
        gui.addElement(
          ButtonRef("button", "Add", {
            onclick() {
              stmts = inputs.map((v) => v.value).filter((v) => v);
              stmts.push("");
              update();
            }
          })
        );

        gui.addElement(createElement("br"));

        gui.addElement(createElement("label", "Reason: "));
        const reasonInput = gui.addElement(createElement("input"));
        reasonInput.value = joinReason(row.reason, i, false, false);

        gui.addElement(createElement("br"));

        gui.addConfirm(
          ButtonRef("button", "Save", {
            onclick() {
              stmts = inputs.map((v) => v.value).filter((v) => v);
              gui.close();
              row.stmts = replaceSnippets(stmts);
              row.reason = parseReasons(reasonInput.value);
              saveProofs();
            }
          })
        );
        gui.addCancel("Cancel");
      }

      let stmts = row.stmts.map((v, j) => `${steps.includes(i + 1 + String.fromCharCode(j + 65).toLowerCase()) ? "✅" : "❎"} ${v}`);
      tr.appendChild(
        createElement(
          "td",
          ButtonRef("span", `${i + 1}. ${parseExpr(stmts.join(newLine))}`, {
            async onclick() {
              await change();
            }
          })
        )
      );
      tr.appendChild(
        createElement(
          "td",
          ButtonRef("span", joinReason(row.reason, i), {
            async onclick() {
              await change();
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
              async onclick() {
                const gui = await openGUI();
                gui.addElement(createElement("h2", "Enter a new number to insert above"));
                const input = gui.addElement(createElement("input"));
                input.select();
                gui.addElement(createElement("br"));
                gui.addConfirm(
                  ButtonRef("button", "Save", {
                    onclick() {
                      const strNum = input.value;
                      gui.close();
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
                      saveProofs();
                    }
                  })
                );
                gui.addCancel("Cancel");

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
          async onclick() {
            const gui = await openGUI();
            gui.addElement(createElement("h2", "Enter the statements"));
            const statementsDisp = gui.addElement(createElement("div"));
            let inputs = [];
            let stmts = [];
            function update() {
              statementsDisp.innerHTML = "";
              inputs.length = 0;
              for (let i = 0; i < stmts.length; i++) {
                const input = statementsDisp.appendChild(createElement("input"));
                inputs.push(input);
                const remove = statementsDisp.appendChild(
                  ButtonRef("button", "-", {
                    onclick() {
                      stmts.splice(i, 1);
                      update();
                    }
                  })
                );
                input.value = stmts[i];
                statementsDisp.appendChild(createElement("br"));
              }
            }
            update();
            gui.addElement(
              ButtonRef("button", "Add", {
                onclick() {
                  stmts = inputs.map((v) => v.value).filter((v) => v);
                  stmts.push("");
                  update();
                }
              })
            );

            gui.addElement(createElement("br"));

            gui.addElement(createElement("label", "Reason: "));
            const reasonInput = gui.addElement(createElement("input"));

            gui.addElement(createElement("br"));

            gui.addConfirm(
              ButtonRef("button", "Save", {
                onclick() {
                  stmts = inputs.map((v) => v.value).filter((v) => v);
                  gui.close();
                  proof.data.push({
                    stmts: replaceSnippets(stmts),
                    reason: parseReasons(reasonInput.value)
                  });
                  saveProofs();
                }
              })
            );
            gui.addCancel("Cancel");
            // /** @type {string | null} */
            // let stmt = "";
            // while ((stmt = await prompt("Enter the statement"))) stmts.push(stmt);
            // let reason = await prompt("Enter the reason") || "";
          }
        })
      );
    }

    return elem;
  }

  async function create() {
    let name = await prompt("Enter a name");
    if (!name) return;

    proofs.push({
      data: [],
      name,
      prove: []
    });

    currentProofID = proofs.length - 1;

    saveProofs();
  }

  function renderCurrent(interactive = true) {
    viewport.innerHTML = "";
    if (!proofs[currentProofID]) return;
    viewport.appendChild(render(currentProofID, interactive));
  }

  /**
   * @returns {Promise<number>}
   */
  async function selectProof(text = "Choose a proof") {
    return new Promise(async (resolve) => {
      const gui = await openGUI();
      gui.addElement(createElement("h2", text));
      gui.addElement(createElement("br"));
      for (let i = 0; i < proofs.length; i++) {
        const proof = proofs[i];
        gui.addElement(
          ButtonRef("div", parseExpr(proof.name), {
            onclick() {
              resolve(i);
              gui.close();
            }
          })
        );
      }
      gui.addElement(
        ButtonRef("Cancel", {
          onclick() {
            resolve(-1);
            gui.close();
          }
        })
      );
    });

    // let promptText = `${text}:\n`;
    // for (let i = 0; i < proofs.length; i++) {
    //   const proof = proofs[i];
    //   promptText += `${i + 1}: ${proof.name}${i != proofs.length - 1 ? "\n" : ""}`;
    // }
    // let iStr = await prompt(promptText);
    // if (iStr == null || Number.isNaN(+iStr)) return; // throw new Error("Invalid number");
    // let i = +iStr;
    // i = +i - 1;
    // if (i < -1 || i >= proofs.length) return null;
    // return +i;
  }

  function eqArrays(arr1, arr2) {
    if (arr1.length == arr2.length) {
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) return false;
      }
      return true;
    } else return false;
  }

  function checkSteps(useGUI = false) {
    const proof = proofs[currentProofID];
    let usedSteps = [];
    for (let i = 0; i < proof.data.length; i++) {
      const row = proof.data[i];
      if (eqArrays(row.stmts, proof.prove)) {
        usedSteps.push(i + 1);
      }
      for (let j = 0; j < row.reason.args.length; j++) {
        const reason = row.reason.args[j];
        usedSteps.push(reason.num + (reason.segment || "a"));
      }
    }
    for (let i = 0; i < proof.data[proof.data.length - 1].stmts.length; i++) {
      const element = proof.data[proof.data.length - 1].stmts[i];
      for (let j = 0; j < element.length; j++) {
        usedSteps.push(i + String.fromCharCode(j + 65).toLowerCase());
      }
    }
    if (useGUI) {
      let unusedSteps = [];
      for (let i = 0; i < proof.data.length; i++) {
        const row = proof.data[i];
        row.stmts.forEach((v, j) => {
          let num = i + 1 + (String.fromCharCode(j + 65).toLowerCase() ?? "");
          if (!usedSteps.includes(num)) {
            if (row.stmts.length > 1) unusedSteps.push(num);
            else unusedSteps.push((i + 1).toString());
          }
        });
      }
      // const gui = await openGUI();
      // gui.addElement(createElement("h2", "Unused Steps"));
      // gui.addElement(createElement("div", unusedSteps.join("<br>")));
      // gui.addCancel("Close");
    }
    return usedSteps;
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
  Button(btns, "Export", {
    async onclick() {
      await exportProof();
    }
  });
  Button(btns, "Check", {
    onclick() {
      checkSteps(true);
      saveProofs();
    }
  });
  Button(btns, "Load", {
    async onclick() {
      let i = await selectProof();
      if (i == -1) return;
      currentProofID = i;
      saveProofs();
    }
  });
  Button(btns, "Remove", {
    async onclick() {
      let i = await selectProof("Choose a proof to delete");
      if (i == -1) return;
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
