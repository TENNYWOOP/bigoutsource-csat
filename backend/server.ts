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
    if (!email) return next();
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        role: true, 
        department: true 
      }
    });
    
    if (user && user.status === 'ACTIVE') {
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

const requireRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    if (!allowedRoles.includes(req.user.role.name)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(', ')}]` });
    }
    next();
  };
};

async function logAudit(userId: string, departmentId: string | null | undefined, action: string, category: string, ip: string, details?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        department_id: departmentId || null, // Optional department ID
        action_description: action,
        category,
        ip_address: ip,
        details: details ? JSON.stringify(details) : null
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
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      role: true, 
      department: true 
    }
  });
  if (!user) return res.status(401).json({ error: 'User not found' });
  if (user.password !== password) return res.status(401).json({ error: 'Invalid email or password' });
  if (user.status === 'INACTIVE') return res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
  
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

app.post('/api/departments', requireRole(['SUPER ADMIN']), async (req: any, res: any) => {
  const { name, code } = req.body;
  
  if (code && code.length > 3) return res.status(400).json({ error: 'Department code must be 3 characters or less' });

  const existingName = await prisma.department.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
  if (existingName) return res.status(400).json({ error: 'A department with this name already exists' });
  
  const existingCode = await prisma.department.findFirst({ where: { code: { equals: code, mode: 'insensitive' } } });
  if (existingCode) return res.status(400).json({ error: 'A department with this code already exists' });

  const dept = await prisma.department.create({ data: { name, code } });
  await logAudit(req.user.id, dept.id, `Created department: ${name} (${code})`, 'Department', req.ip);
  res.json(dept);
});

app.delete('/api/departments/:id', requireRole(['SUPER ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const dept = await prisma.department.delete({ where: { id } });
    await logAudit(req.user.id, dept.id, `Deleted department: ${dept.name}`, 'Department', req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Cannot delete department with existing users or surveys' });
  }
});

// ----------------------------------------------------
// PERSONNEL
// ----------------------------------------------------
app.get('/api/personnel', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
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

app.post('/api/personnel', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
  const { name, email, role_id, department_id, job_title } = req.body;
  
  if (!req.user.role.is_global && department_id !== req.user.department_id) {
    return res.status(403).json({ error: 'Cannot add personnel to other departments' });
  }

  const roleToAssign = await prisma.role.findUnique({ where: { id: role_id } });
  if (!roleToAssign) return res.status(400).json({ error: 'Invalid role' });
  
  if (!req.user.role.is_global && roleToAssign.name !== 'PERSONNEL') {
    return res.status(403).json({ error: 'Department Admins can only provision Personnel roles' });
  }

  const user = await prisma.user.create({
    data: { name, email, role_id, department_id, job_title }
  });
  
  await logAudit(req.user.id, department_id, `Provisioned new member: ${name}`, 'Personnel', req.ip);
  res.json(user);
});

app.put('/api/personnel/:id', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  const { name, role_id, department_id, status } = req.body;

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    if (!req.user.role.is_global && existing.department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit users outside your department' });
    }

    if (!req.user.role.is_global && department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot move users to other departments' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        role_id,
        department_id: department_id || null,
        status: status || existing.status
      }
    });

    // Calculate diff
    const diff: any = { before: {}, after: {} };
    if (existing.name !== updated.name) { diff.before.name = existing.name; diff.after.name = updated.name; }
    if (existing.role_id !== updated.role_id) { diff.before.role_id = existing.role_id; diff.after.role_id = updated.role_id; }
    if (existing.department_id !== updated.department_id) { diff.before.department_id = existing.department_id; diff.after.department_id = updated.department_id; }
    if (existing.status !== updated.status) { diff.before.status = existing.status; diff.after.status = updated.status; }

    const hasChanges = Object.keys(diff.before).length > 0;

    await logAudit(
      req.user.id, 
      department_id, 
      `Updated personnel member: ${name}`, 
      'Personnel', 
      req.ip,
      hasChanges ? diff : null
    );
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/personnel/:id', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const existing = await prisma.user.findUnique({
      where: { id }
    });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    if (!req.user.role.is_global && existing.department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete users outside your department' });
    }

    await prisma.user.delete({ where: { id } });
    await logAudit(req.user.id, existing.department_id, `Deleted personnel member: ${existing.name}`, 'Personnel', req.ip);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/roles', requireAuth, async (req: any, res: any) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
});

// ----------------------------------------------------
// SURVEYS & QUESTION TYPES
// ----------------------------------------------------
app.get('/api/question-types', async (req, res) => {
  const types = await prisma.questionType.findMany();
  res.json(types);
});

app.get('/api/surveys', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN', 'PERSONNEL']), async (req: any, res: any) => {
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

app.post('/api/surveys', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
  try {
    const { title, description, status, department_id, sections } = req.body;

    if (!req.user.role.is_global && department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Cannot create survey for other departments' });
    }

    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!baseSlug) baseSlug = 'survey';
    
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.survey.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const survey = await prisma.survey.create({
      data: {
        title, description, status, department_id, created_by: req.user.id, slug,
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
  } catch (err: any) {
    console.error("Error creating survey:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/surveys/:id', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
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

app.delete('/api/surveys/:id', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  const existing = await prisma.survey.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Survey not found' });
  
  if (!req.user.role.is_global) {
    if (existing.department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Cannot delete survey for other departments' });
    }
  }

  await prisma.survey.delete({ where: { id } });
  await logAudit(req.user.id, existing.department_id, `Deleted Survey: "${existing.title}"`, 'Surveys', req.ip);
  res.json({ success: true });
});

app.patch('/api/surveys/:id/status', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const existing = await prisma.survey.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Survey not found' });
  
  if (existing.status === 'DRAFT') {
    return res.status(400).json({ error: 'Cannot change status of a DRAFT survey using this endpoint.' });
  }

  if (!req.user.role.is_global && existing.department_id !== req.user.department_id) {
    return res.status(403).json({ error: 'Cannot modify survey for other departments' });
  }

  const survey = await prisma.survey.update({
    where: { id },
    data: { status }
  });

  const actionName = status === 'INACTIVE' ? 'Deactivated' : 'Reactivated';
  await logAudit(req.user.id, existing.department_id, `${actionName} Survey: "${existing.title}"`, 'Surveys', req.ip);
  res.json(survey);
});

app.get('/api/surveys/:id', async (req, res) => {
  const survey = await prisma.survey.findFirst({
    where: { 
      OR: [
        { id: req.params.id },
        { slug: req.params.id }
      ]
    },
    include: {
      sections: {
        include: { questions: { include: { type: true } } }
      },
      department: {
        include: {
          users: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });
  res.json(survey);
});

// ----------------------------------------------------
// RESPONSES
// ----------------------------------------------------
app.post('/api/surveys/:id/responses', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { metadata, answers } = req.body;
    
    // Find the survey by ID or Slug to get the real UUID
    const survey = await prisma.survey.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      }
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const response = await prisma.surveyResponse.create({
      data: {
        survey_id: survey.id,
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
  } catch (err: any) {
    console.error('Failed to submit response:', err);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

app.get('/api/surveys/:id/responses', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN', 'PERSONNEL']), async (req: any, res: any) => {
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
app.get('/api/audit-logs', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
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

app.get('/api/notifications', requireRole(['SUPER ADMIN', 'DEPARTMENT ADMIN']), async (req: any, res: any) => {
  let where: any = { category: { not: 'Security' } };
  if (!req.user.role.is_global) {
    where.department_id = req.user.department_id;
  }
  
  const notifications = await prisma.auditLog.findMany({
    where,
    include: { 
      user: {
        include: { role: true, department: true }
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 15
  });
  res.json(notifications);
});

// ----------------------------------------------------
// DASHBOARD ANALYTICS
// ----------------------------------------------------
app.get('/api/analytics', requireAuth, async (req: any, res) => {
  let deptWhere: any = {};
  
  if (!req.user.role.is_global) {
    deptWhere = { department_id: req.user.department_id };
  } else if (req.query.departmentId && req.query.departmentId !== 'all') {
    deptWhere = { department_id: String(req.query.departmentId) };
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
