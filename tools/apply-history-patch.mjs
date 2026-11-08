// Usage (from project root): node tools/apply-history-patch.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

var MARK = 'quantity-history-feature';
var results = [];

function patch(file, description, transform) {
  if (!existsSync(file)) {
    results.push(['SKIP (file missing)', file, description]);
    return;
  }
  var source = readFileSync(file, 'utf8');
  if (source.includes(MARK)) {
    results.push(['ALREADY', file, description]);
    return;
  }
  var output = transform(source);
  if (output === source) {
    results.push(['MANUAL', file, description]);
    return;
  }
  writeFileSync(file, output, 'utf8');
  results.push(['OK', file, description]);
}

patch('src/main.js', 'start tracker', function (src) {
  var out = src.replace(/^(import\s+['"]\.\/style\.css['"];?)$/m,
    "$1\nimport { quantityHistoryTracker } from './services/historyTracker.js'; // " + MARK);
  return out.replace(/^(app\.mount\()/m, 'quantityHistoryTracker.start();\n$1');
});

patch('src/router/index.js', 'add routes', function (src) {
  var routes = "\n  { path: '/reports', name: 'reports', component: () => import('../views/ReportsView.vue') }, // " + MARK
    + "\n  { path: '/history/:templateId/:categoryId/:itemId', name: 'item-history', component: () => import('../views/ItemHistoryView.vue'), props: true },";
  return src.replace(/((?:var|const|let)\s+routes\s*=\s*\[)/, '$1' + routes);
});

patch('src/views/HomeView.vue', 'add nav link', function (src) {
  var link = "\n  { to: '/reports', label: '📊 گزارش مصرف', tone: 'border-sky-300 text-sky-600 dark:text-sky-300' }, // " + MARK;
  return src.replace(/((?:var|const|let)\s+navLinks\s*=\s*\[)/, '$1' + link);
});

patch('src/components/ChecklistItem.vue', 'add history button', function (src) {
  var withImport = src.replace(/<script setup>/, "<script setup>\nimport ItemHistoryLink from './ItemHistoryLink.vue'; // " + MARK);
  return withImport.replace(/(\s*)<\/div>(\s*)<\/template>/, '$1  <ItemHistoryLink :item="item" />$1</div>$2</template>');
});

results.forEach(function (row) { console.log(row.join(' | ')); });
if (results.some(function (row) { return row[0] === 'MANUAL'; })) {
  console.log('\nبرای موارد MANUAL، بخش «اتصال دستی» در README.md را ببینید.');
}
