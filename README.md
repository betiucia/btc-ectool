--[[
# btc-ECTool (Economy and Craft Tool)

**btc-ECTool** is a comprehensive web-based utility designed to streamline the management of economy and crafting systems for Red Dead Redemption 2 (RedM) roleplay servers. It supports major frameworks like **RSG** and **VORP Core**, offering powerful calculation, organization, and AI-assisted features.

> **⚠️ Important Note**: While item definitions support multiple frameworks, the **Crafting Generation** feature is designed exclusively for the **`btc-legacycraft`** script.

## 🚀 Key Features

* **Multi-Framework Support**: Seamlessly switch between **RSG** and **VORP** configurations for item definitions.
* **Smart Economy Calculation**: Automatically calculates NPC Sell/Buy prices and Player-to-Player (P2P) margins based on base costs and configurable multipliers.
* **Complex Crafting Management**: Design crafting recipes with ingredients, return items, and tools with durability loss (Output tailored for **btc-legacycraft**).
* **AI Integration (Google Gemini)**:
    * Auto-generate immersive item descriptions.
    * Suggest logical crafting recipes based on item names.
    * Auto-categorize items individually or in bulk.
* **Data Import/Export**:
    * Import existing items from Lua tables (RSG) or SQL inserts (VORP).
    * Export item definitions and crafting configs directly to your clipboard.
    * Full JSON backup/restore functionality.
* **Dynamic UI**: Multi-language support (EN, PT, DE, RU), dark mode interface, and responsive design.

## 🛠️ Getting Started

1.  **Open the Tool**: Simply open the `index.html` file in any modern web browser. No server installation is required; it runs locally in your browser.
2.  **Configuration**:
    * Navigate to the **Settings** tab.
    * **Google Gemini API Key**: Enter your API key to enable AI features (Click the label to get one for free).
    * **Server Framework**: Select your server's core (RSG or VORP).
    * **Global Defaults**: Set your server's standard economy multipliers (e.g., NPC Sell = 2.0x Base Cost).
    * **Image Path**: Set the base URL or local path for item icons (e.g., `F:\yourserver\resources\[framework]\rsg-inventory\html\images\`).

## 📖 Usage Guide

### 1. Managing Categories & Crafting Tables
Before creating items, set up your environment in the **Settings** tab:
* **Categories**: Define item categories (e.g., "Food", "Weapons"). You can set specific economy multipliers for each category that override the global defaults.
* **Crafting Tables**: Add the crafting stations available in your server (e.g., "Campfire", "Workbench").

### 2. Creating & Managing Items
Go to the **Registered Items** tab and click the **`+`** button.
* **Basic Info**: Enter ID, Name, and select a Category.
* **Framework Data**: Depending on your selected framework, specific fields will appear (e.g., `weight`, `decay` for RSG; `limit`, `db_id` for VORP).
* **AI Description**: Click the **✨** button next to the description field to have AI write a lore-friendly description for you.
* **Base Cost**:
    * **Manual**: Input a fixed cost if the item is bought or gathered.
    * **Automatic**: If the item is craftable, the cost is calculated based on the ingredients' costs.

### 3. Setting up Crafting Recipes
In the Item Modal, check **"Craftable Item?"**:
* **Add Variant**: You can have multiple recipes for the same item.
* **Ingredients**: Search and add items. Define quantities and optional return items (e.g., returning a bucket after using milk).
* **Tools**: Add required tools, quantity, and degradation percentage per craft.
* **Settings**: Set crafting time, level requirements, production queue, and required crafting tables.
* **AI Suggestion**: Click **"✨ Suggest AI Recipe"** to have the AI build a recipe based on the item's name and existing registered items.

### 4. Economy Analysis
The tool provides a real-time preview of the item's economy:
* **Base Cost**: Lowest possible cost to acquire/craft the item.
* **NPC Sell (Shop)**: Suggested price for NPCs to sell this item to players.
* **NPC Pay (Sink)**: Suggested price for NPCs to buy this item from players.
* **P2P**: Suggested price for players to trade among themselves.

### 5. Exporting Data
* **Export Item**: Inside the Item Modal, click **"Export Item"** to get the code snippet (Lua table or SQL Insert) for that specific item.
* **Export Craft Lua**: Inside the Item Modal, click **"Copy Craft Lua"** to get the crafting configuration for that specific item (Formatted for **btc-legacycraft**).
* **Bulk Export (Items)**: On the main dashboard, click the green **📤** button to generate the full items configuration file for your entire database.
* **Bulk Export (Crafts)**: On the main dashboard, click the orange **📜** button to generate the `Config.CraftingRecipes` lua table for all registered crafts. **Note: This format is exclusive to `btc-legacycraft`.**

### 6. Importing Data
* Click the **📥** button on the dashboard.
* Paste your existing `items.lua` (RSG) or SQL dump (VORP).
* The tool will parse the data and populate your list.

### 7. Auto-Categorization (AI)
* **Single Item**: Inside the edit modal, click the **✨** button next to the category dropdown to suggest a category for that specific item.
* **Bulk Action**: On the dashboard, click the purple **✨** button to automatically analyze and assign categories to **all** items that currently have no category.

## 💾 Backup & Safety
All data is saved automatically to your browser's **Local Storage**. However, it is highly recommended to frequently download a backup:
* Go to **Settings** > **Data Management**.
* Click **"💾 Download Backup (JSON)"**.
* To restore, use the **"📂 Restore Backup"** button.

## 📝 Credits
**btc-ECTool** was created to simplify the complex task of balancing economy and writing configuration files for RedM servers.

* **Author**: BeTiuCia Scripts
]]