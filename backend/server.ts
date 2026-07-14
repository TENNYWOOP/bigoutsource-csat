import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Fake Auth Middleware for Demo purposes 
// In a real app this would verify a JWT and find the user
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(); // Proceed without user for public routes like /api/surveys/:id/responses
  }
  
  try {
    // For our prototype, the client sends "Bearer user_email"
    const email = authHeader.split(' ')[1];
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        role: { 
          include: { 
            permissions: { 
              include: { permission: true } 
            } 
          } 
        }, 
        department: true 
      }
    });
    
    if (user) {
      (req as any).user = user;
    }
  } catch (error) {
    console.error('Auth error', error);
  }
  next();
});

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const requirePermission = (permissionKey: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const perms = req.user.role?.permissions?.map((p: any) => p.permission.key) || [];
    if (!perms.includes(permissionKey)) {
      return res.status(403).json({ error: `Forbidden: Requires ${permissionKey}` });
    }
    next();
  };
};

async function logAudit(userId: string, departmentId: string, action: string, category: string, ip: string) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        department_id: departmentId,
        action_description: action,
        category,
        ip_address: ip
      }
    });
  } catch (e) {
    console.error('Failed to log audit event', e);
  }
}

// ----------------------------------------------------
// AUTH & ME
// ----------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      role: { 
        include: { 
          permissions: { 
            include: { permission: true } 
          } 
        } 
      }, 
      department: true 
    }
  });
  if (!user) return res.status(401).json({ error: 'User not found' });
  
  await logAudit(user.id, user.department_id, 'User login', 'Security', req.ip || '127.0.0.1');
  res.json({ token: email, user });
});

app.get('/api/me', requireAuth, (req: any, res) => {
  res.json({ user: req.user });
});

// ----------------------------------------------------
// DEPARTMENTS (Super Admin)
// ----------------------------------------------------
app.get('/api/departments', async (req, res) => {
  const departments = await prisma.department.findMany();
  res.json(departments);
});

app.post('/api/departments', requirePermission('manage_departments'), async (req: any, res) => {
  const { name } = req.body;
  const dept = await prisma.department.create({ data: { name } });
  await logAudit(req.user.id, dept.id, `Created department: ${name}`, 'Settings', req.ip);
  res.json(dept);
});

// ----------------------------------------------------
// PERSONNEL
// ----------------------------------------------------
app.get('/api/personnel', requirePermission('view_personnel'), async (req: any, res) => {
  let where = {};
  // Managers only see their own department
  if (!req.user.role.is_global) {
    where = { department_id: req.user.department_id };
  }
  
  const personnel = await prisma.user.findMany({
    where,
    include: { role: true, department: true }
  });
  res.json(personnel);
});

app.post('/api/personnel', requirePermission('manage_personnel'), async (req: any, res) => {
  const { name, email, role_id, department_id } = req.body;
  
  if (!req.user.role.is_global && department_id !== req.user.department_id) {
    return res.status(403).json({ error: 'Cannot add personnel to other departments' });
  }

  const user = await prisma.user.create({
    data: { name, email, role_id, department_id }
  });
  
  await logAudit(req.user.id, department_id, `Provisioned new member: ${name}`, 'Personnel', req.ip);
  res.json(user);
});

// ----------------------------------------------------
// ROLES
// ----------------------------------------------------
app.get('/api/roles', requireAuth, async (req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true }
      }
    }
  });
  res.json(roles);
});

app.post('/api/roles', requirePermission('manage_roles'), async (req: any, res) => {
  const { name, permissions } = req.body;
  // Create role and assign permissions
  const role = await prisma.role.create({
    data: { name, is_global: false }
  });
  
  for (const permKey of permissions) {
    const perm = await prisma.permission.findFirst({ where: { key: permKey } });
    if (perm) {
      await prisma.rolePermission.create({
        data: { role_id: role.id, permission_id: perm.id }
      });
    }
  }
  
  await logAudit(req.user.id, req.user.department_id, `Created role: ${name}`, 'Security', req.ip);
  res.json(role);
});

app.get('/api/permissions', requireAuth, async (req: any, res) => {
  const perms = await prisma.permission.findMany();
  res.json(perms);
});

// ----------------------------------------------------
// SURVEYS & QUESTION TYPES
// ----------------------------------------------------
app.get('/api/question-types', async (req, res) => {
  const types = await prisma.questionType.findMany();
  res.json(types);
});

app.get('/api/surveys', requirePermission('view_surveys'), async (req: any, res) => {
  let where = {};
  if (!req.user.role.is_global) {
    where = { department_id: req.user.department_id };
  }
  
  const surveys = await prisma.survey.findMany({
    where,
    include: {
      department: true,
      _count: { select: { responses: true } }
    },
    orderBy: { created_at: 'desc' }
  });
  res.json(surveys);
});

app.post('/api/surveys', requirePermission('manage_surveys'), async (req: any, res) => {
  const { title, description, status, department_id, sections } = req.body;

  if (!req.user.role.is_global && department_id !== req.user.department_id) {
    return res.status(403).json({ error: 'Cannot create survey for other departments' });
  }

  const survey = await prisma.survey.create({
    data: {
      title, description, status, department_id, created_by: req.user.id,
      sections: {
        create: sections.map((s: any) => ({
          title: s.title,
          section_order: s.section_order,
          questions: {
            create: s.questions.map((q: any) => ({
              type_id: q.type_id,
              label: q.label,
              required: q.required,
              question_order: q.question_order,
              config: q.config || '{}'
            }))
          }
        }))
      }
    }
  });

  await logAudit(req.user.id, department_id, `Launched Survey Campaign: "${title}"`, 'Surveys', req.ip);
  res.json(survey);
});

app.put('/api/surveys/:id', requirePermission('manage_surveys'), async (req: any, res) => {
  const { id } = req.params;
  const { title, description, status, department_id, sections } = req.body;

  const existing = await prisma.survey.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Survey not found' });
  
  if (existing.status !== 'DRAFT') {
    return res.status(400).json({ error: 'Only DRAFT surveys can be edited.' });
  }

  if (!req.user.role.is_global && (department_id !== req.user.department_id || existing.department_id !== req.user.department_id)) {
    return res.status(403).json({ error: 'Cannot modify survey for other departments' });
  }

  const survey = await prisma.survey.update({
    where: { id },
    data: {
      title, description, status, department_id,
      sections: {
        deleteMany: {},
        create: sections.map((s: any) => ({
          title: s.title,
          section_order: s.section_order,
          questions: {
            create: s.questions.map((q: any) => ({
              type_id: q.type_id,
              label: q.label,
              required: q.required,
              question_order: q.question_order,
              config: q.config || '{}'
            }))
          }
        }))
      }
    }
  });

  await logAudit(req.user.id, department_id, `Updated Draft Survey: "${title}"`, 'Surveys', req.ip);
  res.json(survey);
});

app.get('/api/surveys/:id', async (req, res) => {
  const survey = await prisma.survey.findUnique({
    where: { id: req.params.id },
    include: {
      sections: {
        include: { questions: { include: { type: true } } }
      }
    }
  });
  res.json(survey);
});

// ----------------------------------------------------
// RESPONSES
// ----------------------------------------------------
app.post('/api/surveys/:id/responses', async (req, res) => {
  const { id } = req.params;
  const { metadata, answers } = req.body;
  
  const response = await prisma.surveyResponse.create({
    data: {
      survey_id: id,
      metadata: metadata ? JSON.stringify(metadata) : '{}',
      answers: {
        create: answers.map((a: any) => ({
          question_id: a.question_id,
          value: String(a.value)
        }))
      }
    }
  });
  res.json(response);
});

app.get('/api/surveys/:id/responses', requirePermission('view_surveys'), async (req: any, res) => {
  const { id } = req.params;
  
  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  
  if (!req.user.role.is_global && survey.department_id !== req.user.department_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const responses = await prisma.surveyResponse.findMany({
    where: { survey_id: id },
    include: { answers: { include: { question: true } } },
    orderBy: { submitted_at: 'desc' }
  });
  res.json(responses);
});

// ----------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------
app.get('/api/audit-logs', requirePermission('view_audit_logs'), async (req: any, res) => {
  let where = {};
  if (!req.user.role.is_global) {
    where = { department_id: req.user.department_id };
  }
  
  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { include: { role: true } } },
    orderBy: { timestamp: 'desc' },
    take: 100
  });
  res.json(logs);
});

// ----------------------------------------------------
// DASHBOARD ANALYTICS
// ----------------------------------------------------
app.get('/api/analytics', requireAuth, async (req: any, res) => {
  let deptWhere = {};
  if (!req.user.role.is_global) {
    deptWhere = { department_id: req.user.department_id };
  }

  const surveys = await prisma.survey.findMany({ where: deptWhere, select: { id: true } });
  const surveyIds = surveys.map(s => s.id);

  const responses = await prisma.surveyResponse.count({
    where: { survey_id: { in: surveyIds } }
  });
  
  // A naive implementation to get CSAT average: 
  // We look for answers tied to 'rating' question type.
  const ratingAnswers = await prisma.responseAnswer.findMany({
    where: {
      response: { survey_id: { in: surveyIds } },
      question: { type_id: 'rating' }
    }
  });

  let totalScore = 0;
  for (const a of ratingAnswers) {
    const val = parseFloat(a.value);
    if (!isNaN(val)) totalScore += val;
  }
  
  const avg = ratingAnswers.length > 0 ? (totalScore / ratingAnswers.length / 5) * 100 : 0;
  
  res.json({
    totalResponses: responses,
    averageCsat: avg,
    recentRatings: [], // We can populate this similarly
    chartData: [] // Dynamic chart data will go here based on ratingAnswers
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
