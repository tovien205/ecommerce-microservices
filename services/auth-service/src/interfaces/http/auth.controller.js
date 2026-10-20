const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../infrastructure/prisma');
const { createCustomer } = require('../grpc/customer.client');

// 1. Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { username, password, fullname, email } = req.body;

    if (!username || !password || !fullname) {
      return res.status(400).json({ message: 'username, password và fullname là bắt buộc' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullname,
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        roleId: true,
        createdAt: true,
      },
    });

    // Trả về response 201 cho Client ngay lập tức
    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      data: newUser,
    });

    // Tạo Customer ngầm ở background
    createCustomer({
      id: newUser.id,
      userId: newUser.id,
      fullName: fullname,
      email: email || `${username}@example.com`,
    }).catch(() => {});

  } catch (error) {
    console.error('Register error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
    }
  }
};

// 2. Đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập username và password' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role ? user.role.roleName : 'USER',
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role ? user.role.roleName : 'USER',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
  }
};

// 3. Lấy thông tin tài khoản hiện tại (Profile)
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        fullname: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};