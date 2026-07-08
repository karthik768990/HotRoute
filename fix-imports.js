const fs = require('fs');
const path = require('path');

const fixes = [
  { file: 'src/app/api/dashboard/route.ts', from: '@/lib/dashboards/projects/global', to: '@/lib/dashboards/global' },
  { file: 'src/components/dashboard/dashboard-summary.tsx', from: '@/lib/dashboards/projects/global', to: '@/lib/dashboards/global' },
  { file: 'src/components/dashboard/recent-incidents.tsx', from: '@/lib/dashboards/projects/global', to: '@/lib/dashboards/global' },
  { file: 'src/instrumentation.ts', from: './lib/runtime/startup', to: './lib/background/runtime/startup' },
  { file: 'src/lib/analytics/analytics.service.test.ts', from: '../../../generated/prisma/browser', to: '../../generated/prisma/browser' },
  { file: 'src/lib/analytics/analytics.service.test.ts', from: '../../prisma', to: '../prisma' },
  { file: 'src/lib/analytics/analytics.service.ts', from: '../../prisma', to: '../prisma' },
  { file: 'src/lib/analytics/analytics.service.ts', from: '../../../generated/prisma/browser', to: '../../generated/prisma/browser' },
  { file: 'src/lib/api/api.errors.ts', from: '../core/projects/helpers/project.errors', to: '../projects/helpers/project.errors' },
  { file: 'src/lib/api/api.errors.ts', from: '../core/queue/helpers/queue.errors', to: '../background/queue/helpers/queue.errors' },
  { file: 'src/lib/api/api.errors.ts', from: '../core/worker-pool/worker-pool.errors', to: '../background/worker-pool/worker-pool.errors' },
  { file: 'src/lib/auth/auth.helper.ts', from: '../core/projects/helpers/project.errors', to: '../projects/helpers/project.errors' },
  { file: 'src/lib/auth/auth.service.ts', from: '../core/projects/helpers/project.errors', to: '../projects/helpers/project.errors' },
  { file: 'src/lib/background/runtime/queue.ts', from: '../core/queue/queue.memory', to: '../queue/queue.memory' },
  { file: 'src/lib/background/runtime/scheduler.ts', from: '../core/scheduler/scheduler.service', to: '../scheduler/scheduler.service' },
  { file: 'src/lib/background/runtime/worker-pool.ts', from: '../core/worker-pool/worker-pool.service', to: '../worker-pool/worker-pool.service' },
  { file: 'src/lib/background/worker-pool/worker-pool.service.test.ts', from: '../ping/ping.service', to: '../../ping/ping.service' },
  { file: 'src/lib/background/worker/worker.service.ts', from: '../ping/ping.service', to: '../../ping/ping.service' },
  { file: 'src/lib/dashboards/global/helpers/user-dashboard.incidents.ts', from: '../../prisma', to: '../../../prisma' },
  { file: 'src/lib/dashboards/global/helpers/user-dashboard.projects.ts', from: '../../prisma', to: '../../../prisma' },
  { file: 'src/lib/dashboards/global/helpers/user-dashboard.projects.ts', from: '../../../generated/prisma/browser', to: '../../../../generated/prisma/browser' },
  { file: 'src/lib/dashboards/global/helpers/user-dashboard.projects.ts', from: '../../core/analytics/analytics.service', to: '../../../analytics/analytics.service' },
  { file: 'src/lib/dashboards/global/helpers/user-dashboard.projects.ts', from: '../../dashboard/helpers/dashboard.service.helper', to: '../../project/helpers/dashboard.service.helper' },
  { file: 'src/lib/dashboards/global/user-dashboard.service.test.ts', from: '../prisma', to: '../../prisma' },
  { file: 'src/lib/dashboards/global/user-dashboard.service.test.ts', from: '../../generated/prisma/browser', to: '../../../generated/prisma/browser' },
  { file: 'src/lib/dashboards/global/user-dashboard.types.ts', from: '../dashboard/dashboard.types', to: '../project/dashboard.types' },
  { file: 'src/lib/dashboards/project/dashboard.service.test.ts', from: '../../generated/prisma/browser', to: '../../../generated/prisma/browser' },
  { file: 'src/lib/dashboards/project/dashboard.service.test.ts', from: '../prisma', to: '../../prisma' },
  { file: 'src/lib/dashboards/project/dashboard.service.test.ts', from: '../core/projects/helpers/project.errors', to: '../../projects/helpers/project.errors' },
  { file: 'src/lib/dashboards/project/dashboard.service.ts', from: '../core/analytics/analytics.service', to: '../../analytics/analytics.service' },
  { file: 'src/lib/dashboards/project/dashboard.types.ts', from: '../../generated/prisma/browser', to: '../../../generated/prisma/browser' },
  { file: 'src/lib/dashboards/project/helpers/dashboard.service.helper.ts', from: '../../../generated/prisma/browser', to: '../../../../generated/prisma/browser' },
  { file: 'src/lib/hooks/use-dashboard.ts', from: '@/lib/dashboards/projects/global', to: '@/lib/dashboards/global' },
  { file: 'src/lib/ping/helpers/ping.helper.ts', from: '../../../prisma', to: '../../prisma' },
  { file: 'src/lib/ping/ping.service.test.ts', from: '../../../generated/prisma/browser', to: '../../generated/prisma/browser' },
  { file: 'src/lib/ping/ping.service.test.ts', from: '../../prisma', to: '../prisma' },
  { file: 'src/lib/ping/ping.service.ts', from: '../../prisma', to: '../prisma' },
  { file: 'src/lib/projects/helpers/user.validation.helpers.ts', from: '../../../prisma', to: '../../prisma' },
  { file: 'src/lib/projects/project.service.test.ts', from: '../../../generated/prisma/browser', to: '../../generated/prisma/browser' },
  { file: 'src/lib/projects/project.service.test.ts', from: '../../prisma', to: '../prisma' },
  { file: 'src/lib/projects/project.service.ts', from: '../../../generated/prisma/browser', to: '../../generated/prisma/browser' },
  { file: 'src/lib/projects/project.service.ts', from: '../../prisma', to: '../prisma' }
];

fixes.forEach(fix => {
  const fullPath = path.join(__dirname, fix.file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${fix.file}`);
  } else {
    console.log(`File not found: ${fix.file}`);
  }
});
