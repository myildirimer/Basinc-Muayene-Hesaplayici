document.getElementById("date").valueAsDate = new Date();

function correctVref(vref, tm, tref) {
  const beta = 0.00021;
  return vref * (1 + beta * (tref - tm));
}

function calculateRow(vs, vref, tm, tref, limit, tempEnabled) {
  const invalidCommon = Number.isNaN(vs) || Number.isNaN(vref) || vref <= 0 || vs <= 0;
  const invalidTemp = tempEnabled && (Number.isNaN(tm) || Number.isNaN(tref));
  if (invalidCommon || invalidTemp) return { valid: false, vcorr: null, error: null, result: "Bekliyor" };

  const vcorr = tempEnabled ? correctVref(vref, tm, tref) : vref;
  const error = ((vs - vcorr) / vcorr) * 100;
  const result = Math.abs(error) <= limit ? "U" : "UD";
  return { valid: true, vcorr, error, result };
}

function writeResult(row, result) {
  const errorCell = document.getElementById(`e${row}`);
  const resultCell = document.getElementById(`s${row}`);
  const correctedCell = document.getElementById(`vcorr${row}`);

  if (!result.valid) {
    correctedCell.textContent = "-";
    errorCell.textContent = "-";
    resultCell.textContent = "Bekliyor";
    correctedCell.className = "result-empty vcorr-col";
    errorCell.className = "result-empty";
    resultCell.className = "result-empty";
    return false;
  }

  correctedCell.textContent = result.vcorr.toFixed(3);
  errorCell.textContent = result.error.toFixed(3);
  resultCell.textContent = result.result;
  errorCell.className = result.result === "U" ? "result-ok" : "result-bad";
  resultCell.className = result.result === "U" ? "result-ok" : "result-bad";
  correctedCell.className = "vcorr-col";
  return result.result === "U";
}

function updateSummary(total, ok) {
  const overall = document.getElementById("overall");
  document.getElementById("totalPoint").textContent = total;
  document.getElementById("okPoint").textContent = ok;

  if (total === 0) {
    overall.textContent = "Bekliyor";
    overall.className = "";
    return;
  }

  overall.textContent = ok === total ? "UYGUN" : "UYGUN DEĞİL";
  overall.className = ok === total ? "result-ok" : "result-bad";
}

function hesapla() {
  const limit = parseFloat(document.getElementById("mih").value);
  const tempEnabled = document.getElementById("tempMode").value === "on";
  const results = [1, 2].map(row => calculateRow(
    parseFloat(document.getElementById(`vs${row}`).value),
    parseFloat(document.getElementById(`vref${row}`).value),
    parseFloat(document.getElementById(`tr${row}`).value),
    parseFloat(document.getElementById(`tref${row}`).value),
    limit,
    tempEnabled
  ));

  const okFlags = results.map((result, index) => writeResult(index + 1, result));
  updateSummary(results.filter(result => result.valid).length, okFlags.filter(Boolean).length);
}

function applyTempMode() {
  const tempEnabled = document.getElementById("tempMode").value === "on";
  document.querySelectorAll(".temp-col, .vcorr-col").forEach(el => {
    el.style.display = tempEnabled ? "" : "none";
  });
  ["tr1", "tr2", "tref1", "tref2"].forEach(id => {
    const input = document.getElementById(id);
    input.disabled = !tempEnabled;
    if (!tempEnabled) input.value = "";
  });
  document.getElementById("tempNote").textContent = tempEnabled
    ? "Sıcaklık düzeltmesi açıkken Tm ve Tref farkına göre Vref@(L) hesaplanır."
    : "Sıcaklık düzeltmesi kapalıyken Tm, Tref ve Vref@(L) sütunları gizlenir; hesap Vref ile yapılır.";
}

function temizleForm() {
  ["docNo", "date", "vs1", "vref1", "tr1", "tref1", "vs2", "vref2", "tr2", "tref2"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("date").valueAsDate = new Date();
  document.getElementById("tempMode").value = "on";
  applyTempMode();
  writeResult(1, { valid: false });
  writeResult(2, { valid: false });
  updateSummary(0, 0);
}

document.getElementById("tempMode").addEventListener("change", applyTempMode);
applyTempMode();
