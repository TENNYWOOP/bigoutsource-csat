import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.updateMany({
    where: {
      action_description: { startsWith: 'Created department' },
      category: 'SETTINGS'
    },
    data: {
      category: 'Department'
    }
  });
  
  await prisma.auditLog.updateMany({
    where: {
      category: 'DEPARTMENT'
    },
    data: {
      category: 'Department'
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
