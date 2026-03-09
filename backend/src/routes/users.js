import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserDAO } from '../dao/users.js';
import { BalanceDAO } from '../dao/balances.js';

const router = Router();

// Get user list
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
    console.error('Failed to get user list:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Get single user
router.get('/:id', (req, res) => {
  try {
    const user = UserDAO.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User not found',
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
    console.error('Failed to get user details:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, fullName, email, phone, department, role, password } = req.body;

    // Check if username already exists
    const existingUser = UserDAO.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        code: 409,
        message: 'Username already exists',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password || 'password123', 10);

    // Create user
    const newUser = UserDAO.create({
      username,
      passwordHash,
      fullName,
      email,
      phone,
      department,
      role,
    });

    // Initialize balance
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
      message: 'Created successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Update user
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
        message: 'User not found',
      });
    }

    res.json({
      code: 200,
      message: 'Updated successfully',
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
    console.error('Failed to update user:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  try {
    const success = UserDAO.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    res.json({
      code: 200,
      message: 'Deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

export { router as usersRouter };
