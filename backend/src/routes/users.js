import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserDAO } from '../dao/users.js';
import { BalanceDAO } from '../dao/balances.js';

const router = Router();

// 获取用户列表
router.get('/', (req, res) => {
  try {
    const { keyword, role, page = 1, size = 20 } = req.query;

    const options = {
      keyword,
      role,
      limit: parseInt(size),
      offset: (parseInt(page) - 1) * parseInt(size),
    };

    const users = UserDAO.findAll(options);
    const total = UserDAO.count({ keyword, role });

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: users.map(u => ({
          id: u.id,
          username: u.username,
          fullName: u.full_name,
          email: u.email,
          phone: u.phone,
          department: u.department,
          role: u.role,
          status: u.status,
          createdAt: u.created_at,
        })),
        total,
        page: parseInt(page),
        size: parseInt(size),
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 获取单个用户
router.get('/:id', (req, res) => {
  try {
    const user = UserDAO.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 创建用户
router.post('/', async (req, res) => {
  try {
    const { username, fullName, email, phone, department, role, password } = req.body;

    // 检查用户名是否已存在
    const existingUser = UserDAO.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        code: 409,
        message: '用户名已存在',
      });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password || 'password123', 10);

    // 创建用户
    const newUser = UserDAO.create({
      username,
      passwordHash,
      fullName,
      email,
      phone,
      department,
      role,
    });

    // 初始化余额
    const currentYear = new Date().getFullYear();
    BalanceDAO.create({
      userId: newUser.id,
      year: currentYear,
      totalDays: 20,
      usedDays: 0,
      pendingDays: 0,
    });

    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 更新用户
router.put('/:id', (req, res) => {
  try {
    const { fullName, email, phone, department, role, status } = req.body;

    const updatedUser = UserDAO.update(req.params.id, {
      fullName,
      email,
      phone,
      department,
      role,
      status,
    });

    if (!updatedUser) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 删除用户
router.delete('/:id', (req, res) => {
  try {
    const success = UserDAO.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.json({
      code: 200,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

export { router as usersRouter };
