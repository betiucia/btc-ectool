const translations = {
    pt: {
        config_title: "Configurações de Economia", config_title_simple: "Configurações", config_short: "Configurações", global_defaults: "Padrões Globais", mult_npc_sell: "Mult. NPC Vende (Loja)", mult_npc_buy: "Mult. NPC Compra (Sink)", margin_p2p: "Margem P2P (%)", img_path: "Caminho da Pasta de Imagens", categories: "Categorias", crafting_tables: "Mesas de Craft", registered_items: "Itens Cadastrados", tip_npc_sell: "Fator multiplicador aplicado ao custo base para definir o preço de venda no NPC (Loja). Ex: 2.0 significa que o NPC vende pelo dobro do custo.", tip_npc_buy: "Fator multiplicador aplicado ao custo base para definir o preço de compra pelo NPC (Sink). Ex: 0.5 significa que o NPC paga 50% do custo.", tip_p2p: "Porcentagem de lucro sugerida para o comércio entre jogadores (Player to Player) acima do custo base.", tip_img_path: "Caminho base para carregar as imagens (URL ou Pasta local). Ex: img/items/ ou https://site.com/imgs/", tip_image_override: "Nome do arquivo da imagem. Se vazio, usa o ID.", tip_png_ext: "Extensão .png automática", col_item: "Item", col_cat: "Categ.", col_base: "Custo Base", col_best: "(Melhor)", col_sell: "NPC Vende", col_shop: "(Loja)", col_buy: "NPC Paga", col_sink: "(Sink)", col_p2p: "P2P", col_player: "(Player)", col_actions: "Ações", modal_manage_title: "Gerenciar Item", item_id: "ID do Item", item_name: "Nome", category: "Categoria", description: "Descrição", image_name: "Nome Imagem (Opcional)", is_crafted: "Item Craftável? (Habilitar Receitas)", manual_cost: "Custo Base Manual ($)", manual_cost_hint: "Usado se não houver receitas ou se 'Item Craftável' estiver desmarcado.", calc_base: "Custo Base (Menor)", calc_sell: "NPC Vende", calc_buy: "NPC Paga", calc_p2p: "P2P Sugerido", btn_save: "Salvar Item", btn_cancel: "Cancelar", btn_confirm_delete: "Confirmar", btn_add_cat: "+ Nova Categoria", btn_add_table: "+ Nova Mesa", btn_add_variant: "+ Adicionar Variante de Craft", btn_export_lua: "Copiar Craft Lua", btn_get_crafts: "Obter Crafts", header_name: "Nome", header_mult_sell: "Mult. Venda", header_mult_buy: "Mult. Compra", header_margin: "Margem P2P", lbl_recipe_name: "Nome da Variante (ex: Fogueira)", lbl_tables: "Mesas de Craft:", lbl_time: "Tempo (s)", lbl_level: "Level", lbl_queue: "Fila de Prod.", lbl_ing_header: "Ingrediente", lbl_qty: "Qtd", lbl_return: "Retorno", lbl_tools_header: "Ferramentas", delete_title: "Confirmar Exclusão", delete_msg: "Deseja excluir este item?", delete_msg_item: "Deseja excluir este item?", delete_msg_cat: "Deseja excluir esta categoria?", delete_msg_table: "Deseja excluir esta mesa?", prompt_id_cat: "ID da Categoria:", prompt_id_table: "Nome da Mesa:", confirm_remove: "Remover?", alert_id_exists: "ID já existe!", alert_copied: "Dados copiados", alert_no_crafts: "Nenhum craft encontrado para esta seleção.", search_placeholder: "Buscar item, categoria, craft...", used_in_recipes: "Usado em {0} receitas", variant_new: "Nova Variante", craft_badge_multi: "CRAFT (x{0})", craft_badge: "CRAFT", btn_import: "Importar", modal_import_title: "Importar Itens", lbl_import_type: "Tipo de Importação", lbl_paste_code: "Cole o código aqui", btn_process_import: "Processar Importação", import_success: "Importado: {0} itens. Ignorado (Duplicado): {1}.", api_key_label: "Google Gemini API Key", title_new_cat: "Nova Categoria", title_new_table: "Nova Mesa", lbl_cat_id: "ID da Categoria (sem espaços)", lbl_table_name: "Nome da Mesa", data_backup: "Gerenciamento de Dados", btn_download_json: "💾 Baixar Backup (JSON)", btn_upload_json: "📂 Restaurar Backup", backup_hint: "Os dados são salvos automaticamente no navegador. Use o Backup para segurança ou transferir.", tooltip_copy_all: "Gera o código Lua de TODOS os itens craftáveis de uma vez.", tooltip_create_item: "Criar novo item", tooltip_import_items: "Importar Itens", btn_generate_ai: "✨ Gerar", btn_suggest_recipe: "✨ Sugerir Receita IA", btn_edit: "Editar", ph_qty: "Qtd", ph_ret: "Ret", ph_deg: "Deg %", ph_table_name: "Nome da Mesa", ph_global: "Global", lbl_language: "Idioma / Language", ph_auto: "Auto", opt_select: "Selecione...", lbl_cost: "Custo:", lbl_tool_col: "Ferramenta", lbl_deg_col: "Degradação",
        
        // --- NOVAS TRADUÇÕES ---
        err_api_key: "Erro: API Key não configurada!",
        err_ai_call: "Erro na chamada da IA.",
        err_fill_name: "Preencha o nome primeiro.",
        toast_generating_desc: "✨ Gerando descrição...",
        toast_desc_generated: "Descrição gerada!",
        toast_generating_recipe: "✨ Criando receita...",
        toast_recipe_added: "Receita sugerida adicionada!",
        err_ai_recipe: "Erro ao processar receita da IA.",
        toast_no_export: "Nenhum item/craft encontrado para exportar.",
        toast_copied_clipboard: "{0} Itens/Crafts copiados para a área de transferência!",
        alert_not_craftable: "Este item não é craftável, não há receita para exportar.",
        alert_add_variant: "Adicione pelo menos uma variante de craft.",
        toast_restore_success: "Dados restaurados com sucesso!",
        err_invalid_file: "Arquivo inválido!",
        err_read_file: "Erro ao ler arquivo!",
        
        // Framework specific
        lbl_framework: "Framework do Servidor",
        header_framework_data: "Dados da Framework ({0})",
        btn_export_item_def: "Exportar Item ({0})", 
        lbl_weight: "Peso (Weight)",
        lbl_limit: "Limite (Limit)",
        lbl_type: "Tipo (Type)",
        lbl_unique: "Único (Unique)",
        lbl_usable: "Usável (Usable)",
        lbl_can_remove: "Removível (Can Remove)",
        lbl_decay: "Decaimento (Decay)",
        lbl_delete: "Deletar (Delete)",
        lbl_should_close: "Fechar Menu (Should Close)",
        lbl_group_id: "Group ID",
        lbl_db_id: "DB ID (Opcional)",
        lbl_degradation: "Degradação",

        // Clear Items
        btn_clear_all: "🗑️ Limpar Todos os Itens",
        confirm_clear_all: "Tem certeza absoluta? Isso apagará TODOS os itens cadastrados e não pode ser desfeito (a menos que tenha backup).",
        toast_cleared: "Todos os itens foram removidos.",
        tooltip_export_all_items: "Exportar TODOS os itens (Framework)",
        
        // Tooltip API
        tooltip_api_key: "A Chave API conecta o app à IA do Google. Clique para obter a sua gratuitamente.",

        // Tooltips Copy Crafts
        tooltip_copy_cat_crafts: "Copiar chaves de craft vinculadas a esta categoria",
        tooltip_copy_table_crafts: "Copiar chaves de craft vinculadas a esta mesa",

        // Category Headers
        name: "Nome",
        mult_sell_short: "Mult. Venda",
        mult_buy_short: "Mult. Compra",
        margin_p2p_short: "Margem P2P",
        tip_mult_sell_short: "Multiplicador de Venda Específico. Deixe vazio para usar Global.",
        tip_mult_buy_short: "Multiplicador de Compra Específico. Deixe vazio para usar Global.",
        tip_margin_p2p_short: "Margem P2P Específica. Deixe vazio para usar Global.",

        // Auto Category
        tooltip_auto_cat_single: "IA: Sugerir categoria com base no nome",
        tooltip_auto_cat_global: "IA: Categorizar todos os itens sem categoria",
        toast_auto_cat_start: "✨ Analisando categorias...",
        toast_auto_cat_success: "{0} itens categorizados com sucesso!",
        toast_no_uncategorized: "Não há itens sem categoria para processar."
    },
    en: {
        config_title: "Economy Settings", config_title_simple: "Settings", config_short: "Settings", global_defaults: "Global Defaults", mult_npc_sell: "NPC Sell Mult (Shop)", mult_npc_buy: "NPC Buy Mult (Sink)", margin_p2p: "P2P Margin (%)", img_path: "Images Folder Path", categories: "Categories", crafting_tables: "Crafting Tables", registered_items: "Registered Items", tip_npc_sell: "Multiplier applied to base cost to determine NPC selling price (Shop). E.g., 2.0 means NPC sells for double the cost.", tip_npc_buy: "Multiplier applied to base cost to determine NPC buying price (Sink). E.g., 0.5 means NPC pays 50% of the cost.", tip_p2p: "Suggested profit percentage for player-to-player trade above base cost.", tip_img_path: "Base path to load images (URL or local folder). E.g., img/items/ or https://site.com/imgs/", tip_image_override: "Image filename. If empty, uses ID.", tip_png_ext: "Automatic .png extension", col_item: "Item", col_cat: "Cat.", col_base: "Base Cost", col_best: "(Best)", col_sell: "NPC Sells", col_shop: "(Shop)", col_buy: "NPC Pays", col_sink: "(Sink)", col_p2p: "P2P", col_player: "(Player)", col_actions: "Actions", modal_manage_title: "Manage Item", item_id: "Item ID", item_name: "Name", category: "Category", description: "Description", image_name: "Image Name (Optional)", is_crafted: "Craftable Item? (Enable Recipes)", manual_cost: "Manual Base Cost ($)", manual_cost_hint: "Used if no recipes or 'Craftable Item' is unchecked.", calc_base: "Base Cost (Lowest)", calc_sell: "NPC Sells", calc_buy: "NPC Pays", calc_p2p: "Suggested P2P", btn_save: "Save Item", btn_cancel: "Cancel", btn_confirm_delete: "Confirm", btn_add_cat: "+ New Category", btn_add_table: "+ New Table", btn_add_variant: "+ Add Craft Variant", btn_export_lua: "Copy Craft Lua", btn_get_crafts: "Get Crafts", header_name: "Name", header_mult_sell: "Sell Mult", header_mult_buy: "Buy Mult", header_margin: "P2P Margin", lbl_recipe_name: "Variant Name (e.g. Campfire)", lbl_tables: "Crafting Tables:", lbl_time: "Time (s)", lbl_level: "Level", lbl_queue: "Prod. Queue", lbl_ing_header: "Ingredient", lbl_qty: "Qty", lbl_return: "Return", lbl_tools_header: "Tools", delete_title: "Confirm Deletion", delete_msg: "Do you want to delete this item?", delete_msg_item: "Do you want to delete this item?", delete_msg_cat: "Do you want to delete this category?", delete_msg_table: "Do you want to delete this table?", prompt_id_cat: "Category ID:", prompt_id_table: "Table Name:", confirm_remove: "Remove?", alert_id_exists: "ID already exists!", alert_copied: "Data copied", alert_no_crafts: "No crafts found for this selection.", search_placeholder: "Search item, category, craft...", used_in_recipes: "Used in {0} recipes", variant_new: "New Variant", craft_badge_multi: "CRAFT (x{0})", craft_badge: "CRAFT", btn_import: "Import", modal_import_title: "Import Items", lbl_import_type: "Import Type", lbl_paste_code: "Paste code here", btn_process_import: "Process Import", import_success: "Imported: {0} items. Skipped (Duplicate): {1}.", api_key_label: "Google Gemini API Key", title_new_cat: "New Category", title_new_table: "New Table", lbl_cat_id: "Category ID (no spaces)", lbl_table_name: "Table Name", data_backup: "Data Management", btn_download_json: "💾 Download Backup (JSON)", btn_upload_json: "📂 Restore Backup", backup_hint: "Data saves automatically to browser. Use Backup for safety or transfer.", tooltip_copy_all: "Generates Lua code for ALL craftable items at once.", tooltip_create_item: "Create new item", tooltip_import_items: "Import Items", btn_generate_ai: "✨ Generate", btn_suggest_recipe: "✨ Suggest AI Recipe", btn_edit: "Edit", ph_qty: "Qty", ph_ret: "Ret", ph_deg: "Deg %", ph_table_name: "Table Name", ph_global: "Global", lbl_language: "Language / Idioma", ph_auto: "Auto", opt_select: "Select...", lbl_cost: "Cost:", lbl_tool_col: "Tool", lbl_deg_col: "Degradation",

        // --- NEW TRANSLATIONS (Script JS) ---
        err_api_key: "Error: API Key not configured!",
        err_ai_call: "Error calling AI.",
        err_fill_name: "Fill in the name first.",
        toast_generating_desc: "✨ Generating description...",
        toast_desc_generated: "Description generated!",
        toast_generating_recipe: "✨ Creating recipe...",
        toast_recipe_added: "Suggested recipe added!",
        err_ai_recipe: "Error processing AI recipe.",
        toast_no_export: "No items/crafts found to export.",
        toast_copied_clipboard: "{0} Items/Crafts copied to clipboard!",
        alert_not_craftable: "This item is not craftable, no recipe to export.",
        alert_add_variant: "Add at least one craft variant.",
        toast_restore_success: "Data restored successfully!",
        err_invalid_file: "Invalid file!",
        err_read_file: "Error reading file!",

        // Framework specific
        lbl_framework: "Server Framework",
        header_framework_data: "Framework Data ({0})",
        btn_export_item_def: "Export Item ({0})", 
        lbl_weight: "Weight",
        lbl_limit: "Limit",
        lbl_type: "Type",
        lbl_unique: "Unique",
        lbl_usable: "Usable",
        lbl_can_remove: "Can Remove",
        lbl_decay: "Decay",
        lbl_delete: "Delete",
        lbl_should_close: "Should Close",
        lbl_group_id: "Group ID",
        lbl_db_id: "DB ID (Optional)",
        lbl_degradation: "Degradation",

        // Clear Items
        btn_clear_all: "🗑️ Clear All Items",
        confirm_clear_all: "Are you absolutely sure? This will delete ALL registered items and cannot be undone (unless you have a backup).",
        toast_cleared: "All items have been removed.",
        tooltip_export_all_items: "Export ALL items (Framework)",

        // Tooltip API
        tooltip_api_key: "The API Key connects the app to Google AI. Click to get yours for free.",

        // Tooltips Copy Crafts
        tooltip_copy_cat_crafts: "Copy craft keys linked to this category",
        tooltip_copy_table_crafts: "Copy craft keys linked to this table",

        // Category Headers
        name: "Name",
        mult_sell_short: "Sell Mult",
        mult_buy_short: "Buy Mult",
        margin_p2p_short: "P2P Margin",
        tip_mult_sell_short: "Specific Sell Multiplier. Leave empty to use Global.",
        tip_mult_buy_short: "Specific Buy Multiplier. Leave empty to use Global.",
        tip_margin_p2p_short: "Specific P2P Margin. Leave empty to use Global.",

        // Auto Category
        tooltip_auto_cat_single: "AI: Suggest category based on name",
        tooltip_auto_cat_global: "AI: Categorize all uncategorized items",
        toast_auto_cat_start: "✨ Analyzing categories...",
        toast_auto_cat_success: "{0} items categorized successfully!",
        toast_no_uncategorized: "No uncategorized items to process."
    },
    de: {
        config_title: "Wirtschaftseinstellungen", config_title_simple: "Einstellungen", config_short: "Einstellungen", global_defaults: "Globale Standards", mult_npc_sell: "NPC Verkauf Mult (Shop)", mult_npc_buy: "NPC Kauf Mult (Sink)", margin_p2p: "P2P Marge (%)", img_path: "Pfad zum Bilderordner", categories: "Kategorien", crafting_tables: "Werkbänke", registered_items: "Registrierte Gegenstände", tip_npc_sell: "Multiplikator für Basiskosten, um den NPC-Verkaufspreis (Shop) zu bestimmen. Z.B. 2.0 bedeutet, NPC verkauft zum doppelten Preis.", tip_npc_buy: "Multiplikator für Basiskosten, um den NPC-Ankaufspreis (Sink) zu bestimmen. Z.B. 0.5 bedeutet, NPC zahlt 50% der Kosten.", tip_p2p: "Vorgeschlagener Gewinnprozentsatz für den Handel zwischen Spielern über den Basiskosten.", tip_img_path: "Basispfad zum Laden von Bildern (URL oder lokaler Ordner). Z.B. img/items/ oder https://site.com/imgs/", tip_image_override: "Bilddateiname. Wenn leer, wird die ID verwendet.", tip_png_ext: "Automatische .png Endung", col_item: "Gegenstand", col_cat: "Kat.", col_base: "Basiskosten", col_best: "(Beste)", col_sell: "NPC Verkauft", col_shop: "(Shop)", col_buy: "NPC Zahlt", col_sink: "(Sink)", col_p2p: "P2P", col_player: "(Spieler)", col_actions: "Aktionen", modal_manage_title: "Gegenstand verwalten", item_id: "Gegenstand ID", item_name: "Name", category: "Kategorie", description: "Beschreibung", image_name: "Bildname (Optional)", is_crafted: "Herstellbar? (Rezepte aktivieren)", manual_cost: "Manuelle Basiskosten ($)", manual_cost_hint: "Wird verwendet, wenn keine Rezepte vorhanden sind oder 'Herstellbar' deaktiviert ist.", calc_base: "Basiskosten (Niedrigste)", calc_sell: "NPC Verkauft", calc_buy: "NPC Zahlt", calc_p2p: "Vorgeschlagenes P2P", btn_save: "Speichern", btn_cancel: "Abbrechen", btn_confirm_delete: "Bestätigen", btn_add_cat: "+ Neue Kategorie", btn_add_table: "+ Neue Werkbank", btn_add_variant: "+ Variante hinzufügen", btn_export_lua: "Lua Craft kopieren", btn_get_crafts: "Crafts abrufen", header_name: "Name", header_mult_sell: "Verkauf Mult", header_mult_buy: "Kauf Mult", header_margin: "P2P Marge", lbl_recipe_name: "Variantenname (z.B. Lagerfeuer)", lbl_tables: "Werkbänke:", lbl_time: "Zeit (s)", lbl_level: "Level", lbl_queue: "Warteschlange", lbl_ing_header: "Zutat", lbl_qty: "Menge", lbl_return: "Rückgabe", lbl_tools_header: "Werkzeuge", delete_title: "Löschen bestätigen", delete_msg: "Möchten Sie diesen Gegenstand löschen?", delete_msg_item: "Möchten Sie diesen Gegenstand löschen?", delete_msg_cat: "Möchten Sie diese Kategorie löschen?", delete_msg_table: "Möchten Sie diese Werkbank löschen?", prompt_id_cat: "Kategorie ID:", prompt_id_table: "Werkbank Name:", confirm_remove: "Entfernen?", alert_id_exists: "ID existiert bereits!", alert_copied: "Daten kopiert", alert_no_crafts: "Keine Crafts für diese Auswahl gefunden.", search_placeholder: "Suche Gegenstand, Kategorie, Craft...", used_in_recipes: "Verwendet in {0} Rezepten", variant_new: "Neue Variante", craft_badge_multi: "CRAFT (x{0})", craft_badge: "CRAFT", btn_import: "Importieren", modal_import_title: "Gegenstände importieren", lbl_import_type: "Importtyp", lbl_paste_code: "Code hier einfügen", btn_process_import: "Import verarbeiten", import_success: "Importiert: {0} Gegenstände. Übersprungen (Duplikat): {1}.", api_key_label: "Google Gemini API Key", title_new_cat: "Neue Kategorie", title_new_table: "Neue Werkbank", lbl_cat_id: "Kategorie ID (keine Leerzeichen)", lbl_table_name: "Werkbank Name", data_backup: "Datenverwaltung", btn_download_json: "💾 Backup herunterladen (JSON)", btn_upload_json: "📂 Backup wiederherstellen", backup_hint: "Daten werden automatisch im Browser gespeichert. Nutzen Sie Backup zur Sicherheit oder Übertragung.", tooltip_copy_all: "Generiert Lua-Code für ALLE herstellbaren Gegenstände auf einmal.", tooltip_create_item: "Neuen Gegenstand erstellen", tooltip_import_items: "Gegenstände importieren", btn_generate_ai: "✨ Generieren", btn_suggest_recipe: "✨ KI-Rezept vorschlagen", btn_edit: "Bearbeiten", ph_qty: "Menge", ph_ret: "Rück", ph_deg: "Abn %", ph_table_name: "Werkbank Name", ph_global: "Global", lbl_language: "Sprache / Language", ph_auto: "Auto", opt_select: "Auswählen...", lbl_cost: "Kosten:", lbl_tool_col: "Werkzeug", lbl_deg_col: "Abnutzung",

        // --- NEUE ÜBERSETZUNGEN (Script JS) ---
        err_api_key: "Fehler: API Key nicht konfiguriert!",
        err_ai_call: "Fehler beim KI-Aufruf.",
        err_fill_name: "Bitte zuerst den Namen ausfüllen.",
        toast_generating_desc: "✨ Generiere Beschreibung...",
        toast_desc_generated: "Beschreibung generiert!",
        toast_generating_recipe: "✨ Erstelle Rezept...",
        toast_recipe_added: "Vorgeschlagenes Rezept hinzugefügt!",
        err_ai_recipe: "Fehler bei der Verarbeitung des KI-Rezepts.",
        toast_no_export: "Keine Items/Crafts zum Exportieren gefunden.",
        toast_copied_clipboard: "{0} Items/Crafts in die Zwischenablage kopiert!",
        alert_not_craftable: "Dieser Gegenstand ist nicht herstellbar, kein Rezept zum Exportieren.",
        alert_add_variant: "Fügen Sie mindestens eine Craft-Variante hinzu.",
        toast_restore_success: "Daten erfolgreich wiederhergestellt!",
        err_invalid_file: "Ungültige Datei!",
        err_read_file: "Fehler beim Lesen der Datei!",

        // Framework specific
        lbl_framework: "Server Framework",
        header_framework_data: "Framework Daten ({0})",
        btn_export_item_def: "Item Exportieren ({0})", 
        lbl_weight: "Gewicht",
        lbl_limit: "Limit",
        lbl_type: "Typ",
        lbl_unique: "Einzigartig",
        lbl_usable: "Verwendbar",
        lbl_can_remove: "Entfernbar",
        lbl_decay: "Verfall",
        lbl_delete: "Löschen",
        lbl_should_close: "Menü schließen",
        lbl_group_id: "Gruppen ID",
        lbl_db_id: "DB ID (Optional)",
        lbl_degradation: "Abnutzung",

        // Clear Items
        btn_clear_all: "🗑️ Alle Items löschen",
        confirm_clear_all: "Sind Sie absolut sicher? Dies löscht ALLE registrierten Items und kann nicht rückgängig gemacht werden (außer Sie haben ein Backup).",
        toast_cleared: "Alle Items wurden entfernt.",
        tooltip_export_all_items: "ALLE Items exportieren (Framework)",

        // Tooltip API
        tooltip_api_key: "Der API-Schlüssel verbindet die App mit Google AI. Klicken Sie, um Ihren kostenlos zu erhalten.",

        // Tooltips Copy Crafts
        tooltip_copy_cat_crafts: "Kopieren Sie Craft-Schlüssel, die mit dieser Kategorie verknüpft sind",
        tooltip_copy_table_crafts: "Kopieren Sie Craft-Schlüssel, die mit diesem Tisch verknüpft sind",

        // Category Headers
        name: "Name",
        mult_sell_short: "Verkauf Mult",
        mult_buy_short: "Kauf Mult",
        margin_p2p_short: "P2P Marge",
        tip_mult_sell_short: "Spezifischer Verkaufsmultiplikator. Leer lassen für Global.",
        tip_mult_buy_short: "Spezifischer Kaufmultiplikator. Leer lassen für Global.",
        tip_margin_p2p_short: "Spezifische P2P-Marge. Leer lassen für Global.",

        // Auto Category
        tooltip_auto_cat_single: "KI: Kategorie basierend auf Name vorschlagen",
        tooltip_auto_cat_global: "KI: Alle nicht kategorisierten Items kategorisieren",
        toast_auto_cat_start: "✨ Analysiere Kategorien...",
        toast_auto_cat_success: "{0} Items erfolgreich kategorisiert!",
        toast_no_uncategorized: "Keine nicht kategorisierten Items zu verarbeiten."
    },
    ru: {
        config_title: "Настройки экономики", config_title_simple: "Настройки", config_short: "Настройки", global_defaults: "Глобальные настройки", mult_npc_sell: "Множ. продажи NPC (Магазин)", mult_npc_buy: "Множ. покупки NPC (Скупка)", margin_p2p: "Маржа P2P (%)", img_path: "Путь к папке с изображениями", categories: "Категории", crafting_tables: "Верстаки", registered_items: "Зарегистрированные предметы", tip_npc_sell: "Множитель к базовой цене для продажи NPC. Пример: 2.0 значит NPC продает в 2 раза дороже.", tip_npc_buy: "Множитель к базовой цене для покупки NPC. Пример: 0.5 значит NPC покупает за 50% цены.", tip_p2p: "Рекомендуемый процент прибыли для торговли между игроками.", tip_img_path: "Базовый путь для загрузки картинок (URL или папка). Пример: img/items/", tip_image_override: "Имя файла картинки. Если пусто, используется ID.", tip_png_ext: "Автоматическое расширение .png", col_item: "Предмет", col_cat: "Кат.", col_base: "База", col_best: "(Лучшая)", col_sell: "Продажа NPC", col_shop: "(Маг.)", col_buy: "Покупка NPC", col_sink: "(Скуп.)", col_p2p: "P2P", col_player: "(Игрок)", col_actions: "Действия", modal_manage_title: "Управление предметом", item_id: "ID предмета", item_name: "Название", category: "Категория", description: "Описание", image_name: "Имя картинки (опц.)", is_crafted: "Крафтится? (Включить рецепты)", manual_cost: "Ручная базовая цена ($)", manual_cost_hint: "Используется если нет рецептов или крафт отключен.", calc_base: "Базовая цена (Мин.)", calc_sell: "Продажа NPC", calc_buy: "Покупка NPC", calc_p2p: "Реком. P2P", btn_save: "Сохранить", btn_cancel: "Отмена", btn_confirm_delete: "Подтвердить", btn_add_cat: "+ Категория", btn_add_table: "+ Верстак", btn_add_variant: "+ Вариант крафта", btn_export_lua: "Копировать Lua", btn_get_crafts: "Получить крафты", header_name: "Название", header_mult_sell: "Множ. прод.", header_mult_buy: "Множ. пок.", header_margin: "Маржа", lbl_recipe_name: "Название варианта (напр. Костер)", lbl_tables: "Верстаки:", lbl_time: "Время (с)", lbl_level: "Уровень", lbl_queue: "Очередь", lbl_ing_header: "Ингредиент", lbl_qty: "Кол-во", lbl_return: "Возврат", lbl_tools_header: "Инструменты", delete_title: "Подтверждение удаления", delete_msg: "Вы хотите удалить этот предмет?", delete_msg_item: "Вы хотите удалить этот предмет?", delete_msg_cat: "Вы хотите удалить эту категорию?", delete_msg_table: "Вы хотите удалить этот верстак?", prompt_id_cat: "ID Категории:", prompt_id_table: "Название верстака:", confirm_remove: "Удалить?", alert_id_exists: "ID уже существует!", alert_copied: "Данные скопированы", alert_no_crafts: "Крафты не найдены.", search_placeholder: "Поиск предмета, категории...", used_in_recipes: "В {0} рецептах", variant_new: "Новый вариант", craft_badge_multi: "КРАФТ (x{0})", craft_badge: "КРАФТ", btn_import: "Импорт", modal_import_title: "Импорт предметов", lbl_import_type: "Тип импорта", lbl_paste_code: "Вставьте код", btn_process_import: "Обработать", import_success: "Импортировано: {0}. Пропущено: {1}.", api_key_label: "Google Gemini API Key", title_new_cat: "Новая категория", title_new_table: "Новый верстак", lbl_cat_id: "ID Категории (без пробелов)", lbl_table_name: "Название верстака", data_backup: "Управление данными", btn_download_json: "💾 Скачать бэкап (JSON)", btn_upload_json: "📂 Загрузить бэкап", backup_hint: "Данные сохраняются автоматически. Используйте бэкап для переноса.", tooltip_copy_all: "Генерирует Lua код для ВСЕХ крафтовых предметов сразу.", tooltip_create_item: "Создать предмет", tooltip_import_items: "Импорт предметов", btn_generate_ai: "✨ Создать", btn_suggest_recipe: "✨ Предложить рецепт ИИ", btn_edit: "Ред.", ph_qty: "Кол-во", ph_ret: "Возвр", ph_deg: "Изн %", ph_table_name: "Название верстака", ph_global: "Глобал.", lbl_language: "Язык / Language", ph_auto: "Авто", opt_select: "Выбрать...", lbl_cost: "Цена:", lbl_tool_col: "Инструмент", lbl_deg_col: "Износ",

        // --- НОВЫЕ ПЕРЕВОДЫ (Script JS) ---
        err_api_key: "Ошибка: API Key не настроен!",
        err_ai_call: "Ошибка вызова ИИ.",
        err_fill_name: "Сначала заполните имя.",
        toast_generating_desc: "✨ Создание описания...",
        toast_desc_generated: "Описание создано!",
        toast_generating_recipe: "✨ Создание рецепта...",
        toast_recipe_added: "Предложенный рецепт добавлен!",
        err_ai_recipe: "Ошибка обработки рецепта ИИ.",
        toast_no_export: "Предметы/крафты для экспорта не найдены.",
        toast_copied_clipboard: "{0} предметов/крафтов скопировано в буфер обмена!",
        alert_not_craftable: "Этот предмет не крафтится, нет рецепта для экспорта.",
        alert_add_variant: "Добавьте хотя бы один вариант крафта.",
        toast_restore_success: "Данные успешно восстановлены!",
        err_invalid_file: "Неверный файл!",
        err_read_file: "Ошибка чтения файла!",

        // Framework specific
        lbl_framework: "Серверный Фреймворк",
        header_framework_data: "Данные Фреймворка ({0})",
        btn_export_item_def: "Экспорт Предмета ({0})", 
        lbl_weight: "Вес",
        lbl_limit: "Лимит",
        lbl_type: "Тип",
        lbl_unique: "Уникальный",
        lbl_usable: "Используемый",
        lbl_can_remove: "Можно удалить",
        lbl_decay: "Гниение",
        lbl_delete: "Удалять",
        lbl_should_close: "Закрыть меню",
        lbl_group_id: "ID Группы",
        lbl_db_id: "ID БД (Опц.)",
        lbl_degradation: "Износ",

        // Clear Items
        btn_clear_all: "🗑️ Удалить все предметы",
        confirm_clear_all: "Вы абсолютно уверены? Это удалит ВСЕ зарегистрированные предметы и не может быть отменено (если у вас нет резервной копии).",
        toast_cleared: "Все предметы удалены.",
        tooltip_export_all_items: "Экспорт ВСЕХ предметов (Фреймворк)",

        // Tooltip API
        tooltip_api_key: "API Key подключает приложение к Google AI. Нажмите, чтобы получить его бесплатно.",

        // Tooltips Copy Crafts
        tooltip_copy_cat_crafts: "Скопируйте ключи крафта, связанные с этой категорией",
        tooltip_copy_table_crafts: "Скопируйте ключи крафта, связанные с этим столом",

        // Category Headers
        name: "Название",
        mult_sell_short: "Множ. прод.",
        mult_buy_short: "Множ. пок.",
        margin_p2p_short: "Маржа P2P",
        tip_mult_sell_short: "Спец. множитель продажи. Пусто для глобального.",
        tip_mult_buy_short: "Спец. множитель покупки. Пусто для глобального.",
        tip_margin_p2p_short: "Спец. маржа P2P. Пусто для глобального.",

        // Auto Category
        tooltip_auto_cat_single: "ИИ: Предложить категорию по названию",
        tooltip_auto_cat_global: "ИИ: Категоризировать все предметы без категории",
        toast_auto_cat_start: "✨ Анализ категорий...",
        toast_auto_cat_success: "Успешно категоризировано {0} предметов!",
        toast_no_uncategorized: "Нет предметов без категорий для обработки."
    }
};