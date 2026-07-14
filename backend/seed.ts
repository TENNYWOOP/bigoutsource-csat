import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.surveyResponse.deleteMany();
  await prisma.responseAnswer.deleteMany();
  await prisma.surveyQuestion.deleteMany();
  await prisma.surveySection.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.questionType.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.department.deleteMany();

  console.log('Seeding database...');

  // Departments (Skipped for clean db)
  
  // Roles
  const roleSuperAdmin = await prisma.role.create({
    data: { name: 'SUPER ADMIN', is_global: true }
  });

  const roleDeptManager = await prisma.role.create({
    data: { name: 'DEPARTMENT ADMIN', is_global: false }
  });

  const rolePersonnel = await prisma.role.create({
    data: { name: 'PERSONNEL', is_global: false }
  });

  // Users
  const userAdmin = await prisma.user.create({
    data: {
      name: 'Sarah Vance', 
      email: 'superadmin@bigoutsource.com',
      role: { connect: { id: roleSuperAdmin.id } }
    }
  });

  // Question Types
  await prisma.questionType.createMany({
    data: [
      { id: 'short-text', key: 'short-text', label: 'Short Answer', config_schema: JSON.stringify({ component: 'TextInput' }) },
      { id: 'date', key: 'date', label: 'Date', config_schema: JSON.stringify({ component: 'DateInput' }) },
      { id: 'personnel-dropdown', key: 'personnel-dropdown', label: 'Personnel Selection', config_schema: JSON.stringify({ component: 'PersonnelSelect' }) },
      { id: 'rating', key: 'rating', label: 'Rating Scale', config_schema: JSON.stringify({ component: 'StarRating' }) },
      { id: 'paragraph', key: 'paragraph', label: 'Paragraph', config_schema: JSON.stringify({ component: 'Textarea' }) }
    ]
  });

  // Sample Survey (Skipped for clean db)
  console.log('Seeding finished.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
