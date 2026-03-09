import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserDAO } from '../dao/users.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = UserDAO.findByUsername(username);
    if (!user) {
      console.log(`[Auth] User not found: ${username}`);
      return res.status(401).json({
        code: 401,
        message: 'Invalid username or password',
      });
    }

    console.log(`[Auth] Found user: ${username}, hash: ${user.password_hash.substring(0, 20)}...`);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(`[Auth] Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: 'Invalid username or password',
      });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({
        code: 403,
        message: 'Account has been disabled',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      code: 200,
      message: 'Login successful',
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
    console.error('Login failed:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: 'Logout successful',
  });
});

export { router as authRouter };
