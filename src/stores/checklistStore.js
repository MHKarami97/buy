import { defineStore } from "pinia";
import { checklistRepository } from "../services/ChecklistRepository";
import { ChecklistFactory } from "../services/ChecklistFactory";
import { ChecklistItem } from "../models/ChecklistItem";
import { DefaultsReconciler } from "../services/DefaultsReconciler";
import { defaultChecklistDefinitions } from "../data/defaultChecklists";
import { applyItemStrategy } from "../services/ItemFilterStrategies";
import { storageService } from "../services/StorageService";
import { ChecklistTemplate } from "../models/ChecklistTemplate";
import { TemplateKind } from "../models/TemplateKind";
import { occasionPresets } from "../data/occasionPresets";

var LOW_STOCK_QUANTITY = 0.5;

function notesFieldOf(scope) {
  return scope === "occasion" ? "occasionNotes" : "shoppingNotes";
}

function noteStorageKeyOf(scope) {
  return scope === "occasion" ? "occasion-shopping-notes" : "shopping-notes";
}

function collectEntries(templates, predicate) {
  var entries = [];
  templates.forEach((template) => {
    template.categories.forEach((category) => {
      category.activeItems.forEach((item) => {
        if (predicate(item)) {
          entries.push({
            item,
            template,
            category,
            isLow: item.quantity === LOW_STOCK_QUANTITY,
          });
        }
      });
    });
  });
  return entries;
}

/**
 * Central reactive store (Observer Pattern via Pinia's reactivity system).
 * All components subscribe to this single source of truth; any mutation
 * here automatically propagates to every subscriber.
 */
export var useChecklistStore = defineStore("checklist", {
  state: () => ({
    templates: [],
    activeTemplateId: null,
    activeCategoryId: null,
    filterKey: "all",
    sortKey: "default",
    searchQuery: "",
    isDarkMode: false,
    saveTimeoutId: null,
    deletedDefaultIds: [],
    quantityNotice: null,
    quantityNoticeTimeoutId: null,
    shoppingNotes: [],
    occasionNotes: [],
  }),

  getters: {
    activeTemplate(state) {
      return (
        state.templates.find((tpl) => tpl.id === state.activeTemplateId) || null
      );
    },

    activeCategory(state) {
      var template = state.templates.find(
        (tpl) => tpl.id === state.activeTemplateId,
      );
      if (!template) return null;
      return (
        template.findCategory(state.activeCategoryId) ||
        template.categories[0] ||
        null
      );
    },

    visibleItems(state) {
      const category = this.activeCategory;
      if (!category) return [];
      let items = category.activeItems; // فقط آیتم‌های فعال
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.trim().toLowerCase();
        items = items.filter((item) =>
          item.title.toLowerCase().includes(query),
        );
      }
      return applyItemStrategy(items, state.filterKey, state.sortKey);
    },

    // Getter جدید برای آیتم‌های مخفی
    hiddenItems(state) {
      const category = this.activeCategory;
      if (!category) return [];
      return category.items.filter((item) => item.isHidden);
    },

    mainTemplates(state) {
      return state.templates.filter(
        (template) => template.kind !== TemplateKind.OCCASION,
      );
    },

    occasionTemplates(state) {
      return state.templates.filter(
        (template) => template.kind === TemplateKind.OCCASION,
      );
    },

    shoppingItems() {
      return collectEntries(
        this.mainTemplates,
        (item) => item.quantity === 0 && !item.isPostponed,
      );
    },

    lowStockItems() {
      return collectEntries(
        this.mainTemplates,
        (item) => item.quantity === LOW_STOCK_QUANTITY,
      );
    },

    templatesOfScope() {
      return (scope) =>
        scope === "occasion" ? this.occasionTemplates : this.mainTemplates;
    },

    shoppingEntriesFor() {
      return (scope, includeLowStock = false) =>
        collectEntries(
          this.templatesOfScope(scope),
          (item) =>
            !item.isPostponed &&
            (item.quantity === 0 ||
              (includeLowStock && item.quantity === LOW_STOCK_QUANTITY)),
        );
    },

    postponedEntriesFor() {
      return (scope, includeLowStock = false) =>
        collectEntries(
          this.templatesOfScope(scope),
          (item) =>
            item.isPostponed &&
            (item.quantity === 0 ||
              (includeLowStock && item.quantity === LOW_STOCK_QUANTITY)),
        );
    },

    notesFor(state) {
      return (scope) => state[notesFieldOf(scope)];
    },
  },

  actions: {
    initialize() {
      if (checklistRepository.exists()) {
        this.templates = checklistRepository.getAll();
        this.deletedDefaultIds = checklistRepository.getDeletedDefaultIds();
        var legacyDefaultIds = ["food", "home"];
        var hadLegacyDefaults = this.templates.some((template) =>
          legacyDefaultIds.includes(template.sourceDefinitionId),
        );
        this.templates = this.templates.filter(
          (template) => !legacyDefaultIds.includes(template.sourceDefinitionId),
        );
        this.reconcileDefaults();
        if (hadLegacyDefaults) this.persistAll();
      } else {
        this.templates = defaultChecklistDefinitions.map((def) =>
          ChecklistFactory.createFromDefinition(def),
        );
        this.persistAll();
      }

      if (this.templates.length && !this.activeTemplateId) {
        this.activeTemplateId = this.templates[0].id;
        this.activeCategoryId = this.templates[0].categories[0]?.id ?? null;
      }

      this.shoppingNotes = storageService.get(noteStorageKeyOf("main"), []);
      this.occasionNotes = storageService.get(noteStorageKeyOf("occasion"), []);

      var darkPref = localStorage.getItem("smart-checklist:theme");
      this.isDarkMode = darkPref === "dark";
      this.applyTheme();
    },

    /**
     * Merges any updated/new entries from `defaultChecklistDefinitions`
     * into the persisted templates without touching user progress or
     * user-added items/categories. Safe to call on every app start.
     */
    reconcileDefaults() {
      var outcome = DefaultsReconciler.reconcileAll(
        this.templates,
        defaultChecklistDefinitions,
        this.deletedDefaultIds,
      );
      this.templates = outcome.templates;
      if (outcome.changed) this.persistAll();
    },

    persistAll() {
      checklistRepository.saveAll(this.templates);
    },

    schedulePersist() {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = setTimeout(() => this.persistAll(), 400);
    },

    selectTemplate(templateId) {
      this.activeTemplateId = templateId;
      var template = this.activeTemplate;
      this.activeCategoryId = template?.categories[0]?.id ?? null;
      this.searchQuery = "";
    },

    selectCategory(categoryId) {
      this.activeCategoryId = categoryId;
    },

    findItemRef(
      itemId,
      categoryId = this.activeCategoryId,
      templateId = this.activeTemplateId,
    ) {
      var template = this.templates.find((entry) => entry.id === templateId);
      return template?.findCategory(categoryId)?.findItem(itemId) ?? null;
    },

    postponeItem(itemId, categoryId, templateId) {
      var item = this.findItemRef(itemId, categoryId, templateId);
      if (!item) return;
      item.postpone();
      this.schedulePersist();
    },

    restorePostponedItem(itemId, categoryId, templateId) {
      var item = this.findItemRef(itemId, categoryId, templateId);
      if (!item) return;
      item.restore();
      this.schedulePersist();
    },

    toggleItemVisibility(itemId) {
      const category = this.activeCategory;
      if (!category) return;
      const item = category.findItem(itemId);
      if (item) {
        item.isHidden = !item.isHidden;
        this.schedulePersist();
      }
    },

    updateItemQuantity(
      itemId,
      quantity,
      categoryId = this.activeCategoryId,
      templateId = this.activeTemplateId,
    ) {
      var item = this.findItemRef(itemId, categoryId, templateId);
      if (item) {
        var previousQuantity = item.quantity;
        var nextQuantity = ChecklistItem.normalizeQuantity(quantity);
        item.setQuantity(nextQuantity);
        if (previousQuantity !== item.quantity) {
          item.restore();
          clearTimeout(this.quantityNoticeTimeoutId);
          this.quantityNotice = {
            itemTitle: item.title,
            quantity: item.quantity,
          };
          this.quantityNoticeTimeoutId = setTimeout(() => {
            this.quantityNotice = null;
          }, 2000);
        }
        this.schedulePersist();
      }
    },

    toggleItem(itemId) {
      var category = this.activeCategory;
      if (!category) return;
      var item = category.findItem(itemId);
      if (item) {
        this.updateItemQuantity(itemId, item.quantity > 0 ? 0 : 1);
      }
    },

    addItem(title, note = "") {
      var category = this.activeCategory;
      if (!category || !title.trim()) return;
      category.addItem(ChecklistFactory.createItem(title.trim(), note));
      this.schedulePersist();
    },

    removeItem(itemId) {
      var category = this.activeCategory;
      if (!category) return;
      category.removeItem(itemId);
      this.schedulePersist();
    },

    addCategory(name, icon = "📁") {
      var template = this.activeTemplate;
      if (!template || !name.trim()) return;
      var category = ChecklistFactory.createCategory(name.trim(), icon);
      template.categories.push(category);
      this.activeCategoryId = category.id;
      this.schedulePersist();
    },

    resetActiveTemplate() {
      var template = this.activeTemplate;
      if (!template) return;
      template.resetProgress();
      this.schedulePersist();
    },

    createCustomTemplate(title, icon = "📝") {
      var template = ChecklistFactory.createEmptyCustom(title, icon);
      this.templates.push(template);
      this.selectTemplate(template.id);
      this.persistAll();
      return template;
    },

    createOccasion(presetId, customTitle = "") {
      var preset = occasionPresets.find((entry) => entry.id === presetId);
      if (!preset) return null;
      var template = ChecklistFactory.createOccasionFromPreset(
        preset,
        customTitle,
      );
      this.templates.push(template);
      this.selectTemplate(template.id);
      this.persistAll();
      return template;
    },

    createCustomOccasion(title, icon = "🎉") {
      var template = ChecklistFactory.createEmptyOccasion(
        title.trim() || "لیست مناسبتی",
        icon,
      );
      this.templates.push(template);
      this.selectTemplate(template.id);
      this.persistAll();
      return template;
    },

    deleteTemplate(templateId) {
      var template = this.templates.find((tpl) => tpl.id === templateId);

      // Remember explicit deletion of a default-sourced template so that
      // reconcileDefaults() does not silently resurrect it later.
      if (template?.sourceDefinitionId) {
        this.deletedDefaultIds.push(template.sourceDefinitionId);
        checklistRepository.saveDeletedDefaultIds(this.deletedDefaultIds);
      }

      this.templates = this.templates.filter((tpl) => tpl.id !== templateId);
      if (this.activeTemplateId === templateId) {
        this.activeTemplateId = this.templates[0]?.id ?? null;
        this.activeCategoryId = this.templates[0]?.categories[0]?.id ?? null;
      }
      this.persistAll();
    },

    setFilter(key) {
      this.filterKey = key;
    },

    setSort(key) {
      this.sortKey = key;
    },

    setSearchQuery(query) {
      this.searchQuery = query;
    },

    addShoppingNote(text, scope = "main") {
      var value = text.trim();
      if (!value) return;
      var field = notesFieldOf(scope);
      this[field].unshift({
        id: `note-${Date.now()}`,
        text: value,
        isChecked: false,
        createdAt: Date.now(),
      });
      storageService.set(noteStorageKeyOf(scope), this[field]);
    },

    toggleShoppingNote(noteId, scope = "main") {
      var field = notesFieldOf(scope);
      var note = this[field].find((entry) => entry.id === noteId);
      if (!note) return;
      note.isChecked = !note.isChecked;
      storageService.set(noteStorageKeyOf(scope), this[field]);
    },

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem(
        "smart-checklist:theme",
        this.isDarkMode ? "dark" : "light",
      );
      this.applyTheme();
    },

    applyTheme() {
      document.documentElement.classList.toggle("dark", this.isDarkMode);
    },

    exportData() {
      var payload = {
        exportedAt: new Date().toISOString(),
        templates: this.templates.map((tpl) => tpl.toJSON()),
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = `checklist-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },

    async importData(file) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        // اعتبارسنجی اولیه ساختار
        if (!parsed || !Array.isArray(parsed.templates)) {
          throw new Error("ساختار فایل نامعتبر است.");
        }

        // بازسازی کامل اشیاء دامنه از روی JSON
        const incoming = parsed.templates.map((json) =>
          ChecklistTemplate.fromJSON(json),
        );

        // جایگزینی کامل به‌جای افزودن (رفع مشکل دوپلیکیت)
        this.templates = incoming;

        // اصلاح وضعیت انتخاب‌های فعلی UI پس از جایگزینی کل داده‌ها
        if (this.templates.length > 0) {
          this.activeTemplateId = this.templates[0].id;
          this.activeCategoryId = this.templates[0].categories[0]?.id ?? null;
        } else {
          this.activeTemplateId = null;
          this.activeCategoryId = null;
        }

        // همگام‌سازی با LocalStorage
        this.persistAll();
      } catch (error) {
        console.error("خطا در درون‌ریزی داده‌ها:", error);
        throw error; // این خطا را به UI پرتاب کنید تا کاربر مطلع شود
      }
    },
  },
});
