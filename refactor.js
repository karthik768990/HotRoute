const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const moves = [
  // 1. Domain logic
  { src: 'lib/core/projects', dest: 'lib/projects' },
  { src: 'lib/core/ping', dest: 'lib/ping' },
  { src: 'lib/core/analytics', dest: 'lib/analytics' },
  // 2. Background Infrastructure
  { src: 'lib/core/queue', dest: 'lib/background/queue' },
  { src: 'lib/core/scheduler', dest: 'lib/background/scheduler' },
  { src: 'lib/core/worker', dest: 'lib/background/worker' },
  { src: 'lib/core/worker-pool', dest: 'lib/background/worker-pool' },
  { src: 'lib/runtime', dest: 'lib/background/runtime' },
  // 3. Dashboards
  { src: 'lib/user-dashboard', dest: 'lib/dashboards/global' },
  { src: 'lib/dashboard', dest: 'lib/dashboards/project' },
];

const fileRenames = [
  { src: 'lib/projects/userValidation.ts', dest: 'lib/projects/user.validation.ts' },
  { src: 'lib/projects/helpers/uservalidation.helpers.ts', dest: 'lib/projects/helpers/user.validation.helpers.ts' },
  { src: 'lib/dashboards/project/dashboard.services.ts', dest: 'lib/dashboards/project/dashboard.service.ts' },
  { src: 'lib/dashboards/project/dashboard.services.test.ts', dest: 'lib/dashboards/project/dashboard.service.test.ts' }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Perform moves
for (const m of moves) {
  const srcPath = path.join(baseDir, m.src);
  const destPath = path.join(baseDir, m.dest);
  
  if (fs.existsSync(srcPath)) {
    ensureDir(path.dirname(destPath));
    fs.renameSync(srcPath, destPath);
    console.log(`Moved ${m.src} -> ${m.dest}`);
  }
}

// Perform file renames
for (const m of fileRenames) {
  const srcPath = path.join(baseDir, m.src);
  const destPath = path.join(baseDir, m.dest);
  if (fs.existsSync(srcPath)) {
    fs.renameSync(srcPath, destPath);
    console.log(`Renamed ${m.src} -> ${m.dest}`);
  }
}

// Try to remove empty lib/core
if (fs.existsSync(path.join(baseDir, 'lib/core'))) {
  try {
    fs.rmdirSync(path.join(baseDir, 'lib/core'));
    console.log("Removed empty lib/core");
  } catch (e) {
    console.log("Could not remove lib/core (probably not empty):", e.message);
  }
}

// Update imports
const importReplacements = [
  { from: /@\/lib\/core\/projects/g, to: "@/lib/projects" },
  { from: /@\/lib\/core\/ping/g, to: "@/lib/ping" },
  { from: /@\/lib\/core\/analytics/g, to: "@/lib/analytics" },
  { from: /@\/lib\/core\/queue/g, to: "@/lib/background/queue" },
  { from: /@\/lib\/core\/scheduler/g, to: "@/lib/background/scheduler" },
  { from: /@\/lib\/core\/worker-pool/g, to: "@/lib/background/worker-pool" },
  { from: /@\/lib\/core\/worker/g, to: "@/lib/background/worker" },
  { from: /@\/lib\/runtime/g, to: "@/lib/background/runtime" },
  { from: /@\/lib\/user-dashboard/g, to: "@/lib/dashboards/global" },
  { from: /@\/lib\/dashboard/g, to: "@/lib/dashboards/project" },
  { from: /userValidation/g, to: "user.validation" },
  { from: /uservalidation\.helpers/g, to: "user.validation.helpers" },
  { from: /dashboard\.services/g, to: "dashboard.service" }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const rep of importReplacements) {
        if (content.match(rep.from)) {
          content = content.replace(rep.from, rep.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDirectory(baseDir);
console.log('Refactoring complete.');
