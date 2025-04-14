# AI-Powered plugin for Excel Processing Applications 📊

<h1 align="left">
  <img src="Source/assets/icon.png" alt="icon" width="200"></img>
</h1>

## Table of contents
- [Backend](#backend)
  - [Setup environment](#setup-environment)
  - [How to use](#how-to-use)
  - [Demo](#demo)
- [Google Sheets Add-on](#google-sheets-add-on)
  - [Setup environment](#setup-environment-1)
  - [How to use](#how-to-use-1)
    - [Translator Add-on](#️-translator-add-on)
    - [Prompt Sidebar](#-prompt-sidebar)
    - [GPT_SUMMARIZE function](#-gpt_summarize-function)
  - [Demo](#demo-1)

## Backend

The backend for the AI-powered plugin is built using **FastAPI**, a modern web framework for building high-performance APIs with Python. **FastAPI** was chosen for its speed, ease of use, and built-in support for asynchronous operations, making it well-suited for handling translation requests efficiently.

This backend serves as the core processing unit for the **Google Sheets Add-on**, an AI-powered plugin designed to support three key functionalities: **translation, prompting, and summarization**. It handles text processing requests, manages language detection, and communicates with external AI services to deliver intelligent and customizable outputs directly within Google Sheets.

### Setup environment

To set up the environment for the Add-on backend, follow these steps:

1. **Install Python**

Ensure you have **Python 3.8 or later** installed on your system. You can check your Python version by running:

```bash
python --version
```

If Python is not installed, download and install it from [python.org](https://www.python.org/downloads/).

2. **Create a Virtual Environment (Recommended)**

It is recommended to create a virtual environment to manage dependencies. Run the following commands:

```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate      # On Windows
```

3. **Install Dependencies**

Once the virtual environment is activated, install the required dependencies using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

This will install:

  - **FastAPI** (for building the API)

  - **Uvicorn** (for running the server)

  - **Python-Multipart** (for handling form data)

  - **Google-GenerativeAI** (for AI-powered translation)

  - **Python-Dotenv** (for managing environment variables)

4. **Set Up Environment Variables**

Once modules were installed, move to the `backend` folder and create a `.env` file in the project directory, then configure necessary API keys (e.g., for translation services):

```python
GEMINI_API_KEY = your_api_key_here
```

To get the **Gemini API key**, go to [API - Google AI Studio](https://aistudio.google.com/apikey) to get it. 

### How to use

Once the environment is set up, follow these steps to start and use the backend service:

1. **Navigate to the Backend Directory**

Move into the `backend` directory where the FastAPI application is located:

```bash
cd Source/backend
```

2. **Start the FastAPI Server**

Run the following command to start the server using **Uvicorn**:

```bash
uvicorn app:app --reload
```

The `--reload` flag enables automatic reloading when code changes, making development more efficient. By default, the server runs on `http://127.0.0.1:8000`.

3. **Access the API Documentation**

Once the server is running, you can access the interactive API documentation using **Swagger UI** by access to `http://127.0.0.1:8000/docs`. These documentation pages provide an overview of available API endpoints and allow you to test them directly from the browser.

To stop the backend server, press `CTRL + C` in the terminal.

### Demo

## Google Sheets Add-on

The **Google Sheets Add-on** is a tool I developed to integrate AI-powered functionalities - **translation, prompting, and summarization** - directly into Google Sheets. With this add-on, users can perform advanced language tasks on spreadsheet data without leaving the platform, streamlining their workflow and eliminating the need to switch between external tools or services.

In the following sections, I will guide you through setting up, using, and making the most of the **Google Sheets Add-on**.

### Setup environment

To set up the **Google Sheets Add-on**, follow these steps:

1. **Open Google Sheets and Select a Spreadsheet**

Start by opening **Google Sheets** in your browser and selecting a spreadsheet where you want to use the add-on.

2. **Access Google Apps Script**

In the **taskbar**, go to `Extensions → Apps Script`. This will open the **Google Apps Script editor**, where you can add and manage scripts for your document.

3. **Create Required Files**

Inside the Apps Script editor, create **four files**:

- `Code.gs`

- `LanguageSelector.html`

- `TranslationReview.html`

- `PromptSidebar.html`

Then, navigate to the `GGSheets` folder inside the `frontend` directory of the project and copy the corresponding content from the files in `GGSheets` into their respective files in the **Apps Script editor**. Once done, go back to `Code.gs`, save the changes and click `Run` to execute the script.

4. **Allow Permissions**

After running the script, Google will prompt you to **grant permissions** for the script to access your document. If you see a warning message saying `Google hasn't verified this app`, click `Advanced` and select `Go to <Your App Name> (unsafe)`, then confirm the permissions to allow the script to function properly.

5. **Set Up ngrok for Backend Connection**

To expose your local backend to Google Apps Script, follow these steps:

- Access to [Download ngrok](https://ngrok.com/downloads/windows?tab=download) and download the zip file including `ngrok.exe` file. Open this file and a terminal screen will appear. (*Note: This ZIP file may be blocked by antivirus software components on your computer (e.g., Windows Defender). Therefore, please disable these programs before downloading.*)

- In the terminal, enter `ngrok http 8000`. Previously, you need an ngrok account to authenticate and access your tunnel, visit [ngrok's official website](https://ngrok.com/) to create an account if you haven’t already.

6. **Update API URL in Code.gs**

After running ngrok, look for the **Forwarding URL** that ends in `.app`, for example `https://1efe-2001-ee0-4f05-b720-b4a1-d8b9-e76b-b439.ngrok-free.app`, copy it and go back to the `Code.gs` file in the **Google App Scripts**, locate the current URL, which is `https://bfda-115-79-4-48.ngrok-free.app`, then replace it with your ngrok URL followed by `/translate`, `/prompt` and `/summarize`:

Finally, save the changes and click `Run` again to apply the update.

### How to use

Once the setup is complete, you will see an **AI Tools** menu appear in the taskbar of Google Sheets. This menu provides access to two key features: the **Translator Add-on** and a **Prompt Sidebar** for custom prompting tasks.

#### 🈂️ Translator Add-on

To use the **Translator Add-on**, simply select a cell containing the text you want to translate *(must not exceed 2000 words)*, then click `AI Tools → Translate Selection`. The add-on will process the selected text and display the translated result directly in the spreadsheet. This allows seamless translation without switching to an external service.

#### 💬 Prompt Sidebar

To use the **Prompt Sidebar**, click `AI Tools → Open Prompt Sidebar`. A sidebar will appear on the right side of your sheet, allowing you to configure and execute custom prompts on rows of data.

Within the **Prompt Sidebar**, users can select:

- **Header row**: The number of the row that contains column headers (this row will be skipped during processing).

- **Prompt template**: A customizable prompt where you can insert placeholders using {{ColumnName}}. These placeholders will be dynamically replaced with actual cell values from each row.

- **Put results in column**: Choose the column where you want the output to be stored.

- **Start from row**:

    - `Auto`: Automatically run on a specific number of rows (e.g., 3 rows) or on all available rows.

    - `Fixed`: Manually choose a start and end row (e.g., from row 2 to row 4).

#### 📝 GPT_SUMMARIZE Function

You can use the built-in custom function `=GPT_SUMMARIZE(...)` to generate AI-powered summaries of any cell or range of cells within your Google Sheet. This is especially useful for condensing long texts, notes, or descriptions into more concise formats.

**Function Signature**:

```excel
=GPT_SUMMARIZE(text, format, temperature, model)
```

**Parameters**:

- `text` (required): The cell or range containing the text(s) you want to summarize. This can also be a plain string. If a range is provided, the function will summarize each cell individually.

- `format` (optional): A prompt that defines the desired output format. For example:

    - "Bullet points"

    - "Short paragraph"

    - "List of key ideas"

    - "Summary in 3 sentences"

- `temperature` (optional): A number between 0 and 1 that controls the creativity of the output.

    - Lower values (e.g., 0.2) result in more focused and deterministic summaries.

    - Higher values (e.g., 0.8) make the output more creative and diverse.

- `model` (optional): Specifies which AI model to use for summarization. You can choose from the following options:

    - "gemini-2.0-flash"

    - "gemini-2.0-flash-lite"

    - "gemini-1.5-flash"

    - "gemini-1.5-flash-8b"

### Demo

# [🏠 Back to top](#ai-powered-plugin-for-excel-processing-applications-)