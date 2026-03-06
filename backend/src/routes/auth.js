import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserDAO } from '../dao/users.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = UserDAO.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        code: 403,
        message: '账户已被禁用',
      });
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 登出
router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: '登出成功',
  });
});

export { router as authRouter };
