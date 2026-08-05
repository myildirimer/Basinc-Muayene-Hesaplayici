document.getElementById("tarih").valueAsDate = new Date();

const f2 = value => Number(value).toFixed(2);
const toKpa = (value, unit) => unit === "psi" ? value * 6.89476 : unit === "bar" ? value * 100 : value;
const fromKpa = (value, unit) => unit === "psi" ? value / 6.89476 : unit === "bar" ? value / 100 : value;
const roundToFive = value => Math.round(value / 5) * 5;

function toleranceTable(kpa, temperature) {
  const base = kpa <= 400 ? 8 : kpa <= 1000 ? 16 : 25;
  if (temperature < 15) return 0.5 * (15 - temperature) + base;
  if (temperature <= 25) return base;
  return 0.5 * (temperature - 25) + base;
}

function mih(kpa, temperature) {
  return Math.max(toleranceTable(kpa, temperature) * 1.25, 13.8);
}

function rowMarkup(point, pc = "") {
  return `<tr>
    <td>${point}</td>
    <td><input id="pc${point}" type="number" step="0.01" value="${pc}"></td>
    <td><input id="pref${point}" type="number" step="0.01"></td>
    <td id="e${point}">-</td>
    <td id="m${point}">-</td>
    <td id="s${point}">-</td>
  </tr>`;
}

function noktaOner() {
  const min = parseFloat(document.getElementById("min").value);
  const max = parseFloat(document.getElementById("max").value);
  const unit = document.getElementById("birim").value;
  if (Number.isNaN(min) || Number.isNaN(max) || max <= min) {
    alert("Min/Max değerlerini kontrol edin.");
    return;
  }

  const minPsi = fromKpa(toKpa(min, unit), "psi");
  const maxPsi = fromKpa(toKpa(max, unit), "psi");
  const range = maxPsi - minPsi;
  const pointsPsi = [0.2, 0.5, 0.8].map(rate => roundToFive(minPsi + range * rate));
  const pointsUnit = pointsPsi.map(point => fromKpa(toKpa(point, "psi"), unit));

  document.getElementById("oneriler").innerHTML = `Önerilen noktalar (psi): <b>${pointsPsi.join("</b>, <b>")}</b>.`;
  document.getElementById("olcumBody").innerHTML = pointsUnit.map((point, idx) => rowMarkup(idx + 1, f2(point))).join("");
}

function hesapla() {
  const unit = document.getElementById("birim").value;
  const temperature = parseFloat(document.getElementById("sicaklik").value);
  const rows = [1, 2, 3].filter(i => document.getElementById(`pc${i}`));
  if (!rows.length) {
    alert("Önce nokta önerisi oluşturun.");
    return;
  }

  let validRows = 0;
  let okRows = 0;
  rows.forEach(i => {
    const pc = parseFloat(document.getElementById(`pc${i}`).value);
    const pref = parseFloat(document.getElementById(`pref${i}`).value);
    if (Number.isNaN(pc) || Number.isNaN(pref) || Number.isNaN(temperature)) return;

    validRows++;
    const errorKpa = toKpa(pc, unit) - toKpa(pref, unit);
    const limitKpa = mih(toKpa(pref, unit), temperature);
    const isOk = Math.abs(errorKpa) <= limitKpa;
    if (isOk) okRows++;

    document.getElementById(`e${i}`).textContent = f2(fromKpa(errorKpa, unit));
    document.getElementById(`m${i}`).textContent = f2(fromKpa(limitKpa, unit));
    document.getElementById(`s${i}`).innerHTML = `<span class="${isOk ? "result-ok" : "result-bad"}">${isOk ? "UYGUN" : "UYGUN DEĞİL"}</span>`;
  });

  const overall = validRows && okRows === validRows ? "UYGUN" : "UYGUN DEĞİL";
  document.getElementById("kpiToplam").textContent = validRows;
  document.getElementById("kpiUygun").textContent = okRows;
  document.getElementById("kpiGenel").innerHTML = validRows ? `<span class="${overall === "UYGUN" ? "result-ok" : "result-bad"}">${overall}</span>` : "-";
  document.getElementById("detay").innerHTML = `Doküman: <b>${document.getElementById("docNo").value || "-"}</b> | Tarih: <b>${document.getElementById("tarih").value || "-"}</b> | Birim: <b>${unit}</b>`;
}

function temizleForm() {
  ["docNo", "min", "max"].forEach(id => { document.getElementById(id).value = ""; });
  document.getElementById("sicaklik").value = "20";
  document.getElementById("oneriler").textContent = "Öneri görmek için Min/Max girip Nokta Öner'e basın.";
  document.getElementById("olcumBody").innerHTML = "";
  document.getElementById("kpiToplam").textContent = "0";
  document.getElementById("kpiUygun").textContent = "0";
  document.getElementById("kpiGenel").textContent = "-";
  document.getElementById("detay").textContent = "Henüz hesaplama yapılmadı.";
}
