function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('AI Tools')
    .addItem('Translate Selection', 'translateSelection')
    .addItem('Open Prompt Sidebar', 'openPromptSidebar')
    .addToUi();
}

function translateSelection() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let range = sheet.getActiveRange();

  if (!range || range.isBlank()) {
    SpreadsheetApp.getUi().alert("Please select a cell to translate.");
    return;
  }

  // ⚠️ Kiểm tra chỉ được chọn 1 ô
  if (range.getNumRows() > 1 || range.getNumColumns() > 1) {
    SpreadsheetApp.getUi().alert("Please select only ONE cell.");
    return;
  }

  let selectedText = range.getValue().toString();

  if (selectedText.split(/\s+/).length > 2000) {
    SpreadsheetApp.getUi().alert("Selected text exceeds 2000 words. Please select shorter text.");
    return;
  }

  showLanguageSelector();
}

function showLanguageSelector() {
  let html = HtmlService.createHtmlOutputFromFile('LanguageSelector')
    .setWidth(400)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, "Select Languages");
}

function showTranslationReview(sourceLang, targetLang, originalText, translatedText, modelName, temperature) {
  let template = HtmlService.createTemplateFromFile('TranslationReview');
  template.sourceLang = sourceLang;
  template.targetLang = targetLang;
  template.originalText = originalText;
  template.translatedText = translatedText;
  template.modelName = modelName;
  template.temperature = temperature;

  let html = template.evaluate()
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, "Review Translation");
}

function processTranslation(sourceLang, targetLang, modelName, temperature) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let range = sheet.getActiveRange();

  if (!range || range.isBlank()) {
    SpreadsheetApp.getUi().alert("Please select a cell to translate.");
    return;
  }

  if (range.getNumRows() > 1 || range.getNumColumns() > 1) {
    SpreadsheetApp.getUi().alert("Please select only ONE cell.");
    return;
  }

  let originalText = range.getValue().toString();
  let translatedText = callTranslationAPI(originalText, sourceLang, targetLang, modelName, temperature);

  if (translatedText) {
    showTranslationReview(sourceLang, targetLang, originalText, translatedText, modelName, temperature);
  } else {
    SpreadsheetApp.getUi().alert("Translation failed. Please try again.");
  }
}

function reTranslate(sourceLang, targetLang, originalText, modelName, temperature) {
  return callTranslationAPI(originalText, sourceLang, targetLang, modelName, temperature);
}

function applyTranslation(translatedText) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let range = sheet.getActiveRange();

  if (!range) {
    SpreadsheetApp.getUi().alert("No target cell found.");
    return;
  }

  // ⚠️ Ghi đè bản dịch vào chính ô đang chọn
  range.setValue(translatedText);
}

function callTranslationAPI(text, sourceLang, targetLang, modelName, temperature) {
    let apiUrl = "https://bfda-115-79-4-48.ngrok-free.app/translate";
    let payload = JSON.stringify({
        text: text,
        source_lang: sourceLang,
        target_lang: targetLang,
        model_name: modelName,
        temperature: temperature
    });

    Logger.log("Payload: " + payload);

    let options = {
        method: "post",
        contentType: "application/json",
        payload: payload,
        muteHttpExceptions: true
    };

    try {
        let response = UrlFetchApp.fetch(apiUrl, options);
        let responseText = response.getContentText();
        Logger.log("Response Text: " + responseText);
        let json = JSON.parse(responseText);

        if (response.getResponseCode() !== 200) {
            return "Translation error: " + (json.detail || "Unknown error");
        }

        return json.translated_text || "Translation failed";
    } catch (error) {
        return "API Error: " + error.message;
    }
}

function openPromptSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("PromptSidebar")
    .setTitle("Prompt Runner");
  SpreadsheetApp.getUi().showSidebar(html);
}

function getAvailableModels() {
  return [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
  ];
}

function getHeaderValues(headerRow) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const headers = new Set();

  if (headerRow <= 0) {
    for (let col = 1; col <= lastCol; col++) {
      const range = sheet.getRange(1, col, lastRow);
      const values = range.getValues().flat();
      if (values.some(v => v !== "")) {
        headers.add(getColumnName(col));
      }
    }
  } else {
    for (let row = 1; row <= headerRow; row++) {
      const vals = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
      for (let i = 0; i < vals.length; i++) {
        if (vals[i] !== "") headers.add(vals[i].toString());
      }
    }
  }

  return Array.from(headers);
}

function getColumnName(index) {
  let name = "";
  while (index > 0) {
    let rem = (index - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    index = Math.floor((index - 1) / 26);
  }
  return name;
}

function getPromptStats(prompt, headerRow) {
  const keys = Array.from(prompt.matchAll(/\{\{(.*?)\}\}/g)).map(m => m[1]);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const headers = getHeaderValues(headerRow);

  const colIndexMap = {};
  headers.forEach((h, i) => colIndexMap[h] = i);

  const colIndices = keys.map(k => colIndexMap[k]).filter(i => i !== undefined);
  let x = 1, y = headerRow + 1;

  if (colIndices.length > 0) {
    x = 0;
    for (let i = headerRow; i < values.length; i++) {
      if (colIndices.every(col => values[i][col] !== "")) {
        if (x === 0) y = i + 1;
        x++;
      }
    }
  }

  return { x, y };
}

function safeReplace(str, key, val) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, "g");
  return str.replace(regex, val ?? "");
}

function runPrompt(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const headers = getHeaderValues(data.headerRow);
  const colIndexMap = {};
  headers.forEach((h, i) => colIndexMap[h] = i);

  if (!(data.outputColumn in colIndexMap)) {
    SpreadsheetApp.getUi().alert(`Output column '${data.outputColumn}' not found in headers.`);
    return;
  }

  const keys = Array.from(data.prompt.matchAll(/\{\{(.*?)\}\}/g)).map(m => m[1]);
  const colIndices = keys.map(k => colIndexMap[k]);

  let rows = [];

  if (data.mode === "Auto") {
    for (let i = data.headerRow; i < values.length; i++) {
      if (keys.length === 0 || colIndices.every(ci => values[i][ci] !== "")) {
        rows.push({ row: i + 1, values: values[i] });

        // 👉 Chỉ dừng nếu KHÔNG phải runAll và đã đủ numRows
        if (!data.runAll && rows.length === data.numRows) break;
      }
    }
  } else {
    for (let i = data.fromRow - 1; i <= data.toRow - 1; i++) {
      if (i < values.length) {
        rows.push({ row: i + 1, values: values[i] });
      }
    }
  }

  if (rows.length === 0) {
    SpreadsheetApp.getUi().alert("No valid rows found to run prompt.");
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(`Running prompt on ${rows.length} rows...`, "Prompt Runner", 5);

  const prompts = [];
  for (const r of rows) {
    let prompt = data.prompt;
    for (let j = 0; j < keys.length; j++) {
      const col = colIndices[j];
      prompt = safeReplace(prompt, keys[j], r.values[col]);
    }
    prompts.push(prompt);
  }

  const payload = {
    prompts: prompts,
    model_name: data.model,
    temperature: data.temperature
  };

  let responses = [];
  try {
    const res = UrlFetchApp.fetch("https://bfda-115-79-4-48.ngrok-free.app/prompt", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
    responses = JSON.parse(res.getContentText()).responses;
  } catch (e) {
    Logger.log("API Error: " + e.message);
    SpreadsheetApp.getUi().alert("Error calling AI API: " + e.message);
    return;
  }

  const outputCol = colIndexMap[data.outputColumn] + 1;

  for (let i = 0; i < responses.length && i < rows.length; i++) {
    const rowNum = rows[i].row;
    sheet.getRange(rowNum, outputCol).setValue(responses[i]);
  }
}

function getCellValue(row, col) {
  const sheet = SpreadsheetApp.getActiveSheet();
  return sheet.getRange(row, col).getValue();
}

/**
 * Tóm tắt nội dung từ một hoặc nhiều ô văn bản bằng API AI
 * @param {range|string} text - Văn bản hoặc range chứa văn bản cần tóm tắt
 * @param {string} format - Định dạng đầu ra (ví dụ: "Item list", "Short paragraph")
 * @param {number} temperature - Giá trị temperature (0 - 1)
 * @param {string} model - Tên mô hình sử dụng (ví dụ: "gemini-2.0-flash")
 * @return {string|string[]} - Kết quả tóm tắt (một chuỗi hoặc mảng tương ứng)
 * @customfunction
 */
function GPT_SUMMARIZE(text, format, temperature, model) {
  // Chuẩn hoá dữ liệu đầu vào thành mảng chuỗi
  const texts = Array.isArray(text) ? text.flat().map(String) : [String(text)];
  
  const payload = {
    texts: texts,
    format: format || "Item list",
    temperature: temperature || 0.7,
    model_name: model || "gemini-2.0-flash"
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const url = "https://bfda-115-79-4-48.ngrok-free.app/summarize"; // <- thay bằng URL thật của bạn
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  // Trả về dạng chuỗi nếu chỉ có 1 kết quả, hoặc mảng nếu nhiều
  return (result.responses.length === 1) ? result.responses[0] : result.responses;
}