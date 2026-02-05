---
name: i18n
description: Internationalization setup - translation workflows, locale management, RTL support, pluralization. Patterns for React, Vue, and vanilla JS.
---

# i18n Skill

Set up internationalization (i18n) and localization (l10n) for multi-language applications.

## Invocation

```
/i18n [action]
```

Actions:
- `/i18n setup` - Initialize i18n for your framework
- `/i18n add [locale]` - Add a new language
- `/i18n extract` - Extract translatable strings
- `/i18n check` - Find missing translations

Or naturally: "add translations", "support multiple languages", "internationalize the app"

## Terminology

| Term | Meaning |
|------|---------|
| **i18n** | Internationalization - making code translation-ready |
| **l10n** | Localization - adapting for specific locale |
| **Locale** | Language + region (en-US, fr-CA, zh-CN) |
| **Translation key** | Identifier for translatable string |
| **Interpolation** | Inserting variables into translations |
| **Pluralization** | Handling singular/plural forms |
| **RTL** | Right-to-left languages (Arabic, Hebrew) |

## File Structure

```
src/
├── i18n/
│   ├── index.js          # i18n configuration
│   ├── locales/
│   │   ├── en.json       # English (default)
│   │   ├── es.json       # Spanish
│   │   ├── fr.json       # French
│   │   ├── de.json       # German
│   │   ├── ja.json       # Japanese
│   │   └── ar.json       # Arabic (RTL)
│   └── utils/
│       ├── formatters.js # Date, number, currency
│       └── plurals.js    # Plural rules
```

## Translation File Format

### Flat Structure (Simple)

```json
{
  "welcome": "Welcome",
  "login": "Log in",
  "logout": "Log out",
  "greeting": "Hello, {{name}}!",
  "items_count": "{{count}} item",
  "items_count_plural": "{{count}} items"
}
```

### Nested Structure (Organized)

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading..."
  },
  "auth": {
    "login": "Log in",
    "logout": "Log out",
    "register": "Create account",
    "forgotPassword": "Forgot password?"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "networkError": "Connection failed. Please try again."
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back, {{name}}!"
  }
}
```

---

## React (react-i18next)

### Setup

```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
```

### Configuration

```javascript
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de', 'ja', 'ar'],

    interpolation: {
      escapeValue: false // React already escapes
    },

    backend: {
      loadPath: '/locales/{{lng}}.json'
    },

    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });

export default i18n;
```

### Usage in Components

```jsx
import { useTranslation } from 'react-i18next';

function Header() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.greeting', { name: 'John' })}</p>

      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </header>
  );
}
```

### Pluralization

```json
// en.json
{
  "cart": {
    "items_zero": "Your cart is empty",
    "items_one": "You have {{count}} item",
    "items_other": "You have {{count}} items"
  }
}
```

```jsx
// Automatically selects correct form
{t('cart.items', { count: items.length })}
```

### Namespaces (Code Splitting)

```javascript
// Load specific namespace
const { t } = useTranslation('dashboard');

// Or multiple
const { t } = useTranslation(['common', 'dashboard']);

// Access across namespaces
t('common:save')
t('dashboard:title')
```

---

## Vue (vue-i18n)

### Setup

```bash
npm install vue-i18n@9
```

### Configuration

```javascript
// src/i18n/index.js
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: { en, es }
});

export default i18n;
```

### Usage in Components

```vue
<template>
  <div>
    <h1>{{ $t('common.welcome') }}</h1>
    <p>{{ $t('dashboard.greeting', { name: 'John' }) }}</p>

    <select v-model="$i18n.locale">
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

function changeLocale(newLocale) {
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);
}
</script>
```

### Pluralization

```json
// en.json
{
  "cart": {
    "items": "no items | {count} item | {count} items"
  }
}
```

```vue
{{ $t('cart.items', items.length) }}
```

---

## Next.js (next-intl)

### Setup

```bash
npm install next-intl
```

### Configuration

```javascript
// next.config.js
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  // Other Next.js config
});
```

```javascript
// src/i18n.js
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

### Middleware (Route-based)

```javascript
// middleware.js
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

### Usage

```jsx
// app/[locale]/page.js
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

---

## Vanilla JavaScript

### Simple Implementation

```javascript
// i18n.js
class I18n {
  constructor(defaultLocale = 'en') {
    this.locale = defaultLocale;
    this.translations = {};
    this.fallbackLocale = 'en';
  }

  async loadLocale(locale) {
    if (!this.translations[locale]) {
      const response = await fetch(`/locales/${locale}.json`);
      this.translations[locale] = await response.json();
    }
    this.locale = locale;
    this.updateDOM();
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.locale];

    // Fallback to default locale
    if (!value) {
      value = this.translations[this.fallbackLocale];
    }

    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    if (!value) return key; // Return key if not found

    // Interpolation
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) => params[name] ?? '');
  }

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = this.t(key);
    });
  }
}

// Usage
const i18n = new I18n('en');
await i18n.loadLocale('en');

// In HTML
// <h1 data-i18n="common.welcome"></h1>
// <input data-i18n-placeholder="form.emailPlaceholder">
```

---

## RTL Support

### CSS

```css
/* Base styles */
.container {
  padding-inline-start: 1rem;  /* Use logical properties */
  margin-inline-end: 2rem;
  text-align: start;
}

/* RTL-specific overrides */
[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}

/* Or using :dir() pseudo-class */
:dir(rtl) .sidebar {
  border-right: none;
  border-left: 1px solid #ccc;
}
```

### React

```jsx
function App() {
  const { i18n } = useTranslation();
  const isRTL = ['ar', 'he', 'fa'].includes(i18n.language);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  return <div>{/* ... */}</div>;
}
```

### Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  // Enable RTL variants
  plugins: [
    require('tailwindcss-rtl')
  ]
};
```

```html
<!-- Uses logical properties -->
<div class="ps-4 me-2">  <!-- padding-start, margin-end -->
```

---

## Date & Number Formatting

### Using Intl API

```javascript
// formatters.js
export function formatDate(date, locale, options = {}) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...options
  }).format(new Date(date));
}

export function formatNumber(number, locale, options = {}) {
  return new Intl.NumberFormat(locale, options).format(number);
}

export function formatCurrency(amount, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatRelativeTime(date, locale) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = date - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(days) < 1) {
    const hours = Math.round(diff / (1000 * 60 * 60));
    return rtf.format(hours, 'hour');
  }
  return rtf.format(days, 'day');
}
```

### Usage

```javascript
formatDate('2024-01-20', 'en-US');    // "Jan 20, 2024"
formatDate('2024-01-20', 'de-DE');    // "20. Jan. 2024"
formatDate('2024-01-20', 'ja-JP');    // "2024/01/20"

formatCurrency(1234.56, 'en-US', 'USD');  // "$1,234.56"
formatCurrency(1234.56, 'de-DE', 'EUR');  // "1.234,56 €"
formatCurrency(1234.56, 'ja-JP', 'JPY');  // "￥1,235"

formatRelativeTime(Date.now() - 86400000, 'en');  // "yesterday"
formatRelativeTime(Date.now() - 86400000, 'es');  // "ayer"
```

---

## Translation Workflow

### 1. Extract Strings

```bash
# Using i18next-parser
npx i18next-parser

# Config: i18next-parser.config.js
module.exports = {
  locales: ['en', 'es', 'fr'],
  output: 'src/locales/$LOCALE.json',
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  keySeparator: '.',
  namespaceSeparator: ':'
};
```

### 2. Translation Services

| Service | Features |
|---------|----------|
| **Crowdin** | Git sync, in-context editing |
| **Lokalise** | CLI, GitHub integration |
| **Phrase** | OTA updates, branching |
| **POEditor** | Simple, affordable |
| **Weblate** | Open source, self-hosted |

### 3. Machine Translation (Bootstrap)

```javascript
// scripts/translate.js
const { Translate } = require('@google-cloud/translate').v2;
const fs = require('fs');

const translate = new Translate();
const sourceLocale = 'en';
const targetLocales = ['es', 'fr', 'de'];

async function translateFile(targetLang) {
  const source = JSON.parse(fs.readFileSync(`locales/${sourceLocale}.json`));
  const result = {};

  for (const [key, value] of Object.entries(flattenObject(source))) {
    const [translation] = await translate.translate(value, targetLang);
    setNestedValue(result, key, translation);
  }

  fs.writeFileSync(
    `locales/${targetLang}.json`,
    JSON.stringify(result, null, 2)
  );
}

// Run for all target languages
targetLocales.forEach(translateFile);
```

### 4. Check Missing Translations

```javascript
// scripts/check-translations.js
const fs = require('fs');
const path = require('path');

const localesDir = './src/locales';
const baseLocale = 'en';

const baseKeys = getAllKeys(
  JSON.parse(fs.readFileSync(path.join(localesDir, `${baseLocale}.json`)))
);

fs.readdirSync(localesDir)
  .filter(f => f.endsWith('.json') && f !== `${baseLocale}.json`)
  .forEach(file => {
    const locale = file.replace('.json', '');
    const translations = JSON.parse(
      fs.readFileSync(path.join(localesDir, file))
    );
    const keys = getAllKeys(translations);

    const missing = baseKeys.filter(k => !keys.includes(k));
    const extra = keys.filter(k => !baseKeys.includes(k));

    if (missing.length) {
      console.log(`\n${locale}: Missing ${missing.length} keys`);
      missing.forEach(k => console.log(`  - ${k}`));
    }

    if (extra.length) {
      console.log(`\n${locale}: Extra ${extra.length} keys`);
      extra.forEach(k => console.log(`  + ${k}`));
    }
  });
```

---

## Best Practices

### Key Naming

```json
// Good - descriptive, namespaced
{
  "auth.login.title": "Log in to your account",
  "auth.login.button": "Log in",
  "auth.login.error.invalidCredentials": "Invalid email or password"
}

// Bad - vague, collision-prone
{
  "title": "Log in",
  "button": "Log in",
  "error": "Invalid"
}
```

### Avoid String Concatenation

```javascript
// Bad - breaks translation
t('hello') + ' ' + name + '!'

// Good - use interpolation
t('greeting', { name })  // "Hello, {{name}}!"
```

### Context for Translators

```json
{
  "save": "Save",
  "_save.context": "Button to save form data",

  "characters_remaining": "{{count}} characters remaining",
  "_characters_remaining.context": "Shows below text input fields"
}
```

### Handle Plurals Properly

```json
// English
{
  "items_zero": "No items",
  "items_one": "1 item",
  "items_other": "{{count}} items"
}

// Russian (has more plural forms)
{
  "items_zero": "Нет товаров",
  "items_one": "{{count}} товар",
  "items_few": "{{count}} товара",
  "items_many": "{{count}} товаров",
  "items_other": "{{count}} товаров"
}
```

---

## Output Format

```
=== I18N CONFIGURED ===

Framework: React (react-i18next)
Default locale: en
Supported locales: en, es, fr, de

Files created:
- src/i18n/index.js
- src/i18n/locales/en.json
- src/i18n/locales/es.json (template)

Features:
- [x] Language detection (browser, localStorage)
- [x] Interpolation support
- [x] Pluralization
- [x] Namespaces
- [ ] RTL support (run /i18n rtl)

Next steps:
1. Import i18n in your app entry point
2. Wrap app with I18nextProvider
3. Extract strings with: npx i18next-parser
4. Send to translation service or translate manually
```

## Sources

- [react-i18next Documentation](https://react.i18next.com/)
- [vue-i18n Documentation](https://vue-i18n.intlify.dev/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Mozilla Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Unicode CLDR Plural Rules](https://cldr.unicode.org/index/cldr-spec/plural-rules)
