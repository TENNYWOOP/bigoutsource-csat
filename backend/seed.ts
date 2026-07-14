import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Departments
  const deptEngineering = await prisma.department.create({ data: { name: 'Engineering' } });
  const deptSales = await prisma.department.create({ data: { name: 'Sales' } });
  const deptSupport = await prisma.department.create({ data: { name: 'Support' } });
  const deptProduct = await prisma.department.create({ data: { name: 'Product' } });
  
  // Permissions
  const permissionsData = [
    { id: 'view_surveys', key: 'view_surveys', label: 'View Surveys', category: 'Surveys' },
    { id: 'manage_surveys', key: 'manage_surveys', label: 'Manage Surveys', category: 'Surveys' },
    { id: 'view_personnel', key: 'view_personnel', label: 'View Personnel', category: 'Personnel' },
    { id: 'manage_personnel', key: 'manage_personnel', label: 'Manage Personnel', category: 'Personnel' },
    { id: 'view_audit_logs', key: 'view_audit_logs', label: 'View Audit Logs', category: 'Security' },
    { id: 'manage_roles', key: 'manage_roles', label: 'Manage Roles', category: 'Security' },
    { id: 'manage_departments', key: 'manage_departments', label: 'Manage Departments', category: 'Settings' }
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }
  
  // Roles
  const roleSuperAdmin = await prisma.role.create({
    data: { name: 'Super Admin', is_global: true }
  });
  
  // Assign all permissions to Super Admin implicitly via is_global, but let's assign explicitly for completeness
  for (const p of permissionsData) {
    await prisma.rolePermission.create({
      data: { role_id: roleSuperAdmin.id, permission_id: p.id }
    });
  }

  const roleDeptManager = await prisma.role.create({
    data: { name: 'Department Manager', is_global: false }
  });
  
  // Manager permissions
  const managerPerms = ['view_surveys', 'manage_surveys', 'view_personnel', 'manage_personnel', 'view_audit_logs'];
  for (const pId of managerPerms) {
    await prisma.rolePermission.create({
      data: { role_id: roleDeptManager.id, permission_id: pId }
    });
  }

  const rolePersonnel = await prisma.role.create({
    data: { name: 'CS Support Lead', is_global: false }
  });
  
  // CS Support Lead permissions
  const personnelPerms = ['view_surveys'];
  for (const pId of personnelPerms) {
    await prisma.rolePermission.create({
      data: { role_id: rolePersonnel.id, permission_id: pId }
    });
  }

  // Users
  const userAdmin = await prisma.user.create({
    data: {
      name: 'Sarah Vance', email: 'superadmin@bigoutsource.com',
      role_id: roleSuperAdmin.id, department_id: deptProduct.id
    }
  });

  const userManager = await prisma.user.create({
    data: {
      name: 'David Miller', email: 'dmiller@bigoutsource.com',
      role_id: roleDeptManager.id, department_id: deptSupport.id
    }
  });

  const userStaff = await prisma.user.create({
    data: {
      name: 'Diana Prince', email: 'dprince@bigoutsource.com',
      role_id: rolePersonnel.id, department_id: deptSales.id
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

  // Sample Survey
  const survey = await prisma.survey.create({
    data: {
      title: 'SDK Developer Onboarding Feedback',
      status: 'ACTIVE',
      department_id: deptEngineering.id,
      created_by: userAdmin.id,
      sections: {
        create: [
          {
            title: 'Respondent Information', section_order: 1,
            questions: {
              create: [
                { type_id: 'short-text', label: 'Email Address', required: true, question_order: 1, config: '{}' },
                { type_id: 'date', label: 'Date of Transaction', required: true, question_order: 2, config: '{}' },
              ]
            }
          },
          {
            title: 'Transaction Details', section_order: 2,
            questions: {
              create: [
                { type_id: 'personnel-dropdown', label: 'Name of Personnel', required: true, question_order: 1, config: '{}' },
                { type_id: 'short-text', label: 'Ticket Number', required: true, question_order: 2, config: '{}' },
              ]
            }
          },
          {
            title: 'Feedback', section_order: 3,
            questions: {
              create: [
                { type_id: 'rating', label: 'Satisfaction Rating', required: true, question_order: 1, config: '{}' },
                { type_id: 'paragraph', label: 'Additional Comments', required: false, question_order: 2, config: '{}' },
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seeding finished.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
